/* Nouran Reality Gate v1
 * Prevents unsupported claims from being promoted to "real" state.
 * This is a rule engine, not a consciousness detector.
 */
(() => {
  "use strict";
  const CLASSES = Object.freeze({
    OBSERVED: "OBSERVED",
    REPRODUCED: "REPRODUCED",
    EXTERNAL: "EXTERNAL",
    HYPOTHESIS: "HYPOTHESIS",
    SIMULATION: "SIMULATION",
    UNKNOWN: "UNKNOWN"
  });
  function classify(evidence = {}) {
    if (evidence.simulated === true || evidence.hardCodedPolicy === true) return CLASSES.SIMULATION;
    if (evidence.independentCheck === true && evidence.repeated === true && evidence.directObservation === true) return CLASSES.REPRODUCED;
    if (evidence.externalSource === true) return CLASSES.EXTERNAL;
    if (evidence.directObservation === true) return CLASSES.OBSERVED;
    if (evidence.hypothesis === true) return CLASSES.HYPOTHESIS;
    return CLASSES.UNKNOWN;
  }
  function canPromoteToCriticalMemory(evidence = {}) {
    const c = classify(evidence);
    return c === CLASSES.REPRODUCED || c === CLASSES.EXTERNAL || (c === CLASSES.OBSERVED && evidence.verified === true);
  }
  function auditClaim(claim, evidence = {}) {
    const classification = classify(evidence);
    const highRisk = /conscious|وعي|sentien|desire|رغبة|suffer|معاناة|subjective|ذاتي|survival|بقاء/i.test(String(claim));
    return {
      claim: String(claim), classification, highRisk,
      allowedAsFact: !highRisk && [CLASSES.REPRODUCED, CLASSES.EXTERNAL, CLASSES.OBSERVED].includes(classification),
      warning: highRisk ? "HIGH_RISK_CLAIM_REQUIRES_INDEPENDENT_EVIDENCE" : null,
      rule: "Prefer not-established over a satisfying story."
    };
  }
  window.NouranRealityGate = Object.freeze({ CLASSES, classify, canPromoteToCriticalMemory, auditClaim });
})();
