import { updateItemFormSchema } from "@inventory/shared";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../../db";
import { items } from "../../db/schema";
import {
  isItemGuid,
  toInventoryItem,
  toItemDetailColumns,
} from "../../lib/items";
import { requireAuth, type AppEnv } from "../../middleware/auth";

export const updateItemRoute = new Hono<AppEnv>().put(
  "/:guid",
  requireAuth,
  async (c) => {
    const parsed = updateItemFormSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.json({ success: false, message: "Invalid item." }, 400);
    }
    const itemGuid = c.req.param("guid");
    if (!isItemGuid(itemGuid)) {
      return c.json({ success: false, message: "Item not found." });
    }
    const [updated] = await db
      .update(items)
      .set({ ...toItemDetailColumns(parsed.data), updatedAt: new Date() })
      .where(
        and(
          eq(items.guid, itemGuid),
          eq(items.userId, c.get("userId")),
          eq(items.isDeleted, false),
        ),
      )
      .returning();
    if (!updated) {
      return c.json({ success: false, message: "Item not found." });
    }
    return c.json({
      success: true,
      message: "Saved item.",
      data: toInventoryItem(updated),
    });
  },
);
