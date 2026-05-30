import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const data: { name?: string; email?: string; password?: string; lessonCallLink?: string | null } = {
    name: body.name,
    email: body.email,
    lessonCallLink: body.lessonCallLink || null,
  };

  if (body.password) {
    data.password = await bcrypt.hash(body.password, 10);
  }

  const student = await prisma.user.update({
    where: { id },
    data,
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

  return NextResponse.json({ student });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
