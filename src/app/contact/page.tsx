'use client';

import React from 'react';
import Link from 'next/link';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation, useQuery } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { cn } from '@/lib/utils';

const CONTACT_TOPICS = [
  { id: 'Projet', code: '01', label: 'Projet Local', defaultSubject: 'Proposition de projet local' },
  { id: 'Partenariat', code: '02', label: 'Partenariat', defaultSubject: 'Demande de partenariat institutionnel' },
  { id: 'Engagement', code: '03', label: 'Jeunes & Citoyenneté', defaultSubject: 'Engagement citoyen / Jeunes & Femmes' },
  { id: 'Innovation', code: '04', label: 'Culture & Numérique', defaultSubject: 'Initiative culturelle ou numérique' },
  { id: 'Autre', code: '05', label: 'Autre Demande', defaultSubject: 'Demande d’information générale' },
] as const;

const MAX_MESSAGE_LENGTH = 2000;

export default function ContactPage() {
  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const response = await api.get(endpoints.settingsPublic);
      return response.data.data;
    },
  });

  const [selectedTopic, setSelectedTopic] = React.useState<string>('Projet');
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    subject: 'Proposition de projet local',
    message: '',
    phone: '',
  });
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const contactEmail = settings?.contactEmail || 'contact@adl-kairouan.tn';
  const contactPhone = settings?.contactPhone || '+216 55 566 536';
  const contactAddress = settings?.address || 'Kairouan Centre, 3100 Kairouan, Tunisie';

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await api.post(endpoints.contact, {
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim() || undefined,
        subject: data.subject.trim() || selectedTopic,
        message: data.message.trim(),
      });
    },
    onSuccess: () => {
      setSuccess(true);
      setError(null);
      setFieldErrors({});
      setFormData({
        name: '',
        email: '',
        subject: 'Proposition de projet local',
        message: '',
        phone: '',
      });
      setSelectedTopic('Projet');
    },
    onError: () => {
      setError(
        "Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer ou nous écrire directement par courriel."
      );
    },
  });

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = 'Veuillez indiquer votre nom complet.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errors.email = 'Veuillez saisir une adresse courriel valide.';
    }
    if (!formData.subject.trim()) {
      errors.subject = 'Veuillez préciser le sujet de votre demande.';
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errors.message = 'Votre message doit contenir au moins 10 caractères.';
    } else if (formData.message.length > MAX_MESSAGE_LENGTH) {
      errors.message = `Votre message ne peut pas dépasser ${MAX_MESSAGE_LENGTH} caractères.`;
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;
    mutation.mutate(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleTopicSelect = (topic: (typeof CONTACT_TOPICS)[number]) => {
    setSelectedTopic(topic.id);
    const matchesPreset = CONTACT_TOPICS.some((t) => t.defaultSubject === formData.subject);
    if (!formData.subject.trim() || matchesPreset) {
      setFormData((prev) => ({ ...prev, subject: topic.defaultSubject }));
      if (fieldErrors.subject) {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next.subject;
          return next;
        });
      }
    }
  };

  const handleCopy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // Clipboard not available
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
      {/* ─── HERO SECTION (MATCHED TO ACCUEIL) ─────────────────────────── */}
      <section className="relative w-full px-4 lg:px-8 pt-4 pb-12">
        <div className="relative w-full min-h-[58vh] lg:min-h-[64vh] bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] lg:rounded-[4rem] flex flex-col items-center justify-center overflow-hidden shadow-sm border border-slate-200/50 dark:border-white/5">
          {/* 3D Dot Pattern - Matched to Accueil */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]" />

          {/* 3D Inner Shadow Overlay - Matched to Accueil */}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(30,58,138,0.08)] dark:shadow-[inset_0_0_150px_rgba(30,58,138,0.4)]" />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-royal-900/[0.03] via-transparent to-royal-900/[0.03] dark:from-royal-950/40 dark:via-transparent dark:to-royal-950/40" />

          {/* Centered Editorial Content */}
          <div className="relative z-20 flex flex-col items-center text-center max-w-4xl px-6 py-16 lg:py-20">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-royal-600 mb-6">
              Contact &amp; Dialogue Citoyen
            </p>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold leading-[0.95] tracking-tight uppercase mb-8 text-slate-900 dark:text-white">
              <span className="block pb-1">COLLABORONS</span>
              <span className="block text-royal-600">ENSEMBLE</span>
            </h1>

            <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Vous portez une initiative citoyenne, culturelle, numérique ou environnementale ? L&apos;Alliance pour le Développement Local - Tunisie est à votre écoute.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto px-10 h-12 lg:h-14 rounded-full bg-slate-950 dark:bg-white text-white dark:text-black font-bold text-[10px] lg:text-[11px] uppercase tracking-[0.2em] transition-transform hover:scale-105 shadow-xl"
              >
                <a href="#contact-form">Écrire un message</a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-10 h-12 lg:h-14 rounded-full border-slate-200 dark:border-white/10 font-bold text-[10px] lg:text-[11px] uppercase tracking-[0.2em] hover:bg-slate-100 dark:hover:bg-white/5 transition-all backdrop-blur-sm"
              >
                <a href={`mailto:${contactEmail}`}>Courriel direct</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DIRECT CHANNELS STRIP (MATCHED TO ACCUEIL STATS SECTION) ──── */}
      <section className="py-16 md:py-24 bg-background border-y border-slate-100 dark:border-white/5">
        <div className="container-tight px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-10 lg:gap-x-12">
            {/* Channel 01: Email */}
            <div className="group flex flex-col items-start">
              <div className="flex items-center justify-between w-full mb-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 group-hover:text-royal-600 transition-colors">
                  01 / Courriel
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy('email', contactEmail)}
                  title="Copier le courriel"
                  className="text-slate-400 hover:text-royal-600 transition-colors"
                >
                  {copiedKey === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <a
                href={`mailto:${contactEmail}`}
                className="text-lg md:text-xl font-display font-bold text-slate-950 dark:text-white tracking-tight hover:text-royal-600 dark:hover:text-royal-400 transition-colors break-all"
              >
                {contactEmail}
              </a>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 mt-2">
                Réponse sous 24–48h
              </p>
            </div>

            {/* Channel 02: Phone */}
            <div className="group flex flex-col items-start">
              <div className="flex items-center justify-between w-full mb-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 group-hover:text-royal-600 transition-colors">
                  02 / Téléphone
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy('phone', contactPhone)}
                  title="Copier le numéro"
                  className="text-slate-400 hover:text-royal-600 transition-colors"
                >
                  {copiedKey === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <a
                href={`tel:${contactPhone.replace(/\s+/g, '')}`}
                className="text-xl md:text-2xl font-display font-bold text-slate-950 dark:text-white tracking-tight hover:text-royal-600 dark:hover:text-royal-400 transition-colors"
              >
                {contactPhone}
              </a>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 mt-2">
                Ligne directe ADL
              </p>
            </div>

            {/* Channel 03: Location */}
            <div className="group flex flex-col items-start">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 group-hover:text-royal-600 transition-colors mb-3">
                03 / Siège Social
              </span>
              <p className="text-lg md:text-xl font-display font-bold text-slate-950 dark:text-white tracking-tight">
                {contactAddress.replace(/\n/g, ', ')}
              </p>
              <a
                href="https://www.google.com/maps/place/ADL+Tunisie/@35.6724704,10.1034421,17z"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold uppercase tracking-[0.25em] text-royal-600 hover:underline mt-2 inline-flex items-center gap-1"
              >
                Voir sur Google Maps <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>

            {/* Channel 04: Hours */}
            <div className="group flex flex-col items-start">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 group-hover:text-royal-600 transition-colors mb-3">
                04 / Permanence
              </span>
              <p className="text-xl md:text-2xl font-display font-bold text-slate-950 dark:text-white tracking-tight">
                08h30 – 17h30
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 mt-2">
                Lundi au Vendredi
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MAIN WORKSPACE SECTION (MATCHED TO ACCUEIL PROJECTS TEXTURE) ─ */}
      <section
        id="contact-form"
        className="py-24 md:py-32 relative bg-slate-50 dark:bg-slate-900/50 overflow-hidden scroll-mt-20"
      >
        {/* Signature Code-Generated Texture: Tiger + Dots (From Accueil) */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.08] text-slate-950 dark:text-white">
          <svg width="100%" height="100%" className="absolute inset-0">
            <filter id="tigerFilterContact">
              <feTurbulence type="fractalNoise" baseFrequency="0.015 0.08" numOctaves="2" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="30" />
            </filter>
            <pattern id="tigerPatternContact" x="0" y="0" width="300" height="200" patternUnits="userSpaceOnUse">
              <rect width="300" height="200" fill="transparent" />
              <path
                d="M-50 40 L350 40 M-50 100 L350 100 M-50 160 L350 160"
                stroke="currentColor"
                strokeWidth="12"
                strokeLinecap="round"
                filter="url(#tigerFilterContact)"
              />
            </pattern>
            <rect width="100%" height="100%" fill="url(#tigerPatternContact)" />
          </svg>
          <div className="absolute inset-0 bg-[radial-gradient(currentColor_1.5px,transparent_1.5px)] [background-size:40px_40px] opacity-30" />
        </div>

        <div className="max-w-[1400px] px-6 lg:px-12 mx-auto relative z-10">
          {/* Editorial Section Header (Matched to Accueil) */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-10">
            <div className="max-w-3xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-royal-600 mb-4">
                Transmission Directe
              </p>
              <h2 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter text-slate-950 dark:text-white leading-[0.85]">
                Écrire à <br /> L&apos;Alliance
              </h2>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-light max-w-[300px]">
                Partagez vos propositions de projets, demandes de partenariat ou initiatives citoyennes avec notre équipe.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <div className="w-12 h-[1px] bg-royal-600" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-950 dark:text-white">
                  Écoute &amp; Engagement
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* LEFT: Architectural Form Card (7 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] lg:rounded-[3rem] p-8 sm:p-12 lg:p-16 border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-royal-900/5">
                {success ? (
                  <div className="py-16 text-center space-y-8 animate-fade-in">
                    <div className="w-20 h-20 rounded-full bg-royal-600/10 flex items-center justify-center text-royal-600 mx-auto border border-royal-600/20">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div className="space-y-3 max-w-md mx-auto">
                      <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-royal-600">
                        Confirmation
                      </p>
                      <h3 className="text-3xl font-display font-bold uppercase tracking-tight text-slate-950 dark:text-white">
                        Message Transmis
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                        Merci pour votre engagement. Notre équipe prendra connaissance de votre message et reviendra vers vous sous 24 à 48 heures ouvrées.
                      </p>
                    </div>
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                      <button
                        type="button"
                        onClick={() => setSuccess(false)}
                        className="h-14 px-10 rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-royal-600 dark:hover:bg-royal-600 dark:hover:text-white transition-all duration-500"
                      >
                        Envoyer un autre message
                      </button>
                      <Link
                        href="/projects"
                        className="h-14 px-10 rounded-full border border-slate-200 dark:border-white/10 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                      >
                        Explorer les projets
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form className="space-y-10" onSubmit={handleSubmit} noValidate>
                    {error && (
                      <div
                        role="alert"
                        className="flex items-start gap-4 p-5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs"
                      >
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                        <div className="space-y-1">
                          <p className="font-bold uppercase tracking-[0.2em] text-[10px]">Erreur de transmission</p>
                          <p className="leading-relaxed">{error}</p>
                        </div>
                      </div>
                    )}

                    {/* Motif Selector (Accueil Pill Style) */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 block">
                        01 / Sélectionner une thématique
                      </label>
                      <div className="flex flex-wrap gap-2.5">
                        {CONTACT_TOPICS.map((topic) => {
                          const isSelected = selectedTopic === topic.id;
                          return (
                            <button
                              key={topic.id}
                              type="button"
                              onClick={() => handleTopicSelect(topic)}
                              className={cn(
                                'h-11 px-5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-2 border',
                                isSelected
                                  ? 'bg-slate-950 text-white border-slate-950 dark:bg-white dark:text-slate-950 dark:border-white shadow-lg'
                                  : 'bg-slate-50/80 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 border-slate-200/80 dark:border-white/10 hover:border-royal-600 hover:text-royal-600 dark:hover:text-royal-400'
                              )}
                            >
                              <span className="opacity-50 font-display">{topic.code}</span>
                              <span>{topic.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Name & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label
                          htmlFor="contact-name"
                          className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 ml-1 block"
                        >
                          Nom complet <span className="text-royal-600">*</span>
                        </label>
                        <Input
                          id="contact-name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Votre nom et prénom"
                          aria-invalid={!!fieldErrors.name}
                          className={cn(
                            'bg-slate-50/60 dark:bg-slate-950/50 border-slate-200 dark:border-white/10 h-14 px-5 rounded-2xl focus-visible:ring-royal-600 transition-all',
                            fieldErrors.name && 'border-red-500 focus-visible:ring-red-500'
                          )}
                        />
                        {fieldErrors.name && (
                          <p className="text-xs text-red-600 dark:text-red-400 font-medium pl-1">{fieldErrors.name}</p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <label
                          htmlFor="contact-email"
                          className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 ml-1 block"
                        >
                          Adresse courriel <span className="text-royal-600">*</span>
                        </label>
                        <Input
                          id="contact-email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="nom@exemple.com"
                          aria-invalid={!!fieldErrors.email}
                          className={cn(
                            'bg-slate-50/60 dark:bg-slate-950/50 border-slate-200 dark:border-white/10 h-14 px-5 rounded-2xl focus-visible:ring-royal-600 transition-all',
                            fieldErrors.email && 'border-red-500 focus-visible:ring-red-500'
                          )}
                        />
                        {fieldErrors.email && (
                          <p className="text-xs text-red-600 dark:text-red-400 font-medium pl-1">{fieldErrors.email}</p>
                        )}
                      </div>
                    </div>

                    {/* Phone & Subject */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between ml-1">
                          <label
                            htmlFor="contact-phone"
                            className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400"
                          >
                            Téléphone
                          </label>
                          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-300 dark:text-slate-600">
                            Optionnel
                          </span>
                        </div>
                        <Input
                          id="contact-phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+216 -- --- ---"
                          className="bg-slate-50/60 dark:bg-slate-950/50 border-slate-200 dark:border-white/10 h-14 px-5 rounded-2xl focus-visible:ring-royal-600 transition-all"
                        />
                      </div>

                      <div className="space-y-3">
                        <label
                          htmlFor="contact-subject"
                          className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 ml-1 block"
                        >
                          Objet de la demande <span className="text-royal-600">*</span>
                        </label>
                        <Input
                          id="contact-subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          placeholder="Sujet de votre message"
                          aria-invalid={!!fieldErrors.subject}
                          className={cn(
                            'bg-slate-50/60 dark:bg-slate-950/50 border-slate-200 dark:border-white/10 h-14 px-5 rounded-2xl focus-visible:ring-royal-600 transition-all',
                            fieldErrors.subject && 'border-red-500 focus-visible:ring-red-500'
                          )}
                        />
                        {fieldErrors.subject && (
                          <p className="text-xs text-red-600 dark:text-red-400 font-medium pl-1">{fieldErrors.subject}</p>
                        )}
                      </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between ml-1">
                        <label
                          htmlFor="contact-message"
                          className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400"
                        >
                          Message <span className="text-royal-600">*</span>
                        </label>
                        <span
                          className={cn(
                            'text-[10px] font-bold uppercase tracking-[0.2em]',
                            formData.message.length > MAX_MESSAGE_LENGTH ? 'text-red-600' : 'text-slate-400'
                          )}
                        >
                          {formData.message.length} / {MAX_MESSAGE_LENGTH}
                        </span>
                      </div>
                      <textarea
                        id="contact-message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        placeholder="Exposez votre projet, votre proposition de partenariat ou votre question..."
                        aria-invalid={!!fieldErrors.message}
                        className={cn(
                          'flex w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-slate-950/50 p-5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-royal-600 resize-none transition-all leading-relaxed',
                          fieldErrors.message && 'border-red-500 focus:ring-red-500'
                        )}
                      />
                      {fieldErrors.message && (
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium pl-1">{fieldErrors.message}</p>
                      )}
                    </div>

                    <div className="space-y-6 pt-2">
                      <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="w-full h-16 rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center hover:bg-royal-600 dark:hover:bg-royal-600 dark:hover:text-white transition-all duration-500 shadow-xl disabled:opacity-50"
                      >
                        {mutation.isPending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            Transmettre la demande <Send className="w-4 h-4 ml-4" />
                          </>
                        )}
                      </button>

                      <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center flex items-center justify-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-royal-600 shrink-0" />
                        <span>
                          Données protégées conformément à notre{' '}
                          <Link href="/privacy" className="text-slate-700 dark:text-slate-300 underline hover:text-royal-600">
                            Politique de Confidentialité
                          </Link>
                          .
                        </span>
                      </p>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* RIGHT: Map & Architectural Directory (5 cols) */}
            <div className="lg:col-span-5 space-y-10">
              {/* Interactive Map Showcase */}
              <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden group border border-slate-200 dark:border-white/10 shadow-2xl shadow-royal-900/5 bg-slate-100 dark:bg-slate-900">
                <iframe
                  title="Localisation du siège ADL Tunisie à Kairouan"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3241.184029012798!2d10.1034421!3d35.67247040000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12fdc5565c263411%3A0xfa4d9b15ce3d8121!2sADL%20Tunisie!5e0!3m2!1sen!2stn!4v1778919408348!5m2!1sen!2stn"
                  className="w-full h-full border-0 grayscale group-hover:grayscale-0 transition-all duration-700"
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="absolute top-5 left-5 pointer-events-none">
                  <div className="bg-slate-950/85 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-royal-500 animate-pulse" />
                    <p className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Siège ADL Tunisie</p>
                  </div>
                </div>
                <a
                  href="https://www.google.com/maps/place/ADL+Tunisie/@35.6724704,10.1034421,17z"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-5 right-5 h-10 px-5 rounded-full bg-white/95 dark:bg-slate-950/90 backdrop-blur-md text-slate-950 dark:text-white text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg hover:bg-royal-600 hover:text-white transition-all"
                >
                  <span>Ouvrir Maps</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Minimalist Line-Separated Navigation (Matched to Accueil FAQ style) */}
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 sm:p-10 border border-slate-200/60 dark:border-white/5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-royal-600 mb-6">
                  Accès Rapide
                </p>

                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {[
                    {
                      num: '01',
                      title: 'Questions Fréquentes',
                      subtitle: 'Consultez les réponses sur nos programmes et adhésions',
                      href: '/faq',
                    },
                    {
                      num: '02',
                      title: 'Nos 5 Voix & Statuts',
                      subtitle: 'Découvrir la mission de l’ADL Tunisie (Décret-loi n° 2011-88)',
                      href: '/about',
                    },
                    {
                      num: '03',
                      title: 'Rapports & Transparence',
                      subtitle: 'Accéder aux bilans annuels et documents officiels',
                      href: '/reports',
                    },
                  ].map((item) => (
                    <Link
                      key={item.num}
                      href={item.href}
                      className="group py-6 first:pt-2 last:pb-2 flex items-center justify-between gap-6 transition-all"
                    >
                      <div className="flex items-baseline gap-6">
                        <span className="text-[10px] font-bold text-slate-300 dark:text-slate-700 tracking-widest font-display">
                          {item.num}
                        </span>
                        <div>
                          <h3 className="text-lg font-display font-bold uppercase tracking-tight text-slate-950 dark:text-white group-hover:text-royal-600 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-1">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 group-hover:bg-royal-600 group-hover:border-royal-600 group-hover:text-white transition-all duration-500">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
