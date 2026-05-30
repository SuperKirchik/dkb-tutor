import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { StudentProgress } from "@/components/StudentProgress";
import { getCurrentUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const auth = await getCurrentUserFromCookie();
  if (!auth) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: auth.sub },
    select: { name: true, email: true },
  });
  if (!user) redirect("/login");

  const completedLessons =
    auth.role === "STUDENT"
      ? await prisma.lesson.findMany({
          where: {
            studentId: auth.sub,
            isCompleted: true,
          },
          select: {
            id: true,
            title: true,
            subject: true,
            date: true,
            completedAt: true,
            classScore: true,
            homeworkScore: true,
          },
          orderBy: [{ completedAt: "desc" }, { date: "desc" }],
        })
      : [];

  return (
    <AppShell active="/profile">
      <header className="page-title">
        <div>
          <p className="eyebrow">Профиль</p>
          <h1>Данные аккаунта</h1>
        </div>
      </header>
      <section className="panel profile-form">
        <label>
          Имя
          <input defaultValue={user.name} readOnly type="text" />
        </label>
        <label>
          Email
          <input defaultValue={user.email} readOnly type="email" />
        </label>
        <p className="muted-text">Пароль меняет администратор.</p>
      </section>

      {auth.role === "STUDENT" ? (
        <StudentProgress lessons={completedLessons} />
      ) : null}
    </AppShell>
  );
}
