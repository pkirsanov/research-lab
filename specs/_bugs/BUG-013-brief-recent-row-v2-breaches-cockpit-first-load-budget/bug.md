# BUG-013: The v2 Recent Row Breaches The Cockpit First-Load Byte Budget, And Will Breach It Far Worse

**Status:** Reported
**Severity:** High
**Filed:** 2026-08-19
**Affected feature:** `specs/026-actionable-brief-brevity-and-cross-asset` (Scope 3)
**Filed at commit:** `9af68427b`

---

## Summary

`node scripts/selftest.mjs` reports **3012 passed, 15 failed** at `9af68427b`. All fifteen
failures trace to one number. Two assertion texts carry it:

- `the cockpit's whole first-load payload is inside budget (204 KB <= 200 KB)`
- `brief-first-load exceeds configured artifact byte budget`

`scripts/validate-tool-experience.mjs` sums seven files into a `briefFirstLoad` inventory and
compares the total against `briefFirstLoadMaxBytes` in `tool-experience.config.json`. The total
crossed the budget.

| commit | first-load total | budget | verdict |
|---|---|---|---|
| `0f61d1a14` — Feature 026 Scopes 1-2 landed | 197,756 | 204,800 | 7,044 under, green |
| `9af68427b` — current HEAD | 209,387 | 204,800 | **4,587 over, red** |

The growth is +11,631 bytes. One file supplies 93% of it.

---

## What Grew

Per-file deltas between the two commits, re-derived at filing time from committed blobs:

| file | `0f61d1a14` | `9af68427b` | delta |
|---|---:|---:|---:|
| `market-brief.config.page.json` | 7,970 | 7,970 | 0 |
| `market-brief.page.json` | 92,799 | 93,049 | +250 |
| `watchlist.json` | 2,124 | 2,124 | 0 |
| **`brief-history.recent.jsonl`** | **10,158** | **21,006** | **+10,848** |
| `market-brief.snapshot.page.json` | 69,536 | 69,881 | +345 |
| `market-brief.tools.page.json` | 3,157 | 3,157 | 0 |
| `market-brief.scorecard.json` | 12,012 | 12,200 | +188 |
| **total** | **197,756** | **209,387** | **+11,631** |

`brief-history.recent.jsonl` did not gain a single row. It held **30 rows at both commits**, which
is exactly its configured `briefHistoryRecentMaxRows`. What changed is the size of a row.

| commit | rows | bytes | mean bytes/row | rows carrying `tracked` |
|---|---:|---:|---:|---:|
| `0f61d1a14` | 30 | 10,158 | 339 | 0 |
| `9af68427b` | 30 | 21,006 | 700 | 2 |

The mean is misleading because the file is currently mixed. Split by contract:

- a row without the v2 keys costs **~397 bytes**
- a row with the v2 keys costs **~4,939 bytes**

That is **12.4x**. The four keys Feature 026 Scope 3 added in the `brief-history-recent-row/v2`
bump account for essentially all of it. Measured on the largest v2 row (4,947 bytes total):

| key | bytes | share of row |
|---|---:|---:|
| `tracked` | 3,565 | 72% |
| `crossAsset` | 613 | 12% |
| `dark` | 325 | 7% |
| `claims` | 61 | 1% |

`tracked` carries twelve instruments, so it costs roughly **297 bytes per instrument**.

---

## The Projection Is The Urgent Part

Only two of the thirty rows carry v2 keys today. The other twenty-eight predate the contract bump
and project the new keys as `null`, which costs almost nothing. The cron that regenerates this
artifact will keep replacing the oldest row, so the v2 population only rises.

At steady state every row is v2:

```
30 rows x 4,947 bytes = 148,410 bytes ~= 145 KB
```

The other six first-load files currently total 188,381 bytes. Holding them fixed:

```
188,381 + 148,410 = 336,791 bytes ~= 329 KB   against a 200 KB budget
```

That is **1.64x the budget**, from a single file that is one of seven.

The consequence for remedy selection is direct: raising `briefFirstLoadMaxBytes` past the present
overage does not work. A budget set to clear today's 209,387 is red again long before the window
fills. The number to clear is not 205 KB, it is 330 KB, at which point the budget no longer
describes anything the cockpit can afford to download on every page load.

---

## Reproduction

1. Check out `9af68427b`.
2. Run `node scripts/selftest.mjs`.
3. Observe 15 failures, every one of them naming the first-load byte budget.

Or measure the inventory directly, without running the suite:

1. Sum the byte lengths of the seven paths listed in `firstLoadPaths` in
   `scripts/validate-tool-experience.mjs`.
2. Compare against `artifactBudgets.briefFirstLoadMaxBytes` in `tool-experience.config.json`.
3. Observe 209,387 against 204,800.

---

## Expected vs Actual

**Expected.** The cockpit's first-load payload stays inside the byte budget the repository
declares for it, and stays inside it as the recent-history window turns over.

**Actual.** The payload is 4,587 bytes over the budget now, and projects to roughly 329 KB once the
recent window is fully populated with v2 rows.

---

## The Budget Check Is Not The Defect

`validate-tool-experience.mjs` did exactly what it exists to do. It detected real, unbudgeted
growth in a payload every visitor downloads, and it detected it while only two of thirty rows carry
the new contract — early enough that the remedy is still cheap. Fifteen red assertions are the
guard working, not the guard misfiring.

Nothing in this packet proposes weakening or removing that check.

---

## Two Documented Intentions In Direct Conflict

This is a design conflict, not an oversight. Both sides of it are written down, in the same doc
comment, above the same function.

`compactRow()` in `scripts/shard-brief-history.mjs` states the artifact's contract:

> The compact projection the cockpit can afford to load every time. Deliberately excludes
> toolReads / toolCoverage / groups / sectors / names: those are the monthly shard's job, and a page
> that needs them should read the one month it cares about.

`tracked` is per-instrument data. It is the same class of content that sentence excludes, and it is
now 72% of a v2 row.

The same comment records Feature 026's equally deliberate rationale for adding it:

> The four new keys carry what the run SAW, which is what makes "what changed since I last told you"
> answerable without refetching a single instrument.

Both intentions are real and both are documented. The compact projection exists so the cockpit can
afford the file on every load. The v2 keys exist so the change vocabulary can answer a question
without a refetch. Satisfied together at the current encoding, they exceed the budget.

**This packet picks neither.** Choosing between them is a product tradeoff for Feature 026's owner,
and resolving it inside a filing task would prejudge it.

---

## The Retention Policy Bounds Rows, Not Bytes

`tool-experience.config.json` declares:

```
"briefHistoryRecentMaxBytes": 204800,
"briefHistoryRecentMaxRows": 30,
"briefFirstLoadMaxBytes": 204800
```

The row cap held perfectly. The window was 30 rows before the bump and 30 rows after. It did not
contain the growth because the growth was in bytes per row, which no cap addressed.

The per-file byte budget did not contain it either, and cannot. `briefHistoryRecentMaxBytes` is
204,800, which is **identical to `briefFirstLoadMaxBytes`**. One of seven files is permitted to
consume the entire budget of the whole payload by itself. At the projected steady state of
~148,410 bytes this file is still comfortably inside its own per-file budget while putting the
aggregate 1.64x over. The per-file guard is structurally incapable of firing before the aggregate
guard does, so it adds no protection the aggregate does not already give.

---

## Candidate Remedies — Enumerated, Not Chosen

These are recorded so the owner has the option set. This packet does not select among them and
assigns no preference ordering.

**1. Move `tracked` to the monthly shard.** Follows `compactRow()`'s stated exclusion literally.
Costs a monthly-shard fetch to answer "what changed since I last told you", which is the exact cost
Feature 026 Scope 3 set out to remove.

**2. Keep `tracked` in `recent`, encode it compactly.** 3,565 bytes for twelve instruments is ~297
bytes each, which looks reducible. Preserves the no-refetch property. Requires establishing how
much of that per-instrument cost is structural and how much is encoding, which no measurement in
this packet answers.

**3. Reduce the recent window for v2 rows.** Keeps the keys and the encoding, shortens the history.
Trades trend depth for bytes. Interacts with `briefHistoryRecentMaxRows` and with any consumer that
assumes a 30-row window.

**4. Raise `briefFirstLoadMaxBytes`.** Recorded for completeness and **refuted by the projection
above**: the steady-state total is ~329 KB, so a budget raised to clear today's 209,387 goes red
again as the window turns over. Clearing the projection instead means declaring a ~330 KB
first-load payload acceptable, which is a different decision from raising a budget.

---

## Scope Of This Packet

Filing only. No source file is modified. Specifically untouched:
`scripts/shard-brief-history.mjs`, `tool-experience.config.json`, `rlcockpit.js`, every
`*.page.json`, and every `brief-history*` artifact.

---

## Root Cause

Not yet established beyond the mechanism. The mechanism is measured and stated above: the
`brief-history-recent-row/v2` contract raised per-row cost 12.4x in an artifact bounded by rows
rather than by bytes, inside a payload bounded in aggregate. Which of the two documented intentions
yields, and by how much, is an owner decision this packet does not make.
