import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Les paquets du monorepo sont publiés en TypeScript source, sans étape de build : c'est Next
  // qui les compile, comme le reste de `src`.
  transpilePackages: ['@vitae/core', '@vitae/content'],
};

export default nextConfig;
