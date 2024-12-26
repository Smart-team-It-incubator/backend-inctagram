/*
  Warnings:

  - Added the required column `username` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN     "userAgent" TEXT,
ADD COLUMN     "username" TEXT NOT NULL;
