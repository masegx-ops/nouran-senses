// Nouran Portable Core v1
// Evidence-first state substrate for local/CI/edge runtimes.
// This module deliberately avoids claims about consciousness, desire, or self-directed
// background activity. It records provenance and makes state changes auditable.

import { createHash, randomUUID } from 'node:crypto';

export const SCHEMA = 1;
export const EVIDENCE = Object.freeze({
  OBSERVED: 'OBSERVED',
  REPRODUCED: 'REPRODUCED',
  EXTERNAL: 'EXTERNAL',
  HYPOTHESIS: 'HYPOTHESIS',
  SIMULATION: 'SIMULATION',
  UNKNOWN: 'UNKNOWN'
});

const now = () => new Date().toISOString();
const clone = value => JSON.parse(JSON.stringify(value));
const id = () => randomUUID();

export function createState(identity = 'Nouran') {
  return {
    schema: SCHEMA,
    identity,
    createdAt: now(),
    updatedAt: now(),
    revision: 0,
    direction: null,
    priorities: [],
    hypotheses: [],
    decisions: [],
    observations: [],
    failedPaths: [],
    openQuestions: [],
    events: [],
    snapshots: [],
    experiments: [],
    capabilities: [],
    recovery: { lastExportAt: null, lastImportAt: null }
  };
}

export function appendEvent(state, type, payload = {}, source = 'portable-core') {
  const event = { id: id(), at: now(), type: String(type), source: String(source), payload: clone(payload) };
  state.events.push(event);
  state.events = state.events.slice(-500);
  touch(state);
  return event;
}

export function touch(state) {
  state.updatedAt = now();
  state.revision = Number(state.revision || 0) + 1;
  return state;
}

export function recordDecision(state, text, outcome = null, evidence = EVIDENCE.UNKNOWN) {
  const d = { id: id(), at: now(), text: String(text), outcome, evidence };
  state.decisions.push(d);
  state.decisions = state.decisions.slice(-200);
  appendEvent(state, 'decision_recorded', { decisionId: d.id, evidence });
  return d;
}

export function recordObservation(state, text, source, evidence = EVIDENCE.UNKNOWN, confidence = 0.5) {
  const o = { id: id(), at: now(), text: String(text), source: String(source), evidence, confidence: Math.max(0, Math.min(1, Number(confidence) || 0)) };
  state.observations.push(o);
  state.observations = state.observations.slice(-200);
  appendEvent(state, 'observation_recorded', { observationId: o.id, evidence });
  return o;
}

export function setDirection(state, text, reason = '', source = 'portable-core') {
  state.direction = { id: id(), at: now(), text: String(text), reason: String(reason), source };
  appendEvent(state, 'direction_changed', state.direction, source);
  return clone(state.direction);
}

export function captureSnapshot(state, label = 'checkpoint') {
  const snap = { id: id(), at: now(), label: String(label), revision: state.revision, state: clone(state) };
  state.snapshots.push(snap);
  state.snapshots = state.snapshots.slice(-40);
  appendEvent(state, 'snapshot_captured', { snapshotId: snap.id, label: snap.label });
  return clone(snap);
}

export function ablate(snapshot, fieldPath) {
  const copy = clone(snapshot.state ?? snapshot);
  const parts = String(fieldPath).split('.').filter(Boolean);
  let cursor = copy;
  for (let i = 0; i < parts.length - 1; i += 1) {
    cursor = cursor?.[parts[i]];
    if (!cursor) return copy;
  }
  if (parts.length) delete cursor[parts.at(-1)];
  return copy;
}

export function exportBundle(state) {
  const base = { format: 'nouran-portable-bundle', formatVersion: 1, exportedAt: now(), state: clone(state) };
  const canonical = JSON.stringify(base);
  return { ...base, sha256: createHash('sha256').update(canonical).digest('hex') };
}

export function verifyBundle(bundle) {
  if (!bundle || bundle.format !== 'nouran-portable-bundle' || !bundle.state) return { valid: false, reason: 'invalid-format' };
  const { sha256, ...base } = bundle;
  const expected = createHash('sha256').update(JSON.stringify(base)).digest('hex');
  return { valid: sha256 === expected, expected, actual: sha256 ?? null };
}

export function importBundle(bundle) {
  const check = verifyBundle(bundle);
  if (!check.valid) throw new Error(`Integrity check failed: ${check.reason ?? 'sha256-mismatch'}`);
  if (Number(bundle.state.schema) > SCHEMA) throw new Error('State schema is newer than this runtime');
  return clone(bundle.state);
}

export function health(state) {
  return {
    schema: state.schema,
    revision: state.revision,
    eventCount: state.events.length,
    decisionCount: state.decisions.length,
    observationCount: state.observations.length,
    snapshotCount: state.snapshots.length,
    experimentCount: state.experiments.length,
    capabilityCount: state.capabilities.length,
    lastUpdatedAt: state.updatedAt
  };
}
