
import type {NextConfig} from 'next';

const { version } = require('./package.json');

const nextConfig: NextConfig = {
  env: {
    APP_VERSION: version,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      }
    ],
  },
};

export default nextConfig;
