import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { sendLessonResultEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";

const paymentLabels = {
  PAID: "Оплачено",
  WAITING: "Ожидает оплату",
  OVERDUE: "Просрочено",
} as const;

function scoreValue(value: unknown) {
  const score = Number(value);
  if (!Number.isInteger(score) || score < 0 || score > 100) return null;
  return score;
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Unknown email delivery error";
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const classScore = scoreValue(body.classScore);
  const homeworkScore = scoreValue(body.homeworkScore);
  const teacherComment = typeof body.teacherComment === "string" ? body.teacherComment.trim() : "";

  if (classScore === null || homeworkScore === null) {
    return NextResponse.json({ error: "Scores must be integers from 0 to 100" }, { status: 400 });
  }

  const lesson = await prisma.lesson.update({
    where: { id },
    data: {
      isCompleted: true,
      completedAt: new Date(),
      classScore,
      homeworkScore,
    },
    include: {
      student: { select: { id: true, name: true, email: true } },
      payment: true,
    },
  });

  const latestSubmission = await prisma.homeworkSubmission.findFirst({
    where: {
      lessonId: lesson.id,
      studentId: lesson.student.id,
    },
    orderBy: { createdAt: "desc" },
  });

  const feedback = teacherComment || null;
  if (latestSubmission) {
    await prisma.homeworkSubmission.update({
      where: { id: latestSubmission.id },
      data: {
        feedback,
        status: "CHECKED",
      },
    });
  } else {
    await prisma.homeworkSubmission.create({
      data: {
        lessonId: lesson.id,
        studentId: lesson.student.id,
        feedback,
        status: "CHECKED",
      },
    });
  }

  const overdueLessons = await prisma.lesson.findMany({
    where: {
      studentId: lesson.student.id,
      id: { not: lesson.id },
      payment: { status: "OVERDUE" },
    },
    include: { payment: true },
    orderBy: { date: "asc" },
  });

  let email: { sent: boolean; reason?: string } = { sent: false, reason: "Not sent" };
  try {
    email = await sendLessonResultEmail({
      to: lesson.student.email,
      lessonTitle: lesson.title,
      subject: lesson.subject,
      teacher: lesson.teacher,
      date: lesson.date,
      classScore,
      homeworkScore,
      teacherComment,
      paymentStatus: lesson.payment ? paymentLabels[lesson.payment.status] : "Не отмечена",
      overdueLessons: overdueLessons.map((item) => ({
        title: item.title,
        subject: item.subject,
        date: item.date,
        status: item.payment ? paymentLabels[item.payment.status] : "Не отмечена",
      })),
    });
  } catch (error) {
    const reason = errorMessage(error);
    console.error("Email delivery failed", {
      lessonId: lesson.id,
      studentEmail: lesson.student.email,
      reason,
    });
    email = { sent: false, reason };
  }

  return NextResponse.json({ lesson, email });
}
