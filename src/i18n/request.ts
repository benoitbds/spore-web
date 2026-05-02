import { getRequestConfig } from 'next-intl/server';
import { routing, type Locale } from './routing';

/**
 * Runtime config for next-intl Server Components.
 *
 * Loads the message bundle for the resolved locale. Falls back to the
 * default locale (FR) when the request carries an unknown / missing
 * locale segment — this only happens in dev or via direct route access,
 * since the middleware always normalises live traffic to a valid prefix.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
