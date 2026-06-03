import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { getCurrentUserFromCookie } from "@/lib/auth";
import { formatLessonDate, formatLessonTime } from "@/lib/lessonDate";
import { prisma } from "@/lib/prisma";

const paymentLabels = {
  PAID: "Оплачено",
  WAITING: "Ожидает оплату",
  OVERDUE: "Просрочено",
};

function statusClass(status?: string) {
  if (status === "PAID") return "done";
  if (status === "OVERDUE") return "overdue";
  return "waiting";
}

export default async function SchedulePage() {
  const user = await getCurrentUserFromCookie();
  const lessons = await prisma.lesson.findMany({
    where: user?.role === "STUDENT" ? { studentId: user.sub } : undefined,
    include: {
      student: { select: { name: true } },
      payment: true,
    },
    orderBy: { date: "asc" },
  });

  return (
    <AppShell active="/schedule">
      <header className="page-title">
        <div>
          <p className="eyebrow">Расписание</p>
          <h1>Мои уроки</h1>
        </div>
      </header>
      <section className="panel">
        <div className="table-list">
          {lessons.map((lesson) => (
            <Link className="table-row" href={`/lesson/${lesson.id}`} key={lesson.id}>
              <div>
                <strong>{lesson.subject}</strong>
                <span>{lesson.title}</span>
              </div>
              <div>
                <strong>{formatLessonDate(lesson.date)}</strong>
                <span>{formatLessonTime(lesson.date)}</span>
              </div>
              <div>
                <span className={`status ${statusClass(lesson.payment?.status)}`}>
                  {lesson.payment ? paymentLabels[lesson.payment.status] : "Оплата не отмечена"}
                </span>
              </div>
              <span>Открыть →</span>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
