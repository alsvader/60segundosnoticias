import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" ADD COLUMN "generate_slug" boolean DEFAULT true;
  ALTER TABLE "categories" ADD COLUMN "generate_slug" boolean DEFAULT true;
  ALTER TABLE "tags" ADD COLUMN "generate_slug" boolean DEFAULT true;
  ALTER TABLE "posts" ADD COLUMN "generate_slug" boolean DEFAULT true;
  ALTER TABLE "_posts_v" ADD COLUMN "version_generate_slug" boolean DEFAULT true;
  ALTER TABLE "pages" ADD COLUMN "generate_slug" boolean DEFAULT true;
  ALTER TABLE "_pages_v" ADD COLUMN "version_generate_slug" boolean DEFAULT true;`)

  // Hand-written: rows created before auto-generation already have a
  // stable (possibly published) slug. Leaving `generate_slug = true` would
  // make the next edit regenerate it from the title and change live URLs.
  await db.execute(sql`
   UPDATE "users" SET "generate_slug" = false;
  UPDATE "categories" SET "generate_slug" = false;
  UPDATE "tags" SET "generate_slug" = false;
  UPDATE "posts" SET "generate_slug" = false;
  UPDATE "_posts_v" SET "version_generate_slug" = false;
  UPDATE "pages" SET "generate_slug" = false;
  UPDATE "_pages_v" SET "version_generate_slug" = false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" DROP COLUMN "generate_slug";
  ALTER TABLE "categories" DROP COLUMN "generate_slug";
  ALTER TABLE "tags" DROP COLUMN "generate_slug";
  ALTER TABLE "posts" DROP COLUMN "generate_slug";
  ALTER TABLE "_posts_v" DROP COLUMN "version_generate_slug";
  ALTER TABLE "pages" DROP COLUMN "generate_slug";
  ALTER TABLE "_pages_v" DROP COLUMN "version_generate_slug";`)
}
