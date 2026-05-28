import {
  BarChart3,
  CircleCheckBig,
  CircleDashed,
  Gauge,
  PauseCircle,
  UsersRound,
} from "lucide-react";

function MetricCard({ icon: Icon, label, value, helper, tone = "slate" }) {
  const tones = {
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-800",
    amber: "border-amber-100 bg-amber-50 text-amber-800",
    sky: "border-sky-100 bg-sky-50 text-sky-800",
    slate: "border-slate-200 bg-white text-slate-700",
  };

  return (
    <article className={`rounded-lg border p-4 ${tones[tone]}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5" aria-hidden="true" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
      {helper && <p className="mt-1 text-sm text-slate-600">{helper}</p>}
    </article>
  );
}

function getStatusClass(status) {
  const classes = {
    "Al día": "bg-emerald-100 text-emerald-800",
    Pendiente: "bg-amber-100 text-amber-800",
    "Sin iniciar": "bg-slate-200 text-slate-700",
    Completado: "bg-sky-100 text-sky-800",
  };

  return classes[status] ?? classes.Pendiente;
}

function GroupSummary({ summary, lessonDistribution, participants }) {
  const circleStyle = {
    background: `conic-gradient(#10b981 ${summary.overallProgressPercent}%, #e2e8f0 0)`,
  };

  return (
    <section className="space-y-6" aria-labelledby="group-summary-title">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">
            Resumen del grupo
          </p>
          <h2 id="group-summary-title" className="text-2xl font-semibold text-slate-950">
            Avance compartido
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-600">
          Cada persona avanza a su ritmo, sin saltarse el camino.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <article className="flex flex-col items-center justify-center rounded-lg border border-emerald-100 bg-white p-6 text-center shadow-sm">
          <div
            className="flex h-36 w-36 items-center justify-center rounded-full"
            style={circleStyle}
            aria-label={`Progreso general ${summary.overallProgressPercent}%`}
          >
            <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white">
              <span className="text-3xl font-semibold text-slate-950">
                {summary.overallProgressPercent}%
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                General
              </span>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Promedio: {summary.averageCompleted} lecciones completadas por persona.
          </p>
        </article>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={UsersRound}
            label="Participantes"
            value={summary.totalParticipants}
            helper="Grupo activo"
          />
          <MetricCard
            icon={CircleCheckBig}
            label="Al día"
            value={summary.onTrackCount}
            helper="Van con el calendario"
            tone="emerald"
          />
          <MetricCard
            icon={CircleDashed}
            label="Atrasadas"
            value={summary.behindCount}
            helper="Continúan desde su siguiente lección"
            tone="amber"
          />
          <MetricCard
            icon={PauseCircle}
            label="Sin iniciar"
            value={summary.notStartedCount}
            helper="Todavía en lección 1"
          />
          <MetricCard
            icon={Gauge}
            label="Lección promedio"
            value={summary.averageCurrentLesson}
            helper="Va en esta lección"
            tone="sky"
          />
          <MetricCard
            icon={BarChart3}
            label="Camino promedio"
            value={`${summary.averageCompleted} / 365`}
            helper="Completadas"
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-lg font-semibold text-slate-950">
            Personas en cada lección
          </h3>
          <div className="mt-4 space-y-3">
            {lessonDistribution.length > 0 ? (
              lessonDistribution.map((item) => {
                const width =
                  summary.totalParticipants > 0
                    ? Math.round((item.count / summary.totalParticipants) * 100)
                    : 0;

                return (
                  <div key={item.lesson} className="space-y-1">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-slate-700">{item.label}</span>
                      <span className="text-slate-500">
                        {item.count} persona{item.count === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-600">Aún no hay datos de avance.</p>
            )}
          </div>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-lg font-semibold text-slate-950">
            Resumen por persona
          </h3>
          <div className="mt-4 max-h-[520px] space-y-2 overflow-y-auto pr-1">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="grid gap-2 rounded-lg bg-slate-50 p-3 text-sm sm:grid-cols-[1.2fr_0.8fr_0.9fr_0.8fr_0.9fr]"
              >
                <span className="font-semibold text-slate-950">{participant.name}</span>
                <span>Va en {participant.nextLessonLabel}</span>
                <span>Completó hasta {participant.completedUntil}</span>
                <span
                  className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                    participant.status,
                  )}`}
                >
                  {participant.status}
                </span>
                <span className="text-slate-600">{participant.lastActivityLabel}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

export default GroupSummary;
