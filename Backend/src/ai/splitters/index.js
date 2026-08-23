import {
  RecursiveCharacterTextSplitter,
  MarkdownTextSplitter,
  SupportedTextSplitterLanguages
} from "@langchain/textsplitters";
import { splitDiffDocument } from "./diff.js";

// Target: 800–1000 tokens (~3200–4000 characters), Overlap: 100–150 tokens (~400–600 characters)
const TARGET_CHUNK_SIZE = 4000;
const TARGET_CHUNK_OVERLAP = 500;

// Language mapping for RecursiveCharacterTextSplitter.fromLanguage()
const EXTENSION_TO_LANGUAGE = {
  // JavaScript / TypeScript
  js: "js",
  jsx: "js",
  ts: "js",
  tsx: "js",
  mjs: "js",
  cjs: "js",

  // Python
  py: "python",

  // Java
  java: "java",

  // C / C++ / Headers
  cpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  c: "cpp",
  h: "cpp",
  hpp: "cpp",

  // Go
  go: "go",

  // Rust
  rs: "rust",

  // PHP
  php: "php",

  // Ruby
  rb: "ruby",

  // Swift
  swift: "swift",

  // Markdown
  md: "markdown",
  mdx: "markdown",

  // HTML
  html: "html",
  htm: "html",

  // Other native languages supported by LangChain
  scala: "scala",
  proto: "proto",
  sol: "sol",
  rst: "rst",
  latex: "latex",
  tex: "latex"
};

/**
 * Determines if a Document's content or metadata represents a Git diff.
 * Inspects both explicit metadata and diff signatures in content.
 */
export function isDiffContent(content = "", metadata = {}) {
  if (metadata.isDiff) return true;
  return (
    content.startsWith("diff --git") ||
    content.includes("\ndiff --git") ||
    content.includes("\n@@ ") ||
    content.startsWith("@@ ")
  );
}

/**
 * Identifies and returns the appropriate native or specialized splitter for a given document.
 * 
 * @param {import("@langchain/core/documents").Document} document 
 * @returns {{ type: string, split: (doc: import("@langchain/core/documents").Document) => Promise<import("@langchain/core/documents").Document[]> }}
 */
export function getSplitterForDocument(document) {
  const content = document.pageContent || "";
  const filePath = document.metadata?.filePath || "";
  const ext = filePath.split(".").pop()?.toLowerCase() || "";

  // 1. Git Diff detection (prioritized over file extension)
  if (isDiffContent(content, document.metadata)) {
    return {
      type: "Git Diff (custom diff-aware splitter)",
      split: (doc) => splitDiffDocument(doc)
    };
  }

  // 2. Markdown files -> native MarkdownTextSplitter
  if (ext === "md" || ext === "mdx") {
    const splitter = new MarkdownTextSplitter({
      chunkSize: TARGET_CHUNK_SIZE,
      chunkOverlap: TARGET_CHUNK_OVERLAP
    });
    return {
      type: "Markdown (MarkdownTextSplitter)",
      split: (doc) => splitter.splitDocuments([doc])
    };
  }

  // 3. HTML files -> native RecursiveCharacterTextSplitter.fromLanguage("html")
  if (ext === "html" || ext === "htm") {
    const splitter = RecursiveCharacterTextSplitter.fromLanguage("html", {
      chunkSize: TARGET_CHUNK_SIZE,
      chunkOverlap: TARGET_CHUNK_OVERLAP
    });
    return {
      type: "HTML (RecursiveCharacterTextSplitter.fromLanguage('html'))",
      split: (doc) => splitter.splitDocuments([doc])
    };
  }

  // 4. JSON files
  // Note: @langchain/textsplitters (v1.0.1) does not export RecursiveJsonSplitter.
  // We use RecursiveCharacterTextSplitter with JSON structural delimiters to preserve keys/values.
  if (ext === "json") {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: TARGET_CHUNK_SIZE,
      chunkOverlap: TARGET_CHUNK_OVERLAP,
      separators: ["}\n", "]\n", "},\n", "],\n", "},", "],", "\n", ", ", " ", ""]
    });
    return {
      type: "JSON (RecursiveCharacterTextSplitter with JSON structural separators)",
      split: (doc) => splitter.splitDocuments([doc])
    };
  }

  // 5. Code files supported natively by LangChain fromLanguage()
  const lang = EXTENSION_TO_LANGUAGE[ext];
  if (lang && SupportedTextSplitterLanguages.includes(lang)) {
    const splitter = RecursiveCharacterTextSplitter.fromLanguage(lang, {
      chunkSize: TARGET_CHUNK_SIZE,
      chunkOverlap: TARGET_CHUNK_OVERLAP
    });
    return {
      type: `Code [${lang}] (RecursiveCharacterTextSplitter.fromLanguage('${lang}'))`,
      split: (doc) => splitter.splitDocuments([doc])
    };
  }

  // 6. Code files not in SupportedTextSplitterLanguages (e.g. C# .cs, SQL, YAML)
  if (["cs", "sh", "bash", "zsh", "yml", "yaml", "xml", "css", "scss", "sql"].includes(ext)) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: TARGET_CHUNK_SIZE,
      chunkOverlap: TARGET_CHUNK_OVERLAP,
      separators: ["\nclass ", "\ninterface ", "\nfunction ", "\n\n", "\n", " ", ""]
    });
    return {
      type: `Code [${ext}] (RecursiveCharacterTextSplitter code-fallback)`,
      split: (doc) => splitter.splitDocuments([doc])
    };
  }

  // 7. Unknown / Fallback
  const fallbackSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: TARGET_CHUNK_SIZE,
    chunkOverlap: TARGET_CHUNK_OVERLAP
  });
  return {
    type: "Unknown/Fallback (RecursiveCharacterTextSplitter)",
    split: (doc) => fallbackSplitter.splitDocuments([doc])
  };
}

/**
 * Splits an array of LangChain Documents using a file-type aware routing system.
 * Automatically selects the optimal native or specialized LangChain text splitter
 * for each document while strictly preserving all Document metadata.
 * 
 * @param {import("@langchain/core/documents").Document[]} documents 
 * @returns {Promise<import("@langchain/core/documents").Document[]>}
 */
export async function splitDocuments(documents) {
  if (!documents || documents.length === 0) return [];
  
  const allChunks = [];
  
  for (const doc of documents) {
    const { split } = getSplitterForDocument(doc);
    const chunks = await split(doc);
    
    // Explicitly guarantee all original document metadata is preserved and enriched on every chunk
    const enrichedChunks = chunks.map((chunk, index) => {
      chunk.metadata = {
        ...(doc.metadata || {}),
        ...(chunk.metadata || {}),
        chunkIndex: index,
        totalChunks: chunks.length
      };
      return chunk;
    });

    allChunks.push(...enrichedChunks);
  }
  
  return allChunks;
}

