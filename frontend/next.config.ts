import type { NextConfig } from "next";

const nextConfig = {
    output: 'export',
    eslint: {
        ignoreDuringBuilds: true,
      },
};

export default nextConfig;
