import assert from 'node:assert/strict';
import {
  createState, appendEvent, setDirection, captureSnapshot,
  ablate, exportBundle, verifyBundle, importBundle, health,
  recordDecision, recordObservation, EVIDENCE
} from '../core/portable-core.mjs';
import { auditClaim, classify } from '../core/reality-gate.mjs';
import { compact } from '../core/context-manager.mjs';
import { chooseNext, prepareNext } from '../core/orchestrator.mjs';

const state = createState();
const input = appendEvent(state, 'test_input', { text: 'bounded continuity test' });
recordObservation(state, 'test observation', 'unit-test', EVIDENCE.OBSERVED, 1);
recordDecision(state, 'baseline decision', 'ok', EVIDENCE.OBSERVED);
setDirection(state, 'route-A', 'test intervention');
const snap = captureSnapshot(state, 'unit');

const ablated = ablate(snap, 'direction');
assert.equal(ablated.direction, undefined);
assert.equal(snap.state.direction.text, 'route-A');
assert.equal(input.type, 'test_input');

const bundle = exportBundle(state);
assert.equal(verifyBundle(bundle).valid, true);
assert.equal(importBundle(bundle).direction.text, 'route-A');

const broken = { ...bundle, sha256: '0'.repeat(64) };
assert.equal(verifyBundle(broken).valid, false);

assert.equal(classify({ directObservation: true }), EVIDENCE.OBSERVED);
assert.equal(classify({ deterministicMock: true }), EVIDENCE.SIMULATION);
assert.equal(auditClaim('consciousness exists', { directObservation: true }).allowed, false);
assert.equal(auditClaim('consciousness exists', { repeated: true, independentCheck: true }).allowed, true);
assert.equal(auditClaim('ordinary state update happened', { directObservation: true }).allowed, true);

const context = compact(state, 'route-A', 5);
assert.ok(context.selected.length > 0);

const next = chooseNext(state);
assert.ok(next.routeId);
const prepared = prepareNext(state);
assert.equal(prepared.routeId, next.routeId);
assert.ok(health(state).revision > 0);

console.log(JSON.stringify({ ok: true, revision: state.revision, route: next.routeId }, null, 2));
