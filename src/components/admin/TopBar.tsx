'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Search, Bell, Moon, Sun, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { Input } from '@/components/ui/input';
import { useTheme } from 'next-themes';
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

  const currentSection = React.useMemo(() => {
    const match = navigation.find(
      (item) =>
        pathname === item.href ||
        (item.href !== '/admin' && pathname.startsWith(item.href)),
    );
    return match?.name || 'Administration';
  }, [pathname]);

  return (
    <div className="px-4 sm:px-6 md:px-8 lg:px-10 pt-4 sm:pt-6 pb-2 sticky top-0 z-30">
      <header className="h-16 rounded-2xl border border-slate-200/70 dark:border-white/5 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] px-4 sm:px-6 flex items-center justify-between gap-3 transition-all duration-300">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Mobile / Tablet Drawer Trigger */}
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Ouvrir le menu de navigation"
            className="lg:hidden p-2.5 rounded-xl bg-slate-100/80 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:text-brand-500 hover:bg-brand-500/10 transition-colors shrink-0"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Desktop Sidebar Collapse Toggle */}
          {onToggleSidebarCollapse && (
            <button
              type="button"
              onClick={onToggleSidebarCollapse}
              aria-label={isSidebarCollapsed ? 'Déplier la barre latérale' : 'Réduire la barre latérale'}
              title={isSidebarCollapsed ? 'Déplier la barre latérale' : 'Réduire la barre latérale'}
              className="hidden lg:flex p-2.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors shrink-0"
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </button>
          )}

          {/* Active Section Title on Mobile / Tablet */}
          <div className="md:hidden min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-500 leading-none">
              ADL Admin
            </p>
            <h1 className="text-sm font-display font-bold text-slate-900 dark:text-white truncate mt-0.5">
              {currentSection}
            </h1>
          </div>

          {/* Search Input on Tablet & Desktop */}
          <div className="relative w-full max-w-md hidden md:block group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
            <Input
              placeholder="Rechercher (Projets, Articles, Partenaires)..."
              className="pl-10 bg-slate-100/60 dark:bg-white/5 border-transparent focus-visible:ring-brand-500 focus-visible:bg-white dark:focus-visible:bg-black/20 w-full rounded-xl transition-all duration-300"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="relative p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-300"
            aria-label="Changer le thème"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute top-2.5 left-2.5 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </button>

          <button
            type="button"
            aria-label="Notifications"
            className="relative p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-300"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-brand-500 rounded-full border-2 border-white dark:border-[#0f172a] animate-pulse"></span>
          </button>

          <div className="h-8 w-px bg-slate-200 dark:bg-white/10 mx-1 hidden sm:block"></div>

          <div className="flex items-center gap-3 pl-1 cursor-pointer group">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-none group-hover:text-brand-500 transition-colors">
                {user?.name || 'Administrateur'}
              </p>
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-1">
                {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-brand-500/20 transform group-hover:scale-105 transition-all duration-300">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
