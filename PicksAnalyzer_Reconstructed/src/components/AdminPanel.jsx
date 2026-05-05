import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Shield, Users, Crown, UserX, RefreshCw, CheckCircle, Loader2, Settings, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/common/PageHeader";
import { toast } from "sonner";

const roleBadge = {
  admin: { label: "Admin", color: "bg-destructive/10 text-destructive border-destructive/20" },
  premium: { label: "Premium ⭐", color: "bg-accent/10 text-accent border-accent/20" },
  free: { label: "Gratis", color: "bg-secondary text-muted-foreground border-border" },
};

export default function AdminPanel() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ["all-users"],
    queryFn: () => base44.entities.User.list(),
  });

  const updateUser = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      toast.success("Usuario actualizado");
    }
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === "admin").length,
    premium: users.filter(u => u.role === "premium").length,
    free: users.filter(u => u.role === "free").length,
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <PageHeader
        title="Panel de Administración"
        subtitle="Gestión de usuarios y suscripciones"
        action={
          <Button variant="outline" size="sm" onClick={() => refetch()} className="border-border">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total usuarios", value: stats.total, icon: Users, color: "text-foreground" },
          { label: "Administradores", value: stats.admins, icon: Shield, color: "text-destructive" },
          { label: "Premium", value: stats.premium, icon: Crown, color: "text-accent" },
          { label: "Gratuitos", value: stats.free, icon: UserX, color: "text-muted-foreground" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-4 text-center">
            <Icon className={`w-5 h-5 mx-auto mb-2 ${color}`} />
            <p className={`text-2xl font-space font-black ${color}`}>{value}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Info boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-4 h-4 text-accent" />
            <h3 className="font-space font-bold text-foreground text-sm">Acceso según plan</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-16 font-bold text-muted-foreground">Gratis:</span>
              <span className="text-foreground">Solo Pick del Día</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-16 font-bold text-accent">Premium:</span>
              <span className="text-foreground">Partidos en vivo, análisis completo, picks personalizados, bankroll</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-16 font-bold text-destructive">Admin:</span>
              <span className="text-foreground">Acceso total + panel de administración</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-chart-3" />
            <h3 className="font-space font-bold text-foreground text-sm">Publicación y cobro</h3>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>• Para publicar la app ve a <strong className="text-foreground">Configuración → Publicar</strong> en el panel de Base44</p>
            <p>• Para cobrar suscripciones, Base44 soporta integración con <strong className="text-foreground">Stripe</strong> — activa el plan Builder+</p>
            <p>• Para soporte y desarrollo continuo, puedes suscribirte al plan de Base44 que incluye soporte dedicado</p>
            <p>• Invita usuarios desde Base44 dashboard y asigna el rol "premium" manualmente o via Stripe webhook</p>
          </div>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-space font-bold text-foreground">Usuarios registrados</h3>
        </div>
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Cargando usuarios...</p>
          </div>
        ) : users.length > 0 ? (
          <div className="divide-y divide-border">
            {users.map(user => (
              <div key={user.id} className="p-4 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-foreground shrink-0">
                  {user.full_name?.[0] || user.email?.[0] || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{user.full_name || "Sin nombre"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${roleBadge[user.role]?.color || roleBadge.free.color}`}>
                    {roleBadge[user.role]?.label || "Gratis"}
                  </span>
                  <Select
                    value={user.role || "free"}
                    onValueChange={(val) => updateUser.mutate({ id: user.id, data: { role: val } })}
                  >
                    <SelectTrigger className="h-8 w-28 text-xs bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Gratis</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground text-sm">No hay usuarios registrados</div>
        )}
      </div>
    </div>
  );
}
