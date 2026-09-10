import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_home_blocks_hero_news_content_mode" AS ENUM('manual', 'automatic');
  CREATE TYPE "public"."enum_home_blocks_latest_posts_layout" AS ENUM('grid', 'list', 'mixed');
  CREATE TYPE "public"."enum_home_blocks_posts_by_category_layout" AS ENUM('grid', 'horizontal', 'featured-grid');
  CREATE TYPE "public"."enum_home_blocks_featured_posts_layout" AS ENUM('grid', 'carousel', 'editorial');
  CREATE TYPE "public"."enum_home_blocks_video_feature_source" AS ENUM('post', 'external');
  CREATE TYPE "public"."enum_home_blocks_banner_variant" AS ENUM('editorial', 'promotional', 'dark');
  CREATE TYPE "public"."enum_home_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__home_v_blocks_hero_news_content_mode" AS ENUM('manual', 'automatic');
  CREATE TYPE "public"."enum__home_v_blocks_latest_posts_layout" AS ENUM('grid', 'list', 'mixed');
  CREATE TYPE "public"."enum__home_v_blocks_posts_by_category_layout" AS ENUM('grid', 'horizontal', 'featured-grid');
  CREATE TYPE "public"."enum__home_v_blocks_featured_posts_layout" AS ENUM('grid', 'carousel', 'editorial');
  CREATE TYPE "public"."enum__home_v_blocks_video_feature_source" AS ENUM('post', 'external');
  CREATE TYPE "public"."enum__home_v_blocks_banner_variant" AS ENUM('editorial', 'promotional', 'dark');
  CREATE TYPE "public"."enum__home_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "home_blocks_hero_news" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"headline" varchar,
  	"description" varchar,
  	"cta_label" varchar,
  	"cta_link" varchar,
  	"content_mode" "enum_home_blocks_hero_news_content_mode" DEFAULT 'automatic',
  	"main_post_id" integer,
  	"source_category_id" integer,
  	"limit" numeric DEFAULT 4,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_category_explorer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"show_view_all" boolean DEFAULT false,
  	"view_all_label" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_latest_posts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"limit" numeric DEFAULT 6,
  	"category_id" integer,
  	"layout" "enum_home_blocks_latest_posts_layout" DEFAULT 'grid',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_posts_by_category" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"category_id" integer,
  	"limit" numeric DEFAULT 6,
  	"layout" "enum_home_blocks_posts_by_category_layout" DEFAULT 'grid',
  	"show_view_all" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_featured_posts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"layout" "enum_home_blocks_featured_posts_layout" DEFAULT 'grid',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_video_feature" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"source" "enum_home_blocks_video_feature_source" DEFAULT 'post',
  	"post_id" integer,
  	"video_u_r_l" varchar,
  	"thumbnail_id" integer,
  	"headline" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"link_label" varchar,
  	"link_u_r_l" varchar,
  	"variant" "enum_home_blocks_banner_variant" DEFAULT 'editorial',
  	"block_name" varchar
  );
  
  CREATE TABLE "home" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_meta_image_id" integer,
  	"seo_canonical_u_r_l" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"_status" "enum_home_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer,
  	"categories_id" integer
  );
  
  CREATE TABLE "_home_v_blocks_hero_news" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"headline" varchar,
  	"description" varchar,
  	"cta_label" varchar,
  	"cta_link" varchar,
  	"content_mode" "enum__home_v_blocks_hero_news_content_mode" DEFAULT 'automatic',
  	"main_post_id" integer,
  	"source_category_id" integer,
  	"limit" numeric DEFAULT 4,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v_blocks_category_explorer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"show_view_all" boolean DEFAULT false,
  	"view_all_label" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v_blocks_latest_posts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"limit" numeric DEFAULT 6,
  	"category_id" integer,
  	"layout" "enum__home_v_blocks_latest_posts_layout" DEFAULT 'grid',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v_blocks_posts_by_category" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"category_id" integer,
  	"limit" numeric DEFAULT 6,
  	"layout" "enum__home_v_blocks_posts_by_category_layout" DEFAULT 'grid',
  	"show_view_all" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v_blocks_featured_posts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"layout" "enum__home_v_blocks_featured_posts_layout" DEFAULT 'grid',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v_blocks_video_feature" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"source" "enum__home_v_blocks_video_feature_source" DEFAULT 'post',
  	"post_id" integer,
  	"video_u_r_l" varchar,
  	"thumbnail_id" integer,
  	"headline" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v_blocks_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"link_label" varchar,
  	"link_u_r_l" varchar,
  	"variant" "enum__home_v_blocks_banner_variant" DEFAULT 'editorial',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_seo_meta_image_id" integer,
  	"version_seo_canonical_u_r_l" varchar,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version__status" "enum__home_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_home_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer,
  	"categories_id" integer
  );
  
  ALTER TABLE "home_blocks_hero_news" ADD CONSTRAINT "home_blocks_hero_news_main_post_id_posts_id_fk" FOREIGN KEY ("main_post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_hero_news" ADD CONSTRAINT "home_blocks_hero_news_source_category_id_categories_id_fk" FOREIGN KEY ("source_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_hero_news" ADD CONSTRAINT "home_blocks_hero_news_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_category_explorer" ADD CONSTRAINT "home_blocks_category_explorer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_latest_posts" ADD CONSTRAINT "home_blocks_latest_posts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_latest_posts" ADD CONSTRAINT "home_blocks_latest_posts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_posts_by_category" ADD CONSTRAINT "home_blocks_posts_by_category_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_posts_by_category" ADD CONSTRAINT "home_blocks_posts_by_category_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_featured_posts" ADD CONSTRAINT "home_blocks_featured_posts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_video_feature" ADD CONSTRAINT "home_blocks_video_feature_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_video_feature" ADD CONSTRAINT "home_blocks_video_feature_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_video_feature" ADD CONSTRAINT "home_blocks_video_feature_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_banner" ADD CONSTRAINT "home_blocks_banner_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_banner" ADD CONSTRAINT "home_blocks_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_seo_meta_image_id_media_id_fk" FOREIGN KEY ("seo_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_hero_news" ADD CONSTRAINT "_home_v_blocks_hero_news_main_post_id_posts_id_fk" FOREIGN KEY ("main_post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_hero_news" ADD CONSTRAINT "_home_v_blocks_hero_news_source_category_id_categories_id_fk" FOREIGN KEY ("source_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_hero_news" ADD CONSTRAINT "_home_v_blocks_hero_news_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_category_explorer" ADD CONSTRAINT "_home_v_blocks_category_explorer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_latest_posts" ADD CONSTRAINT "_home_v_blocks_latest_posts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_latest_posts" ADD CONSTRAINT "_home_v_blocks_latest_posts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_posts_by_category" ADD CONSTRAINT "_home_v_blocks_posts_by_category_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_posts_by_category" ADD CONSTRAINT "_home_v_blocks_posts_by_category_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_featured_posts" ADD CONSTRAINT "_home_v_blocks_featured_posts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_video_feature" ADD CONSTRAINT "_home_v_blocks_video_feature_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_video_feature" ADD CONSTRAINT "_home_v_blocks_video_feature_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_video_feature" ADD CONSTRAINT "_home_v_blocks_video_feature_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_banner" ADD CONSTRAINT "_home_v_blocks_banner_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_banner" ADD CONSTRAINT "_home_v_blocks_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_seo_meta_image_id_media_id_fk" FOREIGN KEY ("version_seo_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_rels" ADD CONSTRAINT "_home_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_rels" ADD CONSTRAINT "_home_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_rels" ADD CONSTRAINT "_home_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_blocks_hero_news_order_idx" ON "home_blocks_hero_news" USING btree ("_order");
  CREATE INDEX "home_blocks_hero_news_parent_id_idx" ON "home_blocks_hero_news" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_hero_news_path_idx" ON "home_blocks_hero_news" USING btree ("_path");
  CREATE INDEX "home_blocks_hero_news_main_post_idx" ON "home_blocks_hero_news" USING btree ("main_post_id");
  CREATE INDEX "home_blocks_hero_news_source_category_idx" ON "home_blocks_hero_news" USING btree ("source_category_id");
  CREATE INDEX "home_blocks_category_explorer_order_idx" ON "home_blocks_category_explorer" USING btree ("_order");
  CREATE INDEX "home_blocks_category_explorer_parent_id_idx" ON "home_blocks_category_explorer" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_category_explorer_path_idx" ON "home_blocks_category_explorer" USING btree ("_path");
  CREATE INDEX "home_blocks_latest_posts_order_idx" ON "home_blocks_latest_posts" USING btree ("_order");
  CREATE INDEX "home_blocks_latest_posts_parent_id_idx" ON "home_blocks_latest_posts" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_latest_posts_path_idx" ON "home_blocks_latest_posts" USING btree ("_path");
  CREATE INDEX "home_blocks_latest_posts_category_idx" ON "home_blocks_latest_posts" USING btree ("category_id");
  CREATE INDEX "home_blocks_posts_by_category_order_idx" ON "home_blocks_posts_by_category" USING btree ("_order");
  CREATE INDEX "home_blocks_posts_by_category_parent_id_idx" ON "home_blocks_posts_by_category" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_posts_by_category_path_idx" ON "home_blocks_posts_by_category" USING btree ("_path");
  CREATE INDEX "home_blocks_posts_by_category_category_idx" ON "home_blocks_posts_by_category" USING btree ("category_id");
  CREATE INDEX "home_blocks_featured_posts_order_idx" ON "home_blocks_featured_posts" USING btree ("_order");
  CREATE INDEX "home_blocks_featured_posts_parent_id_idx" ON "home_blocks_featured_posts" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_featured_posts_path_idx" ON "home_blocks_featured_posts" USING btree ("_path");
  CREATE INDEX "home_blocks_video_feature_order_idx" ON "home_blocks_video_feature" USING btree ("_order");
  CREATE INDEX "home_blocks_video_feature_parent_id_idx" ON "home_blocks_video_feature" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_video_feature_path_idx" ON "home_blocks_video_feature" USING btree ("_path");
  CREATE INDEX "home_blocks_video_feature_post_idx" ON "home_blocks_video_feature" USING btree ("post_id");
  CREATE INDEX "home_blocks_video_feature_thumbnail_idx" ON "home_blocks_video_feature" USING btree ("thumbnail_id");
  CREATE INDEX "home_blocks_banner_order_idx" ON "home_blocks_banner" USING btree ("_order");
  CREATE INDEX "home_blocks_banner_parent_id_idx" ON "home_blocks_banner" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_banner_path_idx" ON "home_blocks_banner" USING btree ("_path");
  CREATE INDEX "home_blocks_banner_image_idx" ON "home_blocks_banner" USING btree ("image_id");
  CREATE INDEX "home_seo_seo_meta_image_idx" ON "home" USING btree ("seo_meta_image_id");
  CREATE INDEX "home__status_idx" ON "home" USING btree ("_status");
  CREATE INDEX "home_rels_order_idx" ON "home_rels" USING btree ("order");
  CREATE INDEX "home_rels_parent_idx" ON "home_rels" USING btree ("parent_id");
  CREATE INDEX "home_rels_path_idx" ON "home_rels" USING btree ("path");
  CREATE INDEX "home_rels_posts_id_idx" ON "home_rels" USING btree ("posts_id");
  CREATE INDEX "home_rels_categories_id_idx" ON "home_rels" USING btree ("categories_id");
  CREATE INDEX "_home_v_blocks_hero_news_order_idx" ON "_home_v_blocks_hero_news" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_hero_news_parent_id_idx" ON "_home_v_blocks_hero_news" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_hero_news_path_idx" ON "_home_v_blocks_hero_news" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_hero_news_main_post_idx" ON "_home_v_blocks_hero_news" USING btree ("main_post_id");
  CREATE INDEX "_home_v_blocks_hero_news_source_category_idx" ON "_home_v_blocks_hero_news" USING btree ("source_category_id");
  CREATE INDEX "_home_v_blocks_category_explorer_order_idx" ON "_home_v_blocks_category_explorer" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_category_explorer_parent_id_idx" ON "_home_v_blocks_category_explorer" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_category_explorer_path_idx" ON "_home_v_blocks_category_explorer" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_latest_posts_order_idx" ON "_home_v_blocks_latest_posts" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_latest_posts_parent_id_idx" ON "_home_v_blocks_latest_posts" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_latest_posts_path_idx" ON "_home_v_blocks_latest_posts" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_latest_posts_category_idx" ON "_home_v_blocks_latest_posts" USING btree ("category_id");
  CREATE INDEX "_home_v_blocks_posts_by_category_order_idx" ON "_home_v_blocks_posts_by_category" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_posts_by_category_parent_id_idx" ON "_home_v_blocks_posts_by_category" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_posts_by_category_path_idx" ON "_home_v_blocks_posts_by_category" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_posts_by_category_category_idx" ON "_home_v_blocks_posts_by_category" USING btree ("category_id");
  CREATE INDEX "_home_v_blocks_featured_posts_order_idx" ON "_home_v_blocks_featured_posts" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_featured_posts_parent_id_idx" ON "_home_v_blocks_featured_posts" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_featured_posts_path_idx" ON "_home_v_blocks_featured_posts" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_video_feature_order_idx" ON "_home_v_blocks_video_feature" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_video_feature_parent_id_idx" ON "_home_v_blocks_video_feature" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_video_feature_path_idx" ON "_home_v_blocks_video_feature" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_video_feature_post_idx" ON "_home_v_blocks_video_feature" USING btree ("post_id");
  CREATE INDEX "_home_v_blocks_video_feature_thumbnail_idx" ON "_home_v_blocks_video_feature" USING btree ("thumbnail_id");
  CREATE INDEX "_home_v_blocks_banner_order_idx" ON "_home_v_blocks_banner" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_banner_parent_id_idx" ON "_home_v_blocks_banner" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_banner_path_idx" ON "_home_v_blocks_banner" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_banner_image_idx" ON "_home_v_blocks_banner" USING btree ("image_id");
  CREATE INDEX "_home_v_version_seo_version_seo_meta_image_idx" ON "_home_v" USING btree ("version_seo_meta_image_id");
  CREATE INDEX "_home_v_version_version__status_idx" ON "_home_v" USING btree ("version__status");
  CREATE INDEX "_home_v_created_at_idx" ON "_home_v" USING btree ("created_at");
  CREATE INDEX "_home_v_updated_at_idx" ON "_home_v" USING btree ("updated_at");
  CREATE INDEX "_home_v_latest_idx" ON "_home_v" USING btree ("latest");
  CREATE INDEX "_home_v_rels_order_idx" ON "_home_v_rels" USING btree ("order");
  CREATE INDEX "_home_v_rels_parent_idx" ON "_home_v_rels" USING btree ("parent_id");
  CREATE INDEX "_home_v_rels_path_idx" ON "_home_v_rels" USING btree ("path");
  CREATE INDEX "_home_v_rels_posts_id_idx" ON "_home_v_rels" USING btree ("posts_id");
  CREATE INDEX "_home_v_rels_categories_id_idx" ON "_home_v_rels" USING btree ("categories_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "home_blocks_hero_news" CASCADE;
  DROP TABLE "home_blocks_category_explorer" CASCADE;
  DROP TABLE "home_blocks_latest_posts" CASCADE;
  DROP TABLE "home_blocks_posts_by_category" CASCADE;
  DROP TABLE "home_blocks_featured_posts" CASCADE;
  DROP TABLE "home_blocks_video_feature" CASCADE;
  DROP TABLE "home_blocks_banner" CASCADE;
  DROP TABLE "home" CASCADE;
  DROP TABLE "home_rels" CASCADE;
  DROP TABLE "_home_v_blocks_hero_news" CASCADE;
  DROP TABLE "_home_v_blocks_category_explorer" CASCADE;
  DROP TABLE "_home_v_blocks_latest_posts" CASCADE;
  DROP TABLE "_home_v_blocks_posts_by_category" CASCADE;
  DROP TABLE "_home_v_blocks_featured_posts" CASCADE;
  DROP TABLE "_home_v_blocks_video_feature" CASCADE;
  DROP TABLE "_home_v_blocks_banner" CASCADE;
  DROP TABLE "_home_v" CASCADE;
  DROP TABLE "_home_v_rels" CASCADE;
  DROP TYPE "public"."enum_home_blocks_hero_news_content_mode";
  DROP TYPE "public"."enum_home_blocks_latest_posts_layout";
  DROP TYPE "public"."enum_home_blocks_posts_by_category_layout";
  DROP TYPE "public"."enum_home_blocks_featured_posts_layout";
  DROP TYPE "public"."enum_home_blocks_video_feature_source";
  DROP TYPE "public"."enum_home_blocks_banner_variant";
  DROP TYPE "public"."enum_home_status";
  DROP TYPE "public"."enum__home_v_blocks_hero_news_content_mode";
  DROP TYPE "public"."enum__home_v_blocks_latest_posts_layout";
  DROP TYPE "public"."enum__home_v_blocks_posts_by_category_layout";
  DROP TYPE "public"."enum__home_v_blocks_featured_posts_layout";
  DROP TYPE "public"."enum__home_v_blocks_video_feature_source";
  DROP TYPE "public"."enum__home_v_blocks_banner_variant";
  DROP TYPE "public"."enum__home_v_version_status";`)
}
