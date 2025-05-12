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
  eslint: {
    ignoreDuringBuilds: true
  },
  async redirects() {
    return [
      { source: '/login', destination: '/auth/login', permanent: false },
      { source: '/signup', destination: '/auth/signup', permanent: false },
      { source: '/verify-email', destination: '/auth/verify-email', permanent: false }
    ];
  },
  // Port is configured via package.json scripts or environment variables,
  // not through devServer which is not a valid Next.js config option
};

module.exports = nextConfig;
