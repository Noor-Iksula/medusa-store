import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260612131937 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "store_price_qty" ("id" text not null, "store_code" text not null, "child_sku" text not null, "quantity" integer not null, "status" integer not null default 0, "message" text null, "total_quantity" integer not null, "minimum_price" integer not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "store_price_qty_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_store_price_qty_deleted_at" ON "store_price_qty" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "store_price_qty" cascade;`);
  }

}
