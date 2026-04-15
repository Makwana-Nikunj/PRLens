import { ApiError } from "../utils/ApiError.js";
import { getAuthenticatedUser, getUserEmails } from "./github.service.js";

const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_TIMEOUT = 10000;

const fetchWithTimeout = async (url, options) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GITHUB_TIMEOUT);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(timeout);
    }
};

export const verifyGitHubToken = async ({ code, codeVerifier, redirectUri }) => {
    try {
        let tokenResponse;
        try {
            tokenResponse = await fetchWithTimeout(GITHUB_TOKEN_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    client_id: process.env.GITHUB_CLIENT_ID,
                    client_secret: process.env.GITHUB_CLIENT_SECRET,
                    code,
                    code_verifier: codeVerifier, // if PKCE is used
                    redirect_uri: redirectUri,
                }),
            });
        } catch (err) {
            if (err.name === "AbortError") {
                throw new ApiError(503, "GitHub token service timed out. Please try again.");
            }
            throw err;
        }

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json().catch(() => ({}));
            throw new ApiError(401, errorData.error_description || "OAuth token exchange failed");
        }

        const tokens = await tokenResponse.json();
        const { access_token } = tokens;

        if (!access_token) {
            throw new ApiError(401, "No access token returned from GitHub");
        }

        // Use Octokit from github.service.js to fetch user info
        const userInfo = await getAuthenticatedUser(access_token);

        // Fetch email if not public
        let email = userInfo.email;
        if (!email) {
            const emails = await getUserEmails(access_token);
            const primary = emails.find((e) => e.primary && e.verified);
            email = primary ? primary.email : null;
        }

        return {
            github_id: String(userInfo.id),
            email,
            name: userInfo.name || userInfo.login || "GitHub User",
            picture: userInfo.avatar_url || null,
            github_token: access_token // crucial modification for Phase 4
        };
    } catch (err) {
        if (err instanceof ApiError) throw err;
        throw new ApiError(401, err.message || "GitHub authentication failed");
    }
};
