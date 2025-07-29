import express from 'express';
import { 
  getAlerts, 
  deleteAlertController, 
  updateAlertStatusController, 
  createAlertController 
} from '../controllers/alertsController.js';

const router = express.Router();

// Route to fetch alerts for a user
router.get('/:userId', getAlerts);  // Use the controller for fetching alerts

// Route to delete an alert
router.delete('/:alertId', deleteAlertController);  // Use the controller to delete an alert

// Route to update an alert's status
router.put('/:alertId', updateAlertStatusController);  // Use the controller for updating an alert's status

// Route to create a new alert
router.post('/', createAlertController);  // Use the controller for creating a new alert

export default router;
