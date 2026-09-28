-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "panel_access_token_hash" TEXT,
ADD COLUMN     "panel_access_token_set_at" TIMESTAMPTZ(6);
