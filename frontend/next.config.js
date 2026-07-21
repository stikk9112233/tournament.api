/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  sw# 🔴 **Error: File पहले से exist करती है!**

**next.config.js** पहले से repocMinify: true,
  experimental: {
    esmExternals: true,
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
};

module.exports = nextConfig;
