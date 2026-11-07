import type { Metadata } from "next";
import "@fontsource/cormorant-garamond/latin-400.css";
import "@fontsource/cormorant-garamond/latin-400-italic.css";
import "@fontsource/cormorant-garamond/latin-500.css";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/noto-serif-telugu/telugu-400.css";
import "@fontsource/noto-serif-telugu/telugu-500.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
      "http://localhost:3000",
  ),
  title: "Deepa & Yashovardhan | 20 November 2026",
  description:
    "With the blessings of our families, join Deepa and Yashovardhan for their wedding on Friday, 20 November 2026, in Davangere.",
  openGraph: {
    title: "Deepa & Yashovardhan | A New Beginning",
    description: "20 November 2026 · Davangere · With love, we invite you.",
    images: [{ url: "/photos/KP-20.webp", width: 2000, height: 1333 }],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
