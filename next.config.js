/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ✅ Disable ESLint during Vercel builds
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
