import { useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarDays, History, UsersRound } from "lucide-react";
import Header from "./components/Header.jsx";
import GroupSummary from "./components/GroupSummary.jsx";
import ParticipantGrid from "./components/ParticipantGrid.jsx";
import RecentHistory from "./components/RecentHistory.jsx";
import participantNames from "./data/participants.js";
import { isSupabaseConfigured, supabase } from "./supabaseClient.js";
import {
  formatDateKey,
  formatLongDate,
  formatReadableDate,
  getLessonNumber,
  normalizeNameForId,
  normalizeText,
} from "./utils/dateUtils.js";

const TOTAL_LESSONS = 365;
const LOCAL_STORAGE_KEY = "registro-curso-milagros-supabase-checks";
const localParticipants = participantNames.map((name, index) => ({
  id: normalizeNameForId(name),
  name,
  display_order: index + 1,
  active: true,
}));

const tabs = [
  { id: "hoy", label: "Hoy", icon: CalendarDays },
  { id: "participantes", label: "Participantes", icon: UsersRound },
  { id: "resumen", label: "Resumen", icon: BarChart3 },
  { id: "historial", label: "Historial", icon: History },
];

function getLessonCheckKey(participantId, lessonNumber) {
  return `${participantId}:${lessonNumber}`;
}

function loadLocalChecks() {
  try {
    const savedChecks = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    return savedChecks ? JSON.parse(savedChecks) : {};
  } catch (error) {
    console.warn("No se pudo leer el respaldo local.", error);
    return {};
  }
}

function saveLocalChecks(checks) {
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(checks));
  } catch (error) {
    console.warn("No se pudo guardar el respaldo local.", error);
  }
}

function sortByUpdatedAtDesc(a, b) {
  return new Date(b.updated_at ?? b.lesson_date ?? 0) - new Date(a.updated_at ?? a.lesson_date ?? 0);
}

function buildParticipantProgress(participant, checks, suggestedLessonNumber) {
  const participantChecks = checks.filter(
    (check) =>
      check.participant_id === participant.id &&
      check.lesson_number >= 1 &&
      check.lesson_number <= TOTAL_LESSONS,
  );
  const completedChecks = participantChecks
    .filter((check) => check.completed === true)
    .sort((a, b) => a.lesson_number - b.lesson_number);
  const completedNumbers = new Set(completedChecks.map((check) => check.lesson_number));

  let firstMissingLesson = 1;
  while (firstMissingLesson <= TOTAL_LESSONS && completedNumbers.has(firstMissingLesson)) {
    firstMissingLesson += 1;
  }

  const completedUntil = firstMissingLesson - 1;
  const isCourseCompleted = completedUntil >= TOTAL_LESSONS;
  const nextLesson = isCourseCompleted ? TOTAL_LESSONS + 1 : firstMissingLesson;
  const highestCompletedLesson =
    completedChecks.length > 0
      ? Math.max(...completedChecks.map((check) => check.lesson_number))
      : 0;
  const lastActivityCheck =
    completedChecks.length > 0 ? [...completedChecks].sort(sortByUpdatedAtDesc)[0] : null;
  const lastSequentialCheck =
    completedUntil > 0
      ? completedChecks.find((check) => check.lesson_number === completedUntil) ?? null
      : null;

  let status = "Pendiente";
  if (isCourseCompleted) {
    status = "Completado";
  } else if (completedChecks.length === 0) {
    status = "Sin iniciar";
  } else if (completedUntil >= suggestedLessonNumber) {
    status = "Al día";
  }

  return {
    ...participant,
    checks: participantChecks,
    completedUntil,
    completedCount: completedUntil,
    highestCompletedLesson,
    lastCompletedLesson: completedUntil,
    lastCompletedCheck: lastSequentialCheck,
    lastActivityLabel: lastActivityCheck
      ? formatReadableDate(lastActivityCheck.lesson_date)
      : "Sin actividad",
    nextLesson,
    nextLessonLabel: isCourseCompleted ? "curso completado" : `lección ${nextLesson}`,
    status,
    isCourseCompleted,
  };
}

function App() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [checksById, setChecksById] = useState(loadLocalChecks);
  const [participants, setParticipants] = useState(
    isSupabaseConfigured ? [] : localParticipants,
  );
  const [isSupabaseReady, setIsSupabaseReady] = useState(!isSupabaseConfigured);
  const [activeTab, setActiveTab] = useState("hoy");
  const [searchTerm, setSearchTerm] = useState("");
  const [savingParticipantId, setSavingParticipantId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(
    isSupabaseConfigured
      ? "Cargando datos desde Supabase..."
      : "Modo local activo: agrega VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para compartir el registro con el grupo.",
  );

  const suggestedLessonNumber = getLessonNumber(currentDate);
  const todayKey = formatDateKey(currentDate);
  const formattedDate = formatLongDate(currentDate);
  const checks = useMemo(() => Object.values(checksById), [checksById]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentDate(new Date());
    }, 60 * 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return undefined;
    }

    let isMounted = true;
    setIsSupabaseReady(false);

    async function fetchParticipants() {
      const { data, error } = await supabase
        .from("participants")
        .select("id, name, display_order, active")
        .eq("active", true)
        .order("display_order", { ascending: true });

      if (error) {
        throw error;
      }

      if (isMounted) {
        setParticipants(data ?? []);
      }
    }

    async function fetchChecks() {
      const { data, error } = await supabase
        .from("lesson_checks")
        .select("id, participant_id, lesson_number, lesson_date, completed, updated_at")
        .gte("lesson_number", 1)
        .lte("lesson_number", TOTAL_LESSONS)
        .order("updated_at", { ascending: false })
        .range(0, 20000);

      if (error) {
        throw error;
      }

      const nextChecks = (data ?? []).reduce((currentChecks, check) => {
        currentChecks[getLessonCheckKey(check.participant_id, check.lesson_number)] = check;
        return currentChecks;
      }, {});

      if (isMounted) {
        setChecksById(nextChecks);
        saveLocalChecks(nextChecks);
      }
    }

    async function loadSupabaseData() {
      try {
        await Promise.all([fetchParticipants(), fetchChecks()]);
        if (isMounted) {
          setIsSupabaseReady(true);
          setStatusMessage("");
        }
      } catch (error) {
        console.error("No se pudo conectar con Supabase.", error);
        if (isMounted) {
          setIsSupabaseReady(false);
          setStatusMessage(
            "No se pudo conectar con Supabase. Revisa las variables, el SQL, RLS y los permisos.",
          );
        }
      }
    }

    loadSupabaseData();

    const channel = supabase
      .channel("registro-curso-de-milagros")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "participants" },
        () => {
          fetchParticipants().catch((error) =>
            console.error("No se pudieron actualizar los participantes.", error),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lesson_checks" },
        () => {
          fetchChecks().catch((error) =>
            console.error("No se pudieron actualizar los registros.", error),
          );
        },
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const participantProgress = useMemo(() => {
    return participants.map((participant) =>
      buildParticipantProgress(participant, checks, suggestedLessonNumber),
    );
  }, [checks, participants, suggestedLessonNumber]);

  const filteredParticipants = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm);

    if (!normalizedSearch) {
      return participantProgress;
    }

    return participantProgress.filter((participant) =>
      normalizeText(participant.name).includes(normalizedSearch),
    );
  }, [participantProgress, searchTerm]);

  const summary = useMemo(() => {
    const totalParticipants = participantProgress.length;
    const completedSum = participantProgress.reduce(
      (sum, participant) => sum + participant.completedUntil,
      0,
    );
    const nextLessonSum = participantProgress.reduce(
      (sum, participant) => sum + Math.min(participant.nextLesson, TOTAL_LESSONS),
      0,
    );

    return {
      totalParticipants,
      onTrackCount: participantProgress.filter(
        (participant) => participant.status === "Al día" || participant.status === "Completado",
      ).length,
      behindCount: participantProgress.filter((participant) => participant.status === "Pendiente")
        .length,
      notStartedCount: participantProgress.filter(
        (participant) => participant.status === "Sin iniciar",
      ).length,
      completedCount: participantProgress.filter((participant) => participant.status === "Completado")
        .length,
      averageCompleted:
        totalParticipants > 0 ? Math.round((completedSum / totalParticipants) * 10) / 10 : 0,
      averageCurrentLesson:
        totalParticipants > 0 ? Math.round(nextLessonSum / totalParticipants) : 0,
      overallProgressPercent:
        totalParticipants > 0
          ? Math.round((completedSum / (totalParticipants * TOTAL_LESSONS)) * 100)
          : 0,
    };
  }, [participantProgress]);

  const countsByLesson = useMemo(() => {
    return checks.reduce((lessonCounts, check) => {
      if (check.completed === true) {
        lessonCounts[check.lesson_number] = (lessonCounts[check.lesson_number] ?? 0) + 1;
      }

      return lessonCounts;
    }, {});
  }, [checks]);

  const historyLessonNumbers = useMemo(() => {
    const completedLessonNumbers = Object.keys(countsByLesson).map(Number);
    const visibleSuggestedLesson = Math.min(Math.max(suggestedLessonNumber, 1), TOTAL_LESSONS);
    const startLesson =
      visibleSuggestedLesson <= 14 ? 1 : Math.max(1, visibleSuggestedLesson - 10);
    const calendarRange = Array.from(
      { length: visibleSuggestedLesson - startLesson + 1 },
      (_, index) => startLesson + index,
    );
    const upcomingWithData = completedLessonNumbers
      .filter((lessonNumber) => lessonNumber > visibleSuggestedLesson)
      .sort((a, b) => a - b)
      .slice(0, 8);

    return [...new Set([...calendarRange, ...upcomingWithData])].sort((a, b) => a - b);
  }, [countsByLesson, suggestedLessonNumber]);

  const recentActions = useMemo(() => {
    const participantsById = participantProgress.reduce((lookup, participant) => {
      lookup[participant.id] = participant.name;
      return lookup;
    }, {});

    return checks
      .filter((check) => check.completed === true)
      .sort(sortByUpdatedAtDesc)
      .slice(0, 8)
      .map((check) => ({
        id: `${check.participant_id}-${check.lesson_number}-${check.updated_at}`,
        participantName: participantsById[check.participant_id] ?? "Participante",
        lessonNumber: check.lesson_number,
        dateLabel: formatReadableDate(check.lesson_date),
      }));
  }, [checks, participantProgress]);

  const lessonDistribution = useMemo(() => {
    const distribution = participantProgress.reduce((items, participant) => {
      const lesson = participant.isCourseCompleted ? TOTAL_LESSONS : participant.nextLesson;
      const label = participant.isCourseCompleted
        ? "Curso completado"
        : `Lección ${participant.nextLesson}`;

      if (!items[lesson]) {
        items[lesson] = { lesson, label, count: 0 };
      }

      items[lesson].count += 1;
      return items;
    }, {});

    return Object.values(distribution).sort((a, b) => a.lesson - b.lesson);
  }, [participantProgress]);

  const updateLocalCheck = (participantId, lessonNumber, completed, lessonDate, existingId) => {
    const checkId = getLessonCheckKey(participantId, lessonNumber);

    setChecksById((currentChecks) => {
      const nextChecks = {
        ...currentChecks,
        [checkId]: {
          ...currentChecks[checkId],
          id: existingId ?? currentChecks[checkId]?.id ?? checkId,
          participant_id: participantId,
          lesson_number: lessonNumber,
          lesson_date: lessonDate,
          completed,
          updated_at: new Date().toISOString(),
        },
      };

      saveLocalChecks(nextChecks);
      return nextChecks;
    });
  };

  const handleMarkLesson = async (participant, lessonDate = todayKey) => {
    if (participant.nextLesson > TOTAL_LESSONS) {
      return;
    }

    const lessonToMark = participant.nextLesson;
    setSavingParticipantId(participant.id);

    if (!isSupabaseConfigured || !supabase) {
      updateLocalCheck(participant.id, lessonToMark, true, lessonDate);
      setSavingParticipantId(null);
      setStatusMessage("Cambio guardado solo en este navegador.");
      return;
    }

    const { data, error } = await supabase
      .from("lesson_checks")
      .upsert(
        {
          participant_id: participant.id,
          lesson_number: lessonToMark,
          lesson_date: lessonDate,
          completed: true,
        },
        { onConflict: "participant_id,lesson_number" },
      )
      .select("id, participant_id, lesson_number, lesson_date, completed, updated_at")
      .single();

    if (error) {
      console.error("No se pudo guardar el registro.", error);
      setStatusMessage("No se pudo guardar el cambio. Inténtalo de nuevo.");
    } else if (data) {
      updateLocalCheck(
        data.participant_id,
        data.lesson_number,
        data.completed,
        data.lesson_date,
        data.id,
      );
      setStatusMessage("");
    }

    setSavingParticipantId(null);
  };

  const handleRemoveLastLesson = async (participant) => {
    if (!participant.lastCompletedCheck) {
      return;
    }

    const checkToRemove = participant.lastCompletedCheck;
    setSavingParticipantId(participant.id);

    if (!isSupabaseConfigured || !supabase) {
      updateLocalCheck(
        participant.id,
        checkToRemove.lesson_number,
        false,
        checkToRemove.lesson_date ?? todayKey,
        checkToRemove.id,
      );
      setSavingParticipantId(null);
      setStatusMessage("Cambio guardado solo en este navegador.");
      return;
    }

    const { data, error } = await supabase
      .from("lesson_checks")
      .update({ completed: false })
      .eq("participant_id", participant.id)
      .eq("lesson_number", checkToRemove.lesson_number)
      .select("id, participant_id, lesson_number, lesson_date, completed, updated_at")
      .single();

    if (error) {
      console.error("No se pudo quitar la última lección.", error);
      setStatusMessage("No se pudo quitar la última lección. Inténtalo de nuevo.");
    } else if (data) {
      updateLocalCheck(
        data.participant_id,
        data.lesson_number,
        data.completed,
        data.lesson_date,
        data.id,
      );
      setStatusMessage("");
    }

    setSavingParticipantId(null);
  };

  const renderTabContent = () => {
    if (activeTab === "resumen") {
      return (
        <GroupSummary
          summary={summary}
          lessonDistribution={lessonDistribution}
          participants={participantProgress}
        />
      );
    }

    if (activeTab === "historial") {
      return (
        <RecentHistory
          lessonNumbers={historyLessonNumbers}
          countsByLesson={countsByLesson}
          total={participants.length}
          currentLessonNumber={suggestedLessonNumber}
          actions={recentActions}
        />
      );
    }

    if (activeTab === "participantes") {
      return (
        <ParticipantGrid
          participants={filteredParticipants}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onMarkLesson={handleMarkLesson}
          onRemoveLastLesson={handleRemoveLastLesson}
          disabled={!isSupabaseReady || suggestedLessonNumber < 1}
          savingParticipantId={savingParticipantId}
          todayKey={todayKey}
        />
      );
    }

    return (
      <>
        <section className="grid gap-3 sm:grid-cols-3" aria-label="Resumen rápido">
          <article className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-sm font-medium text-emerald-800">Al día</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">
              {summary.onTrackCount}
            </p>
          </article>
          <article className="rounded-lg border border-amber-100 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-800">Atrasadas</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">
              {summary.behindCount}
            </p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-600">Sin iniciar</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">
              {summary.notStartedCount}
            </p>
          </article>
        </section>

        <ParticipantGrid
          participants={filteredParticipants}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onMarkLesson={handleMarkLesson}
          onRemoveLastLesson={handleRemoveLastLesson}
          disabled={!isSupabaseReady || suggestedLessonNumber < 1}
          savingParticipantId={savingParticipantId}
          todayKey={todayKey}
        />
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f8f4] text-slate-900">
      <Header formattedDate={formattedDate} lessonNumber={suggestedLessonNumber} />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-7 px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        {statusMessage && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
            {statusMessage}
          </div>
        )}

        <nav className="grid grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm md:grid-cols-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-emerald-100 ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="space-y-8">{renderTabContent()}</div>
      </main>
    </div>
  );
}

export default App;
