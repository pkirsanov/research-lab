# BUG-012 — Ingestion Writes An Adjusted Close Beside A Raw Low, And The Page Hangs Instead Of Saying So

- **Status:** Filed — root cause established by execution; **no remedy implemented, by instruction**
- **Severity:** High (six committed regressions red at HEAD; a systemic data-integrity defect across
  most of `data/bars/`; a product error path that cannot report)
- **Reported:** 2026-08-19
- **Affected surfaces:** `data/bars/*.json` (ingestion output), `scripts/fetch-bars.mjs` (ingestion
  writer), `research-agenda-lab.html` (boot error path), `tests/fixtures/research-agenda/reversal-ui.json`
  (committed fixture), `tests/tool-experience.spec.mjs`, `tests/contextual-tooltip.spec.mjs`
- **Related packet:** [`BUG-011`](../BUG-011-causal-consumer-tests-inherit-implicit-30s-budget) — its
  `design.md` §3.3 states the principle this packet's third defect violates: *"A wait that can hang is
  worse than a wait that can be slow."*

## Provenance of every figure in this packet

**Every measurement below was executed earlier in this session and is recorded here as a reported
observation.** This agent did not re-derive any of them and ran no test command. The task that
produced this packet was explicitly a filing task: capture the defect, define what a fix must satisfy,
implement nothing.

What this agent did execute is read-only inspection of the repository to check that each cited line
number, field name and file path is real. Those reads are labelled as agent-executed in `report.md`
and are separated there from the reported measurements.

## Summary

Six committed tests fail at HEAD `5c978c5cb`. They do not fail slowly — they **hang without bound**,
and the hang is a faithful consequence of a real data defect that the page is unable to report.

The chain, end to end:

1. Bars ingestion writes a **dividend-adjusted close** into `c` while `o`, `h` and `l` stay **raw**.
   The result is rows where `l > min(o, c)` — a low above both open and close, which is not a bar
   that can exist.
2. `rlagenda.js` refuses such a row. That refusal is **correct behaviour** and is not the defect.
3. The `?fixture=reversal` boot path in `research-agenda-lab.html` throws on that refusal, and its
   `.catch` writes an "Unavailable" message **without ever setting `state.view`**.
4. `__researchAgendaDebug.getViewState()` therefore returns `null` forever, and the six tests wait on
   exactly that value. The wait has no resolvable condition, so no timeout value can rescue it.

The trigger was a scheduled data refresh, not a code change. Cron commit `643d74bfd` **retroactively
rewrote the close of an already-published historical row**, and the committed fixture pins a cutoff
that selects precisely that row.

## Reproduction

Reported from execution earlier this session.

**1. Six tests fail at HEAD, in the suite and alone.**

| Run | Result | Failing tests |
|---|---|---|
| Full committed suite at `5c978c5cb` | **490 passed, 8 failed** | the six below, plus two unrelated |
| The two files alone at `5c978c5cb` | **6 failed, 20 passed** | the six below |

Failing in both, so these are the defect and not load flakes:

| File | Line | Test |
|---|---|---|
| `tests/tool-experience.spec.mjs` | 442 | `SCN-019-017 reversal comparison shows causal evidence invalidation prior view and current view` |
| `tests/tool-experience.spec.mjs` | 485 | `Regression: unchanged current review renders identical Simple and Power sustained models and tampered snapshot refs render unavailable` |
| `tests/tool-experience.spec.mjs` | 566 | `Regression: browser model chart table and tooltip values match canonical rlagenda output` |
| `tests/tool-experience.spec.mjs` | 605 | `Regression: research levers recompute both modes without refetching or mutating history` |
| `tests/tool-experience.spec.mjs` | 639 | `Regression: all five visible levers produce exact changed ids and identical Simple and Power outputs with no hidden proxy adjustment` |
| `tests/contextual-tooltip.spec.mjs` | 115 | `Research charts tables tickers sources and tooltips retain units provenance limits and keyboard access` |

**2. The same files were green before the data refresh.** At `0e51d602f` they reported **17 passed,
1 failed**, and that single red was a different, flaky test. The regression arrived with cron commit
`643d74bfd`, an after-hours refresh.

**3. The failure is an unbounded hang, and a timeout does not touch it.** Re-run under a **240 s**
budget supplied by CLI override — 8× the inherited default — it still failed:

```
Test timeout of 240000ms exceeded.
Error: page.waitForFunction: Test timeout of 240000ms exceeded.
> 118 | await page.waitForFunction(() => globalThis.__researchAgendaDebug && …getViewState());
```

This measurement is what makes the packet safe from its own most tempting wrong answer. A global
Playwright timeout was **considered and disproven by execution**. Raising the budget further changes
nothing, because the awaited condition never becomes true.

## Root cause

**`__researchAgendaDebug` is always defined; `getViewState()` returns `null` until `state.view` is
set.** The reversal boot path throws before that assignment ever happens, and the `.catch` at
`research-agenda-lab.html` lines 1059-1062 records the message without setting the view.

Booting the page headlessly reported:

```
getViewState() = null
currentReason  = Required same-origin research artifacts could not be loaded.
                 fixture canonical model failed: RLAGENDA-MODEL-INVALID
```

Driving the real page runtime with the exact fixture inputs localised it to a single symbol:

```
ok=false  code=RLAGENDA-MODEL-INVALID  field=currentBars.COP
COP cutoff row: low=124.12000274658203  close=123.6949691772461   low > min(o,c) = true
same call with COP close repaired to its own low: ok=true
```

COP is the **sole and sufficient** cause: repairing that one close makes the model accept the input.

### What the cron changed

| COP row `2026-08-13T13:30Z` | `l` | `c` | verdict |
|---|---|---|---|
| pre-cron `0e51d602f` | 124.1200 | **124.5200** | accepted → the six tests pass |
| current `5c978c5cb` | 124.1200 | **123.6950** | `RLAGENDA-MODEL-INVALID` → unbounded hang |

The close of an **already-published historical row** was rewritten in place. The row's own low did
not move; only its close did, and it moved below the low.

`tests/fixtures/research-agenda/reversal-ui.json` pins `attemptedAt` at `2026-08-14T12:00:00.000Z`,
and the loader selects the last row at or before that cutoff. The fixture therefore always resolves
to the corrupted `2026-08-13` row.

### It is systemic, not one row

A dividend-adjusted close is being written beside raw `o`/`h`/`l` across the corpus:

- **245 of 293** files under `data/bars/` contain at least one row with `l > min(o, c)`.
- **71,714 of 150,161** rows carry the same incoherence.

COP is not special. It only started mattering when the adjustment reached the exact row this
fixture pins.

### `rlagenda.js` is not at fault

The validator refuses a bar whose low exceeds both open and close. That bar cannot exist, so
refusing it is right. Weakening the validator to accept these rows would convert a loud data defect
into a silent one and let incoherent prices flow into the published model.

## Three distinct defects

They share one trigger and have three different owners, three different fixes and three different
blast radii. Collapsing them would mean fixing one and calling the other two closed.

| # | Defect | Where | Scope |
|---|---|---|---|
| 1 | **Data integrity (primary).** Ingestion writes an adjusted `c` beside raw `o`/`h`/`l`, breaking OHLC coherence. | `scripts/fetch-bars.mjs`, `data/bars/*.json` | 01 |
| 2 | **Test architecture.** A committed fixture pinned to a fixed cutoff reads mutable data the cron rewrites, so a passing test can be broken by an unrelated data refresh. | `tests/fixtures/research-agenda/reversal-ui.json`, `research-agenda-lab.html` fixture loader | 02 |
| 3 | **Error-path hang.** The `.catch` never sets `state.view`, so a data break surfaces as an opaque timeout instead of the message the page has already computed. | `research-agenda-lab.html` lines 1059-1062 | 03 |

Defect 3 is why this cost a debugging session rather than a glance. The page **had already computed
the correct explanation** — `fixture canonical model failed: RLAGENDA-MODEL-INVALID` — and put it in
the DOM. The test could not see it, because the only signal the test waits on is one the error path
never produces.

## Why nothing is implemented here

The remedy for defect 1 is a **design decision about the ingestion contract**, and there is more than
one defensible answer: adjust all four fields consistently, or keep `o`/`h`/`l`/`c` raw and store the
adjusted close in its own field. The two differ in what every downstream consumer of `data/bars/`
sees, and in whether historical rows change meaning. Choosing inside a filing task would prejudge
that decision and bury it in a bug report instead of surfacing it for a deliberate call.

`design.md` records the options and their consequences; `scopes.md` records what any chosen remedy
must satisfy. No Definition of Done item is ticked, because nothing is fixed.

## Impact

- Six committed regressions are red at HEAD. Five of them guard the research-agenda reversal
  comparison — the surface that shows a prior view against a current one — and one guards contextual
  disclosure. None of that behaviour is being verified while they hang.
- The corpus defect is live and growing: it affects most bars files today, and each refresh can pull
  another already-published row below its own low.
- Any consumer of `data/bars/` that assumes OHLC coherence is reading incoherent rows now, whether or
  not it validates them. `rlagenda.js` refuses loudly; a consumer that does not check will compute on
  a low above its own close.
- Every future data break on this boot path presents as an unbounded hang rather than the message the
  page already knows.

## Artifacts

| Artifact | Purpose |
|---|---|
| `bug.md` | this file |
| `spec.md` | the invariants any fix must establish |
| `design.md` | root cause, the open contract decision, the provenance concern, rejected alternatives |
| `scopes.md` | three scopes with Gherkin, test plans, and unticked DoD |
| `report.md` | executed evidence, with agent-executed reads separated from reported measurements |
| `scenario-manifest.json` | scenario contract registry, all entries `not_started` |
| `uservalidation.md` | automation readiness and human acceptance, all unchecked |
| `state.json` | execution state, `in_progress` |
