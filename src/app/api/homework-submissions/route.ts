import { NextResponse } from "next/server";
import { getCurrentUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentUserFromCookie();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const lesson = await prisma.lesson.findUnique({ where: { id: body.lessonId } });
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  if (user.role === "STUDENT" && lesson.studentId !== user.sub) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const submission = await prisma.homeworkSubmission.create({
    data: {
      lessonId: body.lessonId,
      studentId: user.role === "STUDENT" ? user.sub : body.studentId,
      comment: body.comment,
      file: body.file,
    },
  });

  return NextResponse.json({ submission }, { status: 201 });
}
