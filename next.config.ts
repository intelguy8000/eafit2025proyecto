import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.eafit.edu.co",
        pathname: "/sites/default/files/**",
      },
    ],
  },
};

export default nextConfig;
