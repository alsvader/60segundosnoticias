import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_banner_link_type" AS ENUM('category', 'page', 'external');
  CREATE TYPE "public"."enum__pages_v_blocks_banner_link_type" AS ENUM('category', 'page', 'external');
  CREATE TYPE "public"."enum_home_blocks_editorial_intro_cta_type" AS ENUM('category', 'page', 'external');
  CREATE TYPE "public"."enum_home_blocks_hero_news_cta_type" AS ENUM('category', 'page', 'external');
  CREATE TYPE "public"."enum_home_blocks_banner_link_type" AS ENUM('category', 'page', 'external');
  CREATE TYPE "public"."enum__home_v_blocks_editorial_intro_cta_type" AS ENUM('category', 'page', 'external');
  CREATE TYPE "public"."enum__home_v_blocks_hero_news_cta_type" AS ENUM('category', 'page', 'external');
  CREATE TYPE "public"."enum__home_v_blocks_banner_link_type" AS ENUM('category', 'page', 'external');
  ALTER TABLE "pages_blocks_banner" ADD COLUMN "link_type" "enum_pages_blocks_banner_link_type";
  ALTER TABLE "pages_blocks_banner" ADD COLUMN "link_category_id" integer;
  ALTER TABLE "pages_blocks_banner" ADD COLUMN "link_page_id" integer;
  ALTER TABLE "pages_blocks_banner" ADD COLUMN "link_url" varchar;
  ALTER TABLE "pages_blocks_banner" ADD COLUMN "link_open_in_new_tab" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_banner" ADD COLUMN "link_type" "enum__pages_v_blocks_banner_link_type";
  ALTER TABLE "_pages_v_blocks_banner" ADD COLUMN "link_category_id" integer;
  ALTER TABLE "_pages_v_blocks_banner" ADD COLUMN "link_page_id" integer;
  ALTER TABLE "_pages_v_blocks_banner" ADD COLUMN "link_url" varchar;
  ALTER TABLE "_pages_v_blocks_banner" ADD COLUMN "link_open_in_new_tab" boolean DEFAULT false;
  ALTER TABLE "home_blocks_editorial_intro" ADD COLUMN "cta_type" "enum_home_blocks_editorial_intro_cta_type";
  ALTER TABLE "home_blocks_editorial_intro" ADD COLUMN "cta_category_id" integer;
  ALTER TABLE "home_blocks_editorial_intro" ADD COLUMN "cta_page_id" integer;
  ALTER TABLE "home_blocks_editorial_intro" ADD COLUMN "cta_url" varchar;
  ALTER TABLE "home_blocks_editorial_intro" ADD COLUMN "cta_open_in_new_tab" boolean DEFAULT false;
  ALTER TABLE "home_blocks_hero_news" ADD COLUMN "cta_type" "enum_home_blocks_hero_news_cta_type";
  ALTER TABLE "home_blocks_hero_news" ADD COLUMN "cta_category_id" integer;
  ALTER TABLE "home_blocks_hero_news" ADD COLUMN "cta_page_id" integer;
  ALTER TABLE "home_blocks_hero_news" ADD COLUMN "cta_url" varchar;
  ALTER TABLE "home_blocks_hero_news" ADD COLUMN "cta_open_in_new_tab" boolean DEFAULT false;
  ALTER TABLE "home_blocks_banner" ADD COLUMN "link_type" "enum_home_blocks_banner_link_type";
  ALTER TABLE "home_blocks_banner" ADD COLUMN "link_category_id" integer;
  ALTER TABLE "home_blocks_banner" ADD COLUMN "link_page_id" integer;
  ALTER TABLE "home_blocks_banner" ADD COLUMN "link_url" varchar;
  ALTER TABLE "home_blocks_banner" ADD COLUMN "link_open_in_new_tab" boolean DEFAULT false;
  ALTER TABLE "_home_v_blocks_editorial_intro" ADD COLUMN "cta_type" "enum__home_v_blocks_editorial_intro_cta_type";
  ALTER TABLE "_home_v_blocks_editorial_intro" ADD COLUMN "cta_category_id" integer;
  ALTER TABLE "_home_v_blocks_editorial_intro" ADD COLUMN "cta_page_id" integer;
  ALTER TABLE "_home_v_blocks_editorial_intro" ADD COLUMN "cta_url" varchar;
  ALTER TABLE "_home_v_blocks_editorial_intro" ADD COLUMN "cta_open_in_new_tab" boolean DEFAULT false;
  ALTER TABLE "_home_v_blocks_hero_news" ADD COLUMN "cta_type" "enum__home_v_blocks_hero_news_cta_type";
  ALTER TABLE "_home_v_blocks_hero_news" ADD COLUMN "cta_category_id" integer;
  ALTER TABLE "_home_v_blocks_hero_news" ADD COLUMN "cta_page_id" integer;
  ALTER TABLE "_home_v_blocks_hero_news" ADD COLUMN "cta_url" varchar;
  ALTER TABLE "_home_v_blocks_hero_news" ADD COLUMN "cta_open_in_new_tab" boolean DEFAULT false;
  ALTER TABLE "_home_v_blocks_banner" ADD COLUMN "link_type" "enum__home_v_blocks_banner_link_type";
  ALTER TABLE "_home_v_blocks_banner" ADD COLUMN "link_category_id" integer;
  ALTER TABLE "_home_v_blocks_banner" ADD COLUMN "link_page_id" integer;
  ALTER TABLE "_home_v_blocks_banner" ADD COLUMN "link_url" varchar;
  ALTER TABLE "_home_v_blocks_banner" ADD COLUMN "link_open_in_new_tab" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_banner" ADD CONSTRAINT "pages_blocks_banner_link_category_id_categories_id_fk" FOREIGN KEY ("link_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_banner" ADD CONSTRAINT "pages_blocks_banner_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_banner" ADD CONSTRAINT "_pages_v_blocks_banner_link_category_id_categories_id_fk" FOREIGN KEY ("link_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_banner" ADD CONSTRAINT "_pages_v_blocks_banner_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_editorial_intro" ADD CONSTRAINT "home_blocks_editorial_intro_cta_category_id_categories_id_fk" FOREIGN KEY ("cta_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_editorial_intro" ADD CONSTRAINT "home_blocks_editorial_intro_cta_page_id_pages_id_fk" FOREIGN KEY ("cta_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_hero_news" ADD CONSTRAINT "home_blocks_hero_news_cta_category_id_categories_id_fk" FOREIGN KEY ("cta_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_hero_news" ADD CONSTRAINT "home_blocks_hero_news_cta_page_id_pages_id_fk" FOREIGN KEY ("cta_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_banner" ADD CONSTRAINT "home_blocks_banner_link_category_id_categories_id_fk" FOREIGN KEY ("link_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_banner" ADD CONSTRAINT "home_blocks_banner_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_editorial_intro" ADD CONSTRAINT "_home_v_blocks_editorial_intro_cta_category_id_categories_id_fk" FOREIGN KEY ("cta_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_editorial_intro" ADD CONSTRAINT "_home_v_blocks_editorial_intro_cta_page_id_pages_id_fk" FOREIGN KEY ("cta_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_hero_news" ADD CONSTRAINT "_home_v_blocks_hero_news_cta_category_id_categories_id_fk" FOREIGN KEY ("cta_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_hero_news" ADD CONSTRAINT "_home_v_blocks_hero_news_cta_page_id_pages_id_fk" FOREIGN KEY ("cta_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_banner" ADD CONSTRAINT "_home_v_blocks_banner_link_category_id_categories_id_fk" FOREIGN KEY ("link_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_banner" ADD CONSTRAINT "_home_v_blocks_banner_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_banner_link_link_category_idx" ON "pages_blocks_banner" USING btree ("link_category_id");
  CREATE INDEX "pages_blocks_banner_link_link_page_idx" ON "pages_blocks_banner" USING btree ("link_page_id");
  CREATE INDEX "_pages_v_blocks_banner_link_link_category_idx" ON "_pages_v_blocks_banner" USING btree ("link_category_id");
  CREATE INDEX "_pages_v_blocks_banner_link_link_page_idx" ON "_pages_v_blocks_banner" USING btree ("link_page_id");
  CREATE INDEX "home_blocks_editorial_intro_cta_cta_category_idx" ON "home_blocks_editorial_intro" USING btree ("cta_category_id");
  CREATE INDEX "home_blocks_editorial_intro_cta_cta_page_idx" ON "home_blocks_editorial_intro" USING btree ("cta_page_id");
  CREATE INDEX "home_blocks_hero_news_cta_cta_category_idx" ON "home_blocks_hero_news" USING btree ("cta_category_id");
  CREATE INDEX "home_blocks_hero_news_cta_cta_page_idx" ON "home_blocks_hero_news" USING btree ("cta_page_id");
  CREATE INDEX "home_blocks_banner_link_link_category_idx" ON "home_blocks_banner" USING btree ("link_category_id");
  CREATE INDEX "home_blocks_banner_link_link_page_idx" ON "home_blocks_banner" USING btree ("link_page_id");
  CREATE INDEX "_home_v_blocks_editorial_intro_cta_cta_category_idx" ON "_home_v_blocks_editorial_intro" USING btree ("cta_category_id");
  CREATE INDEX "_home_v_blocks_editorial_intro_cta_cta_page_idx" ON "_home_v_blocks_editorial_intro" USING btree ("cta_page_id");
  CREATE INDEX "_home_v_blocks_hero_news_cta_cta_category_idx" ON "_home_v_blocks_hero_news" USING btree ("cta_category_id");
  CREATE INDEX "_home_v_blocks_hero_news_cta_cta_page_idx" ON "_home_v_blocks_hero_news" USING btree ("cta_page_id");
  CREATE INDEX "_home_v_blocks_banner_link_link_category_idx" ON "_home_v_blocks_banner" USING btree ("link_category_id");
  CREATE INDEX "_home_v_blocks_banner_link_link_page_idx" ON "_home_v_blocks_banner" USING btree ("link_page_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_banner" DROP CONSTRAINT "pages_blocks_banner_link_category_id_categories_id_fk";
  
  ALTER TABLE "pages_blocks_banner" DROP CONSTRAINT "pages_blocks_banner_link_page_id_pages_id_fk";
  
  ALTER TABLE "_pages_v_blocks_banner" DROP CONSTRAINT "_pages_v_blocks_banner_link_category_id_categories_id_fk";
  
  ALTER TABLE "_pages_v_blocks_banner" DROP CONSTRAINT "_pages_v_blocks_banner_link_page_id_pages_id_fk";
  
  ALTER TABLE "home_blocks_editorial_intro" DROP CONSTRAINT "home_blocks_editorial_intro_cta_category_id_categories_id_fk";
  
  ALTER TABLE "home_blocks_editorial_intro" DROP CONSTRAINT "home_blocks_editorial_intro_cta_page_id_pages_id_fk";
  
  ALTER TABLE "home_blocks_hero_news" DROP CONSTRAINT "home_blocks_hero_news_cta_category_id_categories_id_fk";
  
  ALTER TABLE "home_blocks_hero_news" DROP CONSTRAINT "home_blocks_hero_news_cta_page_id_pages_id_fk";
  
  ALTER TABLE "home_blocks_banner" DROP CONSTRAINT "home_blocks_banner_link_category_id_categories_id_fk";
  
  ALTER TABLE "home_blocks_banner" DROP CONSTRAINT "home_blocks_banner_link_page_id_pages_id_fk";
  
  ALTER TABLE "_home_v_blocks_editorial_intro" DROP CONSTRAINT "_home_v_blocks_editorial_intro_cta_category_id_categories_id_fk";
  
  ALTER TABLE "_home_v_blocks_editorial_intro" DROP CONSTRAINT "_home_v_blocks_editorial_intro_cta_page_id_pages_id_fk";
  
  ALTER TABLE "_home_v_blocks_hero_news" DROP CONSTRAINT "_home_v_blocks_hero_news_cta_category_id_categories_id_fk";
  
  ALTER TABLE "_home_v_blocks_hero_news" DROP CONSTRAINT "_home_v_blocks_hero_news_cta_page_id_pages_id_fk";
  
  ALTER TABLE "_home_v_blocks_banner" DROP CONSTRAINT "_home_v_blocks_banner_link_category_id_categories_id_fk";
  
  ALTER TABLE "_home_v_blocks_banner" DROP CONSTRAINT "_home_v_blocks_banner_link_page_id_pages_id_fk";
  
  DROP INDEX "pages_blocks_banner_link_link_category_idx";
  DROP INDEX "pages_blocks_banner_link_link_page_idx";
  DROP INDEX "_pages_v_blocks_banner_link_link_category_idx";
  DROP INDEX "_pages_v_blocks_banner_link_link_page_idx";
  DROP INDEX "home_blocks_editorial_intro_cta_cta_category_idx";
  DROP INDEX "home_blocks_editorial_intro_cta_cta_page_idx";
  DROP INDEX "home_blocks_hero_news_cta_cta_category_idx";
  DROP INDEX "home_blocks_hero_news_cta_cta_page_idx";
  DROP INDEX "home_blocks_banner_link_link_category_idx";
  DROP INDEX "home_blocks_banner_link_link_page_idx";
  DROP INDEX "_home_v_blocks_editorial_intro_cta_cta_category_idx";
  DROP INDEX "_home_v_blocks_editorial_intro_cta_cta_page_idx";
  DROP INDEX "_home_v_blocks_hero_news_cta_cta_category_idx";
  DROP INDEX "_home_v_blocks_hero_news_cta_cta_page_idx";
  DROP INDEX "_home_v_blocks_banner_link_link_category_idx";
  DROP INDEX "_home_v_blocks_banner_link_link_page_idx";
  ALTER TABLE "pages_blocks_banner" DROP COLUMN "link_type";
  ALTER TABLE "pages_blocks_banner" DROP COLUMN "link_category_id";
  ALTER TABLE "pages_blocks_banner" DROP COLUMN "link_page_id";
  ALTER TABLE "pages_blocks_banner" DROP COLUMN "link_url";
  ALTER TABLE "pages_blocks_banner" DROP COLUMN "link_open_in_new_tab";
  ALTER TABLE "_pages_v_blocks_banner" DROP COLUMN "link_type";
  ALTER TABLE "_pages_v_blocks_banner" DROP COLUMN "link_category_id";
  ALTER TABLE "_pages_v_blocks_banner" DROP COLUMN "link_page_id";
  ALTER TABLE "_pages_v_blocks_banner" DROP COLUMN "link_url";
  ALTER TABLE "_pages_v_blocks_banner" DROP COLUMN "link_open_in_new_tab";
  ALTER TABLE "home_blocks_editorial_intro" DROP COLUMN "cta_type";
  ALTER TABLE "home_blocks_editorial_intro" DROP COLUMN "cta_category_id";
  ALTER TABLE "home_blocks_editorial_intro" DROP COLUMN "cta_page_id";
  ALTER TABLE "home_blocks_editorial_intro" DROP COLUMN "cta_url";
  ALTER TABLE "home_blocks_editorial_intro" DROP COLUMN "cta_open_in_new_tab";
  ALTER TABLE "home_blocks_hero_news" DROP COLUMN "cta_type";
  ALTER TABLE "home_blocks_hero_news" DROP COLUMN "cta_category_id";
  ALTER TABLE "home_blocks_hero_news" DROP COLUMN "cta_page_id";
  ALTER TABLE "home_blocks_hero_news" DROP COLUMN "cta_url";
  ALTER TABLE "home_blocks_hero_news" DROP COLUMN "cta_open_in_new_tab";
  ALTER TABLE "home_blocks_banner" DROP COLUMN "link_type";
  ALTER TABLE "home_blocks_banner" DROP COLUMN "link_category_id";
  ALTER TABLE "home_blocks_banner" DROP COLUMN "link_page_id";
  ALTER TABLE "home_blocks_banner" DROP COLUMN "link_url";
  ALTER TABLE "home_blocks_banner" DROP COLUMN "link_open_in_new_tab";
  ALTER TABLE "_home_v_blocks_editorial_intro" DROP COLUMN "cta_type";
  ALTER TABLE "_home_v_blocks_editorial_intro" DROP COLUMN "cta_category_id";
  ALTER TABLE "_home_v_blocks_editorial_intro" DROP COLUMN "cta_page_id";
  ALTER TABLE "_home_v_blocks_editorial_intro" DROP COLUMN "cta_url";
  ALTER TABLE "_home_v_blocks_editorial_intro" DROP COLUMN "cta_open_in_new_tab";
  ALTER TABLE "_home_v_blocks_hero_news" DROP COLUMN "cta_type";
  ALTER TABLE "_home_v_blocks_hero_news" DROP COLUMN "cta_category_id";
  ALTER TABLE "_home_v_blocks_hero_news" DROP COLUMN "cta_page_id";
  ALTER TABLE "_home_v_blocks_hero_news" DROP COLUMN "cta_url";
  ALTER TABLE "_home_v_blocks_hero_news" DROP COLUMN "cta_open_in_new_tab";
  ALTER TABLE "_home_v_blocks_banner" DROP COLUMN "link_type";
  ALTER TABLE "_home_v_blocks_banner" DROP COLUMN "link_category_id";
  ALTER TABLE "_home_v_blocks_banner" DROP COLUMN "link_page_id";
  ALTER TABLE "_home_v_blocks_banner" DROP COLUMN "link_url";
  ALTER TABLE "_home_v_blocks_banner" DROP COLUMN "link_open_in_new_tab";
  DROP TYPE "public"."enum_pages_blocks_banner_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_banner_link_type";
  DROP TYPE "public"."enum_home_blocks_editorial_intro_cta_type";
  DROP TYPE "public"."enum_home_blocks_hero_news_cta_type";
  DROP TYPE "public"."enum_home_blocks_banner_link_type";
  DROP TYPE "public"."enum__home_v_blocks_editorial_intro_cta_type";
  DROP TYPE "public"."enum__home_v_blocks_hero_news_cta_type";
  DROP TYPE "public"."enum__home_v_blocks_banner_link_type";`)
}
