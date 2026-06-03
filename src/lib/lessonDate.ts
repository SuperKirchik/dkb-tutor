export const LESSON_TIME_ZONE = "Europe/Moscow";

function asDate(date: Date | string) {
  return date instanceof Date ? date : new Date(date);
}

function dateParts(date: Date | string) {
  const parts = new Intl.DateTimeFormat("ru-RU", {
    timeZone: LESSON_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(asDate(date));

  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

export function formatLessonDate(date: Date | string) {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: LESSON_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(asDate(date));
}

export function formatLessonTime(date: Date | string) {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: LESSON_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(asDate(date));
}

export function lessonDateInputValue(date: Date | string) {
  const parts = dateParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function lessonTimeInputValue(date: Date | string) {
  const parts = dateParts(date);
  return `${parts.hour}:${parts.minute}`;
}

export function lessonDateTimeLabel(date: Date | string) {
  return `${formatLessonDate(date)}, ${formatLessonTime(date)}`;
}
