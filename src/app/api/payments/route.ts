import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const payments = await prisma.payment.findMany({
    include: {
      lesson: {
        include: { student: { select: { id: true, name: true, email: true } } },
      },
    },
    orderBy: { lesson: { date: "asc" } },
  });

  return NextResponse.json({ payments });
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const payment = await prisma.payment.upsert({
    where: { lessonId: body.lessonId },
    create: {
      lessonId: body.lessonId,
      status: body.status,
    },
    update: {
      status: body.status,
    },
    include: {
      lesson: {
        include: { student: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  return NextResponse.json({ payment });
}
