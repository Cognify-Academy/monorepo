/*
  Warnings:

  - You are about to alter the column `importance` on the `concepts` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- DropIndex
DROP INDEX "users_id_key";

-- AlterTable
ALTER TABLE "concepts" ALTER COLUMN "importance" SET DATA TYPE INTEGER;
