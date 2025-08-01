import { createAlert, getUserAlerts, updateAlertStatus, deleteAlert } from '../services/alertService.js';
import dayjs from "dayjs"; 
class AlertController {

  // Controller to fetch alerts for a user
static async getAlerts(req, res) {
  const { userId } = req.params;
  try {
    const alerts = await getUserAlerts(userId);

    const today = dayjs();

    const formattedAlerts = alerts.map(alert => {
      const createdDate = dayjs(alert.created_at);

      // ✅ Show only time if created today, else only date
      const timestamp = createdDate.isSame(today, "day")
        ? createdDate.format("HH:mm")       // e.g. 14:35
        : createdDate.format("YYYY-MM-DD"); // e.g. 2025-07-29

      return {
        id: alert.id,
        title: alert.title,
        status: alert.status,
        timestamp, // ✅ renamed for clarity
      };
    });

    res.json({
      status: 'success',
      data: { alerts: formattedAlerts },
    });

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
}

  // Controller to delete an alert
  static async deleteAlertController(req, res) {
    try {
      const alert = await deleteAlert(req.params.alertId);
      res.json({ status: 'success', message: 'Alert deleted successfully' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  // Controller to update an alert's status
  static async updateAlertStatusController(req, res) {
    const { status } = req.body;
    try {
      const alert = await updateAlertStatus(req.params.alertId, status);
      res.json({ status: 'success' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  // Controller to create a new alert
  static async createAlertController(req, res) {
    const { title, status, type, userId } = req.body;
    try {
      const alert = await createAlert(title, status, type, userId);
      res.status(201).json({ status: 'success' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
}

export default AlertController;
