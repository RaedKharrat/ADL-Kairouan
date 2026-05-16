import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Basic in-memory rate limiter for Edge
// Note: In serverless deployments, this state resets per edge instance.
const rateLimit = new Map<string, { count: number; timestamp: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 120; // Max requests per window

export function middleware(request: NextRequest) {
  const ip = (request as any).ip || request.headers.get('x-forwarded-for') || 'anonymous';

  // 1. Rate Limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const now = Date.now();
    const windowStart = now - WINDOW_MS;
    const requestData = rateLimit.get(ip);

    if (!requestData || requestData.timestamp < windowStart) {
      rateLimit.set(ip, { count: 1, timestamp: now });
    } else {
      requestData.count++;
      if (requestData.count > MAX_REQUESTS) {
        return new NextResponse(
          JSON.stringify({
            error: 'Too Many Requests',
            message: 'Vous avez effectué trop de requêtes. Veuillez patienter un instant.'
          }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  }

  const response = NextResponse.next();

  // 2. Extra Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public images)
     */
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
};
