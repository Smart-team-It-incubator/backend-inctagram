/*
  Warnings:

  - You are about to drop the column `userAgent` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `tokenHash` on the `Session` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[refreshTokenId]` on the table `Session` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_tokenHash_fkey";

-- DropIndex
DROP INDEX "Session_tokenHash_key";

-- AlterTable
ALTER TABLE "RefreshToken" DROP COLUMN "userAgent",
DROP COLUMN "username";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "tokenHash",
ADD COLUMN     "refreshTokenId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Session_refreshTokenId_key" ON "Session"("refreshTokenId");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_id_fkey" FOREIGN KEY ("id") REFERENCES "Session"("refreshTokenId") ON DELETE CASCADE ON UPDATE CASCADE;
