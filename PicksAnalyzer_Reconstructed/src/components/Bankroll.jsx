import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PremiumGate from "@/components/common/PremiumGate";
import { base44 } from "@/api/base44Client";
import { useMemo } from "react";
import { DollarSign, TrendingUp, TrendingDown, PlusCircle, Loader2, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import PageHeader from "@/components/common/PageHeader";
import { calculateKellyStake, calculatePercentageStake, calculatePotentialProfit, calculateROI, calculateWinRate } from "@/lib/bankrollUtils";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function Bankroll() {
  const queryClient = useQueryClient();
  const [showAddBet, setShowAddBet] = useState(false);
  const [form, setForm] = useState({
    home_team: "", away_team: "", league: "",
    bet_type: "1X2", bet_selection: "", odds: "", stake: "",
    bookmaker: "", result: "pending", confidence: "", notes: ""
  });
  const [bankrollInput, setBankrollInput] = useState("");
  const [strategy, setStrategy] = useState("flat");
  const [flatStake, setFlatStake] = useState("");
  const [kellyProb, setKellyProb] = useState("");
  const [kellyOdds, setKellyOdds] = useState("");
  const [percentStake, setPercentStake] = useState("");

  const { data: records = [] } = useQuery({
    queryKey: ["betting-records"],
    queryFn: () => base44.entities.BettingRecord.list("-created_date"),
  });

  const { data: settings = [] } = useQuery({
    queryKey: ["bankroll-settings"],
    queryFn: () => base44.entities.BankrollSettings.list(),
  });

  const bankrollSetting = settings[0];
  const bankroll = bankrollInput || bankrollSetting?.current_bankroll || 1000;

  const saveBet = useMutation({
    mutationFn: (data) => base44.entities.BettingRecord.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["betting-records"] });
      setShowAddBet(false);
      setForm({ home_team: "", away_team: "", league: "", bet_type: "1X2", bet_selection: "", odds: "", stake: "", bookmaker: "", result: "pending", confidence: "", notes: "" });
      toast.success("Apuesta registrada");
    }
  });

  const updateResult = useMutation({
    mutationFn: ({ id, result }) => {
      const stake = records.find(r => r.id === id)?.stake || 0;
      const odds = records.find(r => r.id === id)?.odds || 1;
      const profit_loss = result === 'won' ? +(stake * (odds - 1)).toFixed(2) : result === 'lost' ? -stake : 0;
      return base44.entities.BettingRecord.update(id, { result, profit_loss });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["betting-records"] })
  });

  const roi = useMemo(() => calculateROI(records), [records]);

const winRate = useMemo(() => calculateWinRate(records), [records]);

const totalProfit = useMemo(() => {
  return records.reduce((s, r) => s + (r.profit_loss || 0), 0);
}, [records]);

const resolved = useMemo(() => {
  return records.filter((r) => r.result !== "pending").length;
}, [records]);

  // Build equity curve
  const equityCurve = records.filter(r => r.result !== 'pending').reverse().reduce((acc, r, i) => {
    const prev = acc[i - 1]?.bankroll || Number(bankroll);
    acc.push({ i: i + 1, bankroll: +(prev + (r.profit_loss || 0)).toFixed(2) });
    return acc;
  }, []);

  // Kelly calc
  let suggestedStake = null;
  if (strategy === "kelly" && kellyProb && kellyOdds) {
    suggestedStake = calculateKellyStake(Number(bankroll), Number(kellyProb) / 100, Number(kellyOdds));
  } else if (strategy === "percentage" && percentStake) {
    suggestedStake = calculatePercentageStake(Number(bankroll), Number(percentStake));
  } else if (strategy === "flat" && flatStake) {
    suggestedStake = Number(flatStake);
  }

  const handleSubmit = () => {
    saveBet.mutate({
      ...form,
      odds: parseFloat(form.odds),
      stake: parseFloat(form.stake),
      confidence: form.confidence ? parseInt(form.confidence) : undefined,
      potential_profit: form.odds && form.stake ? calculatePotentialProfit(parseFloat(form.stake), parseFloat(form.odds)) : undefined,
    });
  };

  return (
    <PremiumGate>
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <PageHeader
        title="Bankroll & Apuestas"
        subtitle="Control de banca y gestión de apuestas"
        action={
          <Button onClick={() => setShowAddBet(!showAddBet)} className="bg-primary text-primary-foreground font-semibold">
            <PlusCircle className="w-4 h-4 mr-2" />
            Registrar Apuesta
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className={`text-2xl font-space font-black ${totalProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">P&L Total</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className={`text-2xl font-space font-black ${roi >= 0 ? 'text-primary' : 'text-destructive'}`}>{roi >= 0 ? '+' : ''}{roi}%</p>
          <p className="text-[10px] text-muted-foreground mt-1">ROI</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-space font-black text-foreground">{winRate}%</p>
          <p className="text-[10px] text-muted-foreground mt-1">Win Rate</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-space font-black text-foreground">{resolved}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Apuestas resueltas</p>
        </div>
      </div>

      {/* Equity Curve */}
      {equityCurve.length > 1 && (
        <div className="bg-card border border-border rounded-2xl p-5 mb-6">
          <p className="font-space font-bold text-foreground text-sm mb-4">Curva de Bankroll</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={equityCurve}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="i" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="bankroll" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Stake Calculator */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-4 h-4 text-accent" />
          <h3 className="font-space font-bold text-foreground text-sm">Calculadora de Stake</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <Label className="text-xs text-muted-foreground">Mi bankroll</Label>
            <Input value={bankrollInput} onChange={e => setBankrollInput(e.target.value)} placeholder="1000" className="bg-secondary border-border mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Estrategia</Label>
            <Select value={strategy} onValueChange={setStrategy}>
              <SelectTrigger className="bg-secondary border-border mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flat">Stake Fijo</SelectItem>
                <SelectItem value="kelly">Kelly Criterion</SelectItem>
                <SelectItem value="percentage">% del Bankroll</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {strategy === "flat" && (
          <Input value={flatStake} onChange={e => setFlatStake(e.target.value)} placeholder="Stake fijo (ej: 50)" className="bg-secondary border-border" />
        )}
        {strategy === "kelly" && (
          <div className="grid grid-cols-2 gap-3">
            <Input value={kellyProb} onChange={e => setKellyProb(e.target.value)} placeholder="Probabilidad % (ej: 65)" className="bg-secondary border-border" />
            <Input value={kellyOdds} onChange={e => setKellyOdds(e.target.value)} placeholder="Cuota (ej: 1.80)" className="bg-secondary border-border" />
          </div>
        )}
        {strategy === "percentage" && (
          <Input value={percentStake} onChange={e => setPercentStake(e.target.value)} placeholder="% del bankroll (ej: 3)" className="bg-secondary border-border" />
        )}
        {suggestedStake !== null && suggestedStake > 0 && (
          <div className="mt-3 bg-primary/10 border border-primary/20 rounded-xl p-3">
            <p className="text-xs text-muted-foreground">Stake recomendado</p>
            <p className="font-space font-black text-2xl text-primary">${suggestedStake}</p>
            {kellyOdds && <p className="text-xs text-muted-foreground">Ganancia potencial: ${calculatePotentialProfit(suggestedStake, Number(kellyOdds))}</p>}
          </div>
        )}
      </div>

      {/* Add Bet Form */}
      {showAddBet && (
        <div className="bg-card border border-primary/20 rounded-2xl p-5 mb-6">
          <h3 className="font-space font-bold text-foreground mb-4">Nueva Apuesta</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <Input placeholder="Equipo local" value={form.home_team} onChange={e => setForm({...form, home_team: e.target.value})} className="bg-secondary border-border" />
            <Input placeholder="Equipo visitante" value={form.away_team} onChange={e => setForm({...form, away_team: e.target.value})} className="bg-secondary border-border" />
            <Input placeholder="Liga" value={form.league} onChange={e => setForm({...form, league: e.target.value})} className="bg-secondary border-border" />
            <Input placeholder="Selección (ej: Victoria Local)" value={form.bet_selection} onChange={e => setForm({...form, bet_selection: e.target.value})} className="bg-secondary border-border" />
            <Input type="number" placeholder="Cuota (ej: 1.80)" value={form.odds} onChange={e => setForm({...form, odds: e.target.value})} className="bg-secondary border-border" />
            <Input type="number" placeholder="Stake" value={form.stake} onChange={e => setForm({...form, stake: e.target.value})} className="bg-secondary border-border" />
            <Input placeholder="Casa de apuestas" value={form.bookmaker} onChange={e => setForm({...form, bookmaker: e.target.value})} className="bg-secondary border-border" />
            <Select value={form.bet_type} onValueChange={v => setForm({...form, bet_type: v})}>
              <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["1X2", "Over/Under", "BTTS", "Handicap", "Corners", "Tarjetas", "Resultado exacto"].map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {form.odds && form.stake && (
            <div className="bg-secondary rounded-xl p-3 mb-3 text-sm">
              <span className="text-muted-foreground">Ganancia potencial: </span>
              <span className="font-bold text-primary">${calculatePotentialProfit(parseFloat(form.stake), parseFloat(form.odds))}</span>
            </div>
          )}
          <Button onClick={handleSubmit} disabled={saveBet.isPending || !form.home_team || !form.bet_selection || !form.odds || !form.stake} className="bg-primary text-primary-foreground font-semibold">
            {saveBet.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PlusCircle className="w-4 h-4 mr-2" />}
            Guardar Apuesta
          </Button>
        </div>
      )}

      {/* Records */}
      {records.length > 0 && (
        <div>
          <h3 className="font-space font-bold text-foreground mb-4">Historial de Apuestas</h3>
          <div className="space-y-2">
            {records.map(record => (
              <div key={record.id} className={`bg-card border rounded-xl p-4 flex items-center justify-between gap-4 ${
                record.result === 'won' ? 'border-primary/20' : record.result === 'lost' ? 'border-destructive/20' : 'border-border'
              }`}>
                <div className="flex-1 min-w-0">
                  <p className="font-space font-bold text-sm text-foreground truncate">{record.home_team} vs {record.away_team}</p>
                  <p className="text-xs text-muted-foreground">{record.bet_selection} • {record.bet_type} • Cuota: {record.odds}</p>
                  <p className="text-xs text-muted-foreground">Stake: ${record.stake} {record.bookmaker ? `• ${record.bookmaker}` : ''}</p>
                </div>
                <div className="text-right shrink-0">
                  {record.result !== 'pending' ? (
                    <p className={`font-space font-black text-sm ${(record.profit_loss || 0) >= 0 ? 'text-primary' : 'text-destructive'}`}>
                      {(record.profit_loss || 0) >= 0 ? '+' : ''}${record.profit_loss?.toFixed(2)}
                    </p>
                  ) : (
                    <div className="flex gap-1">
                      <button onClick={() => updateResult.mutate({ id: record.id, result: 'won' })} className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded-lg font-bold">✅ W</button>
                      <button onClick={() => updateResult.mutate({ id: record.id, result: 'lost' })} className="text-[10px] bg-destructive/10 text-destructive border border-destructive/20 px-2 py-1 rounded-lg font-bold">❌ L</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </PremiumGate>
  );
}
