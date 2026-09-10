import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_banner" DROP COLUMN "link_u_r_l";
  ALTER TABLE "_pages_v_blocks_banner" DROP COLUMN "link_u_r_l";
  ALTER TABLE "home_blocks_editorial_intro" DROP COLUMN "cta_link";
  ALTER TABLE "home_blocks_hero_news" DROP COLUMN "cta_link";
  ALTER TABLE "home_blocks_banner" DROP COLUMN "link_u_r_l";
  ALTER TABLE "_home_v_blocks_editorial_intro" DROP COLUMN "cta_link";
  ALTER TABLE "_home_v_blocks_hero_news" DROP COLUMN "cta_link";
  ALTER TABLE "_home_v_blocks_banner" DROP COLUMN "link_u_r_l";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_banner" ADD COLUMN "link_u_r_l" varchar;
  ALTER TABLE "_pages_v_blocks_banner" ADD COLUMN "link_u_r_l" varchar;
  ALTER TABLE "home_blocks_editorial_intro" ADD COLUMN "cta_link" varchar;
  ALTER TABLE "home_blocks_hero_news" ADD COLUMN "cta_link" varchar;
  ALTER TABLE "home_blocks_banner" ADD COLUMN "link_u_r_l" varchar;
  ALTER TABLE "_home_v_blocks_editorial_intro" ADD COLUMN "cta_link" varchar;
  ALTER TABLE "_home_v_blocks_hero_news" ADD COLUMN "cta_link" varchar;
  ALTER TABLE "_home_v_blocks_banner" ADD COLUMN "link_u_r_l" varchar;`)
}
