import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";
import ClientLayout from "@/components/ClientLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Compliance Guardian",
  description: "AI-powered compliance monitoring and management",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icon-192x192.png"
  },
};

// Separate viewport export as recommended by Next.js 14+
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
          <ClientLayout>
            <div className="flex">
              <Sidebar />
              <main className="flex-1">{children}</main>
            </div>
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
