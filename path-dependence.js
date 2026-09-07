/* Nouran Path Dependence Harness v1
 * Reconstructs two historical prefixes from the real persisted state and asks
 * the existing decision policy for the same input. No source-state mutation.
 * This tests path dependence of the current policy, not consciousness.
 */
(() => {
  "use strict";

  const clone = value => JSON.parse(JSON.stringify(value));

  function prefixState(state, eventCount) {
    const copy = clone(state || {});
    const events = Array.isArray(copy.events) ? copy.events : [];
    const n = Math.max(0, Math.min(events.length, Number(eventCount) || 0));
    copy.events = events.slice(0, n);
    return copy;
  }

  function compare(state, input = "", earlierEventCount = 0, laterEventCount = null) {
    if (!window.NouranCausalAblation) throw new Error("Causal ablation harness is not loaded");
    const source = clone(state || {});
    const total = Array.isArray(source.events) ? source.events.length : 0;
    const later = laterEventCount == null ? total : Math.max(0, Math.min(total, Number(laterEventCount) || 0));
    const earlier = Math.max(0, Math.min(later, Number(earlierEventCount) || 0));

    const earlyState = prefixState(source, earlier);
    const lateState = prefixState(source, later);
    const earlyOutput = window.NouranCausalAblation.selectNextDirection(earlyState, input);
    const lateOutput = window.NouranCausalAblation.selectNextDirection(lateState, input);

    return {
      protocol: "path-dependence-v1",
      baselineRevision: source.stateRevision ?? null,
      input,
      earlierEventCount: earlier,
      laterEventCount: later,
      earlierOutput: earlyOutput,
      laterOutput: lateOutput,
      changed: earlyOutput !== lateOutput,
      interpretation: earlyOutput !== lateOutput
        ? "PATH_DEPENDENT_POLICY_EFFECT_OBSERVED"
        : "NO_PATH_DEPENDENT_POLICY_CHANGE_OBSERVED",
      limitation: "Historical-prefix comparison shows dependence of this deterministic policy on retained state; it is not evidence of subjective experience or consciousness."
    };
  }

  window.NouranPathDependence = Object.freeze({ prefixState, compare });
})();
