import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      manifestFilename: "manifest.json",
      includeAssets: ["favicon.svg", "icons/apple-touch-icon.png"],
      manifest: {
        id: "/",
        name: "Murmur — A little closer",
        short_name: "Murmur",
        description: "A quiet space for your everyday conversations.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#edf1f5",
        theme_color: "#f4f6f8",
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
