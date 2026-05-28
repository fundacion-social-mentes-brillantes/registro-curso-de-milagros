function RecentHistory({ lessonNumbers, countsByLesson, total, currentLessonNumber }) {
  if (lessonNumbers.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4" aria-labelledby="recent-history-title">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">
          Historial reciente
        </p>
        <h2 id="recent-history-title" className="text-2xl font-semibold text-slate-950">
          Últimas lecciones
        </h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {lessonNumbers.map((lessonNumber) => {
          const completed = countsByLesson[lessonNumber] ?? 0;
          const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
          const isToday = lessonNumber === currentLessonNumber;

          return (
            <article
              key={lessonNumber}
              className={`rounded-lg border bg-white p-4 ${
                isToday ? "border-emerald-200" : "border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-950">Lección {lessonNumber}</h3>
                  <p className="text-sm text-slate-600">
                    {completed} de {total} personas
                  </p>
                </div>
                {isToday && (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-800">
                    Hoy
                  </span>
                )}
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default RecentHistory;
