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
  }, [debouncedSearchTerm]);  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Explore Rooms</h1>
          <Button 
            variant="ghost" 
            onClick={onHomeClick}
            className="flex items-center gap-2 hover:bg-muted transition-colors"
          >
            <HomeIcon size={18} />
            <span>Back to Home</span>
          </Button>
        </div>

        {/* Search Input */}
        <div className="mb-8">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search chat rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-muted border-border text-foreground w-full pl-4 pr-10 py-3 rounded-lg focus-visible:ring-ring"
            />
            {loading && (              <div className="absolute right-3 top-3">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Chat Room List */}
        <div className="space-y-4">
          {loading && chatRooms.length === 0 ? (            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-10 h-10 animate-spin text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Loading rooms...</p>
            </div>
          ) : chatRooms.length > 0 ? (
            chatRooms.map((room) => (
              <div
                key={room._id}
                className="p-5 rounded-xl border border-border bg-card hover:bg-muted transition-colors flex justify-between items-center"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-lg mb-1">{room.name}</span>
                  <span className="text-sm text-muted-foreground flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {room?.users?.length} members
                  </span>
                </div>
                <Button                  className={`px-6 py-2 rounded-full ${
                    room.is_member 
                      ? "bg-muted text-muted-foreground hover:bg-secondary" 
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  } transition-colors`}
                  onClick={() => handleJoin(room._id)}
                >
                  {room.is_member ? "Joined" : "Join"}
                </Button>
              </div>
            ))
          ) : (            <div className="flex flex-col items-center justify-center bg-card rounded-xl p-12 border border-border">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-muted mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-muted-foreground text-lg font-medium mb-1">No rooms found</p>
              <p className="text-muted-foreground/70 text-center">Try a different search term or create a new room</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatRooms;
