import type { Locale } from './dictionary';
import type { SessionState } from './session';

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export async function request(path: string, init?: RequestInit, locale: Locale = 'zh-CN') {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      'accept-language': locale,
      ...(init?.headers ?? {})
    },
    cache: 'no-store'
  });

  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();
  if (!response.ok) {
    throw new Error(typeof payload === 'string' ? payload : payload.message ?? 'Request failed');
  }

  return payload;
}

export async function authedRequest(path: string, session: SessionState, init?: RequestInit) {
  return request(
    path,
    {
      ...init,
      headers: {
        authorization: `Bearer ${session.accessToken}`,
        ...(init?.headers ?? {})
      }
    },
    session.locale
  );
}
