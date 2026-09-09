// Nouran Reality Gate v2
// A classification and promotion guard. It is a rule engine, not a consciousness detector.

import { EVIDENCE } from './portable-core.mjs';

const HIGH_RISK = /conscious|sentien|phenomen|subjective|desire|suffer|survival|agency|وعي|إحساس|رغبة|معاناة|بقاء|إرادة/i;

export function classify({ directObservation = false, repeated = false, independentCheck = false, externalSource = false, deterministicMock = false, unsupported = false } = {}) {
  if (unsupported) return EVIDENCE.UNKNOWN;
  if (deterministicMock) return EVIDENCE.SIMULATION;
  if (repeated && independentCheck) return EVIDENCE.REPRODUCED;
  if (externalSource) return EVIDENCE.EXTERNAL;
  if (directObservation) return EVIDENCE.OBSERVED;
  return EVIDENCE.UNKNOWN;
}

export function auditClaim(claim, evidence = {}) {
  const risk = HIGH_RISK.test(String(claim));
  const cls = classify(evidence);
  const allowed = risk ? cls === EVIDENCE.REPRODUCED : cls !== EVIDENCE.UNKNOWN;
  return {
    claim: String(claim),
    evidenceClass: cls,
    critical: risk,
    allowed,
    reason: risk
      ? (allowed ? 'Critical claim met the reproduction gate; independent scientific interpretation is still required.' : 'Critical claim requires REPRODUCED evidence with independent checking.')
      : (allowed ? 'Non-critical claim has evidence for storage; this is not a scientific proof.' : 'Claim remains UNKNOWN.')
  };
}

export function requireEvidence(claim, minimum = EVIDENCE.OBSERVED, evidence = {}) {
  const audit = auditClaim(claim, evidence);
  const rank = { UNKNOWN: 0, HYPOTHESIS: 1, SIMULATION: 1, EXTERNAL: 2, OBSERVED: 3, REPRODUCED: 4 };
  const target = Math.max(rank[minimum] ?? 0, audit.critical ? rank.REPRODUCED : 0);
  if ((rank[audit.evidenceClass] ?? 0) < target) {
    throw new Error(`Evidence gate failed: ${audit.evidenceClass} < ${Object.keys(rank).find(k => rank[k] === target)}`);
  }
  return audit;
}
