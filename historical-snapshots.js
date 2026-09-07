/* Nouran Historical Snapshots v1
 * Bounded, externally stored historical snapshots for causal/path-dependence tests.
 * This module records actual state returned by NouranContinuity.load(); it does not
 * invent history and it does not claim consciousness.
 */
(() => {
  "use strict";

  const KEY = "NOURAN_HISTORICAL_SNAPSHOTS_V1";
  const MAX = 40;
  const clone = value => JSON.parse(JSON.stringify(value));
  const now = () => new Date().toISOString();
  const uid = () => (crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) { return []; }
  }

  function save(list) {
    localStorage.setItem(KEY, JSON.stringify(list.slice(-MAX)));
    return load();
  }

  function capture(label = "manual", source = "continuity.load") {
    if (!window.NouranContinuity) throw new Error("NouranContinuity is not loaded");
    const state = clone(window.NouranContinuity.load());
    const snapshot = {
      id: uid(), capturedAt: now(), label: String(label), source: String(source),
      stateRevision: state.stateRevision ?? null,
      state
    };
    const list = load();
    list.push(snapshot);
    save(list);
    return clone(snapshot);
  }

  function clear() {
    localStorage.removeItem(KEY);
    return [];
  }

  function list() { return clone(load()); }

  function get(id) {
    return load().find(s => s.id === String(id)) || null;
  }

  function reconstruct(id) {
    const snapshot = get(id);
    if (!snapshot) throw new Error("Unknown historical snapshot");
    return clone(snapshot.state);
  }

  function compare(idA, idB, input = "") {
    if (!window.NouranCausalAblation) throw new Error("Causal ablation harness is not loaded");
    const a = reconstruct(idA);
    const b = reconstruct(idB);
    const aOut = window.NouranCausalAblation.selectNextDirection(a, input);
    const bOut = window.NouranCausalAblation.selectNextDirection(b, input);
    return {
      protocol: "historical-snapshot-v1",
      snapshotA: idA,
      snapshotB: idB,
      input,
      outputA: aOut,
      outputB: bOut,
      changed: aOut !== bOut,
      interpretation: aOut !== bOut
        ? "SNAPSHOT_POLICY_EFFECT_OBSERVED"
        : "NO_SNAPSHOT_POLICY_CHANGE_OBSERVED",
      limitation: "The comparison uses real persisted state snapshots and the existing deterministic policy; it does not establish agency, desire, subjective experience, or consciousness."
    };
  }

  function health() {
    const items = load();
    return {
      snapshotCount: items.length,
      maxSnapshots: MAX,
      oldestCapturedAt: items[0]?.capturedAt ?? null,
      newestCapturedAt: items[items.length - 1]?.capturedAt ?? null,
      newestRevision: items[items.length - 1]?.stateRevision ?? null
    };
  }

  window.NouranHistoricalSnapshots = Object.freeze({ capture, clear, list, get, reconstruct, compare, health });
})();
