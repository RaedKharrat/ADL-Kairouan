'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/auth.store';
import api, { endpoints } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Mail } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = React.useState('');
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('');
      const response = await api.post(endpoints.auth.login, data);
      
      if (response.data.success) {
        const { user, tokens } = response.data.data;
        setAuth(user, tokens);
        router.push('/admin');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Identifiants incorrects');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 relative overflow-hidden px-4">
      {/* Layer 1: Subtle Mesh Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-royal-600/10 dark:bg-royal-600/5 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-blue-400/10 dark:bg-blue-400/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Layer 2: Primary Architectural DOTS Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_2px,transparent_2px)] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px] opacity-60 dark:opacity-[0.03]"></div>
      
      <div className="w-full max-w-[480px] relative z-10">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-12 animate-fade-in">
          <div className="relative w-20 h-20 mb-6 group cursor-default">
            <div className="absolute inset-0 bg-royal-600/20 rounded-full blur-2xl group-hover:bg-royal-600/30 transition-all duration-700"></div>
            <img 
              src="/logo.png" 
              alt="ADL Kairouan" 
              className="relative w-full h-full object-contain drop-shadow-2xl"
            />
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-950 dark:text-white uppercase tracking-[0.3em]">
            Backoffice <span className="text-royal-600">ADL</span>
          </h1>
          <div className="h-px w-12 bg-royal-600/30 mt-4"></div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mt-4">Système de Gestion Sécurisé</p>
        </div>

        {/* Login Card */}
        <div className="relative p-1 bg-gradient-to-br from-white dark:from-white/10 to-slate-50 dark:to-transparent rounded-[2.5rem] shadow-2xl shadow-royal-900/10">
          <div className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2.3rem] p-10 lg:p-12">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest p-4 rounded-2xl mb-8 flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-2">Email Professionnel</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400 group-focus-within:text-royal-600 transition-colors" />
                  </div>
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="admin@adl-kairouan.tn"
                    className="pl-11 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-950 dark:text-white placeholder:text-slate-400 h-14 rounded-2xl focus-visible:ring-royal-600 focus-visible:border-royal-600 transition-all text-sm font-medium"
                  />
                </div>
                {errors.email && <p className="text-[10px] font-bold text-red-500 ml-2 uppercase tracking-tighter">{errors.email.message}</p>}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Clé d'Accès</label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-royal-600 transition-colors" />
                  </div>
                  <Input
                    {...register('password')}
                    type="password"
                    placeholder="••••••••"
                    className="pl-11 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-950 dark:text-white placeholder:text-slate-400 h-14 rounded-2xl focus-visible:ring-royal-600 focus-visible:border-royal-600 transition-all text-sm font-medium"
                  />
                </div>
                {errors.password && <p className="text-[10px] font-bold text-red-500 ml-2 uppercase tracking-tighter">{errors.password.message}</p>}
              </div>

              <Button 
                type="submit" 
                className="w-full h-16 rounded-2xl bg-royal-600 hover:bg-royal-700 text-white font-display font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-royal-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Authentification...
                  </div>
                ) : (
                  'Ouvrir la Session'
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
            © 2024 <span className="text-slate-900 dark:text-white">ADL Kairouan</span> — Ville Intelligente
          </p>
        </div>
      </div>
    </div>
  );
}
