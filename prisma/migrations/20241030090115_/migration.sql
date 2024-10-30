/*
  Warnings:

  - You are about to drop the column `post_photo_id` on the `PostPhoto` table. All the data in the column will be lost.
  - Added the required column `files_ms_post_photo_id` to the `PostPhoto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PostPhoto" DROP COLUMN "post_photo_id",
ADD COLUMN     "files_ms_post_photo_id" TEXT NOT NULL;
