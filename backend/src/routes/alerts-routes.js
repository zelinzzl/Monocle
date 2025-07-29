import express from 'express';
import AlertController from '../controllers/alertsController.js';

const router = express.Router();

router.get('/get-alerts/:userId', AlertController.getAlerts);

// Route to delete an alert
router.delete('/remove/:alertId', AlertController.deleteAlertController);

// Route to update an alert's status
router.put('/update/:alertId', AlertController.updateAlertStatusController);

// Route to create a new alert
router.post('/create-alert', AlertController.createAlertController);

export default router;
