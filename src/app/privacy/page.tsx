import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  ChevronLeft,
  Lock,
  Database,
  Eye,
  Cookie,
  Clock,
  UserCheck,
  Scale,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité — ADL Tunisie',
  description:
    "Comment l'ADL Tunisie collecte, protège et traite vos données personnelles, ainsi que notre gestion transparente des cookies et du stockage local.",
};

const SECTIONS = [
  { id: 'engagement', number: '01', title: 'Engagement & Cadre Légal' },
  { id: 'donnees-collectees', number: '02', title: 'Données Collectées' },
  { id: 'finalites', number: '03', title: 'Finalités du Traitement' },
  { id: 'cookies', number: '04', title: 'Cookies & Stockage Local' },
  { id: 'conservation-securite', number: '05', title: 'Conservation & Sécurité' },
  { id: 'vos-droits', number: '06', title: 'Vos Droits & Exercice' },
  { id: 'contact-dpo', number: '07', title: 'Contact & Réclamations' },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* ─── ARCHITECTURAL HERO SECTION ──────────────────────────────── */}
      <section className="relative w-full px-4 lg:px-8 pt-4 pb-12">
        <div className="relative w-full rounded-[2.5rem] lg:rounded-[3.5rem] bg-slate-950 dark:bg-white border border-white/10 dark:border-slate-200 overflow-hidden shadow-xl shadow-royal-900/5 transition-colors duration-500">
          {/* Subtle Mesh Gradients */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[25%] -left-[10%] w-[55%] h-[65%] bg-royal-600/15 dark:bg-royal-600/5 rounded-full blur-[120px]" />
            <div className="absolute -bottom-[25%] -right-[10%] w-[55%] h-[65%] bg-brand-500/15 dark:bg-brand-500/5 rounded-full blur-[120px]" />
          </div>

          {/* Dot Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-15 dark:opacity-50 pointer-events-none" />

          <div className="max-w-[1320px] mx-auto px-6 sm:px-10 lg:px-14 py-12 sm:py-16 lg:py-20 relative z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-400 dark:text-brand-600 hover:opacity-80 transition-opacity mb-8 group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Retour à l&apos;accueil</span>
            </Link>

            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-brand-500/15 dark:bg-brand-50 border border-brand-400/25 dark:border-brand-200 mb-6 ml-0 sm:ml-4">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-400 dark:text-brand-600" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-300 dark:text-brand-700">
                Protection des Données
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold text-white dark:text-slate-950 leading-[1.08] tracking-tight max-w-4xl mb-6">
              Politique de Confidentialité
            </h1>

            <p className="text-base sm:text-lg text-slate-300 dark:text-slate-600 max-w-2xl leading-relaxed font-light">
              L&apos;Alliance pour le Développement Local - Tunisie (ADL Tunisie) s&apos;engage à protéger la vie privée de ses membres, visiteurs, partenaires et bénéficiaires avec une transparence totale.
            </p>

            <div className="mt-8 pt-6 border-t border-white/10 dark:border-slate-200 flex flex-wrap items-center gap-6 text-xs text-slate-400 dark:text-slate-500">
              <span>Dernière mise à jour : Novembre 2026</span>
              <span className="hidden sm:inline text-white/20 dark:text-slate-300">•</span>
              <Link
                href="/terms"
                className="text-brand-400 dark:text-brand-600 hover:underline font-semibold inline-flex items-center gap-1.5"
              >
                <Scale className="w-3.5 h-3.5" />
                Consulter les Conditions d&apos;Utilisation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CONTENT & NAVIGATION ───────────────────────────────────── */}
      <section className="max-w-[1320px] mx-auto px-4 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Sticky Table of Contents */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-white/10 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-slate-950/40 flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white">
                  Sommaire
                </h2>
              </div>
              <nav aria-label="Sections de la politique de confidentialité" className="p-4 space-y-1">
                {SECTIONS.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 w-5">
                      {sec.number}
                    </span>
                    <span>{sec.title}</span>
                  </a>
                ))}
              </nav>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                Exercer vos droits sur vos données ?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Vous pouvez demander l&apos;accès, la rectification ou la suppression de vos informations personnelles à tout moment.
              </p>
              <Button asChild className="w-full rounded-xl h-10 bg-brand-600 hover:bg-brand-500 text-xs font-semibold">
                <Link href="/contact" className="inline-flex items-center justify-center gap-2">
                  <span>Contacter notre équipe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </aside>

          {/* Main Clauses */}
          <div className="lg:col-span-8 space-y-8">
            <article
              id="engagement"
              className="p-7 sm:p-9 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200/70 dark:border-white/10 shadow-sm scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2.5 py-1 rounded-lg bg-brand-600/10 text-brand-600 dark:text-brand-400 text-xs font-bold">
                  01
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-950 dark:text-white">
                  Engagement &amp; Cadre Légal
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                L&apos;association <strong>Alliance pour le Développement Local - Tunisie (ADL Tunisie)</strong>, soumise au décret-loi n° 2011-88 du 24 septembre 2011 portant organisation des associations, traite les données personnelles recueillies via sa plateforme dans le strict respect des principes de licéité, de loyauté, de proportionnalité et de confidentialité, conformément à la législation tunisienne en vigueur relative à la protection des données à caractère personnel (Loi organique n° 2004-63) ainsi qu&apos;aux bonnes pratiques internationales.
              </p>
            </article>

            <article
              id="donnees-collectees"
              className="p-7 sm:p-9 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200/70 dark:border-white/10 shadow-sm scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2.5 py-1 rounded-lg bg-brand-600/10 text-brand-600 dark:text-brand-400 text-xs font-bold">
                  02
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-950 dark:text-white flex items-center gap-2">
                  <span>Données Collectées</span>
                  <Database className="w-4 h-4 text-slate-400 hidden sm:inline" />
                </h2>
              </div>
              <div className="space-y-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  Nous appliquons le principe de minimisation : seules les informations strictement nécessaires à vos démarches sont collectées lorsque vous interagissez volontairement avec nos services :
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li>
                    <strong>Formulaire de contact :</strong> nom complet, adresse courriel, numéro de téléphone (facultatif), sujet et contenu de votre message.
                  </li>
                  <li>
                    <strong>Commentaires sur les actualités :</strong> nom ou pseudonyme, adresse courriel et texte du commentaire publié.
                  </li>
                  <li>
                    <strong>Lettre d&apos;information (Newsletter) :</strong> adresse courriel lors d&apos;une inscription volontaire aux actualités institutionnelles.
                  </li>
                  <li>
                    <strong>Données techniques minimales :</strong> journaux de sécurité serveur (horodatage, requêtes) destinés exclusivement au bon fonctionnement et à la protection contre les abus.
                  </li>
                </ul>
              </div>
            </article>

            <article
              id="finalites"
              className="p-7 sm:p-9 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200/70 dark:border-white/10 shadow-sm scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2.5 py-1 rounded-lg bg-brand-600/10 text-brand-600 dark:text-brand-400 text-xs font-bold">
                  03
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-950 dark:text-white flex items-center gap-2">
                  <span>Finalités du Traitement</span>
                  <Eye className="w-4 h-4 text-slate-400 hidden sm:inline" />
                </h2>
              </div>
              <div className="space-y-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>Vos données personnelles sont utilisées exclusivement pour :</p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
                  <li>Répondre aux demandes d&apos;information, de partenariat ou d&apos;accompagnement transmises via le formulaire de contact.</li>
                  <li>Modérer et afficher les échanges citoyens sous nos articles d&apos;actualité.</li>
                  <li>Diffuser nos publications, rapports d&apos;impact et appels à projets aux abonnés volontaires.</li>
                  <li>Assurer la sécurité technique, la prévention du spam et la disponibilité de la plateforme.</li>
                </ul>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 pt-1">
                  L&apos;ADL Tunisie ne vend, ne loue et ne cède jamais vos données personnelles à des tiers à des fins commerciales ou publicitaires.
                </p>
              </div>
            </article>

            <article
              id="cookies"
              className="p-7 sm:p-9 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200/70 dark:border-white/10 shadow-sm scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2.5 py-1 rounded-lg bg-brand-600/10 text-brand-600 dark:text-brand-400 text-xs font-bold">
                  04
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-950 dark:text-white flex items-center gap-2">
                  <span>Cookies &amp; Stockage Local</span>
                  <Cookie className="w-4 h-4 text-slate-400 hidden sm:inline" />
                </h2>
              </div>
              <div className="space-y-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  Notre portail privilégie une navigation respectueuse de votre vie privée. Nous n&apos;utilisons <strong>aucun cookie publicitaire ni traceur de profilage tiers</strong>.
                </p>
                <p>
                  Seul le stockage local technique du navigateur (<em>localStorage</em>) est utilisé pour mémoriser vos préférences strictement fonctionnelles :
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
                  <li>Votre préférence d&apos;affichage (mode clair ou sombre).</li>
                  <li>Vos mentions « J&apos;aime » et articles sauvegardés localement pour votre confort de lecture.</li>
                  <li>Le maintien sécurisé de la session lorsque les membres de l&apos;équipe accèdent à l&apos;espace d&apos;administration.</li>
                </ul>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Vous pouvez effacer ces données à tout moment directement depuis les paramètres de votre navigateur.
                </p>
              </div>
            </article>

            <article
              id="conservation-securite"
              className="p-7 sm:p-9 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200/70 dark:border-white/10 shadow-sm scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2.5 py-1 rounded-lg bg-brand-600/10 text-brand-600 dark:text-brand-400 text-xs font-bold">
                  05
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-950 dark:text-white flex items-center gap-2">
                  <span>Conservation &amp; Sécurité</span>
                  <Clock className="w-4 h-4 text-slate-400 hidden sm:inline" />
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Les données issues des formulaires de contact sont conservées pendant la durée nécessaire au traitement de votre demande, et au maximum 36 mois après le dernier échange, sauf obligation légale différente. Tous les échanges avec la plateforme sont chiffrés via le protocole HTTPS, et l&apos;accès aux bases de données est strictement restreint aux membres habilités de l&apos;association.
              </p>
            </article>

            <article
              id="vos-droits"
              className="p-7 sm:p-9 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200/70 dark:border-white/10 shadow-sm scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2.5 py-1 rounded-lg bg-brand-600/10 text-brand-600 dark:text-brand-400 text-xs font-bold">
                  06
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-950 dark:text-white flex items-center gap-2">
                  <span>Vos Droits &amp; Exercice</span>
                  <UserCheck className="w-4 h-4 text-slate-400 hidden sm:inline" />
                </h2>
              </div>
              <div className="space-y-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>Vous disposez à tout moment des droits suivants concernant vos données personnelles :</p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
                  <li><strong>Droit d&apos;accès :</strong> obtenir la confirmation que vos données sont ou ne sont pas traitées et en recevoir une copie.</li>
                  <li><strong>Droit de rectification :</strong> demander la mise à jour ou la correction d&apos;informations inexactes.</li>
                  <li><strong>Droit d&apos;opposition et de suppression :</strong> demander l&apos;effacement de vos messages, commentaires ou le retrait de votre inscription à notre lettre d&apos;information.</li>
                </ul>
              </div>
            </article>

            <article
              id="contact-dpo"
              className="p-7 sm:p-9 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200/70 dark:border-white/10 shadow-sm scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2.5 py-1 rounded-lg bg-brand-600/10 text-brand-600 dark:text-brand-400 text-xs font-bold">
                  07
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-950 dark:text-white">
                  Contact &amp; Réclamations
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
                Pour exercer l&apos;un de ces droits ou poser toute question relative à la confidentialité, écrivez-nous à{' '}
                <a
                  href="mailto:contact@adl-kairouan.tn"
                  className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                >
                  contact@adl-kairouan.tn
                </a>{' '}
                ou utilisez notre formulaire dédié. Nous nous engageons à traiter votre demande dans les meilleurs délais.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/terms"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-brand-600 hover:text-white transition-colors"
                >
                  <Scale className="w-4 h-4" />
                  Conditions d&apos;Utilisation
                </Link>
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-brand-600 hover:text-white transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  Questions Fréquentes
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
