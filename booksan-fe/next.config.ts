import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration (stable in Next.js 15)
  turbopack: {
    // Turbopack is now stable, no experimental flag needed
  },
  
  // Server external packages
  serverExternalPackages: ['@prisma/client'],
  
  // Image optimization
  images: {
    domains: ['localhost', 'ui-avatars.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Compiler options
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Bundle analysis (enable with ANALYZE=true)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config: any, { isServer }: { isServer: boolean }) => {
      if (!isServer) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: './analyze/client.html',
          })
        )
      }
      return config
    },
  }),
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
