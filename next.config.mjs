import path from "path";
import { fileURLToPath } from "url";

/** @type {import('next').NextConfig} */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const nextConfig = {
  turbopack: {
    root: projectRoot,
  },
  outputFileTracingIncludes: {
    "/docs/[slug]": ["./src/markdown/docs/**"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
