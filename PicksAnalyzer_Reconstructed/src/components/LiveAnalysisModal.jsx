import { useQuery } from "@tanstack/react-query";
import { X, Zap, Loader2, Target, TrendingUp, AlertCircle, Clock } from "lucide-react";
import { fetchLiveAnalysis } from "@/lib/footballApi";

const urgencyConfig = {
  now: { label: "Apostar AHORA", color: "text-primary", bg: "bg-primary/10 border-primary/30" },
  wait: { label: "Esperar", color: "text-accent", bg: "bg-accent/10 border-accent/30" },
  avoid: { label: "Evitar", color: "text-destructive", bg: "bg-destructive/10 border-destructive/30" },
};

export default function LiveAnalysisModal({ match, onClose }) {
  const stats = {
    home_possession: match.home_possession,
    away_possession: match.away_possession,
    home_shots: match.home_shots,
    away_shots: match.away_shots,
    home_shots_on_target: match.home_shots_on_target,
    away_shots_on_target: match.away_shots_on_target,
    home_corners: match.home_corners,
    away_corners: match.away_corners,
    home_saves: match.home_saves,
    away_saves: match.away_saves,
    home_yellow_cards: match.home_yellow_cards,
    away_yellow_cards: match.away_yellow_cards,
  };

  const { data: analysis, isLoading } = useQuery({
    queryKey: ["live-analysis", match.home_team, match.away_team, match.minute],
    queryFn: () => fetchLiveAnalysis(
      match.home_team, match.away_team,
      match.home_score, match.away_score,
      match.minute, match.league, stats
    ),
    staleTime: 3 * 60 * 1000,
  });

  const momentumColors = {
    home_dominant: "text-primary",
    away_dominant: "text-chart-3",
    balanced: "text-accent"
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-card border border-border rounded-t-3xl md:rounded-2xl w-full md:max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-5 flex items-center justify-between rounded-t-3xl md:rounded-t-2xl z-10">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              <h2 className="font-space font-bold text-foreground text-sm">Análisis en Vivo + Apuestas</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {match.home_team} <span className="font-black text-foreground">{match.home_score}-{match.away_score}</span> {match.away_team} • {match.minute}'
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {isLoading ? (
            <div className="flex flex-col items-center py-12 gap-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <div className="text-center">
                <p className="font-space font-bold text-foreground">Analizando partido en vivo...</p>
                <p className="text-xs text-muted-foreground mt-1">Buscando estadísticas y oportunidades de apuesta</p>
              </div>
            </div>
          ) : analysis ? (
            <>
              {/* Momentum */}
              <div className="bg-secondary rounded-2xl p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Momentum</p>
                <p className={`font-space font-black text-xl ${momentumColors[analysis.momentum]}`}>
                  {analysis.momentum === 'home_dominant' ? `↑ ${match.home_team} domina` :
                   analysis.momentum === 'away_dominant' ? `↑ ${match.away_team} domina` : '⚖️ Partido equilibrado'}
                </p>
                {analysis.momentum_description && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{analysis.momentum_description}</p>
                )}
              </div>

              {/* Probabilities */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-center">
                  <p className="text-lg font-space font-black text-primary">{analysis.prob_next_goal_home}%</p>
                  <p className="text-[9px] text-muted-foreground">Próx gol {match.home_team?.split(' ')[0]}</p>
                </div>
                <div className="bg-secondary rounded-xl p-3 text-center">
                  <p className="text-lg font-space font-black text-muted-foreground">{analysis.prob_no_more_goals}%</p>
                  <p className="text-[9px] text-muted-foreground">Sin más goles</p>
                </div>
                <div className="bg-chart-3/10 border border-chart-3/20 rounded-xl p-3 text-center">
                  <p className="text-lg font-space font-black text-chart-3">{analysis.prob_next_goal_away}%</p>
                  <p className="text-[9px] text-muted-foreground">Próx gol {match.away_team?.split(' ')[0]}</p>
                </div>
              </div>

              {/* Predicted result */}
              <div className="bg-secondary rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Resultado final predicho</p>
                <p className="font-space font-black text-foreground text-2xl">
                  {analysis.predicted_final_home} - {analysis.predicted_final_away}
                </p>
              </div>

              {/* Live betting opportunities */}
              {analysis.live_opportunities?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-accent" />
                    <p className="font-space font-bold text-foreground text-sm">Opciones de Apuesta en Vivo</p>
                  </div>
                  <div className="space-y-2">
                    {analysis.live_opportunities.map((op, i) => {
                      const urg = urgencyConfig[op.urgency] || urgencyConfig.wait;
                      return (
                        <div key={i} className={`border rounded-xl p-3 ${urg.bg}`}>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1">
                              <p className="text-sm font-space font-bold text-foreground">{op.selection}</p>
                              <p className="text-[10px] text-muted-foreground">{op.market}{op.estimated_odds ? ` • ~${op.estimated_odds.toFixed(2)}` : ''}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className={`text-xs font-black ${urg.color}`}>{urg.label}</p>
                              <p className="text-xs font-bold text-foreground">{op.confidence}%</p>
                            </div>
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">{op.reasoning}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Key events */}
              {analysis.key_events?.length > 0 && (
                <div>
                  <p className="font-space font-bold text-foreground text-sm mb-2">Eventos clave</p>
                  <div className="space-y-1">
                    {analysis.key_events.map((e, i) => (
                      <p key={i} className="text-xs text-muted-foreground flex gap-2">
                        <span className="text-accent">•</span> {e}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendation */}
              {analysis.recommendation && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-primary" />
                    <p className="text-xs font-bold text-primary uppercase tracking-wider">Recomendación Final</p>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{analysis.recommendation}</p>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
