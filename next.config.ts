import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from Unsplash and ui-avatars
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },

  // Compile transpile packages that are ESM-only
  transpilePackages: ["motion"],

  // Ensure static export works with dynamic routes if needed
  // output: 'export', // Uncomment only for full static export

  // Experimental features
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
};

export default nextConfig;
