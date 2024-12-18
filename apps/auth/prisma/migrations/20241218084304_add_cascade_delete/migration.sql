-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_tokenHash_fkey";

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_tokenHash_fkey" FOREIGN KEY ("tokenHash") REFERENCES "Session"("tokenHash") ON DELETE CASCADE ON UPDATE CASCADE;
