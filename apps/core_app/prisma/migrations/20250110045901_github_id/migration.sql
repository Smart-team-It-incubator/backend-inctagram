/*
  Warnings:

  - You are about to drop the column `githubPrividers` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[githubId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_githubPrividers_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "githubPrividers",
ADD COLUMN     "githubId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");
