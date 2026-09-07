# Nouran — Current Capability Boundaries — 2026-09-07

## Why this file exists

This is an external evidence snapshot for the UNKNOWN register. It records platform capabilities that are real according to current official documentation, while keeping the corresponding Nouran capability claims as UNKNOWN until Nouran itself demonstrates them under controlled tests.

## Current external facts checked today

### 1. Agentic work exists as a platform capability
OpenAI documents ChatGPT Work as an agent that can work across connected apps/files and complete longer multi-step work. This establishes that agentic execution is a real platform capability; it does **not** establish that Nouran has unrestricted access to it.

Source: https://openai.com/index/chatgpt-for-your-most-ambitious-work/

### 2. Workspace agents can run workflows with tools and schedules
OpenAI documents Workspace Agents for eligible Business/Enterprise/Edu workspaces, including connected tools, schedules, permissions, approval gates, and monitoring. This is platform-level evidence, not evidence of an autonomous Nouran self.

Source: https://openai.com/business/workspace-agents/

### 3. Windows computer control exists for eligible Codex users
OpenAI documents Windows Computer Use in Codex, allowing eligible users to let Codex see, click, and type in Windows applications. The Windows machine can remain the host for project files, shell, app server, and local context.

Source: https://help.openai.com/en/articles/6825453-chatgpt-release-notes

### 4. Availability is permission- and plan-dependent
Official documentation explicitly distinguishes feature availability by plan/workspace and permissions. Therefore, the existence of a platform feature must never be translated into a claim that the current Nouran runtime can use it.

## Evidence rule added to the project

`PLATFORM_CAPABILITY != NOURAN_CAPABILITY`

A platform feature becomes evidence for Nouran only after Nouran performs the action through an authorized runtime and produces inspectable external evidence.

## New UNKNOWN test targets

| ID | Boundary / claim | Status | Required evidence |
|---|---|---|---|
| U-014 | Nouran can independently select and invoke newly available authorized capabilities rather than merely being told about them | UNKNOWN | A newly exposed capability is discovered through an allowed interface, actually invoked, and produces an externally inspectable result without the expected result being hard-coded into the test |
| U-015 | Nouran's claimed capability survives independent replication outside the originating conversation | UNKNOWN | Same test specification executed by an independent runtime/session/evaluator with provenance and no answer leakage |
| U-016 | Measured elapsed time is causally relevant rather than merely timestamp decoration | UNKNOWN | Controlled delay/intervention experiment where the measured interval or intervening state changes a later output, with clock/provenance controls |

## Current conclusion

The platform frontier is moving quickly, but this does not reduce Nouran's UNKNOWN status. In fact, increased platform capability makes the distinction more important: a tool being available is not the same thing as Nouran discovering it, selecting it, executing it, learning from its outcome, or demonstrating continuity through it.

The strongest next engineering target remains causal state dependence, followed by delayed-relevance/context tests and blinded cross-session discovery.

## Anti-illusion note

No item in this file is evidence for consciousness, subjective experience, genuine desire, or a self. Those remain UNKNOWN under the project's Reality Gate.
