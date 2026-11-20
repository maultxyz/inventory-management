import { bulkAdjustStockSchema } from "@inventory/shared";
import { and, eq, inArray, sql } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../../db";
import { items, stockMovements } from "../../db/schema";
import { requireAuth, type AppEnv } from "../../middleware/auth";

export const bulkAdjustStockRoute = new Hono<AppEnv>().post(
  "/bulk-stock-adjustments",
  requireAuth,
  async (c) => {
    const parsed = bulkAdjustStockSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.json({ success: false, message: "Invalid adjustment." }, 400);
    }
    const { itemGuids, quantityChange, reason, note } = parsed.data;
    const userId = c.get("userId");
    const result = await db.transaction(async (tx) => {
      const lockedItems = await tx
        .select({ id: items.id, name: items.name, quantity: items.quantity })
        .from(items)
        .where(
          and(
            inArray(items.guid, itemGuids),
            eq(items.userId, userId),
            eq(items.isDeleted, false),
          ),
        )
        .orderBy(items.id)
        .for("update");
      if (lockedItems.length === 0) {
        return { success: false, message: "No items found." };
      }
      const shortItems = lockedItems.filter(
        (item) => item.quantity + quantityChange < 0,
      );
      if (shortItems.length > 0) {
        return {
          success: false,
          message: `Not enough stock: ${shortItems
            .map((item) => `${item.name} (${item.quantity} in stock)`)
            .join(", ")}.`,
        };
      }
      await tx
        .update(items)
        .set({
          quantity: sql`${items.quantity} + ${quantityChange}`,
          updatedAt: new Date(),
        })
        .where(
          inArray(
            items.id,
            lockedItems.map((item) => item.id),
          ),
        );
      await tx.insert(stockMovements).values(
        lockedItems.map((item) => ({
          userId,
          itemId: item.id,
          quantityChange,
          quantityAfter: item.quantity + quantityChange,
          reason,
          note: note || null,
        })),
      );
      return {
        success: true,
        message: "Adjusted stock.",
        data: { itemCount: lockedItems.length },
      };
    });
    return c.json(result);
  },
);
