# Scope 03 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md) | [uservalidation.md](../../uservalidation.md)

## Summary

Evidence-recording run only. No test code was written, no defect was injected, and no production source was changed. The three committed Node suites named by TP-03-01 through TP-03-03 were re-executed and their raw output recorded below, then each DoD item was assessed against the specific assertions the committed tests genuinely carry.

Result: **4 of 12 DoD items ticked** (TP-03-01, TP-03-02, core item 1, core item 2). Eight items remain unchecked, each with the exact uncovered requirement ids or behaviors named in [Uncertainty Declarations](#uncertainty-declarations). Core items 1 and 2 were ticked on a later pass after the committed suites gained a named assertion for every id those items enumerate; the re-run output and the per-id map are recorded below. The Build Quality Gate item was deliberately not assessed.

The single most significant finding is that **TP-03-03 is green but does not carry its declared behavior** — see [TP-03-03](#tp-03-03).

## Decision Record

- **D-03-01** — Requirement coverage was scored per individual id, not per DoD sentence. An item naming many ids is ticked only when every id it names is carried by a specific named assertion. Blanket claims were rejected.
- **D-03-02** — The FR/NFR scan used a negative-lookbehind guard, `(?<!N)FR-\d{3}`, because `FR-022` is a substring of `NFR-022` and `FR-012` of `NFR-012`. An unguarded scan credits `tests/portfolio-privacy.functional.mjs` with FR-003/005/007/012/022 that are in fact the NFR ids in that file's `NFR-003 NFR-005 NFR-007 NFR-012 NFR-022` title. Both genuine FR occurrences were then confirmed by reading their assertion sites.
- **D-03-03** — This run disagrees with one premise of its own briefing. DoD core item 3 (full-personal clear) was flagged as carried; assessment found 9 of its 13 named sections verified. The item is left unchecked and the 4 unverified sections are named. Recorded here so the operator can overrule with the gap visible rather than hidden.
- **D-03-04** — A green suite is not evidence for a Test Plan row whose declared behavior it does not contain. TP-03-03 passes 11/11 and is still left unchecked.
- **D-03-05** — Core items 1 and 2 were re-scored with a stricter rule than D-03-02 used. An id counts only when it sits in the **message argument** of an `assert.*` call, resolved by balanced-paren argument splitting so an expected value cannot be mistaken for a message; a comment, a `test(...)` title, and a bare code identifier are all rejected. The guard was widened from `(?<!N)` to `(?<![A-Za-z])` with a trailing `(?![0-9])`, so no letter-prefixed id and no longer numeric id can leak in. Measured effect on this tree: `FR-019` falls from 41 raw occurrences to 10 guarded, `FR-023` from 60 to 36.
- **D-03-06** — Interpolated carriage is accepted as real carriage. FR-030, FR-031, FR-032, and FR-035 never appear as a literal inside a message; they are keys of the frozen `EXCLUDED_SOURCE_TOKENS_BY_REQUIREMENT` table and reach the message through `${requirement}`. That is not name-only presence, because the table length, each token list's non-emptiness, the attempted-versus-declared token count, and the union against the policy's excluded-field count are each asserted, so dropping a requirement or emptying its list goes red. The class is recorded per id in the Coverage Report rather than blended into the literal count.

## Completion Statement

Scope 03 is **not** complete. Eight of twelve DoD items lack the evidence they require. Scope status remains `In Progress`.

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

### Re-run for DoD core items 1 and 2

The three Node rows were re-executed against the committed tree so the per-id map
below is scored on output produced in this run rather than on a prior transcript.

**Claim Source:** executed
**Command:** `node --test tests/portfolio-foundation.unit.mjs`
**Exit Code:** 0

```
✔ unknown legacy workspace shapes refuse migration and quarantine metadata is value-safe (1.863799ms)
✔ foundation privacy inventory and verified clear remain available without policy config (1.145099ms)
✔ behavior event vocabulary is closed to the declared categories lifecycle states and draft fields (27.006383ms)
✔ every declared excluded behavior source is rejected by name in any casing or separator form at any depth (20.767987ms)
✔ semantic de-duplication collapses same-day repeats to the earliest occurrence without shrinking distinct evidence (43.331673ms)
✔ action outcome commands map to exactly one lifecycle state and reject mismatched or unknown transitions (10.851893ms)
✔ privacy inventory reports real category counts and carries no stored subject value (57.226063ms)
✔ behavior clear empties behavior categories only after they are proven non-empty and preserves portfolio and mandate identity (64.226158ms)
✔ verified foundation clear reports empty only after reread and a remove fault cannot report success (1.814099ms)
✔ verified clear covers every policy-declared personal key and leaves the raw namespace holding none of them (2.316799ms)
✔ full-personal clear empties every declared personal section and leaves generic public assets byte-identical (69.235755ms)
✔ FR-019: a stored holding carries exactly one declared provenance class and each of the other five declared classes is refused as an invalid class (4.965597ms)
✔ FR-036: every behavior evidence-floor and decay input is a visible declared finite policy value and its version is stamped onto every event (2.561198ms)
✔ FR-037: a corrupt unrecognized or future-version behavior record is quarantined with an inspectable reason and no part of the workspace is interpreted (68.235556ms)
✔ FR-029: no read compose inventory or export path removes personal data, and the same bytes do clear when the clear is explicitly invoked (35.213177ms)
✔ FR-030 FR-031 FR-032 FR-033 FR-035: every excluded source named by each requirement is a declared token, is refused by name on both the build and the persistence path, and the refusal is selective (153.518001ms)
✔ FR-023: the module carries no egress sink, every byte it writes lands in the declared personal namespace, and the preview that declares it excludes personal values genuinely excludes them (52.210267ms)
✔ FR-027: the local privacy inventory reports each named personal group on its own surface, separates dismissed from completed, and keeps cached generic evidence out of the personal count (92.34584ms)
✔ FR-028: a behavior clear removes the eligible events and empties the derived-interest container while holdings mandate and cash needs survive, and the separately requested clears do remove them (55.30567ms)
✔ FR-034: an eligible behavior event is admitted only for a documented completed research action and retains category subject domain timestamp source surface and lifecycle state (14.227495ms)
✔ FR-038: an imported provider label carrying markup or a navigation scheme is retained as inert text with no navigation authority, and the recommendation token fields refuse it while still accepting a legitimate token (79.824371ms)
✔ NFR-001: every personal noun the id names is stored in the declared local namespace and appears in none of the public projections the module emits, while the local-only projections that legitimately carry it prove the same search does find it (57.968678ms)
✔ NFR-004: no declared ranking input is an engagement metric, every click dwell and retention source is refused by name on the path that grows ranking evidence, and a research completion is still admitted and still counted (43.686384ms)
✔ NFR-008: a throwing store and a silently dropping store both surface an explicit write failure with no success state, capability loss is reported in words, and the same commit still succeeds unfaulted (31.638388ms)
✔ NFR-019: every declared credential field name and credential value shape is rejected without echoing the value, markup does not smuggle a credential past the guard, and an ordinary provider label is still imported (22.666092ms)
✔ NFR-023: a recommendation route cites the exact revision identity it used or names why it cannot, and a clear reports a per-category change that matches the inspected before and after inventory (68.312875ms)
✔ NFR-024: local deletion is certified only after an independent reread proves emptiness, a survivor or an unreadable key blocks the success state, and the raw namespace confirms it without trusting the report (2.460499ms)
ℹ tests 47
ℹ suites 0
ℹ pass 47
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1796.388172
```

**Claim Source:** executed
**Command:** `node --test tests/portfolio-brief.functional.mjs`
**Exit Code:** 0

```
✔ only an eligible completion becomes behavior evidence and no excluded source can create or grow one (175.727534ms)
✔ route recomposition is invariant to behavior evidence and states that behavior contributes none (27.770421ms)
✔ behavior clear removes the committed evidence and returns recomposition to the pre-evidence baseline (79.12096ms)
✔ dismissal and automatic invalidation record a safe outcome and never a behavior event or a negative preference (22.852818ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 429.427826
```

**Claim Source:** executed
**Command:** `node --test tests/portfolio-privacy.functional.mjs`
**Exit Code:** 0

```
✔ real-format import previews commits reloads and exports one local revision (55.38658ms)
✔ secret-bearing import is redacted and cannot mutate any storage namespace (15.864423ms)
✔ atomic write failures preserve the active pointer and retain a validated candidate only in memory (30.145744ms)
✔ session and memory commits state truthfully and preserve the last valid candidate after rejection (25.110036ms)
✔ hostile manual labels remain inert data and namespace writes stay closed (9.324414ms)
✔ explicit mandate revisions commit and reload atomically while portfolio generation semantics are preserved (63.210692ms)
✔ one reloaded constraint set reaches every consumer and absent or conflicting fields never acquire defaults (49.421671ms)
✔ FR-011 to FR-016: declared purpose units authority dates amounts currencies priorities and treatment reach the candidate unchanged and an infeasible draft fails loudly with nothing relaxed (21.227531ms)
✔ NFR-003 NFR-005 NFR-007 NFR-012 NFR-022: provenance missing-state integrity atomic revisions latest-complete publication and the research boundary all hold on the mandate surface (161.662834ms)
✔ FR-017 FR-022 FR-033: behavior settings and market-fact relabelling attempts are refused and change no mandate cash need expected return floor objective or constraint state (30.744945ms)
✔ rolling a mandate back restores the pre-mandate portfolio state by identity, not by resemblance (30.573744ms)
ℹ tests 11
ℹ suites 0
ℹ pass 11
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 636.142419
```

Tally across the three rows: **62 pass, 0 fail, 0 skipped, 0 todo.**

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

### Scoring rule and the substring guard

An id counts as **carried** only when it appears inside the **message argument** of an
`assert.*` call. A comment, a `test(...)` title, or a bare code identifier does not
count. Message position is resolved by balanced-paren argument splitting, so the id must
sit in the final argument, not in an expected value.

Matching is guarded on a preceding non-letter and a following non-digit. Without the
leading guard, `FR-019` matches inside `NFR-019`, `FR-022` inside `NFR-022`, and `FR-023`
inside `NFR-023`, and all three of those NFR ids are themselves covered. An unguarded
scan therefore credits item 1's ids with item 2's evidence. The delta is not marginal:

| Id | Raw occurrences | Guarded occurrences | Shadowed by the NFR id |
|---|---|---|---|
| FR-019 | 41 | 10 | 31 |
| FR-022 | 17 | 10 | 7 |
| FR-023 | 60 | 36 | 24 |

### DoD core item 1 — FR ids: 15 of 15 carried

Eleven ids are carried by a literal id inside the message. Four — FR-030, FR-031,
FR-032, FR-035 — are carried by an interpolated `${requirement}` message driven by the
frozen `EXCLUDED_SOURCE_TOKENS_BY_REQUIREMENT` table whose keys are exactly those ids
plus FR-033. That carriage is table-driven rather than literal, so it is recorded as its
own class below. It is not vacuous: the table length is asserted (`five requirements must
be exercised, not merely declared`), every token list is asserted non-empty per
requirement, the loop counter is reconciled against the declared token count (`every
declared excluded source must have been attempted, not merely iterated over`), and the
union of the five token lists is asserted equal to the policy's declared excluded-field
count, so a token with no requirement owner goes red.

| Id | Carried | Carriage class | Carrying assertion |
|---|---|---|---|
| FR-019 | Yes | literal, 8 messages | `FR-019 declares six distinct provenance classes, so the attempt set must hold six`, under the dedicated one-valid-class-five-refused test |
| FR-022 | Yes | literal, 1 message | `FR-022 behavior must contribute nothing after every attempt` |
| FR-023 | Yes | literal, 31 messages | `FR-023 comment stripping must leave the module substantially intact, or every sink claim below is made against a blank file`, under the no-egress-sink and declared-namespace test |
| FR-027 | Yes | literal, 25 messages | `FR-027 the inventory must build: …`, under the per-group inventory test |
| FR-028 | Yes | literal, 22 messages | `FR-028 behavior evidence must genuinely exist before a clear can remove it` |
| FR-029 | Yes | literal, 5 messages | `FR-029 personal bytes must genuinely exist, or "nothing was removed" holds for an empty namespace` |
| FR-030 | Yes | interpolated, table key | `${requirement} a behavior draft carrying ${token} must not become an event` and five sibling messages, over the cross-device, sync-profile, advertising-id, and account-linked tokens |
| FR-031 | Yes | interpolated, table key | Same six per-token messages over the dwell, click-count, scroll, return-frequency, notification-open, open-count, and engagement tokens |
| FR-032 | Yes | interpolated, table key | Same six per-token messages over the health, family, politics, religion, ethnicity, income, wealth-class, diagnosis, and sensitive-trait tokens |
| FR-033 | Yes | literal, 1 message, plus the same table | `FR-033 settings must contribute nothing after every attempt` |
| FR-034 | Yes | literal, 24 messages | `FR-034 an empty documented category list would make every per-category claim vacuous` |
| FR-035 | Yes | interpolated, table key | Same six per-token messages over the raw-text, credential, quantity, cost-basis, P&L, goal-amount, and cash-amount tokens |
| FR-036 | Yes | literal, 9 messages | `FR-036 ${input} must be visible in the policy file a reader can open, not buried in code` |
| FR-037 | Yes | literal, 12 messages | `FR-037 a ${damaged.name} behavior record must not open`, under the corrupt, unrecognized, and future-version quarantine test |
| FR-038 | Yes | literal, 21 messages | `FR-038 control: a plain provider label must import: …`, under the inert-markup and inert-navigation test |

Residual fact a reader should carry forward: FR-022 and FR-033 each rest on a single
literal message. Both are real per-requirement claims on the route projection, but they
are the thinnest carriage in the item.

### DoD core item 2 — NFR ids: 7 of 7 carried

Every id is carried by a literal id inside the message. No id in this item depends on
interpolation.

| Id | Carried | Carriage class | Carrying assertion |
|---|---|---|---|
| NFR-001 | Yes | literal, 22 messages | `NFR-001 every noun the id names that is representable at this scope must carry a sentinel, or the sweep below is short`, under the local-namespace versus public-projection test |
| NFR-003 | Yes | literal, 9 messages | `NFR-003 the mandate must name its input authority`, plus the constraint, cash-need, projection-citation, absent-field, uncertainty-reason, and invalidation arms |
| NFR-004 | Yes | literal, 22 messages | `NFR-004 control: a documented research completion must still be admitted: …`, under the no-engagement-objective test |
| NFR-008 | Yes | literal, 23 messages | `NFR-008 control: an unfaulted commit must succeed: …`, under the throwing-store and silently-dropping-store test |
| NFR-019 | Yes | literal, 28 messages | `NFR-019 control: an ordinary import must parse: …`, under the credential-name, credential-shape, and markup-smuggling test |
| NFR-023 | Yes | literal, 21 messages | `NFR-023 the restated mandate draft must validate: …`, under the revision-citation and per-category clear-change test |
| NFR-024 | Yes | literal, 20 messages | `NFR-024 the clear must start from storage that provably holds every declared personal key`, under the independent-reread certification test |

Residual fact a reader should carry forward: all nine NFR-003 messages sit inside the
single test whose own title ends "all hold on the mandate surface", which is Scope 02's
surface. NFR-003 is genuinely carried by named assertions, and this run did not move it
onto the behavior, inventory, or clear surface. The explainability claim on this scope's
own surface is carried under NFR-023 instead.

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

Eight DoD items are left unchecked. Each gap is named exactly rather than deferred.

Core items 1 and 2 were previously listed here and are now ticked. Core 1 reached 15 of 15
ids and Core 2 reached 7 of 7, verified by the guarded scan in the Coverage Report. Two
residual facts survive the tick and are recorded there rather than dropped: four of Core
1's ids are carried by an interpolated table-driven message rather than a literal one, and
every Core 2 carrier for NFR-003 sits on the Scope 02 mandate surface.

| DoD item | Why it is unchecked |
|---|---|
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
