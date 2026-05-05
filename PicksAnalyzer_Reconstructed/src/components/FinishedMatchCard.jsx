import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

export default function FinishedMatchCard({ match }) {
  const homeWon = match.home_score > match.away_score;
  const awayWon = match.away_score > match.home_score;
  const draw = match.home_score === match.away_score;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{match.league}</p>
          {match.country && <p className="text-[10px] text-muted-foreground">{match.country}</p>}
        </div>
        <div className="flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-full">
          <CheckCircle className="w-3 h-3 text-muted-foreground" />
          <span className="text-[11px] font-bold text-muted-foreground">FIN</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`font-space font-bold text-sm leading-tight ${homeWon ? "text-primary" : "text-foreground"}`}>
            {match.home_team}
          </p>
        </div>
        <div className="text-center px-3">
          <div className="flex items-center gap-2">
            <span className={`text-3xl font-space font-black ${homeWon ? "text-primary" : draw ? "text-accent" : "text-muted-foreground"}`}>
              {match.home_score ?? "-"}
            </span>
            <span className="text-muted-foreground font-bold">-</span>
            <span className={`text-3xl font-space font-black ${awayWon ? "text-primary" : draw ? "text-accent" : "text-muted-foreground"}`}>
              {match.away_score ?? "-"}
            </span>
          </div>
        </div>
        <div className="flex-1 text-right">
          <p className={`font-space font-bold text-sm leading-tight ${awayWon ? "text-primary" : "text-foreground"}`}>
            {match.away_team}
          </p>
        </div>
      </div>

      {match.scorers?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex flex-wrap gap-1">
            {match.scorers.map((scorer, i) => (
              <span key={i} className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">⚽ {scorer}</span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
