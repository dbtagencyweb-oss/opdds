ALTER TABLE "BookAudioRevision" ADD COLUMN "coverUrl" TEXT;

CREATE TABLE "BookAudioTrackMeta" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "productionStatus" TEXT NOT NULL DEFAULT 'review',
    "productionNote" TEXT,
    "coverUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookAudioTrackMeta_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BookAudioTrackMeta_chapterId_sectionKey_key" ON "BookAudioTrackMeta"("chapterId", "sectionKey");
CREATE INDEX "BookAudioTrackMeta_chapterId_sortOrder_idx" ON "BookAudioTrackMeta"("chapterId", "sortOrder");
