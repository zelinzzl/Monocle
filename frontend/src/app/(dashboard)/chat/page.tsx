"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Message {
  id: number;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

const suggestions = [
  "Why was my claim denied?",
  "Explain policy coverage",
  "Can I submit more documents?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const welcomeMessage: Message = {
      id: Date.now(),
      sender: "bot",
      text: "Hey, it's Monty the chatbot. How can I help you?",
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const sendMessage = (text: string, sender: "user" | "bot" = "user") => {
    const newMessage: Message = {
      id: Date.now(),
      sender,
      text,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full max-h-screen overflow-hidden">
      {/* Header */}
      <div className="bg-black text-white p-3 text-center text-sm font-medium flex-shrink-0">
        Monty
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-muted p-6 flex flex-col gap-4 min-h-0">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 min-h-0">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <Card
                className={`p-3 max-w-md ${
                  msg.sender === "bot" ? "bg-gray-200 text-black" : ""
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <div className="text-xs text-gray-500 text-right">
                  {msg.timestamp}
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Suggestions */}
        <div className="flex gap-2 flex-wrap flex-shrink-0">
          {suggestions.map((s, idx) => (
            <Button
              key={idx}
              variant="outline"
              className="text-sm"
              onClick={() => sendMessage(s)}
            >
              {s}
            </Button>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            className="bg-black text-white hover:bg-gray-900"
          >
            Send
          </Button>
        </div>
      </main>
    </div>
  );
}
