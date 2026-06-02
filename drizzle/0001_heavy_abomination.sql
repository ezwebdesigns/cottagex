CREATE TABLE "search_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"city" text NOT NULL,
	"category" text NOT NULL,
	"category_fr" text,
	"affiliate_url" text NOT NULL,
	"platform" varchar(50) DEFAULT 'vrbo',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "cta_description" text;--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "explore_title" varchar(255);--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "explore_subtitle" varchar(255);--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "explore_description" text;--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "explore_items" json DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "location_data" json DEFAULT '{}'::json;