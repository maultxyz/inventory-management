import { serve } from "@hono/node-server";
import { Hono, type ErrorHandler } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import {
  API_PATH_PREFIX,
  API_PORT,
  REQUEST_BODY_MAX_BYTES,
  WEB_DIST_DIR,
  WEB_URL,
} from "./lib/constants/server";
import { requiredEnv } from "./lib/env";
import { createWebAppRouter } from "./lib/web-app";
import type { AppEnv } from "./middleware/auth";
import { buildUnitRemovalsRouter } from "./routes/build-unit-removals";
import { itemsRouter } from "./routes/items";
import { stockMovementsRouter } from "./routes/stock-movements";

requiredEnv("NEON_AUTH_URL");

const reportUnhandledError: ErrorHandler<AppEnv> = (err, c) => {
  console.error("[server] Unhandled error:", err);
  return c.json({ success: false, message: "Internal server error." }, 500);
};

const api = new Hono<AppEnv>();

api.use(
  cors({
    origin: WEB_URL,
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

api.use(
  bodyLimit({
    maxSize: REQUEST_BODY_MAX_BYTES,
    onError: (c) =>
      c.json({ success: false, message: "Payload too large." }, 413),
  }),
);

api.get("/public/health", (c) => c.json({ success: true }));
api.route("/items", itemsRouter);
api.route("/build-unit-removals", buildUnitRemovalsRouter);
api.route("/stock-movements", stockMovementsRouter);
api.all("*", (c) => c.json({ success: false, message: "Not found." }, 404));
api.onError(reportUnhandledError);

const app = new Hono<AppEnv>();

app.route(API_PATH_PREFIX, api);
if (WEB_DIST_DIR) app.route("/", createWebAppRouter(WEB_DIST_DIR));
app.onError(reportUnhandledError);

serve({ fetch: app.fetch, port: API_PORT }, () => {
  console.log(`[server] Running on port ${API_PORT}`);
});
