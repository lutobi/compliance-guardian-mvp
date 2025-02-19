/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['nrfpsbbkynykubcaarpg.supabase.co'],
  },
  experimental: {
    // Enable required experimental features
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3003', 'localhost:3004', 'localhost:3005', 'localhost:3006', 'localhost:3007']
    }
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
