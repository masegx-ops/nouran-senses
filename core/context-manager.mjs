// Nouran Context Manager v1
// Bounded retrieval for durable state. Ranking is an engineering heuristic, not understanding.

const clone = v => JSON.parse(JSON.stringify(v));

function words(text) {
  return new Set(String(text || '').toLowerCase().split(/[^\p{L}\p{N}_-]+/u).filter(w => w.length > 1));
}

function score(item, query) {
  const q = words(query);
  const blob = JSON.stringify(item).toLowerCase();
  let hits = 0;
  for (const w of q) if (blob.includes(w)) hits += 1;
  const confidence = Number(item?.confidence ?? 0);
  const causal = item?.causalRelevance === true ? 2 : Number(item?.causalRelevance ?? 0);
  const verified = item?.verified === true || item?.evidence === 'REPRODUCED' ? 1 : 0;
  return hits * 5 + confidence * 2 + causal + verified;
}

export function candidates(state) {
  const all = [];
  for (const key of ['events', 'decisions', 'observations', 'hypotheses', 'openQuestions', 'failedPaths', 'capabilities', 'experiments']) {
    for (const item of (Array.isArray(state?.[key]) ? state[key] : [])) all.push({ source: key, item });
  }
  if (state?.direction) all.push({ source: 'direction', item: state.direction });
  return all;
}

export function select(state, query = '', budget = 12) {
  const ranked = candidates(state)
    .map(x => ({ ...x, score: score(x.item, query) }))
    .sort((a, b) => b.score - a.score || String(a.item.at || '').localeCompare(String(b.item.at || '')));
  return clone(ranked.slice(0, Math.max(1, Number(budget) || 12)));
}

export function compact(state, query = '', budget = 12) {
  return {
    schema: 1,
    generatedAt: new Date().toISOString(),
    query,
    budget,
    direction: clone(state?.direction ?? null),
    selected: select(state, query, budget).map(x => ({ source: x.source, score: x.score, item: x.item })),
    provenance: 'Each selected item remains linked to its state collection; callers must retain the full portable bundle for recovery.'
  };
}

export function delayedRelevance(stateBefore, stateAfter, query = '') {
  const a = select(stateBefore, query, 20);
  const b = select(stateAfter, query, 20);
  const idsA = new Set(a.map(x => x.item.id).filter(Boolean));
  const retained = b.filter(x => idsA.has(x.item.id)).length;
  return { query, beforeCount: a.length, afterCount: b.length, retainedIdentityCount: retained, interpretation: 'heuristic-retrieval-only' };
}
