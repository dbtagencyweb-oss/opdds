import { ForbiddenException, HttpException, HttpStatus, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, type MindTrial } from '@prisma/client';
import { MailService } from '../auth/mail.service';
import { PrismaService } from '../prisma/prisma.service';

export const MIND_TRIAL_HOURS = 72;
export const MIND_TRIAL_DAILY_LIMIT = 15;
export const MIND_TRIAL_ACTIVATION_DAYS = 30;
const DAY2_AFTER_HOURS = 24;
const SWEEP_INTERVAL_MS = 10 * 60 * 1000;
const TIME_ZONE = 'America/Sao_Paulo';

const HOUR_MS = 60 * 60 * 1000;
const PAID_MIND_KEYS = ['opdds_igentmind_7d', 'opdds_igentmind_30d', 'opdds_igentmind_90d', 'opdds_vip'];

// Bump "Diário + iGentMIND 30 dias" (R$ 37) — mesmo link de upgradeOffers.igent30 no app.
const DEFAULT_CHECKOUT_URL = 'https://pay.kiwify.com.br/Uo9NHdj';

export type MindTrialEventType = 'trial_ativado' | 'trial_dia2' | 'trial_expirado';
export type MindTrialStatus = 'disponivel' | 'ativo' | 'expirado' | 'cancelado';

export type MindTrialView = {
  status: MindTrialStatus;
  activationDeadline: Date;
  trialStartedAt: Date | null;
  trialEndsAt: Date | null;
  hoursLeft: number | null;
  messagesToday: number;
  dailyLimit: number;
};

export type MindAccessView = {
  paid: boolean;
  canChat: boolean;
  trial: MindTrialView | null;
  checkoutUrl: string;
};

export function checkoutUrl() {
  return (process.env.MIND_TRIAL_CHECKOUT_URL || DEFAULT_CHECKOUT_URL).trim();
}

/** Data civil (YYYY-MM-DD) em America/Sao_Paulo — o contador diário vira à meia-noite de Brasília. */
export function saoPauloDay(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

/** Status real considerando o relógio: o banco só é corrigido pelo sweep, então derivamos aqui. */
function effectiveStatus(trial: MindTrial, now = new Date()): MindTrialStatus {
  const status = trial.status as MindTrialStatus;
  if (status === 'ativo' && trial.trialEndsAt && trial.trialEndsAt <= now) return 'expirado';
  if (status === 'disponivel' && trial.activationDeadline <= now) return 'expirado';
  return status;
}

function toView(trial: MindTrial, now = new Date()): MindTrialView {
  const status = effectiveStatus(trial, now);
  const msLeft = status === 'ativo' && trial.trialEndsAt ? trial.trialEndsAt.getTime() - now.getTime() : null;
  return {
    status,
    activationDeadline: trial.activationDeadline,
    trialStartedAt: trial.trialStartedAt,
    trialEndsAt: trial.trialEndsAt,
    hoursLeft: msLeft == null ? null : Math.max(0, Math.ceil(msLeft / HOUR_MS)),
    messagesToday: trial.dailyDate === saoPauloDay(now) ? trial.dailyCount : 0,
    dailyLimit: MIND_TRIAL_DAILY_LIMIT,
  };
}

@Injectable()
export class MindTrialService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MindTrialService.name);
  private sweepTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  onModuleInit() {
    if (process.env.MIND_TRIAL_SWEEP_DISABLED === 'true') return;
    this.sweepTimer = setInterval(() => void this.sweep(), SWEEP_INTERVAL_MS);
    this.sweepTimer.unref();
    setTimeout(() => void this.sweep(), 30_000).unref();
  }

  onModuleDestroy() {
    if (this.sweepTimer) clearInterval(this.sweepTimer);
  }

  /**
   * Cria o direito à degustação ("disponivel") a partir da compra aprovada do
   * produto base. Idempotente por e-mail: uma segunda compra não reabre nem
   * estende uma degustação que já existe.
   */
  async grantFromPurchase(input: { email: string; externalId?: string | null; purchasedAt?: Date }) {
    const email = input.email.trim().toLowerCase();
    if (!email) return null;
    const purchasedAt = input.purchasedAt ?? new Date();

    return this.prisma.mindTrial.upsert({
      where: { email },
      update: {},
      create: {
        email,
        status: 'disponivel',
        source: 'KIWIFY',
        externalId: input.externalId || null,
        purchasedAt,
        activationDeadline: new Date(purchasedAt.getTime() + MIND_TRIAL_ACTIVATION_DAYS * 24 * HOUR_MS),
      },
    });
  }

  /** Reembolso/chargeback do produto base: a degustação deixa de valer. */
  async cancelForEmail(email: string) {
    if (!email) return;
    await this.prisma.mindTrial.updateMany({
      where: { email: email.trim().toLowerCase(), status: { in: ['disponivel', 'ativo'] } },
      data: { status: 'cancelado' },
    });
  }

  async hasPaidMind(userId: string) {
    const entitlement = await this.prisma.entitlement.findFirst({
      where: {
        userId,
        productKey: { in: PAID_MIND_KEYS },
        status: 'ACTIVE',
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: { id: true },
    });
    return Boolean(entitlement);
  }

  async getAccess(user: { id: string; email: string }): Promise<MindAccessView> {
    const paid = await this.hasPaidMind(user.id);
    const trial = await this.prisma.mindTrial.findUnique({ where: { email: user.email.toLowerCase() } });
    const view = trial ? toView(trial) : null;
    const trialUsable = Boolean(view && (view.status === 'disponivel' || view.status === 'ativo'));
    return { paid, canChat: paid || trialUsable, trial: view, checkoutUrl: checkoutUrl() };
  }

  /** Leitura (sessões etc.): pago ou degustação ainda utilizável. */
  async ensureAccess(user: { id: string; email: string }) {
    const access = await this.getAccess(user);
    if (!access.canChat) throw this.blockedError(access);
    return access;
  }

  /**
   * Chamado a cada mensagem enviada ao iGentMIND. Pago prevalece e não toca a
   * degustação. Sem pago: a primeira mensagem ativa as 72h e cada mensagem
   * consome 1 das 15 do dia (fuso de Brasília).
   */
  async consumeMessage(user: { id: string; email: string }): Promise<MindAccessView> {
    if (await this.hasPaidMind(user.id)) {
      return { paid: true, canChat: true, trial: null, checkoutUrl: checkoutUrl() };
    }

    const email = user.email.toLowerCase();
    let trial = await this.prisma.mindTrial.findUnique({ where: { email } });
    if (!trial) throw this.blockedError({ paid: false, canChat: false, trial: null, checkoutUrl: checkoutUrl() });

    const now = new Date();
    const status = effectiveStatus(trial, now);
    if (status !== 'disponivel' && status !== 'ativo') {
      throw this.blockedError({ paid: false, canChat: false, trial: toView(trial, now), checkoutUrl: checkoutUrl() });
    }

    if (status === 'disponivel') {
      const activated = await this.prisma.mindTrial.updateMany({
        where: { id: trial.id, status: 'disponivel', activationDeadline: { gt: now } },
        data: {
          status: 'ativo',
          trialStartedAt: now,
          trialEndsAt: new Date(now.getTime() + MIND_TRIAL_HOURS * HOUR_MS),
        },
      });
      trial = await this.prisma.mindTrial.findUniqueOrThrow({ where: { id: trial.id } });
      if (activated.count === 1) {
        this.emit(trial, 'trial_ativado').catch((error) => this.logger.error(`trial_ativado falhou: ${error instanceof Error ? error.message : String(error)}`));
      }
    }

    const today = saoPauloDay(now);
    await this.prisma.mindTrial.updateMany({
      where: { id: trial.id, OR: [{ dailyDate: null }, { dailyDate: { not: today } }] },
      data: { dailyDate: today, dailyCount: 0 },
    });
    const consumed = await this.prisma.mindTrial.updateMany({
      where: { id: trial.id, dailyDate: today, dailyCount: { lt: MIND_TRIAL_DAILY_LIMIT } },
      data: { dailyCount: { increment: 1 } },
    });
    trial = await this.prisma.mindTrial.findUniqueOrThrow({ where: { id: trial.id } });
    const view = toView(trial, now);

    if (consumed.count === 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          code: 'MIND_TRIAL_DAILY_LIMIT',
          message: `Você usou as ${MIND_TRIAL_DAILY_LIMIT} mensagens de hoje da degustação. Elas renovam à meia-noite (horário de Brasília).`,
          trial: view,
          checkoutUrl: checkoutUrl(),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return { paid: false, canChat: true, trial: view, checkoutUrl: checkoutUrl() };
  }

  private blockedError(access: MindAccessView) {
    const expired = access.trial?.status === 'expirado' && Boolean(access.trial.trialStartedAt);
    return new ForbiddenException({
      statusCode: HttpStatus.FORBIDDEN,
      code: expired ? 'MIND_TRIAL_EXPIRED' : 'MIND_NOT_ENTITLED',
      message: expired
        ? 'Sua degustação do iGentMIND terminou. Continue com o Diário + iGentMIND 30 dias.'
        : 'iGentMIND não liberado para este usuário.',
      trial: access.trial,
      checkoutUrl: access.checkoutUrl,
    });
  }

  /**
   * Marca degustações vencidas e dispara trial_dia2 / trial_expirado. Roda em
   * intervalo; o unique(trialId, type) em MindTrialEvent evita e-mail duplicado.
   */
  async sweep() {
    try {
      const now = new Date();

      await this.prisma.mindTrial.updateMany({
        where: { status: 'disponivel', activationDeadline: { lte: now } },
        data: { status: 'expirado' },
      });

      const day2Due = await this.prisma.mindTrial.findMany({
        where: {
          status: 'ativo',
          trialStartedAt: { lte: new Date(now.getTime() - DAY2_AFTER_HOURS * HOUR_MS) },
          trialEndsAt: { gt: now },
          events: { none: { type: 'trial_dia2' } },
        },
        take: 200,
      });
      for (const trial of day2Due) await this.emit(trial, 'trial_dia2');

      const expired = await this.prisma.mindTrial.findMany({
        where: { status: 'ativo', trialEndsAt: { lte: now } },
        take: 200,
      });
      for (const trial of expired) {
        await this.prisma.mindTrial.update({ where: { id: trial.id }, data: { status: 'expirado' } });
        await this.emit({ ...trial, status: 'expirado' }, 'trial_expirado');
      }
    } catch (error) {
      this.logger.error(`Sweep da degustação falhou: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async emit(trial: MindTrial, type: MindTrialEventType) {
    let event;
    try {
      event = await this.prisma.mindTrialEvent.create({ data: { trialId: trial.id, type } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return;
      throw error;
    }

    const user = await this.prisma.user.findUnique({ where: { email: trial.email }, select: { id: true, name: true } });
    // Quem já comprou o iGentMIND não recebe e-mail de "sua degustação acaba/acabou".
    if (type !== 'trial_ativado' && user && (await this.hasPaidMind(user.id))) return;

    const payload = {
      event: type,
      email: trial.email,
      name: user?.name ?? null,
      trialStartedAt: trial.trialStartedAt,
      trialEndsAt: trial.trialEndsAt,
      dailyLimit: MIND_TRIAL_DAILY_LIMIT,
      checkoutUrl: checkoutUrl(),
      appUrl: (process.env.APP_URL || '').replace(/\/$/, ''),
    };

    const [mail] = await Promise.all([
      this.mailService.sendMindTrialEmail({ type, to: trial.email, name: user?.name, trialEndsAt: trial.trialEndsAt, checkoutUrl: payload.checkoutUrl, appUrl: payload.appUrl }),
      this.postWebhook(payload),
    ]);

    if (mail.delivered) {
      await this.prisma.mindTrialEvent.update({ where: { id: event.id }, data: { deliveredAt: new Date() } });
    }
  }

  /** Repasse opcional para a ferramenta de e-mail marketing (automação por evento). */
  private async postWebhook(payload: Record<string, unknown>) {
    const url = (process.env.MIND_TRIAL_EVENTS_WEBHOOK_URL || '').trim();
    if (!url) return;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) this.logger.warn(`Webhook de evento ${payload.event} respondeu ${response.status}`);
    } catch (error) {
      this.logger.warn(`Webhook de evento ${payload.event} falhou: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
