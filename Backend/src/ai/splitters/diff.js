import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

/**
 * Custom Git Diff-aware text splitter.
 * 
 * Since @langchain/textsplitters (v1.0.1) does not provide a native Git diff splitter,
 * we configure a RecursiveCharacterTextSplitter with diff-specific separators.
 * This prioritizes splitting on diff boundaries (diff --git, @@ hunk headers)
 * and keeps entire hunks intact when within target token limits.
 * 
 * Target size: 800–1000 tokens (~3200–4000 characters)
 * Target overlap: 100–150 tokens (~400–600 characters)
 */
export async function splitDiffDocument(document) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 4000,
    chunkOverlap: 500,
    separators: [
      "\ndiff --git ", // Multi-file diff boundaries
      "\n@@ ",        // Hunk header boundaries
      "\n\n",         // Paragraph / section breaks within hunk context
      "\n",           // Line-by-line fallback
      " ",            // Word fallback
      ""              // Character fallback
    ]
  });

  return await splitter.splitDocuments([document]);
}
