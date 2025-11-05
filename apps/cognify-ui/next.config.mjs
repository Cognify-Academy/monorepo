import createMDX from "@next/mdx";

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Enable strict type checking
    ignoreBuildErrors: false,
  },
  eslint: {
    // Enable ESLint checking
    ignoreDuringBuilds: false,
  },
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        port: "",
        pathname: "/7.x/**",
      },
      {
        protocol: "https",
        hostname: "assets.tailwindcss.com",
        port: "",
        pathname: "/templates/compass/**",
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  webpack: (config, { isServer, webpack }) => {
    // Ignore pino-pretty (optional dependency) on both server and client
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^pino-pretty$/,
      }),
    );

    // Also set fallback for client-side bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "pino-pretty": false,
      };
    }

    return config;
  },
};

export default withMDX(nextConfig);
