"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useLayoutEffect, useState, useRef } from "react";
import socket from "@/utils/socketClient";
import useChatStore from "@/store/chatStore";
import useAuthStore from "@/store/authStore";
import useMessage from "@/hooks/useMessage";
import MessageItem from "./messageItem";
import { Ellipsis, Paperclip, SendIcon, XIcon, ArrowLeft, MessagesSquare } from "lucide-react";
import UserAvatar from "./userAvatar";
import toast from "react-hot-toast";

// Distance (px) from the bottom within which new messages auto-scroll into view
const STICK_TO_BOTTOM_THRESHOLD = 120;
// Must match MAX_UPLOAD_MB on the API
const MAX_UPLOAD_MB = 10;

const ChatWindow = () => {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { currentRoomId, currentRoomData, toggleOption, fetchRooms, setCurrentRoomId, applyIncomingMessage } = useChatStore();
  const typingTimeoutRef = useRef(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const { messages, loading, hasMore, addNewMessage, updateMessage, loadMoreMessage } = useMessage(currentRoomId);
  const messageListRef = useRef(null);
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = currentUser?._id;
  const isNearBottomRef = useRef(true);
  const heightBeforeLoadMoreRef = useRef(null);
  const newestMessageIdRef = useRef(null);

  const handleBackToSidebar = () => {
    setCurrentRoomId(null);
  };

  // Reset scroll anchoring when switching rooms
  useEffect(() => {
    isNearBottomRef.current = true;
    heightBeforeLoadMoreRef.current = null;
    newestMessageIdRef.current = null;
    setTypingUsers([]);
  }, [currentRoomId]);

  // Keep the scroll position stable: stay anchored when older messages are loaded,
  // and only follow new messages if the user is already near the bottom (or sent it)
  useLayoutEffect(() => {
    const el = messageListRef.current;
    if (!el) return;

    const newest = messages?.[0];
    const hasNewMessage = !!newest && newest._id !== newestMessageIdRef.current;
    newestMessageIdRef.current = newest?._id ?? null;

    if (heightBeforeLoadMoreRef.current !== null && !hasNewMessage) {
      el.scrollTop = el.scrollHeight - heightBeforeLoadMoreRef.current;
      heightBeforeLoadMoreRef.current = null;
      return;
    }

    if (isNearBottomRef.current || (hasNewMessage && newest.is_sender)) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, typingUsers]);

  // A load-more that returned nothing (or failed) must not leave a stale anchor behind
  useEffect(() => {
    if (!loading) heightBeforeLoadMoreRef.current = null;
  }, [loading]);

  // Images/videos finish loading after layout; keep the view pinned to the bottom when they do
  const handleMediaLoad = () => {
    const el = messageListRef.current;
    if (el && isNearBottomRef.current) el.scrollTop = el.scrollHeight;
  };

  // listen event
  useEffect(() => {
    const handleReceiveMessage = (data) => {
      const { userId, roomId, message, sender, attachment, messageId, created_at } = data || {};
      const isOwnMessage = userId === currentUserId;
      const createdAt = created_at || new Date();

      // Update the sidebar preview locally instead of refetching every room on every message
      const known = applyIncomingMessage({
        roomId,
        lastMessage: { _id: messageId, content: message, attachment, sender, created_at: createdAt },
        markUnread: !isOwnMessage && roomId !== currentRoomId,
      });
      if (!known) fetchRooms();

      // Own messages are already shown optimistically
      if (roomId !== currentRoomId || isOwnMessage) return;

      addNewMessage({
        _id: messageId || `remote-${Date.now()}`,
        content: message,
        is_sender: false,
        created_at: createdAt,
        attachment,
        sender,
      });
    };

    const handleUserTyping = (data) => {
      const { userId, sender, roomId } = data || {};
      if (roomId !== currentRoomId || userId === currentUserId || !sender) return;
      setTypingUsers((prev) =>
        prev.some((user) => user._id === sender._id) ? prev : [...prev, sender]
      );
    };

    const handleUserStopTyping = (data) => {
      const { userId } = data || {};
      setTypingUsers((prev) => prev.filter((user) => user._id !== userId)); // Xóa userId khỏi danh sách typing
    };

    socket.on("receive_room_message", handleReceiveMessage);
    socket.on("user_room_typing", handleUserTyping);
    socket.on("user_stop_room_typing", handleUserStopTyping);

    return () => {
      socket.off("receive_room_message", handleReceiveMessage);
      socket.off("user_room_typing", handleUserTyping);
      socket.off("user_stop_room_typing", handleUserStopTyping);
    };
  }, [addNewMessage, applyIncomingMessage, currentRoomId, currentUserId, fetchRooms]);

  const handleScroll = (e) => {
    const el = e.currentTarget;
    isNearBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < STICK_TO_BOTTOM_THRESHOLD;

    if (el.scrollTop === 0 && messages.length > 0 && hasMore && !loading) {
      heightBeforeLoadMoreRef.current = el.scrollHeight;
      loadMoreMessage();
    }
  };

  const stopTyping = () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (isTyping) {
      socket.emit("stop_room_typing", { roomId: currentRoomId }); // Báo ngừng typing
      setIsTyping(false);
    }
  };

  const sendMessage = () => {
    if (!input.trim() && !file) return;
    if (!currentRoomId) return;

    const tempId = `local-${Date.now()}`;
    const data = {
      roomId: currentRoomId,
      message: input,
    };
    if (file) {
      data.file = file;
      data.fileName = file.name;
      data.fileType = file.type;
    }

    // Uploads can take a while; plain text should be acknowledged quickly
    socket.timeout(file ? 120000 : 15000).emit("room_message", data, (err, response) => {
      if (err || !response?.ok) {
        updateMessage(tempId, { failed: true });
        toast.error(response?.error || "Message could not be sent. Check your connection.");
        return;
      }
      updateMessage(tempId, {
        _id: response.messageId,
        ...(response.attachment && { attachment: response.attachment }),
      });
    });

    stopTyping();

    const messageData = {
      _id: tempId,
      clientId: tempId,
      content: input,
      is_sender: true,
      sender: currentUser,
      created_at: new Date(),
    };

    if (file) {
      // Show a local preview until the upload finishes
      messageData.attachment = {
        fileUrl: URL.createObjectURL(file),
        name: file.name,
        fileType: file.type,
        fileFormat: file.name.split(".").pop(),
      };
    }

    addNewMessage(messageData);
    applyIncomingMessage({
      roomId: currentRoomId,
      lastMessage: messageData,
      markUnread: false,
    });
    setInput("");
    setFile(null);
  };

  const handleTyping = (e) => {
    setInput(e.target.value);

    if (!isTyping) {
      socket.emit("room_typing", { roomId: currentRoomId });
      setIsTyping(true);
    }

    // Reset lại timer mỗi khi user gõ
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_room_typing", { roomId: currentRoomId });
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyDown = (e) => {
    // Ignore Enter while an IME (e.g. Vietnamese/Japanese input) is still composing
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getTypingText = () => {
    const names = typingUsers.map((data) => data?.fullname);
    if (names.length === 1) return `${names[0]} is typing…`;
    if (names.length === 2) return `${names[0]} and ${names[1]} are typing…`;
    return `${names.length} people are typing…`;
  };

  // file upload
  const fileInputRef = useRef(null);

  // file upload
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event?.target?.files?.[0];
    if (selectedFile && selectedFile.size > MAX_UPLOAD_MB * 1024 * 1024) {
      toast.error(`File is too large (max ${MAX_UPLOAD_MB} MB)`);
    } else if (selectedFile) {
      setFile(selectedFile);
    }
    // Allow picking the same file again after removing it
    event.target.value = "";
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const memberCount = currentRoomData?.users?.length;

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full bg-background">
      {/* Header */}
      {currentRoomData && (
        <header className="flex-shrink-0 min-h-16 px-2 sm:px-4 py-2 border-b border-border flex items-center gap-2 sm:gap-3 bg-card safe-area-top">
          {/* Mobile back button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full md:hidden"
            onClick={handleBackToSidebar}
            aria-label="Back to chats"
          >
            <ArrowLeft />
          </Button>
          <UserAvatar name={currentRoomData?.name} />
          <div className="min-w-0 flex-1">
            <h1 className="text-sm sm:text-base font-semibold text-foreground truncate">
              {currentRoomData?.name}
            </h1>
            {memberCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {memberCount} {memberCount === 1 ? "member" : "members"}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={toggleOption}
            aria-label="Room info"
          >
            <Ellipsis />
          </Button>
        </header>
      )}

      {!currentRoomId && (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <MessagesSquare className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold text-foreground mb-1 text-center">No conversation selected</p>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Choose a chat from the sidebar or create a new room to start messaging
          </p>
        </div>
      )}

      {/* Message Area */}
      {currentRoomId && (
        <div
          id="message-list"
          ref={messageListRef}
          onScroll={handleScroll}
          onLoadCapture={handleMediaLoad}
          role="log"
          aria-live="polite"
          className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 scrollbar-thin bg-muted/30"
        >
          {messages &&
            [...messages]
              .reverse()
              .map((message) => (
                <MessageItem
                  key={`message-${message.clientId ?? message._id}`}
                  content={message.content}
                  sender={message?.sender?.fullname}
                  isSender={message.is_sender}
                  createdAt={message.created_at}
                  attachment={message?.attachment}
                  failed={message.failed}
                />
              ))}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 pl-9 sm:pl-10 pt-1">
              <div className="flex items-center gap-1 rounded-full bg-card border border-border px-3 py-2">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <p className="text-xs text-muted-foreground">{getTypingText()}</p>
            </div>
          )}
        </div>
      )}

      {/* Input Box */}
      {currentRoomId && (
        <div className="flex-shrink-0 px-3 py-3 sm:px-4 border-t border-border bg-card safe-area-bottom">
          {file && (
            <div className="mb-2 px-3 py-2 bg-muted rounded-lg flex items-center justify-between">
              <div className="flex items-center min-w-0">
                <Paperclip className="w-4 h-4 mr-2 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-foreground truncate">{file?.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full flex-shrink-0 ml-2"
                onClick={() => setFile(null)}
                aria-label="Remove attachment"
              >
                <XIcon className="text-muted-foreground" />
              </Button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full flex-shrink-0 text-muted-foreground"
              onClick={handleButtonClick}
              aria-label="Attach file"
            >
              <Paperclip className="!size-5" />
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <Input
              type="text"
              placeholder="Type a message..."
              aria-label="Message"
              value={input}
              enterKeyHint="send"
              className="flex-1 h-10 rounded-full bg-muted border-transparent px-4 hover:border-transparent focus-visible:ring-1 focus-visible:ring-offset-0"
              onKeyDown={handleKeyDown}
              onChange={handleTyping}
            />
            <Button
              onClick={sendMessage}
              size="icon"
              className="h-10 w-10 rounded-full flex-shrink-0"
              disabled={!input.trim() && !file}
              aria-label="Send message"
            >
              <SendIcon />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
