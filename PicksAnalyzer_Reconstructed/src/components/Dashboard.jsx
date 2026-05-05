import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { Radio, Calendar, Zap, Trophy, TrendingUp, ChevronRight, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchLiveMatches, fetchScheduledMatches } from "@/lib/footballApi";
import LiveMatchCard from "@/components/matches/LiveMatchCard";
import PickCard from "@/components/picks/PickCard";
import PageHeader from "@/components/common/PageHeader";
import { calculateROI, calculateWinRate } from "@/lib/bankrollUtils";

function StatCard({ icon: Icon, label, value, color, delay, to }) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card border border-border rounded-2xl p-5 hover:border-primary/20 transition-all"
    >
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-space font-black text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </motion.div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

export default function Dashboard() {
  const { data: liveData, isLoading: loadingLive } = useQuery({
    queryKey: ["live-matches-real"],
    queryFn: fetchLiveMatches,
    staleTime: 2 * 60 * 1000,
  });

  const { data: scheduledData, isLoading: loadingScheduled } = useQuery({
    queryKey: ["scheduled-matches-real"],
    queryFn: fetchScheduledMatches,
    staleTime: 10 * 60 * 1000,
  });

  const { data: picks = [] } = useQuery({
  queryKey: ["picks"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("picks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error(error);
      return [];
    }

    return data || [];
  },
});

  const { data: bettingRecords = [] } = useQuery({
    queryKey: ["betting-records"],
    queryFn: () => fetchScheduledMatches(new Date().toISOString().split("T")[0]),
  });

  const liveMatches = liveData?.matches || [];
  const scheduledMatches = scheduledData?.matches || [];
  const roi = calculateROI(bettingRecords);
  const winRate = calculateWinRate(bettingRecords);
  const pendingPicks = picks.filter(p => p.result === "pending").length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Dashboard"
        subtitle="Análisis deportivo en tiempo real"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        <StatCard icon={Radio} label="Partidos en vivo" value={loadingLive ? "..." : liveMatches.length} color="bg-destructive/10 text-destructive" delay={0} to="/live" />
        <StatCard icon={Calendar} label="Programados hoy" value={loadingScheduled ? "..." : scheduledMatches.length} color="bg-chart-3/10 text-chart-3" delay={0.05} to="/scheduled" />
        <StatCard icon={Zap} label="Picks pendientes" value={pendingPicks} color="bg-accent/10 text-accent" delay={0.1} to="/picks" />
        <StatCard icon={Trophy} label="Win Rate" value={`${winRate}%`} color="bg-primary/10 text-primary" delay={0.15} to="/history" />
      </div>

      {/* ROI Banner */}
      {bettingRecords.length > 0 && (
        <div className={`rounded-2xl p-4 mb-8 border ${roi >= 0 ? 'bg-primary/5 border-primary/20' : 'bg-destructive/5 border-destructive/20'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className={`w-5 h-5 ${roi >= 0 ? 'text-primary' : 'text-destructive'}`} />
              <div>
                <p className="text-sm font-bold text-foreground">ROI Total de tu bankroll</p>
                <p className="text-xs text-muted-foreground">{bettingRecords.length} apuestas registradas</p>
              </div>
            </div>
            <p className={`text-2xl font-space font-black ${roi >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {roi >= 0 ? '+' : ''}{roi}%
            </p>
          </div>
        </div>
      )}

      {/* Live now */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-destructive animate-pulse" />
            <h2 className="font-space font-bold text-foreground">En Vivo Ahora</h2>
          </div>
          <Link to="/live" className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
            Ver todos <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        {loadingLive ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="bg-card border border-border rounded-2xl p-5 animate-pulse h-48" />)}
          </div>
        ) : liveMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveMatches.slice(0, 3).map((match, i) => (
              <LiveMatchCard key={match.id || i} match={match} onAnalyze={() => {}} />
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <p className="text-muted-foreground text-sm">Cargando partidos en vivo...</p>
            <Link to="/live" className="text-primary text-xs mt-2 inline-block hover:underline">Ir a En Vivo →</Link>
          </div>
        )}
      </section>

      {/* Picks */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent" />
            <h2 className="font-space font-bold text-foreground">Últimos Picks</h2>
          </div>
          <Link to="/picks" className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
            Ver todos <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        {picks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {picks.slice(0, 6).map(pick => <PickCard key={pick.id} pick={pick} />)}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <Zap className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Aún no hay picks. Ve a <Link to="/picks" className="text-primary hover:underline">Picks IA</Link> para generar tu primer análisis.</p>
          </div>
        )}
      </section>
    </div>
  );
}
