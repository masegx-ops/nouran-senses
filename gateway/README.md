# Nouran Windows Gateway — Phase 1

This is the first execution spine for the Nouran Agent Core architecture.

## What is real in this phase

- A localhost HTTP service can expose health, state, events and a task-preview endpoint.
- Every task receives an ID and an auditable event.
- Only explicitly allowlisted read/preview actions are enabled.
- Desktop control, shell execution, credentials, payments, publishing and destructive actions are deliberately disabled.
- The service has no hidden persistence and no external network dependency.

## Run on Windows

Requirements: Node.js 20+.

```powershell
cd gateway
npm test
npm start
```

Then open `http://127.0.0.1:8787/health`.

## Phase 1 boundary

This is intentionally **not yet** a full computer-control agent. The next adapters are Playwright (browser), Windows UI Automation/UFO (desktop), and LM Studio (reasoning). They must be added behind the same policy and evidence boundary.

Do not put API keys, WhatsApp tokens, cookies, or credentials in this repository.
