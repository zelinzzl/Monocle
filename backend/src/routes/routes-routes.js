import express from 'express';
import RouteController from '../controllers/routeController.js';

const router = express.Router();

router.post('/create-route', RouteController.createRoute);

export default router;
