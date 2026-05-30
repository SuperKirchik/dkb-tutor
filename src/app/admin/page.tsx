import { AdminTabs } from "@/components/AdminTabs";
import { AppShell } from "@/components/AppShell";

export default function AdminPage() {
  return (
    <AppShell active="/admin">
      <header className="page-title">
        <div>
          <p className="eyebrow">Админ-панель</p>
          <h1>Управление учениками, уроками и оплатами</h1>
        </div>
      </header>
      <AdminTabs />
    </AppShell>
  );
}
