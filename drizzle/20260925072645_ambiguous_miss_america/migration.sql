ALTER TABLE "courses" ADD COLUMN "stripe_price_id" text;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_stripe_price_id_key" UNIQUE("stripe_price_id");