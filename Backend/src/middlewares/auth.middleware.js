import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sql } from "../db/index.js";

// Simple in-memory user cache with 60s TTL to reduce DB lookups
// on high-frequency authenticated endpoints
const userCache = new Map();
const USER_CACHE_TTL = 60_000; // 60 seconds

function getCachedUser(userId) {
    const entry = userCache.get(userId);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > USER_CACHE_TTL) {
        userCache.delete(userId);
        return null;
    }
    return entry.user;
}

function setCachedUser(userId, user) {
    userCache.set(userId, { user, timestamp: Date.now() });
    // Prevent unbounded growth — evict oldest if >500 entries
    if (userCache.size > 500) {
        const oldest = userCache.keys().next().value;
        userCache.delete(oldest);
    }
}

// Exported for logout/role-change invalidation
export function invalidateUserCache(userId) {
    userCache.delete(userId);
}

const verifyJwt = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (err) {
            throw new ApiError(401, "Access token expired or invalid");
        }

        // Check cache first
        let user = getCachedUser(decodedToken.id);

        if (!user) {
            const users = await sql`SELECT id, username, avatar_url, github_token FROM users WHERE id = ${decodedToken.id}`;

            if (!users || users.length === 0) {
                throw new ApiError(401, "Invalid Access Token");
            }
            user = users[0];
            setCachedUser(decodedToken.id, user);
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(error?.statusCode || 401, error?.message || "Invalid access token");
    }
});



export { verifyJwt };