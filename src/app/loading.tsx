'use client';

import { Settings2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-slate-950 transition-colors duration-700">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:40px_40px] opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-royal-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Loader Container */}
      <div className="relative flex flex-col items-center">
        {/* Architectural Progress Ring */}
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-2 border-slate-100 dark:border-white/5" />
          <div className="absolute inset-0 rounded-full border-t-2 border-royal-600 animate-[spin_1.5s_linear_infinite]" />
          
          {/* Central Logo/Icon */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <img 
              src="/logo.png" 
              alt="Logo ADL" 
              className="w-full h-full object-contain animate-pulse"
            />
          </div>
        </div>

        {/* Textual Branding */}
        <div className="mt-12 text-center space-y-3">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.6em] text-slate-950 dark:text-white ml-[0.6em] animate-in fade-in duration-1000">
            ADL Kairouan
          </h2>
          <div className="flex items-center justify-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-royal-600 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1 h-1 rounded-full bg-royal-600 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1 h-1 rounded-full bg-royal-600 animate-bounce" />
          </div>
        </div>
      </div>

      {/* Bottom Architectural Note */}
      <div className="absolute bottom-12 text-[8px] font-bold uppercase tracking-[0.4em] text-slate-400">
        Chargement de l'expérience
      </div>
    </div>
  );
}
