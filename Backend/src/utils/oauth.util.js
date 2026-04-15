import { ApiError } from "./ApiError.js";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
const GOOGLE_TIMEOUT = 10000;

const fetchWithTimeout = async (url, options) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GOOGLE_TIMEOUT);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(timeout);
    }
};

/**
 * Exchange Google OAuth2 authorization code and verify
 * @param {{ code: string, codeVerifier: string, redirectUri: string }} params
 * @returns {{ providerId: string, email: string, name: string, picture: string }}
 */
export const verifyGoogleToken = async ({ code, codeVerifier, redirectUri }) => {
    try {
        // Step 1: Exchange code for tokens
        let tokenResponse;
        try {
            tokenResponse = await fetchWithTimeout(GOOGLE_TOKEN_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code,
                    client_id: process.env.GOOGLE_CLIENT_ID,
                    client_secret: process.env.GOOGLE_CLIENT_SECRET,
                    code_verifier: codeVerifier,
                    grant_type: "authorization_code",
                    redirect_uri: redirectUri,
                }),
            });
        } catch (err) {
            if (err.name === "AbortError") {
                throw new ApiError(503, "Google token service timed out. Please try again.");
            }
            throw err;
        }

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json().catch(() => ({}));
            throw new Error(errorData.error_description || "OAuth token exchange failed");
        }

        const tokens = await tokenResponse.json();
        const { access_token } = tokens;

        // Step 2: Get user info
        let userResponse;
        try {
            userResponse = await fetchWithTimeout(GOOGLE_USERINFO_URL, {
                headers: { Authorization: `Bearer ${access_token}` },
            });
        } catch (err) {
            if (err.name === "AbortError") {
                throw new ApiError(503, "Google user info service timed out. Please try again.");
            }
            throw err;
        }

        if (!userResponse.ok) {
            throw new Error("Failed to fetch user info from Google");
        }

        const userInfo = await userResponse.json();

        // Step 3: Validate email verification
        if (!userInfo.email_verified) {
            throw new Error("Google email is not verified");
        }

        return {
            providerId: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name || userInfo.given_name || "Google User",
            picture: userInfo.picture || null,
        };
    } catch (err) {
        if (err instanceof ApiError) throw err;
        throw new ApiError(401, err.message || "Google authentication failed");
    }
};
