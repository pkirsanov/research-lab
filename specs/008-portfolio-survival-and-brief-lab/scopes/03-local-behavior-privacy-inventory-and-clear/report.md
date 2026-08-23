# Scope 03 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md) | [uservalidation.md](../../uservalidation.md)

## Summary

Evidence-recording run only. No test code was written, no defect was injected, and no production source was changed by this pass. The three committed Node suites named by TP-03-01 through TP-03-03 were re-executed on the previous pass, and this pass re-executed the committed Playwright foundation suite that TP-03-04 and TP-03-05 name. Each DoD item was assessed against the specific assertions the committed tests genuinely carry.

Result: **7 of 12 DoD items ticked** (TP-03-01, TP-03-02, TP-03-03, TP-03-04, TP-03-05, core item 1, core item 2). Five items remain unchecked, each with the exact uncovered requirement ids or behaviors named in [Uncertainty Declarations](#uncertainty-declarations). The Build Quality Gate item and core items 4 and 5 were deliberately not assessed on this pass, and TP-03-06 was explicitly out of this pass's scope.

Both `e2e-ui` rows are green at 8 passed / 0 failed, and both scenarios SCN-008-011 and SCN-008-012 are now closed — they were the two scenarios whose user-visible half had no Node-layer equivalent. Reaching green took two rounds and exposed two defect classes worth carrying forward: the behavior UI shipped as markup wired to nothing, which the Node suites structurally cannot see; and both rows initially asserted more than their own scenarios claim. See [How TP-03-04 and TP-03-05 reached green](#how-tp-03-04-and-tp-03-05-reached-green).

The previously-recorded headline finding — **TP-03-03 is green but does not carry its declared behavior** — is now closed. Two tests committed at HEAD `c4165577` moved the declared clear/inventory behavior into the file the row names, and every clause of the row is carried there; see [TP-03-03](#tp-03-03).

The remaining headline finding is core item 3, and it now has a planning ruling. Its coverage improved materially, but the improvement lands on a different enumeration than the DoD line uses, and the line is left unchecked for four nouns that have no runtime surface at all — see decision D-03-08 and [core item 3](#dod-core-item-3--full-personal-clear-the-two-thirteens). Decision **D-03-11** rules the line genuine but mis-sited, discharges its six unreachable nouns forward to Scopes 06, 09, 13, 15, and 16, and leaves Scope 03 one retained obligation of its own: make the declared-storage-key sweep derive from `policy.storage` so a later scope cannot add a personal key unnoticed. The line stays unchecked, but the blocker moves inside Scope 03.

## Decision Record

- **D-03-01** — Requirement coverage was scored per individual id, not per DoD sentence. An item naming many ids is ticked only when every id it names is carried by a specific named assertion. Blanket claims were rejected.
- **D-03-02** — The FR/NFR scan used a negative-lookbehind guard, `(?<!N)FR-\d{3}`, because `FR-022` is a substring of `NFR-022` and `FR-012` of `NFR-012`. An unguarded scan credits `tests/portfolio-privacy.functional.mjs` with FR-003/005/007/012/022 that are in fact the NFR ids in that file's `NFR-003 NFR-005 NFR-007 NFR-012 NFR-022` title. Both genuine FR occurrences were then confirmed by reading their assertion sites.
- **D-03-03** — *Superseded by D-03-08; retained as the record of its own pass.* This run disagrees with one premise of its own briefing. DoD core item 3 (full-personal clear) was flagged as carried; assessment found 9 of its 13 named sections verified. The item is left unchecked and the 4 unverified sections are named. Recorded here so the operator can overrule with the gap visible rather than hidden.
- **D-03-04** — *Spent, not reversed; see D-03-07.* A green suite is not evidence for a Test Plan row whose declared behavior it does not contain. TP-03-03 passes 11/11 and is still left unchecked.
- **D-03-05** — Core items 1 and 2 were re-scored with a stricter rule than D-03-02 used. An id counts only when it sits in the **message argument** of an `assert.*` call, resolved by balanced-paren argument splitting so an expected value cannot be mistaken for a message; a comment, a `test(...)` title, and a bare code identifier are all rejected. The guard was widened from `(?<!N)` to `(?<![A-Za-z])` with a trailing `(?![0-9])`, so no letter-prefixed id and no longer numeric id can leak in. Measured effect on this tree: `FR-019` falls from 41 raw occurrences to 10 guarded, `FR-023` from 60 to 36.
- **D-03-06** — Interpolated carriage is accepted as real carriage. FR-030, FR-031, FR-032, and FR-035 never appear as a literal inside a message; they are keys of the frozen `EXCLUDED_SOURCE_TOKENS_BY_REQUIREMENT` table and reach the message through `${requirement}`. That is not name-only presence, because the table length, each token list's non-emptiness, the attempted-versus-declared token count, and the union against the policy's excluded-field count are each asserted, so dropping a requirement or emptying its list goes red. The class is recorded per id in the Coverage Report rather than blended into the literal count.
- **D-03-07** — D-03-04 is now spent, not reversed. It said a green suite is not evidence for a row whose declared behavior it does not contain, and that stays true. What changed is the file: two tests committed at HEAD `c4165577` put the clear, inventory, and per-step fault behavior into `tests/portfolio-privacy.functional.mjs`, so the row's carrier is now the file the row names. TP-03-03 was re-assessed clause by clause against that file rather than inherited from the earlier verdict, and every clause was found carried. The routing note to `bubbles.plan` is withdrawn: the row and the file agree, so no Test Plan edit is owed.
- **D-03-08** — Core item 3 stays unchecked, and the reason is narrower and better-evidenced than the earlier "9 of 13". The improvement is real: 11 of the 13 surfaces the clear sweeps are now proven non-empty first, and the two that cannot be are pinned by a dedicated refusal test. The blocker is that the DoD line enumerates **nouns**, not surfaces, and both counts happen to total 13 — a coincidence that makes the sweep look complete against a line it does not actually satisfy. Four of the line's nouns (scenarios, allocations, dossiers, UI state) have no workspace section and no storage key, so nothing observes them. The mitigating argument ("the derived sweep absorbs them later") was tested rather than accepted, and it fails for UI state specifically: see [core item 3](#dod-core-item-3--full-personal-clear-the-two-thirteens). Recorded so the operator can overrule with the exact residual visible.
- **D-03-09** — A test that only exercises the store is not evidence that the feature is reachable. The behavior UI existed as markup wired to nothing while all three Node suites were green, because those suites drive the store API directly and therefore cannot observe whether any page calls it. The `e2e-ui` rows are the only rows in this scope's Test Plan positioned to detect that class, and they did. The consequence recorded for later scopes: for any scope whose surface is a page, Node-layer green is a necessary and **not** sufficient condition, and the `e2e-ui` row is load-bearing rather than confirmatory.
- **D-03-10** — A scoped absence sweep is only as strong as the preservation assertion standing opposite it. Narrowing rows 7 and 8 from whole-workspace to behavior-section scope was correct — the original sweeps contradicted the scenarios they asserted, and the product was right — but narrowing alone would have opened a hole. An injected empty-holdings defect passed every narrowed absence check, since an absent holding trivially satisfies "no cleared subject survives here". The hole is closed by asserting the preserved values **positively** rather than only as absences. Recorded as a general rule for every clear/delete assertion in this feature, not as a one-off fix.
- **D-03-11** — *Planning ruling, owned by `bubbles.plan`; scopes core item 3 and TP-03-06.* Asked whether core item 3 over-reaches, the ruling is that it does **not**: its guarantee is sound and its wording stands unedited. The line is *mis-sited* rather than wrong, because the set of personal categories is open at Scope 03 and closes only at Scope 16, so no foundation scope can quantify over it. Six nouns are discharged forward to the scope that first creates each surface — interests and outcomes to Scope 06 (TP-06-02), scenarios to Scope 09 (TP-09-01), allocations to Scope 13 (TP-13-02), dossiers to Scope 15 (TP-15-02), UI state plus whole-set closure to Scope 16 (TP-16-04) — each with a new DoD item in the receiving scope, so the discharge is a tracked commitment rather than a deletion. The alternative, ruling the obligation Scope-03-genuine, was rejected on structure and not convenience: Scope 03 is `foundation:true` at the head of the linear chain, so waiting on Scopes 09 through 15 makes it depend on its own dependents, which is the deadlock blocker 3 forbids.

  Three consequences are deliberately *not* a tick. First, core item 3 stays unchecked, because the discharge is only enforceable if a later scope cannot add a personal category unnoticed, and today it can: `personalWorkspaceSections` derives itself from `createEmptyWorkspace`, so a new array section auto-absorbs, but `policyDeclaredKeys` names five `policy.storage` fields one at a time and its assertions pin the counts those same names produce at 4 and 2. A seventh storage key therefore moves neither count, is swept by nothing, and reddens nothing — and a storage key is the likelier arrival shape for every discharged noun. Making that helper derive from `policy.storage` is Scope 03's retained obligation and the line's remaining blocker, so the ruling changes the blocker from unclosable-here to closable-here rather than closing it.

  Second, TP-03-06 is discharged only for its vacuous cells and stays unchecked on its own merits: quarantine PRESERVED and session-fallback PRESERVED carry no assertion on the behavior-clear arm, both nouns are reachable, and a behavior clear that widened into either key would pass the row unchanged. Third, the four unreachable nouns were verified structurally rather than accepted: `scenarios`, `allocations`, `dossiers`, and `uiState` have zero occurrences in `rlportfolio.js`; `policy.storage` declares exactly six keys and none of them is any of these; and the row's own live instrumentation prints eight `declaredCategories`, none of them these four. `interestSignals` was likewise confirmed refused at `rlportfolio.js:1083` as `unsupported-contract-scope`, so it cannot hold a record at this contract version by construction.

## Completion Statement

Scope 03 is **not** complete. Five of twelve DoD items lack the evidence they require. Scope status remains `In Progress`.

## Code Diff Evidence

No production or test source was modified by this pass. Changed paths are limited to this scope's own execution artifacts:

```
specs/008-portfolio-survival-and-brief-lab/scopes/03-local-behavior-privacy-inventory-and-clear/report.md
specs/008-portfolio-survival-and-brief-lab/scopes/03-local-behavior-privacy-inventory-and-clear/scope.md
```

G093 classification: `execution-artifact` only. No `implementation-bearing` path is in this change.

The two commits that made TP-03-04 and TP-03-05 green were made **before** this pass and are recorded here for provenance, not claimed as this pass's diff: `6e43ed06` (`tests/portfolio-survival-foundation.spec.mjs`, assertion narrowing plus the positive preservation assertion) and `46056d50` (`portfolio-survival-allocation-lab.html`, wiring the behavior UI to the existing store API). Both are analysed in [How TP-03-04 and TP-03-05 reached green](#how-tp-03-04-and-tp-03-05-reached-green).

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

**Claim Source:** executed
**Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/portfolio-survival-foundation.spec.mjs`
**Exit Code:** 0 — 8 passed, 0 failed

The row's declared command is the `--grep "Regression: SCN-008-011 clear behavior removes ranking influence and preserves portfolio"` form. The executed command is that form's superset over the same file: it selects the identical test and runs it alongside the other seven. The row's own runner line and its emitted diagnostics are recorded verbatim below; the suite tally is recorded because it is the same process that produced them.

```
Running 8 tests using 1 worker
  ✓  7 … clear behavior removes ranking influence and preserves portfolio (3.2s)
[SCN-008-011] eligibleCompletionsBeforeClear=4
[SCN-008-011] rankedSubjectsBeforeClear=2
[SCN-008-011] floorMetBeforeClear=msft
[SCN-008-011] previewOnlyChangedProjection=false
[SCN-008-011] rankingSurvivedReload=true
[SCN-008-011] duplicateSameDayCompletion=rejected
[SCN-008-011] eligibleCompletionsAfterClear=0
[SCN-008-011] interestSignalsAfterClear=0
[SCN-008-011] portfolioPreserved=true
[SCN-008-011] mandatePreserved=true
[SCN-008-011] clearedSubjectScope=behaviorEvents,interestSignals,actionOutcomes,rankingRows
[SCN-008-011] cashNeedsPreserved=true
[SCN-008-011] publicCacheByteIdentical=true
[SCN-008-011] foreignStorageKeys=rlData
[SCN-008-011] remotePersonalRequests=0

  8 passed (23.4s)
```

**Clause map — every clause of the DoD line, against the assertion that carries it.** The line reads: *proves SCN-008-011 clears behavioral ranking and preserves portfolio, mandate, cash needs, cache, and watchlist.*

| Clause | Carrier | Confirming output |
|---|---|---|
| Regression `e2e-ui` | Playwright row in `tests/portfolio-survival-foundation.spec.mjs:628`, run against the real served route; no `page.route`/`context.route` interception exists in the file | runner line 7 above |
| clears behavioral ranking | `:712` influence line back to its exact empty text, `:713` zero rendered rank rows, `:736` bare-token sweep over the three stored behavior sections, `:739` the same sweep over the derived ranking rows' `dataset` — which `innerText` structurally cannot see | `eligibleCompletionsAfterClear=0`, `interestSignalsAfterClear=0`, `clearedSubjectScope=…` |
| preserves portfolio | `:744` `:745` `:746` `:750` identity, revision count, holding count; `:759` the surviving holdings asserted **positively** as `[symbol, quantity, costBasis]` triples | `portfolioPreserved=true` |
| preserves mandate | `:747` `:748` `:751` mandate identity and revision count; `:763` the declared constraints asserted positively as `[subject, kind, minimum, maximum]` in declared order | `mandatePreserved=true` |
| preserves cash needs | `:774` `:775` the dated cash need and its amount still rendered on every route in `MANDATE_ROUTES`, after the clear | `cashNeedsPreserved=true` |
| preserves cache | `:782` the public generic `rlData` cache compared **byte-identical** against its pre-clear string, not field-wise | `publicCacheByteIdentical=true` |
| preserves watchlist | same `:782` assertion — the watchlist is a member of the `rlData` object written at `:645`, so byte-identity of the serialized cache is a strictly stronger claim than a per-field watchlist check; `:783` additionally pins the foreign key set so the clear may neither drop nor add a key outside its namespace | `foreignStorageKeys=rlData` |

**Anti-vacuity.** The preservation half is not a restatement of "this page never touches that key": the public cache is written by the test at `:645` and a clear that widened to `localStorage.clear()` destroys it, so `:782` is a live regression. The cleared half is not vacuous either — `:679`–`:687` prove the ranking was genuinely populated first (two ranked subjects, four eligible completions, floor met for one), and `:706` re-reads it after a full page reload, which separates a projection-derived surface from a draft-derived one.

**Verdict: TP-03-04 DoD item ticked.** All seven clauses carried.

### TP-03-05

**Claim Source:** executed
**Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/portfolio-survival-foundation.spec.mjs`
**Exit Code:** 0 — 8 passed, 0 failed

Same executed superset as TP-03-04; the row's declared `--grep` form selects exactly the test recorded below.

```
Running 8 tests using 1 worker
  ✓  8 …012 behavior evidence excludes engagement and sensitive profiling (5.6s)
[SCN-008-012] legitimateCompletionsRecorded=2
[SCN-008-012] excludedSourcesAttempted=33
[SCN-008-012] excludedSourcesDeclared=33
[SCN-008-012] excludedSourcesAccepted=0
[SCN-008-012] observedActivityEvents=0
[SCN-008-012] observedActivityGenerations=0
[SCN-008-012] storedExcludedTokens=0
[SCN-008-012] excludedTokenScope=behaviorEvents,interestSignals,actionOutcomes
[SCN-008-012] excludedSourceCountShown=0
[SCN-008-012] crossDeviceIdentifiers=0
[SCN-008-012] hiddenProfileNamespaces=0
[SCN-008-012] cookies=0
[SCN-008-012] indexedDbStores=0
[SCN-008-012] engagementCopyOutsideExclusionInventory=0
[SCN-008-012] remotePersonalRequests=0

  8 passed (23.4s)
```

**Clause map.** The line reads: *proves SCN-008-012 stores no engagement/sensitive/cross-device profile and shows the exclusion contract.*

| Clause | Carrier | Confirming output |
|---|---|---|
| Regression `e2e-ui` | Playwright row at `tests/portfolio-survival-foundation.spec.mjs:777`, real served route, no interception | runner line 8 above |
| stores **no engagement** profile | the engagement signals are genuinely produced through the real input surface — pointer moves, two wheel scrolls, tab traversal, workspace tab switches, settings toggles, and a real elapsed dwell — then `:852` asserts the stored event count did not move and `:853` that no workspace generation was committed; `:934` separately forbids engagement wording on the ranking and category surfaces, where it would constitute an engagement objective | `observedActivityEvents=0`, `observedActivityGenerations=0`, `engagementCopyOutsideExclusionInventory=0` |
| stores **no sensitive** profile | every declared excluded source is attempted through the real UI and refused by name with reason code `P008-SCHEMA-CORRUPT` / `forbidden-behavior-source`; `:858` reads the offered set off the page and equates it to the policy's declared set, so the sweep cannot silently shrink; `:871` asserts the attempted count equals the declared count; `:888` confirms no declared token reached the stored evidence; `:909` quantifies over the stored shape with an exact key-set equality, so an unlisted key — the hidden profile field this denies — fails | `excludedSourcesAttempted=33`, `excludedSourcesDeclared=33`, `excludedSourcesAccepted=0`, `storedExcludedTokens=0` |
| stores **no cross-device** profile | `:945` no cookie, `:946` no foreign `localStorage` namespace, `:947` no `sessionStorage`, `:948` no IndexedDB store, `:949` no service worker that could carry a profile off-device; `:956` no declared token leaves the origin | `crossDeviceIdentifiers=0`, `hiddenProfileNamespaces=0`, `cookies=0`, `indexedDbStores=0`, `remotePersonalRequests=0` |
| **shows** the exclusion contract | `:917` the excluded-source count rendered as an exact `0` rather than a prefix, `:918` the profile statement asserted as exact text, `:920`–`:922` the rendered inventory required to name every declared excluded field | `excludedSourceCountShown=0` |

**Anti-vacuity.** The claim under test is a negative, and an implementation that recorded nothing at all would satisfy every refusal above. Two positive controls prevent that: one legitimate completion is admitted before the refusal sweep and a second after it, both asserted `eligible`. A second vacuity trap is closed at `:895`–`:898`: because the token sweep is scoped to the three behavior sections, the test proves the colliding declared holding fields genuinely exist in the imported holdings, so the sweep passes because the evidence is clean rather than because the value never existed anywhere.

**Verdict: TP-03-05 DoD item ticked.** All five clauses carried.

### How TP-03-04 and TP-03-05 reached green

Both rows failed twice before passing, and each failure exposed a real defect class. Recorded here because it is the substance of these two rows, and because a future reader who sees only the green run would otherwise conclude the assertions were merely written and passed.

**Failure 1 — the behavior UI was markup-only, and only an `e2e-ui` row could see it.** The rows first failed on a 30-second `selectOption` timeout. The cause was not a slow page: `behaviorCategory` appeared exactly twice in the whole document — the label's `for` and the select's `id` — with no JavaScript referencing it anywhere, and `eventCategories`, the policy field that supplies its option list, appeared **zero** times. The select rendered one empty placeholder, so there was nothing to select and the timeout was the correct observable symptom of a control wired to nothing.

This is a wired-or-not-shipped gap, and the three Node suites are **structurally incapable** of detecting it: they drive the store API directly, so a page that never calls the store is invisible to them. Every one of TP-03-01 through TP-03-03 was green throughout. The gap was fixed by wiring the page to the already-existing `rlportfolio.js` API — `behaviorDedupePayload`, `behaviorIdentityPayload`, `forbiddenBehaviorField`, `findForbiddenBehaviorPath`, and the clear paths — rather than reimplementing any of it; `rlportfolio.js` is unmodified. Options are populated from `policy.behavior.eventCategories` rather than a literal list, so a category added to policy later cannot silently go unrendered. Commit `46056d50`, sole path `portfolio-survival-allocation-lab.html`.

**Failure 2 — both rows asserted more than their own scenarios claim.** With the UI wired, the rows failed again, this time on over-broad absence sweeps that contradicted the scenarios they were asserting. The product was correct in both cases:

- Row 7 demanded the cleared subjects vanish from the **entire** persisted workspace. They legitimately remain in `mandateRevisions[].constraints[].subject` and `portfolioRevisions[].holdings[].symbol` — and the row's own title is *preserves portfolio*. A sweep that passed would have required the clear to destroy the user's portfolio.
- Row 8 forbade `costBasis` anywhere in the workspace. `costBasis` is a declared `HoldingEntry` field the user imported. The requirement is that an excluded source must not reach **behavior evidence**, not that its name may not exist.

Both were narrowed to the behavior sections. Row 7's sweep also became *stricter* over the sections it kept — bare-token rather than quoted-value — and gained a structural read of the ranking rows' `dataset`, which the existing `innerText` sweep could not see. Commit `6e43ed06`.

**Why narrowing alone would have opened a hole, and what closed it.** Scoping an absence check is exactly the move that can quietly convert a real assertion into a weaker one, so the narrowing was tested rather than assumed. An injected `holdings = []` — a clear that widened into the portfolio, the opposite of the defect the original sweep was aimed at — passed **every** narrowed absence check, because an absent holding trivially satisfies "no cleared subject survives in a behavior section". It was caught only by the positive preservation assertion added alongside the narrowing: `:759` requires the surviving holdings to still carry `[symbol, quantity, costBasis]` per entry and `:763` requires the mandate constraints to still carry `[subject, kind, minimum, maximum]` in declared order.

That is the reason the absence half alone is insufficient, and it generalises: for any clear operation, an absence sweep and a preservation assertion are duals, and a scoped absence sweep is only as strong as the preservation assertion standing opposite it. Both halves are now present in row 7. Row 7's clause map above cites them individually.

### TP-03-06

**Claim Source:** executed · **Command:** the Test Plan row's exact command · **Exit Code:** 0

```text
$ npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list

Running 10 tests using 1 worker

  ✓   1 …CN-008-003 explicit mandate alone supplies every hard constraint (2.6s)
  ✓   2 … SCN-008-004 no mandate leaves goal fit and survival unavailable (1.8s)
  ✓   3 …ting mandate stays visibly infeasible with no constraint relaxed (1.3s)
  ✓   4 …08-001 valid local portfolio import creates one current revision (1.7s)
  ✓   5 …-008-002 invalid or secret-bearing import is atomic and redacted (1.2s)
  ✓   6 …reserve last valid portfolio in durable session and memory modes (3.8s)
  ✓   7 …clear behavior removes ranking influence and preserves portfolio (3.7s)
  ✓   8 …12 behavior evidence excludes engagement and sensitive profiling (8.3s)
  ✓   9 …ared category and leaves the generic public cache byte-identical (2.2s)
  ✓  10 …ar step refuses success on its own and retains only its own key (15.4s)

  10 passed (45.2s)
PLAYWRIGHT_EXIT=0
```

The runner's per-test `console.log` diagnostic lines are elided here deliberately: they carry
fixture subject tokens, and this file is tracked. The block above is the runner's own result
lines. Titles are abbreviated by the list reporter at terminal width; each is resolved to its
source line in the mapping below.

Suite size moved from 8 to 10 since the previous pass. The two added rows are the ones named
`TP-03-06` in their own titles (`:1085`, `:1160`); the earlier eight are unchanged.

Three emitted diagnostics decide the vacuity findings below and are quoted as counts and
declared category or key names only — no stored value is reproduced. `declaredCategories` lists
eight; `populatedBeforeFullPersonalClear` lists five; `categoriesEmptyAfterFullPersonalClear`
reports eight. The gap between the second and the third is where the vacuous cells live.

**Ruling: unchecked.** The row is green and the second clause is carried, but the first clause
is not. The reasoning is below, and it is the reason a green tally is not sufficient here.

#### Why a tally cannot settle this line, and what the axes are

The DoD line asserts a **matrix**, and a matrix is not a list. The Test Plan row names four
behaviors — behavior-only clear, full-personal clear, partial deletion failure, and prior
import/mandate preservation — over the scenario set SCN-008-001 through SCN-008-004, SCN-008-011,
SCN-008-012. Two of those four behaviors are *operations over a category set*, so each is complete
only when every declared category has a proven verdict under it, and a third is *per declared
clear step*. The matrix is therefore three axes, not one row count:

| Axis | Cells | Source of the cell list | Rows that carry it |
|---|---|---|---|
| 1 — foundation scenarios | 6 | the Test Plan row's own Scenario column | `:87`, `:184`, `:260`, `:299`, `:403`, `:628`, `:810` |
| 2 — clear operation × declared category | 2 × 8 = 16 | `rlportfolio.js:2227`–`:2234` `clearedBy` declarations | `:628` behavior column, `:1085` all-personal column |
| 3 — partial deletion failure × declared clear step | 6 + 1 control = 7 | `FOUNDATION_KEYS`, read from the committed storage policy | `:1160` |

Axis 2's cell list is taken from the runtime's own declaration rather than written into the test,
and the full-personal row calls its loop "The whole matrix, cell by cell" (`:1119`) — the same
reading. Axis 3's cell list is likewise derived from the storage policy, not a literal.

The fourth named behavior, prior import/mandate preservation, is not a separate axis: it is the
PRESERVED column of Axis 2 under the behavior clear, plus Axis 1's import and mandate scenarios.

#### Axis 1 — foundation (Scenario column), 6 cells, all carried

| Cell | Row that carries it | Owning scope |
|---|---|---|
| SCN-008-001 | `Regression: SCN-008-001 valid local portfolio import creates one current revision` (`:299`) | 01 (done) |
| SCN-008-002 | `Regression: SCN-008-002 invalid or secret-bearing import is atomic and redacted` (`:403`) | 01 (done) |
| SCN-008-003 | `Regression: SCN-008-003 explicit mandate alone supplies every hard constraint` (`:87`) and `Regression: SCN-008-003 conflicting mandate stays visibly infeasible with no constraint relaxed` (`:260`) | 02 (done) |
| SCN-008-004 | `Regression: SCN-008-004 no mandate leaves goal fit and survival unavailable` (`:184`) | 02 (done) |
| SCN-008-011 | `Regression: SCN-008-011 clear behavior removes ranking influence and preserves portfolio` (`:628`) | 03 |
| SCN-008-012 | `Regression: SCN-008-012 behavior evidence excludes engagement and sensitive profiling` (`:810`) | 03 |

One further row, `Regression: Feature 008 atomic slots preserve last valid portfolio in durable
session and memory modes` (`:491`), is Scope 01's TP-01-05 and carries no Axis-1 cell of its own;
it reinforces the import-preservation cell rather than supplying one.

#### Axis 2 — clear operations × declared categories, 16 cells, 9 carried

`clearedBy` decides each cell's required verdict: a category is EMPTIED by an operation its own
declaration names, and PRESERVED by one it does not. The eight declarations are
`rlportfolio.js:2227`–`:2234`. "Carried" below means a verdict that could fail — a cell asserted
against a category that was empty on both sides of the clear is marked vacuous instead.

| Category | `clearedBy` | Under behavior clear | Carried by | Under all-personal clear | Carried by |
|---|---|---|---|---|---|
| behavior-events | behavior-and-all-personal | EMPTIED | `:716`–`:717` rendered row, 4 records before | EMPTIED | `:1124`–`:1132` loop |
| interest-signals | behavior-and-all-personal | EMPTIED | `:718`–`:719` rendered row, **vacuous** | EMPTIED | loop, **vacuous** |
| action-outcomes | behavior-and-all-personal | EMPTIED | `:724` persisted bytes, **vacuous** | EMPTIED | loop, **vacuous** |
| portfolio-revisions | all-personal | PRESERVED | `:744`–`:746`, `:759`–`:761` id, counts, holdings by value | EMPTIED | loop |
| mandate-revisions | all-personal | PRESERVED | `:747`–`:748`, `:762`–`:764` id, count, constraints in order | EMPTIED | loop |
| cash-needs | all-personal | PRESERVED | `:770`–`:775` rendered on every mandate route | EMPTIED | loop |
| quarantine | all-personal | PRESERVED | **not carried — no assertion** | EMPTIED | loop |
| session-fallback | all-personal | PRESERVED | **not carried — no assertion** | EMPTIED | loop, **vacuous** |

Nine cells carry a falsifiable verdict, five are vacuous, and two have no assertion at all.

#### Correction to the previous pass

The previous pass recorded this table with `interest-signals` under behavior clear as carried on
the strength of the rendered row at `:718`–`:719`, and counted eleven. That was wrong, and the
error was to read an assertion's existence as its force. A repository sweep for a write to either
`interestSignals` or `actionOutcomes` outside tests and specs returns initialisation to `[]`
(`rlportfolio.js:951`–`:952`), validation, projection, and the clear itself — and no append
anywhere. Both categories are therefore structurally empty in every UI-reachable state, so the
behavior row's `interest-signals · 0 records · empty` assertion is exactly as vacuous as the
`action-outcomes` one it sits beside. The count above is corrected from eleven to nine.

One adjacent runtime observation follows from the same sweep and is recorded rather than acted
on: `buildBehaviorClearCandidate` does not empty `actionOutcomes`, it filters them by state
(`rlportfolio.js:1844`–`:1850`, retaining any outcome whose state is outside
`BEHAVIOR_CLEARED_OUTCOME_STATES`), while the inventory row renders the category bare as
`cleared by behavior-and-all-personal`. For an outcome in a retained state the rendered label
would over-state what the behavior clear performs. Nothing can observe the difference today
because no producer exists. This is runtime- and planning-owned, not a TP-03-06 defect, and it
is not counted against the row below.

#### The cells that are not carried, named exactly

1. **behavior clear × quarantine — PRESERVED, no assertion.** `populateQuarantine` is called at
   `:1089` and `:1182` only. The behavior-clear row never stocks the quarantine key, so the
   category is empty before and after. The one namespace guard that row does carry is
   `foreignKeys`, which filters to keys *not* starting with `rlPortfolioWorkspaceV1.` — and the
   quarantine key is `rlPortfolioWorkspaceV1.quarantine`, so it is structurally excluded from the
   only check that could have caught a widening. A `clearBehavior` that deleted the quarantine
   key would pass this row unchanged. Its declaration says `all-personal`, so preservation is
   exactly what the matrix requires of this cell, and nothing observes it.
2. **behavior clear × session-fallback — PRESERVED, no assertion.** Same shape. The row runs in
   durable mode, so no session key exists to be preserved or destroyed, and the `foreignKeys`
   guard reads `localStorage` only — neither `rlPortfolioWorkspaceSessionV1` nor
   `rlReturnContextV1` lives there.
3. **behavior clear × action-outcomes and × interest-signals — EMPTIED, vacuous.** `:724`
   asserts the outcomes section is empty after the clear and says so itself: *"this run recorded
   no action outcome, so none may appear after the clear."* `:718`–`:719` asserts the same shape
   for interest signals without that caveat. Neither category can be populated at all, per the
   correction above, so neither emptying is proven.
4. **all-personal × three vacuous cells.** `:1107` pins the populated set before the clear to
   five of eight. `interest-signals`, `action-outcomes`, and `session-fallback` read empty before
   and after, so their turns in the `:1124`–`:1132` loop assert emptiness against nothing.

Cells 3 and 4 are recorded for completeness of the matrix, not as new findings: they are the same
vacuity [core item 3](#dod-core-item-3--full-personal-clear-the-two-thirteens) already adjudicates
and accepts as pinned elsewhere, and the non-vacuous proof for the session keys specifically lives
in TP-03-03, which stocks them deliberately because a durable commit does not create them.

Cells 1 and 2 are the decisive ones, and they are of a different kind: not a weak assertion but no
assertion, on a preservation verdict the matrix requires, in the behavior column that core item 3
does not reach. Two cells of sixteen have nothing observing them, so the word **complete** in the
DoD line is not yet true.

#### Axis 3 — partial deletion failure × declared clear step, 7 arms, all carried

The third behavior the Test Plan row names is its own axis, because a partial failure is per-step
rather than per-category. Row `:1160` enumerates it from `FOUNDATION_KEYS` rather than a literal
list, faulting one declared step at a time at the storage device while every other remove still
succeeds — which is what makes each arm a partial failure rather than a blocked store.

| Arm | Refusal proven | Retention proven |
|---|---|---|
| control (no fault) | n/a — succeeds, and `:1194` requires every declared key removed | n/a |
| pointer key | `:1196` `P008-STORE-WRITE · foundation-clear-incomplete` | `:1206`–`:1208` exactly one key survives, bytes unchanged |
| slot A key | same | same |
| slot B key | same | same |
| quarantine key | same | same |
| session key | same | not reachable in durable mode |
| return-context key | same | not reachable in durable mode |

All seven arms ran. The control arm is load-bearing: without it a refusal proves nothing, because
a flow that always failed would satisfy all six faulted arms. `:1198` additionally forbids a
success payload on the surface during a partial failure, so a refusal that still rendered
`Verified empty` would fail. The two session arms are recorded as refusal-only rather than folded
into a coverage number, and `:1222`–`:1223` asserts that split by name against the durable-mode
key set instead of leaving a reader to assume it. That is honest reporting of a real mode limit,
not a gap: this axis is carried.

#### Second clause — previous scope behavior intact: carried

Scopes 01 and 02 are certified `done` in `state.json` — `Private Portfolio Import And Atomic
Store` at `certifiedAt` 2026-08-05T17:21:25Z and `Mandate And Cash-Need Authority` at
2026-08-06T14:47:04Z — owning SCN-008-001 through SCN-008-002 and SCN-008-003 through SCN-008-004
respectively. All six rows attributable to them — `:87`, `:184`, `:260`, `:299`, `:403`, and Scope
01's `:491` — passed in the same runner invocation as the Scope 03 rows. No prior-scope row
regressed.

#### What would close it

Two cells, both test-side, both inside this scope's declared allowed file. In the behavior-clear
arm, stock the quarantine key through the existing `populateQuarantine` helper and run one arm in
session mode, then assert after the behavior clear that the quarantine key still holds its bytes
and the session fallback still reads present. The runtime needs no change: the behavior clear
commits a workspace generation and does not call `clearFoundationStorage`, so the assertions
should pass on first run — their value is that a future widening could no longer pass unnoticed.

The three vacuous cells cannot be closed this way. `interest-signals` and `action-outcomes` have
no producer in the product at all, so no test can populate them; closing those requires a runtime
capability that does not exist and is not in this scope. They stay pinned, as core item 3 already
rules.

Neither change was made on this pass, which was scoped to executing and adjudicating this one row
with no new test code and no defect injection.

#### One observation raised, not resolved

The scope's UI Scenario Matrix row *Clear all personal data* requires that a retained category
"blocks success **and offers a scoped retry**." The blocking half is carried at `:1196`–`:1198`
(`P008-STORE-WRITE · foundation-clear-incomplete`, with no success payload). The retry half has no
implementation and no assertion: a case-insensitive search for `retry`, `try again`, `re-run`, and
`clear again` across `rlportfolio.js` and `portfolio-survival-allocation-lab.html` returns
nothing. No DoD item on this scope currently names it — core item 3 owns the emptiness half only.
This is planning-owned and is not counted against TP-03-06 above, whose row text names
"partial deletion failure" rather than the retry affordance.

#### One observation raised, not resolved

The scope's UI Scenario Matrix row *Clear all personal data* requires that a retained category
"blocks success **and offers a scoped retry**." The blocking half is carried at `:1196`–`:1198`
(`P008-STORE-WRITE · foundation-clear-incomplete`, with no success payload). The retry half has no
implementation and no assertion: a case-insensitive search for `retry`, `try again`, `re-run`, and
`clear again` across `rlportfolio.js` and `portfolio-survival-allocation-lab.html` returns
nothing. No DoD item on this scope currently names it — core item 3 owns the emptiness half only.
This is planning-owned and is not counted against TP-03-06 above, whose row text names
"partial deletion failure" rather than the retry affordance.

### Post-discharge re-execution at HEAD `3b3c4c1b`

`bubbles.plan` committed decision D-03-11 in `3b3c4c1b`, discharging six of core item 3's thirteen
nouns forward to the scope that first creates each surface. This pass re-executed the four suites
that carry core item 3 and TP-03-06 at that HEAD and re-evaluated both items against the amended
scope text. No test file, no `rlportfolio.js`, and no payload artifact was touched.

**Both items stay unchecked.** The discharge removed the blocker each was *previously* recorded
against, and the amended text names a different residual for each — Scope-03-owned in both cases,
and in neither case a discharged section. Each residual was re-verified against the committed
source in this run rather than accepted from the ruling. Both are intact. Reasoning in
[Post-discharge re-evaluation](#post-discharge-re-evaluation).

Per the runner-output convention established under [TP-03-06](#tp-03-06), the Playwright block
below records the runner's own result lines only. Its per-test `console.log` diagnostics are
elided deliberately: they carry fixture subject tokens, and this file is tracked.

**Claim Source:** executed
**Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/portfolio-survival-foundation.spec.mjs`
**Exit Code:** 0

```text
Running 10 tests using 1 worker

  ✓   1 …CN-008-003 explicit mandate alone supplies every hard constraint (1.4s)
  ✓   2 … SCN-008-004 no mandate leaves goal fit and survival unavailable (1.0s)
  ✓   3 …ing mandate stays visibly infeasible with no constraint relaxed (749ms)
  ✓   4 …08-001 valid local portfolio import creates one current revision (1.1s)
  ✓   5 …008-002 invalid or secret-bearing import is atomic and redacted (977ms)
  ✓   6 …reserve last valid portfolio in durable session and memory modes (2.5s)
  ✓   7 …clear behavior removes ranking influence and preserves portfolio (3.0s)
  ✓   8 …12 behavior evidence excludes engagement and sensitive profiling (6.3s)
  ✓   9 …ared category and leaves the generic public cache byte-identical (1.8s)
  ✓  10 …ar step refuses success on its own and retains only its own key (13.2s)

  10 passed (34.2s)
PW_EXIT=0
```

**Claim Source:** executed
**Command:** `node --test tests/portfolio-foundation.unit.mjs`
**Exit Code:** 0

```text
ok 47 - NFR-019: every declared credential field name and credential value shape is rejected without echoing the value, markup does not smuggle a credential past the guard, and an ordinary provider label is still imported
  ---
  duration_ms: 24.690875
  type: 'test'
  ...
ok 48 - NFR-023: a recommendation route cites the exact revision identity it used or names why it cannot, and a clear reports a per-category change that matches the inspected before and after inventory
  ---
  duration_ms: 44.081712
  type: 'test'
  ...
ok 49 - NFR-024: local deletion is certified only after an independent reread proves emptiness, a survivor or an unreadable key blocks the success state, and the raw namespace confirms it without trusting the report
  ---
  duration_ms: 1.586311
  type: 'test'
  ...
1..49
# tests 49
# suites 0
# pass 49
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1647.618062
UNIT_EXIT=0
```

**Claim Source:** executed
**Command:** `node --test tests/portfolio-privacy.functional.mjs`
**Exit Code:** 0

```text
ok 12 - each declared privacy category is deleted by the clear that names it and survives the clear that does not, one category at a time
  ---
  duration_ms: 90.312917
  type: 'test'
  ...
ok 13 - every declared clear step is faulted on its own, the other steps still delete, and the retained bytes refuse a success result
  ---
  duration_ms: 5.5759
  type: 'test'
  ...
1..13
# tests 13
# suites 0
# pass 13
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 818.303454
PRIVACY_EXIT=0
```

**Claim Source:** executed
**Command:** `node --test tests/portfolio-brief.functional.mjs`
**Exit Code:** 0

```text
ok 3 - behavior clear removes the committed evidence and returns recomposition to the pre-evidence baseline
  ---
  duration_ms: 102.185936
  type: 'test'
  ...
ok 4 - dismissal and automatic invalidation record a safe outcome and never a behavior event or a negative preference
  ---
  duration_ms: 18.117582
  type: 'test'
  ...
1..4
# tests 4
# suites 0
# pass 4
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 505.094217
BRIEF_EXIT=0
```

#### Post-discharge re-evaluation

##### Core item 3 — full-personal clear: unchecked, on a new and smaller blocker

The amended scope text says so itself, in the paragraph the discharge added: *"The discharge does
not close this item, and that is deliberate."* Reading the item against that text rather than
against the discharge summary, the accounting is:

| Group | Nouns | Standing after D-03-11 |
|---|---|---|
| Scope 03's own, verified | holdings, mandate, needs, events, quarantine, session fallback, return context (+ public generic assets remain) | carried |
| Discharged forward | interests, outcomes → Scope 06 · scenarios → Scope 09 · allocations → Scope 13 · dossiers → Scope 15 · UI state and whole-set closure → Scope 16 | no longer this scope's to prove |
| Residual, Scope 03's own | the declared-key enforcement gap | **blocks** |

The residual is not a discharged section, so it is not settled by the ruling, and it was re-verified
against the committed source in this run: `policyDeclaredKeys`
(`tests/portfolio-foundation.unit.mjs:823`–`:828`) builds its two lists by naming `pointerKey`,
`slotKeys`, `quarantineKey`, `sessionKey`, and `returnContextKey` one field at a time rather than
iterating `policy.storage`, and `:834`/`:835` then pin `local.length === 4` and
`session.length === 2` — counts derived from that same hand-written list, so they agree with it by
construction. A seventh `policy.storage` key would therefore be swept by nothing and redden
nothing, which is precisely the arrival path by which a discharged noun would return unobserved
and make the forward commitment unenforceable.

The item's own text names the fix and places it inside this scope: make the helper derive from
`policy.storage`, as `personalWorkspaceSections` already derives from `createEmptyWorkspace`. That
is a test-file change, and this pass was scoped to exclude test files. The effect of the ruling
therefore stands as the amendment states it — a change of blocker, not a tick.

##### TP-03-06 — matrix: unchecked, on the two cells that were never discharged

The second clause is carried, and was re-confirmed in this run rather than assumed: Scopes 01 and
02 are certified `done`, and all six rows attributable to them (`:87`, `:184`, `:260`, `:299`,
`:403`, `:491`) passed in the same invocation as the four Scope 03 rows.

The first clause asserts a *matrix*, so it is settled cell by cell, not by the ten-row tally. Each
cell below is mapped to the assertion carrying it; the discharge changes the two vacuous behavior
cells and touches nothing else.

| Axis | Cells | Carried by | Standing |
|---|---|---|---|
| 1 — foundation scenarios | 6 | rows `:87`, `:184`, `:260`, `:299`, `:403`, `:491` | all carried |
| 2 — 8 categories × all-personal clear | 8 | row `:1085`, loop `:1124`–`:1132` asserting each category against its own `clearedBy` declaration; `:1134` proves no declared foundation key survives | all carried |
| 2 — 8 categories × behavior clear | 8 | see the per-cell map below | **2 uncarried** |
| 3 — 6 declared clear steps + control | 7 | row `:1160`: each step faulted alone, unfaulted control succeeds, retention proven for the four durable keys, the two session steps named refusal-only | all carried |

Axis 2's behavior column, cell by cell, all within row 7 (`:628`):

| Category | Required verdict | Carrying assertion |
|---|---|---|
| behavior-events | EMPTIED | persisted `behaviorEvents` empty after the clear, against 4 records proven present before |
| portfolio-revisions | PRESERVED | `:744`–`:746` id, revision count, holding count · `:750` persisted id · `:759`–`:761` surviving holdings compared **by value** |
| mandate-revisions | PRESERVED | `:747`–`:748` id, revision count · `:751` persisted id · `:762`–`:764` surviving constraints compared by value **in declared order** |
| cash-needs | PRESERVED | `:770`–`:775` the dated need rendered on every mandate-dependent route |
| interest-signals | EMPTIED | asserted but **vacuous** — no producer; discharged to Scope 06 / TP-06-02 by D-03-11 |
| action-outcomes | EMPTIED | asserted but **vacuous** — no producer; discharged to Scope 06 / TP-06-02 by D-03-11 |
| quarantine | PRESERVED | **no assertion** |
| session-fallback | PRESERVED | **no assertion** |

Both uncarried cells were re-verified in this run against the committed test source, not inherited
from the previous pass:

1. **quarantine PRESERVED.** `populateQuarantine` is called at `:1089` and `:1182` only — rows 9
   and 10. Row 7 never stocks the key, so the category is empty on both sides. The single
   namespace guard row 7 carries (`:780`) filters to keys *not* beginning `rlPortfolioWorkspaceV1.`,
   which structurally excludes `rlPortfolioWorkspaceV1.quarantine` — the one check that could
   have caught a widening cannot see the key it would widen into.
2. **session-fallback PRESERVED.** Row 7 runs in durable mode, and its `:780` guard reads
   `localStorage` only; neither session key lives there. Row 7 contains no `sessionStorage` read
   at all.

The discharge is what makes this row's ruling *narrower* than before, not weaker: the vacuity
argument is now attributed forward and no longer part of this row's case, which leaves exactly two
cells standing on their own merits. A behavior clear that widened into either key would pass this
row unchanged, in a `privacy-critical:true` scope. Sixteen cells, two unobserved, so the word
**complete** in the DoD line is still not true. The fix is test-side and inside this scope's
declared allowed file; this pass excluded test files.

##### The vacuous-section pin is intact

`the two personal sections the clear sweep cannot populate are pinned by their own distinct
refusal` is present in `tests/portfolio-foundation.unit.mjs` and passed in this run as test 32 of
49. It was not deleted, weakened, or rewritten. It must survive the discharge precisely because it
is what fails the moment a write path for either section appears, which is the trigger that forces
the Scope 06 obligation to be honoured rather than quietly inherited.

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

**Claim Source:** executed, from the TP-03-04 output above; the Node-layer half is interpreted from the executed TP-03-01 and TP-03-02 output

The Node layer carries the scenario's mechanics: eligible events and derived signals are removed (`behavior clear empties behavior categories only after they are proven non-empty and preserves portfolio and mandate identity`), the next composition carries no behavior-derived influence (`recomposition after the clear must equal the pre-evidence baseline exactly`), and the preserved set holds byte for byte (`explicit portfolio facts survive a behavior clear byte for byte`, `mandate and cash needs survive a behavior clear byte for byte`, `holdings survive a behavior clear`, `the mandate and its cash needs survive a behavior clear`).

The scenario is now **closed**. Its UI Scenario Matrix row is `e2e-ui`, and the user-visible half that previously had no evidence — opening Local Privacy, inspecting the per-category inventory, confirming the clear behind its explicit confirmation control, and observing immediate recomposition — is carried by the executed TP-03-04 row. That row additionally proves the surface is projection-derived rather than draft-derived, by re-reading the ranking after a full page reload.

### Scenario SCN-008-012

**Claim Source:** executed, from the TP-03-05 output above; the Node-layer half is interpreted from the executed TP-03-01 and TP-03-02 output

The exclusion contract is carried mechanically by the full declared-token sweep and by `only an eligible completion becomes behavior evidence and no excluded source can create or grow one`. Ranking optimizing research relevance rather than engagement is carried by `route recomposition is invariant to behavior evidence and states that behavior contributes none`.

The scenario is now **closed**. The matrix row is `e2e-ui` and requires that no hidden score, trait, cross-device identifier, or engagement copy appears in the running UI — a DOM assertion with no Node-layer equivalent. The executed TP-03-05 row carries it: the hidden-profile half by an exact key-set equality over every stored event, the cross-device half by the cookie, foreign-namespace, session, IndexedDB, and service-worker sweep, and the engagement half by producing real pointer, scroll, dwell, and settings activity and proving none of it became evidence.

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

### DoD core item 5 — RED and GREEN pairs: 14 of 14

Every Scope 03 behavior below now has committed same-command GREEN **and** a recorded intended
RED. The earlier passes recorded 0 of 14 because they were barred from injecting defects; this
pass was authorised to inject them, so each behavior's guard was made to fail on purpose and then
restored.

**Method.** For each behavior a single targeted defect was injected into `rlportfolio.js`, the
behavior's own command was run, the failing test was recorded by name, and the source was restored
with `git checkout -- rlportfolio.js` before the next injection. GREEN is the same command on the
restored source. Baselines: `node --test tests/portfolio-foundation.unit.mjs` 49 pass / 0 fail;
`node --test tests/portfolio-privacy.functional.mjs` 13 pass / 0 fail; the browser suite 10 passed.

**Claim Source:** executed · **Command:** `node --test tests/portfolio-foundation.unit.mjs` (and
the browser command for #13) · **Exit Code:** 0 restored, non-zero under each injected defect

| # | Behavior | GREEN | Intended RED | Injected defect | Test that went red |
|---|---|---|---|---|---|
| 1 | Closed behavior event vocabulary | Yes | Yes | category allow-check replaced with `false` | 23 (also 36, 42) |
| 2 | Declared excluded-source rejection at any casing, separator, or depth | Yes | Yes | nested recursion in `findForbiddenBehaviorPath` returns `null` | 24 (also 49) |
| 3 | Semantic de-duplication to earliest occurrence | Yes | Yes | `occurredAt <` flipped to `>`, keeping the latest | 25 |
| 4 | Action-outcome command-to-state mapping | Yes | Yes | command/state mismatch guard replaced with `false` | 26 (also 36, 42) |
| 5 | Privacy inventory projection without stored values | Yes | Yes | `subjectValue` added to every category record | 27 — **see the guard defect below** |
| 6 | Atomic behavior-only clear preserving portfolio and mandate | Yes | Yes | behavior clear also empties `portfolioRevisions` | 28 (also 33, 41, 48) |
| 7 | Verified clear reread with remove-fault refusal | Yes | Yes | post-reread failure branch replaced with `if (false)` | 29 (also 49) |
| 8 | Verified clear covering every policy-declared personal key | Yes | Yes | local sweep narrowed to `FOUNDATION_LOCAL_KEYS.slice(1)` | 30 (also 16, 29, 31, 37, 49) |
| 9 | Full-personal clear with byte-identical generic assets | Yes | Yes | clear also removes the foreign `rlData` key | 31 (also 1, 16) |
| 10 | Inventory and verified clear available without policy config | Yes | Yes | same narrowed-sweep defect as #8 | 16 |
| 11 | Eligible-completion-only behavior evidence derivation | Yes | Yes | constructed event's `lifecycleState` set to `quarantined` | 42 (also 23, 41) |
| 12 | Route recomposition invariance to behavior evidence | Yes | Yes | route `available` made to depend on `behaviorEvents.length` | 22 |
| 13 | Behavior clear returning recomposition to the pre-evidence baseline | Yes | Yes | behavior clear no longer empties `behaviorEvents` | browser `SCN-008-011` |
| 14 | Dismissal and automatic invalidation recording no negative preference | Yes | Yes | `preferenceDelta: -1` added on dismiss and invalidate | 40 (also 26, 32) |

**A guard defect the RED pass exposed, and the fix.** Behavior 5 initially produced **no** RED at
all. Injecting `subjectValue: "REDPROBE-msft"` into every privacy-inventory category record left
the file fully green at 49 pass / 0 fail — a privacy-critical assertion that could not detect the
leak it exists to prevent. The cause was that the leak sweep is a **denylist**: it serializes the
inventory and asserts five *known* values are absent, so any value it was not told to look for
passes silently. The category record is now closed by **shape** instead, an allowlist requiring
exactly `category`, `clearedBy`, `present`, `recordCount`. The same defect then produced 48 pass /
1 fail naming test 27 alone, and 49 pass / 0 fail once reverted. Fixed in
`tests/portfolio-foundation.unit.mjs`; this is the RED pass finding a real hole rather than
confirming a healthy one.

**On the corroborating tests.** Several defects reddened more than the behavior's own row. That is
recorded rather than trimmed: it shows the guards overlap, so a single regression is caught by
several independent assertions. #8 is the strongest case, reddening six.

## Lint And Quality

**Claim Source:** executed. The artifact lint result is recorded in [Validation Summary](#validation-summary).

The Build Quality Gate DoD item was not assessed and not ticked this run, per the run's explicit instruction.

## Uncertainty Declarations

Five DoD items are left unchecked. Each gap is named exactly rather than deferred.

Core items 1 and 2 were previously listed here and are now ticked. Core 1 reached 15 of 15
ids and Core 2 reached 7 of 7, verified by the guarded scan in the Coverage Report. Two
residual facts survive the tick and are recorded there rather than dropped: four of Core
1's ids are carried by an interpolated table-driven message rather than a literal one, and
every Core 2 carrier for NFR-003 sits on the Scope 02 mandate surface.

TP-03-04 and TP-03-05 were previously listed here as not executed. Both are now executed and
ticked, with every clause of both DoD lines mapped to the assertion that carries it. No
residual survives either tick: all seven clauses of TP-03-04 and all five of TP-03-05 are
carried by named assertions in the row's own test.

| DoD item | Why it is unchecked |
|---|---|
| Core 3 — full-personal clear section verification | **4 of the 13 nouns the line enumerates have no runtime surface at all: scenarios, allocations, dossiers, UI state.** The two vacuous nouns (interests, outcomes) are accepted as pinned. Ruling and the derived-versus-named sweep asymmetry that decides it are in decision D-03-08 and [core item 3](#dod-core-item-3--full-personal-clear-the-two-thirteens). Supersedes the earlier "9 of 13" line. **Planning ruling D-03-11** discharges all six unreachable nouns forward — interests/outcomes to Scope 06, scenarios to Scope 09, allocations to Scope 13, dossiers to Scope 15, UI state and whole-set closure to Scope 16 — with a named DoD item in each receiving scope. The item remains unchecked, now on Scope 03's own retained obligation: `policyDeclaredKeys` names five storage fields explicitly and pins the counts they produce, so a seventh personal key would be swept by nothing and redden nothing. |
| Core 4 — impact sweep, canaries, rollback and restore proof | Not assessed on this pass. The prior assessment stands: the Scope 01 and 02 re-run and the raw-namespace and clear-fault canaries are carried; the **exact rollback and restore proof** was the open half. |
| Core 5 — RED plus same-command GREEN | **14 of 14 behaviors have an intended RED**, each paired with same-command GREEN on restored source. Recorded per behavior with the injected defect and the test that went red. The pass also exposed and fixed a behavior-5 guard that could not detect its own defect. |
| TP-03-06 | **Executed and green (10 passed, exit 0), and still unchecked.** The second clause is carried: all six prior-scope rows passed in the same invocation. The first is not. The matrix is three axes — 6 foundation scenarios, 8 declared categories × 2 clear operations, and 6 declared clear steps plus a control. Axes 1 and 3 are fully carried. In Axis 2, **behavior clear × quarantine and behavior clear × session-fallback have no assertion at all**: the arm never stocks either, and the row's only namespace guard structurally excludes both. Three further cells are vacuous. Cell-by-cell mapping and the two-cell closing path are in [TP-03-06](#tp-03-06). Two earlier readings are superseded — "likely closable" (the suite grew from 8 rows to 10, and the new rows close the full-personal and partial-failure clauses but not the behavior column), and the "11 of 16 carried" count, corrected to 9 after a producer sweep showed the `interest-signals` behavior cell is vacuous rather than carried. **Planning ruling D-03-11** discharges the vacuous cells to Scope 06, which removes vacuity as a reason to hold this row; the two unasserted reachable cells are not discharged and are what keep it unchecked. |
| Build Quality Gate | Deliberately not assessed this pass. |

Two scope-level consequences follow, both owned outside this agent:

1. **The TP-03-03 row and file mismatch is resolved and the routing note is withdrawn.** The privacy suite gained exactly the clear-fault and post-clear-verification coverage the row promised, so no Test Plan edit is owed. Recorded here rather than deleted, because the earlier routing note is cited elsewhere in this report.
2. **FR-023 and NFR-001 have no Node-layer carrier by construction.** Absence from all public and remote surfaces needs a no-external-request scan, which is an `e2e-ui` or dedicated-scan concern. The executed TP-03-04 and TP-03-05 rows now each carry an origin-scoped request scan over their own run, so the surface exists; whether it discharges these two ids specifically was not re-scored on this pass, and the Coverage Report is unchanged.

One new planning-owned consequence is raised by this pass:

3. **The declared-key sweep does not derive itself.** `policyDeclaredKeys` and `declaredKeysByAdapter` name each policy storage field explicitly, so a storage key added to the policy later escapes both sweeps silently. The workspace array sweep has no such hole. This is the specific reason core item 3's UI-state noun cannot be treated the same way as its two vacuous nouns.

## Validation Summary

**Claim Source:** executed

| Check | Command | Exit Code |
|---|---|---|
| TP-03-01 | `node --test tests/portfolio-foundation.unit.mjs` | 0 — 49 pass, 0 fail |
| TP-03-02 | `node --test tests/portfolio-brief.functional.mjs` | 0 — 4 pass, 0 fail |
| TP-03-03 | `node --test tests/portfolio-privacy.functional.mjs` | 0 — 13 pass, 0 fail |
| TP-03-04, TP-03-05, TP-03-06 | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/portfolio-survival-foundation.spec.mjs` | 0 — 10 passed, 0 failed |
| Artifact lint | `bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab` | 0 |

All four suites pass. Suite health is not the constraint on this scope; evidence coverage is.

## Audit Verdict

No audit verdict is recorded. Scope 03 is not eligible for audit while five DoD items lack evidence.

<!-- bubbles:certifying-window-begin -->

## Current Certifying Window

The prior execution record is preserved above. Current status is governed by the canonical transition checks.
