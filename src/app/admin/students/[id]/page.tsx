import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { StudentLinksEditor } from "@/components/StudentLinksEditor";
import { StudentProgress } from "@/components/StudentProgress";
import { getCurrentUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminStudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await getCurrentUserFromCookie();
  if (!auth) redirect("/login");
  if (auth.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;
  const student = await prisma.user.findUnique({
    where: { id, role: "STUDENT" },
    select: {
      id: true,
      name: true,
      email: true,
      lessonCallLink: true,
      boards: { select: { id: true, title: true, subject: true, url: true }, orderBy: { subject: "asc" } },
    },
  });

  if (!student) notFound();

  const completedLessons = await prisma.lesson.findMany({
    where: {
      studentId: student.id,
      isCompleted: true,
    },
    select: {
      id: true,
      title: true,
      subject: true,
      date: true,
      completedAt: true,
      classScore: true,
      homeworkScore: true,
    },
    orderBy: [{ completedAt: "desc" }, { date: "desc" }],
  });

  return (
    <AppShell active="/admin">
      <header className="page-title">
        <div>
          <p className="eyebrow">Профиль ученика</p>
          <h1>{student.name}</h1>
          <p className="muted-text">{student.email}</p>
        </div>
      </header>

      <section className="panel profile-form">
        <label>
          Имя
          <input defaultValue={student.name} readOnly type="text" />
        </label>
        <label>
          Email
          <input defaultValue={student.email} readOnly type="email" />
        </label>
      </section>

      <StudentLinksEditor student={student} />

      <StudentProgress lessons={completedLessons} />
    </AppShell>
  );
}
