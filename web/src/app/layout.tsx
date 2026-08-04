import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

const googleSans = localFont({
  src: "../../public/Google_Sans/GoogleSans-VariableFont_GRAD,opsz,wght.ttf",
  variable: "--font-google-sans",
  weight: "400 900",
  style: "normal",
  display: "swap",
  preload: true,
  fallback: ["Arial", "sans-serif"],
});

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
    <html lang="vi" className={googleSans.variable}>
      <body className={`${googleSans.className} bg-slate-50 text-slate-800 antialiased selection:bg-navy-200 selection:text-navy-900 min-h-screen`}>
        <Providers>
          <TooltipProvider>
            <SidebarProvider>
              <AppSidebar />
              <div className="flex flex-col flex-1 min-w-0">
                <TopBar />
                <main className="flex-1 w-full px-4 md:px-6 py-6 pb-12">
                  {children}
                </main>
              </div>
            </SidebarProvider>
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
