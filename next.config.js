const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // Legacy nomenclature, still crawled by Google. The destinations
      // were unprefixed, so a clean 308 landed on a URL that only the
      // middleware's rescue redirect could resolve — a second hop, and
      // before S1 a hop into the internal :3012 origin. Prefixing with
      // ROOT_LOCALE ('en', the locale "/" itself redirects to) makes
      // these single-hop again.
      {
        source: '/discoveries',
        destination: '/en/briefs',
        permanent: true,
      },
      {
        source: '/discoveries/:slug*',
        destination: '/en/briefs/:slug*',
        permanent: true,
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
