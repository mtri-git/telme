import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      // Only cache this app's own assets/pages; API calls go straight to the network
      urlPattern: ({ sameOrigin, url }) => sameOrigin && !url.pathname.startsWith('/api/'),
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
})(nextConfig);
