const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// Replicate the pure functions from src/lib/sanitize.ts and src/app/api/download/route.ts
const DANGEROUS_TAGS_REGEX = /<\s*(script|style|iframe|object|embed|form|input|button|textarea|select|option|link|meta|base|applet)[\s\S]*?<\s*\/\s*\1\s*>|<\s*(script|style|iframe|object|embed|form|input|button|textarea|select|option|link|meta|base|applet)[^>]*\/?>/gi;
const EVENT_HANDLER_REGEX = /\s+on[a-z0-9_-]+\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi;
const UNSAFE_PROTOCOL_REGEX = /(href|src|action|formaction|background)\s*=\s*(['"]?)\s*(javascript:|vbscript:|data:(?!image\/(png|jpeg|jpg|webp|gif);base64,))[^'"]*\2/gi;

function sanitizeHtml(dirtyHtml) {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') return '';
  let sanitized = dirtyHtml;
  sanitized = sanitized.replace(DANGEROUS_TAGS_REGEX, '');
  sanitized = sanitized.replace(EVENT_HANDLER_REGEX, '');
  sanitized = sanitized.replace(UNSAFE_PROTOCOL_REGEX, '$1=$2#$2');
  sanitized = sanitized.replace(/<a\s+([^>]*?)>/gi, (match, attrs) => {
    let newAttrs = attrs;
    if (!/rel\s*=\s*['"][^'"]*['"]/i.test(newAttrs)) {
      newAttrs += ' rel="noopener noreferrer"';
    }
    return `<a ${newAttrs}>`;
  });
  return sanitized;
}

const ALLOWED_HOSTS = new Set([
  'res.cloudinary.com',
  'images.unsplash.com',
]);

function isAllowedHost(hostname) {
  const host = hostname.toLowerCase();
  if (ALLOWED_HOSTS.has(host)) return true;
  if (host.endsWith('.cloudinary.com')) return true;
  return false;
}

function isPrivateIpOrHost(hostname) {
  const host = hostname.toLowerCase();
  if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host === '::1') {
    return true;
  }
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = host.match(ipv4Regex);
  if (match) {
    const [, a, b] = match.map(Number);
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 0) return true;
  }
  return false;
}

function sanitizeFilename(filename) {
  const clean = filename.replace(/[\r\n\0]/g, '').replace(/[/\\]/g, '_').trim();
  const noDots = clean.replace(/\.\.+/g, '_');
  const safe = noDots.replace(/[^a-zA-Z0-9._\- \(\)]/g, '_');
  return safe || 'document.pdf';
}

describe('Frontend HTML Sanitizer (XSS Prevention)', () => {
  it('should strip script tags and their contents', () => {
    const dirty = '<p>Hello</p><script>alert("PWNED");</script><p>World</p>';
    const clean = sanitizeHtml(dirty);
    assert.strictEqual(clean.includes('<script>'), false);
    assert.strictEqual(clean.includes('alert('), false);
    assert.strictEqual(clean, '<p>Hello</p><p>World</p>');
  });

  it('should strip inline event handlers (onerror, onload, onclick)', () => {
    const dirty = '<img src="avatar.jpg" onerror="alert(1)" /><button onclick="steal()">Click</button>';
    const clean = sanitizeHtml(dirty);
    assert.strictEqual(clean.includes('onerror'), false);
    assert.strictEqual(clean.includes('onclick'), false);
  });

  it('should neutralize javascript: links in href and src', () => {
    const dirty = '<a href="javascript:alert(document.cookie)">Click me</a>';
    const clean = sanitizeHtml(dirty);
    assert.strictEqual(clean.includes('javascript:'), false);
    assert.strictEqual(clean.includes('href="#'), true);
  });

  it('should strip iframe and object tags', () => {
    const dirty = '<iframe src="https://evil.com"></iframe><object data="exploit.swf"></object>';
    const clean = sanitizeHtml(dirty);
    assert.strictEqual(clean.includes('<iframe'), false);
    assert.strictEqual(clean.includes('<object'), false);
  });

  it('should add rel="noopener noreferrer" to external links', () => {
    const dirty = '<a href="https://example.org">Link</a>';
    const clean = sanitizeHtml(dirty);
    assert.strictEqual(clean.includes('rel="noopener noreferrer"'), true);
  });

  it('should preserve benign markdown/rich text formatting', () => {
    const benign = '<h2>Titre du Projet</h2><p>Description avec du <strong>texte en gras</strong> et une liste :</p><ul><li>Point 1</li><li>Point 2</li></ul>';
    const clean = sanitizeHtml(benign);
    assert.strictEqual(clean, benign);
  });
});

describe('SSRF Protection & Host Allowlist in /api/download', () => {
  it('should allow legitimate Cloudinary CDN hosts', () => {
    assert.strictEqual(isAllowedHost('res.cloudinary.com'), true);
    assert.strictEqual(isAllowedHost('subdomain.cloudinary.com'), true);
    assert.strictEqual(isAllowedHost('images.unsplash.com'), true);
  });

  it('should reject unauthorized external hosts', () => {
    assert.strictEqual(isAllowedHost('evil.com'), false);
    assert.strictEqual(isAllowedHost('attacker.net'), false);
    assert.strictEqual(isAllowedHost('cloudinary.com.attacker.net'), false);
  });

  it('should identify loopback, localhost, and private IPv4 ranges as private', () => {
    assert.strictEqual(isPrivateIpOrHost('localhost'), true);
    assert.strictEqual(isPrivateIpOrHost('127.0.0.1'), true);
    assert.strictEqual(isPrivateIpOrHost('10.0.0.1'), true);
    assert.strictEqual(isPrivateIpOrHost('172.16.0.5'), true);
    assert.strictEqual(isPrivateIpOrHost('172.31.255.255'), true);
    assert.strictEqual(isPrivateIpOrHost('192.168.1.1'), true);
  });

  it('should detect AWS/cloud link-local metadata IP (169.254.169.254)', () => {
    assert.strictEqual(isPrivateIpOrHost('169.254.169.254'), true);
    assert.strictEqual(isPrivateIpOrHost('169.254.1.1'), true);
  });

  it('should sanitize filename against CRLF injection and path traversal', () => {
    const maliciousName = '../../etc/passwd\r\nSet-Cookie: admin=true.pdf';
    const safe = sanitizeFilename(maliciousName);
    assert.strictEqual(safe.includes('\r'), false);
    assert.strictEqual(safe.includes('\n'), false);
    assert.strictEqual(safe.includes('/'), false);
    assert.strictEqual(safe.includes('\\'), false);
    assert.strictEqual(safe.includes('..'), false);
  });
});
