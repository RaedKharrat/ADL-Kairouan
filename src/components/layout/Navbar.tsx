'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Moon, Sun, ChevronRight } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Accueil', href: '/' },
  { name: 'À Propos', href: '/about' },
  { name: 'Projets', href: '/projects' },
  { name: 'Actualités', href: '/blog' },
  { name: 'Transparence', href: '/reports' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 z-50 transition-all duration-1000 pointer-events-none px-6',
        scrolled ? 'top-6' : 'top-0'
      )}
    >
      <div className="max-w-[1440px] mx-auto pointer-events-auto">
        <div className={cn(
          "relative flex items-center justify-between transition-all duration-1000 px-10 rounded-b-[2rem] lg:rounded-b-[3rem] group",
          scrolled 
            ? "py-3 bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 shadow-2xl shadow-royal-950/10 rounded-t-[3rem]" 
            : "py-8 bg-transparent border-transparent shadow-none"
        )}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-4 group/logo">
            <div className="relative w-12 h-12 flex items-center justify-center transition-transform duration-700 group-hover/logo:scale-105">
              <img 
                src="/logo.png" 
                alt="ADL Kairouan" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-display font-bold text-base tracking-[0.2em] text-slate-950 dark:text-white uppercase">ADL Kairouan</span>
              <span className={cn(
                "text-[8px] font-bold uppercase tracking-[0.4em] mt-1 transition-colors duration-700",
                scrolled ? "text-royal-600" : "text-royal-500"
              )}>Vision Urbaine 2030</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-12">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-[0.5em] transition-all relative py-2 group/nav',
                    isActive 
                      ? 'text-royal-600 dark:text-royal-400' 
                      : scrolled 
                        ? 'text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white' 
                        : 'text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
                  )}
                >
                  {item.name}
                  <span className={cn(
                    "absolute bottom-0 left-0 w-0 h-[1.5px] bg-royal-600 transition-all duration-700 group-hover/nav:w-full",
                    isActive && "w-full"
                  )} />
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4 sm:gap-8">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={cn(
                "w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-700",
                scrolled 
                  ? "border-slate-100 dark:border-white/5 text-slate-400 hover:text-royal-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5" 
                  : "border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-950 dark:hover:text-white"
              )}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>
            <Button asChild className={cn(
              "hidden md:flex rounded-full px-10 h-12 transition-all duration-700 font-display font-bold uppercase tracking-widest text-[10px]",
              scrolled 
                ? "bg-slate-950 hover:bg-royal-600 dark:bg-white dark:text-slate-950 dark:hover:bg-royal-400 text-white shadow-2xl shadow-royal-950/10" 
                : "bg-white/10 backdrop-blur-md border border-slate-950/10 dark:border-white/10 text-slate-950 dark:text-white hover:bg-slate-950 hover:text-white dark:hover:bg-white dark:hover:text-slate-950"
            )}>
              <Link href="/contact">S'engager</Link>
            </Button>
            
            {/* Mobile Toggle */}
            <button
              className={cn(
                "lg:hidden w-11 h-11 rounded-full flex items-center justify-center transition-all",
                scrolled 
                  ? "bg-slate-50 dark:bg-white/5 text-slate-950 dark:text-white" 
                  : "bg-white/20 backdrop-blur-md text-slate-950 dark:text-white border border-white/10"
              )}
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="mt-4 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border border-slate-100 dark:border-white/10 p-10 rounded-[3rem] flex flex-col gap-8 lg:hidden animate-in fade-in slide-in-from-top-6 duration-700 shadow-2xl">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold uppercase tracking-[0.4em] text-slate-500 hover:text-royal-600 transition-all hover:translate-x-2"
              >
                {item.name}
              </Link>
            ))}
            <div className="h-px bg-slate-100 dark:bg-white/5 my-2" />
            <Button asChild className="w-full h-16 rounded-full bg-slate-950 dark:bg-white dark:text-slate-950 font-display font-bold uppercase tracking-widest text-[10px] shadow-xl">
              <Link href="/contact" onClick={() => setIsOpen(false)}>Faire une demande</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
