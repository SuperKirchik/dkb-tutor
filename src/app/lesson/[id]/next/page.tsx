import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ScheduleNextLessonForm } from "@/components/ScheduleNextLessonForm";
import { getCurrentUserFromCookie } from "@/lib/auth";
import { lessonDateInputValue, lessonDateTimeLabel, lessonTimeInputValue } from "@/lib/lessonDate";
import { prisma } from "@/lib/prisma";

export default async function ScheduleNextLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUserFromCookie();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { student: { select: { name: true } } },
  });

  if (!lesson) notFound();

  const nextDate = new Date(lesson.date);
  nextDate.setDate(nextDate.getDate() + 7);
  const nextDateLabel = lessonDateTimeLabel(nextDate);
  const nextDateValue = lessonDateInputValue(nextDate);
  const nextTimeValue = lessonTimeInputValue(nextDate);

  return (
    <AppShell active="/schedule">
      <header className="page-title">
        <div>
          <p className="eyebrow">Назначение</p>
          <h1>Следующий урок</h1>
        </div>
      </header>

      <ScheduleNextLessonForm
        lesson={{
          subject: lesson.subject,
          title: lesson.title,
          teacher: lesson.teacher,
          studentName: lesson.student.name,
          videoLink: lesson.videoLink,
          boardLink: lesson.boardLink,
          homework: lesson.homework,
          homeworkFile: lesson.homeworkFile,
        }}
        lessonId={lesson.id}
        nextDateLabel={nextDateLabel}
        nextDateValue={nextDateValue}
        nextTimeValue={nextTimeValue}
      />
    </AppShell>
  );
}
