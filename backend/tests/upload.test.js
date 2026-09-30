const { test, beforeEach, after } = require("node:test");
const assert = require("node:assert/strict");
const mock = require("mock-require");
const express = require("express");
const request = require("supertest");
const SELF = "600000000000000000000001";
const FRIEND = "600000000000000000000002";
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=",
  "base64",
);
let saved, calls, providerStatus, existing, uploadBody;
const originalFetch = global.fetch;
process.env.IMAGEKIT_PRIVATE_KEY = "private_test_key";
mock("../src/models/user.model.js", { exists: async () => true });
mock("../src/models/message.model.js", {
  findOne: async () => existing,
  create: async (body) => {
    saved = body;
    return { _id: "saved", ...body };
  },
});
const io = { to: () => io, emit: () => {} };
mock("../src/lib/socket.js", { io, userRoom: (id) => id });
const { sendMessage } = require("../src/controllers/message.controller");
const app = express();
app.use((req, res, next) => {
  req.user = { _id: SELF };
  next();
});
app.post(
  "/send/:id",
  require("../src/middleware/upload.middleware").single("media"),
  sendMessage,
);
app.use(require("../src/middleware/error.middleware"));
beforeEach(() => {
  saved = null;
  calls = 0;
  providerStatus = 200;
  existing = null;
  process.env.IMAGEKIT_PRIVATE_KEY = "private_test_key";
  global.fetch = async (url, options) => {
    if (url === "data:,") return new Response("");
    calls++;
    assert.match(String(url), /upload.imagekit.io/);
    uploadBody = options.body;
    return new Response(
      JSON.stringify(
        providerStatus === 200
          ? { url: "https://ik.imagekit.io/test/photo.png" }
          : { message: "Sensitive upstream diagnostic" },
      ),
      {
        status: providerStatus,
        headers: { "Content-Type": "application/json" },
      },
    );
  };
});
after(() => {
  global.fetch = originalFetch;
  mock.stopAll();
});
function upload() {
  return request(app)
    .post(`/send/${FRIEND}`)
    .field("text", "A photo")
    .field("clientMessageId", "12345678-1234-1234-1234-123456789abc")
    .attach("media", PNG, { filename: "photo.png", contentType: "image/png" });
}
test("multipart upload passes an actual file through ImageKit SDK and saves media URL", async () => {
  await upload().expect(201);
  assert.equal(saved.image, "https://ik.imagekit.io/test/photo.png");
  assert.equal(saved.text, "A photo");
  assert.equal(calls, 1);
  assert.equal(uploadBody.get("file").type, "image/png");
  assert.equal(uploadBody.get("file").size, PNG.length);
});
test("provider authentication rejection is actionable and hides provider diagnostics", async () => {
  providerStatus = 403;
  const { body } = await upload().expect(503);
  assert.equal(body.code, "UPLOAD_ACCESS_DENIED");
  assert.match(body.message, /denied access/);
  assert.equal(body.retryable, false);
  assert.doesNotMatch(JSON.stringify(body), /Sensitive/);
  assert.equal(saved, null);
});
test("provider outages are retryable without SDK automatic upload duplicates", async () => {
  providerStatus = 500;
  const { body } = await upload().expect(503);
  assert.equal(body.code, "UPLOAD_UNAVAILABLE");
  assert.equal(body.retryable, true);
  assert.equal(calls, 1);
  assert.equal(saved, null);
});
test("unsupported and oversized files fail before reaching provider", async () => {
  let response = await request(app)
    .post(`/send/${FRIEND}`)
    .attach("media", Buffer.from("pdf"), {
      filename: "test.pdf",
      contentType: "application/pdf",
    })
    .expect(415);
  assert.equal(response.body.code, "UPLOAD_UNSUPPORTED_TYPE");
  response = await request(app)
    .post(`/send/${FRIEND}`)
    .attach("media", Buffer.alloc(25 * 1024 * 1024 + 1), {
      filename: "large.png",
      contentType: "image/png",
    })
    .expect(413);
  assert.equal(response.body.code, "UPLOAD_TOO_LARGE");
  assert.equal(calls, 0);
});
test("multipart retry returns existing message without another provider upload", async () => {
  existing = { _id: "saved", image: "https://ik.imagekit.io/test/photo.png" };
  await upload().expect(200);
  assert.equal(calls, 0);
});
test("missing credentials return a setup error without contacting provider", async () => {
  delete process.env.IMAGEKIT_PRIVATE_KEY;
  delete process.env.IMAGEKIT_KEY;
  const { body } = await upload().expect(503);
  assert.equal(body.code, "UPLOAD_CONFIGURATION");
  assert.equal(calls, 0);
});

test("provider timeout and limits produce distinct recovery advice", () => {
  const { providerUploadError } = require("../src/lib/upload-error");
  const { APIConnectionTimeoutError } = require("@imagekit/nodejs");
  assert.equal(
    providerUploadError(new APIConnectionTimeoutError()).code,
    "UPLOAD_TIMEOUT",
  );
  assert.equal(providerUploadError({ status: 429 }).code, "UPLOAD_CAPACITY");
  assert.equal(providerUploadError({ status: 413 }).code, "UPLOAD_TOO_LARGE");
  assert.equal(providerUploadError({ status: 422 }).code, "UPLOAD_REJECTED");
});
