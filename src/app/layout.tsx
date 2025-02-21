import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "sonner";
import Sidebar from "@/components/Sidebar";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  adjustFontFallback: true,
  fallback: ['system-ui', 'arial'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Compliance Guardian",
  description: "AI-powered compliance monitoring and management",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
  themeColor: "#ffffff",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        inter.variable,
        "min-h-screen bg-background antialiased",
      )} suppressHydrationWarning>
        <Providers>
          <AuthProvider>
            <Toaster position="top-right" />
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 md:pl-64">
                {children}
              </main>
            </div>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
