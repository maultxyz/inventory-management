DROP INDEX "items_user_id_sku_live_unique";--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "lot_price_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "units_per_lot" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_units_per_lot_positive" CHECK (units_per_lot >= 1);--> statement-breakpoint
UPDATE "items" SET "lot_price_cents" = "unit_cost_cents";
