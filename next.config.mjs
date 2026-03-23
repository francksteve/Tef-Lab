/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Les warnings <img> ne bloquent pas le build en production
    ignoreDuringBuilds: true,
  },
  // Prisma driver adapters nécessitent serverExternalPackages
  serverExternalPackages: ['@prisma/adapter-pg', 'pg'],
};

export default nextConfig;
