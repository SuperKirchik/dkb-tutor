import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getCurrentUserFromCookie } from "@/lib/auth";
import { formatLessonDate, formatLessonTime } from "@/lib/lessonDate";
import { prisma } from "@/lib/prisma";

const paymentLabels = {
  PAID: "Оплачено",
  WAITING: "Ожидает оплату",
  OVERDUE: "Просрочено",
};

export default async function DashboardPage() {
  const auth = await getCurrentUserFromCookie();
  if (!auth) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: auth.sub },
    select: { id: true, name: true, role: true },
  });
  if (!user) redirect("/login");

  const nextLesson = await prisma.lesson.findFirst({
    where: {
      ...(auth.role === "STUDENT" ? { studentId: auth.sub } : {}),
      date: { gte: new Date() },
      isCompleted: false,
    },
    include: { payment: true },
    orderBy: { date: "asc" },
  });

  const latestSubmission = await prisma.homeworkSubmission.findFirst({
    where: auth.role === "STUDENT" ? { studentId: auth.sub } : undefined,
    include: { lesson: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AppShell active="/dashboard">
      <header className="page-title">
        <div>
          <p className="eyebrow">Личный кабинет</p>
          <h1>Добрый день, {user.name}</h1>
        </div>
        <Link className="button ghost" href="/login">
          Выйти
        </Link>
      </header>

      <section className="dashboard-grid">
        <article className="panel highlight">
          <p className="eyebrow">Ближайший урок</p>
          {nextLesson ? (
            <>
              <h2>
                {nextLesson.subject}: {nextLesson.title}
              </h2>
              <div className="meta">
                <span>{formatLessonDate(nextLesson.date)}</span>
                <span>{formatLessonTime(nextLesson.date)}</span>
                <span>{nextLesson.teacher}</span>
              </div>
              <Link className="button primary" href={`/lesson/${nextLesson.id}`}>
                Открыть урок
              </Link>
            </>
          ) : (
            <>
              <h2>Уроков пока нет</h2>
              <p>Когда репетитор назначит занятие, оно появится здесь.</p>
            </>
          )}
        </article>
        <article className="panel">
          <p className="eyebrow">Домашнее задание</p>
          {nextLesson?.homework ? (
            <>
              <h2>{nextLesson.title}</h2>
              <p>{nextLesson.homework}</p>
            </>
          ) : (
            <>
              <h2>Нет активной домашки</h2>
              <p>Задание появится после назначения урока.</p>
            </>
          )}
          <Link className="button ghost" href="/homework">
            Перейти к заданиям
          </Link>
        </article>
        <article className="panel payment-ok">
          <p className="eyebrow">Оплата ближайшего занятия</p>
          <h2>{nextLesson?.payment ? paymentLabels[nextLesson.payment.status] : "Не отмечена"}</h2>
          <p>Оплата теперь считается отдельно по каждому уроку.</p>
        </article>
        <article className="panel">
          <p className="eyebrow">Уведомления</p>
          <ul className="notice-list">
            <li>{nextLesson ? `Следующий урок: ${nextLesson.subject}, ${formatLessonDate(nextLesson.date)}.` : "Новых уроков пока нет."}</li>
            <li>{latestSubmission ? `Последнее решение: ${latestSubmission.lesson.subject}.` : "Отправленных решений пока нет."}</li>
            <li>Все данные показываются только для текущего аккаунта.</li>
          </ul>
        </article>
      </section>
    </AppShell>
  );
}
