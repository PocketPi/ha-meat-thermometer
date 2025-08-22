import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'dist', // Changes the build output directory to `build`
  assetPrefix: '',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
