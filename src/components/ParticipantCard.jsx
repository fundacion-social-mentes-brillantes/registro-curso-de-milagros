import { CheckCircle2, Circle, RotateCcw } from "lucide-react";

function ParticipantCard({ name, isCompleted, onToggle, disabled }) {
  return (
    <article
      className={`flex min-h-[168px] flex-col justify-between rounded-lg border bg-white p-5 shadow-sm transition ${
        isCompleted
          ? "border-emerald-200 bg-emerald-50/70"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold leading-snug text-slate-950">{name}</h3>
          <p
            className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
              isCompleted
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Circle className="h-4 w-4" aria-hidden="true" />
            )}
            {isCompleted ? "Hecha" : "Pendiente"}
          </p>
        </div>

        {isCompleted && (
          <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-600" aria-hidden="true" />
        )}
      </div>

      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-pressed={isCompleted}
        className={`mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-base font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${
          isCompleted
            ? "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 focus:ring-slate-200"
            : "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-200"
        }`}
      >
        {isCompleted ? (
          <RotateCcw className="h-5 w-5" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
        )}
        {isCompleted ? "Quitar chulo" : "Marcar hecha"}
      </button>
    </article>
  );
}

export default ParticipantCard;
