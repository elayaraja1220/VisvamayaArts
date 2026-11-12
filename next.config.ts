import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static website in the `out` folder, for Hostinger Single Web Hosting
  // (no Node.js). Upload the contents of `out` to public_html.
  output: "export",
  //basePath: "/demo",       // all routes become /demo/...
  // assetPrefix: "/demo/",   // JS/CSS/images load from /demo/_next/...
  // Generate routes like /about/index.html.
  trailingSlash: true,

  images: {
    unoptimized: true,
  },

  allowedDevOrigins: ["192.168.1.3"],

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
