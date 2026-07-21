


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."ad_banners" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "text" DEFAULT 'image'::"text",
    "title" "text",
    "subtitle" "text",
    "image_url" "text",
    "link" "text",
    "button_text" "text",
    "bg_color" "text" DEFAULT '#000000'::"text",
    "script_content" "text",
    "sort_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "display_type" "text" DEFAULT 'full'::"text"
);


ALTER TABLE "public"."ad_banners" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."affiliatecottages" (
    "id" integer NOT NULL,
    "property_token" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "province" "text" NOT NULL,
    "name" "text" NOT NULL,
    "type" "text",
    "source" "text",
    "thumbnail" "text",
    "photos" "jsonb" DEFAULT '[]'::"jsonb",
    "lat" double precision,
    "lng" double precision,
    "price_cad" integer,
    "price_before_taxes" integer,
    "rating" double precision,
    "reviews" integer,
    "sleeps" integer,
    "bedrooms" integer,
    "bathrooms" integer,
    "sqm" integer,
    "amenities" "jsonb" DEFAULT '[]'::"jsonb",
    "excluded_amenities" "jsonb" DEFAULT '[]'::"jsonb",
    "check_in_time" "text",
    "check_out_time" "text",
    "google_link" "text",
    "affiliate_url" "text",
    "available" boolean DEFAULT true,
    "is_featured" boolean DEFAULT false,
    "image_alt" "text",
    "ping_status" integer,
    "last_pinged" timestamp with time zone,
    "last_synced" "date",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."affiliatecottages" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."affiliatecottages_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."affiliatecottages_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."affiliatecottages_id_seq" OWNED BY "public"."affiliatecottages"."id";



CREATE TABLE IF NOT EXISTS "public"."articles" (
    "id" integer NOT NULL,
    "title" character varying(255) NOT NULL,
    "slug" character varying(255) NOT NULL,
    "type" character varying(50) DEFAULT 'standard'::character varying NOT NULL,
    "content" "text" DEFAULT ''::"text",
    "excerpt" "text",
    "category" character varying(100),
    "author" character varying(255) DEFAULT 'Editorial Team'::character varying,
    "featured_image" "text",
    "image_alt" character varying(255),
    "seo_title" character varying(255),
    "faq" "jsonb" DEFAULT '[]'::"jsonb",
    "cta_title" character varying(255),
    "cta_button" character varying(255),
    "cta_link" "text",
    "is_published" boolean DEFAULT true,
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "seo_keywords" "text"
);


ALTER TABLE "public"."articles" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."articles_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."articles_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."articles_id_seq" OWNED BY "public"."articles"."id";



CREATE TABLE IF NOT EXISTS "public"."b44_products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "brand" "text" DEFAULT ''::"text" NOT NULL,
    "category" "text" DEFAULT 'Women'::"text" NOT NULL,
    "image_url" "text" DEFAULT ''::"text" NOT NULL,
    "price" double precision,
    "rating" double precision,
    "reviews_count" integer,
    "best_seller_rank" integer,
    "affiliate_url" "text" DEFAULT ''::"text" NOT NULL,
    "affiliate_site" "text" DEFAULT 'Amazon'::"text" NOT NULL,
    "description" "text" DEFAULT ''::"text" NOT NULL,
    "material" "text" DEFAULT ''::"text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "is_featured" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."b44_products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."brands" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "logo_url" "text",
    "link" "text" DEFAULT ''::"text",
    "sort_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."brands" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."catalogue_pages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "label" "text" NOT NULL,
    "value" "text" NOT NULL,
    "description" "text",
    "image_url" "text",
    "link" "text",
    "faq_schema" "jsonb" DEFAULT '[]'::"jsonb",
    "sort_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."catalogue_pages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."category_content" (
    "slug" "text" NOT NULL,
    "category_name" "text" NOT NULL,
    "intro_html" "text" NOT NULL,
    "faq" "jsonb" DEFAULT '[]'::"jsonb",
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."category_content" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."category_tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "label" "text" NOT NULL,
    "value" "text" NOT NULL,
    "sort_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "image_url" "text",
    "description" "text"
);


ALTER TABLE "public"."category_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cta_cards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "image_url" "text",
    "link" "text" NOT NULL,
    "bg_color" "text",
    "text_color" "text",
    "sort_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."cta_cards" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."editorial_cards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "image_url" "text",
    "button_text" "text",
    "button_link" "text",
    "secondary_text" "text",
    "secondary_link" "text",
    "sort_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."editorial_cards" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."featured_sections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "category" "text",
    "product_limit" integer DEFAULT 6,
    "sort_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "format" "text" DEFAULT 'product'::"text",
    "content" "text",
    "image_url" "text",
    "script_content" "text"
);


ALTER TABLE "public"."featured_sections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hero_banners" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "subtitle" "text",
    "image_url" "text" NOT NULL,
    "link" "text" NOT NULL,
    "sort_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."hero_banners" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."home_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "label" "text" NOT NULL,
    "value" "text" NOT NULL,
    "image_url" "text",
    "sort_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "description" "text",
    "faq_schema" "jsonb" DEFAULT '[]'::"jsonb"
);


ALTER TABLE "public"."home_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."home_sections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "section_type" "text" DEFAULT 'products'::"text",
    "category" "text",
    "sort_order" integer DEFAULT 0,
    "product_limit" integer DEFAULT 8,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "description" "text",
    "image_url" "text",
    "featured_section_id" "uuid",
    "featured_section_id_2" "uuid",
    "selected_ids" "jsonb" DEFAULT '[]'::"jsonb",
    "ad_display_type" "text" DEFAULT ''::"text",
    "sort_by" "text" DEFAULT ''::"text",
    "brand_filter" "text" DEFAULT ''::"text",
    "min_rating" numeric DEFAULT 0
);


ALTER TABLE "public"."home_sections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."library_images" (
    "id" integer NOT NULL,
    "name" character varying(255),
    "url" "text" NOT NULL,
    "mimetype" character varying(100),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."library_images" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."library_images_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."library_images_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."library_images_id_seq" OWNED BY "public"."library_images"."id";



CREATE TABLE IF NOT EXISTS "public"."listicle_items" (
    "id" integer NOT NULL,
    "article_id" integer NOT NULL,
    "rank" integer NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "rating" character varying(10),
    "price" numeric(10,2),
    "image" "text",
    "vibe" character varying(100),
    "vrbo_link" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."listicle_items" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."listicle_items_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."listicle_items_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."listicle_items_id_seq" OWNED BY "public"."listicle_items"."id";



CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "subject" "text" DEFAULT ''::"text",
    "message" "text" NOT NULL,
    "read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."messages_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."messages_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."messages_id_seq" OWNED BY "public"."messages"."id";



CREATE TABLE IF NOT EXISTS "public"."pages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "type" "text" DEFAULT 'static_page'::"text",
    "excerpt" "text",
    "cover_image" "text",
    "published" boolean DEFAULT false,
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "author" "text" DEFAULT ''::"text",
    "category" "text" DEFAULT 'News'::"text",
    "seo_title" "text" DEFAULT ''::"text",
    "meta_description" "text" DEFAULT ''::"text",
    "keywords" "jsonb" DEFAULT '[]'::"jsonb",
    "faq" "jsonb" DEFAULT '[]'::"jsonb",
    "cta_title" "text" DEFAULT ''::"text",
    "cta_button" "text" DEFAULT ''::"text",
    "cta_link" "text" DEFAULT ''::"text",
    "template" character varying(50) DEFAULT 'standard'::character varying NOT NULL,
    "featured_image" "text",
    "cta_description" "text",
    "explore_title" character varying(255),
    "explore_subtitle" character varying(255),
    "explore_description" "text",
    "explore_items" "jsonb" DEFAULT '[]'::"jsonb",
    "location_data" "jsonb" DEFAULT '{}'::"jsonb",
    "is_published" boolean DEFAULT true
);


ALTER TABLE "public"."pages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "partnerize_id" "text" NOT NULL,
    "asin" "text",
    "title" "text",
    "image_url" "text",
    "marketplace" "text",
    "price" numeric,
    "currency" "text",
    "commission" numeric,
    "est_payout" numeric,
    "ratings_count" integer,
    "rating" numeric,
    "brand" "text",
    "category" "text",
    "availability_raw" "text",
    "is_active" boolean DEFAULT true,
    "best_seller_rank" integer,
    "deal_start" timestamp with time zone,
    "deal_end" timestamp with time zone,
    "deal_price" numeric,
    "clippable_start" timestamp with time zone,
    "clippable_end" timestamp with time zone,
    "clippable_price" numeric,
    "promo_code_start" timestamp with time zone,
    "promo_code_end" timestamp with time zone,
    "promo_code_price" numeric,
    "promo_code" "text",
    "affiliate_link" "text",
    "first_seen_at" timestamp with time zone DEFAULT "now"(),
    "last_seen_at" timestamp with time zone DEFAULT "now"(),
    "categories" "text"[] DEFAULT '{}'::"text"[],
    "has_image" boolean DEFAULT true
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."products_grouped" AS
 WITH "image_reps" AS (
         SELECT DISTINCT ON ("products"."title", "products"."marketplace", "products"."image_url") "products"."title",
            "products"."marketplace",
            "products"."image_url",
            "products"."id"
           FROM "public"."products"
          WHERE (("products"."is_active" = true) AND ("products"."has_image" = true))
          ORDER BY "products"."title", "products"."marketplace", "products"."image_url", "products"."rating" DESC NULLS LAST, "products"."ratings_count" DESC NULLS LAST, "products"."partnerize_id"
        ), "variant_images" AS (
         SELECT "image_reps"."title",
            "image_reps"."marketplace",
            "array_agg"("image_reps"."id" ORDER BY "image_reps"."image_url") AS "variant_ids",
            "array_agg"("image_reps"."image_url" ORDER BY "image_reps"."image_url") AS "variant_images"
           FROM "image_reps"
          GROUP BY "image_reps"."title", "image_reps"."marketplace"
        ), "ranked" AS (
         SELECT DISTINCT ON ("products"."title", "products"."marketplace") "products"."id",
            "products"."partnerize_id",
            "products"."asin",
            "products"."title",
            "products"."image_url",
            "products"."marketplace",
            "products"."price",
            "products"."currency",
            "products"."commission",
            "products"."est_payout",
            "products"."ratings_count",
            "products"."rating",
            "products"."brand",
            "products"."category",
            "products"."availability_raw",
            "products"."is_active",
            "products"."best_seller_rank",
            "products"."deal_start",
            "products"."deal_end",
            "products"."deal_price",
            "products"."clippable_start",
            "products"."clippable_end",
            "products"."clippable_price",
            "products"."promo_code_start",
            "products"."promo_code_end",
            "products"."promo_code_price",
            "products"."promo_code",
            "products"."affiliate_link",
            "products"."first_seen_at",
            "products"."last_seen_at",
            "products"."categories",
            "products"."has_image"
           FROM "public"."products"
          ORDER BY "products"."title", "products"."marketplace", "products"."is_active" DESC, "products"."has_image" DESC, "products"."rating" DESC NULLS LAST, "products"."ratings_count" DESC NULLS LAST, "products"."partnerize_id"
        )
 SELECT "r"."id",
    "r"."partnerize_id",
    "r"."asin",
    "r"."title",
    "r"."image_url",
    "r"."marketplace",
    "r"."price",
    "r"."currency",
    "r"."commission",
    "r"."est_payout",
    "r"."ratings_count",
    "r"."rating",
    "r"."brand",
    "r"."category",
    "r"."availability_raw",
    "r"."is_active",
    "r"."best_seller_rank",
    "r"."deal_start",
    "r"."deal_end",
    "r"."deal_price",
    "r"."clippable_start",
    "r"."clippable_end",
    "r"."clippable_price",
    "r"."promo_code_start",
    "r"."promo_code_end",
    "r"."promo_code_price",
    "r"."promo_code",
    "r"."affiliate_link",
    "r"."first_seen_at",
    "r"."last_seen_at",
    "r"."categories",
    "r"."has_image",
    COALESCE("vi"."variant_ids"[1:6], ARRAY[]::"uuid"[]) AS "variant_ids",
    COALESCE("vi"."variant_images"[1:6], ARRAY[]::"text"[]) AS "variant_images"
   FROM ("ranked" "r"
     LEFT JOIN "variant_images" "vi" ON ((("vi"."title" = "r"."title") AND ("vi"."marketplace" = "r"."marketplace"))));


ALTER VIEW "public"."products_grouped" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."properties" (
    "id" integer NOT NULL,
    "title" character varying(255) NOT NULL,
    "slug" character varying(255),
    "location" character varying(255) NOT NULL,
    "province" character varying(255) NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "rating" character varying(10),
    "reviews" integer DEFAULT 0,
    "image" "text",
    "tag" character varying(100),
    "description" "text",
    "vrbo_link" "text",
    "is_liked" boolean DEFAULT false,
    "is_published" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."properties" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."properties_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."properties_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."properties_id_seq" OWNED BY "public"."properties"."id";



CREATE TABLE IF NOT EXISTS "public"."search_links" (
    "id" integer NOT NULL,
    "city" "text" NOT NULL,
    "category" "text" NOT NULL,
    "category_fr" "text",
    "affiliate_url" "text" NOT NULL,
    "platform" character varying(50) DEFAULT 'vrbo'::character varying,
    "type" character varying(20) DEFAULT 'city'::character varying NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."search_links" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."search_links_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."search_links_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."search_links_id_seq" OWNED BY "public"."search_links"."id";



CREATE TABLE IF NOT EXISTS "public"."settings" (
    "key" "text" NOT NULL,
    "value" "jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."site_settings" (
    "id" integer NOT NULL,
    "section" character varying(100) NOT NULL,
    "data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."site_settings" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."site_settings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."site_settings_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."site_settings_id_seq" OWNED BY "public"."site_settings"."id";



CREATE TABLE IF NOT EXISTS "public"."subscribers" (
    "id" integer NOT NULL,
    "email" character varying(255) NOT NULL,
    "subscribed" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."subscribers" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."subscribers_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."subscribers_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."subscribers_id_seq" OWNED BY "public"."subscribers"."id";



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" integer NOT NULL,
    "name" character varying(255) NOT NULL,
    "email" character varying(255) NOT NULL,
    "hashed_password" "text" NOT NULL,
    "role" character varying(50) DEFAULT 'admin'::character varying NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."users_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."users_id_seq" OWNED BY "public"."users"."id";



ALTER TABLE ONLY "public"."affiliatecottages" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."affiliatecottages_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."articles" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."articles_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."library_images" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."library_images_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."listicle_items" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."listicle_items_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."messages" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."messages_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."properties" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."properties_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."search_links" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."search_links_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."site_settings" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."site_settings_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."subscribers" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."subscribers_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."users" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."users_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."ad_banners"
    ADD CONSTRAINT "ad_banners_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."affiliatecottages"
    ADD CONSTRAINT "affiliatecottages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."affiliatecottages"
    ADD CONSTRAINT "affiliatecottages_property_token_key" UNIQUE ("property_token");



ALTER TABLE ONLY "public"."articles"
    ADD CONSTRAINT "articles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."articles"
    ADD CONSTRAINT "articles_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."b44_products"
    ADD CONSTRAINT "b44_products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."catalogue_pages"
    ADD CONSTRAINT "catalogue_pages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."category_content"
    ADD CONSTRAINT "category_content_pkey" PRIMARY KEY ("slug");



ALTER TABLE ONLY "public"."category_tags"
    ADD CONSTRAINT "category_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cta_cards"
    ADD CONSTRAINT "cta_cards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."editorial_cards"
    ADD CONSTRAINT "editorial_cards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."featured_sections"
    ADD CONSTRAINT "featured_sections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hero_banners"
    ADD CONSTRAINT "hero_banners_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."home_categories"
    ADD CONSTRAINT "home_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."home_sections"
    ADD CONSTRAINT "home_sections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."library_images"
    ADD CONSTRAINT "library_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."listicle_items"
    ADD CONSTRAINT "listicle_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pages"
    ADD CONSTRAINT "pages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pages"
    ADD CONSTRAINT "pages_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_partnerize_id_key" UNIQUE ("partnerize_id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."properties"
    ADD CONSTRAINT "properties_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."search_links"
    ADD CONSTRAINT "search_links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."settings"
    ADD CONSTRAINT "settings_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."site_settings"
    ADD CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."site_settings"
    ADD CONSTRAINT "site_settings_section_key" UNIQUE ("section");



ALTER TABLE ONLY "public"."subscribers"
    ADD CONSTRAINT "subscribers_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."subscribers"
    ADD CONSTRAINT "subscribers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_affiliatecottages_available" ON "public"."affiliatecottages" USING "btree" ("available");



CREATE INDEX "idx_affiliatecottages_featured" ON "public"."affiliatecottages" USING "btree" ("is_featured");



CREATE INDEX "idx_affiliatecottages_province" ON "public"."affiliatecottages" USING "btree" ("province");



CREATE INDEX "idx_affiliatecottages_rating" ON "public"."affiliatecottages" USING "btree" ("rating" DESC);



CREATE INDEX "idx_affiliatecottages_slug" ON "public"."affiliatecottages" USING "btree" ("slug");



CREATE INDEX "idx_articles_slug" ON "public"."articles" USING "btree" ("slug");



CREATE INDEX "idx_pages_slug" ON "public"."pages" USING "btree" ("slug");



CREATE INDEX "idx_products_categories" ON "public"."products" USING "gin" ("categories");



CREATE INDEX "idx_site_settings_section" ON "public"."site_settings" USING "btree" ("section");



ALTER TABLE ONLY "public"."home_sections"
    ADD CONSTRAINT "home_sections_featured_section_id_2_fkey" FOREIGN KEY ("featured_section_id_2") REFERENCES "public"."featured_sections"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."home_sections"
    ADD CONSTRAINT "home_sections_featured_section_id_fkey" FOREIGN KEY ("featured_section_id") REFERENCES "public"."featured_sections"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."listicle_items"
    ADD CONSTRAINT "listicle_items_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id");



CREATE POLICY "Admin delete ad_banners" ON "public"."ad_banners" FOR DELETE USING ((("auth"."jwt"() ->> 'email'::"text") = 'socialmediascanada@gmail.com'::"text"));



CREATE POLICY "Admin delete catalogue_pages" ON "public"."catalogue_pages" FOR DELETE USING ((("auth"."jwt"() ->> 'email'::"text") = 'socialmediascanada@gmail.com'::"text"));



CREATE POLICY "Admin delete category_tags" ON "public"."category_tags" FOR DELETE USING ((("auth"."jwt"() ->> 'email'::"text") = 'socialmediascanada@gmail.com'::"text"));



CREATE POLICY "Admin delete cta_cards" ON "public"."cta_cards" FOR DELETE USING ((("auth"."jwt"() ->> 'email'::"text") = 'socialmediascanada@gmail.com'::"text"));



CREATE POLICY "Admin delete editorial_cards" ON "public"."editorial_cards" FOR DELETE USING ((("auth"."jwt"() ->> 'email'::"text") = 'socialmediascanada@gmail.com'::"text"));



CREATE POLICY "Admin delete featured_sections" ON "public"."featured_sections" FOR DELETE USING ((("auth"."jwt"() ->> 'email'::"text") = 'socialmediascanada@gmail.com'::"text"));



CREATE POLICY "Admin delete hero_banners" ON "public"."hero_banners" FOR DELETE USING ((("auth"."jwt"() ->> 'email'::"text") = 'socialmediascanada@gmail.com'::"text"));



CREATE POLICY "Admin delete home_categories" ON "public"."home_categories" FOR DELETE USING ((("auth"."jwt"() ->> 'email'::"text") = 'socialmediascanada@gmail.com'::"text"));



CREATE POLICY "Admin delete home_sections" ON "public"."home_sections" FOR DELETE USING ((("auth"."jwt"() ->> 'email'::"text") = 'socialmediascanada@gmail.com'::"text"));



CREATE POLICY "Admin delete pages" ON "public"."pages" FOR DELETE USING ((("auth"."jwt"() ->> 'email'::"text") = 'socialmediascanada@gmail.com'::"text"));



CREATE POLICY "Admin insert ad_banners" ON "public"."ad_banners" FOR INSERT WITH CHECK ((("auth"."jwt"() ->> 'email'::"text") = 'socialmediascanada@gmail.com'::"text"));



CREATE POLICY "Admin insert catalogue_pages" ON "public"."catalogue_pages" FOR INSERT WITH CHECK ((("auth"."jwt"() ->> 'email'::"text") = 'socialmediascanada@gmail.com'::"text"));



CREATE POLICY "Admin insert category_tags" ON "public"."category_tags" FOR INSERT WITH CHECK ((("auth"."jwt"() ->> 'email'::"text") = 'socialmediascanada@gmail.com'::"text"));



CREATE POLICY "Admin insert cta_cards" ON "public"."cta_cards" FOR INSERT WITH CHECK ((("auth"."jwt"() ->> 'email'::"text") = 'socialmediascanada@gmail.com'::"text"));



CREATE POLICY "Admin insert editorial_cards" ON "public"."editorial_cards" FOR INSERT WITH CHECK ((("auth"."jwt"() ->> 'email'::"text") = 'socialmediascanada@gmail.com'::"text"));



CREATE POLICY "Admin insert featured_sections" ON "public"."featured_sections" FOR INSERT WITH CHECK ((("auth"."jwt"() ->> 'email'::"text") = 'socialmediascanada@gmail.com'::"text"));



CREATE POLICY "Admin insert hero_banners" ON "public"."hero_banners" FOR INSERT WITH CHECK ((("auth"."jwt"() ->> 'email'::"text") = 'socialmediascanada@gmail.com'::"text"));



CREATE POLICY "Admin insert home_categories" ON "public"."home_categories" FOR INSERT WITH CHECK ((("auth"."jwt"() ->> 'email'::"text") = 'socialmediascanada@gmail.com'::"text"));



CREATE POLICY "Admin insert home_sections" ON "public"."home_sections" FOR INSERT WITH CHECK ((("auth"."jwt"() ->> 'email'::"text") = 'socialmediascanada@gmail.com'::"text"));



CREATE POLICY "Admin insert pages" ON "public"."pages" FOR INSERT WITH CHECK ((("auth"."jwt"() ->> 'email'::"text") = 'socialmediascanada@gmail.com'::"text"));



CREATE POLICY "Admin update ad_banners" ON "public"."ad_banners" FOR UPDATE USING ((("auth"."jwt"() ->> 'email'::"text") = 'socialmediascanada@gmail.com'::"text"));



CREATE POLICY "Admin update catalogue_pages" ON "public"."catalogue_pages" FOR UPDATE USING ((("auth"."jwt"() ->> 'email'::"text") = 'socialmediascanada@gmail.com'::"text"));



CREATE POLICY "Admin update category_tags" ON "public"."category_tags" FOR UPDATE USING ((("auth"."jwt"() ->> 'email'::"text") = 'socialmediascanada@gmail.com'::"text"));



CREATE POLICY "Admin update cta_cards" ON "public"."cta_cards" FOR UPDATE USING ((("auth"."jwt"() ->> 'email'::"text") = 'socialmediascanada@gmail.com'::"text"));



CREATE POLICY "Admin update editorial_cards" ON "public"."editorial_cards" FOR UPDATE USING ((("auth"."jwt"() ->> 'email'::"text") = 'socialmediascanada@gmail.com'::"text"));



CREATE POLICY "Admin update featured_sections" ON "public"."featured_sections" FOR UPDATE USING ((("auth"."jwt"() ->> 'email'::"text") = 'socialmediascanada@gmail.com'::"text"));



CREATE POLICY "Admin update hero_banners" ON "public"."hero_banners" FOR UPDATE USING ((("auth"."jwt"() ->> 'email'::"text") = 'socialmediascanada@gmail.com'::"text"));



CREATE POLICY "Admin update home_categories" ON "public"."home_categories" FOR UPDATE USING ((("auth"."jwt"() ->> 'email'::"text") = 'socialmediascanada@gmail.com'::"text"));



CREATE POLICY "Admin update home_sections" ON "public"."home_sections" FOR UPDATE USING ((("auth"."jwt"() ->> 'email'::"text") = 'socialmediascanada@gmail.com'::"text"));



CREATE POLICY "Admin update pages" ON "public"."pages" FOR UPDATE USING ((("auth"."jwt"() ->> 'email'::"text") = 'socialmediascanada@gmail.com'::"text"));



CREATE POLICY "Allow all delete" ON "public"."b44_products" FOR DELETE USING (true);



CREATE POLICY "Allow all insert" ON "public"."b44_products" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow all select" ON "public"."b44_products" FOR SELECT USING (true);



CREATE POLICY "Allow all update" ON "public"."b44_products" FOR UPDATE USING (true);



CREATE POLICY "Api functions can manage messages" ON "public"."messages" USING (true) WITH CHECK (true);



CREATE POLICY "Enable all for anon key" ON "public"."messages" USING (true) WITH CHECK (true);



CREATE POLICY "Public read access" ON "public"."category_content" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."products" FOR SELECT USING (true);



CREATE POLICY "Public read ad_banners" ON "public"."ad_banners" FOR SELECT USING (true);



CREATE POLICY "Public read catalogue_pages" ON "public"."catalogue_pages" FOR SELECT USING (true);



CREATE POLICY "Public read category_tags" ON "public"."category_tags" FOR SELECT USING (true);



CREATE POLICY "Public read cta_cards" ON "public"."cta_cards" FOR SELECT USING (true);



CREATE POLICY "Public read editorial_cards" ON "public"."editorial_cards" FOR SELECT USING (true);



CREATE POLICY "Public read featured_sections" ON "public"."featured_sections" FOR SELECT USING (true);



CREATE POLICY "Public read hero_banners" ON "public"."hero_banners" FOR SELECT USING (true);



CREATE POLICY "Public read home_categories" ON "public"."home_categories" FOR SELECT USING (true);



CREATE POLICY "Public read home_sections" ON "public"."home_sections" FOR SELECT USING (true);



CREATE POLICY "Public read pages" ON "public"."pages" FOR SELECT USING (true);



ALTER TABLE "public"."ad_banners" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "admin_all_settings" ON "public"."settings" USING ((("auth"."jwt"() ->> 'email'::"text") = 'socialmediascanada@gmail.com'::"text"));



ALTER TABLE "public"."affiliatecottages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "anon_select_settings" ON "public"."settings" FOR SELECT USING (true);



ALTER TABLE "public"."articles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."b44_products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."brands" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "brands_all_authenticated" ON "public"."brands" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "brands_all_service" ON "public"."brands" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "brands_select_anon" ON "public"."brands" FOR SELECT USING (true);



ALTER TABLE "public"."catalogue_pages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."category_content" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."category_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cta_cards" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."editorial_cards" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."featured_sections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hero_banners" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."home_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."home_sections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."library_images" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."listicle_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."properties" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."search_links" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."site_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscribers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."ad_banners" TO "anon";
GRANT ALL ON TABLE "public"."ad_banners" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."ad_banners" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."affiliatecottages" TO "anon";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."affiliatecottages" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."affiliatecottages" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."articles" TO "anon";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."articles" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."articles" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."b44_products" TO "anon";
GRANT ALL ON TABLE "public"."b44_products" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."b44_products" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."brands" TO "anon";
GRANT ALL ON TABLE "public"."brands" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."brands" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."catalogue_pages" TO "anon";
GRANT ALL ON TABLE "public"."catalogue_pages" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."catalogue_pages" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."category_content" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."category_content" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."category_content" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."category_tags" TO "anon";
GRANT ALL ON TABLE "public"."category_tags" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."category_tags" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."cta_cards" TO "anon";
GRANT ALL ON TABLE "public"."cta_cards" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."cta_cards" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."editorial_cards" TO "anon";
GRANT ALL ON TABLE "public"."editorial_cards" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."editorial_cards" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."featured_sections" TO "anon";
GRANT ALL ON TABLE "public"."featured_sections" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."featured_sections" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."hero_banners" TO "anon";
GRANT ALL ON TABLE "public"."hero_banners" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."hero_banners" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."home_categories" TO "anon";
GRANT ALL ON TABLE "public"."home_categories" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."home_categories" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."home_sections" TO "anon";
GRANT ALL ON TABLE "public"."home_sections" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."home_sections" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."library_images" TO "anon";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."library_images" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."library_images" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."listicle_items" TO "anon";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."listicle_items" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."listicle_items" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."messages" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."messages" TO "service_role";



GRANT SELECT,USAGE ON SEQUENCE "public"."messages_id_seq" TO "anon";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."pages" TO "anon";
GRANT ALL ON TABLE "public"."pages" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."pages" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."products" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."products_grouped" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."products_grouped" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."products_grouped" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."properties" TO "anon";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."properties" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."properties" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."search_links" TO "anon";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."search_links" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."search_links" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."settings" TO "anon";
GRANT ALL ON TABLE "public"."settings" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."settings" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."site_settings" TO "anon";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."site_settings" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."site_settings" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."subscribers" TO "anon";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."subscribers" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."subscribers" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."users" TO "anon";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."users" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."users" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "service_role";







