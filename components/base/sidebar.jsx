"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import useChatStore from "@/store/chatStore";
import { LogOut, Binoculars, Video, MessageSquarePlus, Paperclip } from "lucide-react";
import authService from "@/services/authService";
import useAuthStore from "@/store/authStore";
import { CreateRoomDialog } from "../dialog/createRoomDialog";
import { useRouter } from "next/navigation";
import { ToolTip } from "./toolTip";
import { getHelloString, showContent, timeDiff } from "@/utils/function";
import { JoinMeetingDialog } from "../dialog/joinMeetingDialog";
import ThemeToggle from "./themeToggle";
import UserAvatar from "./userAvatar";
import { cn } from "@/lib/utils";

const RoomSkeleton = () => (
  <li className="flex items-center gap-3 rounded-lg p-3">
    <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 w-2/3 rounded bg-muted animate-pulse" />
      <div className="h-3 w-full rounded bg-muted animate-pulse" />
    </div>
  </li>
);

const Sidebar = () => {
  const router = useRouter();
  const {
    rooms,
    fetchRooms,
    loading,
    error,
    currentRoomId,
    setCurrentRoomId,
    setCurrentRoomData,
    reset,
  } = useChatStore();
  const { logout, user } = useAuthStore();

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const onClickLogout = () => {
    logout();
    reset();
    authService.logout();
  };

  const onClickRoomItem = (roomId) => {
    setCurrentRoomId(roomId);
    setCurrentRoomData(rooms.find((room) => room._id === roomId));
  };

  const onClickStartAMeeting = () => {
    //open new window
    const randomCode = Math.random().toString(36).substring(7);
    window.open("/we-meet?code="+randomCode, "_blank");
  }

  const isFirstLoad = loading && (!rooms || rooms.length === 0);

  return (
    <aside className="flex flex-col w-full md:w-80 bg-card border-r border-border h-full min-w-0 safe-area-top">
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Chats</h2>
          <div className="flex items-center gap-1">
            <ToolTip content="Explore rooms">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => router.push("/room")}
                aria-label="Explore rooms"
              >
                <Binoculars />
              </Button>
            </ToolTip>
            <CreateRoomDialog />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800"
            onClick={onClickStartAMeeting}
          >
            <Video />
            New meeting
          </Button>
          <JoinMeetingDialog />
        </div>
      </div>

      <nav aria-label="Chat rooms" className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        <ul className="space-y-0.5">
          {error && <p className="text-destructive text-sm p-2">Error: {error}</p>}
          {isFirstLoad && Array.from({ length: 6 }).map((_, i) => <RoomSkeleton key={i} />)}
          {!isFirstLoad && rooms && rooms.length === 0 && (
            <li className="flex flex-col items-center text-center py-12 px-4">
              <MessageSquarePlus className="h-10 w-10 text-muted-foreground/60 mb-3" />
              <p className="text-foreground font-medium">No chats yet</p>
              <p className="text-sm text-muted-foreground mt-1">Create a room to start chatting</p>
            </li>
          )}
          {rooms?.map((room) => {
            const isActive = room._id === currentRoomId;
            const lastMessage = room.last_message;
            return (
              <li key={room._id}>
                <button
                  type="button"
                  onClick={() => onClickRoomItem(room._id)}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg p-3 text-left transition-colors touch-feedback",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive ? "bg-accent" : "hover:bg-accent/60"
                  )}
                >
                  <UserAvatar name={room.name} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "truncate text-sm text-foreground",
                          room.is_new ? "font-semibold" : "font-medium"
                        )}
                      >
                        {room.name}
                      </span>
                      {lastMessage && (
                        <span className="ml-auto flex-shrink-0 text-[11px] text-muted-foreground">
                          {timeDiff(lastMessage.created_at)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={cn(
                          "truncate text-xs",
                          room.is_new ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {lastMessage ? (
                          <>
                            <span className="font-medium">{lastMessage.sender?.fullname}: </span>
                            {lastMessage.attachment && (
                              <Paperclip className="inline h-3 w-3 mr-0.5 -mt-0.5" />
                            )}
                            {showContent(lastMessage.content) ||
                              (lastMessage.attachment ? lastMessage.attachment.fileType : "")}
                          </>
                        ) : (
                          "No messages yet"
                        )}
                      </span>
                      {room.is_new && (
                        <span
                          className="ml-auto h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"
                          aria-label="Unread"
                        />
                      )}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-3 safe-area-bottom">
        <div className="flex items-center gap-3">
          <UserAvatar name={user?.fullname} />
          <div className="min-w-0 flex-1">
            <div className="font-medium text-foreground text-sm truncate">{user?.fullname}</div>
            <div className="text-xs text-muted-foreground truncate">{getHelloString()}</div>
          </div>
          <ThemeToggle />
          <ToolTip content="Log out">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onClickLogout}
              aria-label="Log out"
            >
              <LogOut />
            </Button>
          </ToolTip>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
