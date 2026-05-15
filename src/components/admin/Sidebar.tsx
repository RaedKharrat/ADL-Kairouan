'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, FolderOpen, Users, FileText, Image, MessageSquare, 
  Settings, LogOut, FileBarChart, MonitorPlay, HelpCircle, Star, Hash
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Projets', href: '/admin/projects', icon: FolderOpen },
  { name: 'Catégories & Tags', href: '/admin/taxonomies', icon: Hash },
  { name: 'Actualités', href: '/admin/blog', icon: FileText },
  { name: 'Partenaires', href: '/admin/partners', icon: Users },
  { name: 'Médiathèque', href: '/admin/media', icon: Image },
  { name: 'Vidéos', href: '/admin/videos', icon: MonitorPlay },
  { name: 'Rapports', href: '/admin/reports', icon: FileBarChart },
  { name: 'FAQ', href: '/admin/faq', icon: HelpCircle },
  { name: 'Témoignages', href: '/admin/testimonials', icon: Star },
  { name: 'Messages', href: '/admin/contact', icon: MessageSquare },
  { name: 'Paramètres', href: '/admin/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/admin/login';
  };

  return (
    <aside className="w-64 bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-white/5 flex flex-col h-screen fixed left-0 top-0 text-slate-600 dark:text-slate-300 z-40 transition-colors duration-300">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/20">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-500 to-purple-500 flex items-center justify-center text-white font-display font-bold shadow-glow-sm mr-3">
          A
        </div>
        <span className="font-display font-bold text-lg tracking-tight text-slate-900 dark:text-white truncate">
          ADL Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-none py-6 px-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 shadow-glow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Area / Logout */}
      <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/10">
        <button
          onClick={handleLogout}
          className="flex items-center w-full gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
