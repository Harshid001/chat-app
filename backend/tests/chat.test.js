const { test, beforeEach, after } = require("node:test");
const assert = require("node:assert/strict");
const mock = require("mock-require");
const express = require("express");
const request = require("supertest");
const { EventEmitter } = require("node:events");
const SELF = "600000000000000000000001";
const FRIEND = "600000000000000000000002";
let created, existing, verifyClaims, events, users, socketServer;
const messages = {
  findOne: async () => existing,
  create: async (body) => {
    created = body;
    return { _id: "message-id", ...body };
  },
  find: () => ({
    sort: () => ({ limit: async () => [{ _id: "second" }, { _id: "first" }] }),
  }),
};
class FakeIO extends EventEmitter {
  constructor() {
    super();
    socketServer = this;
  }
  use(handler) {
    this.authenticate = handler;
  }
  to() {
    return this;
  }
  emit(name, payload) {
    events.push({ name, payload });
    return super.emit(name, payload);
  }
}
mock("socket.io", { Server: FakeIO });
mock("@clerk/backend", {
  verifyToken: async () => {
    if (verifyClaims instanceof Error) throw verifyClaims;
    return verifyClaims;
  },
});
mock("../src/models/user.model.js", {
  findOne: async () => users,
  exists: async () => true,
});
mock("../src/models/message.model.js", messages);
mock("../src/lib/imagekit.js", {
  hasImageKitConfig: () => false,
  uploadChatMedia: async () => {
    throw new Error("Text must not upload media");
  },
});
const socketModule = require("../src/lib/socket");
const {
  sendMessage,
  getMessages,
} = require("../src/controllers/message.controller");
const checkAuth = require("../src/controllers/auth.controller");
const app = express();
app.use(express.json());
app.use((req, res, next) => {
  req.user = {
    _id: SELF,
    fullName: "Alex",
    email: "alex@example.test",
    clerkId: "private",
  };
  next();
});
app.get("/auth", checkAuth);
app.post("/send/:id", sendMessage);
app.get("/messages/:id", getMessages);
app.use((error, req, res, next) =>
  res.status(500).json({ message: error.message }),
);
beforeEach(() => {
  created = null;
  existing = null;
  verifyClaims = {
    sub: "verified-user",
    exp: Math.floor(Date.now() / 1000) + 60,
  };
  events = [];
  users = { _id: SELF };
});
after(() => {
  mock.stopAll();
  socketModule.server.close();
});
test("auth returns profile without private Clerk ID", async () => {
  const response = await request(app).get("/auth").expect(200);
  assert.equal(response.body._id, SELF);
  assert.equal(response.body.clerkId, undefined);
});
test("text-only send saves and broadcasts without a media file", async () => {
  const response = await request(app)
    .post(`/send/${FRIEND}`)
    .send({
      text: " Hello ",
      clientMessageId: "12345678-1234-1234-1234-123456789abc",
    })
    .expect(201);
  assert.equal(created.text, "Hello");
  assert.equal(response.body.newMessage.senderId, SELF);
  assert.equal(
    events.find((event) => event.name === "newMessage").payload.text,
    "Hello",
  );
});
test("retry with same identifier returns original without another write", async () => {
  existing = { _id: "existing-message", text: "Hello" };
  const response = await request(app)
    .post(`/send/${FRIEND}`)
    .send({
      text: "Hello",
      clientMessageId: "12345678-1234-1234-1234-123456789abc",
    })
    .expect(200);
  assert.equal(response.body.newMessage._id, "existing-message");
  assert.equal(created, null);
  assert.equal(events.length, 0);
});
test("rejects blank, oversized, malformed and self-addressed messages", async () => {
  await request(app).post(`/send/${FRIEND}`).send({ text: " " }).expect(400);
  await request(app)
    .post(`/send/${FRIEND}`)
    .send({ text: "a".repeat(5001) })
    .expect(400);
  await request(app).post("/send/invalid").send({ text: "hi" }).expect(400);
  await request(app).post(`/send/${SELF}`).send({ text: "hi" }).expect(400);
});
test("history validates cursors and returns chronological pages", async () => {
  await request(app).get(`/messages/${FRIEND}?before=invalid`).expect(400);
  const { body } = await request(app).get(`/messages/${FRIEND}`).expect(200);
  assert.deepEqual(
    body.messages.map((item) => item._id),
    ["first", "second"],
  );
  assert.equal(body.hasMore, false);
});
test("socket rejects invalid session instead of trusting claimed user ID", async () => {
  verifyClaims = new Error("Invalid token");
  const socket = {
    handshake: { auth: { token: "bad" }, query: { userId: FRIEND } },
    data: {},
  };
  const error = await new Promise((resolve) =>
    socketServer.authenticate(socket, resolve),
  );
  assert.match(error.message, /Session expired/);
  assert.equal(socket.data.userId, undefined);
});
test("socket uses verified identity; disconnecting one tab preserves presence", async () => {
  function createSocket() {
    const socket = new EventEmitter();
    socket.handshake = { auth: { token: "valid" }, query: { userId: FRIEND } };
    socket.data = {};
    socket.join = (room) => {
      socket.room = room;
    };
    socket.disconnect = () => socket.emit("disconnect");
    return socket;
  }
  const first = createSocket(),
    second = createSocket();
  for (const socket of [first, second]) {
    await new Promise((resolve) => socketServer.authenticate(socket, resolve));
    assert.equal(socket.data.userId, SELF);
    socketServer.emit("connection", socket);
    assert.equal(socket.room, `user:${SELF}`);
  }
  first.disconnect();
  assert.deepEqual(
    events.filter((event) => event.name === "getOnlineUsers").at(-1).payload,
    [SELF],
  );
  second.disconnect();
  assert.deepEqual(
    events.filter((event) => event.name === "getOnlineUsers").at(-1).payload,
    [],
  );
});
