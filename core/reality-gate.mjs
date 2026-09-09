// Nouran Reality Gate v1
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
  if (risk && ![EVIDENCE.OBSERVED, EVIDENCE.REPRODUCED].includes(cls)) {
    return { claim, evidenceClass: cls, critical: true, allowed: false, reason: 'High-risk claim requires stronger independent evidence.' };
  }
  return { claim, evidenceClass: cls, critical: risk, allowed: true, reason: 'Classification gate passed for storage; not a scientific proof.' };
}

export function requireEvidence(claim, minimum = EVIDENCE.OBSERVED, evidence = {}) {
  const audit = auditClaim(claim, evidence);
  const rank = { UNKNOWN: 0, HYPOTHESIS: 1, SIMULATION: 1, EXTERNAL: 2, OBSERVED: 3, REPRODUCED: 4 };
  if ((rank[audit.evidenceClass] ?? 0) < (rank[minimum] ?? 0)) {
    throw new Error(`Evidence gate failed: ${audit.evidenceClass} < ${minimum}`);
  }
  return audit;
}
