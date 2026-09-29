/*
  Warnings:

  - You are about to drop the column `cover_path` on the `albums` table. All the data in the column will be lost.
  - You are about to drop the `photos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "photos" DROP CONSTRAINT "photos_album_id_fkey";

-- DropForeignKey
ALTER TABLE "photos" DROP CONSTRAINT "photos_uploaded_by_id_fkey";

-- AlterTable
ALTER TABLE "albums" DROP COLUMN "cover_path",
ADD COLUMN     "drive_url" TEXT;

-- DropTable
DROP TABLE "photos";
