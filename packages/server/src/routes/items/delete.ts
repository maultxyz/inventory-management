import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../../db";
import { items } from "../../db/schema";
import { isItemGuid } from "../../lib/items";
import { requireAuth, type AppEnv } from "../../middleware/auth";

export const deleteItemRoute = new Hono<AppEnv>().delete(
  "/:guid",
  requireAuth,
  async (c) => {
    const itemGuid = c.req.param("guid");
    if (!isItemGuid(itemGuid)) {
      return c.json({ success: false, message: "Item not found." });
    }
    const [deleted] = await db
      .update(items)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(
        and(
          eq(items.guid, itemGuid),
          eq(items.userId, c.get("userId")),
          eq(items.isDeleted, false),
        ),
      )
      .returning({ guid: items.guid });
    if (!deleted) {
      return c.json({ success: false, message: "Item not found." });
    }
    return c.json({ success: true, message: "Deleted item.", data: null });
  },
);
