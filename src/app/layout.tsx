import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Travel Atlas",
    template: "%s | Travel Atlas",
  },
  description: "Dünyayı Keşfet, Anılarını Paylaş — Seyahat öneri platformu",
  keywords: ["seyahat", "travel", "gezi", "rehber", "guide", "destinasyon"],
  icons: {
    icon: `${process.env.NEXT_PUBLIC_REPO_NAME ? `/${process.env.NEXT_PUBLIC_REPO_NAME}` : ''}/favicon.svg`,
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Travel Atlas",
    title: "Travel Atlas",
    description: "Dünyayı Keşfet, Anılarını Paylaş — Seyahat öneri platformu",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={inter.variable}>
      <body className="min-h-screen bg-dark font-sans text-gray-100 antialiased">
        <LanguageProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-accent-turquoise focus:px-4 focus:py-2 focus:text-dark focus:outline-none"
          >
            Ana içeriğe geç
          </a>
          <Navbar />
          <main id="main-content" className="pt-16">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
