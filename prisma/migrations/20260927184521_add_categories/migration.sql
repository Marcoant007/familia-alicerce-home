-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- AlterTable events: texto livre -> relação com categories
ALTER TABLE "events" ADD COLUMN "category_id" UUID;
ALTER TABLE "events" DROP COLUMN "category";
ALTER TABLE "events" ADD CONSTRAINT "events_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable announcements: texto livre -> relação com categories
ALTER TABLE "announcements" ADD COLUMN "category_id" UUID;
ALTER TABLE "announcements" DROP COLUMN "category";
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
