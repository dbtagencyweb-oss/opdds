import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, QuizLead } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MetaCapiService } from '../webhooks/meta-capi.service';
import { getCartasUrls, getLeadWebhookUrl } from '../config/env';
import { ATOS, PILARES, atoDoPilar } from './pilares';
import { normalizeWhatsapp, whatsappVariants } from './phone';
import { CreateLeadDto, LEAD_STATUSES, LeadStatus, UpdateLeadDto } from './leads.dto';

const WEBHOOK_TIMEOUT_MS = 8_000;
const SEM_ORIGEM = '(direto)';

export type LeadFilters = {
  de?: string;
  ate?: string;
  pilar?: string;
  status?: string;
  origem?: string;
  q?: string;
};

type RequestMeta = { ip: string | null; userAgent: string | null };

function cut(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  return text ? text.slice(0, max) : null;
}

/** UTMs do objeto `utms` do quiz; o que faltar sai da query da pageUrl. */
function extractUtms(utms: Record<string, unknown> | undefined, pageUrl?: string) {
  let query: URLSearchParams | null = null;
  try {
    query = pageUrl ? new URL(pageUrl).searchParams : null;
  } catch {
    query = null;
  }
  const pick = (key: string) => cut(utms?.[key], 200) ?? cut(query?.get(key) ?? undefined, 200);

  return {
    utmSource: pick('utm_source'),
    utmMedium: pick('utm_medium'),
    utmCampaign: pick('utm_campaign'),
    utmContent: pick('utm_content'),
    utmTerm: pick('utm_term'),
    gclid: pick('gclid'),
  };
}

/** Data "AAAA-MM-DD" no fuso de Brasília (início ou fim do dia). */
function brDate(value: string | undefined, endOfDay: boolean): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}-03:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function csvCell(value: unknown): string {
  let text = value == null ? '' : value instanceof Date ? value.toISOString() : String(value);
  // Evita que o Excel/Sheets interprete o conteúdo como fórmula.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly metaCapi: MetaCapiService,
  ) {}

  // ── Público (LP) ──────────────────────────────────────────────────────────

  /**
   * Salva o lead. Idempotente por eventId: reenvio do mesmo evento não cria
   * outro registro. Webhook e CAPI rodam depois, sem segurar a resposta.
   */
  async create(dto: CreateLeadDto, meta: RequestMeta): Promise<{ duplicate: boolean }> {
    const existing = await this.prisma.quizLead.findUnique({ where: { eventId: dto.eventId }, select: { id: true } });
    if (existing) return { duplicate: true };

    let lead: QuizLead;
    try {
      lead = await this.prisma.quizLead.create({
        data: {
          nome: dto.nome,
          whatsapp: dto.whatsapp,
          email: dto.email ?? null,
          consentimento: true,
          consentimentoEm: new Date(),
          prologo: dto.prologo ?? null,
          pilarResultado: dto.pilarResultado,
          pontuacoes: dto.pontuacoes,
          cartaUrl: this.cartaUrlFor(dto.pilarResultado, dto.cartaUrl),
          ...extractUtms(dto.utms, dto.pageUrl),
          eventId: dto.eventId,
          fbc: dto.fbc ?? null,
          fbp: dto.fbp ?? null,
          pageUrl: dto.pageUrl ?? null,
          ip: meta.ip,
          userAgent: meta.userAgent,
        },
      });
    } catch (error) {
      // Dois envios simultâneos do mesmo eventId: o segundo bate no unique.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return { duplicate: true };
      throw error;
    }

    void this.afterCreate(lead);
    return { duplicate: false };
  }

  private async afterCreate(lead: QuizLead) {
    const ato = atoDoPilar(lead.pilarResultado);
    const results = await Promise.allSettled([
      this.sendToAutomation(lead),
      this.metaCapi.sendLeadEvent({
        eventId: lead.eventId,
        email: lead.email,
        whatsapp: lead.whatsapp,
        pilar: lead.pilarResultado,
        ato,
        fbc: lead.fbc,
        fbp: lead.fbp,
        clientIp: lead.ip,
        userAgent: lead.userAgent,
        pageUrl: lead.pageUrl,
      }),
    ]);
    for (const result of results) {
      if (result.status === 'rejected') this.logger.warn(`Pós-processamento do lead ${lead.id} falhou: ${result.reason?.message || result.reason}`);
    }
  }

  private async sendToAutomation(lead: QuizLead) {
    const url = getLeadWebhookUrl();
    if (!url) return;

    const ato = atoDoPilar(lead.pilarResultado);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          evento: 'quiz_lead',
          id: lead.id,
          createdAt: lead.createdAt,
          nome: lead.nome,
          whatsapp: lead.whatsapp,
          whatsappE164: `+55${lead.whatsapp}`,
          email: lead.email,
          consentimentoEm: lead.consentimentoEm,
          prologo: lead.prologo,
          pilarResultado: lead.pilarResultado,
          pilarNome: PILARES[lead.pilarResultado] ?? lead.pilarResultado,
          ato,
          atoNome: ATOS[ato],
          cartaUrl: lead.cartaUrl,
          pontuacoes: lead.pontuacoes,
          utmSource: lead.utmSource,
          utmMedium: lead.utmMedium,
          utmCampaign: lead.utmCampaign,
          utmContent: lead.utmContent,
          utmTerm: lead.utmTerm,
          gclid: lead.gclid,
          eventId: lead.eventId,
          pageUrl: lead.pageUrl,
        }),
      });
      if (!response.ok) {
        const body = await response.text().catch(() => '');
        this.logger.warn(`LEAD_WEBHOOK_URL respondeu ${response.status} para o lead ${lead.id}: ${body.slice(0, 300)}`);
      }
    } catch (error: any) {
      this.logger.warn(`Falha ao enviar o lead ${lead.id} para LEAD_WEBHOOK_URL: ${error?.message || error}`);
    } finally {
      clearTimeout(timer);
    }
  }

  /** Link da carta: o mapa CARTAS_URLS manda; o link do quiz é o reserva. */
  private cartaUrlFor(pilar: string, fromQuiz?: string): string | null {
    const configured = getCartasUrls()[pilar];
    if (configured) return configured;
    return fromQuiz && /^https?:\/\//i.test(fromQuiz) ? fromQuiz : null;
  }

  // ── Kiwify ────────────────────────────────────────────────────────────────

  /** Marca como `comprou` os leads com o mesmo e-mail ou WhatsApp da compra. */
  async markPurchased(input: { email?: string | null; phone?: string | null }): Promise<number> {
    const or: Prisma.QuizLeadWhereInput[] = [];
    const email = String(input.email || '').trim().toLowerCase();
    if (email) or.push({ email });
    const variants = whatsappVariants(input.phone);
    if (variants.length) or.push({ whatsapp: { in: variants } });
    if (or.length === 0) return 0;

    const result = await this.prisma.quizLead.updateMany({
      where: { OR: or, status: { not: 'comprou' } },
      data: { status: 'comprou', compradorEm: new Date() },
    });
    return result.count;
  }

  // ── Admin ─────────────────────────────────────────────────────────────────

  private buildWhere(filters: LeadFilters): Prisma.QuizLeadWhereInput {
    const and: Prisma.QuizLeadWhereInput[] = [];

    const de = brDate(filters.de, false);
    const ate = brDate(filters.ate, true);
    if (de || ate) and.push({ createdAt: { ...(de ? { gte: de } : {}), ...(ate ? { lte: ate } : {}) } });

    if (filters.pilar && PILARES[filters.pilar]) and.push({ pilarResultado: filters.pilar });
    if (filters.status && (LEAD_STATUSES as readonly string[]).includes(filters.status)) {
      and.push({ status: filters.status as LeadStatus });
    }
    if (filters.origem) and.push({ utmSource: filters.origem === SEM_ORIGEM ? null : filters.origem });

    const q = String(filters.q || '').trim();
    if (q) {
      const digits = q.replace(/\D/g, '');
      and.push({
        OR: [
          { nome: { contains: q, mode: 'insensitive' } },
          { email: { contains: q.toLowerCase() } },
          ...(digits.length >= 3 ? [{ whatsapp: { contains: normalizeWhatsapp(digits) } }] : []),
        ],
      });
    }

    return and.length ? { AND: and } : {};
  }

  private present(lead: QuizLead) {
    const ato = atoDoPilar(lead.pilarResultado);
    return {
      ...lead,
      pilarNome: PILARES[lead.pilarResultado] ?? lead.pilarResultado,
      ato,
      atoNome: ATOS[ato],
      cartaUrl: lead.cartaUrl || getCartasUrls()[lead.pilarResultado] || null,
    };
  }

  /** Lista agrupada por WhatsApp: o lead mais recente e as tentativas anteriores. */
  async list(filters: LeadFilters, page = 1, pageSize = 50) {
    const where = this.buildWhere(filters);
    const size = Math.min(200, Math.max(1, pageSize || 50));
    const current = Math.max(1, page || 1);

    const groups = await this.prisma.quizLead.groupBy({
      by: ['whatsapp'],
      where,
      _max: { createdAt: true },
      orderBy: { _max: { createdAt: 'desc' } },
    });
    const pageGroups = groups.slice((current - 1) * size, current * size).map((group) => group.whatsapp);

    const leads = pageGroups.length
      ? await this.prisma.quizLead.findMany({
          where: { AND: [where, { whatsapp: { in: pageGroups } }] },
          orderBy: { createdAt: 'desc' },
        })
      : [];

    const byWhatsapp = new Map<string, QuizLead[]>();
    for (const lead of leads) {
      const list = byWhatsapp.get(lead.whatsapp) ?? [];
      list.push(lead);
      byWhatsapp.set(lead.whatsapp, list);
    }

    return {
      page: current,
      pageSize: size,
      totalGrupos: groups.length,
      items: pageGroups.map((whatsapp) => {
        const [latest, ...anteriores] = (byWhatsapp.get(whatsapp) ?? []).map((lead) => this.present(lead));
        return { whatsapp, lead: latest, anteriores };
      }).filter((item) => item.lead),
    };
  }

  async resumo(filters: LeadFilters) {
    const where = this.buildWhere(filters);
    const [total, porPilarRaw, porOrigemRaw, porStatusRaw, pessoas, compradores] = await Promise.all([
      this.prisma.quizLead.count({ where }),
      this.prisma.quizLead.groupBy({ by: ['pilarResultado'], where, _count: { _all: true } }),
      this.prisma.quizLead.groupBy({ by: ['utmSource'], where, _count: { _all: true } }),
      this.prisma.quizLead.groupBy({ by: ['status'], where, _count: { _all: true } }),
      this.prisma.quizLead.groupBy({ by: ['whatsapp'], where }),
      this.prisma.quizLead.groupBy({ by: ['whatsapp'], where: { AND: [where, { status: 'comprou' }] } }),
    ]);

    const porPilar = Object.keys(PILARES).map((codigo) => ({
      codigo,
      nome: PILARES[codigo],
      total: porPilarRaw.find((row) => row.pilarResultado === codigo)?._count._all ?? 0,
    }));
    const porAto = Object.keys(ATOS).map((codigo) => ({
      codigo,
      nome: ATOS[codigo],
      total: porPilar.filter((row) => atoDoPilar(row.codigo) === codigo).reduce((sum, row) => sum + row.total, 0),
    }));
    const porOrigem = porOrigemRaw
      .map((row) => ({ origem: row.utmSource ?? SEM_ORIGEM, total: row._count._all }))
      .sort((a, b) => b.total - a.total);
    const porStatus = LEAD_STATUSES.map((status) => ({
      status,
      total: porStatusRaw.find((row) => row.status === status)?._count._all ?? 0,
    }));

    return {
      total,
      pessoas: pessoas.length,
      compraram: compradores.length,
      // Taxa por pessoa (WhatsApp), para quem refez o quiz não diluir a conta.
      taxaCompra: pessoas.length ? compradores.length / pessoas.length : 0,
      porPilar,
      porAto,
      porOrigem,
      porStatus,
    };
  }

  async exportCsv(filters: LeadFilters): Promise<string> {
    const leads = await this.prisma.quizLead.findMany({
      where: this.buildWhere(filters),
      orderBy: { createdAt: 'desc' },
      take: 20_000,
    });

    const header = [
      'data', 'nome', 'whatsapp', 'email', 'pilar', 'pilar_nome', 'ato', 'status', 'prologo', 'pontuacoes',
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid',
      'carta_enviada_em', 'comprador_em', 'observacao', 'consentimento_em', 'event_id',
    ];
    const rows = leads.map((lead) => [
      lead.createdAt, lead.nome, lead.whatsapp, lead.email, lead.pilarResultado, PILARES[lead.pilarResultado] ?? '',
      atoDoPilar(lead.pilarResultado), lead.status, lead.prologo, JSON.stringify(lead.pontuacoes),
      lead.utmSource, lead.utmMedium, lead.utmCampaign, lead.utmContent, lead.utmTerm, lead.gclid,
      lead.cartaEnviadaEm, lead.compradorEm, lead.observacao, lead.consentimentoEm, lead.eventId,
    ]);

    // BOM + ";" para o Excel em português abrir com acentos e colunas certas.
    return '﻿' + [header, ...rows].map((row) => row.map(csvCell).join(';')).join('\r\n');
  }

  async update(id: string, dto: UpdateLeadDto) {
    const lead = await this.prisma.quizLead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead não encontrado.');

    const data: Prisma.QuizLeadUpdateInput = {};
    if (dto.status) data.status = dto.status;
    if (dto.observacao !== undefined) data.observacao = dto.observacao.trim() || null;
    if (dto.cartaEnviada || (dto.status === 'carta_enviada' && !lead.cartaEnviadaEm)) data.cartaEnviadaEm = new Date();
    if (dto.status === 'comprou' && !lead.compradorEm) data.compradorEm = new Date();

    return this.present(await this.prisma.quizLead.update({ where: { id }, data }));
  }

  async remove(id: string) {
    const result = await this.prisma.quizLead.deleteMany({ where: { id } });
    if (result.count === 0) throw new NotFoundException('Lead não encontrado.');
    return { ok: true, removidos: result.count };
  }

  /** Pedido de exclusão (LGPD): apaga todos os registros desse WhatsApp e/ou e-mail. */
  async removeByContact(input: { whatsapp?: string; email?: string }) {
    const or: Prisma.QuizLeadWhereInput[] = [];
    const variants = whatsappVariants(input.whatsapp);
    if (variants.length) or.push({ whatsapp: { in: variants } });
    const email = String(input.email || '').trim().toLowerCase();
    if (email) or.push({ email });
    if (or.length === 0) throw new BadRequestException('Informe o WhatsApp ou o e-mail.');

    const result = await this.prisma.quizLead.deleteMany({ where: { OR: or } });
    return { ok: true, removidos: result.count };
  }
}
