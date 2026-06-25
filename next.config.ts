import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure credential CSV/PDF files ship with the serverless function on Vercel.
  outputFileTracingIncludes: {
    "/**": ["./certificated-developers/**"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
};

export default nextConfig;
