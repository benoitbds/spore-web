import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import PipelineAnimation from '@/components/PipelineAnimation';
import { getStats } from '@/lib/db';
import { SITE_URL } from '@/lib/seo';
import { localeAlternates } from '@/lib/i18n-seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'howItWorks' });
  const title = t('metaTitle');
  const desc = t('metaDescription');
  return {
    title,
    description: desc,
    alternates: localeAlternates(locale, '/how-it-works'),
    openGraph: {
      title: `${title} | SPORE`,
      description: desc,
      url: `${SITE_URL}/${locale}/how-it-works`,
      type: 'article',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | SPORE`,
      description: desc,
    },
  };
}

export default async function HowItWorksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'howItWorks' });
  const stats = getStats();
  const totalCollisions = stats?.totals.collisions ?? 0;
  const totalBriefs = stats?.totals.briefs ?? 0;
  const numberLocale = locale === 'fr' ? 'fr-FR' : 'en-US';

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
      <header className="mb-16 text-center md:mb-24">
        <span className="mb-4 inline-block text-xs uppercase tracking-[0.3em] text-emerald-glow">
          {t('kicker')}
        </span>
        <h1 className="font-display text-4xl leading-tight text-mist-100 md:text-6xl">
          {t('title')}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-mist-400">
          {t('subtitle')}
        </p>
      </header>

      <section className="mb-24">
        <PipelineAnimation />
      </section>

      <section className="mb-24 rounded-2xl border border-ink-500 bg-ink-800/40 p-8 md:p-12">
        <h2 className="mb-8 text-center font-display text-2xl text-mist-100 md:text-3xl">
          {t('funnelTitle')}
        </h2>
        <div className="grid gap-6 md:grid-cols-5">
          <FunnelStep number="100" label={t('funnel_collisions')} accent="emerald" />
          <FunnelStep number="30-60" label={t('funnel_pass')} accent="emerald" />
          <FunnelStep number="~20" label={t('funnel_hypotheses')} accent="cyan" />
          <FunnelStep number="~3" label={t('funnel_shortlisted')} accent="cyan" />
          <FunnelStep number="~0.5" label={t('funnel_briefs')} accent="amber" />
        </div>
        <p className="mt-8 text-center text-sm text-mist-400">
          {t('funnelTotalsPrefix')}{' '}
          <span className="font-mono text-emerald-glow">
            {totalCollisions.toLocaleString(numberLocale)}
          </span>{' '}
          {t('funnelTotalsExplored')} {t('funnelTotalsArrow')}{' '}
          <span className="font-mono text-amber-glow">{totalBriefs}</span>{' '}
          {t('funnelTotalsPublished')}
        </p>
      </section>

      <section className="space-y-8">
        <div className="text-center">
          <span className="mb-3 inline-block text-xs uppercase tracking-[0.3em] text-cyan-glow">
            {t('philosophyKicker')}
          </span>
          <h2 className="font-display text-3xl text-mist-100 md:text-5xl">
            {t('philosophyTitle')}
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Principle
            icon="🤝"
            title={t('principle1_title')}
            description={t('principle1_desc')}
          />
          <Principle
            icon="🎯"
            title={t('principle2_title')}
            description={t('principle2_desc')}
          />
          <Principle
            icon="🎭"
            title={t('principle3_title')}
            description={t('principle3_desc')}
          />
        </div>
      </section>

      <section className="mt-24 rounded-2xl border border-ink-500 bg-ink-800/40 p-6 text-sm text-mist-300 md:p-8">
        {t('methodologyPointer_before')}
        <Link
          href="/methodology"
          className="text-emerald-glow underline-offset-2 hover:underline"
        >
          {t('methodologyPointer_link')}
        </Link>
        {t('methodologyPointer_after')}
      </section>

      <section className="mt-12 text-center">
        <p className="mb-6 text-mist-400">{t('ctaPrompt')}</p>
        <Link
          href="/briefs"
          className="inline-flex items-center gap-2 rounded-full border border-emerald-bio/40 bg-emerald-bio/10 px-6 py-3 text-sm font-medium text-emerald-glow transition-all hover:border-emerald-bio/60 hover:bg-emerald-bio/20 hover:shadow-[0_0_40px_rgba(16,185,129,0.25)]"
        >
          {t('ctaButton')}
        </Link>
      </section>
    </div>
  );
}

function FunnelStep({
  number,
  label,
  accent,
}: {
  number: string;
  label: string;
  accent: 'emerald' | 'cyan' | 'amber';
}) {
  const colors = {
    emerald: 'text-emerald-glow',
    cyan: 'text-cyan-glow',
    amber: 'text-amber-glow',
  };
  return (
    <div className="text-center">
      <div className={`font-display text-4xl md:text-5xl ${colors[accent]}`}>
        {number}
      </div>
      <div className="mt-1 text-xs uppercase tracking-widest text-mist-500">
        {label}
      </div>
    </div>
  );
}

function Principle({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-ink-500 bg-ink-800/40 p-6">
      <div className="mb-4 text-4xl">{icon}</div>
      <h3 className="mb-3 font-display text-xl text-mist-100">{title}</h3>
      <p className="text-sm leading-relaxed text-mist-400">{description}</p>
    </div>
  );
}
