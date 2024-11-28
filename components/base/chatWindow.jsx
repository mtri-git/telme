"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import socket from "@/utils/socketClient";

const ChatWindow = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello!", sender: "John" },
    { id: 2, text: "Hi! How are you?", sender: "You" },
  ]);
  const [input, setInput] = useState("");

  useEffect(() => {
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;

    socket.emit("test", {})
    setMessages([...messages, { id: Date.now(), text: input, sender: "You" }]);
    setInput("");
  };

  return (
    <div className="flex flex-col flex-1 h-ful">
      {/* Header */}
      <div className="p-4 border-b bg-white dark:bg-gray-950">
        <h1 className="text-lg font-bold">Chat with John Doe</h1>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "You" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-lg ${
                message.sender === "You"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-4 border-t bg-white flex items-center space-x-2 dark:bg-gray-800">
        <Input
          type="text"
          placeholder="Type a message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1"
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  );
};

export default ChatWindow;
