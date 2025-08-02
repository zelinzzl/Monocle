// routes/routeRiskRoutes.js
import express from 'express';
import RouteRiskController from '../controllers/routeRiskController.js';

const router = express.Router();

// Route to calculate risk for a specific route
router.post('/calc-risk/', RouteRiskController.calculateRouteRisk);
router.post("/test-risk", RouteRiskController.calculateRouteRisk);

export default router;