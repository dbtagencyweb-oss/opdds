import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInviteDto, ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from './auth.dto';
import { MailService } from './mail.service';

type AccessPlan = 'pdf' | 'basic' | 'workbook' | 'igent7' | 'igent30' | 'igent90' | 'group' | 'vip';

const PRODUCTS_BY_PLAN: Record<AccessPlan, string[]> = {
  pdf: ['opdds_pdf'],
  basic: ['opdds_pdf', 'opdds_base'],
  workbook: ['opdds_pdf', 'opdds_base', 'opdds_diario'],
  igent7: ['opdds_pdf', 'opdds_base', 'opdds_diario', 'opdds_igentmind_7d'],
  igent30: ['opdds_pdf', 'opdds_base', 'opdds_diario', 'opdds_igentmind_30d'],
  igent90: ['opdds_pdf', 'opdds_base', 'opdds_diario', 'opdds_igentmind_90d'],
  group: ['opdds_pdf', 'opdds_base', 'opdds_diario', 'opdds_igentmind_90d', 'opdds_grupo'],
  vip: ['opdds_pdf', 'opdds_base', 'opdds_diario', 'opdds_igentmind_30d', 'opdds_igentmind_90d', 'opdds_grupo', 'opdds_vip'],
};

const PLAN_LABELS: Record<AccessPlan, string> = {
  pdf: 'PDF',
  basic: 'Livro + App',
  workbook: 'Diário dos Desacreditados',
  igent7: 'iGentMIND 7 dias',
  igent30: 'Diário + iGentMIND 30 dias',
  igent90: 'iGentMIND 90 dias',
  group: 'Comunidade Viva dos Desacreditados',
  vip: 'Pacote completo OPDDS',
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  private createCode() {
    return `OPDDS_${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
  }

  private hashResetToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private getAppUrl() {
    return (process.env.APP_URL || 'http://127.0.0.1:5173').replace(/\/$/, '');
  }

  private normalizePlan(plan?: string | null): AccessPlan {
    const normalized = String(plan || '').toLowerCase();
    return (Object.keys(PRODUCTS_BY_PLAN).includes(normalized) ? normalized : 'basic') as AccessPlan;
  }

  private readonly planOrder: AccessPlan[] = ['pdf', 'basic', 'workbook', 'igent7', 'igent30', 'igent90', 'group', 'vip'];

  /** Menor plano cujo conjunto de productKeys cobre a união dos dois planos dados. */
  private combinePlans(a: AccessPlan, b: AccessPlan): AccessPlan {
    const union = new Set<string>([...PRODUCTS_BY_PLAN[a], ...PRODUCTS_BY_PLAN[b]]);
    for (const plan of this.planOrder) {
      const keys = PRODUCTS_BY_PLAN[plan];
      if ([...union].every((key) => keys.includes(key))) return plan;
    }
    return 'vip';
  }

  /**
   * Convite ACTIVE (não resgatado, não expirado) mais recente para este e-mail,
   * se existir. Usado para não criar um segundo token/e-mail quando um upsell ou
   * downsell da Kiwify chega como webhook separado antes do comprador se cadastrar.
   */
  private async findPendingInvite(email: string) {
    const event = await this.prisma.purchaseEvent.findFirst({
      where: {
        eventType: { in: ['INVITE_CREATED', 'INVITE_UPGRADED'] },
        payload: { path: ['email'], equals: email },
      },
      orderBy: { createdAt: 'desc' },
    });
    const code = (event?.payload as any)?.code as string | undefined;
    if (!code) return null;
    const token = await this.prisma.accessToken.findUnique({ where: { code } });
    if (!token || token.status !== 'ACTIVE') return null;
    if (token.expiresAt && token.expiresAt.getTime() < Date.now()) return null;
    return token;
  }

  /**
   * Igual a createInvite, mas primeiro checa se já existe um convite pendente
   * pro e-mail (mesmo token ainda não resgatado). Se existir, faz upgrade do
   * plano nesse token em vez de criar um segundo — evita o cenário em que um
   * upsell/downsell webhook chega antes do comprador se cadastrar, gera um
   * segundo token, e o comprador só consegue resgatar um dos dois (o outro
   * fica órfão, porque o cadastro rejeita e-mail duplicado).
   */
  async createInviteOrUpgrade(data: CreateInviteDto & { source?: string; externalId?: string | null; value?: number; currency?: string }) {
    const plan = this.normalizePlan(data.plan);

    if (data.email) {
      const pending = await this.findPendingInvite(data.email);
      if (pending) {
        const previousPlan = this.normalizePlan(pending.plan);
        const combined = this.combinePlans(previousPlan, plan);

        if (combined !== previousPlan) {
          await this.prisma.accessToken.update({ where: { id: pending.id }, data: { plan: combined } });
        }

        await this.prisma.purchaseEvent.create({
          data: {
            provider: data.source || 'MANUAL',
            eventType: 'INVITE_UPGRADED',
            externalId: data.externalId || null,
            payload: {
              email: data.email,
              name: data.name || null,
              previousPlan,
              plan: combined,
              code: pending.code,
              value: data.value ?? null,
              currency: data.currency || null,
            },
          },
        });

        const registerUrl = `/?token=${encodeURIComponent(pending.code)}`;

        if (data.source === 'KIWIFY') {
          setImmediate(() => {
            void this.mailService.sendPurchaseInviteEmail({
              to: data.email,
              name: data.name,
              registerUrl: `${this.getAppUrl()}${registerUrl}`,
              planLabel: PLAN_LABELS[combined],
            });
          });
        }

        return { token: pending.code, plan: combined, registerUrl, upgraded: true };
      }
    }

    return this.createInvite(data);
  }

  async createInvite(data: CreateInviteDto & { source?: string; externalId?: string | null; value?: number; currency?: string }) {
    const plan = this.normalizePlan(data.plan);
    const code = this.createCode();
    const expiresAt = data.expiresInDays ? new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000) : null;

    const token = await this.prisma.accessToken.create({
      data: {
        code,
        plan,
        status: 'ACTIVE',
        expiresAt,
      },
    });

    await this.prisma.purchaseEvent.create({
      data: {
        provider: data.source || 'MANUAL',
        eventType: 'INVITE_CREATED',
        externalId: data.externalId || null,
        payload: {
          email: data.email,
          name: data.name || null,
          plan,
          code,
          expiresInDays: data.expiresInDays ?? null,
          value: data.value ?? null,
          currency: data.currency || null,
        },
      },
    });

    // Raiz, não /register: é uma SPA de página única sem rota de servidor para
    // subcaminhos (o mesmo motivo pelo qual o reset de senha usa "/?resetToken=").
    const registerUrl = `/?token=${encodeURIComponent(token.code)}`;

    if (data.source === 'KIWIFY' && data.email) {
      setImmediate(() => {
        void this.mailService.sendPurchaseInviteEmail({
          to: data.email,
          name: data.name,
          registerUrl: `${this.getAppUrl()}${registerUrl}`,
          planLabel: PLAN_LABELS[plan],
        });
      });
    }

    return {
      token: token.code,
      plan,
      registerUrl,
    };
  }

  async resolveInvite(token: string) {
    if (!token) throw new BadRequestException('Token não informado.');

    const invite = await this.prisma.accessToken.findUnique({ where: { code: token } });
    if (!invite || invite.status !== 'ACTIVE') {
      throw new BadRequestException('Token inválido, usado ou desativado.');
    }

    if (invite.expiresAt && invite.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Token expirado.');
    }

    return {
      valid: true,
      token: invite.code,
      plan: this.normalizePlan(invite.plan),
      products: PRODUCTS_BY_PLAN[this.normalizePlan(invite.plan)],
    };
  }

  async register(data: RegisterDto) {
    const invite = await this.resolveInvite(data.token);
    const existing = await this.prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) throw new ConflictException('E-mail já cadastrado.');

    const productKeys = PRODUCTS_BY_PLAN[invite.plan as AccessPlan];
    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          name: data.name,
          passwordHash,
        },
      });

      for (const productKey of productKeys) {
        const product = await tx.product.findUnique({ where: { key: productKey } });
        await tx.entitlement.create({
          data: {
            userId: created.id,
            productId: product?.id,
            productKey,
            source: 'INVITE',
            status: 'ACTIVE',
          },
        });
      }

      await tx.accessToken.update({
        where: { code: data.token },
        data: {
          status: 'REDEEMED',
          userId: created.id,
          redeemedAt: new Date(),
        },
      });

      return created;
    });

    return this.sign(user);
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (!user?.passwordHash) throw new UnauthorizedException('Credenciais inválidas.');

    const ok = await bcrypt.compare(data.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas.');

    return this.sign(user);
  }

  async forgotPassword(data: ForgotPasswordDto) {
    const email = data.email.toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    const genericResponse = {
      ok: true,
      message: 'Se este e-mail estiver cadastrado, enviaremos um link de redefinição.',
    };

    if (!user) return genericResponse;

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashResetToken(token);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const resetUrl = `${this.getAppUrl()}/?resetToken=${encodeURIComponent(token)}`;
    setImmediate(() => {
      void this.mailService.sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl,
      });
    });

    return genericResponse;
  }

  async resetPassword(data: ResetPasswordDto) {
    const tokenHash = this.hashResetToken(data.token);
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Link de redefinição inválido ou expirado.');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      });

      await tx.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      });

      await tx.passwordResetToken.updateMany({
        where: {
          userId: resetToken.userId,
          usedAt: null,
          id: { not: resetToken.id },
        },
        data: { usedAt: new Date() },
      });

      return updated;
    });

    return this.sign(user);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!user) throw new UnauthorizedException('Usuário não encontrado.');
    return this.sign(user);
  }

  private async sign(user: { id: string; email: string; name: string | null; role: string }) {
    const entitlements = await this.prisma.entitlement.findMany({
      where: {
        userId: user.id,
        status: 'ACTIVE',
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: { productKey: true, expiresAt: true },
    });

    const mindEntitlements = await this.prisma.entitlement.findMany({
      where: {
        userId: user.id,
        productKey: { in: ['opdds_igentmind_7d', 'opdds_igentmind_30d', 'opdds_igentmind_90d'] },
        status: 'ACTIVE',
      },
      select: { expiresAt: true },
      orderBy: { expiresAt: 'desc' },
    });
    const mindEverPurchased = mindEntitlements.length > 0;
    const mindActiveExpiry = mindEntitlements.find((item) => !item.expiresAt || item.expiresAt > new Date());
    const mindAccess = {
      active: Boolean(mindActiveExpiry),
      expired: mindEverPurchased && !mindActiveExpiry,
      expiresAt: mindActiveExpiry?.expiresAt ?? null,
    };

    const products = entitlements.map((item) => item.productKey);
    const plan: AccessPlan = products.includes('opdds_vip')
      ? 'vip'
      : products.includes('opdds_grupo')
        ? 'group'
        : products.includes('opdds_igentmind_90d')
          ? 'igent90'
          : products.includes('opdds_igentmind_30d')
            ? 'igent30'
            : products.includes('opdds_igentmind_7d')
              ? 'igent7'
              : products.includes('opdds_diario')
                ? 'workbook'
                : products.includes('opdds_base')
                  ? 'basic'
                  : 'pdf';
    const payload = { sub: user.id, email: user.email, role: user.role, plan, products };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan,
        products,
        mindAccess,
      },
    };
  }
}
