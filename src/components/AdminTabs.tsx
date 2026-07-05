"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { appendMaterialFiles, fileNameFromPath, materialHref, materialList } from "@/lib/files";
import { formatLessonDate, formatLessonTime, lessonDateInputValue, lessonTimeInputValue } from "@/lib/lessonDate";

type PaymentStatus = "PAID" | "WAITING" | "OVERDUE";

type Student = {
  id: string;
  name: string;
  email: string;
  lessonCallLink: string | null;
  boards: Array<{ id: string; title: string; subject: string; url: string }>;
  lessonsAsStudent?: Array<{ subject: string }>;
};

type Lesson = {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  date: string;
  videoLink: string | null;
  boardLink: string | null;
  homework: string | null;
  homeworkFile: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  classScore: number | null;
  homeworkScore: number | null;
  studentId: string;
  payment: { status: PaymentStatus } | null;
  student: {
    id: string;
    name: string;
    email: string;
  };
};

type Payment = {
  id: string;
  status: PaymentStatus;
  lesson: {
    id: string;
    title: string;
    subject: string;
    date: string;
    student: {
      id: string;
      name: string;
      email: string;
    };
  };
};

type PaymentRow = {
  id: string;
  status: PaymentStatus | null;
  lesson: Lesson;
};

const paymentLabels: Record<PaymentStatus, string> = {
  PAID: "Оплачено",
  WAITING: "Ожидает оплату",
  OVERDUE: "Просрочено",
};

const paymentSortOrder: Record<PaymentStatus | "NONE", number> = {
  NONE: 0,
  OVERDUE: 1,
  WAITING: 2,
  PAID: 3,
};

function statusClass(status: PaymentStatus | string) {
  if (status === "PAID" || status === "Оплачено") return "done";
  if (status === "OVERDUE" || status === "Просрочено") return "overdue";
  return "waiting";
}

function lessonDateValue(date: string) {
  return lessonDateInputValue(date);
}

function lessonTimeValue(date: string) {
  return lessonTimeInputValue(date);
}

async function readJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, { cache: "no-store", signal: controller.signal });
    if (!response.ok) throw new Error(`Ошибка API: ${response.status}`);
    return response.json() as Promise<T>;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function writeJson(url: string, method: "POST" | "PATCH" | "DELETE", body?: unknown) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 10000);
  try {
    return await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeout);
  }
}

async function uploadMaterial(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/uploads/materials", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("Не удалось загрузить материалы урока");
  const data = (await response.json()) as { file: { url: string } };
  return data.file.url;
}

export function AdminTabs() {
  const [active, setActive] = useState<"students" | "lessons" | "payments">("students");
  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonMaterialFiles, setLessonMaterialFiles] = useState<string[]>([]);
  const [selectedLessonStudentId, setSelectedLessonStudentId] = useState("");
  const [message, setMessage] = useState("Загрузка данных из PostgreSQL...");
  const [flash, setFlash] = useState<"idle" | "working" | "success" | "error">("idle");
  const [isLoading, setIsLoading] = useState(true);
  const operationIdRef = useRef(0);

  const firstStudentId = useMemo(() => students[0]?.id ?? "", [students]);
  const lessonStudentId = selectedLessonStudentId || editingLesson?.studentId || firstStudentId;
  const selectedLessonStudent = useMemo(
    () => students.find((student) => student.id === lessonStudentId) ?? students[0],
    [lessonStudentId, students],
  );
  const studentBoards = selectedLessonStudent?.boards ?? [];
  const paymentRows = useMemo<PaymentRow[]>(
    () =>
      lessons
        .map((lesson) => {
          const savedPayment = payments.find((payment) => payment.lesson.id === lesson.id);
          return {
            id: savedPayment?.id ?? lesson.id,
            status: savedPayment?.status ?? lesson.payment?.status ?? null,
            lesson,
          };
        })
        .sort((a, b) => {
          const statusA = a.status ?? "NONE";
          const statusB = b.status ?? "NONE";
          const statusDiff = paymentSortOrder[statusA] - paymentSortOrder[statusB];
          if (statusDiff !== 0) return statusDiff;
          return new Date(b.lesson.date).getTime() - new Date(a.lesson.date).getTime();
        }),
    [lessons, payments],
  );

  async function loadData({ quiet = false }: { quiet?: boolean } = {}) {
    if (!quiet) setIsLoading(true);
    try {
      const [studentsData, lessonsData, paymentsData] = await Promise.all([
        readJson<{ students: Student[] }>("/api/students"),
        readJson<{ lessons: Lesson[] }>("/api/lessons"),
        readJson<{ payments: Payment[] }>("/api/payments"),
      ]);
      setStudents(studentsData.students);
      setLessons(lessonsData.lessons);
      setPayments(paymentsData.payments);
      setSelectedLessonStudentId((current) => current || studentsData.students[0]?.id || "");
      if (!quiet) setMessage("Данные загружены из PostgreSQL");
    } catch {
      setMessage("Не удалось загрузить данные. Проверь PostgreSQL и авторизацию администратора.");
    } finally {
      if (!quiet) setIsLoading(false);
    }
  }

  function setOperationMessage(text: string, state: "working" | "success" | "error") {
    operationIdRef.current += 1;
    const operationId = operationIdRef.current;
    setMessage(text);
    setFlash(state);
    if (state === "working") {
      window.setTimeout(() => {
        if (operationIdRef.current !== operationId) return;
        setMessage("Сервер не ответил. Обновите страницу или попробуйте еще раз.");
        setFlash("error");
      }, 12000);
      return;
    }

    window.setTimeout(() => setFlash("idle"), 1400);
  }

  function refreshDataQuietly() {
    void loadData({ quiet: true });
  }

  function upsertStudent(student: Student) {
    setStudents((current) => {
      const existing = current.find((item) => item.id === student.id);
      const nextStudent = {
        ...existing,
        ...student,
        boards: student.boards ?? existing?.boards ?? [],
        lessonsAsStudent: student.lessonsAsStudent ?? existing?.lessonsAsStudent ?? [],
      };

      if (!existing) return [...current, nextStudent].sort((a, b) => a.name.localeCompare(b.name, "ru"));
      return current.map((item) => (item.id === student.id ? nextStudent : item));
    });
  }

  function removeStudent(studentId: string) {
    setStudents((current) => current.filter((student) => student.id !== studentId));
    setLessons((current) => current.filter((lesson) => lesson.studentId !== studentId));
    setPayments((current) => current.filter((payment) => payment.lesson.student.id !== studentId));
  }

  function upsertLesson(lesson: Lesson) {
    setLessons((current) => {
      const exists = current.some((item) => item.id === lesson.id);
      if (!exists) {
        return [...current, lesson].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
      return current.map((item) => (item.id === lesson.id ? lesson : item));
    });
  }

  function removeLesson(lessonId: string) {
    setLessons((current) => current.filter((lesson) => lesson.id !== lessonId));
    setPayments((current) => current.filter((payment) => payment.lesson.id !== lessonId));
  }

  function startEditingLesson(lesson: Lesson) {
    setEditingLesson(lesson);
    setLessonMaterialFiles(materialList(lesson.homeworkFile));
    setSelectedLessonStudentId(lesson.studentId);
  }

  function stopEditingLesson() {
    setEditingLesson(null);
    setLessonMaterialFiles([]);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  async function submitStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setOperationMessage("Сохраняю ученика...", "working");
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
      lessonCallLink: editingStudent?.lessonCallLink ?? "",
    };

    try {
      const response = await writeJson(editingStudent ? `/api/students/${editingStudent.id}` : "/api/students", editingStudent ? "PATCH" : "POST", payload);

      if (!response.ok) {
        setOperationMessage("Не удалось сохранить ученика", "error");
        return;
      }

      const { student } = (await response.json()) as { student: Student };
      upsertStudent(student);
      formElement.reset();
      setEditingStudent(null);
      setOperationMessage(editingStudent ? "Ученик обновлен" : "Ученик создан", "success");
      refreshDataQuietly();
    } catch {
      setOperationMessage("Не удалось сохранить ученика: сервер не ответил", "error");
    }
  }

  async function deleteStudent(student: Student) {
    if (!window.confirm(`Удалить ученика ${student.name}? Его уроки и оплаты тоже будут удалены.`)) return;
    setOperationMessage("Удаляю ученика...", "working");
    try {
      const response = await writeJson(`/api/students/${student.id}`, "DELETE");
      if (!response.ok) {
        setOperationMessage("Не удалось удалить ученика", "error");
        return;
      }
      removeStudent(student.id);
      setOperationMessage("Ученик удален", "success");
      refreshDataQuietly();
    } catch {
      setOperationMessage("Не удалось удалить ученика: сервер не ответил", "error");
    }
  }

  async function submitLesson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setOperationMessage("Сохраняю урок...", "working");
    const payload = {
      studentId: form.get("studentId"),
      subject: form.get("subject"),
      title: form.get("title"),
      teacher: form.get("teacher"),
      date: `${form.get("date")}T${form.get("time")}:00+03:00`,
      videoLink: selectedLessonStudent?.lessonCallLink ?? "",
      boardLink: form.get("boardLink"),
      homework: form.get("homework"),
      homeworkFile: lessonMaterialFiles.join("\n"),
    };

    try {
      const materialFiles = form
        .getAll("materialFile")
        .filter((file): file is File => file instanceof File && file.size > 0);
      if (materialFiles.length > 0) {
        const uploadedFiles = await Promise.all(materialFiles.map((file) => uploadMaterial(file)));
        payload.homeworkFile = appendMaterialFiles(payload.homeworkFile, uploadedFiles);
      }

      const response = await writeJson(editingLesson ? `/api/lessons/${editingLesson.id}` : "/api/lessons", editingLesson ? "PATCH" : "POST", payload);

      if (!response.ok) {
        setOperationMessage("Не удалось сохранить урок", "error");
        return;
      }

      const { lesson } = (await response.json()) as { lesson: Lesson };
      upsertLesson(lesson);
      formElement.reset();
      stopEditingLesson();
      setOperationMessage(editingLesson ? "Урок обновлен" : "Урок создан", "success");
      refreshDataQuietly();
    } catch {
      setOperationMessage("Не удалось сохранить урок: сервер не ответил", "error");
    }
  }

  async function deleteLesson(lesson: Lesson) {
    if (!window.confirm(`Удалить урок "${lesson.subject}: ${lesson.title}"?`)) return;
    setOperationMessage("Удаляю урок...", "working");
    try {
      const response = await writeJson(`/api/lessons/${lesson.id}`, "DELETE");
      if (!response.ok) {
        setOperationMessage("Не удалось удалить урок", "error");
        return;
      }
      removeLesson(lesson.id);
      setOperationMessage("Урок удален", "success");
      refreshDataQuietly();
    } catch {
      setOperationMessage("Не удалось удалить урок: сервер не ответил", "error");
    }
  }

  async function savePayment(lessonId: string, status: PaymentStatus) {
    setOperationMessage("Сохраняю оплату занятия...", "working");
    try {
      const response = await writeJson("/api/payments", "POST", {
        lessonId,
        status,
      });

      if (!response.ok) {
        setOperationMessage("Не удалось сохранить оплату", "error");
        return;
      }

      const { payment } = (await response.json()) as { payment: Payment };
      setPayments((current) => {
        const exists = current.some((item) => item.id === payment.id);
        if (!exists) return [...current, payment];
        return current.map((item) => (item.id === payment.id ? payment : item));
      });
      setLessons((current) =>
        current.map((lesson) =>
          lesson.id === payment.lesson.id ? { ...lesson, payment: { status: payment.status } } : lesson,
        ),
      );
      setOperationMessage("Оплата занятия сохранена", "success");
      refreshDataQuietly();
    } catch {
      setOperationMessage("Не удалось сохранить оплату: сервер не ответил", "error");
    }
  }

  return (
    <>
      <section className="admin-tabs" aria-label="Разделы админ-панели">
        <button className={active === "students" ? "active" : ""} onClick={() => setActive("students")} type="button">
          Ученики
        </button>
        <button className={active === "lessons" ? "active" : ""} onClick={() => setActive("lessons")} type="button">
          Уроки
        </button>
        <button className={active === "payments" ? "active" : ""} onClick={() => setActive("payments")} type="button">
          Оплаты
        </button>
      </section>

      <p className={`panel operation-status ${isLoading ? "" : "payment-ok"} ${flash}`}>{message}</p>

      {active === "students" && (
        <section className="dashboard-grid">
          <form className="panel profile-form" key={editingStudent?.id ?? "new-student"} onSubmit={submitStudent}>
            <p className="eyebrow">{editingStudent ? "Редактирование" : "Новый ученик"}</p>
            <h2>{editingStudent ? "Изменить аккаунт" : "Создать аккаунт"}</h2>
            <label>
              Имя
              <input defaultValue={editingStudent?.name ?? ""} name="name" placeholder="Илья Соколов" required type="text" />
            </label>
            <label>
              Email
              <input defaultValue={editingStudent?.email ?? ""} name="email" placeholder="ilya@example.com" required type="email" />
            </label>
            <label>
              Пароль
              <input autoComplete="new-password" defaultValue="" name="password" placeholder={editingStudent ? "Оставить прежний" : "Задайте пароль"} type="text" />
            </label>
            <div className="link-row">
              <button className="button primary" type="submit">
                {editingStudent ? "Сохранить изменения" : "Сохранить ученика"}
              </button>
              {editingStudent ? (
                <button className="button ghost" onClick={() => setEditingStudent(null)} type="button">
                  Отмена
                </button>
              ) : null}
            </div>
          </form>

          <section className="panel">
            <div className="section-title">
              <div>
                <p className="eyebrow">Ученики</p>
                <h2>Список из базы</h2>
              </div>
            </div>
            <div className="table-list">
              {students.map((student) => {
                const subject = student.lessonsAsStudent?.[0]?.subject ?? "Предмет не назначен";
                return (
                  <div className="table-row" key={student.id}>
                    <div>
                      <strong>{student.name}</strong>
                      <span>{student.email}</span>
                    </div>
                    <div>
                      <strong>{subject}</strong>
                      <span>Предмет</span>
                    </div>
                    <div>
                      <span className="status waiting">{student.lessonsAsStudent?.length ? "Есть уроки" : "Нет уроков"}</span>
                    </div>
                    <div className="link-row">
                      <a className="button ghost" href={`/admin/students/${student.id}`}>
                        Профиль
                      </a>
                      <button onClick={() => setEditingStudent(student)} type="button">
                        Редактировать
                      </button>
                      <button onClick={() => void deleteStudent(student)} type="button">
                        Удалить
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </section>
      )}

      {active === "lessons" && (
        <section className="dashboard-grid">
          <section className="panel">
            <div className="section-title">
              <div>
                <p className="eyebrow">{editingLesson ? "Редактирование" : "Уроки"}</p>
                <h2>{editingLesson ? "Изменить урок" : "Создание урока"}</h2>
              </div>
            </div>
            <form className="admin-form" key={editingLesson?.id ?? "new-lesson"} onSubmit={submitLesson}>
              <label>
                Ученик
                <select
                  name="studentId"
                  onChange={(event) => setSelectedLessonStudentId(event.target.value)}
                  required
                  value={lessonStudentId}
                >
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Предмет
                <input defaultValue={editingLesson?.subject ?? ""} name="subject" required type="text" />
              </label>
              <label>
                Тема урока
                <input defaultValue={editingLesson?.title ?? ""} name="title" required type="text" />
              </label>
              <label>
                Преподаватель
                <input defaultValue={editingLesson?.teacher ?? "Дроздов Кирилл Борисович"} name="teacher" required type="text" />
              </label>
              <label>
                Дата
                <input defaultValue={editingLesson ? lessonDateValue(editingLesson.date) : ""} name="date" required type="date" />
              </label>
              <label>
                Время
                <input defaultValue={editingLesson ? lessonTimeValue(editingLesson.date) : ""} name="time" required type="time" />
              </label>
              <label>
                Ссылка на звонок
                <input readOnly value={selectedLessonStudent?.lessonCallLink ?? ""} type="url" />
              </label>
              <label>
                Доска
                <select
                  defaultValue={editingLesson?.studentId === lessonStudentId ? editingLesson?.boardLink ?? studentBoards[0]?.url ?? "" : studentBoards[0]?.url ?? ""}
                  key={`${lessonStudentId}-${editingLesson?.id ?? "new"}-board`}
                  name="boardLink"
                >
                  <option value="">Без доски</option>
                  {studentBoards.map((board) => (
                    <option key={board.id} value={board.url}>
                      {board.subject}: {board.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Материалы урока
                <input accept=".pdf,.docx,.png,.jpg,.jpeg" multiple name="materialFile" type="file" />
              </label>
              {lessonMaterialFiles.length ? (
                <div className="file-list">
                  {lessonMaterialFiles.map((file) => (
                    <span className="file-chip file-chip-editable" key={file}>
                      <a href={materialHref(file)} rel="noreferrer" target="_blank">
                        {fileNameFromPath(file)}
                      </a>
                      <button onClick={() => setLessonMaterialFiles((current) => current.filter((item) => item !== file))} type="button">
                        Удалить
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
              <label className="wide-field">
                Домашнее задание
                <textarea defaultValue={editingLesson?.homework ?? ""} name="homework" rows={4} />
              </label>
              <div className="link-row">
                <button className="button primary" disabled={!students.length} type="submit">
                  {editingLesson ? "Сохранить изменения" : "Сохранить урок"}
                </button>
                {editingLesson ? (
                  <button className="button ghost" onClick={stopEditingLesson} type="button">
                    Отмена
                  </button>
                ) : null}
              </div>
            </form>
          </section>

          <section className="panel">
            <div className="section-title">
              <div>
                <p className="eyebrow">Уроки</p>
                <h2>Список из базы</h2>
              </div>
            </div>
            <div className="table-list">
              {lessons.map((lesson) => (
                <div className="table-row" key={lesson.id}>
                  <div>
                    <strong>
                      {lesson.subject}: {lesson.title}
                    </strong>
                    <span>{lesson.student.name}</span>
                  </div>
                  <div>
                    <strong>{formatLessonDate(lesson.date)}</strong>
                    <span>{formatLessonTime(lesson.date)}</span>
                  </div>
                  <div>
                    <span className={`status ${statusClass(lesson.payment?.status ?? "WAITING")}`}>
                      {lesson.payment ? paymentLabels[lesson.payment.status] : "Оплата не отмечена"}
                    </span>
                  </div>
                  <div className="link-row">
                    <button onClick={() => startEditingLesson(lesson)} type="button">
                      Редактировать
                    </button>
                    <button onClick={() => void deleteLesson(lesson)} type="button">
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </section>
      )}

      {active === "payments" && (
        <section className="panel">
            <div className="section-title">
              <div>
                <p className="eyebrow">Оплаты</p>
                <h2>Статусы занятий</h2>
              </div>
            </div>
            <div className="table-list scroll-list">
              {paymentRows.map((payment) => (
                <div className="table-row" key={payment.id}>
                  <div>
                    <strong>{payment.lesson.student.name}</strong>
                    <span>{payment.lesson.student.email}</span>
                  </div>
                  <div>
                    <strong>
                      {payment.lesson.subject}: {payment.lesson.title}
                    </strong>
                    <span>
                      {formatLessonDate(payment.lesson.date)}{" "}
                      {formatLessonTime(payment.lesson.date)}
                    </span>
                  </div>
                  <div>
                    <select
                      aria-label="Статус оплаты"
                      className={`status-select ${payment.status ? statusClass(payment.status) : "waiting"}`}
                      defaultValue={payment.status ?? "NONE"}
                      onChange={(event) => void savePayment(payment.lesson.id, event.target.value as PaymentStatus)}
                    >
                      <option disabled value="NONE">
                        Не отмечена
                      </option>
                      <option value="PAID">Оплачено</option>
                      <option value="WAITING">Ожидает оплату</option>
                      <option value="OVERDUE">Просрочено</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
        </section>
      )}
    </>
  );
}
