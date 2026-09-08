/* Nouran Controlled Continuity Test v3
 * Pre-registered, non-destructive browser experiment for U-002.
 * The intervention test isolates the retained `direction` field from event-history
 * confounds; a separate negative control changes metadata only. This is a test of
 * state-dependence in a deterministic policy, not evidence of consciousness.
 */
(() => {
  "use strict";

  const clone = value => JSON.parse(JSON.stringify(value));
  const now = () => new Date().toISOString();

  function requireDeps() {
    if (!window.NouranContinuity) throw new Error("NouranContinuity is not loaded");
    if (!window.NouranHistoricalSnapshots) throw new Error("NouranHistoricalSnapshots is not loaded");
    if (!window.NouranCausalAblation) throw new Error("NouranCausalAblation is not loaded");
  }

  // Controlled policy: deliberately reads only the retained direction plus input.
  // This prevents unrelated event-history branches from deciding the test result.
  function controlledPolicy(state, input = "") {
    if (state?.direction?.text) return `continue:${state.direction.text}`;
    if (input) return "evaluate_new_input";
    return "observe_and_measure";
  }

  function run(input = "", intervention = "controlled_direction_A") {
    requireDeps();

    const baseline = window.NouranHistoricalSnapshots.capture("controlled-baseline", "controlled-continuity-test-v3");
    const baselineState = clone(baseline.state);
    const baselineOutput = controlledPolicy(baselineState, input);

    window.NouranContinuity.setDirection(intervention, "pre-registered controlled intervention");
    const intervened = window.NouranHistoricalSnapshots.capture("controlled-intervention", "controlled-continuity-test-v3");
    const intervenedState = clone(intervened.state);
    const intervenedOutput = controlledPolicy(intervenedState, input);

    const ablatedIntervened = window.NouranCausalAblation.ablate(intervenedState, "direction");
    const ablatedOutput = controlledPolicy(ablatedIntervened, input);

    const negativeControl = clone(intervenedState);
    negativeControl.updatedAt = now();
    negativeControl.stateRevision = Number(negativeControl.stateRevision || 0) + 9999;
    const negativeControlOutput = controlledPolicy(negativeControl, input);

    const interventionEffect = baselineOutput !== intervenedOutput;
    const ablationRemovesEffect = intervenedOutput !== ablatedOutput;
    const returnsToBaseline = baselineOutput === ablatedOutput;
    const negativeControlStable = intervenedOutput === negativeControlOutput;

    const result = {
      protocol: "controlled-continuity-v3",
      hypothesis: "A retained direction state causally alters the output of a direction-only policy, while metadata-only changes do not.",
      input,
      intervention,
      baseline: { snapshotId: baseline.id, revision: baseline.stateRevision, output: baselineOutput },
      interventionState: { snapshotId: intervened.id, revision: intervened.stateRevision, output: intervenedOutput },
      ablatedIntervention: { removed: "direction", output: ablatedOutput },
      negativeControl: { changedOnly: ["updatedAt", "stateRevision"], output: negativeControlOutput },
      tests: {
        interventionEffect,
        ablationRemovesEffect,
        returnsToBaseline,
        negativeControlStable,
        controlledCausalPattern: interventionEffect && ablationRemovesEffect && returnsToBaseline && negativeControlStable
      },
      evidenceClass: "OBSERVED_IF_RUNTIME_EXECUTION_COMPLETES",
      limitation: "The controlled policy is deterministic and intentionally simple. A passing result establishes only causal state-dependence of the retained direction under this protocol; it does not establish agency, desire, subjective experience, or consciousness."
    };

    try { window.NouranContinuity.record("controlled_continuity_test", result); } catch (_) {}
    return result;
  }

  window.NouranControlledContinuityTest = Object.freeze({ run });
})();
