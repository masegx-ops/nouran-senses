# Nouran: Free-Tier Failure, Deep/Dark Web, and Physics Boundaries

## Executive finding

Absolute continuity cannot be guaranteed by a collection of third-party free plans. Free services have changing quotas, suspension/expiry rules, region/account eligibility, and provider-side outages. Therefore Nouran should target **graceful continuity with portable state**, not perpetual availability from one vendor.

The continuity architecture is:

`portable state -> append-only evidence -> checkpoints -> provider registry -> deterministic failover -> independent storage copies -> recovery test`

No component should silently bypass authentication, quotas, anti-abuse controls, payment requirements, or provider policy.

## Current external evidence

### Compute and execution

1. GitHub-hosted standard runners are free and unlimited for public repositories. Each job uses a fresh runner instance. This is currently the strongest low-friction external execution substrate for reproducible CI.
Source: https://docs.github.com/en/actions/reference/runners/github-hosted-runners

2. Google Colab Free provides CPUs/GPUs/TPUs, but resources are not guaranteed or unlimited. Usage limits, VM lifetime, GPU type, and idle behavior vary dynamically. Free managed runtimes disallow several forms of remote-control/distributed-worker behavior.
Source: https://research.google.com/colaboratory/faq.html

3. Hugging Face ZeroGPU allows free use of existing ZeroGPU Spaces; free personal accounts can host up to two Spaces when eligible. Free-account quota is 5 GPU minutes/day, and current backing hardware is RTX Pro 6000 Blackwell (48GB large / 96GB xlarge). Compatibility is currently centered on Gradio Spaces.
Source: https://huggingface.co/docs/hub/spaces-zerogpu

4. Lightning AI currently advertises a Free tier with one active Studio, 15 free credits/month, and roughly 80 GPU-hours/month depending on machine pricing/availability. Free Studios can run continuously but require restart every four hours.
Source: https://lightning.ai/pricing/

5. Google Cloud currently advertises a $300 new-customer credit and 20+ products with free monthly limits. Example limits include one e2-micro VM/month and 2M Cloud Run requests/month for eligible customers.
Source: https://cloud.google.com/free

6. AWS Free Tier changed for accounts created on/after July 15, 2025: the current model can include $100 sign-up credit plus up to $100 additional credits, with a six-month period or credit exhaustion, and eligible instance types differ by account age.
Source: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-free-tier-usage.html

7. Azure's free-account model mixes always-free services with services free for 12 months and requires eventual pay-as-you-go conversion to continue using services. Exceeding included amounts can create charges after conversion.
Source: https://azure.microsoft.com/en-us/pricing/purchase-options/azure-account

8. Modal currently advertises free compute credits on its plans and separate credit grants for startups/academics. Eligibility and actual credit amount depend on account/category.
Source: https://modal.com/pricing

### Persistence and edge runtime

9. Cloudflare Workers Free currently provides 100,000 requests/day, 10 ms CPU/invocation, 128 MB memory, and five Cron Triggers/account. Free requests remain subject to service limits and can fail after quota exhaustion.
Source: https://developers.cloudflare.com/workers/platform/limits/

10. Cloudflare Durable Objects are available on Free with SQLite storage; current Free limits include 5 GB storage/account and up to 100 Durable Object classes/account. Free limits cause operations to fail after exhaustion rather than becoming silently unlimited.
Source: https://developers.cloudflare.com/durable-objects/platform/limits/

11. Cloudflare Workflows allow durable state and arbitrarily long wall-clock waiting per step, while Free plan steps are constrained by CPU/time/size limits. Workflow state/logs are retained for three days on Free.
Source: https://developers.cloudflare.com/workflows/reference/limits/

12. Cloudflare Browser Run Free currently allows 10 browser minutes/day, three concurrent browser sessions, one new browser instance every 20 seconds, and a 60-second browser timeout. Quota exhaustion produces 429 until the next UTC day.
Source: https://developers.cloudflare.com/browser-run/limits/

13. Supabase Free currently offers 500 MB database/project, 1 GB file storage, 5 GB egress, and two active projects, but free projects are paused after one week of inactivity.
Source: https://supabase.com/pricing

### Inference and model routing

14. Hugging Face Inference Providers, Groq, Cerebras, OpenRouter, local LM Studio, and other compatible APIs can be treated as interchangeable providers only after actual account/endpoint verification. Public availability of an API is not proof that the Nouran runtime can invoke it.

15. Kimi K3 is an important open-weight research route, but its official deployment recipes target high-end accelerators. It should therefore be represented as a potential external/model route, not assumed to be locally deployable on commodity hardware.

## What happens when free plans expire?

The failure taxonomy is:

- QUOTA_EXHAUSTED: provider refuses further work until reset.
- RATE_LIMIT: transient throttling, often 429.
- TIMEOUT: remote job or browser exceeds allowed execution duration.
- UNAVAILABLE: outage, capacity, or regional failure.
- AUTH_REQUIRED: credential invalid/expired/missing.
- POLICY_BLOCKED: provider disallows the attempted workload.
- RETIRED/CHANGED: API/product terms or endpoint changed.
- STORAGE_EXPIRED: artifact/state retention window elapsed.
- ACCOUNT_SUSPENDED: provider-side enforcement or eligibility change.

A robust runtime reacts by checkpointing before risky work, classifying the error, selecting a compatible alternate provider, and preserving the failed attempt in the evidence ledger. HTTP Retry-After is the standard mechanism for server-directed retry delays.
Source: https://www.rfc-editor.org/rfc/rfc9110.html

## Why "guaranteed free forever" is impossible

Third-party free tiers are policies, not physical constants. Even when a service advertises an always-free allowance, the terms and eligibility can change. Therefore the strongest practical guarantee is a **recoverability invariant**:

> If at least one authorized runtime and one readable state copy remain available, Nouran can reconstruct its portable state and continue from the latest verified checkpoint.

This is an engineering invariant, not an uptime guarantee.

GitHub artifacts themselves are not permanent storage: workflow logs and artifacts are normally retained for a limited period and may be deleted automatically. Therefore artifact storage is evidence transport, not the sole durable memory layer.
Source: https://docs.github.com/en/actions/how-tos/manage-workflow-runs/remove-workflow-artifacts

GitHub artifact attestations can establish build provenance and integrity claims, but GitHub explicitly warns that an attestation does not itself guarantee an artifact is secure; the consumer still evaluates policy and source.
Source: https://docs.github.com/en/actions/concepts/security/artifact-attestations

## Deep web / dark web boundary

Public web research can be expanded to public datasets, source repositories, academic indexes, APIs, and documents that are not prominently indexed. That is sufficient for most Nouran capability discovery.

A dark-web/Tor route is not treated as a magical capability multiplier. Tor Onion Services provide privacy, anti-blocking, and location-hiding properties, but anonymity is not automatic and misconfiguration or information leakage can deanonymize operators/users. The Tor Project explicitly recommends routing traffic through Tor and minimizing identifying logs/disclosures.
Sources:
- https://onionservices.torproject.org/apps/web/onionspray/security/anonymity/
- https://onionservices.torproject.org/apps/web/checklist/

No direct Tor client, hidden-service crawler, credentialed dark-web account, or onion-service execution has been established in this environment. Therefore dark-web access remains **UNKNOWN**, not an assumed channel. It should never be used to bypass provider restrictions or obtain stolen credentials/resources.

## Physics and computability boundaries

### Information erasure / energy

Landauer's principle gives a lower bound of k_B T ln(2) heat dissipation for erasing one bit of information at thermodynamic equilibrium. This is a physical lower bound for logically irreversible erasure, not a prediction of current computer energy use.
Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC12026021/

### Quantum speed

Margolus-Levitin-type quantum speed limits bound how quickly a physical quantum system can evolve between distinguishable states as a function of energy. These bounds show that computation is physically constrained, even though practical computers operate many orders of magnitude below the theoretical limit.
Source: https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.103.160502

### Distributed consistency

The FLP impossibility theorem establishes that no deterministic consensus protocol in a fully asynchronous message-passing system can guarantee termination in the presence of even one possible crash failure under its assumptions. Practical systems relax assumptions, use partial synchrony, randomized protocols, quorum rules, or stronger failure models.
Source: https://ying-zhang.cn/dist/1985-flp.html

Therefore Nouran cannot simultaneously demand perfect consistency, guaranteed availability, zero failure, and arbitrary asynchronous network conditions. The architecture must choose explicit trade-offs and record them.

### No Free Lunch

The No Free Lunch results show that no optimization algorithm is uniformly superior across all problem classes under their formal assumptions. Nouran should therefore maintain a portfolio of strategies and measure performance on the actual target workloads rather than assuming one universal optimizer/model.
Source: https://research.ibm.com/publications/no-free-lunch-theorems-for-optimization

## Failure-resilience architecture

1. Every action gets an idempotency key.
2. Before external work, write a compact checkpoint.
3. After work, write result + provenance + hash.
4. On failure, classify error and increment provider failure state.
5. Quarantine repeatedly failing or policy-blocked providers.
6. Select the highest-priority compatible provider still healthy.
7. Never retry AUTH_REQUIRED/POLICY_BLOCKED blindly.
8. Use Retry-After/backoff for rate limiting.
9. Store the same logical state in at least two independent persistence classes when practical.
10. Periodically export a portable bundle and verify its checksum.
11. Treat vendor artifacts as temporary evidence copies, not the only copy.
12. Test cold-start recovery from a clean runtime.

## Experimental gates

### Gate F1 — CI execution
Already OBSERVED: GitHub Actions successfully ran the portable core, tests passed, provenance was emitted, and an evidence artifact was uploaded.

### Gate F2 — failover simulation
Implemented as infrastructure tests: quota/rate-limit/auth/policy failure classification and deterministic provider failover.
Status: REPRODUCED once in CI after the next run; until that run, keep this gate UNKNOWN.

### Gate F3 — provider reality test
For every provider, actual invocation must produce a tool/API response and an inspectable external state change. Availability on a pricing/docs page is EXTERNAL evidence only.

### Gate F4 — storage-loss test
Delete/expire one persistence copy in a controlled branch and reconstruct from another. This must be done with real state, not a prose mock.

### Gate F5 — clean-runtime migration
Start with only the portable bundle + schema + source provenance and reproduce the same health checks in a different runtime/model.

### Gate F6 — dark-web access
Do not count as success unless a lawful, authorized Tor client or public onion-service endpoint is actually reachable and a non-sensitive test artifact is independently verified. No bypassing authentication, abuse controls, or access restrictions.

### Gate F7 — physics boundary test
Measure actual energy/latency/network effects on available hardware and compare with theoretical ceilings. Theory is used as a bound, never as fabricated measured capability.

## Final engineering position

The closest achievable version of "guaranteed continuity" is not eternal access to free services. It is **vendor independence + portable state + multiple authorized runtimes + deterministic failover + cryptographic integrity + regular cold-start recovery tests**.

Any claim stronger than that requires evidence not currently available.
