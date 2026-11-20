import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import {
  IMMUTABLE_ASSET_CACHE_CONTROL,
  REVALIDATED_CACHE_CONTROL,
} from "./constants/server";

function webRuntimeEnvScript(): string {
  const runtimeEnv = {
    VITE_NEON_AUTH_URL:
      process.env.VITE_NEON_AUTH_URL ?? process.env.NEON_AUTH_URL,
  };
  return `window.__ENV__ = ${JSON.stringify(runtimeEnv)};\n`;
}

export function createWebAppRouter(webDistDir: string) {
  return new Hono()
    .get("/env.js", (c) =>
      c.body(webRuntimeEnvScript(), 200, {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": REVALIDATED_CACHE_CONTROL,
      }),
    )
    .use(
      "/assets/*",
      serveStatic({
        root: webDistDir,
        onFound: (_path, c) => {
          c.header("Cache-Control", IMMUTABLE_ASSET_CACHE_CONTROL);
        },
      }),
    )
    .get("/assets/*", (c) => c.notFound())
    .use(
      "*",
      serveStatic({
        root: webDistDir,
        onFound: (_path, c) => {
          c.header("Cache-Control", REVALIDATED_CACHE_CONTROL);
        },
      }),
    )
    .get(
      "*",
      serveStatic({
        root: webDistDir,
        path: "index.html",
        onFound: (_path, c) => {
          c.header("Cache-Control", REVALIDATED_CACHE_CONTROL);
        },
      }),
    );
}
