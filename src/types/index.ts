// ─────────────────────────────────────────────────────────────────────────────
// Platform-wide TypeScript types
// ─────────────────────────────────────────────────────────────────────────────

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR';
export type PublishStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
export type MediaType = 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role: Role;
  isActive: boolean;
  lastLogin?: string | null;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
export interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  image: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Statistics ───────────────────────────────────────────────────────────────
export interface Statistic {
  id: string;
  label: string;
  value: string;
  icon?: string | null;
  suffix?: string | null;
  order: number;
  isActive: boolean;
}

// ─── Project ──────────────────────────────────────────────────────────────────
export interface ProjectCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  order: number;
  _count?: {
    projects: number;
  };
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  coverImage?: string | null;
  gallery: string[];
  pdfFiles: string[];
  videoUrl?: string | null;
  tags: string[];
  featured: boolean;
  status: PublishStatus;
  publishedAt?: string | null;
  categoryId?: string | null;
  category?: ProjectCategory | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords: string[];
  ogImage?: string | null;
  views: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Partner ──────────────────────────────────────────────────────────────────
export interface Partner {
  id: string;
  name: string;
  logo: string;
  website?: string | null;
  order: number;
  isActive: boolean;
}

// ─── Blog ─────────────────────────────────────────────────────────────────────
export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: {
    posts: number;
  };
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  _count?: {
    posts: number;
  };
}

export interface BlogAuthor {
  id: string;
  name: string;
  avatar?: string | null;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  coverImage?: string | null;
  gallery: string[];
  pdfFiles: string[];
  featured: boolean;
  status: PublishStatus;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  readingTime?: number | null;
  videoUrl?: string | null;
  authorId?: string | null;
  author?: BlogAuthor | null;
  categoryId?: string | null;
  category?: BlogCategory | null;
  tags: BlogTag[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords: string[];
  ogImage?: string | null;
  views: number;
  likes: number;
  comments?: BlogComment[];
  _count?: {
    comments: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BlogComment {
  id: string;
  name: string;
  email?: string | null;
  content: string;
  isAdmin: boolean;
  isPublic: boolean;
  blogPostId: string;
  createdAt: string;
}

// ─── Media ────────────────────────────────────────────────────────────────────
export interface MediaCategory {
  id: string;
  name: string;
  slug: string;
  _count?: {
    media: number;
  };
}

export interface MediaItem {
  id: string;
  url: string;
  publicId?: string | null;
  type: MediaType;
  filename: string;
  mimeType?: string | null;
  size?: number | null;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
  caption?: string | null;
  featured: boolean;
  categoryId?: string | null;
  category?: MediaCategory | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Video ────────────────────────────────────────────────────────────────────
export interface Video {
  id: string;
  title: string;
  description?: string | null;
  url?: string | null;
  youtubeId?: string | null;
  thumbnail?: string | null;
  duration?: string | null;
  featured: boolean;
  isActive: boolean;
  order: number;
  createdAt: string;
}

// ─── Reports ──────────────────────────────────────────────────────────────────
export interface ReportCategory {
  id: string;
  name: string;
  slug: string;
  _count?: {
    reports: number;
  };
}

export interface Report {
  id: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  fileType?: string | null;
  fileSize?: number | null;
  year?: number | null;
  downloads: number;
  published: boolean;
  featured: boolean;
  categoryId?: string | null;
  category?: ReportCategory | null;
  createdAt: string;
  updatedAt: string;
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
export interface FaqCategory {
  id: string;
  name: string;
  slug: string;
  _count?: {
    faqs: number;
  };
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  categoryId?: string | null;
  category?: FaqCategory | null;
}

// ─── Testimonial ─────────────────────────────────────────────────────────────
export interface Testimonial {
  id: string;
  name: string;
  role?: string | null;
  organization?: string | null;
  content: string;
  avatar?: string | null;
  rating?: number | null;
  featured: boolean;
  order: number;
  isActive: boolean;
}

// ─── Contact ──────────────────────────────────────────────────────────────────
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
}

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

// ─── Newsletter ───────────────────────────────────────────────────────────────
export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string | null;
  isActive: boolean;
  createdAt: string;
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export interface SiteSetting {
  id: string;
  key: string;
  value?: string | null;
  type: 'STRING' | 'JSON' | 'BOOLEAN' | 'NUMBER';
  group: 'GENERAL' | 'SEO' | 'SOCIAL' | 'CONTACT' | 'APPEARANCE' | 'ANALYTICS' | 'EMAIL';
  label?: string | null;
}

export type PublicSettings = Record<string, string>;

// ─── SEO ──────────────────────────────────────────────────────────────────────
export interface SeoMetadata {
  id: string;
  entityType: string;
  entityId: string;
  title?: string | null;
  description?: string | null;
  keywords: string[];
  ogImage?: string | null;
  canonical?: string | null;
  noIndex: boolean;
  noFollow: boolean;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export interface DashboardSummary {
  projects: { total: number; published: number; draft: number };
  blog: { total: number; published: number; draft: number };
  partners: number;
  media: number;
  reports: number;
  faqs: number;
  testimonials: number;
  messages: { total: number; unread: number };
  newsletter: { total: number; active: number };
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  user?: { id: string; name: string; email: string; avatar?: string | null } | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  ip?: string | null;
  createdAt: string;
}

// ─── Search ───────────────────────────────────────────────────────────────────
export interface SearchResults {
  projects: Array<{ id: string; title: string; slug: string; coverImage?: string | null; excerpt?: string | null; category?: { name: string } | null }>;
  blogPosts: Array<{ id: string; title: string; slug: string; coverImage?: string | null; excerpt?: string | null; publishedAt?: string | null; category?: { name: string } | null }>;
  reports: Array<{ id: string; title: string; description?: string | null; fileUrl: string; year?: number | null }>;
}

// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role: Role;
  isActive: boolean;
  lastLogin?: string | null;
  createdAt: string;
  updatedAt: string;
}
