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
import { Ellipsis, Paperclip, SendIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { UploadFile } from "./uploadFile";

const ChatWindow = () => {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { currentRoomId, currentRoomData, toggleOption, fetchRooms } =
    useChatStore();
  const typingTimeoutRef = useRef(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const { messages, addNewMessage, loadMoreMessage } =
    useMessage(currentRoomId);
  const messageListRef = useRef(null);
  const userAuthData = useAuthStore((state) => state.user);

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
      fetchRooms();
      const { userId, roomId, message, sender, attachment } = data;
      console.log("🚀 ~ handleReceiveMessage ~ sender:", sender);

      if (roomId !== currentRoomId) return;

      const currentUserId = userAuthData?.user?._id;
      if (userId === currentUserId) return;

      addNewMessage({
        _id: Date.now(),
        content: message,
        is_sender: false,
        created_at: new Date(),
        attachment,
        sender,
      });
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
  }, [addNewMessage, currentRoomId, userAuthData?.user?._id]);

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
    <div className="flex flex-col flex-1 h-full bg-white dark:bg-gray-950">
      {/* Header */}
      {currentRoomData && (
        <div className="flex gap-2 p-4 border-">
          <h1 className="text-lg font-bold">
            Chat with {currentRoomData?.name}
          </h1>
          <Button variant="primary" onClick={toggleOption}>
            <Ellipsis />
          </Button>
        </div>
      )}

      {!currentRoomId && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-lg font-bold">Select a room to start chatting</p>
        </div>
      )}

      {/* Message Area */}
      {currentRoomId && (
        <div
          id="message-list"
          ref={messageListRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900"
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
            <p className="text-sm italic text-gray-500">
              {getSenderNames()} is typing...
            </p>
          )}
        </div>
      )}

      {/* Input Box */}
      {currentRoomId && (
        <div className="p-4 border-t flex items-center space-x-2 bg-white dark:bg-gray-700">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Type a message"
              value={input}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              onChange={handleTyping}
            />
            {/* Upload file */}
            <div className="flex items-start">
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <Paperclip
                className="w-5 h-5 mr-2 cursor-pointer"
                onClick={handleButtonClick}
              />
              {file && (
                <div className="flex text-sm text-gray-500 dark:text-gray-400">
                  <span>{file?.name}</span>
                  <button
                    className="text-blue-500 dark:text-blue-400"
                    onClick={() => setFile(null)}
                  >
                    <XIcon />
                  </button>
                </div>
              )}
            </div>
            {/* end upload file */}
          </div>
          <Button onClick={sendMessage}>
            <SendIcon />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
