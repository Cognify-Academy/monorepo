/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `concepts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "concepts_name_key" ON "concepts"("name");
