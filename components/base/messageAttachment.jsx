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
      <div className="mt-1 rounded-lg overflow-hidden border border-border/50">
        <img
          src={attachment?.fileUrl}
          alt="Image attachment"
          className="w-full max-h-72 object-cover bg-muted"
          loading="lazy"
          decoding="async"
        />
        {attachment?.name && (
          <div className={`text-xs px-2 py-1.5 truncate ${isSender ? "bg-black/20" : "bg-muted"}`}>
            {attachment.name}
          </div>
        )}
      </div>
    );
  }

  // For video attachments
  if (attachment?.fileType?.includes("video")) {
    return (
      <div className="mt-1 rounded-lg overflow-hidden border border-border/50">
        <video
          src={attachment?.fileUrl}
          controls
          preload="metadata"
          className="w-full max-h-72 bg-black"
        />
        {attachment?.name && (
          <div className={`text-xs px-2 py-1.5 truncate ${isSender ? "bg-black/20" : "bg-muted"}`}>
            {attachment.name}
          </div>
        )}
      </div>
    );
  }

  // For other file types
  return (
    <div className="mt-1">
      <a
        href={attachment?.fileUrl}
        target="_blank"
        rel="noreferrer"
        className={`flex items-center gap-2 p-3 rounded-lg ${
          isSender
            ? "bg-white/15 text-white hover:bg-white/25"
            : "bg-muted text-foreground hover:bg-accent"
        } transition-colors`}
      >
        <File size={18} className="flex-shrink-0" />
        <div className="flex-1 min-w-0 truncate">{attachment?.name}</div>
        <Download size={16} className="flex-shrink-0" />
      </a>
    </div>
  );
}
