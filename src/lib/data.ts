export const lessons = [
  {
    id: "l1",
    student: "Аня Петрова",
    email: "anya@example.com",
    subject: "Математика",
    title: "Квадратные уравнения",
    date: "29 мая",
    time: "17:00",
    duration: "60 минут",
    teacher: "Елена Смирнова",
    status: "Запланирован",
    payment: "Оплачено",
    videoLink: "https://zoom.us/j/123456789",
    boardLink: "https://excalidraw.com",
  },
  {
    id: "l2",
    student: "Марк Иванов",
    email: "mark@example.com",
    subject: "Английский",
    title: "Past Simple и разговорная практика",
    date: "30 мая",
    time: "12:30",
    duration: "45 минут",
    teacher: "Елена Смирнова",
    status: "Запланирован",
    payment: "Ожидает оплату",
    videoLink: "https://meet.google.com/abc-defg-hij",
    boardLink: "https://miro.com",
  },
  {
    id: "l3",
    student: "Аня Петрова",
    email: "anya@example.com",
    subject: "Математика",
    title: "Текстовые задачи",
    date: "2 июня",
    time: "18:00",
    duration: "60 минут",
    teacher: "Елена Смирнова",
    status: "Домашка назначена",
    payment: "Оплачено",
    videoLink: "https://zoom.us/j/123456789",
    boardLink: "https://excalidraw.com",
  },
];

export const homework = [
  {
    id: "h1",
    lessonId: "l1",
    title: "12 примеров на дискриминант",
    subject: "Математика",
    due: "29 мая",
    status: "Ждет решения",
    description: "Учебник: стр. 84, номера 4, 6, 9. Фото решения отправить до урока.",
    file: "practice.pdf",
    teacherComment: "Первые 8 примеров решены верно. В номере 9 проверь знак перед коэффициентом b.",
  },
  {
    id: "h2",
    lessonId: "l2",
    title: "20 глаголов и аудио",
    subject: "Английский",
    due: "30 мая",
    status: "Отправлено",
    description: "Повторить фразы из урока вслух и прикрепить аудио перед занятием.",
    file: "verbs.docx",
    teacherComment: "Хороший темп. На следующем уроке закрепим вопросы.",
  },
  {
    id: "h3",
    lessonId: "l3",
    title: "Вопросы по текстовым задачам",
    subject: "Математика",
    due: "2 июня",
    status: "Не начато",
    description: "Отметить места, где непонятно условие или ход решения.",
    file: "tasks.pdf",
    teacherComment: "Комментарий появится после проверки.",
  },
];

export const students = [
  { name: "Аня Петрова", email: "anya@example.com", subject: "Математика", payment: "Оплачено" },
  { name: "Марк Иванов", email: "mark@example.com", subject: "Английский", payment: "Ожидает оплату" },
  { name: "Илья Соколов", email: "ilya@example.com", subject: "Математика", payment: "Просрочено" },
];

export const payments = [
  { student: "Аня Петрова", month: "Май 2026", status: "Оплачено" },
  { student: "Марк Иванов", month: "Май 2026", status: "Ожидает оплату" },
  { student: "Илья Соколов", month: "Май 2026", status: "Просрочено" },
];

export function statusClass(status: string) {
  const value = status.toLowerCase();
  if (value.includes("оплачено") || value.includes("запланирован") || value.includes("отправлено")) return "done";
  if (value.includes("просрочено")) return "overdue";
  return "waiting";
}
