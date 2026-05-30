import { cookies } from "next/headers";
import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Dashboard", adminOnly: false },
  { href: "/schedule", label: "Расписание", adminOnly: false },
  { href: "/homework", label: "Домашние задания", adminOnly: false },
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
        <Link className="brand" href="/dashboard">
          Репетитор Онлайн
        </Link>
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
