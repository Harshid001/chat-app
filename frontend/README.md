# Chime

A responsive chat PWA built with React, Zustand, Tailwind CSS, Axios, Socket.IO, Lucide, and Clerk. The interface uses Tailwind design tokens, Radix interactive primitives, Framer Motion, pill controls, and restrained frosted surfaces. Light, dark, and system themes share the same component styling. Motion respects the reduced-motion preference.

## Local development

Use Node 22.12+ (the Docker build uses Node 22).

```sh
cp .env.example .env
npm ci
npm run dev
```

Set `VITE_CLERK_PUBLISHABLE_KEY` to the public key for the backend's Clerk application. `VITE_API_URL` defaults to `https://chat-app-oi25.onrender.com` when omitted. Set it to `http://localhost:3001` to use a local backend. For cross-origin development, the backend's `FRONTEND_URL` must match the Vite origin and Clerk must allow that origin.

## Deployment

Build the existing monolithic Docker image **from the repository root**:

```sh
docker build --build-arg VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_key -t chime .
docker run --env-file backend/.env -p 3001:3001 chime
```

The publishable key is public and embedded at build time. Use a production Clerk instance for the deployed domain. The image intentionally fails to build if the key is absent. Runtime secrets stay on the server; `.dockerignore` excludes local environment files and dependencies.

Set these runtime environment variables on Render:

- `NODE_ENV=production`
- `PORT` (Render provides this)
- `FRONTEND_URL=https://chat-app-oi25.onrender.com`
- `MONGO_URI`
- `CLERK_SECRET_KEY` and `CLERK_PUBLISHABLE_KEY` from the same Clerk instance
- `CLERK_WEBHOOK_SIGNING_KEY` for `/api/webhooks/clerk`
- `IMAGEKIT_KEY` if photo/video uploads are wanted

Docker sets `VITE_API_URL` to an empty string, so API and Socket.IO use the page's origin. Express serves the SPA, including `/sign-in` and `/sign-up`, and the compiled `manifest.json` and service worker. Keep HTTPS and WebSocket upgrade support enabled at the proxy.

Deploy the backend changes with this frontend. They fix the auth response, text-only sends, media uploads, message timestamps, and authenticated socket rooms. The history API now returns `{ messages, hasMore }` (50 messages per page); the frontend also accepts the old array shape. Message retry safety uses a sparse unique `clientMessageId` index. Existing records remain compatible; their ObjectId timestamp is used when `createdAt` is absent. Ensure MongoDB index creation is allowed during rollout.

New accounts are synced from Clerk on the first authenticated request if the webhook hasn't arrived. Later profile edits use Clerk's signed webhook. The current backend has no read receipts, typing events, or durable unread cursor, so the UI shows server-confirmed **Sent**, online presence, and unread counts for the current session.

## Offline and installation

`vite-plugin-pwa` emits a versioned app-shell cache, `manifest.json`, PNG icons, and a service worker. An update prompt lets users choose when to reload. Only bundled public assets are cached; authenticated API responses, Clerk sessions, and private media are excluded. Already-loaded messages and drafts stay available in memory while offline; sending is disabled. A fresh offline launch displays the cached shell and a reconnect state. Signing in and loading history require a connection. Theme preference is the only app state persisted to local storage.

- Android Chrome: use **Get Chime for your device** or the browser's **Install app** menu.
- iOS Safari: **Share → Add to Home Screen**.
- Desktop Chrome/Edge: use the in-app install control or the address bar install icon.

Native installation still needs a device check: install from HTTPS, launch from the home screen, confirm standalone mode and safe-area spacing, open the keyboard in a conversation, send a message, disconnect/reconnect, close and relaunch, and remove/reinstall the app. Chromium viewport emulation does not validate iOS Safari or an Android native install flow.

## Verification

```sh
npm run lint
npm run build
npx playwright install chromium
npm test
cd ../backend
npm test
npm run build
```

To use system Chromium, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/path/to/chromium` when running tests. Browser tests use a test-only Clerk adapter and mocked API data, plus a real local Socket.IO server for transport/reconnection checks. They cover desktop, tablet, Android-sized, and iPhone-sized layouts, retry/deduplication, search, contacts, theme, keyboard focus, dialog dismissal, emoji popovers, logout, offline sends, the service worker, and cache isolation. The test adapter is only referenced by `vite.test.config.js` and is excluded from the production bundle.

Live two-account testing is still needed against your configured Clerk, MongoDB, and ImageKit services. The tests do not create accounts or send messages to real users.

Implementation references: [Clerk authenticated requests](https://clerk.com/docs/guides/development/making-requests), [Vite PWA service worker registration](https://vite-pwa-org.netlify.app/guide/register-service-worker).
