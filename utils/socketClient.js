import { io } from "socket.io-client";
import { LOCAL_STORAGE_KEY } from "@/constants/localStorage";
import axiosInstance from "@/utils/axios";

// Read the latest access token on every (re)connect, so a refreshed token is picked up
export const socketAuth = (cb) => {
  let token = null;
  try {
    token = localStorage.getItem(LOCAL_STORAGE_KEY.accessToken);
  } catch {}
  cb({ token });
};

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
  autoConnect: false,
  reconnectionAttempts: 5,
  transports: ["websocket"],
  auth: socketAuth,
});

// The server rejects expired access tokens with "Unauthorized" and socket.io won't retry
// on its own. Trigger the axios refresh flow once, then reconnect with the new token.
let authRetries = 0;
socket.on("connect", () => {
  authRetries = 0;
});
socket.on("connect_error", async (error) => {
  if (error?.message !== "Unauthorized" || authRetries >= 1) return;
  authRetries += 1;
  try {
    await axiosInstance.get("/users/me");
    socket.connect();
  } catch {
    // Refresh failed: the axios interceptor sends the user back to the login page
  }
});

export default socket;
