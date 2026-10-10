import { runtimeConfig } from '../config/runtime';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly payload?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = RequestInit & {
  token?: string | null;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const url = `${runtimeConfig.apiUrl}${path}`;
  const requestOptions: RequestInit = {
    ...options,
    headers,
    mode: 'cors',
    cache: 'no-store',
  };

  let response: Response;
  try {
    response = await fetch(url, requestOptions);
  } catch (error) {
    const retryUrl = `${url}${url.includes('?') ? '&' : '?'}_=${Date.now()}`;
    try {
      response = await fetch(retryUrl, requestOptions);
    } catch {
      throw new Error('Não foi possível conectar à API. Verifique a internet e atualize o app.');
    }
  }

  if (!response.ok) {
    let detail = response.statusText;
    let payload: any;
    try {
      payload = await response.json();
      const message = Array.isArray(payload?.message) ? payload.message.join(' ') : payload?.message;
      detail = message || payload?.error || detail;
    } catch {
      try {
        detail = (await response.text()) || detail;
      } catch {
        // Keep the original status text when the response body is not readable.
      }
    }
    throw new ApiError(`API ${response.status}: ${detail}`, response.status, payload?.code, payload);
  }

  return response.json() as Promise<T>;
}

export async function apiHealth() {
  return apiRequest<{ status: string; database: string }>('/api/health');
}
