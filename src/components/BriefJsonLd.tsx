import type { Brief } from '@/lib/types';
import { SITE_URL, SITE_NAME, briefMetaTitle, briefOgDescription, toIsoUtc } from '@/lib/seo';
import { localeUrl } from '@/lib/i18n-seo';

interface Props {
  brief: Brief;
  /** Locale of the page embedding this payload. Required: without it the
   * Article url can't match the page's own canonical, which is what F08
   * was — /fr/briefs/X and /en/briefs/X both claimed to be
   * /briefs/{id}, a URL that doesn't exist. */
  locale: string;
  /** Locale-translated verdict labels to embed in the keywords array.
   * Computed by the parent page via getTranslations so the JSON-LD blob
   * carries the active-locale labels into SEO. */
  verdictKeywords?: ReadonlyArray<string>;
}

/**
 * Schema.org Article payload for a brief. Renders a
 * `<script type="application/ld+json">` tag. Server-component safe
 * (no hooks, no client-only APIs).
 */
export default function BriefJsonLd({ brief, locale, verdictKeywords = [] }: Props) {
  // Same helper the page's canonical goes through (localeAlternates also
  // calls localePath), so url / mainEntityOfPage and <link rel=canonical>
  // resolve to the same string by construction.
  const url = localeUrl(locale, `/briefs/${brief.brief_id}`);
  // S2/F03: both helpers take the locale and prefer vulgarization_en on
  // EN pages. Called bare, they defaulted to 'fr' and put French prose
  // in the structured data of every /en/briefs/... page.
  const headline = briefMetaTitle(brief, locale);
  const description = briefOgDescription(brief, locale);
  const datePublished = brief.generated_at;

  const about = (brief.domains || [])
    .filter(Boolean)
    .map((name) => ({ '@type': 'Thing', name }));

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
    // One language per page, not both: this payload describes the page
    // it sits on, and headline/description above are now in that one.
    inLanguage: locale === 'fr' ? 'fr-FR' : 'en',
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
