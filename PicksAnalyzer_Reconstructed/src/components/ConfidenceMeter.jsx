export default function ConfidenceMeter({ value }) {
  const getColor = () => {
    if (value >= 80) return "bg-primary";
    if (value >= 60) return "bg-accent";
    return "bg-muted-foreground";
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Confianza</span>
        <span className="text-sm font-black font-space text-foreground">{value}%</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${getColor()}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
