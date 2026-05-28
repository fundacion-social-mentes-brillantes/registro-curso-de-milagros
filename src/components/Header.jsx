import { CalendarDays, CheckCircle2, Sparkles } from "lucide-react";

function Header({ formattedDate, lessonNumber }) {
  const lessonLabel =
    lessonNumber > 0 ? `LecciÃ³n ${lessonNumber}` : "El curso inicia pronto";

  return (
    <header className="space-y-6">
      <div className="flex flex-col gap-6 rounded-b-lg border-b border-emerald-100 bg-white px-5 py-7 shadow-soft sm:px-8 lg:px-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-emerald-700">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Avance personal
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
              Registro Curso de Milagros
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Cada persona avanza a su ritmo, sin saltarse el camino.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Compartido
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-4 text-slate-700">
            <CalendarDays className="h-5 w-5 text-slate-500" aria-hidden="true" />
            <span className="first-letter:uppercase">{formattedDate}</span>
          </div>

          <div className="rounded-lg bg-amber-50 px-4 py-4">
            <span className="text-sm font-medium text-amber-800">
              LecciÃ³n sugerida por calendario
            </span>
            <p className="text-2xl font-semibold text-slate-950">{lessonLabel}</p>
          </div>

          <div className="rounded-lg bg-emerald-50 px-4 py-4">
            <span className="text-sm font-medium text-emerald-800">
              Inicio del curso
            </span>
            <p className="text-base font-semibold text-slate-950">
              26 de mayo de 2026 = LecciÃ³n 1
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

