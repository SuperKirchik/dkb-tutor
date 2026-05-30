import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const source = await prisma.lesson.findUnique({
    where: { id },
  });

  if (!source) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const nextDate = new Date(source.date);
  nextDate.setDate(nextDate.getDate() + 7);
  const body = await request.json().catch(() => ({}));
  const scheduledDate = typeof body.date === "string" ? new Date(body.date) : nextDate;

  const lesson = await prisma.lesson.create({
    data: {
      title: source.title,
      subject: source.subject,
      teacher: source.teacher,
      date: Number.isNaN(scheduledDate.getTime()) ? nextDate : scheduledDate,
      videoLink: source.videoLink,
      boardLink: source.boardLink,
      homework: typeof body.homework === "string" ? body.homework : source.homework,
      homeworkFile: typeof body.homeworkFile === "string" ? body.homeworkFile : source.homeworkFile,
      studentId: source.studentId,
    },
    include: {
      student: { select: { id: true, name: true, email: true } },
      payment: true,
    },
  });

  return NextResponse.json({ lesson }, { status: 201 });
}
