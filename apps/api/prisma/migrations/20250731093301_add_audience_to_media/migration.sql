-- CreateEnum
CREATE TYPE "Audience" AS ENUM ('BEGINNERS', 'INTERMEDIATE', 'ADVANCED');

-- AlterTable
ALTER TABLE "media" ADD COLUMN     "audience" "Audience" NOT NULL DEFAULT 'BEGINNERS';
