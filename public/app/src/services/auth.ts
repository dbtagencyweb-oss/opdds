import { accessTokenPlans, accessTokens } from '../data/book';
import { runtimeConfig } from '../config/runtime';
import { ApiError, apiHealth, apiRequest } from './api';
import { localEntitlements, LocalPlan } from './entitlements';

export type UserRole = 'MEMBER' | 'ADMIN';

export type MindAccessStatus = {
  active: boolean;
  expired: boolean;
  expiresAt: string | null;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  plan: LocalPlan;
  role?: UserRole;
  products?: string[];
  mindAccess?: MindAccessStatus;
  createdAt?: string;
};

export type LocalUserRecord = AuthUser & { password?: string; entitlements?: Array<{ productKey: string; expiresAt?: string | null }> };

export type AdminProduct = {
  id: string;
  key: string;
  name: string;
  description?: string | null;
};

export type AdminInviteResponse = {
  token: string;
  plan: LocalPlan;
  registerUrl: string;
};

export type AdminEvent = {
  id: string;
  provider: string;
  eventType: string;
  externalId?: string | null;
  processedAt?: string | null;
  createdAt: string;
  email?: string | null;
  name?: string | null;
  plan?: LocalPlan | string | null;
  event?: string | null;
  reason?: string | null;
  affectedEntitlements?: number | null;
  productKeys?: string[];
  code?: string | null;
};

export type BookAudioRevision = {
  id?: string;
  chapterId: string;
  sectionKey: string;
  label: string;
  url: string;
  coverUrl?: string | null;
  sortOrder?: number;
  version?: number;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type BookAudioProductionMeta = {
  chapterId: string;
  sectionKey: string;
  productionStatus: 'ok' | 'review' | 'record' | 'placeholder';
  productionNote?: string | null;
  coverUrl?: string | null;
  sortOrder?: number;
  updatedAt?: string;
};

export type AdminBookAudioSummary = {
  chapterId: string;
  sectionKey: string;
  latestPublished?: BookAudioRevision | null;
  production?: BookAudioProductionMeta | null;
  history: BookAudioRevision[];
};

export type MindChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type MindChatRequest = {
  sessionId?: string;
  topic?: string;
  source?: string;
  message: string;
  messages?: MindChatMessage[];
  context?: Record<string, unknown>;
};

export type MindChatResponse = {
  sessionId: string;
  message: string;
  fallback?: boolean;
  provider?: 'openai' | 'gemini' | 'local';
  references?: Array<{
    chapterId: string;
    chapterTitle: string;
    sectionId: string;
    sectionTitle: string;
  }>;
  trial?: MindTrialInfo | null;
};

export type MindTrialInfo = {
  status: 'disponivel' | 'ativo' | 'expirado' | 'cancelado';
  activationDeadline: string;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  hoursLeft: number | null;
  messagesToday: number;
  dailyLimit: number;
};

export type MindAccessInfo = {
  paid: boolean;
  canChat: boolean;
  trial: MindTrialInfo | null;
  checkoutUrl: string;
};

export type MindServiceStatus = {
  provider: 'openai' | 'gemini' | 'local';
  connected: boolean;
  canonicalVersion: string;
  safety: string;
};

export type ReaderJourneySnapshot = {
  workbookEntry: string;
  workbookAnswers: Record<string, string>;
  canonicalJournalAnswers: Record<string, string>;
  workbookPrompt: string;
  letters: Record<string, string>;
  letterMeta: Record<string, unknown>;
  readerNotes: unknown[];
  anchors: unknown[];
  audioProgress: Record<string, unknown>;
  upgradeHintsShown?: Record<string, boolean>;
  updatedAt?: string;
};

type AuthResponse = {
  access_token: string;
  user: AuthUser;
};

function withTimeout<T>(promise: Promise<T>, ms = 9000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error('API timeout')), ms);
    promise
      .then((value) => {
        window.clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timer);
        reject(error);
      });
  });
}

/**
 * O backend roda no plano grátis do Render (e o banco no Neon), que dormem sem
 * uso e levam ~30-60s para acordar. Nesse intervalo a requisição falha por
 * rede/timeout ou volta 502/503/504: tentamos de novo em vez de mostrar erro.
 * Erros de verdade (senha errada, token inválido = 4xx) voltam na hora.
 */
const WAKE_TOTAL_MS = 90_000;
const WAKE_ATTEMPT_MS = 45_000;

function isTransientApiError(error: unknown) {
  if (error instanceof ApiError) return [502, 503, 504].includes(error.status);
  return true;
}

async function callWithServerWake<T>(request: () => Promise<T>, onRetry?: () => void): Promise<T> {
  const startedAt = Date.now();
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await withTimeout(request(), WAKE_ATTEMPT_MS);
    } catch (error) {
      if (!isTransientApiError(error)) throw error;
      if (Date.now() - startedAt > WAKE_TOTAL_MS) {
        throw new Error('O servidor está demorando para responder. Aguarde alguns segundos e tente de novo.');
      }
      onRetry?.();
      await new Promise((resolve) => window.setTimeout(resolve, Math.min(5000, 1500 * attempt)));
    }
  }
}

let wakePromise: Promise<unknown> | null = null;

/** Dispara um ping para o backend começar a acordar enquanto o leitor digita. */
export function wakeApi() {
  if (!wakePromise) {
    wakePromise = apiHealth().catch(() => {
      wakePromise = null;
    });
  }
  return wakePromise;
}

const TOKEN_KEY = 'opd_auth_token';
const USER_KEY = 'opd_auth_user';
const LOCAL_USERS_KEY = 'opd_local_users';

function loadLocalUsers(): LocalUserRecord[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocalUsers(users: LocalUserRecord[]) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function persistAuth(response: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, response.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(response.user));
  localStorage.setItem('opd_token', response.access_token);
  localStorage.setItem('opd_plan', response.user.plan);
  return response;
}

function localTokenPlan(token: string): LocalPlan | null {
  if (!runtimeConfig.localMode) return null;
  const normalized = token.trim().toUpperCase();
  if (!accessTokens.includes(normalized)) return null;
  return accessTokenPlans[normalized] || 'basic';
}

function isLocalAuthToken(token?: string | null) {
  return Boolean(runtimeConfig.localMode && token && (token.startsWith('LOCAL_') || accessTokens.includes(token)));
}

export function getStoredAuthUser(): AuthUser | null {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function getStoredAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function isOnlineSession() {
  const token = getStoredAuthToken();
  return Boolean(token && !isLocalAuthToken(token));
}

export function listLocalUsers(): LocalUserRecord[] {
  return loadLocalUsers();
}

export function updateStoredAuthUser(patch: Partial<Pick<AuthUser, 'name' | 'email'>>) {
  const current = getStoredAuthUser();
  if (!current) return null;
  const updated = {
    ...current,
    name: patch.name?.trim() || current.name,
    email: patch.email?.trim().toLowerCase() || current.email,
  };
  localStorage.setItem(USER_KEY, JSON.stringify(updated));

  const users = loadLocalUsers();
  const nextUsers = users.map((user) => user.id === current.id ? { ...user, ...updated } : user);
  saveLocalUsers(nextUsers);
  return updated;
}

/** Conta online: salva o nome no servidor. Acesso local: só no navegador. */
export async function updateAccountProfile(patch: { name: string; email?: string }) {
  const token = getStoredAuthToken();
  if (!token || isLocalAuthToken(token)) return updateStoredAuthUser(patch);
  const response = await apiRequest<AuthResponse>('/api/auth/me', {
    token,
    method: 'PATCH',
    body: JSON.stringify({ name: patch.name }),
  });
  persistAuth(response);
  return response.user;
}

export async function registerAccount(input: { name: string; email: string; password: string; token: string }) {
  let retried = false;
  try {
    return persistAuth(await callWithServerWake(() => apiRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    }), () => { retried = true; }));
  } catch (error) {
    // Uma tentativa que caiu por timeout pode ter criado a conta no servidor; aí a
    // repetição volta "token usado"/"e-mail já cadastrado". Entra com os mesmos dados.
    if (retried && error instanceof ApiError && (error.status === 400 || error.status === 409)) {
      try {
        return persistAuth(await apiRequest<AuthResponse>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: input.email, password: input.password }),
        }));
      } catch {
        throw error;
      }
    }
    if (!runtimeConfig.localMode) throw error;
    const normalizedToken = input.token.trim().toUpperCase();
    const plan = localTokenPlan(normalizedToken);
    if (!plan) throw new Error('Token inv\u00e1lido ou ainda n\u00e3o liberado.');

    const role: UserRole = ['FUNDADOR', 'VIP-ALMA'].includes(normalizedToken) ? 'ADMIN' : 'MEMBER';
    const users = loadLocalUsers();
    const email = input.email.trim().toLowerCase();
    if (users.some((user) => user.email === email)) throw new Error('E-mail j\u00e1 cadastrado localmente.');

    const user: LocalUserRecord = {
      id: `local-${Date.now()}`,
      name: input.name.trim(),
      email,
      plan,
      role,
      password: input.password,
      products: localEntitlements(plan),
      createdAt: new Date().toISOString(),
    };
    saveLocalUsers([...users, user]);
    return persistAuth({ access_token: input.token.trim().toUpperCase(), user });
  }
}

export async function loginAccount(input: { email: string; password: string }) {
  try {
    return persistAuth(await callWithServerWake(() => apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    })));
  } catch (error) {
    if (!runtimeConfig.localMode) throw error;
    const users = loadLocalUsers();
    const email = input.email.trim().toLowerCase();
    const user = users.find((item) => item.email === email && item.password === input.password);
    if (!user) throw new Error('E-mail ou senha incorretos.');
    return persistAuth({ access_token: `LOCAL_${user.id}`, user });
  }
}

export async function requestPasswordReset(email: string) {
  return callWithServerWake(() => apiRequest<{ ok: boolean; message: string; resetUrl?: string }>('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }));
}

export async function resetPassword(input: { token: string; password: string }) {
  return persistAuth(await callWithServerWake(() => apiRequest<AuthResponse>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(input),
  })));
}

export async function fetchCurrentUser() {
  const token = getStoredAuthToken();
  if (!token || isLocalAuthToken(token)) return getStoredAuthUser();
  const response = await apiRequest<AuthResponse>('/api/auth/me', { token });
  persistAuth(response);
  return response.user;
}

export async function fetchAdminUsers() {
  const token = getStoredAuthToken();
  if (!token || isLocalAuthToken(token)) return listLocalUsers();
  return apiRequest<LocalUserRecord[]>('/api/admin/users', { token });
}

export async function fetchAdminProducts() {
  const token = getStoredAuthToken();
  if (!token || isLocalAuthToken(token)) return [];
  return apiRequest<AdminProduct[]>('/api/admin/products', { token });
}

export async function fetchAdminEvents() {
  const token = getStoredAuthToken();
  if (!token || isLocalAuthToken(token)) return [];
  return apiRequest<AdminEvent[]>('/api/admin/events', { token });
}

export async function createAdminInvite(input: { email: string; name?: string; plan: LocalPlan; expiresInDays?: number }) {
  const token = getStoredAuthToken();
  return apiRequest<AdminInviteResponse>('/api/admin/invites', {
    token,
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function grantAdminPlan(userId: string, input: { plan: LocalPlan; expiresInDays?: number }) {
  const token = getStoredAuthToken();
  return apiRequest<LocalUserRecord>(`/api/admin/users/${userId}/plan`, {
    token,
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function grantAdminProduct(userId: string, input: { productKey: string; expiresInDays?: number }) {
  const token = getStoredAuthToken();
  return apiRequest<LocalUserRecord>(`/api/admin/users/${userId}/products`, {
    token,
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function revokeAdminProduct(userId: string, productKey: string) {
  const token = getStoredAuthToken();
  return apiRequest<LocalUserRecord>(`/api/admin/users/${userId}/products/${encodeURIComponent(productKey)}`, {
    token,
    method: 'DELETE',
  });
}

export async function fetchPublishedAudioTracks() {
  return apiRequest<BookAudioRevision[]>('/api/reader/audio-tracks');
}

export async function fetchAdminBookAudio() {
  const token = getStoredAuthToken();
  return apiRequest<AdminBookAudioSummary[]>('/api/admin/book/audio', { token });
}

export type MetaAdsConfig = {
  configured: boolean;
  hasToken: boolean;
  tokenPreview: string | null;
  accountId: string | null;
  graphVersion: string;
};

export type MetaAdsCampaign = {
  id: string;
  name: string;
  status?: string;
  effective_status?: string;
  objective?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  insights?: { data?: Array<Record<string, any>> };
  adPreview?: { id: string; name: string; status: string };
  creative?: { image_url?: string; title?: string; body?: string };
};

export type MetaAdsCampaignsResponse = {
  data: MetaAdsCampaign[];
  meta: { accountId: string; period: string; status: string; graphVersion: string; fetchedAt: string };
};

export type MetaAdsAdvisorPriority = { title: string; reason: string; action: string; impact: string; urgency: 'alta' | 'media' | 'baixa' };
export type MetaAdsAdvisorCampaignAction = { campaignId?: string; campaignName: string; recommendation?: string; budgetAction?: string; why?: string; status?: string; spend?: number; ctr?: number; cpc?: number; roas?: number };
export type MetaAdsAdvisorExperiment = { title: string; hypothesis: string; setup: string; successMetric: string };

export type MetaAdsAdvisorResponse = {
  provider: 'rules' | 'openai' | 'gemini';
  aiModel?: string;
  generatedAt: string;
  summary: {
    period: string; totalCampaigns: number; activeCampaigns: number; spend: number;
    clicks: number; impressions: number; conversions: number; revenue: number; ctr: number; cpc: number; roas: number;
    diagnosis?: string; mainRisk?: string; bestOpportunity?: string;
  };
  priorities: MetaAdsAdvisorPriority[];
  campaignActions: MetaAdsAdvisorCampaignAction[];
  experiments: MetaAdsAdvisorExperiment[];
  nextQuestions: string[];
  ai?: {
    summary?: { diagnosis?: string; mainRisk?: string; bestOpportunity?: string };
    priorities?: MetaAdsAdvisorPriority[];
    campaignActions?: MetaAdsAdvisorCampaignAction[];
    experiments?: MetaAdsAdvisorExperiment[];
    nextQuestions?: string[];
  };
};

export async function fetchMetaAdsConfig() {
  const token = getStoredAuthToken();
  return apiRequest<MetaAdsConfig>('/api/admin/meta-ads/config', { token });
}

export async function fetchMetaAdsCampaigns(params: { period?: string; status?: string; accountId?: string; q?: string } = {}) {
  const token = getStoredAuthToken();
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => Boolean(value)) as [string, string][]).toString();
  return apiRequest<MetaAdsCampaignsResponse & { meta: MetaAdsCampaignsResponse['meta'] & { totalBeforeFilter?: number } }>(`/api/admin/meta-ads/campaigns${query ? `?${query}` : ''}`, { token });
}

export async function fetchMetaAdsAdvisor(params: { period?: string; status?: string; accountId?: string; q?: string } = {}) {
  const token = getStoredAuthToken();
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => Boolean(value)) as [string, string][]).toString();
  return apiRequest<MetaAdsAdvisorResponse>(`/api/admin/meta-ads/advisor${query ? `?${query}` : ''}`, { token });
}

export type MetaAdsAdSetTargeting = {
  ageMin: number | null;
  ageMax: number | null;
  genders: string;
  locations: string[];
  customAudiences: string[];
  excludedAudiences: string[];
  interests: string[];
};

export type MetaAdsAdSetCreative = {
  adId: string;
  adName: string;
  status?: string;
  title: string;
  body: string;
  imageUrl: string;
};

export type MetaAdsAdSet = {
  id: string;
  name: string;
  status?: string;
  optimizationGoal?: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  targeting: MetaAdsAdSetTargeting | null;
  creatives: MetaAdsAdSetCreative[];
};

export async function fetchMetaAdsAdSets(campaignId: string, params: { period?: string; accountId?: string } = {}) {
  const token = getStoredAuthToken();
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => Boolean(value)) as [string, string][]).toString();
  return apiRequest<{ data: MetaAdsAdSet[]; meta: Record<string, any> }>(`/api/admin/meta-ads/campaigns/${encodeURIComponent(campaignId)}/adsets${query ? `?${query}` : ''}`, { token });
}

export type MetaAdsReconciliation = {
  period: string;
  since: string;
  until: string;
  spend: number;
  meta: { purchases: number; revenue: number; roas: number };
  kiwify: { purchases: number; revenue: number; roas: number; missingValueCount: number };
  delta: { purchases: number; revenue: number };
};

export async function fetchMetaAdsReconciliation(params: { period?: string; accountId?: string; q?: string } = {}) {
  const token = getStoredAuthToken();
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => Boolean(value)) as [string, string][]).toString();
  return apiRequest<MetaAdsReconciliation>(`/api/admin/meta-ads/reconciliation${query ? `?${query}` : ''}`, { token });
}

export async function publishAdminBookAudio(input: { chapterId: string; sectionKey: string; label: string; url: string; coverUrl?: string }) {
  const token = getStoredAuthToken();
  return apiRequest<BookAudioRevision>('/api/admin/book/audio/publish', {
    token,
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function saveAdminBookAudioMeta(input: { chapterId: string; sectionKey: string; productionStatus?: string; productionNote?: string; coverUrl?: string; sortOrder?: number }) {
  const token = getStoredAuthToken();
  return apiRequest<BookAudioProductionMeta>('/api/admin/book/audio/meta', {
    token,
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function saveAdminBookAudioOrder(input: { chapterId: string; sectionKeys: string[] }) {
  const token = getStoredAuthToken();
  return apiRequest<BookAudioProductionMeta[]>('/api/admin/book/audio/order', {
    token,
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function sendMindMessage(input: MindChatRequest) {
  const token = getStoredAuthToken();
  if (!token || isLocalAuthToken(token)) {
    throw new Error('Entre com uma conta online para usar o iGentMIND conectado.');
  }

  return apiRequest<MindChatResponse>('/api/igent/chat', {
    token,
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function fetchMindStatus() {
  const token = getStoredAuthToken();
  if (!token || isLocalAuthToken(token)) return null;
  return apiRequest<MindServiceStatus>('/api/igent/status', { token });
}

export async function fetchMindAccess() {
  const token = getStoredAuthToken();
  if (!token || isLocalAuthToken(token)) return null;
  return apiRequest<MindAccessInfo>('/api/igent/access', { token });
}

export async function fetchReaderJourney() {
  const token = getStoredAuthToken();
  if (!token || isLocalAuthToken(token)) return null;
  return apiRequest<ReaderJourneySnapshot>('/api/workbook/journey', { token });
}

export async function syncReaderJourney(input: Partial<ReaderJourneySnapshot>) {
  const token = getStoredAuthToken();
  if (!token || isLocalAuthToken(token)) return null;
  return apiRequest<ReaderJourneySnapshot>('/api/workbook/journey', {
    token,
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function deleteReaderJourney() {
  const token = getStoredAuthToken();
  if (!token || isLocalAuthToken(token)) return { deleted: 0 };
  return apiRequest<{ deleted: number }>('/api/workbook/journey', { token, method: 'DELETE' });
}

export async function deleteMindSessions() {
  const token = getStoredAuthToken();
  if (!token || isLocalAuthToken(token)) return { deleted: 0 };
  return apiRequest<{ deleted: number }>('/api/igent/sessions', { token, method: 'DELETE' });
}

// ── Leads do quiz da LP ─────────────────────────────────────────────────────

export type QuizLeadStatus = 'novo' | 'carta_enviada' | 'em_conversa' | 'comprou' | 'descadastrado';

export type QuizLead = {
  id: string;
  createdAt: string;
  nome: string;
  whatsapp: string;
  email: string | null;
  prologo: string | null;
  pilarResultado: string;
  pilarNome: string;
  ato: string;
  atoNome: string;
  pontuacoes: number[];
  cartaUrl: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  status: QuizLeadStatus;
  cartaEnviadaEm: string | null;
  compradorEm: string | null;
  observacao: string | null;
};

export type QuizLeadGroup = { whatsapp: string; lead: QuizLead; anteriores: QuizLead[] };

export type QuizLeadsPage = { page: number; pageSize: number; totalGrupos: number; items: QuizLeadGroup[] };

export type QuizLeadsResumo = {
  total: number;
  pessoas: number;
  compraram: number;
  taxaCompra: number;
  porPilar: { codigo: string; nome: string; total: number }[];
  porAto: { codigo: string; nome: string; total: number }[];
  porOrigem: { origem: string; total: number }[];
  porStatus: { status: QuizLeadStatus; total: number }[];
};

export type QuizLeadFilters = { de?: string; ate?: string; pilar?: string; status?: string; origem?: string; q?: string };

const quizLeadQuery = (filters: Record<string, string | number | undefined>) =>
  new URLSearchParams(
    Object.entries(filters)
      .filter(([, value]) => value !== undefined && value !== null && String(value) !== '')
      .map(([key, value]) => [key, String(value)]),
  ).toString();

export async function fetchQuizLeads(filters: QuizLeadFilters & { page?: number } = {}) {
  const token = getStoredAuthToken();
  const query = quizLeadQuery(filters);
  return apiRequest<QuizLeadsPage>(`/api/admin/leads${query ? `?${query}` : ''}`, { token });
}

export async function fetchQuizLeadsResumo(filters: QuizLeadFilters = {}) {
  const token = getStoredAuthToken();
  const query = quizLeadQuery(filters);
  return apiRequest<QuizLeadsResumo>(`/api/admin/leads/resumo${query ? `?${query}` : ''}`, { token });
}

export async function updateQuizLead(id: string, input: { status?: QuizLeadStatus; observacao?: string; cartaEnviada?: boolean }) {
  const token = getStoredAuthToken();
  return apiRequest<QuizLead>(`/api/admin/leads/${encodeURIComponent(id)}`, {
    token,
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteQuizLead(id: string) {
  const token = getStoredAuthToken();
  return apiRequest<{ ok: boolean; removidos: number }>(`/api/admin/leads/${encodeURIComponent(id)}`, { token, method: 'DELETE' });
}

export async function deleteQuizLeadsByContact(input: { whatsapp?: string; email?: string }) {
  const token = getStoredAuthToken();
  const query = quizLeadQuery(input);
  return apiRequest<{ ok: boolean; removidos: number }>(`/api/admin/leads/por-contato?${query}`, { token, method: 'DELETE' });
}

/** Baixa o CSV com o token (um link direto não levaria o Authorization). */
export async function downloadQuizLeadsCsv(filters: QuizLeadFilters = {}) {
  const token = getStoredAuthToken();
  const query = quizLeadQuery(filters);
  const response = await fetch(`${runtimeConfig.apiUrl}/api/admin/leads/export.csv${query ? `?${query}` : ''}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: 'no-store',
  });
  if (!response.ok) throw new ApiError(`API ${response.status}: não foi possível exportar o CSV.`, response.status);

  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = url;
  link.download = `leads-quiz-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
