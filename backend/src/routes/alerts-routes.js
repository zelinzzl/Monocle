import express from 'express';
import AlertController from '../controllers/alertsController.js';

const router = express.Router();

router.get('/:userId', AlertController.getAlerts);

// Route to delete an alert
router.delete('/:alertId', AlertController.deleteAlertController);

// Route to update an alert's status
router.put('/:alertId', AlertController.updateAlertStatusController);

// Route to create a new alert
router.post('/', AlertController.createAlertController);

export default router;
