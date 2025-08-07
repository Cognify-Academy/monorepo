-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "sections" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;
