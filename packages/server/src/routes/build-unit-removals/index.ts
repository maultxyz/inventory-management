import { Hono } from "hono";
import type { AppEnv } from "../../middleware/auth";
import { createBuildUnitRemovalRoute } from "./create";

const router = new Hono<AppEnv>().route("/", createBuildUnitRemovalRoute);

export { router as buildUnitRemovalsRouter };
