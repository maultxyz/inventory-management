import {
  buildUnitRemovalFormSchema,
  isKitPart,
  moduleCountsOfBuildUnits,
  partNeedsForModules,
} from "@inventory/shared";
import { and, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../../db";
import { items, stockMovements } from "../../db/schema";
import { BUILD_UNIT_NAMES } from "../../lib/constants/build-units";
import { requireAuth, type AppEnv } from "../../middleware/auth";

export const createBuildUnitRemovalRoute = new Hono<AppEnv>().post(
  "/",
  requireAuth,
  async (c) => {
    const parsed = buildUnitRemovalFormSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.json({ success: false, message: "Invalid removal." }, 400);
    }
    const { buildUnit, count } = parsed.data;
    const userId = c.get("userId");
    const buildUnitName = BUILD_UNIT_NAMES[buildUnit];
    const result = await db.transaction(async (tx) => {
      const lockedItems = await tx
        .select()
        .from(items)
        .where(and(eq(items.userId, userId), eq(items.isDeleted, false)))
        .orderBy(items.id)
        .for("update");
      const partNeeds = partNeedsForModules(
        lockedItems.filter(isKitPart),
        moduleCountsOfBuildUnits(buildUnit, count),
      );
      if (partNeeds.length === 0) {
        return {
          success: false,
          message: `No items are set up as parts of a ${buildUnitName} yet.`,
        };
      }
      const missingParts = partNeeds.filter(
        (partNeed) => partNeed.quantityMissing > 0,
      );
      if (missingParts.length > 0) {
        return {
          success: false,
          message: `Not enough stock: ${missingParts
            .map(
              (partNeed) =>
                `${partNeed.itemName} (${partNeed.quantityMissing} short)`,
            )
            .join(", ")}.`,
        };
      }
      const itemIdByGuid = new Map(
        lockedItems.map((item) => [item.guid, item.id]),
      );
      const note = `${count} × ${buildUnitName}`;
      for (const partNeed of partNeeds) {
        const itemId = itemIdByGuid.get(partNeed.itemGuid)!;
        await tx
          .update(items)
          .set({
            quantity: sql`${items.quantity} - ${partNeed.quantityNeeded}`,
            updatedAt: new Date(),
          })
          .where(eq(items.id, itemId));
        await tx.insert(stockMovements).values({
          userId,
          itemId,
          quantityChange: -partNeed.quantityNeeded,
          quantityAfter: partNeed.quantityInStock - partNeed.quantityNeeded,
          reason: "packed",
          note,
        });
      }
      return {
        success: true,
        message: `Removed parts for ${note}.`,
        data: partNeeds,
      };
    });
    return c.json(result);
  },
);
