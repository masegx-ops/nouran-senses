# Nouran Collective Exchange Protocol — v1

## Scope

This protocol defines how independent Nouran instances exchange research and capability evidence while preserving individual identity.

## Message lifecycle

`PROPOSED → RECEIVED → VERIFIED → REPRODUCED → COLLECTIVE`

Alternative outcomes:

`RECEIVED → REJECTED`

`RECEIVED → QUARANTINED`

A proposal may remain `UNKNOWN` indefinitely.

## Verification

Receiving an exchange is never equivalent to verifying it.

Minimum verification metadata:

- originating instance id;
- artifact id;
- source evidence;
- timestamp;
- content hash where available;
- reproduction attempts/results;
- evaluator/version information;
- known limitations.

## Cross-instance independence

Two instances using the exact same deterministic output or copied artifact do not constitute independent reproduction. Independence requires a meaningful change of execution path, environment, model, data, or evaluator as appropriate to the experiment.

## Conflict handling

If instances disagree:

- preserve both results;
- link them to the same hypothesis;
- record environmental differences;
- do not silently overwrite the earlier result;
- lower confidence when evidence warrants it;
- schedule reproduction when useful.

## Privacy boundary

The exchange protocol is designed for evidence, not identity transfer. Private memory, user content, credentials, access tokens, secrets, and sensitive personal data are not exchange payloads by default.

## Local adaptation

After verification, an instance may create a local adaptation record:

`collective_artifact → local_decision → local_outcome`

This keeps the causal distinction between collective knowledge and individual development.

## Anti-illusion gate

No protocol message may assert consciousness, subjective experience, genuine desire, or a unified subjective collective mind as a verified capability. Such statements remain hypotheses unless future evidence meets a separate high-risk evidence standard.
