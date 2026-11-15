/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  serverExternalPackages: ['node:sqlite'],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
