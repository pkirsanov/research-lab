# Feature 012 Planning Report

## Summary

`bubbles.plan` created a 14-scope, per-scope-directory, foundation-first execution DAG from the complete Feature 012 specification and design. Planning preserves the observed 23-entry registry, exact BUG-004/Feature 002/Feature 008 predicates, Research Lab source ownership, Feature 002 atomic publication, Feature 008 private-store ownership, options publication ownership, and the Research Lab-first/QF-later contract boundary.

No product source, product test, dependency feature, framework-managed file, implementation result, user acceptance result, completed scope, status promotion, or certification claim is made by this report.

## Decision Record

- Scope 01 is independently eligible and contains contracts/config/registry validation only; it makes no integration claim.
- Scope 04 is owner-neutral and proves honest unavailable behavior; actual owner-model effects are delivered in Scopes 05-07.
- Scopes 05-07 explicitly cover all 22 ordinary tools and the internal Market Action triage model with owner parity and per-tool parameter-effect regressions.
- Scope 08 explicitly covers all 23 Journey inventories and the shared local/session/packet runtime.
- Scope 11 alone owns Feature 002-gated authored/public Brief integration.
- Scope 12 depends on bounded WebEvidence but not Scope 11, so deterministic dynamic-alert work is not blocked by uncertified publication.
- Scope 13 alone owns Feature 008-gated private matrix/stress integration and creates no second store.
- Scope 14 consumes BUG-004's authoritative functional/browser classification and evidence instead of duplicating or relabeling provider transport tests.
- Research Lab declares no `testImpact` or `traceContracts`; no impact-map or telemetry rows are fabricated.

## Completion Statement

Planning-owned artifacts are subject to the validation evidence recorded below. No implementation completion statement is authorized.

## Code Diff Evidence

Planning-only files under `specs/012-market-action-center-and-guided-tools/` are the only intended changed paths for this invocation:

- `scopes/_index.md`
- `scopes/01-*/scope.md` through `scopes/14-*/scope.md`
- `scopes/01-*/report.md` through `scopes/14-*/report.md`
- `report.md`
- `uservalidation.md`
- `scenario-manifest.json`
- `test-plan.json`
- `state.json` execution routing/history only

## Test Evidence

Planning validation commands were executed in the current session. Product behavior tests remain `planned-not-executed`; `bubbles.plan` records no product pass claim.

## Uncertainty Declarations

- Browser execution remains dependent on the repository-declared Linux `system-chrome` channel. BUG-004 currently records that `/opt/google/chrome/chrome` is absent. No planned browser row may be marked complete or replaced with managed Chromium while that remains true.
- Feature 002 and Feature 008 integration predicates are currently false. Scopes 11 and 13 remain ineligible until their exact mechanical predicates pass.
- BUG-004 remains uncertified and browser-blocked. Scope 14 remains ineligible for its integrated keyed-provider claim until that predicate passes.
- *(Superseded 2026-07-30 by finding XFC-01 below — do not read the two bullets above as current fact.)* The third bullet is now stale: `specs/_bugs/BUG-004-proxy-route-local-key-fallback` is `status=done`, `certification.status=done`, `certifiedAt=2026-07-23T03:28:14Z`. The second bullet's *conclusion* still holds, but its implied *cause* does not: the `feature-002` predicate is false even though Feature 002 is fully `done`/`done`. The predicates are false because of XFC-01, not because the producers are incomplete.

## Cross-Feature Findings

**Finding-ID convention (declared here, first use).** This feature already uses two
local conventions: `D<n>` for Test-Plan ↔ implementation drifts (scope-local, currently
`D1`–`D7` in `scopes/15-production-simple-adapter-wiring/report.md`) and `ROLL-<nn>` for
rollback-rehearsal findings (`ROLL-01`). Neither fits a defect whose subject is a
*contract between features*, so this report declares a third, feature-level prefix:
**`XFC-<nn>` — Cross-Feature Contract**. It is reserved for defects in an agreement
between a consuming feature and a producing feature/bug. `XFC-` was unused anywhere in
the repository before this entry, so `XFC-01` is stable and collision-free.

---

### Finding XFC-01 — every declared dependency gate is unsatisfiable by construction (BLOCKING, cross-feature; recorded 2026-07-30)

**Severity.** Blocking for Scopes 11, 13, 14. Not resolvable by Feature 012 acting alone.

**Statement.** `tool-experience.config.json` declares three dependency gates whose
`acceptedPredicate` requires named delivery markers in addition to producer status. The
evaluator at `rlexperience.js` lines 2056–2059 reads those markers from the **producer's**
`state.json`:

```js
var required = predicate.requiredEvidenceIds || predicate.requiredMilestones;
var observed = predicate.requiredEvidenceIds
  ? (Array.isArray(state.evidenceIds) ? state.evidenceIds : [])
  : (Array.isArray(state.milestones) ? state.milestones : []);
```

**No `state.json` in this repository publishes either key.** Verified by scanning all 26
`state.json` files under `specs/` (including nested `bugs/` packets): 0 contain
`"milestones"` and 0 contain `"evidenceIds"`. Both array reads therefore fall through to
`[]`, `matchedRequirementCount` is `0`, and `satisfied` is `false` — **permanently, for
every gate, regardless of how completely the producer delivers**.

**Executed verdicts** (real `tool-experience.config.json`, each producer loaded from the
gate's own declared `statePath`, via the exported `RLX.evaluateDependencyGates`):

| gateId | producer `statePath` | status / certification | matched / required | satisfied |
|---|---|---|---|---|
| `feature-002` | `specs/002-distributed-tool-briefs-and-history/state.json` | `done` / `done` | **0 / 4** | `false` |
| `feature-008` | `specs/008-portfolio-survival-and-brief-lab/state.json` | `not_started` / `not_started` | **0 / 3** | `false` |
| `BUG-004` | `specs/_bugs/BUG-004-proxy-route-local-key-fallback/state.json` | `done` / `done` | **0 / 2** | `false` |

Two of the three producers are already fully `done`/`done` and are still gate-blocked.
A control run that injected a fabricated `status=done`/`certification.status=done` for
Feature 008 still returned `satisfied=false` at `matched 0/3`, confirming the marker
requirement is binding **independently** of producer status.

**The marker IDs were declared unilaterally by Feature 012 and never agreed with the
producers.** Occurrence counts (files containing the string, inside the producer's own
spec directory):

| gate | required marker ID | files in producer dir | maps to a real producer deliverable? |
|---|---|---|---|
| `feature-002` | `current-graph` | **0** | no trace |
| `feature-002` | `owner-coverage` | **0** | no trace |
| `feature-002` | `powerless-author` | **0** | no trace |
| `feature-002` | `atomic-publication` | 6 | yes — producer scope `09-evidence-first-atomic-publication` |
| `feature-008` | `rlportfolio-store-privacy` | **0** | no trace |
| `feature-008` | `public-evidence-barrier` | 6 | plausible |
| `feature-008` | `local-brief-ticker-scope` | **0** | no trace |

3 of 4 (`feature-002`) and 2 of 3 (`feature-008`) required IDs appear nowhere in the
producer's artifacts. `BUG-004` is the informative contrast: its required IDs `TP-09` and
`TP-12` **do** occur 7 times in its `state.json`, but only inside free-prose
`transitionRequests[].resolutionSummary`, `executionHistory[].summary`, and
`addressedFindings[].summary` strings — never in the machine-readable `evidenceIds` array
the evaluator actually reads. The delivery happened; the *publication* never did.

**Characterisation — this is NOT a reason to weaken the gate.** The gate's design is
deliberately strict and **correct in principle**: it refuses to accept a bare
`status: done` and demands the producer publish named, verifiable delivery markers.
That is sound anti-fabrication design, and `bypassAllowed: false` is right. The defect is
that the **consumer declared a contract the producer never implemented or agreed to**, so
the contract can be satisfied by nobody. A strict gate is not the same as a broken one;
this one is broken only in its *terms*, not its *strictness*.

**Resolution requires a cross-feature negotiation.** Feature 012 cannot fix this
unilaterally — doing so alone is precisely how the defect was created. Two candidates:

- **(a) Producer-side publication.** The producer adds a machine-readable `milestones`
  (or `evidenceIds`) array to its own `state.json`, listing IDs it genuinely delivered.
  **Legitimate only if each named marker was actually delivered.** Publishing an ID to
  satisfy a gate without the underlying delivery is fabrication and would convert a
  correct gate into a rubber stamp — strictly worse than the current honest block. On the
  present evidence (a) is plausible for `BUG-004` (`TP-09`/`TP-12` demonstrably exist) and
  for `atomic-publication` / `public-evidence-barrier`; it is **not** currently supportable
  for the five IDs with zero occurrences.
- **(b) Consumer-side amendment.** Feature 012 amends `acceptedPredicate` to require
  marker IDs the producer actually publishes. This must not silently degrade to
  "status-only", or it destroys the anti-fabrication property the gate exists to provide.

Either path requires the owning sessions of `specs/002-*`, `specs/008-*`, and
`specs/_bugs/BUG-004-*` to agree the marker vocabulary. Those directories are **not**
touched by this finding; it is read-only evidence.

**Recurring authoring pattern (worth flagging).** This is the **third** clause in
Feature 012 found to be unsatisfiable as written:

1. the withdrawn END-state clause *"every ordinary tool wired"* — unsatisfiable because 4
   of 22 ordinary tools are declared-unwired-by-design; replaced by closed-set total
   accounting;
2. the **file-level** no-interception scan — unsatisfiable because the offending sites
   belong to Feature 003 at an ancestor commit, so it could only be closed by damaging
   another feature; replaced by a carrier-level clause;
3. **XFC-01** — unsatisfiable because the required marker vocabulary was never published
   or agreed by the producers.

All three share one shape: **a gate whose closure condition is not reachable by any action
available to the party the gate binds.** In (1) and (2) the remedy was to re-aim the clause
at the thing actually at stake, without weakening it — the same standard applies here.
Recommendation for this feature's authoring: any newly-introduced predicate that names an
identifier owned by another feature must cite the producing artifact where that identifier
is published, at declaration time.

**Not changed by this finding.** `tool-experience.config.json`, `rlexperience.js`, and all
other product source are untouched. Neither gate is weakened, relaxed, or bypassed. No
checkbox, `status`, or `certification` value was altered. Recording the defect *is* the
deliverable.

## Scenario Contract Evidence

The plan maps all 32 analyst acceptance scenarios plus five technical planning scenarios (`SCN-012-033` through `SCN-012-037`) in `scenario-manifest.json`, exact Markdown Test Plan rows, exact DoD test-evidence items, and `test-plan.json`.

## Coverage Report

- 14 active scopes, all Not Started.
- Scope 01 is tagged `foundation:true`; every concrete overlay depends directly or transitively on it.
- All 22 ordinary Simple adapters are assigned across Scopes 05-07.
- All 23 registry Journey inventories are assigned in Scope 08.
- Public, authored-public, dynamic-alert, and private trust zones are separated across Scopes 09-13.
- Final integrated acceptance includes unit, functional, integration, e2e-ui, stress, and load categories without misclassifying controlled external boundaries as live.

## Lint/Quality

**Claim Source:** executed

- `bash .github/bubbles/scripts/cli.sh lint specs/012-market-action-center-and-guided-tools` passed after reconciliation.
- `bash .github/bubbles/scripts/capability-foundation-guard.sh specs/012-market-action-center-and-guided-tools` passed Gate G094.
- `bash .github/bubbles/scripts/artifact-freshness-guard.sh specs/012-market-action-center-and-guided-tools` passed with all 14 per-scope directories indexed and registered in execution routing state.
- `bash .github/bubbles/scripts/cli.sh dag specs/012-market-action-center-and-guided-tools` rendered the intended 14-node dependency graph after machine-readable header normalization.
- `bash .github/bubbles/scripts/transition-contract-resolver.sh specs/012-market-action-center-and-guided-tools` resolved `full-delivery`, target `done`, and the current planning artifact fingerprint without malformed state.
- The canonical object-shaped `test-plan.json` contains 130 unique records across 14 scopes; its TP-ID set exactly equals the 130 Markdown Test Plan IDs.
- `bash .github/bubbles/scripts/traceability-guard.sh specs/012-market-action-center-and-guided-tools` maps 37/37 Gherkin scenarios to Test Plan rows and 37/37 to DoD items, then exits nonzero on 37 delivery-file/evidence checks because implementation tests and per-scope execution evidence are absent at planning maturity.

## Spot-Check Recommendations

- Confirm every test-plan JSON row remains byte-semantically synchronized with its Markdown row after any planning reconciliation.
- Confirm each per-tool adapter test fails when its enabled control is disconnected from the declared owner output.
- Confirm private/public sentinel inventories include URL, referrer, history, request, log, DOM, storage, public artifacts, publisher input, and telemetry.

## Validation Summary

Planning artifacts are coherent and artifact-valid. The packet routes to `bubbles.implement` at `01-contract-config-registry-foundation`. Delivery traceability remains intentionally nonterminal until the planned production tests exist and execution evidence is recorded by the owning specialists.

## Audit Verdict

No audit verdict is claimed by `bubbles.plan`.
