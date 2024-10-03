/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_name]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_name_key";

-- AlterTable
ALTER TABLE "User" RENAME COLUMN "name" TO "user_name",
ADD COLUMN     "about_me" TEXT,
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "city_id" INTEGER,
ADD COLUMN     "country_code" TEXT,
ADD COLUMN     "first_name" TEXT,
ADD COLUMN     "last_name" TEXT,

-- CreateIndex
CREATE UNIQUE INDEX "User_user_name_key" ON "User"("user_name");
