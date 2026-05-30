import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";

const allowedTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
]);

function cleanFileName(name: string) {
  return name.replace(/[^\wа-яА-ЯёЁ.-]+/g, "_");
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  if (!allowedTypes.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "materials");
  await mkdir(uploadDir, { recursive: true });

  const storedName = `${randomUUID()}-${cleanFileName(file.name)}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, storedName), bytes);

  return NextResponse.json({
    file: {
      name: file.name,
      url: `/api/uploads/materials/${storedName}`,
    },
  });
}
