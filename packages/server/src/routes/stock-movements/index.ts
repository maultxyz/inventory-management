import { Hono } from "hono";
import type { AppEnv } from "../../middleware/auth";
import { listStockMovementsRoute } from "./list";

const router = new Hono<AppEnv>().route("/", listStockMovementsRoute);

export { router as stockMovementsRouter };
