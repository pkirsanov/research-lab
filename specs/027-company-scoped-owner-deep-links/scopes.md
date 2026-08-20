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
| 1 | The shared subject-handoff rule and the two precedent routes | `rlticker.js`, `options-structure-lab.html`, `gamma-trading-lab.html`, `scripts/selftest.mjs`, two new specs, two notes | Selftest pure-rule corpus, containment property, single-definition assertion; two new Playwright specs | 24 items | In Progress — 20 of 24 evidenced |
| 2 | The two catalog-bound receiving routes | `volatility-sizing-lab.html`, `options-flow-feed-lab.html`, two specs, two notes | Extended volatility spec, new options-flow spec, captured pre-change baseline | 26 items | In Progress — 22 of 26 evidenced |
| 3 | The registry, the declarations and the stated bare reasons | `company-intelligence.config.json`, `rlcompanyintel.js`, `company-intelligence-lab.html`, two tests, one note | Unit schema and statement tests, browser end-to-end handoff test | 23 items | In Progress — 22 of 23 evidenced |

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

| Field | Value |
| --- | --- |
| Status | In Progress — implemented and verified; 20 of 24 DoD items ticked with executed evidence, 4 carry Uncertainty Declarations |
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
- [ ] Change Boundary is respected and zero excluded file families were changed: `git status --porcelain` names no path outside this scope's Allowed file families.
      **Uncertainty Declaration.** Every path this scope changed is inside its Allowed file families — `rlticker.js`, `options-structure-lab.html`, `gamma-trading-lab.html`, `scripts/selftest.mjs`, `notes/options-structure-lab.md`, `notes/gamma-trading-lab.md`, `tests/options-structure-lab.spec.mjs`, `tests/gamma-trading-lab.spec.mjs` — and each is inside `workBoundary.allowedPaths`. The bare command nevertheless also names paths this scope never touched, which were already dirty when the session began: `briefs/history-current.json`, `briefs/history/recommendations/2026-08.jsonl`, `market-brief.owner-reads.json`, `notes/README.md`, `scripts/brief-narrative-parallel.mjs`, `scripts/build-attention-items.mjs`, `specs/_bugs/BUG-009-…/scopes.md`, plus assorted untracked scratch files. Their modification times run from `2026-08-19T11:13:41` to `2026-08-20T00:18:17`, all earlier than this feature's own `createdAt` of `2026-08-20T06:04:32Z`, and none of them contains `linkedSubject`, `SUBJECT_PARAM`, `SUBJECT_PATTERN` or `027-company-scoped`. They are unrelated in-flight work from another effort. Because the literal predicate as written is false, this item stays unticked rather than being reinterpreted. **Executed:** YES. **Exit Code:** 0. **Closeout re-verification.** Re-run at closeout: `git status --porcelain` still names unrelated in-flight paths this scope never opened — `briefs/history-current.json`, `briefs/history/recommendations/2026-08.jsonl`, `market-brief.owner-reads.json`, `notes/README.md`, `scripts/brief-narrative-parallel.mjs`, `scripts/build-attention-items.mjs` and five `specs/_bugs/BUG-009-…` files — so the predicate is still false for the same reason and the item stays unticked. **Claim Source:** executed.
- [x] `bash .github/bubbles/scripts/artifact-lint.sh specs/027-company-scoped-owner-deep-links` exits 0.
      **Executed:** YES. **Command:** as written. **Exit Code:** 0 (`ARTIFACT_LINT_EXIT=0`), `Artifact lint PASSED.` **Claim Source:** executed.

**Tier 2 — Scope specific.**

- [ ] `rlticker.js` exports `SUBJECT_PARAM` with the value `ticker` and `SUBJECT_PATTERN` matching `/^[A-Z0-9.\-]{1,12}$/`, both on the frozen `RLTKR` object, proven by an assertion that reads them.
      **Uncertainty Declaration.** The export claim is proven and the word *frozen* is false of the module, so this item stays unticked. **Executed:** YES. **Command:** `node scripts/selftest.mjs`. **Exit Code:** 1 (this assertion green). The assertion loads the real UMD module and reads the real export object: `✓ Feature 027: rlticker.js exports SUBJECT_PARAM "ticker", SUBJECT_PATTERN /^[A-Z0-9.\-]{1,12}$/ and linkedSubject on RLTKR`. However `RLTKR` is not a frozen object in this repository and was not one before this scope: `grep -n 'freeze' rlticker.js` shows the module's `freeze` helper is applied only to the object `tickerContext` returns (line 127), never to `root.RLTKR`. The planning text describing `RLTKR` as frozen mis-describes the pre-existing module. Making it frozen is a change to a shared export's contract that this scope's Change Boundary does not authorise, so the wording is routed to `bubbles.plan` rather than the module being altered to match it. **Closeout re-verification.** Re-run at closeout: the selftest now exits 0 and this assertion is still green, so the export half remains proven; `RLTKR` is still not frozen, so the item is still false as written and stays unticked. **Claim Source:** executed.
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
- [ ] Each of the four adversarial rows 1.7 through 1.10 is recorded with one real failing run under the mutation and one real passing run with the guard restored, and every mutation is reverted before the scope closes.
      **Uncertainty Declaration.** The four guards are implemented as in-memory mutants inside the selftest group rather than as source edits, so each is exercised and discarded within a single run and no mutation can survive on disk — the reversion half is satisfied by construction. What is *not* satisfied is the literal shape this item asks for: there is no separate suite run per guard that exits non-zero. All four assertions are green with real counts (12 corpus values slip a permissive pattern; 13 refused values escape a leaked `raw`; a receiver narrowed to reject a one-character subject refuses sender-valid `["S"]`; a restored private rule raises the definition count from 0 to 1), and the scope as a whole does carry one real failing run and one real passing run of both commands, recorded as the RED and GREEN stages in [report.md](report.md). Because that is a whole-implementation pair rather than four per-guard pairs, this item stays unticked. Row 1.9 additionally carries a correction against `design.md` adversarial obligation 4, recorded in [report.md](report.md). **Executed:** YES. **Command:** `node scripts/selftest.mjs`. **Exit Code:** 1 (all four assertions green). **Closeout re-verification.** Re-run at closeout: the selftest now exits 0 and all four adversarial assertions are still green, but the shape this item asks for is unchanged — the guards remain in-memory mutants exercised inside a single run, so there is still no separate suite run per guard that exits non-zero, and the item stays unticked. **Claim Source:** executed.
- [x] `grep -c 'tickerFromQuery' options-structure-lab.html gamma-trading-lab.html` returns 0 for both files.
      **Executed:** YES. **Command:** as written. **Exit Code:** 1 (grep's no-match code). Output: `options-structure-lab.html:0` and `gamma-trading-lab.html:0`. **Claim Source:** executed.
- [x] Both precedent routes contain exactly one `#linkNotice` element, written with `textContent` and carrying `role="status"`, and it is `hidden` with empty text when no parameter is supplied.
      **Executed:** YES. **Command:** `grep -c 'id="linkNotice"'`, `grep -n 'id="linkNotice"'` and `grep -n "notice.textContent\|notice.innerHTML"`. **Exit Code:** 0. Exactly one per route (`options-structure-lab.html:1`, `gamma-trading-lab.html:1`), each declared `<p id="linkNotice" role="status" hidden`. Every write in the notice path is `notice.textContent`; there is no `innerHTML` write anywhere in it. The hidden-and-empty state with no parameter was observed in a real browser on both routes and on both origins: `noticeHidden=true notice=""`. **Claim Source:** executed.
- [x] Opening either precedent route with no query string produces a first paint identical to the pre-scope baseline, proven by rows 1.14 and 1.18.
      **Executed:** YES. **Command:** the two per-file Playwright commands. **Exit Codes:** 0 and 0. `Regression: SCN-027-006 no parameter, an empty parameter and a whitespace parameter render identical first paints` passes on both routes. The compared paint is the resolved ticker, provider, `nExp`, `sign`, the notice's presence, hidden state, role and text, and the full ordered id list of the control rail, so it is a structural identity rather than a sampled field. Corpus equivalence independently proves the accept-set is unchanged, and a direct browser open with no parameter yields the pre-existing default subject with zero page errors on both routes. **Claim Source:** executed.
- [x] `rlcompanyintel.js` is byte-unchanged by this scope, proven by `git status --porcelain rlcompanyintel.js` printing nothing.
      **Executed:** YES. **Command:** as written. **Exit Code:** 0. Output: nothing. **Claim Source:** executed.
- [ ] Both routes load and operate from a plain `file://` open with no bundler and no ES module syntax, proven by a recorded manual open plus the absence of any top-level `import` or `export` in the changed region.
      **Uncertainty Declaration.** The substance is proven and the stated method is not, so this item stays unticked. **Executed:** YES. **Command:** a real Chrome open of each route at a `file://` origin, three query cases each. **Exit Code:** 0 (`FILE_URL_EXIT=0`). Both routes load from `file://`, `RLTKR.linkedSubject` resolves, no parameter yields `ticker=SPY noticeHidden=true notice=""`, `?ticker=NVDA` yields `ticker=NVDA`, a refused value yields the default subject with the notice shown, and every case reports `pageerrors=0`. `grep -cE '^(import|export)[[:space:]]'` returns `0` for `rlticker.js`, `options-structure-lab.html` and `gamma-trading-lab.html`, so there is no top-level ES module syntax and no bundler. The open was driven headlessly rather than performed by a human, and this item says *manual*, so the human open remains outstanding and belongs with the human-acceptance items in [uservalidation.md](uservalidation.md). **Claim Source:** executed.
- [x] `notes/options-structure-lab.md` and `notes/gamma-trading-lab.md` each state the accepted parameter, the refusal behavior and that the accepted set is unchanged.
      **Executed:** YES. **Command:** `git diff --numstat notes/options-structure-lab.md notes/gamma-trading-lab.md`. **Exit Code:** 0. Output: `23 0` for each — a pure append with zero deleted lines. Each file gains a `## Linked subject (?ticker=)` section naming the accepted parameter `?ticker=`, the accept rule `/^[A-Z0-9.\-]{1,12}$/` after `normTicker`, the statement that the accept-set is the same one the route applied before the rule moved into `rlticker.js`, the refusal behavior (discarded, never stored, never echoed, never reaches a fetch target, notice names the subject actually shown), and the equivalence of no parameter, an empty parameter and a whitespace-only parameter. **Claim Source:** executed.

---

## Scope 2: The two catalog-bound receiving routes

**Scope-Kind:** runtime-behavior

| Field | Value |
| --- | --- |
| Status | In Progress — implemented and verified; 22 of 26 DoD items ticked with executed evidence, 4 carry Uncertainty Declarations and 2 findings are routed to `bubbles.plan` |
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
- [ ] Change Boundary is respected and zero excluded file families were changed: `git status --porcelain` names no path outside this scope's Allowed file families, and `git status --porcelain company-fundamentals-lab.html technical-analysis-decision-lab.html trend-dynamics-cycle-lab.html` prints nothing.
      **Uncertainty Declaration.** The second half is satisfied and the first half is not provable as written, so this item stays unticked. **Executed:** YES. **Command:** `git status --porcelain company-fundamentals-lab.html technical-analysis-decision-lab.html trend-dynamics-cycle-lab.html` and a whole-tree `git status --porcelain`. **Exit Code:** 0, 0. PROVEN: the three disqualified routes print nothing and are byte-unchanged. NOT PROVEN: the whole-tree porcelain is not confined to this scope's Allowed families, because it also lists unrelated pre-existing in-flight work this scope did not create — `briefs/`, `market-brief.owner-reads.json`, `notes/README.md`, `scripts/brief-narrative-parallel.mjs`, `scripts/build-attention-items.mjs`, `specs/023-*/report.md` — alongside Scope 1's own uncommitted files. What is proven is the narrower claim this scope owns: the complete set of paths it touched is the seven listed in [report.md](report.md), every one inside `workBoundary.allowedPaths`. **Closeout re-verification.** Re-run at closeout: `git status --porcelain company-fundamentals-lab.html technical-analysis-decision-lab.html trend-dynamics-cycle-lab.html` still prints nothing, so the second half continues to hold, while the whole-tree porcelain still names the same unrelated in-flight work, so the first half is still not provable as written. **Claim Source:** executed.
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
- [ ] `saveState()` on `options-flow-feed-lab.html` writes exactly `mode`, `side`, `min` and `dte` after a deep-linked visit, proven by reading `localStorage` in row 2.11.
      **Uncertainty Declaration.** The binding half is proven and the item's headline claim is false of the pre-existing module, so this stays unticked. **Executed:** YES. **Command:** the options-flow Playwright command, row 2.11. **Exit Code:** 0. PROVEN: after a deep-linked visit the persisted payload contains no linked subject, no storage key names it, and the payload carries no `subject`, `focus` or `ticker` member, while `side`, `min` and `dte` round-trip from saved state. NOT TRUE, and not true before this scope either: `saveState()` is `localStorage.setItem(LS, JSON.stringify(state))`, so it serialises the whole `state` object and has always written six keys. The pre-change baseline capture proves it — `{"mode":"simple","side":"both","min":0,"dte":"all","sortK":"score","sortDir":-1}`. Making the item literally true would change what this already-shipped route persists. Routed to `bubbles.plan` as finding S2-F1 in [report.md](report.md). **Closeout re-verification.** Re-read at closeout: `options-flow-feed-lab.html:422` is still `function saveState() { try { localStorage.setItem(LS, JSON.stringify(state)); } catch (e) { } }` and `state` at line 414 is still `{ mode, side, min, dte, sortK, sortDir }` — six keys, not four. The item is still false of the shipped route and stays unticked. **Claim Source:** executed.
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
- [ ] Both routes load and operate from a plain `file://` open with no bundler and no ES module syntax.
      **Uncertainty Declaration.** One route is proven and the other is not, so this stays unticked. **Executed:** YES. **Command:** a headless Chrome `file://` open of each route with and without a subject, plus `node scripts/selftest.mjs`, plus the same probe against an isolated `HEAD` worktree. **Exit Code:** 0, 0, 0. PROVEN: neither edited route introduced ES module syntax or an arrow function into its inline ES5 script (`both ES5`); there is no bundler and no build step; and `options-flow-feed-lab.html` fully loads and operates from `file://`, with `RLTKR` resolved, the focus band rendering its real text and zero page errors. NOT PROVEN: that `volatility-sizing-lab.html` *operates* from `file://`. Chrome blocks its `fetch("volatility-sizing-universe.json")` on a `file://` origin, so the route renders its existing configuration-unavailable banner and the handoff never runs — which is the planned failure interaction of one problem rather than two. This is pre-existing rather than a regression: the same probe against `HEAD` returns `{"head_configLoaded":false,"head_configErrorShown":true,"head_select":""}`, the same outcome as the working tree. The item asserts a property this route has never had, so it is not ticked on a `HEAD`-parity argument. **Claim Source:** executed.
- [x] `notes/volatility-sizing-lab.md` and `notes/options-flow-feed-lab.md` each state the accepted parameter, what resolution means on that route, and what the unavailable and refused states say.
      **Executed:** YES. **Command:** `git --no-pager diff -- notes/volatility-sizing-lab.md notes/options-flow-feed-lab.md`. **Exit Code:** 0. Each note gains a `## Linked subject (?ticker=)` section naming the parameter, the catalog the value resolves against, what a resolution does, and the exact unavailable and refused wording. The options-flow note additionally tabulates all four band outcomes and records why the resolved focus is held off `state`. **Claim Source:** executed.
- [x] Before this scope begins, `options-flow-feed-lab.html` was checked for concurrent modification by the `specs/026` session, and any collision was routed rather than resolved in place.
      **Executed:** YES. **Command:** `git status --porcelain options-flow-feed-lab.html`, `shasum -a 256`, `git show HEAD:options-flow-feed-lab.html | shasum -a 256`, `git log -1 -- options-flow-feed-lab.html`, and a reference scan of `specs/026-*`. **Exit Code:** 0. Before the scope: porcelain printed nothing and the worktree copy hashed `5b66a095b58e798686aefb407767dd118584a70694965b36b52d39a45b57dc98`, identical to `HEAD`, last touched by `cbc7cf7aa fix: close roadmap verification gaps` on 2026-08-02. After the scope: `HEAD` still hashes the same value and the last commit touching the file is still `cbc7cf7aa`. `specs/026-actionable-brief-brevity-and-cross-asset` holds only a `spec.md` that names the route in prose. No concurrent modification landed, so there was no collision to route. **Claim Source:** executed.
- [ ] `rlticker.js` is byte-unchanged by this scope, proven by `git status --porcelain rlticker.js` printing nothing.
      **Uncertainty Declaration.** The claim is true and the named proof is unusable, so this stays unticked. **Executed:** YES. **Command:** `git status --porcelain rlticker.js` and `git --no-pager diff --numstat -- rlticker.js`. **Exit Code:** 0, 0. This scope never opened `rlticker.js`. Its only diff is Scope 1's `+25 / -0` append, which is still uncommitted, so the porcelain prints ` M rlticker.js` and cannot print nothing until Scope 1 lands. The numstat reports exactly `25      0` — the same `+25 / -0` Scope 1 recorded in `state.json` — with zero deletions and no Scope 2 content. This is the same shape as Scope 1's own clean-tree declaration and resolves the moment Scope 1 is committed. **Closeout re-verification.** Re-run at closeout: `git status --porcelain rlticker.js` still prints ` M rlticker.js` because Scope 1's append is still uncommitted, so the named proof still cannot pass. The substantive claim is re-confirmed independently: `git diff --numstat -- rlticker.js` still reports exactly `25	0`, and of the 26 added lines zero match `catalog`, `UNIVERSE`, `ownerBareReason` or `focus`, so the file carries no Scope 2 or Scope 3 content. **Claim Source:** executed.


---

## Scope 3: The registry, the declarations and the stated bare reasons

**Scope-Kind:** runtime-behavior

| Field | Value |
| --- | --- |
| Status | In Progress — implemented and verified; 22 of 23 DoD items ticked with executed evidence, 1 carries an Uncertainty Declaration |
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
- [ ] Change Boundary is respected and zero excluded file families were changed: `git status --porcelain` names no path outside this scope's Allowed file families, and `git status --porcelain specs/025-company-multi-horizon-intelligence-lab` prints nothing.
      **Uncertainty Declaration.** The second half holds and the first half does not, so this item stays unticked. **Executed:** YES. **Command:** `git status --porcelain` and `git status --porcelain specs/025-company-multi-horizon-intelligence-lab`. **Exit Codes:** 0 and 0. `specs/025-...` prints nothing. The six paths this scope changed are all inside the Allowed file families: `rlcompanyintel.js`, `company-intelligence.config.json`, `company-intelligence-lab.html`, `tests/company-intelligence.unit.mjs`, `tests/company-intelligence-lab.spec.mjs` and the appended Feature 027 selftest group. The bare `git status --porcelain` output, however, also names pre-existing modifications from other in-flight work that this scope neither created nor touched, among them `briefs/`, `notes/README.md`, `market-brief.owner-reads.json`, `scripts/brief-narrative-parallel.mjs`, `scripts/build-attention-items.mjs`, `specs/022-*` and `specs/_bugs/BUG-009-*`. Read literally the item is false, and it is recorded as false rather than reinterpreted to fit the change actually made. **Closeout re-verification.** Re-run at closeout: `git status --porcelain specs/025-company-multi-horizon-intelligence-lab` still prints nothing, so the second half continues to hold; the whole-tree porcelain still names the same unrelated in-flight work, so the first half is still false. **Claim Source:** executed.
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
