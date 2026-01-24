/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    optimizeCss: true,
  },
  images: {
    remotePatterns: [],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if your ESLint rules have errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
