const path = require("path");
/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  // Next's dev-only static indicator throws on every hot reload here:
  // handleStaticIndicator reads window.next.router.components["/_app"], which is
  // undefined because the whole app is a dynamic({ ssr: false }) component. The
  // indicator is a dev overlay badge, nothing in the build depends on it.
  devIndicators: false,
  // Next 16 otherwise writes AGENTS.md and CLAUDE.md into the repo on every
  // `next dev`.
  agentRules: false,
  // antd and its icon set are huge barrel files. This rewrites the named
  // imports to deep paths so only the components we use get bundled.
  experimental: {
    optimizePackageImports: ["antd", "@ant-design/icons"],
  },
  // Lets scss files `@use "styles/utils.scss"` from anywhere. Was a webpack
  // alias, which Turbopack (the default since Next 16) refuses to build with.
  sassOptions: {
    loadPaths: [path.join(__dirname, "src/_shared/ui")],
  },
};

module.exports = nextConfig;
