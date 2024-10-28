/*
  Warnings:

  - You are about to drop the `PostPhoto` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PostPhoto" DROP CONSTRAINT "PostPhoto_post_id_fkey";

-- DropTable
DROP TABLE "PostPhoto";
