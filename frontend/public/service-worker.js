self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();

  // Show system notification
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/notification.png",
      data,
    })
  );

  // Send message to the client (React app)
  self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: "PUSH_NOTIFICATION",
        payload: data,
      });
    });
  });
});