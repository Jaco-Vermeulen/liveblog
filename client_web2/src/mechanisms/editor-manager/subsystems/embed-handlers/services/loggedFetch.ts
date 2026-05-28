import { logger } from '@/mechanisms/request-logger';

/** External HTTP with request-logger (Iframely oEmbed). */
export async function loggedFetch(url: string, init?: RequestInit): Promise<Response> {
  const method = (init?.method ?? 'GET').toUpperCase();
  const logId = logger.request(method, url);
  const started = Date.now();

  try {
    const response = await fetch(url, init);
    logger.response(logId, response.status, Date.now() - started, url);
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(logId, message, url);
    throw err;
  }
}
