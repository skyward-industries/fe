/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/product/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/cage_code/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/catalog/nsn-:nsn',
        destination: '/catalog/',
        permanent: true,
      },
      {
        source: '/cage-code/:path',
        destination: '/',
        permanent: true,
      },
      {
        source: '/cage-code-details/:path',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
