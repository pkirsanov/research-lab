# Scope 03 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md) | [uservalidation.md](../../uservalidation.md)

## Summary

Evidence-recording run only. No test code was written, no defect was injected, and no production source was changed. The three committed Node suites named by TP-03-01 through TP-03-03 were re-executed and their raw output recorded below, then each DoD item was assessed against the specific assertions the committed tests genuinely carry.

Result: **2 of 12 DoD items ticked** (TP-03-01, TP-03-02). Ten items remain unchecked, each with the exact uncovered requirement ids or behaviors named in [Uncertainty Declarations](#uncertainty-declarations). The Build Quality Gate item was deliberately not assessed this run.

The single most significant finding is that **TP-03-03 is green but does not carry its declared behavior** — see [TP-03-03](#tp-03-03).

## Decision Record

- **D-03-01** — Requirement coverage was scored per individual id, not per DoD sentence. An item naming many ids is ticked only when every id it names is carried by a specific named assertion. Blanket claims were rejected.
- **D-03-02** — The FR/NFR scan used a negative-lookbehind guard, `(?<!N)FR-\d{3}`, because `FR-022` is a substring of `NFR-022` and `FR-012` of `NFR-012`. An unguarded scan credits `tests/portfolio-privacy.functional.mjs` with FR-003/005/007/012/022 that are in fact the NFR ids in that file's `NFR-003 NFR-005 NFR-007 NFR-012 NFR-022` title. Both genuine FR occurrences were then confirmed by reading their assertion sites.
- **D-03-03** — This run disagrees with one premise of its own briefing. DoD core item 3 (full-personal clear) was flagged as carried; assessment found 9 of its 13 named sections verified. The item is left unchecked and the 4 unverified sections are named. Recorded here so the operator can overrule with the gap visible rather than hidden.
- **D-03-04** — A green suite is not evidence for a Test Plan row whose declared behavior it does not contain. TP-03-03 passes 11/11 and is still left unchecked.

## Completion Statement

Scope 03 is **not** complete. Ten of twelve DoD items lack the evidence they require. Scope status remains `In Progress`.

## Code Diff Evidence

No production or test source was modified by this run. Changed paths are limited to this scope's own execution artifacts:

```
specs/008-portfolio-survival-and-brief-lab/scopes/03-local-behavior-privacy-inventory-and-clear/report.md
specs/008-portfolio-survival-and-brief-lab/scopes/03-local-behavior-privacy-inventory-and-clear/scope.md
```

G093 classification: `execution-artifact` only. No `implementation-bearing` path is in this change.

## Test Evidence

Each section records the exact command, exit code, claim source, and raw runner output.

### TP-03-01

**Claim Source:** executed
**Command:** `node --test tests/portfolio-foundation.unit.mjs`
**Exit Code:** 0

```
✔ RLPORTFOLIO is a frozen Node and browser dual-runtime contract (11.689189ms)
✔ mandatory policy is closed versioned finite and rejects unknown configuration (2.330497ms)
✔ holding revision and workspace identities are strict deterministic contracts (32.654969ms)
✔ valid CSV preview exposes accepted normalized and unresolved duplicate states before confirmation (1.794798ms)
✔ duplicate choices are explicit and row removal can create a valid new preview (4.061096ms)
✔ unknown import fields remain blocking through duplicate resolution (1.671098ms)
✔ secret-shaped import rejects the full draft with value-safe PortfolioError values (1.566699ms)
✔ manual alternatives require valuation liquidity cost and uncertainty truth (2.385097ms)
✔ manual listed drafts use the same closed preview contract as file imports (2.099998ms)
✔ atomic durable commits use inactive slots verify bytes and reject generation conflicts (16.550084ms)
✔ clearing a portfolio is an atomic revision-state change that preserves immutable history (18.773182ms)
✔ slot and pointer faults preserve the last-known-good revision (21.537279ms)
✔ post-write slot corruption is detected before pointer publication (7.706092ms)
✔ future records remain untouched and durable session memory states are explicit (2.868597ms)
✔ unknown legacy workspace shapes refuse migration and quarantine metadata is value-safe (1.147599ms)
✔ foundation privacy inventory and verified clear remain available without policy config (0.831799ms)
✔ explicit mandate draft is a closed user-authority contract over units dates currencies and hard research classification (8.643992ms)
✔ absent mandate fields stay null and no default horizon floor objective or expected return is created (4.415896ms)
✔ conflicting mandate stays infeasible with every declared constraint and cash need preserved in declared order (3.345696ms)
✔ mandate revision identity is deterministic supersedes the prior mandate and never mutates the portfolio (42.00396ms)
✔ behavior events interest signals and display settings cannot create or modify any mandate field (2.667897ms)
✔ route projection cites one mandate revision and reports mandate-absent states without inventing values (27.203274ms)
✔ behavior event vocabulary is closed to the declared categories lifecycle states and draft fields (14.746685ms)
✔ every declared excluded behavior source is rejected by name in any casing or separator form at any depth (12.994488ms)
✔ semantic de-duplication collapses same-day repeats to the earliest occurrence without shrinking distinct evidence (10.262991ms)
✔ action outcome commands map to exactly one lifecycle state and reject mismatched or unknown transitions (7.271293ms)
✔ privacy inventory reports real category counts and carries no stored subject value (31.69227ms)
✔ behavior clear empties behavior categories only after they are proven non-empty and preserves portfolio and mandate identity (36.937764ms)
✔ verified foundation clear reports empty only after reread and a remove fault cannot report success (1.093199ms)
✔ verified clear covers every policy-declared personal key and leaves the raw namespace holding none of them (0.719199ms)
✔ full-personal clear empties every declared personal section and leaves generic public assets byte-identical (40.82846ms)
ℹ tests 31
ℹ suites 0
ℹ pass 31
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 484.106032
```

**Row assessment — every element TP-03-01 declares is present:**

| TP-03-01 declared element | Carrying assertion |
|---|---|
| closed event vocabulary | `behavior event vocabulary is closed to the declared categories lifecycle states and draft fields` |
| forbidden-field mutation set | `every declared excluded behavior source is rejected by name in any casing or separator form at any depth` |
| de-duplication | `semantic de-duplication collapses same-day repeats to the earliest occurrence without shrinking distinct evidence` |
| exact lifecycle transitions | `action outcome commands map to exactly one lifecycle state and reject mismatched or unknown transitions` |
| privacy inventory projection | `privacy inventory reports real category counts and carries no stored subject value` |
| atomic behavior clear | `behavior clear empties behavior categories only after they are proven non-empty and preserves portfolio and mandate identity` |
| tombstone / full clear | `verified clear covers every policy-declared personal key and leaves the raw namespace holding none of them`; `full-personal clear empties every declared personal section and leaves generic public assets byte-identical` |
| deletion-failure states | `verified foundation clear reports empty only after reread and a remove fault cannot report success` |

The excluded-source sweep iterates the full declared token list, asserts a per-token `forbidden-behavior-source` reason and exact `draft.<token>` field path, carries the anti-vacuity guard `every declared token must have been exercised, not merely iterated over`, and carries a control proving the refusal is caused by the token rather than by the extra field (`an unexcluded extra name is a shape error, so the exclusion refusals above are caused by the token`). It also covers casing and separator variants, nested depth (`a nested excluded source must be named at its exact path`), and read-side refusal (`an excluded source already on disk is refused on read, not only on write`).

**Verdict: TP-03-01 DoD item ticked.**

### TP-03-02

**Claim Source:** executed
**Command:** `node --test tests/portfolio-brief.functional.mjs`
**Exit Code:** 0

```
✔ only an eligible completion becomes behavior evidence and no excluded source can create or grow one (119.978086ms)
✔ route recomposition is invariant to behavior evidence and states that behavior contributes none (28.730573ms)
✔ behavior clear removes the committed evidence and returns recomposition to the pre-evidence baseline (56.258246ms)
✔ dismissal and automatic invalidation record a safe outcome and never a behavior event or a negative preference (15.908785ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 313.481503
```

**Row assessment — every element TP-03-02 declares is present:**

| TP-03-02 declared element | Carrying assertion |
|---|---|
| derive only relevance consumers from eligible completions | `only an eligible completion becomes behavior evidence and no excluded source can create or grow one` |
| clicks and settings create no event | same test; per-token attempts guarded by `every declared token must have been exercised, not merely iterated over` and the control `an unexcluded extra name is a shape error, so the refusals above are caused by the token` |
| dismissal and automatic invalidation create no event or negative preference | `dismissal and automatic invalidation record a safe outcome and never a behavior event or a negative preference`; `no command exists that could express a negative preference`; `a negative preference is refused by name, not silently stored`; `no closing command has written itself into the workspace as a side effect` |
| behavior clear removes rank influence on immediate recomposition | `behavior clear removes the committed evidence and returns recomposition to the pre-evidence baseline`; `recomposition after the clear must equal the pre-evidence baseline exactly` |

Anti-vacuity is genuine rather than incidental: the clear arm re-reads from committed bytes first (`the evidence must genuinely be on disk before the clear is meaningful`, `the reported cleared count must match the proven committed population`), and the invariance arm proves the projection is capable of differing (`the projection must be able to differ, or invariance proves nothing`, `an empty route list would make the invariance above vacuous`).

**Verdict: TP-03-02 DoD item ticked.**

### TP-03-03

**Claim Source:** executed
**Command:** `node --test tests/portfolio-privacy.functional.mjs`
**Exit Code:** 0

```
✔ real-format import previews commits reloads and exports one local revision (42.40445ms)
✔ secret-bearing import is redacted and cannot mutate any storage namespace (17.38698ms)
✔ atomic write failures preserve the active pointer and retain a validated candidate only in memory (26.673668ms)
✔ session and memory commits state truthfully and preserve the last valid candidate after rejection (16.73148ms)
✔ hostile manual labels remain inert data and namespace writes stay closed (13.590084ms)
✔ explicit mandate revisions commit and reload atomically while portfolio generation semantics are preserved (84.4864ms)
✔ one reloaded constraint set reaches every consumer and absent or conflicting fields never acquire defaults (49.955941ms)
✔ FR-011 to FR-016: declared purpose units authority dates amounts currencies priorities and treatment reach the candidate unchanged and an infeasible draft fails loudly with nothing relaxed (19.607977ms)
✔ NFR-003 NFR-005 NFR-007 NFR-012 NFR-022: provenance missing-state integrity atomic revisions latest-complete publication and the research boundary all hold on the mandate surface (113.175966ms)
✔ FR-017 FR-022 FR-033: behavior settings and market-fact relabelling attempts are refused and change no mandate cash need expected return floor objective or constraint state (35.013457ms)
✔ rolling a mandate back restores the pre-mandate portfolio state by identity, not by resemblance (38.033253ms)
ℹ tests 11
ℹ suites 0
ℹ pass 11
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 569.186728
```

**Row assessment — the suite is green but does not carry the row.** TP-03-03 declares five behaviors. Clear and inventory entry-point counts across the three suites:

| Entry point | `portfolio-privacy.functional.mjs` | `portfolio-foundation.unit.mjs` | `portfolio-brief.functional.mjs` |
|---|---|---|---|
| `privacyInventory` | 0 | 3 | 0 |
| `clearFoundationStorage` | 0 | 6 | 0 |
| `buildBehaviorClearCandidate` | 0 | 3 | 1 |
| `buildMandateClearCandidate` | 2 | 1 | 0 |

| TP-03-03 declared behavior | Present in the named file? |
|---|---|
| inspect raw namespaced state with sentinels | Partial — sentinel helpers exist, but only over Scope 01 and 02 import and mandate state, never over a privacy inventory |
| fault every clear step | No |
| verify requested categories empty | No |
| preserve explicit and public categories | No |
| reject success on retained bytes | No |

The only clear this file invokes is `buildMandateClearCandidate`, which is Scope 02 mandate rollback. All five declared behaviors are implemented in `tests/portfolio-foundation.unit.mjs` instead, where TP-03-01 already claims them. TP-03-03's row therefore has no distinct carrier.

**Verdict: TP-03-03 DoD item left unchecked.** This is a Test Plan and test-file mismatch, not a test failure, and it is owned by `bubbles.plan` — either the row points at the file that carries the behavior, or the privacy suite gains the clear-fault and post-clear-verification coverage the row promises.

### TP-03-04

**Claim Source:** not-run

Playwright `e2e-ui` row. Not executed this run; the run was scoped to the three Node suites. No evidence.

### TP-03-05

**Claim Source:** not-run

Playwright `e2e-ui` row. Not executed this run. No evidence.

### TP-03-06

**Claim Source:** not-run

Broader Playwright `e2e-ui` row. Not executed this run. No evidence.

## Scenario Contract Evidence

### Scenario SCN-008-011

**Claim Source:** interpreted, from the executed TP-03-01 and TP-03-02 output above

The Node layer carries the scenario's mechanics: eligible events and derived signals are removed (`behavior clear empties behavior categories only after they are proven non-empty and preserves portfolio and mandate identity`), the next composition carries no behavior-derived influence (`recomposition after the clear must equal the pre-evidence baseline exactly`), and the preserved set holds byte for byte (`explicit portfolio facts survive a behavior clear byte for byte`, `mandate and cash needs survive a behavior clear byte for byte`, `holdings survive a behavior clear`, `the mandate and its cash needs survive a behavior clear`).

The scenario is **not** closed. Its UI Scenario Matrix row is `e2e-ui`, and the user-visible half — opening Local Privacy, inspecting categories, confirming the clear, and observing immediate recomposition — has no evidence because TP-03-04 was not run.

### Scenario SCN-008-012

**Claim Source:** interpreted, from the executed TP-03-01 and TP-03-02 output above

The exclusion contract is carried mechanically by the full declared-token sweep and by `only an eligible completion becomes behavior evidence and no excluded source can create or grow one`. Ranking optimizing research relevance rather than engagement is carried by `route recomposition is invariant to behavior evidence and states that behavior contributes none`.

The scenario is **not** closed. The matrix row is `e2e-ui` and requires that no hidden score, trait, cross-device identifier, or engagement copy appears in the running UI. That is a DOM assertion with no Node-layer equivalent, and TP-03-05 was not run.

## Coverage Report

Requirement-id coverage was scored per id using the guarded scan from decision D-03-02.

### DoD core item 1 — FR ids: 9 of 15 carried

| Id | Carried | Carrying assertion, or gap |
|---|---|---|
| FR-019 | No | Provenance appears only as `provenanceClass` on holdings under an FR-017 label. No assertion enumerates the six declared provenance classes, and the behavior-derived-interest, model-estimate, and recommendation classes are unexercised. |
| FR-022 | Yes | `FR-017 FR-022 FR-033: …` per-attempt `requirement: 'FR-022'` cases and `FR-022 behavior must contribute nothing after every attempt`; plus `route recomposition is invariant to behavior evidence and states that behavior contributes none` |
| FR-023 | No | No local-only, remote, or network assertion exists in any of the three suites |
| FR-027 | Yes | `privacy inventory reports real category counts and carries no stored subject value`, with `every declared category is reported, including the zeroes` |
| FR-028 | Yes | `behavior clear empties behavior categories only after they are proven non-empty and preserves portfolio and mandate identity`; `a behavior clear is not a portfolio clear` |
| FR-029 | Partial | Removal and public-asset preservation carried by `full-personal clear …`. The explicit-confirmation half is unasserted, since the typed confirmation is `e2e-ui` and TP-03-04 through TP-03-06 were not run. |
| FR-030 | Yes | Declared-token sweep exercises the cross-device, sync-profile, advertising-id, and account-linked tokens under `every declared token must have been exercised, not merely iterated over` |
| FR-031 | Yes | Same sweep over the dwell, click-count, scroll, return-frequency, notification-open, open-count, and engagement tokens; plus route invariance |
| FR-032 | Yes | Same sweep over the health, family, politics, religion, ethnicity, income, wealth-class, diagnosis, and sensitive-trait tokens |
| FR-033 | Yes | Same sweep over the setting, preference, shock-magnitude, risk-control, display-mode, and parameter-value tokens; plus `requirement: 'FR-033'` |
| FR-034 | Yes | `behavior event vocabulary is closed to the declared categories lifecycle states and draft fields`; `a partial draft cannot become an eligible event` |
| FR-035 | Yes | Same sweep over the raw-text, credential, quantity, cost-basis, P&L, goal-amount, and cash-amount tokens |
| FR-036 | No | Zero occurrences of the decay, half-life, or sensitivity concepts across all three suites. The evidence-floor and decay policy is never asserted to be visible, versioned, or sensitivity-tested. |
| FR-037 | No | Quarantine assertions cover unknown *workspace* shapes, not corrupt, unrecognized, or future-version *behavior records*. `quarantine is never a user-supplied state` is the inverse claim. No inspectable-reason assertion exists for a quarantined behavior record. |
| FR-038 | Partial | `hostile manual labels remain inert data and namespace writes stay closed` covers import labels as inert data. Zero markup, innerHTML, or navigation assertions, and recommendation text is not covered. |

### DoD core item 2 — NFR ids: 3 of 7 carried

| Id | Carried | Carrying assertion, or gap |
|---|---|---|
| NFR-001 | No | No public-surface, remote, or network assertion exists in these Node suites |
| NFR-003 | Partial | Named in the privacy suite title, but explicitly scoped "on the mandate surface", which is Scope 02. No behavior-surface explainability assertion exists. |
| NFR-004 | Yes | Declared-token sweep over the click, dwell, return-frequency, and engagement tokens, plus `route recomposition is invariant to behavior evidence …` |
| NFR-008 | Yes | `slot and pointer faults preserve the last-known-good revision`; `post-write slot corruption is detected before pointer publication`; `a key that survives deletion can never be reported as cleared`; `a partial deletion emits no success state at all` |
| NFR-019 | Partial | Credential half carried by `secret-shaped import rejects the full draft with value-safe PortfolioError values`. The executable-markup half is unasserted. |
| NFR-023 | Partial | Inspecting what clearing changes is carried by the inventory category counts and `the reported cleared count must match the proven pre-clear population`. Tracing every recommendation has no carrier, because no recommendation surface exists in these suites. |
| NFR-024 | Yes | `verified clear covers every policy-declared personal key and leaves the raw namespace holding none of them`; `emptiness is proven by an independent reread, not by the clear call reporting on itself`; `no key may survive in the raw local namespace` and the session equivalent |

### DoD core item 3 — full-personal clear sections: 9 of 13 verified

Verified: holdings, mandate and needs, events, interests, outcomes, quarantine, session fallback, return context, and generic public assets remaining (`the surviving generic caches must be byte-identical, not re-serialized or truncated`).

Not verified: **scenarios, allocations, dossiers, UI state.** The first three are not array sections of the workspace contract yet and the fourth has no declared storage key, so the clear has nothing to verify for them today. The sweep is derived from the empty workspace rather than hardcoded, so it will absorb those sections when later scopes introduce them. A sweep that *will* cover a category is not evidence that the category *is* covered.

### DoD core item 5 — RED and GREEN pairs: 0 of 14

Every Scope 03 behavior below has committed same-command GREEN. **None has a recorded intended RED.** `report.md` held no RED record before this run, and this run was barred from injecting defects, so no RED could be produced.

| # | Behavior | GREEN | Intended RED |
|---|---|---|---|
| 1 | Closed behavior event vocabulary | Yes | No |
| 2 | Declared excluded-source rejection at any casing, separator, or depth | Yes | No |
| 3 | Semantic de-duplication to earliest occurrence | Yes | No |
| 4 | Action-outcome command-to-state mapping | Yes | No |
| 5 | Privacy inventory projection without stored values | Yes | No |
| 6 | Atomic behavior-only clear preserving portfolio and mandate | Yes | No |
| 7 | Verified clear reread with remove-fault refusal | Yes | No |
| 8 | Verified clear covering every policy-declared personal key | Yes | No |
| 9 | Full-personal clear with byte-identical generic assets | Yes | No |
| 10 | Inventory and verified clear available without policy config | Yes | No |
| 11 | Eligible-completion-only behavior evidence derivation | Yes | No |
| 12 | Route recomposition invariance to behavior evidence | Yes | No |
| 13 | Behavior clear returning recomposition to the pre-evidence baseline | Yes | No |
| 14 | Dismissal and automatic invalidation recording no negative preference | Yes | No |

## Lint And Quality

**Claim Source:** executed. The artifact lint result is recorded in [Validation Summary](#validation-summary).

The Build Quality Gate DoD item was not assessed and not ticked this run, per the run's explicit instruction.

## Uncertainty Declarations

Ten DoD items are left unchecked. Each gap is named exactly rather than deferred.

| DoD item | Why it is unchecked |
|---|---|
| Core 1 — FR-019, FR-022 through FR-023, FR-027 through FR-038 | 9 of 15 ids carried. **Uncovered: FR-019, FR-023, FR-036, FR-037. Partial: FR-029** (confirmation half), **FR-038** (executable-markup and navigation half, plus recommendation text). |
| Core 2 — NFR-001, NFR-003 through NFR-004, NFR-008, NFR-019, NFR-023 through NFR-024 | 3 of 7 ids carried. **Uncovered: NFR-001. Partial: NFR-003** (mandate surface only), **NFR-019** (markup half), **NFR-023** (recommendation-tracing half). |
| Core 3 — full-personal clear section verification | 9 of 13 sections verified. **Unverified: scenarios, allocations, dossiers, UI state.** See decision D-03-03: this contradicts the run briefing and is surfaced rather than absorbed. |
| Core 4 — impact sweep, canaries, rollback and restore proof | The Scope 01 and 02 re-run and the raw-namespace and clear-fault canaries are carried. The **exact rollback and restore proof** for this scope's own marker-bounded additions is a source-rollback procedure that no executed command demonstrates. |
| Core 5 — RED plus same-command GREEN | **0 of 14 behaviors have an intended RED.** GREEN is complete; RED is entirely absent. |
| TP-03-03 | Suite is green 11 of 11 but contains **zero** `privacyInventory`, `clearFoundationStorage`, or `buildBehaviorClearCandidate` calls. Four of its five declared behaviors are absent from the file the row names. |
| TP-03-04 | Not executed. |
| TP-03-05 | Not executed. |
| TP-03-06 | Not executed. |
| Build Quality Gate | Deliberately not assessed this run. |

Two scope-level consequences follow, both owned outside this agent:

1. **TP-03-03 row and file mismatch** — routed to `bubbles.plan`. The row must either name the file that carries the behavior, or the privacy suite must gain the clear-fault and post-clear-verification coverage it promises.
2. **FR-023 and NFR-001 have no Node-layer carrier by construction.** Absence from all public and remote surfaces needs a no-external-request scan, which is an `e2e-ui` or dedicated-scan concern. Neither exists in the current Test Plan, so those ids cannot be closed by any currently planned row.

## Validation Summary

**Claim Source:** executed

| Check | Command | Exit Code |
|---|---|---|
| TP-03-01 | `node --test tests/portfolio-foundation.unit.mjs` | 0 — 31 pass, 0 fail |
| TP-03-02 | `node --test tests/portfolio-brief.functional.mjs` | 0 — 4 pass, 0 fail |
| TP-03-03 | `node --test tests/portfolio-privacy.functional.mjs` | 0 — 11 pass, 0 fail |
| Artifact lint | `bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab` | 0 |

All three suites pass. Suite health is not the constraint on this scope; evidence coverage is.

## Audit Verdict

No audit verdict is recorded. Scope 03 is not eligible for audit while ten DoD items lack evidence.
