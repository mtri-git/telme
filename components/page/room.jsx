"use client";
import axiosInstance from "@/utils/axios";
import { Input } from "@/components/ui/input"; // Input từ Shadcn UI
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { HomeIcon, Loader2 } from "lucide-react"; // Biểu tượng tải từ Lucide
import { useRouter } from "next/navigation";

const ChatRooms = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleJoin = (roomId) => {
    if (!roomId) return;

    if (chatRooms.find((room) => room._id === roomId).is_member) {
      axiosInstance.post(`/rooms/${roomId}/leave`);
    } else {
      axiosInstance.post(`/rooms/${roomId}/join`);
    }

    setChatRooms((prevRooms) =>
      prevRooms.map((room) =>
        room._id === roomId ? { ...room, is_member: !room.is_member } : room
      )
    );
  };

  const onHomeClick = () => {
    router.push("/");
  };

  // first load
  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get("/rooms", {
        params: { limit: 20, page: 1 },
      })
      .then((res) => setChatRooms(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (!debouncedSearchTerm) return;

    setLoading(true);
    axiosInstance
      .get("/rooms", {
        params: { name: debouncedSearchTerm, limit: 20, page: 1 },
      })
      .then((res) => setChatRooms(res.data.data))
      .finally(() => setLoading(false));
  }, [debouncedSearchTerm]);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Search Input */}
      <div className="mb-4 flex space-x-1">
        <Button variant="primary" onClick={onHomeClick}>
          <HomeIcon />
        </Button>
        <Input
          type="text"
          placeholder="Search chat rooms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Chat Room List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : chatRooms.length > 0 ? (
          chatRooms.map((room) => (
            <div
              key={room._id}
              className="p-4 rounded-lg border bg-white dark:bg-gray-800 flex justify-between items-center"
            >
              <div className="flex flex-col">
                <span className="font-semibold">{room.name}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {room?.users?.length} members
                </span>
              </div>
              <Button
                variant={room.is_member ? "outline" : "default"}
                onClick={() => handleJoin(room._id)}
              >
                {room.is_member ? "Joined" : "Join"}
              </Button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No chat rooms found.
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatRooms;
