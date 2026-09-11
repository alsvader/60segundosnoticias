import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_video_block" ADD COLUMN "portrait" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_video_block" ADD COLUMN "portrait" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_video_block" DROP COLUMN "portrait";
  ALTER TABLE "_pages_v_blocks_video_block" DROP COLUMN "portrait";`)
}
