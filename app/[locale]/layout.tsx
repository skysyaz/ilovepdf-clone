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
    { media: "(prefers-color-scheme: light)", color: "#F6F7FB" },
    { media: "(prefers-color-scheme: dark)", color: "#070B16" },
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
  const version = (await import("../../package.json")).version;

  return (
    <html lang={locale} className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Set theme class before React mounts to avoid a light-mode flash. */}
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="text-ink antialiased dark:text-ink-dark">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <div className="app-shell">
              <Navbar />
              <main className="app-main">{children}</main>
              <footer className="glass-soft z-10 flex items-center justify-center gap-3 border-t border-white/10 px-4 py-2 text-[11px] text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400/60" />
                  In-memory · nothing stored
                </span>
                <span className="opacity-40">•</span>
                <span>v{version}</span>
              </footer>
            </div>
            <ChatBubble />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}