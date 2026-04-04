import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'unpkg.com',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      // Cloudflare R2 public bucket — replace with your actual R2 public domain
      // e.g. pub-xxxxxxxx.r2.dev  OR  your custom domain like tours.yourdomain.com
      // {
      //   protocol: 'https',
      //   hostname: 'REPLACE_WITH_R2_HOSTNAME',
      // },
    ],
  },
}

export default nextConfig
