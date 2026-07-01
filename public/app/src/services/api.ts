import { runtimeConfig } from '../config/runtime';

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
    throw new Error(`API ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function apiHealth() {
  return apiRequest<{ status: string; database: string }>('/api/health');
}
