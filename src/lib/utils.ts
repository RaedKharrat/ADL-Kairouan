import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

// ─── Class name helper ───────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Date helpers ────────────────────────────────────────────────────────────
export function formatDate(date: string | Date, pattern = 'd MMMM yyyy') {
  return format(new Date(date), pattern, { locale: fr });
}

export function formatDateRelative(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
}

// ─── String helpers ──────────────────────────────────────────────────────────
export function truncate(str: string, length = 160) {
  if (str.length <= length) return str;
  return str.slice(0, length).trimEnd() + '…';
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─── Number helpers ──────────────────────────────────────────────────────────
export function formatNumber(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n);
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Image helpers ───────────────────────────────────────────────────────────
export function getImageUrl(path?: string | null, fallback = '/images/placeholder.jpg') {
  if (!path) return fallback;
  if (path.startsWith('http')) return path;
  return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${path}`;
}

// ─── SEO helpers ─────────────────────────────────────────────────────────────
export function buildTitle(pageTitle?: string, siteName = 'ADL Kairouan') {
  if (!pageTitle) return siteName;
  return `${pageTitle} — ${siteName}`;
}

// ─── Reading time ─────────────────────────────────────────────────────────────
export function getReadingLabel(minutes?: number | null) {
  if (!minutes) return '';
  return `${minutes} min de lecture`;
}

// ─── Status badge color ───────────────────────────────────────────────────────
export function getStatusColor(status: string) {
  const map: Record<string, string> = {
    PUBLISHED: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    DRAFT: 'text-amber-700 bg-amber-50 border-amber-200',
    SCHEDULED: 'text-blue-700 bg-blue-50 border-blue-200',
    ARCHIVED: 'text-slate-600 bg-slate-100 border-slate-200',
  };
  return map[status] ?? 'text-slate-600 bg-slate-100 border-slate-200';
}

// ─── Error message extractor ──────────────────────────────────────────────────
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  const e = error as { response?: { data?: { message?: string } } };
  return e?.response?.data?.message ?? 'Une erreur est survenue';
}

// ─── Array chunk ──────────────────────────────────────────────────────────────
export function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );
}

// ─── Debounce ─────────────────────────────────────────────────────────────────
export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay = 300) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
