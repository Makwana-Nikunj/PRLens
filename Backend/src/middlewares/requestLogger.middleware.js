export const requestLogger = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const log = `[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms ${req.ip}`;

        // Log suspicious patterns
        if (res.statusCode >= 400) {
            console.warn(log);
        } else {
            console.log(log);
        }

        // Log auth failures
        if (res.statusCode === 401 || res.statusCode === 403) {
            console.warn(`AUTH FAILURE: ${req.method} ${req.path} - User: ${req.user?.id || 'anonymous'} - IP: ${req.ip}`);
        }
    });

    next();
};
