import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Mock-test diagrams are hosted on Cloudinary. Only this host and path are
    // allowed for remote images.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/ds1wvtjft/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
