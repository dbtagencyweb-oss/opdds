import { Body, Controller, Headers, HttpCode, Post, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';

type AccessPlan = 'pdf' | 'basic' | 'workbook' | 'igent30' | 'igent90' | 'group' | 'vip';
type RevokeStatus = 'CANCELED' | 'REFUNDED';

const PRODUCTS_BY_PLAN: Record<AccessPlan, string[]> = {
  pdf: ['opdds_pdf'],
  basic: ['opdds_pdf', 'opdds_base'],
  workbook: ['opdds_pdf', 'opdds_base', 'opdds_diario'],
  igent30: ['opdds_pdf', 'opdds_base', 'opdds_diario', 'opdds_igentmind_30d'],
  igent90: ['opdds_pdf', 'opdds_base', 'opdds_diario', 'opdds_igentmind_90d'],
  group: ['opdds_pdf', 'opdds_base', 'opdds_diario', 'opdds_igentmind_90d', 'opdds_grupo'],
  vip: ['opdds_pdf', 'opdds_base', 'opdds_diario', 'opdds_igentmind_30d', 'opdds_igentmind_90d', 'opdds_grupo', 'opdds_vip'],
};

function valueOf(...values: any[]) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== '') ?? '';
}

function normalized(value: any) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function isApproved(value: any) {
  const event = normalized(value).replace(/[\s.-]+/g, '_');
  return ['order_approved', 'order_paid', 'purchase_approved', 'paid', 'approved', 'compra_aprovada', 'pedido_aprovado'].includes(event);
}

function isRefund(value: any) {
  const event = normalized(value).replace(/[\s.-]+/g, '_');
  return ['refund', 'refunded', 'order_refunded', 'purchase_refunded', 'reembolso', 'compra_reembolsada'].includes(event);
}

function isChargeback(value: any) {
  const event = normalized(value).replace(/[\s.-]+/g, '_');
  return ['chargeback', 'order_chargeback', 'purchase_chargeback'].includes(event);
}

function isCancellation(value: any) {
  const event = normalized(value).replace(/[\s.-]+/g, '_');
  return [
    'canceled',
    'cancelled',
    'order_canceled',
    'order_cancelled',
    'subscription_canceled',
    'subscription_cancelled',
    'assinatura_cancelada',
    'compra_cancelada',
    'cancelamento',
  ].includes(event);
}

function isRenewal(value: any) {
  const event = normalized(value).replace(/[\s.-]+/g, '_');
  return ['subscription_renewed', 'subscription_renewal', 'renewed', 'renovacao', 'assinatura_renovada'].includes(event);
}

function flattenText(value: any): string {
  if (!value) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(flattenText).join(' ');
  if (typeof value === 'object') return Object.values(value).map(flattenText).join(' ');
  return '';
}

function resolvePlan(payload: any): AccessPlan {
  const data = payload.data ?? payload.payload ?? payload;
  const order = data.Order ?? data.order ?? data;
  const product = data.Product ?? data.product ?? {};
  const subscription = data.Subscription ?? data.subscription ?? {};
  const text = normalized([
    order.name,
    order.offer_name,
    order.offerName,
    order.product_name,
    order.productName,
    product.name,
    product.product_name,
    product.offer_name,
    product.title,
    subscription.plan_name,
    subscription.planName,
    flattenText(order.items ?? order.line_items ?? order.order_items ?? data.items ?? data.products),
  ].filter(Boolean).join(' '));

  if (text.includes('vip') || text.includes('completo') || text.includes('pacote') || text.includes('acesso total')) return 'vip';
  if (text.includes('grupo') || text.includes('comunidade') || text.includes('mentoria') || text.includes('viva dos desacreditados')) return 'group';
  if ((text.includes('igent') || text.includes('mind')) && text.includes('90')) return 'igent90';
  if ((text.includes('igent') || text.includes('mind')) && text.includes('30')) return 'igent30';
  if (text.includes('mentor') || text.includes('psicana') || text.includes('conselheiro')) return 'igent30';
  if (text.includes('diario') || text.includes('workbook')) return 'workbook';
  if (text.includes('pdf') || text.includes('ebook') || text.includes('e-book')) return 'pdf';
  if (text.includes('poder dos desacreditados')) return 'basic';

  return 'basic';
}

function verifySignature(raw: string, signature = '', secret = '') {
  if (!secret) return true;
  if (!signature) return process.env.KIWIFY_REQUIRE_SIGNATURE !== 'true';
  const expected = crypto.createHmac('sha1', secret).update(raw).digest('hex');
  return expected === signature;
}

function extractData(body: any) {
  const data = body.data ?? body.payload ?? body;
  const customer = data.Customer ?? data.customer ?? data.buyer ?? {};
  const order = data.Order ?? data.order ?? data;
  const subscription = data.Subscription ?? data.subscription ?? {};

  const email = String(valueOf(customer.email, order.customer_email, order.email, data.customer_email, data.email)).trim().toLowerCase();
  const name = String(valueOf(customer.full_name, customer.name, order.customer_name, data.customer_name, data.name, 'Leitor OPDDS')).trim();
  const orderId = String(valueOf(order.id, order.order_id, order.orderId, data.order_id, data.id, subscription.id)).trim() || null;
  const plan = resolvePlan(body);

  return { data, customer, order, subscription, email, name, orderId, plan, productKeys: PRODUCTS_BY_PLAN[plan] };
}

@Controller('kiwify')
export class KiwifyWebhookController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('webhook')
  @HttpCode(200)
  async handle(@Body() body: any, @Headers('x-kiwify-event') event: string, @Headers('x-kiwify-signature') signature: string) {
    const raw = JSON.stringify(body);
    if (!verifySignature(raw, signature, process.env.KIWIFY_TOKEN || '')) {
      throw new UnauthorizedException('Assinatura Kiwify inválida.');
    }

    const data = body.data ?? body.payload ?? body;
    const detectedEvent = valueOf(
      event,
      body.event,
      body.webhook_event_type,
      body.event_type,
      body.type,
      data.event,
      data.status,
      data.Order?.status,
      data.order?.status,
    );

    const purchase = extractData(body);

    if (!isApproved(detectedEvent)) {
      if (isRefund(detectedEvent) || isChargeback(detectedEvent)) {
        return this.revokeAccess(body, purchase, detectedEvent, 'REFUNDED');
      }

      if (isCancellation(detectedEvent)) {
        return this.revokeAccess(body, purchase, detectedEvent, 'CANCELED');
      }

      if (isRenewal(detectedEvent)) {
        return this.grantAccess(body, purchase, detectedEvent, true);
      }

      await this.prisma.purchaseEvent.create({
        data: {
          provider: 'KIWIFY',
          eventType: 'IGNORED',
          externalId: purchase.orderId,
          payload: { event: detectedEvent || null, plan: purchase.plan, email: purchase.email || null, body },
          processedAt: new Date(),
        },
      });

      return { ok: true, ignored: true, event: detectedEvent || null };
    }

    return this.grantAccess(body, purchase, detectedEvent);
  }

  private async grantAccess(body: any, purchase: ReturnType<typeof extractData>, eventType: string, renewal = false) {
    if (!purchase.email) {
      await this.prisma.purchaseEvent.create({
        data: {
          provider: 'KIWIFY',
          eventType: renewal ? 'RENEWAL_IGNORED' : 'APPROVED_IGNORED',
          externalId: purchase.orderId,
          payload: { event: eventType || null, reason: 'missing_email', body },
          processedAt: new Date(),
        },
      });
      return { ok: false, ignored: true, reason: 'missing_email' };
    }

    const duplicated = purchase.orderId
      ? await this.prisma.purchaseEvent.findFirst({
          where: {
            provider: 'KIWIFY',
            externalId: purchase.orderId,
            eventType: { in: renewal ? ['RENEWAL_GRANTED'] : ['ACCESS_GRANTED', 'INVITE_CREATED'] },
          },
        })
      : null;

    if (duplicated) {
      return { ok: true, duplicate: true, event: eventType || null };
    }

    const user = await this.prisma.user.findUnique({ where: { email: purchase.email } });

    if (!user) {
      const invite = await this.authService.createInvite({
        email: purchase.email,
        name: purchase.name,
        plan: purchase.plan,
        source: 'KIWIFY',
        externalId: purchase.orderId,
      });

      return {
        ok: true,
        action: 'invite_created',
        event: eventType || null,
        email: purchase.email,
        name: purchase.name,
        products: purchase.productKeys,
        ...invite,
      };
    }

    await this.upsertEntitlements(user.id, purchase.productKeys);

    await this.prisma.purchaseEvent.create({
      data: {
        userId: user.id,
        provider: 'KIWIFY',
        eventType: renewal ? 'RENEWAL_GRANTED' : 'ACCESS_GRANTED',
        externalId: purchase.orderId,
        payload: {
          event: eventType || null,
          email: purchase.email,
          name: purchase.name,
          plan: purchase.plan,
          productKeys: purchase.productKeys,
          body,
        },
        processedAt: new Date(),
      },
    });

    return {
      ok: true,
      action: renewal ? 'access_renewed' : 'access_granted',
      event: eventType || null,
      email: purchase.email,
      plan: purchase.plan,
      products: purchase.productKeys,
    };
  }

  private async revokeAccess(body: any, purchase: ReturnType<typeof extractData>, eventType: string, status: RevokeStatus) {
    const user = purchase.email ? await this.prisma.user.findUnique({ where: { email: purchase.email } }) : null;
    const update = user
      ? await this.prisma.entitlement.updateMany({
          where: { userId: user.id, productKey: { in: purchase.productKeys }, status: 'ACTIVE' },
          data: { status },
        })
      : null;

    await this.prisma.purchaseEvent.create({
      data: {
        userId: user?.id,
        provider: 'KIWIFY',
        eventType: status === 'REFUNDED' ? 'ACCESS_REFUNDED' : 'ACCESS_CANCELED',
        externalId: purchase.orderId,
        payload: {
          event: eventType || null,
          email: purchase.email || null,
          plan: purchase.plan,
          productKeys: purchase.productKeys,
          affectedEntitlements: update?.count ?? 0,
          body,
        },
        processedAt: new Date(),
      },
    });

    return {
      ok: true,
      action: status === 'REFUNDED' ? 'access_refunded' : 'access_canceled',
      event: eventType || null,
      email: purchase.email || null,
      plan: purchase.plan,
      products: purchase.productKeys,
      affectedEntitlements: update?.count ?? 0,
    };
  }

  private async upsertEntitlements(userId: string, productKeys: string[]) {
    for (const productKey of productKeys) {
      const product = await this.prisma.product.findUnique({ where: { key: productKey } });
      const existing = await this.prisma.entitlement.findFirst({
        where: { userId, productKey, status: 'ACTIVE' },
      });

      if (existing) {
        await this.prisma.entitlement.update({
          where: { id: existing.id },
          data: { productId: product?.id, source: 'KIWIFY', expiresAt: null },
        });
      } else {
        await this.prisma.entitlement.create({
          data: {
            userId,
            productId: product?.id,
            productKey,
            source: 'KIWIFY',
            status: 'ACTIVE',
          },
        });
      }
    }
  }
}
