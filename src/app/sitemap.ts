import type { MetadataRoute } from 'next';
import { getAllBriefs } from '@/lib/briefs';
import { SITE_URL } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();
  const briefs = getAllBriefs();

  const briefUrls: MetadataRoute.Sitemap = briefs.map((b) => ({
    url: `${SITE_URL}/discoveries/${b.brief_id}`,
    lastModified: b.generated_at || now,
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
      url: `${SITE_URL}/discoveries`,
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
      url: `${SITE_URL}/stats`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.4,
    },
    ...briefUrls,
  ];
}
