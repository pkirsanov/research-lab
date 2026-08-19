# Spec: BUG-013 — Cockpit First-Load Payload Stays Inside Its Declared Byte Budget

**Status:** Filed, not started
**Workflow mode:** `bugfix-fastlane`
**Filed at commit:** `9af68427b`

---

## Purpose

State what correct behaviour is for the cockpit's first-load payload, so a remedy can be judged
against a written contract rather than against the number that happens to be red today.

This spec defines the required end state. It does **not** select the remedy that reaches it. Four
candidates are enumerated in `bug.md` and analysed in `design.md`; picking among them is Feature
026's owner's decision.

---

## Behaviour Under Specification

`scripts/validate-tool-experience.mjs` sums seven paths into a `briefFirstLoad` byte inventory:

```
market-brief.config.page.json
market-brief.page.json
watchlist.json
brief-history.recent.jsonl
market-brief.snapshot.page.json
market-brief.tools.page.json
market-brief.scorecard.json
```

It compares that total against `artifactBudgets.briefFirstLoadMaxBytes` in
`tool-experience.config.json` and fails when the total exceeds it.

Every visitor downloads all seven on first paint. The budget exists so that cost stays bounded.

---

## Requirements

### FR-013-001 — The first-load total stays inside its declared budget

The sum of the seven `firstLoadPaths` byte lengths MUST NOT exceed
`artifactBudgets.briefFirstLoadMaxBytes`.

Measured at filing: 209,387 against 204,800. **Not satisfied.**

### FR-013-002 — It stays inside the budget at steady state, not only today

Satisfying FR-013-001 on the artifact as it stands at one commit is insufficient. The recent-history
window turns over on a schedule, so the first-load total MUST remain inside budget when **every**
row in `brief-history.recent.jsonl` carries the current row contract, not only the rows that carry
it at the moment of measurement.

At filing, 2 of 30 rows carry `brief-history-recent-row/v2`. Projected at 30 of 30, the file alone
reaches ~148,410 bytes and the payload reaches ~336,791 bytes. **Not satisfied.**

This requirement is what refutes candidate remedy 4. A budget raised to clear 209,387 satisfies
FR-013-001 and fails FR-013-002 within days.

### FR-013-003 — The recent artifact's growth is bounded in bytes, not only in rows

The retention policy MUST bound the recent artifact in a dimension that actually constrains its
contribution to the first-load total.

`briefHistoryRecentMaxRows` is 30 and held exactly across the regression: 30 rows before, 30 rows
after. It did not constrain anything, because the growth was per-row size.

`briefHistoryRecentMaxBytes` is 204,800, identical to `briefFirstLoadMaxBytes`. A per-file budget
equal to the whole-payload budget permits one of seven files to consume the entire payload
allowance alone, and would not fire at the projected 148,410. It is structurally non-binding and
MUST NOT be treated as the byte bound this requirement asks for.

**Not satisfied.**

### FR-013-004 — The conflict between the two documented intentions is resolved explicitly

`compactRow()`'s doc comment excludes per-instrument content from the compact projection. Feature
026 Scope 3's rationale, in the same comment, adds per-instrument content so that "what changed
since I last told you" is answerable without a refetch.

The remedy MUST record which intention yields and why. Leaving both sentences standing while the
code satisfies neither is not an acceptable end state, because the next author inherits the same
contradiction with no record that anyone weighed it.

**Not satisfied.** This packet deliberately leaves it unresolved and routes it.

### FR-013-005 — The budget check keeps its detection power

The remedy MUST NOT weaken, skip, or delete the `brief-first-load` assertion, and MUST NOT reduce
the assertion count of `scripts/selftest.mjs`.

The check behaved correctly. It caught real unbudgeted growth while only 2 of 30 rows carried the
new contract, which is early enough for a cheap remedy. A remedy that removes that early warning
trades a bounded payload for a silent one.

### FR-013-006 — Prior consumers of the recent artifact keep working

Whatever changes, a reader of `brief-history.recent.jsonl` MUST keep reading what it read before,
or the contract version MUST change and the change MUST be recorded.

The v1-to-v2 bump was explicitly additive: every v1 key kept its path and meaning. A remedy that
removes or relocates `tracked` is **not** additive and MUST be reflected in `contractVersion`.

---

## Acceptance Criteria

- **AC-1.** `node scripts/selftest.mjs` reports 0 failed, with no reduction in assertion count from
  the 3012-passed baseline at `9af68427b`.
- **AC-2.** The first-load total is inside `briefFirstLoadMaxBytes`, measured directly.
- **AC-3.** A projection of the first-load total with all 30 recent rows at the current contract is
  recorded, and is inside the budget.
- **AC-4.** The recent artifact carries a byte bound that would fire before the aggregate budget
  does.
- **AC-5.** `compactRow()`'s doc comment states one coherent contract. Either the exclusion covers
  what the function emits, or the exclusion is amended with the reason it changed.
- **AC-6.** The `brief-first-load` assertion is present and unweakened.
- **AC-7.** If the row contract changed, `RECENT_CONTRACT` reflects it and the prior version stays
  named for readers.

---

## Explicitly Out Of Scope

- **Selecting the remedy.** Four candidates are enumerated. This packet picks none.
- **Any source change.** `scripts/shard-brief-history.mjs`, `tool-experience.config.json`,
  `rlcockpit.js`, every `*.page.json`, and every `brief-history*` artifact stay untouched.
- **The other six first-load files.** Between the two reference commits they grew 783 bytes
  combined, against 10,848 from the recent artifact. They are not the defect and this packet
  proposes nothing about them.
- **Whether 200 KB is the right budget in principle.** This packet takes the declared budget as
  given and asks whether the payload respects it. Re-deriving the budget from a page-weight target
  is separate work.

---

## Grounding

Every number in this spec was re-derived at filing time from committed blobs at `0f61d1a14` and
`9af68427b`, and from the working tree at `9af68427b`. The selftest result of 3012 passed / 15
failed is attributed to prior execution in the filing session and was not re-run here. See
`report.md` for the provenance of each figure.
