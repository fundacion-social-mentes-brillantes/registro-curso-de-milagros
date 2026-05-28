import { CalendarDays, CheckCircle2 } from "lucide-react";

function Header({ formattedDate, lessonNumber }) {
  const lessonLabel =
    lessonNumber > 0 ? `Lección ${lessonNumber}` : "El curso inicia pronto";

  return (
    <header className="space-y-6">
      <div className="flex flex-col gap-6 rounded-b-lg bg-white px-5 py-8 shadow-soft sm:px-8 lg:px-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-700">
              Registro diario
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
              Registro Curso de Milagros
            </h1>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Compartido
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-4 text-slate-700">
            <CalendarDays className="h-5 w-5 text-slate-500" aria-hidden="true" />
            <span className="first-letter:uppercase">{formattedDate}</span>
          </div>

          <div className="rounded-lg bg-amber-50 px-4 py-4">
            <span className="text-sm font-medium text-amber-800">
              Lección del día
            </span>
            <p className="text-2xl font-semibold text-slate-950">{lessonLabel}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
