import type { Brief } from '@/lib/types';
import { SITE_URL, SITE_NAME, briefMetaTitle, briefOgDescription } from '@/lib/seo';

interface Props {
  brief: Brief;
}

/**
 * Schema.org ScholarlyArticle payload for a brief. Renders a
 * `<script type="application/ld+json">` tag. Server-component safe
 * (no hooks, no client-only APIs).
 */
export default function BriefJsonLd({ brief }: Props) {
  const url = `${SITE_URL}/discoveries/${brief.brief_id}`;
  const headline = briefMetaTitle(brief);
  const description = briefOgDescription(brief);
  const datePublished = brief.generated_at;

  const about = (brief.domains || [])
    .filter(Boolean)
    .map((name) => ({ '@type': 'Thing', name }));

  const keywords = [
    ...brief.domains,
    brief.grounding?.novelty_assessment?.verdict,
    brief.panel?.meta_review?.verdict,
  ].filter(Boolean);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline,
    name: headline,
    alternativeHeadline: brief.sharpened.title,
    description,
    datePublished,
    dateModified: datePublished,
    inLanguage: ['fr-FR', 'en'],
    url,
    mainEntityOfPage: url,
    identifier: brief.brief_id,
    isAccessibleForFree: true,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
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
