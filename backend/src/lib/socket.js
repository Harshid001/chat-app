const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { verifyToken } = require("@clerk/backend");
const User = require("../models/user.model");

const app = express();
const server = http.createServer(app);
const allowedOrigin = process.env.FRONTEND_URL
  ? new URL(process.env.FRONTEND_URL).origin
  : false;
const io = new Server(server, {
  cors: { origin: allowedOrigin, credentials: true },
  maxHttpBufferSize: 1e6,
});
const connections = new Map();
const userRoom = (id) => `user:${id}`;

// Never trust a user ID supplied by the browser for socket identity.
io.use(async (socket, next) => {
  try {
    const claims = await verifyToken(socket.handshake.auth.token, {
      secretKey: process.env.CLERK_SECRET_KEY,
      ...(process.env.FRONTEND_URL
        ? { authorizedParties: [allowedOrigin] }
        : {}),
    });
    const user = await User.findOne({ clerkId: claims.sub });
    if (!user)
      return next(new Error("Your profile is still syncing. Please retry."));
    socket.data.userId = String(user._id);
    socket.data.expiresAt = claims.exp * 1000;
    next();
  } catch {
    next(new Error("Session expired. Please reconnect."));
  }
});

io.on("connection", (socket) => {
  const id = socket.data.userId;
  socket.join(userRoom(id));
  connections.set(id, (connections.get(id) || 0) + 1);
  io.emit("getOnlineUsers", [...connections.keys()]);
  // Reauthenticate on reconnect instead of keeping an expired session alive.
  const expiry = setTimeout(
    () => socket.disconnect(true),
    Math.max(0, socket.data.expiresAt - Date.now()),
  );
  socket.on("disconnect", () => {
    clearTimeout(expiry);
    const count = (connections.get(id) || 1) - 1;
    if (count) connections.set(id, count);
    else connections.delete(id);
    io.emit("getOnlineUsers", [...connections.keys()]);
  });
});

module.exports = { app, server, io, userRoom };
