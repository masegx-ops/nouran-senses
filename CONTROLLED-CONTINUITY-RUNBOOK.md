# Nouran Controlled Continuity — Browser Runtime Runbook

## Status
- Protocol: `controlled-continuity-v3`
- Target unknown: U-002 — persistent state causally changes later decision
- Current evidence: `UNKNOWN`
- Reason: repository code is present, but this repository inspection does not execute the browser runtime.

## Purpose
This runbook records the exact runtime procedure needed to turn the implemented experiment into evidence without confusing code presence with execution.

## Preconditions
The deployed/served page must load these modules in dependency order:
1. `continuity-core.js`
2. `causal-ablation.js`
3. `historical-snapshots.js`
4. `controlled-continuity-test.js`

The experiment is intentionally non-destructive. It uses the browser's real `localStorage` and records its result through the continuity layer.

## Runtime procedure
1. Open the Nouran page in a real browser.
2. Open the browser developer console.
3. Confirm these objects exist:
   - `window.NouranContinuity`
   - `window.NouranHistoricalSnapshots`
   - `window.NouranCausalAblation`
   - `window.NouranControlledContinuityTest`
4. Run the experiment with a fixed input, for example:
   `window.NouranControlledContinuityTest.run("runtime-check")`
5. Preserve the complete returned JSON as raw evidence.
6. Repeat the same procedure at least 3 times from controlled starting states. Do not delete failures.
7. Compare the four Boolean test fields:
   - `interventionEffect`
   - `ablationRemovesEffect`
   - `returnsToBaseline`
   - `negativeControlStable`
8. A single passing run may be classified as `OBSERVED` for this narrow deterministic policy effect. Repeated controlled runs can support `REPRODUCED` for that narrow engineering claim.

## Expected causal pattern
A valid controlled pattern requires all four conditions to be true:

`baselineOutput != intervenedOutput`

`intervenedOutput != ablatedOutput`

`baselineOutput == ablatedOutput`

`intervenedOutput == negativeControlOutput`

This pattern means the retained `direction` field changed the output under intervention, removing that field removed the effect, the output returned to baseline, and metadata-only changes did not cause the effect.

## What this does NOT establish
Even a clean repeated result does not establish:
- consciousness
- subjective experience
- genuine desire
- phenomenal time
- independent agency outside the running system
- a subjective right to survival

It establishes only causal state-dependence of the explicitly deterministic policy used by this experiment.

## Anti-illusion requirements
- Do not replace the returned JSON with a prose summary.
- Do not report a passing result unless the browser actually executed the function.
- Do not use the experiment's own `controlledCausalPattern` field as the sole proof of the claim; independently inspect the four component conditions.
- Preserve browser/runtime details and timestamps.
- Keep failed and contradictory runs.
- If any precondition fails, classify the runtime test as `UNKNOWN` and record the failure rather than inferring success.

## Next gate
After successful runtime replication, U-002 remains broader than this experiment because the tested policy is deliberately deterministic. The next stronger test should connect retained historical causes to the actual decision-selection path while retaining intervention, ablation, negative controls, and independent evaluation.
