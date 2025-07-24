// next.config.js
import path from 'path'; // Use import instead of require

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // This is the webpack configuration that resolves the '@/` alias.
  webpack: (config) => {
    config.resolve.alias['@'] = path.join(process.cwd(), 'src'); // Use process.cwd() for absolute path
    return config;
  },
  // Ensure images are optimized correctly.
  images: {
    domains: [], // Add domains if you're loading images from external URLs
  },
  async redirects() {
    return [
      {
        source: '/sitemap-index.xml',
        destination: '/sitemap.xml',
        permanent: true,
      },
    ];
  },
  // Add 'experimental' section if you use 'use client' or 'use server'
  // in files outside of 'src/app' or 'src/pages/api'
  experimental: {
    // This is often needed when using 'use client' in components that aren't directly in 'app'
    // or when server components interact with client components.
    // It helps Next.js understand which files might contain client/server directives.
    // If you encounter issues with server/client module boundaries later, this might be a place to look.
    // serverComponentsExternalPackages: ['pg'], // Example for server components using pg
  },
};

export default nextConfig; // Use export default instead of module.exports