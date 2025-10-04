/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false, // Enable image optimization
  },
  experimental: {
    scrollRestoration: true, // Improve page navigation performance
  },
  compress: true, // Enable compression
  poweredByHeader: false, // Remove unnecessary header
  reactStrictMode: true,
  swcMinify: true, // Use SWC for minification (faster than Terser)
}

export default nextConfig
