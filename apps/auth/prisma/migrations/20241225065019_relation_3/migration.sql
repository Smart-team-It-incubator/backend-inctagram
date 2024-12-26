/*
  Warnings:

  - You are about to drop the column `tokenHash` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `tokenHash` on the `Session` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RefreshToken" DROP COLUMN "tokenHash";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "tokenHash";
