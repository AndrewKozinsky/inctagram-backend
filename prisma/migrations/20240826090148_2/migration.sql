/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hashedPassword` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isConfirmationEmailCodeConfirmed` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "confirmationCodeExpirationDate" TEXT,
ADD COLUMN     "emailConfirmationCode" TEXT,
ADD COLUMN     "hashedPassword" TEXT NOT NULL,
ADD COLUMN     "isConfirmationEmailCodeConfirmed" BOOLEAN NOT NULL,
ADD COLUMN     "passwordRecoveryCode" TEXT;

-- DropTable
DROP TABLE "Post";

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");
