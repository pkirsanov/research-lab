# Bubbles Framework Improvement Session Handoffs

These are proposal-first handoffs for the canonical Bubbles source repository. Run them serially. Each session may write exactly one proposal under `/Users/pkirsanov/Projects/bubbles/improvements/` and must not implement framework changes until the owner reviews and explicitly approves that proposal.

Each handoff below is one standalone copyable Markdown element. Paste the entire fenced block into a new chat after selecting the canonical Bubbles agent named in the block.

## Churn Root Cause (read first)

The observed churn is not generic "too much process." It is one specific repeating loop. In Feature 010 the identical five-row test matrix (TP-01-01 through TP-01-05) was independently re-run and re-documented in at least six separate report sections, and the Scope 01 report grew past 2,400 lines and was still growing. The mechanism is a product:

- **Identical-matrix re-verification** - each handoff owner independently re-runs the SAME byte-identical checks instead of citing an existing same-session receipt.
- **times concurrency** - overlapping writers each re-verify and each append their own section.
- **times append-only report** - every re-verification adds a full new block rather than updating one bounded window.
- **times non-terminal handoff** - implement and test ping-pong with no rule that says "identical bytes already independently verified this session is terminal."

That product is N copies of the same evidence. It is distinct from legitimate different-dimension re-execution (chaos, security, gaps on green code), which the framework DELIBERATELY protects via the `baseline_already_green` no-skip rule. Any fix here MUST target only identical-matrix repetition and MUST NOT weaken different-dimension sweeps or genuine one-time independent verification.

## Reuse-Before-Build Mandate (binding on every session below)

Fixing "too much process" with five brand-new subsystems would itself be churn. Before proposing ANY new gate, mode, or subsystem, each session MUST enumerate the existing mechanisms that already target the gap and prove, against source, why each is insufficient. Prefer defaulting or activating an existing mechanism over building a new one. Existing mechanisms to check first:

- `spec-review compact:true|aggressive` (`bubbles.spec-review`) - consolidates report sections, replaces raw evidence blocks with one-line summaries, removes duplicate evidence.
- Certifying-window marker `bubbles:certifying-window-begin` in `artifact-lint.sh` - bounds the current evidence window so a long report need not be rewritten to promote.
- Evidence-by-reference resolver (Gate G009) - DoD items cite a report anchor instead of inlining raw output.
- Context-compaction discipline (Gate G083, `context-compactor.sh`) - bounds orchestrator transition-packet growth.
- Session budgets (Gate G128, `session-cap-guard.sh`) - aggregate convergence/wall-clock/tool-call caps, default null.
- Narrow-repair containment (Gate G038) - fix loops must not stack (maxDepth 1, bounded retries).
- `baseline_already_green` no-skip rule - keeps different-dimension sweeps non-skippable.
- IMP-004 SCOPE-2 parallel-scope shared-state contract and the runtime resource-lease design.
- `bubbles.plan` Phase 4 "Horizontal plan detection" - existing behavioral vertical-slice check.
- `state-transition-guard-perf-selftest` - proves a ~5,000-line report already costs the guard ~126s (report bloat is a known, measured pain).

## Approval Priority (reduce churn with the fewest changes)

1. **BFW-03 (writer lease)** and **BFW-04 (terminal re-verification and evidence bounding)** deliver most of the churn reduction. Approve and implement these first; the owner can stop here and already remove the identical-matrix loop.
2. **BFW-01 (rapid delivery)** and **BFW-02 (vertical-plan enforcement)** reduce work VOLUME and horizontal planning. They are secondary and only help once the repetition loop is closed.
3. **BFW-05 (multi-root binding)** is a correctness fix that prevents wrong-repo edits. It is not a churn fix; keep it independent.

Do not batch all five into one framework change. Each is independently landable, and each must justify its own machinery against the reuse-first mandate above.

## BFW-01 - Risk-Tiered Rapid Delivery Mode

```markdown
# HANDOFF BFW-01 - Propose a bounded rapid-delivery mode

**Project Goal:** Add a risk-tiered Bubbles path that can take a low-risk tool from idea to a validated usable increment without defaulting to the maximum-assurance eighteen-phase loop.

**Repository:** `/Users/pkirsanov/Projects/bubbles`
**Required agent:** Select the canonical source agent `/Users/pkirsanov/Projects/bubbles/agents/bubbles.retro.agent.md` (`bubbles.retro`) or the canonical `/Users/pkirsanov/Projects/bubbles/agents/bubbles.workflow.agent.md` in `framework-health` mode. Never use a downstream `.github/agents/` copy.
**Workflow:** `framework-health`, `target: framework`, proposal-first only.
**Priority:** Secondary (reduces work VOLUME, not repetition). Approve BFW-03 and BFW-04 first; a rapid mode only helps once the identical-matrix loop is already closed.

## Preconditions

- Stop all other sessions writing the Bubbles source repo, or use a clean isolated worktree. The current root may contain unrelated in-flight changes; preserve them byte-for-byte.
- Resolve the next free monotonic `IMP-NNN` identifier at write time. Do not overwrite or renumber an existing proposal.
- Verify every claim against current source and available session evidence. If Research Lab session logs are unavailable, record that limitation instead of fabricating measurements.

## Verified Motivation To Recheck

- `bubbles/workflows.yaml` defaults to `full-delivery`.
- `full-delivery` has the maximum-assurance chain and can require planning, implementation, test, regression, simplify, gaps, harden, stabilize, DevOps, security, validate, audit, chaos, red-team, docs, and finalize work.
- Research Lab Feature 010 was a build-free static tool but accumulated a roughly day-long parent session, about 1,277 unique tool calls, fourteen sequential scopes, and more than eleven thousand planning/evidence lines before one increment was marked complete.
- IMP-003 and Gate G128 already provide opt-in aggregate session budgets. Extend them; do not duplicate the budget mechanism or allocate a competing gate.

## Reuse-Before-Build Investigation (MANDATORY FIRST STEP)

Before proposing a new mode, prove against source why the existing surface is insufficient:

- `test-to-doc` and other focused modes already provide a short `select -> test -> validate -> audit -> docs -> finalize` chain without the full eighteen-phase sweep. Ask whether a rapid path is really a new mode or just a documented entry point plus a risk router.
- Gate G128 (`session-cap-guard.sh`) ALREADY implements aggregate budgets; they merely default to null. The rapid path may only need to SET those defaults, not add a budget mechanism.
- If defaulting an existing focused mode plus G128 budgets plus a risk router closes the gap, the proposal MUST prefer that over a brand-new mode and say so explicitly.

## Proposal Requirements

Create one `Status: PROPOSED` framework-health IMP for a low-risk rapid path (a new mode ONLY if the reuse investigation proves an existing focused mode cannot be defaulted into this shape). The proposal must:

1. Define mechanical low-risk eligibility. Candidate criteria include build-free/static or isolated application changes with no auth, payments, secrets, PII, database migration, deployment topology, production mutation, or cross-product contract change. Any high-risk trigger must escalate to `full-delivery`; users cannot self-label risky work as low risk to bypass gates.
2. Define a short phase chain centered on `select -> implement -> test -> validate -> docs -> finalize`, with bootstrap planning only when required artifacts are truly absent. Preserve universal anti-fabrication, ownership, test-integrity, implementation-reality, and outcome-contract gates.
3. Give the mode non-null default G128 budgets, proposed initially around two convergence iterations, 90 wall-clock minutes, and 250 tool calls. Hitting a cap ends with a truthful bounded status, not an automatic fresh loop.
4. Limit active planning to a few vertical scopes and require an early shippable outcome. Escalate to full planning when the feature cannot fit the risk/size envelope.
5. Define deterministic routing from natural-language requests and explain whether `defaultMode` changes or a risk resolver chooses between rapid and full delivery.
6. Specify migration, compatibility, documentation, generated-surface updates, tests, held-out evaluation tasks, and measurable acceptance criteria: low-risk fixture reaches a usable validated result with materially fewer phases/tool calls while high-risk fixtures still select maximum assurance.
7. Cross-reference IMP-003 and current G128 implementation. Reconcile any stale wording that still calls the now-mechanical cap merely advisory, but do not mutate it in this proposal session.

## Boundaries

Write only one proposal under `improvements/` and update no framework code, agent, workflow, gate, generated document, index, release metadata, or existing IMP. G125 proposal-first policy is binding.

## Completion Contract

Return `framework_proposal_written` with the proposal path, evidence sources, gap codes, risks, acceptance criteria, and an explicit statement that zero framework runtime files changed. Stop for owner approval.

**Recommended invocation:** `/bubbles.workflow framework-health action:proposal-first topic:risk-tiered-rapid-tool-delivery`

---
**SYSTEM: CONTEXT RESTORED**
Verify canonical repo/agent identity and single-writer state, then create only the human-reviewable proposal.
```

## BFW-02 - Mechanical Vertical-Plan Guard

```markdown
# HANDOFF BFW-02 - Propose a mechanical vertical-delivery planning guard

**Project Goal:** Prevent Bubbles planning from producing long horizontal waterfalls that postpone the first usable route, UI, registry consumer, or end-to-end test until late scopes.

**Repository:** `/Users/pkirsanov/Projects/bubbles`
**Required agent:** Canonical `/Users/pkirsanov/Projects/bubbles/agents/bubbles.retro.agent.md` (`bubbles.retro`) under `framework-health`; no downstream copy.
**Workflow:** proposal-first only.
**Priority:** Secondary (reduces horizontal planning volume). Approve BFW-03 and BFW-04 first.

## Preconditions

- Sole writer or isolated clean worktree; preserve unrelated Bubbles changes.
- Resolve the next free IMP number without collision.
- Recheck current `bubbles.plan`, `scope-workflow.md`, `planning-core.md`, mode constraints, scope templates, and planning guards before asserting a gap.

## Verified Motivation To Recheck

- Current guidance already says vertical slices are preferred and calls horizontal planning the primary planning failure, but that rule is behavioral rather than mechanically decisive.
- Feature 010 still produced fourteen sequential scopes: foundations first, UI at Scope 09, registry/consumer integration at Scope 13, and real canaries at Scope 14. The plan passed its planning checks while no early scope could deliver a registered usable tool.

## Reuse-Before-Build Investigation (MANDATORY FIRST STEP)

`bubbles.plan` Phase 4 ALREADY contains a "Horizontal plan detection (REQUIRED)" behavioral check that flags 3-or-more consecutive single-layer scopes and instructs restructuring into vertical slices. The gap is that it is behavioral, not mechanically enforced. The proposal MUST first evaluate whether PROMOTING that existing check to a gate (with the fixtures below) is sufficient, and prefer that over inventing an unrelated new guard.

## Proposal Requirements

Create one PROPOSED framework-health IMP that makes the existing vertical-slice expectation mechanically decisive without reducing scenario or test integrity. It must evaluate:

1. **Time to first usable outcome:** for a user-facing feature, the first delivery increment must include the route/UI or operator surface, minimum real data/contract path, consumer registration when needed, and an end-to-end scenario. A plan that defers all consumer-visible behavior to late scopes fails unless an explicit high-risk foundation rationale is validated.
2. **Risk-adjusted scope budget:** project profiles may set a maximum active scope count or delivery-increment count; a low-risk build-free tool should normally fit within three increments and at most five active scopes. Larger plans require an explicit complexity/risk explanation and owner-visible warning or blocking decision.
3. **Horizontal sequence detection:** mechanically inspect consecutive scope surfaces and dependency order. Detect foundation-only chains that lack a runnable vertical checkpoint, not merely repeated words such as database/service/UI.
4. **Consumer timing:** registry, navigation, CLI, API client, or other first-party consumer work cannot be postponed until the end when it is required for the feature to be usable. Preserve protected high-fan-out canaries and rollback boundaries.
5. **Scenario preservation:** consolidation may remap stable scenarios but cannot silently drop scenario IDs, tests, DoD parity, or hard constraints.
6. **Actionable remediation:** the guard must identify the first non-shippable sequence and tell `bubbles.plan` how to restructure it into vertical increments. It must include hermetic positive/negative fixtures, including a Feature-010-shaped fourteen-scope negative case.
7. Decide whether this belongs in an existing planning gate, a new gate, or the proposed rapid-delivery mode. Avoid overlapping enforcement and generated-source drift.

## Boundaries

Write one proposal under `improvements/` only. Do not edit plan agents, guards, workflows, docs, generated files, or existing proposals during this session.

## Completion Contract

Return one evidence-grounded proposal with concrete parser inputs, failure semantics, fixture matrix, rollout posture, and files/owners to touch after approval. Stop for human review.

**Recommended invocation:** `/bubbles.workflow framework-health action:proposal-first topic:mechanical-vertical-delivery-plan-guard`

---
**SYSTEM: CONTEXT RESTORED**
Confirm canonical source identity and create only the proposal; do not implement the guard.
```

## BFW-03 - Exclusive Spec Writer Lease

```markdown
# HANDOFF BFW-03 - Propose an exclusive spec/worktree writer lease

**Project Goal:** Prevent concurrent Bubbles agents from mutating the same spec, report, state, source, or tests and invalidating each other's evidence.

**Repository:** `/Users/pkirsanov/Projects/bubbles`
**Required agent:** Canonical `bubbles.retro` at `/Users/pkirsanov/Projects/bubbles/agents/bubbles.retro.agent.md`, `target: framework`.
**Workflow:** `framework-health`, proposal-first only.
**Priority:** P1 (highest churn leverage). A single writer removes the concurrency multiplier behind the repeated-reconciliation loop. Implement with BFW-04.

## Preconditions

- Run as the only Bubbles source writer or from an isolated worktree.
- Resolve a collision-free next IMP number.
- Read IMP-004 SCOPE-2 and the existing runtime-resource lease design before proposing anything. Extend or supersede cleanly; do not duplicate the documented parent-owned shared-state contract.

## Verified Motivation To Recheck

- Feature 010 recorded overlapping `bubbles.implement` attempts and two concurrent `bubbles.test` replays against one dirty worktree.
- One owner restored files another owner had removed, validators changed after independent replay, and the report repeatedly appended "concurrent reconciliation" sections.
- Existing runtime leases coordinate Docker/Compose capacity and IMP-004 documents worktree scope ownership, but the observed collision involved repository/spec artifact writers in one worktree.

## Reuse-Before-Build Investigation (MANDATORY FIRST STEP)

IMP-004 SCOPE-2 documents a parent-owned shared-state contract for parallel SCOPES in isolated worktrees, and the runtime resource-lease design coordinates Docker/Compose capacity. Neither governs multiple writers mutating the SAME spec/report/state in ONE worktree, which is the observed collision. The proposal MUST confirm that single-worktree artifact-writer exclusivity is genuinely absent today before adding a lease, and MUST extend (not fork) the existing lease/shared-state vocabulary.

## Proposal Requirements

Create one PROPOSED IMP for an exclusive artifact-writer lease with these design questions resolved:

1. Define lease identity and storage under `.specify/runtime/`: repository root, spec/bug/ops target, scope, session ID, agent, worktree/branch, owned path families, acquired/renewed timestamps, TTL, and parent orchestrator.
2. Require lease acquisition before the first mutable tool call against a spec or its owned source/test paths. Multiple readers are allowed; one writer per target/worktree is allowed.
3. Allow parallel scopes only in isolated git worktrees under the existing parent-owned shared-state contract. Child scopes cannot write shared `state.json`, scenario manifest, spec/design, or another scope report.
4. Add heartbeat, clean release, stale detection, explicit takeover, abandoned-worktree cleanup, and crash recovery. No silent takeover or bypass flag.
5. Make conflicts fail early with a structured `route_required`/`blocked` envelope naming the current owner and safe remediation. Never "reconcile" two live writers by appending more evidence.
6. Integrate with orchestrator dispatch, direct specialist invocation, handoffs, state snapshots, and pre-tool risk checks. Define behavior for nested subagents and multi-repo scenarios.
7. Include hermetic concurrency tests: two writers same scope refused; reader plus writer allowed; isolated scopes allowed; shared-state child write refused; stale lease takeover audited; release permits next owner.
8. Decide whether to update IMP-004 or create a separate IMP. If updating IMP-004 is the non-duplicative answer, write a new proposal that explicitly recommends that amendment and explains why; do not edit IMP-004 in this session.

## Boundaries

Only one new proposal under `improvements/`. No runtime lease, hook, workflow, agent, gate, docs, generated file, or existing IMP mutation before owner approval.

## Completion Contract

Return `framework_proposal_written` with verified overlap analysis, proposed lease state machine, refusal enum, test matrix, migration plan, and zero framework mutations.

**Recommended invocation:** `/bubbles.workflow framework-health action:proposal-first topic:exclusive-spec-writer-lease`

---
**SYSTEM: CONTEXT RESTORED**
Verify canonical source and proposal-only posture, then produce the writer-lease proposal.
```

## BFW-04 - Evidence Receipts, Targeted Invalidation, And Progress Truth

```markdown
# HANDOFF BFW-04 - Make identical re-verification terminal and bound report growth

**Project Goal:** Stop the framework from re-running and re-documenting an already-independently-verified identical check matrix, and keep report.md bounded, WITHOUT weakening one-time independent verification or different-dimension sweeps.

**Repository:** `/Users/pkirsanov/Projects/bubbles`
**Required agent:** Canonical `/Users/pkirsanov/Projects/bubbles/agents/bubbles.retro.agent.md` (`bubbles.retro`) under `framework-health`.
**Workflow:** `framework-health`, proposal-first only.
**Priority:** P1 (direct fix for "same thing over and over"). Implement with BFW-03.

## Preconditions

- Sole writer or isolated worktree; resolve next free IMP number.
- Recheck, against source, how the identical five-row matrix ended up replayed and re-documented across six-plus report sections while the scope stayed `not_started`.

## Verified Motivation To Recheck

- Feature 010 Scope 01's report reached 2,400-plus lines and kept growing; the identical TP-01-01 through TP-01-05 matrix was independently replayed and re-documented in at least six separate reconciliation/supersession/replay sections that all prove the same green result.
- The framework ALREADY ships the mechanisms that should have bounded this and they were never invoked here: the certifying-window marker `bubbles:certifying-window-begin`, `spec-review compact:true|aggressive`, and evidence-by-reference (Gate G009).
- `state-transition-guard-perf-selftest` proves a ~5,000-line report costs the guard ~126s, so report bloat is a known, measured pain with a perf workaround but no prevention.
- A green independent replay was invalidated because an untracked file changed afterward and prior evidence lacked that identity, so the framework conservatively restarted the whole implement/test handoff instead of re-checking only what changed.
- Implementation and focused tests were green while status stayed `not_started`, hiding real progress and inviting yet another confirming replay.

## Reuse-Before-Build Investigation (MANDATORY FIRST STEP)

Do NOT propose a new evidence database first. Prove against source why each of these existing mechanisms did not prevent the loop, and prefer activating them:

- Certifying-window marker (`artifact-lint.sh`) - already bounds the current evidence window; was not required or emitted during the loop.
- `spec-review compact:true|aggressive` - already consolidates report sections and replaces raw blocks with one-line summaries; was never invoked.
- Evidence-by-reference (Gate G009) - already lets DoD cite an anchor instead of inlining; agents still inlined full blocks.
- Gate G083 compaction and Gate G038 narrow-repair containment - bound envelope growth and fix-loop stacking, but not identical-matrix report re-verification.

## Proposal Requirements

Create one PROPOSED IMP whose PRIMARY deliverable is one new rule plus activation of existing mechanisms, with a new store proposed ONLY if the existing store is proven insufficient. Independently landable parts:

1. **Terminal same-session re-verification (the core new rule):** define a byte-identity for a scope's owned surface (source, tests, validator, publication). When an independent verifier has confirmed a given identity in the current session, any later same-identity re-verification is a cited no-op referencing the existing evidence section - NOT a fresh full replay plus a new section. A changed identity requires exactly one fresh verification of only what changed. Scope this strictly to identical-matrix re-verification; it MUST NOT touch different-dimension sweeps (preserve the `baseline_already_green` no-skip rule).
2. **Activate existing report bounding by default in convergence loops:** require the certifying-window marker at the start of each fresh evidence window and invoke `spec-review compact` (or its logic) so report.md holds one bounded current window plus concise history, instead of one appended full section per handoff. Wire existing mechanisms; do not add a parallel store to do this.
3. **Progress-vs-certification status:** expose execution substates (for example `implemented`, `independently_verified`, `needs_reverification`) distinct from validate-owned certification, so real progress is visible while implement/test still cannot write `certification.*`.
4. **Optional receipt index (only if justified):** if and only if the reuse investigation proves the existing tool-call/evidence store cannot key evidence by identity, propose a minimal index - never a competing evidence database.
5. **Tests:** identical-identity re-verification is a cited no-op; a changed identity triggers exactly one fresh verification of only the changed surface; a different-dimension sweep still runs (baseline-rationalization preserved); report.md stays bounded across N handoffs; anti-fabrication still rejects missing raw evidence for a first verification.
6. **Migration:** reduce existing oversized reports with `spec-review compact`, not manual rewrite; preserve the append-only audit trail via the certifying-window boundary.

## Boundaries

Write one proposal under `improvements/` only. Do not compact or rewrite any existing report, change state schemas, edit guards, or mutate current proposals during this session.

## Completion Contract

Return an evidence-grounded proposal that leads with the terminal-re-verification rule plus existing-mechanism activation, lists which existing mechanisms it reuses and why, and only then any minimal new index. Include safety invariants, the identical-vs-different-dimension boundary, a test matrix, and files/owners for post-approval implementation. State that zero framework files changed.

**Recommended invocation:** `/bubbles.workflow framework-health action:proposal-first topic:terminal-reverification-and-report-bounding`

---
**SYSTEM: CONTEXT RESTORED**
Confirm proposal-only authority, then create the terminal-re-verification and report-bounding proposal without touching runtime code.
```

## BFW-05 - Multi-Root Agent And Repository Binding

```markdown
# HANDOFF BFW-05 - Propose fail-loud multi-root agent binding

**Project Goal:** Ensure a Bubbles session editing one repository cannot silently run an agent definition or framework server from another workspace root.

**Repository:** `/Users/pkirsanov/Projects/bubbles`
**Required agent:** Canonical `/Users/pkirsanov/Projects/bubbles/agents/bubbles.retro.agent.md` (`bubbles.retro`), `target: framework`.
**Workflow:** framework-health proposal only.
**Priority:** Correctness (prevents wrong-repo edits). This is NOT a churn fix; keep it independent of the churn-reduction work.

## Preconditions

- Sole writer or isolated worktree; resolve the next free IMP number.
- Recheck existing multi-root rules, unique per-repo MCP server IDs, installer metadata, agent frontmatter constraints, project config contract, scenario repo routing, and VS Code agent-picker limitations. Do not claim the MCP fix solves agent-source ambiguity unless source proves it.

## Verified Motivation To Recheck

- The Feature 010 session edited Research Lab while initially using GuestHost's `bubbles.analyst` and later QuantitativeFinance's `bubbles.goal`.
- Chronicle attributed Research Lab work to the first workspace root, QuantitativeFinance.
- Bubbles already gives MCP servers unique per-repo IDs, but custom-agent selection can still expose identically named installed agents from several roots.

## Reuse-Before-Build Investigation (MANDATORY FIRST STEP)

Bubbles already assigns unique per-repo MCP server IDs and documents a multi-root workspace rule. Confirm against source what those already guarantee, and target ONLY the residual gap (custom-agent selection can still expose identically named installed agents from several roots). Prefer an install-time repo marker plus a preflight check over any dependency on unsupported editor APIs.

## Proposal Requirements

Create one PROPOSED IMP for fail-loud repository binding:

1. Define a startup identity tuple: target Git root, active agent source root, framework provenance root/version, per-repo MCP server ID, and requested spec path.
2. Before mutable work, assert that a downstream target uses that target repo's installed agent/MCP/config surfaces, or that canonical Bubbles source mode is explicitly selected for framework work. A GuestHost or QuantitativeFinance agent targeting Research Lab must refuse before editing.
3. Investigate what VS Code exposes about the selected custom-agent URI. If direct discovery is unavailable, propose an install-time repo marker in generated agent metadata/instructions plus a deterministic repo-root preflight helper. Do not rely on unsupported editor APIs.
4. Consider repository-qualified display labels or generated descriptions so users can distinguish `bubbles.goal (research-lab)` from other copies without forking agent behavior.
5. Require handoff/continuation envelopes to carry `repositoryRoot`, `agentSourceRoot`, `frameworkVersion`, and target path. Orchestrators must validate those fields when resuming.
6. Improve session/telemetry attribution where Bubbles controls it; clearly separate VS Code Chronicle limitations that require an upstream editor issue.
7. Include multi-root fixtures: correct downstream binding passes; foreign installed agent refuses; canonical framework-source work passes; cross-repo goal scenario uses explicit nodes; stale/missing marker fails with actionable remediation; unique MCP IDs remain compatible.
8. Define installer/upgrade migration and generated-file ownership. No per-machine absolute path may be committed to downstream repositories.

## Boundaries

Write one proposal under `improvements/` only. Do not edit installer, agents, MCP config, project files, docs, generated surfaces, or existing IMPs until owner approval.

## Completion Contract

Return one proposal with verified editor/framework boundaries, a feasible fail-loud design, migration/test plan, ownership map, and an explicit zero-runtime-mutation statement.

**Recommended invocation:** `/bubbles.workflow framework-health action:proposal-first topic:multi-root-agent-repository-binding`

---
**SYSTEM: CONTEXT RESTORED**
Verify canonical Bubbles source identity, then author only the multi-root binding proposal.
```
