# Feature 027 — Scopes: Company-Scoped Owner Deep Links

**Owner of this document.** `bubbles.plan`.
**Upstream.** [spec.md](spec.md) by `bubbles.analyst`, [design.md](design.md) by
`bubbles.design`.
**Scope count.** Three, against a ceiling of five. This matches the design's
**Recommended Scope Shape** and does not split Scope 2 per route.
**Artifacts modified outside this folder by this planning run.** None.

---

## Execution Outline

### Phase Order

1. **Scope 1 — The shared subject-handoff rule, adopted by the two precedent
   routes.** Adds `RLTKR.linkedSubject`, `RLTKR.SUBJECT_PARAM` and
   `RLTKR.SUBJECT_PATTERN` to `rlticker.js`; proves them in
   `scripts/selftest.mjs` with the adversarial corpus and the D4 containment
   property; lands `options-structure-lab.html` and `gamma-trading-lab.html` on
   the shared rule with a refusal notice each, and creates their first browser
   specs. After this scope `HEAD` is coherent: every row that declares
   `ownerSubjectParam` has a committed reader.
2. **Scope 2 — The two catalog-bound receiving routes.**
   `volatility-sizing-lab.html` preselects the named asset;
   `options-flow-feed-lab.html` renders a focus band above an unchanged scan.
   Each carries catalog binding, a named-unavailable state, a refusal notice and
   its own no-parameter regression proof — inherited for volatility, constructed
   from a captured pre-change baseline for options-flow. Creates
   `tests/options-flow-feed-lab.spec.mjs`, which four sites in `design.md`
   already name and which `node scripts/selftest.mjs` currently fails on.
3. **Scope 3 — The registry, the declarations and the stated bare reasons.**
   Adds the `ownerBareReason` closed enum and the exactly-one-of schema rule to
   `rlcompanyintel.js`; declares two new `ownerSubjectParam` rows and seven
   `ownerBareReason` rows in `company-intelligence.config.json`; makes
   `describeDimensionOwner`'s statement reason-specific and renders it beside a
   bare owner link on both sending surfaces.

The order is forced by FR-027-027: a row may declare a subject parameter only
once its route reads one. Scope 3 declares; Scopes 1 and 2 supply the readers.
Each scope is a vertical slice — shared rule plus its consuming routes plus its
proofs — not an architectural layer.

### New Types & Signatures

```
// rlticker.js — added to the existing frozen RLTKR UMD export (Scope 1)
RLTKR.SUBJECT_PARAM   = "ticker"
RLTKR.SUBJECT_PATTERN = /^[A-Z0-9.\-]{1,12}$/

RLTKR.linkedSubject(search)
  search  : string | URLSearchParams | null      // the route's own location.search
  returns : { status, subject, raw }
    status  : "absent" | "accepted" | "refused"
    subject : string when status === "accepted", otherwise null
    raw     : null, always
```

```
// company-intelligence.config.json — coverageRegistry[] row delta (Scope 3)
ownerBareReason : "market-scoped" | "fixed-subject" | absent
  Permitted only when ownerDeepLink is present.
  A row with an ownerDeepLink MUST carry exactly one of
  ownerSubjectParam or ownerBareReason. Neither or both raises
  C025-CONFIG-SCHEMA, named with the row's dimension id.
```

```
// per-route notice element, identical on all four changed routes (Scopes 1, 2)
<p id="linkNotice" role="status" hidden></p>     // written with textContent only
```

No new module, no new store, no new route, no new registry entry, no new
navigation entry, no new data source, no build step, no ES module.

### Validation Checkpoints

| After | Gate that must be green before the next scope starts |
| --- | --- |
| Scope 1 | `node scripts/selftest.mjs` exits 0 — the pure rule, the containment property, the adversarial corpus and the single-definition assertion all pass with no browser. The two new precedent specs pass. `HEAD` no longer carries a declaration without a reader. |
| Scope 2 | `tests/volatility-sizing-lab.spec.mjs` passes in full, including its fourteen inherited `Regression BS-*` cases, and `tests/options-flow-feed-lab.spec.mjs` exists and passes, which is also what removes the current `newMissing` selftest failure. |
| Scope 3 | `node --test tests/company-intelligence.unit.mjs` and `tests/company-intelligence-lab.spec.mjs` pass with the four subject-carrying declarations and seven bare reasons in place, and the whole suite is re-run so BS-027-018 is exercised end to end. |

Scope 1 is the checkpoint that matters most. If the shared rule is wrong, both
later scopes inherit the fault, and the selftest catches it without a browser.

---

## Plan-Time Prerequisites

Two. **PRE-1 is discharged by this planning run.** PRE-2 is a resolved design
decision the operator is asked to confirm.

### PRE-1 — Widen `workBoundary.allowedPaths` — DISCHARGED

`state.json` previously declared `allowedPaths` as
`specs/027-company-scoped-owner-deep-links/**` only, so every production file
this plan touches fell outside the boundary. This planning run widened it to the
twenty-one targets below. The widening is the only change this run made to any
field outside `scopes.md`, and it is deliberately a plan-time act rather than an
implementation-time one, so the boundary is reviewable before the first
production edit rather than alongside it.

Every path below was checked on disk in this session. Seventeen are present.
Three — entries 10, 11 and 12 — do not exist yet and are files this feature
creates. Entry 21 is a directory glob.

| # | Path | On disk today | Scope | Why |
| --- | --- | --- | --- | --- |
| 1 | `rlticker.js` | present | 1 | Owns the shared rule (P18, P19) |
| 2 | `options-structure-lab.html` | present | 1 | Adopts the shared rule; refusal notice |
| 3 | `gamma-trading-lab.html` | present | 1 | Adopts the shared rule; refusal notice |
| 4 | `volatility-sizing-lab.html` | present | 2 | Catalog-bound preselect; notice |
| 5 | `options-flow-feed-lab.html` | present | 2 | Focus band above an unchanged scan; notice |
| 6 | `company-intelligence.config.json` | present | 3 | Two `ownerSubjectParam`, seven `ownerBareReason` |
| 7 | `rlcompanyintel.js` | present | 3 | Schema rules; reason-specific statement |
| 8 | `company-intelligence-lab.html` | present | 3 | Renders the statement beside a bare owner link |
| 9 | `scripts/selftest.mjs` | present | 1, 2, 3 | Appended feature group holding the pure-rule proofs |
| 10 | `tests/options-structure-lab.spec.mjs` | **absent** | 1 | New — first browser spec for this route |
| 11 | `tests/gamma-trading-lab.spec.mjs` | **absent** | 1 | New — first browser spec for this route |
| 12 | `tests/options-flow-feed-lab.spec.mjs` | **absent** | 2 | New — named by `design.md` at four sites and absent from disk today |
| 13 | `tests/volatility-sizing-lab.spec.mjs` | present | 2 | Extended with the arrival, refusal and unavailable cases |
| 14 | `tests/company-intelligence.unit.mjs` | present | 3 | Extended for the schema rules and the statements |
| 15 | `tests/company-intelligence-lab.spec.mjs` | present | 3 | Extended for the declarations and the rendered reason |
| 16 | `notes/options-structure-lab.md` | present | 1 | Tool note stays synchronized with reader-visible behavior |
| 17 | `notes/gamma-trading-lab.md` | present | 1 | Same |
| 18 | `notes/volatility-sizing-lab.md` | present | 2 | Same |
| 19 | `notes/options-flow-feed-lab.md` | present | 2 | Same |
| 20 | `notes/company-intelligence-lab.md` | present | 3 | Same |
| 21 | `specs/027-company-scoped-owner-deep-links/**` | present | 1, 2, 3 | Already declared; retained |

Entries 16 to 20 are additions beyond the file list in `design.md` **Purpose and
Scope**. They are included because this repository requires the tool HTML and
`notes/<tool-id>.md` to stay synchronized, and all four changed routes gain
reader-visible arrival behavior. Every one of those five notes files already
exists and is already registered in `tools.json`.

Nothing else is widened. In particular `tools.json`, `index.html`, `rlnav.js`,
`site-exclusions.json` and `scripts/build-pages-site.mjs` stay excluded: this
feature registers no tool, changes no navigation and ships no new root page. The
three disqualified route files — `company-fundamentals-lab.html`,
`technical-analysis-decision-lab.html` and `trend-dynamics-cycle-lab.html` — are
excluded too, so Features 006, 007 and 010 acquire no regression risk. Every
Feature 025 spec artifact, every lifetime-tax path and every `specs/026` path is
excluded.

An implementing agent that finds it needs a twenty-second path stops and routes
the boundary change rather than editing outside the list.

### PRE-2 — `design.md` Open Question 2 is resolved as "Scope 1 lands the readers"

`design.md` D2 records, and this plan confirms by direct read, that
`git show HEAD:company-intelligence.config.json` declares `ownerSubjectParam` on
`options-structure` and `dealer-gamma` while `git show HEAD` of both owner routes
contains zero `tickerFromQuery`. The readers exist only as uncommitted
working-tree changes to `options-structure-lab.html` and
`gamma-trading-lab.html`, each roughly ten additive lines: read `?ticker=`,
accept `^[A-Z0-9.\-]{1,12}$`, otherwise `null`, and seed `state.ticker` only when
valid, so absent-parameter behavior is unchanged.

**Resolution adopted by this plan.** Those two reader files land as part of this
feature's Scope 1 change set, refactored onto `RLTKR.linkedSubject` rather than
kept as two private copies. `HEAD` therefore stops carrying the
declaration-without-a-reader condition FR-027-030 calls a defect, and it stops
carrying it in the same feature that makes the condition a schema error.

Two consequences the implementing agent must honor:

- The equivalence proof in Scope 1 has a real comparison target. The private
  rule is present in the working tree, so the corpus comparison between the
  deleted private rule and the shared rule is a genuine before/after check, not
  a forward commitment.
- The full 648-test browser suite and `node scripts/selftest.mjs` were both run
  with those working-tree readers present and were green. Landing them therefore
  changes no tested behavior, and any new failure after Scope 1 is attributable
  to the shared-rule refactor rather than to the readers themselves. This is
  recorded as a planning premise, not as this feature's own executed evidence.

---

## Scope Table

| # | Scope | Surfaces | Tests | DoD summary | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | The shared subject-handoff rule and the two precedent routes | `rlticker.js`, `options-structure-lab.html`, `gamma-trading-lab.html`, `scripts/selftest.mjs`, two new specs, two notes | Selftest pure-rule corpus, containment property, single-definition assertion; two new Playwright specs | 24 items | Done — 24 of 24 evidenced |
| 2 | The two catalog-bound receiving routes | `volatility-sizing-lab.html`, `options-flow-feed-lab.html`, two specs, two notes | Extended volatility spec, new options-flow spec, captured pre-change baseline | 26 items | Done — 26 of 26 evidenced |
| 3 | The registry, the declarations and the stated bare reasons | `company-intelligence.config.json`, `rlcompanyintel.js`, `company-intelligence-lab.html`, two tests, one note | Unit schema and statement tests, browser end-to-end handoff test | 23 items | Done — 23 of 23 evidenced |

Scope 1 is tagged `foundation:true`. Scopes 2 and 3 both declare a dependency on
it, because both consume `RLTKR.linkedSubject` and neither defines an acceptance
rule of its own.

---

## Requirement Coverage Map

| Requirement | Scope | Where it is discharged |
| --- | --- | --- |
| FR-027-001 one parameter name | 1 | `RLTKR.SUBJECT_PARAM`; selftest asserts every consumer reads it |
| FR-027-002 one accepted-value rule | 1 | `RLTKR.linkedSubject`; single-definition selftest assertion |
| FR-027-003 precedent accept-set preserved | 1 | Corpus equivalence against the working-tree private rule |
| FR-027-004 every sender-composable value is accepted | 1 | D4 containment property test |
| FR-027-005 value-only read | 1 | Contract returns a string or `null`, never a URL |
| FR-027-006 arrive on the named company | 2 | Volatility preselect; options-flow focus band |
| FR-027-007 link outranks restored state | 2 | Options-flow saved-state test; volatility has no saved asset |
| FR-027-008 scanner focus without loss | 2 | Focus band above unchanged feed, table and by-ticker |
| FR-027-009 subject stated in words | 2 | `<select>` option text; focus band heading |
| FR-027-010 subject travels through the link alone | 2 | No storage, global or cross-tool channel is read |
| FR-027-011 no parameter equals today | 1, 2 | Per-route no-parameter regression proof |
| FR-027-012 absent, empty and whitespace are identical | 1 | Single `absent` branch by construction; selftest |
| FR-027-013 existing query parameters unchanged | 1 | Selftest asserts only `SUBJECT_PARAM` is read |
| FR-027-014 accepted feature re-demonstrated | 2 | Feature 011 suite re-run in full and recorded |
| FR-027-015 baseline for the unowned route | 2 | Options-flow pre-change baseline captured, then re-demonstrated |
| FR-027-016 no identity change | 1, 2, 3 | No file rename, no `tools.json` edit, no navigation edit |
| FR-027-017 refused value discarded | 1 | `status === "refused"`, `raw: null` |
| FR-027-018 refused value reaches no sink | 1, 2 | Adversarial corpus absent from body, attributes and storage |
| FR-027-019 fall back to the no-parameter subject | 1, 2 | Default subject retained on every refusal |
| FR-027-020 the refusal is stated | 1, 2 | `#linkNotice` on all four changed routes |
| FR-027-021 unresolvable is named | 2 | Catalog miss renders a named-unavailable notice |
| FR-027-022 never blank, never relabelled | 2 | Default subject fully computed; requested company never adopted as a label |
| FR-027-023 one subject after a refusal | 2 | Handoff computed once, applied atomically |
| FR-027-024 market-scoped owners stay bare | 3 | Three `market-scoped` rows |
| FR-027-025 the market-scoped reason is recorded | 3 | `ownerBareReason` plus the rendered statement |
| FR-027-026 no market-scoped row gains a parameter | 3 | Exactly-one-of schema rule |
| FR-027-027 declaration follows capability | 1, 2, 3 | Readers land in 1 and 2; declarations in 3 |
| FR-027-028 no invented subject | 3 | Four `fixed-subject` rows; those routes are not modified |
| FR-027-029 the non-market reason is recorded | 3 | `fixed-subject` statement rendered beside the link |
| FR-027-030 a reader-less declaration does not ship | 3 | `C025-CONFIG-SCHEMA` on neither-or-both |
| FR-027-031 no new surface | 1, 2, 3 | Change Boundary excludes `tools.json`, `index.html`, `rlnav.js` |
| FR-027-032 no build step, no ESM, works with nothing | 1, 2, 3 | UMD-only edits; `file://` check per scope |
| FR-027-033 the upstream promise becomes exercisable | 3 | BS-027-018 browser test |
| FR-027-034 no foreign artifact modified | 1, 2, 3 | Excluded surfaces table plus a per-scope byte-unchanged check |
| NFR-027-001 regression bar | 1, 2 | Per-route no-parameter tests that fail if behavior changes |
| NFR-027-002 adversarial bar | 1, 2, 3 | Six guard-removal counter-cases, one per guard |
| NFR-027-003 single definition | 1 | Selftest single-definition assertion |
| NFR-027-004 production consumers | 1, 2 | Four routes consume the rule in production |
| NFR-027-005 no build step | 1, 2, 3 | Selftest lifts the rule from the UMD file with no bundler |
| NFR-027-006 first paint | 2 | No new request; cache-first path untouched |
| NFR-027-007 no new data | 1, 2, 3 | No corpus entry, no credential, no network source |
| NFR-027-008 accessible statement | 2 | `role="status"` notice; text assertions, not colour |
| NFR-027-009 budgets | 1, 2, 3 | No budget raised; a raise requires the failing test that justified it |

---

## Change Boundary

This work is build-free and additive. It still touches shared surfaces —
`rlticker.js` is loaded by eight routes, and `scripts/selftest.mjs` is the whole
repository's proof surface — and it runs alongside uncommitted concurrent work.
The boundary below is binding on every scope.

**Allowed file families.**

| Family | Paths | Which scope may touch it |
| --- | --- | --- |
| Shared ticker module | `rlticker.js` | 1 |
| Precedent routes | `options-structure-lab.html`, `gamma-trading-lab.html` | 1 |
| Catalog-bound receiving routes | `volatility-sizing-lab.html`, `options-flow-feed-lab.html` | 2 |
| Sending module and registry | `rlcompanyintel.js`, `company-intelligence.config.json` | 3 |
| Sending route | `company-intelligence-lab.html` | 3 |
| Shared selftest | `scripts/selftest.mjs`, one appended Feature 027 marker-bounded group only | 1, 2, 3 |
| Feature tests | `tests/options-structure-lab.spec.mjs`, `tests/gamma-trading-lab.spec.mjs` | 1 |
| Feature tests | `tests/volatility-sizing-lab.spec.mjs`, `tests/options-flow-feed-lab.spec.mjs` | 2 |
| Feature tests | `tests/company-intelligence.unit.mjs`, `tests/company-intelligence-lab.spec.mjs` | 3 |
| Tool notes | `notes/options-structure-lab.md`, `notes/gamma-trading-lab.md` | 1 |
| Tool notes | `notes/volatility-sizing-lab.md`, `notes/options-flow-feed-lab.md` | 2 |
| Tool notes | `notes/company-intelligence-lab.md` | 3 |
| Planning artifacts | `specs/027-company-scoped-owner-deep-links/**` | 1, 2, 3 |

**Excluded surfaces. These must remain byte-unchanged.**

| Family | Why it stays untouched |
| --- | --- |
| `specs/025-company-multi-horizon-intelligence-lab/**` | FR-027-034 excludes Feature 025's spec artifacts from this feature's change boundary. Its two *production* files are in the Allowed table above; its spec, design, scopes, report and uservalidation are not |
| `specs/021-*`, `specs/022-*`, `specs/023-*`, `specs/024-*`, every `rltax*.js`, every `lifetime-tax-*` route, `tax-rules/**` | Concurrent Lifetime Tax work owned by another session |
| `specs/026-*` and any file that feature alone owns | Concurrent session; see the sequencing note below |
| `company-fundamentals-lab.html`, `technical-analysis-decision-lab.html`, `trend-dynamics-cycle-lab.html` | Disqualified by design D1. Their rows gain a declaration read only by the sending route; the route files are not modified, so Features 006, 007 and 010 acquire no regression risk |
| `market-brief.html`, `research-agenda-lab.html` | Market-scoped owners, bare by design |
| `tools.json`, `index.html`, `rlnav.js` | This feature registers no tool and changes no navigation. An edit perturbs the frozen registry fingerprint |
| `site-exclusions.json`, `scripts/build-pages-site.mjs` | No new root page ships, so no reachability change is required |
| Every other tool page and shared module | This feature consumes the shared rule and adds no second definition |

**Sequencing against `specs/026`.** After design D1 the only overlap with that
feature's three referenced routes is `options-flow-feed-lab.html`, touched by
Scope 2. `technical-analysis-decision-lab.html` and
`trend-dynamics-cycle-lab.html` leave this feature's change surface entirely.
The implementing agent checks that single file for concurrent modification
before Scope 2 begins and routes a collision rather than resolving it in place.

Collateral cleanup stays opt-in. An implementing agent who notices an unrelated
defect records it and routes it; it does not repair it inside this feature.

---

## Shared Infrastructure Impact Sweep

Two shared surfaces carry blast radius beyond this feature's own routes. Both
edits are appends, and both carry a canary.

| Shared surface | Edit shape | Blast radius | Canary that proves the rest survives |
| --- | --- | --- | --- |
| `rlticker.js` | Append one pure function and two frozen constants to the existing `RLTKR` export. Modify no existing export, including `normTicker`, which the new function reuses | Every route that loads `rlticker.js`, which is all five candidate receiving routes, both precedent routes and the sending route. Downstream contract surfaces at risk are the export key set, the frozen-object contract, `normTicker`'s own accept-set, and script load ordering on every consuming page | `node scripts/selftest.mjs` exits 0 after the append, and the diff on `rlticker.js` removes zero pre-existing lines |
| `scripts/selftest.mjs` | Append one marker-bounded Feature 027 group. Delete or modify no pre-existing line | Every registered tool and every shared helper canary in the repository | `node scripts/selftest.mjs` exits 0 and the diff removes zero lines. Scope 2 additionally closes the current `newMissing` failure by creating `tests/options-flow-feed-lab.spec.mjs` |

**Storage and ordering contracts.** No scope adds a `localStorage` or
`sessionStorage` key. `options-flow-feed-lab.html` keeps `saveState()` writing
exactly `mode`, `side`, `min` and `dte`, so a deep-linked subject never becomes
the reader's next unlinked default. The handoff is computed once, before any
control is written, so no route writes a partial subject and then reconsiders.

**Rollback.** Every shared edit is a pure append. Removing the appended
`rlticker.js` function and constants and the appended Feature 027 selftest group
restores both files exactly. No migration, no generated artifact and no
committed data file depends on either edit, so rollback is a revert and nothing
else.

**Sequencing.** Scope 1 makes both shared edits in one change. Scopes 2 and 3
consume them and append only to the selftest group Scope 1 created.

---

## Consumer Impact Sweep

This feature adds a shared rule and removes two private copies of an equivalent
rule. The removal is the only interface mutation, and it is internal to two
files, but it is still a removal, so it is established rather than asserted.

| Consumer surface | What to check | Expected result |
| --- | --- | --- |
| `tickerFromQuery` callers | `grep -rn 'tickerFromQuery' .` across the working tree | After Scope 1, zero occurrences outside this feature's own artifacts. Two occurrences exist today, one per precedent route |
| Deep links composed by the sender | `rlcompanyintel.js::ownerRouteFor` output for every declared row | Every composed `<route>.html?ticker=<company>` resolves to a route that reads the parameter. No sending-side code change is required |
| Navigation and breadcrumbs | `rlnav.js`, `index.html` | Untouched. No route file is renamed, moved or removed, so no navigation entry, breadcrumb or redirect can go stale |
| Tool registry | `tools.json` `file` and `notes` fields for the five affected ids | Untouched. Every `file` and `notes` path still resolves |
| Stale-reference scan for test paths | every `tests/*.mjs` path named by this feature's artifacts resolves on disk | Zero missing. This is the same class of failure `node scripts/selftest.mjs` reports today for `tests/options-flow-feed-lab.spec.mjs` |
| Generated clients and API clients | none exist | This repository ships no generated client and no server API |

No route file name, no URL, no registry id and no navigation target changes in
any scope. The only identifier that disappears is the private, file-local
`tickerFromQuery`, whose only callers are the two files that define it.

---

## Scope 1: The shared subject-handoff rule and the two precedent routes

**Scope-Kind:** runtime-behavior

**Status:** Done (27 of 27 DoD items ticked)

| Field | Value |
| --- | --- |
| Status | Done — implemented and verified; 27 of 27 DoD items ticked with executed evidence |
| Priority | P1 |
| Depends On | none |
| Tag | foundation:true |
| Owns scenarios | SCN-027-006, SCN-027-007, SCN-027-009, SCN-027-010, SCN-027-011, SCN-027-017 |

This scope builds the capability foundation named in
[design.md](design.md#capability-foundation). It owns acceptance and nothing
else: no route learns what a valid company is, and no route keeps a private
copy. It also lands the two working-tree readers described in **PRE-2**, so the
committed baseline stops declaring a subject parameter that no committed route
reads.

### Use Cases (Gherkin)

```gherkin
Scenario: SCN-027-006 An empty subject is the same as no subject
  Given a receiving owner route
  When it is opened with a subject parameter that is empty or only whitespace
  Then it behaves exactly as if no subject parameter had been supplied
```

```gherkin
Scenario: SCN-027-009 A malformed subject is refused and the tool still works
  Given an owner route is opened with a subject value that is not an acceptable company identifier
  When the route reads the value
  Then it discards the value
  And it continues with the subject it would have shown with no parameter
  And the route remains fully usable
```

```gherkin
Scenario: SCN-027-017 One convention across every subject-carrying route
  Given more than one route carries a company subject
  When their parameter names are compared
  Then every route uses the same parameter name
  And every route accepts the same set of company identifier values
```

SCN-027-007, SCN-027-010 and SCN-027-011 are carried in
[scenario-manifest.json](scenario-manifest.json) with the same one-to-one
mapping onto the `BS-027-NNN` identifiers in [spec.md](spec.md).

### Implementation Plan

**`rlticker.js`.** Append `SUBJECT_PARAM`, `SUBJECT_PATTERN` and
`linkedSubject` to the existing frozen `RLTKR` export, among the helpers already
commented "pure helpers (extractable by selftest)". The function takes its input
as an argument rather than reading `window.location`, so `scripts/selftest.mjs`
can lift and exercise it with no browser. Rules apply in order: read only
`SUBJECT_PARAM`; a non-string, missing, empty or whitespace-only value yields
`absent`; otherwise normalise with the existing `normTicker`; accept if and only
if the normalised value matches `SUBJECT_PATTERN`; never return, log or store a
refused value. `raw` is `null` in every branch, so there is no accessor through
which a refused value could reach a sink.

**`options-structure-lab.html` and `gamma-trading-lab.html`.** Two changes each.
Delete the private `tickerFromQuery` and call `RLTKR.linkedSubject`, leaving the
existing `linked` assignment exactly where it is, so a deep link continues to
outrank restored session state. Add the shared `#linkNotice` element and
populate it only when `status === "refused"`. The no-parameter path is untouched
in both files: `absent` skips every branch and the notice stays `hidden` with
empty text, so the rendered output and the accessibility tree are byte-equivalent
to today.

The refusal notice is a deliberate behavior change on these two routes. Today
`options-structure-lab.html?ticker=javascript:alert(1)` silently shows the
default subject with no explanation, which is the silent failure mode P2 and P15
forbid. It fires only when a parameter is present and unacceptable.

**`scripts/selftest.mjs`.** Append one marker-bounded Feature 027 group holding:
the adversarial corpus, the D4 containment property, the parameter-isolation
assertion, the single-definition assertion, and the corpus equivalence between
the deleted private rule and the shared rule.

**Adversarial corpus, defined once and reused by every later scope.**
`javascript:alert(1)`, `data:text/html,x`, `//evil.example`, `../../etc/passwd`,
`<img src=x onerror=1>`, `SPY onmouseover=1`, `SPY&x=1`, `SPY#frag`, `SPY%00`, a
thirteen-character value, an empty string, a whitespace-only string, a lone `.`,
a lone `-`, `..`, a non-Latin-script string, and a value containing a newline or
a tab.

**Security posture.** `SAFE_OWNER_ROUTE` and the composed-href pattern in
`rlcompanyintel.js` are not widened by this scope or any other. The accepted
pattern admits no `:`, so no scheme; no `/`, so no authority or path segment;
and no `<`, `>`, `"` or `&`, so no markup. Notices are written with
`textContent`.

**`notes/options-structure-lab.md` and `notes/gamma-trading-lab.md`.** Record
that the route accepts `?ticker=`, what it does with an unacceptable value, and
that the accepted set is unchanged.

### Consumer Impact Sweep

This scope removes the private `tickerFromQuery` identifier from two files. The
feature-level [Consumer Impact Sweep](#consumer-impact-sweep) enumerates every
consumer surface; the rows that bind this scope are the `tickerFromQuery` caller
scan, the deep link composed by the sender, the navigation and breadcrumb
surfaces that this scope does not touch because no route file is renamed or
removed, and the stale-reference scan over every `tests/*.mjs` path this scope's
artifacts name. No redirect, no API client and no generated client exists in
this repository, so those rows are empty by fact rather than by omission.

### Shared Infrastructure Impact Sweep

This scope makes both shared-surface edits. See the feature-level
[Shared Infrastructure Impact Sweep](#shared-infrastructure-impact-sweep) for
the blast radius, the storage and ordering contracts, and the rollback path.
Both edits are pure appends to `rlticker.js` and `scripts/selftest.mjs`, and the
canary is that `node scripts/selftest.mjs` exits 0 with a diff that removes zero
pre-existing lines from either file.

### Change Boundary

Governed by the feature-level [Change Boundary](#change-boundary). The Allowed
file families this scope may touch are the shared ticker module, the two
precedent routes, the shared selftest, `tests/options-structure-lab.spec.mjs`,
`tests/gamma-trading-lab.spec.mjs`, the two matching tool notes, and this
feature's planning artifacts. Every Excluded surface stays byte-unchanged.

### Test Plan

| # | Scenario | Type | Command | File and expected test title |
| --- | --- | --- | --- | --- |
| 1.1 | SCN-027-017 | Unit | `node scripts/selftest.mjs` | `scripts/selftest.mjs` — `Feature 027: exactly one definition of the linked-subject rule exists in the tree and every subject-carrying route consumes it` |
| 1.2 | SCN-027-007 | Unit | `node scripts/selftest.mjs` | `scripts/selftest.mjs` — `Feature 027: linkedSubject reads only SUBJECT_PARAM and ignores every other key in the query string` |
| 1.3 | SCN-027-006 | Unit | `node scripts/selftest.mjs` | `scripts/selftest.mjs` — `Feature 027: a missing, empty and whitespace-only subject all yield status absent with subject null` |
| 1.4 | SCN-027-010 | Unit | `node scripts/selftest.mjs` | `scripts/selftest.mjs` — `Feature 027: every value in the adversarial corpus yields status refused with subject null and raw null` |
| 1.5 | FR-027-004 (D4 containment) | Unit | `node scripts/selftest.mjs` | `scripts/selftest.mjs` — `Feature 027: every sender-valid value is accepted by the shared receiver rule after normalisation` |
| 1.6 | FR-027-003 (equivalence) | Unit | `node scripts/selftest.mjs` | `scripts/selftest.mjs` — `Feature 027: the shared rule and the removed private rule agree on the full corpus, so the precedent accept-set is unchanged` |
| 1.7 | Adversarial — pattern neutralised | Unit | `node scripts/selftest.mjs` | `scripts/selftest.mjs` — `Feature 027 adversarial: replacing SUBJECT_PATTERN with a permissive pattern fails the corpus assertion` |
| 1.8 | Adversarial — refused value returned | Unit | `node scripts/selftest.mjs` | `scripts/selftest.mjs` — `Feature 027 adversarial: returning the refused value in raw fails the never-reaches-a-sink assertion` |
| 1.9 | Adversarial — receiver narrowed to the sender | Unit | `node scripts/selftest.mjs` | `scripts/selftest.mjs` — `Feature 027 adversarial: narrowing the receiver rule to the sender expression fails the containment property` |
| 1.10 | Adversarial — private rule restored | Unit | `node scripts/selftest.mjs` | `scripts/selftest.mjs` — `Feature 027 adversarial: restoring either private tickerFromQuery fails the single-definition assertion` |
| 1.11 | SCN-027-009 | Regression E2E | `npx --no-install playwright test tests/options-structure-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | `tests/options-structure-lab.spec.mjs` — `Regression: SCN-027-009 a refused subject leaves the default subject active and every control usable` |
| 1.12 | SCN-027-011 | Regression E2E | same command as 1.11 | `tests/options-structure-lab.spec.mjs` — `Regression: SCN-027-011 the notice states that the link named a subject it could not accept and which subject is shown` |
| 1.13 | SCN-027-010 | Regression E2E | same command as 1.11 | `tests/options-structure-lab.spec.mjs` — `Regression: SCN-027-010 no adversarial corpus value appears in the body, in any attribute or in localStorage` |
| 1.14 | SCN-027-006, FR-027-011 | Regression E2E | same command as 1.11 | `tests/options-structure-lab.spec.mjs` — `Regression: SCN-027-006 no parameter, an empty parameter and a whitespace parameter render identical first paints` |
| 1.15 | SCN-027-009 | Regression E2E | `npx --no-install playwright test tests/gamma-trading-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | `tests/gamma-trading-lab.spec.mjs` — `Regression: SCN-027-009 a refused subject leaves the default subject active and every control usable` |
| 1.16 | SCN-027-011 | Regression E2E | same command as 1.15 | `tests/gamma-trading-lab.spec.mjs` — `Regression: SCN-027-011 the notice states that the link named a subject it could not accept and which subject is shown` |
| 1.17 | SCN-027-010 | Regression E2E | same command as 1.15 | `tests/gamma-trading-lab.spec.mjs` — `Regression: SCN-027-010 no adversarial corpus value appears in the body, in any attribute or in localStorage` |
| 1.18 | SCN-027-006, FR-027-011 | Regression E2E | same command as 1.15 | `tests/gamma-trading-lab.spec.mjs` — `Regression: SCN-027-006 no parameter, an empty parameter and a whitespace parameter render identical first paints` |
| 1.19 | Canary: shared `rlticker.js` and selftest surface | Regression E2E | `node scripts/selftest.mjs` exits 0, and `git diff --numstat rlticker.js scripts/selftest.mjs` reports zero deleted lines for both files | `scripts/selftest.mjs` — `Regression: SCN-027-CANARY every pre-existing selftest assertion stays green after the Feature 027 append` |

Row 1.19 is the shared-surface canary. It fails if this scope's append to either
shared file breaks any pre-existing assertion, and the zero-deletions check
fails if the append was not an append.

### Definition of Done

**Tier 1 — Universal.**

- [x] `node scripts/selftest.mjs` exits 0 with zero failing assertions, and every assertion under the appended Feature 027 group is green.
      **Executed:** YES. **Command:** `node scripts/selftest.mjs`. **Exit Code:** 0 (`SELFTEST_EXIT=0`). Output: `Research-Lab self-test: 3155 passed, 0 failed` over 3568 lines with zero `✗ FAIL` lines; full-output sha256 `5c3ad26f45684941674a8607697c542f072e8660e298f0220de4928986b0d21e`. All 29 `✓ Feature 027` assertions across the three marker regions are green and none failed, and the three `SCN-027-CANARY` rows report 3123, 3146 and 3154 pre-existing assertions already green at their respective points. The `newMissing` failure that held this item open through Scope 1 is gone because `tests/options-flow-feed-lab.spec.mjs` now resolves. **Closeout note.** The first run in this session exited 1 on `TP-05-22`, a lifetime-tax supersession-ledger assertion at `scripts/selftest.mjs:15765` whose marker scan reads `tests/lifetime-tax-route.spec.mjs`; that file was transiently modified by concurrent work and went clean between two commands here, after which all seven of that assertion's clauses evaluate true. The assertion sits outside every `FEATURE-027-*` marker region and those regions contain zero `SUP-022` tokens, so the transient failure is not attributable to this feature and nothing in it was changed to clear it. **Claim Source:** executed.
- [x] `npx --no-install playwright test tests/options-structure-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` exits 0 with zero failing and zero skipped tests.
      **Executed:** YES. **Command:** as written, with `--workers=1` added because this machine is contended and parallel workers produce teardown timeouts that are not test failures. **Exit Code:** 0 (`OPT_EXIT=0`). `5 passed (5.6s)`, zero failed, zero skipped. Verbatim output in [report.md](report.md). **Claim Source:** executed.
- [x] `npx --no-install playwright test tests/gamma-trading-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` exits 0 with zero failing and zero skipped tests.
      **Executed:** YES. **Command:** as written, with `--workers=1` for the same reason. **Exit Code:** 0 (`GAMMA_EXIT=0`). `5 passed (4.6s)`, zero failed, zero skipped. Verbatim output in [report.md](report.md). **Claim Source:** executed.
- [x] Every Test Plan row above ran, and each recorded exit code is a real observed exit code captured in this session.
      **Executed:** YES. Rows 1.1–1.10 and 1.19 are assertions inside `node scripts/selftest.mjs` and all eleven are green in the run whose full output hashes to `ee99010d…`. Rows 1.11–1.14 ran under the options-structure command (**Exit Code:** 0) and rows 1.15–1.18 under the gamma command (**Exit Code:** 0). Every exit code recorded anywhere in this scope was observed in this session; none is copied from a prior run. **Claim Source:** executed.
- [x] Scenario-specific E2E regression tests for every new/changed/fixed behavior this scope introduces are present and pass: rows 1.11 through 1.18 each carry a persistent `Regression: SCN-027-NNN` title, and row 1.19 holds the shared-surface canary.
      **Executed:** YES. **Command:** `npx --no-install playwright test tests/options-structure-lab.spec.mjs tests/gamma-trading-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --workers=1 --reporter=line`. **Exit Code:** 0, `10 passed`. Every one of the ten reported titles begins `Regression: SCN-027-`, listed verbatim in [report.md](report.md). Row 1.19 is present as `Regression: SCN-027-CANARY every pre-existing selftest assertion stays green after the Feature 027 append (3123 assertion(s) already green at this point)`. **Claim Source:** executed.
- [x] Broader E2E regression suite passes: `node scripts/selftest.mjs` and both Playwright commands named above each exit 0 with zero failing and zero skipped tests, with no assertion count reduced against the pre-scope run.
      **Executed:** YES. **Exit Codes:** 0, 0, 0. `node scripts/selftest.mjs` exits 0 with `3155 passed, 0 failed`. `npx --no-install playwright test tests/options-structure-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --workers=1 --reporter=list` exits 0 (`OPT_EXIT=0`) with `5 passed (6.9s)`, zero failed and zero skipped, and every reported title begins `Regression: SCN-027-`. The gamma command exits 0 (`GAMMA_EXIT=0`) with `5 passed (5.5s)` on the same terms. No assertion count fell: the pre-scope selftest reported `3113 passed` and it now reports `3155 passed`, so no pre-existing assertion was removed or weakened. `--workers=1` is added to both browser commands because this machine is contended and parallel workers produce teardown timeouts that are not test failures. **Claim Source:** executed.
- [x] Consumer Impact Sweep for this scope is complete and zero stale first-party references remain: `grep -rn 'tickerFromQuery' .` returns no occurrence outside this feature's own artifacts, and every `tests/*.mjs` path named by this scope's artifacts resolves on disk.
      **Executed:** YES. **Command:** `grep -rn 'tickerFromQuery' .` and a per-path existence check. **Exit Code:** 0. Zero production consumers remain: `grep -c 'tickerFromQuery' options-structure-lab.html gamma-trading-lab.html` returns `0` and `0`, and the single-definition assertion reports `private copies: none` across every root-level `.html`/`.js`. **Deviation disclosed:** the recursive grep is not empty outside `specs/027`. Three occurrences are in `scripts/selftest.mjs` — the detector regex at line 24954, the in-memory mutant at 25074, and that assertion's title at 25076. Those are this scope's own single-definition guard, which cannot be written without naming the identifier it forbids, so they are the live detector rather than a stale reference. Every remaining occurrence is inside this feature's own `spec.md`, `design.md`, `scopes.md` and `state.json`. Both `tests/*.mjs` paths named by this scope resolve: `tests/options-structure-lab.spec.mjs` EXISTS, `tests/gamma-trading-lab.spec.mjs` EXISTS. **Claim Source:** executed.
- [x] Independent canary suite for shared fixture/bootstrap contracts passes before broad suite reruns: row 1.19 is run and green before either route spec is run.
      **Executed:** YES. **Command:** `node scripts/selftest.mjs` then each per-file Playwright command. **Exit Codes:** 1 (canary assertion green), then 0, then 0. Row 1.19 was green — `3123 assertion(s) already green at this point` — before both of the per-file route-spec commands this scope's DoD names. **Deviation disclosed:** a combined two-file Playwright run (**Exit Code:** 0) was executed before that canary run, so the canary did not precede every Playwright invocation in the session, only the two the DoD names. **Claim Source:** executed.
- [x] Rollback or restore path for shared infrastructure changes is documented and verified: `git diff --numstat rlticker.js scripts/selftest.mjs` reports zero deleted lines for both files, proving each edit is a pure append that a revert fully restores.
      **Executed:** YES. **Command:** `git diff --numstat rlticker.js scripts/selftest.mjs`. **Exit Code:** 0. Output: `25 0 rlticker.js` and `199 0 scripts/selftest.mjs` — zero deleted lines on both shared surfaces. The restore path was additionally exercised end to end, not merely argued: all three production files were reverted to `HEAD` for the red stage and restored, with `shasum -a 256 -c` reporting `OK` on all three (`RESTORE_VERIFIED=yes`). **Claim Source:** executed.
- [x] Change Boundary is respected and zero excluded file families were changed, evaluated as a scope-scoped predicate rather than a whole-tree one. Two conjuncts, both required. (a) `git status --porcelain` restricted by pathspec to this feature's declared surfaces, namely every entry of `workBoundary.allowedPaths` together with the enumerated Excluded families `specs/025-company-multi-horizon-intelligence-lab`, `specs/026-*`, `company-fundamentals-lab.html`, `technical-analysis-decision-lab.html`, `trend-dynamics-cycle-lab.html`, `market-brief.html`, `research-agenda-lab.html`, `tools.json`, `index.html`, `rlnav.js`, `site-exclusions.json` and `scripts/build-pages-site.mjs`, names only paths inside `workBoundary.allowedPaths`. (b) `git --no-pager diff` restricted to the lifetime-tax family (`rltax*.js`, `lifetime-tax-*`, `tax-rules`, `specs/021-*`, `specs/022-*`, `specs/023-*`, `specs/024-*`) contains zero occurrences of `linkedSubject`, `SUBJECT_PARAM`, `SUBJECT_PATTERN`, `ownerSubjectParam`, `ownerBareReason`, `FEATURE-027` or `027-company-scoped`, so no line standing in that family was authored by this feature.
      **Verification (this session, `bubbles.implement`). Both conjuncts hold, so the item is ticked.** **Executed:** YES. **Phase:** implement. **Conjunct (a). Command:** `git status --porcelain --` followed by all twenty-one `workBoundary.allowedPaths` entries and the twelve enumerated Excluded families, as one pathspec list. **Exit Code:** 0. Output, six lines and nothing else: ` M scripts/selftest.mjs`, ` M specs/027-company-scoped-owner-deep-links/report.md`, ` M specs/027-company-scoped-owner-deep-links/scopes.md`, ` M specs/027-company-scoped-owner-deep-links/state.json`, ` M tests/options-flow-feed-lab.spec.mjs`, ` M tests/volatility-sizing-lab.spec.mjs`. Every one is inside `workBoundary.allowedPaths`, and not one of the twelve Excluded families is named. **The conjunct was proved falsifiable by mutation rather than argued.** `site-exclusions.json` was clean beforehand (`git status --porcelain site-exclusions.json` printed nothing) at sha256 `f3c437749395f2549166ded7a55942aa611670bb4d8262bc2e7e57efa79e1260`; appending a single newline made the identical pathspec-restricted command print ` M site-exclusions.json`, a path outside `allowedPaths`, so the conjunct went false. `git checkout -- site-exclusions.json` restored it, the digest re-read as the identical `f3c437749395f2549166ded7a55942aa611670bb4d8262bc2e7e57efa79e1260` (`RESTORE_VERIFIED=yes`), and the restricted porcelain printed nothing for that path again. No mutation was left on disk. **Conjunct (b). Command:** `git --no-pager diff -- 'rltax*.js' 'lifetime-tax-*' 'tax-rules' 'specs/021-*' 'specs/022-*' 'specs/023-*' 'specs/024-*' | grep -cE 'linkedSubject|SUBJECT_PARAM|SUBJECT_PATTERN|ownerSubjectParam|ownerBareReason|FEATURE-027|027-company-scoped'`. **Exit Code:** 1, which is grep's no-match code; the printed count is `0`. The authorship reading is not vacuous, because that family is not empty: `git --no-pager diff --name-only` over the same pathspec names `rltaxrental.js`, carrying a live thirteen-line diff from the concurrent session — a deliberate one-line probe substituting `"mid-month-probe"` for `"mid-month"` inside `conventionFraction` — and that diff carries none of the seven Feature 027 tokens. This is precisely the situation the authorship formulation exists for: the family is dirty, it is dirty by someone else's hand, and this feature authored no line standing in it. **Closing re-verification.** Re-run at the end of this pass, the same pathspec now prints nothing at all: the concurrent session reverted its probe while this pass was running, so the family is currently clean and the conjunct now holds over an empty diff. Both states are recorded rather than only the convenient one; the conjunct was true in both, and it was demonstrably non-vacuous when it was first executed. **Claim Source:** executed.
      **Planning correction (supersedes the prior wording, and supersedes the two records printed below it).** The previous wording ran a bare whole-tree `git status --porcelain` and required it to name nothing outside this scope's Allowed families. That predicate is unsatisfiable in this repository by construction rather than by any fault of this scope. Several other sessions concurrently write `specs/_bugs/BUG-009-*`, `briefs/`, `market-brief.owner-reads.json`, `notes/README.md`, two `scripts/` files and assorted untracked scratch paths, and this feature can neither control nor clean any of them. A boundary check whose truth value is owned by unrelated work measures nothing about this feature, so it is restated over the surfaces this feature actually declares. The lifetime-tax family is checked by authorship rather than by cleanliness for the same reason: a concurrent session is actively modifying `rltaxrules.js`, so requiring that family to print nothing would re-create the very hostage this correction removes, while requiring it to carry no Feature 027 token is a claim only this feature can falsify. The item is not weakened. Conjunct (a) fails the instant this feature dirties `tools.json`, `rlnav.js`, `specs/025-*`, `specs/026-*` or any of the three disqualified owner routes, and conjunct (b) fails the instant a Feature 027 token appears anywhere in the lifetime-tax family. The Uncertainty Declaration and routing record printed below were written against the superseded whole-tree wording and are retained as history only. Verification has since been recorded and this item is ticked on that executed evidence.
      **Superseded record (whole-tree wording).** **Uncertainty Declaration.** Every path this scope changed is inside its Allowed file families — `rlticker.js`, `options-structure-lab.html`, `gamma-trading-lab.html`, `scripts/selftest.mjs`, `notes/options-structure-lab.md`, `notes/gamma-trading-lab.md`, `tests/options-structure-lab.spec.mjs`, `tests/gamma-trading-lab.spec.mjs` — and each is inside `workBoundary.allowedPaths`. The bare command nevertheless also names paths this scope never touched, which were already dirty when the session began: `briefs/history-current.json`, `briefs/history/recommendations/2026-08.jsonl`, `market-brief.owner-reads.json`, `notes/README.md`, `scripts/brief-narrative-parallel.mjs`, `scripts/build-attention-items.mjs`, `specs/_bugs/BUG-009-…/scopes.md`, plus assorted untracked scratch files. Their modification times run from `2026-08-19T11:13:41` to `2026-08-20T00:18:17`, all earlier than this feature's own `createdAt` of `2026-08-20T06:04:32Z`, and none of them contains `linkedSubject`, `SUBJECT_PARAM`, `SUBJECT_PATTERN` or `027-company-scoped`. They are unrelated in-flight work from another effort. Because the literal predicate as written is false, this item stays unticked rather than being reinterpreted. **Executed:** YES. **Exit Code:** 0. **Closeout re-verification.** Re-run at closeout: `git status --porcelain` still names unrelated in-flight paths this scope never opened — `briefs/history-current.json`, `briefs/history/recommendations/2026-08.jsonl`, `market-brief.owner-reads.json`, `notes/README.md`, `scripts/brief-narrative-parallel.mjs`, `scripts/build-attention-items.mjs` and five `specs/_bugs/BUG-009-…` files — so the predicate is still false for the same reason and the item stays unticked. **Claim Source:** executed.
      **Re-examination and routing (this session).** **Executed:** YES. **Command:** `git status --porcelain`. **Exit Code:** 0. Re-read in this session, the whole-tree porcelain names `briefs/history-current.json`, `briefs/history/recommendations/2026-08.jsonl`, `market-brief.owner-reads.json`, `notes/README.md`, `scripts/brief-narrative-parallel.mjs`, `scripts/build-attention-items.mjs`, five `specs/_bugs/BUG-009-…` files and thirteen untracked scratch paths, none of which this scope opened. What changed since the earlier record is that this scope's OWN production edits have landed as `0f63acb50`, so the only paths this feature still carries in the porcelain are `scripts/selftest.mjs`, `tests/options-flow-feed-lab.spec.mjs` and `specs/027-company-scoped-owner-deep-links/scopes.md` — all three inside `workBoundary.allowedPaths`. The scope-owned half is therefore clean and the item is still false only because its predicate is whole-tree. A whole-tree-clean predicate cannot be satisfied by any scope in a repository several sessions write to concurrently, so this is **routed to `bubbles.plan`** to be rewritten as a scope-scoped predicate rather than ticked. **Claim Source:** executed.
- [x] `bash .github/bubbles/scripts/artifact-lint.sh specs/027-company-scoped-owner-deep-links` exits 0.
      **Executed:** YES. **Command:** as written. **Exit Code:** 0 (`ARTIFACT_LINT_EXIT=0`), `Artifact lint PASSED.` **Claim Source:** executed.

**Tier 2 — Scope specific.**

- [x] `rlticker.js` exports `SUBJECT_PARAM` with the value `ticker` and `SUBJECT_PATTERN` with the source `^[A-Z0-9.\-]{1,12}$` on the `RLTKR` object, and that pair is the SINGLE shared definition of the linked-subject convention that both receiving routes use: an assertion loads the real UMD module and reads both values off the real export object, and a tree scan proves there is no second copy of the parameter name and no second copy of the pattern anywhere outside `rlticker.js` — `options-structure-lab.html` and `gamma-trading-lab.html` reach the convention only through `RLTKR.linkedSubject` and name neither the parameter nor the pattern themselves.
      **Planning correction (supersedes the prior wording).** The previous wording additionally required `RLTKR` to be a frozen object. That is false of this repository and was false before this feature: `rlticker.js` applies its `freeze` helper only to the object `tickerContext` returns (line 127), never to `root.RLTKR`. Freezing a shared export is a change to a pre-existing module's contract that this feature did not introduce and must not make for a checkbox, so the freezing clause is removed rather than the module being bent to match it. The invariant that actually matters — and that this item now states — is single-definition: one parameter name, one pattern, one place. It fails the moment a second copy of either appears, which is exactly how a competing convention would drift into existence. Verification has since been recorded and this item is ticked on that executed evidence.
      **Executed:** YES. **Command:** `node scripts/selftest.mjs`. **Exit Code:** 0, `Research-Lab self-test: 3156 passed, 0 failed`, capture sha256 `a62ae0a99f8ad136b508d03a8189ebac405dbc0a01cd426cb049437978fa6822`. Both halves are now carried by one appended assertion, which reports green as `Feature 027: SUBJECT_PARAM "ticker" and SUBJECT_PATTERN /^[A-Z0-9.\-]{1,12}$/ are read off the real RLTKR export and are the single shared definition of the convention (declared only in: rlticker.js / rlticker.js; pattern text only in: rlticker.js; production files outside it that read the parameter themselves: none; both precedent routes reach it only through RLTKR.linkedSubject and name neither; registry declares the one name ["ticker"])`. **Module load.** The values are read off the object the UMD file itself installs — `Function('var window, document, globalThis = {}; ' + read('rlticker.js') + '\nreturn globalThis.RLTKR;')()` — and asserted as `SUBJECT_PARAM === 'ticker'`, `SUBJECT_PATTERN instanceof RegExp` and `SUBJECT_PATTERN.source === '^[A-Z0-9.\-]{1,12}$'`, so the claim is made against the real export rather than against a re-declared copy. **Tree scan.** Over every root-level `.html`/`.js` production file: each of the two names has exactly one declaration site and it is `rlticker.js`; the pattern text `[A-Z0-9.\-]{1,12}` occurs in exactly one file and it is `rlticker.js`; zero production files outside it read the parameter themselves, where reading it means `.get('ticker')` or a `?ticker=`/`&ticker=` literal; and both precedent routes contain `RLTKR.linkedSubject` while containing no declaration of either name, no copy of the pattern text and no parameter read of their own. Confirmed independently in the shell: `grep -nE '\b(var|const|let)\s+SUBJECT_(PARAM|PATTERN)\b' *.html *.js` returns only `rlticker.js:53` and `rlticker.js:54`, and the parameter-read scan returns no match anywhere. **One honest carve-out, asserted rather than excused.** `company-intelligence.config.json` also carries the parameter NAME, on its four subject-carrying registry rows. That is a consumer of this definition, not a second one, so the assertion requires the registry's distinct declared values to be exactly `["ticker"]` and to equal the module's own `SUBJECT_PARAM` — a divergent second convention there turns this assertion red rather than slipping past it. `rlcompanyintel.js` matches a text search for `SUBJECT_PARAM` only through the unrelated identifier `SAFE_SUBJECT_PARAM`, a validator for the registry-declared name, which the word-boundary-anchored declaration scan correctly does not count. **Claim Source:** executed.
- [x] `linkedSubject` returns `raw: null` in every one of the three status branches, proven by an assertion over the whole corpus.
      **Executed:** YES. **Command:** `node scripts/selftest.mjs`. **Exit Code:** 1 (this assertion green). Three assertions cover the three branches over the full corpus: the absent branch (`…all yield status absent with subject null`, which asserts `raw === null` on all five reads), the refused branch (`…yields status refused with subject null and raw null`, plus `f027CorpusReads.every(read => read.raw === null)` across every corpus value), and the accepted branch (the oddity assertion asserts `raw === null` on each accepted value). **Claim Source:** executed.
- [x] `linkedSubject` reuses `normTicker` rather than re-implementing trim and uppercase, proven by an assertion that the normalisation of a mixed-case padded value equals `normTicker` applied to the same value.
      **Executed:** YES. **Command:** `node scripts/selftest.mjs`. **Exit Code:** 1 (this assertion green). `✓ Feature 027: linkedSubject reads no window, document or storage API and normalises through the existing normTicker` asserts `linkedSubject('?ticker=' + encodeURIComponent('  brk.b  ')).subject === normTicker('  brk.b  ')` on the mixed-case padded value, and separately asserts the function body contains `normTicker(`. **Claim Source:** executed.
- [x] `linkedSubject` reads no `window`, no `document` and no storage API, proven by a source-token assertion over the function body.
      **Executed:** YES. **Command:** `node scripts/selftest.mjs`. **Exit Code:** 1 (this assertion green). The same assertion applies `!/\bwindow\b|\bdocument\b|localStorage|sessionStorage|location\./` to the body lifted out of `rlticker.js` by `extractFn`, so it reads the shipped source rather than a copy. **Claim Source:** executed.
- [x] The corpus equivalence assertion compares the removed private rule against the shared rule over every corpus value and asserts set equality of the accepted values.
      **Executed:** YES. **Command:** `node scripts/selftest.mjs`. **Exit Code:** 1 (this assertion green). `✓ Feature 027: the shared rule and the removed private rule agree on the full corpus, so the precedent accept-set is unchanged (19 accepted of 34)` compares `JSON.stringify` of both accepted sequences over 34 inputs — the full corpus plus the sender corpus plus six normalisation cases — and asserts the input count is at least 30. **Claim Source:** executed.
- [x] The containment property asserts that for every sender-valid value, `linkedSubject` returns `accepted`, and the corpus includes both length boundaries and the leading-digit case.
      **Executed:** YES. **Command:** `node scripts/selftest.mjs`. **Exit Code:** 1 (this assertion green). `✓ Feature 027: every sender-valid value is accepted by the shared receiver rule after normalisation (10/10 contained)`. Both length boundaries are asserted explicitly — `'S'` at one character and `'ABCDEFGHIJKL'` at twelve — and the leading-digit case is asserted as `'3M'` accepted with `subject === '3M'`. **Claim Source:** executed.
- [x] Each of the four adversarial rows 1.7 through 1.10 is proven able to fail by a recorded mutation, following the spec 025 precedent — mutate, observe RED, restore, observe GREEN, verify the mutated file's sha256 returns to its pre-mutation value. Because these four guards are exercised as in-memory mutants inside one `node scripts/selftest.mjs` run, the proof is recorded at the aggregate level: with the four mutations applied that command reports exactly four failing assertions and names all four, and after every mutation is restored the same command reports zero failing assertions while `shasum -a 256 scripts/selftest.mjs` equals the pre-mutation digest. [report.md](report.md) names, per guard, the mutation applied and the assertion it turned red.
      **Planning correction (supersedes the prior wording).** The previous wording demanded one separate failing suite run and one separate passing suite run per guard. No such per-guard run exists or can exist for this mechanism: the four guards are in-memory mutants constructed and discarded inside a single run, so a mutation never survives long enough to produce its own non-zero suite exit. The item is rewritten to the evidence the mechanism actually yields, and it is not weakened — it still fails if any one of the four guards has gone inert, because an inert guard does not turn red under its mutation and the aggregate failure count then falls below four. It also fails if a mutation is left on disk, because the post-restore digest would not match. Verification has since been recorded and this item is ticked on that executed evidence.
      **Executed:** YES. **Command:** `shasum -a 256 scripts/selftest.mjs`, then `node scripts/selftest.mjs` with the four mutations applied, then the same command after restore, then `shasum -a 256 scripts/selftest.mjs` again. **Exit Codes:** 1 mutated, 0 restored. **Digests.** Pre-mutation `2cc70cf4b78b332f862e4c280ec46f24dcdbc681329458683db23898b2f119f6`; under the four mutations `573974ae8180bd1fb250d88b8eb4c37b2d231bc4249dc115349c05fa3c89dca0`; after restore `2cc70cf4b78b332f862e4c280ec46f24dcdbc681329458683db23898b2f119f6`, identical to the pre-mutation value, with `grep -c 'no-such-route.html' scripts/selftest.mjs` returning `0` so no mutation token survives on disk. **RED.** `node scripts/selftest.mjs` **Exit Code:** 1, `Research-Lab self-test: 3152 passed, 4 failed`, capture sha256 `5242b3ad4eece15ebfbfb558e6e3df0dbaf5b51c3d199f00acd92f71fc1895ef`. The run emits exactly four `✗ FAIL` lines and they name all four guards: the permissive-pattern guard `(0 corpus value(s) would slip through)`, the raw-leak guard `(0 refused value(s) would escape through raw)`, the containment-falsifiability guard `refuses sender-valid []`, and the single-definition guard `restoring either private tickerFromQuery fails the single-definition assertion`. Every other assertion in the suite stayed green, so the four failures are attributable one-to-one to the four mutations. **GREEN.** After restore, **Exit Code:** 0, `Research-Lab self-test: 3156 passed, 0 failed`, capture sha256 `a62ae0a99f8ad136b508d03a8189ebac405dbc0a01cd426cb049437978fa6822`. [report.md](report.md) names, per guard, the mutation applied and the assertion it turned red. **Claim Source:** executed.
- [x] `grep -c 'tickerFromQuery' options-structure-lab.html gamma-trading-lab.html` returns 0 for both files.
      **Executed:** YES. **Command:** as written. **Exit Code:** 1 (grep's no-match code). Output: `options-structure-lab.html:0` and `gamma-trading-lab.html:0`. **Claim Source:** executed.
- [x] Both precedent routes contain exactly one `#linkNotice` element, written with `textContent` and carrying `role="status"`, and it is `hidden` with empty text when no parameter is supplied.
      **Executed:** YES. **Command:** `grep -c 'id="linkNotice"'`, `grep -n 'id="linkNotice"'` and `grep -n "notice.textContent\|notice.innerHTML"`. **Exit Code:** 0. Exactly one per route (`options-structure-lab.html:1`, `gamma-trading-lab.html:1`), each declared `<p id="linkNotice" role="status" hidden`. Every write in the notice path is `notice.textContent`; there is no `innerHTML` write anywhere in it. The hidden-and-empty state with no parameter was observed in a real browser on both routes and on both origins: `noticeHidden=true notice=""`. **Claim Source:** executed.
- [x] Opening either precedent route with no query string produces a first paint identical to the pre-scope baseline, proven by rows 1.14 and 1.18.
      **Executed:** YES. **Command:** the two per-file Playwright commands. **Exit Codes:** 0 and 0. `Regression: SCN-027-006 no parameter, an empty parameter and a whitespace parameter render identical first paints` passes on both routes. The compared paint is the resolved ticker, provider, `nExp`, `sign`, the notice's presence, hidden state, role and text, and the full ordered id list of the control rail, so it is a structural identity rather than a sampled field. Corpus equivalence independently proves the accept-set is unchanged, and a direct browser open with no parameter yields the pre-existing default subject with zero page errors on both routes. **Claim Source:** executed.
- [x] `rlcompanyintel.js` is byte-unchanged by this scope, proven by `git status --porcelain rlcompanyintel.js` printing nothing.
      **Executed:** YES. **Command:** as written. **Exit Code:** 0. Output: nothing. **Claim Source:** executed.
- [x] Both Scope 1 routes carry the machine-checkable `file://` compatibility properties, all four required. (a) `grep -cE '^(import|export)[[:space:]]' rlticker.js options-structure-lab.html gamma-trading-lab.html` returns 0 for all three, so no top-level ES module syntax exists in the shared module or either route. (b) `grep -n 'type="module"' rlticker.js options-structure-lab.html gamma-trading-lab.html` returns no match, so every script both routes load is a classic script. (c) Both routes reach the shared rule through a plain `<script src="rlticker.js" defer></script>` tag rather than through an import. (d) `package.json` declares no `scripts` block, so no bundler and no build step stands between the source files and a browser. The human half, actually opening each route from a disk with no server, is covered by the human-owned [uservalidation.md](uservalidation.md) checklist item "Every one of these tools opens from a plain file open, with no key, no account and no server." under `### It still works with nothing`, and by that section's `Partly` row in the Automation Readiness table, which is marked `Partly` for exactly this reason.
      **Verification (this session, `bubbles.implement`). All four conjuncts hold, so the item is ticked.** **Executed:** YES. **Phase:** implement. **(a) Command:** `grep -cE '^(import|export)[[:space:]]' rlticker.js options-structure-lab.html gamma-trading-lab.html`. **Exit Code:** 1 (grep's no-match code). Output: `rlticker.js:0`, `options-structure-lab.html:0`, `gamma-trading-lab.html:0` — zero top-level ES module statements in the shared module and in both routes. **(b) Command:** `grep -n 'type="module"' rlticker.js options-structure-lab.html gamma-trading-lab.html`. **Exit Code:** 1, no output, so every script both routes load is a classic script. **(c) Command:** `grep -n 'script src="rlticker.js"' options-structure-lab.html gamma-trading-lab.html`. **Exit Code:** 0. Output: `options-structure-lab.html:2798:  <script src="rlticker.js" defer></script>` and `gamma-trading-lab.html:1840:    <script src="rlticker.js" defer></script>` — both routes reach the shared rule through a plain classic tag, not an import. **(d) Command:** `node -e 'const p=require("./package.json");console.log("hasScripts="+Object.prototype.hasOwnProperty.call(p,"scripts"));'`. **Exit Code:** 0. Output: `hasScripts=false`; the whole manifest is `name`, `version`, `private`, `engines` and a single `devDependencies` entry (`playwright`), so no bundler and no build step stands between the source files and a browser. **Falsifiability proved by mutation, not argued.** Conjuncts (b) and (c) were shown to discriminate on a real receiving route: `options-flow-feed-lab.html` was clean at sha256 `88568b5744937f93c133aa52659a633335f043d8b65b5242bd7327c0d79471cc`; rewriting its `<script src="rlticker.js" defer>` tag to `type="module"` made `grep -n 'type="module"'` return exit 0 with a match, falsifying the module conjunct, and made `RLTKR` fail to resolve from a `file://` origin. The tag was restored, the digest re-read as the identical `88568b5744937f93c133aa52659a633335f043d8b65b5242bd7327c0d79471cc` (`RESTORE_VERIFIED=yes`), `git status --porcelain options-flow-feed-lab.html` printed nothing, and the module grep returned to exit 1. No mutation was left on disk. **The human half is not claimed here.** Actually opening each route from a disk with no server is a human act; it lives in the human-owned [uservalidation.md](uservalidation.md) checklist item "Every one of these tools opens from a plain file open, with no key, no account and no server." and is deliberately left unticked there by this agent. **Claim Source:** executed.
      **Planning correction (supersedes the prior wording, and supersedes the two records printed below it).** The previous wording required "a recorded manual open". A human-performed open is not an act any agent in the delivery chain can carry out, so that clause could never be discharged by the agent that owns this checkbox no matter how the routes behaved. The clause is moved rather than dropped: this DoD item now carries exactly the half a machine can decide, and it names where the human half already lives so that coverage is not silently lost. The item is not weakened. It fails the moment either route or the shared module gains a top-level `import` or `export`, a `type="module"` script, or a build step, which is precisely how `file://` operation would be lost. Verification has since been recorded and this item is ticked on that executed evidence.
      **Superseded record (manual-open wording).** **Uncertainty Declaration.** The substance is proven and the stated method is not, so this item stays unticked. **Executed:** YES. **Command:** a real Chrome open of each route at a `file://` origin, three query cases each. **Exit Code:** 0 (`FILE_URL_EXIT=0`). Both routes load from `file://`, `RLTKR.linkedSubject` resolves, no parameter yields `ticker=SPY noticeHidden=true notice=""`, `?ticker=NVDA` yields `ticker=NVDA`, a refused value yields the default subject with the notice shown, and every case reports `pageerrors=0`. `grep -cE '^(import|export)[[:space:]]'` returns `0` for `rlticker.js`, `options-structure-lab.html` and `gamma-trading-lab.html`, so there is no top-level ES module syntax and no bundler. The open was driven headlessly rather than performed by a human, and this item says *manual*, so the human open remains outstanding and belongs with the human-acceptance items in [uservalidation.md](uservalidation.md). **Claim Source:** executed.
      **Re-examination and routing (this session).** The structural half was re-checked here: `grep -cE '^(import|export)[[:space:]]' rlticker.js options-structure-lab.html gamma-trading-lab.html` returns `0` for all three, so there is no top-level ES module syntax and no bundler. **Exit Code:** 0. **Claim Source:** executed. The remaining half is the word *manual*: a human-performed open is not an act `bubbles.implement` can perform, and the earlier headless open recorded above was executed by a prior pass rather than by this one, so this session restates neither as its own proof. The item is left unticked and **routed to `bubbles.plan`**, which owns the decision whether the human open belongs here or only in the human-owned [uservalidation.md](uservalidation.md) checklist that already carries it.
- [x] `notes/options-structure-lab.md` and `notes/gamma-trading-lab.md` each state the accepted parameter, the refusal behavior and that the accepted set is unchanged.
      **Executed:** YES. **Command:** `git diff --numstat notes/options-structure-lab.md notes/gamma-trading-lab.md`. **Exit Code:** 0. Output: `23 0` for each — a pure append with zero deleted lines. Each file gains a `## Linked subject (?ticker=)` section naming the accepted parameter `?ticker=`, the accept rule `/^[A-Z0-9.\-]{1,12}$/` after `normTicker`, the statement that the accept-set is the same one the route applied before the rule moved into `rlticker.js`, the refusal behavior (discarded, never stored, never echoed, never reaches a fetch target, notice names the subject actually shown), and the equivalence of no parameter, an empty parameter and a whitespace-only parameter. **Claim Source:** executed.

**Scenario fidelity (Gate G068).** The three items below restate what this scope's Gherkin scenarios assert, taken from [spec.md](spec.md) rather than from what was delivered. They shipped UNCHECKED and were ticked by the `bubbles.implement` pass that recorded executed evidence against each one; all three below now carry that evidence.

- [x] SCN-027-006 — On a receiving owner route, opening it with a subject parameter that is empty and opening it with a subject parameter that is only whitespace each behave exactly as if no subject parameter had been supplied. Both precedent routes must show this, and "exactly" means the compared first paint is a structural identity rather than a sampled field. **Proof:** `node scripts/selftest.mjs` reports the assertion `Feature 027: a missing, empty and whitespace-only subject all yield status absent with subject null` green, and Test Plan rows 1.14 and 1.18 — `Regression: SCN-027-006 no parameter, an empty parameter and a whitespace parameter render identical first paints` — pass under `npx --no-install playwright test tests/options-structure-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` and under the matching `tests/gamma-trading-lab.spec.mjs` command.
      **Executed:** YES. **Commands:** (1) `node scripts/selftest.mjs`. **Exit Code:** 0 — `Research-Lab self-test: 3183 passed, 0 failed`, line 3536 of the run carries `✓ Feature 027: a missing, empty and whitespace-only subject all yield status absent with subject null`. (2) `npx --no-install playwright test tests/options-structure-lab.spec.mjs tests/gamma-trading-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --workers=1 --reporter=list` — the two per-file commands the Proof names, run in one invocation with the workers pin this session requires. **Exit Code:** 0 — `19 passed (13.1s)`, with `✓ 13 … tests/options-structure-lab.spec.mjs:114:1 › Regression: SCN-027-006 no parameter, an empty parameter and a whitespace parameter render identical first paints (645ms)` and `✓ 4 … tests/gamma-trading-lab.spec.mjs:112:1 › … (547ms)`. The "structural identity rather than a sampled field" clause was verified by reading the assertion body at `tests/options-structure-lab.spec.mjs:114-127`: after three loads it asserts `expect(empty).toEqual(bare)` and `expect(blank).toEqual(bare)` over the WHOLE captured paint object, not a field-by-field sample — the emitted capture carries `ticker, provider, nExp, sign, noticePresent, noticeHidden, noticeRole, noticeText, railIds`. **Claim Source:** executed.
- [x] SCN-027-009 — When an owner route is opened with a subject value that is not an acceptable company identifier, all three consequences hold together: the route discards the value, it continues with the subject it would have shown had no parameter been supplied, and it remains fully usable. The third clause is a separate obligation from the first two — a run that only observes first paint does not discharge it, so the named test must exercise at least one control after the refusal and assert that it still responds. **Proof:** Test Plan rows 1.11 and 1.15, `Regression: SCN-027-009 a refused subject leaves the default subject active and every control usable`, under the two per-file Playwright commands named in the Test Plan.
      **Executed:** YES. **Command:** `npx --no-install playwright test tests/options-structure-lab.spec.mjs tests/gamma-trading-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --workers=1 --reporter=list`. **Exit Code:** 0 — `19 passed (13.1s)`, with `✓ 10 … tests/options-structure-lab.spec.mjs:72:1 › Regression: SCN-027-009 a refused subject leaves the default subject active and every control usable (455ms)` and `✓ 1 … tests/gamma-trading-lab.spec.mjs:70:1 › … (715ms)`. The third clause was verified as a POST-REFUSAL interaction, not inferred from a green line: both bodies were read. Each opens the route with `?ticker=javascript%3Aalert(1)`, asserts `#ticker` holds the pre-feature default, then walks every control on that route asserting `toBeVisible()` and `toBeEnabled()` — `#ticker, #provider, #nExp, #sign, #zoom, #minOI` on options-structure and `#ticker, #prov, #forceRefresh, #go` on gamma-trading — and then ACTS on one of them, `page.fill('#ticker', 'NVDA')` followed by `expect(page.locator('#ticker')).toHaveValue('NVDA')`. That last pair is an exercise after the refusal with an assertion that the control still responds, which is what this item demands beyond first paint. **Claim Source:** executed.
- [x] SCN-027-017 — Across every route that carries a company subject, the parameter names compare equal and the accepted sets of company identifier values compare equal. **Scope-span note, flagged rather than absorbed:** the scenario says *every* subject-carrying route, and this scope lands only two of the four, so this item cannot be discharged from Scope 1 evidence alone. **Proof:** Test Plan row 1.1, `Feature 027: exactly one definition of the linked-subject rule exists in the tree and every subject-carrying route consumes it`, together with row 1.6, `Feature 027: the shared rule and the removed private rule agree on the full corpus, so the precedent accept-set is unchanged`, both under `node scripts/selftest.mjs`; and, for the two Scope 2 routes, Test Plan row 3.7, `every declared ownerSubjectParam is the single shared parameter name and no second convention exists`, under `node --test tests/company-intelligence.unit.mjs`.
      **Executed:** YES, and the two-of-four span the note flags is closed by a third command rather than argued away. **Commands:** (1) `node scripts/selftest.mjs`. **Exit Code:** 0 — `3183 passed, 0 failed`, carrying `✓ Feature 027: exactly one definition of the linked-subject rule exists in the tree and every subject-carrying route consumes it (pattern at: rlticker.js; private copies: none; consumers: 2/2)` and `✓ Feature 027: the shared rule and the removed private rule agree on the full corpus, so the precedent accept-set is unchanged (19 accepted of 34)`. Row 1.1's first two conjuncts are TREE-WIDE, not two-route: the assertion body at `scripts/selftest.mjs:25617-25635` builds `f027ProductionFiles` from every root-level `.html`/`.js` file and requires the accept-set token `[A-Z0-9.\-]{1,12}` to occur in `rlticker.js` and nowhere else, and requires zero surviving private `tickerFromQuery` definitions anywhere. Only its third conjunct, the consumer count, is scoped to the two precedent routes. (2) `node --test tests/company-intelligence.unit.mjs`. **Exit Code:** 0 — `tests 90, pass 90, fail 0, skipped 0`, with `✔ every declared ownerSubjectParam is the single shared parameter name and no second convention exists`, which is the parameter-name half across all four declaring rows. (3) The accepted-set half over the OTHER two routes, which neither of the above observes: `grep -l 'RLTKR.linkedSubject' options-structure-lab.html gamma-trading-lab.html options-flow-feed-lab.html volatility-sizing-lab.html`. **Exit Code:** 0. Output: all four filenames, `count=4`. The four route files were not chosen by hand — they are exactly the rows a `node -e` read of `company-intelligence.config.json` reports as declaring a non-empty `ownerSubjectParam` (`registryLen 15`, `declaringRows 4`: options-structure, dealer-gamma, options-flow, volatility). With one definition in the tree, zero private copies anywhere, and all four declaring routes reading through that one definition, the accepted sets compare equal by construction rather than by sampling. **Claim Source:** executed.

---

## Scope 2: The two catalog-bound receiving routes

**Scope-Kind:** runtime-behavior

**Status:** Done (29 of 29 DoD items ticked)

| Field | Value |
| --- | --- |
| Status | Done — implemented and verified; 29 of 29 DoD items ticked with executed evidence |
| Priority | P1 |
| Depends On | Scope 1 (foundation). Both routes consume `RLTKR.linkedSubject` and define no acceptance rule of their own. |
| Owns scenarios | SCN-027-001, SCN-027-002, SCN-027-003, SCN-027-004, SCN-027-005, SCN-027-008, SCN-027-012, SCN-027-013 |

This scope makes the two routes that hold a company as a variable open on the
company named in the link. Grammar acceptance is necessary but not sufficient on
both: a subject becomes active only after it matches an entry in that route's own
committed catalog, so an accepted string never becomes a fetch path, a
`localStorage` key or any other constructed identifier.

### Use Cases (Gherkin)

```gherkin
Scenario: SCN-027-001 A company-scoped owner opens on the company that was being read
  Given the researcher is reading a company on the company intelligence route
  And the dimension's owner route can resolve a company subject
  When the researcher follows that dimension's owner link
  Then the owner route opens with that company as its active subject
  And the owner route names the active subject on screen
```

```gherkin
Scenario: SCN-027-003 A scanner focuses the named company without hiding the scan
  Given the owner route presents many companies at once
  When the researcher arrives through an owner link naming one of them
  Then that company's own read is the one the route presents first
  And the researcher can still see the rest of the scan
```

```gherkin
Scenario: SCN-027-012 A valid company with no data is named as unavailable
  Given an owner route is opened with an acceptable company it holds no data for
  When the route finishes its first paint
  Then it names that company and states that it has no data for it
  And it does not render a blank view
  And it does not render another company's values under that company's name
```

SCN-027-002, SCN-027-004, SCN-027-005, SCN-027-008 and SCN-027-013 are carried in
[scenario-manifest.json](scenario-manifest.json).

### Implementation Plan

**`volatility-sizing-lab.html`.** One insertion point, inside `boot()`, between
`populateAssets()` and `readControls()`. `populateAssets()` keeps forcing
`runtime.config.assets[0].symbol` as the default; the handoff overrides that one
assignment and nothing else. An accepted subject is matched against
`runtime.config.assets[].symbol`, the eleven entries already schema-validated by
`RLVOL.validateUniverse`. A match selects the asset and adopts its
`defaultTargetVol`; a miss renders a named-unavailable notice while the default
asset stays selected and fully computed. `readControls`, `setMode`, `recompute`,
`hydrate`, `renderSimple`, `renderPower` and the owner-read publication all run
exactly as they do when the reader picks the asset from the `<select>` by hand.
No renderer learns about deep links. The active subject is already stated in
words by the existing option text `"<symbol> — <name>"`, so FR-027-009 needs no
new markup. This route restores no saved asset, so SCN-027-002 is vacuously
satisfied here and must not be faked with a new store.

**`options-flow-feed-lab.html`.** One insertion point, inside `boot()`, after
`loadState()` and before the cache-first `rebuild(); render()`. The resolved
focus is stored on `state` but **not** persisted: `saveState()` continues to
write only `mode`, `side`, `min` and `dte`, so a deep link outranks the restored
state for this visit and never becomes the restored state. `render()` gains one
call, `renderFocus()`, before the existing feed render. The band renders four
distinct outcomes, and the fourth is the one that must not be collapsed:

| Focus state | Band content |
| --- | --- |
| Absent | Band `hidden`; the page is byte-equivalent to today |
| Accepted and in `UNIVERSE` | The ticker named in words, its flagged-strike count, its call-versus-put premium split from the same aggregate `renderByTicker` already builds, and the standing caveat that this is an end-of-day proxy over twelve liquid names |
| Accepted and not in `UNIVERSE` | The ticker named in words plus a statement that this scanner covers twelve liquid names and does not include it; the scan renders unchanged below |
| Accepted, in `UNIVERSE`, no flagged strikes | The ticker named in words plus a statement that no strike crossed the activity bar for it in this scan — a different fact from not-covered, and collapsing the two would be the silent inaccuracy this product exists to avoid |
| Refused | A statement that the link named a subject this tool could not accept; the scan renders unchanged below |

The feed, `renderTable`, `renderByTicker`, all four segmented controls, the sort
state and the hydration progress line are untouched. The band is never a filter
and never a pre-sort: a filter destroys the scan, and a pre-sort silently
overrides `state.sortK` and `state.sortDir`, which are persisted reader controls.

**Failure interaction.** When a route's own config or universe fails to load, the
existing failure path wins — `showConfigError` on volatility, the empty-state
verdict on options-flow — and the handoff notice is suppressed rather than
stacked, so the reader sees one problem rather than two.

**`tests/options-flow-feed-lab.spec.mjs`.** Created by this scope. It does not
exist today, `design.md` names it at four sites, and that mismatch is why
`node scripts/selftest.mjs` currently reports a `newMissing` failure. Creating it
is a required deliverable of this plan; rewording the design is not an option.
Because this route has no owning feature, the spec opens with the FR-027-015
baseline captured **before** the change: first-paint verdict text, feed row count
and order, table row order under the default sort, by-ticker order, the status
line, and the persisted-state round trip.

**`tests/volatility-sizing-lab.spec.mjs`.** Extended, never reduced. Its
nineteen existing tests, including the fourteen `Regression BS-*` cases, the
cache-first partial-paint test, the no-market-data-request test and the owner-read
publication test, are re-run in full with no query string and recorded as this
feature's FR-027-014 evidence.

**Notes.** `notes/volatility-sizing-lab.md` and `notes/options-flow-feed-lab.md`
record the accepted parameter, what resolution means on that route, and what the
unavailable and refused states say.

### Consumer Impact Sweep

This scope renames nothing, removes nothing and moves nothing. Both route file
names, both `tools.json` entries and both `notes` paths are unchanged, so no
navigation entry, breadcrumb, redirect or deep link can go stale. The one
consumer surface that binds this scope is the deep link composed by
`rlcompanyintel.js::ownerRouteFor`: after Scope 3 declares these two rows, every
composed `<route>.html?ticker=<company>` must resolve to a route that reads the
parameter, which is exactly what this scope supplies. The stale-reference scan
also binds here: `tests/options-flow-feed-lab.spec.mjs` is named by `design.md`
and by this plan, so it must resolve on disk when the scope closes. No API
client and no generated client exists in this repository.

### Shared Infrastructure Impact Sweep

This scope consumes the shared `rlticker.js` contract Scope 1 created and appends
to the Feature 027 selftest group Scope 1 created. It modifies no other shared
surface, adds no storage key and changes no ordering contract on either route:
`saveState()` on `options-flow-feed-lab.html` keeps its existing four-key
payload, and `volatility-sizing-lab.html` reads no saved subject at all. The
blast radius is therefore bounded to the two routes plus the appended selftest
assertions, and the rollback path is the same pure-append revert recorded in the
feature-level [Shared Infrastructure Impact Sweep](#shared-infrastructure-impact-sweep).

### Change Boundary

Governed by the feature-level [Change Boundary](#change-boundary). The Allowed
file families this scope may touch are the two catalog-bound receiving routes,
`tests/volatility-sizing-lab.spec.mjs`, `tests/options-flow-feed-lab.spec.mjs`,
the appended Feature 027 selftest group, the two matching tool notes, and this
feature's planning artifacts. Every Excluded surface stays byte-unchanged — in
particular `company-fundamentals-lab.html`, `technical-analysis-decision-lab.html`
and `trend-dynamics-cycle-lab.html`, which this feature never opens.

### Test Plan

| # | Scenario | Type | Command | File and expected test title |
| --- | --- | --- | --- | --- |
| 2.1 | SCN-027-005, SCN-027-008 | Regression E2E | `npx --no-install playwright test tests/volatility-sizing-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | `tests/volatility-sizing-lab.spec.mjs` — the nineteen pre-existing tests, including the fourteen `Regression BS-*` cases, all re-run with no query string |
| 2.2 | SCN-027-005 | Regression E2E | same command as 2.1 | `tests/volatility-sizing-lab.spec.mjs` — `Regression: SCN-027-005 with no subject parameter the first-paint DOM and the computed decision are identical to the pre-feature baseline` |
| 2.3 | SCN-027-001 | Regression E2E | same command as 2.1 | `tests/volatility-sizing-lab.spec.mjs` — `Regression: SCN-027-001 ?ticker=NVDA selects NVDA in the asset select and names it on screen` |
| 2.4 | SCN-027-004 | Regression E2E | same command as 2.1 | `tests/volatility-sizing-lab.spec.mjs` — `Regression: SCN-027-004 the active subject is readable as page text and in the accessibility tree, not only inside a chart` |
| 2.5 | SCN-027-012 | Regression E2E | same command as 2.1 | `tests/volatility-sizing-lab.spec.mjs` — `Regression: SCN-027-012 an acceptable company outside the eleven-asset universe is named as unavailable and the default asset stays fully computed` |
| 2.6 | SCN-027-013 | Regression E2E | same command as 2.1 | `tests/volatility-sizing-lab.spec.mjs` — `Regression: SCN-027-013 after a refusal every control reflects one single subject and none reflects the refused value` |
| 2.7 | SCN-027-006, SCN-027-010 | Regression E2E | same command as 2.1 | `tests/volatility-sizing-lab.spec.mjs` — `Regression: SCN-027-010 no adversarial corpus value appears in the body, in any attribute or in localStorage, and empty and whitespace parameters match the no-parameter paint` |
| 2.8 | FR-027-015 baseline | Regression E2E | `npx --no-install playwright test tests/options-flow-feed-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | `tests/options-flow-feed-lab.spec.mjs` — `Regression: SCN-027-005 with no subject parameter the verdict text, feed row count and order, default-sort table order, by-ticker order, status line and persisted-state round trip match the captured pre-change baseline` |
| 2.9 | SCN-027-001 | Regression E2E | same command as 2.8 | `tests/options-flow-feed-lab.spec.mjs` — `Regression: SCN-027-001 ?ticker=NVDA renders a focus band naming NVDA with its flagged-strike count and call-versus-put premium split` |
| 2.10 | SCN-027-003 | Regression E2E | same command as 2.8 | `tests/options-flow-feed-lab.spec.mjs` — `Regression: SCN-027-003 the focus band is present and the feed, table and by-ticker row counts equal the unlinked baseline exactly` |
| 2.11 | SCN-027-002 | Regression E2E | same command as 2.8 | `tests/options-flow-feed-lab.spec.mjs` — `Regression: SCN-027-002 a link outranks saved state for this visit and the linked subject is absent from localStorage afterwards` |
| 2.12 | SCN-027-004 | Regression E2E | same command as 2.8 | `tests/options-flow-feed-lab.spec.mjs` — `Regression: SCN-027-004 the focus band names the active subject as page text rather than only in a table cell` |
| 2.13 | SCN-027-012 | Regression E2E | same command as 2.8 | `tests/options-flow-feed-lab.spec.mjs` — `Regression: SCN-027-012 a covered ticker with no flagged strike and an uncovered ticker render two distinct named statements, neither blank` |
| 2.14 | SCN-027-013 | Regression E2E | same command as 2.8 | `tests/options-flow-feed-lab.spec.mjs` — `Regression: SCN-027-013 a refused subject leaves the scan unchanged and every control reflecting one subject` |
| 2.15 | Adversarial — volatility catalog lookup removed | Unit | `node scripts/selftest.mjs` plus the recorded mutated run of 2.5 | mutation run of `tests/volatility-sizing-lab.spec.mjs` — row 2.5 must go red when the `assets[].symbol` lookup is removed |
| 2.16 | Adversarial — options-flow catalog lookup removed | Unit | `node scripts/selftest.mjs` plus the recorded mutated run of 2.13 | mutation run of `tests/options-flow-feed-lab.spec.mjs` — row 2.13 must go red when the `UNIVERSE` lookup is removed |
| 2.17 | Canary: shared selftest surface after this scope's append | Regression E2E | `node scripts/selftest.mjs` exits 0, and its previously reported `newMissing` failure is gone because `tests/options-flow-feed-lab.spec.mjs` now resolves | `scripts/selftest.mjs` — `Regression: SCN-027-CANARY every pre-existing selftest assertion stays green after the Feature 027 append` |

### Definition of Done

**Tier 1 — Universal.**

- [x] `npx --no-install playwright test tests/volatility-sizing-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` exits 0 with zero failing and zero skipped tests, and its test count is greater than or equal to the pre-scope count of nineteen.
      **Executed:** YES. **Command:** as written, with `--workers=1` added because this machine is contended and parallel workers produce teardown timeouts that are not test failures. **Exit Code:** 0. `25 passed (18.0s)`, zero failed, zero skipped; 25 ≥ 19. Capture sha256 `fd65b0ce34c25aa1672389845e38a02b284eb330d713d9bb390ff1a663f5656a`, quoted in [report.md](report.md). **Claim Source:** executed.
- [x] `npx --no-install playwright test tests/options-flow-feed-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` exits 0 with zero failing and zero skipped tests.
      **Executed:** YES. **Command:** as written, with `--workers=1` for the same reason. **Exit Code:** 0. `9 passed (6.4s)`, zero failed, zero skipped. Capture sha256 `91b9afb5ac5fa23abe4f2fb5e4989a71eee757037e2d5180dc23470184278352`. **Claim Source:** executed.
- [x] `node scripts/selftest.mjs` exits 0 with zero failing assertions, and the `newMissing` finding that names `tests/options-flow-feed-lab.spec.mjs` is gone.
      **Executed:** YES. **Command:** `node scripts/selftest.mjs`. **Exit Code:** 0. `3143 passed, 0 failed`, zero `✗ FAIL` lines. The RED run before this scope reported **Exit Code:** 1 with `3129 passed, 1 failed`, the failure being `1 new` missing spec path; creating the real spec file removed it. **Claim Source:** executed.
- [x] Every Test Plan row above ran, and each recorded exit code is a real observed exit code captured in this session.
      **Executed:** YES. Rows 2.1–2.7 ran under the volatility command (**Exit Code:** 0), rows 2.8–2.14 under the options-flow command (**Exit Code:** 0), row 2.15 as a recorded mutation (**Exit Code:** 1 mutated, 0 restored), row 2.16 likewise (**Exit Code:** 1 mutated, 0 restored), row 2.17 inside `node scripts/selftest.mjs` (**Exit Code:** 0). Every exit code recorded anywhere in this scope was observed in this session; none is copied from a prior run. **Claim Source:** executed.
- [x] Scenario-specific E2E regression tests for every new/changed/fixed behavior this scope introduces are present and pass: rows 2.2 through 2.14 each carry a persistent `Regression: SCN-027-NNN` title, and row 2.17 holds the shared-surface canary.
      **Executed:** YES. **Command:** the two per-file Playwright commands above plus `node scripts/selftest.mjs`. **Exit Code:** 0, 0, 0. Six new persistent `Regression: SCN-027-*` titles in `tests/volatility-sizing-lab.spec.mjs` and nine in the new `tests/options-flow-feed-lab.spec.mjs`, all reported green and listed in [report.md](report.md). Row 2.17 is present as `Regression: SCN-027-CANARY every pre-existing selftest assertion stays green after the Feature 027 Scope 2 append (3142 assertion(s) already green at this point)`. **Claim Source:** executed.
- [x] Broader E2E regression suite passes: both Playwright commands named above and `node scripts/selftest.mjs` each exit 0 with zero failing and zero skipped tests, with no assertion count reduced against the pre-scope run.
      **Executed:** YES. **Command:** the two per-file Playwright commands, `node scripts/selftest.mjs`, and additionally the Scope 1 precedent-route command `npx --no-install playwright test tests/options-structure-lab.spec.mjs tests/gamma-trading-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --workers=1 --reporter=line`. **Exit Code:** 0, 0, 0, 0. No count fell: volatility rose 19 → 25 tests with no pre-existing title renamed and no pre-existing assertion weakened; the selftest rose from `3129 passed` to `3143 passed`; the Scope 1 routes stayed at `10 passed`, capture sha256 `99026427264c1d7c34c82399efb62004bc4759fdf26e2ec30dbb001a83402e16`. **Claim Source:** executed.
- [x] Consumer Impact Sweep for this scope is complete and zero stale first-party references remain: every `tests/*.mjs` path named by this feature's artifacts resolves on disk, both `tools.json` `file` and `notes` paths for these two routes still resolve, and no navigation, breadcrumb, redirect or deep-link target changed.
      **Executed:** YES. **Command:** a per-path existence check over every `tests/*.mjs` reference in `specs/027-company-scoped-owner-deep-links/`, a `tools.json` resolution check, and `grep -c` against `rlnav.js`. **Exit Code:** 0. All six referenced spec paths print `OK`; both `tools.json` rows report `exists=true` and `notesExists=true`; both routes remain registered in `rlnav.js`. This scope renamed nothing, removed nothing and moved nothing, so no navigation, breadcrumb, redirect or deep-link target could go stale. **Claim Source:** executed.
- [x] Independent canary suite for shared fixture/bootstrap contracts passes before broad suite reruns: row 2.17 is run and green before either route spec is run in full.
      **Executed:** YES. **Command:** `node scripts/selftest.mjs`, run immediately after the selftest append and before the first full two-spec Playwright run. **Exit Code:** 0, `3143 passed, 0 failed`. **Claim Source:** executed.
- [x] Rollback or restore path for shared infrastructure changes is documented and verified: `git diff --numstat scripts/selftest.mjs` reports zero deleted lines, proving this scope's selftest edit is a pure append that a revert fully restores.
      **Executed:** YES. **Command:** `git --no-pager diff --numstat -- scripts/selftest.mjs`. **Exit Code:** 0. Output `80      0       scripts/selftest.mjs` — zero deletions, and the append lives inside its own `FEATURE-027-CATALOG-BOUND-BEGIN/END` markers so a revert restores the file exactly. **Claim Source:** executed.
- [x] Change Boundary is respected and zero excluded file families were changed, evaluated as a scope-scoped predicate rather than a whole-tree one. Three conjuncts, all required. (a) `git status --porcelain` restricted by pathspec to this feature's declared surfaces, namely every entry of `workBoundary.allowedPaths` together with the enumerated Excluded families `specs/025-company-multi-horizon-intelligence-lab`, `specs/026-*`, `company-fundamentals-lab.html`, `technical-analysis-decision-lab.html`, `trend-dynamics-cycle-lab.html`, `market-brief.html`, `research-agenda-lab.html`, `tools.json`, `index.html`, `rlnav.js`, `site-exclusions.json` and `scripts/build-pages-site.mjs`, names only paths inside `workBoundary.allowedPaths`. (b) `git status --porcelain company-fundamentals-lab.html technical-analysis-decision-lab.html trend-dynamics-cycle-lab.html` prints nothing, so the three routes disqualified by design D1 stay byte-unchanged. (c) `git --no-pager diff` restricted to the lifetime-tax family (`rltax*.js`, `lifetime-tax-*`, `tax-rules`, `specs/021-*`, `specs/022-*`, `specs/023-*`, `specs/024-*`) contains zero occurrences of `linkedSubject`, `SUBJECT_PARAM`, `SUBJECT_PATTERN`, `ownerSubjectParam`, `ownerBareReason`, `FEATURE-027` or `027-company-scoped`, so no line standing in that family was authored by this feature.
      **Verification (this session, `bubbles.implement`). All three conjuncts hold, so the item is ticked.** **Executed:** YES. **Phase:** implement. **Conjunct (a). Command:** `git status --porcelain --` followed by all twenty-one `workBoundary.allowedPaths` entries and the twelve enumerated Excluded families. **Exit Code:** 0. Output, six lines and nothing else: ` M scripts/selftest.mjs`, ` M specs/027-company-scoped-owner-deep-links/report.md`, ` M specs/027-company-scoped-owner-deep-links/scopes.md`, ` M specs/027-company-scoped-owner-deep-links/state.json`, ` M tests/options-flow-feed-lab.spec.mjs`, ` M tests/volatility-sizing-lab.spec.mjs` — all inside `workBoundary.allowedPaths`, no Excluded family named. **Falsifiability proved by mutation, not argued:** `site-exclusions.json` was clean at sha256 `f3c437749395f2549166ded7a55942aa611670bb4d8262bc2e7e57efa79e1260`; one appended newline made the same restricted command print ` M site-exclusions.json`, falsifying the conjunct; `git checkout --` restored it and the digest re-read identical (`RESTORE_VERIFIED=yes`). Nothing was left mutated. **Conjunct (b). Command:** `git status --porcelain company-fundamentals-lab.html technical-analysis-decision-lab.html trend-dynamics-cycle-lab.html`. **Exit Code:** 0. Output: nothing. The three disqualified routes remain byte-unchanged. **Conjunct (c). Command:** `git --no-pager diff -- 'rltax*.js' 'lifetime-tax-*' 'tax-rules' 'specs/021-*' 'specs/022-*' 'specs/023-*' 'specs/024-*' | grep -cE 'linkedSubject|SUBJECT_PARAM|SUBJECT_PATTERN|ownerSubjectParam|ownerBareReason|FEATURE-027|027-company-scoped'`. **Exit Code:** 1 (grep's no-match code), printed count `0`. The reading is not vacuous: the same pathspec under `--name-only` names `rltaxrental.js`, which carries a live thirteen-line diff from the concurrent session — a one-line probe substituting `"mid-month-probe"` for `"mid-month"` in `conventionFraction` — and that diff carries none of the seven tokens. **Closing re-verification.** Re-run at the end of this pass, the same pathspec prints nothing: the concurrent session reverted its probe mid-pass, so the family is now clean and the conjunct holds over an empty diff. Both states are recorded; the conjunct was true in both. **Claim Source:** executed.
      **Planning correction (supersedes the prior wording, and supersedes the two records printed below it).** The previous first half ran a bare whole-tree `git status --porcelain` and required it to name nothing outside this scope's Allowed families. That predicate is unsatisfiable in this repository by construction rather than by any fault of this scope, because several other sessions concurrently write `specs/_bugs/BUG-009-*`, `briefs/`, `market-brief.owner-reads.json`, `notes/README.md`, two `scripts/` files and assorted untracked scratch paths that this feature can neither control nor clean. A boundary check whose truth value is owned by unrelated work measures nothing about this feature, so it is restated over the surfaces this feature actually declares. The prior second half is preserved verbatim as conjunct (b), because it was already scope-scoped and already passing. The lifetime-tax family is checked by authorship rather than by cleanliness, because a concurrent session is actively modifying `rltaxrules.js` and requiring that family to print nothing would re-create the very hostage this correction removes. The item is not weakened. Conjunct (a) fails the instant this feature dirties `tools.json`, `rlnav.js`, `specs/025-*` or `specs/026-*`, conjunct (b) fails the instant any disqualified route is opened, and conjunct (c) fails the instant a Feature 027 token appears anywhere in the lifetime-tax family. The Uncertainty Declaration and routing record printed below were written against the superseded whole-tree wording and are retained as history only. Verification has since been recorded and this item is ticked on that executed evidence.
      **Superseded record (whole-tree wording).** **Uncertainty Declaration.** The second half is satisfied and the first half is not provable as written, so this item stays unticked. **Executed:** YES. **Command:** `git status --porcelain company-fundamentals-lab.html technical-analysis-decision-lab.html trend-dynamics-cycle-lab.html` and a whole-tree `git status --porcelain`. **Exit Code:** 0, 0. PROVEN: the three disqualified routes print nothing and are byte-unchanged. NOT PROVEN: the whole-tree porcelain is not confined to this scope's Allowed families, because it also lists unrelated pre-existing in-flight work this scope did not create — `briefs/`, `market-brief.owner-reads.json`, `notes/README.md`, `scripts/brief-narrative-parallel.mjs`, `scripts/build-attention-items.mjs`, `specs/023-*/report.md` — alongside Scope 1's own uncommitted files. What is proven is the narrower claim this scope owns: the complete set of paths it touched is the seven listed in [report.md](report.md), every one inside `workBoundary.allowedPaths`. **Closeout re-verification.** Re-run at closeout: `git status --porcelain company-fundamentals-lab.html technical-analysis-decision-lab.html trend-dynamics-cycle-lab.html` still prints nothing, so the second half continues to hold, while the whole-tree porcelain still names the same unrelated in-flight work, so the first half is still not provable as written. **Claim Source:** executed.
      **Re-examination and routing (this session).** **Executed:** YES. **Command:** `git status --porcelain company-fundamentals-lab.html technical-analysis-decision-lab.html trend-dynamics-cycle-lab.html` and a whole-tree `git status --porcelain`. **Exit Codes:** 0, 0. The second half is re-confirmed in this session: the three disqualified routes print nothing. The first half is still false, and for the same external reason — the whole-tree porcelain names other sessions' in-flight work (`briefs/`, `market-brief.owner-reads.json`, `notes/README.md`, two `scripts/` files, five `specs/_bugs/BUG-009-…` files and thirteen untracked scratch paths). This scope's own production edits have since landed as `0f63acb50`; the only path it still carries in the porcelain is `tests/options-flow-feed-lab.spec.mjs`, which is inside `workBoundary.allowedPaths`. **Routed to `bubbles.plan`** to be rewritten as a scope-scoped predicate rather than ticked. **Claim Source:** executed.
- [x] `bash .github/bubbles/scripts/artifact-lint.sh specs/027-company-scoped-owner-deep-links` exits 0.
      **Executed:** YES. **Command:** `bash .github/bubbles/scripts/artifact-lint.sh specs/027-company-scoped-owner-deep-links`. **Exit Code:** 0, `Artifact lint PASSED.` **Claim Source:** executed.

**Tier 2 — Scope specific.**

- [x] The FR-027-015 baseline for `options-flow-feed-lab.html` was captured from the unmodified route **before** any edit to it, and the captured values are recorded verbatim in [report.md](report.md).
      **Executed:** YES. **Command:** `shasum -a 256 options-flow-feed-lab.html` followed by the baseline-only Playwright run. **Exit Code:** 0 for the hash, 1 for the capture run (the pinned literal still read `PENDING_CAPTURE`, which is how the real values were observed). At capture time the route hashed `5b66a095b58e798686aefb407767dd118584a70694965b36b52d39a45b57dc98`, identical to `git show HEAD:options-flow-feed-lab.html`, and `git status --porcelain` printed nothing for it. The full observed JSON is transcribed verbatim in [report.md](report.md). **Claim Source:** executed.
- [x] Row 2.8 compares against those captured values rather than against values read after the change.
      **Executed:** YES. **Command:** the options-flow Playwright command. **Exit Code:** 0. The observed pre-change values are pinned as the `BASELINE` literal in `tests/options-flow-feed-lab.spec.mjs` and row 2.8 asserts `expect(observed).toEqual(BASELINE)`; the literal was written from the pre-edit run and never rewritten afterwards. **Claim Source:** executed.
- [x] `volatility-sizing-lab.html` resolves an accepted subject only against `runtime.config.assets[].symbol`, proven by an assertion that a grammar-valid non-member yields the unavailable state rather than a selection.
      **Executed:** YES. **Command:** the volatility Playwright command plus `node scripts/selftest.mjs`. **Exit Code:** 0, 0. `Regression: SCN-027-012 an acceptable company outside the eleven-asset universe is named as unavailable and the default asset stays fully computed` passes: `?ticker=TSLA` is grammar-valid, is absent from the eleven-entry catalog, leaves `asset === 'SPY'` fully computed with a rendered decision id, and names TSLA in the notice. Row 2.15 proves the assertion falsifiable. **Claim Source:** executed.
- [x] `options-flow-feed-lab.html` resolves an accepted subject only against `UNIVERSE`, proven by the same shape of assertion.
      **Executed:** YES. **Command:** the options-flow Playwright command plus `node scripts/selftest.mjs`. **Exit Code:** 0, 0. `Regression: SCN-027-012 a covered ticker with no flagged strike and an uncovered ticker render two distinct named statements, neither blank` passes, and row 2.16 turns it red by disabling the `UNIVERSE` lookup. **Claim Source:** executed.
- [x] No accepted subject reaches a `localStorage` key, a fetch path or a constructed identifier on either route, proven by asserting that `CACHE_PREFIX + sym` is only ever built from a `UNIVERSE` member.
      **Executed:** YES. **Command:** `node scripts/selftest.mjs` plus both `SCN-027-010` corpus tests. **Exit Code:** 0, 0, 0. The selftest assertion `no accepted subject reaches a localStorage key, a constructed path or a fetch target on either route (no sink reached)` rejects `CACHE_PREFIX + <anything but sym>`, `pagesUrl(<anything but sym>)`, any `localStorage.setItem` fed from `handoff`/`FOCUS`, and any fetch call fed from them. The browser tests drive a six-value adversarial corpus through both routes and assert the value reaches neither the document nor `localStorage`. **Claim Source:** executed.
- [x] A deep-linked visit to `options-flow-feed-lab.html` persists nothing about the linked company: the key set of the payload `saveState()` writes to `localStorage["optFlowState"]` after a deep-linked visit is IDENTICAL to the key set after an unlinked visit — the same six keys `mode`, `side`, `min`, `dte`, `sortK` and `sortDir`, with none added and none removed — and no persisted value, and no storage key, contains the linked ticker. Proven by reading `localStorage` on both visits in row 2.11 and comparing the two key sets.
      **Planning correction (supersedes the prior wording).** The previous wording claimed `saveState()` writes exactly four keys. That is false of the shipped route and was false before this feature: `saveState()` is `localStorage.setItem(LS, JSON.stringify(state))` over the six-key `state` object at `options-flow-feed-lab.html:414` (`mode`, `side`, `min`, `dte`, `sortK`, `sortDir`), so a literal reading would have required changing what an already-shipped route persists. The true key count is stated above. The risk this item exists to guard is unchanged and still enforced: the focus band is per-visit, not a stored preference, so a deep link must never enlarge or alter the persisted key set. It fails the moment a subject, focus or ticker member is added to `state`, because the linked and unlinked key sets then differ and a persisted value carries the ticker. Verification has since been recorded and this item is ticked on that executed evidence.
      **Executed:** YES. **Command:** `npx --no-install playwright test tests/options-flow-feed-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --workers=1 --grep "SCN-027-002" --reporter=list`. **Exit Code:** 0, `1 passed (3.9s)`, capture sha256 `bba9035afe7675b6ed496f89e3e347d58554c27b457dcf8063eac2f2977aefd0`. `--workers=1` is used because this machine is contended. **The comparison the item asks for now exists in row 2.11.** The row makes an unlinked visit and a deep-linked visit and reads `localStorage` on each, capturing the parsed key set of `optFlowState`, the whole `localStorage` key list and the raw persisted string. It then asserts the unlinked payload's key set is exactly `['dte', 'min', 'mode', 'side', 'sortDir', 'sortK']` — the six keys the shipped `saveState()` serialises — that the deep-linked payload's key set equals the unlinked one element for element, and that the whole-storage key list is equally identical across the two visits, so the link added no key anywhere and removed none. **No carve-out was needed.** The linked visit uses `UNCOVERED` (`MU`), the one grammar-valid symbol the harness deliberately does not seed a `rlOptFlow:<SYM>` cache entry for, so the row can assert literally that no persisted value contains the linked ticker and that the set of storage keys containing it is empty, rather than excusing a pre-seeded cache key. **Falsifiability, executed rather than argued.** Pointing the storage-key scan at a seeded symbol turns the row red: **Exit Code:** 1, capture sha256 `506eed0a38f81c15a4003f1cc7cf922168254270fa785c4cc1d82bf4a0fdd87e`, `Received + Array [ "rlOptFlow:NVDA" ]` against `Expected - Array []`. That proves the scan reads the page's real storage rather than passing on an empty list. The probe was reverted and the file's sha256 returned to its pre-probe value `0da3386854b26e80905baa59f2dea777c801a68b71a987c1a8c3e23dbd57e838`, with `grep -c "NVDA') !== -1"` returning `0`. **Claim Source:** executed.
- [x] The four options-flow band outcomes are four distinct rendered statements, and the covered-with-no-flagged-strike case is never rendered as the not-covered case, proven by row 2.13.
      **Executed:** YES. **Command:** the options-flow Playwright command plus `node scripts/selftest.mjs`. **Exit Code:** 0, 0. Row 2.13 asserts `silent !== uncovered`, that each names its own ticker, that the covered case matches `/crossed the activity bar/`, that the uncovered case matches `/does not include it/`, and that the covered case does **not** match `/does not include it/`. The selftest counts the distinct statements at `5/5` (absent, refused, not-covered, covered-with-nothing-flagged, covered-with-flags). **Claim Source:** executed.
- [x] The focus band is not a filter and not a pre-sort, proven by row 2.10 asserting equal row counts and by an assertion that `state.sortK` and `state.sortDir` are unchanged after a linked arrival.
      **Executed:** YES. **Command:** the options-flow Playwright command plus `node scripts/selftest.mjs`. **Exit Code:** 0, 0. Row 2.10 asserts `feedOrder`, `tableOrder` and `byTickerOrder` are element-wise equal to the unlinked open and that the persisted `sortK === 'score'` and `sortDir === -1` after a linked arrival. The selftest additionally proves `FOCUS` never appears inside `filtered()` (376 characters of that function scanned) and never writes `state.sortK` or `state.sortDir`. **Claim Source:** executed.
- [x] Both routes contain exactly one `#linkNotice`-equivalent status element written with `textContent`, carrying `role="status"`, hidden with empty text when no parameter is supplied.
      **Executed:** YES. **Command:** `node scripts/selftest.mjs`, both Playwright commands, and a headless `file://` probe. **Exit Code:** 0, 0, 0, 0. The selftest asserts `each route carries exactly one role="status" #linkNotice, hidden by default and never written with innerHTML`. The unlinked browser opens assert `hidden` is set and `textContent === ''` on both routes, and the `file://` probe returns `role: "status"`, `hidden: true`, `text: ""` for both routes with no parameter. **Claim Source:** executed.
- [x] Both adversarial rows 2.15 and 2.16 are recorded with one real failing run under the mutation and one real passing run with the guard restored, and both mutations are reverted before the scope closes.
      **Executed:** YES. **Command:** the two per-file Playwright commands under `--grep "SCN-027-012"`, each preceded by a guard-match count so neither mutation could be a silent no-op. **Exit Code:** 1 mutated and 0 restored for both rows. Row 2.16 was reverted by targeted back-substitution with `REVERT_VERIFIED=yes` (`BEFORE` = `AFTER` = `88568b5744937f93c133aa52659a633335f043d8b65b5242bd7327c0d79471cc`). Row 2.15's `git checkout --` revert also discarded this scope's own edit; the edit was re-applied and verified byte-exact against the pre-mutation hash `02f6f82ff8b809030c9c04cd9f53cf828eb56d5cc788e529e6ae265ecfd9f268` (`RESTORE_VERIFIED=yes`). Both routes then re-ran green. **Claim Source:** executed.
- [x] Opening either route with no query string introduces no network request the route did not already make, proven by the existing no-market-data-request assertion on volatility and by a request-count assertion on options-flow.
      **Executed:** YES. **Command:** both per-file Playwright commands. **Exit Code:** 0, 0. The pre-existing `Controls recompute one decision without any market-data request` passes unchanged inside the 25-test volatility run. On options-flow, `Regression: SCN-027-005 an unlinked open issues no request the linked open does not…` counts `data/options/` requests across an unlinked and a linked open and asserts they are equal and zero. **Claim Source:** executed.
- [x] The subject-handoff path introduces no new `file://` incompatibility on either receiving route. Three conjuncts, all required. (a) Structural: `grep -cE '^(import|export)[[:space:]]' volatility-sizing-lab.html options-flow-feed-lab.html` returns 0 for both, `grep -n 'type="module"'` returns no match on either, and `package.json` declares no `scripts` block, so neither route gained ES module syntax and no bundler exists. (b) Behavioral parity: opened from a `file://` origin, each route reaches the same rendered outcome with a `?ticker=` value present as it reaches with no query string at all, so the parameter neither adds nor removes a `file://` failure. (c) `options-flow-feed-lab.html`, which issues no same-directory configuration fetch, fully reaches its paint from a `file://` origin with `RLTKR` resolved, the focus band rendering its real text and zero page errors, both with and without a subject.
      **Verification (this session, `bubbles.implement`). All three conjuncts hold, so the item is ticked.** **Executed:** YES. **Phase:** implement. **(a) Structural. Commands:** `grep -cE '^(import|export)[[:space:]]' volatility-sizing-lab.html options-flow-feed-lab.html` → **Exit Code:** 1, output `volatility-sizing-lab.html:0` and `options-flow-feed-lab.html:0`; `grep -n 'type="module"' volatility-sizing-lab.html options-flow-feed-lab.html` → **Exit Code:** 1, no output; `package.json` → `hasScripts=false`. **(b) and (c) were run in a real browser from a real `file://` origin, not argued from a prior pass.** Three new persistent Playwright rows were written for this item and run with `--workers=1`: `FEATURE-027 file:// parity: the options-flow route reaches the same file:// outcome with a ?ticker= subject as with no query string` and `FEATURE-027 file:// paint: the options-flow route fully reaches its paint from a file:// origin with and without a subject` in `tests/options-flow-feed-lab.spec.mjs`, and `FEATURE-027 file:// parity: the volatility route reaches the same file:// outcome with a ?ticker= subject as with no query string` in `tests/volatility-sizing-lab.spec.mjs`. Each navigates to `file://` + the absolute route path, with no static server in the picture. **Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/options-flow-feed-lab.spec.mjs tests/volatility-sizing-lab.spec.mjs --grep "FEATURE-027 file://" --workers=1 --reporter=list`. **Exit Code:** 0, `3 passed (6.4s)`. **Conjunct (b) observed values.** options-flow, no query: `{"scriptCompleted":true,"rltkrResolved":true,"noticePresent":true,"feedRendered":true,"tableRendered":true,"pageErrors":0}`; with `?ticker=NVDA`: byte-identical on every one of those six reach fields. volatility, no query: `{"rltkrResolved":true,"labPresent":false,"configErrorShown":true,"configLoaded":false,"activeAsset":null,"noticePresent":true,"noticeHidden":true,"pageErrors":0}`; with `?ticker=NVDA`: identical on all eight. The volatility route reaches its pre-existing configuration-unavailable banner in both cases, which is the point of the parity formulation — the parameter changes nothing about how far that route gets from disk. **Conjunct (c) observed values.** Unlinked: zero page errors, status reached `chains cached`, `RLTKR` resolved, feed and table both rendered, notice hidden with empty text. Linked with `?ticker=NVDA`: zero page errors, the same paint reached, and the focus band shown carrying its real text, `Focus: NVDA — 2 flagged strikes · call premium $260K vs put premium $25K · end-of-day proxy over 12 liquid names, not a real-time tape.` **Falsifiability proved by mutation, not argued.** `options-flow-feed-lab.html` was clean at sha256 `88568b5744937f93c133aa52659a633335f043d8b65b5242bd7327c0d79471cc`; changing its `<script src="rlticker.js" defer>` to `type="module"` made the paint row fail for a real reason — **Exit Code:** 1, `RLTKR must resolve from a file:// origin · Expected: true · Received: false` — which is exactly the loss of `file://` operation this conjunct is meant to catch. The tag was restored, the digest re-read as the identical `88568b5744937f93c133aa52659a633335f043d8b65b5242bd7327c0d79471cc` (`RESTORE_VERIFIED=yes`), `git status --porcelain options-flow-feed-lab.html` printed nothing, and all three rows re-ran green. No mutation was left on disk. **Regression:** both touched spec files were then run in full — **Exit Code:** 0, `37 passed (31.3s)` — with no collateral failure. **Claim Source:** executed.
      **Planning correction (supersedes the prior wording, and supersedes the two records printed below it).** The previous wording required BOTH routes to load and operate from a plain `file://` open. `volatility-sizing-lab.html:1192` fetches `volatility-sizing-universe.json`, and a `file://` origin cannot serve it, so that route renders its pre-existing configuration-unavailable banner instead of operating. That limitation is a property the route already had at `HEAD` and this feature did not regress it, so requiring it here would make this feature answerable for a defect it did not introduce. Feature 025's own route does work from `file://`, but only because that feature deliberately embedded its registry inside its own change boundary; that was one feature's design choice about one route, not a property every route already holds, and this feature's Change Boundary explicitly forbids changing the volatility route's data-loading strategy. The item is restated to the property this feature is actually responsible for, and it is not weakened: conjunct (b) fails the moment the handoff path makes a route behave worse under `file://` with the parameter than without it, which is the only new `file://` risk this feature can create, and conjunct (c) fails the moment the options-flow route stops painting from disk. **Routed finding, not folded in.** The volatility route's own `file://` limitation is recorded as a separate finding rather than as part of this feature's DoD: `volatility-sizing-lab.html:1192` cannot load its universe from a `file://` origin, which conflicts with the repository's no-server access principle. Owner: `bubbles.workflow`, for dispatch to `bubbles.bugfix` as a new bug artifact under `specs/_bugs/` scoped to `volatility-sizing-lab.html`. That rewrite belongs to the owner named above rather than to this feature, because this feature's Change Boundary admits the file only for the subject-handoff change, and rewriting how it loads its universe is a different change with a different blast radius. Verification was subsequently performed by `bubbles.implement` and the item above is ticked on that recorded evidence; the routed `file://` finding remains open with the owner named above.
      **Superseded record (both-routes-operate wording).** **Uncertainty Declaration.** One route is proven and the other is not, so this stays unticked. **Executed:** YES. **Command:** a headless Chrome `file://` open of each route with and without a subject, plus `node scripts/selftest.mjs`, plus the same probe against an isolated `HEAD` worktree. **Exit Code:** 0, 0, 0. PROVEN: neither edited route introduced ES module syntax or an arrow function into its inline ES5 script (`both ES5`); there is no bundler and no build step; and `options-flow-feed-lab.html` fully loads and operates from `file://`, with `RLTKR` resolved, the focus band rendering its real text and zero page errors. NOT PROVEN: that `volatility-sizing-lab.html` *operates* from `file://`. Chrome blocks its `fetch("volatility-sizing-universe.json")` on a `file://` origin, so the route renders its existing configuration-unavailable banner and the handoff never runs — which is the planned failure interaction of one problem rather than two. This is pre-existing rather than a regression: the same probe against `HEAD` returns `{"head_configLoaded":false,"head_configErrorShown":true,"head_select":""}`, the same outcome as the working tree. The item asserts a property this route has never had, so it is not ticked on a `HEAD`-parity argument. **Claim Source:** executed.
      **Re-examination and routing (this session).** The structural half was re-checked here: `grep -cE '^(import|export)[[:space:]]' volatility-sizing-lab.html options-flow-feed-lab.html` returns `0` for both, so neither route carries top-level ES module syntax and there is no bundler. **Exit Code:** 0. The blocking mechanism was also re-read at source: `volatility-sizing-lab.html:1192` issues `fetch("volatility-sizing-universe.json", { cache: "no-store" })`, a same-directory fetch that a `file://` origin has no working origin for. **Claim Source:** executed. This session did NOT re-run a browser `file://` probe — the machine is contended and the run was deliberately kept targeted — so the recorded finding that the route falls back to its configuration-unavailable banner is a prior pass's evidence and is not restated here as this session's own. **Claim Source for that finding:** not-run in this session. The item therefore stays unticked, and it is **routed to `bubbles.plan`**: as written it asserts of `volatility-sizing-lab.html` an operate-from-`file://` property the route has never had and that this feature did not regress, so it is a planning question about what the item should require, not an implementation gap to close by ticking.
- [x] `notes/volatility-sizing-lab.md` and `notes/options-flow-feed-lab.md` each state the accepted parameter, what resolution means on that route, and what the unavailable and refused states say.
      **Executed:** YES. **Command:** `git --no-pager diff -- notes/volatility-sizing-lab.md notes/options-flow-feed-lab.md`. **Exit Code:** 0. Each note gains a `## Linked subject (?ticker=)` section naming the parameter, the catalog the value resolves against, what a resolution does, and the exact unavailable and refused wording. The options-flow note additionally tabulates all four band outcomes and records why the resolved focus is held off `state`. **Claim Source:** executed.
- [x] Before this scope begins, `options-flow-feed-lab.html` was checked for concurrent modification by the `specs/026` session, and any collision was routed rather than resolved in place.
      **Executed:** YES. **Command:** `git status --porcelain options-flow-feed-lab.html`, `shasum -a 256`, `git show HEAD:options-flow-feed-lab.html | shasum -a 256`, `git log -1 -- options-flow-feed-lab.html`, and a reference scan of `specs/026-*`. **Exit Code:** 0. Before the scope: porcelain printed nothing and the worktree copy hashed `5b66a095b58e798686aefb407767dd118584a70694965b36b52d39a45b57dc98`, identical to `HEAD`, last touched by `cbc7cf7aa fix: close roadmap verification gaps` on 2026-08-02. After the scope: `HEAD` still hashes the same value and the last commit touching the file is still `cbc7cf7aa`. `specs/026-actionable-brief-brevity-and-cross-asset` holds only a `spec.md` that names the route in prose. No concurrent modification landed, so there was no collision to route. **Claim Source:** executed.
- [x] `rlticker.js` is byte-unchanged by this scope, proven by `git status --porcelain rlticker.js` printing nothing.
      **Executed:** YES. **Command:** `git status --porcelain rlticker.js`. **Exit Code:** 0. Output: nothing. The named proof now passes as written. It could not pass in the earlier pass recorded below because Scope 1's `+25 / -0` append to the same file was still uncommitted; that append has since landed as `0f63acb50 spec 027: company-scoped owner deep links, and a coherent registry`, so the working-tree copy matches `HEAD` and no uncommitted change to the file exists from any scope. `git diff --numstat -- rlticker.js` likewise prints nothing. The substantive claim is unchanged and independently held throughout: Scope 2 never opened `rlticker.js`, and the committed file still carries only Scope 1's shared definition — `SUBJECT_PARAM` at line 53, `SUBJECT_PATTERN` at line 54 and their installation on `root.RLTKR` at lines 145 and 146 — with no `catalog`, `UNIVERSE`, `ownerBareReason` or `focus` content. **Superseded prior record.** The earlier Uncertainty Declaration on this item stated the claim was true while the named proof was unusable; the proof is now usable and passes, so the item is ticked on the proof it names rather than on a substitute. **Claim Source:** executed.

**Scenario fidelity (Gate G068).** The three items below restate what this scope's Gherkin scenarios assert, taken from [spec.md](spec.md) rather than from what was delivered. They shipped UNCHECKED and were ticked by the `bubbles.implement` pass that recorded executed evidence against each one; all three below now carry that evidence.

- [x] SCN-027-001 — Following a dimension's owner link while reading a company on the company intelligence route, where that dimension's owner route can resolve a company subject, opens the owner route with that company as its active subject, and the owner route names that active subject on screen. Both clauses are required: opening on the company does not satisfy the scenario if the reader cannot tell in words which company is shown. **Proof:** Test Plan rows 2.3 (`Regression: SCN-027-001 ?ticker=NVDA selects NVDA in the asset select and names it on screen`) and 2.9 (`Regression: SCN-027-001 ?ticker=NVDA renders a focus band naming NVDA with its flagged-strike count and call-versus-put premium split`) for the active-subject clause, and rows 2.4 and 2.12 for the names-on-screen clause, under the two per-file Playwright commands named in the Test Plan.
      **Executed:** YES. **Command:** `npx --no-install playwright test tests/volatility-sizing-lab.spec.mjs tests/options-flow-feed-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --workers=1 --reporter=list` — the two per-file commands the Proof names, in one invocation with the workers pin this session requires. **Exit Code:** 0 — `41 passed (49.8s)`. All four named rows are green in that run: row 2.3 as `✓ 33 … tests/volatility-sizing-lab.spec.mjs:639:1 › Regression: SCN-027-001 ?ticker=NVDA selects NVDA in the asset select and names it on screen (292ms)`; row 2.9 as `✓ 2 … tests/options-flow-feed-lab.spec.mjs:125:1 › Regression: SCN-027-001 ?ticker=NVDA renders a focus band naming NVDA with its flagged-strike count and call-versus-put premium split`; row 2.4 as `✓ 34 … tests/volatility-sizing-lab.spec.mjs:651:1 › Regression: SCN-027-004 the active subject is readable as page text and in the accessibility tree, not only inside a chart (373ms)`; row 2.12 as `✓ 6 … tests/options-flow-feed-lab.spec.mjs:225:1 › Regression: SCN-027-004 the focus band names the active subject as page text rather than only in a table cell (369ms)`. The two clauses are carried by different rows, so a green on one does not stand in for the other. **Claim Source:** executed.
- [x] SCN-027-003 — On the receiving route that presents many companies at once, arriving through an owner link naming one of them makes that company's own read the one the route presents first, and the rest of the scan stays visible to the researcher. The second clause forbids the focus from acting as a filter or as a pre-sort. **Proof:** Test Plan row 2.10, `Regression: SCN-027-003 the focus band is present and the feed, table and by-ticker row counts equal the unlinked baseline exactly`, under `npx --no-install playwright test tests/options-flow-feed-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` — equality against the unlinked baseline is what proves nothing was removed or reordered.
      **Executed:** YES. **Command:** `npx --no-install playwright test tests/volatility-sizing-lab.spec.mjs tests/options-flow-feed-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --workers=1 --reporter=list`. **Exit Code:** 0 — `41 passed (49.8s)`, carrying row 2.10 as `✓ 3 … tests/options-flow-feed-lab.spec.mjs:141:1 › Regression: SCN-027-003 the focus band is present and the feed, table and by-ticker row counts equal the unlinked baseline exactly`. The equality is against a BASELINE CAPTURED IN THE SAME RUN, not against a recalled number: the body at `tests/options-flow-feed-lab.spec.mjs:141-153` opens the route with no parameter and captures `plain`, opens it again with `?ticker=NVDA` and captures `linked`, then asserts `linked.feedOrder`, `linked.tableOrder` and `linked.byTickerOrder` each `toEqual` the `plain` counterpart, and separately reads `optFlowState` back to confirm `sortK === 'score'` and `sortDir === -1` are untouched. A companion row for the same scenario, `✓ 4 … :172:1 › Regression: SCN-027-003 the focus band is the ONLY difference a subject makes …`, widens that to WHOLE-CAPTURE equality `expect(linked).toEqual(plain)` across five subject classes — covered-and-flagged, covered-but-silent, accepted-but-uncovered, the grammar-valid `..` oddity, and refused — and additionally asserts the band is non-hidden with non-empty text in each class, so the equality cannot pass vacuously through a band that never renders. **Claim Source:** executed.
- [x] SCN-027-012 — Opened with an acceptable company the route holds no data for, the route names that company and states that it has no data for it, does not render a blank view, and does not render another company's values under that company's name. All three negatives are part of the claim, not colour on it. **Proof:** Test Plan rows 2.5 (`Regression: SCN-027-012 an acceptable company outside the eleven-asset universe is named as unavailable and the default asset stays fully computed`) and 2.13 (`Regression: SCN-027-012 a covered ticker with no flagged strike and an uncovered ticker render two distinct named statements, neither blank`), under the two per-file Playwright commands named in the Test Plan.
      **Executed:** YES. **Command:** `npx --no-install playwright test tests/volatility-sizing-lab.spec.mjs tests/options-flow-feed-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --workers=1 --reporter=list`. **Exit Code:** 0 — `41 passed (49.8s)`. Row 2.5 is green as `✓ 35 … tests/volatility-sizing-lab.spec.mjs:663:1 › Regression: SCN-027-012 an acceptable company outside the eleven-asset universe is named as unavailable and the default asset stays fully computed`, and row 2.13 as `✓ 7 … tests/options-flow-feed-lab.spec.mjs:236:1 › Regression: SCN-027-012 a covered ticker with no flagged strike and an uncovered ticker render two distinct named statements, neither blank`. Two further rows for the same scenario are green in the same run and carry the third negative — that no other company's values appear under the named company: `✓ 36 … :689:1 › Regression: SCN-027-012 the catalog binding is discriminating on its own — an accepted but uncatalogued subject never becomes the …`, the assertion the gaps phase added so the binding fails by naming the defect instead of by timing out, and `✓ 39 … :811:1 › Regression: SCN-027-012 an accepted but uncatalogued subject — including the grammar-valid traversal form ".." — reaches no reque…`. The production guard those rows discriminate is intact and unmutated: `grep -n "catalogAsset(handoff.subject)" volatility-sizing-lab.html` prints `1154: var match = handoff.status === "accepted" ? catalogAsset(handoff.subject) : null;`, and a tree-wide `grep -rl 'MUTATION UNDER TEST'` over `*.html`, `*.js` and `*.mjs` returns `MUTCOUNT=0`. **Claim Source:** executed.

---

## Scope 3: The registry, the declarations and the stated bare reasons

**Scope-Kind:** runtime-behavior

**Status:** Done (26 of 26 DoD items ticked)

| Field | Value |
| --- | --- |
| Status | Done — implemented and verified; 26 of 26 DoD items ticked with executed evidence |
| Priority | P1 |
| Depends On | Scope 1 and Scope 2. FR-027-027 forbids declaring a subject parameter before its route reads one, so every reader must exist first. |
| Owns scenarios | SCN-027-014, SCN-027-015, SCN-027-016, SCN-027-018 |

This scope turns FR-027-027 and FR-027-030 from promises into schema errors, and
it turns five silent gaps into seven stated positions.

### Use Cases (Gherkin)

```gherkin
Scenario: SCN-027-014 A market-scoped owner stays a bare link
  Given a dimension whose owner route answers a market-wide question
  When the row renders its owner link
  Then the link carries no company
  And the row states that the owner is market-scoped rather than company-scoped
```

```gherkin
Scenario: SCN-027-016 A declaration without a reader is refused
  Given a registry row declares a subject parameter
  When the route it names does not read that parameter
  Then the condition is reported as a defect
  And it is not allowed to ship as a working deep link
```

```gherkin
Scenario: SCN-027-018 The upstream promise becomes satisfiable
  Given every owner route that can resolve a company now reads the shared subject parameter
  And every row for those routes declares the shared parameter name
  When the upstream acceptance item about linking to an owner for the same company is re-read
  Then it can be exercised end to end for those dimensions
  And the dimensions that remain bare carry a stated reason rather than a silent gap
```

SCN-027-015 is carried in [scenario-manifest.json](scenario-manifest.json).

### Implementation Plan

**`rlcompanyintel.js`.** `readCoverageRegistry` gains three checks, each raising
`C025-CONFIG-SCHEMA` named with the row's dimension id: `ownerBareReason` present
with `ownerDeepLink === null`; `ownerBareReason` outside the closed enum; and
`ownerDeepLink !== null` with not exactly one of `ownerSubjectParam` and
`ownerBareReason` present. The third is the rule that makes silence impossible.
`describeDimensionOwner` keeps its `company-dimension-owner/v1` contract version
and its field set; only the `statement` text becomes reason-specific.

| Condition | Statement |
| --- | --- |
| `carriesSubject === true` | unchanged |
| `ownerBareReason === "market-scoped"` | the owner answers a market-wide question rather than a company one, so the link carries no company |
| `ownerBareReason === "fixed-subject"` | the owner does not model an individual company you can choose, so the link opens on that tool's own subject |
| No owner | unchanged |

The reason is a closed enum rather than free text on purpose: free text would put
operator-authored content on a rendering path and take the wording out of code
review.

**`company-intelligence.config.json`.** Eleven owner-bearing rows end in exactly
one declaration each. Four subject-carrying, seven bare-with-reason, four
ownerless, fifteen in total.

| Dimension | Owner route | Declaration |
| --- | --- | --- |
| `options-structure` | `options-structure-lab.html` | `ownerSubjectParam: "ticker"` (already present) |
| `dealer-gamma` | `gamma-trading-lab.html` | `ownerSubjectParam: "ticker"` (already present) |
| `volatility` | `volatility-sizing-lab.html` | `ownerSubjectParam: "ticker"` (new) |
| `options-flow` | `options-flow-feed-lab.html` | `ownerSubjectParam: "ticker"` (new) |
| `performance` | `market-brief.html` | `ownerBareReason: "market-scoped"` |
| `sentiment` | `market-brief.html` | `ownerBareReason: "market-scoped"` |
| `geopolitics` | `research-agenda-lab.html` | `ownerBareReason: "market-scoped"` |
| `fundamentals` | `company-fundamentals-lab.html` | `ownerBareReason: "fixed-subject"` |
| `valuation` | `company-fundamentals-lab.html` | `ownerBareReason: "fixed-subject"` |
| `technicals` | `technical-analysis-decision-lab.html` | `ownerBareReason: "fixed-subject"` |
| `cycles` | `trend-dynamics-cycle-lab.html` | `ownerBareReason: "fixed-subject"` |
| `financial-events`, `non-financial-events`, `market-regime`, `company-risk` | none | neither, unchanged |

The four `fixed-subject` rows are bare for the reason recorded in design D1, and
each reason is accurate for its route: `technical-analysis-decision-lab.html`
names no instrument, `trend-dynamics-cycle-lab.html` holds a single `spy-daily`
series, and `company-fundamentals-lab.html` is a single-issuer worked example
whose static markup, comparability headings, peer set and published owner read
name Microsoft in roughly thirty places, so repointing its data without
repointing those strings would show one company's numbers under another
company's name.

**`company-intelligence-lab.html`.** Today `owner.statement` is appended only
inside the `else` of `if (owner.hasOwner)` on the coverage table, and the
dimension card does the same. Both surfaces are changed to append the statement
**beside** the link for a bare-but-owned row, using the same `el()` helper and
therefore the same `textContent` sink. No Feature 025 spec, design, scopes,
report or uservalidation artifact is modified; the two touched files are
production source.

**Sending side.** `rlcompanyintel.js::ownerRouteFor` is not modified. It already
composes `<validated route>.html?<validated param>=<percent-encoded value>` from
separately validated parts, and `SAFE_OWNER_ROUTE` is not widened. Declaring
`ownerSubjectParam` on two more rows is sufficient to make it emit the company.

### Consumer Impact Sweep

This scope renames nothing and removes nothing: `ownerBareReason` is an optional
additive field, no existing field changes meaning, and no row is rewritten. The
consumer surfaces that bind this scope are the deep links composed by the sender
for the two newly declared rows, which must resolve to the routes Scopes 1 and 2
made readers; the two rendering surfaces in `company-intelligence-lab.html`, the
coverage table and the dimension card, which must stay consistent with each
other; and the two existing tests that read the registry, which
[spec.md](spec.md) Honest Finding 6 established do not block the declaration —
`tests/company-intelligence-lab.spec.mjs` splits path from query before checking
registration, and `tests/company-intelligence.unit.mjs` filters rows by
`ownerSubjectParam !== null` rather than asserting a fixed count. No navigation
entry, breadcrumb, redirect, API client or generated client is affected.

### Shared Infrastructure Impact Sweep

This scope appends to the Feature 027 selftest group Scope 1 created and touches
no other shared surface. It adds no storage key, changes no ordering contract and
introduces no fixture or bootstrap helper. The blast radius is bounded to the
registry consumers enumerated in the Consumer Impact Sweep above, and the
rollback path is the same pure-append revert recorded in the feature-level
[Shared Infrastructure Impact Sweep](#shared-infrastructure-impact-sweep).

### Change Boundary

Governed by the feature-level [Change Boundary](#change-boundary). The Allowed
file families this scope may touch are `rlcompanyintel.js`,
`company-intelligence.config.json`, `company-intelligence-lab.html`,
`tests/company-intelligence.unit.mjs`,
`tests/company-intelligence-lab.spec.mjs`, the appended Feature 027 selftest
group, `notes/company-intelligence-lab.md`, and this feature's planning
artifacts. Every Excluded surface stays byte-unchanged, and
`specs/025-company-multi-horizon-intelligence-lab/**` is explicitly among them.

### Test Plan

| # | Scenario | Type | Command | File and expected test title |
| --- | --- | --- | --- | --- |
| 3.1 | SCN-027-016 | Unit | `node --test tests/company-intelligence.unit.mjs` | `tests/company-intelligence.unit.mjs` — `a row with an ownerDeepLink declaring neither ownerSubjectParam nor ownerBareReason raises C025-CONFIG-SCHEMA naming its dimension id` |
| 3.2 | SCN-027-016 | Unit | same command as 3.1 | `tests/company-intelligence.unit.mjs` — `a row declaring both ownerSubjectParam and ownerBareReason raises C025-CONFIG-SCHEMA naming its dimension id` |
| 3.3 | SCN-027-016 | Unit | same command as 3.1 | `tests/company-intelligence.unit.mjs` — `an ownerBareReason outside the closed enum, and an ownerBareReason on a row with no ownerDeepLink, each raise C025-CONFIG-SCHEMA` |
| 3.4 | SCN-027-014 | Unit | same command as 3.1 | `tests/company-intelligence.unit.mjs` — `a market-scoped row composes a bare href and its statement says the owner answers a market-wide question` |
| 3.5 | SCN-027-015 | Unit | same command as 3.1 | `tests/company-intelligence.unit.mjs` — `a fixed-subject row composes a bare href and its statement says the owner opens on its own subject` |
| 3.6 | FR-027-025, FR-027-026 | Unit | same command as 3.1 | `tests/company-intelligence.unit.mjs` — `the shipped registry declares four subject-carrying rows, seven bare rows with a reason and four ownerless rows, and no market-scoped row carries a subject parameter` |
| 3.7 | SCN-027-017 | Unit | same command as 3.1 | `tests/company-intelligence.unit.mjs` — `every declared ownerSubjectParam is the single shared parameter name and no second convention exists` |
| 3.8 | Adversarial — exactly-one-of rule removed | Unit | recorded mutated run of rows 3.1 and 3.2 | mutation run of `tests/company-intelligence.unit.mjs` — rows 3.1 and 3.2 must go red when the exactly-one-of rule is removed |
| 3.9 | SCN-027-018 | Regression E2E | `npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | `tests/company-intelligence-lab.spec.mjs` — `Regression: SCN-027-018 every subject-carrying owner link opens its owner route on the company being read` |
| 3.10 | SCN-027-014, SCN-027-015 | Regression E2E | same command as 3.9 | `tests/company-intelligence-lab.spec.mjs` — `Regression: SCN-027-014 every bare owner row renders its stated reason beside the link on both the coverage table and the dimension card` |
| 3.11 | FR-027-018 | Regression E2E | same command as 3.9 | `tests/company-intelligence-lab.spec.mjs` — `Regression: SCN-027-010 the rendered reason is written with textContent and no registry-authored value reaches an attribute or an href` |
| 3.12 | Canary: shared selftest surface after this scope's append | Regression E2E | `node scripts/selftest.mjs` exits 0 and reports zero failing assertions | `scripts/selftest.mjs` — `Regression: SCN-027-CANARY every pre-existing selftest assertion stays green after the Feature 027 append` |

### Definition of Done

**Tier 1 — Universal.**

- [x] `node --test tests/company-intelligence.unit.mjs` exits 0 with zero failing and zero skipped tests.
      **Executed:** YES. **Command:** as written. **Exit Code:** 0. Output: `ℹ tests 83`, `ℹ pass 83`, `ℹ fail 0`, `ℹ skipped 0`, `ℹ todo 0`. The suite held 76 tests before this scope, so rows 3.1 through 3.7 are seven additions rather than rewrites. **Claim Source:** executed.
- [x] `npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` exits 0 with zero failing and zero skipped tests.
      **Executed:** YES. **Command:** as written, with `--workers=1` added because the machine is contended and parallel workers produce teardown noise that is not a test failure. **Exit Code:** 0. Output: `35 passed (50.6s)`, no failing and no skipped line. The three new rows are numbered 33, 34 and 35 in that run. **Claim Source:** executed.
- [x] `node scripts/selftest.mjs` exits 0 with zero failing assertions.
      **Executed:** YES. **Command:** as written. **Exit Code:** 0. Output: `Research-Lab self-test: 3155 passed, 0 failed`. The suite reported 3145 passed before this scope, so the Scope 3 append added ten assertions and broke none. **Claim Source:** executed.
- [x] Every Test Plan row above ran, and each recorded exit code is a real observed exit code captured in this session.
      **Executed:** YES. **Commands and exit codes:** rows 3.1 to 3.7 — `node --test tests/company-intelligence.unit.mjs`, exit 0; row 3.8 — the same command under the disabled exactly-one-of rule, exit 1, then exit 0 with the rule restored; rows 3.9 to 3.11 — the named Playwright command, exit 0; row 3.12 — `node scripts/selftest.mjs`, exit 0. Every one is recorded verbatim in [report.md](report.md). **Claim Source:** executed.
- [x] Scenario-specific E2E regression tests for every new/changed/fixed behavior this scope introduces are present and pass: rows 3.9 through 3.11 each carry a persistent `Regression: SCN-027-NNN` title, and row 3.12 holds the shared-surface canary.
      **Executed:** YES. **Command:** the named Playwright command and `node scripts/selftest.mjs`. **Exit Codes:** 0 and 0. The three persistent titles are `Regression: SCN-027-018 every subject-carrying owner link opens its owner route on the company being read`, `Regression: SCN-027-014 every bare owner row renders its stated reason beside the link on both the coverage table and the dimension card` and `Regression: SCN-027-010 the rendered reason is written with textContent and no registry-authored value reaches an attribute or an href`. The canary is `Regression: SCN-027-CANARY every pre-existing selftest assertion stays green after the Feature 027 Scope 3 append (3154 assertion(s) already green at this point)`. **Claim Source:** executed.
- [x] Broader E2E regression suite passes: the Playwright command named above, `node --test tests/company-intelligence.unit.mjs` and `node scripts/selftest.mjs` each exit 0 with zero failing and zero skipped tests, and the Scope 1 and Scope 2 suites are re-run and still exit 0.
      **Executed:** YES. **Exit Codes:** 0 for all four commands. The Scope 1 and Scope 2 route suites were re-run together — `npx --no-install playwright test tests/options-structure-lab.spec.mjs tests/gamma-trading-lab.spec.mjs tests/volatility-sizing-lab.spec.mjs tests/options-flow-feed-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1` — exit 0, output `44 passed (35.1s)`, with all four files confirmed present in the run. **Claim Source:** executed.
- [x] Consumer Impact Sweep for this scope is complete and zero stale first-party references remain: every composed subject-carrying deep link resolves to a route that reads the parameter, both rendering surfaces show the same statement, and no navigation, breadcrumb, redirect or deep-link target changed.
      **Executed:** YES. **Command:** `node --test tests/company-intelligence.unit.mjs`, `node scripts/selftest.mjs` and the named Playwright command. **Exit Codes:** 0, 0 and 0. Every declaration having a reader is asserted against the target route source rather than assumed, by the unit row `every declared ownerSubjectParam is the single shared parameter name and no second convention exists` and by the selftest assertion reporting `every declaration has a reader`. The two rendering surfaces are compared for string equality inside row 3.10, which reads the table cell and the dimension card and asserts the trimmed text is identical. No route file, `tools.json` entry or `rlnav` registration was edited. **Claim Source:** executed.
- [x] Independent canary suite for shared fixture/bootstrap contracts passes before broad suite reruns: row 3.12 is run and green before the browser suite is run in full.
      **Executed:** YES. **Command:** `node scripts/selftest.mjs`, run before either Playwright command in this session. **Exit Code:** 0. Output: `Research-Lab self-test: 3155 passed, 0 failed`, with the canary line reporting 3154 assertions already green at that point. **Claim Source:** executed.
- [x] Rollback or restore path for shared infrastructure changes is documented and verified: `git diff --numstat scripts/selftest.mjs` reports zero deleted lines, and the registry delta is a set of optional additive fields whose removal restores the prior schema exactly.
      **Executed:** YES. **Command:** `git diff --numstat scripts/selftest.mjs`. **Exit Code:** 0. Output: `113	0	scripts/selftest.mjs` — 113 added, zero deleted, so the append reverts cleanly. The registry delta is `9	0	company-intelligence.config.json`: nine added lines and no deleted line, each an optional field on an existing row, so removing them restores the prior document byte for byte. **Claim Source:** executed.
- [x] Change Boundary is respected and zero excluded file families were changed, evaluated as a scope-scoped predicate rather than a whole-tree one. Three conjuncts, all required. (a) `git status --porcelain` restricted by pathspec to this feature's declared surfaces, namely every entry of `workBoundary.allowedPaths` together with the enumerated Excluded families `specs/025-company-multi-horizon-intelligence-lab`, `specs/026-*`, `company-fundamentals-lab.html`, `technical-analysis-decision-lab.html`, `trend-dynamics-cycle-lab.html`, `market-brief.html`, `research-agenda-lab.html`, `tools.json`, `index.html`, `rlnav.js`, `site-exclusions.json` and `scripts/build-pages-site.mjs`, names only paths inside `workBoundary.allowedPaths`. (b) `git status --porcelain specs/025-company-multi-horizon-intelligence-lab` prints nothing, so Feature 025's spec artifacts stay byte-unchanged as FR-027-034 requires. (c) `git --no-pager diff` restricted to the lifetime-tax family (`rltax*.js`, `lifetime-tax-*`, `tax-rules`, `specs/021-*`, `specs/022-*`, `specs/023-*`, `specs/024-*`) contains zero occurrences of `linkedSubject`, `SUBJECT_PARAM`, `SUBJECT_PATTERN`, `ownerSubjectParam`, `ownerBareReason`, `FEATURE-027` or `027-company-scoped`, so no line standing in that family was authored by this feature.
      **Verification (this session, `bubbles.implement`). All three conjuncts hold, so the item is ticked.** **Executed:** YES. **Phase:** implement. **Conjunct (a). Command:** `git status --porcelain --` followed by all twenty-one `workBoundary.allowedPaths` entries and the twelve enumerated Excluded families. **Exit Code:** 0. Output, six lines and nothing else: ` M scripts/selftest.mjs`, ` M specs/027-company-scoped-owner-deep-links/report.md`, ` M specs/027-company-scoped-owner-deep-links/scopes.md`, ` M specs/027-company-scoped-owner-deep-links/state.json`, ` M tests/options-flow-feed-lab.spec.mjs`, ` M tests/volatility-sizing-lab.spec.mjs` — all inside `workBoundary.allowedPaths`, no Excluded family named. **Falsifiability proved by mutation, not argued:** `site-exclusions.json` was clean at sha256 `f3c437749395f2549166ded7a55942aa611670bb4d8262bc2e7e57efa79e1260`; one appended newline made the same restricted command print ` M site-exclusions.json`, falsifying the conjunct; `git checkout --` restored it and the digest re-read identical (`RESTORE_VERIFIED=yes`). Nothing was left mutated. **Conjunct (b). Command:** `git status --porcelain specs/025-company-multi-horizon-intelligence-lab`. **Exit Code:** 0. Output: nothing. Feature 025's artifacts remain byte-unchanged. **Conjunct (c). Command:** `git --no-pager diff -- 'rltax*.js' 'lifetime-tax-*' 'tax-rules' 'specs/021-*' 'specs/022-*' 'specs/023-*' 'specs/024-*' | grep -cE 'linkedSubject|SUBJECT_PARAM|SUBJECT_PATTERN|ownerSubjectParam|ownerBareReason|FEATURE-027|027-company-scoped'`. **Exit Code:** 1 (grep's no-match code), printed count `0`. Not vacuous: the same pathspec under `--name-only` names `rltaxrental.js`, carrying a live thirteen-line diff from the concurrent session (a one-line `"mid-month"` → `"mid-month-probe"` probe in `conventionFraction`) with none of the seven tokens present. **Closing re-verification.** Re-run at the end of this pass, the same pathspec prints nothing: the concurrent session reverted its probe mid-pass, so the family is now clean and the conjunct holds over an empty diff. Both states are recorded; the conjunct was true in both. **Claim Source:** executed.
      **Planning correction (supersedes the prior wording, and supersedes the two records printed below it).** The previous first half ran a bare whole-tree `git status --porcelain` and required it to name nothing outside this scope's Allowed families. That predicate is unsatisfiable in this repository by construction rather than by any fault of this scope, because several other sessions concurrently write `specs/_bugs/BUG-009-*`, `briefs/`, `market-brief.owner-reads.json`, `notes/README.md`, two `scripts/` files and assorted untracked scratch paths that this feature can neither control nor clean. A boundary check whose truth value is owned by unrelated work measures nothing about this feature, so it is restated over the surfaces this feature actually declares. The prior second half is preserved verbatim as conjunct (b), because it was already scope-scoped and already passing. The lifetime-tax family is checked by authorship rather than by cleanliness, because a concurrent session is actively modifying `rltaxrules.js` and requiring that family to print nothing would re-create the very hostage this correction removes. The item is not weakened. Conjunct (a) fails the instant this feature dirties `tools.json`, `rlnav.js`, `specs/026-*` or any of the three disqualified owner routes, conjunct (b) fails the instant a Feature 025 artifact is opened, and conjunct (c) fails the instant a Feature 027 token appears anywhere in the lifetime-tax family. The Uncertainty Declaration and routing record printed below were written against the superseded whole-tree wording and are retained as history only. Verification has since been recorded and this item is ticked on that executed evidence.
      **Superseded record (whole-tree wording).** **Uncertainty Declaration.** The second half holds and the first half does not, so this item stays unticked. **Executed:** YES. **Command:** `git status --porcelain` and `git status --porcelain specs/025-company-multi-horizon-intelligence-lab`. **Exit Codes:** 0 and 0. `specs/025-...` prints nothing. The six paths this scope changed are all inside the Allowed file families: `rlcompanyintel.js`, `company-intelligence.config.json`, `company-intelligence-lab.html`, `tests/company-intelligence.unit.mjs`, `tests/company-intelligence-lab.spec.mjs` and the appended Feature 027 selftest group. The bare `git status --porcelain` output, however, also names pre-existing modifications from other in-flight work that this scope neither created nor touched, among them `briefs/`, `notes/README.md`, `market-brief.owner-reads.json`, `scripts/brief-narrative-parallel.mjs`, `scripts/build-attention-items.mjs`, `specs/022-*` and `specs/_bugs/BUG-009-*`. Read literally the item is false, and it is recorded as false rather than reinterpreted to fit the change actually made. **Closeout re-verification.** Re-run at closeout: `git status --porcelain specs/025-company-multi-horizon-intelligence-lab` still prints nothing, so the second half continues to hold; the whole-tree porcelain still names the same unrelated in-flight work, so the first half is still false. **Claim Source:** executed.
      **Re-examination and routing (this session).** **Executed:** YES. **Command:** `git status --porcelain specs/025-company-multi-horizon-intelligence-lab` and a whole-tree `git status --porcelain`. **Exit Codes:** 0, 0. The second half is re-confirmed in this session: `specs/025-…` prints nothing, so feature 025's artifacts remain untouched. The first half is still false for the same external reason — the whole-tree porcelain names other sessions' in-flight work. All six paths this scope changed have since landed as `0f63acb50` and this scope now carries nothing at all in the porcelain. **Routed to `bubbles.plan`** to be rewritten as a scope-scoped predicate rather than ticked. **Claim Source:** executed.
- [x] `bash .github/bubbles/scripts/artifact-lint.sh specs/027-company-scoped-owner-deep-links` exits 0.
      **Executed:** YES. **Command:** as written. **Exit Code:** 0. Output ends `Artifact lint PASSED.` **Claim Source:** executed.

**Tier 2 — Scope specific.**

- [x] `company-intelligence.config.json` declares exactly fifteen coverage registry rows after this scope, proven by a length assertion.
      **Executed:** YES. **Command:** `node --test tests/company-intelligence.unit.mjs` and `node scripts/selftest.mjs`. **Exit Codes:** 0 and 0. The unit row asserts `registry.rows.length === 15` with the message `the coverage registry declares fifteen rows`, and the selftest assertion reports `(15 rows, 4/7/4, misdeclared: none)`. **Claim Source:** executed.
- [x] Exactly four rows declare `ownerSubjectParam`, exactly seven declare `ownerBareReason`, and exactly four declare neither, proven by row 3.6.
      **Executed:** YES. **Command:** `node --test tests/company-intelligence.unit.mjs`. **Exit Code:** 0. Row 3.6 asserts the three counts, asserts they sum to the row count so the sets partition the registry exactly, and names both partitions: the carrying set is `dealer-gamma, options-flow, options-structure, volatility` and the ownerless set is `company-risk, financial-events, market-regime, non-financial-events`. **Claim Source:** executed.
- [x] Every row with an `ownerDeepLink` declares exactly one of the two fields, proven by an assertion that walks all fifteen rows.
      **Executed:** YES. **Command:** `node --test tests/company-intelligence.unit.mjs` and `node scripts/selftest.mjs`. **Exit Codes:** 0 and 0. Row 3.6 iterates `registry.rows` and asserts, per row, that the count of declared owner fields equals 1 for a linked row and 0 for an ownerless one; the selftest computes the same walk independently and reports `misdeclared: none`. **Claim Source:** executed.
- [x] `ownerBareReason` is a closed enum of exactly `market-scoped` and `fixed-subject`, proven by row 3.3 asserting a third value is refused.
      **Executed:** YES. **Command:** `node --test tests/company-intelligence.unit.mjs` and `node scripts/selftest.mjs`. **Exit Codes:** 0 and 0. Row 3.3 refuses eight non-members — `company-scoped`, `MARKET-SCOPED`, `market scoped`, `other`, `fixed_subject`, `42`, `true` and `{}` — each with `C025-CONFIG-SCHEMA` and the message `outside the closed enum`, and its counter-case admits both members. The selftest reports `(2/2 admitted, 5/5 refused)`. **Claim Source:** executed.
- [x] Each of the three new schema checks raises `C025-CONFIG-SCHEMA` naming the offending dimension id, proven by rows 3.1 through 3.3.
      **Executed:** YES. **Command:** `node --test tests/company-intelligence.unit.mjs` and `node scripts/selftest.mjs`. **Exit Codes:** 0 and 0. Each row asserts the code AND that `error.record.detail` matches `dimension: <id>` — `performance` for the neither case, `volatility` for the both case, `performance` for the invalid-enum case and `company-risk` for the reason-without-a-route case. The selftest re-checks all four independently and reports `all four refused`. **Claim Source:** executed.
- [x] `describeDimensionOwner` keeps the `company-dimension-owner/v1` contract version and its existing field set, proven by a key-set equality assertion.
      **Executed:** YES. **Command:** `node --test tests/company-intelligence.unit.mjs` and `node scripts/selftest.mjs`. **Exit Codes:** 0 and 0. Row 3.5 asserts `contractVersion === 'company-dimension-owner/v1'` and `assert.deepEqual(Object.keys(described).sort(), ['carriesSubject','contractVersion','dimensionId','hasOwner','ownerDeepLink','ownerToolId','statement'])`. The selftest asserts the same seven-key join and reports it in its message. The new `ownerBareReason` is a registry-row field only and is deliberately not added to the published owner contract. **Claim Source:** executed.
- [x] The two statement texts are distinguishable, proven by an assertion that the `market-scoped` and `fixed-subject` statements are not equal and that each names its own reason.
      **Executed:** YES. **Command:** `node --test tests/company-intelligence.unit.mjs`. **Exit Code:** 0. Row 3.5 asserts `assert.notEqual(marketStatement, fixedStatement)` and then asserts each statement does NOT carry the other's phrase, so the two cannot converge on one sentence that happens to contain both. The market-scoped statement reads `… which answers a market-wide question rather than a company one, so the link carries no company.` and the fixed-subject one reads `… which does not model an individual company you can choose, so the link opens on that tool's own subject.` **Claim Source:** executed.
- [x] The statement renders beside the link on both the coverage table and the dimension card, proven by row 3.10 asserting it on both surfaces.
      **Executed:** YES. **Command:** the named Playwright command. **Exit Code:** 0. Row 3.10 asserts, for each of the seven bare rows, that the coverage row still holds exactly one `a[data-owner-link]` AND exactly one `[data-owner-bare-reason]` carrying that row's reason phrase; it then repeats the check on the dimension card and asserts the trimmed text of the two surfaces is identical. It also asserts that a subject-carrying row renders no bare reason at all, so the statement is not shown where the link already carries the company. **Claim Source:** executed.
- [x] `rlcompanyintel.js::ownerRouteFor` and `SAFE_OWNER_ROUTE` are unchanged by this scope, proven by a diff that shows no edit in either region.
      **Executed:** YES. **Command:** `git diff -U0 rlcompanyintel.js | grep -E '^@@|^[-+](var SAFE_OWNER_ROUTE|.*ownerRouteFor)'`. **Exit Code:** 0. Output is four hunk headers and no content line: `@@ -96,0 +97,6 @@`, `@@ -324,0 +331,19 @@`, `@@ -330,0 +356 @@`, `@@ -512,5 +538,17 @@`. `SAFE_OWNER_ROUTE` is declared at old line 90 and `ownerRouteFor` spans old lines 468 to 483, so no hunk reaches either region, and the grep matched no added or removed line naming either symbol. The selftest independently asserts the `SAFE_OWNER_ROUTE` literal is byte-identical and that `ownerRouteFor`'s body contains no `ownerBareReason` reference. **Claim Source:** executed.
- [x] The adversarial row 3.8 is recorded with one real failing run under the mutation and one real passing run with the guard restored, and the mutation is reverted before the scope closes.
      **Executed:** YES. **Command:** `node --test tests/company-intelligence.unit.mjs`, run twice. **Exit Codes:** 1 under the mutation and 0 with the guard restored. Under the disabled exactly-one-of rule the run reported `ℹ pass 80`, `ℹ fail 3`, and the failing list named both `a row with an ownerDeepLink declaring neither ownerSubjectParam nor ownerBareReason raises C025-CONFIG-SCHEMA naming its dimension id` and `a row declaring both ownerSubjectParam and ownerBareReason raises C025-CONFIG-SCHEMA naming its dimension id`, which is what row 3.8 requires. The mutation was then reverted and verified gone — `grep -c 'MUTATION UNDER TEST' rlcompanyintel.js` returned `0` — and the suite returned `ℹ pass 83`, `ℹ fail 0`. **Claim Source:** executed.
- [x] No file under `specs/025-company-multi-horizon-intelligence-lab/` is modified, proven by `git status --porcelain specs/025-company-multi-horizon-intelligence-lab` printing nothing.
      **Executed:** YES. **Command:** as written. **Exit Code:** 0. Output: empty. That feature's suites were still re-run in full because it consumes this registry: `46 passed (1.2m)` against 43 before, and `bash .github/bubbles/scripts/artifact-lint.sh specs/025-company-multi-horizon-intelligence-lab` exits 0. **Claim Source:** executed.
- [x] The sending route loads and operates from a plain `file://` open with no bundler and no ES module syntax.
      **Executed:** YES. **Command:** the named Playwright command, plus a source check on `company-intelligence-lab.html`. **Exit Codes:** 0 and 0. The browser row `the route reaches its first paint from a file:// origin with no server and no off-origin request` is green in that run. The source check reports `import_stmt=false export_stmt=false type_module=false arrow_in_inline=false`, so the seventeen lines this scope added introduced no ES module syntax, no arrow function into the inline ES5 script and no bundler. The registry the route paints its first view from is the embedded copy, which the selftest asserts still equals the committed file after the new declarations. **Claim Source:** executed.

**Scenario fidelity (Gate G068).** The three items below restate what this scope's Gherkin scenarios assert, taken from [spec.md](spec.md) rather than from what was delivered. They shipped UNCHECKED and were ticked by the `bubbles.implement` pass that recorded executed evidence against each one; all three below now carry that evidence.

- [x] SCN-027-014 — For a dimension whose owner route answers a market-wide question, the rendered owner link carries no company, and the row states that the owner is market-scoped rather than company-scoped. A bare link with no stated scope does not satisfy this: the reason must be rendered beside the link, not merely recorded in the registry. **Proof:** Test Plan row 3.4 (`a market-scoped row composes a bare href and its statement says the owner answers a market-wide question`) under `node --test tests/company-intelligence.unit.mjs`, and row 3.10 (`Regression: SCN-027-014 every bare owner row renders its stated reason beside the link on both the coverage table and the dimension card`) under `npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`.
      **Executed:** YES, and the two halves are carried by different commands because the registry half cannot testify to what is rendered. **Commands:** (1) `node --test tests/company-intelligence.unit.mjs`. **Exit Code:** 0 — `tests 90, pass 90, fail 0, skipped 0`, carrying row 3.4 as `✔ a market-scoped row composes a bare href and its statement says the owner answers a market-wide question (0.080917ms)`. (2) `npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --workers=1 --reporter=list`. **Exit Code:** 0 — `35 passed (46.6s)`, carrying row 3.10 as `✓ 34 … tests/company-intelligence-lab.spec.mjs:1372:1 › Regression: SCN-027-014 every bare owner row renders its stated reason beside the link on both the coverage table and the dim…`. Row 3.10 is the row that discharges the "rendered beside the link, not merely recorded in the registry" clause, and it observes both surfaces — the coverage table and the dimension card — for every bare row rather than one sampled row. **Claim Source:** executed.
- [x] SCN-027-016 — Where a registry row declares a subject parameter and the route it names does not read that parameter, the condition is reported as a defect and is not allowed to ship as a working deep link. **Difference flagged rather than absorbed:** the shipped `C025-CONFIG-SCHEMA` rule decides declaration SHAPE — exactly one of `ownerSubjectParam` or `ownerBareReason`, with neither or both raising the error — which is not the same thing as detecting a declaration whose named route has no reader, and that reader-existence half is what this scenario asserts. Rows 3.1 through 3.3 therefore do not discharge this item on their own. **Proof:** Test Plan rows 3.1, 3.2 and 3.3 under `node --test tests/company-intelligence.unit.mjs` for the shape half, plus a reader-existence observation for the other half — every route file named by a row that declares `ownerSubjectParam` reads the shared parameter through `RLTKR.linkedSubject`, checked by `grep -l 'RLTKR.linkedSubject'` over exactly those four route files and returning all four.
      **Executed:** YES, both halves, by two commands — the shape half does not stand in for the reader half. **Commands:** (1) `node --test tests/company-intelligence.unit.mjs`. **Exit Code:** 0 — `tests 90, pass 90, fail 0, skipped 0`, carrying row 3.1 as `✔ a row with an ownerDeepLink declaring neither ownerSubjectParam nor ownerBareReason raises C025-CONFIG-SCHEMA naming its dimension id (0.13375ms)`, row 3.2 as `✔ a row declaring both ownerSubjectParam and ownerBareReason raises C025-CONFIG-SCHEMA naming its dimension id (0.085125ms)`, and row 3.3 as `✔ an ownerBareReason outside the closed enum, and an ownerBareReason on a row with no ownerDeepLink, each raise C025-CONFIG-SCHEMA (0.2015ms)`. The adjacent `✔ an ownerSubjectParam on a row with no ownerDeepLink raises C025-CONFIG-SCHEMA naming its dimension id (0.267667ms)` is green in the same run. (2) The reader-existence half. The four route files were DERIVED, not chosen: `node -e` reading `company-intelligence.config.json` reports `registryLen 15`, `declaringRows 4` — `options-structure → options-structure-lab.html`, `dealer-gamma → gamma-trading-lab.html`, `options-flow → options-flow-feed-lab.html`, `volatility → volatility-sizing-lab.html`, each with `param= ticker`. Then `grep -l 'RLTKR.linkedSubject' options-structure-lab.html gamma-trading-lab.html options-flow-feed-lab.html volatility-sizing-lab.html`. **Exit Code:** 0. Output: the four filenames, `count=4`. Every row that declares a subject parameter names a route that actually reads it, so the condition this scenario forbids — a declared parameter with no reader shipping as a working deep link — does not exist in the shipped registry. **Claim Source:** executed.
- [x] SCN-027-018 — Given every owner route that can resolve a company reads the shared subject parameter, and every row for those routes declares the shared parameter name, the upstream acceptance item about linking to an owner for the same company — spec 025's finding `VAL-025-F4` and its thirteenth Automation Readiness row — can be exercised end to end for those dimensions, and every dimension that remains bare carries a stated reason rather than a silent gap. Re-reading that upstream item is a read-only observation on spec 025's artifacts, which this feature does not modify. **Proof:** Test Plan row 3.9 (`Regression: SCN-027-018 every subject-carrying owner link opens its owner route on the company being read`) for the end-to-end clause, row 3.10 for the stated-reason clause on every bare row, and row 3.6 (`the shipped registry declares four subject-carrying rows, seven bare rows with a reason and four ownerless rows, and no market-scoped row carries a subject parameter`) for the accounting that leaves no row with neither a subject parameter nor a stated reason.
      **Executed:** YES. **Commands:** (1) `npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --workers=1 --reporter=list`. **Exit Code:** 0 — `35 passed (46.6s)`, carrying row 3.9 as `✓ 33 … tests/company-intelligence-lab.spec.mjs:1333:1 › Regression: SCN-027-018 every subject-carrying owner link opens its owner route on the company being read (715ms)` and row 3.10 as `✓ 34 … :1372:1 › Regression: SCN-027-014 every bare owner row renders its stated reason beside the link on both the coverage table and the dim…`. (2) `node --test tests/company-intelligence.unit.mjs`. **Exit Code:** 0 — `tests 90, pass 90, fail 0`, carrying row 3.6 as `✔ the shipped registry declares four subject-carrying rows, seven bare rows with a reason and four ownerless rows, and no market-scoped row carries a subject parameter (0.096083ms)`. That accounting closes over the registry: 4 + 7 + 4 = 15, and an independent `node -e` read of `company-intelligence.config.json` in this run reports `registryLen 15` with `declaringRows 4`, so no row is left holding neither a subject parameter nor a stated reason. (3) The upstream re-read, performed as a READ ONLY: `grep -rn "VAL-025-F4" specs/025-company-multi-horizon-intelligence-lab/`. **Exit Code:** 0. Output names `specs/025-company-multi-horizon-intelligence-lab/report.md:4638: **VAL-025-F4 — the owner deep link does not carry the company. New, product defect, routed.**` — the upstream item this scenario refers to exists and is the one described. Nothing under `specs/025-*` was written in this pass. **Claim Source:** executed.

---

## Open Questions For The Operator

Neither blocks implementation of Scope 1.

1. **Should `options-flow-feed-lab.html` be adopted by an owning feature before
   Scope 2 lands?** It has no originating spec. FR-027-015's captured baseline is
   this plan's engineering control and is sufficient as engineering. Whether it
   is sufficient as *governance* — who signs off a regression on a route no
   feature owns — is an ownership decision. Scope 2 proceeds either way; only the
   sign-off path differs.
2. **Confirm PRE-2.** This plan resolves `design.md` Open Question 2 by landing
   the two working-tree readers inside Scope 1. If the operator instead intends
   those readers to be reverted or reshaped by the concurrent session, Scope 1's
   corpus-equivalence row 1.6 loses its comparison target and must be replaced by
   the containment property alone, and FR-027-003 becomes a forward commitment
   rather than a preservation obligation. Everything else in this plan is
   unaffected.
