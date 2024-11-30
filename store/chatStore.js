import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "@/utils/axios";

const useChatStore = create(
  process.env.NODE_ENV === "development"
    ? devtools(
        (set) => ({
          currentRoomId: null,
          currentRoomData: null,
          rooms: [],
          loading: false,
          error: null,

          setCurrentRoomId: (roomId) => set({ currentRoomId: roomId }),

          setCurrentRoomData: (roomData) => set({ currentRoomData: roomData }),

          setRooms: (rooms) => set({ rooms: rooms }),

          addRoom: (room) =>
            set((state) => ({ rooms: [...state.rooms, room] })),

          fetchRooms: async () => {
            set({ loading: true, error: null });
            try {
              const response = await axios.get("/rooms/for-user");
              set({ rooms: response.data?.data });
            } catch (error) {
              set({ error: error.message || "Error fetching rooms" });
            } finally {
              set({ loading: false });
            }
          },

          createRoom: async (roomData) => {
            set({ loading: true, error: null });
            try {
              const response = await axios.post("/rooms", roomData);
              set((state) => ({
                rooms: [...state.rooms, response.data],
              }));
            } catch (error) {
              set({ error: error.message || "Error creating room" });
            } finally {
              set({ loading: false });
            }
          },

          deleteRoom: async (roomId) => {
            set({ loading: true, error: null });
            try {
              await axios.delete(`/api/rooms/${roomId}`);
              set((state) => ({
                rooms: state.rooms.filter((room) => room.id !== roomId),
              }));
            } catch (error) {
              set({ error: error.message || "Error deleting room" });
            } finally {
              set({ loading: false });
            }
          },
        }),
        { name: "ChatStore" }
      )
    : (set) => ({
        currentRoomId: null,
        rooms: [],
        loading: false,
        error: null,

        setCurrentRoomId: (roomId) => set({ currentRoomId: roomId }),

        setCurrentRoomData: (roomData) => set({ currentRoomData: roomData }),

        setRooms: (rooms) => set({ rooms: rooms }),

        addRoom: (room) =>
          set((state) => ({ rooms: [...state.rooms, room] })),

        fetchRooms: async () => {
          set({ loading: true, error: null });
          try {
            const response = await axios.get("/rooms/for-user");
            set({ rooms: response.data?.data });
          } catch (error) {
            set({ error: error.message || "Error fetching rooms" });
          } finally {
            set({ loading: false });
          }
        },

        createRoom: async (roomData) => {
          set({ loading: true, error: null });
          try {
            const response = await axios.post("/rooms", roomData);
            set((state) => ({
              rooms: [...state.rooms, response.data?.data],
            }));
          } catch (error) {
            set({ error: error.message || "Error creating room" });
          } finally {
            set({ loading: false });
          }
        },

        deleteRoom: async (roomId) => {
          set({ loading: true, error: null });
          try {
            await axios.delete(`/rooms/${roomId}`);
            set((state) => ({
              rooms: state.rooms.filter((room) => room.id !== roomId),
            }));
          } catch (error) {
            set({ error: error.message || "Error deleting room" });
          } finally {
            set({ loading: false });
          }
        },
      })
);

export default useChatStore;
