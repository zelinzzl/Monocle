
import express from 'express';
import GoogleRoutesController from '../controllers/groutesController.js';

const router = express.Router();

// // All destination routes require authentication
// router.use(authenticateToken);

// Route to fetch a route between two locations
router.post('/fetch-route', GoogleRoutesController.fetchRoute);
router.post('/route-with-weather', GoogleRoutesController.getRouteWithWeather);
export default router;