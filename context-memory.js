/* Nouran Context Memory v1
 * Bounded, layered memory for long-horizon operation.
 * Raw conversation is not the durable memory. The system keeps compact decision-relevant records,
 * provenance, causal links, and recoverable evidence. It never claims consciousness.
 */
(() => {
  "use strict";
  const KEY = "NOURAN_CONTEXT_MEMORY_V1";
  const SCHEMA = 1;
  const now = () => new Date().toISOString();
  const uid = () => (crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
  const clone = v => JSON.parse(JSON.stringify(v));
  const stop = new Set("the and or of to in on for with from this that is are was were be a an as at by it its we you i من في و أو من إلى على عن هذا هذه هو هي كان تكون مع عن".split(/\s+/));
  const terms = text => String(text || "").toLowerCase().replace(/[^\p{L}\p{N}_-]+/gu, " ").split(/\s+/).filter(x => x && !stop.has(x));
  const defaultState = () => ({ schema: SCHEMA, createdAt: now(), updatedAt: now(), revision: 0, hot: [], episodic: [], semantic: [], evidence: [], compactions: [] });
  function load() { try { const x = JSON.parse(localStorage.getItem(KEY) || "null"); return x && x.schema === SCHEMA ? x : defaultState(); } catch (_) { return defaultState(); } }
  let state = load();
  const cap = (list, item, max) => { list.push(item); if (list.length > max) list.splice(0, list.length - max); };
  function save() { state.updatedAt = now(); state.revision++; try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {} return clone(state); }
  function add(text, layer = "episodic", meta = {}) {
    const item = { id: uid(), at: now(), text: String(text), terms: terms(text).slice(0, 40), source: meta.source || "local", confidence: Number.isFinite(meta.confidence) ? Math.max(0, Math.min(1, meta.confidence)) : 0.7, causal: !!meta.causal, provenance: meta.provenance || null };
    const target = ["hot", "episodic", "semantic", "evidence"].includes(layer) ? layer : "episodic";
    cap(state[target], item, target === "hot" ? 24 : target === "episodic" ? 120 : target === "semantic" ? 80 : 160);
    save(); return item;
  }
  function score(item, queryTerms) {
    const overlap = queryTerms.reduce((n, t) => n + (item.terms?.includes(t) ? 1 : 0), 0);
    const causal = item.causal ? 2 : 0;
    const confidence = Number(item.confidence || 0);
    const recency = Math.max(0, 1 - ((Date.now() - Date.parse(item.at || 0)) / 86400000) / 30);
    return overlap * 5 + causal + confidence + recency;
  }
  function retrieve(query = "", limit = 12) {
    const q = terms(query); const all = [...state.hot, ...state.episodic, ...state.semantic, ...state.evidence];
    return all.map(x => ({ x, s: score(x, q) })).filter(y => !q.length || y.s > 0).sort((a,b) => b.s - a.s).slice(0, Math.max(1, Math.min(50, Number(limit) || 12))).map(y => y.x);
  }
  function pack(query = "", budget = 1800) {
    const items = retrieve(query, 50); const out = []; let used = 0;
    for (const x of items) { const line = `[${x.at}] ${x.text}`; const n = line.length; if (used + n > budget && out.length) continue; out.push(line); used += n; if (used >= budget) break; }
    return { query, budget, used, itemCount: out.length, context: out.join("\n") };
  }
  function compact(maxHot = 24, maxEpisodes = 120) {
    const before = { hot: state.hot.length, episodic: state.episodic.length, semantic: state.semantic.length, evidence: state.evidence.length };
    if (state.hot.length > maxHot) state.hot = state.hot.slice(-maxHot);
    if (state.episodic.length > maxEpisodes) {
      const old = state.episodic.splice(0, state.episodic.length - maxEpisodes);
      const promoted = old.filter(x => x.causal || x.confidence >= 0.9).slice(-20);
      for (const x of promoted) cap(state.semantic, { ...x, id: uid(), layer: "semantic", promotedAt: now() }, 80);
    }
    const after = { hot: state.hot.length, episodic: state.episodic.length, semantic: state.semantic.length, evidence: state.evidence.length };
    cap(state.compactions, { id: uid(), at: now(), before, after, policy: "bounded-layered-memory-v1" }, 50); save(); return { before, after };
  }
  function exportState() { return { format: "nouran-context-memory", schema: SCHEMA, exportedAt: now(), state: clone(state) }; }
  function health() { return { schema: state.schema, revision: state.revision, hot: state.hot.length, episodic: state.episodic.length, semantic: state.semantic.length, evidence: state.evidence.length, compactions: state.compactions.length }; }
  window.NouranContextMemory = Object.freeze({ add, retrieve, pack, compact, exportState, health, load: () => clone(state) });
})();
