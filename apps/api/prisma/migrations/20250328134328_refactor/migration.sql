/*
  Warnings:

  - You are about to drop the column `conceptFromId` on the `concept_relations` table. All the data in the column will be lost.
  - You are about to drop the column `conceptToId` on the `concept_relations` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[conceptSourceId,conceptTargetId]` on the table `concept_relations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `conceptSourceId` to the `concept_relations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `conceptTargetId` to the `concept_relations` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `courses` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "concept_relations" DROP CONSTRAINT "concept_relations_conceptFromId_fkey";

-- DropForeignKey
ALTER TABLE "concept_relations" DROP CONSTRAINT "concept_relations_conceptToId_fkey";

-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_userId_fkey";

-- DropIndex
DROP INDEX "concept_relations_conceptFromId_conceptToId_key";

-- AlterTable
ALTER TABLE "concept_relations" DROP COLUMN "conceptFromId",
DROP COLUMN "conceptToId",
ADD COLUMN     "conceptSourceId" TEXT NOT NULL,
ADD COLUMN     "conceptTargetId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "courses" ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "concept_relations_conceptSourceId_conceptTargetId_key" ON "concept_relations"("conceptSourceId", "conceptTargetId");

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concept_relations" ADD CONSTRAINT "concept_relations_conceptSourceId_fkey" FOREIGN KEY ("conceptSourceId") REFERENCES "concepts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concept_relations" ADD CONSTRAINT "concept_relations_conceptTargetId_fkey" FOREIGN KEY ("conceptTargetId") REFERENCES "concepts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
