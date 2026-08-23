import { Document } from "@langchain/core/documents";

/**
 * Transforms an array of processed GitHub PR files into an array of LangChain Documents.
 * 
 * @param {Object} params
 * @param {string} params.owner - The repository owner (e.g. "langchain-ai")
 * @param {string} params.repo - The repository name
 * @param {string|number} params.prNumber - The PR number
 * @param {Array} params.files - The processed/chunked file diffs
 * @returns {Document[]} Array of LangChain Documents
 */
export function githubFilesToDocuments({ owner, repo, prNumber, prId, prUrl, files }) {
  if (!files || !Array.isArray(files)) return [];

  return files.map(file => {
    const additions = file.additions ?? 0;
    const deletions = file.deletions ?? 0;
    const changes = additions + deletions;

    // Generate AI-readable page content
    const pageContent = `File: ${file.filename}
Status: ${file.status}
Changes: +${additions} -${deletions}

<patch>
${file.patch || "(no patch available)"}
</patch>`.trim();

    // Attach stable, scalable metadata for RAG / Splitters / pgvector
    return new Document({
      pageContent,
      metadata: {
        source: prUrl || `github://${owner}/${repo}/pull/${prNumber}/files#${file.filename}`,
        type: "github_pr_file",
        owner,
        repo,
        prNumber: prNumber ? String(prNumber) : undefined,
        prId: prId || undefined,
        prUrl: prUrl || undefined,
        filePath: file.filename,
        status: file.status,
        additions,
        deletions,
        changes
      }
    });
  });
}

/**
 * Replaces the old formatDiffForPrompt by dynamically reducing LangChain 
 * Documents and PR metadata into a single string for the prompt pipeline.
 * 
 * @param {Document[]} documents - The LangChain documents
 * @param {Object} prMetadata - The overall PR metadata
 * @returns {string} The formatted string prompt
 */
export function formatDocumentsForPRAnalysis(documents, prMetadata) {
  const header = `PR Title: ${prMetadata.title || 'Untitled'}
Author: ${prMetadata.author || 'Unknown'}
Base: ${prMetadata.base_branch || '?'} ← Head: ${prMetadata.head_branch || '?'}
Description: ${prMetadata.description || 'No description provided'}
Stats: +${prMetadata.total_additions || 0} -${prMetadata.total_deletions || 0} across ${prMetadata.total_files || 0} files`.trim();

  const body = documents
    .map(doc => doc.pageContent)
    .join('\n\n---\n\n');

  return `${header}\n\n---\n\n${body}`;
}
