"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type CompleteLessonFormProps = {
  lessonId: string;
  initialClassScore: number | null;
  initialHomeworkScore: number | null;
  initialTeacherComment: string;
  isCompleted: boolean;
};

export function CompleteLessonForm({
  lessonId,
  initialClassScore,
  initialHomeworkScore,
  initialTeacherComment,
  isCompleted,
}: CompleteLessonFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(!isCompleted);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("Сохраняю оценки...");

    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`/api/lessons/${lessonId}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classScore: form.get("classScore"),
          homeworkScore: form.get("homeworkScore"),
          teacherComment: form.get("teacherComment"),
        }),
      });

      if (!response.ok) {
        setMessage("Не удалось завершить урок");
        setIsSubmitting(false);
        return;
      }

      const data = (await response.json()) as { email?: { sent: boolean } };
      setMessage(data.email?.sent ? "Урок завершен, письмо ученику отправлено" : "Урок завершен, но почта не настроена");
      setIsOpen(false);
      router.refresh();
      window.setTimeout(() => router.push(`/lesson/${lessonId}`), 350);
    } catch {
      setMessage("Сервер не ответил");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="panel">
      <p className="eyebrow">Завершение</p>
      <h2>{isCompleted ? "Урок завершен" : "Завершить урок"}</h2>
      {isCompleted && !isOpen ? (
        <div className="score-grid">
          <div>
            <span>Работа на уроке</span>
            <strong>{initialClassScore ?? 0}%</strong>
          </div>
          <div>
            <span>Домашнее задание</span>
            <strong>{initialHomeworkScore ?? 0}%</strong>
          </div>
        </div>
      ) : null}
      {isOpen ? (
        <form className="profile-form" onSubmit={submit}>
          <label>
            Работа на уроке, %
            <input defaultValue={initialClassScore ?? 100} max={100} min={0} name="classScore" required type="number" />
          </label>
          <label>
            Домашнее задание, %
            <input defaultValue={initialHomeworkScore ?? 100} max={100} min={0} name="homeworkScore" required type="number" />
          </label>
          <label>
            Комментарий преподавателя
            <textarea defaultValue={initialTeacherComment} name="teacherComment" placeholder="Что получилось хорошо и что поправить" rows={5} />
          </label>
          <button className="button primary" disabled={isSubmitting} type="submit">
            Сохранить оценки
          </button>
        </form>
      ) : (
        <button className="button ghost" onClick={() => setIsOpen(true)} type="button">
          Изменить оценки
        </button>
      )}
      {message ? <p className="muted-text">{message}</p> : null}
    </section>
  );
}
