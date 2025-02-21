/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: ['nrfpsbbkynykubcaarpg.supabase.co'],
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'localhost:3003',
        'localhost:3004',
        'localhost:3005',
        'localhost:3006',
        'localhost:3007',
        'compliance-guardian-fresh.vercel.app',
        'compliance-guardian.netlify.app'
      ]
    }
  }
}

module.exports = nextConfig
