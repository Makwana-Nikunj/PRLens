export const securityHeaders = (req, res, next) => {
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // XSS protection (legacy browser support)
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Ensure HTTPS in production (will be set by reverse proxy)
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    // Content Security Policy (allows inline scripts for now, can be tightened later)
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
    );

    // Permissions policy
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    // Prevent leaking referrer info to external sites
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    next();
};
