ALTER TYPE "public"."order_status" ADD VALUE 'PAUSED';--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'CANCELLED';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "is_recurring" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "frequency" "subscription_frequency";--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "custom_days" integer;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "next_delivery_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "paused_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "cancelled_at" timestamp with time zone;