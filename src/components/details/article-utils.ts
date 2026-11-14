'use client';

import { useState, useEffect, useCallback } from 'react';
import { sanitizeHtml } from '@/lib/sanitize';

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * Sanitizes rich-text HTML and injects deterministic anchor IDs into h2/h3 headings
 * so readers can jump directly to sections via a Table of Contents.
 */
export function prepareHtmlWithToc(rawHtml?: string | null): {
  html: string;
  headings: TocHeading[];
} {
  const safeHtml = sanitizeHtml(rawHtml);
  if (!safeHtml) return { html: '', headings: [] };

  const headings: TocHeading[] = [];
  const usedIds = new Map<string, number>();

  const htmlWithIds = safeHtml.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (fullMatch, levelStr: string, attrs: string, innerHtml: string) => {
      const plainText = innerHtml
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .trim();

      if (!plainText) return fullMatch;

      const baseSlug = plainText
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || `section-${headings.length + 1}`;

      const count = usedIds.get(baseSlug) || 0;
      usedIds.set(baseSlug, count + 1);
      const id = count === 0 ? baseSlug : `${baseSlug}-${count}`;

      headings.push({
        id,
        text: plainText,
        level: Number(levelStr) as 2 | 3,
      });

      const cleanAttrs = attrs.replace(/\sid\s*=\s*(['"])[^'"]*\1/gi, '');
      return `<h${levelStr}${cleanAttrs} id="${id}" class="scroll-mt-28">${innerHtml}</h${levelStr}>`;
    },
  );

  return { html: htmlWithIds, headings };
}

/**
 * Derives a clean, readable filename for PDF attachment links.
 */
export function getPdfDisplayName(
  fileUrl: string,
  fallbackLabel: string,
  index: number,
): string {
  try {
    const cleanUrl = fileUrl.split('?')[0];
    const lastSegment = cleanUrl.split('/').pop();
    if (lastSegment && lastSegment.length > 4) {
      const decoded = decodeURIComponent(lastSegment)
        .replace(/^\d+[-_]/, '')
        .replace(/\.pdf$/i, '')
        .replace(/[-_]+/g, ' ')
        .trim();
      if (decoded.length >= 3 && !/^[a-z0-9]{18,}$/i.test(decoded)) {
        return decoded.length > 36 ? `${decoded.slice(0, 36)}…` : decoded;
      }
    }
  } catch {
    // Fallback below
  }
  return `${fallbackLabel} ${index + 1}`;
}

/**
 * Persistent client-side bookmark toggle stored in localStorage.
 */
export function useBookmark(kind: 'project' | 'blog', id?: string) {
  const storageKey = `adl_bookmarks_${kind}`;
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!id || typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(storageKey);
      const list: string[] = raw ? JSON.parse(raw) : [];
      setIsSaved(list.includes(id));
    } catch {
      setIsSaved(false);
    }
  }, [id, storageKey]);

  const toggleSave = useCallback(() => {
    if (!id || typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(storageKey);
      const list: string[] = raw ? JSON.parse(raw) : [];
      const exists = list.includes(id);
      const next = exists ? list.filter((item) => item !== id) : [...list, id];
      localStorage.setItem(storageKey, JSON.stringify(next));
      setIsSaved(!exists);
    } catch {
      setIsSaved((prev) => !prev);
    }
  }, [id, storageKey]);

  return { isSaved, toggleSave };
}
