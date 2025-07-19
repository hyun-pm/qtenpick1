/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.js\.map$/,
      use: 'ignore-loader',
    });
    return config;
  },
};

module.exports = nextConfig;
