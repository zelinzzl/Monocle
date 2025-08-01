import express from 'express';
import rateLimit from 'express-rate-limit';
import InsuranceController from '../controllers/insuranceController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rate limiting for insurance operations
const insuranceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per IP per window
  message: {
    success: false,
    error: 'Too many insurance operations. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter rate limiting for asset processing (risk assessment)
const processLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 assessments per IP per hour
  message: {
    success: false,
    error: 'Too many risk assessment requests. Please try again later.',
    retryAfter: '1 hour'
  }
});

// All insurance routes require authentication
router.use(authenticateToken);

// Asset CRUD operations
router.post('/', insuranceLimiter, (req, res) => InsuranceController.addAsset(req, res));
router.get('/', insuranceLimiter, (req, res) => InsuranceController.getUserAssets(req, res));
router.get('/summary', insuranceLimiter, (req, res) => InsuranceController.getInsuranceSummary(req, res));
router.get('/status', insuranceLimiter, (req, res) => InsuranceController.getAssetsByStatus(req, res));
router.get('/:id', insuranceLimiter, (req, res) => InsuranceController.getAsset(req, res));
router.put('/:id', insuranceLimiter, (req, res) => InsuranceController.updateAsset(req, res));
router.delete('/:id', insuranceLimiter, (req, res) => InsuranceController.deleteAsset(req, res));

// Risk assessment and processing
router.post('/:id/process', processLimiter, (req, res) => InsuranceController.processAsset(req, res));

// Get asset by policy number (for chatbot integration)
router.get('/policy/:policyNumber', insuranceLimiter, (req, res) => InsuranceController.getAssetByPolicy(req, res));

// Health check endpoint
router.get('/health/check', (req, res) => {
  res.json({
    success: true,
    message: 'Insurance service is running',
    timestamp: new Date().toISOString()
  });
});

export default router;