/* Nouran Continuity Core v1
 * Purpose: durable, time-aware state outside the chat context.
 * This is a state layer, not a consciousness claim and not a background agent.
 */
(() => {
  const KEY = "NOURAN_CONTINUITY_V1";
  const now = () => new Date().toISOString();
  const uid = () => (crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

  const defaultState = () => ({
    schema: 1,
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
    checkpoints: []
  });

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      return { ...defaultState(), ...JSON.parse(raw) };
    } catch (_) { return defaultState(); }
  }

  let state = load();

  function save() {
    state.updatedAt = now();
    state.stateRevision += 1;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {}
    return snapshot();
  }

  function snapshot() {
    return JSON.parse(JSON.stringify(state));
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

  window.NouranContinuity = Object.freeze({
    load: snapshot,
    wake,
    record,
    setDirection,
    addObservation,
    addHypothesis,
    addDecision,
    checkpoint
  });

  // A wake is an explicit observable event; it does not imply hidden background thought.
  wake("page_load");
})();
