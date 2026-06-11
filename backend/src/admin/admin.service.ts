import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminGrantPlanDto, AdminGrantProductDto } from './admin.dto';

type AccessPlan = 'pdf' | 'basic' | 'workbook' | 'igent30' | 'igent90' | 'group' | 'vip';

const PRODUCTS_BY_PLAN: Record<AccessPlan, string[]> = {
  pdf: ['opdds_pdf'],
  basic: ['opdds_pdf', 'opdds_base'],
  workbook: ['opdds_pdf', 'opdds_base', 'opdds_diario'],
  igent30: ['opdds_pdf', 'opdds_base', 'opdds_diario', 'opdds_igentmind_30d'],
  igent90: ['opdds_pdf', 'opdds_base', 'opdds_diario', 'opdds_igentmind_90d'],
  group: ['opdds_pdf', 'opdds_base', 'opdds_diario', 'opdds_igentmind_90d', 'opdds_grupo'],
  vip: ['opdds_pdf', 'opdds_base', 'opdds_diario', 'opdds_igentmind_30d', 'opdds_igentmind_90d', 'opdds_grupo', 'opdds_vip'],
};

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  private expiresAt(days?: number) {
    if (!days) return null;
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }

  private derivePlan(products: string[]) {
    if (products.includes('opdds_vip')) return 'vip';
    if (products.includes('opdds_grupo')) return 'group';
    if (products.includes('opdds_igentmind_90d')) return 'igent90';
    if (products.includes('opdds_igentmind_30d')) return 'igent30';
    if (products.includes('opdds_diario')) return 'workbook';
    if (products.includes('opdds_base')) return 'basic';
    return 'pdf';
  }

  async listUsers() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        entitlements: {
          where: {
            status: 'ACTIVE',
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
          select: {
            productKey: true,
            source: true,
            expiresAt: true,
            createdAt: true,
          },
        },
      },
    });

    return users.map((user) => {
      const products = user.entitlements.map((entitlement) => entitlement.productKey);
      return {
        ...user,
        plan: this.derivePlan(products),
        products,
      };
    });
  }

  async listProducts() {
    return this.prisma.product.findMany({
      where: { active: true },
      orderBy: { key: 'asc' },
      select: { id: true, key: true, name: true, description: true },
    });
  }

  async grantPlan(userId: string, data: AdminGrantPlanDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) throw new NotFoundException('Leitor não encontrado.');

    const productKeys = PRODUCTS_BY_PLAN[data.plan as AccessPlan];
    if (!productKeys) throw new BadRequestException('Plano inválido.');

    for (const productKey of productKeys) {
      await this.grantProduct(userId, {
        productKey,
        expiresInDays: ['opdds_igentmind_30d', 'opdds_igentmind_90d', 'opdds_grupo'].includes(productKey) ? data.expiresInDays : undefined,
      });
    }

    await this.prisma.purchaseEvent.create({
      data: {
        userId,
        provider: 'ADMIN',
        eventType: 'PLAN_GRANTED',
        payload: { plan: data.plan, productKeys, expiresInDays: data.expiresInDays ?? null },
        processedAt: new Date(),
      },
    });

    return this.getUserAccess(userId);
  }

  async grantProduct(userId: string, data: AdminGrantProductDto) {
    const [user, product] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
      this.prisma.product.findUnique({ where: { key: data.productKey } }),
    ]);
    if (!user) throw new NotFoundException('Leitor não encontrado.');
    if (!product) throw new NotFoundException('Produto não encontrado.');

    const existing = await this.prisma.entitlement.findFirst({
      where: { userId, productKey: data.productKey, status: 'ACTIVE' },
    });

    const expiresAt = this.expiresAt(data.expiresInDays);
    if (existing) {
      await this.prisma.entitlement.update({
        where: { id: existing.id },
        data: { productId: product.id, expiresAt, source: 'ADMIN' },
      });
    } else {
      await this.prisma.entitlement.create({
        data: {
          userId,
          productId: product.id,
          productKey: data.productKey,
          source: 'ADMIN',
          status: 'ACTIVE',
          expiresAt,
        },
      });
    }

    await this.prisma.purchaseEvent.create({
      data: {
        userId,
        provider: 'ADMIN',
        eventType: 'PRODUCT_GRANTED',
        payload: { productKey: data.productKey, expiresInDays: data.expiresInDays ?? null },
        processedAt: new Date(),
      },
    });

    return this.getUserAccess(userId);
  }

  async revokeProduct(userId: string, productKey: string) {
    const updated = await this.prisma.entitlement.updateMany({
      where: { userId, productKey, status: 'ACTIVE' },
      data: { status: 'CANCELED' },
    });

    await this.prisma.purchaseEvent.create({
      data: {
        userId,
        provider: 'ADMIN',
        eventType: 'PRODUCT_REVOKED',
        payload: { productKey, count: updated.count },
        processedAt: new Date(),
      },
    });

    return this.getUserAccess(userId);
  }

  async getUserAccess(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        entitlements: {
          where: {
            status: 'ACTIVE',
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
          select: { productKey: true, source: true, expiresAt: true, createdAt: true },
        },
      },
    });
    if (!user) throw new NotFoundException('Leitor não encontrado.');
    const products = user.entitlements.map((entitlement) => entitlement.productKey);
    return { ...user, plan: this.derivePlan(products), products };
  }
}
