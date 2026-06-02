/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // pdfjs-dist ships an ESM build; mark as transpiled to avoid SSR issues.
  transpilePackages: ["pdfjs-dist"],
  // Keep sharp and node-qpdf2 as external so they aren't bundled.
  serverExternalPackages: ["sharp", "node-qpdf2"],
  // OpenNext for Cloudflare requires edge runtime for API routes.
  // Routes that need node-specific features (qpdf, canvas) will
  // be handled via the compatibility layer.
};

module.exports = nextConfig;
