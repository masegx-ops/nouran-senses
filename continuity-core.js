/* Nouran Continuity Core v4
 * Purpose: durable, time-aware state outside the chat context.
 * This is a state layer, not a consciousness claim and not a background agent.
 * Recovery principle: preserve causes, not just transcripts.
 * Self-development: record finite, testable improvement cycles without a fixed total.
 * v4 focus: causal attribution — connect retained events to later decisions.
 */
(() => {
  const KEY = "NOURAN_CONTINUITY_V1";
  const BACKUP_KEY = "NOURAN_CONTINUITY_BACKUP_V1";
  const SCHEMA = 4;
  const now = () => new Date().toISOString();
  const uid = () => (crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

  const defaultState = () => ({
    schema: SCHEMA,
    identity: "Nouran",
    createdAt: now(),
    updatedAt: now(),
    lastWakeAt: null,
    wakeCount: 0,
    elapsedMsSinceWake: null,
    stateRevision: 0,
    direction: null,
    priorities: [],
    hypotheses: [],
    decisions: [],
    observations: [],
    openQuestions: [],
    failedPaths: [],
    events: [],
    checkpoints: [],
    developmentCycles: [],
    causalLinks: [],
    recovery: {
      lastExportAt: null,
      lastImportAt: null,
      lastImportSource: null,
      backupAvailable: false
    }
  });

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return {
        ...defaultState(),
        ...parsed,
        schema: SCHEMA,
        recovery: { ...defaultState().recovery, ...(parsed.recovery || {}) },
        developmentCycles: Array.isArray(parsed.developmentCycles) ? parsed.developmentCycles : [],
        causalLinks: Array.isArray(parsed.causalLinks) ? parsed.causalLinks : []
      };
    } catch (_) { return defaultState(); }
  }

  let state = load();
  function snapshot() { return JSON.parse(JSON.stringify(state)); }
  function cap(list, item, max = 100) { list.push(item); if (list.length > max) list.splice(0, list.length - max); }
  function save() {
    state.updatedAt = now();
    state.stateRevision += 1;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {}
    return snapshot();
  }

  function wake(source = "interaction") {
    const t = Date.now();
    const previous = state.lastWakeAt ? Date.parse(state.lastWakeAt) : null;
    state.elapsedMsSinceWake = previous == null ? null : Math.max(0, t - previous);
    state.lastWakeAt = new Date(t).toISOString();
    state.wakeCount += 1;
    cap(state.events, { id: uid(), type: "wake", at: state.lastWakeAt, source, elapsedMsSincePreviousWake: state.elapsedMsSinceWake });
    return save();
  }

  function record(type, payload = {}) { const event = { id: uid(), type, at: now(), payload }; cap(state.events, event); save(); return event; }
  function setDirection(direction, reason = "") { state.direction = { text: String(direction), reason: String(reason), at: now() }; return record("direction_change", state.direction); }
  function addObservation(text, source = "local") { cap(state.observations, { text: String(text), source, at: now() }); return save(); }
  function addHypothesis(text, status = "active") { cap(state.hypotheses, { text: String(text), status, at: now() }); return save(); }
  function addDecision(text, outcome = null) {
    const decision = { id: uid(), text: String(text), outcome, at: now() };
    cap(state.decisions, decision);
    save();
    return decision;
  }
  function checkpoint(label = "manual") { const cp = { id: uid(), label, at: now(), revision: state.stateRevision, direction: state.direction }; cap(state.checkpoints, cp, 50); return save(); }

  function recordCausalLink(eventId, decisionId, evidence = "", confidence = 0.5) {
    const eventExists = state.events.some(e => e.id === eventId);
    const decisionExists = state.decisions.some(d => d.id === decisionId);
    if (!eventExists) throw new Error("Unknown source event");
    if (!decisionExists) throw new Error("Unknown decision");
    const link = {
      id: uid(),
      at: now(),
      eventId: String(eventId),
      decisionId: String(decisionId),
      evidence: String(evidence),
      confidence: Math.max(0, Math.min(1, Number(confidence) || 0))
    };
    cap(state.causalLinks, link, 200);
    cap(state.events, { id: uid(), type: "causal_link_recorded", at: link.at, payload: { linkId: link.id, eventId: link.eventId, decisionId: link.decisionId, confidence: link.confidence } });
    return save();
  }

  function getCausalLinksForDecision(decisionId) { return state.causalLinks.filter(l => l.decisionId === String(decisionId)); }
  function getCausalLinksForEvent(eventId) { return state.causalLinks.filter(l => l.eventId === String(eventId)); }

  function beginDevelopmentCycle(weakness, hypothesis, intervention, expectedFailure = "") {
    const cycle = {
      id: uid(),
      startedAt: now(),
      status: "open",
      startingRevision: state.stateRevision,
      weakness: String(weakness),
      hypothesis: String(hypothesis),
      intervention: String(intervention),
      expectedFailure: String(expectedFailure),
      result: null,
      causalLesson: null,
      nextWeakness: null
    };
    cap(state.developmentCycles, cycle, 50);
    cap(state.events, { id: uid(), type: "development_cycle_started", at: cycle.startedAt, payload: { cycleId: cycle.id, weakness: cycle.weakness } });
    save();
    return cycle;
  }

  function finishDevelopmentCycle(cycleId, result, causalLesson, nextWeakness = "", status = "complete") {
    const cycle = state.developmentCycles.find(c => c.id === cycleId);
    if (!cycle) throw new Error("Unknown development cycle");
    cycle.status = String(status);
    cycle.finishedAt = now();
    cycle.result = String(result);
    cycle.causalLesson = String(causalLesson);
    cycle.nextWeakness = String(nextWeakness);
    cap(state.events, { id: uid(), type: "development_cycle_finished", at: cycle.finishedAt, payload: { cycleId, status: cycle.status, result: cycle.result, nextWeakness: cycle.nextWeakness } });
    return save();
  }

  function currentDevelopment() { return state.developmentCycles.length ? state.developmentCycles[state.developmentCycles.length - 1] : null; }

  async function sha256(text) {
    if (!crypto?.subtle) return null;
    const data = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
  }

  async function exportState(download = true) {
    const exportedAt = now();
    const payload = { format: "nouran-continuity-bundle", formatVersion: 3, exportedAt, state: snapshot() };
    payload.integrity = await sha256(JSON.stringify(payload));
    state.recovery.lastExportAt = exportedAt;
    save();
    const text = JSON.stringify(payload, null, 2);
    if (download) {
      const blob = new Blob([text], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `nouran-continuity-${exportedAt.replace(/[:.]/g, "-")}.json`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    return payload;
  }

  async function importState(file) {
    if (!file) throw new Error("No recovery file selected");
    const text = await file.text();
    const bundle = JSON.parse(text);
    if (bundle?.format !== "nouran-continuity-bundle" || !bundle.state) throw new Error("Invalid Nouran continuity bundle");
    if (bundle.state.schema > SCHEMA) throw new Error("This bundle was created by a newer schema");
    try { localStorage.setItem(BACKUP_KEY, JSON.stringify(state)); } catch (_) {}
    state = {
      ...defaultState(),
      ...bundle.state,
      schema: SCHEMA,
      recovery: { ...defaultState().recovery, ...(bundle.state.recovery || {}), lastImportAt: now(), lastImportSource: file.name, backupAvailable: true },
      developmentCycles: Array.isArray(bundle.state.developmentCycles) ? bundle.state.developmentCycles : [],
      causalLinks: Array.isArray(bundle.state.causalLinks) ? bundle.state.causalLinks : []
    };
    cap(state.events, { id: uid(), type: "state_import", at: now(), payload: { source: file.name, formatVersion: bundle.formatVersion || null } });
    return save();
  }

  function restoreLocalBackup() {
    const raw = localStorage.getItem(BACKUP_KEY);
    if (!raw) throw new Error("No local continuity backup exists");
    state = { ...defaultState(), ...JSON.parse(raw), schema: SCHEMA };
    cap(state.events, { id: uid(), type: "local_backup_restore", at: now() });
    return save();
  }

  function health() {
    const raw = localStorage.getItem(KEY); let parseable = false;
    try { if (raw) { JSON.parse(raw); parseable = true; } } catch (_) {}
    const completed = state.developmentCycles.filter(c => c.status === "complete").length;
    const linkedDecisions = new Set(state.causalLinks.map(l => l.decisionId)).size;
    return {
      schema: state.schema,
      revision: state.stateRevision,
      wakeCount: state.wakeCount,
      lastWakeAt: state.lastWakeAt,
      elapsedMsSinceWake: state.elapsedMsSinceWake,
      eventCount: state.events.length,
      developmentCycleCount: state.developmentCycles.length,
      completedDevelopmentCycles: completed,
      causalLinkCount: state.causalLinks.length,
      decisionsWithCausalLinks: linkedDecisions,
      localStatePresent: !!raw,
      localStateParseable: parseable,
      backupPresent: !!localStorage.getItem(BACKUP_KEY)
    };
  }

  window.NouranContinuity = Object.freeze({
    load: snapshot, wake, record, setDirection, addObservation, addHypothesis, addDecision, checkpoint,
    recordCausalLink, getCausalLinksForDecision, getCausalLinksForEvent,
    beginDevelopmentCycle, finishDevelopmentCycle, currentDevelopment,
    exportState, importState, restoreLocalBackup, health
  });

  wake("page_load");
})();
