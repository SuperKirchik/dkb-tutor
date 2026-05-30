import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const board = await prisma.studentBoard.create({
    data: {
      studentId: id,
      title: body.title,
      subject: body.subject,
      url: body.url,
    },
  });

  return NextResponse.json({ board }, { status: 201 });
}
