import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Scale,
  ChevronLeft,
  ShieldCheck,
  FileText,
  BookOpen,
  MessageSquare,
  AlertCircle,
  Mail,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: "Conditions d'Utilisation — ADL Tunisie",
  description:
    "Conditions générales d'utilisation, mentions légales et règles d'accès à la plateforme numérique de l'ADL Tunisie.",
};

const SECTIONS = [
  { id: 'mentions-legales', number: '01', title: 'Éditeur & Mentions Légales' },
  { id: 'objet-plateforme', number: '02', title: 'Objet de la Plateforme' },
  { id: 'acces-services', number: '03', title: 'Accès et Disponibilité' },
  { id: 'propriete-intellectuelle', number: '04', title: 'Propriété Intellectuelle' },
  { id: 'contributions', number: '05', title: 'Commentaires & Contributions' },
  { id: 'responsabilite', number: '06', title: 'Responsabilité & Liens Externes' },
  { id: 'droit-applicable', number: '07', title: 'Droit Applicable & Contact' },
];

export default function TermsPage() {
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
              <Scale className="w-3.5 h-3.5 text-brand-400 dark:text-brand-600" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-300 dark:text-brand-700">
                Cadre Réglementaire
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold text-white dark:text-slate-950 leading-[1.08] tracking-tight max-w-4xl mb-6">
              Conditions Générales d&apos;Utilisation
            </h1>

            <p className="text-base sm:text-lg text-slate-300 dark:text-slate-600 max-w-2xl leading-relaxed font-light">
              Les présentes conditions définissent les règles d&apos;accès et d&apos;utilisation du portail institutionnel de l&apos;Alliance pour le Développement Local - Tunisie (ADL Tunisie).
            </p>

            <div className="mt-8 pt-6 border-t border-white/10 dark:border-slate-200 flex flex-wrap items-center gap-6 text-xs text-slate-400 dark:text-slate-500">
              <span>Dernière mise à jour : Novembre 2026</span>
              <span className="hidden sm:inline text-white/20 dark:text-slate-300">•</span>
              <Link
                href="/privacy"
                className="text-brand-400 dark:text-brand-600 hover:underline font-semibold inline-flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                Consulter la Politique de Confidentialité
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
                <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white">
                  Sommaire
                </h2>
              </div>
              <nav aria-label="Sections des conditions d'utilisation" className="p-4 space-y-1">
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
                Une question juridique ou institutionnelle ?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Notre équipe administrative reste à votre disposition pour toute demande relative à l&apos;utilisation de nos contenus ou partenariats.
              </p>
              <Button asChild className="w-full rounded-xl h-10 bg-brand-600 hover:bg-brand-500 text-xs font-semibold">
                <Link href="/contact" className="inline-flex items-center justify-center gap-2">
                  <span>Contacter l&apos;ADL</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </aside>

          {/* Main Clauses */}
          <div className="lg:col-span-8 space-y-8">
            <article
              id="mentions-legales"
              className="p-7 sm:p-9 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200/70 dark:border-white/10 shadow-sm scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2.5 py-1 rounded-lg bg-brand-600/10 text-brand-600 dark:text-brand-400 text-xs font-bold">
                  01
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-950 dark:text-white">
                  Éditeur &amp; Mentions Légales
                </h2>
              </div>
              <div className="space-y-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  Le présent site est édité par l&apos;association <strong>Alliance pour le Développement Local - Tunisie (ADL Tunisie)</strong>, association à but non lucratif ayant pour objet le développement local et soumise au <strong>décret-loi n° 2011-88 du 24 septembre 2011 portant organisation des associations</strong>.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
                  <li><strong>Dénomination officielle :</strong> Alliance pour le Développement Local - Tunisie (ADL Tunisie)</li>
                  <li><strong>Siège social :</strong> Kairouan Centre, 3100 Kairouan, Tunisie</li>
                  <li><strong>Courriel officiel :</strong> contact@adl-kairouan.tn</li>
                  <li><strong>Téléphone :</strong> +216 55 566 536</li>
                </ul>
              </div>
            </article>

            <article
              id="objet-plateforme"
              className="p-7 sm:p-9 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200/70 dark:border-white/10 shadow-sm scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2.5 py-1 rounded-lg bg-brand-600/10 text-brand-600 dark:text-brand-400 text-xs font-bold">
                  02
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-950 dark:text-white">
                  Objet de la Plateforme
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Conformément à ses statuts, l&apos;ADL Tunisie vise à contribuer à la construction d&apos;une société locale inclusive et durable à travers la participation des jeunes et des femmes aux affaires publiques, l&apos;inclusion économique et la cohésion sociale, l&apos;égalité des chances, la citoyenneté active, les pratiques environnementales durables ainsi que les initiatives culturelles et numériques innovantes. La plateforme informe le public, diffuse nos rapports en libre accès et facilite l&apos;engagement citoyen.
              </p>
            </article>

            <article
              id="acces-services"
              className="p-7 sm:p-9 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200/70 dark:border-white/10 shadow-sm scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2.5 py-1 rounded-lg bg-brand-600/10 text-brand-600 dark:text-brand-400 text-xs font-bold">
                  03
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-950 dark:text-white">
                  Accès et Disponibilité des Services
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Le site public est accessible gratuitement à tout utilisateur disposant d&apos;un accès Internet. L&apos;ADL s&apos;efforce d&apos;assurer une continuité de service optimale, mais se réserve le droit d&apos;interrompre temporairement l&apos;accès pour des opérations de maintenance, de mise à jour technique ou en cas de force majeure, sans que cela n&apos;ouvre droit à indemnisation.
              </p>
            </article>

            <article
              id="propriete-intellectuelle"
              className="p-7 sm:p-9 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200/70 dark:border-white/10 shadow-sm scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2.5 py-1 rounded-lg bg-brand-600/10 text-brand-600 dark:text-brand-400 text-xs font-bold">
                  04
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-950 dark:text-white">
                  Propriété Intellectuelle &amp; Ressources Publiques
                </h2>
              </div>
              <div className="space-y-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  L&apos;ensemble des éléments présents sur ce site (textes, identité visuelle, logos, photographies, vidéos et architecture logicielle) est protégé par le droit de la propriété intellectuelle et demeure la propriété exclusive de l&apos;ADL Tunisie ou de ses partenaires cités.
                </p>
                <p>
                  Les <strong>rapports de transparence et dossiers publics</strong> mis en téléchargement peuvent être consultés, cités et partagés à des fins informatives, académiques ou citoyennes, sous réserve d&apos;en mentionner explicitement la source (« ADL Tunisie / Kairouan ») et de ne pas en altérer le sens.
                </p>
              </div>
            </article>

            <article
              id="contributions"
              className="p-7 sm:p-9 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200/70 dark:border-white/10 shadow-sm scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2.5 py-1 rounded-lg bg-brand-600/10 text-brand-600 dark:text-brand-400 text-xs font-bold">
                  05
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-950 dark:text-white">
                  Commentaires, Formulaire &amp; Bonne Conduite
                </h2>
              </div>
              <div className="space-y-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  Les espaces d&apos;interaction (commentaires d&apos;articles, formulaire de contact et assistant conversationnel) doivent être utilisés dans un esprit de respect mutuel et d&apos;échange constructif.
                </p>
                <p>
                  Sont strictement interdits tout contenu diffamatoire, injurieux, discriminatoire, promotionnel non sollicité (spam) ou portant atteinte à la vie privée d&apos;autrui. L&apos;équipe de modération de l&apos;ADL se réserve le droit de supprimer sans préavis toute contribution contrevenant à ces principes.
                </p>
              </div>
            </article>

            <article
              id="responsabilite"
              className="p-7 sm:p-9 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200/70 dark:border-white/10 shadow-sm scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2.5 py-1 rounded-lg bg-brand-600/10 text-brand-600 dark:text-brand-400 text-xs font-bold">
                  06
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-950 dark:text-white">
                  Limitation de Responsabilité &amp; Liens Externes
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Bien que l&apos;ADL veille scrupuleusement à l&apos;exactitude et à la mise à jour des informations publiées (projets, chiffres d&apos;impact, rapports), des erreurs ou omissions ponctuelles peuvent survenir. Les liens hypertextes vers des sites tiers (partenaires, réseaux sociaux, cartes) sont fournis à titre informatif ; l&apos;ADL n&apos;exerce aucun contrôle sur leur contenu ni sur leurs politiques de sécurité.
              </p>
            </article>

            <article
              id="droit-applicable"
              className="p-7 sm:p-9 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200/70 dark:border-white/10 shadow-sm scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2.5 py-1 rounded-lg bg-brand-600/10 text-brand-600 dark:text-brand-400 text-xs font-bold">
                  07
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-950 dark:text-white">
                  Droit Applicable &amp; Contact
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
                Les présentes conditions d&apos;utilisation sont régies par la législation tunisienne en vigueur. Pour toute question, signalement ou demande de précision, vous pouvez nous écrire via notre page de contact ou directement à <a href="mailto:contact@adl-kairouan.tn" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">contact@adl-kairouan.tn</a>.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/privacy"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-brand-600 hover:text-white transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Politique de Confidentialité
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
