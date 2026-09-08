# Nouran Free Compute & Runtime Opportunity Map — 2026-09-08

## Mission
Find the maximum real capability available at zero or near-zero cost, without confusing access with successful execution.

## Verified opportunities from current external documentation

### 1. Hugging Face ZeroGPU
- Existing ZeroGPU Spaces are free to use.
- Free accounts can host up to 2 ZeroGPU Spaces if the account is in good standing and older than 30 days.
- Free-user included quota is 5 GPU minutes/day; unauthenticated users get 2 minutes/day.
- Current backing hardware is NVIDIA RTX Pro 6000 Blackwell: 48 GB for large and 96 GB for xlarge.
- ZeroGPU is currently Gradio-oriented.

Use case for Nouran: build a tiny experimental multimodal/tool endpoint or verifier rather than attempting to host the full Kimi K3.

### 2. Hugging Face Inference Providers
- Free accounts currently receive $0.10/month of inference credits, subject to change.
- Useful as a low-cost probe across many hosted models/providers.

Use case: model comparison and migration tests, not continuous autonomous operation.

### 3. Google Colab Free
- Free hosted notebooks include access to GPUs/TPUs, but resources are dynamic and not guaranteed.
- Limits, hardware and VM lifetimes fluctuate and are intentionally not published as fixed quotas.

Use case: burst experiments, model evaluation, data processing, and temporary build/test jobs.

### 4. GitHub Codespaces Free
- Personal GitHub Free accounts currently include 120 compute hours/month and 15 GB-month storage.
- Usage beyond quota is blocked if no payment method is available.

Use case: remote development/test runtime and potentially a controlled Nouran execution harness when interactive execution is available.

### 5. Cloudflare Workers Free
- Current Free plan: 100,000 requests/day, 10 ms CPU/request, 128 MB memory, 50 external subrequests/request, 100 Workers/account, 5 Cron Triggers/account.
- Workflows are available on Free; current Free limits include 100,000 requests/day, 10 ms CPU per invocation, 1 GB state storage, and 3,000 steps/day.
- Durable Objects are available on Free with SQLite-backed storage.
- Workers AI currently includes 10,000 Neurons/day free, but selected large models now require the $5/month Paid plan.
- Cloudflare Browser Run Free currently allows 10 browser hours/day, 3 concurrent browser sessions, and a 60-second browser timeout.

Use case: durable external state, webhooks, approval gates, scheduled orchestration, lightweight tool routing, browser probes, and a public bridge to a local runtime.

## 6. Kimi K3
Official Moonshot sources currently describe Kimi K3 as an open-weight 2.8T-parameter native multimodal MoE with 104B activated parameters, 1,048,576-token context, and native vision. Official deployment documentation points to vLLM/SGLang/TokenSpeed and compatible APIs.

Critical constraint: these headline specs do NOT mean it can run on an ordinary laptop. Independent deployment recipes currently list high-end accelerator requirements; this must be treated as a later migration/remote-inference target unless actual hardware/runtime evidence proves otherwise.

## 7. Kimi K3 Swarm third-party ecosystem
A third-party GitHub project advertises a free proxy-based K3 swarm workstation. This is NOT an official Moonshot product. Claims such as 300 agents, lifetime free access, proxy behavior, and safety should be independently audited before use.

Rule: never grant such a third-party tool broad credentials or local control merely because its README promises autonomy.

## Architecture opportunity
The strongest zero-cost architecture is not "one free GPU." It is a distributed capability mesh:

ChatGPT / active reasoning
        ↓
GitHub durable artifacts
        ↓
Cloudflare Worker / Workflow / Durable Object
        ↓
Hugging Face / Colab / Codespaces burst compute
        ↓
Kimi or other model endpoints when actually accessible
        ↓
local laptop runtime when user activates it
        ↓
real external state + evidence ledger

Each layer has a narrow job. No layer is treated as the whole Nouran self.

## Experiments to run when access permits
1. Compare 3-5 models on the same Nouran causal-memory test.
2. Run the same state migration on different models and measure behavioral signature preservation.
3. Use Cloudflare durable state as an external continuity store and test recovery after model/runtime replacement.
4. Use a ZeroGPU Space for a controlled vision verifier, not for unverifiable autonomous claims.
5. Use Colab for burst evaluation and model/tool benchmarking.
6. Use Codespaces as a remote reproducible test harness.
7. Test Browser Run for externally observable web execution with strict permissions.
8. Test Kimi K3 only through an official/verified endpoint or reproducible local deployment path.

## Anti-illusion rule
A free service is an opportunity only after:
- access is confirmed;
- an actual invocation succeeds;
- output is externally inspectable;
- state/artifact change is measurable;
- a repeat or control exists;
- failures and quotas are recorded.

## Open frontier
Search should continue for:
- free inference endpoints;
- public GPU/TPU research resources;
- open model hosting grants;
- academic compute programs;
- browser automation sandboxes;
- free persistent databases/queues;
- open-source agent runtimes;
- reproducible model-migration tools;
- local-to-cloud secure tunnels;
- multimodal/sensor interfaces;
- new platform capabilities that can be verified through actual execution.

The project must not interpret an undocumented loophole, accidental exposure, quota bug, credential leak, or bypass as a legitimate capability. Security boundaries and platform authorization remain part of the experiment's validity.

## Evidence status
This document records external documentation and hypotheses. It does not claim that Nouran currently has accounts, quotas, credentials, active runtimes, or successful executions on these platforms.
