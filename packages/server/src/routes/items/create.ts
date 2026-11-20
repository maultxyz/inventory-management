import { createItemFormSchema } from "@inventory/shared";
import { Hono } from "hono";
import { db } from "../../db";
import { items, stockMovements } from "../../db/schema";
import { toInventoryItem, toItemDetailColumns } from "../../lib/items";
import { requireAuth, type AppEnv } from "../../middleware/auth";

export const createItemRoute = new Hono<AppEnv>().post(
  "/",
  requireAuth,
  async (c) => {
    const parsed = createItemFormSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.json({ success: false, message: "Invalid item." }, 400);
    }
    const userId = c.get("userId");
    const result = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(items)
        .values({
          ...toItemDetailColumns(parsed.data),
          userId,
          quantity: parsed.data.quantity,
        })
        .returning();
      if (created.quantity > 0) {
        await tx.insert(stockMovements).values({
          userId,
          itemId: created.id,
          quantityChange: created.quantity,
          quantityAfter: created.quantity,
          reason: "created",
        });
      }
      return {
        success: true,
        message: "Added item.",
        data: toInventoryItem(created),
      };
    });
    return c.json(result);
  },
);
