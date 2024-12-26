/*
  Warnings:

  - You are about to drop the `PasswordResetRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RefreshToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RevokedToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_refreshTokenId_fkey";

-- DropTable
DROP TABLE "PasswordResetRequest";

-- DropTable
DROP TABLE "RefreshToken";

-- DropTable
DROP TABLE "RevokedToken";

-- DropTable
DROP TABLE "Session";

-- CreateTable
CREATE TABLE "DeviceSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "deviceName" TEXT,
    "tokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ip" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_device_idx" ON "DeviceSession"("userId", "deviceId");
