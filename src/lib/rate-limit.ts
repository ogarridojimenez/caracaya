import type { NextRequest } from 'next/server';

const MAX_REQUESTS = 5;
const WINDOW_MS = 60 * 1000;

// Rate limiting en memoria (se resetea al reiniciar el servidor)
const requests = new Map<string, { count: number; windowStart: number }>();

export function checkRateLimit(
  identifier: string,
  endpoint: string = 'default'
): { allowed: boolean; remaining: number; retryAfter?: number } {
  const key = `${identifier}:${endpoint}`;
  const now = Date.now();
  const record = requests.get(key);

  if (!record || now - record.windowStart > WINDOW_MS) {
    requests.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  if (record.count >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - record.windowStart)) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS - record.count };
}

export function getRateLimitIdentifier(req: NextRequest): string {
  return req.ip
    ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown';
}
