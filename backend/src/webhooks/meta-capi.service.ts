import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { getMetaCapiAccessToken, getMetaPixelId } from '../config/env';

const META_GRAPH_VERSION = 'v21.0';
const REQUEST_TIMEOUT_MS = 8_000;

type PurchaseEventInput = {
  email: string;
  orderId?: string | null;
  value?: number;
  currency?: string;
  fbc?: string;
  fbp?: string;
  clientIp?: string;
};

type LeadEventInput = {
  eventId: string;
  email?: string | null;
  // DDD + número, só dígitos (o DDI 55 é acrescentado aqui).
  whatsapp: string;
  pilar: string;
  ato: string;
  fbc?: string | null;
  fbp?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
  pageUrl?: string | null;
};

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = REQUEST_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Envia eventos de compra pro Meta via Conversions API (server-side), pra
 * melhorar a otimização/atribuição dos anúncios com base nas compras reais
 * confirmadas pela Kiwify. Recurso best-effort: nunca lança — uma falha aqui
 * não pode impedir a concessão de acesso ao leitor.
 */
@Injectable()
export class MetaCapiService {
  private readonly logger = new Logger(MetaCapiService.name);

  async sendPurchaseEvent(input: PurchaseEventInput): Promise<void> {
    const accessToken = getMetaCapiAccessToken();
    if (!accessToken) return;
    if (!input.email) return;

    const pixelId = getMetaPixelId();
    const url = `https://graph.facebook.com/${META_GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`;

    const payload = {
      data: [
        {
          event_name: 'Purchase',
          event_time: Math.floor(Date.now() / 1000),
          event_id: input.orderId || undefined,
          action_source: 'website',
          user_data: {
            em: [sha256(input.email)],
            ...(input.fbc ? { fbc: input.fbc } : {}),
            ...(input.fbp ? { fbp: input.fbp } : {}),
            ...(input.clientIp ? { client_ip_address: input.clientIp } : {}),
          },
          custom_data: {
            currency: input.currency || 'BRL',
            value: typeof input.value === 'number' && Number.isFinite(input.value) ? input.value : 0,
          },
        },
      ],
    };

    try {
      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        this.logger.warn(`Meta CAPI respondeu ${response.status}: ${body.slice(0, 500)}`);
      }
    } catch (error: any) {
      this.logger.warn(`Falha ao enviar evento de compra pro Meta CAPI: ${error?.message || error}`);
    }
  }

  /**
   * Evento Lead do quiz da LP. Usa o mesmo event_id do fbq do navegador para
   * o Meta deduplicar. Só vão dados de contato com hash e o código do pilar:
   * nome, nome do pilar, prólogo e respostas nunca saem daqui.
   */
  async sendLeadEvent(input: LeadEventInput): Promise<void> {
    const accessToken = getMetaCapiAccessToken();
    if (!accessToken) return;

    const pixelId = getMetaPixelId();
    const url = `https://graph.facebook.com/${META_GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`;

    const payload = {
      data: [
        {
          event_name: 'Lead',
          event_time: Math.floor(Date.now() / 1000),
          event_id: input.eventId,
          action_source: 'website',
          ...(input.pageUrl ? { event_source_url: input.pageUrl } : {}),
          user_data: {
            ph: [sha256(`55${input.whatsapp}`)],
            ...(input.email ? { em: [sha256(input.email)] } : {}),
            ...(input.fbc ? { fbc: input.fbc } : {}),
            ...(input.fbp ? { fbp: input.fbp } : {}),
            ...(input.clientIp ? { client_ip_address: input.clientIp } : {}),
            ...(input.userAgent ? { client_user_agent: input.userAgent } : {}),
          },
          custom_data: {
            content_name: 'quiz_dilema',
            content_category: input.pilar,
            ato: input.ato,
          },
        },
      ],
    };

    try {
      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        this.logger.warn(`Meta CAPI (Lead) respondeu ${response.status}: ${body.slice(0, 500)}`);
      }
    } catch (error: any) {
      this.logger.warn(`Falha ao enviar evento Lead pro Meta CAPI: ${error?.message || error}`);
    }
  }
}
