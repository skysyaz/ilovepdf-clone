import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "iLovePDF Clone — Every PDF tool you need in one place",
  description:
    "Merge, split, compress, rotate, convert, watermark, protect and unlock PDF files — fast, free, and easy to use.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-canvas text-ink antialiased">
        <Navbar />
        <main>{children}</main>
        <footer className="border-t border-gray-200 bg-white py-8">
          <div className="mx-auto max-w-6xl px-4 text-center text-sm text-gray-500">
            <p>
              Built with Next.js 14, pdf-lib, pdfjs-dist and node-qpdf2. For
              demonstration only — files are processed in-memory and never
              stored.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
