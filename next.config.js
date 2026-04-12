/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Briefs live outside src/, so we need to allow them as static data
  experimental: {
    // none needed
  },
};

module.exports = nextConfig;
