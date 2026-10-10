/**
 * Manutenção única de acesso ao iGentMIND. Simula por padrão; grava só com --apply.
 *
 *   npm run fix:mind-access              -> relatório (somente leitura)
 *   npm run fix:mind-access -- --apply   -> aplica
 *
 * 1. Prazo nulo: o cadastro por convite criava opdds_igentmind_* sem expiresAt
 *    (acesso vitalício por engano). Corrige para createdAt + duração do produto,
 *    a mesma regra que o cadastro passou a usar.
 * 2. Degustação retroativa: quem comprou o produto base antes da degustação
 *    existir ganha o direito "disponivel". A janela de ativação de 30 dias conta
 *    a partir desta execução (contada da compra, quase todos já estariam vencidos).
 */
import 'reflect-metadata';
import { PrismaClient } from '@prisma/client';
import { expiresAtFor } from '../src/entitlements/entitlements.service';
import { MIND_TRIAL_ACTIVATION_DAYS } from '../src/mind-trial/mind-trial.service';

const APPLY = process.argv.includes('--apply');
const MIND_KEYS = ['opdds_igentmind_7d', 'opdds_igentmind_30d', 'opdds_igentmind_90d'];
const PAID_MIND_KEYS = [...MIND_KEYS, 'opdds_vip'];

const prisma = new PrismaClient();

async function fixNullExpiry() {
  const rows = await prisma.entitlement.findMany({
    where: { productKey: { in: MIND_KEYS }, status: 'ACTIVE', expiresAt: null, source: 'INVITE' },
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: 'asc' },
  });

  const now = new Date();
  let expireNow = 0;
  for (const row of rows) {
    const expiresAt = expiresAtFor(row.productKey, row.createdAt)!;
    const stillActive = expiresAt > now;
    if (!stillActive) expireNow += 1;
    console.log(`  ${row.user.email.padEnd(40)} ${row.productKey.padEnd(22)} cadastro ${row.createdAt.toISOString().slice(0, 10)} -> expira ${expiresAt.toISOString().slice(0, 10)}${stillActive ? '' : '  (já vencido)'}`);
    if (APPLY) await prisma.entitlement.update({ where: { id: row.id }, data: { expiresAt } });
  }

  console.log(`\n[1] Prazo nulo: ${rows.length} direito(s); ${expireNow} perdem acesso imediatamente, ${rows.length - expireNow} seguem ativos com prazo.\n`);
}

async function backfillTrials() {
  const baseRows = await prisma.entitlement.findMany({
    where: { productKey: 'opdds_base', status: 'ACTIVE' },
    include: { user: { select: { id: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  });

  const existing = new Set((await prisma.mindTrial.findMany({ select: { email: true } })).map((trial) => trial.email));
  const paidUsers = new Set(
    (await prisma.entitlement.findMany({
      where: { productKey: { in: PAID_MIND_KEYS }, status: 'ACTIVE' },
      select: { userId: true },
    })).map((row) => row.userId),
  );

  const activationDeadline = new Date(Date.now() + MIND_TRIAL_ACTIVATION_DAYS * 24 * 60 * 60 * 1000);
  const seen = new Set<string>();
  let created = 0;
  let skippedPaid = 0;

  for (const row of baseRows) {
    const email = row.user.email.toLowerCase();
    if (seen.has(email) || existing.has(email)) continue;
    seen.add(email);
    // Quem já comprou iGentMIND (mesmo que vencido) não entra na degustação.
    if (paidUsers.has(row.user.id)) {
      skippedPaid += 1;
      continue;
    }
    created += 1;
    if (APPLY) {
      await prisma.mindTrial.upsert({
        where: { email },
        update: {},
        create: { email, status: 'disponivel', source: 'BACKFILL', purchasedAt: row.createdAt, activationDeadline },
      });
    }
  }

  console.log(`[2] Degustação retroativa: ${created} leitor(es) recebem degustação (ativar até ${activationDeadline.toISOString().slice(0, 10)}); ${skippedPaid} ignorado(s) por já terem iGentMIND; ${existing.size} já tinham.\n`);
}

async function main() {
  console.log(APPLY ? 'MODO APPLY: gravando alterações.\n' : 'SIMULAÇÃO: nada será gravado (use --apply).\n');
  await fixNullExpiry();
  await backfillTrials();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
