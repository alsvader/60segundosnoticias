import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "home_blocks_editorial_intro" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline_primary" varchar,
  	"headline_accent" varchar,
  	"description" varchar,
  	"background_image_id" integer,
  	"foreground_image_id" integer,
  	"cta_label" varchar,
  	"cta_link" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v_blocks_editorial_intro" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline_primary" varchar,
  	"headline_accent" varchar,
  	"description" varchar,
  	"background_image_id" integer,
  	"foreground_image_id" integer,
  	"cta_label" varchar,
  	"cta_link" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "home_blocks_editorial_intro" ADD CONSTRAINT "home_blocks_editorial_intro_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_editorial_intro" ADD CONSTRAINT "home_blocks_editorial_intro_foreground_image_id_media_id_fk" FOREIGN KEY ("foreground_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_editorial_intro" ADD CONSTRAINT "home_blocks_editorial_intro_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_editorial_intro" ADD CONSTRAINT "_home_v_blocks_editorial_intro_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_editorial_intro" ADD CONSTRAINT "_home_v_blocks_editorial_intro_foreground_image_id_media_id_fk" FOREIGN KEY ("foreground_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_editorial_intro" ADD CONSTRAINT "_home_v_blocks_editorial_intro_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_blocks_editorial_intro_order_idx" ON "home_blocks_editorial_intro" USING btree ("_order");
  CREATE INDEX "home_blocks_editorial_intro_parent_id_idx" ON "home_blocks_editorial_intro" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_editorial_intro_path_idx" ON "home_blocks_editorial_intro" USING btree ("_path");
  CREATE INDEX "home_blocks_editorial_intro_background_image_idx" ON "home_blocks_editorial_intro" USING btree ("background_image_id");
  CREATE INDEX "home_blocks_editorial_intro_foreground_image_idx" ON "home_blocks_editorial_intro" USING btree ("foreground_image_id");
  CREATE INDEX "_home_v_blocks_editorial_intro_order_idx" ON "_home_v_blocks_editorial_intro" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_editorial_intro_parent_id_idx" ON "_home_v_blocks_editorial_intro" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_editorial_intro_path_idx" ON "_home_v_blocks_editorial_intro" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_editorial_intro_background_image_idx" ON "_home_v_blocks_editorial_intro" USING btree ("background_image_id");
  CREATE INDEX "_home_v_blocks_editorial_intro_foreground_image_idx" ON "_home_v_blocks_editorial_intro" USING btree ("foreground_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "home_blocks_editorial_intro" CASCADE;
  DROP TABLE "_home_v_blocks_editorial_intro" CASCADE;`)
}
