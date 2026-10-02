import React, { memo } from "react";
import { timeDiff } from "@/utils/function";
import { renderMessageWithLinks } from "@/utils/linkUtils";
import MessageAttachment from "./messageAttachment";
import UserAvatar from "./userAvatar";
import { cn } from "@/lib/utils";

function MessageItem({ content, sender, isSender, createdAt, attachment, failed }) {
  const timeAgo = timeDiff(createdAt);
  const fullTime = createdAt ? new Date(createdAt).toLocaleString() : undefined;

  return (
    <div className={cn("flex items-end gap-2 mb-3", isSender ? "justify-end" : "justify-start")}>
      {/* Avatar displayed if it's "other" */}
      {!isSender && <UserAvatar name={sender} size="sm" className="mb-0.5" />}
      <div
        className={cn(
          "max-w-[80%] sm:max-w-[70%] px-3.5 py-2 text-sm shadow-sm",
          isSender
            ? cn("bg-blue-600 text-white rounded-2xl rounded-br-md", failed && "opacity-60 ring-2 ring-destructive")
            : "bg-card text-card-foreground rounded-2xl rounded-bl-md border border-border"
        )}
      >
        {!isSender && sender && (
          <div className="text-xs font-semibold text-muted-foreground mb-0.5">{sender}</div>
        )}
        {content && (
          <div className="whitespace-pre-wrap break-words leading-relaxed">
            {renderMessageWithLinks(content, isSender, {
              openInNewTab: true,
              maxUrlLength: 35,
              enableEmails: true,
              enablePhones: true
            })}
          </div>
        )}
        {attachment && (
          <MessageAttachment attachment={attachment} isSender={isSender} />
        )}
        <time
          dateTime={createdAt ? new Date(createdAt).toISOString() : undefined}
          title={fullTime}
          className={cn(
            "block text-[11px] mt-1",
            isSender ? "text-right text-blue-100/80" : "text-left text-muted-foreground"
          )}
        >
          {failed ? "Not sent" : timeAgo}
        </time>
      </div>
    </div>
  );
}

export default memo(MessageItem);
