import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const PRODUCT_KEYS = {
  pdf: 'opdds_pdf',
  base: 'opdds_base',
  workbook: 'opdds_diario',
  igentMind30: 'opdds_igentmind_30d',
  igentMind90: 'opdds_igentmind_90d',
  group: 'opdds_grupo',
  vip: 'opdds_vip',
} as const;

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
