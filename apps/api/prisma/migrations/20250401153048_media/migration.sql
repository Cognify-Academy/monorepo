/*
  Warnings:

  - Added the required column `content` to the `lessons` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "content" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "media" ADD COLUMN     "metadata" JSONB;
