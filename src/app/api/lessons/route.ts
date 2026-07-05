import { NextResponse } from "next/server";
import { getCurrentUserFromCookie, isAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUserFromCookie();
  const lessons = await prisma.lesson.findMany({
    where: user?.role === "STUDENT" ? { studentId: user.sub } : undefined,
    include: {
      student: { select: { id: true, name: true, email: true } },
      payment: true,
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ lessons });
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const student = await prisma.user.findUnique({
    where: { id: body.studentId },
    select: { lessonCallLink: true },
  });

  const lesson = await prisma.lesson.create({
    data: {
      title: body.title,
      subject: body.subject,
      teacher: body.teacher || "Дроздов Кирилл Борисович",
      date: new Date(body.date),
      videoLink: body.videoLink || student?.lessonCallLink || null,
      boardLink: body.boardLink,
      homework: body.homework,
      homeworkFile: body.homeworkFile,
      studentId: body.studentId,
    },
    include: {
      student: { select: { id: true, name: true, email: true } },
      payment: true,
    },
  });

  return NextResponse.json({ lesson }, { status: 201 });
}
