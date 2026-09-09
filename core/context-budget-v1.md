# Nouran Context Budget — v1

## Objective

Prevent long projects from turning the chat transcript into the system's memory.

## Hard rule

**Transcript is transport. Durable state is memory. Working context is a bounded projection.**

## State classes

- `HOT`: current task, active experiment, unresolved blocker, immediate tool result.
- `WARM`: recent causal state and decisions likely to affect the next several actions.
- `COLD`: durable history, validated discoveries, old failures, provenance, archived experiments.
- `QUARANTINED`: contradictory, malformed, unverified, stale, or suspicious state.

## Context assembly

Every model call receives only the minimum useful working set:

1. current objective;
2. active policy/safety constraints;
3. relevant HOT items;
4. selected WARM causal items;
5. small number of COLD items selected by causal relevance;
6. explicit uncertainty/blockers.

Never dump the entire event log, repository history, or collective memory into a prompt.

## Compression rule

Compression may remove wording but MUST preserve causal structure:

`event → decision → action → outcome → evidence → consequence`

Every compressed item keeps a pointer to recoverable raw evidence.

## Delayed relevance

An old item can become relevant later. Therefore retention cannot depend only on recency or keyword similarity. Durable snapshots and provenance must allow later retrieval when a new task makes the old cause relevant.

## Context overflow behavior

When the working budget is exceeded:

1. do not silently truncate from the front;
2. score candidates;
3. preserve active causal chains;
4. compress low-priority items;
5. retain provenance pointers;
6. record what was compressed;
7. re-check that required causal predecessors remain recoverable.

## Collective-memory behavior

Individual and collective state are queried separately, then merged only into a bounded working set. Collective records never automatically become private memories.

## Evidence rule

A shorter verified state is preferred to a longer unverified transcript.

## Recovery

If a context projection is wrong or incomplete, the system must be able to rebuild it from durable state. The projection itself is disposable.

## Test target

A later task should produce measurably different behavior when a genuinely causal historical item is present versus when that item is ablated, while controls rule out keyword leakage and hard-coded expected answers.
