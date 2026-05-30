import { PrismaClient, PaymentStatus, Role, SubmissionStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/tutor_platform",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash("12345678", 10);

  const admin = await prisma.user.upsert({
    where: { email: "teacher@example.com" },
    update: {},
    create: {
      name: "Дроздов Кирилл Борисович",
      email: "teacher@example.com",
      password,
      role: Role.ADMIN,
    },
  });

  const anya = await prisma.user.upsert({
    where: { email: "anya@example.com" },
    update: {},
    create: {
      name: "Аня Петрова",
      email: "anya@example.com",
      password,
      role: Role.STUDENT,
    },
  });

  const mark = await prisma.user.upsert({
    where: { email: "mark@example.com" },
    update: {},
    create: {
      name: "Марк Иванов",
      email: "mark@example.com",
      password,
      role: Role.STUDENT,
    },
  });

  const lesson = await prisma.lesson.create({
    data: {
      title: "Квадратные уравнения",
      subject: "Математика",
      teacher: "Дроздов Кирилл Борисович",
      date: new Date("2026-05-29T17:00:00+03:00"),
      videoLink: "https://zoom.us/j/123456789",
      boardLink: "https://excalidraw.com",
      homework: "Учебник: стр. 84, номера 4, 6, 9.",
      homeworkFile: "practice.pdf",
      studentId: anya.id,
    },
  });

  const markLesson = await prisma.lesson.create({
    data: {
      title: "Past Simple и разговорная практика",
      subject: "Английский",
      teacher: "Дроздов Кирилл Борисович",
      date: new Date("2026-05-30T12:30:00+03:00"),
      videoLink: "https://meet.google.com/abc-defg-hij",
      boardLink: "https://miro.com",
      homework: "Повторить 20 глаголов и записать аудио.",
      homeworkFile: "verbs.docx",
      studentId: mark.id,
    },
  });

  await prisma.homeworkSubmission.create({
    data: {
      lessonId: lesson.id,
      studentId: anya.id,
      comment: "Первые 8 примеров решены, в 9 есть вопрос.",
      status: SubmissionStatus.NEEDS_REVISION,
      feedback: "Проверь знак перед коэффициентом b.",
    },
  });

  await prisma.payment.upsert({
    where: { lessonId: lesson.id },
    update: { status: PaymentStatus.PAID },
    create: { lessonId: lesson.id, status: PaymentStatus.PAID },
  });

  await prisma.payment.upsert({
    where: { lessonId: markLesson.id },
    update: { status: PaymentStatus.WAITING },
    create: { lessonId: markLesson.id, status: PaymentStatus.WAITING },
  });

  console.log(`Seeded demo users. Admin: ${admin.email}, student: ${anya.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
