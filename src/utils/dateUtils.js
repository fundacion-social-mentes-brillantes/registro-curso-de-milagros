export const COURSE_START_DATE = new Date(2026, 4, 26);
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getLessonNumber(date = new Date()) {
  const targetDay = startOfLocalDay(date);
  const startDay = startOfLocalDay(COURSE_START_DATE);
  const diffDays = Math.floor((targetDay.getTime() - startDay.getTime()) / MS_PER_DAY);

  return diffDays >= 0 ? diffDays + 1 : 0;
}

export function formatDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatLongDate(date = new Date()) {
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatReadableDate(dateKey) {
  if (!dateKey) {
    return "Sin actividad";
  }

  const [year, month, day] = dateKey.split("-").map(Number);

  if (!year || !month || !day) {
    return "Sin actividad";
  }

  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

export function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function normalizeNameForId(name) {
  return normalizeText(name)
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function getRecentLessonNumbers(currentLessonNumber, amount = 7) {
  if (currentLessonNumber < 1) {
    return [];
  }

  const firstLesson = Math.max(1, currentLessonNumber - amount + 1);

  return Array.from(
    { length: currentLessonNumber - firstLesson + 1 },
    (_, index) => firstLesson + index,
  );
}

