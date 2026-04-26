/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/discoveries',
        destination: '/briefs',
        permanent: true,
      },
      {
        source: '/discoveries/:slug*',
        destination: '/briefs/:slug*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
