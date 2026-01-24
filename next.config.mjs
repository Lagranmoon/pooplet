/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    optimizeCss: true,
  },
  images: {
    remotePatterns: [],
  },
  // Explicitly disable Turbopack for Next.js 16
  turbopack: false,
};

export default nextConfig;
