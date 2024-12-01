import React from "react";
import MessageItem from "@/components/base/messageItem";

function TestPage() {
  const chatMessages = [
    { content: "Hello!", sender: "other", avatarText: "AB" },
    { content: "Hi there!", sender: "user" },
    { content: "How are you?", sender: "other man", avatarText: "BC" },
    { content: "I'm fine, thanks!", sender: "user" },
  ];

  return (
    <div className="p-4">
      {chatMessages.map((chat, index) => (
        <MessageItem
          key={index}
          content={chat.content}
          sender={chat.sender}
          avatarText={chat.avatarText}
          avatarUrl={chat.avatarUrl}
        />
      ))}
    </div>
  );
}

export default TestPage;
