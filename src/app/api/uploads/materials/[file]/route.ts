import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const contentTypes: Record<string, string> = {
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const safeFile = path.basename(file);
  const filePath = path.join(process.cwd(), "public", "uploads", "materials", safeFile);

  try {
    await stat(filePath);
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const stream = createReadStream(filePath);
  const extension = path.extname(safeFile).toLowerCase();

  return new Response(stream as unknown as BodyInit, {
    headers: {
      "Content-Type": contentTypes[extension] ?? "application/octet-stream",
      "Content-Disposition": `inline; filename="${encodeURIComponent(safeFile)}"`,
    },
  });
}
