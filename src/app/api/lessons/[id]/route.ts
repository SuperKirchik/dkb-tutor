import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const student = await prisma.user.findUnique({
    where: { id: body.studentId },
    select: { lessonCallLink: true },
  });

  const lesson = await prisma.lesson.update({
    where: { id },
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

  return NextResponse.json({ lesson });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.lesson.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
