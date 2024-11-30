"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import socket from "@/utils/socketClient";
import useChatStore from "@/store/chatStore";
import useAuthStore from "@/store/authStore";
import useMessage from "@/hooks/useMessage";
import ChatItem from "./chatItem";
import { v4 as uuidv4 } from "uuid";

const ChatWindow = () => {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { currentRoomId, currentRoomData } = useChatStore();
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
      const { userId, message, sender } = data;
      console.log("🚀 ~ handleReceiveMessage ~ sender:", sender)

      const currentUserId = userAuthData?.user?._id;
      if (userId === currentUserId) return;

      addNewMessage({
        _id: Date.now(),
        content: message,
        is_sender: false,
        created_at: new Date(),
        sender
      });
    };

    const handleUserTyping = (data) => {
      const { userId, sender } = data;
      const currentUserId = userAuthData?.user?._id;
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
  }, [addNewMessage, userAuthData?.user?._id]);

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
        messageListRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, [currentRoomId, loadMoreMessage, messages.length]);

  const sendMessage = () => {
    if (!input.trim()) return;

    if (!currentRoomId) {
      console.log("No room selected");
      return;
    }

    socket.emit("room_message", {
      roomId: currentRoomId,
      message: input,
      sender: userAuthData?.user,
    });

    socket.emit("stop_room_typing", { roomId: currentRoomId, sender: userAuthData?.user }); // Báo ngừng typing khi gửi tin nhắn

    addNewMessage({
      _id: Date.now(),
      content: input,
      is_sender: true,
      sender: userAuthData?.user,
      created_at: new Date(),
    });
    setInput("");
    setIsTyping(false);
  };

  const handleTyping = (e) => {
    setInput(e.target.value);

    if (!isTyping) {
      socket.emit("room_typing", { roomId: currentRoomId, sender: userAuthData?.user });
      setIsTyping(true);
    }

    // Reset lại timer mỗi khi user gõ
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      console.log("Stop typing");
      socket.emit("stop_room_typing", { roomId: currentRoomId, sender: userAuthData?.user });
      setIsTyping(false);
    }, 2000);
  };

  const getSenderNames = () => {
    return typingUsers.map((data) => {
      return data.fullname;
    }).join(", ");
  }

  return (
    <div className="flex flex-col flex-1 h-full">
      {/* Header */}
      {currentRoomData && (
        <div className="p-4 border-b bg-white dark:bg-gray-950">
          <h1 className="text-lg font-bold">
            Chat with {currentRoomData?.name}
          </h1>
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
            [...messages].slice().reverse().map((message) => (
              <ChatItem
                key={uuidv4()}
                content={message.content}
                sender={message?.sender?.fullname}
                isSender={message.is_sender}
                createdAt={message.created_at}
              />
              // <div
              //   key={message._id}
              //   className={`flex ${
              //     message.is_sender ? "justify-end" : "justify-start"
              //   }`}
              // >
              //   <div
              //     className={`px-4 py-2 rounded-lg ${
              //       message.is_sender
              //         ? "bg-blue-500 text-white"
              //         : "bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
              //     }`}
              //   >
              //     {message?.content}
              //   </div>
              // </div>
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
        <div className="p-4 border-t bg-white flex items-center space-x-2 dark:bg-gray-800">
          <Input
            type="text"
            placeholder="Type a message"
            value={input}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            onChange={handleTyping}
            className="flex-1"
          />
          <Button onClick={sendMessage}>Send</Button>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
