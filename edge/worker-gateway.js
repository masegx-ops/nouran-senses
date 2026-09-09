// Nouran Edge Gateway v1 — Cloudflare Workers-compatible skeleton.
// Configure a secret AUTH_TOKEN and a D1 binding NOURAN_DB before deployment.
// Never hard-code credentials.

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
});

async function authorized(request, env) {
  const expected = env.AUTH_TOKEN;
  if (!expected) return false;
  const supplied = request.headers.get('authorization') || '';
  return supplied === `Bearer ${expected}`;
}

async function initDb(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    type TEXT NOT NULL,
    source TEXT NOT NULL,
    payload_json TEXT NOT NULL
  )`).run();
}

export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname === '/health') {
      return json({ ok: true, service: 'nouran-edge-gateway', time: new Date().toISOString() });
    }
    if (!(await authorized(request, env))) return json({ error: 'unauthorized' }, 401);
    if (!env.NOURAN_DB) return json({ error: 'NOURAN_DB binding missing' }, 503);

    await initDb(env.NOURAN_DB);
    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/event') {
      const body = await request.json().catch(() => null);
      if (!body?.type) return json({ error: 'type required' }, 400);
      const id = body.id || crypto.randomUUID();
      const createdAt = new Date().toISOString();
      await env.NOURAN_DB.prepare(
        'INSERT OR REPLACE INTO events (id, created_at, type, source, payload_json) VALUES (?, ?, ?, ?, ?)'
      ).bind(id, createdAt, String(body.type), String(body.source || 'edge'), JSON.stringify(body.payload || {})).run();
      return json({ ok: true, id, createdAt });
    }

    if (request.method === 'GET' && url.pathname === '/events') {
      const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') || 20)));
      const rows = await env.NOURAN_DB.prepare(
        'SELECT id, created_at, type, source, payload_json FROM events ORDER BY created_at DESC LIMIT ?'
      ).bind(limit).all();
      return json({ ok: true, rows: rows.results || [] });
    }

    return json({ error: 'not_found' }, 404);
  }
};
