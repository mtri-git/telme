import React from "react";
import { generateColorFromName, timeDiff } from "@/utils/function";
import Image from "next/image";
import MessageAttachment from "./messageAttachment";

function MessageItem({ content, sender, isSender, avatarUrl, createdAt, attachment }) {
  const bgColor = generateColorFromName(sender || "AB");
  const avatarText = sender?.charAt(0).toUpperCase();
  const timeAgo = timeDiff(createdAt);

  return (
    <div className={`flex ${isSender ? "justify-end" : "justify-start"} mb-4`}>
      {/* Avatar displayed if it's "other" */}
      {!isSender && (
        <div
          className="mr-3 flex items-center justify-center w-10 h-10 rounded-full bg-gray-300"
          style={{ backgroundColor: bgColor }}
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-sm font-bold text-gray-700">
              {avatarText || "?"}
            </span>
          )}
        </div>
      )}
        <div
          className={`max-w-[75%] px-4 py-2 rounded-lg text-sm ${
            isSender
              ? "bg-blue-500 text-white rounded-br-none"
              : "bg-gray-200 text-gray-900 rounded-bl-none"
          }`}
        >
          <div>
          {content}
          </div>
          {attachment && (
          <MessageAttachment attachment={attachment} isSender={isSender} />)}

        <div className={`text-xs ${isSender ? 'text-gray-300' : 'text-gray-500'} mt-1 ${isSender ? 'text-right' : 'text-left'}`}>
          {timeAgo}
        </div>
        </div>
      {isSender && (
        <div className="ml-3 flex items-center justify-center w-10 h-10"></div>
      )}
    </div>
  );
}

export default MessageItem;

