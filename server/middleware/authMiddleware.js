/**
 * Mock Authentication Middleware
 * In a production app, this would verify JWT tokens
 */

const authMiddleware = (req, res, next) => {
  try {
    // For development, always allow requests with any content
    // Check for various auth headers that might be present
    const userId = req.headers['x-auth-user'] || 
                  req.headers['authorization'] || 
                  req.headers['auth-token'] || 
                  'default-user';
    
    // Mock user object - in production, this would come from JWT verification
    req.user = {
      id: userId === 'default-user' ? 'user123' : userId,
      email: 'user@example.com'
    };
    
    console.log(`[AuthMiddleware] Authenticated user: ${req.user.id}`);
    next();
    
  } catch (error) {
    console.error('[AuthMiddleware] Authentication error:', error);
    res.status(401).json({ 
      message: 'Authentication failed.',
      code: 'AUTH_FAILED'
    });
  }
};

module.exports = authMiddleware;