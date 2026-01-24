"use client";

import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/auth-client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = authClient.useSession();
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "记录", icon: "📝" },
    { href: "/dashboard/records", label: "所有记录", icon: "📋" },
    { href: "/dashboard/stats", label: "统计", icon: "📊" },
  ];

  const handleSignOut = async () => {
    await signOut();
    redirect("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30">
      <nav className="bg-white/90 backdrop-blur-md shadow-lg border-b border-slate-200/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">💩</div>
              <Link
                href="/"
                className="text-xl font-bold text-slate-900 hover:text-emerald-600 transition-colors"
              >
                Pooplet
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 ${
                      pathname === item.href
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md"
                        : "bg-white/50 text-slate-700 hover:bg-emerald-50"
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
              {session && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600 hidden sm:flex">
                    👤 {session.user?.name || session.user?.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="text-sm px-3 py-2 rounded-xl font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                  >
                    退出
                  </button>
                </div>
              )}
            </div>
            <div className="md:hidden mt-3 flex gap-2 overflow-x-auto">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 hover:scale-105 ${
                    pathname === item.href
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md"
                      : "bg-white/50 text-slate-700 hover:bg-emerald-50"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
