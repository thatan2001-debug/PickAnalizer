import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const PORT = Number(process.env.PORT || 4173);
const ROOT = 'src';
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8' };

async function fetchWebMatches(dateYmd) {
  const date = dateYmd || new Date().toISOString().slice(0,10).replaceAll('-','');
  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard?dates=${date}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('No se pudo consultar fuente web');
  const data = await res.json();
  return (data.events || []).map((e) => {
    const comp = e.competitions?.[0] || {};
    const teams = comp.competitors || [];
    const home = teams.find(t => t.homeAway === 'home') || teams[0] || {};
    const away = teams.find(t => t.homeAway === 'away') || teams[1] || {};
    return {
      id: e.id,
      league: e.league?.name || e.shortName || 'Liga',
      country: e.league?.abbreviation || 'INTL',
      status: (e.status?.type?.state || '').toLowerCase(),
      minute: e.status?.type?.shortDetail || '',
      date: (e.date || '').slice(0,10),
      home: home.team?.displayName || 'Local',
      away: away.team?.displayName || 'Visitante',
      score: `${home.score || 0}-${away.score || 0}`,
      shotsOnTarget: Number(comp?.statistics?.find?.(s=>s.name==='shotsOnTarget')?.displayValue || 4),
      corners: Number(comp?.statistics?.find?.(s=>s.name==='cornerKicks')?.displayValue || 5),
      cards: Number(comp?.statistics?.find?.(s=>s.name==='yellowCards')?.displayValue || 3),
    };
  });
}

function sendJson(res, code, payload){res.writeHead(code,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(payload));}

const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, `http://localhost:${PORT}`);
    if (u.pathname === '/matches') {
      const matches = await fetchWebMatches(u.searchParams.get('date'));
      return sendJson(res, 200, { matches });
    }

    const rawPath = u.pathname === '/' ? '/index.html' : u.pathname;
    const safePath = normalize(rawPath).replace(/^\.\.(\/|\\|$)+/, '');
    const filePath = join(ROOT, safePath);
    const data = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  } catch (error) {
    if (String(req.url).startsWith('/matches')) return sendJson(res, 500, { error: 'Fuente web no disponible', details: String(error) });
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
});

server.listen(PORT, () => console.log(`PickAnalyzer web live at http://localhost:${PORT}`));
