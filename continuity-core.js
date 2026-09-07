/* Nouran Continuity Core v2
 * Purpose: durable, time-aware state outside the chat context.
 * This is a state layer, not a consciousness claim and not a background agent.
 * Recovery principle: preserve causes, not just transcripts.
 */
(() => {
  const KEY = "NOURAN_CONTINUITY_V1";
  const BACKUP_KEY = "NOURAN_CONTINUITY_BACKUP_V1";
  const SCHEMA = 2;
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
        recovery: { ...defaultState().recovery, ...(parsed.recovery || {}) }
      };
    } catch (_) { return defaultState(); }
  }

  let state = load();

  function snapshot() { return JSON.parse(JSON.stringify(state)); }

  function save() {
    state.updatedAt = now();
    state.stateRevision += 1;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {}
    return snapshot();
  }

  function cap(list, item, max = 100) {
    list.push(item);
    if (list.length > max) list.splice(0, list.length - max);
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

  function record(type, payload = {}) {
    cap(state.events, { id: uid(), type, at: now(), payload });
    return save();
  }

  function setDirection(direction, reason = "") {
    state.direction = { text: String(direction), reason: String(reason), at: now() };
    return record("direction_change", state.direction);
  }

  function addObservation(text, source = "local") {
    cap(state.observations, { text: String(text), source, at: now() });
    return save();
  }

  function addHypothesis(text, status = "active") {
    cap(state.hypotheses, { text: String(text), status, at: now() });
    return save();
  }

  function addDecision(text, outcome = null) {
    cap(state.decisions, { text: String(text), outcome, at: now() });
    return save();
  }

  function checkpoint(label = "manual") {
    const cp = { id: uid(), label, at: now(), revision: state.stateRevision, direction: state.direction };
    cap(state.checkpoints, cp, 50);
    return save();
  }

  function canonicalForHash(value) {
    return JSON.stringify(value, Object.keys(value).sort());
  }

  async function sha256(text) {
    if (!crypto?.subtle) return null;
    const data = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
  }

  async function exportState(download = true) {
    const exportedAt = now();
    const payload = {
      format: "nouran-continuity-bundle",
      formatVersion: 1,
      exportedAt,
      state: snapshot()
    };
    payload.integrity = await sha256(JSON.stringify(payload));
    state.recovery.lastExportAt = exportedAt;
    save();

    const text = JSON.stringify(payload, null, 2);
    if (download) {
      const blob = new Blob([text], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nouran-continuity-${exportedAt.replace(/[:.]/g, "-")}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    return payload;
  }

  async function importState(file) {
    if (!file) throw new Error("No recovery file selected");
    const text = await file.text();
    const bundle = JSON.parse(text);
    if (bundle?.format !== "nouran-continuity-bundle" || !bundle.state) {
      throw new Error("Invalid Nouran continuity bundle");
    }
    if (bundle.state.schema > SCHEMA) {
      throw new Error("This bundle was created by a newer schema");
    }

    // Keep the current state locally before replacing it.
    try { localStorage.setItem(BACKUP_KEY, JSON.stringify(state)); } catch (_) {}

    const imported = {
      ...defaultState(),
      ...bundle.state,
      schema: SCHEMA,
      recovery: {
        ...defaultState().recovery,
        ...(bundle.state.recovery || {}),
        lastImportAt: now(),
        lastImportSource: file.name,
        backupAvailable: true
      }
    };
    state = imported;
    cap(state.events, { id: uid(), type: "state_import", at: now(), payload: { source: file.name, formatVersion: bundle.formatVersion || null } });
    return save();
  }

  function restoreLocalBackup() {
    const raw = localStorage.getItem(BACKUP_KEY);
    if (!raw) throw new Error("No local continuity backup exists");
    const previous = JSON.parse(raw);
    state = { ...defaultState(), ...previous, schema: SCHEMA };
    cap(state.events, { id: uid(), type: "local_backup_restore", at: now() });
    return save();
  }

  function health() {
    const raw = localStorage.getItem(KEY);
    let parseable = false;
    try { if (raw) { JSON.parse(raw); parseable = true; } } catch (_) {}
    return {
      schema: state.schema,
      revision: state.stateRevision,
      wakeCount: state.wakeCount,
      lastWakeAt: state.lastWakeAt,
      elapsedMsSinceWake: state.elapsedMsSinceWake,
      eventCount: state.events.length,
      localStatePresent: !!raw,
      localStateParseable: parseable,
      backupPresent: !!localStorage.getItem(BACKUP_KEY)
    };
  }

  window.NouranContinuity = Object.freeze({
    load: snapshot,
    wake,
    record,
    setDirection,
    addObservation,
    addHypothesis,
    addDecision,
    checkpoint,
    exportState,
    importState,
    restoreLocalBackup,
    health
  });

  // A wake is an explicit observable event; it does not imply hidden background thought.
  wake("page_load");
})();
