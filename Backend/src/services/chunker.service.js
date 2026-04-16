const MAX_FILES = 20;
const MAX_PATCH_CHARS = 3000;

// Files to skip — generated, lock files, binary
const SKIP_PATTERNS = [
    /package-lock\.json$/,
    /yarn\.lock$/,
    /pnpm-lock\.yaml$/,
    /\.min\.(js|css)$/,
    /dist\//,
    /build\//,
    /\.png$/, /\.jpg$/, /\.jpeg$/, /\.gif$/, /\.svg$/, /\.ico$/,
    /\.pdf$/, /\.zip$/, /\.tar$/,
];

function shouldSkip(filename) {
    return SKIP_PATTERNS.some((pattern) => pattern.test(filename));
}

/**
 * Takes raw GitHub files array, returns cleaned chunks for Claude
 */
export function chunkDiff(files) {
    const relevant = files
        .filter((f) => !shouldSkip(f.filename))
        .sort((a, b) => (b.additions + b.deletions) - (a.additions + a.deletions));

    const capped = relevant.slice(0, MAX_FILES);

    return capped.map((file) => {
        const patch = file.patch || ''; // binary files have no patch
        const truncated = patch.length > MAX_PATCH_CHARS;

        return {
            filename: file.filename,
            status: file.status, // added | modified | removed | renamed
            additions: file.additions,
            deletions: file.deletions,
            patch: truncated ? patch.slice(0, MAX_PATCH_CHARS) + '\n... [truncated]' : patch,
            truncated,
        };
    });
}

/**
 * Format chunks into a single string for the Claude prompt
 */
export function formatDiffForPrompt(chunks, prMetadata) {
    const header = `
PR Title: ${prMetadata.title}
Author: ${prMetadata.author}
Base: ${prMetadata.base_branch} ← Head: ${prMetadata.head_branch}
Description: ${prMetadata.description || 'No description provided'}
Stats: +${prMetadata.total_additions} -${prMetadata.total_deletions} across ${prMetadata.total_files} files
`.trim();

    const fileSections = chunks
        .map((f) => {
            return `
### File: ${f.filename} [${f.status}] (+${f.additions}/-${f.deletions})
\`\`\`diff
${f.patch || '(no patch available — binary or empty file)'}
\`\`\`
`.trim();
        })
        .join('\n\n');

    return `${header}\n\n---\n\n${fileSections}`;
}