# Scope 03 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md) | [uservalidation.md](../../uservalidation.md)

## Summary

Evidence-recording run only. No test code was written, no defect was injected, and no production source was changed. The three committed Node suites named by TP-03-01 through TP-03-03 were re-executed and their raw output recorded below, then each DoD item was assessed against the specific assertions the committed tests genuinely carry.

Result: **5 of 12 DoD items ticked** (TP-03-01, TP-03-02, TP-03-03, core item 1, core item 2). Seven items remain unchecked, each with the exact uncovered requirement ids or behaviors named in [Uncertainty Declarations](#uncertainty-declarations). The Build Quality Gate item and core items 4 and 5 were deliberately not assessed on this pass.

The previously-recorded headline finding — **TP-03-03 is green but does not carry its declared behavior** — is now closed. Two tests committed at HEAD `c4165577` moved the declared clear/inventory behavior into the file the row names, and every clause of the row is carried there; see [TP-03-03](#tp-03-03).

The remaining headline finding is core item 3. Its coverage improved materially, but the improvement lands on a different enumeration than the DoD line uses, and the line is left unchecked for four nouns that have no runtime surface at all — see decision D-03-08 and [core item 3](#dod-core-item-3--full-personal-clear-the-two-thirteens).

## Decision Record

- **D-03-01** — Requirement coverage was scored per individual id, not per DoD sentence. An item naming many ids is ticked only when every id it names is carried by a specific named assertion. Blanket claims were rejected.
- **D-03-02** — The FR/NFR scan used a negative-lookbehind guard, `(?<!N)FR-\d{3}`, because `FR-022` is a substring of `NFR-022` and `FR-012` of `NFR-012`. An unguarded scan credits `tests/portfolio-privacy.functional.mjs` with FR-003/005/007/012/022 that are in fact the NFR ids in that file's `NFR-003 NFR-005 NFR-007 NFR-012 NFR-022` title. Both genuine FR occurrences were then confirmed by reading their assertion sites.
- **D-03-03** — *Superseded by D-03-08; retained as the record of its own pass.* This run disagrees with one premise of its own briefing. DoD core item 3 (full-personal clear) was flagged as carried; assessment found 9 of its 13 named sections verified. The item is left unchecked and the 4 unverified sections are named. Recorded here so the operator can overrule with the gap visible rather than hidden.
- **D-03-04** — *Spent, not reversed; see D-03-07.* A green suite is not evidence for a Test Plan row whose declared behavior it does not contain. TP-03-03 passes 11/11 and is still left unchecked.
- **D-03-05** — Core items 1 and 2 were re-scored with a stricter rule than D-03-02 used. An id counts only when it sits in the **message argument** of an `assert.*` call, resolved by balanced-paren argument splitting so an expected value cannot be mistaken for a message; a comment, a `test(...)` title, and a bare code identifier are all rejected. The guard was widened from `(?<!N)` to `(?<![A-Za-z])` with a trailing `(?![0-9])`, so no letter-prefixed id and no longer numeric id can leak in. Measured effect on this tree: `FR-019` falls from 41 raw occurrences to 10 guarded, `FR-023` from 60 to 36.
- **D-03-06** — Interpolated carriage is accepted as real carriage. FR-030, FR-031, FR-032, and FR-035 never appear as a literal inside a message; they are keys of the frozen `EXCLUDED_SOURCE_TOKENS_BY_REQUIREMENT` table and reach the message through `${requirement}`. That is not name-only presence, because the table length, each token list's non-emptiness, the attempted-versus-declared token count, and the union against the policy's excluded-field count are each asserted, so dropping a requirement or emptying its list goes red. The class is recorded per id in the Coverage Report rather than blended into the literal count.
- **D-03-07** — D-03-04 is now spent, not reversed. It said a green suite is not evidence for a row whose declared behavior it does not contain, and that stays true. What changed is the file: two tests committed at HEAD `c4165577` put the clear, inventory, and per-step fault behavior into `tests/portfolio-privacy.functional.mjs`, so the row's carrier is now the file the row names. TP-03-03 was re-assessed clause by clause against that file rather than inherited from the earlier verdict, and every clause was found carried. The routing note to `bubbles.plan` is withdrawn: the row and the file agree, so no Test Plan edit is owed.
- **D-03-08** — Core item 3 stays unchecked, and the reason is narrower and better-evidenced than the earlier "9 of 13". The improvement is real: 11 of the 13 surfaces the clear sweeps are now proven non-empty first, and the two that cannot be are pinned by a dedicated refusal test. The blocker is that the DoD line enumerates **nouns**, not surfaces, and both counts happen to total 13 — a coincidence that makes the sweep look complete against a line it does not actually satisfy. Four of the line's nouns (scenarios, allocations, dossiers, UI state) have no workspace section and no storage key, so nothing observes them. The mitigating argument ("the derived sweep absorbs them later") was tested rather than accepted, and it fails for UI state specifically: see [core item 3](#dod-core-item-3--full-personal-clear-the-two-thirteens). Recorded so the operator can overrule with the exact residual visible.

## Completion Statement

Scope 03 is **not** complete. Seven of twelve DoD items lack the evidence they require. Scope status remains `In Progress`.

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
✔ real-format import previews commits reloads and exports one local revision (39.841682ms)
✔ secret-bearing import is redacted and cannot mutate any storage namespace (35.941584ms)
✔ atomic write failures preserve the active pointer and retain a validated candidate only in memory (39.309782ms)
✔ session and memory commits state truthfully and preserve the last valid candidate after rejection (29.866186ms)
✔ hostile manual labels remain inert data and namespace writes stay closed (9.516796ms)
✔ explicit mandate revisions commit and reload atomically while portfolio generation semantics are preserved (72.045866ms)
✔ one reloaded constraint set reaches every consumer and absent or conflicting fields never acquire defaults (64.02257ms)
✔ FR-011 to FR-016: declared purpose units authority dates amounts currencies priorities and treatment reach the candidate unchanged and an infeasible draft fails loudly with nothing relaxed (20.143291ms)
✔ NFR-003 NFR-005 NFR-007 NFR-012 NFR-022: provenance missing-state integrity atomic revisions latest-complete publication and the research boundary all hold on the mandate surface (169.553519ms)
✔ FR-017 FR-022 FR-033: behavior settings and market-fact relabelling attempts are refused and change no mandate cash need expected return floor objective or constraint state (62.76457ms)
✔ rolling a mandate back restores the pre-mandate portfolio state by identity, not by resemblance (50.958475ms)
✔ each declared privacy category is deleted by the clear that names it and survives the clear that does not, one category at a time (64.775069ms)
✔ every declared clear step is faulted on its own, the other steps still delete, and the retained bytes refuse a success result (2.295399ms)
ℹ tests 13
ℹ suites 0
ℹ pass 13
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 847.010298
```

**The row's earlier gap is closed.** The previous assessment recorded zero `privacyInventory`, zero `clearFoundationStorage`, and zero `buildBehaviorClearCandidate` calls in the named file. Re-counted at HEAD `c4165577`:

| Entry point | Occurrences in `tests/portfolio-privacy.functional.mjs` |
|---|---|
| `privacyInventory` | 3 |
| `clearFoundationStorage` | 4 |
| `buildBehaviorClearCandidate` | 1 |
| `foundationPrivacyInventory` | 1 |
| `buildMandateClearCandidate` | 2 |

**Clause map — every clause the DoD line names, mapped to its carrying assertion.** The line reads: *"proves category-by-category verified deletion, preservation, and partial-failure truth against raw namespaced state."*

| Clause | Carrying assertion in the named file |
|---|---|
| **category-by-category** | `every populatable category must behave exactly as its clearedBy declaration and the all-personal verified-empty contract say` — a six-row × two-operation matrix, one row per populated category. The category list and each row's expected verdict are read off the inventory's own `clearedBy` declaration, so a category added later is classified by its own declaration; an unrecognised token is refused by `a new clearedBy token would leave its categories unclassified by the matrix below`. |
| **verified deletion** | The post-clear state is re-read by reopening the store from persisted bytes, not from the in-process candidate. The all-personal arm additionally requires `verifiedEmpty` true with an empty remaining-personal-key list before `a verified-empty all-personal clear must leave no personal category holding a record` is accepted. |
| **preservation** | `the behavior clear must empty exactly the categories that declare it and leave every other category at its exact prior count` — bystanders are held to their **exact prior record count**, so a clear that dropped one of several revisions fails even though the category is still present. Breadth is pinned by `five categories must be observed surviving the behavior clear, or "category-by-category" collapses to one whole-store wipe`. Generic public assets are asserted byte-identical on both arms. |
| **partial-failure truth** | `every declared clear step must have been faulted on its own, not a subset` — all six declared steps faulted individually. Per fault: refusal carries `P008-STORE-WRITE` with reason `foundation-clear-incomplete`, is marked recoverable, does not echo the retained bytes, and carries **no** success payload at all. |
| **against raw namespaced state** | Each declared key is seeded with its own distinct per-key sentinel written straight into the raw local and session namespaces, and the post-fault verdict is read back through raw `getItem` and a raw-namespace inventory: `the surviving personal key must be the faulted one and nothing else`. |

**Anti-vacuity and red-ability are both genuine, not asserted.**

- Anti-vacuity is applied **per category** and **per step** rather than once globally, which matters because a single whole-store guard passes whenever any one category happened to be empty already: `six declared categories must genuinely hold records before any clear, or every emptiness assertion below is vacuous`, and per step `<key> must hold its sentinel before the clear, or its deletion proves nothing`.
- The preservation half is proven capable of failing by aiming the identical checker at the all-personal clear — a real executed operation that empties everything — and requiring it to name all five destroyed bystanders. Were that inert, a blunt wipe would pass as a correct per-category delete.
- The per-step checker is proven capable of failing by wrapping one adapter so a second key is **silently skipped** rather than throwing, and requiring the checker to name exactly that key. A throwing fault alone cannot model a step that quietly does nothing.
- A control clears the same seeded namespace with no fault and must succeed, so the six refusals are caused by the injected fault rather than by a clear that never works.

**Two residuals recorded rather than absorbed, neither of which withholds the tick:**

1. On the behavior-clear arm exactly one populated category is proven deleted; the other five are proven preserved. Deletion breadth comes from the all-personal arm, where all six are proven deleted. This is a property of the runtime's `clearedBy` declaration, not a test gap, and it is itself pinned by `exactly one populated category declares only the behavior clear, and it is still emptied by the all-personal clear above`.
2. The matrix covers six of the eight declared inventory categories. The other two cannot be populated at this scope and are excluded from the proven set by an explicit named assertion inside the test rather than silently counted — the same limit core item 3 turns on, handled honestly here.

**Verdict: TP-03-03 DoD item ticked.** The routing note to `bubbles.plan` recorded on the previous pass is withdrawn; the row and the file now agree.

### TP-03-04

**Claim Source:** not-run

Playwright `e2e-ui` row. Not executed this run; the run was scoped to the three Node suites. No evidence.

### TP-03-05

**Claim Source:** not-run

Playwright `e2e-ui` row. Not executed this run. No evidence.

### TP-03-06

**Claim Source:** not-run

Broader Playwright `e2e-ui` row. Not executed this run. No evidence.

### Current-run re-execution at HEAD `c4165577`

All three committed Node suites were re-executed in this run. Every suite cited anywhere in this report has its raw output recorded — the privacy suite under [TP-03-03](#tp-03-03), the other two here.

Counts moved because HEAD added tests, not because anything was removed. Foundation unit went 47 → 49 (`the two personal sections the clear sweep cannot populate are pinned by their own distinct refusal`, `exact rollback restores the pre-change workspace identity and the Scope 01/02 durable record survives a committed round trip`) and privacy functional went 11 → 13. Every test named in the earlier transcripts below is still present and still passing, so no previously-recorded carriage was lost. The earlier blocks are retained as honest records of their own runs rather than rewritten.

**Claim Source:** executed
**Command:** `node --test tests/portfolio-foundation.unit.mjs`
**Exit Code:** 0

```
✔ RLPORTFOLIO is a frozen Node and browser dual-runtime contract (15.396002ms)
✔ mandatory policy is closed versioned finite and rejects unknown configuration (3.612701ms)
✔ holding revision and workspace identities are strict deterministic contracts (41.065906ms)
✔ valid CSV preview exposes accepted normalized and unresolved duplicate states before confirmation (1.670301ms)
✔ duplicate choices are explicit and row removal can create a valid new preview (6.022301ms)
✔ unknown import fields remain blocking through duplicate resolution (2.5295ms)
✔ secret-shaped import rejects the full draft with value-safe PortfolioError values (1.6673ms)
✔ manual alternatives require valuation liquidity cost and uncertainty truth (2.414201ms)
✔ manual listed drafts use the same closed preview contract as file imports (2.3262ms)
✔ atomic durable commits use inactive slots verify bytes and reject generation conflicts (25.843105ms)
✔ clearing a portfolio is an atomic revision-state change that preserves immutable history (29.644904ms)
✔ slot and pointer faults preserve the last-known-good revision (28.443205ms)
✔ post-write slot corruption is detected before pointer publication (11.671502ms)
✔ future records remain untouched and durable session memory states are explicit (5.104301ms)
✔ unknown legacy workspace shapes refuse migration and quarantine metadata is value-safe (5.364101ms)
✔ foundation privacy inventory and verified clear remain available without policy config (0.7574ms)
✔ explicit mandate draft is a closed user-authority contract over units dates currencies and hard research classification (15.951002ms)
✔ absent mandate fields stay null and no default horizon floor objective or expected return is created (12.229002ms)
✔ conflicting mandate stays infeasible with every declared constraint and cash need preserved in declared order (4.514601ms)
✔ mandate revision identity is deterministic supersedes the prior mandate and never mutates the portfolio (63.502109ms)
✔ behavior events interest signals and display settings cannot create or modify any mandate field (3.919601ms)
✔ route projection cites one mandate revision and reports mandate-absent states without inventing values (33.380905ms)
✔ behavior event vocabulary is closed to the declared categories lifecycle states and draft fields (21.457503ms)
✔ every declared excluded behavior source is rejected by name in any casing or separator form at any depth (25.516104ms)
✔ semantic de-duplication collapses same-day repeats to the earliest occurrence without shrinking distinct evidence (22.101403ms)
✔ action outcome commands map to exactly one lifecycle state and reject mismatched or unknown transitions (13.664502ms)
✔ privacy inventory reports real category counts and carries no stored subject value (87.274813ms)
✔ behavior clear empties behavior categories only after they are proven non-empty and preserves portfolio and mandate identity (99.904615ms)
✔ verified foundation clear reports empty only after reread and a remove fault cannot report success (1.081501ms)
✔ verified clear covers every policy-declared personal key and leaves the raw namespace holding none of them (0.9178ms)
✔ full-personal clear empties every declared personal section and leaves generic public assets byte-identical (97.340114ms)
✔ the two personal sections the clear sweep cannot populate are pinned by their own distinct refusal (53.472308ms)
✔ exact rollback restores the pre-change workspace identity and the Scope 01/02 durable record survives a committed round trip (126.390919ms)
✔ FR-019: a stored holding carries exactly one declared provenance class and each of the other five declared classes is refused as an invalid class (4.468301ms)
✔ FR-036: every behavior evidence-floor and decay input is a visible declared finite policy value and its version is stamped onto every event (5.591001ms)
✔ FR-037: a corrupt unrecognized or future-version behavior record is quarantined with an inspectable reason and no part of the workspace is interpreted (70.84921ms)
✔ FR-029: no read compose inventory or export path removes personal data, and the same bytes do clear when the clear is explicitly invoked (51.217907ms)
✔ FR-030 FR-031 FR-032 FR-033 FR-035: every excluded source named by each requirement is a declared token, is refused by name on both the build and the persistence path, and the refusal is selective (109.701417ms)
✔ FR-023: the module carries no egress sink, every byte it writes lands in the declared personal namespace, and the preview that declares it excludes personal values genuinely excludes them (46.429007ms)
✔ FR-027: the local privacy inventory reports each named personal group on its own surface, separates dismissed from completed, and keeps cached generic evidence out of the personal count (69.73941ms)
✔ FR-028: a behavior clear removes the eligible events and empties the derived-interest container while holdings mandate and cash needs survive, and the separately requested clears do remove them (65.941909ms)
✔ FR-034: an eligible behavior event is admitted only for a documented completed research action and retains category subject domain timestamp source surface and lifecycle state (17.756502ms)
✔ FR-038: an imported provider label carrying markup or a navigation scheme is retained as inert text with no navigation authority, and the recommendation token fields refuse it while still accepting a legitimate token (98.882613ms)
✔ NFR-001: every personal noun the id names is stored in the declared local namespace and appears in none of the public projections the module emits, while the local-only projections that legitimately carry it prove the same search does find it (44.887707ms)
✔ NFR-004: no declared ranking input is an engagement metric, every click dwell and retention source is refused by name on the path that grows ranking evidence, and a research completion is still admitted and still counted (39.175605ms)
✔ NFR-008: a throwing store and a silently dropping store both surface an explicit write failure with no success state, capability loss is reported in words, and the same commit still succeeds unfaulted (42.541406ms)
✔ NFR-019: every declared credential field name and credential value shape is rejected without echoing the value, markup does not smuggle a credential past the guard, and an ordinary provider label is still imported (24.285403ms)
✔ NFR-023: a recommendation route cites the exact revision identity it used or names why it cannot, and a clear reports a per-category change that matches the inspected before and after inventory (139.894719ms)
✔ NFR-024: local deletion is certified only after an independent reread proves emptiness, a survivor or an unreadable key blocks the success state, and the raw namespace confirms it without trusting the report (2.3301ms)
ℹ tests 49
ℹ suites 0
ℹ pass 49
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1958.395987
```

**Claim Source:** executed
**Command:** `node --test tests/portfolio-brief.functional.mjs`
**Exit Code:** 0

```
✔ only an eligible completion becomes behavior evidence and no excluded source can create or grow one (193.857403ms)
✔ route recomposition is invariant to behavior evidence and states that behavior contributes none (30.679684ms)
✔ behavior clear removes the committed evidence and returns recomposition to the pre-evidence baseline (107.743046ms)
✔ dismissal and automatic invalidation record a safe outcome and never a behavior event or a negative preference (49.505375ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 518.53724
```

### Re-run for DoD core items 1 and 2

Transcript from an earlier tree, retained as the record its ticks were scored on. Its counts predate the two tests HEAD added; the current counts are in the section immediately above.

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

### DoD core item 3 — full-personal clear: the two thirteens

**Ruling: unchecked.** Coverage improved materially since the previous "9 of 13" assessment, and that assessment is superseded. The item still does not close, for a narrower and better-evidenced reason.

#### The coincidence that has to be separated first

Two different thirteens meet on this item, and conflating them makes the sweep look complete against a line it does not satisfy.

**Thirteen A — surfaces the clear actually sweeps.** Derived, not enumerated by hand:

| Group | Count | Members |
|---|---|---|
| Workspace array sections | 5 | portfolio revisions, mandate revisions, behavior events, interest signals, action outcomes |
| Workspace pointers asserted null | 2 | current portfolio pointer, current mandate pointer |
| Declared storage keys | 6 | pointer, both slots, quarantine, session fallback, return context |

**Eleven of those thirteen are proven non-empty before the clear**, which is the real and defensible result: three array sections and both pointers are read back out of committed bytes, and all six declared keys are asserted present, with the keys a durable commit does not itself create stocked deliberately because they are the ones a clear most easily skips.

**Thirteen B — the nouns this DoD line enumerates.** Against the line's own words the split is different:

| Class | Count | Nouns | Status |
|---|---|---|---|
| Populated and swept | 7 | holdings, mandate, needs, events, quarantine, session fallback, return context | Verified |
| Swept but vacuous, pinned | 2 | interests, outcomes | Accepted |
| No runtime representation at all | 4 | **scenarios, allocations, dossiers, UI state** | **Blocking** |

#### Why the vacuous pair is accepted

Interests and outcomes have no write path through any exported builder, so the sweep asserting their emptiness proves nothing by itself. That limit is not left implicit: `the two personal sections the clear sweep cannot populate are pinned by their own distinct refusal` measures reachability by what a builder actually wrote rather than by name, then holds each section to a **distinct** refusal reason — `unsupported-contract-scope` for one, `workspace-hash-mismatch` for the other — so neither can stand in for the other if one is removed, plus an untouched-spread control proving both refusals are caused by the section content. The moment a real write path appears, the refusal stops firing and the test goes red. That is verified-by-construction, and it is enough.

#### Why the other four are not

Scenarios, allocations, dossiers, and UI state are not vacuous — they are **absent**. None is a workspace array section and none is a declared storage key, so there is no surface for the clear to sweep and no assertion observes them. "Mechanically verifies X is empty" is not satisfied by X having no representation.

The mitigating argument on the previous pass was that the sweep is derived and will absorb them later. That was tested rather than accepted, and **it is only half true**:

- `personalWorkspaceSections` genuinely derives itself from the empty-workspace contract by filtering for array values, so a future scenarios, allocations, or dossiers **array** section is absorbed with no test edit. For those three the argument holds.
- Both declared-key helpers — `policyDeclaredKeys` in the unit suite and `declaredKeysByAdapter` in the privacy suite — name each policy storage field **explicitly** rather than iterating the storage section. The policy's storage field list is itself a frozen exact set with no UI-state key. So a future UI-state storage key would have to be added to both the policy and both helpers by hand, and until someone did, it would fall outside the sweep **silently**.

UI state therefore has no present coverage, no auto-absorption, and no pinning test. Unlike the vacuous pair, nothing goes red when it arrives. That asymmetry is the whole reason this item stays unchecked rather than being ticked with a note.

#### What would close it

Either the four nouns gain real surfaces and the sweep observes them, or — the cheaper path for UI state specifically — the two key helpers derive from the policy storage section the way the array sweep derives from the workspace contract, so an added key cannot escape the sweep unnoticed. Both are planning-owned changes, not evidence-recording ones.

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

Seven DoD items are left unchecked. Each gap is named exactly rather than deferred.

Core items 1 and 2 were previously listed here and are now ticked. Core 1 reached 15 of 15
ids and Core 2 reached 7 of 7, verified by the guarded scan in the Coverage Report. Two
residual facts survive the tick and are recorded there rather than dropped: four of Core
1's ids are carried by an interpolated table-driven message rather than a literal one, and
every Core 2 carrier for NFR-003 sits on the Scope 02 mandate surface.

| DoD item | Why it is unchecked |
|---|---|
| Core 3 — full-personal clear section verification | **4 of the 13 nouns the line enumerates have no runtime surface at all: scenarios, allocations, dossiers, UI state.** The two vacuous nouns (interests, outcomes) are accepted as pinned. Ruling and the derived-versus-named sweep asymmetry that decides it are in decision D-03-08 and [core item 3](#dod-core-item-3--full-personal-clear-the-two-thirteens). Supersedes the earlier "9 of 13" line. |
| Core 4 — impact sweep, canaries, rollback and restore proof | Not assessed on this pass. The prior assessment stands: the Scope 01 and 02 re-run and the raw-namespace and clear-fault canaries are carried; the **exact rollback and restore proof** was the open half. |
| Core 5 — RED plus same-command GREEN | Not assessed on this pass. The prior assessment stands: **0 of 14 behaviors have an intended RED**, GREEN is complete, and this run was again barred from injecting defects. |
| TP-03-04 | Not executed. |
| TP-03-05 | Not executed. |
| TP-03-06 | Not executed. |
| Build Quality Gate | Deliberately not assessed this run. |

Two scope-level consequences follow, both owned outside this agent:

1. **The TP-03-03 row and file mismatch is resolved and the routing note is withdrawn.** The privacy suite gained exactly the clear-fault and post-clear-verification coverage the row promised, so no Test Plan edit is owed. Recorded here rather than deleted, because the earlier routing note is cited elsewhere in this report.
2. **FR-023 and NFR-001 have no Node-layer carrier by construction.** Absence from all public and remote surfaces needs a no-external-request scan, which is an `e2e-ui` or dedicated-scan concern. Neither exists in the current Test Plan, so those ids cannot be closed by any currently planned row.

One new planning-owned consequence is raised by this pass:

3. **The declared-key sweep does not derive itself.** `policyDeclaredKeys` and `declaredKeysByAdapter` name each policy storage field explicitly, so a storage key added to the policy later escapes both sweeps silently. The workspace array sweep has no such hole. This is the specific reason core item 3's UI-state noun cannot be treated the same way as its two vacuous nouns.

## Validation Summary

**Claim Source:** executed

| Check | Command | Exit Code |
|---|---|---|
| TP-03-01 | `node --test tests/portfolio-foundation.unit.mjs` | 0 — 49 pass, 0 fail |
| TP-03-02 | `node --test tests/portfolio-brief.functional.mjs` | 0 — 4 pass, 0 fail |
| TP-03-03 | `node --test tests/portfolio-privacy.functional.mjs` | 0 — 13 pass, 0 fail |
| Artifact lint | `bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab` | 0 |

All three suites pass. Suite health is not the constraint on this scope; evidence coverage is.

## Audit Verdict

No audit verdict is recorded. Scope 03 is not eligible for audit while seven DoD items lack evidence.
