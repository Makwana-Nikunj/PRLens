import { sql } from "../db/index.js";

export async function getCachedAnalysis(githubPrUrl) {

    const result = await sql`
        SELECT pr.id as pr_id, pr.raw_diff, pr.url,
                a.id as analysis_id, a.summary, a.key_changes,
                a.tradeoffs, a.risks, a.reviewer_checklist, a.file_explanations
        FROM pull_requests pr
        JOIN analyses a ON a.pr_id = pr.id
        WHERE pr.url = ${githubPrUrl}
        LIMIT 1
    `;
    return result[0] || null;
}

export async function savePR(githubPrUrl, prData, rawDiff) {

    const { title, author, description, base_branch, head_branch, total_files, total_additions, total_deletions, is_private, owner, repo, pr_number } = prData;

    const result = await sql`
        INSERT INTO pull_requests (url, owner, repo, pr_number, title, author, description, base_branch, head_branch, total_files, total_additions, total_deletions, is_private, raw_diff)
        VALUES (${githubPrUrl}, ${owner}, ${repo}, ${pr_number}, ${title}, ${author}, ${description}, ${base_branch}, ${head_branch}, ${total_files}, ${total_additions}, ${total_deletions}, ${is_private}, ${rawDiff})
        ON CONFLICT (url) DO UPDATE
        SET raw_diff = EXCLUDED.raw_diff, 
            author = EXCLUDED.author, 
            title = EXCLUDED.title, 
            description = EXCLUDED.description,
            base_branch = EXCLUDED.base_branch,
            head_branch = EXCLUDED.head_branch,
            total_files = EXCLUDED.total_files,
            total_additions = EXCLUDED.total_additions,
            total_deletions = EXCLUDED.total_deletions,
            is_private = EXCLUDED.is_private
        RETURNING id
    `;

    if (!result || !result[0]) return null;

    const prId = result[0].id;
    // Invalidate stale cache associated with this PR
    await sql`DELETE FROM analyses WHERE pr_id = ${prId}`;

    return prId;
}

export async function saveAnalysis(prId, analysisData) {

    const { summary, key_changes, tradeoffs, risks, reviewer_checklist, file_explanations } = analysisData;

    // Prevent duplicate analyses for the same PR
    await sql`DELETE FROM analyses WHERE pr_id = ${prId}`;

    const result = await sql`
        INSERT INTO analyses (pr_id, summary, key_changes, tradeoffs, risks, reviewer_checklist, file_explanations)
        VALUES (${prId}, ${summary}, ${key_changes}, ${tradeoffs}, ${risks}, ${reviewer_checklist}, ${file_explanations})
        RETURNING id
    `;

    if (!result || !result[0]) return null;

    return result[0].id;
}