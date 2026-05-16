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
    <aside className="hidden lg:flex w-72 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-white/5 flex-col h-screen fixed left-0 top-0 text-slate-600 dark:text-slate-300 z-40 transition-colors duration-300 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-8 border-b border-slate-200/50 dark:border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 to-transparent"></div>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-purple-600 flex items-center justify-center text-white font-display font-bold shadow-glow-sm shadow-brand-500/20 mr-4 relative z-10">
          A
        </div>
        <div className="flex flex-col relative z-10">
          <span className="font-display font-bold text-lg tracking-tight text-slate-900 dark:text-white leading-tight">
            ADL Admin
          </span>
          <span className="text-[10px] uppercase tracking-widest text-brand-500 font-bold">Kairouan</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-none py-8 px-4 space-y-1.5">
        <div className="px-4 mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Menu Principal</div>
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 relative overflow-hidden group ${
                isActive 
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-white/5'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent pointer-events-none"></div>
              )}
              <item.icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
              <span className="relative z-10">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Area / Logout */}
      <div className="p-6 border-t border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-white hover:bg-red-500 transition-all duration-300 group shadow-sm hover:shadow-red-500/20"
        >
          <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
