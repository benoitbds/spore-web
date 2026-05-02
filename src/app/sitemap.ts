import type { MetadataRoute } from 'next';
import { getAllBriefs } from '@/lib/db';
import { SITE_URL } from '@/lib/seo';

// ISR cadence — Next caches the sitemap response and re-renders it at
// most every 5 min. Plenty fresh for Google to discover newly-published
// briefs without hammering the DB on every crawl.
export const revalidate = 300;

const LOCALES = ['fr', 'en'] as const;
type Locale = (typeof LOCALES)[number];

/** Build the alternates map for a given path; returned as-is for every
 * locale entry of that path so each sitemap row points at every other
 * locale variant via xhtml:link annotations. */
function alternatesFor(path: string): { languages: Record<Locale, string> } {
  return {
    languages: {
      fr: `${SITE_URL}/fr${path}`,
      en: `${SITE_URL}/en${path}`,
    },
  };
}

/** Emit one sitemap entry per locale for a single localised path. */
function bilingualEntries(
  path: string,
  base: Omit<MetadataRoute.Sitemap[number], 'url' | 'alternates'>,
): MetadataRoute.Sitemap {
  return LOCALES.map((locale) => ({
    url: `${SITE_URL}/${locale}${path}`,
    alternates: alternatesFor(path),
    ...base,
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();
  const briefs = getAllBriefs();

  // Static routes — every public localised page on the site. Routes
  // left at the non-localised root in S7.2 (auth/verify, newsletter/*,
  // payment/*, account, anthology/sent, custom/[id]/status) are
  // transactional landings, intentionally noindex; they don't belong
  // in the sitemap regardless of locale.
  const staticRoutes: Array<
    [string, Omit<MetadataRoute.Sitemap[number], 'url' | 'alternates'>]
  > = [
    ['', { lastModified: now, changeFrequency: 'daily', priority: 1 }],
    ['/about', { changeFrequency: 'monthly', priority: 0.6 }],
    ['/methodology', { changeFrequency: 'monthly', priority: 0.6 }],
    ['/how-it-works', { changeFrequency: 'monthly', priority: 0.5 }],
    ['/anthology', { changeFrequency: 'monthly', priority: 0.7 }],
    ['/briefs', { lastModified: now, changeFrequency: 'daily', priority: 0.9 }],
    ['/pricing', { changeFrequency: 'monthly', priority: 0.8 }],
    ['/custom', { changeFrequency: 'monthly', priority: 0.7 }],
    ['/stats', { lastModified: now, changeFrequency: 'weekly', priority: 0.4 }],
    ['/legal', { changeFrequency: 'yearly', priority: 0.2 }],
    ['/privacy', { changeFrequency: 'yearly', priority: 0.2 }],
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.flatMap(
    ([path, base]) => bilingualEntries(path, base),
  );

  // Brief detail pages — one entry per (locale, brief id) pair, each
  // declaring its hreflang siblings via alternates.languages so search
  // engines don't treat /fr/briefs/SPR-X and /en/briefs/SPR-X as
  // duplicate content.
  const briefEntries: MetadataRoute.Sitemap = briefs.flatMap((b) =>
    bilingualEntries(`/briefs/${b.id}`, {
      lastModified: b.created_at || now,
      changeFrequency: 'monthly',
      priority: 0.8,
    }),
  );

  return [...staticEntries, ...briefEntries];
}
