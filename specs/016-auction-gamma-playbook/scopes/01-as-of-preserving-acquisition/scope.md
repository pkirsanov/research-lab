# Scope 01 — As-Of-Preserving Evidence Acquisition

**Status:** Not Started
**Depends On:** —
**Tags:** `foundation:true`
**Business scenarios owned:** BS-016-020, BS-016-027

---

## Objective

Make the published snapshot's own provenance survive acquisition.

`design.md` § Architecture Overview → *The third structural precondition this
design identifies* states that the snapshot as-of exists in the published file
and is discarded during parsing, and that until it survives, FR-016-021,
FR-016-022 and FR-016-023 have no input to operate on. This scope is that
precondition and nothing else: it preserves four fields on one acquisition path,
returns explicit `null` on the acquisition path that genuinely has none, and
stops the cache from filing a snapshot under a date the snapshot never claimed.

Verified on disk this pass: `grep -c 'asof' intraday-tape-lab.html` returns `0`,
so no as-of currently survives parsing. `RLDATA.putOptions(tk, optTodayKey(), snap)`
at line 1301 keys every snapshot by the current calendar date, which is the
substitution BS-016-020 forbids.

`rldata.js` `putOptions` (line 351) writes one global `sym -> day` slot, and
`design.md` § Implementation Boundary names three pages that write it. All three
were read this pass and all three key by the calendar date today:
`intraday-tape-lab.html` line 1301 `RLDATA.putOptions(tk, optTodayKey(), snap)`;
`gamma-trading-lab.html` line 1114 `try { RLDATA.putOptions(tk, optTodayKey(), slim); } catch (e) { }`
inside `mirrorSnap` (line 1112); and `swing-structure-lab.html` line 1289
`RLDATA.putOptions(tk, optTodayKey(), snap)` inside `computeOptLevels` (line 1271).
The three page universes share 13 tickers — `AAPL`, `AMD`, `AMZN`, `AVGO`, `DIA`,
`GOOGL`, `IWM`, `META`, `MSFT`, `NVDA`, `QQQ`, `SPY` and `TSLA` — counted this
pass from the `universe[].id` lists in `intraday-tape-universe.json` (18 entries),
`swing-structure-universe.json` (18) and `gamma-trading-universe.json` (22). A
re-key applied to one writer while the others keep `optTodayKey()` therefore lets
the next writer re-file the same ticker under the calendar date and undo the
repair, which is the warning `design.md` records on the `gamma-trading-lab.html`
row. This scope owns the as-of key on all three writers, and on the two sibling
pages it owns that one call argument and nothing beyond it.

This scope asserts no regime, resolves no cutoff and fuses nothing. It supplies
the field that every later honesty claim reads.

---

## Implementation Files

Every path below is an authorized edit target in `design.md` §
Implementation Boundary. The nested `### Implementation Files` heading is the
exact anchor `implementation-reality-scan.sh` parses (`/^### Implementation Files$/`),
so the table is placed under it rather than directly under the `##` section.

### Implementation Files

| Path | Boundary row | Nature of the edit in this scope |
|---|---|---|
| `intraday-tape-lab.html` | Host and sibling pages — extended, bounded, change **(1) As-of preservation** | `parsePagesChain` (lines 1305–1312) preserves `asof`, `fetched`, `refreshDate` and `refreshWindow`; `parseOptChain` (line 1280) returns explicit `null` for all four; the `RLDATA.putOptions` call site (line 1301) keys by the evidence's own as-of instead of `optTodayKey()`; `fetchOptionLevelsAny` (line 1315) records which source answered as `sourceKind` and reports the `options:gamma` resource through `RLAPP.report` |
| `gamma-trading-lab.html` | Host and sibling pages — extended, bounded, change **(2) As-of key** | **The as-of re-key seam and nothing beyond it.** The single reachable statement is line 1114, `try { RLDATA.putOptions(tk, optTodayKey(), slim); } catch (e) { }` inside `mirrorSnap` (line 1112): its day argument becomes the evidence's own as-of instead of `optTodayKey()`. The `slim` projection at line 1113 keeps its current field set and only its key changes; `optTodayKey` itself (line 1059) may be left in place or removed only if it becomes unreferenced. This scope's edit does not reach the inline gamma model — `bsmGamma` at line 1053 and the band at line 1074 — nor `computeGamma`, vanna, OVI, term structure, the dealer-flow projection or any other computation on the page; SCOPE-09 owns the single-source retirement under its own boundary. This page gains no lens, no tool read, no Journey anchor and no owner-state provider from this scope |
| `swing-structure-lab.html` | Host and sibling pages — extended, bounded, change **(2) As-of key** | **The as-of re-key seam and nothing beyond it.** The single reachable statement is line 1289, `RLDATA.putOptions(tk, optTodayKey(), snap)` inside `computeOptLevels` (line 1271): its day argument becomes the evidence's own as-of instead of `optTodayKey()`. `optTodayKey` itself (line 1269) may be left in place or removed only if it becomes unreferenced. `parseOptChain` (line 1268), `parsePagesChain` (line 1293), `fetchOptionLevels` (line 1291), `fetchOptionLevelsPages` and `fetchOptionLevelsAny` keep their current behaviour and their same-origin-first order. This scope's edit does not reach the inline gamma model — `bsmGamma` at line 1266, `gammaAt` at line 1282 and the band at line 1281 — nor `normOpt`, `tryOptions`, `loadUniverse`, the swing structure, MA stack, composite volume profile, pattern, accumulation/distribution or regime work, the rendering or the view modes. This page gains no lens, no tool read, no Journey anchor and no owner-state provider from this scope |
| `tests/auction-gamma-playbook.spec.mjs` | Tests and documentation — **NEW file created by this feature** | Created by this scope as the feature's `system-chrome` live-stack spec. This scope contributes the as-of survival and uncovered-ticker cases; later scopes extend the same file |
| `scripts/selftest.mjs` | Tests and documentation — extended, bounded | Gains the two assertion groups this scope's unit and stress rows name: `Feature 016 Scope 01 as-of-preserving evidence acquisition (intraday-tape-lab)` and `Feature 016 Scope 01 as-of-preserving evidence acquisition (shared options slot co-writers)`. **Limit:** per that boundary row the hard-asserted registry counts at lines 3547, 3551 and 3833–3838 are unchanged, because this scope registers no new tool, model or journey, and the existing groups are not rewritten |

Every one of the five paths above is an authorized edit target in `design.md` §
Implementation Boundary, and none of them appears in that section's
consumed-never-modified table. `rldata.js` is called through the existing
`putOptions` signature (line 351) and is never modified, so the three writers
change what they pass, not what the store does.

`fetchOptionLevelsAny` keeps its same-origin-first order on every page named
above. No other behaviour in any of these files changes here.

---

## Change Boundary

This scope is a repair on one argument, applied at three call sites. The whole of
what it owns on the two sibling pages is the day argument passed to
`RLDATA.putOptions` — `gamma-trading-lab.html` line 1114 and
`swing-structure-lab.html` line 1289 — plus the same argument and the four
preserved fields on the host page. Those three pages carry 134,773, 112,612 and
125,533 bytes of whole tool between them, and 10 `bsmGamma` occurrences that a
different scope owns, so the boundary below is what keeps a three-site argument
repair from becoming a behavioural edit to three complete tools.

**Allowed file families**

| Family | Concrete path | What may change inside it |
|---|---|---|
| Host page — as-of preservation and the one re-key | `intraday-tape-lab.html` | `parsePagesChain` (lines 1305–1312) widens its return to carry `asof`, `fetched`, `refreshDate` and `refreshWindow` verbatim; `parseOptChain` (line 1280) returns those four keys present-and-`null`; the `putOptions` day argument at line 1301 becomes the evidence's own as-of instead of `optTodayKey()`; `fetchOptionLevelsAny` (line 1315) records `sourceKind` and reports `options:gamma` through `RLAPP.report`. No other page function changes behaviour |
| Co-writer seam — one day argument | `gamma-trading-lab.html` | The day argument of `RLDATA.putOptions(tk, optTodayKey(), slim)` at line 1114, inside `mirrorSnap` (line 1112). The `slim` projection at line 1113 keeps its current field set; `optTodayKey` (line 1059) may be left in place or removed only if it becomes unreferenced. Nothing else on the page changes |
| Co-writer seam — one day argument | `swing-structure-lab.html` | The day argument of `RLDATA.putOptions(tk, optTodayKey(), snap)` at line 1289, inside `computeOptLevels` (line 1271). `optTodayKey` (line 1269) may be left in place or removed only if it becomes unreferenced. Nothing else on the page changes |
| Assertion surface | `scripts/selftest.mjs` | The two groups this scope's rows name — `Feature 016 Scope 01 as-of-preserving evidence acquisition (intraday-tape-lab)` and `Feature 016 Scope 01 as-of-preserving evidence acquisition (shared options slot co-writers)`. The hard-asserted registry counts at lines 3547, 3551 and 3833–3838 are unchanged and no existing group is rewritten |
| Feature live-stack spec | `tests/auction-gamma-playbook.spec.mjs` | Created here as the feature's `system-chrome` spec, carrying this scope's as-of survival, uncovered-ticker and persistent regression cases |

**Excluded surfaces** — a diff reaching any row below is a boundary breach rather
than an in-scope change:

| Excluded surface | Why it is excluded here |
|---|---|
| `intraday-tape-lab.html` gamma model — `function bsmGamma` (line 1278), `gammaAt` (line 1294) and the `spot * 0.9 … spot * 1.1` band with `N = 60` (line 1293) | The page's 2 `bsmGamma` occurrences. Line 1294 and its band arrive through SCOPE-06's declared delegation of `computeOptLevels`; the standalone definition at line 1278 is retired by SCOPE-09. Both stay byte-identical through this scope, so the re-key at line 1301 and the single-source seams never collide |
| `gamma-trading-lab.html` gamma model — `function bsmGamma` (line 1053), the by-strike call sites (lines 1068 and 1069), `gammaAt` (line 1075) with its band (line 1074) and the two second-expiry call sites (lines 1097 and 1098) | All 6 of this page's `bsmGamma` occurrences. SCOPE-09 owns their retirement under its own boundary. This scope reaches line 1114 and nothing else on the page |
| `gamma-trading-lab.html` vanna, charm, OVI, term-structure and dealer-flow work, and `computeGamma` | None of it is an as-of key. It keeps its current shape and values through this scope |
| `swing-structure-lab.html` gamma model — `function bsmGamma` (line 1266), the `gCoef` / `spot * 0.9 … spot * 1.1` / `N = 60` band (line 1281), `gammaAt` (line 1282), `netGEX` (line 1283) and the `r = 0.045, q = 0` literal (line 1273) | Both of this page's `bsmGamma` occurrences and the band between them. `design.md` declares two bounded changes on this page: this scope owns change **(2) As-of key** at line 1289, and SCOPE-09 owns change **(1) Single source**, so the two declared changes have separate owners and separate seams |
| `swing-structure-lab.html` remaining acquisition path — `parseOptChain` (line 1268), `fetchOptionLevels` (line 1291), `parsePagesChain` (line 1293), `fetchOptionLevelsPages` (line 1301) and `fetchOptionLevelsAny` (line 1303) | They keep their current behaviour and their same-origin-first order. Only the day argument at line 1289 moves on this page |
| `swing-structure-lab.html` `normOpt` (line 1609), `tryOptions`, `loadUniverse`, the swing structure, MA stack, composite volume profile, pattern, accumulation/distribution and regime work, the rendering and the view modes | This page gains no lens, no tool read, no Journey anchor and no owner-state provider from this scope |
| `rldata.js` `putOptions` (line 351) and the status vocabulary (line 245) | Consumed-never-modified in `design.md` § Implementation Boundary. The three writers change what they pass, not what the store does, and `options:gamma` is reported through the vocabulary already fixed at line 245 |
| `intraday-tape-lab.html` `__rlOwnerStateProvider` (lines 1350–1351) and `normOpt` (line 1774) | SCOPE-06 owns the owner-state contract and what `normOpt` carries. This scope preserves the fields that later cross that boundary and moves the boundary itself not at all |
| `intraday-tape-lab.html` alias delegations `computeSession`, `adherence`, `ivMinutes`, `controlRead` and `sessionType` (lines 1471–1478) | Thin alias delegations into `RLMARKETSTRUCTURE`. The auction math is not what this scope repairs, and each keeps its alias shape |
| `intraday-tape-lab.html` `data-m` segment (lines 1070–1071) | Exactly two buttons today. This scope adds no mode and no button |
| `rlexperience-adapters/options.js` and `rlexperience-adapters/market-structure.js` | Neither appears in this scope's Implementation Files table. SCOPE-03 produces the gamma evidence record and SCOPE-06 repairs the qualifier; both modules stay byte-identical through this scope |
| `data/options/**` | Read only, which is NFR-016-006. TP-01-11 reads the published set and writes nothing back to it |
| `rldata.js`, `rlapp.js`, `rlchart.js`, `rlticker.js`, `rlg.js`, `rlnav.js` | Consumed-never-modified in `design.md` § Implementation Boundary. `RLAPP.report` is called through its existing signature |
| `tools.json`, `index.html`, `simple-models.json`, `journeys.json`, `tool-experience.config.json` | This scope registers nothing and declares nothing; no registered count moves |

---

## Gherkin Scenarios

### BS-016-020: A prior-session snapshot never renders as a current reading

```gherkin
Scenario: A user views a gamma-derived element sourced from a prior-session snapshot
  Given the gamma evidence is a prior-session open-interest snapshot with a stated as-of
  When the user views any gamma-derived element in the read
  Then the element displays its snapshot as-of
  And the element is labelled a convention-dependent estimate from prior-session open interest rather than measured dealer positioning
  And no gamma-derived element is displayed as a live intraday reading
```

### BS-016-027: A ticker outside the published snapshot set has no same-origin gamma evidence

```gherkin
Scenario: The user reads a ticker the published options snapshot set does not cover
  Given the published options snapshot set covers a bounded list of twenty-two tickers
  And the requested ticker is not in that list
  When the user requests the playbook read
  Then the read states that no same-origin gamma evidence exists for that ticker
  And the missing input and the reason are named
  And an auction-only reduced read is issued rather than a regime derived from a substituted source
  And no behavioural regime is asserted
```

---

## Implementation Plan

**1. Preserve the four snapshot fields through `parsePagesChain`.**
The same-origin published snapshot carries `asof`, `fetched`, `refreshDate` and
`refreshWindow`. The current return at line 1311 projects only
`{ spot, name, epoch, calls, puts }`. Widen that projection. The four fields are
carried verbatim; none is normalized, rounded or re-stamped.

**2. Return explicit `null`s from `parseOptChain`.**
The proxied live chain genuinely has none of the four. Per `design.md` §
Module Contracts, an omitted key and a known-absent value are different facts and
only the second can carry a reason, so `parseOptChain` returns `asof: null`,
`fetched: null`, `refreshDate: null`, `refreshWindow: null` rather than omitting
the keys.

**3. Key the options cache by the evidence's own as-of, on all three writers.**
`RLDATA.putOptions(tk, optTodayKey(), snap)` becomes keyed by the snapshot's
own as-of date. `putOptions` is called through its existing signature; `rldata.js`
is consumed and never modified. A snapshot whose as-of is absent is not filed
under a substituted date.

The same argument change is made at each of the three call sites that write the
single `sym -> day` slot: `intraday-tape-lab.html` line 1301,
`gamma-trading-lab.html` line 1114 inside `mirrorSnap`, and
`swing-structure-lab.html` line 1289 inside `computeOptLevels`. The three share
13 tickers including `SPY` and `QQQ`, so a writer still passing `optTodayKey()`
would re-file a re-keyed ticker under the calendar date and return the page to
the substitution BS-016-020 forbids. The two sibling pages receive this argument
change and nothing else — their gamma models, their remaining acquisition
functions and their rendering are unchanged by this scope.

**4. Record which acquisition path answered.**
`fetchOptionLevelsAny` keeps its same-origin-first order and records `sourceKind`
on the returned snapshot, which is Axis 1 of `design.md` § Variation axes: a
proxied read cannot supply an `asOf` and must be structurally visible as such
rather than averaged into the same shape as a published read.

**5. Report the uncovered-ticker case honestly.**
`data/options/index.json` declares `expected: 22, count: 22` and is read only. A
ticker outside that set yields no same-origin evidence. The page reports
`options:gamma` as `missing` through `RLAPP.report` using the existing vocabulary
fixed at `rldata.js` line 245, and supplies no substituted source. The resource
label carries the ticker so the shared data-status control identifies what is
behind the page.

**6. Hold the null-safe first paint.**
Every new numeric path guards through the page's `isNum` (line 1233), which tests
`typeof value === "number"` before the global `isFinite`. The global returns
`true` for `null`, so a bare global guard would let a `null` reach `.toFixed()`
and halt the first paint. Absent values render as an em dash.

**Boundary held.** The auction math is untouched. `computeSession`, `adherence`,
`controlRead` and `sessionType` keep their alias shape at lines 1471–1478. The
`data-m` segment at lines 1070–1071 keeps exactly two buttons. `data/options/**`
is read and never written, which is NFR-016-006.

---

## Test Plan

Every row runs one of the three real command surfaces named in `design.md` §
Testing Strategy. This scope touches two test paths only: `scripts/selftest.mjs`,
which already `require`s both owner modules through `createRequire`, and
`tests/auction-gamma-playbook.spec.mjs`, created here per the Implementation
Files table and discovered by the existing `testMatch: '**/*.spec.mjs'`.

**Adversarial fixture rule for this scope.** `grep -c 'asof' intraday-tape-lab.html`
returns `0` today, and all three writers of the single `rldata.js` `putOptions`
slot key every snapshot by the current calendar date —
`RLDATA.putOptions(tk, optTodayKey(), snap)` at `intraday-tape-lab.html` line 1301,
`RLDATA.putOptions(tk, optTodayKey(), slim)` at `gamma-trading-lab.html` line 1114,
and `RLDATA.putOptions(tk, optTodayKey(), snap)` at `swing-structure-lab.html`
line 1289. A fixture whose snapshot as-of equals the run date therefore passes
identically before and after the change on every one of them and proves nothing.
Every row marked **adversarial** below states a snapshot as-of that names a
**prior session**, so the assertion fails if the discarded-as-of parse or the
`optTodayKey()` keying returns at any writer.

| ID | Test Type | Category | File / Location | What it proves | Command | Live System |
|---|---|---|---|---|---|---|
| TP-01-01 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 01 as-of-preserving evidence acquisition (intraday-tape-lab)` | `parsePagesChain` carries `asof`, `fetched`, `refreshDate` and `refreshWindow` onto its return verbatim, none of them normalized, rounded or re-stamped | `node scripts/selftest.mjs` | No |
| TP-01-02 | Unit — adversarial | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 01 as-of-preserving evidence acquisition (intraday-tape-lab)` | Adversarial input: a published snapshot whose `asof` names a prior session while the run date is later. The parsed snapshot's as-of is that prior-session date and never the run date, so the assertion fails if the pre-change parse that drops `asof` returns | `node scripts/selftest.mjs` | No |
| TP-01-03 | Unit — adversarial | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 01 as-of-preserving evidence acquisition (intraday-tape-lab)` | Adversarial input: the same prior-session snapshot. The options cache key is the snapshot's own as-of, not `optTodayKey()`; under the line-1301 keying the key would be the run date, so the assertion fails if that keying returns. A snapshot carrying no as-of is filed under no substituted date at all | `node scripts/selftest.mjs` | No |
| TP-01-04 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 01 as-of-preserving evidence acquisition (intraday-tape-lab)` | `parseOptChain` returns `asof`, `fetched`, `refreshDate` and `refreshWindow` as present-and-`null` keys rather than omitting them, keeping a known-absent value distinguishable from an unasked question | `node scripts/selftest.mjs` | No |
| TP-01-05 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 01 as-of-preserving evidence acquisition (intraday-tape-lab)` | `fetchOptionLevelsAny` records `sourceKind` on the returned snapshot and preserves its same-origin-first order, so a proxied read that can supply no as-of stays structurally distinguishable from a published one | `node scripts/selftest.mjs` | No |
| TP-01-06 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 01 as-of-preserving evidence acquisition (intraday-tape-lab)` | A ticker outside the twenty-two-ticker set `data/options/index.json` declares yields no same-origin gamma evidence, and `options:gamma` is reported `missing` through the vocabulary fixed at `rldata.js` line 245 with the ticker carried on the resource label | `node scripts/selftest.mjs` | No |
| TP-01-07 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 01 as-of-preserving evidence acquisition (intraday-tape-lab)` | Every new numeric path guards through `isNum` (line 1233) before `.toFixed()`, so a `null` as-of or a `null` spot on an uncovered ticker renders an em dash and the first paint completes instead of throwing | `node scripts/selftest.mjs` | No |
| TP-01-08 | E2E UI — live stack | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `prior-session snapshot renders with its own as-of and an estimate label` | Asserted against the real page with no `page.route`, no `context.route` and no request interception of any kind: every gamma-derived element displays its snapshot as-of, is labelled a convention-dependent estimate from prior-session open interest, and none renders as a live intraday reading | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-01-09 | E2E UI — live stack | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `uncovered ticker issues a named auction-only reduced read` | Asserted against the real page with no `page.route`, no `context.route` and no request interception of any kind: a ticker outside the published set renders an auction-only reduced read naming the missing input and the reason, asserts no behavioural regime, substitutes no source, and leaves the first paint intact | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-01-10 | Regression E2E | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `Regression: BS-016-020 prior-session snapshot keeps its own as-of through parse and cache keying` | The persistent regression case for the two behaviours this scope changes, asserted on the real page with no `page.route`, no `context.route` and no request interception: a published snapshot whose `asof` names a prior session renders that prior-session date on every gamma-derived element, and the options cache entry for that ticker is filed under that same prior-session date. `grep -c 'asof' intraday-tape-lab.html` returns `0` today and `RLDATA.putOptions(tk, optTodayKey(), snap)` at line 1301 keys by the run date, so this case fails if either the as-of-dropping parse or the `optTodayKey()` keying is reintroduced | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: BS-016-020 prior-session snapshot keeps its own as-of through parse and cache keying" --reporter=list` | Yes |
| TP-01-11 | Stress | `stress` | `scripts/selftest.mjs` group `Feature 016 Scope 01 as-of-preserving evidence acquisition (intraday-tape-lab)` | The widened parse is driven over the entire published set `data/options/index.json` declares — 22 tickers, 39,190 contracts and 4.69 MB of snapshot JSON on disk, the largest single file `data/options/NDX.json` carrying 6,066 contracts — parsed back-to-back in one pass. Every parse returns all four provenance fields; the slowest single-ticker parse stays inside the 250 ms `performancePolicy.maxComputeMs` this page's owner seam feeds, declared at `simple-models.json` line 111; and the resulting cache-key set holds exactly one key per distinct snapshot as-of, so re-keying by as-of neither drops a ticker nor multiplies keys for one ticker under the full load | `node scripts/selftest.mjs` | No |
| TP-01-12 | Unit — adversarial | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 01 as-of-preserving evidence acquisition (shared options slot co-writers)` | Adversarial input: a shared-ticker snapshot whose `asof` names a prior session while the run date is later, written through the `gamma-trading-lab.html` co-writer seam. `mirrorSnap` (line 1112) files the shared options slot entry under that prior-session as-of; under the line-1114 `RLDATA.putOptions(tk, optTodayKey(), slim)` keying the key would be the run date, so the assertion fails if that keying returns. The `slim` projection at line 1113 keeps its current field set, and the page's inline gamma model is unread by this row | `node scripts/selftest.mjs` | No |
| TP-01-13 | Unit — adversarial | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 01 as-of-preserving evidence acquisition (shared options slot co-writers)` | Adversarial input: the same prior-session snapshot written through the `swing-structure-lab.html` co-writer seam. `computeOptLevels` (line 1271) files the shared options slot entry under that prior-session as-of; under the line-1289 `RLDATA.putOptions(tk, optTodayKey(), snap)` keying the key would be the run date, so the assertion fails if that keying returns. `parseOptChain`, `parsePagesChain`, `fetchOptionLevels`, `fetchOptionLevelsPages` and `fetchOptionLevelsAny` keep their current behaviour and their same-origin-first order | `node scripts/selftest.mjs` | No |
| TP-01-14 | Unit — adversarial | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 01 as-of-preserving evidence acquisition (shared options slot co-writers)` | Adversarial across the **full writer set**, so it fails if any single one of the three is left un-re-keyed. (a) A scan of all three committed pages `design.md` § Implementation Boundary names as writers of `rldata.js` `putOptions` (line 351) — `intraday-tape-lab.html`, `gamma-trading-lab.html` and `swing-structure-lab.html` — resolves `optTodayKey()` to zero occurrences as a `putOptions` day argument on any of them. (b) The three writer seams write `SPY`, one of the 13 tickers common to all three universes, in sequence from that one prior-session snapshot, after which the slot holds exactly one entry for `SPY` keyed by the snapshot's own as-of and no entry keyed by the run date. Today all three pass `optTodayKey()`, so this row fails now; leaving any one of the three un-re-keyed re-files `SPY` under the calendar date and fails part (b) even when the other two are correct | `node scripts/selftest.mjs` | No |

---

### Definition of Done

- [ ] `[TP-01-01]` `[BS-016-020]` `parsePagesChain` returns the published snapshot's `asof`, `fetched`, `refreshDate` and `refreshWindow` unchanged, so every gamma-derived element has a snapshot as-of available to display.
- [ ] `[TP-01-02]` `[BS-016-020]` Given a published snapshot whose stated as-of names a prior session and a later run date, the parsed snapshot's as-of is the prior-session date; the run date never appears in that slot.
- [ ] `[TP-01-03]` `[BS-016-020]` Given that same prior-session snapshot, the options cache entry is keyed by the snapshot's own as-of; `optTodayKey()` supplies no cache key, and a snapshot without an as-of is filed under no substituted date.
- [ ] `[TP-01-04]` `[BS-016-020]` `parseOptChain` returns all four provenance keys present and `null` for the proxied path, so an element sourced that way can state that it has no as-of rather than displaying one it never received.
- [ ] `[TP-01-05]` `[BS-016-020]` The snapshot returned by `fetchOptionLevelsAny` carries `sourceKind` identifying which acquisition path answered, and the same-origin-first order is unchanged.
- [ ] `[TP-01-06]` `[BS-016-027]` A ticker outside the twenty-two-ticker published set produces no same-origin gamma evidence and reports `options:gamma` as `missing`, with the ticker named on the resource label and no substituted source supplied.
- [ ] `[TP-01-07]` `[BS-016-027]` A `null` as-of or `null` spot arising from an uncovered ticker renders as an em dash through the `isNum` guard, and the first paint completes rather than halting.
- [ ] `[TP-01-08]` `[BS-016-020]` A user views a gamma-derived element sourced from a prior-session snapshot: on the live page, with no request interception, that element displays its snapshot as-of, is labelled a convention-dependent estimate from prior-session open interest rather than measured dealer positioning, and no gamma-derived element is presented as a live intraday reading.
- [ ] `[TP-01-09]` `[BS-016-027]` The user reads a ticker the published options snapshot set does not cover: on the live page, with no request interception, the read states that no same-origin gamma evidence exists for that ticker, names the missing input and the reason, and issues an auction-only reduced read that asserts no behavioural regime rather than a regime derived from a substituted source.
- [ ] `[TP-01-11]` `[BS-016-027]` Parsing all 22 published snapshots back-to-back returns four provenance fields on every one, keeps the slowest single-ticker parse inside the 250 ms budget declared at `simple-models.json` line 111, and yields exactly one cache key per distinct snapshot as-of.
- [ ] `[TP-01-12]` `[BS-016-020]` A prior-session snapshot written by the `gamma-trading-lab.html` co-writer keeps its own as-of in the shared options slot: `mirrorSnap`'s `RLDATA.putOptions` call at line 1114 files the entry under the snapshot's own as-of, `optTodayKey()` supplies no cache key from this page, and the `slim` projection at line 1113 keeps its current field set.
- [ ] `[TP-01-13]` `[BS-016-020]` A prior-session snapshot written by the `swing-structure-lab.html` co-writer keeps its own as-of in the shared options slot: the `RLDATA.putOptions` call at line 1289 inside `computeOptLevels` files the entry under the snapshot's own as-of, `optTodayKey()` supplies no cache key from this page, and the page's acquisition functions keep their current behaviour and their same-origin-first order.
- [ ] `[TP-01-14]` `[BS-016-020]` No co-writer can re-file a shared ticker under the calendar date and undo the repair: across all three writers of the single `rldata.js` `putOptions` slot, `optTodayKey()` appears as a `putOptions` day argument on none of them, and a sequenced write of `SPY` from one prior-session snapshot leaves exactly one slot entry keyed by that prior-session as-of and none keyed by the run date, so leaving any single writer un-re-keyed fails this item.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope are persistent and named — `[TP-01-10]` `tests/auction-gamma-playbook.spec.mjs` carries `Regression: BS-016-020 prior-session snapshot keeps its own as-of through parse and cache keying`, which asserts the rendered prior-session as-of and the as-of-keyed cache entry against the real page and fails if the as-of-dropping parse or the `optTodayKey()` keying at line 1301 returns.
- [ ] Broader E2E regression suite passes — the complete `node scripts/selftest.mjs` suite and the real-page Playwright regression spec that already drives this page, `tests/simple-model-adapters-market.spec.mjs` case `Regression: intraday tape Simple auction controls recompute from truthful snapshot evidence`, both run green once this scope lands, with every pre-existing selftest group and every previously registered regression case preserved and no decreased passing count.
- [ ] Change Boundary is respected and zero excluded file families were changed — the diff for this scope contains only `intraday-tape-lab.html`, `gamma-trading-lab.html`, `swing-structure-lab.html`, `scripts/selftest.mjs` and `tests/auction-gamma-playbook.spec.mjs`; on the two sibling pages it is confined to the `putOptions` day argument at line 1114 and at line 1289, with the `slim` projection at line 1113 keeping its field set; all 10 `bsmGamma` occurrences the three pages hold today are intact, at lines 1278 and 1294 on `intraday-tape-lab.html`, at lines 1053, 1068, 1069, 1075, 1097 and 1098 on `gamma-trading-lab.html` and at lines 1266 and 1282 on `swing-structure-lab.html`, so no seam SCOPE-06 or SCOPE-09 owns is touched; the vanna, charm, OVI and term-structure work is unchanged; `swing-structure-lab.html`'s remaining acquisition functions keep their same-origin-first order; the alias delegations at lines 1471–1478 keep their shape and the `data-m` segment keeps exactly two buttons; `rlexperience-adapters/options.js`, `rlexperience-adapters/market-structure.js` and every consumed-never-modified shell module are byte-identical; `data/options/**` was read and never written; and no registry entry appears in the diff.

### Build Quality Gate

- [ ] `node scripts/selftest.mjs` completes with zero failing assertions and zero warnings.
- [ ] `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` completes with zero failures and no skipped required test.
- [ ] `node scripts/validate-tool-experience.mjs` completes clean; every registry count this scope leaves untouched still holds.
- [ ] `bash .github/bubbles/scripts/artifact-lint.sh specs/016-auction-gamma-playbook` exits 0.
- [ ] `notes/intraday-tape-lab.md` and `README.md` state what acquisition now preserves, matching the behaviour this scope shipped.
- [ ] Only the paths in this scope's Implementation Files table were modified; on `gamma-trading-lab.html` and `swing-structure-lab.html` the diff is confined to the `putOptions` day argument at line 1114 and line 1289 respectively, with the `slim` projection, both inline gamma models, both pages' remaining acquisition functions and all of their rendering unchanged; `data/options/**` was read and never written.
