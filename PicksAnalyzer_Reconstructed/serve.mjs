import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const PORT = Number(process.env.PORT || 4173);
const ROOT = 'src';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

const server = http.createServer(async (req, res) => {
  try {
    const rawPath = req.url === '/' ? '/index.html' : req.url;
    const safePath = normalize(rawPath).replace(/^\.\.(\/|\\|$)+/, '');
    const filePath = join(ROOT, safePath);

    const data = await readFile(filePath);
    const type = MIME[extname(filePath)] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`PickAnalyzer (reconstructed) running at http://localhost:${PORT}`);
});
