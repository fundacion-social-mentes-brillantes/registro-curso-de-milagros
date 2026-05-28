import { Search } from "lucide-react";
import ParticipantCard from "./ParticipantCard.jsx";

function ParticipantGrid({
  participants,
  searchTerm,
  onSearchChange,
  onMarkLesson,
  onRemoveLastLesson,
  disabled,
  savingParticipantId,
  todayKey,
}) {
  return (
    <section className="space-y-5" aria-labelledby="participants-title">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">
            Participantes
          </p>
          <h2 id="participants-title" className="text-2xl font-semibold text-slate-950">
            Avance individual
          </h2>
        </div>

        <label className="relative block w-full lg:max-w-sm">
          <span className="sr-only">Buscar por nombre</span>
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar nombre"
            className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
          />
        </label>
      </div>

      {participants.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {participants.map((participant) => (
            <ParticipantCard
              key={participant.id}
              participant={participant}
              onMarkLesson={onMarkLesson}
              onRemoveLastLesson={onRemoveLastLesson}
              disabled={disabled}
              savingParticipantId={savingParticipantId}
              todayKey={todayKey}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600">
          No se encontraron participantes con ese nombre.
        </div>
      )}
    </section>
  );
}

export default ParticipantGrid;
