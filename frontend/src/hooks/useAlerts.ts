import { useState, useEffect } from "react";
import {
  getAlerts,
  createAlert,
  updateAlertStatus,
  deleteAlert,
} from "../services/alertsService";

export function useAlerts(userId: string) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await getAlerts(userId);
      if (response.error) {
        setError(response.error);
      } else {
        const alertsArray = response.data?.alerts || [];
        setAlerts(alertsArray);
      }
      console.log("Fetched Alerts:", alerts);
    } catch (err) {
      setError("Failed to fetch alerts");
    } finally {
      setLoading(false);
    }
  };

  const addAlert = async (alertData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await createAlert(alertData);
      if (response.error) {
        setError(response.error);
        return false;
      }
      await fetchAlerts();
      return true;
    } catch (err) {
      setError("Failed to create alert");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleAlertStatus = async (
    alertId: string,
    currentStatus: "new" | "read"
  ) => {
    setLoading(true);
    setError(null);
    try {
      const newStatus = currentStatus === "new" ? "read" : "new";
      const response = await updateAlertStatus(alertId, newStatus);
      if (response.error) {
        setError(response.error);
      } else {
        await fetchAlerts();
      }
    } catch (err) {
      setError("Failed to update alert status");
    } finally {
      setLoading(false);
    }
  };

  const removeAlert = async (alertId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await deleteAlert(alertId);
      if (response.error) {
        setError(response.error);
      } else {
        await fetchAlerts();
      }
    } catch (err) {
      setError("Failed to delete alert");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [userId]);

  return {
    alerts,
    loading,
    error,
    fetchAlerts,
    addAlert,
    toggleAlertStatus,
    removeAlert,
  };
}
