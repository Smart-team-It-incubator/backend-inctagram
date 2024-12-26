/*
  Warnings:

  - You are about to drop the column `sessionId` on the `RefreshToken` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[refreshTokenId]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `refreshTokenId` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_sessionId_fkey";

-- DropIndex
DROP INDEX "RefreshToken_sessionId_key";

-- AlterTable
ALTER TABLE "RefreshToken" DROP COLUMN "sessionId";

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "refreshTokenId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Session_refreshTokenId_key" ON "Session"("refreshTokenId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_refreshTokenId_fkey" FOREIGN KEY ("refreshTokenId") REFERENCES "RefreshToken"("id") ON DELETE CASCADE ON UPDATE CASCADE;
