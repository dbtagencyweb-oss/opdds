/**
 * Central de configuração de ambiente.
 *
 * Objetivo: falhar cedo (fail-fast) em produção quando segredos obrigatórios
 * não estiverem definidos, em vez de silenciosamente usar valores inseguros.
 */

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const DEV_JWT_SECRET = 'local-opdds-secret';

/**
 * Retorna o segredo do JWT.
 * - Em produção: obrigatório. Lança se ausente/curto (impede boot inseguro).
 * - Fora de produção: usa um fallback fixo de desenvolvimento.
 */
export function getJwtSecret(): string {
  const secret = (process.env.JWT_SECRET || '').trim();

  if (IS_PRODUCTION) {
    if (!secret) {
      throw new Error(
        'JWT_SECRET é obrigatório em produção. Defina uma string longa e aleatória (ex.: `openssl rand -hex 32`).',
      );
    }
    if (secret === DEV_JWT_SECRET) {
      throw new Error('JWT_SECRET não pode usar o valor padrão de desenvolvimento em produção.');
    }
    if (secret.length < 16) {
      throw new Error('JWT_SECRET é muito curto para produção (use ao menos 32 caracteres aleatórios).');
    }
    return secret;
  }

  return secret || DEV_JWT_SECRET;
}

const DEFAULT_META_PIXEL_ID = '1452183630052536';

/**
 * Token da Conversions API (CAPI) do Meta. Recurso opcional: se ausente, o
 * envio de eventos de compra pro Meta simplesmente não acontece (sem quebrar
 * o fluxo de concessão de acesso da Kiwify).
 */
export function getMetaCapiAccessToken(): string {
  return (process.env.META_CAPI_ACCESS_TOKEN || '').trim();
}

export function getMetaPixelId(): string {
  return (process.env.META_PIXEL_ID || DEFAULT_META_PIXEL_ID).trim();
}

/**
 * Token da Marketing API do Meta (permissão `ads_read`), usado só pelo
 * monitor de campanhas do admin para LER métricas — diferente do token de
 * CAPI acima, que só ENVIA eventos de compra. Recurso opcional.
 */
export function getMetaAdsAccessToken(): string {
  return (process.env.META_ADS_ACCESS_TOKEN || '').trim();
}

export function getMetaAdAccountId(): string {
  const raw = (process.env.META_AD_ACCOUNT_ID || '').trim();
  if (!raw) return '';
  return raw.startsWith('act_') ? raw : `act_${raw.replace(/[^\d]/g, '')}`;
}

/**
 * URL da automação (WhatsApp/e-mail) que recebe cada lead do quiz da LP.
 * Recurso opcional: sem ela, o lead só fica salvo no banco.
 */
export function getLeadWebhookUrl(): string {
  return (process.env.LEAD_WEBHOOK_URL || '').trim();
}

/** Endereço público da LP, base do link pessoal das cartas (/carta/<romano>/). */
export function getLpUrl(): string {
  return (process.env.LP_URL || 'https://opoderdosdesacreditados.online').trim().replace(/\/$/, '');
}

/** Endereço público desta API, usado nos links de descadastro dos e-mails. */
export function getApiPublicUrl(): string {
  return (process.env.API_PUBLIC_URL || 'https://opdds-api.onrender.com').trim().replace(/\/$/, '');
}

/**
 * Liga os e-mails automáticos do quiz (aviso de lead novo e carta para o
 * lead). Desligado por padrão; os demais e-mails do app não dependem disso.
 */
export function isQuizEmailEnabled(): boolean {
  return (process.env.EMAIL_ENABLED || '').trim().toLowerCase() === 'true';
}

/** Quem recebe o aviso de lead novo: LEAD_ALERT_EMAIL, ou o ADMIN_EMAIL. */
export function getLeadAlertEmail(): string {
  return (process.env.LEAD_ALERT_EMAIL || process.env.ADMIN_EMAIL || '').trim();
}

/** Endereço do app (admin), para o link do aviso de lead novo. */
export function getAppUrl(): string {
  return (process.env.APP_URL || 'https://app.opoderdosdesacreditados.online').trim().replace(/\/$/, '');
}

const DEFAULT_LEADS_ORIGINS = ['https://opoderdosdesacreditados.online', 'https://www.opoderdosdesacreditados.online'];

/**
 * Origens liberadas no CORS das rotas públicas da LP (/api/leads*, /api/cartas*). A LP
 * sempre entra; LEADS_CORS_ORIGINS acrescenta outras (ex.: preview local).
 */
export function getLeadsCorsOrigins(): string[] {
  const extra = (process.env.LEADS_CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  return [...DEFAULT_LEADS_ORIGINS, ...extra];
}

/**
 * Valida a presença das variáveis obrigatórias na inicialização (produção).
 * Chamado a partir do bootstrap para dar um erro claro e único no boot.
 */
export function assertProductionEnv(): void {
  if (!IS_PRODUCTION) return;

  const missing: string[] = [];
  if (!(process.env.DATABASE_URL || '').trim()) missing.push('DATABASE_URL');
  if (!(process.env.CORS_ORIGINS || '').trim()) missing.push('CORS_ORIGINS');

  if (missing.length > 0) {
    throw new Error(`Variáveis de ambiente obrigatórias ausentes em produção: ${missing.join(', ')}.`);
  }

  // Reaproveita a validação do segredo (lança se inválido).
  getJwtSecret();
}
