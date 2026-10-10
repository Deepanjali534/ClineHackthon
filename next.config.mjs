/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // sql.js uses wasm - mark as external to avoid bundling issues
      config.externals = config.externals || [];
    }
    // Ignore the old better-sqlite3 if it fails to load
    config.resolve.alias['better-sqlite3'] = false;
    return config;
  },
};

export default nextConfig;
