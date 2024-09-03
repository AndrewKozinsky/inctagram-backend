/*
  Warnings:

  - You are about to drop the column `deviceIP` on the `DeviceToken` table. All the data in the column will be lost.
  - You are about to drop the column `deviceId` on the `DeviceToken` table. All the data in the column will be lost.
  - You are about to drop the column `deviceName` on the `DeviceToken` table. All the data in the column will be lost.
  - You are about to drop the column `expirationDate` on the `DeviceToken` table. All the data in the column will be lost.
  - You are about to drop the column `issuedAt` on the `DeviceToken` table. All the data in the column will be lost.
  - You are about to drop the column `emailConfirmationCode` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailConfirmationCodeExpirationDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `hashedPassword` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isEmailConfirmed` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordRecoveryCode` on the `User` table. All the data in the column will be lost.
  - Added the required column `device_id` to the `DeviceToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `device_ip` to the `DeviceToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `device_name` to the `DeviceToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiration_date` to the `DeviceToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `issued_at` to the `DeviceToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hashed_password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DeviceToken" DROP COLUMN "deviceIP",
DROP COLUMN "deviceId",
DROP COLUMN "deviceName",
DROP COLUMN "expirationDate",
DROP COLUMN "issuedAt",
ADD COLUMN     "device_id" TEXT NOT NULL,
ADD COLUMN     "device_ip" TEXT NOT NULL,
ADD COLUMN     "device_name" TEXT NOT NULL,
ADD COLUMN     "expiration_date" TEXT NOT NULL,
ADD COLUMN     "issued_at" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailConfirmationCode",
DROP COLUMN "emailConfirmationCodeExpirationDate",
DROP COLUMN "hashedPassword",
DROP COLUMN "isEmailConfirmed",
DROP COLUMN "passwordRecoveryCode",
ADD COLUMN     "email_confirmation_code" TEXT,
ADD COLUMN     "email_confirmation_code_expiration_date" TEXT,
ADD COLUMN     "hashed_password" TEXT NOT NULL,
ADD COLUMN     "is_email_confirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "password_recovery_code" TEXT;
