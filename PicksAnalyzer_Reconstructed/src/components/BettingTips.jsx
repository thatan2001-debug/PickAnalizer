import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Lightbulb, Star, Settings2, Loader2, RefreshCw, Zap, Trophy, AlertTriangle, ChevronDown, ChevronUp, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { fetchDailyBestPick, fetchBettingTip } from "@/lib/footballApi";
import PageHeader from "@/components/common/PageHeader";
import ConfidenceMeter from "@/components/picks/ConfidenceMeter";

const AVAILABLE_LEAGUES = [
  "Premier League", "Serie A", "La Liga", "Bundesliga", "Ligue 1",
  "Liga BetPlay Colombia", "Liga 1 Perú", "Champions League", "Europa League",
  "Conference League", "Copa Libertadores", "Copa Sudamericana",
  "Liga MX", "MLS", "Eredivisie", "Primeira Liga"
];

const riskOptions = [
  { key: "low", label: "Bajo", description: "Alta probabilidad, cuotas 1.20-1.60", icon: "🟢", color: "border-primary/40 bg-primary/5" },
  { key: "medium", label: "Medio", description: "Buen balance, cuotas 1.60-2.20", icon: "🟡", color: "border-accent/40 bg-accent/5" },
  { key: "high", label: "Alto", description: "Value bet, cuotas 2.20+", icon: "🔴", color: "border-destructive/40 bg-destructive/5" },
];

function PickTipCard({ pick, highlight }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`rounded-2xl border p-4 ${highlight ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{pick.league}</p>
          <p className="font-space font-bold text-sm text-foreground">{pick.home_team} vs {pick.away_team}</p>
          {pick.match_time && <p className="text-[10px] text-muted-foreground">🕐 {pick.match_time}</p>}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-space font-black text-primary">{pick.odds?.toFixed(2)}</p>
          <p className="text-[10px] text-muted-foreground">cuota</p>
        </div>
      </div>

      <div className="bg-secondary rounded-xl p-3 mb-3">
        <p className="text-xs text-muted-foreground mb-0.5">{pick.market}</p>
        <p className="font-space font-black text-foreground">{pick.selection}</p>
      </div>

      <ConfidenceMeter value={pick.confidence} />

      {pick.reasoning && (
        <>
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-[10px] text-muted-foreground mt-2 hover:text-foreground transition-colors">
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? "Ocultar análisis" : "Ver análisis"}
          </button>
          {expanded && (
            <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed border-t border-border pt-2">{pick.reasoning}</p>
          )}
        </>
      )}
    </div>
  );
}

export default function BettingTips() {
  const [showConfig, setShowConfig] = useState(false);
  const [minOdds, setMinOdds] = useState(1.55);
  const [matchCount, setMatchCount] = useState(1);
  const [risk, setRisk] = useState("low");
  const [selectedLeagues, setSelectedLeagues] = useState(AVAILABLE_LEAGUES.slice(0, 6));
  const [customResult, setCustomResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Best pick of the day (auto-loaded, free tier visible)
  const { data: bestPick, isLoading: loadingBest, refetch: refetchBest, isFetching: fetchingBest, error: bestPickError } = useQuery({
    queryKey: ["daily-best-pick"],
    queryFn: fetchDailyBestPick,
    staleTime: 30 * 60 * 1000,
    retry: false,
  });

  const isCreditsError = bestPickError?.message?.includes("402") || bestPickError?.message?.includes("limit");

  const toggleLeague = (league) => {
    setSelectedLeagues(prev =>
      prev.includes(league) ? prev.filter(l => l !== league) : [...prev, league]
    );
  };

  const handleGenerate = async () => {
  try {
    setIsGenerating(true);
    setCustomResult(null);

    const result = await fetchBettingTip({
      minOdds,
      matchCount,
      risk,
      leagues: selectedLeagues,
    });

    setCustomResult(result);
  } catch (err) {
    toast.error(err.message || "Error generando picks");
  } finally {
    setIsGenerating(false);
  }
};

  const riskColorMap = { low: "text-primary", medium: "text-accent", high: "text-destructive" };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <PageHeader
        title="Consejos de Apuesta"
        subtitle="Análisis IA con datos reales"
        action={
          <Button variant="outline" size="sm" onClick={() => refetchBest()} disabled={fetchingBest} className="border-border">
            <RefreshCw className={`w-4 h-4 mr-2 ${fetchingBest ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        }
      />

      {/* PICK DEL DÍA */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-accent" />
          <h2 className="font-space font-bold text-foreground">Pick del Día</h2>
          <span className="text-[10px] bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded-full font-bold">GRATIS</span>
        </div>

        {bestPickError && (
          <div className="bg-accent/10 border border-accent/30 rounded-2xl p-5 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                {isCreditsError ? (
                  <>
                    <p className="font-space font-bold text-foreground text-sm">Límite de créditos IA alcanzado</p>
                    <p className="text-xs text-muted-foreground mt-1">Has usado los 100 créditos del plan gratuito este mes. Actualiza tu plan en <strong className="text-foreground">base44.com → Settings → Billing</strong> para seguir usando el análisis IA.</p>
                  </>
                ) : (
                  <p className="text-sm text-foreground">{bestPickError.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {loadingBest ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
            <p className="font-space font-bold text-foreground">Analizando todos los partidos de hoy...</p>
            <p className="text-xs text-muted-foreground mt-1">Buscando la mejor apuesta con cuota mínima 1.55</p>
          </div>
        ) : bestPick ? (
          <div className="bg-card border border-primary/30 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] font-black px-3 py-1 rounded-bl-xl">
              ⭐ MEJOR PICK HOY
            </div>

            <div className="flex items-start justify-between gap-4 mb-4 mt-2">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{bestPick.league}</p>
                <p className="font-space font-black text-xl text-foreground mt-0.5">{bestPick.home_team} vs {bestPick.away_team}</p>
                {bestPick.match_time && <p className="text-xs text-muted-foreground mt-0.5">🕐 {bestPick.match_time}</p>}
              </div>
              <div className="text-right shrink-0">
                <p className="text-3xl font-space font-black text-primary">{bestPick.odds?.toFixed(2)}</p>
                <p className="text-[10px] text-muted-foreground">cuota</p>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-4">
              <p className="text-xs text-muted-foreground mb-1">{bestPick.market}</p>
              <p className="font-space font-black text-2xl text-foreground">{bestPick.selection}</p>
            </div>

            <ConfidenceMeter value={bestPick.confidence} />

            {bestPick.key_stats?.length > 0 && (
              <div className="mt-4 grid grid-cols-1 gap-1">
                {bestPick.key_stats.map((stat, i) => (
                  <p key={i} className="text-xs text-muted-foreground flex gap-2">
                    <span className="text-primary">✓</span> {stat}
                  </p>
                ))}
              </div>
            )}

            {bestPick.reasoning && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground leading-relaxed">{bestPick.reasoning}</p>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* CONFIGURADOR PERSONALIZADO */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="w-full p-5 flex items-center justify-between hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Settings2 className="w-5 h-5 text-accent" />
            <div className="text-left">
              <p className="font-space font-bold text-foreground">Configurar mis picks</p>
              <p className="text-xs text-muted-foreground">Cuota, cantidad, riesgo y ligas</p>
            </div>
          </div>
          {showConfig ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>

        {showConfig && (
          <div className="p-5 border-t border-border space-y-6">
            {/* Min odds */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-foreground">Cuota mínima</label>
                <span className="text-xl font-space font-black text-primary">{minOdds.toFixed(2)}</span>
              </div>
              <Slider
                min={1.10} max={5.00} step={0.05}
                value={[minOdds]}
                onValueChange={([v]) => setMinOdds(v)}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>1.10</span><span>2.00</span><span>3.00</span><span>5.00</span>
              </div>
            </div>

            {/* Match count */}
            <div>
              <label className="text-sm font-bold text-foreground block mb-2">Número de selecciones</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setMatchCount(n)}
                    className={`w-10 h-10 rounded-xl font-space font-black text-sm transition-all ${
                      matchCount === n ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Risk */}
            <div>
              <label className="text-sm font-bold text-foreground block mb-2">Nivel de riesgo</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {riskOptions.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setRisk(opt.key)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      risk === opt.key ? opt.color + " border-opacity-100" : "border-border bg-secondary"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span>{opt.icon}</span>
                      <span className="font-space font-bold text-sm text-foreground">{opt.label}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{opt.description}</p>
                  </button>
                ))}
              </div>
              {risk === "low" && matchCount > 1 && (
                <p className="text-xs text-primary mt-2 flex gap-1.5">
                  <Zap className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  Con riesgo bajo también generaremos una combinada del mismo equipo/partido
                </p>
              )}
            </div>

            {/* Leagues */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-foreground">Ligas a incluir</label>
                <button onClick={() => setSelectedLeagues(AVAILABLE_LEAGUES)} className="text-[10px] text-primary hover:underline">Todas</button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {AVAILABLE_LEAGUES.map(league => {
                  const selected = selectedLeagues.includes(league);
                  return (
                    <button
                      key={league}
                      onClick={() => toggleLeague(league)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                        selected ? "bg-primary/10 text-primary border border-primary/30" : "bg-secondary text-muted-foreground border border-transparent hover:border-border"
                      }`}
                    >
                      {selected ? <CheckSquare className="w-3.5 h-3.5 shrink-0" /> : <Square className="w-3.5 h-3.5 shrink-0" />}
                      {league}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || selectedLeagues.length === 0}
              className="w-full bg-primary text-primary-foreground font-bold"
              size="lg"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
              {isGenerating ? "Analizando con IA..." : `Generar ${matchCount} consejo${matchCount > 1 ? "s" : ""}`}
            </Button>
          </div>
        )}
      </div>

      {/* CUSTOM RESULTS */}
      {isGenerating && (
        <div className="bg-card border border-border rounded-2xl p-8 text-center mb-6">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="font-space font-bold text-foreground">Analizando partidos de hoy...</p>
          <p className="text-xs text-muted-foreground mt-1">Buscando las mejores opciones según tu configuración</p>
        </div>
      )}

      {customResult && !isGenerating && (
        <div className="space-y-4">
          {customResult.summary && (
            <div className="bg-secondary rounded-xl p-3">
              <p className="text-xs text-muted-foreground">{customResult.summary}</p>
            </div>
          )}

          {customResult.picks?.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-space font-bold text-foreground">Picks recomendados</h3>
              {customResult.picks.map((pick, i) => (
                <PickTipCard key={i} pick={pick} highlight={i === 0} />
              ))}
            </div>
          )}

          {customResult.combined_bet?.available && (
            <div className="bg-accent/10 border border-accent/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-accent" />
                <p className="font-space font-bold text-foreground">Combinada recomendada</p>
                <span className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-bold">
                  {customResult.combined_bet.total_odds?.toFixed(2)} total
                </span>
              </div>
              {customResult.combined_bet.selections?.map((sel, i) => (
                <p key={i} className="text-xs text-foreground flex gap-2 mb-1">
                  <span className="text-accent font-bold">{i + 1}.</span> {sel}
                </p>
              ))}
              {customResult.combined_bet.description && (
                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">{customResult.combined_bet.description}</p>
              )}
              <div className="mt-3">
                <ConfidenceMeter value={customResult.combined_bet.combined_confidence} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
