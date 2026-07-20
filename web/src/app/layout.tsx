import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";

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
      <body className={`${inter.className} bg-slate-50 text-slate-800 antialiased selection:bg-blue-200 selection:text-blue-900 min-h-screen flex flex-col`}>
        <Providers>
          <Navbar />
          {/* Main content with top padding to account for the floating navbar */}
          <main className="flex-1 w-full px-4 pt-28 pb-12">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
