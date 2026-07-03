import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { CompleteLessonForm } from "@/components/CompleteLessonForm";
import { getCurrentUserFromCookie } from "@/lib/auth";
import { fileNameFromPath, materialHref, materialList } from "@/lib/files";
import { lessonDateTimeLabel } from "@/lib/lessonDate";
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

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUserFromCookie();
  if (!user) redirect("/login");

  const { id } = await params;
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      student: { select: { id: true, name: true } },
      payment: true,
      homeworkSubmissions: {
        where: user.role === "STUDENT" ? { studentId: user.sub } : undefined,
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!lesson) notFound();
  if (user.role === "STUDENT" && lesson.studentId !== user.sub) redirect("/schedule");

  const submission = lesson.homeworkSubmissions[0];

  return (
    <AppShell active="/schedule">
      <header className="page-title">
        <div>
          <p className="eyebrow">Урок</p>
          <h1>
            {lesson.subject}: {lesson.title}
          </h1>
        </div>
        <span className={`status ${statusClass(lesson.payment?.status)}`}>
          {lesson.payment ? paymentLabels[lesson.payment.status] : "Оплата не отмечена"}
        </span>
        {user.role === "ADMIN" ? (
          <Link className="button ghost" href={`/lesson/${lesson.id}/next`}>
            Назначить следующий
          </Link>
        ) : null}
      </header>

      <section className="lesson-layout">
        <article className="panel lesson-main">
          <p className="eyebrow">Информация</p>
          <h2>
            {lessonDateTimeLabel(lesson.date)}
          </h2>
          <div className="info-grid">
            <div>
              <span>Предмет</span>
              <strong>{lesson.subject}</strong>
            </div>
            <div>
              <span>Преподаватель</span>
              <strong>{lesson.teacher}</strong>
            </div>
            <div>
              <span>Ученик</span>
              <strong>{lesson.student.name}</strong>
            </div>
            <div>
              <span>Оплата занятия</span>
              <strong>{lesson.payment ? paymentLabels[lesson.payment.status] : "Не отмечена"}</strong>
            </div>
            <div>
              <span>Статус урока</span>
              <strong>{lesson.isCompleted ? "Завершен" : "Запланирован"}</strong>
            </div>
          </div>
          <div className="link-row">
            {lesson.videoLink ? (
              <a className="button primary" href={lesson.videoLink} rel="noreferrer" target="_blank">
                Подключиться к уроку
              </a>
            ) : null}
            {lesson.boardLink ? (
              <a className="button ghost" href={lesson.boardLink} rel="noreferrer" target="_blank">
                Открыть доску
              </a>
            ) : null}
          </div>
        </article>

        <article className="panel">
          <p className="eyebrow">Домашнее задание</p>
          <h2>{lesson.homework ? "Задание назначено" : "Задание не назначено"}</h2>
          <p>{lesson.homework ?? "Преподаватель добавит задание после урока."}</p>
          {materialList(lesson.homeworkFile).length ? (
            <div className="file-list">
              {materialList(lesson.homeworkFile).map((file) => (
                <a className="file-chip" href={materialHref(file)} key={file} rel="noreferrer" target="_blank">
                  {fileNameFromPath(file)}
                </a>
              ))}
            </div>
          ) : null}
        </article>

        {lesson.isCompleted ? (
          <article className="panel">
            <p className="eyebrow">Оценки</p>
            <h2>Результат урока</h2>
            <div className="score-grid">
              <div>
                <span>Работа на уроке</span>
                <strong>{lesson.classScore ?? 0}%</strong>
              </div>
              <div>
                <span>Домашнее задание</span>
                <strong>{lesson.homeworkScore ?? 0}%</strong>
              </div>
            </div>
          </article>
        ) : null}

        <form className="panel">
          <p className="eyebrow">Решение ученика</p>
          <h2>Отправка</h2>
          <label>
            Сообщение
            <textarea defaultValue={submission?.comment ?? ""} placeholder="Добавьте комментарий к решению" rows={5} />
          </label>
          <label>
            Файл
            <input accept=".pdf,.docx,.png,.jpg,.jpeg" type="file" />
          </label>
          <button className="button primary" type="button">
            Отправить
          </button>
        </form>

        <article className="panel feedback-card">
          <p className="eyebrow">Комментарий преподавателя</p>
          <h2>Проверка</h2>
          <p>{submission?.feedback ?? "Комментарий появится после проверки."}</p>
          <span className="status review">{submission?.status ?? "Ждет отправки"}</span>
        </article>

        {user.role === "ADMIN" ? (
          <CompleteLessonForm
            initialClassScore={lesson.classScore}
            initialHomeworkScore={lesson.homeworkScore}
            initialTeacherComment={submission?.feedback ?? ""}
            isCompleted={lesson.isCompleted}
            lessonId={lesson.id}
          />
        ) : null}
      </section>
    </AppShell>
  );
}
