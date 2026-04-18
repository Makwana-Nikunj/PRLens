import { sql } from "../db/index.js";

export async function getCachedAnalysis(githubPrUrl) {

    const result = await sql`
        SELECT pr.id as pr_id, pr.raw_diff, pr.url, pr.head_sha,
                a.id as analysis_id, a.summary, a.key_changes,
                a.tradeoffs, a.risks, a.reviewer_checklist, a.file_explanations,
                a.raw_response, a.model_used
        FROM pull_requests pr
        JOIN analyses a ON a.pr_id = pr.id
        WHERE pr.url = ${githubPrUrl}
        LIMIT 1
    `;
    return result[0] || null;
}

export async function savePR(githubPrUrl, prData, rawDiff) {

    const { title, author, description, base_branch, head_branch, head_sha, total_files, total_additions, total_deletions, is_private, owner, repo, pr_number, user_id } = prData;

    const result = await sql`
        INSERT INTO pull_requests (url, owner, repo, pr_number, title, author, description, base_branch, head_branch, head_sha, total_files, total_additions, total_deletions, is_private, user_id, raw_diff)
        VALUES (${githubPrUrl}, ${owner}, ${repo}, ${pr_number}, ${title}, ${author}, ${description}, ${base_branch}, ${head_branch}, ${head_sha}, ${total_files}, ${total_additions}, ${total_deletions}, ${is_private}, ${user_id}, ${rawDiff})
        ON CONFLICT (url) DO UPDATE
        SET raw_diff = EXCLUDED.raw_diff, 
            author = EXCLUDED.author, 
            title = EXCLUDED.title, 
            description = EXCLUDED.description,
            base_branch = EXCLUDED.base_branch,
            head_branch = EXCLUDED.head_branch,
            head_sha = EXCLUDED.head_sha,
            total_files = EXCLUDED.total_files,
            total_additions = EXCLUDED.total_additions,
            total_deletions = EXCLUDED.total_deletions,
            is_private = EXCLUDED.is_private,
            user_id = EXCLUDED.user_id
        RETURNING id
    `;

    if (!result || !result[0]) return null;

    const prId = result[0].id;

    return prId;
}

export async function saveAnalysis(prId, analysisData) {

    const { summary, key_changes, tradeoffs, risks, reviewer_checklist, file_explanations, raw_response, model_used } = analysisData;

    return await sql.begin(async (sql) => {
        // Prevent duplicate analyses for the same PR
        await sql`DELETE FROM analyses WHERE pr_id = ${prId}`;

        const result = await sql`
            INSERT INTO analyses (pr_id, summary, key_changes, tradeoffs, risks, reviewer_checklist, file_explanations, raw_response, model_used)
            VALUES (${prId}, ${summary}, ${JSON.stringify(key_changes)}, ${JSON.stringify(tradeoffs)}, ${JSON.stringify(risks)}, ${JSON.stringify(reviewer_checklist)}, ${JSON.stringify(file_explanations)}, ${raw_response || null}, ${model_used || null})
            RETURNING id
        `;

        if (!result || !result[0]) return null;
        return result[0].id;
    });
}