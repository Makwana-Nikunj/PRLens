import { Octokit } from "@octokit/rest";
import { ApiError } from "../utils/ApiError.js";

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

export class GitHubService {
    constructor(token) {
        if (!token) {
            throw new ApiError(401, "GitHub access token is required");
        }

        this.client = new Octokit({
            auth: token,
            request: {
                timeout: 10000, // 10 seconds timeout
                retries: 3
            }
        });
    }

    _handleGitHubError(error, defaultMessage) {
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
    }

    async getPullRequest(owner, repo, prNumber) {
        try {
            const { data } = await this.client.pulls.get({
                owner,
                repo,
                pull_number: prNumber
            });
            return data;
        } catch (error) {
            this._handleGitHubError(error, "Failed to fetch pull request");
        }
    }

    async getPRFiles(owner, repo, prNumber, page = 1, perPage = 100) {
        try {
            const { data } = await this.client.pulls.listFiles({
                owner,
                repo,
                pull_number: prNumber,
                page,
                per_page: perPage
            });
            return data;
        } catch (error) {
            this._handleGitHubError(error, "Failed to fetch PR files");
        }
    }

    async getPRCommits(owner, repo, prNumber, page = 1, perPage = 100) {
        try {
            const { data } = await this.client.pulls.listCommits({
                owner,
                repo,
                pull_number: prNumber,
                page,
                per_page: perPage
            });
            return data;
        } catch (error) {
            this._handleGitHubError(error, "Failed to fetch PR commits");
        }
    }

    async getRepository(owner, repo) {
        try {
            const { data } = await this.client.repos.get({
                owner,
                repo
            });
            return data;
        } catch (error) {
            this._handleGitHubError(error, "Failed to fetch repository details");
        }
    }

    async getAuthenticatedUser() {
        try {
            const { data } = await this.client.users.getAuthenticated();
            return data;
        } catch (error) {
            this._handleGitHubError(error, "Failed to fetch authenticated user");
        }
    }

    async getUserEmails() {
        try {
            const { data } = await this.client.users.listEmailsForAuthenticatedUser();
            return data;
        } catch (error) {
            this._handleGitHubError(error, "Failed to fetch user emails");
        }
    }
}
