const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // pdfjs-dist ships an ESM build; mark as transpiled to avoid SSR issues.
  transpilePackages: ["pdfjs-dist"],
  // No native deps in the bundle anymore (sharp/canvas removed).
  async headers() {
    // Next.js dev (React Refresh) needs 'unsafe-eval'; only ship the strict
    // policy in production.
    const isProd = process.env.NODE_ENV === "production";
    const scriptSrc = isProd ? "'self' 'unsafe-inline'" : "'self' 'unsafe-inline' 'unsafe-eval'";
    const csp = [
      "default-src 'self'",
      // Inline theme-init script + inline style attributes require these.
      `script-src ${scriptSrc}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      // pdf.js worker is self-hosted; API + worker are same-origin.
      "worker-src 'self' blob:",
      "connect-src 'self'",
      "manifest-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);