import { Body, Controller, Headers, HttpCode, Post, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';

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

type AccessPlan = 'pdf' | 'basic' | 'workbook' | 'igent30' | 'igent90' | 'group' | 'vip';

function resolvePlan(payload: any): AccessPlan {
  const data = payload.data ?? payload.payload ?? payload;
  const order = data.Order ?? data.order ?? data;
  const product = data.Product ?? data.product ?? {};
  const text = normalized([
    order.offer_name,
    order.offerName,
    order.product_name,
    product.name,
    product.product_name,
    product.offer_name,
    JSON.stringify(order.items ?? order.line_items ?? []),
  ].filter(Boolean).join(' '));

  if (text.includes('vip') || text.includes('completo') || text.includes('pacote')) return 'vip';
  if (text.includes('grupo') || text.includes('comunidade') || text.includes('mentoria')) return 'group';
  if ((text.includes('igent') || text.includes('mind')) && text.includes('90')) return 'igent90';
  if ((text.includes('igent') || text.includes('mind')) && text.includes('30')) return 'igent30';
  if (text.includes('diario') || text.includes('workbook')) return 'workbook';
  if (text.includes('pdf') && !text.includes('app')) return 'pdf';

  return 'basic';
}

function verifySignature(raw: string, signature = '', secret = '') {
  if (!secret) return true;
  if (!signature) return process.env.KIWIFY_REQUIRE_SIGNATURE !== 'true';
  const expected = crypto.createHmac('sha1', secret).update(raw).digest('hex');
  return expected === signature;
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

    if (!isApproved(detectedEvent)) {
      return { ok: true, ignored: true, event: detectedEvent || null };
    }

    const customer = data.Customer ?? data.customer ?? data.buyer ?? {};
    const order = data.Order ?? data.order ?? data;
    const email = String(valueOf(customer.email, order.customer_email, order.email, data.customer_email, data.email)).trim().toLowerCase();
    const name = String(valueOf(customer.full_name, customer.name, order.customer_name, data.customer_name, data.name, 'Leitor OPDDS')).trim();
    const orderId = String(valueOf(order.id, order.order_id, order.orderId, data.order_id, data.id)).trim() || null;

    if (!email) {
      return { ok: false, ignored: true, reason: 'missing_email' };
    }

    const duplicated = orderId
      ? await this.prisma.purchaseEvent.findFirst({ where: { provider: 'KIWIFY', externalId: orderId } })
      : null;

    if (duplicated) {
      return { ok: true, duplicate: true };
    }

    const invite = await this.authService.createInvite({
      email,
      name,
      plan: resolvePlan(body),
      source: 'KIWIFY',
      externalId: orderId,
    });

    return {
      ok: true,
      email,
      name,
      ...invite,
    };
  }
}
