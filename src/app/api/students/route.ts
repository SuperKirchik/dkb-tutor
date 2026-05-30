import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: {
      id: true,
      name: true,
      email: true,
      lessonCallLink: true,
      role: true,
      boards: { select: { id: true, title: true, subject: true, url: true }, orderBy: { subject: "asc" } },
      lessonsAsStudent: { select: { subject: true }, take: 1, orderBy: { date: "desc" } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ students });
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const password = await bcrypt.hash(body.password || "12345678", 10);

  const student = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      lessonCallLink: body.lessonCallLink || null,
      password,
      role: "STUDENT",
    },
    select: {
      id: true,
      name: true,
      email: true,
      lessonCallLink: true,
      role: true,
      boards: { select: { id: true, title: true, subject: true, url: true }, orderBy: { subject: "asc" } },
      lessonsAsStudent: { select: { subject: true }, take: 1, orderBy: { date: "desc" } },
    },
  });

  return NextResponse.json({ student }, { status: 201 });
}
