import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Remove basePath for local development
  // For GitHub Pages, use: basePath: "/pokedex"
  basePath: "/pokedex",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
