/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  webpack: (config, { isServer }) => {
    // Enable SQLite support
    if (isServer) {
      config.externals.push('better-sqlite3');
    }

    return config;
  },
  
  // Disable static optimization for API routes that use workers
  experimental: {
    serverComponentsExternalPackages: ['tesseract.js'],
  },
};

module.exports = nextConfig;

