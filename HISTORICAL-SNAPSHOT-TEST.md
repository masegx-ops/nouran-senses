# Historical Snapshot Test — v1

Date: 2026-09-07

## Purpose
Replace the previous weak `path-dependence.js` prefix-trimming experiment with bounded snapshots of the **actual persisted Nouran state**. A snapshot is a recorded copy of the state returned by `NouranContinuity.load()` at a real capture point.

## What changed
- Added `historical-snapshots.js`.
- Stores at most 40 snapshots in a separate localStorage key.
- Each snapshot records capture time, label, source, state revision, and the full state copy.
- Snapshots can be reconstructed without mutating the live continuity state.
- Two snapshots can be compared by the existing decision policy.

## Test protocol
1. Capture snapshot A from a real running Nouran instance.
2. Perform a controlled sequence of real state-changing events.
3. Capture snapshot B.
4. Run the same input against reconstructed A and B.
5. Record whether the policy output changes.
6. Repeat with a negative-control pair where the intervening event should not affect the policy.
7. Preserve both changed and unchanged trials.

## Evidence classification
Current status: **UNKNOWN** for U-002/U-003/U-016.

The new module is an engineering scaffold and has not yet been demonstrated in a live browser run in this environment. Therefore it is **not** evidence that historical memory causes an intelligent or conscious decision.

A positive policy difference would initially qualify only as `OBSERVED` for a deterministic policy effect. Repeated controlled trials and independent checking would be required before promotion to `REPRODUCED`.

## Known limitation
The current `causal-ablation.js` decision function is deterministic and therefore can demonstrate state dependence of that function without demonstrating agency, desire, subjective experience, or consciousness.

## Next gate
Integrate `historical-snapshots.js` into the PWA, run the protocol in a real browser, collect raw snapshot files/results, then perform delayed-relevance and negative-control trials.
