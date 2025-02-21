import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { headers } from "next/headers";

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
  return pathname === "/" || pathname.startsWith("/auth");
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hideSidebar = await shouldHideSidebar();

  return (
    <html lang="en">
      <body className={`${inter.className} bg-white`}>
        {hideSidebar ? (
          children
        ) : (
          <div className="flex h-screen">
            <div className="w-64 flex-shrink-0">
              <Sidebar />
            </div>
            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
