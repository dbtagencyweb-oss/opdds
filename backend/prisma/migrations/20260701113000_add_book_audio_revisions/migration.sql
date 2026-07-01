-- CreateTable
CREATE TABLE "BookAudioRevision" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdById" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookAudioRevision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookAudioRevision_chapterId_sectionKey_createdAt_idx" ON "BookAudioRevision"("chapterId", "sectionKey", "createdAt");

-- CreateIndex
CREATE INDEX "BookAudioRevision_chapterId_sectionKey_publishedAt_idx" ON "BookAudioRevision"("chapterId", "sectionKey", "publishedAt");
