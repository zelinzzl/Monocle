import express from 'express';
import RouteController from '../controllers/routeController.js';

const router = express.Router();

router.post('/create-route', RouteController.createRoute);
router.get('/user-routes/:userId', RouteController.getUserRoutes);
router.put('/update-route/:routeId', RouteController.updateRoute);
router.delete('/delete-route/:routeId', RouteController.deleteRoute);

export default router;
