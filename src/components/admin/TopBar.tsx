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
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <button className="md:hidden p-2 text-muted-foreground hover:text-foreground">
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher (Projets, Articles, Partenaires)..." 
            className="pl-9 bg-muted/50 border-transparent focus-visible:ring-brand-500 w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle theme"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute top-2 left-2 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>
        
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full border-2 border-card"></span>
        </button>
        
        <div className="h-8 w-px bg-border mx-2"></div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-none">{user?.name || 'Administrateur'}</p>
            <p className="text-xs text-muted-foreground mt-1">{user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-600 font-bold border border-brand-200 dark:border-brand-800">
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
}
