import React from "react";
import { generateColorFromName, timeDiff } from "@/utils/function";
import Image from "next/image";
import MessageAttachment from "./messageAttachment";

function MessageItem({ content, sender, isSender, avatarUrl, createdAt, attachment }) {
  const bgColor = generateColorFromName(sender || "AB");
  const avatarText = sender?.charAt(0).toUpperCase();
  const timeAgo = timeDiff(createdAt);

  return (
    <div className={`flex ${isSender ? "justify-end" : "justify-start"} mb-4 group hover:opacity-100`}>
      {/* Avatar displayed if it's "other" */}
      {!isSender && (
        <div
          className="mr-2 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-white shadow-sm"
          style={{ backgroundColor: bgColor }}
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover"
              width={32}
              height={32}
            />
          ) : (
            <span className="text-xs font-semibold">
              {avatarText || "?"}
            </span>
          )}
        </div>
      )}
      <div className={`max-w-[75%] px-4 py-2.5 text-sm shadow-sm ${
          isSender
            ? "bg-blue-600 text-white rounded-t-2xl rounded-bl-2xl rounded-br-sm"
            : "bg-muted text-muted-foreground rounded-t-2xl rounded-br-2xl rounded-bl-sm border border-border"
        }`}
      >
        {!isSender && (
          <div className="text-xs font-medium text-muted-foreground mb-1">
            {sender}
          </div>
        )}
        <div className={`${attachment ? "mb-2" : ""} break-words`}>
          {content}
        </div>
        {attachment && (
          <MessageAttachment attachment={attachment} isSender={isSender} />
        )}
        <div className={`text-xs mt-1 flex items-center ${isSender ? 'justify-end' : 'justify-start'}`}>
          <span className={`${isSender ? 'text-blue-200' : 'text-muted-foreground'} opacity-80`}>
            {timeAgo}
          </span>
        </div>
      </div>
      
      {isSender && (
        <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 w-8 h-8 flex items-center justify-center">
          {/* Can add read receipts or message actions here */}
        </div>
      )}
    </div>
  );
}

export default MessageItem;
