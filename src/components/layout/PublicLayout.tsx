'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

import { ChatbotAI } from './ChatbotAI';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <div className="flex-1 mt-[76px] flex flex-col min-h-screen">
        {children}
      </div>
      <ChatbotAI />
      <Footer />
    </>
  );
}
