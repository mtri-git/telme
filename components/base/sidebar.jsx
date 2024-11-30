import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import useChatStore from "@/store/chatStore";
import socket from "@/utils/socketClient";
import { Plus, LogOut } from "lucide-react";
import { Card } from "../ui/card";
import authService from "@/services/authService";
import useAuthStore from "@/store/authStore";

const Sidebar = () => {

  const { rooms, fetchRooms, loading, error, setCurrentRoomId, setCurrentRoomData } = useChatStore();
  const { logout } = useAuthStore();

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    if(!rooms)
      return;
    console.log(rooms)
    for (let room of rooms) {
      socket.emit("join_room", {
        roomId: room._id,
      });
    }

  }, [rooms])

  const onClickLogout = () => {
    console.log("Logout");
    logout();
    authService.logout();
  }

  const onClickRoomItem = (roomId) => {
    setCurrentRoomId(roomId);
    setCurrentRoomData(rooms.find(room => room._id === roomId));
  }

  return (
    <aside className="flex flex-col w-64 bg-gray-100 border-r h-full p-4 dark:bg-gray-950">
      <h2 className="text-lg font-bold mb-4">
        <span>Chats</span>
        <Button variant="primary" className="float-right">
          <Plus size={24} />
        </Button>
        </h2>
      <ul className="space-y-2">
        {
          loading && <p>Loading...</p>
        }
        {
          error && <p>Error: {error}</p>
        }
        {rooms && rooms?.map((room) => (
          <li className="p-1" key={room._id} onClick={ () => onClickRoomItem(room._id)}>
            <Card>
            <Button variant="ghost" className="w-full justify-start">
              {room.name}
            </Button>
            </Card>
          </li>
        ))}
      </ul>
      {/* Logout bytton */}
      <Button variant="destructive" className="w-full mt-auto" onClick={onClickLogout}>
        Logout
        <LogOut size={24} className="float-right" />
      </Button>
    </aside>
  );
};

export default Sidebar;
