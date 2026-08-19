# Report: BUG-013 — Cockpit First-Load Budget Breach

**Workflow mode:** `bugfix-fastlane`
**Status:** Filed. No scope started.
**Filed at commit:** `9af68427b`

---

## Summary

This packet files a defect and implements nothing.

At `9af68427b` the cockpit's first-load payload measures 209,387 bytes against a declared budget of
204,800. Fifteen selftest assertions fail on that single number. The overage comes almost entirely
from `brief-history.recent.jsonl`, whose row count did not change but whose per-row cost rose 12.4x
when Feature 026 Scope 3 raised the row contract to `brief-history-recent-row/v2`.

The projection is the reason this is filed as High rather than as a tuning nit. Two of thirty rows
carry the new contract today. At full turnover the file alone reaches ~148,410 bytes and the payload
reaches ~336,791, which is 1.64x the budget. The eventual overage is 131,991 bytes, roughly 29x the
overage visible now.

The remedy is a product tradeoff between two documented, deliberate, incompatible intentions
recorded in the same doc comment. `design.md` enumerates four candidates with their measured costs
and selects none. Selecting one inside a filing task would prejudge a decision that belongs to
Feature 026's owner.

The budget check is not the defect. It detected real unbudgeted growth while 28 of 30 rows were
still unrepriced, which is early enough for the remedy to be cheap.

---

## Evidence Provenance

Evidence in this packet comes from two sources and they are tagged separately throughout.

**Prior execution, this filing session, not re-run here.** The selftest result of 3012 passed / 15
failed and the two failing assertion texts. The operator executed `node scripts/selftest.mjs` at
`9af68427b` and reported the outcome. This packet did not re-run the suite; re-running it was
explicitly out of scope for the filing task.

**Executed during filing.** Every byte count, row count, per-key breakdown, and projection below was
re-derived at filing time against committed blobs and the working tree. Where a re-derived figure
differs from the prior-execution figure, both are shown and the difference is explained rather than
reconciled silently.

---

## Test Evidence

No test was written, changed, or fixed. This packet is filing-only. What follows is measurement
evidence establishing the defect.

### The failing assertions

**Claim Source:** interpreted from prior execution
**Executed:** NO — attributed to the operator's run in this session, not re-run here
**Command:** `node scripts/selftest.mjs`
**Reported result:** 3012 passed, 15 failed

All fifteen failures name one number, through two assertion texts:

```
the cockpit's whole first-load payload is inside budget (204 KB <= 200 KB)
brief-first-load exceeds configured artifact byte budget
```

The second text is emitted by `scripts/validate-tool-experience.mjs`, from the `invariant` at the
end of `validateArtifactBudgets`.

### The current first-load inventory

**Claim Source:** executed
**Executed:** YES
**Command:** `wc -c market-brief.config.page.json market-brief.page.json watchlist.json brief-history.recent.jsonl market-brief.snapshot.page.json market-brief.tools.page.json market-brief.scorecard.json`
**Exit Code:** 0

```
  7970 market-brief.config.page.json
 93049 market-brief.page.json
  2124 watchlist.json
 21006 brief-history.recent.jsonl
 69881 market-brief.snapshot.page.json
  3157 market-brief.tools.page.json
 12200 market-brief.scorecard.json
209387 total
```

The seven paths are exactly `firstLoadPaths` in `scripts/validate-tool-experience.mjs`.
`artifactBudgets.briefFirstLoadMaxBytes` in `tool-experience.config.json` is 204,800.

**209,387 against 204,800 is 4,587 over.** This reproduces the failing assertion by direct
measurement, without running the suite.

### The green baseline

**Claim Source:** executed
**Executed:** YES
**Command:** `node -e '...git cat-file -s 0f61d1a14:<each firstLoadPath>...'`
**Exit Code:** 0

```
7970  market-brief.config.page.json
92799  market-brief.page.json
2124  watchlist.json
10158  brief-history.recent.jsonl
69536  market-brief.snapshot.page.json
3157  market-brief.tools.page.json
12012  market-brief.scorecard.json
total: 197756 | budget 204800 | delta -7044
```

`0f61d1a14` is `feat(026): output budget, fail-closed refusal and cross-asset legs (Scopes 1-2)`.
The payload was 7,044 bytes under budget there.

Per-file delta across the window:

| file | `0f61d1a14` | `9af68427b` | delta |
|---|---:|---:|---:|
| `market-brief.config.page.json` | 7,970 | 7,970 | 0 |
| `market-brief.page.json` | 92,799 | 93,049 | +250 |
| `watchlist.json` | 2,124 | 2,124 | 0 |
| `brief-history.recent.jsonl` | 10,158 | 21,006 | **+10,848** |
| `market-brief.snapshot.page.json` | 69,536 | 69,881 | +345 |
| `market-brief.tools.page.json` | 3,157 | 3,157 | 0 |
| `market-brief.scorecard.json` | 12,012 | 12,200 | +188 |
| total | 197,756 | 209,387 | +11,631 |

One file supplies 10,848 of 11,631 bytes, which is **93%**. The other six supply 783 bytes combined.

This re-derivation matches the operator's prior-execution figures exactly, file by file.

### Row count did not change

**Claim Source:** executed
**Executed:** YES
**Command:** `node -e '...git cat-file -p <commit>:brief-history.recent.jsonl, count rows and rows with non-null tracked...'`
**Exit Code:** 0

```
0f61d1a14 rows: 30 bytes: 10158 avg/row: 339 rows-with-tracked: 0
9af68427b rows: 30 bytes: 21006 avg/row: 700 rows-with-tracked: 2
```

Thirty rows at both commits, which is exactly `briefHistoryRecentMaxRows`. The retention policy held
perfectly and constrained nothing, because the variable that moved is bytes per row.

The mean of 700 is a blend. Split by contract:

**Claim Source:** executed
**Executed:** YES
**Command:** `node -e '...partition brief-history.recent.jsonl rows by tracked != null and sum bytes...'`
**Exit Code:** 0

```
rows total: 30
rows WITH tracked: 2 bytes: 9877 avg: 4939
rows WITHOUT tracked: 28 bytes: 11129 avg: 397
projected all-30-at-v2: 148170 bytes = 145 KB
```

**~397 bytes to ~4,939 bytes is 12.4x.**

### Where the bytes go inside a v2 row

**Claim Source:** executed
**Executed:** YES
**Command:** `node -e '...for each v2 row print total and JSON.stringify byte length of tracked/crossAsset/dark/claims...'`
**Exit Code:** 0

```
ts 2026-08-19T12:17:15.423Z total 4947 tracked 3565 crossAsset 613 dark 325 claims 61 trackedCount 12
ts 2026-08-19T14:31:04.945Z total 4930 tracked 3553 crossAsset 611 dark 325 claims 61 trackedCount 12
max v2 row bytes: 4947 | x30 = 148410 = 145 KB
```

The four keys added by the v2 bump total 4,564 of 4,947 bytes, which is **92% of the row**.
`tracked` alone is 3,565 bytes, **72%**, carrying twelve instruments at ~297 bytes each.

### Reconciling the two per-row figures

The operator's prior-execution measurement reported a v2 row at 5,426 bytes and a projection of
~163 KB. This filing's re-derivation reports the largest v2 row at 4,947 bytes and a projection of
~145 KB.

Both are correct for their moment. `brief-history.recent.jsonl` is regenerated by cron, so the
population and content of the two v2 rows differ between the operator's measurement and this one.
The difference is 9% and it does not touch any conclusion: at either figure the file alone consumes
roughly three quarters of the whole 200 KB budget, and at either figure the whole payload lands far
over it. This packet uses its own re-derived 4,947 for arithmetic and records the prior figure here
so the discrepancy is visible rather than quietly dropped.

### The projection

**Claim Source:** executed — arithmetic over the measured figures above
**Executed:** YES

```
steady state file  = 30 x 4,947        = 148,410 bytes  (~145 KB)
other six files    = 209,387 - 21,006  = 188,381 bytes
steady state total = 188,381 + 148,410 = 336,791 bytes  (~329 KB)
budget                                 = 204,800 bytes  (200 KB)
overage                                = 131,991 bytes  (1.64x)
```

Every cron run replaces the oldest row with a v2 row, so the v2 population rises monotonically and
terminates at 30. The visible overage of 4,587 bytes understates the eventual overage by roughly
29x.

This is what refutes raising the budget. A budget set to clear 209,387 is red again as the window
turns over. Clearing the projection means accepting a 329 KB unconditional first-load payload,
which is a different decision on different grounds.

### The declared budgets

**Claim Source:** executed
**Executed:** YES
**Command:** `sed -n '130,150p' tool-experience.config.json`
**Exit Code:** 0

```
  "artifactBudgets": {
    "contractVersion": "experience-artifact-budget/v1",
    "configMaxBytes": 65536,
    "simpleModelsMaxBytes": 524288,
    "journeysMaxBytes": 1048576,
    "briefHistoryRecentMaxBytes": 204800,
    "briefHistoryRecentMaxRows": 30,
    "briefFirstLoadMaxBytes": 204800
  },
```

`briefHistoryRecentMaxBytes` and `briefFirstLoadMaxBytes` are **the same number**. One file of seven
is permitted to consume the entire allowance of the whole payload. At the projected 148,410 bytes
this file remains inside its own per-file budget while the aggregate is 1.64x over, so the per-file
guard cannot fire before the aggregate guard in any scenario. That is the gap FR-013-003 names.

### The enabling change sits inside the measurement window

**Claim Source:** executed
**Executed:** YES
**Command:** `git merge-base --is-ancestor 0f61d1a14 3855ee75d && git merge-base --is-ancestor 3855ee75d 9af68427b`
**Exit Code:** 0 for both

```
0f61d1a14 is ancestor of 3855ee75d: YES
3855ee75d is ancestor of 9af68427b: YES
```

`3855ee75d` is `feat(026): memory row v2, change vocabulary and delta-only publishing (Scope 3)`,
and it is the only commit touching `scripts/shard-brief-history.mjs` or `tool-experience.config.json`
in the window.

This corrects one framing from the prior-execution report. The operator's summary described the
window as containing no code change, on the observation that the commit which crossed the budget is
a cron commit. The stronger statement is not supportable: the contract bump **is** in the window.
What is true, and more useful, is that the bytes lag the code. `compactRow()` can only emit a v2 key
when the source row carries it, historic source rows carry none and project as `null` at near-zero
cost, so only runs executed after `3855ee75d` produce a full-price row. The growth therefore
materialised through subsequent cron refreshes rather than at the commit that caused it.

Recording it this way matters for the remedy. "No code changed" points at the cron. The cron is
working correctly. The cause is `3855ee75d`, and the cause is **still arriving** — 28 of 30 rows have
not yet been repriced.

### The design conflict, quoted

**Claim Source:** executed — read from `scripts/shard-brief-history.mjs`
**Executed:** YES

The doc comment above `compactRow()` carries both positions.

Position A, the artifact's founding contract:

```
The compact projection the cockpit can afford to load every time. Deliberately excludes
toolReads / toolCoverage / groups / sectors / names: those are the monthly shard's job, and a page
that needs them should read the one month it cares about.
```

Position B, Feature 026 Scope 3's rationale, in the same comment:

```
The four new keys carry what the run SAW, which is what makes
"what changed since I last told you" answerable without refetching a single instrument.
```

`tracked` is per-instrument data, which is the class Position A excludes by name, and it is 72% of a
v2 row. Both intentions are documented and deliberate. At the current encoding they cannot both
hold. This packet states the conflict and selects neither.

---

## Completion Statement

This packet is **filed and unstarted**. Its status is `in_progress` with `certification.status`
equal to it. No Definition of Done item in `scopes.md` is ticked, and none should be: no remedy has
been chosen, designed, built, or tested.

**What is established.** The defect is real and reproducible by direct measurement. The magnitude is
4,587 bytes today and ~131,991 bytes at steady state. The contributing change is identified as
`3855ee75d`. The dominant cost is `tracked` at 72% of a v2 row. The existing row cap and per-file
byte cap are both shown to be incapable of containing it, the per-file cap structurally so.

**What is not established.** The remedy. `design.md` enumerates four candidates and selects none,
because the choice is between two documented product intentions and belongs to Feature 026's owner.
Two further things are explicitly unresolved: whether candidate 2 can reach the budget by encoding
alone is unmeasured, and candidate 1 is shown to be insufficient by itself, landing near 229,841.

**What was deliberately not done.** No source file was modified. `scripts/shard-brief-history.mjs`,
`tool-experience.config.json`, `rlcockpit.js`, every `*.page.json`, and every `brief-history*`
artifact are untouched. The selftest suite and the Playwright suite were not run. Nothing was
committed.

**Ownership.** Scope 1 is not agent-dischargeable. Scopes 2 and 3 both depend on it, because the
byte target and the artifact's shape follow from which intention yields. Building Scope 2 before
Scope 1 is decided would select the remedy by implementing one, which is the prejudgement this
packet exists to avoid.
