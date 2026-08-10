import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // MUI est distribué en ESM/CJS mixte : le transpile évite les warnings de barrel imports.
  transpilePackages: ['@mui/material', '@mui/system'],
};

export default nextConfig;
