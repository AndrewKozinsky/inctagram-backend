/*
  Warnings:

  - You are about to drop the column `country_id` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "country_id",
ADD COLUMN     "country_code" TEXT;
