import { motion } from "framer-motion";
import { Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const sportEmojis = {
  football: "⚽", soccer: "⚽", basketball: "🏀", tennis: "🎾",
  baseball: "⚾", hockey: "🏒", mma: "🥊", american_football: "🏈", default: "🏟️"
};

export default function ScheduledMatchCard({ match, onAnalyze }) {
  const matchDate = match.match_date ? new Date(match.match_date) : null;
  const sportEmoji = sportEmojis[match.sport?.toLowerCase()] || sportEmojis.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{sportEmoji}</span>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider leading-none">{match.league}</p>
            {match.country && <p className="text-[10px] text-muted-foreground">{match.country}</p>}
          </div>
        </div>
        {matchDate && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span className="text-[11px] font-medium">
              {matchDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} {matchDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between my-3">
        <p className="font-space font-bold text-sm text-foreground flex-1">{match.home_team}</p>
        <span className="text-xs font-bold text-muted-foreground px-3">VS</span>
        <p className="font-space font-bold text-sm text-foreground flex-1 text-right">{match.away_team}</p>
      </div>

      {(match.home_odds || match.away_odds) && (
        <div className="flex gap-2 mb-3">
          <div className="flex-1 bg-secondary rounded-lg py-2 text-center">
            <p className="text-[10px] text-muted-foreground">1</p>
            <p className="text-sm font-bold text-foreground">{match.home_odds?.toFixed(2) || "-"}</p>
          </div>
          {match.draw_odds && (
            <div className="flex-1 bg-secondary rounded-lg py-2 text-center">
              <p className="text-[10px] text-muted-foreground">X</p>
              <p className="text-sm font-bold text-foreground">{match.draw_odds?.toFixed(2) || "-"}</p>
            </div>
          )}
          <div className="flex-1 bg-secondary rounded-lg py-2 text-center">
            <p className="text-[10px] text-muted-foreground">2</p>
            <p className="text-sm font-bold text-foreground">{match.away_odds?.toFixed(2) || "-"}</p>
          </div>
        </div>
      )}

      {match.venue && (
        <p className="text-[10px] text-muted-foreground mb-3">📍 {match.venue}</p>
      )}

      <Button
        onClick={onAnalyze}
        size="sm"
        className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-semibold"
        variant="ghost"
      >
        <Zap className="w-3.5 h-3.5 mr-2" />
        Analizar con IA
      </Button>
    </motion.div>
  );
}

 Pick
