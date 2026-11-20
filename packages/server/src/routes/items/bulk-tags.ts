import {
  ITEM_TAGS_MAX,
  bulkTagItemsSchema,
  tagsAfterBulkEdit,
} from "@inventory/shared";
import { and, eq, inArray } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../../db";
import { items } from "../../db/schema";
import { requireAuth, type AppEnv } from "../../middleware/auth";

export const bulkTagItemsRoute = new Hono<AppEnv>().post(
  "/bulk-tags",
  requireAuth,
  async (c) => {
    const parsed = bulkTagItemsSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.json({ success: false, message: "Invalid tag change." }, 400);
    }
    const { itemGuids, mode, tags } = parsed.data;
    const result = await db.transaction(async (tx) => {
      const lockedItems = await tx
        .select({ id: items.id, name: items.name, tags: items.tags })
        .from(items)
        .where(
          and(
            inArray(items.guid, itemGuids),
            eq(items.userId, c.get("userId")),
            eq(items.isDeleted, false),
          ),
        )
        .orderBy(items.id)
        .for("update");
      if (lockedItems.length === 0) {
        return { success: false, message: "No items found." };
      }
      const editedItems = lockedItems.map((item) => ({
        ...item,
        tagsAfterEdit: tagsAfterBulkEdit(item.tags, mode, tags),
      }));
      const overfullItem = editedItems.find(
        (item) => item.tagsAfterEdit.length > ITEM_TAGS_MAX,
      );
      if (overfullItem) {
        return {
          success: false,
          message: `${overfullItem.name} would have more than ${ITEM_TAGS_MAX} tags.`,
        };
      }
      for (const item of editedItems) {
        await tx
          .update(items)
          .set({ tags: item.tagsAfterEdit, updatedAt: new Date() })
          .where(eq(items.id, item.id));
      }
      return {
        success: true,
        message: "Updated tags.",
        data: { itemCount: editedItems.length },
      };
    });
    return c.json(result);
  },
);
