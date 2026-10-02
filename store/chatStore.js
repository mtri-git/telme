import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "@/utils/axios";
import socket from "@/utils/socketClient";

const initialState = {
  currentRoomId: null,
  currentRoomData: null,
  isOpenOption: false,
  rooms: [],
  loading: false,
  error: null,
};

const chatStore = (set, get) => ({
  ...initialState,

  setCurrentRoomId: (roomId) =>
    set((state) => ({
      currentRoomId: roomId,
      // Opening a room marks it as read
      rooms: state.rooms.map((room) =>
        room._id === roomId && room.is_new ? { ...room, is_new: false } : room
      ),
    })),

  toggleOption: () => set((state) => ({ isOpenOption: !state.isOpenOption })),

  setCurrentRoomData: (roomData) => set({ currentRoomData: roomData }),

  setRooms: (rooms) => set({ rooms: rooms }),

  addRoom: (room) => set((state) => ({ rooms: [room, ...state.rooms] })),

  reset: () => set(initialState),

  fetchRooms: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get("/rooms/for-user");
      const rooms = response.data?.data || [];
      const previous = get().rooms;
      const { currentRoomId } = get();

      set({
        // Keep local unread markers across refetches
        rooms: rooms.map((room) => ({
          ...room,
          is_new: previous.find((r) => r._id === room._id)?.is_new || false,
        })),
        // Keep the open room's data (members, name) fresh
        currentRoomData: rooms.find((room) => room._id === currentRoomId) || get().currentRoomData,
      });
    } catch (error) {
      set({ error: error?.response?.data?.message || error.message || "Error fetching rooms" });
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Update a room's preview from a socket message without refetching the whole list.
   * Returns false when the room isn't known locally (caller may refetch).
   */
  applyIncomingMessage: ({ roomId, lastMessage, markUnread }) => {
    const { rooms } = get();
    const room = rooms.find((r) => r._id === roomId);
    if (!room) return false;

    const updated = {
      ...room,
      last_message: lastMessage,
      is_new: markUnread ? true : room.is_new,
    };
    set({ rooms: [updated, ...rooms.filter((r) => r._id !== roomId)] });
    return true;
  },

  createRoom: async (roomData) => {
    try {
      const response = await axios.post("/rooms", roomData);
      const room = response.data?.data;
      set((state) => ({ rooms: [room, ...state.rooms] }));
      return room;
    } catch (error) {
      throw new Error(error?.response?.data?.message || "Error creating room");
    }
  },

  leaveRoom: async (roomId) => {
    await axios.post(`/rooms/${roomId}/leave`);
    // Stop receiving this room's live events
    socket.emit("leave_room", { roomId });
    set((state) => ({
      rooms: state.rooms.filter((room) => room._id !== roomId),
      ...(state.currentRoomId === roomId && {
        currentRoomId: null,
        currentRoomData: null,
        isOpenOption: false,
      }),
    }));
  },

  addUserToRoom: async (roomId, email) => {
    const response = await axios.post(`/rooms/${roomId}/users`, { email });
    const room = response.data?.data;
    set((state) => ({
      rooms: state.rooms.map((r) => (r._id === roomId ? { ...r, users: room.users } : r)),
      ...(state.currentRoomId === roomId && {
        currentRoomData: { ...state.currentRoomData, users: room.users },
      }),
    }));
    return room;
  },

  deleteRoom: async (roomId) => {
    set({ error: null });
    try {
      await axios.delete(`/rooms/${roomId}`);
      set((state) => ({
        rooms: state.rooms.filter((room) => room._id !== roomId),
      }));
    } catch (error) {
      set({ error: error?.response?.data?.message || "Error deleting room" });
    }
  },
});

const useChatStore = create(
  process.env.NODE_ENV === "development"
    ? devtools(chatStore, { name: "ChatStore" })
    : chatStore
);

export default useChatStore;
