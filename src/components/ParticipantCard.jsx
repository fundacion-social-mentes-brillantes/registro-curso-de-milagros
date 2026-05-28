import { useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  RotateCcw,
  Trophy,
} from "lucide-react";

function statusClasses(status) {
  if (status === "Al dÃ­a") {
    return "bg-emerald-100 text-emerald-800";
  }

  if (status === "Completado") {
    return "bg-sky-100 text-sky-800";
  }

  if (status === "Sin iniciar") {
    return "bg-slate-100 text-slate-700";
  }

  return "bg-amber-100 text-amber-800";
}

function ParticipantCard({
  participant,
  onMarkLesson,
  onRemoveLastLesson,
  disabled,
  savingParticipantId,
  todayKey,
}) {
  const [isDatePanelOpen, setIsDatePanelOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const isSaving = savingParticipantId === participant.id;
  const canMark = participant.nextLesson <= 365;
  const canRemove = participant.lastCompletedLesson > 0;

  const handleSaveWithDate = () => {
    onMarkLesson(participant, selectedDate);
    setIsDatePanelOpen(false);
  };

  return (
    <article className="flex min-h-[310px] flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold leading-snug text-slate-950">
              {participant.name}
            </h3>
            <span
              className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${statusClasses(
                participant.status,
              )}`}
            >
              {participant.status === "Completado" ? (
                <Trophy className="h-4 w-4" aria-hidden="true" />
              ) : participant.status === "Al dÃ­a" ? (
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              ) : (
                <CircleDashed className="h-4 w-4" aria-hidden="true" />
              )}
              {participant.status}
            </span>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-800">
            {participant.completedUntil}
          </div>
        </div>

        <div className="grid gap-3 text-sm text-slate-600">
          <div className="rounded-lg bg-slate-50 p-3">
            <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Va en
            </span>
            <p className="mt-1 text-xl font-semibold text-slate-950">
              {participant.isCourseCompleted
                ? "Curso completado"
                : `LecciÃ³n ${participant.nextLesson}`}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-slate-50 p-3">
              <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                CompletÃ³ hasta
              </span>
              <p className="mt-1 text-lg font-semibold text-slate-950">
                LecciÃ³n {participant.completedUntil}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Camino
              </span>
              <p className="mt-1 text-lg font-semibold text-slate-950">
                {participant.completedUntil} / 365
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3">
            <CalendarClock className="h-4 w-4 text-slate-500" aria-hidden="true" />
            <span>Ãšltima actividad: {participant.lastActivityLabel}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <button
          type="button"
          onClick={() => onMarkLesson(participant, todayKey)}
          disabled={disabled || isSaving || !canMark}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          {canMark
            ? `Marcar lecciÃ³n ${participant.nextLesson} hecha`
            : "Curso completado"}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedDate(todayKey);
              setIsDatePanelOpen((current) => !current);
            }}
            disabled={disabled || isSaving || !canMark}
            className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cambiar fecha
          </button>
          <button
            type="button"
            onClick={() => onRemoveLastLesson(participant)}
            disabled={disabled || isSaving || !canRemove}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Quitar Ãºltima
          </button>
        </div>

        {isDatePanelOpen && (
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
            <p className="text-sm font-semibold text-emerald-900">
              Registrar lecciÃ³n {participant.nextLesson}
            </p>
            <label className="mt-3 block text-sm font-medium text-slate-700">
              Fecha de realizaciÃ³n
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="mt-1 h-11 w-full rounded-lg border border-emerald-200 bg-white px-3 text-base text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </label>
            <button
              type="button"
              onClick={handleSaveWithDate}
              disabled={disabled || isSaving || !selectedDate}
              className="mt-3 min-h-11 w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Guardar lecciÃ³n hecha
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default ParticipantCard;

