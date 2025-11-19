import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/pokedex",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
