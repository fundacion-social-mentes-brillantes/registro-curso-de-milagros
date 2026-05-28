import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import GroupSummary from "./components/GroupSummary.jsx";
import ParticipantGrid from "./components/ParticipantGrid.jsx";
import RecentHistory from "./components/RecentHistory.jsx";
import participantNames from "./data/participants.js";
import { isSupabaseConfigured, supabase } from "./supabaseClient.js";
import {
  formatDateKey,
  formatLongDate,
  getLessonNumber,
  getRecentLessonNumbers,
  normalizeNameForId,
  normalizeText,
} from "./utils/dateUtils.js";

const LOCAL_STORAGE_KEY = "registro-curso-milagros-supabase-checks";
const localParticipants = participantNames.map((name, index) => ({
  id: normalizeNameForId(name),
  name,
  display_order: index + 1,
  active: true,
}));

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

function App() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [checksById, setChecksById] = useState(loadLocalChecks);
  const [participants, setParticipants] = useState(
    isSupabaseConfigured ? [] : localParticipants,
  );
  const [isSupabaseReady, setIsSupabaseReady] = useState(!isSupabaseConfigured);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusMessage, setStatusMessage] = useState(
    isSupabaseConfigured
      ? "Cargando datos desde Supabase..."
      : "Modo local activo: agrega VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para compartir el registro con el grupo.",
  );

  const lessonNumber = getLessonNumber(currentDate);
  const todayKey = formatDateKey(currentDate);
  const formattedDate = formatLongDate(currentDate);
  const recentLessonNumbers = useMemo(
    () => getRecentLessonNumbers(lessonNumber, 7),
    [lessonNumber],
  );
  const recentLessonsKey = recentLessonNumbers.join(",");

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

      if (isMounted && data?.length > 0) {
        setParticipants(data);
      }
    }

    async function fetchChecks() {
      if (recentLessonNumbers.length === 0) {
        if (isMounted) {
          setChecksById({});
        }
        return;
      }

      const { data, error } = await supabase
        .from("lesson_checks")
        .select("id, participant_id, lesson_number, lesson_date, completed, updated_at")
        .in("lesson_number", recentLessonNumbers);

      if (error) {
        throw error;
      }

      const nextChecks = (data ?? []).reduce((checks, check) => {
        checks[getLessonCheckKey(check.participant_id, check.lesson_number)] = check;
        return checks;
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
  }, [recentLessonsKey, recentLessonNumbers]);

  const isCompletedForLesson = (targetLessonNumber, participantId) => {
    const checkId = getLessonCheckKey(participantId, targetLessonNumber);
    return checksById[checkId]?.completed === true;
  };

  const isParticipantCompletedToday = (participantId) =>
    isCompletedForLesson(lessonNumber, participantId);

  const completedToday = participants.filter((participant) =>
    isParticipantCompletedToday(participant.id),
  ).length;
  const pendingToday = participants.length - completedToday;
  const progressToday =
    participants.length > 0 ? Math.round((completedToday / participants.length) * 100) : 0;

  const filteredParticipants = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm);

    if (!normalizedSearch) {
      return participants;
    }

    return participants.filter((participant) =>
      normalizeText(participant.name).includes(normalizedSearch),
    );
  }, [participants, searchTerm]);

  const countsByLesson = useMemo(() => {
    return recentLessonNumbers.reduce((lessonCounts, targetLessonNumber) => {
      lessonCounts[targetLessonNumber] = participants.filter((participant) =>
        isCompletedForLesson(targetLessonNumber, participant.id),
      ).length;

      return lessonCounts;
    }, {});
  }, [checksById, participants, recentLessonNumbers]);

  const updateLocalState = (participant, completed) => {
    const checkId = getLessonCheckKey(participant.id, lessonNumber);

    setChecksById((currentChecks) => {
      const nextChecks = {
        ...currentChecks,
        [checkId]: {
          ...currentChecks[checkId],
          participant_id: participant.id,
          lesson_number: lessonNumber,
          lesson_date: todayKey,
          completed,
          updated_at: new Date().toISOString(),
        },
      };

      saveLocalChecks(nextChecks);
      return nextChecks;
    });
  };

  const handleToggleParticipant = async (participant) => {
    if (lessonNumber < 1) {
      setStatusMessage("El curso todavía no ha comenzado.");
      return;
    }

    const nextCompleted = !isParticipantCompletedToday(participant.id);

    updateLocalState(participant, nextCompleted);

    if (!isSupabaseConfigured || !supabase) {
      setStatusMessage(
        "Cambio guardado solo en este navegador. Conecta Supabase para compartirlo con el grupo.",
      );
      return;
    }

    const { error } = await supabase.from("lesson_checks").upsert(
      {
        participant_id: participant.id,
        lesson_number: lessonNumber,
        lesson_date: todayKey,
        completed: nextCompleted,
      },
      { onConflict: "participant_id,lesson_number" },
    );

    if (error) {
      console.error("No se pudo guardar el registro.", error);
      updateLocalState(participant, !nextCompleted);
      setStatusMessage("No se pudo guardar el cambio. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8f4] text-slate-900">
      <Header formattedDate={formattedDate} lessonNumber={lessonNumber} />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {statusMessage && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
            {statusMessage}
          </div>
        )}

        <GroupSummary
          total={participants.length}
          completed={completedToday}
          pending={pendingToday}
          progress={progressToday}
        />

        <ParticipantGrid
          participants={filteredParticipants}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          isParticipantCompleted={isParticipantCompletedToday}
          onToggleParticipant={handleToggleParticipant}
          disabled={lessonNumber < 1 || (isSupabaseConfigured && !isSupabaseReady)}
        />

        <RecentHistory
          lessonNumbers={recentLessonNumbers}
          countsByLesson={countsByLesson}
          total={participants.length}
          currentLessonNumber={lessonNumber}
        />
      </main>
    </div>
  );
}

export default App;
