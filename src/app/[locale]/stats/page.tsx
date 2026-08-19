import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getStats, getAllBriefs } from '@/lib/db';
import { localeAlternates, localeUrl } from '@/lib/i18n-seo';
import StatsClient from './StatsClient';

// Static metadata can't see the locale, so this page used to declare
// canonical /stats from both /fr/stats and /en/stats — an URL that only
// exists as a middleware rescue redirect (S1/F02) — and served the
// French title and description on /en/stats (S2/F03). generateMetadata
// gets params, hence the locale, hence both fixes.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'stats' });
  const title = t('metaTitle');
  const description = t('metaDescription');
  return {
    title,
    description,
    alternates: localeAlternates(locale, '/stats'),
    openGraph: {
      title: `${title} | SPORE`,
      description,
      url: localeUrl(locale, '/stats'),
      type: 'website',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | SPORE`,
      description,
    },
  };
}

function build30DayRange(): string[] {
  const out: string[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export default function StatsPage() {
  const stats = getStats();
  const briefs = getAllBriefs();

  if (!stats) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl text-mist-100">Statistiques</h1>
        <p className="mt-6 text-mist-400">
          Aucune statistique disponible pour le moment.
        </p>
      </div>
    );
  }

  return (
    <StatsClient
      stats={stats}
      briefCount={briefs.length}
      last30={build30DayRange()}
    />
  );
}
