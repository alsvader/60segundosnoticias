import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Data-transformation step of the Page CTA `linkLabel`/`linkURL` -> `link`
 * migration (category-article-pages, Decision 4/5). Runs after the additive
 * migration and before the remove-old migration, so existing CTA data is
 * never lost: `link_label` already carries over for free (same column name
 * as the old flat field), so only `link_url`/`link_type` need populating
 * from the old `link_u_r_l` column, on both the live table and Pages'
 * versions table (`versions.drafts: true`).
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   UPDATE "pages_blocks_cta" SET "link_type" = 'external', "link_url" = "link_u_r_l" WHERE "link_u_r_l" IS NOT NULL;
  UPDATE "_pages_v_blocks_cta" SET "link_type" = 'external', "link_url" = "link_u_r_l" WHERE "link_u_r_l" IS NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   UPDATE "pages_blocks_cta" SET "link_type" = NULL, "link_url" = NULL WHERE "link_u_r_l" IS NOT NULL;
  UPDATE "_pages_v_blocks_cta" SET "link_type" = NULL, "link_url" = NULL WHERE "link_u_r_l" IS NOT NULL;`)
}
