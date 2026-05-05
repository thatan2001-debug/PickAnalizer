import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Radio, RefreshCw, CheckCircle, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { fetchLiveMatches, fetchFinishedMatches, fetchScheduledMatches, sortByLeaguePriority } from "@/lib/footballApi";
import LiveMatchCard from "@/components/matches/LiveMatchCard";
import FinishedMatchCard from "@/components/matches/FinishedMatchCard";
import ScheduledMatchCard from "@/components/matches/ScheduledMatchCard";
import LiveAnalysisModal from "@/components/matches/LiveAnalysisModal";
import MatchAnalysisModal from "@/components/matches/MatchAnalysisModal";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import MatchFilters from "@/components/matches/MatchFilters";

const TABS = [
  { key: "live", label: "En Vivo", icon: Radio },
  { key: "scheduled", label: "Programados", icon: Calendar },
  { key: "finished", label: "Terminados", icon: CheckCircle },
];

export default function LiveMatches() {
  const [tab, setTab] = useState("live");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [selectedLiveMatch, setSelectedLiveMatch] = useState(null);
  const [selectedScheduledMatch, setSelectedScheduledMatch] = useState(null);

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  const { data: liveData, isLoading: loadingLive, refetch: refetchLive, isFetching: fetchingLive, dataUpdatedAt, error: errorLive } = useQuery({
    queryKey: ["live-matches-real"],
    queryFn: fetchLiveMatches,
    staleTime: 2 * 60 * 1000,
    enabled: tab === "live",
    retry: false,
  });

  const { data: scheduledData, isLoading: loadingScheduled, refetch: refetchScheduled, isFetching: fetchingScheduled, error: errorScheduled } = useQuery({
    queryKey: ["scheduled-matches-real", dateStr],
    queryFn: () => fetchScheduledMatches(dateStr),
    staleTime: 10 * 60 * 1000,
    enabled: tab === "scheduled",
    retry: false,
  });

  const { data: finishedData, isLoading: loadingFinished, refetch: refetchFinished, isFetching: fetchingFinished, error: errorFinished } = useQuery({
    queryKey: ["finished-matches-real", dateStr],
    queryFn: () => fetchFinishedMatches(dateStr),
    staleTime: 5 * 60 * 1000,
    enabled: tab === "finished",
    retry: false,
  });

  const currentError = tab === "live" ? errorLive : tab === "scheduled" ? errorScheduled : errorFinished;
  const isCreditsError = currentError?.message?.includes("402") || currentError?.message?.includes("limit");

  const rawMatches = useMemo(() => {
    if (tab === "live") return sortByLeaguePriority(liveData?.matches || []);
    if (tab === "scheduled") return sortByLeaguePriority(scheduledData?.matches || []);
    if (tab === "finished") return sortByLeaguePriority(finishedData?.matches || []);
    return [];
  }, [tab, liveData, scheduledData, finishedData]);

  const leagues = useMemo(() => [...new Set(rawMatches.map(m => m.league).filter(Boolean))], [rawMatches]);

  const matches = useMemo(() =>
    selectedLeague ? rawMatches.filter(m => m.league === selectedLeague) : rawMatches,
    [rawMatches, selectedLeague]
  );

  const isLoading = tab === "live" ? loadingLive : tab === "scheduled" ? loadingScheduled : loadingFinished;
  const isFetching = tab === "live" ? fetchingLive : tab === "scheduled" ? fetchingScheduled : fetchingFinished;
  const refetch = tab === "live" ? refetchLive : tab === "scheduled" ? refetchScheduled : refetchFinished;

  const updatedAt = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString("es-ES") : null;

  return (
    
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <PageHeader
          title="Partidos"
          subtitle={updatedAt ? `Actualizado: ${updatedAt}` : "Datos en tiempo real"}
          action={
            <div className="flex items-center gap-3">
              {tab === "live" && (
                <div className="flex items-center gap-1.5 bg-destructive/10 px-3 py-1.5 rounded-full">
                  <Radio className="w-3.5 h-3.5 text-destructive animate-pulse" />
                  <span className="text-sm font-semibold text-destructive">LIVE</span>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="border-border">
                <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
                Actualizar
              </Button>
            </div>
          }
        />

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setSelectedLeague(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === key
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "bg-secondary text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {key === "live" && (liveData?.matches?.length ?? 0) > 0 && (
                <span className="bg-destructive text-white text-[10px] font-black px-1.5 rounded-full">
                  {liveData.matches.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Filters: date only for scheduled/finished, leagues for all */}
        <MatchFilters
          date={selectedDate}
          onDateChange={(d) => { setSelectedDate(d); setSelectedLeague(null); }}
          leagues={leagues}
          selectedLeague={selectedLeague}
          onLeagueChange={setSelectedLeague}
          showDate={tab !== "live"}
        />

        {/* Credits error banner */}
        {currentError && (
          <div className={`rounded-2xl p-5 mb-4 border ${isCreditsError ? "bg-accent/10 border-accent/30" : "bg-destructive/10 border-destructive/30"}`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{isCreditsError ? "⚠️" : "❌"}</span>
              <div>
                {isCreditsError ? (
                  <>
                    <p className="font-space font-bold text-foreground text-sm">Límite de créditos IA alcanzado</p>
                    <p className="text-xs text-muted-foreground mt-1">Has usado los 100 créditos de integración del plan gratuito este mes. Para seguir usando el análisis con IA en tiempo real, actualiza tu plan de Base44 en <strong className="text-foreground">base44.com → Settings → Billing</strong>.</p>
                  </>
                ) : (
                  <>
                    <p className="font-space font-bold text-foreground text-sm">Error al cargar datos</p>
                    <p className="text-xs text-muted-foreground mt-1">{currentError.message}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-3 bg-card border border-border rounded-2xl px-6 py-4">
                <Radio className="w-5 h-5 text-destructive animate-pulse" />
                <div>
                  <p className="font-space font-bold text-foreground text-sm">
                    {tab === "live" ? "Buscando partidos en vivo..." : tab === "scheduled" ? "Cargando programados..." : "Cargando resultados..."}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Consultando fuentes en tiempo real</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => <div key={i} className="bg-card border border-border rounded-2xl p-5 animate-pulse h-52" />)}
            </div>
          </div>
        ) : matches.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">{matches.length} partido(s){selectedLeague ? ` · ${selectedLeague}` : ""}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matches.map((match, i) => {
                if (tab === "live") return <LiveMatchCard key={match.id || i} match={match} onAnalyze={() => setSelectedLiveMatch(match)} />;
                if (tab === "scheduled") return <ScheduledMatchCard key={match.id || i} match={match} onAnalyze={() => setSelectedScheduledMatch(match)} />;
                return <FinishedMatchCard key={match.id || i} match={match} />;
              })}
            </div>
          </>
        ) : (
          <EmptyState
            icon={tab === "live" ? Radio : tab === "scheduled" ? Calendar : CheckCircle}
            title={
              tab === "live" ? "No hay partidos en vivo" :
              tab === "scheduled" ? "No hay partidos programados" :
              "No hay partidos terminados"
            }
            description={
              tab === "live" ? "No hay partidos en curso ahora mismo. Intenta actualizar." :
              tab === "scheduled" ? `No se encontraron partidos programados para ${format(selectedDate, "d MMM yyyy")}.` :
              `No hay resultados registrados para ${format(selectedDate, "d MMM yyyy")}.`
            }
          />
        )}

        {/* Modals */}
        {selectedLiveMatch && (
          <LiveAnalysisModal match={selectedLiveMatch} onClose={() => setSelectedLiveMatch(null)} />
        )}
        {selectedScheduledMatch && (
          <MatchAnalysisModal
            match={selectedScheduledMatch}
            onClose={() => setSelectedScheduledMatch(null)}
          />
        )}
      </div>
    
  );
}
