import { Octokit } from "@octokit/rest";
import { ApiError } from "../utils/ApiError.js";

/**
 * Factory to create an authenticated Octokit instance
 * @param {string} token - The GitHub OAuth access token
 * @returns {Octokit} Configured Octokit instance
 */
export const createGitHubClient = (token) => {
    if (!token) {
        throw new ApiError(401, "GitHub access token is required");
    }

    return new Octokit({
        auth: token,
        request: {
            timeout: 10000, // 10 seconds timeout
            retries: 3
        }
    });
};

/**
 * Parses a GitHub PR URL into owner, repo, and prNumber
 */
export const parsePRUrl = (url) => {
    try {
        const regex = /github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/i;
        const match = url.match(regex);
        if (!match) throw new Error("Invalid PR URL");

        return {
            owner: match[1],
            repo: match[2],
            pull_number: parseInt(match[3], 10)
        };
    } catch (error) {
        throw new ApiError(400, "Invalid GitHub PR URL format");
    }
};

/**
 * Handle Octokit errors and throw custom ApiError
 */
const handleGitHubError = (error, defaultMessage) => {
    if (error instanceof ApiError) throw error;

    const status = error.status || 500;
    const message = error.response?.data?.message || error.message || defaultMessage;

    // Check for rate limit
    if (status === 403 || status === 429) {
        const retryAfter = error.response?.headers?.['retry-after'];
        if (retryAfter) {
            throw new ApiError(status, `GitHub API rate limit exceeded. Retry after ${retryAfter} seconds.`);
        }
        throw new ApiError(status, `GitHub API rate limit exceeded.`);
    }

    throw new ApiError(status, `GitHub Error: ${message}`);
};

export const getPullRequest = async (owner, repo, prNumber, token) => {
    try {
        const client = createGitHubClient(token);
        const { data } = await client.pulls.get({
            owner,
            repo,
            pull_number: prNumber
        });
        return data;
    } catch (error) {
        handleGitHubError(error, "Failed to fetch pull request");
    }
};

export const getPRFiles = async (owner, repo, prNumber, token, page = 1, perPage = 100) => {
    try {
        const client = createGitHubClient(token);
        const { data } = await client.pulls.listFiles({
            owner,
            repo,
            pull_number: prNumber,
            page,
            per_page: perPage
        });
        return data;
    } catch (error) {
        handleGitHubError(error, "Failed to fetch PR files");
    }
};

export const getPRCommits = async (owner, repo, prNumber, token, page = 1, perPage = 100) => {
    try {
        const client = createGitHubClient(token);
        const { data } = await client.pulls.listCommits({
            owner,
            repo,
            pull_number: prNumber,
            page,
            per_page: perPage
        });
        return data;
    } catch (error) {
        handleGitHubError(error, "Failed to fetch PR commits");
    }
};

export const getRepository = async (owner, repo, token) => {
    try {
        const client = createGitHubClient(token);
        const { data } = await client.repos.get({
            owner,
            repo
        });
        return data;
    } catch (error) {
        handleGitHubError(error, "Failed to fetch repository details");
    }
};

export const getAuthenticatedUser = async (token) => {
    try {
        const client = createGitHubClient(token);
        const { data } = await client.users.getAuthenticated();
        return data;
    } catch (error) {
        handleGitHubError(error, "Failed to fetch authenticated user");
    }
};

export const getUserEmails = async (token) => {
    try {
        const client = createGitHubClient(token);
        const { data } = await client.users.listEmailsForAuthenticatedUser();
        return data;
    } catch (error) {
        handleGitHubError(error, "Failed to fetch user emails");
    }
};
