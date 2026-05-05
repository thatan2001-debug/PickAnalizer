import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchScheduledMatches, sortByLeaguePriority } from "@/lib/footballApi";
import ScheduledMatchCard from "@/components/matches/ScheduledMatchCard";
import MatchAnalysisModal from "@/components/matches/MatchAnalysisModal";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";

function buildCalendarDays() {
  const days = [];
  for (let i = 0; i <= 6; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatDate(date) {
  return date.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' });
}

function formatDateForQuery(date) {
  return date.toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

function isSameDay(a, b) {
  return a.toDateString() === b.toDateString();
}

export default function ScheduledMatches() {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const calendarDays = buildCalendarDays();

  const dateStr = formatDateForQuery(selectedDate);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["scheduled-matches-real", selectedDate.toDateString()],
    queryFn: () => fetchScheduledMatches(dateStr),
    staleTime: 10 * 60 * 1000,
  });

  const matches = sortByLeaguePriority(data?.matches || []);

  // Group by league
  const grouped = matches.reduce((acc, m) => {
    const key = m.league || "Otras";
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Programados"
        subtitle="Selecciona una fecha"
        action={
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="border-border">
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        }
      />

      {/* Calendar strip */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
        {calendarDays.map((day, i) => {
          const isToday = i === 0;
          const isSelected = isSameDay(day, selectedDate);
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(day)}
              className={`flex flex-col items-center px-4 py-3 rounded-2xl min-w-[70px] transition-all border ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              <span className="text-[10px] font-bold uppercase">
                {isToday ? "Hoy" : day.toLocaleDateString('es-ES', { weekday: 'short' })}
              </span>
              <span className="text-xl font-space font-black mt-0.5">{day.getDate()}</span>
              <span className="text-[10px]">{day.toLocaleDateString('es-ES', { month: 'short' })}</span>
            </button>
          );
        })}
      </div>

      {/* Selected date label */}
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-primary" />
        <p className="font-space font-bold text-foreground">
          {isSameDay(selectedDate, new Date()) ? "Hoy, " : ""}
          {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long' })}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-3 bg-card border border-border rounded-2xl px-6 py-4">
              <Calendar className="w-5 h-5 text-primary animate-pulse" />
              <div>
                <p className="font-space font-bold text-foreground text-sm">Buscando partidos programados...</p>
                <p className="text-xs text-muted-foreground mt-0.5">Obteniendo fixture real para esta fecha</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-5 animate-pulse h-44" />
            ))}
          </div>
        </div>
      ) : matches.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(grouped).map(([league, leagueMatches]) => (
            <div key={league}>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2">{league}</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {leagueMatches.map((match, i) => (
                  <ScheduledMatchCard key={match.id || i} match={match} onAnalyze={() => setSelectedMatch(match)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No hay partidos programados"
          description="No se encontraron partidos para esta fecha. Intenta con otra fecha o actualiza."
        />
      )}

      {selectedMatch && (
        <MatchAnalysisModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
      )}
    </div>
  );
}

 utils
