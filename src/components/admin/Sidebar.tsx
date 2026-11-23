'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  FileText,
  Image,
  MessageSquare,
  Settings,
  LogOut,
  FileBarChart,
  MonitorPlay,
  HelpCircle,
  Star,
  Hash,
  UserCheck,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Mail,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

export const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, group: 'Pilotage' },
  { name: 'Projets', href: '/admin/projects', icon: FolderOpen, group: 'Contenus' },
  { name: 'Actualités', href: '/admin/blog', icon: FileText, group: 'Contenus' },
  { name: 'Catégories & Tags', href: '/admin/taxonomies', icon: Hash, group: 'Contenus' },
  { name: 'Rapports', href: '/admin/reports', icon: FileBarChart, group: 'Contenus' },
  { name: 'Médiathèque', href: '/admin/media', icon: Image, group: 'Médias' },
  { name: 'Vidéos', href: '/admin/videos', icon: MonitorPlay, group: 'Médias' },
  { name: 'Équipe Exécutive', href: '/admin/team', icon: UserCheck, group: 'Organisation' },
  { name: 'Partenaires', href: '/admin/partners', icon: Users, group: 'Organisation' },
  { name: 'Témoignages', href: '/admin/testimonials', icon: Star, group: 'Organisation' },
  { name: 'Messages', href: '/admin/contact', icon: MessageSquare, group: 'Support & Système' },
  { name: 'Newsletter', href: '/admin/newsletter', icon: Mail, group: 'Support & Système' },
  { name: 'FAQ', href: '/admin/faq', icon: HelpCircle, group: 'Support & Système' },
  { name: 'Paramètres', href: '/admin/settings', icon: Settings, group: 'Support & Système' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/admin/login';
  };

  // Close on Escape key for mobile drawer
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const groups = React.useMemo(() => {
    const map = new Map<string, typeof navigation>();
    for (const item of navigation) {
      const list = map.get(item.group) || [];
      list.push(item);
      map.set(item.group, list);
    }
    return Array.from(map.entries());
  }, []);

  return (
    <>
      {/* Mobile / Tablet Backdrop Overlay */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
      />

      {/* Sidebar Container (Drawer on <lg, Fixed Collapsible Rail on >=lg) */}
      <aside
        aria-label="Navigation administration"
        className={cn(
          'fixed left-0 top-0 z-50 h-screen flex flex-col bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-2xl border-r border-slate-200/70 dark:border-white/10 text-slate-600 dark:text-slate-300 transition-all duration-300 ease-in-out shadow-[4px_0_24px_rgba(0,0,0,0.06)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.35)]',
          // Mobile / tablet width & drawer translation
          'w-[280px] sm:w-72',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          // Desktop width (expanded vs collapsed)
          isCollapsed ? 'lg:w-20' : 'lg:w-72',
        )}
      >
        {/* Brand Header */}
        <div
          className={cn(
            'h-20 flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 relative shrink-0',
            isCollapsed ? 'px-4 lg:justify-center' : 'px-6',
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 to-transparent pointer-events-none" />

          <Link
            href="/admin"
            onClick={() => onClose?.()}
            className="flex items-center gap-3.5 relative z-10 min-w-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-purple-600 flex items-center justify-center text-white font-display font-bold shadow-glow-sm shadow-brand-500/20 shrink-0">
              A
            </div>
            <div
              className={cn(
                'flex flex-col min-w-0 transition-all duration-200',
                isCollapsed && 'lg:hidden',
              )}
            >
              <span className="font-display font-bold text-lg tracking-tight text-slate-900 dark:text-white leading-tight truncate">
                ADL Admin
              </span>
              <span className="text-[10px] uppercase tracking-widest text-brand-500 font-bold truncate">
                ADL Tunisie
              </span>
            </div>
          </Link>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le menu"
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors relative z-10"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Desktop Collapse Button (when expanded) */}
          {!isCollapsed && onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Réduire le menu"
              aria-label="Réduire le menu"
              className="hidden lg:flex p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors relative z-10"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Desktop Expand Button (when collapsed) */}
        {isCollapsed && onToggleCollapse && (
          <div className="hidden lg:flex justify-center py-2.5 border-b border-slate-200/50 dark:border-white/5">
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Déplier le menu"
              aria-label="Déplier le menu"
              className="p-2 rounded-xl text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto scrollbar-none py-5 px-3 space-y-5">
          {groups.map(([groupName, items]) => (
            <div key={groupName} className="space-y-1">
              <div
                className={cn(
                  'px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500',
                  isCollapsed && 'lg:hidden',
                )}
              >
                {groupName}
              </div>

              {items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/admin' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => onClose?.()}
                    title={isCollapsed ? item.name : undefined}
                    className={cn(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 relative group',
                      isCollapsed && 'lg:justify-center lg:px-0',
                      isActive
                        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/5',
                    )}
                  >
                    {isActive && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/15 to-transparent pointer-events-none" />
                    )}
                    <item.icon
                      className={cn(
                        'h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
                        isActive
                          ? 'text-white'
                          : 'text-slate-400 dark:text-slate-500 group-hover:text-brand-500',
                      )}
                    />
                    <span
                      className={cn(
                        'relative z-10 truncate',
                        isCollapsed && 'lg:hidden',
                      )}
                    >
                      {item.name}
                    </span>

                    {/* Active Indicator Dot on Mobile / Expanded */}
                    {isActive && (
                      <span
                        className={cn(
                          'ml-auto w-1.5 h-1.5 rounded-full bg-white/90 shrink-0',
                          isCollapsed && 'lg:hidden',
                        )}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer: View Public Site + User Info + Logout */}
        <div
          className={cn(
            'p-4 border-t border-slate-200/60 dark:border-white/5 bg-slate-50/70 dark:bg-black/20 space-y-2.5 shrink-0',
            isCollapsed && 'lg:p-2.5',
          )}
        >
          {/* Quick Link to Front-Office */}
          <Link
            href="/"
            target="_blank"
            title="Voir le site public"
            className={cn(
              'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 bg-white dark:bg-white/5 border border-slate-200/70 dark:border-white/10 hover:border-brand-500/40 transition-all',
              isCollapsed && 'lg:justify-center lg:px-0',
            )}
          >
            <ExternalLink className="h-4 w-4 shrink-0 text-brand-500" />
            <span className={cn('truncate', isCollapsed && 'lg:hidden')}>
              Voir le site public
            </span>
          </Link>

          {/* Compact User Card on Mobile */}
          {user && (
            <div
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl bg-white/60 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/5 lg:hidden',
              )}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            title="Déconnexion"
            className={cn(
              'flex items-center justify-center w-full gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-white hover:bg-red-500 transition-all duration-200 group shadow-sm hover:shadow-red-500/20',
              isCollapsed && 'lg:px-0',
            )}
          >
            <LogOut className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
            <span className={cn('truncate', isCollapsed && 'lg:hidden')}>
              Déconnexion
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
