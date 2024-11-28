import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
  autoConnect: false,
  reconnectionAttempts: 5,
  transports: ["websocket"],
});

export default socket;