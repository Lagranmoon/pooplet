import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "便便记录 - PoopTracker",
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
        <div className="relative flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center px-4">
              <a href="/" className="flex items-center gap-2">
                <span className="text-2xl">💩</span>
                <span className="font-bold text-lg">PoopTracker</span>
              </a>
              <nav className="ml-auto flex items-center gap-4">
                <a
                  href="/"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  日历
                </a>
                <a
                  href="/stats"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  统计
                </a>
              </nav>
            </div>
          </header>
          <main className="flex-1 container py-4 px-4">
            {children}
          </main>
          <footer className="border-t py-4">
            <div className="container px-4 text-center text-sm text-muted-foreground">
              PoopTracker - 简单记录，健康生活
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
