import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/pokedex",
  assetPrefix: "/pokedex",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
