import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
  // Disable image optimization since we're not using next/image
  images: {
    unoptimized: true,
  },
  // Configure webpack for Three.js
  webpack: (config) => {
    // Add support for .glb, .gltf files if needed
    config.module.rules.push({
      test: /\.(glb|gltf)$/i,
      type: 'asset/resource',
    });
    return config;
  },
};

export default nextConfig;