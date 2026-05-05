import { analyzeMatch } from './analysisEngine.js';

function initApp(doc = document) {
  const form = doc.getElementById('match-form');
  const resultCard = doc.getElementById('result-card');
  const output = doc.getElementById('analysis-output');

  if (!form || !resultCard || !output) {
    return false;
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

  return true;
}

initApp();

export { initApp };
