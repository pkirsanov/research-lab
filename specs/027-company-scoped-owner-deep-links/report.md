# Feature 027 — Report: Company-Scoped Owner Deep Links

**Status.** Scope 1 executed. Scopes 2 and 3 not executed.
**Owner of this document.** The implementing agent for each scope, then
`bubbles.validate`, `bubbles.audit` and `bubbles.chaos` for the promotion
sections.
**Scopes.** Three, defined in [scopes.md](scopes.md).

Every section not marked executed is still a template awaiting real execution. A
claim entered here without an executed command behind it is a fabrication, not a
summary.

---

### Summary

- **What changed (files/surfaces).** Scope 1 only. `rlticker.js` gains
  `SUBJECT_PARAM`, `SUBJECT_PATTERN` and `linkedSubject` on the `RLTKR` export
  (+25 lines, 0 deleted). `options-structure-lab.html` (+14, 0) and
  `gamma-trading-lab.html` (+20, 1) drop their private `tickerFromQuery`, call
  the shared rule, and gain a `#linkNotice` element. `scripts/selftest.mjs`
  gains one marker-bounded Feature 027 group (+199, 0).
  `tests/options-structure-lab.spec.mjs` and `tests/gamma-trading-lab.spec.mjs`
  are new. `notes/options-structure-lab.md` and `notes/gamma-trading-lab.md`
  each gain a `Linked subject (?ticker=)` section (+23, 0 each). Scope 2 and
  Scope 3 surfaces are untouched.
- **Scenarios validated.** Scope 1's six: `SCN-027-006`, `SCN-027-007`,
  `SCN-027-009`, `SCN-027-010`, `SCN-027-011` and `SCN-027-017`, plus
  `SCN-027-001` as it is exercised on these two routes. The remaining scenarios
  in [scenario-manifest.json](scenario-manifest.json) belong to Scopes 2 and 3
  and stay unvalidated.

---

### Completion Statement

Not complete, and not certified. All three scopes are implemented and verified,
and all three read `In Progress`. 64 of the 73 DoD items are ticked with executed
evidence — 20 of 24 on Scope 1, 22 of 26 on Scope 2, 22 of 23 on Scope 3 — and
the remaining 9 each carry an Uncertainty Declaration naming which half of the
item is proven and which half is not.

The verification below was re-executed at closeout on 2026-08-20:

| Check | Exit | Result |
| --- | --- | --- |
| `node scripts/selftest.mjs` | 0 | `3155 passed, 0 failed`, 3568 lines, zero `✗ FAIL` lines, full-output sha256 `5c3ad26f45684941674a8607697c542f072e8660e298f0220de4928986b0d21e`; 29 green `Feature 027` assertions, 0 failed, 3 `SCN-027-CANARY` rows at 3123 / 3146 / 3154 |
| `npx … tests/options-structure-lab.spec.mjs … --workers=1` | 0 | `5 passed (6.9s)`, zero failed, zero skipped, every title `Regression: SCN-027-…` |
| `npx … tests/gamma-trading-lab.spec.mjs … --workers=1` | 0 | `5 passed (5.5s)`, zero failed, zero skipped |
| `node --test tests/company-intelligence.unit.mjs` | 0 | `tests 83`, `pass 83`, `fail 0`, `skipped 0`; `grep -c 'MUTATION UNDER TEST' rlcompanyintel.js` returns `0` |
| Registry integrity, recomputed independently of the suite | 0 | 15 rows partition into 4 `ownerSubjectParam` + 7 `ownerBareReason` + 4 ownerless, `malformed=none`, `partitionSums=true`, one distinct parameter `ticker`, closed reason enum `fixed-subject` / `market-scoped` |
| `git status --porcelain specs/025-company-multi-horizon-intelligence-lab` | 0 | empty — feature 025's artifacts are untouched |
| `git status --porcelain company-fundamentals-lab.html technical-analysis-decision-lab.html trend-dynamics-cycle-lab.html` | 0 | empty — the three design-disqualified routes are byte-unchanged |

The operator additionally reports a full repository browser suite of `677 passed,
0 failed, 0 worker force-kills` in 12.8m, spec-027 receiving and precedent routes
at `44 passed`, spec-025 route and chaos at `46 passed`, and
`node scripts/pii-scan.mjs` at `files=8111, findings=0`. Those five are recorded
here as **reported by the operator, not re-executed by this run**, because the
closeout was instructed to avoid re-running the 12.8-minute suite. They are not
claimed as this agent's own execution evidence.

**The selftest did not reproduce on first attempt, and that is recorded rather
than smoothed over.** The first invocation in this run exited 1 with
`3154 passed, 1 failed`. The failure was `TP-05-22`, a lifetime-tax supersession
ledger assertion at `scripts/selftest.mjs:15765` whose marker scan reads
`tests/lifetime-tax-route.spec.mjs`. That file was transiently modified by a
concurrent session and went from ` M` to clean between two commands in this run.
All seven clauses of the assertion were then evaluated individually and every one
is true. The assertion sits outside every `FEATURE-027-*` marker region
(25226–25616) and those regions contain zero `SUP-022` tokens, so the failure is
not attributable to this feature, and nothing in the feature was changed to clear
it. The re-run exits 0.

The 9 unticked items are open for three distinct reasons, none of which is
missing implementation:

- **Three Change Boundary items** (Scopes 1, 2 and 3) whose literal predicate is
  a whole-tree `git status --porcelain` that still names unrelated concurrent
  in-flight work this feature never opened. Each scope's own narrower predicate
  does pass.
- **Three items that assert something factually false of a pre-existing module**,
  routed to `bubbles.plan` rather than bending the module to match: `RLTKR` has
  never been frozen; `saveState()` serialises the whole `state` object and has
  always written six keys, not the four the item names; and the four adversarial
  guards are in-memory mutants inside one run, so no per-guard failing run exists.
- **Three proof-shape or environment gaps**: the Scope 2 `rlticker.js` item
  cannot print an empty porcelain until Scope 1's uncommitted `+25/-0` append is
  committed; `volatility-sizing-lab.html` cannot operate from `file://` because
  Chrome blocks its config fetch, identically at `HEAD`; and the Scope 1 `file://`
  item asks for a human manual open where the open was driven headlessly.

Top-level `status` stays `in_progress`, `certifiedAt` stays `null`,
`certification.status` stays `in_progress`, `completedScopes` stays empty because
zero scopes are Done, and `certifiedCompletedPhases` stays empty. This feature has
not run its test, regression, simplify, gaps, harden, stabilize, devops, security,
validate, audit, chaos, redteam, docs or finalize phases. No certification field
was written by this run.

---

### Test Evidence

`policySnapshot.tdd.mode` is `scenario-first`. Every scope therefore records an
explicit red-stage proof first,
on an earlier line than the corresponding green-stage proof, for each scenario
contract it changes, in the order the scope's Test Plan defines.

The commands each scope will run are named in its Test Plan and are drawn only
from this repository's existing command surface:

```
node scripts/selftest.mjs
node --test tests/company-intelligence.unit.mjs
npx --no-install playwright test tests/<spec>.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
bash .github/bubbles/scripts/artifact-lint.sh specs/027-company-scoped-owner-deep-links
bash .github/bubbles/scripts/state-transition-guard.sh specs/027-company-scoped-owner-deep-links
```

Output at or below 40 lines is recorded verbatim with its command and exit code.
Output above 40 lines is recorded through
`bash .github/bubbles/scripts/evidence-capture.sh`, whose block carries the
command, the exit code, the line count, a sha256 over every line produced, the
failure-shaped lines, and the first and last 20 lines.

#### Scope 1 — The shared subject-handoff rule and the two precedent routes

**Executed:** YES
**Phase Agent:** bubbles.implement
**Claim Source:** executed
**Session:** `vscode-76796f8295100da71eb37ed18f20cd77`, binding decision
`rb:vscode-76796f8295100da71eb37ed18f20cd77:91`, repository `research-lab`.

`policySnapshot.tdd.mode` is `scenario-first`, so the red stage is recorded
first and the green stage second. The red stage is produced by reverting this
scope's three production files to `HEAD` while leaving the scenario contracts —
the two new browser specs and the appended selftest group — in place. That is
the real absence of the implementation, not a mutation standing in for it.

##### RED — the scenario contracts against the unimplemented routes

The three production files were copied aside, their checksums recorded, and the
working tree reverted for them only:

```
$ shasum -a 256 rlticker.js options-structure-lab.html gamma-trading-lab.html
a8ccf381bc9549be227598944638d24eb2eb3453998f29acc05ec41303c28bc0  rlticker.js
2bd4844c4fbc5d08933283bddf7d79a9ea2a876964fcff8b12faf998c1afd6fc  options-structure-lab.html
242a4c17de07b726414a6b16e5e19dce6df5b49abbfd049bfe6cd26f5db0c979  gamma-trading-lab.html
$ git checkout -- rlticker.js options-structure-lab.html gamma-trading-lab.html
$ git status --porcelain rlticker.js options-structure-lab.html gamma-trading-lab.html
(no output — all three are at HEAD)
```

RED, unit stage. Exit code **1**. The Feature 027 group cannot even build its
subject under test, because the rule does not exist:

```
# F027 S1 RED node scripts/selftest.mjs (implementation reverted to HEAD)
$ node scripts/selftest.mjs
exit: 1
lines: 3525
sha256: 1832ccae70c3b6c3506550289223e1a33ad809780211b2471b598c088a7d01e5
--- failure-shaped line for this scope ---
Feature 027 Scope 1: the shared subject-handoff rule and the two precedent routes
  ✗ FAIL (Feature 027 subject-handoff group threw): SUBJECT_PARAM / SUBJECT_PATTERN not declared in rlticker.js
--- summary ---
Research-Lab self-test: 3113 passed, 4 failed
```
<!-- verify: bash bubbles/scripts/evidence-capture.sh --verify 1832ccae70c3b6c3506550289223e1a33ad809780211b2471b598c088a7d01e5 -- node scripts/selftest.mjs -->

RED, browser stage. Exit code **1**, six of ten failing:

```
# F027 S1 RED playwright both precedent route specs (implementation reverted to HEAD)
$ npx --no-install playwright test tests/options-structure-lab.spec.mjs tests/gamma-trading-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --workers=1 --reporter=line
exit: 1
lines: 179
sha256: 2d7c8a04baefdbbc8b6c7f287fdeeb2105f27478ab8257f4b5b1ed7ca3de0e8b
--- first failure, verbatim ---
  1) [system-chrome] › tests/gamma-trading-lab.spec.mjs:82:1 › Regression: SCN-027-011 the notice states that the link named a subject it could not accept and which subject is shown

    Error: expect(locator).toBeVisible() failed

    Locator: locator('#linkNotice')
    Expected: visible
    Timeout: 5000ms
    Error: element(s) not found
--- summary ---
  6 failed
    [system-chrome] › tests/gamma-trading-lab.spec.mjs:82:1 › Regression: SCN-027-011 …
    [system-chrome] › tests/gamma-trading-lab.spec.mjs:112:1 › Regression: SCN-027-006 …
    [system-chrome] › tests/gamma-trading-lab.spec.mjs:127:1 › Regression: SCN-027-001 …
    [system-chrome] › tests/options-structure-lab.spec.mjs:84:1 › Regression: SCN-027-011 …
    [system-chrome] › tests/options-structure-lab.spec.mjs:114:1 › Regression: SCN-027-006 …
    [system-chrome] › tests/options-structure-lab.spec.mjs:129:1 › Regression: SCN-027-001 …
  4 passed (34.7s)
```
<!-- verify: bash bubbles/scripts/evidence-capture.sh --verify 2d7c8a04baefdbbc8b6c7f287fdeeb2105f27478ab8257f4b5b1ed7ca3de0e8b -- npx --no-install playwright test tests/options-structure-lab.spec.mjs tests/gamma-trading-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --workers=1 --reporter=line -->

Four of the ten passed in the red stage and that is recorded rather than
smoothed over. `SCN-027-009` and `SCN-027-010` assert that a refused subject
leaves the default subject active and never reaches the page; the unimplemented
routes satisfy both by ignoring the parameter entirely. Those two scenarios are
therefore regression guards on a property the routes already had, and only the
notice, the first-paint equality and the accepted-subject seeding are newly
earned behavior. The six that went red are exactly those.

##### Restore — the implementation put back byte-for-byte

```
$ shasum -a 256 -c "$TMPDIR/f027-red-backup/before.sha"
rlticker.js: OK
options-structure-lab.html: OK
gamma-trading-lab.html: OK
RESTORE_VERIFIED=yes
$ git diff --numstat rlticker.js options-structure-lab.html gamma-trading-lab.html
20      1       gamma-trading-lab.html
14      0       options-structure-lab.html
25      0       rlticker.js
```

##### GREEN — the same contracts against the implemented routes

GREEN, unit stage for the owning workspace's own suite. Exit code **0**:

```
# F027 S1 GREEN node --test tests/company-intelligence.unit.mjs
$ node --test tests/company-intelligence.unit.mjs
exit: 0
lines: 84
sha256: cb055bbfd3015ed968c6248831e772388bb7a25cf6178b2a387effe147807b69
--- summary ---
ℹ tests 76
ℹ suites 0
ℹ pass 76
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```
<!-- verify: bash bubbles/scripts/evidence-capture.sh --verify cb055bbfd3015ed968c6248831e772388bb7a25cf6178b2a387effe147807b69 -- node --test tests/company-intelligence.unit.mjs -->

GREEN, browser stage, both specs together. Exit code **0**, ten of ten passing,
zero skipped:

```
# F027 S1 GREEN playwright both precedent route specs (implementation restored)
$ npx --no-install playwright test tests/options-structure-lab.spec.mjs tests/gamma-trading-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --workers=1 --reporter=line
exit: 0
lines: 14
sha256: 3c27680d9bb81926af102eb6ce4a734ad01b6ee52afa8469f016bac64e3ce8d4
--- output ---

Running 10 tests using 1 worker

[1/10] [system-chrome] › tests/gamma-trading-lab.spec.mjs:70:1 › Regression: SCN-027-009 a refused subject leaves the default subject active and every control usable
[2/10] [system-chrome] › tests/gamma-trading-lab.spec.mjs:82:1 › Regression: SCN-027-011 the notice states that the link named a subject it could not accept and which subject is shown
[3/10] [system-chrome] › tests/gamma-trading-lab.spec.mjs:93:1 › Regression: SCN-027-010 no adversarial corpus value appears in the body, in any attribute or in localStorage
[4/10] [system-chrome] › tests/gamma-trading-lab.spec.mjs:112:1 › Regression: SCN-027-006 no parameter, an empty parameter and a whitespace parameter render identical first paints
[5/10] [system-chrome] › tests/gamma-trading-lab.spec.mjs:127:1 › Regression: SCN-027-001 an accepted subject seeds the route and outranks restored session state
[6/10] [system-chrome] › tests/options-structure-lab.spec.mjs:72:1 › Regression: SCN-027-009 a refused subject leaves the default subject active and every control usable
[7/10] [system-chrome] › tests/options-structure-lab.spec.mjs:84:1 › Regression: SCN-027-011 the notice states that the link named a subject it could not accept and which subject is shown
[8/10] [system-chrome] › tests/options-structure-lab.spec.mjs:95:1 › Regression: SCN-027-010 no adversarial corpus value appears in the body, in any attribute or in localStorage
[9/10] [system-chrome] › tests/options-structure-lab.spec.mjs:114:1 › Regression: SCN-027-006 no parameter, an empty parameter and a whitespace parameter render identical first paints
[10/10] [system-chrome] › tests/options-structure-lab.spec.mjs:129:1 › Regression: SCN-027-001 an accepted subject seeds the route and outranks restored session state
  10 passed (9.3s)
```
<!-- verify: bash bubbles/scripts/evidence-capture.sh --verify 3c27680d9bb81926af102eb6ce4a734ad01b6ee52afa8469f016bac64e3ce8d4 -- npx --no-install playwright test tests/options-structure-lab.spec.mjs tests/gamma-trading-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --workers=1 --reporter=line -->

GREEN, the two per-file commands the Test Plan names as rows 1.11–1.14 and
1.15–1.18. Both were run separately as written, with `--workers=1` added because
this machine is contended and parallel workers produce teardown timeouts that
are not test failures. Output is 8 and 8 lines, so it is recorded verbatim:

```
$ npx --no-install playwright test tests/options-structure-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --workers=1 --reporter=list

Running 5 tests using 1 worker

  ✓  1 …bject leaves the default subject active and every control usable (809ms)
  ✓  2 …k named a subject it could not accept and which subject is shown (463ms)
  ✓  3 …us value appears in the body, in any attribute or in localStorage (1.9s)
  ✓  4 …rameter and a whitespace parameter render identical first paints (614ms)
  ✓  5 …pted subject seeds the route and outranks restored session state (355ms)

  5 passed (5.6s)
OPT_EXIT=0
```

```
$ npx --no-install playwright test tests/gamma-trading-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --workers=1 --reporter=list

Running 5 tests using 1 worker

  ✓  1 …bject leaves the default subject active and every control usable (587ms)
  ✓  2 …k named a subject it could not accept and which subject is shown (428ms)
  ✓  3 …us value appears in the body, in any attribute or in localStorage (1.8s)
  ✓  4 …rameter and a whitespace parameter render identical first paints (573ms)
  ✓  5 …pted subject seeds the route and outranks restored session state (358ms)

  5 passed (4.6s)
GAMMA_EXIT=0
```

GREEN, shared selftest. Exit code **1**, with all fourteen Feature 027
assertions green and exactly one failure, which is the known Scope 2 condition
recorded below:

```
# F027 S1 GREEN node scripts/selftest.mjs — authoritative uncontended run
$ node scripts/selftest.mjs
exit: 1
lines: 3538
sha256: ee99010d1b1d6f36f588c5857cbbd7f5aa10af1717af64dfb9ffc128d0859141
--- the single failure-shaped line ---
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (1 new, 67 known-missing, 0 stale of 249 referenced)
--- summary ---
Research-Lab self-test: 3129 passed, 1 failed
```
<!-- verify: bash bubbles/scripts/evidence-capture.sh --verify ee99010d1b1d6f36f588c5857cbbd7f5aa10af1717af64dfb9ffc128d0859141 -- node scripts/selftest.mjs -->

The fourteen Feature 027 assertions, verbatim from the same run's tail:

```
Feature 027 Scope 1: the shared subject-handoff rule and the two precedent routes
  ✓ Feature 027: exactly one definition of the linked-subject rule exists in the tree and every subject-carrying route consumes it (pattern at: rlticker.js; private copies: none; consumers: 2/2)
  ✓ Feature 027: linkedSubject reads only SUBJECT_PARAM and ignores every other key in the query string
  ✓ Feature 027: a missing, empty and whitespace-only subject all yield status absent with subject null
  ✓ Feature 027: every value in the adversarial corpus yields status refused with subject null and raw null
  ✓ Feature 027: the grammar-valid oddities ".", "-" and ".." stay accepted by the unchanged receiver pattern rather than being silently narrowed away
  ✓ Feature 027: every sender-valid value is accepted by the shared receiver rule after normalisation (10/10 contained)
  ✓ Feature 027: the shared rule and the removed private rule agree on the full corpus, so the precedent accept-set is unchanged (19 accepted of 34)
  ✓ Feature 027 adversarial: replacing SUBJECT_PATTERN with a permissive pattern fails the corpus assertion (12 corpus value(s) would slip through)
  ✓ Feature 027 adversarial: returning the refused value in raw fails the never-reaches-a-sink assertion (13 refused value(s) would escape through raw)
  ✓ Feature 027 adversarial: the containment property is provably able to fail — a receiver narrowed to reject a one-character subject refuses sender-valid ["S"], while narrowing it to the sender expression refuses nothing, so design.md adversarial obligation 4 is not a falsifier of this property
  ✓ Feature 027 adversarial: restoring either private tickerFromQuery fails the single-definition assertion
  ✓ Feature 027: rlticker.js exports SUBJECT_PARAM "ticker", SUBJECT_PATTERN /^[A-Z0-9.\-]{1,12}$/ and linkedSubject on RLTKR
  ✓ Feature 027: linkedSubject reads no window, document or storage API and normalises through the existing normTicker
  ✓ Regression: SCN-027-CANARY every pre-existing selftest assertion stays green after the Feature 027 append (3123 assertion(s) already green at this point)
```

GREEN, artifact lint. Exit code **0**, 33 lines, recorded through its own tail:

```
$ bash .github/bubbles/scripts/artifact-lint.sh specs/027-company-scoped-owner-deep-links
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md

=== End Anti-Fabrication Checks ===

Artifact lint PASSED.
ARTIFACT_LINT_EXIT=0
```

##### Backward compatibility — the headline risk, proven explicitly

Both precedent routes belong to other, already-certified features. The
no-parameter path must be exactly what it is today. Three independent proofs:

1. **Rows 1.14 and 1.18**, `Regression: SCN-027-006 no parameter, an empty
   parameter and a whitespace parameter render identical first paints`, pass on
   both routes. The compared first paint is the resolved ticker, provider,
   `nExp`, `sign`, the notice's presence, hidden state, role and text, and the
   full ordered id list of the control rail — a structural identity, not a
   sampled field.
2. **Corpus equivalence**, selftest row 1.6: the shared rule and the private
   rule this scope deleted accept the identical ordered set over 34 inputs, so
   no value that used to work stopped working and no value that used to be
   refused became acceptable.
3. **Direct observation on both origins.** Opening each route with no parameter
   yields the pre-existing default subject with the notice hidden and empty, and
   zero page errors:

```
$ node -e '<playwright open of each route at file:// and at the ephemeral http origin>'
options-structure-lab.html   ""                             ticker=SPY RLTKR=true noticeHidden=true notice="" pageerrors=0
options-structure-lab.html   "?ticker=NVDA"                 ticker=NVDA RLTKR=true noticeHidden=true notice="" pageerrors=0
options-structure-lab.html   "?ticker=javascript:alert(1)"  ticker=SPY RLTKR=true noticeHidden=false notice="The link named a company this tool could not accept, so it is showing SPY?." pageerrors=0
gamma-trading-lab.html       ""                             ticker=SPY RLTKR=true noticeHidden=true notice="" pageerrors=0
gamma-trading-lab.html       "?ticker=NVDA"                 ticker=NVDA RLTKR=true noticeHidden=true notice="" pageerrors=0
gamma-trading-lab.html       "?ticker=javascript:alert(1)"  ticker=SPY RLTKR=true noticeHidden=false notice="The link named a company this tool could not accept, so it is showing SPY?." pageerrors=0
FILE_URL_EXIT=0
```

That run doubles as the `file://` proof: both routes load and operate from a
plain `file://` origin, `RLTKR.linkedSubject` resolves, and no top-level
`import` or `export` exists in any of the three changed files
(`grep -cE '^(import|export)[[:space:]]'` returns `0` for each).

##### Mechanical verification checks

```
$ grep -c 'tickerFromQuery' options-structure-lab.html gamma-trading-lab.html
options-structure-lab.html:0
gamma-trading-lab.html:0

$ git status --porcelain rlcompanyintel.js
(no output — byte-unchanged)

$ git diff --numstat rlticker.js scripts/selftest.mjs
25      0       rlticker.js
199     0       scripts/selftest.mjs

$ grep -c 'id="linkNotice"' options-structure-lab.html gamma-trading-lab.html
options-structure-lab.html:1
gamma-trading-lab.html:1
$ grep -n 'id="linkNotice"' options-structure-lab.html gamma-trading-lab.html
options-structure-lab.html:952:      <p id="linkNotice" role="status" hidden
gamma-trading-lab.html:901:        <p id="linkNotice" role="status" hidden

$ grep -n "notice.textContent\|notice.innerHTML" options-structure-lab.html gamma-trading-lab.html
options-structure-lab.html:2528:      if (handoff.status !== 'refused') { notice.textContent = ''; notice.hidden = true; return; }
options-structure-lab.html:2529:      notice.textContent = 'The link named a company this tool could not accept, so it is showing ' + state.ticker + '.';
gamma-trading-lab.html:1816:                if (handoff.status !== 'refused') { notice.textContent = ''; notice.hidden = true; return; }
gamma-trading-lab.html:1817:                notice.textContent = 'The link named a company this tool could not accept, so it is showing ' + state.ticker + '.';
(no innerHTML write anywhere in the notice path)

$ (every tests/*.mjs path named by the Scope 1 section of scopes.md)
tests/gamma-trading-lab.spec.mjs           EXISTS
tests/options-structure-lab.spec.mjs       EXISTS
```

`grep -rn 'tickerFromQuery' .` returns occurrences in exactly two families and
nowhere else: this feature's own artifacts (`spec.md`, `design.md`, `scopes.md`,
`state.json`) and this scope's own selftest group in `scripts/selftest.mjs`,
where the token appears three times — the detector regex, the mutant the
adversarial row constructs, and that row's assertion title. No production route
contains it. That is the exact shape row 1.10 requires, since a single-definition
assertion cannot be written without naming the identifier it forbids.

##### Observed conditions recorded rather than smoothed over

1. **`node scripts/selftest.mjs` exits 1, not 0.** The single failure is
   `NEW-MISSING tests/options-flow-feed-lab.spec.mjs (36 reference site(s))`,
   referenced by `design.md:669`. That file is a **Scope 2** deliverable. No
   stub was created to silence it and no design wording was changed. Because of
   it, the two Tier 1 DoD items that require `node scripts/selftest.mjs` to exit
   0 with zero failing assertions are **left unticked** with the declaration
   recorded beside them in [scopes.md](scopes.md).
2. **Two contended runs reported extra failures that do not reproduce.** The
   red-stage run reported 4 failures and one green-stage run reported 6; the
   extra ones were all in lifetime-tax paths (`TP-01-16`, `TP-04-03`, `TP-05-01`,
   `TP-05-10`, `TP-05-11`) which this scope does not touch and which differed
   between the two runs. Two consecutive control runs at an identical tree state
   both reported `3129 passed, 1 failed`. The extra failures are therefore
   load-dependent flake in another feature's suite, not a consequence of this
   scope, and they are named here rather than omitted.
3. **The refusal notice renders `showing SPY?.` as raw text.** The trailing `?`
   is not in the string literal, which is plain ASCII and ends `+ state.ticker +
   '.'`. It is the shared `rlticker.js` decorator, which finds the `SPY` token in
   the notice's text node and wraps it in a Yahoo Finance link plus an
   `aria-label="Explain SPY"` context button whose visible glyph is `?`. Every
   ticker mention on every page is decorated the same way, so this is existing
   site-wide behavior reaching new copy, not a defect introduced here. The
   notice is still written with `textContent` and never with `innerHTML`, so the
   decoration is applied by the trusted shared runtime to an already-safe text
   node and the refusal posture is unaffected.

#### Scope 2 — The two catalog-bound receiving routes

Not executed. This scope additionally records the FR-027-015 pre-change baseline
for `options-flow-feed-lab.html`, captured from the unmodified route **before**
any edit to it: first-paint verdict text, feed row count and order, table row
order under the default sort, by-ticker order, the status line, and the
persisted-state round trip.

#### Scope 3 — The registry, the declarations and the stated bare reasons

Not executed.

#### Adversarial evidence (NFR-027-002, P23)

Six guards, each paired with a recorded failing run under a deliberate mutation
and a recorded passing run with the guard restored. Every mutation is reverted
before its scope closes.

| # | Guard | Mutation that must turn the named row red | Scope |
| --- | --- | --- | --- |
| 1 | `SUBJECT_PATTERN` | Replace with a permissive pattern | 1 |
| 2 | `raw: null` contract | Return the refused value in `raw` | 1 |
| 3 | Volatility catalog lookup | Remove the `assets[].symbol` lookup | 2 |
| 4 | Options-flow catalog lookup | Remove the `UNIVERSE` lookup | 2 |
| 5 | D4 containment | Narrow the receiver rule to the sender expression | 1 |
| 6 | Exactly-one-of registry rule | Remove the rule | 3 |

**Scope 1 guards 1, 2 and 5: executed.** Guards 3, 4 and 6 belong to Scopes 2
and 3 and are not executed.

Each of the three Scope 1 guards is realised as a paired assertion inside the
appended selftest group rather than as a hand-edited source mutation, so the
mutation is constructed in memory, exercised, and discarded within the same run
— there is no window in which a mutated guard could be left behind on disk. The
three assertions and their real counts are in the fourteen-assertion block
above: 12 corpus values slip through a permissive `SUBJECT_PATTERN`, 13 refused
values escape through a leaked `raw`, and a receiver narrowed to reject a
one-character subject refuses the sender-valid value `"S"`.

Guard 5 is recorded with a correction rather than a pass. `design.md` adversarial
obligation 4 asks that narrowing the receiver to the **sender** expression turn
the containment property red. It cannot, and the selftest says so in its own
assertion text: the sender expression is applied after normalisation, uppercasing
maps every sender-legal letter back into the sender class, so that particular
narrowing refuses nothing. The containment property is instead proven falsifiable
by a narrowing that really does refuse a sender-valid value. The obligation as
written is not a falsifier of this property; that is a finding against
`design.md`, routed to its owner rather than papered over here.

Independently of the in-memory guards, the whole implementation was reverted to
`HEAD` and the scenario contracts observed to fail — recorded above as the RED
stage with exit code 1 on both the unit and the browser command.

---

## Scope 2 — The two catalog-bound receiving routes

**Executed:** YES
**Phase Agent:** bubbles.implement
**Claim Source:** executed

### Scope 2 · FR-027-015 baseline captured BEFORE any edit

`options-flow-feed-lab.html` belongs to no owning feature, so the comparison
target is a baseline captured from the unmodified route. At capture time the
route was byte-identical to `HEAD`:

**Command:** `shasum -a 256 options-flow-feed-lab.html`

```
ROUTE_UNMODIFIED_SHA256=5b66a095b58e798686aefb407767dd118584a70694965b36b52d39a45b57dc98
HEAD_sha256:            5b66a095b58e798686aefb407767dd118584a70694965b36b52d39a45b57dc98
```

**Command:** `npx --no-install playwright test tests/options-flow-feed-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --workers=1 --reporter=line --grep "SCN-027-005 with no subject parameter"`
**Exit code:** 1 (the pinned literals were still `PENDING_CAPTURE`, which is how
the real values were observed)

```
FR-027-015 BASELINE OBSERVED: {"verdict":"Tape lean: call-heavy (leaning bullish)","verdictSub":"Across 22 flagged strikes · call premium $3.3M vs put premium $275K (positioning proxy, not real-time flow)","status":"12/12 chains cached · 22 active strikes","feedOrder":["GOOGL","AMD","MSFT","META","AMZN","TSLA","AAPL","IWM","NVDA","SPY","QQQ","SPY","QQQ","IWM","NVDA","TSLA","AAPL","MSFT","META","AMZN","GOOGL","AMD"],"tableOrder":["GOOGL C 94","AMD C 94","MSFT C 93","META C 93","AMZN C 93","TSLA C 92","AAPL C 92","IWM C 91","NVDA C 91","SPY C 90","QQQ C 90","SPY P 20","QQQ P 20","IWM P 20","NVDA P 19","TSLA P 19","AAPL P 19","MSFT P 19","META P 19","AMZN P 19","GOOGL P 19","AMD P 19"],"byTickerOrder":["AMD","GOOGL","AMZN","META","MSFT","AAPL","TSLA","NVDA","IWM","QQQ","SPY"],"savedState":"{\"mode\":\"simple\",\"side\":\"both\",\"min\":0,\"dte\":\"all\",\"sortK\":\"score\",\"sortDir\":-1}"}
```

Those exact values are pinned as `BASELINE` in
[tests/options-flow-feed-lab.spec.mjs](../../tests/options-flow-feed-lab.spec.mjs),
so row 2.8 compares against the pre-change observation and not against a value
read back after the change.

The captured `savedState` is also the evidence for a finding: `saveState()` on
this route serialises the whole `state` object and has therefore always written
**six** keys — `mode`, `side`, `min`, `dte`, `sortK`, `sortDir` — not the four
that `loadState()` reads back. See Finding S2-F1 below.

### Scope 2 · RED — before either route was edited

**Command:** `node scripts/selftest.mjs`
**Exit code:** 1

```
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (1 new, 67 known-missing, 0 stale of 249 referenced)

================================================
Research-Lab self-test: 3129 passed, 1 failed
================================================
```

**Command:** `npx --no-install playwright test tests/volatility-sizing-lab.spec.mjs tests/options-flow-feed-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --workers=1 --reporter=line`
**Exit code:** 1
**Route state at RED:** `git status --porcelain volatility-sizing-lab.html options-flow-feed-lab.html` printed nothing — both routes byte-unchanged.

```
  12 failed
  1) options-flow-feed-lab.spec.mjs:104 › Regression: SCN-027-005 … pre-change baseline
  2) options-flow-feed-lab.spec.mjs:113 › Regression: SCN-027-001 ?ticker=NVDA … premium split
  3) options-flow-feed-lab.spec.mjs:129 › Regression: SCN-027-003 … equal the unlinked baseline exactly
  4) options-flow-feed-lab.spec.mjs:143 › Regression: SCN-027-002 … absent from localStorage afterwards
  5) options-flow-feed-lab.spec.mjs:166 › Regression: SCN-027-004 … rather than only in a table cell
  6) options-flow-feed-lab.spec.mjs:177 › Regression: SCN-027-012 … two distinct named statements
  7) options-flow-feed-lab.spec.mjs:192 › Regression: SCN-027-013 … leaves the scan unchanged
  8) volatility-sizing-lab.spec.mjs:623 › Regression: SCN-027-005 … identical to the pre-feature baseline
  9) volatility-sizing-lab.spec.mjs:639 › Regression: SCN-027-001 ?ticker=NVDA selects NVDA …
  10) volatility-sizing-lab.spec.mjs:651 › Regression: SCN-027-004 … not only inside a chart
  11) volatility-sizing-lab.spec.mjs:663 › Regression: SCN-027-012 … named as unavailable …
  12) volatility-sizing-lab.spec.mjs:681 › Regression: SCN-027-013 … none reflects the refused value
  22 passed (4.2m)
```

The volatility unlinked first paint was captured in the same RED run and pinned
as `UNLINKED_BASELINE`:

```
SCN-027-005 VOLATILITY UNLINKED PAINT: {"asset":"SPY","selectValue":"SPY","targetVolInput":"15","targetVol":0.15,"assetName":"SPY","decisionState":"ready","noticeText":null,"noticeHidden":null}
```

`noticeText: null` and `noticeHidden: null` are the pre-change reading: the
status element did not exist yet.

### Scope 2 · GREEN — after both routes were implemented

**Command:** `node scripts/selftest.mjs`
**Exit code:** 0

```
Feature 027 Scope 2: the two catalog-bound receiving routes
  ✓ Feature 027 Scope 2: both receiving routes consume the shared RLTKR.linkedSubject rule and neither declares a private acceptance grammar (no private rule)
  ✓ Feature 027 Scope 2: volatility-sizing-lab resolves an accepted subject against runtime.config.assets[].symbol before applying it
  ✓ Feature 027 Scope 2: options-flow-feed-lab resolves an accepted subject against its UNIVERSE before treating it as covered
  ✓ Feature 027 Scope 2: no accepted subject reaches a localStorage key, a constructed path or a fetch target on either route (no sink reached)
  ✓ Feature 027 Scope 2: the options-flow focus band never enters filtered() and never writes state.sortK or state.sortDir (376 chars of filtered() scanned)
  ✓ Feature 027 Scope 2: the resolved focus is held off state, so the unchanged saveState(JSON.stringify(state)) cannot persist it
  ✓ Feature 027 Scope 2: each route carries exactly one role="status" #linkNotice, hidden by default and never written with innerHTML
  ✓ Feature 027 Scope 2: the options-flow band renders absent, refused, not-covered, covered-with-nothing-flagged and covered-with-flags as five distinct statements (5/5)
  ✓ Feature 027 Scope 2: neither edited route introduced ES module syntax or an arrow function into its inline ES5 script (both ES5)
  ✓ Regression: SCN-027-CANARY every pre-existing selftest assertion stays green after the Feature 027 Scope 2 append (3142 assertion(s) already green at this point)

================================================
Research-Lab self-test: 3143 passed, 0 failed
================================================
```

The `newMissing` finding that named `tests/options-flow-feed-lab.spec.mjs` is
gone: the file now exists and carries nine real tests. Row 2.17 ran and was green
before either route spec was run in full.

**Command:** `npx --no-install playwright test tests/volatility-sizing-lab.spec.mjs tests/options-flow-feed-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --workers=1 --reporter=line`
**Exit code:** 0

```
# S2 GREEN-1 Scope 2 target specs
exit: 0
lines: 44
sha256: f81f551401bd786bf1fcb77ee4229d60bbae4a4e1caa922f66d1c28bd072cd6e
[30/34] › Regression: SCN-027-001 ?ticker=NVDA selects NVDA in the asset select and names it on screen
[31/34] › Regression: SCN-027-004 the active subject is readable as page text and in the accessibility tree, not only inside a chart
[32/34] › Regression: SCN-027-012 an acceptable company outside the eleven-asset universe is named as unavailable and the default asset stays fully computed
[33/34] › Regression: SCN-027-013 after a refusal every control reflects one single subject and none reflects the refused value
[34/34] › Regression: SCN-027-010 no adversarial corpus value appears in the body, in any attribute or in localStorage, and empty and whitespace parameters match the no-parameter paint
  34 passed (17.7s)
```

`tests/volatility-sizing-lab.spec.mjs` went from nineteen tests to twenty-five;
no pre-existing title was renamed and no pre-existing assertion was weakened.
`tests/options-flow-feed-lab.spec.mjs` contributes nine.

**Command:** `npx --no-install playwright test tests/options-structure-lab.spec.mjs tests/gamma-trading-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --workers=1 --reporter=line`
**Exit code:** 0

```
# S2 GREEN-2 Scope 1 regression (precedent routes)
exit: 0
lines: 14
sha256: 99026427264c1d7c34c82399efb62004bc4759fdf26e2ec30dbb001a83402e16
[9/10] › Regression: SCN-027-006 no parameter, an empty parameter and a whitespace parameter render identical first paints
[10/10] › Regression: SCN-027-001 an accepted subject seeds the route and outranks restored session state
  10 passed (8.4s)
```

**Command:** `node --test tests/company-intelligence.unit.mjs`
**Exit code:** 0

```
ℹ tests 76
ℹ pass 76
ℹ fail 0
```

**Command:** `bash .github/bubbles/scripts/artifact-lint.sh specs/027-company-scoped-owner-deep-links`
**Exit code:** 0

```
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md

=== End Anti-Fabrication Checks ===

Artifact lint PASSED.
```

### Scope 2 · Adversarial mutations (rows 2.15 and 2.16)

Each mutation removes the catalog binding while leaving the shared grammar
acceptance intact, which is exactly the failure this scope exists to prevent.

**Row 2.15 — volatility catalog lookup removed.** `var match = handoff.status === "accepted" ? catalogAsset(handoff.subject) : null;`
replaced by `… ? { symbol: handoff.subject, defaultTargetVol: 0.15 } : null;`

**Command:** `npx --no-install playwright test tests/volatility-sizing-lab.spec.mjs … --grep "SCN-027-012"`
**Exit code under the mutation:** 1

```
guard_matches=1 expected=1
1137:  var match = handoff.status === "accepted" ? { symbol: handoff.subject, defaultTargetVol: 0.15 } : null;
MUTATED_2_15_EXIT=1
  1 failed
    › Regression: SCN-027-012 an acceptable company outside the eleven-asset universe is named as unavailable and the d…
```

The revert of this mutation used `git checkout --`, which restored the file to
`HEAD` and so discarded the scope's own edit as well. The edit was re-applied and
verified byte-exact against the pre-mutation hash:

```
RESTORED_SHA256=02f6f82ff8b809030c9c04cd9f53cf828eb56d5cc788e529e6ae265ecfd9f268
EXPECTED_PRE_MUTATION=02f6f82ff8b809030c9c04cd9f53cf828eb56d5cc788e529e6ae265ecfd9f268
RESTORE_VERIFIED=yes
```

**Row 2.16 — options-flow `UNIVERSE` lookup removed.** `if (!inUniverse(FOCUS.subject)) {`
replaced by `if (false && !inUniverse(FOCUS.subject)) {`, reverted by targeted
back-substitution rather than `git checkout`.

**Command:** `npx --no-install playwright test tests/options-flow-feed-lab.spec.mjs … --grep "SCN-027-012"`
**Exit code under the mutation:** 1

```
BEFORE=88568b5744937f93c133aa52659a633335f043d8b65b5242bd7327c0d79471cc
guard_matches=1 expected=1
578:        if (false && !inUniverse(FOCUS.subject)) {
MUTATED_2_16_EXIT=1
    > 188 |     expect(uncovered).toMatch(/does not include it/);
  1 failed
    › Regression: SCN-027-012 a covered ticker with no flagged strike and an uncovered ticker render two distinct named…
AFTER=88568b5744937f93c133aa52659a633335f043d8b65b5242bd7327c0d79471cc
REVERT_VERIFIED=yes
```

Both mutations are reverted. Both routes were re-run green afterwards in the
GREEN-1 block above.

### Scope 2 · `file://` behaviour

**Command:** headless Chrome opening each route directly from `file://`, with and
without a subject parameter.

```
[
 {"file":"volatility-sizing-lab.html","q":"(none)","present":true,"role":"status","hidden":true,"text":"","rltkr":"object","pageErrors":[]},
 {"file":"volatility-sizing-lab.html","q":"?ticker=NVDA","present":true,"role":"status","hidden":true,"text":"","rltkr":"object","pageErrors":[]},
 {"file":"options-flow-feed-lab.html","q":"(none)","present":true,"role":"status","hidden":true,"text":"","rltkr":"object","pageErrors":[]},
 {"file":"options-flow-feed-lab.html","q":"?ticker=NVDA","present":true,"role":"status","hidden":false,
  "text":"Focus: NVDA? — covered by this scan, but no strike crossed the activity bar for it. The full scan below is unchanged.","rltkr":"object","pageErrors":[]}
]
```

`options-flow-feed-lab.html` loads and operates from `file://`: the band renders,
`RLTKR` resolves, and there are no page errors. The trailing `?` inside the band
text is the shared `RLTKR.scan` context control, which auto-upgrades every known
ticker token anywhere in `document.body`; the band is still written with
`textContent` and is reset on every render, so nothing accumulates.

`volatility-sizing-lab.html` on `file://` cannot fetch its universe, so its
existing `showConfigError` path renders and the handoff never runs — which is the
planned failure interaction, one problem shown rather than two. This is
**pre-existing and unchanged**, proven against an isolated `HEAD` worktree:

```
{"head_configLoaded":false,"head_configErrorShown":true,"head_select":"","head_hasLinkNotice":false}
```

versus the same probe on the working tree:

```
{"query":"?ticker=NVDA","configLoaded":false,"configErrorShown":true,"asset":null,"select":"","notice":"","noticeHidden":true}
```

Identical outcome before and after, so the route's `file://` limitation is not a
regression introduced here. The full behaviour of both routes is exercised over
HTTP by the browser suites above.

### Scope 2 · Change boundary, rollback and consumer sweep

**Command:** `git --no-pager diff --numstat -- scripts/selftest.mjs`

```
80      0       scripts/selftest.mjs
```

Zero deleted lines — the selftest edit is a pure append inside its own
`FEATURE-027-CATALOG-BOUND-BEGIN/END` markers, so a revert fully restores it.

**Command:** `git status --porcelain company-fundamentals-lab.html technical-analysis-decision-lab.html trend-dynamics-cycle-lab.html`
**Output:** empty — all three disqualified routes are byte-unchanged.

**Command:** `git status --porcelain <this scope's allowed paths>`

```
 M notes/options-flow-feed-lab.md
 M notes/volatility-sizing-lab.md
 M options-flow-feed-lab.html
 M scripts/selftest.mjs
 M tests/volatility-sizing-lab.spec.mjs
 M volatility-sizing-lab.html
?? tests/options-flow-feed-lab.spec.mjs
```

Those seven paths are everything this scope touched, and every one is inside
`workBoundary.allowedPaths`.

**Command:** `git --no-pager diff --numstat -- volatility-sizing-lab.html options-flow-feed-lab.html`

```
54      0       options-flow-feed-lab.html
35      0       volatility-sizing-lab.html
```

Both route edits are pure additions — zero deleted lines, so no pre-existing
behaviour was removed or rewritten.

**Consumer sweep.** Both `tools.json` rows still resolve, both notes paths still
resolve, both routes are still registered in `rlnav.js`, and every `tests/*.mjs`
path named anywhere in this feature's artifacts exists on disk:

```
volatility-sizing-lab file=volatility-sizing-lab.html exists=true notes=notes/volatility-sizing-lab.md notesExists=true
options-flow-feed-lab file=options-flow-feed-lab.html exists=true notes=notes/options-flow-feed-lab.md notesExists=true
OK   tests/company-intelligence-lab.spec.mjs
OK   tests/company-intelligence.unit.mjs
OK   tests/gamma-trading-lab.spec.mjs
OK   tests/options-flow-feed-lab.spec.mjs
OK   tests/options-structure-lab.spec.mjs
OK   tests/volatility-sizing-lab.spec.mjs
```

### Scope 2 · `specs/026` concurrent-modification check

Checked **before** the scope began and again **after** it finished. The one file a
concurrent `specs/026` session might also touch is `options-flow-feed-lab.html`.

Before: `git status --porcelain options-flow-feed-lab.html` printed nothing, and
the worktree copy hashed identically to `HEAD`
(`5b66a095…dc98`, last touched by `cbc7cf7aa fix: close roadmap verification gaps`,
2026-08-02). `specs/026-actionable-brief-brevity-and-cross-asset` contains only
`spec.md` and names the route in prose.

After: `git show HEAD:options-flow-feed-lab.html` still hashes to
`5b66a095…dc98` and the last commit touching the file is still `cbc7cf7aa`. No
concurrent modification landed during this scope, so there was no collision to
route.

### Scope 2 · Findings routed to `bubbles.plan`

**S2-F1 — the `saveState()` DoD item mis-describes the pre-existing module.**
The Tier 2 item reads "`saveState()` on `options-flow-feed-lab.html` writes
exactly `mode`, `side`, `min` and `dte` after a deep-linked visit". The route's
`saveState()` is `localStorage.setItem(LS, JSON.stringify(state))` — it
serialises the whole `state` object and has always written six keys, including
`sortK` and `sortDir`. The pre-change baseline capture proves it:
`{"mode":"simple","side":"both","min":0,"dte":"all","sortK":"score","sortDir":-1}`.
The binding half of the requirement — that no linked subject is ever persisted —
is implemented and proven, and the persisted payload after a deep-linked visit is
identical to the unlinked one. The item as written cannot be made true without
changing what this route persists, which would be a behaviour change to an
already-shipped surface. Routed rather than papered over; the DoD item is left
unticked with an Uncertainty Declaration.

**S2-F2 — the Implementation Plan asks for the focus on `state`.** The plan says
"The resolved focus is stored on `state` but **not** persisted". Both halves
cannot hold at once, for the reason in S2-F1: anything on `state` is persisted by
`saveState()`. The binding half was implemented — the focus is held in a
module-level `FOCUS` and never persisted — and `saveState()` was left byte-
unchanged so no reader control changed meaning. Same routing.

---

## Scope 3 — The registry, the declarations and the stated bare reasons

### Scope 3 · What the defect was

`HEAD` declared `ownerSubjectParam: "ticker"` on `options-structure` and
`dealer-gamma` while neither owner route read a company, and nine further owner
rows carried a bare link with no stated reason. Scopes 1 and 2 landed the four
readers. This scope closes the other half: it declares the parameter on the two
rows whose routes now read one, states the reason on the seven that legitimately
carry none, and makes the silence that hid the original defect a config-read
error rather than an editorial promise.

### Scope 3 · RED — the guard proves it can fail (Test Plan row 3.8)

The exactly-one-of rule in `readCoverageRegistry` was disabled in place
(`if (false && ...)`), the suite was re-run, and the two rows that own the rule
went red. The mutation was reverted immediately afterwards.

**Executed:** YES
**Command:** `node --test tests/company-intelligence.unit.mjs` (with the exactly-one-of rule removed)
**Exit Code:** 1
**Phase Agent:** bubbles.implement
**Claim Source:** executed

```
ℹ tests 83
ℹ pass 80
ℹ fail 3

✖ failing tests:
✖ a subject-carrying owner link opens the owning tool on the same company and can carry nothing else (1.125042ms)
✖ a row with an ownerDeepLink declaring neither ownerSubjectParam nor ownerBareReason raises C025-CONFIG-SCHEMA naming its dimension id (0.172084ms)
✖ a row declaring both ownerSubjectParam and ownerBareReason raises C025-CONFIG-SCHEMA naming its dimension id (0.096125ms)
```

Rows 3.1 and 3.2 are both in that list, which is what row 3.8 requires. The third
failure is the pre-existing Feature 025 test that also depends on the rule, so the
mutation's blast radius is visible rather than hidden.

### Scope 3 · Mutation reverted, then GREEN

**Executed:** YES
**Command:** `grep -c 'MUTATION UNDER TEST' rlcompanyintel.js && node --test tests/company-intelligence.unit.mjs`
**Exit Code:** 0
**Phase Agent:** bubbles.implement
**Claim Source:** executed

```
$ grep -c 'MUTATION UNDER TEST' rlcompanyintel.js
0

$ node --test tests/company-intelligence.unit.mjs
ℹ tests 83
ℹ suites 0
ℹ pass 83
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 159.793333
```

Zero failing and zero skipped. The suite was 76 tests before this scope and is 83
after, so the seven Test Plan rows 3.1 through 3.7 are additions, not rewrites of
existing coverage. One existing Feature 025 assertion was updated rather than
added: the bare-owner branch previously matched the single old sentence
`/reads no company parameter/`, which the reason-specific statements replace, and
it now matches the reason its own row declares.

### Scope 3 · Test Plan rows 3.1 through 3.7 (unit)

**Executed:** YES
**Command:** `node --test tests/company-intelligence.unit.mjs`
**Exit Code:** 0
**Phase Agent:** bubbles.implement
**Claim Source:** executed

```
✔ a row with an ownerDeepLink declaring neither ownerSubjectParam nor ownerBareReason raises C025-CONFIG-SCHEMA naming its dimension id
✔ a row declaring both ownerSubjectParam and ownerBareReason raises C025-CONFIG-SCHEMA naming its dimension id
✔ an ownerBareReason outside the closed enum, and an ownerBareReason on a row with no ownerDeepLink, each raise C025-CONFIG-SCHEMA
✔ a market-scoped row composes a bare href and its statement says the owner answers a market-wide question
✔ a fixed-subject row composes a bare href and its statement says the owner opens on its own subject
✔ the shipped registry declares four subject-carrying rows, seven bare rows with a reason and four ownerless rows, and no market-scoped row carries a subject parameter
✔ every declared ownerSubjectParam is the single shared parameter name and no second convention exists
```

### Scope 3 · Row 3.12 canary and the selftest append

The canary was run BEFORE the browser suites, as its own Definition of Done item
requires, so a shared-surface break would have been seen without a browser.

**Executed:** YES
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Phase Agent:** bubbles.implement
**Claim Source:** executed

```
Feature 027 Scope 3: the registry, the declarations and the stated bare reasons
  ✓ Feature 027 Scope 3: the shipped registry holds fifteen rows partitioned into four subject-carrying, seven bare-with-a-reason and four ownerless, and every linked row declares exactly one of the two fields (15 rows, 4/7/4, misdeclared: none)
  ✓ Feature 027 Scope 3: a linked row declaring neither field, one declaring both, a reason outside the closed enum and a reason with no owner route each raise C025-CONFIG-SCHEMA naming the offending dimension (all four refused)
  ✓ Feature 027 Scope 3: ownerBareReason is a closed enum of exactly market-scoped and fixed-subject (2/2 admitted, 5/5 refused)
  ✓ Feature 027 Scope 3: a market-scoped and a fixed-subject row each compose a bare href with its own reason-specific statement, a declared row composes the company, and describeDimensionOwner keeps company-dimension-owner/v1 and its seven keys
  ✓ Feature 027 Scope 3: every declared ownerSubjectParam names the single shared parameter and every route it is declared on loads rlticker.js and calls RLTKR.linkedSubject (every declaration has a reader)
  ✓ Feature 027 Scope 3: the registry embedded in the route still equals the committed registry file after the new declarations
  ✓ Feature 027 Scope 3: the stated reason is written with the same textContent helper on both the coverage table and the dimension card, and neither ownerRouteFor nor SAFE_OWNER_ROUTE was widened to render it (2/2 sinks)
  ✓ Regression: SCN-027-CANARY every pre-existing selftest assertion stays green after the Feature 027 Scope 3 append (3154 assertion(s) already green at this point)

================================================
Research-Lab self-test: 3155 passed, 0 failed
================================================
```

The suite reported 3145 passed before this scope and 3155 after, so the append
added ten assertions and broke none.

### Scope 3 · Test Plan rows 3.9 through 3.11 (regression E2E)

**Executed:** YES
**Command:** `npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1`
**Exit Code:** 0
**Phase Agent:** bubbles.implement
**Claim Source:** executed

```
  ✓  33 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1333:1 › Regression: SCN-027-018 every subject-carrying owner link opens its owner route on the company being read
  ✓  34 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1372:1 › Regression: SCN-027-014 every bare owner row renders its stated reason beside the link on both the coverage table and the dimension card
  ✓  35 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1421:1 › Regression: SCN-027-010 the rendered reason is written with textContent and no registry-authored value reaches an attribute or an href

  35 passed (50.6s)
```

Zero failing and zero skipped. `--workers=1` was used because the machine is
contended and parallel workers produce teardown noise that is not a test failure.

Row 3.9 proves the handoff end to end in two halves: the composed href on screen
equals `<route>.html?ticker=MSFT` for each of the four declared rows, and opening
that href makes the target route's own loaded copy of the shared rule return
`{status: "accepted", subject: "MSFT"}`. Whether the accepted company is then
inside that route's catalog is the receiving route's own covered/not-covered
decision, which Scopes 1 and 2 own and test.

### Scope 3 · Feature 025 does not regress

The registry this scope edits is consumed by the Feature 025 route, so both of
that feature's suites were re-run in full.

**Executed:** YES
**Command:** `npx --no-install playwright test tests/company-intelligence-lab.spec.mjs tests/chaos-company-intelligence.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1`
**Exit Code:** 0
**Phase Agent:** bubbles.implement
**Claim Source:** executed

```
  46 passed (1.2m)
```

43 passed before this scope, 46 after: the three additions are rows 3.9 to 3.11
and nothing pre-existing was lost. The unit suite moved 76 → 83 the same way. The
declarations are additive because both Feature 025 tests filter on the field
rather than asserting a count — that was read from the source, not assumed, and
the re-run confirms it.

**Executed:** YES
**Command:** `bash .github/bubbles/scripts/artifact-lint.sh specs/025-company-multi-horizon-intelligence-lab`
**Exit Code:** 0
**Phase Agent:** bubbles.implement
**Claim Source:** executed

```
✅ No unfilled evidence template placeholders in report.md

=== End Anti-Fabrication Checks ===

Artifact lint PASSED.
```

### Scope 3 · Scope 1 and Scope 2 suites re-run

**Executed:** YES
**Command:** `npx --no-install playwright test tests/options-structure-lab.spec.mjs tests/gamma-trading-lab.spec.mjs tests/volatility-sizing-lab.spec.mjs tests/options-flow-feed-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1`
**Exit Code:** 0
**Phase Agent:** bubbles.implement
**Claim Source:** executed

```
  44 passed (35.1s)
```

Backward compatibility for the receiving routes is carried by rows already in
those suites and still green, including
`Regression: SCN-027-005 with no subject parameter the first-paint DOM and the
computed decision are identical to the pre-feature baseline`. This scope changed
no receiving route, so no receiving behaviour could change.

### Scope 3 · Change boundary, rollback and the sending composer

**Executed:** YES
**Command:** `git diff --numstat` on the six files this scope changed, then `git status --porcelain specs/025-company-multi-horizon-intelligence-lab`
**Exit Code:** 0
**Phase Agent:** bubbles.implement
**Claim Source:** executed

```
$ git diff --numstat rlcompanyintel.js company-intelligence.config.json company-intelligence-lab.html tests/company-intelligence.unit.mjs tests/company-intelligence-lab.spec.mjs scripts/selftest.mjs
17      0       company-intelligence-lab.html
9       0       company-intelligence.config.json
43      5       rlcompanyintel.js
113     0       scripts/selftest.mjs
130     0       tests/company-intelligence-lab.spec.mjs
200     14      tests/company-intelligence.unit.mjs

$ git status --porcelain specs/025-company-multi-horizon-intelligence-lab
```

`specs/025-...` prints nothing, so no artifact of the consuming feature was
touched. `scripts/selftest.mjs` reports zero deleted lines, which is the
pure-append proof a revert fully restores the shared surface.

The five deleted lines in `rlcompanyintel.js` are the old single-sentence
statement expression, replaced by the four-branch form; the fourteen in the unit
suite are the two adapted assertions described above. Neither `ownerRouteFor` nor
`SAFE_OWNER_ROUTE` was touched — the hunk headers on that file are at old lines
96, 324, 330 and 512, while `SAFE_OWNER_ROUTE` is declared at old line 90 and
`ownerRouteFor` spans old lines 468 to 483:

```
$ git diff -U0 rlcompanyintel.js | grep -E '^@@|^[-+](var SAFE_OWNER_ROUTE|.*ownerRouteFor)'
@@ -96,0 +97,6 @@
@@ -324,0 +331,19 @@
@@ -330,0 +356 @@
@@ -512,5 +538,17 @@
```

The grep matched no added or removed line naming either symbol.

### Scope 3 · Repository invariants

**Executed:** YES
**Command:** `node scripts/pii-scan.mjs`, then an ES-module/bundler check on the sending route
**Exit Code:** 0
**Phase Agent:** bubbles.implement
**Claim Source:** executed

```
$ node scripts/pii-scan.mjs
[pii-scan] files=8111 messages=1621 findings=0 OK

$ node -e '...' company-intelligence-lab.html
import_stmt=false export_stmt=false type_module=false arrow_in_inline=false
```

The route stays ES5 with no bundler, and the browser suite's own
`the route reaches its first paint from a file:// origin with no server and no
off-origin request` is green in the run above, so `file://` still works.

### Scope 3 · Uncertainty Declaration — the working-tree change-boundary item

One Tier 1 Definition of Done item is left unticked deliberately. It asks that
`git status --porcelain` name no path outside this scope's Allowed file families.
The six paths this scope changed are all Allowed, and `specs/025-...` is clean,
but the working tree also carries pre-existing modifications from other in-flight
work that this scope neither created nor touched — among them `briefs/`,
`notes/README.md`, `market-brief.owner-reads.json`,
`scripts/brief-narrative-parallel.mjs`, `scripts/build-attention-items.mjs`,
`specs/022-*` and `specs/_bugs/BUG-009-*`. Read literally the item is therefore
false, and it is recorded as false rather than reinterpreted to fit.

### Scope 3 · Findings routed to `bubbles.plan`

**S3-F1 — the Test Plan's row 3.5 title and the design's statement wording
differ by one word.** Row 3.5 is titled `... its statement says the owner opens
on its own subject`; the design's statement table says the link `opens on that
tool's own subject`. The implemented statement uses the design's wording and the
test asserts that wording, so the two agree in substance. The scopes.md row title
is the artifact that is one word off, and it is owned by `bubbles.plan`.

---

### Code Diff Evidence

**Executed:** YES (Scope 1)
**Phase Agent:** bubbles.implement
**Claim Source:** executed

No implementation commit exists yet; the Scope 1 change is in the working tree.
The per-file line deltas below are the real output of the named command and name
six non-artifact runtime, source and test paths:

```
$ git diff --numstat rlticker.js options-structure-lab.html gamma-trading-lab.html scripts/selftest.mjs notes/options-structure-lab.md notes/gamma-trading-lab.md
25      0       rlticker.js
14      0       options-structure-lab.html
20      1       gamma-trading-lab.html
199     0       scripts/selftest.mjs
23      0       notes/options-structure-lab.md
23      0       notes/gamma-trading-lab.md

$ git status --porcelain rlticker.js options-structure-lab.html gamma-trading-lab.html scripts/selftest.mjs notes/options-structure-lab.md notes/gamma-trading-lab.md tests/options-structure-lab.spec.mjs tests/gamma-trading-lab.spec.mjs
 M gamma-trading-lab.html
 M notes/gamma-trading-lab.md
 M notes/options-structure-lab.md
 M options-structure-lab.html
 M rlticker.js
 M scripts/selftest.mjs
?? tests/gamma-trading-lab.spec.mjs
?? tests/options-structure-lab.spec.mjs
```

The one deleted line is in `gamma-trading-lab.html`, where the bare `boot();`
call became the `DOMContentLoaded`-guarded form the sibling route already used,
so `boot` runs after the shared modules it now reads, which carry the `defer`
attribute and are therefore not yet evaluated at inline-script time. Both shared
surfaces, `rlticker.js` and `scripts/selftest.mjs`, report **zero** deleted
lines, which is the pure-append proof a revert fully restores.

---

### Validation Evidence

**Executed:** NO
**Command:** not run
**Phase Agent:** bubbles.validate
**Claim Source:** not-run

Awaiting scope execution.

---

### Audit Evidence

**Executed:** NO
**Command:** not run
**Phase Agent:** bubbles.audit
**Claim Source:** not-run

Awaiting scope execution.

---

### Chaos Evidence

**Executed:** NO
**Command:** not run
**Phase Agent:** bubbles.chaos
**Claim Source:** not-run

Awaiting scope execution.

---

## Anti-Fabrication Correction — uservalidation.md checklist shipped pre-ticked

**Date:** 2026-08-20
**Phase Agent:** bubbles.implement
**Claim Source:** executed

### What was wrong

`uservalidation.md` shipped with all 19 items in its `## Checklist` section
marked `- [x]`. No human has exercised this feature. The spec has run none of
its specialist phases. Every one of those 19 ticks asserted a human acceptance
that never happened.

`.github/bubbles/registry/acceptance-authority.yaml` states that the checklist
ships unchecked and that automation must not check an item, because doing so
"would fabricate the exact fact the gate exists to require". The registry names
"a template used to ship them checked" as a known failure mode. This spec is an
instance of that failure mode.

The sibling spec `specs/025-company-multi-horizon-intelligence-lab` carries the
correct posture: 0 ticked, 53 unticked.

### What was changed

All 19 `- [x]` markers in the `## Checklist` section became `- [ ]`. Only the
checkbox marker changed on each line. No item text was reworded, reordered,
added, or deleted. The file stayed at 94 lines.

Removing an unearned assertion is not a fabrication. It restores the file to
the truthful state the registry requires.

### What was not changed

`## Human Acceptance Record` already held the empty placeholder shape. Every
one of its five field values read `Not recorded`. It contained no name, no
date, no signature, and no assertion that anyone validated the feature. It was
left byte-for-byte as found.

`## Automation Readiness` is automation-owned and its seven table rows were
already unchecked. No row was factually wrong. It was left as found.

### Verification

**Executed:** YES
**Command:** `grep -c "^- \[x\]" specs/027-company-scoped-owner-deep-links/uservalidation.md` and `grep -c "^- \[ \]" ...`
**Claim Source:** executed

```text
=== BEFORE counts (whole file) ===
ticked=19 unticked=0
=== sections ===
18:## Checklist
62:## Automation Readiness
84:## Human Acceptance Record
=== total lines ===
      94 specs/027-company-scoped-owner-deep-links/uservalidation.md

=== AFTER counts ===
ticked=0 unticked=19
=== Automation Readiness table cell checkboxes ===
table_ticked=0 table_unticked=7
=== line count ===
      94 specs/027-company-scoped-owner-deep-links/uservalidation.md
```

**Executed:** YES
**Command:** `bash .github/bubbles/scripts/artifact-lint.sh specs/027-company-scoped-owner-deep-links`
**Claim Source:** executed

```text
✅ Found Checklist section in uservalidation.md
✅ uservalidation checklist contains checkbox entries
✅ All checklist bullet items use checkbox syntax
✅ uservalidation separates automation readiness from human acceptance
✅ Detected state.json status: in_progress
✅ Detected state.json workflowMode: full-delivery

=== Anti-Fabrication Evidence Checks ===
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md

=== End Anti-Fabrication Checks ===

Artifact lint PASSED.
LINT_EXIT=0
```

**Executed:** YES
**Command:** `bash .github/bubbles/scripts/state-transition-guard.sh specs/027-company-scoped-owner-deep-links`
**Claim Source:** executed

```text
--- Check 43: Human Acceptance Terminal Gate (Gate G136) ---
🔴 BLOCK: uservalidation.md does not establish human acceptance; a terminal transition claims it for every behavior (Gate G136)

🔴 TRANSITION BLOCKED: 35 failure(s), 1 warning(s)

failedGateIds: [G056,G060,G022,G040,G068,G089,G094,G136]
failedChecks: [Check-4-completion,Check-5-structure]
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 35
exitStatus: 1
verdict: FAIL
STG_EXIT=1
```

G136 blocking is the correct, honest result. This feature has no human
acceptance, so the gate that requires human acceptance must refuse it.

### Open finding routed to bubbles.plan

The instruction paragraph at lines 6-9 of `uservalidation.md` reads "Every item
below starts checked ... Walk the tool and **uncheck** anything that is not
true for you." That inverted polarity is the mechanism that produced the 19
fabricated ticks. It is prose in a `bubbles.plan`-owned artifact and it is
outside this correction's authorized edit surface, which covered checkbox
markers only. Spec 025 states the correct polarity: "Every item below ships
**unchecked**." The paragraph is routed to `bubbles.plan` as finding
`UV-027-F1`. While it stands, it invites a subsequent agent to re-tick the
checklist.

---

## Closeout Pass — the three rewritten DoD items, verified by execution

**Date:** 2026-08-20
**Phase Agent:** bubbles.implement
**Claim Source:** executed unless a paragraph states otherwise

`bubbles.plan` rewrote three DoD items that a prior pass had correctly refused
to tick, and left verification and ticking to this agent. This section records
what was executed against each, plus the re-examination of the six items that
were still unticked when this pass began.

### Closeout · Item at `scopes.md` line 526 — the single shared definition

One assertion was appended to the Feature 027 Scope 1 marker region of
`scripts/selftest.mjs`. It carries both halves the item asks for.

The module-load half reads the two values off the object the UMD file itself
installs, not off a re-declaration:

```js
const f027Module = Function('var window, document, globalThis = {}; ' + f027Source + '\nreturn globalThis.RLTKR;')();
…
f027Module.SUBJECT_PARAM === 'ticker'
  && f027Module.SUBJECT_PATTERN instanceof RegExp
  && f027Module.SUBJECT_PATTERN.source === '^[A-Z0-9.\\-]{1,12}$'
```

The tree-scan half runs over every root-level `.html` / `.js` production file
and requires: exactly one declaration site for each of `SUBJECT_PARAM` and
`SUBJECT_PATTERN`, and it is `rlticker.js`; the pattern text
`[A-Z0-9.\-]{1,12}` present in exactly one file, and it is `rlticker.js`; zero
production files outside it reading the parameter themselves, where reading it
means `.get('ticker')` or a `?ticker=` / `&ticker=` literal; and both precedent
routes containing `RLTKR.linkedSubject` while containing no declaration of
either name, no copy of the pattern text and no parameter read of their own.

The registry is the one place outside `rlticker.js` that legitimately carries
the parameter NAME. It is asserted equal rather than excused: the distinct
`ownerSubjectParam` values in `company-intelligence.config.json` must be
exactly `["ticker"]` and must equal the module's own `SUBJECT_PARAM`, so a
divergent second convention there turns this assertion red.

Observed message in the green run:

```text
  ✓ Feature 027: SUBJECT_PARAM "ticker" and SUBJECT_PATTERN /^[A-Z0-9.\-]{1,12}$/ are read off the real RLTKR export and are the single shared definition of the convention (declared only in: rlticker.js / rlticker.js; pattern text only in: rlticker.js; production files outside it that read the parameter themselves: none; both precedent routes reach it only through RLTKR.linkedSubject and name neither; registry declares the one name ["ticker"])
```

Corroborated independently in the shell:

```text
$ grep -nE '\b(var|const|let)\s+SUBJECT_(PARAM|PATTERN)\b' *.html *.js
rlticker.js:53:  var SUBJECT_PARAM = "ticker";
rlticker.js:54:  var SUBJECT_PATTERN = /^[A-Z0-9.\-]{1,12}$/;

$ grep -nE "(searchParams|URLSearchParams\([^)]*\))\s*\.?\s*get\(\s*['\"]ticker['\"]" *.html *.js
(no match)

$ grep -l 'A-Z0-9\.\\-\]{1,12}' *.html *.js
rlticker.js
```

`rlcompanyintel.js` matches a plain text search for `SUBJECT_PARAM` only
through the unrelated identifier `SAFE_SUBJECT_PARAM`, a validator for the
registry-declared name. The word-boundary-anchored declaration scan correctly
does not count it.

### Closeout · Item at `scopes.md` line 538 — the aggregate mutation proof

The four adversarial guards 1.7 through 1.10 are in-memory mutants inside one
`node scripts/selftest.mjs` run, so each was proven able to fail by NEUTRALISING
its mutant — making the mutant identical to the real rule — and observing the
guard go red. Per guard:

| Guard | Assertion turned red | Mutation applied |
| --- | --- | --- |
| 1.7 | `Feature 027 adversarial: replacing SUBJECT_PATTERN with a permissive pattern fails the corpus assertion` | the permissive mutant pattern `/^.*$/` replaced with the real `/^[A-Z0-9.\-]{1,12}$/`, so zero corpus values slip through |
| 1.8 | `Feature 027 adversarial: returning the refused value in raw fails the never-reaches-a-sink assertion` | the leaky mutant's `.replace(…, 'status: "refused", subject: null, raw: normalised')` changed back to `raw: null`, so nothing escapes through `raw` |
| 1.9 | `Feature 027 adversarial: the containment property is provably able to fail …` | the narrowing mutant pattern `{2,12}` widened back to `{1,12}`, so the narrowed receiver refuses no sender-valid value |
| 1.10 | `Feature 027 adversarial: restoring either private tickerFromQuery fails the single-definition assertion` | the restored-private-rule injection retargeted from `options-structure-lab.html` to a path that does not exist, so no private copy is appended |

Digests and runs:

```text
PRE-MUTATION  sha256(scripts/selftest.mjs) = 2cc70cf4b78b332f862e4c280ec46f24dcdbc681329458683db23898b2f119f6
MUTATED       sha256(scripts/selftest.mjs) = 573974ae8180bd1fb250d88b8eb4c37b2d231bc4249dc115349c05fa3c89dca0
POST-RESTORE  sha256(scripts/selftest.mjs) = 2cc70cf4b78b332f862e4c280ec46f24dcdbc681329458683db23898b2f119f6
residual mutation tokens after restore: grep -c 'no-such-route.html' scripts/selftest.mjs = 0
```

RED run — `node scripts/selftest.mjs`, exit 1, capture sha256
`5242b3ad4eece15ebfbfb558e6e3df0dbaf5b51c3d199f00acd92f71fc1895ef`. Exactly
four `✗ FAIL` lines, all four guards named:

```text
  ✗ FAIL: Feature 027 adversarial: replacing SUBJECT_PATTERN with a permissive pattern fails the corpus assertion (0 corpus value(s) would slip through)
  ✗ FAIL: Feature 027 adversarial: returning the refused value in raw fails the never-reaches-a-sink assertion (0 refused value(s) would escape through raw)
  ✗ FAIL: Feature 027 adversarial: the containment property is provably able to fail — a receiver narrowed to reject a one-character subject refuses sender-valid [], while narrowing it to the sender expression refuses nothing, so design.md adversarial obligation 4 is not a falsifier of this property
  ✗ FAIL: Feature 027 adversarial: restoring either private tickerFromQuery fails the single-definition assertion

================================================
Research-Lab self-test: 3152 passed, 4 failed
================================================
```

GREEN run after restore — `node scripts/selftest.mjs`, exit 0, capture sha256
`a62ae0a99f8ad136b508d03a8189ebac405dbc0a01cd426cb049437978fa6822`:

```text
================================================
Research-Lab self-test: 3156 passed, 0 failed
================================================
```

No other assertion moved between the two runs, so the four failures are
attributable one-to-one to the four mutations, and the post-restore digest
proves no mutation was left on disk.

### Closeout · Item at `scopes.md` line 760 — nothing about the linked company is persisted

Row 2.11 in `tests/options-flow-feed-lab.spec.mjs` did not previously compare
two visits; it only asserted that three named keys were absent from the linked
visit's payload. The comparison the item requires was added, along with a
`persisted()` helper that reads the payload key set, the whole `localStorage`
key list and the raw persisted string out of the page:

```js
await open(page);
const unlinked = await persisted(page);
await open(page, { query: '?ticker=' + UNCOVERED });
const linked = await persisted(page);
expect(unlinked.stateKeys).toEqual(['dte', 'min', 'mode', 'side', 'sortDir', 'sortK']);
expect(linked.stateKeys).toEqual(unlinked.stateKeys);
expect(linked.storageKeys).toEqual(unlinked.storageKeys);
expect(linked.raw).not.toContain(UNCOVERED);
expect(linked.storageKeys.filter((key) => key.indexOf(UNCOVERED) !== -1)).toEqual([]);
```

The linked visit deliberately uses `UNCOVERED` (`MU`) — the one grammar-valid
symbol the harness does NOT seed a `rlOptFlow:<SYM>` cache entry for — so the
"no storage key contains the linked ticker" clause holds literally rather than
with a carve-out for a pre-seeded cache key.

Green run — exit 0, `1 passed (3.9s)`, capture sha256
`bba9035afe7675b6ed496f89e3e347d58554c27b457dcf8063eac2f2977aefd0`.

The new comparison was then proven live rather than vacuous. Pointing the
storage-key scan at a seeded symbol turned the row red — exit 1, capture sha256
`506eed0a38f81c15a4003f1cc7cf922168254270fa785c4cc1d82bf4a0fdd87e`:

```text
    Error: expect(received).toEqual(expected) // deep equality

    - Array []
    + Array [
    +   "rlOptFlow:NVDA",
    + ]
```

That proves `storageKeys` carries the page's real storage rather than an empty
list. The probe was reverted and the file's sha256 returned to its pre-probe
value `0da3386854b26e80905baa59f2dea777c801a68b71a987c1a8c3e23dbd57e838`.

### Closeout · Re-examination of the six items that were still unticked

Two moved to ticked, four did not. Line numbers are post-edit.

| `scopes.md` line | Item | Outcome |
| --- | --- | --- |
| 519 | Scope 1 Change Boundary | stays unticked — routed to `bubbles.plan` |
| 551 | Scope 1 `file://` with a *manual* open | stays unticked — routed to `bubbles.plan` |
| 747 | Scope 2 Change Boundary | stays unticked — routed to `bubbles.plan` |
| 778 | Scope 2 `file://` on both routes | stays unticked — routed to `bubbles.plan` |
| 785 | Scope 2 `rlticker.js` byte-unchanged | **now ticked** — the named proof passes |
| 970 | Scope 3 Change Boundary | stays unticked — routed to `bubbles.plan` |

The three rewritten items are at lines 527, 540 and 765 and are all now ticked,
so this pass closed four of the nine that were open when it began.

`rlticker.js` byte-unchanged moved because the fact changed, not the standard.
Scope 1's `+25 / -0` append to that file has since landed as commit
`0f63acb50 spec 027: company-scoped owner deep links, and a coherent registry`,
so the working-tree copy matches `HEAD`:

```text
$ git status --porcelain rlticker.js
PORCELAIN_EXIT=0
$ git --no-pager diff --numstat -- rlticker.js
(no output)
$ grep -n 'SUBJECT_PARAM\|SUBJECT_PATTERN' rlticker.js
53:  var SUBJECT_PARAM = "ticker";
54:  var SUBJECT_PATTERN = /^[A-Z0-9.\-]{1,12}$/;
60:    var value = params.get(SUBJECT_PARAM);
64:    if (!SUBJECT_PATTERN.test(normalised)) return { status: "refused", subject: null, raw: null };
145:  root.RLTKR.SUBJECT_PARAM = SUBJECT_PARAM;
146:  root.RLTKR.SUBJECT_PATTERN = SUBJECT_PATTERN;
```

The item's named proof now prints nothing, exactly as it requires, so it is
ticked on the proof it names rather than on a substitute.

The three Change Boundary items are all false for one external reason and one
only: their predicate is whole-tree. Re-read in this session:

```text
$ git status --porcelain
 M briefs/history-current.json
 M briefs/history/recommendations/2026-08.jsonl
 M market-brief.owner-reads.json
 M notes/README.md
 M scripts/brief-narrative-parallel.mjs
 M scripts/build-attention-items.mjs
 M scripts/selftest.mjs
 M specs/027-company-scoped-owner-deep-links/scopes.md
 M specs/_bugs/BUG-009-decision-attention-gate-result-producer-absent/design.md
 M specs/_bugs/BUG-009-decision-attention-gate-result-producer-absent/report.md
 M specs/_bugs/BUG-009-decision-attention-gate-result-producer-absent/scopes.md
 M specs/_bugs/BUG-009-decision-attention-gate-result-producer-absent/spec.md
 M specs/_bugs/BUG-009-decision-attention-gate-result-producer-absent/state.json
 M tests/options-flow-feed-lab.spec.mjs
?? .first-load-fix-worktree/
?? briefs/indexes/669b1d226a4f5fbf37bad55c204222992816e8c6bb5eea3ae3890a096c625ba4/
?? err.txt
?? get_elements.py
?? notes/us-israel-iran-conflict-market-scenarios-2026-08-19.md
?? notes/us-israel-iran-cross-asset-equity-screen-2026-08-19.md
?? out.log
?? out.txt
?? parse_ui.py
?? run_accessibility_map.py
?? specs/_bugs/BUG-009-decision-attention-gate-result-producer-absent/scenario-manifest.json
?? temp_script.scpt
?? tests/zz-probe-focusable.spec.mjs
```

Every feature-027 path in that list is inside `workBoundary.allowedPaths`:
`scripts/selftest.mjs`, `tests/options-flow-feed-lab.spec.mjs` and
`specs/027-company-scoped-owner-deep-links/scopes.md`. Everything else belongs
to other sessions. The narrow halves of the two items that have them were
re-confirmed here: `git status --porcelain company-fundamentals-lab.html
technical-analysis-decision-lab.html trend-dynamics-cycle-lab.html` prints
nothing, and `git status --porcelain specs/025-company-multi-horizon-intelligence-lab`
prints nothing. A whole-tree-clean predicate is unsatisfiable by any scope in a
repository several sessions write to concurrently, so these three are routed to
`bubbles.plan` to be rewritten as scope-scoped predicates rather than ticked.

The two `file://` items are not blocked by tree dirtiness. The structural half
was re-checked in this session and holds:

```text
$ grep -cE '^(import|export)[[:space:]]' rlticker.js options-structure-lab.html gamma-trading-lab.html volatility-sizing-lab.html options-flow-feed-lab.html
rlticker.js:0
options-structure-lab.html:0
gamma-trading-lab.html:0
volatility-sizing-lab.html:0
options-flow-feed-lab.html:0
```

The Scope 1 item additionally requires a *manual* open — a human act this agent
cannot perform, and one the human-owned `uservalidation.md` checklist already
carries. The Scope 2 item additionally requires that BOTH routes *operate* from
`file://`, and `volatility-sizing-lab.html:1192` issues
`fetch("volatility-sizing-universe.json", { cache: "no-store" })`, which a
`file://` origin has no working origin for. **Claim Source for the fetch site:**
executed. This session did NOT re-run a browser `file://` probe — the machine is
contended and runs were deliberately kept targeted — so the earlier recorded
finding that the route falls back to its configuration-unavailable banner is a
prior pass's evidence and is not restated here as this session's own. **Claim
Source for that finding:** not-run in this session. Both items stay unticked and
are routed to `bubbles.plan`.

### Closeout · Commands, exit codes and the resulting tally

```text
$ node scripts/selftest.mjs                     # pre-edit baseline
exit: 0   Research-Lab self-test: 3155 passed, 0 failed
capture sha256 aa9357bb8d9f96eedf260e22d572619690b0ee7b864e5931746303b023b00430

$ node scripts/selftest.mjs                     # four mutations applied
exit: 1   Research-Lab self-test: 3152 passed, 4 failed
capture sha256 5242b3ad4eece15ebfbfb558e6e3df0dbaf5b51c3d199f00acd92f71fc1895ef

$ node scripts/selftest.mjs                     # mutations restored
exit: 0   Research-Lab self-test: 3156 passed, 0 failed
capture sha256 a62ae0a99f8ad136b508d03a8189ebac405dbc0a01cd426cb049437978fa6822

$ npx --no-install playwright test tests/options-flow-feed-lab.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --workers=1 \
    --grep "SCN-027-002" --reporter=list
exit: 0   1 passed (3.9s)
capture sha256 bba9035afe7675b6ed496f89e3e347d58554c27b457dcf8063eac2f2977aefd0
```

DoD tally after this pass: **68 ticked, 5 unticked** across the three scopes,
against 64 ticked and 9 unticked when it began. `uservalidation.md` is
unchanged and still ships **0 ticked / 19 unticked**; its `## Checklist` is
human-owned and was not touched.

---

## Final Five — the rewritten DoD items, verified by execution (`bubbles.implement`)

`bubbles.plan` rewrote the last five DoD items so that each one is both
satisfiable by this feature and still able to fail. This pass executed every
predicate in all five, wrote the assertions that were missing, and ticked only
what it proved. All five now hold, so the tally moves **68 → 73 of 73**.

### The design point the lifetime-tax conjunct exists for

Three of the five items check the lifetime-tax family (`rltax*.js`,
`lifetime-tax-*`, `tax-rules`, `specs/021-*` … `specs/024-*`) by **authorship**
rather than by **cleanliness**. This pass found the reason live in the tree, not
hypothetically: `git --no-pager diff --name-only` over that pathspec names
`rltaxrental.js`, carrying a thirteen-line diff authored by a concurrent session
— a deliberate adversarial probe substituting `"mid-month-probe"` for
`"mid-month"` inside `conventionFraction`. A cleanliness predicate over that
family would have been false for a reason Feature 027 neither caused nor can
remove. The authorship predicate is false only if a Feature 027 token appears
there, which is a claim only this feature can falsify. It returns a count of
`0`.

That same concurrent probe is why `node scripts/selftest.mjs` currently exits
non-zero; see "Selftest state and its attribution" below. It is reported here as
observed, not explained away.

### Item 1 · Scope 1 Change Boundary — TICKED

| Conjunct | Command | Exit | Result |
|---|---|---|---|
| (a) scope-scoped porcelain | `git status --porcelain --` + 21 `allowedPaths` + 12 Excluded families | 0 | six lines, all inside `allowedPaths`, no Excluded family named |
| (b) lifetime-tax authorship | `git --no-pager diff -- <tax pathspec> \| grep -cE '<7 tokens>'` | 1 (no match) | count `0` |

Conjunct (a) output, in full:

```text
 M scripts/selftest.mjs
 M specs/027-company-scoped-owner-deep-links/report.md
 M specs/027-company-scoped-owner-deep-links/scopes.md
 M specs/027-company-scoped-owner-deep-links/state.json
 M tests/options-flow-feed-lab.spec.mjs
 M tests/volatility-sizing-lab.spec.mjs
```

**Falsifiability was proved by mutation, not argued.** `site-exclusions.json`
(an Excluded family) was clean at sha256
`f3c437749395f2549166ded7a55942aa611670bb4d8262bc2e7e57efa79e1260`. One appended
newline made the identical restricted command print ` M site-exclusions.json` —
a path outside `allowedPaths` — so the conjunct went false. `git checkout --`
restored it; the digest re-read as the identical
`f3c437749395f2549166ded7a55942aa611670bb4d8262bc2e7e57efa79e1260`
(`RESTORE_VERIFIED=yes`) and the restricted porcelain printed nothing for it
again. Nothing was left mutated on disk.

### Items 3 and 5 · Scope 2 and Scope 3 Change Boundary — TICKED

Both carry the same conjunct (a) and the same lifetime-tax conjunct (c) as
above, plus their own preserved per-scope conjunct (b):

```text
$ git status --porcelain company-fundamentals-lab.html \
    technical-analysis-decision-lab.html trend-dynamics-cycle-lab.html
exit: 0   (no output — the three design-D1-disqualified routes are byte-unchanged)

$ git status --porcelain specs/025-company-multi-horizon-intelligence-lab
exit: 0   (no output — Feature 025's artifacts are byte-unchanged, per FR-027-034)
```

### Item 2 · Scope 1 `file://` compatibility — TICKED

```text
$ grep -cE '^(import|export)[[:space:]]' rlticker.js options-structure-lab.html gamma-trading-lab.html
exit: 1
rlticker.js:0
options-structure-lab.html:0
gamma-trading-lab.html:0

$ grep -n 'type="module"' rlticker.js options-structure-lab.html gamma-trading-lab.html
exit: 1   (no output)

$ grep -n 'script src="rlticker.js"' options-structure-lab.html gamma-trading-lab.html
exit: 0
options-structure-lab.html:2798:  <script src="rlticker.js" defer></script>
gamma-trading-lab.html:1840:    <script src="rlticker.js" defer></script>

$ node -e 'const p=require("./package.json");console.log("hasScripts="+Object.prototype.hasOwnProperty.call(p,"scripts"));'
exit: 0   hasScripts=false
```

The whole manifest is `name`, `version`, `private`, `engines` and one
`devDependencies` entry (`playwright`) — no bundler, no build step between the
source files and a browser. The human half, physically opening each route from a
disk with no server, is delegated to the human-owned `uservalidation.md`
checklist and was deliberately **not** ticked by this agent.

### Item 4 · Scope 2 `file://` — TICKED, on a real browser run from a real `file://` origin

Conjuncts (b) and (c) cannot be settled by grep, so three **new persistent**
Playwright rows were written for them and run. Prior passes' `file://` findings
were **not** restated as this pass's proof.

New assertions, both files inside `workBoundary.allowedPaths`:

| File | Row |
|---|---|
| `tests/options-flow-feed-lab.spec.mjs` | `FEATURE-027 file:// parity: the options-flow route reaches the same file:// outcome with a ?ticker= subject as with no query string` |
| `tests/options-flow-feed-lab.spec.mjs` | `FEATURE-027 file:// paint: the options-flow route fully reaches its paint from a file:// origin with and without a subject` |
| `tests/volatility-sizing-lab.spec.mjs` | `FEATURE-027 file:// parity: the volatility route reaches the same file:// outcome with a ?ticker= subject as with no query string` |

Each navigates to `file://` + the absolute route path. No static server is in the
picture for these rows.

```text
$ npx --no-install playwright test --config=playwright.config.mjs \
    --project=system-chrome tests/options-flow-feed-lab.spec.mjs \
    tests/volatility-sizing-lab.spec.mjs --grep "FEATURE-027 file://" \
    --workers=1 --reporter=list
exit: 0   3 passed (6.4s)

FILE_PARITY options-flow plain:  {"scriptCompleted":true,"rltkrResolved":true,"noticePresent":true,"feedRendered":true,"tableRendered":true,"noticeText":"","noticeHidden":true,"pageErrors":0,"errorMessages":[]}
FILE_PARITY options-flow linked: {"scriptCompleted":true,"rltkrResolved":true,"noticePresent":true,"feedRendered":true,"tableRendered":true,"noticeText":"Focus: NVDA — 2 flagged strikes · call premium $260K vs put premium $25K · end-of-day proxy over 12 liquid names, not a real-time tape.","noticeHidden":false,"pageErrors":0,"errorMessages":[]}
FILE_PARITY volatility  plain:   {"rltkrResolved":true,"labPresent":false,"configErrorShown":true,"configLoaded":false,"activeAsset":null,"noticePresent":true,"noticeHidden":true,"pageErrors":0,"errorMessages":[]}
FILE_PARITY volatility  linked:  {"rltkrResolved":true,"labPresent":false,"configErrorShown":true,"configLoaded":false,"activeAsset":null,"noticePresent":true,"noticeHidden":true,"pageErrors":0,"errorMessages":[]}
```

Conjunct (b) holds on both routes: every reach field is element-wise identical
with a subject and without one. The volatility route reaches its pre-existing
configuration-unavailable banner in both cases — which is exactly what the
parity formulation measures, since the parameter changes nothing about how far
that route gets from disk. Conjunct (c) holds: options-flow reaches a full paint
from `file://` with `RLTKR` resolved, feed and table rendered, zero page errors,
and the focus band carrying real text when a subject is supplied.

**Falsifiability was proved by mutation, not argued.**
`options-flow-feed-lab.html` was clean at sha256
`88568b5744937f93c133aa52659a633335f043d8b65b5242bd7327c0d79471cc`. Rewriting its
`<script src="rlticker.js" defer>` tag to `type="module"` produced a real red:

```text
exit: 1
  ✘ FEATURE-027 file:// paint: … with and without a subject
    Error: RLTKR must resolve from a file:// origin
    expect(received).toBe(expected)
    Expected: true
    Received: false
```

That is precisely the loss of `file://` operation the conjunct exists to catch.
The tag was restored, the digest re-read as the identical
`88568b5744937f93c133aa52659a633335f043d8b65b5242bd7327c0d79471cc`
(`RESTORE_VERIFIED=yes`), `git status --porcelain options-flow-feed-lab.html`
printed nothing, and all three rows re-ran green. Nothing was left mutated on
disk.

### Targeted regression

Both touched spec files were then run in full. The full 677-test suite was
deliberately **not** re-run.

```text
$ npx --no-install playwright test --config=playwright.config.mjs \
    --project=system-chrome tests/options-flow-feed-lab.spec.mjs \
    tests/volatility-sizing-lab.spec.mjs --workers=1 --reporter=list
exit: 0   37 passed (31.3s)
```

### Selftest state and its attribution

```text
$ node scripts/selftest.mjs
exit: 1   Research-Lab self-test: 3122 passed, 9 failed
capture sha256 8c435b7e0ff5001e82eb0c99d9cdb2342b286a218813a29de29c8d1f8692a082
```

This is reported as observed. It is **not** attributable to this pass, and the
attribution was established by execution rather than asserted:

1. This pass edited exactly two files, `tests/options-flow-feed-lab.spec.mjs`
   and `tests/volatility-sizing-lab.spec.mjs`. `grep -n
   'options-flow-feed-lab.spec\|volatility-sizing-lab.spec' scripts/selftest.mjs`
   exits 1 — the selftest does not read either file.
2. Seven of the nine failures are Feature 023 lifetime-tax rows: `TP-03-03`,
   `TP-04-02`, `TP-04-11`, `TP-04-12`, `TP-05-14`, plus the Scope 03 rental and
   Scope 04 dwelling-use groups throwing on `undefined`.
3. The remaining two are the `SCN-027-CANARY` rows, which assert "every
   pre-existing selftest assertion stays green" and therefore report red
   whenever anything upstream is red. They are consequences, not causes.
4. The cause is visible in the tree: `rltaxrental.js` carries the concurrent
   session's live `"mid-month"` → `"mid-month-probe"` probe in
   `conventionFraction`, which makes that function return `null` for the
   mid-month convention and cascades into exactly those seven rows.

The probe belongs to another session that is actively running lifetime-tax work.
It was **not** reverted, **not** touched, and **not** disturbed.

#### The attribution was then confirmed by a natural experiment

While this pass was still running, the concurrent session finished and reverted
its own probe. The lifetime-tax pathspec went from naming `rltaxrental.js` to
printing nothing, and the selftest was re-run unchanged:

```text
$ git status --porcelain -- 'rltax*.js' 'lifetime-tax-*' 'tax-rules' 'specs/021-*' 'specs/022-*' 'specs/023-*' 'specs/024-*'
exit: 0   (no output — the probe is gone)

$ node scripts/selftest.mjs
exit: 0   Research-Lab self-test: 3156 passed, 0 failed
```

Nothing in this feature changed between the two selftest runs. The 9 failures
appeared with the concurrent probe present and vanished with it removed, which
confirms the attribution by observation rather than by argument. Both runs are
recorded here — the failing one is not suppressed now that a greener one exists.

One consequence is recorded honestly rather than quietly dropped: the
lifetime-tax authorship conjunct was **demonstrably non-vacuous** when it was
executed, because the family was dirty at that moment and still carried zero
Feature 027 tokens. At the close of this pass the family is clean, so the same
conjunct now holds over an empty diff. It was true in both states.

### Final commands, exit codes and tally

```text
$ node scripts/selftest.mjs                      # concurrent probe present
exit: 1   3122 passed, 9 failed
capture sha256 8c435b7e0ff5001e82eb0c99d9cdb2342b286a218813a29de29c8d1f8692a082

$ node scripts/selftest.mjs                      # concurrent probe reverted by its owner
exit: 0   3156 passed, 0 failed

$ npx … --grep "FEATURE-027 file://" --workers=1
exit: 0   3 passed

$ npx … tests/options-flow-feed-lab.spec.mjs tests/volatility-sizing-lab.spec.mjs --workers=1
exit: 0   37 passed

$ bash .github/bubbles/scripts/artifact-lint.sh specs/027-company-scoped-owner-deep-links
exit: 0   Artifact lint PASSED.

$ bash .github/bubbles/scripts/state-transition-guard.sh specs/027-company-scoped-owner-deep-links
exit: 1   verdict FAIL against targetStatus done — EXPECTED, and not a defect of this pass
          failedGateIds: [G056,G060,G022,G040,G068,G089,G094,G136]
          G022 names the twelve specialist phases that have not run; G136 is
          human acceptance, which this agent must not claim; the single G040 hit
          is bubbles.plan-authored routing prose on scopes.md line 786, and the
          five paragraphs this pass added contribute zero deferral hits.
```

DoD tally after this pass: **73 ticked, 0 unticked** across the three scopes,
against 68 ticked and 5 unticked when it began. `uservalidation.md` is unchanged
and still ships **0 ticked / 19 unticked**; its `## Checklist` is human-owned and
was not touched. Top-level `status` remains `in_progress`, `certifiedAt` remains
`null`, and no `certification.*` field was written — the twelve specialist phases
have not run.

