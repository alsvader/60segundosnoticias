import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Final step of the Page CTA `linkLabel`/`linkURL` -> `link` migration
 * (category-article-pages, Decision 4/5). Only `link_u_r_l` is dropped -
 * `link_label` is NOT touched, since it is the same column reused by the
 * new `link.label` subfield (verified in the additive step). Only run this
 * after the transform migration's data has been verified.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_cta" DROP COLUMN "link_u_r_l";
  ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN "link_u_r_l";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_cta" ADD COLUMN "link_u_r_l" varchar;
  ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN "link_u_r_l" varchar;`)
}
