import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

module.exports = {
  typescript: {
    ignoreBuildErrors: true, // Skip TypeScript type validity checks
  },
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint during build
  },
};