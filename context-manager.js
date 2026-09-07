/* Nouran Context Manager v1
 * Bounded working-context selection from durable state.
 * Keeps provenance and delayed-relevance recovery paths instead of replaying a transcript.
 */
(() => {
  "use strict";
  const clone = v => JSON.parse(JSON.stringify(v));
  const text = v => typeof v === "string" ? v : JSON.stringify(v);
  const score = (item, query = "") => {
    const s = text(item).toLowerCase();
    const q = String(query).toLowerCase().split(/\s+/).filter(Boolean);
    const hits = q.reduce((n, w) => n + (s.includes(w) ? 1 : 0), 0);
    const causal = item?.causalRelevance ?? item?.confidence ?? 0;
    const verified = item?.verified ? 1 : 0;
    return hits * 3 + Number(causal) * 2 + verified;
  };
  function select(state, query = "", budget = 12) {
    const limit = Math.max(1, Math.min(50, Number(budget) || 12));
    const candidates = [];
    for (const e of (state?.events || [])) candidates.push({kind:"event", item:e, sourceId:e.id});
    for (const d of (state?.decisions || [])) candidates.push({kind:"decision", item:d, sourceId:d.id});
    for (const o of (state?.observations || [])) candidates.push({kind:"observation", item:o, sourceId:null});
    for (const h of (state?.hypotheses || [])) candidates.push({kind:"hypothesis", item:h, sourceId:null});
    for (const l of (state?.causalLinks || [])) candidates.push({kind:"causalLink", item:l, sourceId:l.id});
    for (const x of (state?.causalExperiments || [])) candidates.push({kind:"causalExperiment", item:x, sourceId:x.id});
    const ranked = candidates.map((c, i) => ({...c, rank: score(c.item, query) + (candidates.length - i) / 100000}))
      .sort((a,b) => b.rank - a.rank).slice(0, limit);
    return {
      protocol:"bounded-working-context-v1",
      budget:limit,
      query:String(query),
      items:ranked.map(({kind,item,sourceId,rank}) => ({kind, sourceId, rank, item:clone(item)})),
      provenance:{stateRevision:state?.stateRevision ?? null, generatedAt:new Date().toISOString(), recoverable:true},
      limitation:"Selection is a bounded retrieval policy; relevance scoring is not evidence of understanding."
    };
  }
  function compact(state, query = "", budget = 12) {
    const selected = select(state, query, budget);
    return {protocol:"bounded-memory-v1", stateRevision:state?.stateRevision ?? null, direction:clone(state?.direction ?? null), priorities:clone(state?.priorities ?? []), selected};
  }
  function delayedRelevanceTest(state, query = "", budget = 12) {
    const full = compact(state, query, Math.min(50, Math.max(12,budget*4)));
    const bounded = compact(state, query, budget);
    const fullIds = new Set(full.selected.items.map(x => x.sourceId).filter(Boolean));
    const boundedIds = new Set(bounded.selected.items.map(x => x.sourceId).filter(Boolean));
    return {protocol:"delayed-relevance-v1", query:String(query), fullCount:full.selected.items.length, boundedCount:bounded.selected.items.length, retainedSourceIds:[...boundedIds], droppedSourceIds:[...fullIds].filter(id=>!boundedIds.has(id)), recoveryAvailable:true, limitation:"A dropped item is not proven irrelevant; it remains recoverable from durable state."};
  }
  window.NouranContextManager = Object.freeze({select, compact, delayedRelevanceTest});
})();
