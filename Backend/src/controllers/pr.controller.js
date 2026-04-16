import { parsePRUrl, GitHubService } from "../services/github.service.js";
import { chunkDiff } from "../services/chunker.service.js";
import { analyzePRChunks } from "../services/ai.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sql } from "../db/index.js";
import { getCachedAnalysis, savePR, saveAnalysis } from "../services/cache.service.js";

const analyzePR = asyncHandler(async (req, res) => {
    const { url } = req.body;

    if (!url || typeof url !== "string") {
        throw new ApiError(400, "PR URL is required");
    }

    // 1. Parse URL
    let parsed;
    try {
        parsed = parsePRUrl(url);
    } catch (error) {
        console.error("Invalid PR URL:", error);
        throw new ApiError(400, "Invalid GitHub PR URL format");
    }

    const { owner, repo, pull_number } = parsed;
    const normalizedUrl = `https://github.com/${owner}/${repo}/pull/${pull_number}`;

    // 2. Fetch User Token
    let isUserToken = true;
    let accessToken = req.session?.githubAccessToken || req.user?.githubAccessToken;
    const userId = req.user?.id || req.session?.userId;

    if (!accessToken && userId) {
        const dbUserResult = await sql`SELECT github_token FROM users WHERE id = ${userId}`;
        if (dbUserResult.length > 0) {
            accessToken = dbUserResult[0].github_token;
        }
    }

    if (!accessToken) {
        accessToken = process.env.GITHUB_TOKEN;
        isUserToken = false;
    }

    if (!accessToken) {
        throw new ApiError(401, "GitHub access token required. Log in or set GITHUB_TOKEN env var.");
    }

    // 3. Fetch PR Details & Check Cache
    const githubService = new GitHubService(accessToken);
    const prDetails = await githubService.getPullRequest(owner, repo, pull_number);

    if (prDetails.base?.repo?.private && !isUserToken) {
        throw new ApiError(401, "Login required for private repos");
    }

    const cached = await getCachedAnalysis(normalizedUrl);
    if (cached && cached.head_sha === (prDetails.head?.sha || "")) {
        return res.json(new ApiResponse(200, {
            cached: true,
            pr_id: cached.pr_id,
            analysis_id: cached.analysis_id,
            analysis: {
                summary: cached.summary,
                key_changes: cached.key_changes,
                tradeoffs: cached.tradeoffs,
                risks: cached.risks,
                checklist: cached.reviewer_checklist,
                file_explanations: cached.file_explanations,
            },
        }, "Cached analysis retrieved successfully"));
    }

    const files = await githubService.getPRFiles(owner, repo, pull_number);

    const description = prDetails.body || "";

    // 4. Save or update PR in the database
    const prData = {
        title: prDetails.title,
        author: prDetails.user.login,
        description: description,
        base_branch: prDetails.base?.ref || "",
        head_branch: prDetails.head?.ref || "",
        head_sha: prDetails.head?.sha || "",
        total_files: prDetails.changed_files || files.length,
        total_additions: prDetails.additions || 0,
        total_deletions: prDetails.deletions || 0,
        is_private: prDetails.base?.repo?.private || false,
        owner,
        repo,
        pr_number: pull_number,
        user_id: req.user.id
    };

    const insertedPRId = await savePR(normalizedUrl, prData, JSON.stringify(files));

    // 5. Call AI Service for analysis chunks
    const chunks = chunkDiff(files);

    // Since we only have the PR data and not the full inserted object like it originally queried, we construct it:
    const insertedPR = { id: insertedPRId, ...prData, raw_diff: JSON.stringify(files) };

    // Now passing the chunk payload to AI Service dynamically map chunks
    const analysis = await analyzePRChunks(chunks, insertedPR);

    // Save the fully baked analysis
    const analysisId = await saveAnalysis(insertedPRId, analysis);

    res.status(200).json(new ApiResponse(200, {
        pullRequest: { ...insertedPR, url: normalizedUrl },
        analysis: { id: analysisId, ...analysis, pr_id: insertedPRId }
    }, "PR analyzed successfully"));
});

const getPR = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await sql`
        SELECT pr.id as pr_id, pr.url as github_pr_url,
               a.summary, a.key_changes, a.tradeoffs, a.risks, a.reviewer_checklist as checklist, a.file_explanations,
               a.created_at as analyzed_at
        FROM pull_requests pr
        JOIN analyses a ON a.pr_id = pr.id
        WHERE pr.id = ${id}
    `;

    if (!result || result.length === 0) {
        throw new ApiError(404, "PR not found");
    }

    const row = result[0];

    res.json({
        pr_id: row.pr_id,
        github_pr_url: row.github_pr_url,
        analyzed_at: row.analyzed_at,
        analysis: {
            summary: row.summary,
            key_changes: row.key_changes,
            tradeoffs: row.tradeoffs,
            risks: row.risks,
            checklist: row.checklist,
            file_explanations: row.file_explanations,
        },
    });
});

const getAllPRs = asyncHandler(async (req, res) => {
    const result = await sql`
        SELECT pr.id as pr_id, pr.url as github_pr_url,
               a.summary, a.key_changes, a.tradeoffs, a.risks, a.reviewer_checklist as checklist, a.file_explanations,
               a.created_at as analyzed_at
        FROM pull_requests pr
        JOIN analyses a ON a.pr_id = pr.id
        WHERE pr.user_id = ${req.user.id}
        ORDER BY a.created_at DESC
    `;

    res.json(result.map(row => ({
        pr_id: row.pr_id,
        github_pr_url: row.github_pr_url,
        analyzed_at: row.analyzed_at,
        analysis: {
            summary: row.summary,
            key_changes: row.key_changes,
            tradeoffs: row.tradeoffs,
            risks: row.risks,
            checklist: row.checklist,
            file_explanations: row.file_explanations,
        },
    })));
});

const deletePR = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await sql`BEGIN`;
    try {
        const pr = await sql`SELECT id FROM pull_requests WHERE id = ${id} AND user_id = ${req.user.id}`;
        if (!pr || pr.length === 0) throw new ApiError(403, "Not authorized to delete this PR or PR not found");

        await sql`DELETE FROM chat_messages WHERE pr_id = ${id}`;
        await sql`DELETE FROM analyses WHERE pr_id = ${id}`;

        const result = await sql`
            DELETE FROM pull_requests
            WHERE id = ${id} AND user_id = ${req.user.id}
            RETURNING id
        `;

        await sql`COMMIT`;
        res.json(new ApiResponse(200, null, "PR and analysis deleted successfully"));
    } catch (e) {
        await sql`ROLLBACK`;
        throw e;
    }
});

export { analyzePR, getPR, getAllPRs, deletePR };
