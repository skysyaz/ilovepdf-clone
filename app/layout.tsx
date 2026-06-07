/**
 * Root layout (minimal). The locale-aware layout lives at
 * `app/[locale]/layout.tsx` and does all the i18n + provider work.
 * This file is required by Next.js App Router conventions.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

export const metadata = {
  title: "iLovePDF Clone",
};
