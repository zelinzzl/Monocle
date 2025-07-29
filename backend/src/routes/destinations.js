import express from 'express';
import DestinationController from '../controllers/destinationController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// All destination routes require authentication
router.use(authenticateToken);

// CRUD routes
router.get('/', (req, res) => DestinationController.getDestinations(req, res));
router.get('/:id', (req, res) => DestinationController.getDestination(req, res));
router.post('/', (req, res) => DestinationController.createDestination(req, res));
router.put('/:id', (req, res) => DestinationController.updateDestination(req, res));
router.delete('/:id', (req, res) => DestinationController.deleteDestination(req, res));

// Special action - update last checked
router.patch('/:id/check', (req, res) => DestinationController.updateLastChecked(req, res));

export default router;