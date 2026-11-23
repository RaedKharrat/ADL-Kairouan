'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  Search,
  Bell,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowRight,
  X,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { Input } from '@/components/ui/input';
import { useTheme } from 'next-themes';
import api, { endpoints } from '@/lib/api';
import { DashboardSummary } from '@/types';
import { navigation } from './Sidebar';

interface TopBarProps {
  onOpenMobileMenu?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
}

export function TopBar({
  onOpenMobileMenu,
  isSidebarCollapsed = false,
  onToggleSidebarCollapse,
}: TopBarProps) {
  const user = useAuthStore((state) => state.user);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const [quickQuery, setQuickQuery] = React.useState('');
  const [searchFocused, setSearchFocused] = React.useState(false);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  // Fetch unread messages count cleanly from dashboard summary cache
  const { data: summary } = useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const response = await api.get(endpoints.dashboard.summary);
      return response.data.data;
    },
    staleTime: 60_000,
  });

  const unreadCount = summary?.messages?.unread || 0;

  const currentSection = React.useMemo(() => {
    const match = navigation.find(
      (item) =>
        pathname === item.href ||
        (item.href !== '/admin' && pathname.startsWith(item.href)),
    );
    return match?.name || 'Administration';
  }, [pathname]);

  const filteredModules = React.useMemo(() => {
    const q = quickQuery.trim().toLowerCase();
    if (!q) return navigation.slice(0, 6);
    return navigation.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q),
    );
  }, [quickQuery]);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectModule = (href: string) => {
    setQuickQuery('');
    setSearchFocused(false);
    router.push(href);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-2 sticky top-0 z-30">
      <header className="h-16 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white/85 dark:bg-[#0f172a]/85 backdrop-blur-xl shadow-[0_2px_12px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.25)] px-3.5 sm:px-5 flex items-center justify-between gap-3 transition-all duration-300">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Mobile / Tablet Drawer Trigger */}
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Ouvrir le menu de navigation"
            className="lg:hidden p-2.5 rounded-xl bg-slate-100/90 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:text-royal-600 dark:hover:text-brand-400 hover:bg-royal-600/10 transition-colors shrink-0"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Desktop Sidebar Collapse Toggle */}
          {onToggleSidebarCollapse && (
            <button
              type="button"
              onClick={onToggleSidebarCollapse}
              aria-label={
                isSidebarCollapsed
                  ? 'Déplier la barre latérale'
                  : 'Réduire la barre latérale'
              }
              title={
                isSidebarCollapsed
                  ? 'Déplier la barre latérale'
                  : 'Réduire la barre latérale'
              }
              className="hidden lg:flex p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors shrink-0"
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </button>
          )}

          {/* Active Section Breadcrumb on Mobile */}
          <div className="md:hidden min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-royal-600 dark:text-brand-400 leading-none">
              ADL Admin
            </p>
            <h1 className="text-sm font-display font-bold text-slate-900 dark:text-white truncate mt-0.5">
              {currentSection}
            </h1>
          </div>

          {/* Quick-Jump Search Bar on Tablet & Desktop */}
          <div
            ref={searchContainerRef}
            className="relative w-full max-w-md hidden md:block"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              value={quickQuery}
              onFocus={() => setSearchFocused(true)}
              onChange={(e) => setQuickQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && filteredModules.length > 0) {
                  e.preventDefault();
                  handleSelectModule(filteredModules[0].href);
                } else if (e.key === 'Escape') {
                  setSearchFocused(false);
                }
              }}
              placeholder="Aller vers un module (Projets, Blog, Messages...)"
              className="pl-10 pr-9 h-10 bg-slate-100/70 dark:bg-white/5 border-transparent focus-visible:ring-royal-600 focus-visible:bg-white dark:focus-visible:bg-slate-900 w-full rounded-xl text-sm transition-all"
            />
            {quickQuery && (
              <button
                type="button"
                onClick={() => setQuickQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Quick-Jump Dropdown */}
            {searchFocused && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 py-1.5">
                <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Navigation rapide
                </div>
                {filteredModules.length === 0 ? (
                  <p className="px-3.5 py-4 text-xs text-slate-500 dark:text-slate-400 text-center">
                    Aucun module trouvé pour &laquo; {quickQuery} &raquo;
                  </p>
                ) : (
                  filteredModules.map((item) => (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => handleSelectModule(item.href)}
                      className="w-full px-3.5 py-2.5 flex items-center justify-between gap-3 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-royal-600 dark:group-hover:text-brand-400 group-hover:bg-royal-600/10 transition-colors shrink-0">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {item.name}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider text-slate-400">
                            {item.group}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-royal-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="relative p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            aria-label="Changer le thème"
          >
            <Sun className="h-4.5 w-4.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute top-2.5 left-2.5 h-4.5 w-4.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </button>

          <Link
            href="/admin/contact"
            aria-label="Messages reçus"
            title={
              unreadCount > 0
                ? `${unreadCount} message(s) non lu(s)`
                : 'Boîte de réception'
            }
            className="relative p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-royal-600 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-[#0f172a]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          <div className="h-7 w-px bg-slate-200 dark:bg-white/10 mx-1 hidden sm:block" />

          <div className="flex items-center gap-3 pl-0.5">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                {user?.name || 'Administrateur'}
              </p>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mt-1">
                {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-royal-600 to-brand-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
