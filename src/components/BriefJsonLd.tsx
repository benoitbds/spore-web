import type { Brief } from '@/lib/types';
import { SITE_URL, SITE_NAME, briefMetaTitle, briefOgDescription, toIsoUtc } from '@/lib/seo';
import { isTechnicalVerdict, verdictLabel } from '@/lib/verdicts';

interface Props {
  brief: Brief;
}

/**
 * Schema.org Article payload for a brief. Renders a
 * `<script type="application/ld+json">` tag. Server-component safe
 * (no hooks, no client-only APIs).
 */
export default function BriefJsonLd({ brief }: Props) {
  const url = `${SITE_URL}/briefs/${brief.brief_id}`;
  const headline = briefMetaTitle(brief);
  const description = briefOgDescription(brief);
  const datePublished = brief.generated_at;

  const about = (brief.domains || [])
    .filter(Boolean)
    .map((name) => ({ '@type': 'Thing', name }));

  // Keywords must never leak raw pipeline tokens (e.g. `publish_brief`)
  // into SEO metadata. Translate known verdicts to their French labels
  // and drop anything we don't recognise.
  const verdictKeywords = [
    brief.grounding?.novelty_assessment?.verdict,
    brief.panel?.meta_review?.verdict,
  ]
    .filter((v): v is string => typeof v === 'string' && v.length > 0)
    .filter(isTechnicalVerdict)
    .map(verdictLabel);

  const keywords = [...brief.domains, ...verdictKeywords].filter(Boolean);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    name: headline,
    alternativeHeadline: brief.sharpened.title,
    description,
    datePublished: toIsoUtc(datePublished),
    dateModified: toIsoUtc(datePublished),
    inLanguage: ['fr-FR', 'en'],
    url,
    mainEntityOfPage: url,
    identifier: brief.brief_id,
    isAccessibleForFree: true,
    image: `${SITE_URL}/og-default.png`,
    author: {
      '@type': 'SoftwareApplication',
      name: SITE_NAME,
      applicationCategory: 'ResearchApplication',
      operatingSystem: 'Web',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    about,
    keywords: keywords.join(', '),
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify handles escaping safely; dangerouslySetInnerHTML
      // is the Next.js-recommended way to inject structured data.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
