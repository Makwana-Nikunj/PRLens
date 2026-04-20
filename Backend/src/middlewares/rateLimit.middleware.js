import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests from this IP, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict limiter for heavy AI analysis endpoints
export const analyzeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20, // 20 PR analyses per 15 min max
    message: { error: 'Analysis rate limit exceeded. Please wait a moment.' },
    standardHeaders: true,
});

// Lenient limiter for chat endpoints
export const chatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 30, // 30 chat messages per minute max
    message: { error: 'Chat rate limit exceeded. Please type slower.' },
    standardHeaders: true,
});

// Strict limiter for auth endpoints
export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // Temporarily increased to 50
    message: { error: 'Too many authentication attempts, please try again later' },
    standardHeaders: true,
});
