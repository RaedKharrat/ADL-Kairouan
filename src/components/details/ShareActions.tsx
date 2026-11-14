'use client';

import React, { useState, useEffect } from 'react';
import { Facebook, Twitter, Linkedin, Link2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareActionsProps {
  title: string;
  variant?: 'hero' | 'surface';
  showLabel?: boolean;
  labelText?: string;
  className?: string;
}

export function ShareActions({
  title,
  variant = 'surface',
  showLabel = true,
  labelText = 'Partager',
  className,
}: ShareActionsProps) {
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'X (Twitter)',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl || window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback ignored if clipboard permission denied
    }
  };

  const buttonClasses =
    variant === 'hero'
      ? 'border-white/15 dark:border-slate-200 bg-white/5 dark:bg-slate-100/80 text-slate-300 dark:text-slate-600 hover:bg-brand-600 dark:hover:bg-brand-600 hover:text-white dark:hover:text-white hover:border-brand-600 dark:hover:border-brand-600'
      : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-brand-600 hover:text-white hover:border-brand-600';

  const labelClasses =
    variant === 'hero'
      ? 'text-slate-400 dark:text-slate-500'
      : 'text-slate-500 dark:text-slate-400';

  return (
    <div className={cn('flex flex-wrap items-center gap-2.5', className)}>
      {showLabel && (
        <span className={cn('text-[10px] font-bold uppercase tracking-[0.2em] mr-1', labelClasses)}>
          {labelText} :
        </span>
      )}
      {shareLinks.map((item) => (
        <a
          key={item.name}
          href={currentUrl ? item.href : '#'}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Partager sur ${item.name}`}
          title={`Partager sur ${item.name}`}
          className={cn(
            'w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200',
            buttonClasses,
          )}
        >
          <item.icon className="w-4 h-4" />
        </a>
      ))}
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copier le lien"
        title="Copier le lien"
        className={cn(
          'h-9 px-3 rounded-xl border flex items-center gap-1.5 text-[11px] font-semibold transition-all duration-200',
          copied
            ? 'bg-emerald-600 border-emerald-600 text-white'
            : buttonClasses,
        )}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5" />
            <span>Copié</span>
          </>
        ) : (
          <>
            <Link2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lien</span>
          </>
        )}
      </button>
    </div>
  );
}
