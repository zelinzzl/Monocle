import express from 'express';
import AlertController from '../controllers/alertsController.js';
import webPush from 'web-push';
import { supabase } from '../config/database.js';
const router = express.Router();

router.get('/get-alerts/:userId', AlertController.getAlerts);

// Route to delete an alert
router.delete('/remove/:alertId', AlertController.deleteAlertController);

// Route to update an alert's status
router.put('/update/:alertId', AlertController.updateAlertStatusController);

// Route to create a new alert
router.post('/create-alert', AlertController.createAlertController);

// Route to handle push subscription for notifications
router.post('/push-subscription', AlertController.pushSubscription);

// Route to delete a user's push subscription
router.delete('/delete-subscription/:userId', AlertController.deleteSubscription);

// Route to get a user's push subscription
router.get('/get-subscription/:userId', AlertController.getPushSubscription);

webPush.setVapidDetails(
  "mailto:test@yourapp.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

router.post("/test-notification", async (req, res) => {
  const { userId } = req.body;

  // Fetch subscription from DB
  const { data: user, error } = await supabase
    .from("users")
    .select("push_subscription")
    .eq("id", userId)
    .single();

  if (error || !user?.push_subscription) {
    return res.status(404).json({ error: "Subscription not found" });
  }

  try {
    await webPush.sendNotification(
      user.push_subscription,
      JSON.stringify({
        title: "🔔 Test Notification",
        body: "Push notifications are working!",
        route_id: "test",
      })
    );

    res.json({ success: true, message: "Test notification sent" });
  } catch (err) {
    console.error("Push notification error:", err);
    res.status(500).json({ error: "Failed to send notification" });
  }
});


export default router;
