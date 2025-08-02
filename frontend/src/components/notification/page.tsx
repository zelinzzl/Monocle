"use client";
import React from "react";
import { PushMessage } from "@/hooks/usePushNotification";

interface Props {
  message: PushMessage | null;
  onClose: () => void;
}

export default function NotificationMessageModal({ message, onClose }: Props) {
  if (!message) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
        <h2 className="text-xl font-bold mb-2">{message.title}</h2>
        <p className="text-gray-700 mb-4">{message.body}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
