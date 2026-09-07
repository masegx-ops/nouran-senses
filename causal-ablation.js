/* Nouran Causal Ablation Harness v1
 * Purpose: run a real-state, non-destructive intervention test.
 * It never mutates the continuity state supplied to it.
 * It does not claim consciousness; it tests whether removing retained state
 * changes a deterministic decision policy.
 */
(() => {
  "use strict";

  const clone = value => JSON.parse(JSON.stringify(value));

  function selectNextDirection(state, input = "") {
    const events = Array.isArray(state?.events) ? state.events : [];
    const decisions = Array.isArray(state?.decisions) ? state.decisions : [];
    const links = Array.isArray(state?.causalLinks) ? state.causalLinks : [];

    const recentTypes = events.slice(-12).map(e => e.type);
    const linkedDecisionIds = new Set(links.map(l => l.decisionId));
    const linked = decisions.filter(d => linkedDecisionIds.has(d.id));

    if (recentTypes.includes("state_import")) return "verify_recovery_integrity";
    if (recentTypes.includes("wake") && linked.length === 0) return "establish_causal_baseline";
    if (recentTypes.includes("causal_link_recorded")) return "run_causal_ablation";
    if (state?.direction?.text) return `continue:${state.direction.text}`;
    if (input) return "evaluate_new_input";
    return "observe_and_measure";
  }

  function ablate(state, target) {
    const copy = clone(state || {});
    switch (target) {
      case "direction": copy.direction = null; break;
      case "events": copy.events = []; break;
      case "decisions": copy.decisions = []; break;
      case "causalLinks": copy.causalLinks = []; break;
      case "lastEvent": if (copy.events?.length) copy.events.pop(); break;
      default: throw new Error(`Unsupported ablation target: ${target}`);
    }
    return copy;
  }

  function run(state, input = "", target = "lastEvent") {
    const intactState = clone(state || {});
    const ablatedState = ablate(intactState, target);
    const intactOutput = selectNextDirection(intactState, input);
    const ablatedOutput = selectNextDirection(ablatedState, input);
    return {
      protocol: "causal-ablation-v1",
      target,
      baselineRevision: intactState.stateRevision ?? null,
      intactOutput,
      ablatedOutput,
      changed: intactOutput !== ablatedOutput,
      interpretation: intactOutput !== ablatedOutput
        ? "INTERVENTION_EFFECT_OBSERVED"
        : "NO_DECISION_CHANGE_OBSERVED",
      limitation: "A decision-policy intervention result is not evidence of subjective experience or consciousness."
    };
  }

  window.NouranCausalAblation = Object.freeze({ selectNextDirection, ablate, run });
})();
