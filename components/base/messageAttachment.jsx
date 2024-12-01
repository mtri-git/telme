import React from "react";

export default function MessageAttachment({attachment, isSender}) {
  console.log("🚀 ~ MessageItem ~ attachment:", attachment?.fileType)

  if (!attachment) return null;
  if (
    attachment?.fileType?.includes("image") ||
    attachment?.fileType === "image"
  ) {
    console.log("🚀 ~ MessageAttachment ~ attachment:", attachment);

    return (
      <div className="mt-2">
        <img
          src={attachment?.fileUrl}
          alt="Attachment"
          className="h-32 object-cover rounded-md"
        />
      </div>
    );
  }

  if (attachment?.fileType?.includes("video")) {
    return (
      <div className="mt-2">
        <video
          src={attachment?.fileUrl}
          controls
          className="w-32 h-32 object-cover rounded-md"
        />
      </div>
    );
  }

  return (
    <div className="mt-2">
      <a
        href={attachment?.fileUrl}
        target="_blank"
        rel="noreferrer"
        className={
          isSender
            ? "text-blue-500 dark:text-blue-400"
            : "text-blue-500 dark:text-blue-400"
        }
      >
        Download
      </a>
    </div>
  );
}
