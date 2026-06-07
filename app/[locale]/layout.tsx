import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import "../globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider, themeInitScript } from "@/components/ThemeProvider";
import ChatBubble from "@/components/ChatBubble";
import { locales, type Locale } from "@/i18n/request";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "iLovePDF Clone — Every PDF tool you need in one place",
  description:
    "Merge, split, compress, rotate, convert, watermark, protect and unlock PDF files — fast, free, and easy to use.",
  manifest: "/manifest.webmanifest",
  applicationName: "iLovePDF Clone",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "iLovePDF",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F9FAFB" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1220" },
  ],
  width: "device-width",
  initialScale: 1,
};

/** Tell Next.js which locale params to pre-render statically. */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  if (!locales.includes(locale as Locale)) notFound();

  // Required for next-intl to work with static rendering.
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Set theme class before React mounts to avoid a light-mode flash
            on dark-mode visitors. */}
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="min-h-screen bg-canvas text-ink antialiased dark:bg-canvas-dark dark:text-ink-dark">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <Navbar />
            <main>{children}</main>
            <ChatBubble />
            <footer className="border-t border-gray-200 bg-white py-8 dark:border-gray-800 dark:bg-surface-dark">
              <div className="mx-auto max-w-6xl px-4 text-center text-sm text-gray-500 dark:text-gray-400">
                <p>
                  Built with Next.js 14, pdf-lib, pdfjs-dist and
                  @pdfsmaller/pdf-encrypt. For demonstration only — files are
                  processed in-memory and never stored.
                </p>
              </div>
            </footer>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
