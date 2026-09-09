// Nouran Experiment Orchestrator v1
// Chooses the next reversible experiment from the opportunity registry.
// It can prepare work; it does not pretend to have permissions, credentials, or a background process.

import registry from './opportunity-registry.json' with { type: 'json' };
import { EVIDENCE, appendEvent, recordDecision, setDirection } from './portable-core.mjs';

const riskRank = { LOW: 0, MEDIUM: 1, HIGH: 2 };

function alreadyTested(state, id) {
  return (state?.experiments ?? []).some(x => x.routeId === id && x.status === 'complete');
}

function score(route, state) {
  if (alreadyTested(state, route.id)) return -1000;
  let score = 0;
  const text = `${route.class} ${route.nouranTest}`.toLowerCase();
  if (route.class === 'CI_EXECUTION') score += 12;
  if (route.class === 'DURABLE_STATE') score += 11;
  if (route.class === 'DURABLE_ORCHESTRATION') score += 9;
  if (route.class === 'REMOTE_BROWSER') score += 8;
  if (route.class === 'REMOTE_INFERENCE') score += 7;
  if (route.class === 'GPU') score += 5;
  if (text.includes('reproduc')) score += 2;
  if (state?.openQuestions?.length) score += 1;
  return score;
}

export function chooseNext(state) {
  const routes = registry.routes.map(route => ({ route, score: score(route, state) }))
    .sort((a, b) => b.score - a.score || a.route.id.localeCompare(b.route.id));
  const next = routes.find(x => x.score > 0) ?? routes[0];
  if (!next) throw new Error('No route available');
  return {
    routeId: next.route.id,
    resource: next.route.resource,
    class: next.route.class,
    score: next.score,
    status: next.route.status,
    test: next.route.nouranTest,
    evidenceRule: 'Do not promote beyond UNKNOWN until actual execution returns inspectable evidence.'
  };
}

export function prepareNext(state) {
  const next = chooseNext(state);
  setDirection(state, `Test ${next.routeId}`, `Evidence-first orchestration: ${next.test}`, 'experiment-orchestrator');
  const decision = recordDecision(state, `Selected reversible capability test: ${next.routeId}`, next.test, EVIDENCE.HYPOTHESIS);
  appendEvent(state, 'experiment_prepared', { routeId: next.routeId, decisionId: decision.id, test: next.test }, 'experiment-orchestrator');
  return next;
}
