CREATE TYPE "public"."order_item_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'PARTIALLY_COMPLETED';--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "status" "order_item_status" DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;