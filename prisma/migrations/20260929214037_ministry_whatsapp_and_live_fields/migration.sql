-- AlterTable
ALTER TABLE "ministries" ADD COLUMN     "whatsapp" TEXT;

-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "live_at" TIMESTAMPTZ(6),
ADD COLUMN     "live_audio_url" TEXT,
ADD COLUMN     "live_video_url" TEXT;
