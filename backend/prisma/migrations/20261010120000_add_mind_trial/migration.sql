CREATE TABLE "MindTrial" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'disponivel',
    "source" TEXT,
    "externalId" TEXT,
    "purchasedAt" TIMESTAMP(3) NOT NULL,
    "activationDeadline" TIMESTAMP(3) NOT NULL,
    "trialStartedAt" TIMESTAMP(3),
    "trialEndsAt" TIMESTAMP(3),
    "dailyDate" TEXT,
    "dailyCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MindTrial_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MindTrialEvent" (
    "id" TEXT NOT NULL,
    "trialId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MindTrialEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MindTrial_email_key" ON "MindTrial"("email");
CREATE INDEX "MindTrial_status_trialEndsAt_idx" ON "MindTrial"("status", "trialEndsAt");
CREATE UNIQUE INDEX "MindTrialEvent_trialId_type_key" ON "MindTrialEvent"("trialId", "type");

ALTER TABLE "MindTrialEvent" ADD CONSTRAINT "MindTrialEvent_trialId_fkey" FOREIGN KEY ("trialId") REFERENCES "MindTrial"("id") ON DELETE CASCADE ON UPDATE CASCADE;
