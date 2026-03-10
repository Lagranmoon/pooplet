import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { Nav } from "@/components/nav";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "💩 便便记录",
  description: "简单易用的便便记录应用，帮助追踪健康",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#8B5A2B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-background antialiased">
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 items-center px-4">
                <Link href="/" className="flex items-center gap-2 group">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-sm group-hover:shadow-md transition-shadow">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-lg bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent">便便记录 💩</span>
                </Link>
                <Nav />
              </div>
            </header>
            <main className="flex-1 container py-4 px-4">
              {children}
            </main>
            <footer className="border-t py-4">
              <div className="container px-4 text-center text-sm text-muted-foreground">
                💩 便便记录 - 简单记录，健康生活
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
