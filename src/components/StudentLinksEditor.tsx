"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Board = {
  id: string;
  title: string;
  subject: string;
  url: string;
};

type StudentLinksEditorProps = {
  student: {
    id: string;
    name: string;
    email: string;
    lessonCallLink: string | null;
    boards: Board[];
  };
};

async function writeJson(url: string, method: "POST" | "PATCH" | "DELETE", body?: unknown) {
  return fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function StudentLinksEditor({ student }: StudentLinksEditorProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function saveCallLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await writeJson(`/api/students/${student.id}`, "PATCH", {
      name: student.name,
      email: student.email,
      lessonCallLink: form.get("lessonCallLink"),
    });

    setMessage(response.ok ? "Ссылка на звонок сохранена" : "Не удалось сохранить ссылку");
    router.refresh();
  }

  async function addBoard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const response = await writeJson(`/api/students/${student.id}/boards`, "POST", {
      title: form.get("title"),
      subject: form.get("subject"),
      url: form.get("url"),
    });

    if (response.ok) {
      formElement.reset();
      setMessage("Доска добавлена");
      router.refresh();
    } else {
      setMessage("Не удалось добавить доску");
    }
  }

  async function saveBoard(board: Board, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await writeJson(`/api/student-boards/${board.id}`, "PATCH", {
      title: form.get("title"),
      subject: form.get("subject"),
      url: form.get("url"),
    });

    setMessage(response.ok ? "Доска сохранена" : "Не удалось сохранить доску");
    router.refresh();
  }

  async function deleteBoard(board: Board) {
    if (!window.confirm(`Удалить доску "${board.title}"?`)) return;
    const response = await writeJson(`/api/student-boards/${board.id}`, "DELETE");
    setMessage(response.ok ? "Доска удалена" : "Не удалось удалить доску");
    router.refresh();
  }

  return (
    <section className="dashboard-grid">
      <form className="panel profile-form" onSubmit={saveCallLink}>
        <p className="eyebrow">Звонок</p>
        <h2>Постоянная ссылка</h2>
        <label>
          Ссылка на урок
          <input defaultValue={student.lessonCallLink ?? ""} name="lessonCallLink" placeholder="https://meet.google.com/..." type="url" />
        </label>
        <button className="button primary" type="submit">
          Сохранить ссылку
        </button>
        {message ? <p className="muted-text">{message}</p> : null}
      </form>

      <form className="panel profile-form" onSubmit={addBoard}>
        <p className="eyebrow">Доски</p>
        <h2>Добавить доску</h2>
        <label>
          Предмет
          <input name="subject" placeholder="Математика" required type="text" />
        </label>
        <label>
          Название
          <input name="title" placeholder="Алгебра" required type="text" />
        </label>
        <label>
          Ссылка
          <input name="url" placeholder="https://miro.com/..." required type="url" />
        </label>
        <button className="button primary" type="submit">
          Добавить доску
        </button>
      </form>

      <section className="panel wide-panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Доски ученика</p>
            <h2>Ссылки по предметам</h2>
          </div>
        </div>
        <div className="table-list">
          {student.boards.length ? (
            student.boards.map((board) => (
              <form className="table-row" key={board.id} onSubmit={(event) => void saveBoard(board, event)}>
                <label>
                  Предмет
                  <input defaultValue={board.subject} name="subject" required type="text" />
                </label>
                <label>
                  Название
                  <input defaultValue={board.title} name="title" required type="text" />
                </label>
                <label>
                  Ссылка
                  <input defaultValue={board.url} name="url" required type="url" />
                </label>
                <div className="link-row">
                  <button className="button primary" type="submit">
                    Сохранить
                  </button>
                  <button className="button ghost" onClick={() => void deleteBoard(board)} type="button">
                    Удалить
                  </button>
                </div>
              </form>
            ))
          ) : (
            <p className="muted-text">Досок пока нет.</p>
          )}
        </div>
      </section>
    </section>
  );
}
