import withPWA from 'next-pwa';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Add more Next.js config options here if needed
};

export default withPWA({
  ...nextConfig,
  // PWA configuration goes directly here (not under 'pwa' property)
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^\/(?!api\/auth).*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'http-cache',
        expiration: {
          maxAgeSeconds: 3600,
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        },
      },
    },
  ],
});
