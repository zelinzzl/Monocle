import { createAlert, getUserAlerts, updateAlertStatus, deleteAlert } from '../services/alertService.js';

// Controller to fetch alerts for a user
export const getAlerts = async (req, res) => {
  const { userId } = req.params;
  try {
    const alerts = await getUserAlerts(userId);
    res.json({ status: 'success', alerts });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Controller to delete an alert
export const deleteAlertController = async (req, res) => {
  try {
    const alert = await deleteAlert(req.params.alertId);
    res.json({ status: 'success', message: 'Alert deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Controller to update an alert's status
export const updateAlertStatusController = async (req, res) => {
  const { status } = req.body;
  try {
    const alert = await updateAlertStatus(req.params.alertId, status);
    res.json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Controller to create a new alert
export const createAlertController = async (req, res) => {
  const { title, status, type, userId } = req.body;
  try {
    const alert = await createAlert(title, status, type, userId);
    res.status(201).json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
