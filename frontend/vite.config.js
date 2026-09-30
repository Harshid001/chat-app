import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "motion",
              test: /node_modules\/(framer-motion|motion-dom|motion-utils)\//,
            },
            {
              name: "primitives",
              test: /node_modules\/(radix-ui|@radix-ui)\//,
            },
            { name: "auth", test: /node_modules\/@clerk\// },
          ],
        },
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      manifestFilename: "manifest.json",
      includeAssets: ["favicon.svg", "icons/apple-touch-icon.png"],
      manifest: {
        id: "/",
        name: "Chime — A little more connected",
        short_name: "Chime",
        description: "A quiet space for your everyday conversations.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#f5f6f3",
        theme_color: "#f5f6f3",
        lang: "en",
        categories: ["social", "communication"],
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [
          /^\/api(?:\/|$)/,
          /^\/socket\.io(?:\/|$)/,
          /^\/health(?:\/|$)/,
        ],
        cleanupOutdatedCaches: true,
        // API, authentication, and private media are deliberately not runtime cached.
        runtimeCaching: [],
      },
    }),
  ],
});
