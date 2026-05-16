'use client';

import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation, useQuery } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { getImageUrl, cn } from '@/lib/utils';
import React from 'react';

export default function ContactPage() {
  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const response = await api.get(endpoints.settingsPublic);
      return response.data.data;
    }
  });

  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    phone: ''
  });
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await api.post(endpoints.contact, data);
    },
    onSuccess: () => {
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '', phone: '' });
      setTimeout(() => setSuccess(false), 5000);
    },
    onError: () => {
      setError("Une erreur est survenue lors de l'envoi du message. Veuillez réessayer.");
      setTimeout(() => setError(null), 5000);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const contactInfo = [
    { 
      icon: MapPin, 
      label: "Siège Social", 
      value: settings?.address || "Avenue de l'Environnement\n3100 Kairouan, Tunisie", 
      color: "text-royal-600" 
    },
    { 
      icon: Phone, 
      label: "Téléphone", 
      value: settings?.contactPhone || "+216 55 566 536", 
      href: settings?.contactPhone ? `tel:${settings.contactPhone.replace(/\s+/g, '')}` : "tel:+21655566536", 
      color: "text-royal-600" 
    },
    { 
      icon: Mail, 
      label: "Email Direct", 
      value: settings?.contactEmail || "contact@adl-kairouan.tn", 
      href: settings?.contactEmail ? `mailto:${settings.contactEmail}` : "mailto:contact@adl-kairouan.tn", 
      color: "text-royal-600" 
    }
  ];

  return (
    <div className="pb-32 bg-background">
      {/* ─── HERO SECTION (ARCHITECTURAL) ─────────────────────────────── */}
      <section className="relative w-full px-4 lg:px-8 pt-4 pb-12">
        <div className="relative w-full min-h-[50vh] bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] lg:rounded-[4rem] flex flex-col items-center justify-center overflow-hidden border border-slate-200/50 dark:border-white/5">
          {/* 3D Dot Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]"></div>
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(30,58,138,0.08)] dark:shadow-[inset_0_0_150px_rgba(30,58,138,0.4)]"></div>
          
          <div className="container-tight relative z-10 text-center px-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-royal-600 mb-8">Contact & Dialogue</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold uppercase tracking-tighter text-slate-950 dark:text-white leading-[1.1] mb-12">
              Collaborons <br /> Ensemble
            </h1>
            <p className="text-sm md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
              Vous avez un projet ou une question ? Notre équipe est à votre disposition pour construire l'avenir de Kairouan.
            </p>
          </div>
        </div>
      </section>

      <div className="container-tight px-6 mt-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
          {/* Contact Info (Architectural Style) */}
          <div className="lg:col-span-5 space-y-20">
            <div className="space-y-16">
              {contactInfo.map((item, i) => (
                <div key={i} className="group border-b border-slate-100 dark:border-white/5 pb-10 last:border-0">
                  <div className="flex items-start gap-8">
                    <item.icon className={cn("w-6 h-6 mt-1 transition-transform group-hover:scale-110", item.color)} />
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="text-2xl font-display font-bold uppercase tracking-tight text-slate-950 dark:text-white hover:text-royal-600 transition-colors">
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-2xl font-display font-bold uppercase tracking-tight text-slate-950 dark:text-white whitespace-pre-line">
                          {item.value}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden group border border-slate-200 dark:border-white/10 shadow-xl shadow-royal-900/5">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3241.184029012798!2d10.1034421!3d35.67247040000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12fdc5565c263411%3A0xfa4d9b15ce3d8121!2sADL%20Tunisie!5e0!3m2!1sen!2stn!4v1778919408348!5m2!1sen!2stn" 
                className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-1000" 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="absolute top-4 left-4 pointer-events-none">
                <div className="bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                  <p className="text-[10px] font-bold text-white uppercase tracking-widest">Siège ADL Kairouan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form (Minimalist Architectural) */}
          <div className="lg:col-span-7">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] p-8 md:p-16 border border-slate-200/50 dark:border-white/5">
              <h2 className="text-3xl font-display font-bold uppercase tracking-tight text-slate-950 dark:text-white mb-12">Nouveau Message</h2>
              
              {success ? (
                <div className="py-20 text-center animate-fade-in">
                  <div className="w-20 h-20 rounded-full bg-royal-600/10 flex items-center justify-center text-royal-600 mx-auto mb-8 border border-royal-600/20">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-display font-bold uppercase tracking-tight text-slate-950 dark:text-white mb-4">Message Envoyé</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-light mb-12">Merci pour votre intérêt. Notre équipe reviendra vers vous très prochainement.</p>
                  <button onClick={() => setSuccess(false)} className="text-[10px] font-bold uppercase tracking-[0.3em] text-royal-600 hover:text-slate-950 dark:hover:text-white transition-colors">Envoyer un autre message</button>
                </div>
              ) : (
                <form className="space-y-10" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Nom complet</label>
                      <Input 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Ahmed Ben Salem" 
                        className="bg-transparent border-slate-200 dark:border-white/10 h-14 rounded-xl focus-visible:ring-royal-600 transition-all" 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Adresse email</label>
                      <Input 
                        name="email"
                        type="email" 
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="email@exemple.com" 
                        className="bg-transparent border-slate-200 dark:border-white/10 h-14 rounded-xl focus-visible:ring-royal-600 transition-all" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Téléphone</label>
                      <Input 
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+216 -- --- ---" 
                        className="bg-transparent border-slate-200 dark:border-white/10 h-14 rounded-xl focus-visible:ring-royal-600 transition-all" 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Sujet</label>
                      <select 
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="flex h-14 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-royal-600 transition-all appearance-none"
                      >
                        <option value="" className="dark:bg-slate-900">Sélectionner un sujet</option>
                        <option value="Projet" className="dark:bg-slate-900">Proposition de projet</option>
                        <option value="Partenariat" className="dark:bg-slate-900">Demande de partenariat</option>
                        <option value="Autre" className="dark:bg-slate-900">Autre demande</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Message</label>
                    <textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder="Comment pouvons-nous vous aider ?" 
                      className="flex w-full rounded-xl border border-slate-200 dark:border-white/10 bg-transparent px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-royal-600 resize-none transition-all"
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    disabled={mutation.isPending}
                    className="w-full h-16 rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center hover:bg-royal-600 dark:hover:bg-royal-600 dark:hover:text-white transition-all duration-500 disabled:opacity-50"
                  >
                    {mutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>Transmettre la demande <Send className="w-4 h-4 ml-4" /></>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
