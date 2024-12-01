"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import useChatStore from "@/store/chatStore";
import socket from "@/utils/socketClient";
import { LogOut, Binoculars } from "lucide-react";
import { Card } from "../ui/card";
import authService from "@/services/authService";
import useAuthStore from "@/store/authStore";
import { CreateRoomDialog } from "../dialog/createRoomDialog";
import { useRouter } from "next/navigation";
import { ToolTip } from "./toolTip";

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
  const { logout } = useAuthStore();

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

  return (
    <aside className="flex flex-col w-64 bg-gray-100 border-r h-full p-4 dark:bg-gray-950">
      <h2 className="text-lg font-bold mb-4">
        <span>Chats</span>

        <ToolTip content="Explore room">
          <Button
            variant="primary"
            className="float-right"
            onClick={() => router.push("/room")}
          >
            <Binoculars size={24} />
          </Button>
        </ToolTip>
        
        <CreateRoomDialog />
      </h2>
      <ul className="space-y-2">
        {loading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}
        {rooms &&
          rooms?.map((room) => (
            <li key={room._id} onClick={() => onClickRoomItem(room._id)}>
              <Card className="bg-white dark:bg-gray-800">
                <Button variant="ghost" className="w-full justify-start">
                  {room.name}
                </Button>
              </Card>
            </li>
          ))}
      </ul>
      {/* Logout bytton */}
      <Button
        variant="destructive"
        className="w-full mt-auto"
        onClick={onClickLogout}
      >
        Logout
        <LogOut size={24} className="float-right" />
      </Button>
    </aside>
  );
};

export default Sidebar;
