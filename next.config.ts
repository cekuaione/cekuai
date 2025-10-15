import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output required for Docker runtime (provides .next/standalone)
  output: "standalone",
};

export default nextConfig;
