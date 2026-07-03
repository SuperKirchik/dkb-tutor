import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getCurrentUserFromCookie } from "@/lib/auth";
import { fileNameFromPath, materialHref, materialList } from "@/lib/files";
import { formatLessonDate } from "@/lib/lessonDate";
import { prisma } from "@/lib/prisma";

const submissionLabels: Record<string, string> = {
  NOT_STARTED: "Не начато",
  SUBMITTED: "Отправлено",
  NEEDS_REVISION: "Нужна доработка",
  CHECKED: "Проверено",
};

function statusClass(status?: string) {
  if (status === "CHECKED" || status === "SUBMITTED") return "done";
  if (status === "NEEDS_REVISION") return "review";
  return "waiting";
}

export default async function HomeworkPage() {
  const user = await getCurrentUserFromCookie();
  if (!user) redirect("/login");

  const lessons = await prisma.lesson.findMany({
    where: {
      ...(user.role === "STUDENT" ? { studentId: user.sub } : {}),
      homework: { not: null },
    },
    include: {
      student: { select: { name: true } },
      homeworkSubmissions: {
        where: user.role === "STUDENT" ? { studentId: user.sub } : undefined,
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { date: "asc" },
  });

  return (
    <AppShell active="/homework">
      <header className="page-title">
        <div>
          <p className="eyebrow">Домашние задания</p>
          <h1>Задания по моим урокам</h1>
        </div>
      </header>
      <section className="homework-layout">
        <div className="panel table-list">
          {lessons.map((lesson) => {
            const submission = lesson.homeworkSubmissions[0];
            return (
              <article className="homework-item" key={lesson.id}>
                <div className="meta">
                  <span className="tag">{lesson.subject}</span>
                  <span>{formatLessonDate(lesson.date)}</span>
                  {user.role === "ADMIN" ? <span>{lesson.student.name}</span> : null}
                </div>
                <h2>{lesson.title}</h2>
                <p>{lesson.homework}</p>
                {materialList(lesson.homeworkFile).length ? (
                  <div className="file-list">
                    {materialList(lesson.homeworkFile).map((file) => (
                      <a className="file-chip" href={materialHref(file)} key={file} rel="noreferrer" target="_blank">
                        {fileNameFromPath(file)}
                      </a>
                    ))}
                  </div>
                ) : null}
                <span className={`status ${statusClass(submission?.status)}`}>
                  {submission ? submissionLabels[submission.status] : "Не отправлено"}
                </span>
                <Link className="button ghost" href={`/lesson/${lesson.id}`}>
                  Открыть урок
                </Link>
              </article>
            );
          })}
        </div>
        <aside className="panel submit-card">
          <p className="eyebrow">Отправка</p>
          <h2>Решение отправляется со страницы урока</h2>
          <p>Открой нужный урок из списка, чтобы прикрепить ответ именно к этому занятию.</p>
        </aside>
      </section>
    </AppShell>
  );
}
