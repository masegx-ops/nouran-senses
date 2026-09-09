import assert from 'node:assert/strict';
import { chooseProvider, applyFailure, nextRoute, buildCheckpoint, FAILURE } from '../core/failover-router.mjs';

const providers = [
  { id: 'free-a', priority: 1, kinds: ['inference'], enabled: true },
  { id: 'free-b', priority: 2, kinds: ['inference'], enabled: true },
  { id: 'browser-a', priority: 1, kinds: ['browser'], enabled: true, browser: true }
];

assert.equal(chooseProvider(providers, { kind: 'inference' }).id, 'free-a');
const degraded = applyFailure(providers, 'free-a', FAILURE.QUOTA_EXHAUSTED);
assert.equal(chooseProvider(degraded, { kind: 'inference' }).id, 'free-b');
const authBlocked = applyFailure(providers, 'free-a', FAILURE.AUTH_REQUIRED);
assert.equal(authBlocked.find(p => p.id === 'free-a').quarantined, true);
const route = nextRoute(providers, 'free-a', FAILURE.RATE_LIMIT, { kind: 'inference' });
assert.equal(route.chosen.id, 'free-b');
const cp = buildCheckpoint({ revision: 17 }, route);
assert.equal(cp.recoverable, true);
assert.equal(cp.stateRevision, 17);
console.log(JSON.stringify({ ok: true, fallback: route.chosen.id, failure: route.failure }));
