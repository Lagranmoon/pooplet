export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <main>{children}</main>
    </div>
  );
}

export const metadata = {
  title: "登录 - Pooplet",
};
