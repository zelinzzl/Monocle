"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

function Settings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [alertSounds, setAlertSounds] = useState(false);

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h2 className="text-2xl font-semibold mb-4">Notification Settings</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between border p-4 rounded-lg">
          <Label htmlFor="email-notifications">Email Notifications</Label>
          <Switch
            id="email-notifications"
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
          />
        </div>

        <div className="flex items-center justify-between border p-4 rounded-lg">
          <Label htmlFor="alert-sounds">Alert Sounds</Label>
          <Switch
            id="alert-sounds"
            checked={alertSounds}
            onCheckedChange={setAlertSounds}
          />
        </div>
      </div>
    </div>
  );
}

export default Settings;
