import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { headers } from "next/headers";
import cn from "classnames";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  fallback: ['system-ui', 'arial']
});

export const metadata: Metadata = {
  title: "Compliance Guardian",
  description: "Simplified compliance management system",
};

async function shouldHideSidebar() {
  const headersList = await headers();
  const pathname = headersList.get("x-invoke-path") || "";
  return pathname === "/" || pathname.startsWith("/auth") || pathname === "/signup" || pathname === "/login";
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hideSidebar = await shouldHideSidebar();

  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={cn(
        inter.className,
        "min-h-screen bg-background antialiased",
      )}>
        <Providers>
          <div className={cn(
            "min-h-screen flex",
            hideSidebar && "block"
          )}>
            {!hideSidebar && <Sidebar />}
            <main className="flex-1 h-full">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
