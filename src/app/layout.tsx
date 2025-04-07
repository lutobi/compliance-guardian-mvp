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
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
  icons: {
    icon: "/icon.png",
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
          <ClientLayout>
            <div className="min-h-screen">
              <Sidebar />
              <main className="ml-0 md:ml-64 min-h-screen transition-all duration-200 ease-in-out p-8 md:p-12">
                {children}
              </main>
            </div>
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
