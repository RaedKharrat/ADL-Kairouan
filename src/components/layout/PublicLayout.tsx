'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

// Dynamically import ChatbotAI to defer react-markdown and reduce initial page bundle
const ChatbotAI = dynamic(
  () => import('./ChatbotAI').then((mod) => mod.ChatbotAI),
  { ssr: false }
);

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
