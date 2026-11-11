/**
 * Enterprise-grade HTML Sanitizer for Rich Text (TipTap) content.
 * Prevents Cross-Site Scripting (XSS) without external heavy dependencies.
 */

// Disallowed tags that must be completely stripped including their contents
const DANGEROUS_TAGS_REGEX = /<\s*(script|style|iframe|object|embed|form|input|button|textarea|select|option|link|meta|base|applet)[\s\S]*?<\s*\/\s*\1\s*>|<\s*(script|style|iframe|object|embed|form|input|button|textarea|select|option|link|meta|base|applet)[^>]*\/?>/gi;

// Event handlers like onload, onerror, onclick, onmouseover, etc.
const EVENT_HANDLER_REGEX = /\s+on[a-z0-9_-]+\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi;

// Unsafe URI protocols in href, src, action, formaction, background
const UNSAFE_PROTOCOL_REGEX = /(href|src|action|formaction|background)\s*=\s*(['"]?)\s*(javascript:|vbscript:|data:(?!image\/(png|jpeg|jpg|webp|gif);base64,))[^'"]*\2/gi;

/**
 * Sanitizes an untrusted HTML string to safely render it via dangerouslySetInnerHTML.
 */
export function sanitizeHtml(dirtyHtml: string | null | undefined): string {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') return '';

  let sanitized = dirtyHtml;

  // 1. Remove dangerous executable/interactive tags
  sanitized = sanitized.replace(DANGEROUS_TAGS_REGEX, '');

  // 2. Remove all on* event handler attributes
  sanitized = sanitized.replace(EVENT_HANDLER_REGEX, '');

  // 3. Remove javascript: and unauthorized data: protocols
  sanitized = sanitized.replace(UNSAFE_PROTOCOL_REGEX, '$1=$2#$2');

  // 4. Ensure all external links have rel="noopener noreferrer"
  sanitized = sanitized.replace(/<a\s+([^>]*?)>/gi, (match, attrs) => {
    let newAttrs = attrs;
    if (!/rel\s*=\s*['"][^'"]*['"]/i.test(newAttrs)) {
      newAttrs += ' rel="noopener noreferrer"';
    }
    return `<a ${newAttrs}>`;
  });

  return sanitized;
}

