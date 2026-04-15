import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sql } from "../db/index.js";
import { generateUniqueUsername } from "../utils/username.util.js";
import jwt from "jsonwebtoken";


const accessCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 15 * 60 * 60 * 1000 // 15 hours
};

const refreshCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

const generateAccessToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
    );
};

const generateRefreshToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
    );
};

const generateAndSaveTokens = async (userId) => {
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);

    await sql`UPDATE users SET refresh_token = ${refreshToken} WHERE id = ${userId}`;

    return { accessToken, refreshToken };
};



// ============================================
// AUTH CONTROLLERS
// ============================================

const logoutUser = asyncHandler(async (req, res) => {
    await sql`UPDATE users SET refresh_token = NULL WHERE id = ${req.user.id}`;

    return res
        .status(200)
        .clearCookie("accessToken", accessCookieOptions)
        .clearCookie("refreshToken", refreshCookieOptions)
        .json(new ApiResponse(200, {}, "Logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }

    let decoded;
    try {
        decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    const users = await sql`
        SELECT id, refresh_token FROM users WHERE id = ${decoded.id}
    `;

    if (users.length === 0 || users[0].refresh_token !== incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken } = await generateAndSaveTokens(users[0].id);

    return res
        .status(200)
        .cookie("accessToken", accessToken, accessCookieOptions)
        .cookie("refreshToken", refreshToken, refreshCookieOptions)
        .json(new ApiResponse(200, { accessToken }, "Access token refreshed"));
});

const oauthLogin = asyncHandler(async (req, res) => {
    const { code, codeVerifier, redirectUri } = req.body || {};

    if (!code?.trim() || !codeVerifier?.trim() || !redirectUri?.trim()) {
        throw new ApiError(400, "code, codeVerifier, and redirectUri are required");
    }

    // Validate redirect URI against allowed origins
    const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:5174",
        process.env.FRONTEND_URL,
    ].filter(Boolean);

    const isAllowed = allowedOrigins.some(
        (origin) => redirectUri.startsWith(origin + "/")
    );
    if (!isAllowed) {
        throw new ApiError(400, "Invalid redirect URI");
    }

    // Verify OAuth token with GitHub
    const { github_id, email, name, picture } = await verifyGitHubToken({
        code,
        codeVerifier,
        redirectUri,
    });

    // 1. Lookup by github_id
    let users = await sql`
        SELECT id, username, email, avatar, github_id, created_at
        FROM users 
    `;

    if (users.length > 0) {
        const user = users[0];
        const { accessToken, refreshToken } = await generateAndSaveTokens(user.id);

        const { refresh_token, ...userWithoutSensitiveData } = { ...user };

        return res
            .status(200)
            .cookie("accessToken", accessToken, accessCookieOptions)
            .cookie("refreshToken", refreshToken, refreshCookieOptions)
            .json(new ApiResponse(200, userWithoutSensitiveData, "Login successful"));
    }



    // 3. New user — create account
    const uniqueUsername = await generateUniqueUsername(name, sql);

    const newUser = await sql`
        INSERT INTO users (username, email, github_id, avatar)
        VALUES (${uniqueUsername}, ${email}, ${providerId}, ${picture || null})
        RETURNING id, username, email, avatar, created_at
    `;

    if (!newUser || newUser.length === 0) {
        throw new ApiError(500, "Failed to create user");
    }

    const user = newUser[0];
    const { accessToken, refreshToken } = await generateAndSaveTokens(user.id);

    const userWithoutSensitiveData = {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        created_at: user.created_at,
    };

    return res
        .status(201)
        .cookie("accessToken", accessToken, accessCookieOptions)
        .cookie("refreshToken", refreshToken, refreshCookieOptions)
        .json(new ApiResponse(201, userWithoutSensitiveData, "Account created and login successful"));
});

export {
    logoutUser,
    refreshAccessToken,
    oauthLogin
};

// Exported for internal use (e.g., OAuth controller)
export { generateAndSaveTokens, accessCookieOptions, refreshCookieOptions };