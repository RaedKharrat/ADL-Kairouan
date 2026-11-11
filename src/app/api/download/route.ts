import { NextRequest, NextResponse } from 'next/server';

// Allowed hostnames for secure file proxy download
const ALLOWED_HOSTS = new Set([
  'res.cloudinary.com',
  'images.unsplash.com',
]);

function isAllowedHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (ALLOWED_HOSTS.has(host)) return true;
  if (host.endsWith('.cloudinary.com')) return true;

  // Allow configured backend host if it matches
  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      const backendUrl = new URL(process.env.NEXT_PUBLIC_API_URL);
      if (backendUrl.hostname.toLowerCase() === host) return true;
    } catch {
      // ignore
    }
  }

  return false;
}

function isPrivateIpOrHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host === '::1') {
    return true;
  }
  // Check private IPv4 ranges (10.x, 172.16-31.x, 192.168.x, 169.254.x)
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = host.match(ipv4Regex);
  if (match) {
    const [, a, b] = match.map(Number);
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 169 && b === 254) return true; // AWS/cloud link-local metadata
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 0) return true;
  }
  return false;
}

function sanitizeFilename(filename: string): string {
  // Remove CRLF (header injection) and path traversal characters
  const clean = filename.replace(/[\r\n\0]/g, '').replace(/[/\\]/g, '_').trim();
  const noDots = clean.replace(/\.\.+/g, '_');
  const safe = noDots.replace(/[^a-zA-Z0-9._\- \(\)]/g, '_');
  return safe || 'document.pdf';
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawUrl = searchParams.get('url');
  const rawFilename = searchParams.get('filename') || 'document.pdf';

  if (!rawUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(rawUrl);
  } catch {
    return new NextResponse('Invalid target URL format', { status: 400 });
  }

  // Enforce HTTPS protocol
  if (targetUrl.protocol !== 'https:') {
    return new NextResponse('Only HTTPS URLs are allowed', { status: 400 });
  }

  // Prevent SSRF: block private IPs and unauthorized hosts
  if (isPrivateIpOrHost(targetUrl.hostname) || !isAllowedHost(targetUrl.hostname)) {
    return new NextResponse('Target host is not authorized for download', { status: 403 });
  }

  try {
    // Set a strict 15s timeout to prevent slowloris/DoS
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15_000);

    const response = await fetch(targetUrl.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'ADL-Kairouan-DownloadProxy/1.0',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return new NextResponse(`Remote file unreachable: ${response.status}`, { status: 502 });
    }

    const blob = await response.blob();
    const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
    
    // Ensure filename has correct extension if missing
    let finalFilename = sanitizeFilename(rawFilename);
    if (!finalFilename.includes('.')) {
      const extensionMap: Record<string, string> = {
        'application/pdf': '.pdf',
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/webp': '.webp',
        'application/msword': '.doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
        'application/vnd.ms-excel': '.xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
      };
      const ext = extensionMap[contentType];
      if (ext) finalFilename += ext;
    }

    const headers = new Headers();
    // Use quotes and sanitized filename to prevent HTTP Response Splitting / Header Injection
    headers.set('Content-Disposition', `attachment; filename="${finalFilename}"`);
    headers.set('Content-Type', contentType);
    headers.set('X-Content-Type-Options', 'nosniff');

    return new NextResponse(blob, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      return new NextResponse('Download request timed out', { status: 504 });
    }
    return new NextResponse('Error downloading file', { status: 500 });
  }
}
