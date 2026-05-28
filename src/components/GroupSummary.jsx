import { CircleCheckBig, CircleDashed, UsersRound } from "lucide-react";

function GroupSummary({ total, completed, pending, progress }) {
  return (
    <section className="space-y-4" aria-labelledby="group-summary-title">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">
            Resumen del grupo
          </p>
          <h2 id="group-summary-title" className="text-2xl font-semibold text-slate-950">
            Avance de hoy
          </h2>
        </div>
        <p className="text-sm text-slate-600">{progress}% completado</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-slate-500">
            <UsersRound className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm font-medium">Total</span>
          </div>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{total}</p>
        </div>

        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <CircleCheckBig className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm font-medium">Hechas</span>
          </div>
          <p className="mt-3 text-3xl font-semibold text-emerald-900">{completed}</p>
        </div>

        <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-700">
            <CircleDashed className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm font-medium">Faltan</span>
          </div>
          <p className="mt-3 text-3xl font-semibold text-amber-900">{pending}</p>
        </div>
      </div>

      <div className="h-4 overflow-hidden rounded-full bg-slate-200" aria-label="Barra de progreso">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </section>
  );
}

export default GroupSummary;
