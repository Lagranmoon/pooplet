/**
 * 根布局组件
 *
 * 应用的全局布局，包含 HTML 结构、字体配置和元数据
 * 所有页面共享的基础布局
 *
 * @path /app/layout.tsx
 * @author Auto-generated
 */
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pooplet - 健康记录",
  description: "记录排便健康趋势",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
