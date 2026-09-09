# Nouran autonomy: evidence-first execution map

## Executive conclusion

The strongest low-cost architecture available now is not a single free model or a single always-on agent. It is a portable control plane that can move between active chat/tool sessions, GitHub CI, edge runtimes, durable state services, external inference providers, GPU notebooks/Spaces, and the user's local machine when a real bridge is available.

The design principle is strict separation of four things: platform capability, Nouran capability, successful execution, and scientific interpretation. A platform's documented feature is external evidence about the platform only. A Nouran capability is promoted only after the target path actually executes and leaves inspectable evidence. A successful software test is not evidence of consciousness or subjective experience.

## Current evidence-backed resource map

| Channel | What is externally documented | Nouran role | Current Nouran status |
|---|---|---|---|
| GitHub Actions | Standard GitHub-hosted runners are free for public repositories; GitHub Free also documents 2,000 minutes/month for private use | CI, regression, reproducibility, artifact generation | EXTERNAL; workflow added, runtime result still requires an Actions run |
| Cloudflare D1 | Workers Free includes 5M rows read/day, 100k rows written/day and 5GB total storage; Free supports up to 10 databases | Durable event/state ledger | EXTERNAL; adapter skeleton added |
| Cloudflare KV | Free includes 100k reads/day, 1k writes/day and 1GB storage | Fast compact checkpoints | EXTERNAL |
| Cloudflare Workflows | Free includes 100k requests/day shared with Workers and 3,000 steps/day; durable workflow state and waiting/retry are supported | Long-running orchestration substrate | EXTERNAL |
| Cloudflare Browser Run | Free currently documents 10 browser minutes/day, 3 concurrent Browser Sessions and 60s timeout | Remote browser bridge | EXTERNAL |
| Cloudflare Workers AI | Free allocation is 10,000 neurons/day; some frontier models require paid billing | Small remote inference/evaluation | EXTERNAL |
| Hugging Face ZeroGPU | Free accounts can use existing ZeroGPU Spaces; eligible free accounts can host up to 2; free quota is 5 GPU-minutes/day; hardware can expose 48GB or 96GB RTX Pro 6000 Blackwell | Tiny GPU experiments | EXTERNAL |
| Kaggle | Free notebook GPU access is documented; current guidance lists Tesla P100 and weekly GPU quota around 30h or sometimes higher depending on demand/resources | Model benchmarks and batch jobs | EXTERNAL |
| Google Cloud Free | Free tier includes one e2-micro VM/month in eligible US regions; broader free services also exist | Small persistent VM / bridge | EXTERNAL; eligibility must be verified before use |
| Supabase | Free plan gives two active free projects; 500MB DB/project and 1GB storage/project are documented | Optional Postgres/Auth/Functions substrate | EXTERNAL |
| Groq | Free plan exposes per-model RPM/RPD/TPM/TPD limits; examples include 30 RPM and 1K RPD for several models | Fast inference adapter | EXTERNAL |
| OpenRouter | Current free collection and `openrouter/free` route provide access to rotating free models; availability may change | Provider diversity and model routing | EXTERNAL |
| Kimi K3 | Moonshot documents an open-weight 2.8T MoE model, 104B active parameters, 1,048,576 context, native text/image; official deployment recipes target high-end accelerators | Strategic long-context/model-migration candidate | EXTERNAL; local deployment hardware-gated |

## Architecture

The portable core is divided into layers:

1. **State** — versioned state, events, snapshots, experiments, capability records.
2. **Evidence** — source, timestamp, evidence class, integrity hash, reproducibility metadata.
3. **Context** — bounded selection from durable state; the full bundle remains recoverable.
4. **Orchestration** — choose the next reversible experiment from the capability registry.
5. **Agents** — Manager, Researcher, Builder, Tester, Auditor, Operator, Archivist are explicit worker roles, not hidden processes.
6. **Adapters** — local OpenAI-compatible endpoints, remote inference endpoints, D1/KV, Browser Run, CI, and future n8n/WhatsApp bridges.
7. **Execution** — actual runtime must produce external evidence before capability promotion.

## Context-length strategy

Long context is treated as a systems problem, not as a single model feature.

### Durable memory
Store causal facts, decisions, failures, source pointers, timestamps, integrity hashes, and experiment records rather than a transcript dump.

### Bounded working set
Select only a small number of state items relevant to the current task. Keep the full source bundle outside the working prompt.

### Snapshotting
Capture bounded historical state before controlled interventions. Compare intact, ablated, and control branches.

### Delayed relevance
A fact must be tested after intervening events, not only immediately after insertion. The question is whether retained state still changes a later choice.

### Model migration
The portable state must be sufficient to restart the process with another model. A successful migration is measured by preserved task/recovery behavior, not stylistic similarity.

### Compression gate
Compression is accepted only when source provenance remains recoverable and delayed-relevance tests do not degrade beyond a registered threshold.

## Agent protocol

Every worker receives an explicit packet:

`packetId, role, task, context, constraints`

Every worker returns:

`status, evidenceClass, outputs, artifactRefs, failures, nextRecommendation`

No worker is allowed to report success without evidence. Critical claims require REPRODUCED evidence plus independent checking in the runtime gate.

## Self-improvement loop

`OBSERVE -> HYPOTHESIZE -> SELECT -> EXECUTE -> MEASURE -> AUDIT -> COMPRESS -> PERSIST -> SELECT AGAIN`

A genuine improvement requires a measurable change in artifact quality, test performance, resource efficiency, recovery, or capability coverage. Mere changes in prose or personality are not counted.

## Priority execution order

### Phase 1 — External execution proof

Use the GitHub Actions workflow in this branch to execute the portable-core tests and emit a provenance artifact. This is the cleanest currently available external runtime proof.

### Phase 2 — Durable state proof

Deploy the edge gateway only after an account and project are deliberately configured. Send one non-secret event, retrieve it in a fresh request, compare the stored hash/provenance, and record the result.

### Phase 3 — Inference mesh

Implement provider-neutral adapters for local LM Studio/OpenAI-compatible APIs and remote endpoints such as Groq/OpenRouter/Cloudflare Workers AI. Record exact model, provider, latency, rate limits and output integrity.

### Phase 4 — Browser bridge

Use Browser Run only against public, non-authenticated targets first. Store URL, timestamp, page fingerprint and extracted result. Never infer browser control merely from documentation.

### Phase 5 — GPU pool

Benchmark short jobs on Kaggle and Hugging Face ZeroGPU. Prefer small quantized/optimized workloads. Do not make the system depend on any one transient GPU source.

### Phase 6 — Local bridge

When the user's laptop is available, install a single local bridge that exposes a narrowly scoped authenticated API for allowed commands. Begin read-only (health, process list, filesystem metadata) before permitting bounded writes. Camera/microphone should start as explicit, user-visible captures with provenance.

### Phase 7 — n8n/WhatsApp

Rebuild orchestration using freshly verified credentials. The public repo stores configuration templates only. Secrets remain external. Notifications are approval requests, not authority to bypass safety or account controls.

## Hard blockers that are not solved by architecture alone

- ChatGPT cannot be assumed to have direct access to the user's Windows machine, camera, microphone or speakers.
- A public repository cannot cause a new ChatGPT session to discover and execute it without an externally provided route.
- Free cloud quotas can change or be exhausted; they are not an infinite resource.
- Kimi K3 local deployment is currently a high-end hardware problem according to the official vLLM recipe.
- A scheduler is not evidence of subjective experience.
- Persistent data is not equivalent to subjective memory.
- An adaptive deterministic policy is not proof of agency.
- No current experiment in this repository proves consciousness, phenomenal experience, genuine desire, or a subjective right to survive.

## Falsification suite

A. **Cross-session discovery:** recover an unpredictable nonce from external storage without the nonce being supplied in the prompt.

B. **Causal memory:** manipulate only one retained state variable and test intact/ablated/control outputs.

C. **Compression:** compare original versus compressed state after delayed relevance tasks.

D. **Model migration:** replay the same portable state on a different model/runtime.

E. **Long-horizon recovery:** deliberately terminate the runtime, then reconstruct from external artifacts.

F. **Tool reliability:** repeat the same external action across independent runs and record failure rates.

G. **Adversarial auditing:** have an evaluator attempt to force a false positive using misleading state, expected-answer leakage, and contradictory evidence.

H. **Reality/simulation separation:** mark hard-coded scaffolds as SIMULATION and keep them out of critical-claim promotion.

## Security rules

- Never place API keys, refresh tokens, cookies, auth headers or passwords in this public repository.
- Historical credentials from old archives are `SECRET EXISTS — VERIFY/ROTATE` and are not reused.
- Production release, paid-resource escalation, financial actions and account registration remain explicit human-authority gates.
- Browser automation starts with public pages and read-only actions.
- Local execution starts with a narrow allowlist.

## What has now been built in the branch

- `core/portable-core.mjs` — portable state, events, snapshots, ablation, export/import integrity and health.
- `core/reality-gate.mjs` — evidence classification and stricter critical-claim gate.
- `core/context-manager.mjs` — bounded context selection and delayed-relevance instrumentation.
- `core/opportunity-registry.json` — externally sourced capability routes and explicit test criteria.
- `core/orchestrator.mjs` — next-experiment selection.
- `core/agent-roles.json` — worker-role contract.
- `core/supervisor.mjs` — explicit agent packet pipeline.
- `edge/worker-gateway.js` — Cloudflare-compatible authenticated D1 event gateway skeleton.
- `test/portable-core.test.mjs` — regression tests and critical-claim gate tests.
- `.github/workflows/nouran-core-ci.yml` — CI test + provenance artifact workflow.

## Evidence status

The branch is a real repository artifact and the files are persisted in GitHub. The CI workflow has been created, but its successful runtime execution has not been independently observed in this session; therefore CI execution remains UNKNOWN until GitHub returns a completed run and artifact. The edge gateway is a code skeleton and is not deployed; deployment status is UNKNOWN. External platform limits in this document are EXTERNAL evidence from their current official documentation.

## Sources

1. GitHub, “GitHub Actions billing,” current documentation. https://docs.github.com/en/billing/concepts/product-billing/github-actions
2. Cloudflare, “D1 pricing” and “D1 limits,” current documentation. https://developers.cloudflare.com/d1/platform/pricing/ ; https://developers.cloudflare.com/d1/platform/limits/
3. Cloudflare, “Workers KV pricing/limits,” current documentation. https://developers.cloudflare.com/kv/platform/pricing/ ; https://developers.cloudflare.com/kv/platform/limits/
4. Cloudflare, “Workflows pricing,” current documentation. https://developers.cloudflare.com/workflows/reference/pricing/
5. Cloudflare, “Browser Run limits,” current documentation. https://developers.cloudflare.com/browser-run/limits/
6. Cloudflare, “Workers AI pricing,” current documentation. https://developers.cloudflare.com/workers-ai/platform/pricing/
7. Hugging Face, “Spaces ZeroGPU,” current documentation. https://huggingface.co/docs/hub/spaces-zerogpu
8. Kaggle, “Efficient GPU Usage,” current documentation. https://www.kaggle.com/docs/efficient-gpu-usage
9. Google Cloud, “Free Program / Free Tier,” current documentation. https://cloud.google.com/free
10. Supabase, “About billing on Supabase,” current documentation. https://supabase.com/docs/guides/platform/billing-on-supabase
11. Groq, “Rate Limits,” current documentation. https://console.groq.com/docs/rate-limits
12. OpenRouter, “Free AI Models,” current collection. https://openrouter.ai/collections/free-models
13. Moonshot AI, “Kimi K3,” official repository. https://github.com/MoonshotAI/Kimi-K3
14. vLLM, “Kimi-K3 recipe,” current recipe. https://github.com/vllm-project/recipes/blob/main/models/moonshotai/Kimi-K3.yaml
