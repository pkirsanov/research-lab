# BUG-010 — A Safety-Bearing Disclosure Sourced From Non-Deterministic Prose

- **Status:** Reported / Confirmed — root cause verified, fix designed, **fix not implemented**
- **Severity:** High — `main` is red, and the fact that went missing is a no-fabrication disclosure
- **Reported:** 2026-08-18
- **Affected feature:** [`specs/010-company-fundamentals-and-brief-lab`](../../010-company-fundamentals-and-brief-lab) Scope 6
- **Affected surfaces:** `scripts/brief-refresh.mjs`, `scripts/brief-narrative-parallel.mjs`, `scripts/validate-brief-payload.mjs`, `market-brief.payload.json`

## Summary

The company owner-read entry in `market-brief.payload.json` must disclose two facts: which adapter
produced the read (`company-fundamentals-owner-v1`), and that the tool produces **no
recommendation**. Feature 010 Scope 6 asserts both. Neither fact is produced deterministically.

Both are authored by the Tier-B LLM narrative lane, which owns the `toolCoverage` key and rewrites
every `reason` into reader prose. Its instructions never require either fact to survive. The
deterministic Tier-A producer that could supply them omits them from the text it emits, even though
it already holds both values structurally. No gate checks for them before publish.

So the disclosure is present in windows where the model happened to write it and absent in windows
where it did not. It was present in the last published window. It is absent in the committed one.
`main` is red as a result.

A no-fabrication disclosure that depends on a language model remembering to include it is not a
guarantee. It is a coincidence with good odds.

## Reproduction

Executed this session at clean `HEAD` `5c005750e`.

`node scripts/selftest.mjs` exits **1** with exactly one failure out of 2490 assertions:

```
  ✗ FAIL: Feature 010 Scope 6 keeps exact registry-wide toolCoverage parity with one hash-verified
  company owner-read entry that discloses no recommendation is produced

Research-Lab self-test: 2489 passed, 1 failed
```

Full transcript, exit code, and content hash: [`report.md` § Reproduction](report.md#reproduction).

## Which half of the assertion fails

The assertion at `scripts/selftest.mjs` line 6319 is a six-way conjunction. Four conjuncts pass and
two fail, so the failure is precise rather than a general collapse of the entry.

| # | Conjunct | Result |
|---|---|---|
| 1 | `toolCoverage` ids are order-identical to `tools.json` ids | **passes** — 28 vs 28, none missing, none extra |
| 2 | exactly one `company-fundamentals-lab` entry | **passes** |
| 3 | `deepLink === 'company-fundamentals-lab.html'` | **passes** |
| 4 | `status` is in the allowed owner-read set `['fresh-headless','analyzed']` | **passes** — `analyzed` |
| 5 | `reason.includes('company-fundamentals-owner-v1')` | **FAILS** |
| 6 | `/no recommendation[^.]*\b(?:fabricat\w*\|produced\|generated\|issued)\b/i.test(reason)` | **FAILS** |

The entry is structurally perfect. Only its prose lost two facts.

## Expected vs actual

**Committed reason** — no adapter id, no disclosure:

> Consumed as a committed owner read (a static single-name model, asOf 2026-04-29T20:06:24Z): the
> hash-verified MSFT fundamentals (sec-cik-0000789019) read direction unavailable with a partial
> brief and constrained confidence; statement 2026-03-31, model 2026-03-31, market not present.
> Coverage is partial through 2026-03-31 and no market-moving fundamental delta carries into this
> morning view.

**Last published reason**, from `_site/market-brief.payload.json` — both facts present:

> Consumed **from company-fundamentals-owner-v1** as a committed owner read (a static single-name
> model, asOf 2026-04-29T20:06:24Z): the hash-verified MSFT fundamentals (sec-cik-0000789019) read
> direction Unavailable with brief status partial and confidence constrained; statement 2026-03-31,
> model 2026-03-31, market not present. Coverage is partial through 2026-03-31. **Educational company
> research only; no recommendation is produced**, and no market-moving fundamental delta carries into
> this after-hours view.

The two windows describe the same underlying read from the same hash-verified objects. The only
difference is which sentences the narrative model chose to write.

## The structural defect

Five facts compose into it. Every one was verified against the tree this session.

**1. The deterministic producer omits both facts from the text it emits.**
`scripts/brief-refresh.mjs` line 83, inside `buildCompanyFundamentalsOwnerRead()`, builds the read
prose as:

```
`${owner.companyId} fundamentals are ${owner.status}; direction ${owner.direction}; statement ...`
```

That string contains neither the adapter id nor any disclosure. It is the only prose the
deterministic lane produces for this tool.

**2. The same function already holds both facts.** It validates `boundary.adapterId ===
'company-fundamentals-owner-v1'` and `boundary.recommendationEligibility === 'educational-research-only'`
from `company-fundamentals.config.json` before doing anything else, and it carries the id forward
structurally as `adapter.adapterId`. Both values are deterministic, both are in scope at the exact
line that builds the prose, and neither is projected into it.

**3. The omission propagates verbatim.** `buildToolCoverage(toolReads)` at
`scripts/brief-refresh.mjs` line 2106 sets `reason: toolRead.read`. Confirmed in
`market-brief.snapshot.json`, where the deterministic read is:

> sec-cik-0000789019 fundamentals are partial; direction Unavailable; statement 2026-03-31, model
> 2026-03-31, brief 2026-04-29T20:06:24.000Z, market unavailable.

— which does not contain `company-fundamentals-owner-v1`, while the sibling `adapter` object in the
same snapshot entry does.

**4. The narrative lane owns the key and is not told to preserve them.**
`scripts/brief-narrative-parallel.mjs` line 93 grants the `coverage` lane ownership of `toolReads`,
`toolCoverage`, and `experimental`. Its instructions require only that `toolCoverage` carry every
registry id exactly once "each with a specific analyzed/stale/not-relevant reason". Preservation of
the adapter id and the disclosure is never requested, so a rewrite that drops them is compliant.

**5. No gate refuses the result.** `scripts/validate-brief-payload.mjs` lines 423-432 check
`toolCoverage` for duplicate ids, missing registered ids, unregistered ids, and `hasText(reason)`.
A reason that is non-empty and silent about both facts validates cleanly and publishes.

**Net:** a safety-bearing disclosure is sourced from probabilistic prose, propagated without
reinforcement, and defended by nothing until a selftest run notices it afterwards.

## This is the third flap of the same defect

`git log -L 6319,6319:scripts/selftest.mjs` returns three commits, and each one moved the assertion
rather than the fact:

| Commit | What it did |
|---|---|
| `4c677c88b` | `feat(010)`: introduced the Scope 6 assertion |
| `eecf45a32` | `fix(012)`: relaxed the pinned coverage **status**, calling it a "brittle canary" |
| `ecc9d79e5` | `selftest`: relaxed the pinned disclosure **wording**, calling it the same brittle canary |

Both prior fixes were locally reasonable. `analyzed` really is a legitimate per-window status, and
the disclosure really can be phrased more than one way. But both diagnosed the assertion as too
strict and left the producer untouched, so the underlying fact stayed non-deterministic and the
assertion flapped again on the next window that phrased things differently.

**A third loosening is not an acceptable remedy, and this packet records that as a hard non-goal.**
The two surviving conjuncts are no longer wording canaries — they are the requirement itself.
Conjunct 5 is "the reader can tell which adapter produced this". Conjunct 6 is "the reader is told
no recommendation is produced". Delete them and Feature 010's no-recommendation guarantee has no
assertion behind it anywhere in the repository. The green would be purchased by removing the check,
which is the one repair that makes the product less safe than it was before the bug was filed.

The correct direction is the opposite one: make the fact deterministic, and gate it before publish.

## Impact

- `main` is red. `node scripts/selftest.mjs` exits 1, which trains readers to discount a red suite —
  the same erosion BUG-009 recorded from the other direction.
- A published window can, and in this case did, present a company research tool with no statement
  that it produces no recommendation. That is the disclosure Feature 010 exists to make.
- The validator passes the bad payload, so the defect is discovered after publish rather than
  before it. Every future window is a fresh coin flip.

## Artifacts

| Artifact | Purpose |
|---|---|
| `bug.md` | this file |
| `spec.md` | the invariant that must hold |
| `design.md` | root cause, fix design, gate design, rejected alternatives |
| `scopes.md` | three scopes with Gherkin, test plan, and DoD |
| `report.md` | executed evidence for every figure above |
| `scenario-manifest.json` | scenario contract registry |
| `uservalidation.md` | acceptance checklist, shipped unchecked |
| `state.json` | execution state |
