// src/services/alertsService.ts
import { apiFetch } from "./api";

interface Alert {
  id: string;
  title: string;
  status: "new" | "read" | "active" | "inactive" | "triggered";
  timestamp: string;
}

interface AlertsResponse {
  data?: {
    alerts: Alert[];
  };
  error?: string;
  message?: string;
}

export async function getAlerts(userId: string): Promise<AlertsResponse> {
  const response = await apiFetch(`/api/alerts/get-alerts/${userId}`, {
    method: "GET",
  });

  const alerts =
    response?.data?.alerts?.map((alert: any) => ({
      id: alert.id,
      title: alert.title,
      status: alert.status,
      timestamp: alert.timestamp || alert.displayDate,
    })) || [];

  return {
    data: { alerts },
    error: response.error,
    message: response.message,
  };
}

export async function createAlert(data: {
  userId: string;
  destinationId: string;
  checkInDate: string;
  checkOutDate: string;
  priceThreshold?: number;
}): Promise<AlertsResponse> {
  return apiFetch("/api/alerts/create-alert", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAlertStatus(
  alertId: string,
  status: "new" | "read"
): Promise<AlertsResponse> {
  return apiFetch(`/api/alerts/update/${alertId}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export async function deleteAlert(alertId: string): Promise<AlertsResponse> {
  return apiFetch(`/api/alerts/remove/${alertId}`, {
    method: "DELETE",
  });
}
