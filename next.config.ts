import type { NextConfig } from "next";

// GitHub Pages deploy settings
// Repo: https://github.com/Rio2Ryo/prd-to-kanban-generator
const isProd = process.env.NODE_ENV === "production";
const repo = "prd-to-kanban-generator";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // For GitHub Pages (served under /<repo>/)
  basePath: isProd ? `/${repo}` : "",
  assetPrefix: isProd ? `/${repo}/` : "",
  trailingSlash: true,
};

export default nextConfig;
