-- CreateTable
CREATE TABLE "BookPageRevision" (
    "id" TEXT NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdById" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookPageRevision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookPageRevision_pageNumber_status_createdAt_idx" ON "BookPageRevision"("pageNumber", "status", "createdAt");

-- CreateIndex
CREATE INDEX "BookPageRevision_status_pageNumber_idx" ON "BookPageRevision"("status", "pageNumber");
