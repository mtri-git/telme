"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import useChatStore from "@/store/chatStore";
import socket from "@/utils/socketClient";
import { LogOut, Binoculars, Badge } from "lucide-react";
import { Card } from "../ui/card";
import authService from "@/services/authService";
import useAuthStore from "@/store/authStore";
import { CreateRoomDialog } from "../dialog/createRoomDialog";
import { useRouter } from "next/navigation";
import { ToolTip } from "./toolTip";
import { getHelloString, showContent, timeDiff } from "@/utils/function";
import { JoinMeetingDialog } from "../dialog/joinMeetingDialog";

const Sidebar = () => {
  const router = useRouter();
  const {
    rooms,
    fetchRooms,
    loading,
    error,
    setCurrentRoomId,
    setCurrentRoomData,
  } = useChatStore();
  const { logout, user } = useAuthStore();

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    if (!rooms) return;
    console.log(rooms);
    for (let room of rooms) {
      socket.emit("join_room", {
        roomId: room._id,
      });
    }
  }, [rooms]);

  const onClickLogout = () => {
    console.log("Logout");
    logout();
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
  return (
    <aside className="flex flex-col w-full sm:w-72 bg-card border-r border-border h-full dark:bg-card min-w-0 max-w-none sm:max-w-none">
      <div className="p-4 sm:p-5 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-xl font-bold text-foreground">Chats</h2>
          <div className="flex space-x-1">
            <ToolTip content="Explore room">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-accent"
                onClick={() => router.push("/room")}
              >
                <Binoculars size={18} className="text-foreground" />
              </Button>
            </ToolTip>
            <CreateRoomDialog />
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            variant="default" 
            className="w-full bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800 transition-colors text-base sm:text-base"
            onClick={onClickStartAMeeting}
          >
            <span className="hidden sm:inline">Start a meeting</span>
            <span className="sm:hidden">Start meeting</span>
          </Button>
          <JoinMeetingDialog />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        <ul className="space-y-2">
          {error && <p className="text-destructive text-sm p-2">Error: {error}</p>}
          {rooms && rooms.length === 0 && (
            <div className="text-center py-8 sm:py-8">
              <p className="text-muted-foreground text-base sm:text-base">No chats yet</p>
              <p className="text-sm sm:text-sm text-muted-foreground mt-1">Create a room to start chatting</p>
            </div>
          )}
          {rooms &&
            rooms?.map((room) => (
              <li key={room._id}>
                <Card className="hover:bg-accent/50 transition-colors relative overflow-hidden border-border">
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-3 sm:p-3 h-auto"
                    onClick={() => onClickRoomItem(room._id)}
                  >
                    <div className="flex flex-col items-start w-full">
                      <div className="flex items-center w-full">
                        <span className="font-medium text-foreground truncate text-base sm:text-base">{room.name}</span>
                        {room.is_new && (
                          <span className="h-2 w-2 rounded-full bg-blue-500 ml-1.5 flex-shrink-0"></span>
                        )}
                      </div>

                      {room.last_message && (
                        <div className="w-full mt-1.5">
                          <div className="flex items-center">
                            <span className="text-xs font-medium text-muted-foreground truncate">
                              {room.last_message?.sender?.fullname}:
                            </span>
                            {room?.last_message?.attachment && (
                              <span className="text-xs text-muted-foreground ml-1">
                                [{room?.last_message?.attachment?.fileType}]
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-[180px]">
                              {showContent(room?.last_message?.content)}
                            </span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-1">
                              {timeDiff(room?.last_message?.created_at)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </Button>
                </Card>
              </li>
            ))}
        </ul>
      </div>

      <div className="border-t border-border p-4 sm:p-4">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <div className="font-medium text-foreground text-base sm:text-base truncate">{user?.user?.fullname}</div>
              <div className="text-sm text-muted-foreground truncate">{getHelloString()}</div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-destructive/10 flex-shrink-0 ml-2"
              onClick={onClickLogout}
            >
              <LogOut size={18} className="text-destructive" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
