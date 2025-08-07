-- CreateTable
CREATE TABLE "concept_sections" (
    "id" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "concept_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "concept_courses" (
    "id" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "concept_courses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "concept_sections_conceptId_sectionId_key" ON "concept_sections"("conceptId", "sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "concept_courses_conceptId_courseId_key" ON "concept_courses"("conceptId", "courseId");

-- AddForeignKey
ALTER TABLE "concept_sections" ADD CONSTRAINT "concept_sections_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "concepts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concept_sections" ADD CONSTRAINT "concept_sections_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concept_courses" ADD CONSTRAINT "concept_courses_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "concepts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concept_courses" ADD CONSTRAINT "concept_courses_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
