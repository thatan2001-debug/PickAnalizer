import { motion } from "framer-motion";
import { TrendingUp, CheckCircle2, XCircle, Clock, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const sportEmojis = {
  football: "⚽",
  basketball: "🏀",
  tennis: "🎾",
  baseball: "⚾",
  hockey: "🏒",
  mma: "🥊",
};

const resultConfig = {
  pending: { icon: Clock, color: "text-accent", bg: "bg-accent/10", label: "Pendiente" },
  won: { icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10", label: "Ganado ✅" },
  lost: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Perdido" },
  push: { icon: Minus, color: "text-muted-foreground", bg: "bg-muted", label: "Push" },
};

export default function PickCard({ pick }) {
  const result = resultConfig[pick.result || "pending"];
  const ResultIcon = result.icon;

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return "text-primary";
    if (confidence >= 60) return "text-accent";
    return "text-muted-foreground";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span>{sportEmojis[pick.sport] || "🏟️"}</span>
          <span className="text-xs text-muted-foreground font-medium">{pick.league}</span>
        </div>
        <Badge className={`${result.bg} ${result.color} border-0 text-[11px] font-semibold`}>
          <ResultIcon className="w-3 h-3 mr-1" />
          {result.label}
        </Badge>
      </div>

      <p className="font-space font-bold text-foreground text-sm mb-1">
        {pick.home_team} vs {pick.away_team}
      </p>

      <div className="bg-secondary rounded-xl p-3 mt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Pick</span>
          <div className="flex items-center gap-1">
            <TrendingUp className={`w-3.5 h-3.5 ${getConfidenceColor(pick.confidence)}`} />
            <span className={`text-sm font-black font-space ${getConfidenceColor(pick.confidence)}`}>
              {pick.confidence}%
            </span>
          </div>
        </div>
        <p className="font-space font-bold text-foreground">{pick.pick_selection}</p>
        {pick.pick_type && (
          <span className="text-[11px] text-muted-foreground mt-1 block">{pick.pick_type} • Cuota: {pick.odds?.toFixed(2) || "-"}</span>
        )}
      </div>

      {pick.analysis && (
        <p className="text-xs text-muted-foreground mt-3 leading-relaxed line-clamp-3">
          {pick.analysis}
        </p>
      )}
    </motion.div>
  );
}

ui
