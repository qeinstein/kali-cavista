import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: false,
  transpilePackages: ["three", "@react-three/fiber"],
};

export default nextConfig;
