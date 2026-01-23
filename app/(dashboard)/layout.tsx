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

  if (!session) {
    redirect("/login");
  }

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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
      <nav className="bg-white/90 backdrop-blur-md shadow-md rounded-b-3xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl animate-bounce">💩</div>
              <Link
                href="/"
                className="text-2xl font-bold text-primary hover:scale-105 transition-transform"
              >
                Pooplet
              </Link>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-200 hover:scale-105 hover:shadow-md ${
                      pathname === item.href
                        ? "bg-primary text-white shadow-lg"
                        : "bg-white/50 text-muted-foreground hover:bg-primary hover:text-white border-2 border-transparent"
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium text-lg">{item.label}</span>
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground hidden sm:flex">
                  🧑 {session.user?.name || session.user?.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-sm px-5 py-2 rounded-2xl font-medium text-destructive hover:bg-destructive/90 hover:shadow-md transition-all duration-200"
                >
                  👋 退出
                </button>
              </div>
            </div>
          </div>
          <div className="md:hidden mt-4 flex gap-4 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-200 ${
                  pathname === item.href
                    ? "bg-primary text-white shadow-lg"
                    : "bg-white/50 text-muted-foreground hover:bg-primary hover:text-white border-2 border-transparent"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium text-lg">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
