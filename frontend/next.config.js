/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  **next.config.js** repoMinify: true,
  experimental: {
    esmExternals: true,
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
};

module.exports = nextConfig;
