// middleware/authMiddleware.js

/**
 * Example authentication middleware.
 * Checks for a 'x-auth-user' header and attaches a mock user object to the request.
 * In a real application, this would involve token validation (e.g., JWT).
 */
const authMiddleware = (req, res, next) => {
  // Get user identifier from a custom header
  const userId = req.header('x-auth-user');

  if (!userId) {
    // If no user ID is provided, return a 401 Unauthorized error
    return res.status(401).json({ message: 'Unauthorized: No user ID provided.' });
  }

  try {
    // In a real app, you would validate the token or session here.
    // For this example, we'll just attach a mock user object.
    req.user = {
      id: userId,
      name: 'Test User', // Mock user name
    };
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized: Invalid token.' });
  }
};

module.exports = authMiddleware;
