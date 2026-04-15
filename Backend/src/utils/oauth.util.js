import { ApiError } from "./ApiError.js";

const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_USERINFO_URL = "https://api.github.com/user";
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
          code_verifier: codeVerifier,
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
      throw new Error(errorData.error_description || "OAuth token exchange failed");
    }

    const tokens = await tokenResponse.json();
    const { access_token } = tokens;

    let userResponse;
    try {
      userResponse = await fetchWithTimeout(GITHUB_USERINFO_URL, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: "application/json",
        },
      });
    } catch (err) {
      if (err.name === "AbortError") {
        throw new ApiError(503, "GitHub user info service timed out. Please try again.");
      }
      throw err;
    }

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user info from GitHub");
    }

    const userInfo = await userResponse.json();

    // GitHub returns null email for users with private emails —
    // fetch the primary verified email from the /user/emails endpoint
    let email = userInfo.email;
    if (!email) {
      let emailResponse;
      try {
        emailResponse = await fetchWithTimeout("https://api.github.com/user/emails", {
          headers: {
            Authorization: `Bearer ${access_token}`,
            Accept: "application/json",
          },
        });
      } catch (err) {
        if (err.name === "AbortError") {
          throw new ApiError(503, "GitHub email service timed out. Please try again.");
        }
        throw err;
      }

      if (emailResponse.ok) {
        const emails = await emailResponse.json();
        const primary = emails.find((e) => e.primary && e.verified);
        email = primary ? primary.email : null;
      }
    }

    return {
      github_id: String(userInfo.id),
      email,
      name: userInfo.name || userInfo.login || "GitHub User",
      picture: userInfo.avatar_url || null,
    };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(401, err.message || "GitHub authentication failed");
  }
};