# BUG-007: Compose Brief Prototype-Sensitive Keys

**Status:** Confirmed
**Severity:** High
**Reported:** 2026-08-26
**Source finding:** `SEC-B006-S1`
**Feature:** `specs/008-portfolio-survival-and-brief-lab`
**Affected module:** `rlportfoliobrief.js`

## Summary

Exported `composeBrief()` uses ordinary objects as maps keyed by caller-derived
completion subjects and domains. Prototype-sensitive strings therefore resolve
inherited properties instead of independent map entries.

For both `subjectId` and `domain`, each of `__proto__`, `constructor`, and
`toString` reaches shared built-in objects. The current support-date write
mutates one of those objects. The following category lookup throws a
`TypeError` outside the module's result envelope.

## Severity

High. A valid string value can synchronously terminate brief composition and
mutate process-global built-in state before the throw. No network or secret
boundary is involved, but the defect affects integrity and availability at an
exported production function.

## Reproduction

1. Load the committed portfolio policy, market-brief windows, and exported
   `rlportfoliobrief.js` module.
2. Compose the existing normal four-lane fixture and record its result and
   subject order.
3. Replace every completion `subjectId` with `__proto__`, `constructor`, and
   `toString`, one key per isolated call.
4. Repeat the same matrix for completion `domain`.
5. Before and after every call, inspect the three built-in targets reached by
   inherited lookup: `Object.prototype`, `Object`, and
   `Object.prototype.toString`.
6. Delete any process-local probe property in a `finally`-equivalent cleanup
   step and verify no target retains it.

### Observed

- The normal control returns `ok: true` with lane order
  `held,watchlist,completedResearch,inferredRelevance` and subject order
  `MSFT,BND,ZZTOP,semiconductors`.
- All six hostile subject/domain cases return no result envelope.
- All six cases throw
  `TypeError: categoriesBySubject[key].indexOf is not a function`.
- `__proto__` writes the completion date onto `Object.prototype`.
- `constructor` writes the completion date onto `Object`.
- `toString` writes the completion date onto
  `Object.prototype.toString`.
- Cleanup returns every built-in target to its pre-probe state.

Current-session output is recorded at
`report.md#before-fix-reproduction`.

### Expected

Caller-derived subjects and domains must behave as own keys, including
`__proto__`, `constructor`, and `toString`. `composeBrief()` must return through
its declared result contract without mutating shared prototypes or built-ins.
Normal output, lane and subject ordering, local refusal precedence, and shared
policy refusal behavior must not move.

## Root Cause

`composeBrief()` and its `distinctCount()` helper allocate caller-keyed maps
with `{}`. Reads therefore walk `Object.prototype`. The support-date map then
writes through the inherited object or function. The category map assumes its
lookup either misses or returns an array, but an inherited built-in value is
neither, so `.indexOf()` throws.

The affected internal map set is:

1. `distinctCount()` local `seen`
2. `excludedBySubject`
3. `supportBySubject`
4. `categoriesBySubject`
5. `horizonBySubject`
6. `newestSupportBySubject`
7. `supportDatesBySubject`
8. `qualifiesVia`
9. `inferredDomains`
10. `byId`

The per-subject date set created inside `supportDatesBySubject` is another
set-like ordinary object. Its keys are derived ISO dates rather than caller
subjects, but using the same null-prototype representation keeps the complete
aggregation chain inheritance-free.

Two caller-supplied lookup maps, `owners` and `priorEvidenceIds`, also use the
qualified subject as a direct property lookup. They are latent after a partial
aggregation-only repair: an absent `__proto__` key still resolves inherited
state, and `priorEvidenceIds[subjectId].slice()` can throw. They therefore
belong in the same fix boundary through own-property membership checks.

## Proposed Resolution

Use the module's existing `Object.create(null)` pattern for every internal
caller-keyed aggregation map and the nested date set. Use explicit own-property
membership for `owners` and `priorEvidenceIds` before reading their values.

Do not blacklist key spellings, catch and hide the exception, coerce input, or
change accepted string contracts. Preserve `Object.keys()`-based insertion
order and all existing refusal precedence.

## Scope

The planned source change is limited to caller-keyed map allocation and the two
membership-safe lookup sites in `rlportfoliobrief.js`. Persistent regressions
belong in the existing brief functional carrier and brief browser carrier.

This filing changes no product source or persistent test. It does not touch the
separate dirty parent Feature 008 scope and root test-plan transaction.

## Finding-Owned Closure Classification {#finding-owned-closure-classification-2026-09-02}

No new bug packet is required for `HARDEN-B007-PLAN-LIFECYCLE-002` or
`HARDEN-B007-MANIFEST-DUPKEY-003`. Both findings are defects in this active
BUG-007 planning packet.

`HARDEN-B007-PLAN-LIFECYCLE-002` is an existing-packet planning-truth defect.
The active lifecycle prose contradicts the executed `TP-B007-012` evidence and
the checked rollback DoD. It introduces no new product failure, behavior, or
test obligation. The filed evidence remains
`report.md#harden-b007-plan-lifecycle-002`.

`HARDEN-B007-MANIFEST-DUPKEY-003` is an existing-packet structured-planning
defect. The duplicate key occurs inside this bug's current scenario manifest.
It introduces no separate runtime failure or product boundary. The filed
evidence remains `report.md#harden-b007-manifest-dupkey-003`.

Both findings remain unresolved. `bubbles.analyst` owns the first planning-truth
adjudication. Foreign-owned planning repairs then route to `bubbles.plan` for
`scopes.md`, the active `report.md` lifecycle structure, and
`scenario-manifest.json`.

`HARDEN-B007-G061-HISTORY-001` remains separate, unresolved, and owned by
`bubbles.validate`. This classification does not change its text, evidence,
historical routes, or certification ownership.

## Audit Finding Classification - 2026-09-02 {#audit-finding-classification-2026-09-02}

Audit attempt `BUG-007-AUDIT-001` remains `REWORK_REQUIRED`. This
classification resolves no finding and changes no audit or certification
field. It preserves all seven findings in current execution-state accounting.

| Finding | Goal impact | Owning artifact, repository, and agent | Packet disposition | Current disposition |
| --- | --- | --- | --- | --- |
| `AUDIT-B007-ROUTE018-PROVENANCE-001` | `required` | BUG-007 `state.json` route 018 and execution history in Research Lab; `bubbles.analyst` | Remains inside BUG-007. Route 018 stays open because current state contains no analyst execution record. | Unresolved. `bubbles.analyst` is the next local owner. |
| `AUDIT-B007-UX-OWNERSHIP-001` | `required` | BUG-007 `spec.md` sections `UI Wireframes` and `User Flows` in Research Lab; `bubbles.ux` | Remains inside BUG-007. No new packet is required for a provenance defect in this active packet. | Unresolved. Route to `bubbles.ux` after analyst adjudication. |
| `VALIDATE-B007-G090-FRAMEWORK-001` | `blocking-external` | Canonical Bubbles G090 convergence/snapshot classifier; `bubbles.implement` | Already adequately filed from Research Lab at `.github/bubbles-project/proposals/20260902-g090-convergence-summary-counted-as-snapshot.md`. | Unresolved pending upstream repair and normal downstream refresh. |
| `VALIDATE-B007-CHECK8-AGENT-ID-001` | `blocking-external` | Canonical Bubbles `state-transition-guard.sh` Check 8 parser; `bubbles.implement` after bug filing | Newly filed through the permitted Research Lab proposal surface at `.github/bubbles-project/proposals/20260902-check8-agent-identifier-counted-as-test-file.md`. | Unresolved pending upstream repair and normal downstream refresh. |
| `VALIDATE-REPO-COLLECTED-TEST-COUNT-001` | `independent` | Test-owned report evidence in Research Lab Specs 022, 023, and 024 plus BUG-025; `bubbles.test` | Existing tracked packets are adequate: six findings belong to Spec 022, five to Spec 023, seven to Spec 024, and one to BUG-025. G095 does not require a duplicate BUG-028 packet. | Unresolved in those four existing packets. |
| `VALIDATE-REPO-HANDOFF-CYCLE-001` | `blocking-external` | Canonical Bubbles handoff graph and `handoff-cycle-check.sh`; `bubbles.implement` after upstream bug ownership | Already adequately filed at `guestHost/.github/bubbles-project/proposals/20260523-handoff-cycle-policy-checker-correction.md`. A second Research Lab proposal would duplicate the same checker and graph-semantics defect. | Unresolved pending upstream repair and normal downstream refresh. |
| `VALIDATE-REPO-STALE-RECEIPT-001` | `independent` | Research Lab `specs/_bugs/BUG-025-company-corpus-read-never-settles`; `bubbles.validate` | Route to the existing BUG-025 packet. No new packet is required. | Unresolved; no prior BUG-025 clean-receipt narrative is treated as current proof. |

The required local provenance sequence is `bubbles.analyst`, then
`bubbles.ux`. The external proposals and existing sibling packets remain
parallel unresolved routes; they do not authorize bypassing the local sequence
or marking BUG-007 fixed.

## Related

- Parent feature: `specs/008-portfolio-survival-and-brief-lab`
- Originating security finding:
  `../BUG-006-evidence-window-date-overflow/report.md#sec-b006-s1`
- Design: `design.md`
- Fix scope: `scopes.md`
