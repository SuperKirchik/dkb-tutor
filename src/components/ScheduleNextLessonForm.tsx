"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { appendMaterialFiles, fileNameFromPath, materialHref, materialList } from "@/lib/files";

type ScheduleNextLessonFormProps = {
  lessonId: string;
  nextDateLabel: string;
  nextDateValue: string;
  nextTimeValue: string;
  lesson: {
    subject: string;
    title: string;
    teacher: string;
    studentName: string;
    videoLink: string | null;
    boardLink: string | null;
    homework: string | null;
    homeworkFile: string | null;
  };
};

async function uploadMaterial(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/uploads/materials", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("Не удалось загрузить материалы");
  const data = (await response.json()) as { file: { url: string } };
  return data.file.url;
}

export function ScheduleNextLessonForm({ lessonId, nextDateLabel, nextDateValue, nextTimeValue, lesson }: ScheduleNextLessonFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("Назначаю следующий урок...");

    const form = new FormData(event.currentTarget);
    let homeworkFile = lesson.homeworkFile ?? "";

    try {
      const materialFiles = form
        .getAll("materialFile")
        .filter((file): file is File => file instanceof File && file.size > 0);
      if (materialFiles.length > 0) {
        const uploadedFiles = await Promise.all(materialFiles.map((file) => uploadMaterial(file)));
        homeworkFile = appendMaterialFiles(homeworkFile, uploadedFiles);
      }

      const response = await fetch(`/api/lessons/${lessonId}/repeat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: `${form.get("date")}T${form.get("time")}:00+03:00`,
          homework: form.get("homework"),
          homeworkFile,
        }),
      });

      if (!response.ok) {
        setMessage("Не удалось назначить следующий урок");
        setIsSubmitting(false);
        return;
      }

      const data = (await response.json()) as { lesson: { id: string } };
      router.push(`/lesson/${data.lesson.id}`);
      router.refresh();
    } catch {
      setMessage("Сервер не ответил");
      setIsSubmitting(false);
    }
  }

  return (
    <section className="lesson-layout">
      <article className="panel lesson-main">
        <p className="eyebrow">Следующий урок</p>
        <h2>{nextDateLabel}</h2>
        <div className="info-grid">
          <div>
            <span>Ученик</span>
            <strong>{lesson.studentName}</strong>
          </div>
          <div>
            <span>Предмет</span>
            <strong>{lesson.subject}</strong>
          </div>
          <div>
            <span>Тема</span>
            <strong>{lesson.title}</strong>
          </div>
          <div>
            <span>Преподаватель</span>
            <strong>{lesson.teacher}</strong>
          </div>
        </div>
        <div className="link-row">
          {lesson.videoLink ? (
            <a className="button ghost" href={lesson.videoLink} rel="noreferrer" target="_blank">
              Ссылка на звонок
            </a>
          ) : null}
          {lesson.boardLink ? (
            <a className="button ghost" href={lesson.boardLink} rel="noreferrer" target="_blank">
              Доска урока
            </a>
          ) : null}
        </div>
      </article>

      <form className="panel profile-form" onSubmit={submit}>
        <p className="eyebrow">Назначение</p>
        <h2>Дата, домашка и материалы</h2>
        <label>
          Дата
          <input defaultValue={nextDateValue} name="date" required type="date" />
        </label>
        <label>
          Время
          <input defaultValue={nextTimeValue} name="time" required type="time" />
        </label>
        <label>
          Домашка
          <textarea defaultValue={lesson.homework ?? ""} name="homework" rows={6} />
        </label>
        <label>
          Материалы
          <input accept=".pdf,.docx,.png,.jpg,.jpeg" multiple name="materialFile" type="file" />
        </label>
        {materialList(lesson.homeworkFile).length ? (
          <div className="file-list">
            {materialList(lesson.homeworkFile).map((file) => (
              <a className="file-chip" href={materialHref(file)} key={file} rel="noreferrer" target="_blank">
                {fileNameFromPath(file)}
              </a>
            ))}
          </div>
        ) : null}
        <button className="button primary" disabled={isSubmitting} type="submit">
          Назначить следующий урок
        </button>
        {message ? <p className="muted-text">{message}</p> : null}
      </form>
    </section>
  );
}
