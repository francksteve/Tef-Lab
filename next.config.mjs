/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Les warnings <img> ne bloquent pas le build en production
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Prisma driver adapters doivent rester côté serveur Node.js (Next.js 14)
    serverComponentsExternalPackages: ['@prisma/adapter-pg', 'pg', 'sharp'],
  },
};

export default nextConfig;
