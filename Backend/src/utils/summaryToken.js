import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET;

if (!JWT_SECRET) {
    console.error("⚠️  SECURITY WARNING: No JWT_SECRET or ACCESS_TOKEN_SECRET configured!");
}

export function createSummaryToken(prId, summary) {
    return jwt.sign(
        {
            prId,
            summary
        },
        JWT_SECRET,
        {
            algorithm: "HS256",
            expiresIn: process.env.SUMMARY_TOKEN_EXPIRY || "24h"
        }
    );
}

export function verifySummaryToken(token, expectedPrId) {
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
        if (decoded.prId !== expectedPrId) {
            console.warn(`Summary token prId mismatch. Expected ${expectedPrId}, got ${decoded.prId}`);
            return null;
        }
        return decoded.summary;
    } catch (error) {
        console.warn("Invalid summary token:", error.message);
        return null;
    }
}
