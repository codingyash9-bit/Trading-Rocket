import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  max: number;
  window: number;
}

const rateLimits: Record<string, RateLimitConfig> = {
  '/api/chat': { max: 10, window: 60 * 1000 },
  '/api/analyze': { max: 20, window: 60 * 1000 },
  '/api/report': { max: 10, window: 60 * 1000 },
  '/api/stocks': { max: 60, window: 60 * 1000 },
  default: { max: 100, window: 60 * 1000 },
};

const ipRequests = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(limit: number = 100, windowMs: number = 60000) {
  return (request: NextRequest) => {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const record = ipRequests.get(ip);

    if (!record || now > record.resetAt) {
      ipRequests.set(ip, { count: 1, resetAt: now + windowMs });
      return true;
    }

    if (record.count >= limit) {
      return false;
    }

    record.count++;
    return true;
  };
}

export function withRateLimit(path: string) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const config = rateLimits[path] || rateLimits.default;
    const allowed = rateLimit(config.max, config.window)(req);

    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    return NextResponse.next();
  };
}

export function getRateLimitConfig(path: string): RateLimitConfig {
  return rateLimits[path] || rateLimits.default;
}