import withPWA from 'next-pwa';

const isDev = process.env.NODE_ENV === 'development';

/** @type {import('next').NextConfig} */
const baseConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
  images: {
    domains: [],
  },
};

const pwaConfig = withPWA({
  dest: 'public',
  disable: isDev,
  register: true,
  skipWaiting: true,
});

export default pwaConfig(baseConfig);
