/*
  Warnings:

  - You are about to drop the column `refreshTokenId` on the `Session` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tokenHash]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deviceId` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenHash` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_id_fkey";

-- DropIndex
DROP INDEX "Session_refreshTokenId_key";

-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN     "deviceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "refreshTokenId",
ADD COLUMN     "tokenHash" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_tokenHash_fkey" FOREIGN KEY ("tokenHash") REFERENCES "Session"("tokenHash") ON DELETE CASCADE ON UPDATE CASCADE;
