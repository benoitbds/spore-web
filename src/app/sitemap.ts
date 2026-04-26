import type { MetadataRoute } from 'next';
import { getAllBriefs } from '@/lib/db';
import { SITE_URL } from '@/lib/seo';

// ISR cadence — Next caches the sitemap response and re-renders it at
// most every 5 min. Plenty fresh for Google to discover newly-published
// briefs without hammering the DB on every crawl.
export const revalidate = 300;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();
  // db.getAllBriefs returns BriefRow with the full visibility filter
  // already applied (status='complete' OR is_stub=1). The map below
  // uses .id (the SPR-XXXX primary key) and .created_at — the only two
  // fields a sitemap entry needs from the row.
  const briefs = getAllBriefs();

  const briefUrls: MetadataRoute.Sitemap = briefs.map((b) => ({
    url: `${SITE_URL}/briefs/${b.id}`,
    lastModified: b.created_at || now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/briefs`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/how-it-works`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/pricing`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/custom`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/stats`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/legal`,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/privacy`,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    ...briefUrls,
  ];
}
