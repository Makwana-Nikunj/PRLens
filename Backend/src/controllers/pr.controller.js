import { parsePRUrl, GitHubService } from "../services/github.service.js";
import { chunkDiff } from "../services/chunker.service.js";
import { analyzePRChunks } from "../services/ai.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sql } from "../db/index.js";
import { getCachedAnalysis, savePR, saveAnalysis } from "../services/cache.service.js";
import { processAndStorePRFiles, cleanupPRVectors } from "../services/rag.service.js";

const analyzePR = asyncHandler(async (req, res) => {
    const { url } = req.body;

    console.log("[PR ANALYZE] Started", { url, userId: req.user?.id });

    if (!url || typeof url !== "string") {
        console.warn("[PR ANALYZE] Missing URL");
        throw new ApiError(400, "PR URL is required");
    }

    // 1. Parse URL
    let parsed;
    try {
        parsed = parsePRUrl(url);
    } catch (error) {
        console.error("[PR ANALYZE] Invalid PR URL:", error.message);
        throw new ApiError(400, "Invalid GitHub PR URL format");
    }

    const { owner, repo, pull_number } = parsed;
    const normalizedUrl = `https://github.com/${owner}/${repo}/pull/${pull_number}`;
    console.log("[PR ANALYZE] Parsed", { owner, repo, pull_number, normalizedUrl });

    // 2. Fetch User Token
    let isUserToken = true;
    let accessToken = req.session?.githubAccessToken || req.user?.github_token;
    const userId = req.user?.id || req.session?.userId;

    if (!accessToken) {
        accessToken = process.env.GITHUB_TOKEN;
        isUserToken = false;
    }

    if (!accessToken) {
        console.warn("[PR ANALYZE] No GitHub token available");
        throw new ApiError(401, "GitHub access token required. Log in or set GITHUB_TOKEN env var.");
    }

    console.log("[PR ANALYZE] Token acquired", { isUserToken, hasAccessToken: !!accessToken });

    // 3. Fetch PR Details & Check Cache
    const githubService = new GitHubService(accessToken);
    let prDetails;
    try {
        prDetails = await githubService.getPullRequest(owner, repo, pull_number);
        console.log("[PR ANALYZE] PR details fetched", { title: prDetails.title, sha: prDetails.head?.sha });
    } catch (err) {
        console.error("[PR ANALYZE] Failed to fetch PR details:", err.message);
        throw err;
    }

    if (prDetails.base?.repo?.private && !isUserToken) {
        console.warn("[PR ANALYZE] Private repo without user token");
        throw new ApiError(401, "Login required for private repos");
    }

    const cached = await getCachedAnalysis(normalizedUrl);
    const currentHeadSha = prDetails.head?.sha || "";
    console.log("[PR ANALYZE] Cache check", { cached: !!cached, cachedHeadSha: cached?.head_sha, currentHeadSha });

    if (cached && cached.head_sha === currentHeadSha) {
        console.log("[PR ANALYZE] Returning cached analysis", { pr_id: cached.pr_id });
        return res.status(200).json(new ApiResponse(200, {
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

    let files;
    try {
        files = await githubService.getPRFiles(owner, repo, pull_number);
        console.log("[PR ANALYZE] PR files fetched", { count: files?.length });
    } catch (err) {
        console.error("[PR ANALYZE] Failed to fetch PR files:", err.message);
        throw err;
    }

    // Validate files
    if (!Array.isArray(files)) {
        console.error("[PR ANALYZE] Invalid files data from GitHub");
        throw new ApiError(500, "Invalid files data from GitHub");
    }
    if (files.length === 0) {
        console.warn("[PR ANALYZE] PR has no file changes");
        throw new ApiError(400, "PR has no file changes");
    }

    const description = prDetails.body || "";

    // 4. Save or update PR in the database
    if (!req.user || !req.user.id) {
        throw new ApiError(401, "User not authenticated");
    }

    const prData = {
        title: prDetails.title,
        author: prDetails.user?.login || "Unknown",
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
    console.log("[PR ANALYZE] PR saved to DB", { insertedPRId });

    // 5. Call AI Service for analysis chunks
    const chunks = chunkDiff(files);
    console.log("[PR ANALYZE] Chunks created", { chunkCount: chunks?.length });

    // Validate chunks
    if (!chunks || chunks.length === 0) {
        console.warn("[PR ANALYZE] No valid file changes to analyze after chunking");
        throw new ApiError(400, "No valid file changes to analyze");
    }

    // Since we only have the PR data and not the full inserted object like it originally queried, we construct it:
    const insertedPR = { id: insertedPRId, ...prData, raw_diff: JSON.stringify(files) };

    let analysis;
    let analysisId;
    try {
        // Now passing the chunk payload to AI Service dynamically map chunks
        console.log("[PR ANALYZE] Starting AI analysis...");
        analysis = await analyzePRChunks(chunks, insertedPR);
        console.log("[PR ANALYZE] AI analysis complete", { model_used: analysis.model_used });

        // Save the fully baked analysis
        analysisId = await saveAnalysis(insertedPRId, analysis);
        console.log("[PR ANALYZE] Analysis saved", { analysisId });
    } catch (aiError) {
        console.error("[PR ANALYZE] AI Analysis Failed:", {
            chunks: chunks.length,
            prId: insertedPRId,
            error: aiError.message,
            stack: aiError.stack
        });
        throw new ApiError(500, "AI analysis failed to process chunks");
    }

    // Store vectors (only if RAG is enabled)
    if (process.env.RAG_ENABLED !== 'false') {
        try {
            console.log("[PR ANALYZE] Starting RAG indexing...");
            const vectorResult = await cleanupPRVectors(insertedPRId);
            const storeResult = await processAndStorePRFiles(insertedPRId, normalizedUrl, files);
            console.log(`[PR ANALYZE] RAG indexing complete for PR ${insertedPRId}: ${storeResult?.stored ?? '?'} chunks stored`);
        } catch (ragError) {
            console.error("[PR ANALYZE] RAG vectorization failed:", ragError.message);
        }
    } else {
        console.log("[PR ANALYZE] RAG disabled, skipping embeddings");
    }

    console.log("[PR ANALYZE] Sending success response", { insertedPRId, analysisId });
    return res.status(200).json(new ApiResponse(200, {
        pullRequest: { ...insertedPR, url: normalizedUrl },
        analysis: { id: analysisId, ...analysis, pr_id: insertedPRId }
    }, "PR analyzed successfully"));
});

const getPR = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await sql`
        SELECT pr.id as pr_id, pr.url as github_pr_url, pr.title, pr.author,
               a.summary, a.key_changes, a.tradeoffs, a.risks, a.reviewer_checklist as checklist, a.file_explanations,
               a.created_at as analyzed_at
        FROM pull_requests pr
        JOIN analyses a ON a.pr_id = pr.id
        WHERE pr.id = ${id} AND pr.user_id = ${req.user.id}
    `;

    if (!result || result.length === 0) {
        throw new ApiError(404, "PR not found");
    }

    const row = result[0];
    if (!row) {
        throw new ApiError(500, "Database returned empty row");
    }

    res.status(200).json(new ApiResponse(200, {
        pr_id: row.pr_id,
        github_pr_url: row.github_pr_url,
        title: row.title,
        author: row.author,
        analyzed_at: row.analyzed_at,
        analysis: {
            summary: row.summary,
            key_changes: row.key_changes,
            tradeoffs: row.tradeoffs,
            risks: row.risks,
            checklist: row.checklist,
            file_explanations: row.file_explanations,
        },
    }, "PR retrieved successfully"));
});

const getAllPRs = asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
        throw new ApiError(401, "User not authenticated");
    }

    const result = await sql`
        SELECT pr.id as pr_id, pr.url as github_pr_url, pr.title, pr.author,
               a.summary, a.key_changes, a.tradeoffs, a.risks, a.reviewer_checklist as checklist, a.file_explanations,
               a.created_at as analyzed_at
        FROM pull_requests pr
        JOIN analyses a ON a.pr_id = pr.id
        WHERE pr.user_id = ${req.user.id}
        ORDER BY a.created_at DESC
    `;

    res.status(200).json(new ApiResponse(200,
        result.map(row => ({
            pr_id: row.pr_id,
            github_pr_url: row.github_pr_url,
            title: row.title,
            author: row.author,
            analyzed_at: row.analyzed_at,
            analysis: {
                summary: row.summary,
                key_changes: row.key_changes,
                tradeoffs: row.tradeoffs,
                risks: row.risks,
                checklist: row.checklist,
                file_explanations: row.file_explanations,
            },
        })),
        "PRs retrieved successfully"
    ));
});

const deletePR = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await sql.begin(async (sql) => {
        const pr = await sql`SELECT id FROM pull_requests WHERE id = ${id} AND user_id = ${req.user.id}`;
        if (!pr || pr.length === 0) {
            throw new ApiError(403, "Not authorized to delete this PR");
        }

        await sql`DELETE FROM pr_embeddings WHERE pr_id = ${id}`;
        await sql`DELETE FROM chat_messages WHERE pr_id = ${id}`;
        await sql`DELETE FROM analyses WHERE pr_id = ${id}`;

        const result = await sql`
            DELETE FROM pull_requests
            WHERE id = ${id} AND user_id = ${req.user.id}
            RETURNING id
        `;
    });
    res.status(200).json(new ApiResponse(200, null, "PR and analysis deleted successfully"));
});

export { analyzePR, getPR, getAllPRs, deletePR };
