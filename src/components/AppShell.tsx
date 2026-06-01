import { cookies } from "next/headers";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

const navItems = [
  { href: "/dashboard", label: "Главная", adminOnly: false },
  { href: "/schedule", label: "Расписание", adminOnly: false },
  { href: "/homework", label: "Домашка", adminOnly: false },
  { href: "/profile", label: "Профиль", adminOnly: false },
  { href: "/admin", label: "Админ", adminOnly: true },
];

export async function AppShell({
  active,
  children,
}: {
  active: string;
  children: React.ReactNode;
}) {
  const role = (await cookies()).get("tutor_role")?.value;
  const visibleItems = navItems.filter((item) => !item.adminOnly || role === "ADMIN");

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <BrandLogo href="/dashboard" />
        <nav className="app-nav" aria-label="Кабинет">
          {visibleItems.map((item) => (
            <Link className={active === item.href ? "active" : ""} href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="app-main">{children}</main>
    </div>
  );
}
