/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force Railway rebuild
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Enable standalone output for Docker
  output: 'standalone',
  
  webpack: (config, { isServer }) => {
    // Enable SQLite support
    if (isServer) {
      config.externals.push('better-sqlite3');
    }

    return config;
  },
  
  // Disable static optimization for API routes that use workers
  experimental: {
    serverComponentsExternalPackages: ['tesseract.js', 'better-sqlite3', 'youtube-transcript'],
  },
};

module.exports = nextConfig;

