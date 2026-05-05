import { useState } from "react";
import { ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import { format, addDays, subDays, isToday } from "date-fns";
import { es } from "date-fns/locale";

export default function MatchFilters({ date, onDateChange, leagues, selectedLeague, onLeagueChange, showDate = true }) {
  const [showLeagues, setShowLeagues] = useState(false);

  const dayLabel = (d) => {
    if (isToday(d)) return "Hoy";
    return format(d, "EEE d MMM", { locale: es });
  };

  return (
    <div className="space-y-3 mb-6">
      {/* Date selector */}
      {showDate && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDateChange(subDays(date, 1))}
            className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>

          <div className="flex-1 overflow-x-auto hide-scrollbar">
            <div className="flex gap-2 min-w-max">
              {[-3, -2, -1, 0, 1, 2, 3].map((offset) => {
                const d = addDays(new Date(), offset);
                const isSelected = format(d, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
                return (
                  <button
                    key={offset}
                    onClick={() => onDateChange(d)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground font-bold"
                        : offset === 0
                        ? "bg-secondary text-foreground border border-primary/30"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {dayLabel(d)}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onDateChange(addDays(date, 1))}
            className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
        </div>
      )}

      {/* League filter */}
      {leagues && leagues.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
          <button
            onClick={() => onLeagueChange(null)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
              !selectedLeague ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <Filter className="w-3 h-3" />
            Todas ({leagues.length})
          </button>
          {leagues.map((league) => (
            <button
              key={league}
              onClick={() => onLeagueChange(selectedLeague === league ? null : league)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                selectedLeague === league
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {league}
              {selectedLeague === league && <X className="w-3 h-3" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
