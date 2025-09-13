-- AlterTable
ALTER TABLE "public"."courts" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."facilities" ADD COLUMN     "deletedAt" TIMESTAMP(3);
