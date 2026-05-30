import Link from "next/link";

type CompletedLesson = {
  id: string;
  title: string;
  subject: string;
  date: Date;
  completedAt: Date | null;
  classScore: number | null;
  homeworkScore: number | null;
};

type StudentProgressProps = {
  lessons: CompletedLesson[];
};

function average(values: number[]) {
  if (!values.length) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function scoreStats(lessons: CompletedLesson[], days?: number) {
  const from = days ? Date.now() - days * 24 * 60 * 60 * 1000 : null;
  const filtered = lessons.filter((lesson) => {
    if (!from) return true;
    const date = lesson.completedAt ?? lesson.date;
    return date.getTime() >= from;
  });

  return {
    classScore: average(filtered.flatMap((lesson) => (lesson.classScore === null ? [] : [lesson.classScore]))),
    homeworkScore: average(filtered.flatMap((lesson) => (lesson.homeworkScore === null ? [] : [lesson.homeworkScore]))),
  };
}

function scoreText(score: number | null) {
  return score === null ? "Нет оценок" : `${score}%`;
}

export function StudentProgress({ lessons }: StudentProgressProps) {
  const weekStats = scoreStats(lessons, 7);
  const monthStats = scoreStats(lessons, 30);
  const allTimeStats = scoreStats(lessons);

  return (
    <>
      <section className="dashboard-grid">
        <article className="panel">
          <p className="eyebrow">Неделя</p>
          <h2>Средние оценки</h2>
          <div className="score-grid">
            <div>
              <span>Работа на уроке</span>
              <strong>{scoreText(weekStats.classScore)}</strong>
            </div>
            <div>
              <span>Домашнее задание</span>
              <strong>{scoreText(weekStats.homeworkScore)}</strong>
            </div>
          </div>
        </article>
        <article className="panel">
          <p className="eyebrow">Месяц</p>
          <h2>Средние оценки</h2>
          <div className="score-grid">
            <div>
              <span>Работа на уроке</span>
              <strong>{scoreText(monthStats.classScore)}</strong>
            </div>
            <div>
              <span>Домашнее задание</span>
              <strong>{scoreText(monthStats.homeworkScore)}</strong>
            </div>
          </div>
        </article>
        <article className="panel">
          <p className="eyebrow">Все время</p>
          <h2>Средние оценки</h2>
          <div className="score-grid">
            <div>
              <span>Работа на уроке</span>
              <strong>{scoreText(allTimeStats.classScore)}</strong>
            </div>
            <div>
              <span>Домашнее задание</span>
              <strong>{scoreText(allTimeStats.homeworkScore)}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Завершенные уроки</p>
            <h2>Оценки по урокам</h2>
          </div>
        </div>
        <div className="table-list">
          {lessons.length ? (
            lessons.map((lesson) => (
              <Link className="table-row" href={`/lesson/${lesson.id}`} key={lesson.id}>
                <div>
                  <strong>
                    {lesson.subject}: {lesson.title}
                  </strong>
                  <span>{(lesson.completedAt ?? lesson.date).toLocaleDateString("ru-RU")}</span>
                </div>
                <div>
                  <strong>{scoreText(lesson.classScore)}</strong>
                  <span>Работа на уроке</span>
                </div>
                <div>
                  <strong>{scoreText(lesson.homeworkScore)}</strong>
                  <span>Домашнее задание</span>
                </div>
                <span className="status done">Завершен</span>
              </Link>
            ))
          ) : (
            <p className="muted-text">Завершенных уроков пока нет.</p>
          )}
        </div>
      </section>
    </>
  );
}
