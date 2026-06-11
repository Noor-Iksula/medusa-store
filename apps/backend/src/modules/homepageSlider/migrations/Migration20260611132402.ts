import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260611132402 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "homepage_slider" ("id" text not null, "name" text not null, "status" text not null default 'active', "image" text null, "banner_link" text null, "open_in_new_window" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "homepage_slider_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_homepage_slider_deleted_at" ON "homepage_slider" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "homepage_slider" cascade;`);
  }

}
