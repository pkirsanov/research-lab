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

## Durable Guard Added After The Filing Above

Everything below postdates the Completion Statement. A separate run was directed to add the
fast check that Scope 3 describes. The Completion Statement above is left exactly as filed and
is accurate for the run that wrote it.

**No Definition of Done item is ticked by this work, and none should be.** Scope 3 carries
`Disposition: undecided — Scope 1 records whether this is taken or declined`, and Scope 1 is
the branch-reconciliation decision that this run was again forbidden to make. Ticking Scope 3
would decide Scope 1 by implication. The evidence below is recorded so that whoever answers
Scope 1 can tick against executed output rather than re-run it.

### The guard, and how its required sets are derived

Four assertions were appended at the tail of `scripts/selftest.mjs`, in a group named
`Lifetime tax — the route wires every module and panel marker it depends on (BUG-016)`.

Neither required set is written down. Both are derived, so neither rots as the tool grows, and
neither can be satisfied by deleting the markup that would otherwise define it:

- **Modules** are every `rltax*.js` in the repo root, read with `readdirSync`. W1 establishes
  the premise that licenses this: the `rltax` family is consumed by exactly one page, so a
  module sitting on disk that the route never loads is a dropped tag rather than a spare part.
- **Markers** are the DOM anchors that `tests/lifetime-tax-combined.spec.mjs` actually locates
  — `'#combined…'` id locators for W3, `data-rl-value="combined…"` names for W4.

Deriving the markers from the browser spec rather than from the route is the load-bearing
choice, and it corrects an assumption worth stating plainly. **On `origin/main` the route does
not read `window.RLTAXCOMBINED` either.** The panel markup, the script tag and the module's
only reader were dropped by the same resolution, together. A guard that asked "does the route
wire what the route references" would therefore have agreed with the damage and passed on an
empty page. The browser spec survived all four merges intact, so it is the stable side of the
comparison.

Each derivation carries a floor — `modules >= 10`, id anchors `>= 8`, value names `>= 5` — so
emptying a derivation's source fails here instead of passing vacuously.

The assertion text, as printed on a coherent branch:

```text
Lifetime tax — the route wires every module and panel marker it depends on (BUG-016)
  ✓ W1: the rltax module family is exclusive to lifetime-tax-strategy-lab.html — 14 modules on disk, other HTML consumers: none — which is what licenses W2 to require the route to load every one of them
  ✓ W2: lifetime-tax-strategy-lab.html carries a <script src> for every rltax module on disk — 14 modules, unwired: none — an unwired module still ships its file and still passes its own unit checks, but never loads in the browser, so the panel it powers is silently absent from the page
  ✓ W3: every #combined anchor tests/lifetime-tax-combined.spec.mjs locates exists as an element id in the route — 10 anchors, missing: none — a missing anchor is precisely what turns a browser assertion into a 30s locator timeout
  ✓ W4: every combined data-rl-value name tests/lifetime-tax-combined.spec.mjs locates appears in the route — 6 names, missing: none — the route script emits these nodes, so a name it never mentions means the combined settlement is not rendered at all, not merely mislabelled
```

### The guard fires on the deployed branch, read directly from the ref

Before the guard was written, its two rules were evaluated against `origin/main` content read
straight out of the ref, to confirm the guard would not pass vacuously on the very branch the
defect is on. Seventeen findings, from a spec that is present and intact at that ref:

```text
$ git ls-tree origin/main -- tests/lifetime-tax-combined.spec.mjs
100644 blob 7515417fb63aea4af494c899d93461e0e64d96b3    tests/lifetime-tax-combined.spec.mjs
origin_spec_id_locators=10 origin_spec_value_locators=6

=== A-set (10 id locators) vs ORIGIN route ===
  MISSING  combinedCurveChart
  MISSING  combinedCurveIncompleteLabel
  MISSING  combinedCurveTextEquivalent
  MISSING  combinedCurveTextEquivalentBody
  MISSING  combinedIndependenceLine
  MISSING  combinedItemizedNotice
  MISSING  combinedLegBreakdownBody
  MISSING  combinedPackYearsBody
  MISSING  combinedRefusal
  MISSING  combinedSettlementCard

=== B-set (6 value locators) vs ORIGIN route ===
  MISSING  combined-federal-total
  MISSING  combined-state-total
  MISSING  combined-total
  MISSING  combinedFederalLeg
  MISSING  combinedStateLeg
  MISSING  combinedTotalTax

=== module wiring vs ORIGIN route ===
  UNWIRED  rltaxcombined.js
(only UNWIRED shown)
```

This is the Scope 3 condition stated as "the check is not satisfiable by a branch that carries
the spec and not the selectors", demonstrated against that branch's real content.

### Probe 1 — a merge drops the `rltaxcombined.js` script tag

```text
$ bash scripts/red-green-probe.sh \
    --file lifetime-tax-strategy-lab.html \
    --find '<script src="rltaxcombined.js"></script>' \
    --replace '<!-- probe: combined module tag absent -->' \
    --label 'BUG-016 W2 — merge drops the rltaxcombined.js script tag' \
    --bound 600 --summary-match 'W2: ' \
    -- node scripts/selftest.mjs
=== RED/GREEN PROBE EVIDENCE ===
label:            BUG-016 W2 — merge drops the rltaxcombined.js script tag
file:             lifetime-tax-strategy-lab.html
mutation:         <script src="rltaxcombined.js"></script>  ->  <!-- probe: combined module tag absent -->   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: W2: lifetime-tax-strategy-lab.html carries a <script src> for every rltax module on disk — 14 modules, unwired: rltaxcombined.js — an unwired module still ships its file and still pass
green-exit:       0
green-summary:      ✓ W2: lifetime-tax-strategy-lab.html carries a <script src> for every rltax module on disk — 14 modules, unwired: none — an unwired module still ships its file and still passes its own unit ch
revert-verified:  yes (committed=8ffe663489cb6307801d738f8850207de6b09d84 restored=8ffe663489cb6307801d738f8850207de6b09d84)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
PROBE1_EXIT=0
```

The mutation reproduces the exact shape of the defect: the module file is untouched and every
unit assertion over it still passes, while the page no longer loads it. The RED summary names
`rltaxcombined.js` by name. `--summary-match` is pinned to the assertion's own `W2: ` token
rather than to the aggregate pass count, because a concurrent session moves the aggregate.

### Probe 2 — a merge drops the combined curve anchor from the markup

```text
$ bash scripts/red-green-probe.sh \
    --file lifetime-tax-strategy-lab.html \
    --find 'id="combinedCurveChart"' \
    --replace 'id="probeRemovedCurveChart"' \
    --label 'BUG-016 W3 — merge drops the combined curve anchor from the markup' \
    --bound 600 --summary-match 'W3: ' \
    -- node scripts/selftest.mjs
pre-probe tree (must be empty): []
=== RED/GREEN PROBE EVIDENCE ===
label:            BUG-016 W3 — merge drops the combined curve anchor from the markup
file:             lifetime-tax-strategy-lab.html
mutation:         id="combinedCurveChart"  ->  id="probeRemovedCurveChart"   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: W3: every #combined anchor tests/lifetime-tax-combined.spec.mjs locates exists as an element id in the route — 10 anchors, missing: combinedCurveChart — a missing anchor is precisely w
green-exit:       0
green-summary:      ✓ W3: every #combined anchor tests/lifetime-tax-combined.spec.mjs locates exists as an element id in the route — 10 anchors, missing: none — a missing anchor is precisely what turns a browser
revert-verified:  yes (committed=8ffe663489cb6307801d738f8850207de6b09d84 restored=8ffe663489cb6307801d738f8850207de6b09d84)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
PROBE2_EXIT=0
```

`combinedCurveChart` is the anchor behind one of the three absent selectors recorded earlier in
this report. The neighbouring `id="combinedCurveChartFallback"` is deliberately not a false
match: the assertion looks for `id="combinedCurveChart"` with its closing quote, so the longer
id does not satisfy the shorter one.

### Probe 3 — a merge drops the combined federal leg value name

Two probes were required. A third was run because the markers split into two families that fail
independently, and a guard proven only on the id family would leave the other half unproven.

```text
$ bash scripts/red-green-probe.sh \
    --file lifetime-tax-strategy-lab.html \
    --find '"combinedFederalLeg"' \
    --replace '"probeRemovedFederalLeg"' \
    --label 'BUG-016 W4 — merge drops the combined federal leg value name' \
    --bound 600 --summary-match 'W4: ' \
    -- node scripts/selftest.mjs
pre-probe tree (must be empty): []
=== RED/GREEN PROBE EVIDENCE ===
label:            BUG-016 W4 — merge drops the combined federal leg value name
file:             lifetime-tax-strategy-lab.html
mutation:         "combinedFederalLeg"  ->  "probeRemovedFederalLeg"   (2 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: W4: every combined data-rl-value name tests/lifetime-tax-combined.spec.mjs locates appears in the route — 6 names, missing: combinedFederalLeg — the route script emits these nodes, so
green-exit:       0
green-summary:      ✓ W4: every combined data-rl-value name tests/lifetime-tax-combined.spec.mjs locates appears in the route — 6 names, missing: none — the route script emits these nodes, so a name it never ment
revert-verified:  yes (committed=8ffe663489cb6307801d738f8850207de6b09d84 restored=8ffe663489cb6307801d738f8850207de6b09d84)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
PROBE3_EXIT=0
```

The mutation reports two occurrences, which matters: `combinedFederalLeg` appears twice in the
route — once in the declared value-name list and once where the node is built — and W4 is only
honest if it fails when the name is gone from both. The harness substituted both, and it failed.

All three probes reverted to the committed blob `8ffe663489cb6307801d738f8850207de6b09d84`,
hash-verified by the harness on each run.

### Validation after the guard landed

The suite gains exactly four assertions and loses none. The baseline recorded at filing time was
`3388 passed, 0 failed`; it is now `3392 passed, 0 failed`.

```text
$ node scripts/selftest.mjs
exit: 0
lines: 3854
sha256: 986eb21e81eddcb591f56ef4b6f01940e69b60d6f88f970c6e1c3de2468f243a
================================================
Research-Lab self-test: 3392 passed, 0 failed
================================================

$ bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-016-combined-tax-panel-wiring-absent-on-origin-main
Artifact lint PASSED.
ARTIFACT_LINT_EXIT=0

$ echo "[$(git status --porcelain lifetime-tax-strategy-lab.html rltax*.js)]"
[]
$ git hash-object lifetime-tax-strategy-lab.html
8ffe663489cb6307801d738f8850207de6b09d84
$ git rev-parse HEAD:lifetime-tax-strategy-lab.html
8ffe663489cb6307801d738f8850207de6b09d84
```

The route and every module are byte-identical to their committed blobs, so no probe left residue.

### What this run did not do, and what it hands back

This run added a check and nothing else. It did not push, merge, rebase, or alter any branch,
and it did not restore the panel on the deployed branch. The eleven-run red gate is unchanged,
because the guard reports the condition rather than repairing it.

Two things are routed back rather than decided here:

- **Scope 1 remains unanswered.** Scope 3 is dispositioned `undecided`, with Scope 1 recording
  whether it is taken or declined. The evidence above satisfies Scope 3's Definition of Done on
  the merits, but ticking those boxes would decide Scope 1 by implication, so none are ticked.
- **The guard is not yet wired to run before publication.** Scope 3's implementation plan has
  three steps; this run completed the first two — deciding the check's scope and establishing
  that it fails on the defective condition and passes on a coherent one. The third, wiring it
  where it runs before publication, depends on where the publication gate is defined and was
  not attempted.

One correction to the premise this run was given. The briefing described the defect as the
script tag and the panel markup going missing. That is true, but it understates the loss: the
route's `window.RLTAXCOMBINED` read went with them, so at that ref the page neither loads the
module, renders the panel, nor references the module's namespace anywhere. This is why the
guard derives its markers from the browser spec rather than from the route — the route on the
deployed branch is internally consistent about the panel not existing, and would have satisfied
any guard that only compared the route against itself.

## Independent Re-Verification Of The Three Closing Premises

A later round re-measured the three premises the closing claim rests on, rather than inheriting
them. All three hold, and one of them holds less completely than the claim reads.

**CI conclusion.** `gh run view 32744354615` reports `conclusion=success` at `adbfc86bb`, with
`verify=success`, `deploy=success` and `notify-failure=skipped`. That is the run this report
already cited, and it is confirmed rather than restated.

**The wiring at the deployed ref.** `git show origin/main:lifetime-tax-strategy-lab.html` carries
`combinedFederalLeg` — the marker this packet's own FR-016-004 names — at two sites. Local `HEAD`
and `origin/main` are the same commit, `7df8e0f49`, so the route measured here is the deployed
route.

**The guard is present and live.** All four assertions pass in the current run: `W1` at 14 modules
with no other HTML consumer, `W2` with `unwired: none`, `W3` at 10 anchors with `missing: none`,
`W4` at 6 names with `missing: none`.

### What the guard actually protects — measured, not assumed

Presence is not enforcement, so each of the three checks that can regress was perturbed.

| Check | Perturbation | Verdict |
| --- | --- | --- |
| `W2` module tags | dropped the `rltaxcombined.js` `<script src>` | RED, and it names `unwired: rltaxcombined.js` |
| `W3` anchor ids | renamed `id="combinedSettlementCard"` | RED, `10 anchors` with the anchor reported missing |
| `W4` value names | renamed the `combinedFederalLeg` render call | **GREEN — did not discriminate** |

`W2` catches the exact defect that produced this bug, and it names the module. `W3` is load-bearing
for all ten anchors: each `id="…"` appears exactly once in the route, so losing one takes the count
to zero.

### Finding — `W4` is satisfiable without the render call for three of its six names

The `W4` probe returned exit 7. The cause is that `W4`'s predicate is a substring search for the
quoted name anywhere in the route:

```text
const wMissingValues = wValueMarkers.filter((v) => wRouteSrc.indexOf('"' + v + '"') < 0);
```

Three of the six names it derives also appear in `SIMPLE_FIELDS`, the closed list of decision-level
fields the Simple renderer permits. So the name is quoted twice: once as an allow-list entry and
once at the call that emits the node. Renaming only the emitting call leaves the allow-list entry
in place and `W4` stays green on a route that no longer renders the value.

| `W4` name | quoted occurrences in the route | `W4` load-bearing? |
| --- | --- | --- |
| `combined-federal-total` | 1 | yes |
| `combined-state-total` | 1 | yes |
| `combined-total` | 1 | yes |
| `combinedFederalLeg` | 2 — `SIMPLE_FIELDS` and the render call | no |
| `combinedStateLeg` | 2 — `SIMPLE_FIELDS` and the render call | no |
| `combinedTotalTax` | 2 — `SIMPLE_FIELDS` and the render call | no |

`W4`'s own wording is the narrower claim — that the name *appears* in the route — and it enforces
that faithfully. The gap is between what it enforces and what a reader takes from it, and it lands
on `combinedFederalLeg` specifically, which is the marker FR-016-004 cites as its exemplar.

This is not a hole in the fix. The panel is wired, `W2` guards the failure mode that actually
occurred, and `W3` guards the anchors whose loss produced the 30-second locator timeouts. It is a
bounded weakness in one of four checks, recorded here rather than repaired: the guard is outside
this round's remit, and the repair is a design question — compare against the emitting call, or
derive the allow-list and the render sites separately — that belongs to whoever owns the guard.

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            bug016-w2-dropped-script-tag
file:             lifetime-tax-strategy-lab.html
mutation:             <script src="rltaxcombined.js"></script>  ->      <!-- probe: combined module tag dropped -->   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: W2: lifetime-tax-strategy-lab.html carries a <script src> for every rltax module on disk — 14 modules, unwired: rltaxcombined.js — a
green-exit:       1
green-summary:      ✓ W2: lifetime-tax-strategy-lab.html carries a <script src> for every rltax module on disk — 14 modules, unwired: none — an unwired module s
revert-verified:  yes (committed=49d3eb42c819966d4f312e076786e959b51b3071 restored=49d3eb42c819966d4f312e076786e959b51b3071)
discriminating:   yes (summary differs)
=== END RED/GREEN PROBE EVIDENCE ===
```

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            bug016-w3-dropped-anchor-id
file:             lifetime-tax-strategy-lab.html
mutation:         id="combinedSettlementCard"  ->  id="combinedSettlementCardGONE"   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: W3: every #combined anchor tests/lifetime-tax-combined.spec.mjs locates exists as an element id in the route — 10 anchors, miss
green-exit:       1
green-summary:      ✓ W3: every #combined anchor tests/lifetime-tax-combined.spec.mjs locates exists as an element id in the route — 10 anchors, missing: n
revert-verified:  yes (committed=49d3eb42c819966d4f312e076786e959b51b3071 restored=49d3eb42c819966d4f312e076786e959b51b3071)
discriminating:   yes (summary differs)
=== END RED/GREEN PROBE EVIDENCE ===
```

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            bug016-w4-dropped-panel-marker
file:             lifetime-tax-strategy-lab.html
mutation:         federalAddendRow.appendChild(simpleValueNode("combinedFederalLeg",  ->  federalAddendRow.appendChild(simpleValueNode("combinedFederalLegGONE",
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✓ W4: every combined data-rl-value name tests/lifetime-tax-combined.spec.mjs locates appears in the route — 6 names, missing: none — the rou
green-exit:       1
green-summary:      ✓ W4: every combined data-rl-value name tests/lifetime-tax-combined.spec.mjs locates appears in the route — 6 names, missing: none — the rou
revert-verified:  yes (committed=49d3eb42c819966d4f312e076786e959b51b3071 restored=49d3eb42c819966d4f312e076786e959b51b3071)
discriminating:   NO (both channels agree: exit 1 == 1)
=== END RED/GREEN PROBE EVIDENCE ===
```

Every probe reverted with a hash-verified restore to the committed blob, and the route was clean
before and after each one.

### Why the status item stays open

The item asks for `bug.md` to move `Confirmed → Fixed → Verified`. The first transition is done and
fully evidenced: `bug.md` reads `Fixed — awaiting independent verification`.

`Verified` is a different kind of claim, and this round is the wrong author for it on two counts.
It is a certification statement, and an implementing round asserting that its own fix has been
independently verified is exactly the self-certification the evidence rules exist to prevent. The
repository also has a settled convention here that no packet has ever departed from: across all
twenty-three bug packets, every fixed one rests at `Fixed — awaiting independent verification` —
BUG-009, BUG-010, BUG-015 and BUG-017 all read that phrase verbatim — and not one has ever reached
`Verified`. Inventing that state here would make this packet the first, on its own authority.

The three premises are now confirmed, so a verifying round has what it needs to close this in one
step; the `W4` finding above is the one thing it should weigh that the closing claim does not
mention.

## Repair Of The `W4` Blind Spot

The finding above is now closed. `W4` no longer asks whether the name occurs somewhere in the
route; it asks whether the name is passed as the field id of a call that actually emits the
attribute.

### How the route emits these nodes — read, not assumed

The route writes **no literal `data-rl-value="…"` attribute at all**: `grep -c 'data-rl-value="'`
over `lifetime-tax-strategy-lab.html` returns 0. Every one is set at runtime by a single site,

```text
lifetime-tax-strategy-lab.html:1799    figure.setAttribute("data-rl-value", fieldId);
```

inside `valueNode(fieldId, shown, tooltip)`. Two functions forward their own parameter into it:
`simpleValueNode(fieldId, …)` at parameter 0, and `breakdownRow(label, fieldId, …)` at parameter 1.
So each of the six markers reaches the DOM through exactly one call:

| `W4` name | emitting call | quoted occurrences | second occurrence |
| --- | --- | --- | --- |
| `combined-federal-total` | `breakdownRow("Federal income tax", "combined-federal-total", …)` | 1 | — |
| `combined-state-total` | `breakdownRow("State income tax", "combined-state-total", …)` | 1 | — |
| `combined-total` | `breakdownRow("Both governments together", "combined-total", …)` | 1 | — |
| `combinedFederalLeg` | `simpleValueNode("combinedFederalLeg", …)` | 2 | `SIMPLE_FIELDS` |
| `combinedStateLeg` | `simpleValueNode("combinedStateLeg", …)` | 2 | `SIMPLE_FIELDS` |
| `combinedTotalTax` | `simpleValueNode("combinedTotalTax", …)` | 2 | `SIMPLE_FIELDS` |

Because there is no literal attribute to match, matching the attribute text was never available;
the correct construct to match is the call that sets it.

### The predicate, before and after

```text
before:  const wMissingValues = wValueMarkers.filter((v) => wRouteSrc.indexOf('"' + v + '"') < 0);

after:   the emitter is located from the one setAttribute("data-rl-value", …) site and named by its
         enclosing function; forwarders are every function that hands one of its own parameters
         straight to that emitter, together with the argument index it forwards; the emitted set is
         the string literals appearing at those argument positions across all such calls; a marker
         is missing when it is not in that set.
         const wMissingValues = wValueMarkers.filter((v) => !wEmittedNames.has(v));
```

Emitter and forwarders are derived from the route, not listed, so renaming `valueNode`,
`simpleValueNode` or `breakdownRow` fails here rather than silently widening what counts as wired.
The assertion also carries the two structural facts it depends on — zero literal attributes and
exactly one dynamic emit site — so a future change to the emission mechanism turns `W4` red instead
of leaving it quietly meaningless. A count threshold was rejected: a name legitimately mentioned
once more would break it, and it was measured to do so — injecting a harmless comment naming
`"combinedFederalLeg"` takes its quoted count from 2 to 3 while the shipped predicate stays green.

### The same mutation, before exit 7 and now exit 0

The mutation is the one recorded above as `bug016-w4-dropped-panel-marker`: rename the emitting
`simpleValueNode("combinedFederalLeg"` call while leaving the `SIMPLE_FIELDS` entry intact. Under
the old predicate the probe returned **exit 7** — RED and GREEN agreed. `--summary-match` is pinned
to `W4`'s own assertion wording rather than the aggregate pass count, because the suite exits 1 even
unmutated on two failures belonging to a concurrent session.

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            W4-emitting-call-rename-combinedFederalLeg
file:             lifetime-tax-strategy-lab.html
mutation:         simpleValueNode("combinedFederalLeg"  ->  simpleValueNode("combinedFederalLegRENAMED"   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: W4: every combined data-rl-value name tests/lifetime-tax-combined.spec.mjs locates is passed as the field id of a call that actually emits the attribute — 6 names, emitt
green-exit:       1
green-summary:      ✓ W4: every combined data-rl-value name tests/lifetime-tax-combined.spec.mjs locates is passed as the field id of a call that actually emits the attribute — 6 names, emitted via valueNode(arg 0)
summary-compared:   ✗ FAIL: … missing: combinedFederalLeg   vs     ✓ … missing: none   (elapsed time normalised out)
revert-verified:  yes (committed=49d3eb42c819966d4f312e076786e959b51b3071 restored=49d3eb42c819966d4f312e076786e959b51b3071)
discriminating:   yes (summary differs)
=== END RED/GREEN PROBE EVIDENCE ===
```

Probe exit status: `PROBE_EXIT=0`.

A second previously-blind name confirms the repair is not specific to the exemplar.

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            W4-emitting-call-rename-combinedTotalTax
file:             lifetime-tax-strategy-lab.html
mutation:         simpleValueNode("combinedTotalTax"  ->  simpleValueNode("combinedTotalTaxRENAMED"   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: W4: every combined data-rl-value name tests/lifetime-tax-combined.spec.mjs locates is passed as the field id of a call that actually emits the attribute — 6 names, emitted
green-exit:       1
green-summary:      ✓ W4: every combined data-rl-value name tests/lifetime-tax-combined.spec.mjs locates is passed as the field id of a call that actually emits the attribute — 6 names, emitted via va
revert-verified:  yes (committed=49d3eb42c819966d4f312e076786e959b51b3071 restored=49d3eb42c819966d4f312e076786e959b51b3071)
discriminating:   yes (summary differs)
=== END RED/GREEN PROBE EVIDENCE ===
```

Probe exit status: `PROBE2_EXIT=0`. Both probes reverted with a hash-verified restore to the
committed blob, and `git status --porcelain -- lifetime-tax-strategy-lab.html` was empty before and
after each one.

### All six names now bite, and the unmutated route still passes

Each marker's emitting call was renamed in turn and both predicates evaluated against the result.

| `W4` name | quoted | emitted via | old predicate | new predicate |
| --- | --- | --- | --- | --- |
| `combined-federal-total` | 1 | `breakdownRow` | RED | RED |
| `combined-state-total` | 1 | `breakdownRow` | RED | RED |
| `combined-total` | 1 | `breakdownRow` | RED | RED |
| `combinedFederalLeg` | 2 | `simpleValueNode` | **GREEN — blind** | RED |
| `combinedStateLeg` | 2 | `simpleValueNode` | **GREEN — blind** | RED |
| `combinedTotalTax` | 2 | `simpleValueNode` | **GREEN — blind** | RED |

Old predicate: 3 of 6. New predicate: 6 of 6. On the unmutated route both report `missing: none`,
so the repair adds no false positive. Deleting the emitting call outright rather than renaming it
also fires, reporting `missing: combinedFederalLeg`.

`W1`, `W2` and `W3` are untouched: the diff removes only the six lines of the old `W4` predicate and
its message, and all three assertions remain present and passing.

The full suite reports `3408 passed, 2 failed` — the same count as before the change, since `W4`
remains exactly one assertion. Both failures belong to a concurrent session's untracked
`tool-brief-v2*` and `zz-probe-focusable.spec.mjs` files and are unrelated to this repair.

## Closure Of The Residual Blind Spot The `W4` Repair Disclosed

The `W4` repair above closed the rename-the-emitting-call hole and, in the same pass, disclosed a
second one it does not cover. That hole is now closed by a sibling assertion, `W5`.

### The disclosed gap reproduced exactly as described

`simpleValueNode` is a carrier: it forwards its own `fieldId` parameter to the emitter `valueNode`.
But it forwards it only conditionally — `lifetime-tax-strategy-lab.html:1814` reads
`if (SIMPLE_FIELDS.indexOf(fieldId) < 0) { return text("span", "this field is not a Simple field",
"microcopy"); }`, so a name the list omits never reaches `valueNode` and no `data-rl-value` node is
produced at all. `W4` derives its emitted set from call sites and never consults that list, so the
list and the call sites can diverge silently.

Confirmed by probe rather than by reading alone. Dropping `"combinedFederalLeg"` from
`SIMPLE_FIELDS` while leaving `simpleValueNode("combinedFederalLeg", ...)` at line 2971 untouched:

```
PROBE_EXIT=7
label:            gap-confirm: drop combinedFederalLeg from SIMPLE_FIELDS
file:             lifetime-tax-strategy-lab.html
mutation:         "combinedTotalTax", "combinedFederalLeg", "combinedStateLeg",  ->  "combinedTotalTax", "combinedStateLeg",   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✓ W4: every combined data-rl-value name tests/lifetime-tax-combined.spec.mjs locates is passed as the field id of a call that actually emits the attribute — 6 names, emitted via valueNode(arg 0)
green-exit:       1
green-summary:      ✓ W4: every combined data-rl-value name tests/lifetime-tax-combined.spec.mjs locates is passed as the field id of a call that actually emits the attribute — 6 names, emitted via valueNode(arg 0)
revert-verified:  yes (committed=49d3eb42c819966d4f312e076786e959b51b3071 restored=49d3eb42c819966d4f312e076786e959b51b3071)
discriminating:   NO (both channels agree: exit 1 == 1, summary identical once elapsed time is normalised)
```

`W4` did not merely still pass — its message was byte-identical, still claiming six names emitted
and `missing: none`, on a route that had stopped rendering one of them. This is the BUG-016 failure
mode one layer in.

### A sibling check, not a wider `W4`

`W5` is a separate assertion rather than a strengthening of `W4`, for three reasons.

The failure causes are different and so are the repairs. `W4` fails when the emitting **call** is
renamed or dropped, and is answered at the call site. `W5` fails when the **admission list**
diverges from the call sites, and is answered in the list. Folding both into one predicate would
produce a message that has to describe two unrelated defects, leaving a reader who sees it fail
without the one fact they need — which of the two happened.

The domains are different. `W4` is scoped to the six names one browser spec locates. The gating
obligation is not spec-scoped at all: every one of the 23 gated calls in the route is subject to it,
including the twenty that no combined-panel spec mentions. Widening `W4` to that set would have
severed it from the spec-derived marker list that gives it its meaning.

And a check that names its own failure is actionable. `W5`'s message reports the gated carrier, the
array it consults, and the exact rejected name.

### The predicate

Nothing is listed; every input is derived from the route, so none of it rots and none of it can be
satisfied by deleting the thing that defines it.

- **Gated carriers** — of the carriers `W4` already derives, those whose body tests their own
  forwarded parameter with `<array>.indexOf(<param>) < 0`. Currently one: `simpleValueNode(arg 0)`
  gated by `SIMPLE_FIELDS`.
- **Admitted names** — the string literals of that array, brace-matched out of the route so a
  multi-line declaration parses whole.
- **Gated calls** — every literal string passed at that carrier's forwarded argument index.

The assertion is that every gated call's name is admitted, plus three floors: at least one gated
carrier, at least 18 gated calls, at least 20 admitted names.

### Both directions bite

Decisive probe — the mutation that was invisible, `--summary-match` pinned to `W5`'s own wording
rather than to the aggregate count, since the suite exits 1 even unmutated:

```
PROBE_EXIT=0
label:            W5: drop combinedFederalLeg from SIMPLE_FIELDS, emitting call left intact
file:             lifetime-tax-strategy-lab.html
mutation:         "combinedTotalTax", "combinedFederalLeg", "combinedStateLeg",  ->  "combinedTotalTax", "combinedStateLeg",   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: W5: every field id passed to a gated emitter in lifetime-tax-strategy-lab.html is admitted by the membership list that gate consults — 23 gated calls across simpleValueNode(arg 0) gated
green-exit:       1
green-summary:      ✓ W5: every field id passed to a gated emitter in lifetime-tax-strategy-lab.html is admitted by the membership list that gate consults — 23 gated calls across simpleValueNode(arg 0) gated by SIM
revert-verified:  yes (committed=49d3eb42c819966d4f312e076786e959b51b3071 restored=49d3eb42c819966d4f312e076786e959b51b3071)
discriminating:   yes (summary differs)
```

The obvious way to neutralise the new check is to disarm the gate it derives from, so that was
probed too. Changing the gate's comparison from `< 0` to `< -1` leaves the syntax intact and the
refusal unreachable:

```
PROBE_EXIT=0
label:            W5 floor: neutralise the gate itself
mutation:         if (SIMPLE_FIELDS.indexOf(fieldId) < 0) {  ->  if (SIMPLE_FIELDS.indexOf(fieldId) < -1) {   (1 occurrence(s))
red-exit:         1
red-summary:        ✗ FAIL: W5: ... — 0 gated calls across no gated carrier
green-summary:      ✓ W5: ... — 23 gated calls across simpleValueNode(arg 0) gated by SIMPLE_FIELDS
revert-verified:  yes (committed=49d3eb42c819966d4f312e076786e959b51b3071 restored=49d3eb42c819966d4f312e076786e959b51b3071)
discriminating:   yes
```

The carrier floor catches it: with no gate to derive, the set is empty and the assertion fails
instead of passing vacuously.

### No false positive, and `W1`–`W4` untouched

Unmutated, the suite reports `3409 passed, 2 failed` — exactly one more than the `3408` recorded
above, which is `W5` itself. The two failures are the same concurrent-session untracked
`tool-brief-v2*` and `zz-probe-focusable.spec.mjs` files, unrelated to this work.

`W1`, `W2`, `W3` and `W4` all still pass with identical counts — 14 modules, 14 modules, 10 anchors,
6 names — and the change adds only new lines; no line of the `W4` emission derivation was altered.

### What remains open in this family

One gap of the same shape is still uncovered, stated plainly rather than left implied. `W5` proves
a gated name is *admissible*; it does not prove the call is *reached*. A gated call sitting inside a
branch the route never takes — or a carrier invocation deleted outright while both the list entry
and the browser marker survive — would leave `W4` and `W5` green with nothing on the page. Closing
that needs reachability, which static derivation over the route source cannot supply; the browser
spec is the instrument for it. Not repaired here, and not claimed to be.

## Independent Verification Round

Run by a party that wrote no part of this packet, at `982a63641`. That commit **is** `origin/main`,
so "present at `origin/main`" was read from the working tree and confirmed against
`git show origin/main:` rather than inferred. Nothing below is inherited from the records above;
each premise was re-derived.

### The tree moved underneath this round, and the move was attributed

This round began at `2c3225e5d` with the branch two ahead and three behind. A concurrent session
advanced it to `982a63641` mid-run. Every artifact these probes touched is byte-identical across
that move — `git diff --stat 2c3225e5d 982a63641` over the route, the selftest, the browser spec and
the three engine modules is empty — and the three blobs the probes hash-verified their reverts
against (`49d3eb42c8` for the route, `95beaaed14`, `7e690813e7`) are the blobs at the current `HEAD`.
The four commits in the gap are `chore(open-work)` and a merge. The evidence therefore stands at the
tip it is recorded against.

### The wiring is present at `origin/main`

All six `data-rl-value` markers the browser spec locates are present at `origin/main`
(`combinedFederalLeg` ×2, `combinedStateLeg` ×2, `combinedTotalTax` ×10, and one each for
`combined-federal-total`, `combined-state-total`, `combined-total`), and all fourteen `rltax*.js`
modules on disk carry a `<script src>` there.

### CI, re-derived at a later tip than the one this packet cited

The cited run `32744354615` still reports `conclusion=success` with `verify=success` and
`deploy=success`. That is the recorded premise and it holds. It is also no longer the newest
evidence: the most recent **completed** blocking-suite run on `main`, `32857081607` at `f2516de2b`,
is a **failure** — and that is the stronger result for this packet, because the redness is
attributable elsewhere.

```
run 32857081607 conclusion=failure headSha=f2516de2b
  job verify = failure
     FAILED STEP: Full browser suite (blocking)

failing tests, by spec file:
     5 tests/bond-regime-lab.spec.mjs
     1 tests/simple-model-adapters-market.spec.mjs

lifetime-tax failures in that run: 0
lifetime-tax passes   in that run: 111
tests/lifetime-tax-combined.spec.mjs: 8 cases, all ✓
```

The wiring holds in a pipeline that is currently red for other owners. A green run cannot show that;
this one can.

### Every guard was proven to bite, by reverting mutation

`W1` is a precondition — module-family exclusivity plus a floor — and is what licenses `W2`. `W2`
through `W5` were each mutated and each turned red, with the revert hash-verified every time. All
six ran against the committed selftest, scoped to the single named clause so the two failures another
session owns could not mask a verdict.

| probe | mutation | RED | GREEN | verdict |
| --- | --- | --- | --- | --- |
| `W2` | `src="rltaxcombined.js"` renamed | exit 1, `hits=1` | exit 0, `hits=0` | discriminates |
| `W3` | `id="combinedSettlementCard"` renamed | exit 1, `hits=1` | exit 0, `hits=0` | discriminates |
| `W4` | `simpleValueNode("combinedFederalLeg",` renamed | exit 1, `hits=1` | exit 0, `hits=0` | discriminates |
| `W4` | `simpleValueNode("combinedStateLeg",` renamed | exit 1, `hits=1` | exit 0, `hits=0` | discriminates |
| `W4` | `simpleValueNode("combinedTotalTax",` renamed | exit 1, `hits=1` | exit 0, `hits=0` | discriminates |
| `W4` | `breakdownRow(… "combined-federal-total",` renamed | exit 1, `hits=1` | exit 0, `hits=0` | discriminates |
| `W5` | `"combinedFederalLeg"` dropped from `SIMPLE_FIELDS` | exit 1, `hits=1` | exit 0, `hits=0` | discriminates |

The `W4` blind set was enumerated rather than sampled. The three names the earlier round found blind
are exactly the three that appear twice in the route because `SIMPLE_FIELDS` names them a second
time — `combinedFederalLeg`, `combinedStateLeg`, `combinedTotalTax` — and each was probed
individually. The other three reach the emitter at argument index 1 through `breakdownRow`, a
different mechanism, and one of those was probed as a control. Mutating one member of a set proves
nothing about the others, so all four call shapes were exercised.

`W5` was also shown not to be redundant. Under the identical `SIMPLE_FIELDS` mutation, probing `W4`
instead returned **exit 7 — no discrimination**, `CLAUSE_STATE=GREEN hits=0` on both sides. `W4` is
provably blind to precisely the state `W5` was added for.

### The disclosed reachability residual, judged

The residual recorded above is real and correctly stated: neither `W4` nor `W5` proves a gated call
is ever *reached*. Both derive over route source, and source cannot answer whether a branch executes.

It is nonetheless acceptable for a `Verified` transition, and the reason is measured rather than
argued. The property the static guards cannot supply is supplied one layer down, by the browser
assertion that is blocking in CI. Both mutation classes the guards catch statically were replayed
against `tests/lifetime-tax-combined.spec.mjs` on the bundled project:

```
label:   BUG016-residual gated call never reached -> browser spec must fail
mutation: "combinedTotalTax", "combinedFederalLeg",  ->  "combinedTotalTax",
red-exit: 1   red-summary:   6 passed (39.8s)
green-exit: 0 green-summary: 8 passed (4.2s)
discriminating: yes

label:   BUG016-residual emitting call renamed -> browser spec must fail
mutation: simpleValueNode("combinedFederalLeg",  ->  simpleValueNodeRenamed("combinedFederalLeg",
red-exit: 1   red-summary:   3 passed (55.7s)
green-exit: 0 green-summary: 8 passed (4.1s)
discriminating: yes
```

A value that reaches no emitter, or reaches one that refuses it, does not reach the DOM, and the
browser spec fails on it. That spec runs 8 cases inside the blocking suite, confirmed above in run
`32857081607`. So the layering is: the static guards are an earlier and cheaper tripwire that fires
at selftest time instead of after a 300s locator timeout in CI, and the browser spec remains the
instrument of record for reachability. The guards were never the only line, and the residual does
not leave the property unprotected — it names which layer owns it.

The one condition that would change this judgement is the residual's own second clause: a carrier
invocation deleted outright while both the list entry and the browser marker survive. That is caught
by the browser spec too, for the same reason, but it is not caught by a static guard, and if the
browser spec were ever narrowed the residual would become live. It is disclosed, not closed.

### Verdict

The row is ticked and `bug.md` moves to `Verified` on this round's authority, not the implementing
round's.

<!-- bubbles:certifying-window-begin -->

### Code Diff Evidence

**Claim Source:** executed, 2026-08-29. Re-derived from the repository this session.

**This packet changed no source file.** Its only edits are its own artifacts, which is what it said
throughout: it filed a defect and a decision request rather than a remedy.

The remedy landed separately, in Feature 022:

```
$ git log --oneline -1 -S 'combinedCurveChart' -- lifetime-tax-strategy-lab.html
c58719fb4 feat(022): wire combined federal+state settlement and curve into the route
$ git show --stat --format='%h %s' c58719fb4
c58719fb4 feat(022): wire combined federal+state settlement and curve into the route

 lifetime-tax-strategy-lab.html       | 600 ++++++++++++++++++++++++++++++++++-
 tests/lifetime-tax-combined.spec.mjs | 474 +++++++++++++++++++++++++++
 2 files changed, 1070 insertions(+), 4 deletions(-)
```

The three selectors this packet filed as absent are now present:

```
$ for s in combinedCurveChart combinedSettlementCard combinedRefusal; do
    printf '%s %s\n' "$s" "$(grep -c "id=\"$s\"" lifetime-tax-strategy-lab.html)"
  done
combinedCurveChart 1
combinedSettlementCard 1
combinedRefusal 1
```

#### RED → GREEN ordering

**RED stage.** Eleven consecutive completed runs of `pages.yml` on `main` were red. Run
`32651572136` reported `31 failed` of 708 on the blocking browser step and skipped deployment
entirely. Six of those failures were this packet's, waiting on the three selectors above.

**GREEN stage.**

```
$ npx --no-install playwright test tests/lifetime-tax-combined.spec.mjs --config=playwright.config.mjs --reporter=line
  16 passed (18.4s)
PW_EXIT=0
$ node scripts/selftest.mjs
Research-Lab self-test: 3433 passed, 0 failed
SELFTEST_EXIT=0
```

**Sixteen, not the eight the scope anticipated.** Feature 022 added its own coverage on top of the
six assertions this packet filed, so the spec grew. The packet's DoD asked that the whole spec pass
rather than only the quotable failures, and it does — which is the stronger claim, because a fix
validated against the six named tests alone could have left the other ten red.

### Validation Evidence

**Phase:** validate · **Claim Source:** executed, 2026-08-29 · **Runner:** `bubbles.goal`

The filed defect is re-verified as RESOLVED rather than assumed resolved:

```
$ grep -c 'id="combinedCurveChart"' lifetime-tax-strategy-lab.html
1
$ npx --no-install playwright test tests/lifetime-tax-combined.spec.mjs --config=playwright.config.mjs --reporter=line
  16 passed (18.4s)
PW_EXIT=0
```

```
$ node scripts/pii-scan.mjs
[pii-scan] files=10353 messages=2506 findings=0 OK
PII_EXIT=0
```

### Audit Evidence

**Phase:** audit · **Claim Source:** executed, 2026-08-29 · **Runner:** `bubbles.goal`

The audit question for this packet is unusual, because the packet did not fix anything. It is:
**was the defect described accurately enough that a later feature could resolve it, and is that
resolution real or coincidental?**

Three facts answer it.

1. **The narrowing was correct.** The packet established that the computation module was already
   deployed and byte-identical, so only markup and a script tag were missing. Feature 022's diff
   confirms it: 600 lines added to the page, zero to the computation module.
2. **The recurrence finding was correct and is now protected.** The wiring had been written and
   committed before, and four separate merges each discarded it. A restoration alone would have
   restored a value the next merge could drop again. `tests/lifetime-tax-combined.spec.mjs` now
   asserts the three selectors, so the next such merge turns the spec red.
3. **The ownership split held.** Six failures were attributed to this packet and twenty-five were
   not, by reading the last commit to touch each spec file rather than by inference. Those
   twenty-five are not silently claimed as fixed here.

**Assurance limit, stated rather than implied.** Six of the eight required phases were re-derived by
this runner rather than executed by their registered specialist owner, so neither validate nor audit
above is INDEPENDENT. `certification.assurance.level` is `prototype` and `missingForFull` records
both gaps.

`done` here means the defect is resolved and this packet's own obligations are discharged. It does
**not** mean this packet performed the remedy — Feature 022 did.


