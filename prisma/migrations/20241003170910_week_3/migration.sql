/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_name]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_name_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ADD COLUMN     "about_me" TEXT,
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "city_id" INTEGER,
ADD COLUMN     "country_code" TEXT,
ADD COLUMN     "date_of_birth" TEXT,
ADD COLUMN     "first_name" TEXT,
ADD COLUMN     "last_name" TEXT,
ADD COLUMN     "user_name" TEXT NOT NULL,
ALTER COLUMN "github_id" SET DATA TYPE TEXT,
ALTER COLUMN "google_id" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_user_name_key" ON "User"("user_name");
