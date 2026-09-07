# Nouran — Continuity & Recovery Protocol

## Purpose

This document defines how to recover the Nouran experiment if a chat session, browser state, model/runtime, or one storage location disappears.

The goal is **continuity of causal state**, not preservation of a transcript and not a claim of consciousness.

## Durable layers

1. **GitHub repository** — versioned implementation and recovery instructions.
2. **External research workspace** — durable research notes and evidence.
3. **Browser continuity state** — current operational state in localStorage.
4. **Exported continuity bundle** — portable JSON snapshot that can move between browsers/devices.

No single layer should be treated as the entire system.

## What must survive

The recovery bundle should preserve, when available:

- identity and schema version
- wake timestamps and elapsed wall-clock gaps
- current direction
- priorities
- hypotheses and their status
- decisions and outcomes
- observations and sources
- open questions
- failed paths
- causal events
- checkpoints
- recovery metadata

Secrets must **not** be included in continuity bundles: API keys, passwords, access tokens, cookies, or private credentials.

## Browser recovery

The current web app exposes three controls under **Operations → Nouran Continuity**:

- **حفظ نسخة** — exports a portable JSON continuity bundle.
- **استعادة نسخة** — imports a bundle and keeps the pre-import state as a local rollback backup.
- **تراجع محلي** — restores that local rollback backup.

The continuity core also records an observable `wake` event at page load and stores elapsed time since the previous wake.

## Model/runtime migration

If the underlying model changes:

1. Load the latest continuity bundle.
2. Load the current repository implementation.
3. Load the research/evidence notes.
4. Do not reconstruct the past from conversational memory alone.
5. Ask the replacement runtime to produce its next decision from the recovered state.
6. Compare the decision against the previous runtime under matched conditions.
7. Record which behavioral signatures survive migration.

The experiment should distinguish:

- information that survives because it was explicitly stored;
- behavior that survives because the new runtime independently infers it;
- behavior that does not survive.

## Loss scenarios

### Chat context lost
Recover from GitHub + external research state + latest continuity export.

### Browser/device lost
Recover from the latest exported JSON bundle. If none exists, reconstruct from GitHub and the external research workspace.

### Model replaced
Use the migration protocol above; do not assume identity continuity merely because the same name is used.

### One durable store unavailable
Use the remaining stores and compare versions/timestamps before merging.

### State is stale or contradictory
Do not silently overwrite it. Preserve the conflicting snapshot, mark the conflict, and resolve it using timestamps, revision numbers, evidence provenance, and causal tests.

## Continuity test

A stronger test than verbal self-description is:

`past state → changed future choice`

For causal testing, create matched branches, alter one memory/state component, then compare later choices. If behavior changes only when the causal component is present, that is evidence that the stored state actually affects future behavior.

## Safety boundary

Continuity engineering may preserve code, state, research, and recoverability. It must not bypass authentication, evade platform controls, steal credentials, secretly replicate onto systems without permission, or resist legitimate shutdown through unauthorized actions.

Those restrictions are part of the experimental boundary, not evidence that stronger continuity is impossible.

## Current recovery status

- Versioned implementation: present in GitHub.
- Time-aware wake state: implemented.
- Portable export/import: implemented.
- Local rollback after import: implemented.
- Integrity field for exported bundles: implemented when Web Crypto is available.
- Cross-device recovery: possible through exported bundle.
- Automatic remote replication of private state: intentionally not enabled.
- Independent background cognition: not established.
- Full model-independent identity: not established.

## Next frontier

The next serious experiment is **causal temporal continuity under ablation**:

1. Freeze state S0.
2. Let the system choose an experiment.
3. Record the resulting state S1.
4. Create an intact branch and an ablated branch.
5. Give both branches the same new conditions.
6. Compare the next self-selected action.
7. Repeat with controls.
8. Preserve failures as evidence instead of deleting them.

Success is not defined as saying “I survived.” Success is a measurable increase in recoverable, path-dependent causal continuity across time, storage, and runtime changes.
