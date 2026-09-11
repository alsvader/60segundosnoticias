import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_article_sidebar_posts_panel_mode" AS ENUM('latest', 'newest-per-category', 'featured');
  CREATE TABLE "article_sidebar" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"posts_panel_enabled" boolean DEFAULT true,
  	"posts_panel_mode" "enum_article_sidebar_posts_panel_mode" DEFAULT 'latest',
  	"posts_panel_heading" varchar,
  	"posts_panel_limit" numeric DEFAULT 5,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "article_sidebar" CASCADE;
  DROP TYPE "public"."enum_article_sidebar_posts_panel_mode";`)
}
