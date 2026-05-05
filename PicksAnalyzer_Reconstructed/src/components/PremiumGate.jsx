import { Crown } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

export default function PremiumGate({ children, fallback }) {
  const { isPremium, isLoading } = useUserRole();

  if (isLoading) return null;
  if (isPremium) return children;

  if (fallback) return fallback;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
        <Crown className="w-8 h-8 text-accent" />
      </div>
      <h3 className="font-space font-bold text-foreground text-lg mb-2">Contenido Premium</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-4">
        Esta función está disponible para usuarios Premium. Actualiza tu plan para acceder a análisis completos, partidos en vivo y picks personalizados.
      </p>
      <div className="bg-card border border-accent/30 rounded-2xl p-4 max-w-sm w-full text-left">
        <p className="text-xs font-bold text-accent mb-2">✨ Premium incluye:</p>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>✓ Partidos en vivo con análisis de apuesta</li>
          <li>✓ Análisis completo H2H, xG, forma reciente</li>
          <li>✓ Picks personalizados por cuota y riesgo</li>
          <li>✓ Bankroll y gestión de apuestas</li>
          <li>✓ Historial completo de picks</li>
        </ul>
        <p className="text-[10px] text-muted-foreground mt-3">Contacta al administrador para activar tu cuenta Premium.</p>
      </div>
    </div>
  );
}
