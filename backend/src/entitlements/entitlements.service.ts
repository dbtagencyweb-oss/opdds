import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const PRODUCT_KEYS = {
  pdf: 'opdds_pdf',
  base: 'opdds_base',
  workbook: 'opdds_diario',
  igentMind7: 'opdds_igentmind_7d',
  igentMind30: 'opdds_igentmind_30d',
  igentMind90: 'opdds_igentmind_90d',
  group: 'opdds_grupo',
  vip: 'opdds_vip',
} as const;

/** Duração (dias) dos produtos com prazo; os demais são vitalícios (expiresAt null). */
export const PRODUCT_DURATION_DAYS: Partial<Record<string, number>> = {
  [PRODUCT_KEYS.igentMind7]: 7,
  [PRODUCT_KEYS.igentMind30]: 30,
  [PRODUCT_KEYS.igentMind90]: 90,
};

export function expiresAtFor(productKey: string, from = new Date()): Date | null {
  const days = PRODUCT_DURATION_DAYS[productKey];
  if (!days) return null;
  return new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
}

@Injectable()
export class EntitlementsService {
  constructor(private readonly prisma: PrismaService) {}

  async hasProduct(userId: string, productKey: string) {
    const entitlement = await this.prisma.entitlement.findFirst({
      where: {
        userId,
        productKey,
        status: 'ACTIVE',
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    return Boolean(entitlement);
  }
}
