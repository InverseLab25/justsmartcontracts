const path = require("path");
/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  // Next's dev-only static indicator throws on every hot reload here:
  // handleStaticIndicator reads window.next.router.components["/_app"], which is
  // undefined because the whole app is a dynamic({ ssr: false }) component. The
  // indicator is a dev overlay badge, nothing in the build depends on it.
  devIndicators: false,
  // No eslint config in this repo, so don't let `next build` look for one.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // antd and its icon set are huge barrel files. This rewrites the named
  // imports to deep paths so only the components we use get bundled.
  experimental: {
    optimizePackageImports: ["antd", "@ant-design/icons"],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      styles: path.join(__dirname, "src/_shared/ui/styles"),
    };
    return config;
  },
};

module.exports = nextConfig;
