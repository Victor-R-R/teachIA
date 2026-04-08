import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.VERCEL && {
    adapterPath: require.resolve("@vercel/next/dist/adapter"),
  }),
};

export default nextConfig;
