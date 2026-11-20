ALTER TABLE "items" ADD COLUMN "feeder_module_quantity" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "device_module_quantity" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "sorting_module_quantity" integer DEFAULT 0 NOT NULL;