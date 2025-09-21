CREATE TYPE "public"."product_categories" AS ENUM('frutas', 'legumes', 'verduras', 'ervas', 'graos', 'tuberculos', 'hortalicas', 'organicos', 'ovos', 'mel', 'cogumelos', 'temperos', 'sementes', 'castanhas', 'integrais', 'conservas', 'compotas', 'polpa_fruta', 'polpa_vegetal', 'sazonal', 'flores_comestiveis', 'vegano', 'kits', 'outros');--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"image_url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"category" "product_categories" NOT NULL,
	"producer_id" uuid NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_producer_id_users_id_fk" FOREIGN KEY ("producer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;