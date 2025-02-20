import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { headers } from "next/headers";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Compliance Guardian",
  description: "Simplified compliance management system",
};

function shouldHideSidebar() {
  const headersList = headers();
  const pathname = headersList.get("x-pathname") || "";
  return pathname === "/" || pathname.startsWith("/auth");
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hideSidebar = shouldHideSidebar();

  return (
    <html lang="en">
      <body className={`${geist.variable} font-sans bg-white`}>
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
