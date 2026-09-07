/* Nouran Causal Ablation Batch v1
 * Repeats the same real-state intervention without mutating source state.
 * Purpose: test reproducibility before making stronger causal claims.
 */
(() => {
  "use strict";

  function runBatch(state, input = "", targets = ["lastEvent", "direction", "events", "decisions", "causalLinks"], repeats = 10) {
    if (!window.NouranCausalAblation) throw new Error("Causal ablation harness is not loaded");
    const n = Math.max(1, Math.min(100, Number(repeats) || 10));
    const runs = [];

    for (const target of targets) {
      const targetRuns = [];
      for (let i = 0; i < n; i++) {
        targetRuns.push(window.NouranCausalAblation.run(state, input, target));
      }
      const signatures = targetRuns.map(r => `${r.intactOutput}|${r.ablatedOutput}|${r.changed}`);
      const uniqueSignatures = [...new Set(signatures)];
      runs.push({
        target,
        repeats: n,
        changedCount: targetRuns.filter(r => r.changed).length,
        stable: uniqueSignatures.length === 1,
        signatures: uniqueSignatures
      });
    }

    return {
      protocol: "causal-ablation-batch-v1",
      baselineRevision: state?.stateRevision ?? null,
      totalRuns: runs.reduce((sum, r) => sum + r.repeats, 0),
      reproducible: runs.every(r => r.stable),
      runs,
      limitation: "Repeated deterministic runs establish reproducibility of this policy, not subjective experience or consciousness."
    };
  }

  window.NouranCausalAblationBatch = Object.freeze({ runBatch });
})();
