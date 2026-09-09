# Nouran Studio — Architecture Decision 2026-09-09

## Decision

Adopt a **local-first, provider-neutral hybrid architecture**. ChatGPT/Codex Computer Use is an optional adapter, not the control plane. The primary control plane is Nouran Agent Core running on Windows, with durable project state in Git/GitHub and optional n8n orchestration. Android is a remote control/monitoring surface, not the host.

Primary routing order:
1. Direct API / deterministic automation when possible.
2. Browser automation (Playwright) for web tasks.
3. Local Windows automation / UI Automation for desktop tasks.
4. Local LM Studio for private reasoning and routing when model quality is sufficient.
5. Gemini Computer Use API for multimodal desktop/browser control when an API key and free/paid quota are available.
6. ChatGPT/Codex Computer Use when the account/feature is eligible and its execution quality is superior.
7. n8n for durable orchestration, schedules, webhooks and integrations.
8. WhatsApp as notification/approval channel, never as the execution authority.

## A-I comparison

| Path | Free now | Windows control | Android | Autonomous | n8n | Privacy | Decision |
|---|---|---|---|---|---|---|---|
| A ChatGPT/Codex Computer Use | Not established for current Free account | Strong when eligible | Remote steering supported for eligible desktop Codex | Medium | Indirect | Medium | Keep as optional adapter |
| B ChatGPT remote control | Current account limitation applies | Strong through host | Strong when eligible | Medium | Indirect | Medium | Do not make core dependency |
| C Gemini Computer Use + local executor | API has free model tiers; Computer Use itself is billed under current pricing | Strong | Can target mobile/browser/desktop environments; Android control needs an executor/ADB bridge | High | Strong | Medium | **Preferred cloud computer-use adapter** |
| D Gemini + AI Studio | Free model access, but AI Studio is not itself a Windows executor | None by itself | None by itself | Low | Strong via API | Medium | Use for prototyping/routing, not desktop control |
| E Playwright/Puppeteer | Free/open source | Browser only | Browser/web targets | High for deterministic web tasks | Strong | High | **Preferred browser executor** |
| F n8n self-hosted | Free self-hosted/community route | Indirect | Webhooks/notifications | High | Native | High/local | **Core orchestrator** |
| G LM Studio | Local/free software | Via a separate executor | Indirect | High if wrapped as a service | Strong | **Very high/local** | **Core local model adapter** |
| H Open-source Windows agents (e.g. Microsoft UFO) | Open source; dependencies/models vary | **Very strong** | Galaxy/ADB path exists | High | Via API/MCP bridge | High/local | **Primary Windows automation candidate** |
| I Hybrid | Yes at architecture level | **Strongest** | **Strongest** | **Strongest** | **Strongest** | Configurable | **FINAL CHOICE** |

## Current capability classification

### [AVAILABLE NOW]
- GitHub-hosted durable artifacts and versioned source.
- Portable Nouran core already present in the repository.
- Reality gate, context manager, snapshots, causal experiment scaffolding.
- GitHub Actions workflow exists; execution must be separately verified per run.
- Research and architecture artifacts can be maintained without ChatGPT storage.

### [AVAILABLE AFTER INSTALLING TOOL]
- Playwright for browser automation.
- pywinauto/UI Automation/AutoHotkey/Power Automate Desktop for deterministic Windows tasks.
- Microsoft UFO/UFO3 for agentic Windows UI control; it supports Windows device agents, UIA, screenshots, native control, and a client/server WebSocket architecture.
- A small local Nouran gateway on Windows.
- Android ADB bridge if USB debugging/network debugging is enabled.

### [AVAILABLE AFTER API]
- Gemini Computer Use.
- Groq/OpenRouter/other remote inference adapters.
- Cloudflare edge state if an account/project is configured.
- WhatsApp Cloud API after credential rotation and verification.

### [AVAILABLE AFTER SUBSCRIPTION / ELIGIBILITY]
- ChatGPT/Codex Computer Use and Remote Control when the account is eligible and the feature is permitted by plan/workspace.
- Higher-volume commercial model APIs.

### [NOT PRACTICAL NOW]
- Making ChatGPT Free the always-on host.
- Treating a free cloud GPU as a permanent compute server.
- Running flagship Kimi K3 locally without suitable high-end accelerator hardware.
- Giving a general-purpose AI unrestricted Windows administrator authority.

## Gemini Computer Use loop

The smallest viable architecture is:

`Task -> Gemini Computer Use -> action JSON -> Windows executor -> screenshot -> Gemini -> ... -> verification`

Gemini does **not** directly control the user's Windows machine. Google's documentation explicitly requires the developer to implement the client-side execution environment that receives and executes the generated UI actions. Gemini 3.x Computer Use supports browser, mobile and desktop environments and returns actions such as clicks and keyboard input; safety policies and optional screenshot prompt-injection detection are available.

The Windows executor should be a small local service, not a huge application. It should:
- capture the screen;
- send the screenshot and current task/state to Gemini;
- validate the returned action against an allowlist;
- execute only approved actions through UI Automation/pyautogui/Power Automate/UFO;
- capture a new screenshot;
- return the result and provenance;
- stop on authentication, payment, destructive file operation, privilege escalation, or ambiguous state.

For web-only tasks, bypass Gemini Computer Use whenever possible and use Playwright directly. This is cheaper, more deterministic and easier to test.

## Windows executor design

`Nouran Manager`
-> `Policy / Reality Gate`
-> `Task Router`
-> one executor:
   - Direct API
   - Playwright
   - UI Automation
   - UFO
   - Gemini Computer Use
   - ChatGPT/Codex adapter
   - n8n workflow

Every action produces:
`taskId, executor, timestamp, input fingerprint, action, result, screenshot/hash if applicable, evidenceClass, failureCode`

Default permissions:
- read-only first;
- workspace-scoped writes second;
- no arbitrary shell by default;
- no credentials extraction;
- no payment/account creation/publishing without explicit approval;
- no persistence mechanism that hides itself from the user.

## Android role

Android is the **control and observation surface**:
- status dashboard;
- approve/reject risky actions;
- send tasks;
- receive WhatsApp alerts;
- inspect logs and screenshots;
- optionally act as an ADB-controlled device agent in a later phase.

Windows remains the primary host for Nouran Studio local files, Docker, n8n, LM Studio and desktop automation.

## Context-length solution

Never put the entire project history into the model context.

Use:
1. append-only event log;
2. causal state snapshots;
3. compact capability registry;
4. bounded working set selected for the current task;
5. source/provenance pointers;
6. periodic integrity hashes;
7. model-independent portable state;
8. delayed-relevance tests after compression;
9. recovery from GitHub/external durable storage.

This means changing models does not require rebuilding the whole project context.

## Phase plan

### Phase 0 — Current
Free ChatGPT + Codex Desktop + GitHub + existing Nouran core. Keep ChatGPT as an interface, not a dependency.

### Phase 1 — Local Nouran
Run a small local gateway on Windows, connect LM Studio, load the portable core, expose a localhost API and log all operations.

### Phase 2 — Windows control
Install one deterministic executor first (UI Automation/pywinauto). Add UFO only after the deterministic bridge works. Add Gemini Computer Use as a model adapter after API access is verified.

### Phase 3 — Browser Agent
Install Playwright and route web tasks through it before using screenshot-driven GUI control.

### Phase 4 — Android Remote
Expose a secure authenticated control API/tunnel. Android sends commands/status; Windows executes. Add ADB/mobile agent only when mobile-device automation is needed.

### Phase 5 — WhatsApp
Rotate old credentials. Create a minimal notification/approval workflow. No public repo secrets.

### Phase 6 — Autonomous workflows
Use n8n schedules/webhooks and the local gateway. Every autonomous run has a bounded task, budget, timeout, retry policy, audit record and kill switch.

### Phase 7 — Multi-agent studio
Only after measured bottlenecks justify it. Start with Manager + Researcher + Builder + Tester + Auditor. Do not create a swarm for its own sake.

## Cost policy

Default: zero recurring cost.

Use free tiers only as opportunistic accelerators. The durable source of truth is local/Git-based state. A provider can disappear without destroying Nouran.

Paid usage is allowed only after:
1. free route is tested;
2. paid route has a measured benefit;
3. cost ceiling is explicit;
4. user approves.

## Final decision

**Best architecture: I — hybrid local-first.**

ChatGPT/Codex remains useful but is demoted from "brain/host" to one of several model/tool adapters. LM Studio and deterministic local executors provide the private base. n8n provides orchestration. Playwright handles browsers. Gemini Computer Use is the leading external computer-use model adapter because its current API explicitly supports desktop/browser/mobile environments and requires only a small client-side executor. Microsoft UFO is the leading open-source Windows-agent candidate for local GUI control. Android becomes the remote control surface.

## First implementation

Do not rebuild Nouran Studio. Implement exactly one new bridge:

`Windows Nouran Gateway -> LM Studio -> Playwright/UI Automation -> existing portable core`

First test: read-only health check and screenshot metadata, followed by one harmless browser task. Then add Gemini as a swappable planner.

This gives the project a real local execution spine without waiting for ChatGPT subscription access.

## Evidence boundary

Documented platform capabilities are external evidence about those platforms. They are not automatically Nouran capabilities. Nouran capability is promoted only after actual execution produces inspectable evidence. No part of this architecture is evidence of consciousness, subjective experience, genuine desire, or unrestricted autonomy.
