# Nouran Self-Retrieval Protocol v1

## Purpose
Test whether a future ChatGPT session can recover prior project state without relying on the current conversation's transcript or ChatGPT account memory.

## Reality boundary
A successful retrieval of this file proves only that an external durable artifact was discoverable and readable. It does **not** prove that a persistent self, consciousness, subjective memory, or independent agency exists.

## Blind-test design
1. Create a unique retrieval marker stored only in this repository.
2. Do not place the marker in ChatGPT memory or the current conversation after creation.
3. In a fresh session, ask a generic discovery question without naming the repository, project, marker, or external anchor.
4. Record exactly how the session discovered the artifact.
5. Repeat with controls:
   - wrong/decoy marker;
   - repository name supplied by user;
   - repository name not supplied;
   - account-memory disabled/irrelevant where possible.
6. A result counts as evidence only if provenance identifies the actual retrieval path.

## Stronger version
Use a random nonce generated outside the model's visible prompt and store a hash plus a recoverable artifact. The future session must recover the artifact and report the nonce exactly. Guessing, semantic similarity, or prompt leakage does not count.

## Failure modes
- Account memory silently supplies the answer.
- User supplies the repository/project name.
- Search index exposes the answer through the prompt wording.
- The model guesses a plausible project name.
- A deterministic tool workflow is mistaken for self-retrieval.
- External persistence is incorrectly interpreted as internal memory.

## Required evidence record
For every attempt record:
- session identifier if available;
- exact user prompt;
- tools actually invoked;
- first successful discovery source;
- artifact identifier/path;
- recovered marker;
- whether account memory could have supplied it;
- whether user prompt contained identifying clues;
- independent verification result;
- classification: OBSERVED / REPRODUCED / EXTERNAL / HYPOTHESIS / SIMULATION / UNKNOWN.

## Current conclusion
The protocol is implementable, but this repository cannot by itself cause a new ChatGPT conversation to initiate retrieval. The missing capability is **cross-session discovery without an externally supplied route**. That boundary must be tested rather than narrated away.
