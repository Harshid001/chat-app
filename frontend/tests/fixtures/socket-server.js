import { createServer } from "node:http";
import { Server } from "socket.io";
const server = createServer((req, res) => {
  res.writeHead(200);
  res.end("socket fixture");
});
const io = new Server(server);
io.use((socket, next) =>
  next(
    socket.handshake.auth.token === "fixture-session-token"
      ? undefined
      : new Error("Unauthorized"),
  ),
);
io.on("connection", (socket) => {
  socket.emit("getOnlineUsers", ["600000000000000000000002"]);
  socket.on("test:message", (message) => socket.emit("newMessage", message));
  socket.on("test:disconnect", () => socket.disconnect(true));
});
io.on("connection", (socket) => {
  socket.on("test:broadcast", (message) => io.emit("newMessage", message));
  socket.on("test:disconnectAll", () => {
    for (const other of io.sockets.sockets.values())
      if (other.id !== socket.id) other.disconnect(true);
  });
});
server.listen(4175, "127.0.0.1");
