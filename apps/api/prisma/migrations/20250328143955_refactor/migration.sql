/*
  Warnings:

  - You are about to drop the column `weightingFrom` on the `concept_relations` table. All the data in the column will be lost.
  - You are about to drop the column `weightingTo` on the `concept_relations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "concept_relations" DROP COLUMN "weightingFrom",
DROP COLUMN "weightingTo",
ADD COLUMN     "weighting" DOUBLE PRECISION;
