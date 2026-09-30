import { Buffer } from "node:buffer";
import { test, expect } from "@playwright/test";
import { io } from "socket.io-client";
const self = {
  _id: "600000000000000000000001",
  fullName: "Alex Morgan",
  email: "alex@example.test",
};
const friend = { _id: "600000000000000000000002", fullName: "Jamie Chen" };
const friend2 = { _id: "600000000000000000000003", fullName: "Sofia Davis" };
const history = [
  {
    _id: "670000000000000000000001",
    senderId: friend._id,
    receiverId: self._id,
    text: "Hey! Did you find that little bookshop?",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "670000000000000000000002",
    senderId: self._id,
    receiverId: friend._id,
    text: "I did. It’s even better than you said.",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "670000000000000000000003",
    senderId: friend._id,
    receiverId: self._id,
    text: "Let’s go back this weekend. Coffee’s on me ☕",
    createdAt: new Date().toISOString(),
  },
];
async function mockApi(page, { failSend = false } = {}) {
  let sends = 0;
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/api/auth/check") return route.fulfill({ json: self });
    if (path === "/api/messages/conversations")
      return route.fulfill({
        json: [{ ...friend, lastMessage: history.at(-1) }],
      });
    if (path === "/api/messages/users")
      return route.fulfill({ json: [friend, friend2] });
    if (path.startsWith("/api/messages/send/")) {
      sends++;
      if (failSend && sends === 1)
        return route.fulfill({
          status: 503,
          json: { message: "Please try again." },
        });
      const body = route.request().postDataJSON();
      return route.fulfill({
        status: 201,
        json: {
          newMessage: {
            ...body,
            _id: `68000000000000000000000${sends}`,
            senderId: self._id,
            receiverId: friend._id,
            createdAt: new Date().toISOString(),
          },
        },
      });
    }
    return route.fulfill({
      json: {
        messages: path.endsWith(friend._id) ? history : [],
        hasMore: false,
      },
    });
  });
  // Default tests exercise graceful connection failure.
  await page.route("**/socket.io/**", (route) => route.abort());
}
async function openChat(page) {
  await page.goto("/");
  await page.getByRole("button", { name: /Jamie Chen/ }).click();
  await expect(page.getByRole("log")).toBeVisible();
}
test("conversation, send failure, retry, search and mobile navigation", async ({
  page,
}, info) => {
  await mockApi(page, { failSend: true });
  await openChat(page);
  await page
    .getByRole("textbox", { name: "Message", exact: true })
    .fill("See you Saturday!");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Not sent · Retry" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Not sent · Retry" }).click();
  await expect(
    page.getByRole("button", { name: "Not sent · Retry" }),
  ).toHaveCount(0);
  await expect(
    page.getByText("See you Saturday!", { exact: true }),
  ).toHaveCount(1);
  await page.getByRole("button", { name: "Search this conversation" }).click();
  await page
    .getByRole("textbox", { name: "Search loaded messages" })
    .fill("bookshop");
  await expect(page.getByText("1 found")).toBeVisible();
  await expect(
    page.getByText("See you Saturday!", { exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Close message search" }).click();
  await expect(
    page.getByText("See you Saturday!", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Search loaded messages" }),
  ).toHaveCount(0);
  await page.screenshot({
    path: `test-results/${info.project.name}-chat.png`,
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  if (["android-layout", "ios-layout"].includes(info.project.name)) {
    await page.getByRole("button", { name: "Back to conversations" }).click();
    await expect(
      page.getByRole("textbox", { name: "Search conversations" }),
    ).toBeVisible();
  }
});
test("contacts, appearance, sign out clears conversation state", async ({
  page,
}) => {
  await mockApi(page);
  await page.goto("/");
  await page
    .getByRole("button", { name: "New message", exact: true })
    .first()
    .click();
  await page.getByRole("textbox", { name: "Search people" }).fill("sofia");
  await page.getByRole("button", { name: /Sofia Davis/ }).click();
  await expect(
    page.getByRole("heading", { name: "Sofia Davis" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Say hello" }).click();
  await expect(
    page.getByRole("textbox", { name: "Message", exact: true }),
  ).toHaveValue("Hey! How’s your day going?");
  if (
    await page
      .getByRole("button", { name: "Back to conversations" })
      .isVisible()
  )
    await page.getByRole("button", { name: "Back to conversations" }).click();
  await page.getByRole("button", { name: "Account and appearance" }).click();
  await page.getByRole("radio", { name: "Dark", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Less noise/ })).toBeVisible();
  await expect(page.getByText("Jamie Chen")).toHaveCount(0);
});
test("offline retains loaded messages, disables sends and restores draft", async ({
  page,
  context,
}) => {
  await mockApi(page);
  await openChat(page);
  await page
    .getByRole("textbox", { name: "Message", exact: true })
    .fill("For when I’m back");
  await context.setOffline(true);
  await expect(
    page.getByText("You’re offline. Your open messages are still here."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Send message", exact: true }),
  ).toBeDisabled();
  await expect(page.getByText(history[0].text)).toBeVisible();
  await context.setOffline(false);
  await expect(
    page.getByRole("button", { name: "Send message", exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByRole("textbox", { name: "Message", exact: true }),
  ).toHaveValue("For when I’m back");
});
test("manifest, install help, offline app shell and API cache isolation", async ({
  page,
  context,
}) => {
  await mockApi(page);
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: /Get Chime for your device/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Get Chime for your device/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "iPhone & iPad" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  const manifest = await (await page.request.get("/manifest.json")).json();
  expect(manifest.display).toBe("standalone");
  expect(manifest.icons).toHaveLength(3);
  for (const icon of manifest.icons)
    expect((await page.request.get(icon.src)).status()).toBe(200);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  const cachedUrls = await page.evaluate(async () =>
    (
      await Promise.all(
        (await caches.keys()).map(async (name) =>
          (await (await caches.open(name)).keys()).map(
            (request) => request.url,
          ),
        ),
      )
    ).flat(),
  );
  expect(cachedUrls.some((url) => /\/api\/|clerk|socket\.io/.test(url))).toBe(
    false,
  );
  await page.unroute("**/api/**");
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByText(
      /The app is ready. Reconnect to sign in|Couldn’t connect. Please try again./,
    ),
  ).toBeVisible();
});
test("welcome screen is responsive and sign-in controls work", async ({
  page,
}, info) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("fixture-signed-out", "true"),
  );
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Less noise/ })).toBeVisible();
  await page.screenshot({
    path: `test-results/${info.project.name}-welcome.png`,
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText("Sign in fixture")).toBeVisible();
});

test("real Socket.IO transport receives once and reconnects", async ({
  page,
}) => {
  await mockApi(page);
  await page.unroute("**/socket.io/**");
  await openChat(page);
  await expect(page.getByText("Online now", { exact: true })).toBeVisible();
  const control = io("http://127.0.0.1:4175", {
    auth: { token: "fixture-session-token" },
    transports: ["websocket"],
  });
  await new Promise((resolve, reject) => {
    control.on("connect", resolve);
    control.on("connect_error", reject);
  });
  try {
    const message = {
      _id: "690000000000000000000001",
      senderId: friend._id,
      receiverId: self._id,
      text: "A live hello!",
      createdAt: new Date().toISOString(),
    };
    control.emit("test:broadcast", message);
    control.emit("test:broadcast", message);
    await expect(
      page.getByRole("log").getByText("A live hello!", { exact: true }),
    ).toHaveCount(1);
    control.emit("test:disconnectAll");
    await expect(page.getByText("Online now", { exact: true })).toBeVisible();
    control.emit("test:broadcast", {
      ...message,
      _id: "690000000000000000000002",
      text: "Still connected.",
    });
    await expect(
      page.getByRole("log").getByText("Still connected.", { exact: true }),
    ).toBeVisible();
  } finally {
    control.disconnect();
  }
});

test("cached shell recovers when external authentication cannot load", async ({
  page,
}) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("fixture-auth-loading", "true"),
  );
  await page.route("**/health", (route) => route.abort());
  await page.goto("/");
  await expect(
    page.getByText("Connection unavailable", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Try again", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Making a little room for you…")).toHaveCount(0);
});

test("Radix dialogs restore focus and emoji popovers work in dark mode", async ({
  page,
}, info) => {
  await mockApi(page);
  await page.goto("/");
  const compose = page
    .getByRole("button", { name: "New message", exact: true })
    .first();
  await compose.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "New message" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(compose).toBeFocused();
  await page.getByRole("button", { name: "Choose appearance" }).click();
  await page.getByRole("menuitemradio", { name: "Dark", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: /Jamie Chen/ }).click();
  await page.getByRole("button", { name: "Choose an emoji" }).click();
  await page.getByRole("button", { name: "Wave", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Message", exact: true }),
  ).toHaveValue("👋");
  await expect(
    page.getByRole("textbox", { name: "Message", exact: true }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "Conversation details", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Conversation details" }),
  ).toBeVisible();
  await page.screenshot({
    path: `test-results/${info.project.name}-dark-dialog.png`,
    fullPage: true,
  });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.screenshot({
    path: `test-results/${info.project.name}-dark-chat.png`,
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

const photo = {
  name: "weekend.png",
  mimeType: "image/png",
  buffer: Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=",
    "base64",
  ),
};
test("attachment preview, processing, actionable failure and idempotent retry", async ({
  page,
}, info) => {
  await mockApi(page);
  const identifiers = [];
  await page.route("**/api/messages/send/**", async (route) => {
    const body = route.request().postData();
    const clientMessageId = body.match(
      /name="clientMessageId"\r\n\r\n([^\r]+)/,
    )[1];
    identifiers.push(clientMessageId);
    expect(body).toContain('filename="weekend.png"');
    expect(body).toContain("Weekend plans");
    if (identifiers.length === 1) {
      return route.continue({ url: "http://127.0.0.1:4175/upload-failure" });
    }
    return route.fulfill({
      status: 201,
      json: {
        newMessage: {
          _id: "680000000000000000000009",
          senderId: self._id,
          receiverId: friend._id,
          clientMessageId,
          text: "Weekend plans",
          image: "data:image/png;base64," + photo.buffer.toString("base64"),
          createdAt: new Date().toISOString(),
        },
      },
    });
  });
  await openChat(page);
  await page
    .getByRole("textbox", { name: "Message", exact: true })
    .fill("Weekend plans");
  await page
    .getByRole("button", { name: "Attach a photo or video", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Send attachment", exact: true }),
  ).toBeDisabled();
  await page.getByLabel("Choose attachment file").setInputFiles(photo);
  await expect(page.getByAltText("Preview of weekend.png")).toBeVisible();
  await expect(page.getByLabel("Caption (optional)")).toHaveValue(
    "Weekend plans",
  );
  await page.screenshot({
    path: `test-results/${info.project.name}-attachment-preview.png`,
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Send attachment", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByText("Processing attachment…", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("progressbar")).toBeVisible();
  await expect(
    page.getByText("Attachment not sent", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(/The upload service could not be reached/),
  ).toBeVisible();
  await page.screenshot({
    path: `test-results/${info.project.name}-attachment-error.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Retry upload", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Retry upload", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("log").getByText("Weekend plans", { exact: true }),
  ).toHaveCount(1);
  await expect(page.getByAltText("Photo shared by you")).toBeVisible();
  expect(identifiers).toHaveLength(2);
  expect(identifiers[0]).toBe(identifiers[1]);
});
test("attachment validation, offline selection and keyboard dismissal", async ({
  page,
  context,
}) => {
  await mockApi(page);
  await openChat(page);
  const attach = page.getByRole("button", {
    name: "Attach a photo or video",
    exact: true,
  });
  await attach.focus();
  await page.keyboard.press("Enter");
  await page.getByLabel("Choose attachment file").setInputFiles({
    name: "photo.heic",
    mimeType: "image/heic",
    buffer: Buffer.from("not-supported"),
  });
  await expect(page.getByRole("alert")).toContainText(
    "Export HEIC photos as JPG first",
  );
  await expect(
    page.getByRole("button", { name: "Send attachment", exact: true }),
  ).toBeDisabled();
  await page
    .getByLabel("Choose attachment file")
    .setInputFiles({ ...photo, buffer: Buffer.alloc(25 * 1024 * 1024 + 1) });
  await expect(page.getByRole("alert")).toContainText("exceeds 25 MB");
  await page
    .getByLabel("Choose attachment file")
    .setInputFiles({ ...photo, buffer: Buffer.alloc(0) });
  await expect(page.getByRole("alert")).toContainText("file is empty");
  await page.getByLabel("Choose attachment file").setInputFiles(photo);
  await expect(page.getByRole("alert")).toHaveCount(0);
  await context.setOffline(true);
  await expect(
    page.getByRole("button", { name: "Send attachment", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByText(/Reconnect to send; your selection/),
  ).toBeVisible();
  await context.setOffline(false);
  await expect(
    page.getByRole("button", { name: "Send attachment", exact: true }),
  ).toBeEnabled();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(attach).toBeFocused();
});
