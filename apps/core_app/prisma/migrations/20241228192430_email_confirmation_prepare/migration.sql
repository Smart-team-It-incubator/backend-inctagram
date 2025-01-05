/*
  Warnings:

  - You are about to drop the column `emailVerificationToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isEmailVerified` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerificationToken",
DROP COLUMN "isEmailVerified",
ADD COLUMN     "emailConfirmationCode" TEXT,
ADD COLUMN     "emailConfirmationCodeExpirationDate" TIMESTAMP(3),
ADD COLUMN     "isEmailConfirmed" BOOLEAN NOT NULL DEFAULT false;
