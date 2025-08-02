import express from 'express';
import rateLimit from 'express-rate-limit';
import MLRiskController from '../controllers/mlRiskController.js';

const router = express.Router();

// Rate limiting
const mlLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: {
    success: false,
    error: 'Too many ML requests. Please try again later.',
    retryAfter: '15 minutes'
  }
});

// Auth middleware - replace this with your actual auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // For demo purposes, create a mock user if no token
    req.user = { 
      id: 'demo_user_123', 
      email: 'demo@example.com',
      firstName: 'Demo',
      lastName: 'User'
    };
    return next();
  }

  // In production, verify the actual JWT token here
  // For now, just create a user object
  req.user = { 
    id: 'authenticated_user_123', 
    email: 'user@example.com',
    firstName: 'Auth',
    lastName: 'User'
  };
  next();
};

// Health check (no auth required)
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'ML Risk Assessment service is running',
    services: {
      risk_calculator: 'active',
      data_integrator: 'active',
      route_risk_service: 'active',
      prophet_models: 'active'
    },
    timestamp: new Date().toISOString()
  });
});

// Weather predictions (public endpoint - no auth required)
router.get('/weather-predictions/:lat/:lng', mlLimiter, async (req, res) => {
  try {
    const mlController = new MLRiskController();
    await mlController.getWeatherPredictions(req, res);
  } catch (error) {
    console.error('Weather predictions error:', error);
    res.status(500).json({
      success: false,
      error: 'Weather predictions failed',
      details: error.message
    });
  }
});

// Apply auth middleware to all routes below this point
router.use(authenticateToken);

// Create controller instance
const mlController = new MLRiskController();

// Dashboard endpoint
router.get('/dashboard', mlLimiter, async (req, res) => {
  try {
    await mlController.getDashboard(req, res);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Dashboard failed',
      details: error.message
    });
  }
});

// Analyze specific route
router.post('/analyze-route', mlLimiter, async (req, res) => {
  try {
    await mlController.analyzeSpecificRoute(req, res);
  } catch (error) {
    console.error('Route analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Route analysis failed',
      details: error.message
    });
  }
});

// Weather alerts for specific area
router.get('/weather-alerts/:lat/:lng', mlLimiter, async (req, res) => {
  try {
    await mlController.getAreaWeatherAlerts(req, res);
  } catch (error) {
    console.error('Weather alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'Weather alerts failed',
      details: error.message
    });
  }
});

// Real-time risk assessment
router.post('/risk-assessment', mlLimiter, async (req, res) => {
  try {
    await mlController.performRiskAssessment(req, res);
  } catch (error) {
    console.error('Risk assessment error:', error);
    res.status(500).json({
      success: false,
      error: 'Risk assessment failed',
      details: error.message
    });
  }
});

export default router;