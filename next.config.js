/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  staticPageGenerationTimeout: 120,
  trailingSlash: false,
  basePath: '',
  assetPrefix: ''
};

module.exports = nextConfig;
