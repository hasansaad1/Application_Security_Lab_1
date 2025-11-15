const jwt = require('jsonwebtoken');

const config = require("../config");

function auth(required=true) {
  return (req, res, next) => {
    // Try cookie first (for browser / Next.js)
    const cookieToken = req.cookies?.token;

    // Then try Authorization header (for mobile, tools, etc.)
    const authHeader = req.headers.authorization;
    const headerToken = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null;

    const token = cookieToken || headerToken;

    if (!token) {
      if (!required) return next();
      return res.status(401).json({ error: 'Missing token' });
    }

    try {
      const payload = jwt.verify(token, config.auth.jwtSecret);
      req.user = payload;
      next();
    } catch (err) {
      console.error(err);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}

module.exports = auth;
