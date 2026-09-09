/* Nouran Free-Tier Failover Router v1
 * Deterministic routing for graceful degradation when a provider/quota fails.
 * This is infrastructure, not an autonomy claim. It never bypasses auth, rate limits,
 * billing, or provider controls.
 */

export const FAILURE = Object.freeze({
  RATE_LIMIT: 'RATE_LIMIT',
  QUOTA_EXHAUSTED: 'QUOTA_EXHAUSTED',
  UNAVAILABLE: 'UNAVAILABLE',
  TIMEOUT: 'TIMEOUT',
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  POLICY_BLOCKED: 'POLICY_BLOCKED',
  UNKNOWN: 'UNKNOWN'
});

function healthy(p) {
  return p.enabled !== false && p.quarantined !== true;
}

export function chooseProvider(providers, requirement = {}) {
  const list = Array.isArray(providers) ? providers.filter(healthy) : [];
  const eligible = list.filter(p => {
    if (requirement.kind && Array.isArray(p.kinds) && !p.kinds.includes(requirement.kind)) return false;
    if (requirement.gpu && !p.gpu) return false;
    if (requirement.persistent && !p.persistent) return false;
    if (requirement.browser && !p.browser) return false;
    return true;
  });
  return eligible.sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100))[0] ?? null;
}

export function applyFailure(providers, providerId, failure = FAILURE.UNKNOWN) {
  return (providers || []).map(p => {
    if (p.id !== providerId) return { ...p };
    const next = { ...p, lastFailure: failure, failures: (p.failures || 0) + 1 };
    if ([FAILURE.AUTH_REQUIRED, FAILURE.POLICY_BLOCKED].includes(failure)) next.quarantined = true;
    if ((next.failures || 0) >= 3) next.quarantined = true;
    return next;
  });
}

export function nextRoute(providers, failedId, failure, requirement = {}) {
  const updated = applyFailure(providers, failedId, failure);
  const chosen = chooseProvider(updated, requirement);
  return { providers: updated, chosen, failedId, failure };
}

export function buildCheckpoint(state, route) {
  return {
    format: 'nouran-failover-checkpoint',
    at: new Date().toISOString(),
    stateRevision: state?.revision ?? null,
    selectedProvider: route?.chosen?.id ?? null,
    failedProvider: route?.failedId ?? null,
    failure: route?.failure ?? null,
    recoverable: true
  };
}
