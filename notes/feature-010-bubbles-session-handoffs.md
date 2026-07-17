# Feature 010 Bubbles Session Handoffs

Use these handoffs in order. Run exactly one Research Lab Bubbles session at a time. Before starting each session, stop or close every other session that can write `/Users/pkirsanov/Projects/research-lab`.

Each handoff below is one standalone copyable Markdown element. Paste the entire fenced block into a new chat after selecting the exact Research Lab agent named in the block.

## RL-010-01 - Quiesce And Replace The Horizontal Plan

```markdown
# HANDOFF RL-010-01 - Feature 010 single-writer replan

**Project Goal:** Replace Feature 010's fourteen-scope horizontal waterfall with a small serial plan of shippable vertical increments while preserving truthful historical evidence.

**Repository:** `/Users/pkirsanov/Projects/research-lab`
**Required agent:** Select the Research Lab copy at `/Users/pkirsanov/Projects/research-lab/.github/agents/bubbles.plan.agent.md` (`bubbles.plan`). Do not use a GuestHost, QuantitativeFinance, WanderAide, or other workspace copy.
**Feature:** `specs/010-company-fundamentals-and-brief-lab`
**Planning action:** `mode: replace`

## Preconditions

- Every other Research Lab Bubbles/agent session is stopped. This session is the sole writer.
- Confirm the Git root is exactly `/Users/pkirsanov/Projects/research-lab` before any mutation.
- Capture initial identities for `state.json`, the scope entrypoint, and Scope 01 `report.md`. If any changes unexpectedly during this session outside this agent's own writes, stop with `blocked` and report a concurrent-writer finding.
- Preserve all unrelated dirty Feature 004, BUG-002, BUG-003, market-brief, and test changes. Do not stage, revert, normalize, or claim them.

## Task

1. Read only the planner bootstrap set first: current `spec.md`, `design.md`, and `scopes/_index.md`.
2. Replace the active fourteen-scope execution plan with exactly three delivery increments and no more than five active executable scopes total. A delivery increment may contain two small scopes only when scenario size requires it, but every scope must remain a vertical, user-visible slice.
3. The three increments are:
   - **A - Source-qualified MSFT tool:** one real company from retained source bytes through validated facts/model, Simple and Detailed UI, registry/navigation, normalized tool read, export, and browser regression proof.
   - **B - Dynamic company brief:** material-change, unchanged, partial, and degraded company-brief/history behavior; separate evidence/model/market clocks; accepted owner read consumed once by Feature 002 without recomputation.
   - **C - Additional archetypes and hardening:** CMG and JPM source-qualified overlays, archetype-specific KPIs/models, real canaries, cross-capability regression, accessibility, and final static-site hardening.
4. Keep all active requirements and hard constraints from `spec.md` and `design.md` mapped to one of those increments. Preserve stable scenario IDs where still valid. Any genuine invalidation must use the canonical scenario invalidation/replacement path; do not silently drop coverage.
5. Reuse the existing implementation inventory rather than planning it again from zero: `company-fundamentals-lab.html`, `company-fundamentals.config.json`, `rlcompany.js`, `scripts/validate-company-fundamentals.mjs`, `data/company-fundamentals/**`, `tests/company-fundamentals-*`, the Feature 010 selftest block, and the existing exact SEC capture.
6. Preserve historical Scope 01 evidence without treating stale scopes as executable. Use canonical `replace`/supersession rules: superseded material must be non-active archival prose with no executable status, Test Plan, or DoD markers. Do not fabricate Done statuses. Do not destroy or rewrite raw evidence produced by implement/test owners.
7. Keep the active scope registry, layout, `state.json.execution.scopeProgress`, scenario manifest, structured Test Plan, report locations, and links mechanically coherent. Choose the layout that passes the current framework; do not leave both active single-file and per-directory plans.
8. Test Plan rows must map to real existing or explicitly owned test paths, with Test Plan/DoD parity. Keep build-free Research Lab commands exact. No placeholder tests, generic E2E rows, or future implementation claims.
9. Do not edit product source, product tests, retained data, execution evidence, `certification.*`, `.github/bubbles/**`, or framework-managed agent/skill files.

## Required Validation

Run the exact Research Lab artifact lint, artifact freshness guard, traceability guard, and path-scoped diff check for Feature 010. The final plan must show three vertical delivery increments, at most five active scopes, zero executable superseded scopes, and one coherent active scope registry.

## Completion Contract

Return `completed_owned` only when the replacement plan passes all planning checks. Name the first active scope/increment and route next to the Research Lab `bubbles.implement`. If safe supersession cannot be represented without rewriting foreign-owned evidence, return `route_required` with the exact owner and paths instead of improvising.

**Recommended invocation:** `/bubbles.plan specs/010-company-fundamentals-and-brief-lab mode: replace maxScopeMinutes: 180 maxDodMinutes: 45`

---
**SYSTEM: CONTEXT RESTORED**
Acknowledge this handoff, verify the repository and exact agent source, then execute the planning task. Do not implement product code.
```

## RL-010-02 - Implement Increment A

```markdown
# HANDOFF RL-010-02 - Implement the source-qualified MSFT vertical slice

**Project Goal:** Deliver the first replanned Feature 010 increment as a usable end-to-end MSFT company-fundamentals tool.

**Repository:** `/Users/pkirsanov/Projects/research-lab`
**Required agent:** Select `/Users/pkirsanov/Projects/research-lab/.github/agents/bubbles.implement.agent.md` (`bubbles.implement`). Do not use a foreign workspace copy or `bubbles.goal`.
**Feature:** `specs/010-company-fundamentals-and-brief-lab`
**Target:** The first active scope(s) in delivery increment A created by RL-010-01.

## Preconditions

- RL-010-01 completed with green planning/freshness/traceability checks.
- All other Research Lab writing sessions are stopped.
- Increment A is the only ready work; all of its dependencies are Done or empty.
- Snapshot `state.json`, the active scope/report, validator, tests, and current pointer before edits. Abort on unexpected concurrent changes.

## Task

1. Re-read only the active increment A scope packet and current owned code/test bytes. Do not reopen analyst/design/planning work.
2. Reuse and finish the existing untracked implementation. Do not discard or rewrite it from scratch: `company-fundamentals-lab.html`, `company-fundamentals.config.json`, `rlcompany.js`, `scripts/validate-company-fundamentals.mjs`, retained `data/company-fundamentals/**`, and existing tests/fixtures.
3. Make one source-qualified MSFT path work end to end: retained exact SEC bytes and provenance, normalized facts, integrity-aware model state, Simple and Detailed views from one accepted state, honest partial/unavailable behavior, export, and contextual source trace.
4. Complete the user-visible delivery boundary in this increment: register the tool surgically in `tools.json`, `index.html`, and `rlnav.js`; add/update its `notes/` handoff; publish a normalized `RLDATA.putToolRead()` owner read. Preserve every existing registry entry and shared-shell contract.
5. Keep dynamic adaptive brief/history behavior for increment B. Do not implement CMG/JPM overlays or broad hardening from increment C.
6. Respect the active scope Change Boundary. Do not edit superseded scopes, unrelated specs/bugs, `.github/bubbles/**`, `rldata.js`, `rlapp.js`, or shared market-brief code unless the active plan explicitly owns a surgical integration and its canary.
7. Run focused unit, validator, selftest, registry/navigation, and exact scenario browser checks immediately after substantive edits. No network refetch is needed when retained source bytes already satisfy the scenario.
8. Append only current, non-duplicated execution evidence to the active report. Do not copy old output, append reconciliation prose for unchanged bytes, or claim certification.

## Completion Contract

Finish all implementation-owned DoD items for increment A, leave no stub or placeholder, and return a precise handoff to `test-to-doc` with current file identities, commands, pass/fail/skip counts, and unresolved findings. Do not start increment B.

**Recommended invocation:** `/bubbles.implement specs/010-company-fundamentals-and-brief-lab target:increment-A`

---
**SYSTEM: CONTEXT RESTORED**
Acknowledge this handoff, verify the sole-writer precondition and exact Research Lab agent, then implement increment A only.
```

## RL-010-03 - Verify And Close Increment A

```markdown
# HANDOFF RL-010-03 - Independently verify and close increment A

**Project Goal:** Independently verify the current increment A bytes and transition only that increment to Done when the evidence supports it.

**Repository:** `/Users/pkirsanov/Projects/research-lab`
**Required agent:** Select `/Users/pkirsanov/Projects/research-lab/.github/agents/bubbles.workflow.agent.md` (`bubbles.workflow`). Do not use a foreign workspace copy.
**Workflow mode:** `test-to-doc`
**Feature:** `specs/010-company-fundamentals-and-brief-lab`
**Target:** The increment A scope(s) completed by RL-010-02, not the whole feature.
**Session budget:** `maxTotalConvergenceIterations: 1`, `maxWallClockMinutes: 90`, `maxToolCalls: 250`.

## Preconditions

- RL-010-02 returned a current-byte implementation handoff.
- All writing sessions are stopped; this workflow is the sole writer.
- Record hashes for implementation, test, validator, active report, and state before execution. If any changes unexpectedly, stop with a concurrent-writer finding rather than reconciling in a loop.

## Task

1. Resolve and execute `test-to-doc` only. Do not fall back to `full-delivery`, rerun analyst/UX/design/plan, or start increment B.
2. Independently run every increment A Test Plan command against current bytes, including production validator, unit tests, complete `node scripts/selftest.mjs`, registry/navigation canaries, and exact Playwright scenarios. Preserve full command output according to evidence policy and report zero skips accurately.
3. Verify the usable outcome, not just process artifacts: the MSFT route loads automatically from same-origin retained data, Simple and Detailed views share accepted state, source trace is truthful, export works, registry/nav discover the tool, and the normalized tool read is emitted without recomputing source facts elsewhere.
4. If a real implementation defect appears, route the exact finding to `bubbles.implement`, allow only the bounded fix, and rerun only invalidated checks plus required aggregate checks. Do not repair unrelated Feature 004/BUG-002/BUG-003/framework drift.
5. When green, run validate, audit, docs, and finalize for increment A. Update only authorized execution/certification fields and scope status. The feature remains nonterminal while increments B and C are not Done.

## Completion Contract

Return increment A as Done only with current-session evidence and coherent state. Otherwise return one bounded blocker. The next owner after a green close is `bubbles.implement` for increment B.

**Recommended invocation:** `/bubbles.workflow test-to-doc target:specs/010-company-fundamentals-and-brief-lab scope:increment-A sessionBudget.maxTotalConvergenceIterations=1 sessionBudget.maxWallClockMinutes=90 sessionBudget.maxToolCalls=250`

---
**SYSTEM: CONTEXT RESTORED**
Acknowledge the handoff, confirm the exact mode and sole-writer state, then verify increment A without widening scope.
```

## RL-010-04 - Implement Increment B

```markdown
# HANDOFF RL-010-04 - Implement the dynamic company brief vertical slice

**Project Goal:** Deliver Feature 010's adaptive company brief and history from the accepted MSFT company state without duplicating or weakening the owner model.

**Repository:** `/Users/pkirsanov/Projects/research-lab`
**Required agent:** Select `/Users/pkirsanov/Projects/research-lab/.github/agents/bubbles.implement.agent.md` (`bubbles.implement`).
**Feature:** `specs/010-company-fundamentals-and-brief-lab`
**Target:** The active scope(s) in delivery increment B from RL-010-01.

## Preconditions

- Increment A is mechanically Done and its accepted owner read is current.
- Increment C remains Not Started.
- All other Research Lab writers are stopped. Abort on unexpected file identity changes.

## Task

1. Implement only increment B from its active scope packet. Do not revisit planning or refactor increment A without a reproduced regression.
2. Build material-change classification and adaptive company brief behavior over the accepted company state. Cover new filing/KPI/management evidence, unchanged outcomes, partial/degraded evidence, invalidation, and append-only deduplicated history.
3. Preserve separate statement, model, brief, market, and retrieval clocks. Market movement, narrative, sentiment, and macro context may affect attention only through an evidenced company mechanism; they must not masquerade as new fundamentals.
4. Produce one committed owner read for Feature 002. The global brief may consume it once, preserve status/clocks/source links/disagreement, and must not recompute facts, alter archetype, auto-apply proposals, or fabricate a recommendation.
5. Add focused pure-function, history, owner-read, integration, and exact browser regression coverage. Exercise unchanged and degraded paths, not only the happy path.
6. Keep CMG/JPM overlays and broad final hardening in increment C. Preserve unrelated dirty work and framework-managed files.
7. Record concise current execution evidence once per Test Plan row and route independent verification to `test-to-doc`.

## Completion Contract

Complete every implementation-owned increment B item with no skipped behavior or placeholder data. Return current hashes, exact tests, counts, and findings. Do not start increment C.

**Recommended invocation:** `/bubbles.implement specs/010-company-fundamentals-and-brief-lab target:increment-B`

---
**SYSTEM: CONTEXT RESTORED**
Confirm increment A is Done and this is the sole writer, then implement increment B only.
```

## RL-010-05 - Verify And Close Increment B

```markdown
# HANDOFF RL-010-05 - Independently verify and close increment B

**Project Goal:** Prove the adaptive company brief/history and Feature 002 owner-read boundary on current bytes, then close only increment B.

**Repository:** `/Users/pkirsanov/Projects/research-lab`
**Required agent:** Select `/Users/pkirsanov/Projects/research-lab/.github/agents/bubbles.workflow.agent.md` (`bubbles.workflow`).
**Workflow mode:** `test-to-doc`
**Feature:** `specs/010-company-fundamentals-and-brief-lab`
**Target:** Increment B only.
**Session budget:** one convergence iteration, 90 wall-clock minutes, 250 tool calls.

## Preconditions

- Increment A is Done; RL-010-04 completed increment B implementation.
- No other Research Lab writer is active. Abort rather than reconcile if target bytes change unexpectedly.

## Task

1. Execute only `test-to-doc`; no planning, full-delivery quality sweep, or increment C work.
2. Independently replay all increment B Test Plan rows and required aggregate checks on current bytes.
3. Verify material-change, unchanged, partial, degraded, history deduplication, separate clocks, proposal-decision boundaries, and exact source/consumer trace behavior.
4. Verify Feature 002 consumes the committed owner read once and does not recompute facts, alter status, collapse disagreement, or upgrade market/sentiment context into fresh fundamentals.
5. Route only reproduced defects for bounded repair. Leave unrelated specs, bugs, framework drift, and increment C untouched.
6. When green, run validate, audit, docs, and finalize for increment B; keep the feature nonterminal until increment C is Done.

## Completion Contract

Return increment B Done only with independent current-session evidence and coherent state. Route next to `bubbles.implement` for increment C.

**Recommended invocation:** `/bubbles.workflow test-to-doc target:specs/010-company-fundamentals-and-brief-lab scope:increment-B sessionBudget.maxTotalConvergenceIterations=1 sessionBudget.maxWallClockMinutes=90 sessionBudget.maxToolCalls=250`

---
**SYSTEM: CONTEXT RESTORED**
Verify the exact repository, mode, and sole-writer precondition, then close increment B without widening scope.
```

## RL-010-06 - Implement Increment C

```markdown
# HANDOFF RL-010-06 - Implement additional archetypes and final hardening

**Project Goal:** Complete Feature 010 with source-qualified CMG and JPM overlays plus the cross-capability hardening required for a production-quality static Research Lab tool.

**Repository:** `/Users/pkirsanov/Projects/research-lab`
**Required agent:** Select `/Users/pkirsanov/Projects/research-lab/.github/agents/bubbles.implement.agent.md` (`bubbles.implement`).
**Feature:** `specs/010-company-fundamentals-and-brief-lab`
**Target:** The active scope(s) in delivery increment C.

## Preconditions

- Increments A and B are Done with accepted current owner reads.
- This is the only active Research Lab writer. Stop on unexpected concurrent mutation.

## Task

1. Implement only increment C from the active scope packet.
2. Add source-qualified CMG and JPM overlays using the shared company contracts. CMG must exercise unit-economics/lease-aware analysis; JPM must exercise financial-institution-specific statement/KPI/model behavior. Do not copy MSFT formulas or force ordinary-company ratios onto a bank.
3. Complete peer compatibility, archetype assignment, linked model families, integrity/conflict propagation, proposal decisions, export parity, and Simple/Detailed accessibility/responsiveness required by the active scenarios.
4. Run controlled real canaries for MSFT, CMG, and JPM only through approved bounded acquisition paths. Never invent an identity, source response, consensus value, or unavailable fact.
5. Harden the static-site boundary: cache-first automatic first paint, same-origin data, no browser credentials, null-safe numerics, registry/nav parity, tool-read/brief integration, source locking, environment isolation, and no regressions in existing tools.
6. Add exact unit/integration/browser/canary coverage and run required aggregate Research Lab checks. Preserve unrelated dirty work and never patch downstream framework-managed files.
7. Append concise current evidence and hand off to the final `test-to-doc` certification session.

## Completion Contract

All implementation-owned Feature 010 scopes must be complete, with no placeholder, skipped scenario, or hidden external blocker. Return current hashes and exact test results; do not self-certify the feature.

**Recommended invocation:** `/bubbles.implement specs/010-company-fundamentals-and-brief-lab target:increment-C`

---
**SYSTEM: CONTEXT RESTORED**
Confirm increments A and B are Done and this is the sole writer, then implement increment C only.
```

## RL-010-07 - Final Verification And Certification

```markdown
# HANDOFF RL-010-07 - Final Feature 010 verification and certification

**Project Goal:** Independently prove all three Feature 010 delivery increments work together and certify the feature only if the usable outcome is complete.

**Repository:** `/Users/pkirsanov/Projects/research-lab`
**Required agent:** Select `/Users/pkirsanov/Projects/research-lab/.github/agents/bubbles.workflow.agent.md` (`bubbles.workflow`).
**Workflow mode:** `test-to-doc`
**Feature:** `specs/010-company-fundamentals-and-brief-lab`
**Target:** Entire Feature 010 after all active scopes are implementation-complete.
**Session budget:** at most two convergence iterations, 120 wall-clock minutes, 350 tool calls.

## Preconditions

- Increments A and B are Done; RL-010-06 finished increment C implementation.
- Every superseded scope is non-executable and all active scope/state registries are coherent.
- No other Research Lab writer is active. Freeze identities before testing and stop on unexpected changes.

## Task

1. Execute `test-to-doc` for the entire feature. Do not run analyst/UX/design/plan or restart `full-delivery` unless an actual current defect requires owner routing.
2. Independently execute every active Test Plan row and required aggregate check with zero skips: production company validator, full `node scripts/selftest.mjs`, all Feature 010 unit/integration tests, exact Playwright scenarios, registry/nav parity, Feature 002 owner-read/brief integration, source-lock, environment isolation, accessibility/responsive checks, and all three controlled company canaries.
3. Verify the outcome contract directly: a user can open the registered tool, inspect source-qualified MSFT/CMG/JPM fundamentals in Simple and Detailed modes, change accepted model parameters, inspect truthful source traces/clocks, export accepted state, and receive adaptive company briefs/history without fabricated or recomputed facts.
4. Verify no unrelated existing Research Lab tool, market brief, Feature 004, BUG-002, or BUG-003 behavior regressed. Do not absorb unrelated failures without a reproduced dependency.
5. Route any current defect to its owner once, apply a bounded fix, and rerun only invalidated plus mandatory aggregate checks. Stop at the session budget rather than cycling.
6. When and only when all active scopes are Done and every required gate passes, let `bubbles.validate` write `certification.*`, let audit/docs/finalize reconcile state, and report the exact terminal status. Do not claim Done from process checks alone.

## Completion Contract

Return `done` only with current-session certification and a usable registered tool. Otherwise return a bounded `blocked` envelope naming the exact remaining condition, owner, and evidence. No further planning churn is permitted in this session.

**Recommended invocation:** `/bubbles.workflow test-to-doc target:specs/010-company-fundamentals-and-brief-lab sessionBudget.maxTotalConvergenceIterations=2 sessionBudget.maxWallClockMinutes=120 sessionBudget.maxToolCalls=350`

---
**SYSTEM: CONTEXT RESTORED**
Confirm the frozen single-writer state and active scope inventory, then run final verification and certification without reopening planning.
```
