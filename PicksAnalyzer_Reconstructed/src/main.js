const form = document.getElementById('match-form');
const resultCard = document.getElementById('result-card');
const output = document.getElementById('analysis-output');

function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

function analyzeMatch(data) {
  const homeStrength = data.homeForm - data.homeInjuries * 7 + 5;
  const awayStrength = data.awayForm - data.awayInjuries * 7;

  const strengthTotal = Math.max(1, homeStrength + awayStrength);
  const pHomeModel = clamp(homeStrength / strengthTotal, 0.05, 0.85);
  const pAwayModel = clamp(awayStrength / strengthTotal, 0.05, 0.85);
  const pDrawModel = clamp(1 - pHomeModel - pAwayModel, 0.1, 0.35);

  const fairHome = 1 / pHomeModel;
  const fairDraw = 1 / pDrawModel;
  const fairAway = 1 / pAwayModel;

  const values = [
    { key: 'Local', edge: ((data.oddsHome - fairHome) / fairHome) * 100, prob: pHomeModel, odds: data.oddsHome },
    { key: 'Empate', edge: ((data.oddsDraw - fairDraw) / fairDraw) * 100, prob: pDrawModel, odds: data.oddsDraw },
    { key: 'Visitante', edge: ((data.oddsAway - fairAway) / fairAway) * 100, prob: pAwayModel, odds: data.oddsAway },
  ].sort((a, b) => b.edge - a.edge);

  const best = values[0];
  const risk = best.prob >= 0.55 ? 'Bajo' : best.prob >= 0.42 ? 'Medio' : 'Alto';
  const riskClass = risk === 'Bajo' ? 'low' : risk === 'Medio' ? 'medium' : 'high';

  return { best, risk, riskClass, fairHome, fairDraw, fairAway };
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const fd = new FormData(form);
  const data = Object.fromEntries(fd.entries());

  const normalized = {
    homeTeam: data.homeTeam,
    awayTeam: data.awayTeam,
    homeForm: Number(data.homeForm),
    awayForm: Number(data.awayForm),
    homeInjuries: Number(data.homeInjuries),
    awayInjuries: Number(data.awayInjuries),
    oddsHome: Number(data.oddsHome),
    oddsDraw: Number(data.oddsDraw),
    oddsAway: Number(data.oddsAway),
  };

  const r = analyzeMatch(normalized);
  output.innerHTML = `
    <p class="output-item"><strong>Partido:</strong> ${normalized.homeTeam} vs ${normalized.awayTeam}</p>
    <p class="output-item"><strong>Pick recomendado:</strong> ${r.best.key} (cuota ${r.best.odds.toFixed(2)})</p>
    <p class="output-item"><strong>Valor estimado:</strong> ${r.best.edge.toFixed(2)}%</p>
    <p class="output-item"><strong>Riesgo:</strong> <span class="badge ${r.riskClass}">${r.risk}</span></p>
    <p class="output-item"><strong>Cuotas justas IA:</strong> Local ${r.fairHome.toFixed(2)} · Empate ${r.fairDraw.toFixed(2)} · Visitante ${r.fairAway.toFixed(2)}</p>
    <p class="output-item"><em>Nota:</em> Modelo heurístico educativo, no garantiza ganancias.</p>
  `;

  resultCard.hidden = false;
});
