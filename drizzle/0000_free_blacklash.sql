CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"type" varchar(50) DEFAULT 'standard' NOT NULL,
	"content" text DEFAULT '',
	"excerpt" text,
	"category" varchar(100),
	"author" varchar(255) DEFAULT 'Editorial Team',
	"featured_image" text,
	"seo_title" varchar(255),
	"faq" json DEFAULT '[]'::json,
	"cta_title" varchar(255),
	"cta_button" varchar(255),
	"cta_link" text,
	"is_published" boolean DEFAULT true,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "library_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"url" text NOT NULL,
	"mimetype" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listicle_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"article_id" integer NOT NULL,
	"rank" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"rating" varchar(10),
	"price" numeric(10, 2),
	"image" text,
	"vibe" varchar(100),
	"vrbo_link" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"text" text NOT NULL,
	"read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"template" varchar(50) DEFAULT 'standard' NOT NULL,
	"content" text DEFAULT '',
	"seo_title" varchar(255),
	"meta_description" text,
	"featured_image" text,
	"faq" json DEFAULT '[]'::json,
	"cta_title" varchar(255),
	"cta_button" varchar(255),
	"cta_link" text,
	"is_published" boolean DEFAULT true,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255),
	"location" varchar(255) NOT NULL,
	"province" varchar(255) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"rating" varchar(10),
	"reviews" integer DEFAULT 0,
	"image" text,
	"tag" varchar(100),
	"description" text,
	"vrbo_link" text,
	"is_liked" boolean DEFAULT false,
	"is_published" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"section" varchar(100) NOT NULL,
	"data" json DEFAULT '{}'::json NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "site_settings_section_unique" UNIQUE("section")
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"subscribed" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"hashed_password" text NOT NULL,
	"role" varchar(50) DEFAULT 'admin' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "listicle_items" ADD CONSTRAINT "listicle_items_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE no action ON UPDATE no action;