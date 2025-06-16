import React from "react";
import { File, Download } from "lucide-react";

export default function MessageAttachment({ attachment, isSender }) {
  if (!attachment || !attachment?.fileUrl) return null;

  // For image attachments
  if (
    attachment?.fileType?.includes("image") ||
    attachment?.fileType === "image"
  ) {
    return (
      <div className="mt-2 rounded-lg overflow-hidden border border-border">
        <img
          src={attachment?.fileUrl}
          alt="Image attachment"
          className="w-full max-h-60 object-cover"
          loading="lazy"
        />
        {attachment?.name && (
          <div className={`text-xs p-2 ${isSender ? "bg-primary/90" : "bg-muted/90"}`}>
            {attachment.name}
          </div>
        )}
      </div>
    );
  }

  // For video attachments
  if (attachment?.fileType?.includes("video")) {
    return (
      <div className="mt-2 rounded-lg overflow-hidden border border-border">
        <video
          src={attachment?.fileUrl}
          controls
          className="w-full max-h-60 object-cover"
        />
        {attachment?.name && (
          <div className={`text-xs p-2 ${isSender ? "bg-primary/90" : "bg-muted/90"}`}>
            {attachment.name}
          </div>
        )}
      </div>
    );
  }

  // For other file types
  return (
    <div className="mt-2">
      <a
        href={attachment?.fileUrl}
        target="_blank"
        rel="noreferrer"
        className={`flex items-center gap-2 p-3 rounded-lg ${
          isSender
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-muted text-muted-foreground hover:bg-muted/90"
        } transition-colors`}
      >
        <File size={18} />
        <div className="flex-1 truncate">{attachment?.name}</div>
        <Download size={16} />
      </a>
    </div>
  );
}
