import { Hono } from "hono";
import type { AppEnv } from "../../middleware/auth";
import { adjustStockRoute } from "./adjust-stock";
import { bulkAdjustStockRoute } from "./bulk-adjust-stock";
import { bulkDeleteItemsRoute } from "./bulk-delete";
import { bulkTagItemsRoute } from "./bulk-tags";
import { createItemRoute } from "./create";
import { deleteItemRoute } from "./delete";
import { listItemsRoute } from "./list";
import { updateItemRoute } from "./update";

const router = new Hono<AppEnv>()
  .route("/", listItemsRoute)
  .route("/", createItemRoute)
  .route("/", bulkAdjustStockRoute)
  .route("/", bulkTagItemsRoute)
  .route("/", bulkDeleteItemsRoute)
  .route("/", updateItemRoute)
  .route("/", deleteItemRoute)
  .route("/", adjustStockRoute);

export { router as itemsRouter };
