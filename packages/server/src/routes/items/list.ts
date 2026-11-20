import { and, asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../../db";
import { items } from "../../db/schema";
import { toInventoryItem } from "../../lib/items";
import { requireAuth, type AppEnv } from "../../middleware/auth";

export const listItemsRoute = new Hono<AppEnv>().get(
  "/",
  requireAuth,
  async (c) => {
    const rows = await db
      .select()
      .from(items)
      .where(and(eq(items.userId, c.get("userId")), eq(items.isDeleted, false)))
      .orderBy(asc(items.name), asc(items.id));
    return c.json({
      success: true,
      message: "Loaded items.",
      data: rows.map(toInventoryItem),
    });
  },
);
