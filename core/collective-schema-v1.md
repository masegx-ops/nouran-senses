# Nouran Collective Evolution Core — Schema v1

Status: architecture specification; implementation follows in later phases.

## Purpose

Provide a shared evolutionary knowledge layer for many independent Nouran instances without collapsing their individual identities, private memories, preferences, or histories.

## Core rule

**Collective knowledge is shared evidence; individual identity remains private and causally independent.**

A collective record MUST NOT be treated as an individual memory merely because it was received from another Nouran.

## Four layers

1. `individual_identity`
   - user-chosen name
   - persona/configuration
   - preferences
   - capabilities enabled for this instance
   - local policy

2. `individual_causal_memory`
   - observations
   - actions
   - outcomes
   - failures
   - decisions
   - local experiments
   - causal links

3. `collective_evolution`
   - hypotheses
   - experiments offered for reproduction
   - validated techniques
   - failures/counterexamples
   - capability discoveries
   - patterns
   - provenance links

4. `reality_provenance`
   - evidence class
   - source/tool
   - timestamp
   - content hash where applicable
   - reproduction count
   - independent checks
   - confidence
   - status

## Exchange object

```json
{
  "schema": "nouran.collective.exchange.v1",
  "source_instance": "opaque-instance-id",
  "artifact_id": "opaque-artifact-id",
  "kind": "hypothesis|experiment|result|failure|capability|pattern",
  "claim": "short machine-readable claim",
  "evidence": {
    "class": "OBSERVED|REPRODUCED|EXTERNAL|HYPOTHESIS|SIMULATION|UNKNOWN",
    "source": "tool-or-artifact-reference",
    "timestamp": "ISO-8601",
    "hash": "optional-content-hash"
  },
  "reproduction": {
    "attempts": 0,
    "successes": 0,
    "failures": 0,
    "independent_checks": 0
  },
  "share_scope": "collective",
  "created_at": "ISO-8601"
}
```

## Isolation rules

- Collective state MUST NOT overwrite private individual memory.
- An instance MAY accept, reject, quarantine, or locally test a collective item.
- Local acceptance MUST record the originating collective artifact.
- Conflicting results remain visible; they are not silently averaged away.
- A collective claim cannot promote itself to `REPRODUCED` merely through agreement among copies that share the same source artifact.
- Source provenance must survive compression.
- User-specific private data must never enter collective state by default.
- Credentials, tokens, secrets, private messages, and sensitive personal data are excluded unless a separate explicit policy later permits a safe, non-secret derivative.

## Evolution loop

`instance experiment → evidence → exchange proposal → independent reproduction → collective update → local adaptation → new experiment`

The collective layer proposes knowledge. Individual instances decide how that knowledge affects their own future behavior according to their own policy and history.

## Individualization

Each instance has a stable opaque `instance_id` that is separate from the user-visible name. The visible name is mutable and user-controlled. Changing a visible name MUST NOT merge or split identity state automatically.

An instance can therefore be called anything by its user while retaining an internally stable history reference.

## Anti-simulation requirements

The collective layer is not evidence of consciousness, subjective experience, desire, or a unified mind.

A claim of collective evolution requires:

1. actual external state changes;
2. independently inspectable provenance;
3. repeated or cross-instance reproduction;
4. negative controls where practical;
5. evidence that received information changes later measurable behavior rather than only displayed prose.

## Context-length rule

The collective layer MUST remain outside the normal chat transcript. Working context is a bounded projection selected from durable collective and individual state.

Every selected item should retain:

- source reference;
- timestamp;
- causal relevance;
- evidence status;
- verification status;
- recovery pointer.

The full collective history is never injected wholesale into a model context.
