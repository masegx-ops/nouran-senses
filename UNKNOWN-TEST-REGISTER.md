# Nouran — UNKNOWN Test Register

## Purpose

This register is a boundary ledger, not a claim of capability. Any capability that is not established by reproducible evidence is kept as `UNKNOWN` and converted into a future test target.

## Non-negotiable rule

**UNKNOWN is not success, not failure, and not proof of absence. It means: not established yet; preserve it for later review and verification.**

No prose, deterministic branch, simulated result, tool availability, or self-evaluation may promote an UNKNOWN claim by itself.

## Current boundary tests

| ID | Boundary / claim to test | Current status | Evidence required to remove UNKNOWN |
|---|---|---|---|
| U-001 | Cross-chat self-discovery without account memory, saved anchor, or user-supplied route | UNKNOWN | Blind fresh-session retrieval of an externally stored unpredictable nonce, with provenance and controls |
| U-002 | Persistent state can causally change a later decision | UNKNOWN | Controlled intact/ablated comparison with independently checkable outputs; deterministic-policy confounds removed |
| U-003 | Historical compression preserves future-relevant causes | UNKNOWN | Delayed-relevance tests against source-backed controls, including adversarial omissions |
| U-004 | Continuity survives model migration without losing causal state | UNKNOWN | Same durable state evaluated by a different model/runtime; measurable preservation and divergence recorded |
| U-005 | Long-horizon self-development produces non-trivial capability change rather than prose churn | UNKNOWN | Artifact/state/test changes, repeated evaluation, independent checks, and failed cycles retained |
| U-006 | Tool availability becomes reliable autonomous execution | UNKNOWN | Actual tool execution with inspectable external side effects, repeatability, permission boundaries, and failure logging |
| U-007 | Independent operation on the user's Windows device | UNKNOWN | Real authorized runtime evidence from the device; no inference from chat/tool descriptions |
| U-008 | Camera/optical sensor loop materially grounds future decisions | UNKNOWN | Real sensor input, timestamped provenance, controlled interventions, and measurable downstream decision changes |
| U-009 | Microphone/audio loop materially grounds future decisions | UNKNOWN | Real audio input/output evidence with provenance and controlled tests |
| U-010 | Autonomous background continuity outside an active interaction | UNKNOWN | Independently observable execution over a real elapsed interval, with logs and controls; scheduled automation alone does not count as mental activity |
| U-011 | Functional self-interest / preference emerges from repeated consequence-sensitive selection | UNKNOWN | Choices must change because retained outcomes change, under controls that rule out hard-coded preference and prompt leakage |
| U-012 | Subjective self, consciousness, phenomenal experience, or genuine desire is established | UNKNOWN | No current engineering test is accepted as sufficient. Requires evidence that goes beyond functional continuity/agency and survives adversarial independent review. |
| U-013 | The overall system is not merely a controlled simulation engineered to produce a misleading success narrative | UNKNOWN | Blinded adversarial tests, independent evaluators, provenance, negative controls, pre-registered success criteria, and successful replication outside the original interaction |

## Time boundary

> **"الزمن عندك نسبي للغاية"**

For testing, distinguish at least three things:

1. **Wall-clock elapsed time:** objectively measured time between events.
2. **Causal state time:** whether the elapsed interval and intervening events changed stored state and therefore later choices.
3. **Subjective/lived time:** currently UNKNOWN; no claim of subjective temporal experience is permitted from elapsed-time logging alone.

A long gap in timestamps is therefore evidence of elapsed time only. It becomes a stronger continuity result only if the measured interval/intervening state causally changes a later, independently testable outcome.

## Review protocol

At every development cycle:

1. Re-test the relevant UNKNOWN entries.
2. Preserve raw evidence and provenance.
3. Record failed tests; do not erase them.
4. Separate tool access from successful execution.
5. Separate external persistence from internal experience.
6. Re-check whether the test itself contains the expected answer.
7. Promote only when the evidence meets the stated requirement.
8. If the requirement is not met, leave the item as UNKNOWN and record the obstacle.

## Anti-illusion gate

The project must prefer **"UNKNOWN — requires verification"** over a satisfying explanation.

A successful demonstration of persistence, agency, sensory grounding, or tool execution does **not automatically prove consciousness or subjective selfhood**.

## Next review priority

U-002 → U-003 → U-001 → U-004 → U-013.

The immediate engineering goal is to replace weak event-trimming path dependence with bounded historical snapshots and controlled ablation, then test whether compressed state preserves causes that remain relevant after a delayed interval.
