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
  const t = await getTranslations({ locale, namespace: 'aboutPage' });
  const title = t('metaTitle');
  const desc = t('metaDescription');
  return {
    title,
    description: desc,
    alternates: localeAlternates(locale, '/about'),
    openGraph: {
      title: `${title} — SPORE`,
      description: desc,
      url: `${SITE_URL}/${locale}/about`,
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

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'aboutPage' });

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <header className="mb-12">
        <span className="mb-4 inline-block text-xs uppercase tracking-[0.3em] text-emerald-glow">
          {t('kicker')}
        </span>
        <h1 className="font-display text-4xl leading-tight text-mist-100 md:text-6xl">
          {t('title')}
        </h1>
      </header>

      <Section title={t('section1_title')}>
        <P>
          {t('section1_p1_before')}
          <Strong>{t('section1_p1_lead')}</Strong>
          {t('section1_p1_after')}
        </P>
        <P>{t('section1_p2')}</P>
        <P>{t('section1_p3')}</P>
        <ul className="mt-6 space-y-2 text-sm text-mist-300">
          <li>
            <Strong>{t('section1_contact_label')}</Strong> :{' '}
            <A href="mailto:benoit@spore-research.com">
              benoit@spore-research.com
            </A>
          </li>
          <li>
            <Strong>{t('section1_source_label')}</Strong> :{' '}
            <A
              href="https://github.com/benoitbds/spore-web"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/benoitbds/spore-web
            </A>
          </li>
          <li>
            <Strong>{t('section1_legal_label')}</Strong> :{' '}
            {t('section1_legal_value')}
          </li>
        </ul>
      </Section>

      <Section title={t('section2_title')}>
        <P>{t('section2_p1')}</P>
        <P>
          {t('section2_p2_before')}
          <em>{t('section2_p2_em')}</em>
          {t('section2_p2_after')}
        </P>
      </Section>

      <Section title={t('section3_title')}>
        <P>{t('section3_intro')}</P>
        <ol className="mb-6 space-y-3 text-mist-300">
          <Step n={1}>{t('section3_step1')}</Step>
          <Step n={2}>{t('section3_step2')}</Step>
          <Step n={3}>{t('section3_step3')}</Step>
          <Step n={4}>{t('section3_step4')}</Step>
          <Step n={5}>{t('section3_step5')}</Step>
        </ol>
        <P>
          {t('section3_outro_before')}
          <Link
            href="/stats"
            className="text-emerald-glow underline-offset-2 hover:underline"
          >
            {t('section3_outro_link')}
          </Link>
          {t('section3_outro_after')}
        </P>
      </Section>

      <Section title={t('section4_title')}>
        <ul className="space-y-4 text-mist-300">
          <Bullet>
            <Strong>{t('section4_b1_strong')}</Strong>
            {t('section4_b1_after')}
          </Bullet>
          <Bullet>
            <Strong>{t('section4_b2_strong')}</Strong>
            {t('section4_b2_after')}
          </Bullet>
          <Bullet>
            <Strong>{t('section4_b3_strong')}</Strong>
            {t('section4_b3_after')}
          </Bullet>
          <Bullet>
            <Strong>{t('section4_b4_strong')}</Strong>
            {t('section4_b4_after')}
          </Bullet>
        </ul>
      </Section>

      <Section title={t('section5_title')}>
        <P>
          {t('section5_p1_a')}
          <em>{t('section5_p1_em1')}</em>
          {t('section5_p1_b')}
          <em>{t('section5_p1_em2')}</em>
          {t('section5_p1_c')}
        </P>
        <P>{t('section5_p2')}</P>
      </Section>

      <Section title={t('section6_title')}>
        <P>{t('section6_intro')}</P>
        <ul className="mb-6 space-y-3 text-mist-300">
          <Bullet>
            <Strong>{t('section6_b1_strong')}</Strong>
            {t('section6_b1_after')}
          </Bullet>
          <Bullet>
            <Strong>{t('section6_b2_strong')}</Strong>
            {t('section6_b2_after')}
          </Bullet>
          <Bullet>
            <Strong>{t('section6_b3_strong')}</Strong>
            {t('section6_b3_after')}
          </Bullet>
          <Bullet>
            <Strong>{t('section6_b4_strong')}</Strong>
            {t('section6_b4_middle')}
            <Link
              href="/anthology"
              className="text-emerald-glow underline-offset-2 hover:underline"
            >
              {t('section6_b4_link')}
            </Link>
            {t('section6_b4_after')}
          </Bullet>
        </ul>
        <P>
          {t('section6_outro_before')}
          <A href="mailto:benoit@spore-research.com">
            benoit@spore-research.com
          </A>
          {t('section6_outro_after')}
        </P>
      </Section>

      <Section title={t('section7_title')}>
        <blockquote className="my-6 border-l-2 border-emerald-bio/60 pl-6 font-display text-xl italic text-mist-100 md:text-2xl">
          {t('section7_quote')}
        </blockquote>
        <P>{t('section7_p1')}</P>
      </Section>

      <hr className="my-12 border-ink-500/50" />
      <p className="text-xs italic text-mist-500">{t('footer')}</p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <h2 className="mb-5 font-display text-2xl text-mist-100 md:text-3xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-mist-300 leading-relaxed">{children}</p>;
}

function Strong({ children }: { children: React.ReactNode }) {
  return <strong className="font-medium text-mist-100">{children}</strong>;
}

function A({
  href,
  target,
  rel,
  children,
}: {
  href: string;
  target?: string;
  rel?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className="text-emerald-glow underline-offset-2 hover:underline"
    >
      {children}
    </a>
  );
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

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3 leading-relaxed">
      <span
        aria-hidden
        className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-bio/40 bg-emerald-bio/10 font-mono text-xs text-emerald-glow"
      >
        {n}
      </span>
      <span>{children}</span>
    </li>
  );
}
