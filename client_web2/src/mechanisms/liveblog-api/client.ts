import { logger } from '@/mechanisms/request-logger';

export class LiveblogApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'LiveblogApiError';
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  /** Skip Authorization header (e.g. login) */
  skipAuth?: boolean;
}

let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(handler: () => void) {
  onUnauthorized = handler;
}

function usesSameOriginApi(): boolean {
  const fromEnv = import.meta.env.VITE_LIVEBLOG_API_URL as string | undefined;
  const trimmed = fromEnv?.trim();
  return !trimmed || trimmed === '/api';
}

function getApiBase(): string {
  const fromEnv = import.meta.env.VITE_LIVEBLOG_API_URL as string | undefined;
  if (usesSameOriginApi()) {
    return '/api';
  }
  return fromEnv!.replace(/\/$/, '');
}

/** Dev + production behind reverse proxy: relative /api; else full base URL */
export function resolveUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const withoutApi = normalized.replace(/^\/api/, '');

  if (import.meta.env.DEV || usesSameOriginApi()) {
    return `/api${withoutApi}`;
  }

  const base = getApiBase();
  return `${base}${withoutApi}`;
}

function buildQuery(params?: ApiRequestOptions['params']): string {
  if (!params) return '';
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

function getAuthHeader(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('sess:token');
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, params, skipAuth, headers: initHeaders, ...init } = options;
  const url = `${resolveUrl(path)}${buildQuery(params)}`;
  const method = (init.method ?? 'GET').toUpperCase();

  const headers = new Headers(initHeaders);
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body !== undefined && !headers.has('Content-Type') && !isFormData) {
    headers.set('Content-Type', 'application/json');
  }

  if (!skipAuth) {
    const auth = getAuthHeader();
    if (auth) {
      headers.set('Authorization', auth);
    }
  }

  const id = logger.request(method, url);
  const started = performance.now();

  try {
    const res = await fetch(url, {
      ...init,
      method,
      headers,
      credentials: 'include',
      body:
        body === undefined
          ? undefined
          : isFormData
            ? body
            : JSON.stringify(body),
    });

    const durationMs = Math.round(performance.now() - started);
    logger.response(id, res.status, durationMs, url);

    if (!res.ok) {
      let errorBody: unknown;
      try {
        errorBody = await res.json();
      } catch {
        errorBody = await res.text().catch(() => undefined);
      }

      if (res.status === 401 && onUnauthorized) {
        onUnauthorized();
      }

      let message = `HTTP ${res.status}`;
      if (typeof errorBody === 'object' && errorBody !== null) {
        const err = errorBody as {
          _error?: { message?: string };
          _issues?: unknown;
          _message?: string;
        };
        const parts: string[] = [];
        if (err._error?.message) parts.push(err._error.message);
        if (err._issues && typeof err._issues === 'object') {
          parts.push(JSON.stringify(err._issues));
        }
        if (parts.length) message = parts.join(' — ');
      }

      logger.error(id, message, url);
      throw new LiveblogApiError(message, res.status, errorBody);
    }

    if (res.status === 204) {
      return undefined as T;
    }

    return (await res.json()) as T;
  } catch (err) {
    if (!(err instanceof LiveblogApiError)) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error(id, message, url);
    }
    throw err;
  }
}

export interface LiveblogApiClient {
  get<T>(path: string, params?: ApiRequestOptions['params']): Promise<T>;
  post<T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, 'body'>): Promise<T>;
  patch<T>(
    path: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, 'body'> & { etag?: string },
  ): Promise<T>;
  delete<T>(path: string, options?: ApiRequestOptions & { etag?: string }): Promise<T>;
}

export const api: LiveblogApiClient = {
  get(path, params) {
    return apiRequest(path, { method: 'GET', params });
  },
  post(path, body, options) {
    return apiRequest(path, { method: 'POST', body, ...options });
  },
  patch(path, body, options) {
    const { etag, ...rest } = options ?? {};
    const headers = new Headers(rest.headers);
    if (etag) {
      headers.set('If-Match', etag);
    }
    return apiRequest(path, { method: 'PATCH', body, headers, ...rest });
  },
  delete(path, options) {
    const { etag, ...rest } = options ?? {};
    const headers = new Headers(rest.headers);
    if (etag) {
      headers.set('If-Match', etag);
    }
    return apiRequest(path, { method: 'DELETE', headers, ...rest });
  },
};
