# Design: BUG-012 — Root Cause, The Open Contract Decision, And Why Nothing Is Implemented

## 0. Scope of this document

This packet was filed under an explicit instruction to **document and not fix**. The remedy for the
primary defect is a decision about the ingestion contract with more than one defensible answer, and
committing to one inside a filing task would settle it by accident rather than by choice.

This document therefore does two things and refuses a third. It establishes the root cause to the
line. It sets out the competing remedies with their consequences. It does **not** pick one.

All measurements cited here were executed earlier in this session and are recorded in `report.md`
with their provenance. The line and field citations below were verified by read-only inspection in
this session and are labelled as such in `report.md`.

## Capability Foundation

The foundation is **one coherence predicate**, expressed once and consumed at every point where a
bar row is produced or validated: `l <= min(o, c)`, `h >= max(o, c)`, `l <= h`.

What makes this a foundation rather than a local fix is that the predicate is *shared code*, not a
repeated condition. `scripts/validate-bars-coherence.mjs` exports `assertCoherentBar`,
`isCoherentBar`, `partitionCoherentBars`, `validateBarsCorpus` and `formatBarsCoherenceFindings`,
and `scripts/selftest.mjs` imports them at line 49. A second hand-written copy of the inequality in
the writer would be free to drift from the one in the scan, and a drifted invariant is worse than no
invariant because it still looks enforced.

The foundation stops at the predicate. It does not retry, does not repair silently, and does not
decide which basis is correct — §2 records that the basis decision is an owner choice with two
defensible options.

## Concrete Implementations

| # | Implementation | Enforces at | Artifact | Failure mode it closes |
|---|---|---|---|---|
| 1 | Writer guard | Write time, per row | `scripts/fetch-bars.mjs` | A future vendor refresh reintroducing an adjusted close beside a raw low |
| 2 | Corpus scan | Read time, over all committed rows | `scripts/validate-bars-coherence.mjs`, wired into `scripts/selftest.mjs` | The 71,714 rows already committed when the defect was found |

Both are required. §5 records the rejected alternatives explicitly: repairing `data/bars/COP.json` by
hand fixes one row of one file and leaves the writer free to redo it, while fixing only the writer
leaves the pinned row broken so the six tests stay red.

### Variation Axes

- **Axis 1 — when the invariant is checked.** This is the axis that forced two implementations, and it is not a preference. The writer can only check rows it is about to write; it cannot reach rows already committed. The scan can only check committed rows; it cannot stop the next write. Neither position subsumes the other, which is why both exist.
- **Axis 2 — what a violation does.** Fixed, not variable. Both implementations REFUSE and name the offending row; neither repairs silently. `rlagenda.js` already refused invalid bars correctly and is unchanged, so the read-time behaviour is inherited rather than re-invented. Holding this axis fixed is what kept `rlagenda.js` byte-identical through the whole packet.
- **Axis deliberately NOT taken — per-symbol or per-feed tolerance.** Nothing permits a symbol to opt out of coherence or declare a looser bound. A tolerance knob would have made the red disappear without the defect being fixed, which is the single most available shortcut in this packet and the one §5 names as prohibited.

## 1. Root cause

Four facts compose into the observed failure, and each is a separate defect.

### 1.1 Ingestion writes an adjusted close beside a raw low

`scripts/fetch-bars.mjs::trimBars` reads the vendor's adjusted-close series (line 145) and then
substitutes it for the close:

```
152    const c = (adj && adj[i] != null) ? adj[i] : rawClose;
155    out.push({ t: ..., o: q.open[i], h: q.high[i], l: q.low[i], c, v: ... });
```

Line 152 takes `c` from the **adjusted** series. Line 155 takes `o`, `h` and `l` from the **raw**
quote series. The four numbers in the emitted row therefore no longer describe one trade sequence.

Dividend adjustment scales historical prices **down**, so `c` drifts below a raw `l` that was never
adjusted with it. The resulting row claims a low above its own close. The very first row of
`data/bars/COP.json` shows the shape plainly: `o=111`, `h=112.04`, `l=110.45`, `c=104.216`.

### 1.2 `rlagenda.js` refuses such a bar, correctly

```
1718    bar.latest.l > Math.min(bar.latest.o, bar.latest.c) || bar.latest.h < Math.max(...) || ...
1719      return modelInputRefusal("RLAGENDA-MODEL-INVALID", "currentBars." + barId);
```

A low above both open and close describes a trade that did not happen. Refusing it is the validator
doing its job, and the refusal names the offending symbol precisely — the observed run reported
`field=currentBars.COP`.

**This is not the defect and must not be treated as one.** Relaxing line 1718 would let incoherent
prices into the published model, and the loud failure would become a quiet wrong answer.

### 1.3 A committed fixture reads mutable data

`research-agenda-lab.html::loadFixtureBars` (line 853) resolves the fixture's bars from the **live**
corpus:

```
859    var rows = barFile.rows.filter(function (row) { return row.t <= Date.parse(generationCutoff); });
860    var latest = rows[rows.length - 1];
```

`generationCutoff` is the fixture's own `attemptedAt`, committed as `2026-08-14T12:00:00.000Z`. The
cutoff is frozen; `data/bars/COP.json` is not. The loader takes the last row at or before the cutoff,
which is the `2026-08-13T13:30Z` row — the exact row the refresh rewrote.

`installReversalFixture` then replays the canonical model and converts a refusal into a throw:

```
874    if (!replay.ok) throw new Error("fixture canonical model failed: " + replay.code);
```

### 1.4 The error path never sets `state.view`

```
1059    }).catch(function (error) {
1060      byId("currentPosture").textContent = "○ Unavailable";
1061      byId("currentReason").textContent = "Required same-origin research artifacts could not be loaded. " + error.message;
1062    });
```

The handler writes both DOM strings and returns. `state.view` is never assigned. The debug surface
declared immediately below reads:

```
1066    getViewState: function () { return state.view ? JSON.parse(JSON.stringify(state.view)) : null; },
```

so `getViewState()` returns `null` permanently. `__researchAgendaDebug` itself is always defined, so
the conjunction the tests wait on can never become truthy:

- `tests/tool-experience.spec.mjs:327`, inside the shared `openResearchAgenda` helper at line 323
- `tests/contextual-tooltip.spec.mjs:118`, following the `?fixture=reversal` navigation at line 116

The five failing `tool-experience` tests are exactly the five that call that helper with
`{ fixture: 'reversal' }` — call sites 443, 488, 567, 608 and 649. The three tests that call it
**without** the fixture (365, 459, 717) pass. That partition is the diagnosis confirmed structurally:
only the reversal boot path fails, and it fails at the point where the fixture meets the corrupted
row.

### 1.5 Why this is a hang and not a slow test

The awaited condition is not "slow to become true"; it is **unreachable**. Re-running under a 240 s
budget — 8× the inherited default — produced the same failure. No timeout value fixes an unresolvable
wait, and `report.md` records that measurement so the cheapest wrong answer is closed off by
execution rather than by assertion.

`BUG-011`'s `design.md` §3.3 states the principle this violates directly:

> A wait that can hang is worse than a wait that can be slow.

`BUG-011` applied that principle when **choosing** a wait, and rejected two candidate conditions
because they could hang. This packet is what the same principle looks like when the hanging wait
already exists in committed tests.

## 2. Defect 1 — the ingestion contract decision (NOT settled here)

The arithmetic must become coherent. **How** it becomes coherent is the decision.

### 2.1 Option A — adjust all four fields on the same basis

Apply the adjustment factor to `o`, `h` and `l` as well as `c`, so a row is wholly adjusted.

| Consequence | Detail |
|---|---|
| Coherence | Restored by construction: scaling all four by one positive factor preserves the ordering the validator checks. |
| Downstream | Every consumer of `data/bars/` sees adjusted prices, including consumers that currently read `o`/`h`/`l` expecting raw levels. |
| History | Every historical row's `o`/`h`/`l` changes value at the next refresh that carries a new factor. Price levels stop being comparable to externally quoted raw prices. |
| Risk | Silent: nothing fails, but any threshold, level or trigger expressed in raw price terms shifts underneath its consumer. |

### 2.2 Option B — keep OHLC raw and give the adjusted close its own field

Write `o`, `h`, `l`, `c` all from the raw quote series, and carry the adjusted close as a separate
named field alongside.

| Consequence | Detail |
|---|---|
| Coherence | Restored: all four fields come from one series again. |
| Downstream | Consumers that want total-return series must be updated to read the new field; those that want raw levels are already correct. |
| History | Historical `o`/`h`/`l`/`c` become stable — a published row stops changing. |
| Risk | Loud: a consumer that needs adjustment and has not been updated computes on raw prices, which is a visible modelling difference rather than a silent shift. |

### 2.3 What the decision must not do

Whichever is chosen, INV-012B-3 stands: the **existing corpus** must be brought into coherence.
Fixing the writer alone leaves 71,714 incoherent rows across 245 files in place, and the six tests
would stay red because the row this fixture pins would stay broken.

### 2.4 A separate concern — retroactively rewriting a published row

Independent of the arithmetic, the refresh **changed a value that had already been published**.
`mergeRows` (lines 159-168) keys rows by timestamp and lets fresh rows overwrite existing ones:

```
162      byTimestamp.set(row.t, row);   // existing
165      byTimestamp.set(row.t, row);   // fresh — same key, silently replaces
```

The COP close for `2026-08-13T13:30Z` moved from `124.5200` to `123.6950` in place. Nothing recorded
that it moved, and no consumer could have detected it.

This would still be a concern if the arithmetic were perfect. A published historical bar that changes
value without a trace means any prior analysis referencing it cannot be reproduced, and any test
pinned to it can break without a code change — which is precisely what happened. **Deciding a
retention or provenance policy for published rows is out of scope for this packet** and is recorded
in `spec.md` as such. It is noted here so that a fix for the arithmetic is not mistaken for a fix for
the provenance.

## 3. Defect 2 — a committed fixture pinned to mutable data

The fixture pins a cutoff. The cutoff resolves against `data/bars/*.json`, which the cron rewrites.
A committed test therefore has an input that no commit controls.

The failure mode is worse than flakiness. A flaky test fails intermittently and is eventually
recognised. This test was **deterministically green** until an unrelated scheduled job ran, then
became **deterministically red** — with no change to the test, the page, or the model. The bisect
lands on a data commit, which reads as noise unless the reader already suspects the coupling.

Two shapes are available and the packet does not choose between them:

- **Pin the inputs.** Commit the bars rows the fixture needs alongside the fixture, so the cutoff
  resolves against reviewed data. Strongest reproducibility; adds a small committed data surface that
  can drift from the corpus in meaning.
- **Keep reading shared data and detect drift.** Retain the current coupling and add an explicit
  expectation, so a mismatch fails naming the fixture, symbol and row instead of hanging. Keeps the
  fixture exercising real corpus shape; the test still depends on data outside its own commit.

INV-012B-5 and INV-012B-6 are written so that either is acceptable and neither can be satisfied by
leaving the coupling silent.

## 4. Defect 3 — the error path cannot report

The page **already computed the right answer**. The observed headless boot reported:

```
currentReason = Required same-origin research artifacts could not be loaded.
                fixture canonical model failed: RLAGENDA-MODEL-INVALID
```

That string names the failing stage and the refusal code. It was in the DOM the whole time. What the
test waits on is `getViewState()`, and the error path leaves it `null`, so the observer that would
have surfaced the diagnosis is the one thing the failure path does not reach.

The fix shape is constrained by INV-012B-9: the successful path must be untouched. That rules out
changing what `getViewState()` returns on success, and points at the `.catch` recording a failed
state that the observer can see — leaving every successful boot byte-identical.

The cost of not fixing this is not confined to these six tests. It is the general cost that **every
future data break on this path presents as an unbounded hang**, and each one costs a debugging
session to rediscover a message the page had already written.

## 5. What must NOT be done

| Prohibited | Why |
|---|---|
| Adding a global `timeout` to `playwright.config.mjs` | Considered and **disproven by execution**: the same tests failed at 240 s, 8× the inherited budget. The awaited condition is unreachable, so no budget reaches it. Applying one would relax every test in the suite and hide this defect behind a longer wait. |
| Relaxing the `l > min(o, c)` check in `rlagenda.js` | Converts a loud data defect into a silent one and admits incoherent prices into the published model. Prohibited by INV-012B-4. |
| Adding `retries` | Retries do not make an unreachable condition reachable. Every attempt would hang and the suite would take longer to report the same red. |
| Marking any of the six `.skip` or `.fixme` | Deletes the guarantees they hold — the reversal prior-versus-current comparison and contextual disclosure — while the underlying data stays broken. |
| Editing the fixture's `attemptedAt` to skip the corrupted row | Moves the cutoff off one bad row while 71,714 remain. The next refresh that touches the new cutoff row reproduces the identical failure, and the packet's own evidence would have been used to hide it. |
| Repairing `data/bars/COP.json` by hand | Fixes one row of one file. Neither the writer nor the other 244 files change, and the corpus regenerates the defect at the next refresh. |
| Fixing only the writer and leaving the corpus | The six tests stay red because the pinned row stays broken. INV-012B-3 exists to prevent exactly this half-fix. |
| Changing `getViewState()`'s successful return value to make the wait resolve | Alters the contract every passing consumer depends on, to work around an error path. Prohibited by INV-012B-9. |
| Choosing Option A or Option B inside this filing | The instruction was to file, not to fix. §2 exists so the decision is made deliberately and visibly, not inherited from a bug report. |

## 6. What this packet delivers

Documentation only: this packet's eight artifacts under
`specs/_bugs/BUG-012-ingestion-writes-adjusted-close-beside-raw-ohlc/`. No file under `data/`,
`tests/`, `scripts/`, no `research-agenda-lab.html`, and no part of the `BUG-011` packet was
modified. Every Definition of Done item in `scopes.md` is unticked, every scenario in
`scenario-manifest.json` is `not_started`, and `state.json` is `in_progress` — because nothing is
fixed.
