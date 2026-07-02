import { accessTokenPlans, accessTokens } from '../data/book';
import { apiRequest } from './api';
import { localEntitlements, LocalPlan } from './entitlements';

export type UserRole = 'MEMBER' | 'ADMIN';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  plan: LocalPlan;
  role?: UserRole;
  products?: string[];
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

export type BookPageRevision = {
  id: string;
  pageNumber: number;
  title?: string | null;
  content: string;
  status: 'DRAFT' | 'PUBLISHED' | string;
  version: number;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminBookPageSummary = {
  pageNumber: number;
  latestDraft?: BookPageRevision | null;
  latestPublished?: BookPageRevision | null;
  history: BookPageRevision[];
};

export type BookAudioRevision = {
  id?: string;
  chapterId: string;
  sectionKey: string;
  label: string;
  url: string;
  version?: number;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminBookAudioSummary = {
  chapterId: string;
  sectionKey: string;
  latestPublished?: BookAudioRevision | null;
  history: BookAudioRevision[];
};

export type MindChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type MindChatRequest = {
  sessionId?: string;
  topic?: string;
  message: string;
  messages?: MindChatMessage[];
  context?: Record<string, unknown>;
};

export type MindChatResponse = {
  sessionId: string;
  message: string;
  fallback?: boolean;
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
  const normalized = token.trim().toUpperCase();
  if (!accessTokens.includes(normalized)) return null;
  return accessTokenPlans[normalized] || 'basic';
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

export async function registerAccount(input: { name: string; email: string; password: string; token: string }) {
  try {
    return persistAuth(await withTimeout(apiRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    })));
  } catch {
    const normalizedToken = input.token.trim().toUpperCase();
    const plan = localTokenPlan(normalizedToken) || (normalizedToken.startsWith('OPDDS_') ? 'vip' : null);
    if (!plan) throw new Error('Token inválido ou ainda não liberado.');

    const role: UserRole = ['FUNDADOR', 'VIP-ALMA'].includes(normalizedToken) ? 'ADMIN' : 'MEMBER';
    const users = loadLocalUsers();
    const email = input.email.trim().toLowerCase();
    if (users.some((user) => user.email === email)) throw new Error('E-mail já cadastrado localmente.');

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
    return persistAuth(await withTimeout(apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    })));
  } catch {
    const users = loadLocalUsers();
    const email = input.email.trim().toLowerCase();
    const user = users.find((item) => item.email === email && item.password === input.password);
    if (!user) throw new Error('E-mail ou senha incorretos.');
    return persistAuth({ access_token: `LOCAL_${user.id}`, user });
  }
}

export async function requestPasswordReset(email: string) {
  return withTimeout(apiRequest<{ ok: boolean; message: string; resetUrl?: string }>('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }));
}

export async function resetPassword(input: { token: string; password: string }) {
  return persistAuth(await withTimeout(apiRequest<AuthResponse>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(input),
  })));
}

export async function fetchCurrentUser() {
  const token = getStoredAuthToken();
  if (!token || token.startsWith('LOCAL_') || accessTokens.includes(token)) return getStoredAuthUser();
  const response = await apiRequest<AuthResponse>('/api/auth/me', { token });
  persistAuth(response);
  return response.user;
}

export async function fetchAdminUsers() {
  const token = getStoredAuthToken();
  if (!token || token.startsWith('LOCAL_') || accessTokens.includes(token)) return listLocalUsers();
  return apiRequest<LocalUserRecord[]>('/api/admin/users', { token });
}

export async function fetchAdminProducts() {
  const token = getStoredAuthToken();
  if (!token || token.startsWith('LOCAL_') || accessTokens.includes(token)) return [];
  return apiRequest<AdminProduct[]>('/api/admin/products', { token });
}

export async function fetchAdminEvents() {
  const token = getStoredAuthToken();
  if (!token || token.startsWith('LOCAL_') || accessTokens.includes(token)) return [];
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

export async function fetchPublishedBookPages() {
  return apiRequest<Array<{ pageNumber: number; title?: string | null; content: string; version: number; publishedAt?: string | null; updatedAt: string }>>('/api/reader/book-pages');
}

export async function fetchAdminBookPages() {
  const token = getStoredAuthToken();
  return apiRequest<AdminBookPageSummary[]>('/api/admin/book/pages', { token });
}

export async function fetchAdminBookPageHistory(pageNumber: number) {
  const token = getStoredAuthToken();
  return apiRequest<BookPageRevision[]>(`/api/admin/book/pages/${pageNumber}`, { token });
}

export async function saveAdminBookPageDraft(pageNumber: number, input: { title?: string; content: string }) {
  const token = getStoredAuthToken();
  return apiRequest<BookPageRevision>(`/api/admin/book/pages/${pageNumber}/drafts`, {
    token,
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function publishAdminBookPage(pageNumber: number, input: { title?: string; content: string }) {
  const token = getStoredAuthToken();
  return apiRequest<BookPageRevision>(`/api/admin/book/pages/${pageNumber}/publish`, {
    token,
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function fetchPublishedAudioTracks() {
  return apiRequest<BookAudioRevision[]>('/api/reader/audio-tracks');
}

export async function fetchAdminBookAudio() {
  const token = getStoredAuthToken();
  return apiRequest<AdminBookAudioSummary[]>('/api/admin/book/audio', { token });
}

export async function publishAdminBookAudio(input: { chapterId: string; sectionKey: string; label: string; url: string }) {
  const token = getStoredAuthToken();
  return apiRequest<BookAudioRevision>('/api/admin/book/audio/publish', {
    token,
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function sendMindMessage(input: MindChatRequest) {
  const token = getStoredAuthToken();
  if (!token || token.startsWith('LOCAL_') || accessTokens.includes(token)) {
    throw new Error('Entre com uma conta online para usar o iGentMIND conectado.');
  }

  return apiRequest<MindChatResponse>('/api/igent/chat', {
    token,
    method: 'POST',
    body: JSON.stringify(input),
  });
}
