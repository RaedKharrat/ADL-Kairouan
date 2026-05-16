'use client';

import * as React from 'react';
import { Menu, Search, Bell, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { Input } from '@/components/ui/input';
import { useTheme } from 'next-themes';

export function TopBar() {
  const user = useAuthStore((state) => state.user);
  const { theme, setTheme } = useTheme();

  return (
  return (
    <div className="px-4 md:px-8 lg:px-10 pt-6 pb-2 sticky top-0 z-30">
      <header className="h-16 rounded-2xl border border-white/20 dark:border-white/5 bg-white/70 dark:bg-[#0f172a]/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] px-6 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-4 flex-1">
          <button className="lg:hidden p-2 text-slate-500 hover:text-brand-500 transition-colors">
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative w-full max-w-md hidden md:block group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
            <Input 
              placeholder="Rechercher (Projets, Articles, Partenaires)..." 
              className="pl-9 bg-slate-100/50 dark:bg-white/5 border-transparent focus-visible:ring-brand-500 focus-visible:bg-white dark:focus-visible:bg-black/20 w-full rounded-xl transition-all duration-300"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="relative p-2.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-300"
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute top-2.5 left-2.5 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </button>
          
          <button className="relative p-2.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-300">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-brand-500 rounded-full border-2 border-white dark:border-[#0f172a] animate-pulse"></span>
          </button>
          
          <div className="h-8 w-px bg-slate-200 dark:bg-white/10 mx-1 md:mx-2 hidden sm:block"></div>
          
          <div className="flex items-center gap-3 pl-2 cursor-pointer group">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-none group-hover:text-brand-500 transition-colors">{user?.name || 'Administrateur'}</p>
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-1">{user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}</p>
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
