import {
  STOCK_MOVEMENTS_PAGE_SIZE,
  type StockMovement,
} from "@inventory/shared";
import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../../db";
import { items, stockMovements } from "../../db/schema";
import { requireAuth, type AppEnv } from "../../middleware/auth";

export const listStockMovementsRoute = new Hono<AppEnv>().get(
  "/",
  requireAuth,
  async (c) => {
    const rows = await db
      .select({
        guid: stockMovements.guid,
        itemGuid: items.guid,
        itemName: items.name,
        quantityChange: stockMovements.quantityChange,
        quantityAfter: stockMovements.quantityAfter,
        reason: stockMovements.reason,
        note: stockMovements.note,
        createdAt: stockMovements.createdAt,
      })
      .from(stockMovements)
      .innerJoin(items, eq(items.id, stockMovements.itemId))
      .where(eq(stockMovements.userId, c.get("userId")))
      .orderBy(desc(stockMovements.createdAt), desc(stockMovements.id))
      .limit(STOCK_MOVEMENTS_PAGE_SIZE);
    const data: StockMovement[] = rows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
    }));
    return c.json({ success: true, message: "Loaded stock movements.", data });
  },
);
