import { bulkDeleteItemsSchema } from "@inventory/shared";
import { and, eq, inArray } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../../db";
import { items } from "../../db/schema";
import { requireAuth, type AppEnv } from "../../middleware/auth";

export const bulkDeleteItemsRoute = new Hono<AppEnv>().post(
  "/bulk-deletions",
  requireAuth,
  async (c) => {
    const parsed = bulkDeleteItemsSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.json({ success: false, message: "Invalid selection." }, 400);
    }
    const deleted = await db
      .update(items)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(
        and(
          inArray(items.guid, parsed.data.itemGuids),
          eq(items.userId, c.get("userId")),
          eq(items.isDeleted, false),
        ),
      )
      .returning({ guid: items.guid });
    if (deleted.length === 0) {
      return c.json({ success: false, message: "No items found." });
    }
    return c.json({
      success: true,
      message: "Deleted items.",
      data: { itemCount: deleted.length },
    });
  },
);
