/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['nrfpsbbkynykubcaarpg.supabase.co'],
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  output: 'standalone',
  poweredByHeader: false,
  generateEtags: false,
  distDir: '.next',
  assetPrefix: ''
}

module.exports = nextConfig
