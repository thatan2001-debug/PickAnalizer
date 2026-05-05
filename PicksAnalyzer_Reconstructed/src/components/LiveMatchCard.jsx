import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, TrendingUp, Shield, Target, Zap, AlertTriangle, CheckCircle2, Loader2, BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchMatchAnalysis } from "@/lib/footballApi";
import { supabase } from "@/lib/supabase";
import { getFormColor, impliedProbability, hasValue } from "@/lib/bankrollUtils";
import { toast } from "sonner";
import ConfidenceMeter from "@/components/picks/ConfidenceMeter";

function ProbBar({ label, value, color = "bg-primary" }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-24 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-1000`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-bold text-foreground w-10 text-right">{value}%</span>
    </div>
  );
}

function FormBadge({ char }) {
  const colors = { W: "bg-primary text-primary-foreground", D: "bg-accent text-accent-foreground", L: "bg-destructive text-destructive-foreground" };
  return (
    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${colors[char] || "bg-secondary text-muted-foreground"}`}>
      {char}
    </span>
  );
}

export default function MatchAnalysisModal({ match, onClose }) {
  const queryClient = useQueryClient();

  const { data: analysis, isLoading } = useQuery({
    queryKey: ["analysis", match.home_team, match.away_team],
    queryFn: () => fetchMatchAnalysis(match.home_team, match.away_team, match.league),
    staleTime: 15 * 60 * 1000,
  });

  const savePick = useMutation({
    mutationFn: async (pick) => {
  const { error } = await supabase
    .from("picks")
    .insert([pick])

  if (error) throw error
},
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["picks"] });
      toast.success("Pick guardado en historial");
    }
  });

  const handleSavePick = () => {
    if (!analysis?.main_pick) return;
    savePick.mutate({
      sport: match.sport || "football",
      league: match.league,
      home_team: match.home_team,
      away_team: match.away_team,
      pick_type: analysis.main_pick.market,
      pick_selection: analysis.main_pick.selection,
      confidence: analysis.main_pick.confidence,
      odds: analysis.main_pick.odds,
      analysis: analysis.main_pick.reasoning,
      result: "pending",
      match_date: match.match_date,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-card border border-border rounded-t-3xl md:rounded-2xl w-full md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-5 flex items-center justify-between rounded-t-3xl md:rounded-t-2xl">
          <div>
            <h2 className="font-space font-bold text-foreground">{match.home_team} vs {match.away_team}</h2>
            <p className="text-xs text-muted-foreground">{match.league}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center py-12 gap-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <div className="text-center">
                <p className="font-space font-bold text-foreground">Analizando partido con IA...</p>
                <p className="text-xs text-muted-foreground mt-1">Buscando forma reciente, H2H, estadísticas y cuotas</p>
              </div>
            </div>
          ) : analysis ? (
            <>
              {/* Main Pick */}
              {analysis.main_pick && (
                <div className={`rounded-2xl p-4 border ${
                  analysis.risk_level === 'low' ? 'border-primary/30 bg-primary/5' :
                  analysis.risk_level === 'medium' ? 'border-accent/30 bg-accent/5' :
                  'border-destructive/30 bg-destructive/5'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pick Principal</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      analysis.risk_level === 'low' ? 'bg-primary/10 text-primary' :
                      analysis.risk_level === 'medium' ? 'bg-accent/10 text-accent' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      Riesgo {analysis.risk_level === 'low' ? 'Bajo' : analysis.risk_level === 'medium' ? 'Medio' : 'Alto'}
                    </span>
                  </div>
                  <p className="font-space font-black text-xl text-foreground">{analysis.main_pick.selection}</p>
                  <p className="text-xs text-muted-foreground mb-3">{analysis.main_pick.market} • Cuota: {analysis.main_pick.odds?.toFixed(2) || "-"}</p>
                  <ConfidenceMeter value={analysis.main_pick.confidence} />
                  {analysis.main_pick.reasoning && (
                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{analysis.main_pick.reasoning}</p>
                  )}
                  <Button
                    onClick={handleSavePick}
                    disabled={savePick.isPending}
                    size="sm"
                    className="mt-3 w-full bg-primary text-primary-foreground font-semibold"
                  >
                    {savePick.isPending ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Plus className="w-3.5 h-3.5 mr-2" />}
                    Guardar Pick
                  </Button>
                </div>
              )}

              {/* Value Bets */}
              {analysis.value_bets?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-accent" />
                    <h3 className="font-space font-bold text-foreground text-sm">Value Bets Detectadas</h3>
                  </div>
                  <div className="space-y-2">
                    {analysis.value_bets.map((vb, i) => (
                      <div key={i} className="bg-accent/10 border border-accent/20 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-bold text-foreground">{vb.selection}</p>
                          <span className="text-xs font-black text-accent">+{vb.value_percentage?.toFixed(0)}% valor</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{vb.market} • Nuestra prob: {vb.our_probability}% • Casa: {vb.implied_probability?.toFixed(0)}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Probabilidades */}
              {analysis.probabilities && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <h3 className="font-space font-bold text-foreground text-sm">Probabilidades Calculadas</h3>
                  </div>
                  <div className="space-y-2">
                    <ProbBar label={match.home_team?.split(' ')[0]} value={analysis.probabilities.home_win} color="bg-primary" />
                    <ProbBar label="Empate" value={analysis.probabilities.draw} color="bg-accent" />
                    <ProbBar label={match.away_team?.split(' ')[0]} value={analysis.probabilities.away_win} color="bg-chart-3" />
                    {analysis.probabilities.over_25 != null && (
                      <div className="pt-2 border-t border-border">
                        <ProbBar label="Over 2.5" value={analysis.probabilities.over_25} color="bg-chart-4" />
                        <ProbBar label="BTTS Sí" value={analysis.probabilities.btts_yes} color="bg-chart-5" />
                        {analysis.probabilities.over_35 != null && (
                          <ProbBar label="Over 3.5" value={analysis.probabilities.over_35} color="bg-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Forma Reciente */}
              {analysis.recent_form && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-chart-3" />
                    <h3 className="font-space font-bold text-foreground text-sm">Forma Reciente</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-secondary rounded-xl p-3">
                      <p className="text-xs font-bold text-muted-foreground mb-2">{match.home_team}</p>
                      <div className="flex gap-1 mb-2">
                        {analysis.recent_form.home?.split('').map((c, i) => <FormBadge key={i} char={c} />)}
                      </div>
                      {analysis.recent_form.home_detail && (
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{analysis.recent_form.home_detail}</p>
                      )}
                    </div>
                    <div className="bg-secondary rounded-xl p-3">
                      <p className="text-xs font-bold text-muted-foreground mb-2">{match.away_team}</p>
                      <div className="flex gap-1 mb-2">
                        {analysis.recent_form.away?.split('').map((c, i) => <FormBadge key={i} char={c} />)}
                      </div>
                      {analysis.recent_form.away_detail && (
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{analysis.recent_form.away_detail}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* H2H */}
              {analysis.h2h && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-chart-4" />
                    <h3 className="font-space font-bold text-foreground text-sm">H2H - Historial</h3>
                  </div>
                  <div className="bg-secondary rounded-xl p-3">
                    <div className="flex justify-around text-center mb-3">
                      <div>
                        <p className="text-xl font-space font-black text-primary">{analysis.h2h.home_wins}</p>
                        <p className="text-[10px] text-muted-foreground">{match.home_team?.split(' ')[0]}</p>
                      </div>
                      <div>
                        <p className="text-xl font-space font-black text-accent">{analysis.h2h.draws}</p>
                        <p className="text-[10px] text-muted-foreground">Empates</p>
                      </div>
                      <div>
                        <p className="text-xl font-space font-black text-chart-3">{analysis.h2h.away_wins}</p>
                        <p className="text-[10px] text-muted-foreground">{match.away_team?.split(' ')[0]}</p>
                      </div>
                    </div>
                    {analysis.h2h.last_matches?.length > 0 && (
                      <div className="space-y-1">
                        {analysis.h2h.last_matches.map((m, i) => (
                          <p key={i} className="text-[10px] text-muted-foreground border-t border-border pt-1">{m}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Stats */}
              {analysis.stats && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    <h3 className="font-space font-bold text-foreground text-sm">Estadísticas Clave</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: `xG ${match.home_team?.split(' ')[0]}`, value: analysis.stats.expected_xg_home?.toFixed(2) },
                      { label: `xG ${match.away_team?.split(' ')[0]}`, value: analysis.stats.expected_xg_away?.toFixed(2) },
                      { label: "Goles prom. local", value: analysis.stats.home_avg_goals_scored?.toFixed(1) },
                      { label: "Goles prom. visitante", value: analysis.stats.away_avg_goals_scored?.toFixed(1) },
                      { label: "Corners esperados", value: analysis.stats.avg_corners?.toFixed(1) },
                      { label: "Tarjetas esperadas", value: analysis.stats.avg_cards?.toFixed(1) },
                    ].filter(s => s.value).map((stat, i) => (
                      <div key={i} className="bg-secondary rounded-xl p-3 text-center">
                        <p className="text-lg font-space font-black text-foreground">{stat.value}</p>
                        <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Injuries */}
              {(analysis.injuries?.home?.length > 0 || analysis.injuries?.away?.length > 0) && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <h3 className="font-space font-bold text-foreground text-sm">Lesiones / Suspensiones</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-secondary rounded-xl p-3">
                      <p className="text-xs font-bold text-muted-foreground mb-1">{match.home_team}</p>
                      {analysis.injuries.home?.map((p, i) => <p key={i} className="text-[10px] text-destructive">❌ {p}</p>)}
                      {!analysis.injuries.home?.length && <p className="text-[10px] text-primary">✅ Sin bajas</p>}
                    </div>
                    <div className="bg-secondary rounded-xl p-3">
                      <p className="text-xs font-bold text-muted-foreground mb-1">{match.away_team}</p>
                      {analysis.injuries.away?.map((p, i) => <p key={i} className="text-[10px] text-destructive">❌ {p}</p>)}
                      {!analysis.injuries.away?.length && <p className="text-[10px] text-primary">✅ Sin bajas</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Narrative */}
              {analysis.narrative && (
                <div className="bg-secondary rounded-xl p-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">{analysis.narrative}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-muted-foreground py-8">No se pudo obtener el análisis</p>
          )}
        </div>
      </div>
    </div>
  );
}
