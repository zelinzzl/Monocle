// src/services/alertsService.ts
import { apiFetch } from "./api";

interface Alert {
  id: string;
  userId: string;
  destinationId: string;
  checkInDate: string;
  checkOutDate: string;
  status: "active" | "inactive" | "triggered";
  priceThreshold?: number;
  createdAt: string;
  updatedAt: string;
}

interface AlertsResponse {
  data?: Alert[] | Alert;
  error?: string;
  message?: string;
}

export async function getAlerts(userId: string): Promise<AlertsResponse> {
  return apiFetch(`/api/alerts/get-alerts/${userId}`, {
    method: "GET",
  });
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
  status: "active" | "inactive"
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
