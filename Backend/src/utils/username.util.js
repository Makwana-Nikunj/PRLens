/**
 * Generate a unique username from a display name via DB lookup.
 * @param {string} name - Display name to base username on
 * @param {Function} sql - Database client
 * @returns {Promise<string>} Unique username
 */
export const generateUniqueUsername = async (name, sql) => {
    const base = name
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 15) || "user";

    for (let attempt = 0; attempt < 5; attempt++) {
        const suffix = Math.floor(1000 + Math.random() * 9000);
        const username = `${base}${suffix}`;

        const existing = await sql`SELECT id FROM users WHERE username = ${username}`;
        if (existing.length === 0) return username;
    }

    // Fallback: append timestamp for guaranteed uniqueness
    return `${base}${Math.floor(1000 + Math.random() * 9000)}${Date.now()}`;
};
