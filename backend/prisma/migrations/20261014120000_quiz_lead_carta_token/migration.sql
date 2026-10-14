-- Link pessoal da Carta de Sustentação e controle de abertura/e-mail.
ALTER TABLE "QuizLead" ADD COLUMN "cartaToken" TEXT,
ADD COLUMN "cartaAbertaEm" TIMESTAMP(3),
ADD COLUMN "cartaEmailEnviadoEm" TIMESTAMP(3);

-- Leads que já existem ganham um token aleatório (2 UUIDs v4 = 244 bits, sem extensão).
UPDATE "QuizLead"
SET "cartaToken" = replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
WHERE "cartaToken" IS NULL;

ALTER TABLE "QuizLead" ALTER COLUMN "cartaToken" SET NOT NULL;

CREATE UNIQUE INDEX "QuizLead_cartaToken_key" ON "QuizLead"("cartaToken");
