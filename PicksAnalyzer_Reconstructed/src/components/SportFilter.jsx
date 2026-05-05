const sports = [
  { key: "all", label: "Todos", emoji: "🏟️" },
  { key: "football", label: "Fútbol", emoji: "⚽" },
  { key: "basketball", label: "Basket", emoji: "🏀" },
  { key: "tennis", label: "Tenis", emoji: "🎾" },
  { key: "baseball", label: "Béisbol", emoji: "⚾" },
  { key: "hockey", label: "Hockey", emoji: "🏒" },
  { key: "mma", label: "MMA", emoji: "🥊" },
];

export default function SportFilter({ selected, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {sports.map((sport) => (
        <button
          key={sport.key}
          onClick={() => onChange(sport.key)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
            selected === sport.key
              ? "bg-primary/10 text-primary border border-primary/30"
              : "bg-secondary text-muted-foreground hover:text-foreground border border-transparent"
          }`}
        >
          <span className="text-sm">{sport.emoji}</span>
          {sport.label}
        </button>
      ))}
    </div>
  );
}

layout
