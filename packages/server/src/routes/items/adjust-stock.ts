import { adjustStockFormSchema } from "@inventory/shared";
import { and, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../../db";
import { items, stockMovements } from "../../db/schema";
import { isItemGuid, toInventoryItem } from "../../lib/items";
import { requireAuth, type AppEnv } from "../../middleware/auth";

export const adjustStockRoute = new Hono<AppEnv>().post(
  "/:guid/stock-adjustments",
  requireAuth,
  async (c) => {
    const parsed = adjustStockFormSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.json({ success: false, message: "Invalid adjustment." }, 400);
    }
    const itemGuid = c.req.param("guid");
    if (!isItemGuid(itemGuid)) {
      return c.json({ success: false, message: "Item not found." });
    }
    const { quantityChange, reason, note } = parsed.data;
    const userId = c.get("userId");
    const ownLiveItem = and(
      eq(items.guid, itemGuid),
      eq(items.userId, userId),
      eq(items.isDeleted, false),
    );
    const result = await db.transaction(async (tx) => {
      const [adjusted] = await tx
        .update(items)
        .set({
          quantity: sql`${items.quantity} + ${quantityChange}`,
          updatedAt: new Date(),
        })
        .where(and(ownLiveItem, sql`${items.quantity} + ${quantityChange} >= 0`))
        .returning();
      if (!adjusted) {
        const [existing] = await tx
          .select({ quantity: items.quantity })
          .from(items)
          .where(ownLiveItem);
        return {
          success: false,
          message: existing
            ? `Only ${existing.quantity} in stock, so ${Math.abs(quantityChange)} can't be removed.`
            : "Item not found.",
        };
      }
      await tx.insert(stockMovements).values({
        userId,
        itemId: adjusted.id,
        quantityChange,
        quantityAfter: adjusted.quantity,
        reason,
        note: note || null,
      });
      return {
        success: true,
        message: "Adjusted stock.",
        data: toInventoryItem(adjusted),
      };
    });
    return c.json(result);
  },
);
