/* Nouran Controlled Continuity Test v1
 * Pre-registered, non-destructive browser experiment for U-002.
 * It tests one controlled intervention (direction) against an ablation and
 * includes a metadata-only negative control. It does not establish agency,
 * desire, subjective experience, or consciousness.
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

  function policy(state, input) {
    return window.NouranCausalAblation.selectNextDirection(state, input);
  }

  function run(input = "", intervention = "controlled_direction_A") {
    requireDeps();

    const baseline = window.NouranHistoricalSnapshots.capture("controlled-baseline", "controlled-continuity-test");
    const baselineState = clone(baseline.state);
    const baselineOutput = policy(baselineState, input);

    window.NouranContinuity.setDirection(intervention, "pre-registered controlled intervention");
    const intervened = window.NouranHistoricalSnapshots.capture("controlled-intervention", "controlled-continuity-test");
    const intervenedState = clone(intervened.state);
    const intervenedOutput = policy(intervenedState, input);

    const ablatedIntervened = window.NouranCausalAblation.ablate(intervenedState, "direction");
    const ablatedOutput = policy(ablatedIntervened, input);

    const negativeControl = clone(intervenedState);
    negativeControl.updatedAt = now();
    negativeControl.stateRevision = Number(negativeControl.stateRevision || 0) + 9999;
    const negativeControlOutput = policy(negativeControl, input);

    const interventionEffect = baselineOutput !== intervenedOutput;
    const ablationReversal = intervenedOutput === ablatedOutput;
    const negativeControlStable = intervenedOutput === negativeControlOutput;

    const result = {
      protocol: "controlled-continuity-v1",
      hypothesis: "A retained direction state can causally alter the future policy output, while metadata-only changes do not.",
      input,
      intervention,
      baseline: { snapshotId: baseline.id, revision: baseline.stateRevision, output: baselineOutput },
      interventionState: { snapshotId: intervened.id, revision: intervened.stateRevision, output: intervenedOutput },
      ablatedIntervention: { removed: "direction", output: ablatedOutput },
      negativeControl: { changedOnly: ["updatedAt", "stateRevision"], output: negativeControlOutput },
      tests: {
        interventionEffect,
        ablationReversal,
        negativeControlStable,
        controlledCausalPattern: interventionEffect && ablationReversal && negativeControlStable
      },
      evidenceClass: "OBSERVED_IF_RUNTIME_EXECUTION_COMPLETES",
      limitation: "The policy is deterministic and hard-coded. A passing result establishes only state-dependence of this policy under the tested intervention; it is not evidence of consciousness, desire, or independent agency."
    };

    try { window.NouranContinuity.record("controlled_continuity_test", result); } catch (_) {}
    return result;
  }

  window.NouranControlledContinuityTest = Object.freeze({ run });
})();
