import JWTUtils from '../utils/jwt.js';
import AuthService from '../services/authService.js';

/**
 * Middleware to authenticate JWT tokens
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Extract token from header
    const token = JWTUtils.extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }

    // Verify JWT token
    const decoded = JWTUtils.verifyToken(token);
    
    // Ensure it's an access token
    if (decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token type',
        code: 'INVALID_TOKEN_TYPE'
      });
    }

    // Optional: Verify user still exists in database
    const user = await AuthService.findUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    // Handle specific JWT errors
    if (error.message === 'Token expired') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      code: 'TOKEN_INVALID'
    });
  }
};

/**
 * Optional middleware for routes that work with or without auth
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = JWTUtils.extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const decoded = JWTUtils.verifyToken(token);
      if (decoded.type === 'access') {
        const user = await AuthService.findUserById(decoded.userId);
        if (user) {
          req.user = { id: user.id, email: user.email, name: user.name };
        }
      }
    }
    
    next();
  } catch (error) {
    // Continue without auth for optional routes
    next();
  }
};

export { authenticateToken, optionalAuth };