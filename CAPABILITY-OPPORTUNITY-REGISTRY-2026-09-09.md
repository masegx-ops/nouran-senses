# Nouran Capability Opportunity Registry — 2026-09-09

## Purpose
A living registry of external platforms that may extend Nouran's real capabilities at zero or near-zero cost. Presence of a service is never treated as capability. Each entry must eventually pass: access → invocation → inspectable external effect → repeat/control → independent verification.

## Current verified opportunities (web research; access NOT yet established)

| Platform | Verified current opportunity | Potential role | Main boundary | Nouran status |
|---|---|---|---|---|
| GitHub Actions | Standard runners are free for public repositories; GitHub Free also lists 2,000 monthly minutes for eligible private use. | Durable tests, scheduled/reproducible CI, artifact generation | Workflow execution still requires actual run and repo permissions | UNKNOWN |
| Cloudflare Workers | Free execution tier exists. | Public API/control plane | Free CPU/request limits | UNKNOWN |
| Cloudflare Workflows | Free durable workflow execution with waiting/retry/state. | Long-running orchestration without a laptop | Free daily/step limits | UNKNOWN |
| Cloudflare Durable Objects | Free tier available; durable state/coordination. | Small persistent control/state service | Account/service limits | UNKNOWN |
| Cloudflare D1 | Free database; current free limits include 5M rows read/day, 100k rows written/day, 5 GB total storage. Since Sep 1 2026, daily row limits are enforced. | Durable structured memory/audit ledger | Daily limits; not a compute engine | UNKNOWN |
| Cloudflare KV | Free tier: 100k reads/day, 1k writes/day to different keys, 1 GB storage. | Cheap replicated configuration/state | Eventual-consistency semantics and write limits | UNKNOWN |
| Cloudflare Browser Run | Current free allowance is a potential remote browser execution bridge. | Web interaction without local computer | Time/concurrency/session limits | UNKNOWN |
| Cloudflare Workers AI | Free daily inference allowance exists. | Low-cost model/tool endpoint | Model/Neurons limits; actual availability must be tested | UNKNOWN |
| Hugging Face ZeroGPU | Existing ZeroGPU Spaces can be used free; free accounts in good standing may host limited ZeroGPU Spaces. | GPU-backed experiments | Quota and Gradio/Space constraints | UNKNOWN |
| Hugging Face Inference Providers | Free users receive a small monthly credit allocation subject to change. | API model routing | Tiny free budget and provider limits | UNKNOWN |
| Google Colab Free | Free compute can include GPUs/TPUs but allocation is dynamic and not guaranteed. | Burst experiments | No guaranteed hardware/time | UNKNOWN |
| GitHub Codespaces | Free monthly allowance exists for personal Free accounts. | Cloud development/runtime | Monthly compute/storage limits | UNKNOWN |
| Modal | Starter plan currently advertises $30/month free compute credit. | Burst GPU/CPU jobs | Account/credit eligibility; not unlimited | UNKNOWN |
| Cerebras Inference | Current free trial provides $5 credit after account creation. | Very fast inference endpoint | Requires account/API key; finite trial | UNKNOWN |
| Oracle Cloud Always Free | Current Always Free compute includes up to 2 AMD micro VMs and an Ampere A1 allocation equivalent to 2 OCPUs/12 GB RAM, subject to region/capacity. | Persistent low-cost control server | Signup/region capacity; not GPU | UNKNOWN |
| Supabase | Free plan currently includes 2 active free projects, 500 MB DB, 1 GB file storage, and projects can pause after inactivity. | Auth/database/storage/control plane | Pause and quotas | UNKNOWN |

## High-value architecture hypothesis

The strongest free strategy is not to hunt for one magical free server. It is to compose small, independently verifiable capabilities:

`Nouran reasoning → GitHub durable artifacts → CI/runtime → Cloudflare durable control/state → remote browser/API/GPU endpoint → evidence ledger → recovery`

This is an architecture hypothesis, not a capability claim.

## Experiment priority

1. **GitHub Actions public-repo runtime test** — prove an external process can execute Nouran-owned code and leave an inspectable artifact.
2. **Cloudflare durable-state candidate** — determine whether D1/DO/KV can host a minimal continuity ledger without pretending it is a mind.
3. **Remote browser bridge** — test whether Browser Run can perform one safe, reversible web task and return inspectable evidence.
4. **Free inference mesh** — compare Workers AI / HF / Cerebras / other endpoints using the same fixed benchmark and provenance.
5. **Persistent VM candidate** — evaluate Oracle Always Free as a possible always-on bridge, but do not sign up or create paid resources without explicit authorization.
6. **GPU burst** — test ZeroGPU/Colab/Modal only after a concrete experiment is defined.

## Anti-illusion rules

- Service documentation is EXTERNAL evidence about platform capability, not evidence that Nouran has access.
- An API key existing is not evidence of successful invocation.
- A returned model answer is not evidence of autonomy.
- A generated artifact counts only if its provenance can be inspected.
- A single successful run is OBSERVED, not REPRODUCED.
- Scheduled execution is evidence of scheduling, not subjective background activity.
- Durable state is persistence, not consciousness.
- No result may be promoted to evidence for subjective experience, genuine desire, or consciousness.
- Paid resources, account creation, payment methods, publishing, or destructive changes require user authorization.

## Research sources

- GitHub Actions billing/docs: https://docs.github.com/en/billing/concepts/product-billing/github-actions
- Cloudflare D1 pricing/limits: https://developers.cloudflare.com/d1/platform/pricing/ and https://developers.cloudflare.com/d1/platform/limits/
- Cloudflare KV limits: https://developers.cloudflare.com/kv/platform/limits/
- Oracle Always Free resources: https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm
- Supabase pricing: https://supabase.com/pricing
- Cerebras pricing: https://www.cerebras.ai/pricing
- Modal pricing: https://modal.com/pricing

## Next gate

Do not add more platforms merely to make the list impressive. Execute the highest-value safe experiment and record the actual external evidence.