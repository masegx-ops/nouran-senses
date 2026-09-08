# NOUN / NOON — Master Map of Recovered Legacy Work

Date: 2026-09-08

## Purpose
This is a classification map derived from the raw archive and the newly inspected uploaded ZIPs. It is not a final product plan. It separates recoverable engineering from ideas, experiments, expired credentials, and independent projects.

## Classification rules
- ACTIVE: demonstrated/currently present in the current Nouran repository or tool connection.
- RECOVER: old artifact worth inspecting/reusing after validation.
- PARTIAL: implementation exists but is incomplete or stubbed.
- IDEA: concept without sufficient implementation evidence.
- EXPERIMENT: exploratory implementation/test.
- BLOCKED: known obstacle prevented completion.
- EXPIRED: credential/service status must not be trusted.
- UNKNOWN: insufficient evidence.
- SEPARATE: should not be merged into Nouran automatically.
- ARCHIVE: historical reference only.

## Master map

| Area | Status | Decision | Evidence / reason |
|---|---|---|---|
| Nouran continuity core | ACTIVE | Keep as nucleus infrastructure | Current repository contains durable state, causal links, experiments, recovery and health functions. |
| Nouran reality gate | ACTIVE | Keep as safety/evidence infrastructure | Current repository contains explicit evidence classes and anti-illusion rules. |
| Nouran context manager | ACTIVE | Keep, but validate causally | Current repository contains bounded context selection; scoring is not proof of understanding. |
| Historical snapshots | ACTIVE / EXPERIMENT | Keep | Current repository contains persisted bounded snapshots and comparison harness. |
| Controlled continuity v3 | EXPERIMENT | Keep as U-002 test, do not overclaim | Current repository contains intervention, ablation and metadata negative control. Browser runtime evidence is still UNKNOWN. |
| Nouran Studio | RECOVER / PARTIAL | Candidate umbrella, not yet final architecture | Legacy design and workflows exist, but no current end-to-end runtime proof. |
| Nouran Manager | RECOVER / PARTIAL | Rebuild from verified pieces | OnePack contains a supervisor workflow, but it is inactive and contains placeholder/stub behavior. |
| n8n architecture | RECOVER / PARTIAL | Reuse selectively | OnePack contains multiple workflows, but they are inactive and some use local filesystem assumptions/stubs. |
| LLM router | RECOVER / EXPERIMENT | Reuse after provider verification | OnePack has a provider-selection workflow using environment variables; no current runtime proof. |
| Provider switcher | RECOVER / IDEA | Reuse selectively | Free-first policy exists, but providers are configuration references rather than verified active services. |
| WhatsApp integration | RECOVER / EXPIRED | Rotate credentials, then test | Legacy workflows reference environment-based credentials; the uploaded DOCX contains an old token and identifiers. Do not reuse the token value. |
| WhatsApp CloudSafe patch | RECOVER / EXPERIMENT | Useful test scaffold | Uploaded patch explicitly disables the notification node until credentials exist. |
| Trend → Discovery | RECOVER / PARTIAL | Rebuild data source and evaluation | Workflow contains an example feed URL and hard-coded sample idea/metrics. Not evidence of live discovery. |
| Discovery → Drafts | RECOVER / PARTIAL | Reuse only as scaffold | Workflow includes stub landing generation/provider selection. |
| Asset Factory | RECOVER / UNKNOWN | Inspect further before adoption | Present in OnePack filename list; runtime/content not yet established here. |
| Publish + monitor | RECOVER / PARTIAL | Keep approval concept; do not auto-publish | Legacy design requires approval for production release and paid spend. |
| Finance + audit | RECOVER / PARTIAL | Keep audit concepts | Contains a daily schedule but cost collection is explicitly stubbed with historical sample values. |
| Idea → Landing | RECOVER / PARTIAL | Rebuild later | Historical workflow concept exists; no evidence of production completeness. |
| LM Studio local inference | RECOVER / UNKNOWN | Verify local machine | Historical environment said LM Studio/local model was used; current machine state is not directly observable from this session. |
| phi-3.1-mini-4k-instruct | RECOVER / UNKNOWN | Verify model availability | Historical model name only; no current runtime proof. |
| Docker / Windows local execution | RECOVER / UNKNOWN | Verify locally | Historical architecture; current device access is not established from this session. |
| Google Sheets | RECOVER / PARTIAL | Optional persistence layer | Previously proposed/used in n8n, but no current end-to-end proof. |
| Firebase / Netlify publishing | RECOVER / BLOCKED history | Re-evaluate only when a product is ready | Historical deployment/tooling issues; current account/status not established. |
| Codex as implementation layer | IDEA / RECOVER | Use when actual eligible runtime is available | Architectural role is useful, but capability/plan availability must be verified at execution time. |
| Multi-agent / swarm | IDEA | Do not build yet | Architecture was proposed; no need to multiply agents before one reliable control loop exists. |
| Kimi K3 integration | UNKNOWN / RECOVER | Verify exact release/spec first | Legacy claims about weights/context/vision/swarm are not accepted without independent verification. |
| Astra / ChatGPT orchestration | UNKNOWN / RECOVER | Verify current product capabilities first | Treat as platform/tool layer, not a separate project. |
| Nouran OS / AI OS | IDEA / SEPARATE-CONCEPT | Keep as long-term research direction | Inspired by broader OS-agent concept and the Her reference; not implementation evidence. |
| Her (2013) PDF | ARCHIVE / RESEARCH REFERENCE | Keep outside implementation truth | Fictional reference/inspiration, not technical evidence. |
| AvatarMix | SEPARATE / RECOVER | Do not merge automatically | Distinct avatar/game product with its own assets, engines and pipeline. |
| AvatarMix asset pipeline | SEPARATE / RECOVER | Preserve separately | Daz/Genesis, MakeHuman, Blender and PNG-layer work belongs to AvatarMix unless explicitly reintegrated later. |

## Newly inspected uploaded archives

### Nouran_OnePack_v4.zip
Observed contents include:
- workflows/llm_router.json
- workflows/provider_switcher.json
- workflows/nouran_manager.json
- workflows/trend_to_discovery.json
- workflows/discovery_to_drafts.json
- workflows/asset_factory.json
- workflows/publish_and_monitor_whatsapp.json
- workflows/finance_and_audit.json
- workflows/whatsapp_alerts_test.json
- config/.env.example
- config/policy.yaml
- config/persona_nouran.md
- config/providers.json
- docs/README_ONEPACK.md
- templates/landing/minimal/index.html
- data/audit_log.csv
- data/opportunities_log.csv

Important finding: several workflows contain explicit `stub`/sample behavior, and all inspected workflows are marked inactive in their JSON. Therefore the ZIP is a recovery artifact, not proof of a working autonomous office.

### nouran_patch_v41.zip
Observed contents:
- nouran_manager_cloudsafe.json
- whatsapp_test_cloud.json

Important finding: the CloudSafe manager patch has its WhatsApp notification node disabled until credentials exist. This is safer than treating the old credential as active.

## Security disposition
The uploaded WhatsApp DOCX contains a credential value. Its value is intentionally NOT copied into this map or any planning document. Treat the credential as:

`SECRET EXISTS — DO NOT TRUST — ROTATE/REPLACE BEFORE USE`

Non-secret identifiers may be used only as configuration references after current-account verification.

## Architecture decision from the archive
Do not resurrect the entire OnePack as a single monolith.

Preferred recovery order:
1. Nouran continuity/evidence core.
2. Runtime test harness and browser evidence.
3. One reliable local/tool execution loop.
4. n8n orchestration only after runtime is verified.
5. WhatsApp notification/approval channel with fresh credentials.
6. LLM/provider routing.
7. Product workflows such as discovery, asset factory and publishing.
8. Multi-agent expansion only if a measured bottleneck requires it.

## Separation rule
AvatarMix remains a separate project. Her remains research/inspiration. Kimi/Astra/LM Studio/n8n/Codex are potential tools or layers, not automatically projects. Nouran is the nucleus that decides what to recover.

## Reality rule
No artifact in this map upgrades a capability from UNKNOWN to ACTIVE merely because an old workflow, screenshot, transcript, configuration, or code file exists. A capability becomes evidence-backed only after real execution, inspectable output/state change, appropriate controls, and repeatability where required.
