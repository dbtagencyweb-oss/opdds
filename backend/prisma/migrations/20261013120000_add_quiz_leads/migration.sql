-- CreateEnum
CREATE TYPE "QuizLeadStatus" AS ENUM ('novo', 'carta_enviada', 'em_conversa', 'comprou', 'descadastrado');

-- CreateTable
CREATE TABLE "QuizLead" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nome" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "email" TEXT,
    "consentimento" BOOLEAN NOT NULL,
    "consentimentoEm" TIMESTAMP(3) NOT NULL,
    "prologo" TEXT,
    "pilarResultado" TEXT NOT NULL,
    "pontuacoes" JSONB NOT NULL,
    "cartaUrl" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmContent" TEXT,
    "utmTerm" TEXT,
    "gclid" TEXT,
    "eventId" TEXT NOT NULL,
    "fbc" TEXT,
    "fbp" TEXT,
    "pageUrl" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "status" "QuizLeadStatus" NOT NULL DEFAULT 'novo',
    "cartaEnviadaEm" TIMESTAMP(3),
    "compradorEm" TIMESTAMP(3),
    "observacao" TEXT,

    CONSTRAINT "QuizLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuizLead_eventId_key" ON "QuizLead"("eventId");

-- CreateIndex
CREATE INDEX "QuizLead_createdAt_idx" ON "QuizLead"("createdAt");

-- CreateIndex
CREATE INDEX "QuizLead_pilarResultado_idx" ON "QuizLead"("pilarResultado");

-- CreateIndex
CREATE INDEX "QuizLead_status_idx" ON "QuizLead"("status");

-- CreateIndex
CREATE INDEX "QuizLead_whatsapp_idx" ON "QuizLead"("whatsapp");

-- CreateIndex
CREATE INDEX "QuizLead_email_idx" ON "QuizLead"("email");

