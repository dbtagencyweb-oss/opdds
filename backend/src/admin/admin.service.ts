import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminBookAudioDto, AdminBookAudioMetaDto, AdminBookAudioOrderDto, AdminBookPageContentDto, AdminGrantPlanDto, AdminGrantProductDto } from './admin.dto';

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

  async listEvents() {
    const events = await this.prisma.purchaseEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 80,
      select: {
        id: true,
        provider: true,
        eventType: true,
        externalId: true,
        processedAt: true,
        createdAt: true,
        payload: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return events.map((event) => {
      const payload = event.payload && typeof event.payload === 'object' && !Array.isArray(event.payload)
        ? event.payload as Record<string, any>
        : {};

      return {
        id: event.id,
        provider: event.provider,
        eventType: event.eventType,
        externalId: event.externalId,
        processedAt: event.processedAt,
        createdAt: event.createdAt,
        user: event.user,
        email: payload.email || event.user?.email || null,
        name: payload.name || event.user?.name || null,
        plan: payload.plan || null,
        event: payload.event || null,
        reason: payload.reason || null,
        affectedEntitlements: payload.affectedEntitlements ?? payload.count ?? null,
        productKeys: Array.isArray(payload.productKeys) ? payload.productKeys : [],
        code: payload.code || null,
      };
    });
  }

  private async nextBookPageVersion(pageNumber: number) {
    const latest = await this.prisma.bookPageRevision.findFirst({
      where: { pageNumber },
      orderBy: { version: 'desc' },
      select: { version: true },
    });
    return (latest?.version ?? 0) + 1;
  }

  private async nextBookAudioVersion(chapterId: string, sectionKey: string) {
    const latest = await this.prisma.bookAudioRevision.findFirst({
      where: { chapterId, sectionKey },
      orderBy: { version: 'desc' },
      select: { version: true },
    });
    return (latest?.version ?? 0) + 1;
  }

  private mapBookRevision(revision: any) {
    return {
      id: revision.id,
      pageNumber: revision.pageNumber,
      title: revision.title,
      content: revision.content,
      status: revision.status,
      version: revision.version,
      publishedAt: revision.publishedAt,
      createdAt: revision.createdAt,
      updatedAt: revision.updatedAt,
    };
  }

  private mapBookAudioRevision(revision: any) {
    return {
      id: revision.id,
      chapterId: revision.chapterId,
      sectionKey: revision.sectionKey,
      label: revision.label,
      url: revision.url,
      coverUrl: revision.coverUrl,
      version: revision.version,
      publishedAt: revision.publishedAt,
      createdAt: revision.createdAt,
      updatedAt: revision.updatedAt,
    };
  }

  private mapBookAudioMeta(meta: any) {
    if (!meta) return null;
    return {
      chapterId: meta.chapterId,
      sectionKey: meta.sectionKey,
      productionStatus: meta.productionStatus,
      productionNote: meta.productionNote,
      coverUrl: meta.coverUrl,
      sortOrder: meta.sortOrder,
      updatedAt: meta.updatedAt,
    };
  }

  async listBookPageRevisions() {
    const revisions = await this.prisma.bookPageRevision.findMany({
      orderBy: [{ pageNumber: 'asc' }, { createdAt: 'desc' }],
    });

    const byPage = new Map<number, { pageNumber: number; latestDraft: any | null; latestPublished: any | null; history: any[] }>();
    for (const revision of revisions) {
      const current = byPage.get(revision.pageNumber) ?? {
        pageNumber: revision.pageNumber,
        latestDraft: null,
        latestPublished: null,
        history: [],
      };
      const mapped = this.mapBookRevision(revision);
      current.history.push(mapped);
      if (revision.status === 'DRAFT' && !current.latestDraft) current.latestDraft = mapped;
      if (revision.status === 'PUBLISHED' && !current.latestPublished) current.latestPublished = mapped;
      byPage.set(revision.pageNumber, current);
    }

    return Array.from(byPage.values());
  }

  async getBookPageRevisions(pageNumber: number) {
    const revisions = await this.prisma.bookPageRevision.findMany({
      where: { pageNumber },
      orderBy: { createdAt: 'desc' },
    });
    return revisions.map((revision) => this.mapBookRevision(revision));
  }

  async saveBookPageDraft(pageNumber: number, data: AdminBookPageContentDto, createdById?: string) {
    if (!data.content.trim()) throw new BadRequestException('Conteudo da pagina nao informado.');
    const revision = await this.prisma.bookPageRevision.create({
      data: {
        pageNumber,
        title: data.title?.trim() || null,
        content: data.content,
        status: 'DRAFT',
        version: await this.nextBookPageVersion(pageNumber),
        createdById,
      },
    });
    return this.mapBookRevision(revision);
  }

  async publishBookPage(pageNumber: number, data: AdminBookPageContentDto, createdById?: string) {
    if (!data.content.trim()) throw new BadRequestException('Conteudo da pagina nao informado.');
    const revision = await this.prisma.bookPageRevision.create({
      data: {
        pageNumber,
        title: data.title?.trim() || null,
        content: data.content,
        status: 'PUBLISHED',
        version: await this.nextBookPageVersion(pageNumber),
        createdById,
        publishedAt: new Date(),
      },
    });
    return this.mapBookRevision(revision);
  }

  async listBookAudioRevisions() {
    const [revisions, metas] = await Promise.all([
      this.prisma.bookAudioRevision.findMany({
        orderBy: [{ chapterId: 'asc' }, { sectionKey: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.bookAudioTrackMeta.findMany(),
    ]);
    const metaByTrack = new Map(metas.map((meta) => [`${meta.chapterId}:${meta.sectionKey}`, meta]));

    const byTrack = new Map<string, { chapterId: string; sectionKey: string; latestPublished: any | null; history: any[]; production: any | null }>();
    for (const revision of revisions) {
      const key = `${revision.chapterId}:${revision.sectionKey}`;
      const current = byTrack.get(key) ?? {
        chapterId: revision.chapterId,
        sectionKey: revision.sectionKey,
        latestPublished: null,
        history: [],
        production: this.mapBookAudioMeta(metaByTrack.get(key)),
      };
      const mapped = this.mapBookAudioRevision(revision);
      current.history.push(mapped);
      if (!current.latestPublished) current.latestPublished = mapped;
      byTrack.set(key, current);
    }

    for (const meta of metas) {
      const key = `${meta.chapterId}:${meta.sectionKey}`;
      if (!byTrack.has(key)) {
        byTrack.set(key, {
          chapterId: meta.chapterId,
          sectionKey: meta.sectionKey,
          latestPublished: null,
          history: [],
          production: this.mapBookAudioMeta(meta),
        });
      }
    }

    return Array.from(byTrack.values()).sort((a, b) => {
      const orderA = a.production?.sortOrder ?? 9999;
      const orderB = b.production?.sortOrder ?? 9999;
      return a.chapterId.localeCompare(b.chapterId) || orderA - orderB || a.sectionKey.localeCompare(b.sectionKey);
    });
  }

  async publishBookAudio(data: AdminBookAudioDto, createdById?: string) {
    const chapterId = data.chapterId.trim();
    const sectionKey = data.sectionKey.trim();
    const label = data.label.trim();
    const url = data.url.trim();
    const coverUrl = data.coverUrl?.trim() || null;
    if (!chapterId || !sectionKey || !label || !url) throw new BadRequestException('Dados do audio incompletos.');

    const revision = await this.prisma.bookAudioRevision.create({
      data: {
        chapterId,
        sectionKey,
        label,
        url,
        coverUrl,
        version: await this.nextBookAudioVersion(chapterId, sectionKey),
        createdById,
        publishedAt: new Date(),
      },
    });
    if (coverUrl) {
      await this.saveBookAudioMeta({ chapterId, sectionKey, coverUrl });
    }
    return this.mapBookAudioRevision(revision);
  }

  async saveBookAudioMeta(data: AdminBookAudioMetaDto) {
    const chapterId = data.chapterId.trim();
    const sectionKey = data.sectionKey.trim();
    if (!chapterId || !sectionKey) throw new BadRequestException('Faixa de audio nao informada.');

    const meta = await this.prisma.bookAudioTrackMeta.upsert({
      where: { chapterId_sectionKey: { chapterId, sectionKey } },
      create: {
        chapterId,
        sectionKey,
        productionStatus: data.productionStatus || 'review',
        productionNote: data.productionNote?.trim() || null,
        coverUrl: data.coverUrl?.trim() || null,
        sortOrder: data.sortOrder ?? 0,
      },
      update: {
        ...(data.productionStatus ? { productionStatus: data.productionStatus } : {}),
        ...(data.productionNote !== undefined ? { productionNote: data.productionNote.trim() || null } : {}),
        ...(data.coverUrl !== undefined ? { coverUrl: data.coverUrl.trim() || null } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
      },
    });
    return this.mapBookAudioMeta(meta);
  }

  async saveBookAudioOrder(data: AdminBookAudioOrderDto) {
    const chapterId = data.chapterId.trim();
    if (!chapterId) throw new BadRequestException('Capitulo nao informado.');
    const updates = data.sectionKeys.map((sectionKey, index) =>
      this.saveBookAudioMeta({ chapterId, sectionKey: sectionKey.trim(), sortOrder: index }),
    );
    return Promise.all(updates);
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
