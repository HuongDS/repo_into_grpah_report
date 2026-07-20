import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { SettingsProvider } from "@/components/SettingsProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], display: 'swap' });

export const metadata: Metadata = {
  title: "Repo Into Graph | System Reports",
  description: "Dashboard for scientific validation reports, question evaluations and solutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} bg-slate-50 text-slate-800 antialiased selection:bg-navy-200 selection:text-navy-900 min-h-screen flex flex-col`}>
        <Providers>
          <SettingsProvider>
            <Navbar />
            <main className="flex-1 w-full px-2 md:px-4 pb-12">
              {children}
            </main>
            <Footer />
          </SettingsProvider>
        </Providers>
      </body>
    </html>
  );
}
