const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // pdfjs-dist ships an ESM build; mark as transpiled to avoid SSR issues.
  transpilePackages: ["pdfjs-dist"],
  // Keep sharp as external so it isn't bundled (it has native binaries).
  serverExternalPackages: ["sharp"],
};

module.exports = withNextIntl(nextConfig);
