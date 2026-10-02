"use client";
import axiosInstance from "@/utils/axios";
import { Input } from "@/components/ui/input"; // Input từ Shadcn UI
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { HomeIcon, Loader2 } from "lucide-react"; // Biểu tượng tải từ Lucide
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/base/themeToggle";
import useChatStore from "@/store/chatStore";
import toast from "react-hot-toast";

const ChatRooms = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pendingRoomId, setPendingRoomId] = useState(null);
  const fetchRooms = useChatStore((state) => state.fetchRooms);

  const handleJoin = async (roomId) => {
    if (!roomId || pendingRoomId) return;

    const room = chatRooms.find((r) => r._id === roomId);
    const wasMember = room?.is_member;
    const toggle = (isMember) =>
      setChatRooms((prevRooms) =>
        prevRooms.map((r) => (r._id === roomId ? { ...r, is_member: isMember } : r))
      );

    // Optimistic update, rolled back if the request fails
    toggle(!wasMember);
    setPendingRoomId(roomId);
    try {
      await axiosInstance.post(`/rooms/${roomId}/${wasMember ? "leave" : "join"}`);
      fetchRooms();
    } catch (error) {
      toggle(wasMember);
      toast.error(error?.response?.data?.message || "Something went wrong, please try again");
    } finally {
      setPendingRoomId(null);
    }
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

  const isFirstSearch = useRef(true);
  useEffect(() => {
    // The initial list is loaded above; after that, an empty term reloads all rooms
    if (isFirstSearch.current) {
      isFirstSearch.current = false;
      return;
    }

    setLoading(true);
    axiosInstance
      .get("/rooms", {
        params: { name: debouncedSearchTerm || undefined, limit: 20, page: 1 },
      })
      .then((res) => setChatRooms(res.data.data))
      .finally(() => setLoading(false));
  }, [debouncedSearchTerm]);  return (
    <div className="min-h-dvh bg-background text-foreground p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold">Explore Rooms</h1>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button
              variant="ghost"
              onClick={onHomeClick}
              className="flex items-center gap-2 hover:bg-muted transition-colors text-sm sm:text-base"
            >
              <HomeIcon size={18} />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Home</span>
            </Button>
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-6 sm:mb-8">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search chat rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-muted border-border text-foreground w-full pl-4 pr-10 py-3 rounded-lg focus-visible:ring-ring text-sm sm:text-base"
            />
            {loading && (
              <div className="absolute right-3 top-3">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Chat Room List */}
        <div className="space-y-3 sm:space-y-4">
          {loading && chatRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-10 h-10 animate-spin text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Loading rooms...</p>
            </div>
          ) : chatRooms.length > 0 ? (
            chatRooms.map((room) => (
              <div
                key={room._id}
                className="p-4 sm:p-5 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
              >
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-semibold text-base sm:text-lg mb-1 truncate">{room.name}</span>
                  <span className="text-sm text-muted-foreground flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {room?.users?.length} members
                  </span>
                </div>
                <Button
                  variant={room.is_member ? "outline" : "default"}
                  className="px-4 sm:px-6 rounded-full w-full sm:w-auto flex-shrink-0"
                  onClick={() => handleJoin(room._id)}
                  disabled={pendingRoomId === room._id}
                >
                  {room.is_member ? "Joined" : "Join"}
                </Button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center bg-card rounded-xl p-8 sm:p-12 border border-border">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-muted-foreground text-base sm:text-lg font-medium mb-1">No rooms found</p>
              <p className="text-muted-foreground/70 text-center text-sm sm:text-base">Try a different search term or create a new room</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatRooms;
