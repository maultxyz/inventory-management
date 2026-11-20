import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "fs";
import path from "path";
import { defineConfig, type Plugin } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const { version } = JSON.parse(
  readFileSync(path.resolve(__dirname, "../../package.json"), "utf-8"),
);

const BUILD_ID = `${version}-${Date.now().toString(36)}`;
const APP_CHROME_COLOR = "#050506";

const API_PROXY = {
  "/api": {
    target: "http://localhost:3001",
    changeOrigin: true,
  },
};

function buildVersionFile(): Plugin {
  return {
    name: "build-version-file",
    apply: "build",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "version.json",
        source: JSON.stringify({ buildId: BUILD_ID }),
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    buildVersionFile(),
    VitePWA({
      registerType: "prompt",
      injectRegister: false,
      includeAssets: ["icon.svg", "icon/apple-touch-icon.png"],
      manifest: {
        id: "/",
        name: "Stockroom",
        short_name: "Stockroom",
        description:
          "Track what you have in stock, what is running low and every change along the way.",
        start_url: "/app/home",
        scope: "/",
        display: "standalone",
        theme_color: APP_CHROME_COLOR,
        background_color: APP_CHROME_COLOR,
        icons: [
          { src: "/icon/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icon/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,woff2}"],
        globIgnores: ["env.js"],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        navigateFallback: null,
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) =>
              request.mode === "navigate" &&
              !url.pathname.startsWith("/api/") &&
              !/\/[^/]+\.[^/]+$/.test(url.pathname) &&
              !/[?&](neon_auth_session_verifier|error)=/.test(url.search),
            handler: "NetworkFirst",
            options: {
              cacheName: "pages",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 20 },
              cacheableResponse: { statuses: [200] },
              precacheFallback: { fallbackURL: "/index.html" },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname === "/env.js",
            handler: "NetworkFirst",
            options: {
              cacheName: "runtime-env",
              networkTimeoutSeconds: 5,
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(version),
    __BUILD_ID__: JSON.stringify(BUILD_ID),
  },
  envDir: path.resolve(__dirname, "../../"),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: API_PROXY,
  },
  preview: {
    port: 8080,
    proxy: API_PROXY,
  },
});
