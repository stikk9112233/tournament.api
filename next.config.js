/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  staticPageGenerationTimeout: 120,
  trailingSlash: false,
  basePath: '',
  assetPrefix: '',
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600',
          },
        ],
      },
    ];
  },
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: 'https://tournamentapi-production-e303.up.railway.app/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
