import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { resolve4 } from "node:dns/promises";
import { formatLessonDate, formatLessonTime } from "@/lib/lessonDate";

type LessonResultEmail = {
  to: string;
  lessonTitle: string;
  subject: string;
  teacher: string;
  date: Date;
  classScore: number;
  homeworkScore: number;
  teacherComment?: string;
  paymentStatus: string;
  overdueLessons: Array<{
    title: string;
    subject: string;
    date: Date;
    status: string;
  }>;
};

function smtpConfigReady() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new Error("Email delivery timed out")), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

async function smtpTarget(host: string): Promise<Pick<SMTPTransport.Options, "host" | "tls">> {
  try {
    const [address] = await resolve4(host);
    if (address) {
      return {
        host: address,
        tls: { servername: host },
      };
    }
  } catch {
    return { host };
  }

  return { host };
}

export async function sendLessonResultEmail({
  to,
  lessonTitle,
  subject,
  teacher,
  date,
  classScore,
  homeworkScore,
  teacherComment,
  paymentStatus,
  overdueLessons,
}: LessonResultEmail) {
  if (!smtpConfigReady()) {
    return { sent: false, reason: "SMTP is not configured" };
  }

  const target = await smtpTarget(process.env.SMTP_HOST as string);
  const transportOptions: SMTPTransport.Options = {
    ...target,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    connectionTimeout: 25000,
    greetingTimeout: 25000,
    socketTimeout: 25000,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  };

  const transporter = nodemailer.createTransport(transportOptions);

  await withTimeout(transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: `Результаты урока: ${subject}`,
    text: [
      "Здравствуйте!",
      "",
      `Урок: ${subject}: ${lessonTitle}`,
      `Дата: ${formatLessonDate(date)} ${formatLessonTime(date)}`,
      `Преподаватель: ${teacher}`,
      "",
      "Оценки:",
      `Работа на уроке: ${classScore}%`,
      `Домашнее задание: ${homeworkScore}%`,
      teacherComment ? `Комментарий преподавателя: ${teacherComment}` : "",
      "",
      `Статус оплаты этого урока: ${paymentStatus}`,
      overdueLessons.length ? "Просроченные по оплате занятия:" : "Просроченных по оплате занятий нет.",
      ...overdueLessons.map(
        (lesson) =>
          `${lesson.subject}: ${lesson.title}, ${formatLessonDate(lesson.date)} ${formatLessonTime(lesson.date)} — ${lesson.status}`,
      ),
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#17212b">
        <h2>Результаты урока</h2>
        <p>Здравствуйте!</p>
        <p><strong>${subject}: ${lessonTitle}</strong></p>
        <p>Дата: ${formatLessonDate(date)} ${formatLessonTime(date)}</p>
        <p>Преподаватель: ${teacher}</p>
        <h3>Оценки</h3>
        <ul>
          <li>Работа на уроке: <strong>${classScore}%</strong></li>
          <li>Домашнее задание: <strong>${homeworkScore}%</strong></li>
        </ul>
        ${teacherComment ? `<p><strong>Комментарий преподавателя:</strong><br>${teacherComment}</p>` : ""}
        <p><strong>Статус оплаты этого урока:</strong> ${paymentStatus}</p>
        <h3>Просроченные по оплате занятия</h3>
        ${
          overdueLessons.length
            ? `<ul>${overdueLessons
                .map(
                  (lesson) =>
                    `<li>${lesson.subject}: ${lesson.title}, ${formatLessonDate(lesson.date)} ${formatLessonTime(lesson.date)} — ${lesson.status}</li>`,
                )
                .join("")}</ul>`
            : "<p>Просроченных по оплате занятий нет.</p>"
        }
      </div>
    `,
  }), 30000);

  return { sent: true };
}
