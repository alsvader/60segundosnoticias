import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Additive step of the Page CTA `linkLabel`/`linkURL` -> `link` (linkFields)
 * migration (category-article-pages, Decision 4/5). Hand-authored: Drizzle's
 * interactive create-vs-rename prompt for `link_type` requires a TTY not
 * available via `docker compose exec` in this environment - same blocker
 * documented for the Home CTA unification in dynamic-home-builder, solved
 * there the same way (a from-scratch additive migration, reviewed and
 * verified against a disposable database instead of trusting the
 * interactive generator). Mirrors the column/constraint/index shape of
 * `20260910_174956_cta_link_fields_add.ts` for `pages_blocks_banner`,
 * applied to `pages_blocks_cta`/`_pages_v_blocks_cta` instead.
 *
 * `link_label` is intentionally NOT added here: the old flat field
 * `linkLabel` and the new group subfield `link.label` both produce the
 * identical Postgres column name `link_label` (camelCase -> snake_case),
 * so the existing column is already reused as-is - verified empirically
 * against the disposable migration-test database.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_cta_link_type" AS ENUM('category', 'page', 'external');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_link_type" AS ENUM('category', 'page', 'external');
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "link_type" "enum_pages_blocks_cta_link_type";
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "link_category_id" integer;
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "link_page_id" integer;
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "link_url" varchar;
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "link_open_in_new_tab" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN "link_type" "enum__pages_v_blocks_cta_link_type";
  ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN "link_category_id" integer;
  ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN "link_page_id" integer;
  ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN "link_url" varchar;
  ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN "link_open_in_new_tab" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_link_category_id_categories_id_fk" FOREIGN KEY ("link_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_link_category_id_categories_id_fk" FOREIGN KEY ("link_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_cta_link_link_category_idx" ON "pages_blocks_cta" USING btree ("link_category_id");
  CREATE INDEX "pages_blocks_cta_link_link_page_idx" ON "pages_blocks_cta" USING btree ("link_page_id");
  CREATE INDEX "_pages_v_blocks_cta_link_link_category_idx" ON "_pages_v_blocks_cta" USING btree ("link_category_id");
  CREATE INDEX "_pages_v_blocks_cta_link_link_page_idx" ON "_pages_v_blocks_cta" USING btree ("link_page_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_cta" DROP CONSTRAINT "pages_blocks_cta_link_category_id_categories_id_fk";

  ALTER TABLE "pages_blocks_cta" DROP CONSTRAINT "pages_blocks_cta_link_page_id_pages_id_fk";

  ALTER TABLE "_pages_v_blocks_cta" DROP CONSTRAINT "_pages_v_blocks_cta_link_category_id_categories_id_fk";

  ALTER TABLE "_pages_v_blocks_cta" DROP CONSTRAINT "_pages_v_blocks_cta_link_page_id_pages_id_fk";

  DROP INDEX "pages_blocks_cta_link_link_category_idx";
  DROP INDEX "pages_blocks_cta_link_link_page_idx";
  DROP INDEX "_pages_v_blocks_cta_link_link_category_idx";
  DROP INDEX "_pages_v_blocks_cta_link_link_page_idx";
  ALTER TABLE "pages_blocks_cta" DROP COLUMN "link_type";
  ALTER TABLE "pages_blocks_cta" DROP COLUMN "link_category_id";
  ALTER TABLE "pages_blocks_cta" DROP COLUMN "link_page_id";
  ALTER TABLE "pages_blocks_cta" DROP COLUMN "link_url";
  ALTER TABLE "pages_blocks_cta" DROP COLUMN "link_open_in_new_tab";
  ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN "link_type";
  ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN "link_category_id";
  ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN "link_page_id";
  ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN "link_url";
  ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN "link_open_in_new_tab";
  DROP TYPE "public"."enum_pages_blocks_cta_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_cta_link_type";`)
}
