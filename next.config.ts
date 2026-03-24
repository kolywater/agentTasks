import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["bigmac.local", "friday13.local"],
  devIndicators: false,
};

export default nextConfig;
