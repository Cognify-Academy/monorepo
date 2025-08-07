/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `lessons` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "lessons_title_key" ON "lessons"("title");
