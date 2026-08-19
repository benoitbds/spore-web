import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { SITE_URL } from '@/lib/seo';
import { localeAlternates } from '@/lib/i18n-seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'methodologyPage' });
  const title = t('metaTitle');
  const desc = t('metaDescription');
  return {
    title,
    description: desc,
    alternates: localeAlternates(locale, '/methodology'),
    openGraph: {
      title: `${title} — SPORE`,
      description: desc,
      url: `${SITE_URL}/${locale}/methodology`,
      type: 'article',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      images: [
        {
          url: '/og-default.png',
          width: 1200,
          height: 630,
          alt: 'SPORE',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — SPORE`,
      description: desc,
      images: ['/og-default.png'],
    },
  };
}

export default async function MethodologyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'methodologyPage' });

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <header className="mb-12">
        <span className="mb-4 inline-block text-xs uppercase tracking-[0.3em] text-emerald-glow">
          {t('kicker')}
        </span>
        <h1 className="font-display text-4xl leading-tight text-mist-100 md:text-6xl">
          {t('title')}
        </h1>
        <p className="mt-6 text-mist-300 leading-relaxed">{t('intro')}</p>
      </header>

      <Section id="novelty" title={t('noveltyTitle')}>
        <Field label={t('novelty_what_label')}>{t('novelty_what_text')}</Field>
        <Field label={t('novelty_how_label')}>
          {t('novelty_how_textBefore')}
          <em>{t('novelty_how_quote')}</em>
          {t('novelty_how_textAfter')}
          <span className="font-mono text-xs text-mist-400">
            {t('novelty_how_verdicts')}
          </span>
          {t('novelty_how_period')}
        </Field>
        <Field label={t('novelty_not_label')}>{t('novelty_not_text')}</Field>
        <div className="mt-4 rounded-xl border border-amber-bio/30 bg-amber-bio/5 p-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-amber-glow">
            {t('novelty_limits_title')}
          </p>
          <ul className="space-y-2 text-sm text-mist-300">
            <Bullet>{t('novelty_limit1')}</Bullet>
            <Bullet>{t('novelty_limit2')}</Bullet>
            <Bullet>{t('novelty_limit3')}</Bullet>
            <Bullet>{t('novelty_limit4')}</Bullet>
          </ul>
        </div>
        <Field label={t('novelty_read_label')}>
          {t('novelty_read_textBefore')}
          <em>{t('novelty_read_em')}</em>
          {t('novelty_read_textAfter')}
        </Field>
        <Field label={t('novelty_planned_label')}>
          {t('novelty_planned_textBefore')}
          <span className="font-mono text-xs">{t('novelty_planned_code')}</span>
          {t('novelty_planned_textAfter')}
        </Field>
      </Section>

      <Section id="panel" title={t('panelTitle')}>
        <Field label={t('panel_what_label')}>{t('panel_what_text')}</Field>
        <Field label={t('panel_how_label')}>
          {t('panel_how_textBefore')}
          <span className="font-mono text-xs text-mist-400">
            {t('panel_how_verdicts')}
          </span>
          {t('panel_how_textAfter')}
          <span className="font-mono text-xs">{t('panel_how_code')}</span>
          {t('panel_how_textEnd')}
        </Field>
        <div className="mt-4 rounded-xl border border-cyan-bio/30 bg-cyan-bio/5 p-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-cyan-glow">
            {t('panel_meta_title')}
          </p>
          <ul className="space-y-2 text-sm text-mist-300">
            <Bullet>
              {t('panel_meta_rule1Pre')}
              <span className="font-mono text-xs">{t('panel_meta_rule1Code1')}</span>
              {t('panel_meta_rule1Mid')}
              <span className="font-mono text-xs text-emerald-glow">
                {t('panel_meta_rule1Result')}
              </span>
            </Bullet>
            <Bullet>
              {t('panel_meta_rule2Pre')}
              <span className="font-mono text-xs">{t('panel_meta_rule2Code')}</span>
              {t('panel_meta_rule2Mid')}
              <span className="font-mono text-xs text-amber-glow">
                {t('panel_meta_rule2Result')}
              </span>
              {t('panel_meta_rule2Suffix')}
            </Bullet>
            <Bullet>
              {t('panel_meta_rule3Pre')}
              <span className="font-mono text-xs">{t('panel_meta_rule3Code')}</span>
              {t('panel_meta_rule3Mid')}
              <span className="font-mono text-xs text-mist-400">
                {t('panel_meta_rule3Result')}
              </span>
            </Bullet>
          </ul>
        </div>
        <Field label={t('panel_not_label')}>{t('panel_not_text')}</Field>
      </Section>

      <Section id="kill-rate" title={t('killRateTitle')}>
        <Field label={t('killRate_what_label')}>{t('killRate_what_text')}</Field>
        <Field label={t('killRate_how_label')}>
          {t('killRate_how_textBefore')}
          <Link
            href="/stats"
            className="text-emerald-glow underline-offset-2 hover:underline"
          >
            {t('killRate_how_link')}
          </Link>
          {t('killRate_how_textAfter')}
        </Field>
        <Field label={t('killRate_why_label')}>{t('killRate_why_text')}</Field>
      </Section>

      <Section id="references" title={t('refsTitle')}>
        <Field label={t('refs_what_label')}>{t('refs_what_text')}</Field>
        <Field label={t('refs_means_label')}>{t('refs_means_text')}</Field>
        <Field label={t('refs_notMeans_label')}>{t('refs_notMeans_text')}</Field>
      </Section>

      <Section id="costs" title={t('costsTitle')}>
        <p className="text-mist-300 leading-relaxed">
          {t('costs_textBefore')}
          <Link
            href="/stats"
            className="text-emerald-glow underline-offset-2 hover:underline"
          >
            {t('costs_link')}
          </Link>
          {t('costs_textAfter')}
          <span className="font-mono text-mist-100">{t('costs_meanCode')}</span>
          {t('costs_textEnd')}
        </p>
      </Section>

      <Section id="stack" title={t('stackTitle')}>
        <ul className="space-y-2 text-mist-300">
          <Bullet>
            <Strong>{t('stack_llm_label')}</Strong>
            {t('stack_llm_value')}
          </Bullet>
          <Bullet>
            <Strong>{t('stack_embeddings_label')}</Strong>
            {t('stack_embeddings_value')}
          </Bullet>
          <Bullet>
            <Strong>{t('stack_biblio_label')}</Strong>
            {t('stack_biblio_value')}
          </Bullet>
          <Bullet>
            <Strong>{t('stack_domains_label')}</Strong>
            {t('stack_domains_value')}
          </Bullet>
          <Bullet>
            <Strong>{t('stack_pipeline_label')}</Strong>
            {t('stack_pipeline_value')}
          </Bullet>
          <Bullet>
            <Strong>{t('stack_frontend_label')}</Strong>
            {t('stack_frontend_value')}
          </Bullet>
        </ul>
      </Section>

      <hr className="my-12 border-ink-500/50" />
      <p className="mb-2 text-sm italic text-mist-400">
        {t('footer1_textBefore')}
        <a
          href="mailto:benoit@spore-research.com"
          className="text-emerald-glow underline-offset-2 hover:underline"
        >
          {t('footer1_email')}
        </a>
        {t('footer1_textAfter')}
      </p>
      <p className="text-xs italic text-mist-500">{t('footer2')}</p>
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-14 scroll-mt-24">
      <h2 className="mb-5 font-display text-2xl text-mist-100 md:text-3xl">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <p className="text-mist-300 leading-relaxed">
      <strong className="font-medium text-mist-100">{label}</strong> :{' '}
      {children}
    </p>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return <strong className="font-medium text-mist-100">{children}</strong>;
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 leading-relaxed">
      <span aria-hidden className="mt-1 select-none text-emerald-glow">
        •
      </span>
      <span>{children}</span>
    </li>
  );
}
