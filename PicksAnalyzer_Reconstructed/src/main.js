import { analyzeMatch } from './analysisEngine.js';

const BET_MARKETS = ['1X2', 'Doble oportunidad', 'Hándicap asiático/europeo', 'Total goles O/U', 'Ambos anotan', 'Marcador correcto', 'Corners', 'Tarjetas', 'Resultado al descanso', 'Parlay', 'Sistema'];
const TOP_LEAGUES = ['Premier League', 'Italian Serie A', 'Spanish LALIGA', 'French Ligue 1', 'Liga BetPlay'];
const state = { matches: [], selectedDate: null, selectedLeagues: new Set(TOP_LEAGUES) };

const fmtYmd = (d) => d.toISOString().slice(0,10);

function mockFallbackMatches(days) {
  return [
    { id:'mx1', league:'Premier League', status:'in', minute:'55', date:days[0], home:'Liverpool', away:'Tottenham', score:'1-1', shotsOnTarget:7, corners:6, cards:3 },
    { id:'mx2', league:'La Liga', status:'pre', minute:'', date:days[1] || days[0], home:'Barcelona', away:'Valencia', score:'0-0', shotsOnTarget:0, corners:0, cards:0 },
    { id:'mx3', league:'Serie A', status:'post', minute:'FT', date:days[0], home:'Milan', away:'Napoli', score:'2-0', shotsOnTarget:8, corners:7, cards:4 },
  ];
}

async function fetchMatchesByDate(ymd) {
  const date = ymd.replaceAll('-', '');
  const res = await fetch(`/matches?date=${date}`);
  if (!res.ok) throw new Error('No disponible');
  const data = await res.json();
  return data.matches || [];
}

async function loadWindowDates() {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i); return fmtYmd(d);
  });
  const results = await Promise.all(days.map(async (d) => {
    try { return await fetchMatchesByDate(d); } catch { return []; }
  }));
  state.matches = results.flat();
  if (!state.matches.length) state.matches = mockFallbackMatches(days);
  state.selectedDate = state.selectedDate || days[0];
}

function groupMatches() {
  const live = state.matches.filter(m => m.status === 'in');
  const scheduled = state.matches.filter(m => m.status === 'pre');
  const finished = state.matches.filter(m => m.status === 'post');
  return { live, scheduled, finished };
}

function renderTabs() {
  document.querySelectorAll('.tab').forEach(btn => btn.onclick = () => {
    document.querySelectorAll('.tab,.tab-content').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active'); document.getElementById(btn.dataset.tab).classList.add('active');
  });
}

function prioritize(list) {
  return [...list].sort((a,b)=> (TOP_LEAGUES.includes(b.league)-TOP_LEAGUES.includes(a.league)) || a.league.localeCompare(b.league));
}

function renderDateChips(scheduled) {
  const dates = [...new Set(scheduled.map(m => m.date))].sort();
  const wrap = document.getElementById('date-chips');
  wrap.innerHTML = dates.map(d=>`<button class="chip ${d===state.selectedDate?'active':''}" data-date="${d}">${d}</button>`).join('');
  wrap.querySelectorAll('.chip').forEach(c=>c.onclick=()=>{state.selectedDate=c.dataset.date; renderAll();});
}

function renderMatchList(targetId, matches) {
  const el = document.getElementById(targetId);
  el.innerHTML = `<div class="grid">${matches.map(m=>`<article class="match"><h4>${m.home} vs ${m.away}</h4><div class="small">${m.league} · ${m.date} · ${m.minute || ''}</div><div>${m.score}</div><button class="analyze-btn" data-id="${m.id}">Analizar IA</button></article>`).join('')}</div>`;
  el.querySelectorAll('.analyze-btn').forEach(b => b.onclick = () => analyzeById(b.dataset.id));
}

function marketSuggestions(m, r){
  return [
    `1X2 sugerido: ${r.best.key}`,
    `Doble oportunidad: ${r.best.key === 'Local' ? '1X' : r.best.key === 'Visitante' ? 'X2' : '12'}`,
    `Total de goles: ${m.shotsOnTarget > 7 ? 'Más de 2.5' : 'Menos de 3.5'}`,
    `Ambos anotan: ${m.shotsOnTarget > 6 ? 'Sí' : 'No'}`,
    `Corners: ${m.corners >= 8 ? 'Más de 8.5' : 'Menos de 10.5'}`,
    `Tarjetas: ${m.cards >= 4 ? 'Más de 3.5' : 'Menos de 5.5'}`,
  ];
}

function analyzeById(id) {
  const m = state.matches.find(x => x.id === id); if (!m) return;
  const base = Math.min(95, 50 + m.shotsOnTarget * 3 + m.corners);
  const r = analyzeMatch({ homeForm: base, awayForm: 52, homeInjuries: 0, awayInjuries: 1, oddsHome: 1.85, oddsDraw: 3.3, oddsAway: 4.2 });
  const tips = marketSuggestions(m, r).map(t=>`<li>${t}</li>`).join('');
  document.getElementById('analysis-output').innerHTML = `<p><b>${m.home} vs ${m.away}</b> (${m.minute || 'Prepartido'})</p><p>Pick principal: <b>${r.best.key}</b> · Riesgo: ${r.risk} · Confianza ${(r.confidence*100).toFixed(1)}%</p><p>Stake sugerido: ${(r.recommendedStake*100).toFixed(1)}% bank</p><ul>${tips}</ul>`;
  document.getElementById('analysis-panel').hidden = false;
}

function renderTipsTab() {
  const liveOrSched = state.matches.filter(m => m.status !== 'post');
  const best = liveOrSched[0];
  document.getElementById('best-tip').innerHTML = best ? `${best.home} vs ${best.away} · Cuota objetivo > 1.55` : 'Sin partidos para recomendar.';

  const leagues = [...new Set(state.matches.map(m=>m.league))];
  document.getElementById('league-filters').innerHTML = leagues.map(l=>`<label><input type="checkbox" data-league="${l}" ${state.selectedLeagues.has(l)?'checked':''}/> ${l}</label>`).join(' ');
  document.querySelectorAll('#league-filters input').forEach(i=> i.onchange = ()=> i.checked ? state.selectedLeagues.add(i.dataset.league) : state.selectedLeagues.delete(i.dataset.league));

  document.getElementById('combo-results').innerHTML = `<p class="small">Mercados soportados: ${BET_MARKETS.join(', ')}.</p>`;
  document.getElementById('generate-combo').onclick = () => {
    const legs = Number(document.getElementById('legs').value || 2);
    const risk = document.getElementById('risk').value;
    const picks = liveOrSched.filter(m=>state.selectedLeagues.has(m.league)).slice(0, legs).map(m=>`- ${m.home} vs ${m.away}: Doble oportunidad + corners (${risk})`).join('<br>');
    document.getElementById('combo-results').innerHTML = picks || 'No hay partidos con esos filtros.';
  };
}

function renderAll() {
  const { live, scheduled, finished } = groupMatches();
  renderMatchList('live', prioritize(live));
  renderDateChips(scheduled);
  renderMatchList('scheduled-list', prioritize(scheduled.filter(m => m.date === state.selectedDate)));
  renderMatchList('finished', prioritize(finished));
  renderTipsTab();
}

(async function init(){
  renderTabs();
  await loadWindowDates();
  renderAll();
})();
