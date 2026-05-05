import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Radio, Calendar, Lightbulb, DollarSign } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Home", path: "/" },
  { icon: Radio, label: "Vivo", path: "/live" },
  { icon: Calendar, label: "Próximos", path: "/scheduled" },
  { icon: Lightbulb, label: "Consejos", path: "/tips" },
  { icon: DollarSign, label: "Bankroll", path: "/bankroll" },
];

export default function MobileNav() {
  const location = useLocation();
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
