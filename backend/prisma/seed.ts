import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const products = [
  {
    key: 'opdds_pdf',
    name: 'O Poder dos Desacreditados - PDF',
    description: 'Download do livro em PDF.',
  },
  {
    key: 'opdds_base',
    name: 'O Poder dos Desacreditados - Base',
    description: 'Livro, app, PDF, biblioteca e áudios principais.',
  },
  {
    key: 'opdds_diario',
    name: 'Diário dos Desacreditados',
    description: 'Workbook editável, prompts guiados e respostas salvas.',
  },
  {
    key: 'opdds_igentmind_30d',
    name: 'iGentMIND 30 dias',
    description: 'Mentor de leitura por 30 dias.',
  },
  {
    key: 'opdds_igentmind_90d',
    name: 'iGentMIND 90 dias',
    description: 'Mentor de leitura por 90 dias.',
  },
  {
    key: 'opdds_grupo',
    name: 'Grupo de apoio OPDDS',
    description: 'Acesso ao grupo de apoio e comunidade.',
  },
  {
    key: 'opdds_vip',
    name: 'OPDDS VIP',
    description: 'Pacote completo com livro, Diário e iGentMIND.',
  },
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { key: product.key },
      update: product,
      create: product,
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@opdds.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
  const adminName = process.env.ADMIN_NAME || 'Administrador OPDDS';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: {
      name: adminName,
      role: 'ADMIN',
      passwordHash,
    },
    create: {
      email: adminEmail.toLowerCase(),
      name: adminName,
      role: 'ADMIN',
      passwordHash,
    },
  });

  for (const product of products) {
    const existingProduct = await prisma.product.findUnique({ where: { key: product.key } });
    const existingEntitlement = await prisma.entitlement.findFirst({
      where: { userId: admin.id, productKey: product.key, status: 'ACTIVE' },
    });
    if (!existingEntitlement) {
      await prisma.entitlement.create({
        data: {
          userId: admin.id,
          productId: existingProduct?.id,
          productKey: product.key,
          source: 'ADMIN_SEED',
          status: 'ACTIVE',
        },
      });
    } else if (!existingEntitlement.productId && existingProduct) {
      await prisma.entitlement.update({
        where: { id: existingEntitlement.id },
        data: { productId: existingProduct.id },
      });
    }
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
