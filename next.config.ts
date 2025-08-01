import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip TypeScript checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Skip ESLint checking during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Skip other validations
  experimental: {
    typedRoutes: false,
  },
  
  // Allow external images (for user avatars, etc.)
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.slack-edge.com'],
    unoptimized: true,
  },
  
  // Disable strict mode for faster builds
  reactStrictMode: false,
  
  // Skip build-time optimizations for faster builds
  swcMinify: false,
  
  // Disable static optimization for dynamic pages
  output: 'standalone',
  
  // Skip prerendering for dynamic pages
  trailingSlash: false,
};

export default nextConfig;
