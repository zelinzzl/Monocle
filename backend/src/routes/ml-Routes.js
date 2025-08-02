import express from 'express';
import rateLimit from 'express-rate-limit';
import MLRiskController from '../controllers/mlRiskController.js';
import { mlSchemas, validateMLInput } from '../utils/mlValidation.js';

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

// Validation middleware
const validateRouteAnalysis = (req, res, next) => {
  const validation = validateMLInput(mlSchemas.analyzeRoute, req.body);
  
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      error: 'Invalid route data',
      details: validation.errors
    });
  }
  
  req.body = validation.data;
  next();
};

const validateRiskAssessment = (req, res, next) => {
  const validation = validateMLInput(mlSchemas.riskAssessment, req.body);
  
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      error: 'Invalid risk assessment data',
      details: validation.errors
    });
  }
  
  req.body = validation.data;
  next();
};

const validateCoordinates = (req, res, next) => {
  const { lat, lng } = req.params;
  const { days } = req.query;
  
  const validation = validateMLInput(mlSchemas.weatherCoordinates, {
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    days: days ? parseInt(days) : undefined
  });
  
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      error: 'Invalid coordinates',
      details: validation.errors
    });
  }
  
  req.validatedCoords = validation.data;
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
router.get('/weather-predictions/:lat/:lng', mlLimiter, validateCoordinates, async (req, res) => {
  try {
    const mlController = new MLRiskController();
    // Use validated coordinates
    req.params.lat = req.validatedCoords.lat;
    req.params.lng = req.validatedCoords.lng;
    req.query.days = req.validatedCoords.days;
    
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

// Analyze specific route with validation
router.post('/analyze-route', mlLimiter, validateRouteAnalysis, async (req, res) => {
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
router.get('/weather-alerts/:lat/:lng', mlLimiter, validateCoordinates, async (req, res) => {
  try {
    // Use validated coordinates
    req.params.lat = req.validatedCoords.lat;
    req.params.lng = req.validatedCoords.lng;
    
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

// Real-time risk assessment with validation
router.post('/risk-assessment', mlLimiter, validateRiskAssessment, async (req, res) => {
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