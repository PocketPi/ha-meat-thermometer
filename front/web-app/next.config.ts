import type { NextConfig } from "next";
import { ESP32_IP } from './esp32-config';

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  // Use export for production builds
  ...(isDev ? {} : { output: 'export' }),
  distDir: 'dist',
  assetPrefix: '',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  experimental: {
    reactCompiler: true,
  },
  // Add rewrites for API proxying to ESP32 in development only
  ...(isDev && {
    async rewrites() {
      return [
        {
          source: '/api/v1/:path*',
          destination: `http://${ESP32_IP}/api/v1/:path*`,
        },
      ];
    },
  }),
};

export default nextConfig;
