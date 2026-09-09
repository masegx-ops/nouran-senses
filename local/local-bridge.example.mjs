// Nouran Local Bridge example
// Run only on a trusted machine with an explicit NOURAN_LOCAL_TOKEN.
// This starts read-only. It intentionally does NOT expose arbitrary shell execution.

import http from 'node:http';
import os from 'node:os';

const PORT = Number(process.env.NOURAN_LOCAL_PORT || 8787);
const TOKEN = process.env.NOURAN_LOCAL_TOKEN;

function reply(res, status, data) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(data));
}

function authorized(req) {
  return TOKEN && req.headers.authorization === `Bearer ${TOKEN}`;
}

const server = http.createServer((req, res) => {
  if (req.url === '/health' && req.method === 'GET') {
    return reply(res, 200, { ok: true, service: 'nouran-local-bridge', time: new Date().toISOString(), hostname: os.hostname(), platform: process.platform, node: process.version });
  }
  if (!authorized(req)) return reply(res, 401, { error: 'unauthorized' });

  if (req.url === '/system' && req.method === 'GET') {
    return reply(res, 200, { ok: true, cpus: os.cpus().length, memoryBytes: os.totalmem(), freeMemoryBytes: os.freemem(), uptimeSec: os.uptime(), platform: process.platform, arch: process.arch });
  }

  return reply(res, 404, { error: 'not_found' });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Nouran local bridge listening on 127.0.0.1:${PORT}`);
});
