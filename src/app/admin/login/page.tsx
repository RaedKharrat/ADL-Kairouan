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
    <div className="min-h-screen flex items-center justify-center bg-surface-dark relative overflow-hidden">
      {/* Background styling */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md p-8 relative z-10 animate-fade-in-up">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-500 to-purple-500 flex items-center justify-center text-white font-display font-bold text-3xl shadow-glow mx-auto mb-6">
            A
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Backoffice ADL</h1>
          <p className="text-slate-400">Connectez-vous pour gérer la plateforme</p>
        </div>

        <div className="glass-card rounded-3xl p-8 shadow-xl">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Email professionnel</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="admin@adl-kairouan.tn"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 h-12 rounded-xl focus-visible:ring-brand-500"
                />
              </div>
              {errors.email && <p className="text-xs text-destructive ml-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-medium text-slate-300">Mot de passe</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 h-12 rounded-xl focus-visible:ring-brand-500"
                />
              </div>
              {errors.password && <p className="text-xs text-destructive ml-1">{errors.password.message}</p>}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-glow-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
