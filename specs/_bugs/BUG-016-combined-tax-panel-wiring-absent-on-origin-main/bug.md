# BUG-016: The Combined Tax Panel Is Absent From The Deployed Branch, So Its Tests Assert Against A Panel That Is Not There

- **Status:** Fixed — awaiting independent verification
- **Severity:** Critical — the blocking deploy gate is red, so nothing ships
- **Surface:** `.github/workflows/pages.yml` job `verify`, step `Full browser suite (blocking)`
- **Owning feature:** `specs/022-federal-preferential-and-state-income-tax`
- **Filed at commit:** `7d592cf1b`
- **Measured at commit:** `7d592cf1b`

## Why This Packet Exists

The deploy gate has been red for eleven consecutive completed runs. `deploy` declares
`needs: verify`, so a red `verify` skips deployment entirely and the published site stops
advancing. Six of the thirty-one failures belong to this repository's tax slice and have a
single, mechanical cause that is fully established below. The remaining twenty-five belong
elsewhere and are attributed, not investigated, in `## Ownership Of The Other Twenty-Five`.

This packet files the defect. It fixes nothing, pushes nothing, and moves no branch.

## Summary

`tests/lifetime-tax-combined.spec.mjs` is present on `origin/main`. The combined-settlement
panel it exercises is not. Every selector the six failing tests wait for is absent from
`lifetime-tax-strategy-lab.html` on `origin/main`, so the assertions time out against a page
that renders only the single-jurisdiction settlement region.

The wiring is not merely unpushed. It was committed, it reached the shared history, and a
merge resolution discarded it — then three further merges discarded it again. The common
ancestor of the local and remote tips still lacks it. See `## Root Cause`.

## Reproduction

The gate is reproduced by observation of the deployed branch; no local mutation is required.

1. List completed runs of the deploy workflow on `main` and observe the unbroken failure run.
2. Inspect run `32651572136`: job `verify` fails at step `Full browser suite (blocking)`, and
   job `deploy` reports `skipped`.
3. Count the wiring markers in `lifetime-tax-strategy-lab.html` at the local tip and at
   `origin/main`.
4. Download the run's `playwright-report` artifact and read the per-test `error-context.md`
   for the six `lifetime-tax-combined` directories.

Every step above was executed during filing. Commands and verbatim output are in
`report.md`.

## Expected vs Actual

**Expected.** A spec file that ships on a branch exercises behaviour that also ships on that
branch. The deploy gate is green and `deploy` runs.

**Actual.** `origin/main` carries the tests and the computation module but not the page
wiring. Six tests wait on selectors that never appear, `verify` exits 1, and `deploy` is
skipped.

## The Failure Is Three Selectors, Not One

The six failures do not share one symptom. They share one cause, reached through three
different selectors, and this distinction matters because a fix verified against only the
first selector would leave five tests red.

| Selector waited for | Failing tests | Reported error |
|---|---|---|
| `#combinedCurveChart` | 3 | `expect(locator).toHaveAttribute(expected) failed` … `element(s) not found`, 5000ms |
| `#combinedSettlementCard [data-rl-unavailable]` | 2 | `expect(locator).toHaveAttribute(expected) failed` … `element(s) not found`, 5000ms |
| `[data-rl-value="combinedFederalLeg"]` | 1 | `locator.textContent: Test timeout of 30000ms exceeded` |

Only one of the six is the thirty-second timeout. The other five fail on the five-second
`toHaveAttribute` budget with `element(s) not found`, which is the same absence reported
sooner. Each `error-context.md` carries an accessibility snapshot of the page as rendered,
and in all six the snapshot shows only the region titled *One declared year settled against
one resolved federal rule pack*. No combined region exists to be found.

## Marker Presence, Local Tip Versus Deployed Branch

| Marker in `lifetime-tax-strategy-lab.html` | local `main` | `origin/main` |
|---|---|---|
| `combinedFederalLeg` | 2 | 0 |
| `rltaxcombined.js` script tag | 1 | 0 |
| `combinedCurveChart` | 3 | 0 |
| `combinedSettlementCard` | 2 | 0 |

The absence holds at **every one of the eleven** commits in the failing run, and at each of
them `tests/lifetime-tax-combined.spec.mjs` is present. This is a standing property of the
branch, not a transient of one commit.

## The Module Shipped; Only The Wiring Did Not

`rltaxcombined.js` is present on `origin/main` and its blob is byte-identical to the local
copy. The computation the panel needs is already deployed. What is missing is the markup and
the script tag that mount it. This narrows the remedy considerably and is not visible from
the failing test names.

## The Deployed Spec Predates A Local Rename

One failing test on `origin/main` is named *the request ledger stays empty across the full
combined workflow*. That title was retired locally in commit `8135cb540`, which replaced it
with a claim the code can actually keep. The deployed spec blob and the local spec blob
differ. `origin/main` is therefore running an older revision of the spec file as well as an
older revision of the page.

## Ownership Of The Other Twenty-Five

Twenty-five of the thirty-one failures are outside this packet's scope and were attributed,
not diagnosed. Attribution was established from the last commit to touch each spec file, not
assumed.

| Spec file | Failures | Last commit to touch it | Attribution |
|---|---|---|---|
| `tests/portfolio-survival-brief.spec.mjs` | 16 | `9ee3c39ae` *feat(portfolio): expand survival analysis foundations* | not this packet |
| `tests/portfolio-survival-foundation.spec.mjs` | 5 | `9ee3c39ae` | not this packet |
| `tests/portfolio-survival-mobile.spec.mjs` | 1 | `9ee3c39ae` | not this packet |
| `tests/volatility-sizing-lab.spec.mjs` | 3 | `420246341` *spec 027: run all 12 specialist phases…* | not this packet |
| `tests/lifetime-tax-combined.spec.mjs` | 6 | `8135cb540` *SCN-022-013: retire "ledger stays empty" false claim* | **this packet** |

Twenty-two of the twenty-five are the `portfolio-survival-*` family and twenty-one of those
report the same first error, `the four generic windows must load from market-brief.config.json`,
which is a single shared cause with a single owner. No file in that family was read, edited
or staged by this packet.

## Impact

- The blocking gate is red, so `deploy` is skipped and the published site does not advance.
- The redness is not attributable to one owner, which raises the cost of every diagnosis: a
  reader seeing thirty-one failures cannot tell which are theirs without the split above.
- The six tax failures will not clear on their own. The wiring is absent at the merge base of
  the two tips, so no amount of waiting on the remote line restores it.

## Root Cause

The wiring was committed and then discarded by merge, four times.

1. `c58719fb4` *feat(022): wire combined federal+state settlement and curve into the route*
   introduced the markup. Its first parent carries zero markers and the commit itself carries
   two, so it is the introducing commit.
2. Merge `612382ddf` (*Merge remote-tracking branch 'origin/main' into HEAD*) took one parent
   carrying two markers and one carrying zero, and resolved to **zero**.
3. Merges `a30410572`, `e8235b996` and `1e765338d` each repeated the same loss: one parent
   carried the wiring, the result did not.
4. The merge base of `main` and `origin/main`, `4b087cf15`, still carries zero markers.
5. The local line later restored the wiring in commits that are not on `origin/main`. The
   remote line never did. The two tips now hold different blobs of the same page.

This is a recurring merge-resolution regression, not a one-off omission and not a case of an
implementation that was never written. `c58719fb4` is an ancestor of `origin/main`; its
content is not.

## Scope Of This Packet

**In scope.** Recording the defect, its evidence, its root cause, and the ownership split.

**Out of scope, deliberately.**

- Fixing the page. No source file was modified.
- Pushing, merging, rebasing, or moving any branch or remote. Whether and how to reconcile the
  two resolutions is the operator's decision.
- The twenty-five failures owned elsewhere.
- Adding a selftest assertion. An assertion that fails on a known-open defect would turn a
  green suite red for work nobody is yet authorised to do.

## Artifacts

- `spec.md` — the behaviour being specified
- `design.md` — mechanism, root-cause isolation, and remedy options
- `scopes.md` — the fix scopes and their Definition of Done
- `report.md` — executed evidence behind every claim above
- `uservalidation.md` — filing readiness and the human acceptance record
- `state.json` — control-plane state
