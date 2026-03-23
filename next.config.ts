import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse uses canvas/DOM APIs that can't be polyfilled during build.
  // Marking it as external forces Next.js to load it from node_modules at runtime
  // rather than bundling it — required for the App Router Node.js runtime.
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
