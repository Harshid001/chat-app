import { defineConfig, mergeConfig } from "vite";
import { fileURLToPath } from "node:url";
import config from "./vite.config.js";

// Test-only identity adapter. Never imported by the production build.
export default mergeConfig(
  config,
  defineConfig({
    resolve: {
      alias: {
        "@clerk/react": fileURLToPath(
          new URL("./tests/fixtures/clerk.jsx", import.meta.url),
        ),
      },
    },
    define: {
      "import.meta.env.VITE_CLERK_PUBLISHABLE_KEY":
        JSON.stringify("pk_test_fixture"),
      "import.meta.env.VITE_API_URL": JSON.stringify(""),
    },
    preview: {
      proxy: { "/socket.io": { target: "http://127.0.0.1:4175", ws: true } },
    },
    build: { outDir: "dist-test" },
  }),
);
