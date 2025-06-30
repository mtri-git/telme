"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import socket from "@/utils/socketClient";
import useChatStore from "@/store/chatStore";
import useAuthStore from "@/store/authStore";
import useMessage from "@/hooks/useMessage";
import MessageItem from "./messageItem";
import { v4 as uuidv4 } from "uuid";
import { Ellipsis, Paperclip, SendIcon, XIcon, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { UploadFile } from "./uploadFile";

const ChatWindow = () => {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { currentRoomId, currentRoomData, toggleOption, fetchRooms, setCurrentRoomId } = useChatStore();
  const typingTimeoutRef = useRef(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const { messages, addNewMessage, loadMoreMessage } = useMessage(currentRoomId);
  const messageListRef = useRef(null);
  const userAuthData = useAuthStore((state) => state.user);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleBackToSidebar = () => {
    setCurrentRoomId(null);
  };

  useEffect(() => {
    // Mỗi khi `messages` thay đổi, cuộn xuống cuối
    if (messageListRef.current) {
      setTimeout(() => {
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      }, 100);
    }
  }, [messages, typingUsers]);

  // listen event
  useEffect(() => {
    const handleReceiveMessage = (data) => {
      
      const { userId, roomId, message, sender, attachment } = data;
      fetchRooms();
      
      if (roomId !== currentRoomId) return;

      const currentUserId = userAuthData?.user?._id;
      if (userId === currentUserId) return;

      const messageData = {
        _id: Date.now(),
        content: message,
        is_sender: false,
        created_at: new Date(),
        attachment,
        sender,
      }
      addNewMessage(messageData);

    };

    const handleUserTyping = (data) => {
      const { userId, sender, roomId } = data;
      const currentUserId = userAuthData?.user?._id;
      if (roomId !== currentRoomId) return;
      if (userId === currentUserId) return;
      setTypingUsers((prev) => [...new Set([...prev, sender])]); // Thêm userId vào danh sách typing
    };

    const handleUserStopTyping = (data) => {
      const { userId } = data;
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
  }, [addNewMessage, currentRoomId, fetchRooms, userAuthData?.user?._id]);

  // listen when scroll to top
  useEffect(() => {
    const handleScroll = (e) => {
      if (e.target.scrollTop === 0 && messages.length > 0) {
        loadMoreMessage();
      }
    };

    if (messageListRef.current) {
      messageListRef.current.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (messageListRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        messageListRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, [currentRoomId, loadMoreMessage, messages.length]);

  const sendMessage = () => {
    if (!input.trim() && !file) return;

    if (!currentRoomId) {
      console.log("No room selected");
      return;
    }

    const data = {
      roomId: currentRoomId,
      message: input,
      sender: userAuthData?.user,
    };
    if (file) {
      data.file = file;
    }
    socket.emit("room_message", data);

    socket.emit("stop_room_typing", {
      roomId: currentRoomId,
      sender: userAuthData?.user,
    }); // Báo ngừng typing khi gửi tin nhắn

    const messageData = {
      _id: Date.now(),
      content: input,
      is_sender: true,
      sender: userAuthData?.user,
      created_at: new Date(),
    };

    if (file) {
      // upload file to tmp blob
      const blob = new Blob([file], { type: file.type });
      messageData.attachment = {
        fileUrl: URL.createObjectURL(blob),
        name: file.name,
        fileType: file.type,
        fileFormat: file.name.split(".").pop(),
      };
    }

    console.log("🚀 ~ sendMessage ~ messageData", messageData);

    addNewMessage(messageData);
    fetchRooms();
    setInput("");
    setFile(null);
    setIsTyping(false);
  };

  const handleTyping = (e) => {
    setInput(e.target.value);

    if (!isTyping) {
      socket.emit("room_typing", {
        roomId: currentRoomId,
        sender: userAuthData?.user,
      });
      setIsTyping(true);
    }

    // Reset lại timer mỗi khi user gõ
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      console.log("Stop typing");
      socket.emit("stop_room_typing", {
        roomId: currentRoomId,
        sender: userAuthData?.user,
      });
      setIsTyping(false);
    }, 2000);
  };

  const getSenderNames = () => {
    return typingUsers
      .map((data) => {
        return data.fullname;
      })
      .join(", ");
  };

  // file upload
  const fileInputRef = useRef(null);

  // file upload
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event?.target?.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  return (
    <div className="flex flex-col flex-1 h-full bg-background border-l border-border">
      {/* Header */}
      {currentRoomData && (
        <div className="py-3 sm:py-4 px-4 sm:px-6 border-b border-border flex items-center justify-between bg-card/50">
          {/* Mobile back button */}
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full mr-2"
              onClick={handleBackToSidebar}
            >
              <ArrowLeft size={18} />
            </Button>
          )}
          <h1 className="text-base sm:text-lg font-semibold text-foreground flex-1 truncate">
            {currentRoomData?.name}
          </h1>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={toggleOption}>
            <Ellipsis size={18} />
          </Button>
        </div>
      )}

      {!currentRoomId && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Ellipsis size={20} className="sm:w-6 sm:h-6 text-primary" />
          </div>
          <p className="text-lg sm:text-xl font-medium text-foreground mb-2 text-center">No conversation selected</p>
          <p className="text-sm text-muted-foreground text-center max-w-md px-4">
            Choose a chat from the sidebar or create a new room to start messaging
          </p>
        </div>
      )}

      {/* Message Area */}
      {currentRoomId && (
        <div
          id="message-list"
          ref={messageListRef}
          className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 sm:space-y-4 bg-background/80 dark:bg-background/30"
        >
          {messages &&
            [...messages]
              .slice()
              .reverse()
              .map((message) => (
                <MessageItem
                  key={`message-${message._id}`}
                  content={message.content}
                  sender={message?.sender?.fullname}
                  isSender={message.is_sender}
                  createdAt={message.created_at}
                  attachment={message?.attachment}
                />
              ))}
          {typingUsers.length > 0 && (
            <div className="flex items-center space-x-2 pl-2 sm:pl-4">
              <div className="flex space-x-1">
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <p className="text-sm text-muted-foreground">
                {getSenderNames()} is typing...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Input Box */}
      {currentRoomId && (
        <div className="p-3 sm:p-4 border-t border-border bg-card/50">
          {file && (
            <div className="mb-2 p-2 bg-accent/50 rounded-md flex items-center justify-between">
              <div className="flex items-center min-w-0">
                <Paperclip className="w-4 h-4 mr-2 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-foreground truncate">{file?.name}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 rounded-full hover:bg-destructive/10 flex-shrink-0 ml-2"
                onClick={() => setFile(null)}
              >
                <XIcon className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-accent flex-shrink-0"
              onClick={handleButtonClick}
            >
              <Paperclip className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            </Button>
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Type a message..."
                value={input}
                className="pr-10 bg-background border-input focus-visible:ring-1 focus-visible:ring-offset-1 py-2 sm:py-5 text-sm sm:text-base"
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                onChange={handleTyping}
              />
            </div>
            <Button 
              onClick={sendMessage}
              size="icon"
              className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90 flex-shrink-0"
              disabled={!input.trim() && !file}
            >
              <SendIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
