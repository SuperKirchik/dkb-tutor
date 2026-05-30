"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type RepeatLessonButtonProps = {
  lessonId: string;
};

export function RepeatLessonButton({ lessonId }: RepeatLessonButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function repeatLesson() {
    setIsSubmitting(true);
    setMessage("Создаю урок через неделю...");

    try {
      const response = await fetch(`/api/lessons/${lessonId}/repeat`, { method: "POST" });
      if (!response.ok) {
        setMessage("Не удалось повторить урок");
        setIsSubmitting(false);
        return;
      }

      const data = (await response.json()) as { lesson: { id: string } };
      setMessage("Урок создан");
      router.push(`/lesson/${data.lesson.id}`);
      router.refresh();
    } catch {
      setMessage("Сервер не ответил");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="repeat-action">
      <button className="button ghost" disabled={isSubmitting} onClick={repeatLesson} type="button">
        Повторить через неделю
      </button>
      {message ? <span className="muted-text">{message}</span> : null}
    </div>
  );
}
