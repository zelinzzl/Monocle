import { apiFetch } from "@/services/api";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerPushNotifications(userId: string) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push notifications are not supported");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register("/service-worker.js");
    const applicationServerKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    console.log("Registering push notifications with key:", applicationServerKey);
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    await apiFetch("/api/alerts/push-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, subscription }),
    });

    console.log("Push subscription registered successfully");
  } catch (error) {
    console.error("Failed to register push notifications:", error);
  }
}
