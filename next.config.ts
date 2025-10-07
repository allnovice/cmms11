import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: false, // 🔧 disable Lightning CSS for Termux
  },
};

export default nextConfig;
