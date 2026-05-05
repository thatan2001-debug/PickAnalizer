import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { History, Trophy, XCircle, Clock, Target, CheckCircle2 } from "lucide-react";
import PickCard from "@/components/picks/PickCard";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import { calculateWinRate } from "@/lib/bankrollUtils";

const resultFilters = [
  { key: "all", label: "Todos", icon: Target },
  { key: "won", label: "Ganados", icon: Trophy },
  { key: "lost", label: "Perdidos", icon: XCircle },
  { key: "pending", label: "Pendientes", icon: Clock },
];

export default function PicksHistory() {
  const [resultFilter, setResultFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: picks = [], isLoading } = useQuery({
    queryKey: ["picks", "history"],
    queryFn: () => base44.entities.Pick.list("-created_date"),
  });

  const updatePick = useMutation({
    mutationFn: ({ id, result }) => base44.entities.Pick.update(id, { result }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["picks"] })
  });

  const filtered = resultFilter === "all" ? picks : picks.filter((p) => p.result === resultFilter);
  const wonPicks = picks.filter((p) => p.result === "won").length;
  const lostPicks = picks.filter((p) => p.result === "lost").length;
  const winRate = calculateWinRate(picks);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <PageHeader title="Historial de Picks" subtitle={`${picks.length} picks totales`} />

      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-space font-black text-primary">{wonPicks}</p>
          <p className="text-xs text-muted-foreground mt-1">Ganados</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-space font-black text-destructive">{lostPicks}</p>
          <p className="text-xs text-muted-foreground mt-1">Perdidos</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-space font-black text-accent">{winRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">Win Rate</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {resultFilters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setResultFilter(filter.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              resultFilter === filter.key
                ? "bg-primary/10 text-primary border border-primary/30"
                : "bg-secondary text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            <filter.icon className="w-3.5 h-3.5" />
            {filter.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="bg-card border border-border rounded-2xl p-5 animate-pulse h-52" />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((pick) => (
            <div key={pick.id} className="relative">
              <PickCard pick={pick} />
              {pick.result === "pending" && (
                <div className="flex gap-2 mt-2 px-1">
                  <button
                    onClick={() => updatePick.mutate({ id: pick.id, result: "won" })}
                    className="flex-1 text-xs bg-primary/10 text-primary border border-primary/20 py-1.5 rounded-lg font-bold hover:bg-primary/20"
                  >
                    ✅ Ganado
                  </button>
                  <button
                    onClick={() => updatePick.mutate({ id: pick.id, result: "lost" })}
                    className="flex-1 text-xs bg-destructive/10 text-destructive border border-destructive/20 py-1.5 rounded-lg font-bold hover:bg-destructive/20"
                  >
                    ❌ Perdido
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={History} title="No hay picks aquí" description="Los picks aparecerán aquí según el filtro seleccionado." />
      )}
    </div>
  );
}
