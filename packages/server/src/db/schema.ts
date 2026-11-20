import type { StockMovementReason } from "@inventory/shared";
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const items = pgTable(
  "items",
  {
    id: serial().primaryKey(),
    guid: uuid("guid").defaultRandom().notNull().unique(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    location: text("location"),
    quantity: integer("quantity").notNull().default(0),
    reorderLevel: integer("reorder_level").notNull().default(0),
    lotPriceCents: integer("lot_price_cents").notNull().default(0),
    unitsPerLot: integer("units_per_lot").notNull().default(1),
    feederModuleQuantity: integer("feeder_module_quantity")
      .notNull()
      .default(0),
    deviceModuleQuantity: integer("device_module_quantity")
      .notNull()
      .default(0),
    sortingModuleQuantity: integer("sorting_module_quantity")
      .notNull()
      .default(0),
    purchaseUrl: text("purchase_url"),
    tags: text("tags")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    notes: text("notes"),
    isDeleted: boolean("is_deleted").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("items_user_id_idx").on(table.userId),
    check("items_quantity_not_negative", sql`quantity >= 0`),
    check("items_units_per_lot_positive", sql`units_per_lot >= 1`),
  ],
);

export const stockMovements = pgTable(
  "stock_movements",
  {
    id: serial().primaryKey(),
    guid: uuid("guid").defaultRandom().notNull().unique(),
    userId: text("user_id").notNull(),
    itemId: integer("item_id")
      .notNull()
      .references(() => items.id),
    quantityChange: integer("quantity_change").notNull(),
    quantityAfter: integer("quantity_after").notNull(),
    reason: text("reason").$type<StockMovementReason>().notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("stock_movements_user_id_created_at_idx").on(
      table.userId,
      table.createdAt.desc(),
    ),
    index("stock_movements_item_id_idx").on(table.itemId),
  ],
);
