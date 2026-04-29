import express from "express";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";

import { apiLimiter, authLimiter } from "./middlewares/rateLimit.middleware.js";
import { securityHeaders } from "./middlewares/security.middleware.js";
import { requestLogger } from "./middlewares/requestLogger.middleware.js";

// all routes
import authRouter from "./routes/auth.routes.js";
import prRouter from "./routes/pr.routes.js";
import chatRouter from "./routes/chat.routes.js";


import { keepAlive } from "./utils/keepAlive.js";


const app = express();


const defaultOrigins = ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173"];

const allowedOrigins = process.env.CORS_ORIGIN
    ? [...defaultOrigins, ...process.env.CORS_ORIGIN.split(",").map(o => o.trim().replace(/\/$/, "")).filter(Boolean)]
    : defaultOrigins;


// cors configuration with dynamic origin checking and support for credentials
app.use(
    cors({
        origin: function (origin, callback) {
            // allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
                callback(null, true);
            } else {
                console.warn(`Blocked CORS request from origin: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
        optionsSuccessStatus: 200 // Some legacy browsers choke on 204
    })
);

// Compress all responses (gzip/brotli) — ~70% smaller JSON payloads
app.use(compression());

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);
// Apply stricter rate limiting to auth routes to prevent brute-force attacks
app.use('/api/auth/oauth', authLimiter);

// Apply security headers
app.use(securityHeaders);

// Request logging
app.use(requestLogger);



// Routes
app.use("/api/auth", authRouter);
app.use("/api/pr", prRouter);
app.use("/api/chat", chatRouter);



// Health check endpoint for keep-alive pings
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// Keep-alive self-ping — prevents cold starts on Render free tier
/**
 * Global error handler
 */
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors: err.errors || [],
    });
});

keepAlive();

export { app };

