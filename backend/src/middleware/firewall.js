const jwt = require('jsonwebtoken');

const config = require("../config");
const routePolicies = require("../routes/_policies");

const verifyToken = (req) => {
  // Try cookie first (for browser / Next.js)
  const cookieToken = req.cookies?.token;

  // Then try Authorization header (for mobile, tools, etc.)
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

  const token = cookieToken || headerToken;
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, config.auth.jwtSecret);
  } catch (err) {
    console.error(err);
    return null;
  }
};

const securityFirewall = (req, res, next) => {
  // 1. MATCH ROUTE
  const policy = routePolicies.find(r => r.pathRegex.test(req.path));
  
  // If undefined route, pass to 404 handler or skip
  if (!policy) return next();

  // 2. CHECK METHOD (Block TRACE/DELETE etc.)
  if (!policy.methods.includes(req.method)) {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 3. CHECK AUTHENTICATION
  if (policy.auth) {
    const user = verifyToken(req);
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Access Denied' });
    }
    
    req.user = user; // Attach user to request so controllers can use it

    // FUTURE: 3.1 CHECK ROLES
    /*
    if (policy.roles && !policy.roles.includes(user.role)) {
       return res.status(403).json({ error: 'Forbidden: Insufficient Permissions' });
    }
    */
  }

  // 4. CHECK CONTENT-TYPE (Only for body-bearing methods)
  if (['POST', 'PUT'].includes(req.method) && policy.allowedContentTypes && policy.allowedContentTypes.length > 0) {
    const contentType = req.headers['content-type'];
      
    // We check if the incoming header matches ANY of the allowed types
    const isValid = policy.allowedContentTypes.some(type => 
      contentType && contentType.includes(type)
    );

    if (!isValid) {
      return res.status(415).json({ 
        error: `Unsupported Media Type. Allowed: ${policy.allowedContentTypes.join(', ')}` 
      });
    }
  }

  next();
};

module.exports = securityFirewall;
