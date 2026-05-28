import { CheckCircle2, Clock3 } from "lucide-react";

function RecentHistory({ lessonNumbers, countsByLesson, total, currentLessonNumber, actions }) {
  if (lessonNumbers.length === 0 && actions.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6" aria-labelledby="recent-history-title">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">
          Historial
        </p>
        <h2 id="recent-history-title" className="text-2xl font-semibold text-slate-950">
          Lecciones y últimas acciones
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-3 md:grid-cols-2">
          {lessonNumbers.map((lessonNumber) => {
            const completed = countsByLesson[lessonNumber] ?? 0;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
            const isCalendarLesson = lessonNumber === currentLessonNumber;

            return (
              <article
                key={lessonNumber}
                className={`rounded-lg border bg-white p-4 ${
                  isCalendarLesson ? "border-emerald-200" : "border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-950">
                      Lección {lessonNumber}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {completed} de {total} personas
                    </p>
                  </div>
                  {isCalendarLesson && (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-800">
                      Calendario
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

        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-slate-500" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-slate-950">Últimas acciones</h3>
          </div>
          <div className="mt-4 space-y-3">
            {actions.length > 0 ? (
              actions.map((action) => (
                <div key={action.id} className="flex gap-3 rounded-lg bg-slate-50 p-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-950">
                      {action.participantName} marcó Lección {action.lessonNumber}
                    </p>
                    <p className="text-sm text-slate-600">{action.dateLabel}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">
                Todavía no hay acciones registradas.
              </p>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

export default RecentHistory;
