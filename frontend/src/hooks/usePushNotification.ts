import { useEffect, useState } from "react";

export interface PushMessage {
  title: string;
  body: string;
  route_id?: string;
}

export function usePushNotifications() {
  const [message, setMessage] = useState<PushMessage | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "PUSH_NOTIFICATION") {
          setMessage(event.data.payload);
        }
      });
    }
  }, []);

  return { message, setMessage };
}
