# Report: BUG-016 — Combined Tax Panel Absent From The Deployed Branch

- **Filed at commit:** `7d592cf1b`
- **Measured at commit:** `7d592cf1b`
- **Phase:** bug (filing only)
- **Delivered behaviour:** none

## Summary

Eleven consecutive completed runs of the deploy workflow have failed at the blocking browser
step, so `deploy` is skipped and nothing publishes. Run `32651572136` reports thirty-one
failures against six hundred and seventy-seven passes. Six of the thirty-one belong to this
repository's tax slice and are caused by three selectors that do not exist on the deployed
revision of the page. The computation module is deployed and byte-identical to the local
copy; only the markup and script tag that mount it are absent. The absence is not an
un-landed change: it was introduced in `c58719fb4`, discarded by merge `612382ddf`, and
discarded again by three later merges.

## Evidence Provenance

Every block below was produced by a command executed during this filing session against the
repository at `7d592cf1b`. Nothing is reproduced from a prior description.

Three claims carry a stated method rather than a direct observation and are labelled where
they appear:

- The count of thirty-one failures per spec file was derived from the canonical failure list
  the run printed between its `31 failed` header and its `677 passed` footer, and
  cross-checked independently against the directory names in the downloaded report artifact.
- The absence of worker force-kills in the run is established by arithmetic reconciliation
  (`31 + 677 = 708`, matching the run's own `Running 708 tests`), leaving no test unaccounted
  for. It is not established by matching a `force-killed` string.
- Ownership of the twenty-five failures outside this packet is established from the last
  commit to touch each spec file. No file in those specs was read, edited, or staged.

Long command output is recorded as a bounded evidence block carrying the command, exit code,
line count, and a `sha256` over every line the command produced. The hash is re-derivable;
the note under each block carries the verification form.

## Test Evidence

### The gate has been red for eleven consecutive completed runs

```
$ gh run list --workflow=pages.yml --branch=main --limit 14 --json databaseId,conclusion,createdAt,headSha
32651572136 failure 2026-08-23T16:24:36Z fb1033aad
32637042777 failure 2026-08-23T11:36:56Z b7a9927b9
32625123259 failure 2026-08-23T07:16:23Z e1294d255
32624387536 failure 2026-08-23T07:00:02Z 804c70383
32624231834 failure 2026-08-23T06:56:24Z d00f1c99e
32622551770 failure 2026-08-23T06:17:33Z a14170a96
32619077008 failure 2026-08-23T04:55:52Z 4b087cf15
32618709781 failure 2026-08-23T04:47:00Z a185360f0
32618306685 failure 2026-08-23T04:36:58Z d1a3b42b7
32617226323 failure 2026-08-23T04:10:52Z 49985d5f0
32616864615 failure 2026-08-23T04:02:35Z 1e31035fb
32616689769 cancelled 2026-08-23T03:58:35Z 45848d76a
32616483834 cancelled 2026-08-23T03:53:39Z f55db0d55
```

Eleven failures without interruption, from `32616864615` to `32651572136`.

### The failure is the blocking browser step, and deploy is skipped

```
$ gh run view 32651572136 --json jobs
JOB verify conclusion=failure
   step: Set up job -> success
   step: Checkout -> success
   step: Setup Node -> success
   step: Validate Node dependency source lock -> success
   step: Self-test (all assertions) -> success
   step: Install source-locked browser test runner -> success
   step: Verify checkout-local Playwright runner -> success
   step: Build registered Pages artifact for browser verification -> success
   step: Full browser suite (blocking) -> failure
   step: Upload browser report -> success
   step: Post Setup Node -> skipped
   step: Post Checkout -> success
   step: Complete job -> success
JOB notify-failure conclusion=success
   step: Set up job -> success
   step: Open or update the failure issue -> success
   step: Complete job -> success
JOB deploy conclusion=skipped
```

The self-test step passes. Only the browser step fails. `deploy` reports `skipped`, and the
workflow declares the dependency that causes it:

```
$ grep -nE '^\s{0,4}(jobs|[a-z-]+):\s*$|^\s{4}(needs|if|runs-on):|^\s{6}- name:|playwright test' .github/workflows/pages.yml
15:  verify:
18:    runs-on: ubuntu-latest
56:      run: npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --workers=2 --reporter=list
68:  deploy:
69:    needs: verify
77:    runs-on: ubuntu-latest
109:  notify-failure:
110:    needs: [ verify, deploy ]
111:    if: ${{ failure() || cancelled() }}
```

### The run's own counts, and the reconciliation that rules out worker teardown

```
# CI run 32651572136 failing-step log (gh --log-failed)
$ gh run view 32651572136 --repo pkirsanov/research-lab --log-failed
exit: 0
lines: 2149
sha256: 760ad9e4e2ac3e6b00eb377a5282dd6a390d703b01e9bdd19568cdafd546d569
--- from the head of the step ---
verify  Full browser suite (blocking)  Run npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --workers=2 --reporter=list
verify  Full browser suite (blocking)  Running 708 tests using 2 workers
--- from the summary ---
verify  Full browser suite (blocking)    31 failed
verify  Full browser suite (blocking)    677 passed (12.5m)
verify  Full browser suite (blocking)  ##[error]Process completed with exit code 1.
```

`31 + 677 = 708`, which equals the run's own `Running 708 tests`. Every test is accounted for
as either a pass or a failure. No test is missing, and the summary carries no flaky,
interrupted, or did-not-run line. A run that force-kills a worker loses its in-flight tests
from that accounting; this run loses none. That is the basis for treating these as real
failures rather than a teardown artefact.

Verification form for the block above:

```
bash .github/bubbles/scripts/evidence-capture.sh --verify 760ad9e4e2ac3e6b00eb377a5282dd6a390d703b01e9bdd19568cdafd546d569 -- gh run view 32651572136 --repo pkirsanov/research-lab --log-failed
```

### The thirty-one failures split five ways

Derived from the canonical failure list the run printed between its `31 failed` header and
its `677 passed` footer:

```
$ ... | sed -n '/  31 failed/,/  677 passed/p' | grep -E '\[system-chrome\] › tests/' | grep -oE 'tests/[a-z0-9-]+\.spec\.mjs' | sort | uniq -c | sort -rn
  16 tests/portfolio-survival-brief.spec.mjs
   6 tests/lifetime-tax-combined.spec.mjs
   5 tests/portfolio-survival-foundation.spec.mjs
   3 tests/volatility-sizing-lab.spec.mjs
   1 tests/portfolio-survival-mobile.spec.mjs
--- total list lines ---
31
```

Cross-checked independently against the directory names in the downloaded report artifact,
which reproduce the same five-way split and the same per-spec counts.

### Ownership of the twenty-five failures outside this packet

```
$ git log -1 --format='%h %ad %s' --date=short -- <each failing spec file>
tests/lifetime-tax-combined.spec.mjs           8135cb540 2026-08-22 SCN-022-013: retire "ledger stays empty" false claim (atomic set 2/8)
tests/portfolio-survival-brief.spec.mjs        9ee3c39ae 2026-08-20 feat(portfolio): expand survival analysis foundations
tests/portfolio-survival-foundation.spec.mjs   9ee3c39ae 2026-08-20 feat(portfolio): expand survival analysis foundations
tests/portfolio-survival-mobile.spec.mjs       9ee3c39ae 2026-08-20 feat(portfolio): expand survival analysis foundations
tests/volatility-sizing-lab.spec.mjs           420246341 2026-08-22 spec 027: run all 12 specialist phases and close every agent-closeable gat
```

Six failures trace to this packet's own atomic-set commit. Twenty-two trace to the portfolio
survival work and three to the spec 027 work. Twenty-one of the twenty-two portfolio failures
report the identical first error, `the four generic windows must load from
market-brief.config.json`, so that family is one shared cause rather than twenty-two.

### The three absent selectors

Read from the per-test `error-context.md` files in the run's downloaded `playwright-report`
artifact:

```
$ for d in <the six lifetime-tax result dirs>; do grep -m1 -E '^Error: |^Test timeout of ' "$d/error-context.md"; done
…se-with-that-leg-own-reason   | Error: expect(locator).toHaveAttribute(expected) failed
…has-a-text-equivalent-table   | Error: expect(locator).toHaveAttribute(expected) failed
…-the-full-combined-workflow   | Error: expect(locator).toHaveAttribute(expected) failed
…nd-shows-no-combined-figure   | Error: expect(locator).toHaveAttribute(expected) failed
…tep-to-a-named-jurisdiction   | Error: expect(locator).toHaveAttribute(expected) failed
…two-independent-settlements   | Test timeout of 30000ms exceeded.
```

The five `toHaveAttribute` failures name two selectors:

```
Locator: locator('#combinedCurveChart')
Timeout: 5000ms
Error: element(s) not found
```

```
Locator: locator('#combinedSettlementCard [data-rl-unavailable]').first()
Expected: "RLTAX-THRESHOLD-UNAVAILABLE"
Timeout: 5000ms
Error: element(s) not found
```

The sixth names the third:

```
Error: locator.textContent: Test timeout of 30000ms exceeded.
  - waiting for locator('[data-rl-value="combinedFederalLeg"]')
```

Only one of the six is the thirty-second timeout. Across the whole run only three result
directories mention a 30000ms test timeout at all, so a description of this run as dominated
by timeouts is not what the artifact shows.

### The page rendered without the combined region

Each `error-context.md` embeds an accessibility snapshot of the page as it rendered. All six
show the same thing — a single-jurisdiction settlement region and no combined region:

```
- main:
  - region "One declared year settled against one resolved federal rule pack":
    - text: Settled
    - strong: One declared year settled against one resolved federal rule pack
    - text: Every figure below carries the legal standing of the rule it came from, and every domain this slice cannot price is named.
    - group "Detail level":
      - button "Simple" [pressed]
```

### The wiring markers, local tip against deployed branch

```
$ for m in combinedFederalLeg rltaxcombined.js combinedCurveChart; do ... done
combinedFederalLeg     local=2 origin=0
rltaxcombined.js       local=1 origin=0
combinedCurveChart     local=3 origin=0

$ printf 'local=%s origin=%s\n' "$(grep -c 'combinedSettlementCard' lifetime-tax-strategy-lab.html)" "$(git show origin/main:lifetime-tax-strategy-lab.html | grep -c 'combinedSettlementCard')"
local=2 origin=0
```

The page file itself exists on the deployed branch and is smaller by roughly fifty-two
thousand bytes:

```
$ git cat-file -t origin/main:lifetime-tax-strategy-lab.html
blob
origin file bytes:   319221
local file bytes:   371100
```

### The absence holds at every commit in the failing run

```
$ for each streak commit: git show <sha>:lifetime-tax-strategy-lab.html | grep -c <marker>
run=32651572136 sha=fb1033aad combinedFederalLeg=0 combinedCurveChart=0 combinedSettlementCard=0 specPresent=blob
run=32637042777 sha=b7a9927b9 combinedFederalLeg=0 combinedCurveChart=0 combinedSettlementCard=0 specPresent=blob
run=32625123259 sha=e1294d255 combinedFederalLeg=0 combinedCurveChart=0 combinedSettlementCard=0 specPresent=blob
run=32624387536 sha=804c70383 combinedFederalLeg=0 combinedCurveChart=0 combinedSettlementCard=0 specPresent=blob
run=32624231834 sha=d00f1c99e combinedFederalLeg=0 combinedCurveChart=0 combinedSettlementCard=0 specPresent=blob
run=32622551770 sha=a14170a96 combinedFederalLeg=0 combinedCurveChart=0 combinedSettlementCard=0 specPresent=blob
run=32619077008 sha=4b087cf15 combinedFederalLeg=0 combinedCurveChart=0 combinedSettlementCard=0 specPresent=blob
run=32618709781 sha=a185360f0 combinedFederalLeg=0 combinedCurveChart=0 combinedSettlementCard=0 specPresent=blob
run=32618306685 sha=d1a3b42b7 combinedFederalLeg=0 combinedCurveChart=0 combinedSettlementCard=0 specPresent=blob
run=32617226323 sha=49985d5f0 combinedFederalLeg=0 combinedCurveChart=0 combinedSettlementCard=0 specPresent=blob
run=32616864615 sha=1e31035fb combinedFederalLeg=0 combinedCurveChart=0 combinedSettlementCard=0 specPresent=blob
```

At every one of the eleven, the spec is present as a blob and all three markers count zero.

### The computation module shipped; only the wiring did not

```
$ printf 'origin_sha=%s\nlocal_sha=%s\n' "$(git rev-parse origin/main:rltaxcombined.js)" "$(git hash-object rltaxcombined.js)"
origin_sha=a24991f8cab5c54964c4efbe74d99fd7d1788954
local_sha=a24991f8cab5c54964c4efbe74d99fd7d1788954

$ printf 'origin_sha=%s\nlocal_sha=%s\n' "$(git rev-parse origin/main:tests/lifetime-tax-combined.spec.mjs)" "$(git hash-object tests/lifetime-tax-combined.spec.mjs)"
origin_sha=7515417fb63aea4af494c899d93461e0e64d96b3
local_sha=ede1a0b8a47bad86a3fa039c1b6626cada1b7ddf
```

The module is the same blob at both tips. The spec is not, which is the next block.

### The deployed spec predates a local rename

```
$ git show origin/main:tests/lifetime-tax-combined.spec.mjs | grep -oE "test\(['\"][^'\"]+"
Regression: SCN-022-013 the request ledger stays empty across the full combined workflow

$ grep -oE "test\(['\"][^'\"]+" tests/lifetime-tax-combined.spec.mjs
Regression: SCN-022-013 the request ledger does not grow after first paint and every entry is a declared same-origin read across the full combined workflow
```

The commit that made the change, verified as a commit object:

```
$ git cat-file -t 8135cb540
commit
$ git log -1 --format='%H%n%an%n%ad%n%s' 8135cb540
8135cb5407bbbf9e1aafedbddddf2a6accb1255d
pkirsanov
Sat Aug 22 22:02:17 2026 -0700
SCN-022-013: retire "ledger stays empty" false claim (atomic set 2/8)

$ git show 8135cb540 -- tests/lifetime-tax-combined.spec.mjs | grep -E '^[+-].*request ledger'
-test('Regression: SCN-022-013 the request ledger stays empty across the full combined workflow', async ({ page }) => {
+test('Regression: SCN-022-013 the request ledger does not grow after first paint and every entry is a declared same-origin read across the full combined workflo
```

The deployed branch still runs the retired title. The corresponding failure directory in the
run's artifact carries that older name, which independently dates the deployed spec revision
to before this commit.

### Root cause: the wiring was committed, then discarded by merge four times

```
$ git log --all --oneline -S'combinedFederalLeg' -- lifetime-tax-strategy-lab.html
c58719fb4 feat(022): wire combined federal+state settlement and curve into the route

$ git merge-base --is-ancestor c58719fb4 origin/main && echo yes || echo no
yes

$ printf 'markers=%s parentMarkers=%s date=%s\n' ...
commit=c58719fb4 markers=2 parentMarkers=0 date=2026-08-19 17:49:24 -0700
```

The introducing commit is an ancestor of the deployed branch. Its content is not. The full
history of the file on the deployed branch shows why:

```
$ git log --full-history --format=%H origin/main -- lifetime-tax-strategy-lab.html
1e765338d markers=0 parents=2 merge: publish Feature 021 and 022 validation evidence
e8235b996 markers=0 parents=2 merge: reconcile local research work with remote main
a30410572 markers=0 parents=2 merge origin/main into local main
612382ddf markers=0 parents=2 Merge remote-tracking branch 'origin/main' into HEAD
c58719fb4 markers=2 parents=1 feat(022): wire combined federal+state settlement and curve into the r
017a5cae6 markers=0 parents=1 feat(022): wire state tax settlement into the route with residency dec
7e7b9550d markers=0 parents=1 feat(022): wire state tax settlement into the route with residency dec
50cf85d92 markers=0 parents=2 Merge remote-tracking branch 'origin/main'
e71772915 markers=0 parents=1 feat(022): add surtax summary, conversion asymmetry and tax leg ledger
cff40e23d markers=0 parents=2 Merge remote-tracking branch 'origin/main'
b9d92a3f1 markers=0 parents=1 Add Lifetime Tax Strategy Lab: federal, state, property, rental and re
```

Each of the four merges after `c58719fb4` had one parent carrying the wiring and one without,
and each resolved to without:

```
--- merge 612382ddf : 2026-08-19 Merge remote-tracking branch 'origin/main' into HEAD
    descendantOf_c58719fb4=yes result_markers=0
    parent1=5eb399a06 markers=2 docs(025): commit the company intelligence lab tool
    parent2=9c027cd0b markers=0 fix(tests): correct scope attribution and roll the p
--- merge a30410572 : 2026-08-19 merge origin/main into local main
    descendantOf_c58719fb4=yes result_markers=0
    parent1=5e12e7950 markers=2 docs(brief): document the closed verb vocabulary in
    parent2=92969b8d3 markers=0 market-brief: auto-refresh + narrative 2026-08-20 02
--- merge e8235b996 : 2026-08-20 merge: reconcile local research work with remote main
    descendantOf_c58719fb4=yes result_markers=0
    parent1=c2c83073e markers=0 docs(015): re-plan scope 04 against the shipped reso
    parent2=bcfcba6f8 markers=2 docs(021-01): record harness RED/GREEN for TP-01-01,
--- merge 1e765338d : 2026-08-20 merge: publish Feature 021 and 022 validation evidence
    descendantOf_c58719fb4=yes result_markers=0
    parent1=02042f60f markers=0 fix(BUG-014): tell both lanes how to choose a confid
    parent2=4038d6543 markers=2 Feature 022 Scope 05: observe the combined unattribu
```

The merge base of the two tips still carries none of it, and the two tips now hold different
blobs of the same page:

```
$ git merge-base main origin/main
4b087cf15 2026-08-22 21:55:49 -0700 horizon-ladder-lab: the gate notice must describe the column
mergeBase markers=0

main        8ffe663489cb6307801d738f8850207de6b09d84 markers=2
origin/main 4c64c6a2cb206b5261798f76d7ff928583c82e4f markers=0
```

### Branch divergence at filing time

```
$ git rev-list --left-right --count main...origin/main
133     10
```

One hundred and thirty-three commits ahead, ten behind.

## Filing Verification

### The suite is unchanged

```
# selftest baseline before filing
$ node scripts/selftest.mjs
exit: 0
lines: 3842
sha256: 29b4729e52f80d26816336f9ff1b0d21e1714bd4eb02c8638ccebb48922bb127
--- from the tail ---
================================================
Research-Lab self-test: 3384 passed, 0 failed
================================================
```

Verification form:

```
bash .github/bubbles/scripts/evidence-capture.sh --verify 29b4729e52f80d26816336f9ff1b0d21e1714bd4eb02c8638ccebb48922bb127 -- node scripts/selftest.mjs
```

### Nothing outside this packet was touched

No source file, test, workflow, pack, or `scripts/selftest.mjs` was modified. The only
additions are this packet's seven artifacts. No branch or remote was pushed, merged, rebased,
or otherwise moved.

## Observations Beyond The Filed Defect

**The report artifact over-reports.** The uploaded `playwright-report` contains thirty-five
result directories while the blocking step reports thirty-one failures. Four directories —
for the bond regime lab, the MSFT July market reference, the Palm Springs rental lab, and the
simple model adapter — correspond to no failure in the canonical list. A reader who counts
directories instead of reading the summary will over-count failures by four and will
mis-attribute four specs. This is an evidence-fidelity issue in how the artifact is
assembled, not a product defect, and it is recorded here rather than filed separately.

**One shared cause dominates the other owner's failures.** Twenty-one of the twenty-two
portfolio survival failures report the identical first error. Their owner is likely looking at
one defect, not twenty-two.

## Completion Statement

This packet is filed and unstarted. It records a defect, its executed grounding, its root
cause, and a decision request. It delivers no behaviour.

Zero Definition of Done items are ticked across all three scopes and the cross-scope set, and
none should be. Scope 1 is a branch-reconciliation decision that this run was forbidden to
make and that no evidence selects. Scope 2 is defined only once Scope 1 is answered. Scope 3
is undecided by design.

Status is `in_progress` and certification status matches it. `certifiedCompletedPhases` is
empty: phase certification belongs to the validating agent, and no independent party has
re-derived any measurement recorded here.
