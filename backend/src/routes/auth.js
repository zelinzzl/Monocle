
import express from 'express';
import rateLimit from 'express-rate-limit';
import AuthController from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rate limiting for auth endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP per window
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter rate limiting for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 login attempts per IP per window
  message: {
    success: false,
    error: 'Too many login attempts. Please try again later.',
    retryAfter: '15 minutes'
  }
});

// Public routes (no authentication required)
router.post('/register', authLimiter, AuthController.register);
router.post('/login', loginLimiter, AuthController.login);
router.post('/refresh', authLimiter, AuthController.refreshToken);

// Protected routes (authentication required)
router.post('/logout', authenticateToken, AuthController.logout);
router.get('/verify', authenticateToken, AuthController.verify);
router.get('/profile', authenticateToken, AuthController.getProfile);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth service is running',
    timestamp: new Date().toISOString()
  });
});

export default router;