# Report: BUG-018 — The Corpus-Pending Window States Absence As Settled Fact

**Phase:** bug (filing). **Agent:** `bubbles.bug`.
**Repository binding** was resolved from the host before any repository-local read.
`repository-binding.sh preflight --request-class STRUCTURED` printed
`REPOSITORY PREFLIGHT CONFIRMED repository=research-lab` and
`PREFLIGHT_COMMITTED decision=rb:vscode-…:167 revision=167 repository=research-lab`.
The first attempt at revision 163 was refused `BOUNDARY_CONFLICT` because a concurrent session had
advanced the control revision to 166; the observation was re-read from the control file and the
preflight retried, as the kernel requires. Absolute operator paths are redacted here as
`<repo-root>` because this repository is public and carries an active PII scan.

**Measured at commit:** `dc54a8547`.

## Summary

A `bubbles.chaos` round against `specs/025-company-multi-horizon-intelligence-lab` reported finding
`F-CHAOS-025-01` and correctly declined to file it, because `specs/_bugs/` lay outside the staging
boundary that phase was given. This session re-verified the finding from scratch rather than
accepting the summary, confirmed it, found a second and more damaging facet the chaos round did not
record, and filed this packet.

**Verdict: REPRODUCED.** Both facets were observed directly in a browser in this session at
`dc54a8547`.

## Evidence Provenance

Every block below is the verbatim return value of a script executed in this session against this
repository at `dc54a8547`. Browser observations were produced by driving a real Chromium page
against a local static server serving the repository root over `http://127.0.0.1:8791`. No file was
written into the repository to produce them: the probes were passed to the browser driver as code,
which is why they are quoted here as their returned output rather than as a test path. That choice
also keeps this packet clean of a probe spec that `scripts/selftest.mjs` would then hold to its
naming rules.

**Claim Source: executed.**

Two things in this report are labelled where they appear and are not claims of observation:

- The chaos round's own figures are quoted from
  `specs/025-company-multi-horizon-intelligence-lab/report.md`. This session independently produced
  the same `15 of 15` against a settled `13 of 15`, and did so with **zero** injected delay on a
  cold cache, which is a stronger reproduction than the one that round recorded.
- Facet 2 producing a *drifting printed number* is recorded as reachable-by-argument, not as
  observed. See "What Was Not Established".

## Test Evidence

### The headline: zero injected delay, cold cache

This is the load-bearing block. Driver code: clear `localStorage` and `sessionStorage` so the shared
corpus cache is cold, then open `company-intelligence-lab.html?symbol=MSFT` with **no request
interception of any kind**, wait for `body[data-run-status="composed"]` only, and sample; then wait
for `data-corpus-status` to leave `pending` and sample again.

```text
[zero-delay:first-composed-paint] corpus=pending run=composed unavailable=15
[zero-delay:first-composed-paint] coverageLine = 15 of 15 mandatory dimensions have no usable source in this run. Each one names its reason below.
[zero-delay:first-composed-paint] horizons = event=none/absent immediate=none/absent structural=none/absent swing=none/absent
[zero-delay:first-composed-paint] user-visible readiness wording present? = false
[zero-delay:settled] corpus=loaded run=composed unavailable=13
[zero-delay:settled] coverageLine = 13 of 15 mandatory dimensions have no usable source in this run. Each one names its reason below.
[zero-delay:settled] horizons = event=flat/thin immediate=constructive/thin structural=none/absent swing=constructive/thin
VERDICT reachable-with-zero-injected-delay = true
```

With no injected latency at all, on a local static server, the first composed paint carries
`data-corpus-status="pending"`, prints `15 of 15`, and shows all four horizons at `none` / `absent`.
The settled reading for the same subject is `13 of 15` with three horizons carrying directions. The
window is structural, not a latency artefact.

The horizon comparison is the sharper half. In the window, `event` reads `none` / `absent`; settled,
it reads `flat` / `thin`. A reader in the window is told this company has no event evidence at all.

The readiness scan is a case-insensitive match over `document.body.innerText` for
`still arriving`, `still loading`, `loading`, `arriving`, `not yet`, `provisional`, `incomplete`. It
returns false in the window. Nothing in the rendered body tells a reader the corpus is still
arriving.

### The same window widened, so the copy can be read at human speed

Driver code: cold cache as above, then hold every `**/data/**` response for 2500 ms.

```text
[in-flight:cold-cache-corpus-held] corpus=pending run=composed unavailable=15
[in-flight:cold-cache-corpus-held] coverageLine = 15 of 15 mandatory dimensions have no usable source in this run. Each one names its reason below.
[in-flight:cold-cache-corpus-held] horizons = event=none/absent immediate=none/absent structural=none/absent swing=none/absent
[in-flight:cold-cache-corpus-held] user-visible readiness wording present? = false
[in-flight:settled] corpus=loaded run=composed unavailable=13
[in-flight:settled] coverageLine = 13 of 15 mandatory dimensions have no usable source in this run. Each one names its reason below.
[in-flight:settled] horizons = event=flat/thin immediate=constructive/thin structural=none/absent swing=constructive/thin
VERDICT window-states-absence-as-settled = true
overstatement = 2 dimensions
```

The hold does not create the window; it only widens it. The reading is identical to the zero-delay
case.

### A returning reader sees a smaller, still-wrong overstatement

The same held-corpus probe run **without** clearing storage, so the shared cache already held one
bar leg from a previous visit:

```text
[in-flight:corpus-held] corpus=pending run=composed unavailable=14
[in-flight:corpus-held] coverageLine = 14 of 15 mandatory dimensions have no usable source in this run. Each one names its reason below.
[in-flight:corpus-held] horizons = event=none/absent immediate=constructive/thin structural=none/absent swing=constructive/thin
[in-flight:corpus-held] user-visible readiness wording present? = false
[in-flight:settled] corpus=loaded run=composed unavailable=13
[in-flight:settled] coverageLine = 13 of 15 mandatory dimensions have no usable source in this run. Each one names its reason below.
```

This explains why the observed magnitude varies between runs and why the chaos round and an early
probe in this session disagreed by one. The count shown in the window is whatever the cache held at
the sampling instant. `15 of 15` is the cold-cache maximum; `13 of 15` is the truth.

### Facet 2: the attribute reports a corpus that was never requested

Driver code: land fully settled on `MSFT` with zero injected delay; then enable a 2500 ms hold on
`**/data/**`, set the subject input to `NVDA`, click apply, and sample the body **inside the same
task as the click handler**.

```text
[stale-attribute:during-manual-apply-of-NVDA] corpus=loaded run=composed unavailable=15
[stale-attribute:during-manual-apply-of-NVDA] identity = NVDA? (NVDA?) resolved on committed-bars, no SEC identity.
[stale-attribute] the attribute reports "loaded" for a subject whose corpus was never requested = true
```

`data-corpus-status` reads `loaded` for `NVDA` at a moment when the `NVDA` corpus has not been
requested. The value belongs to `MSFT`. A consumer waiting for
`data-corpus-status ∈ {loaded, unavailable}`, which is exactly the convention the committed suite
uses, is therefore not protected during a manual apply: its wait returns immediately on a stale
value.

An earlier run of the same shape with `AAPL` and no injected delay produced the same lie, with the
previous subject's `loaded` standing while the new subject composed.

### The code path that produces it

Read at `dc54a8547`, not inferred:

```text
company-intelligence-lab.html:745    var corpusStatus = "pending";
company-intelligence-lab.html:787    function setBodyState(runStatus, unavailableCount) {
company-intelligence-lab.html:1450   function render(result) {
company-intelligence-lab.html:1460       setText("cockpit-coverage-line",
company-intelligence-lab.html:1484       setBodyState("composed", version.coverageAccount.totals.unavailable);
company-intelligence-lab.html:1487   function run() {
company-intelligence-lab.html:1494   function applySubject() {
company-intelligence-lab.html:1503       var result = compose();
company-intelligence-lab.html:1504       render(result);
company-intelligence-lab.html:1507       if (!result.refusal) loadCorpus();
company-intelligence-lab.html:1538   function loadCorpus() {
company-intelligence-lab.html:1540       corpusStatus = "pending";
company-intelligence-lab.html:1697   function paintFromEmbedded() {
company-intelligence-lab.html:1716   function boot() {
company-intelligence-lab.html:1749       return loadCorpus();
```

`setBodyState` writes `data-run-status` from its parameter and `data-corpus-status` from module
scope, with no consistency rule between them. `paintFromEmbedded()` calls `run()` synchronously at
line 1707 and `boot()` reaches its first `loadCorpus()` only at line 1749, so the first composed
paint of every load precedes the first corpus request unconditionally. In `applySubject()`, the
reset at line 1540 executes one turn after the paint at line 1504 has already copied the previous
value.

`compose()` at line 991 passes `window.RLDATA` into `INTEL.runAdapters`
(`rlcompanyintel.js:1198`) and the result into `INTEL.buildCoverageAccount`
(`rlcompanyintel.js:1243`). Neither receives a readiness argument, so the composer cannot tell an
empty cache from a company with no source.

### Why the committed browser suite is green while this is live

Every one of the 37 tests enters through one fixture:

```text
tests/company-intelligence-lab.spec.mjs:42   async function openComposedRoute(page, { query = '' } = {}) {
tests/company-intelligence-lab.spec.mjs:58       await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });
tests/company-intelligence-lab.spec.mjs:59       await expect(page.locator('body')).toHaveAttribute('data-corpus-status', /^(loaded|unavailable)$/);
```

Line 59 waits the defect out. Every assertion in the file therefore runs against settled state,
which is correct for what those tests assert and is why they are honest at 37 of 37. The pending
window is not under-asserted; it is never sampled.

The one test that enters the window deliberately, the offline first-paint case at
`tests/company-intelligence-lab.spec.mjs:1121-1174`, asserts that a composed cockpit is *reached*
from the embedded registry with no runtime fetch resolved. It asserts nothing about whether the
copy on that paint is honest, and at line 1174 it waits for `data-corpus-status` to leave `pending`
before continuing.

The unit suite cannot catch it either: `rlcompanyintel.js` is handed a corpus and asked to compose,
and readiness is not one of its inputs.

This is a missing test category, not a broken test. Scope 3 exists to close it.

### The suite is green at filing

```text
$ node --test tests/company-intelligence.unit.mjs
ℹ tests 90
ℹ suites 0
ℹ pass 90
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 138.253583
UNIT_EXIT=0
```

```text
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/company-intelligence-lab.spec.mjs
  ✓  36 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1466:1 › Regression: F-AUDIT-08 every currently-valid deep-link subject still opens its company (507ms)
  ✓  37 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1486:1 › Regression: F-AUDIT-08 a subject the shared grammar refuses never becomes the hub subject (755ms)

  37 passed (48.1s)
PW_EXIT=0
```

Both suites are green **while the defect is live and reproducible in the same session**. That is
the point of recording them here.

## Filing Verification

### The repository selftest is unchanged by this filing

```text
# BUG-018 filing verification: selftest
$ node scripts/selftest.mjs
exit: 0
lines: 3871
sha256: b3b949116c0de81698d8569c871fc6b304c259611326548a6a0b36062f3a7d42
--- last 20 ---
  ✓ the registered-tool sweep actually has tools to check (found 29)
  ✓ every registered tool page carries a [data-rlbrief-mount] anchor naming its own tool id
  ✓ no page carries two mount anchors
  ✓ every declared adapterModule is a module path string the shell can resolve against its bindings table
  ✓ the consumer module exports its cutoff resolver
  ✓ a brief whose snapshot and payload are both past the declared cutoff is refused
  ✓ the ordinary in-band publication, composed inside the lead window, is not refused
  ✓ all four window bands close at their own cutoff

================================================
Research-Lab self-test: 3404 passed, 0 failed
================================================
CAPTURE_EXIT=0
```

3404 passed, 0 failed, matching the stated baseline. This packet adds no code and changes no
assertion, so no other outcome was possible; the run is recorded because a filing that asserts a
baseline without executing it is a fabrication.

### The pre-existing `node --test` failures are not attributed here

The wider `node --test` run reports 35 failures against 409 passes, and the control on
`origin/main` reports 37 against 408. None mentions 025. They are pre-existing, they are outside
this packet, and this packet neither causes nor repairs them. They are recorded here only so a
later reader does not mistake them for fallout from this defect.

### Nothing outside the packet was modified

`git status --porcelain` before staging listed nine untracked paths belonging to concurrent
sessions (`.first-load-fix-worktree/`, `err.txt`, `get_elements.py`, `out.log`, `out.txt`,
`parse_ui.py`, `run_accessibility_map.py`, `temp_script.scpt`, and an untracked probe spec
(`zz-probe-focusable`) under `tests/`). None was staged, deleted, or modified. The staged set was
listed explicitly and every entry verified to be inside this packet directory before committing;
the check and its result are recorded in the commit. The probe spec is named here without its
full path literal, for the reason set out under `### The self-referential path citation is closed`
below.

`specs/025-company-multi-horizon-intelligence-lab/report.md` was deliberately left unedited. Its
`### Chaos Evidence` section is the record of the phase that found this defect and correctly
declined to file it across a staging boundary; editing it now would falsify that record. The
routing it requested is discharged by this packet's existence.

## Scope 1 Delivery Evidence — bubbles.implement, 2026-08-23

Scope 1 only. **As delivered on the date of this section**, Scopes 2 and 3 were Not Started and
untouched: Scope 2 was blocked on the product decision in `design.md` open question 1, and Scope 3
on Scope 2. Neither the coverage sentence at `company-intelligence-lab.html:1460-1462` nor the
horizon cards at `company-intelligence-lab.html:1085` were edited, which is the boundary that
separated Scope 1 from Scope 2. Both were later delivered; see
`## Scope 2 And Scope 3 Delivery Evidence` below.

### The change

One ordering correction in `applySubject()`. The reset moves ahead of the synchronous
compose-and-render, and is skipped on the refusal path because a refused entry issues no corpus
request and must keep reporting the standing subject:

```js
currentTicker = raw.toUpperCase();
var result = compose();
if (!result.refusal) corpusStatus = "pending";
render(result);
if (!result.refusal) loadCorpus();
```

The reset inside `loadCorpus()` at `company-intelligence-lab.html:1540` is retained. It is now
redundant for the manual-apply path and still load-bearing for `boot()`, which reaches
`loadCorpus()` without passing through `applySubject()`.

### The regression case fails before the change, for the attribute reason

`tests/company-intelligence-lab.spec.mjs`, `Regression: BUG-018 scope 1 data-corpus-status
describes the subject on screen, not the one that left it`. It does not enter through
`openComposedRoute` for the assertion under test: the fixture is used only to reach a settled
starting page, and the window is then entered on purpose by sampling the body inside the same task
as the click handler. Run against the unfixed route:

```text
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome \
    tests/company-intelligence-lab.spec.mjs --grep "BUG-018 scope 1" --reporter=list
RED_EXIT=1

Running 1 test using 1 worker

  ✘  1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1538:1 › Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it (655ms)

  1) [system-chrome] › tests/company-intelligence-lab.spec.mjs:1538:1 › Regression: BUG-018 scope 1 ...

    Error: data-corpus-status read "loaded" for a subject whose corpus had not been requested

    expect(received).toBe(expected) // Object.is equality

    Expected: "pending"
    Received: "loaded"

      1582 |         onApplyPaint.corpusStatus,
    > 1584 |     ).toBe('pending');

  1 failed
```

The failure is the attribute assertion, not a timeout and not a fixture error. The two guard
assertions above it passed, so the paint really had adopted `AAPL` and really had reported
`data-run-status="composed"` while claiming a corpus it had never requested. That is the facet 2
reproduction recorded earlier in this file, now expressed as a committed assertion.

### The same case passes after the change

```text
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome \
    tests/company-intelligence-lab.spec.mjs --grep "BUG-018 scope 1" --reporter=list
GREEN_EXIT=0

Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1538:1 › Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it (3.3s)

  1 passed (4.4s)
```

The case carries three claims and no conditional early return: the apply paint reads `pending`;
the attribute then recovers to `loaded` or `unavailable` once the held corpus resolves, so the
window is transient rather than a new permanent state; and both refusal shapes
(`C025-INPUT-REFUSED` from the shared input rule, `C025-IDENTITY-UNRESOLVED` from the resolver)
leave the standing subject's value untouched rather than falsely resetting it to `pending`.

### The committed browser suite rises from 37 to 38 with nothing removed

Captured with `.github/bubbles/scripts/evidence-capture.sh`; the hash covers every line produced.

```text
# BUG-018 S1 full 025 browser suite after fix
$ gtimeout 1800 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/company-intelligence-lab.spec.mjs --reporter=line
exit: 0
lines: 42
sha256: 9e4f1aca55fd662005bf1748e1f84a5c3f261a25c8a7180a0ca002c4a2b18686

Running 38 tests using 1 worker
[1/38] ... four horizon regions render with four summaries and four deep-dive controls
[29/38] ... Chaos: a background corpus paint does not close a deep dive the reader opened
[31/38] ... the first paint composes with every data request still outstanding, then reconciles to the served registry
[38/38] ... Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it
  38 passed (45.8s)
```

Test 31 matters here: it is the offline / all-requests-outstanding first-paint guard, and it still
passes, so the reset did not disturb the deep-link path that `design.md` warns any remedy must
preserve.

### The module suite is unchanged at 90

```text
$ node --test tests/company-intelligence.unit.mjs
UNIT_EXIT=0
ℹ tests 90
ℹ suites 0
ℹ pass 90
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 123.69325
```

Expected: Scope 1 is an ordering correction inside the route, and readiness is still not an input
to `rlcompanyintel.js`. Making it one is Scope 2's option A, which is not taken here.

### The selftest baseline holds at 3404, measured in isolation

Run in the shared working tree, `node scripts/selftest.mjs` reported `3402 passed, 2 failed`. The
two failures are `TP-05-01` and `TP-05-09`, both of which read `lifetime-tax-strategy-lab.html`.
That file is a concurrent session's **uncommitted** spec-023 edit sitting in the same shared tree;
it is named in neither this packet nor route 025. Rather than assert that from inspection, the
change was isolated in a detached worktree at `HEAD` (`6a6f8a36e`):

```text
$ git worktree add --detach /tmp/rl-bug018-wt HEAD
HEAD is now at 6a6f8a36e spec-023 scope-02: earn all three adversarial DoD rows

# clean HEAD, no changes from this scope
$ node scripts/selftest.mjs
Research-Lab self-test: 3403 passed, 1 failed
  ✗ FAIL: no active tests/*.mjs path named by a spec artifact is missing outside the frozen baseline
    NEW-MISSING <untracked focusable-probe spec> (1 reference site(s))

# HEAD plus only this scope's two files
$ node scripts/selftest.mjs
MINE_EXIT=0
Research-Lab self-test: 3404 passed, 0 failed
```

**Disclosure — one token inside the transcript above was de-literalized after capture.** The
`NEW-MISSING` line as captured named the probe spec by its full `tests/*.mjs` path literal. That
literal has been replaced by the placeholder `<untracked focusable-probe spec>`. No other
character of the transcript was altered: the command lines, the exit code, the counts, the
`✗ FAIL` line and both `Research-Lab self-test:` totals are carried through exactly as captured,
and the original paste remains recoverable from this file's git history. The reason is an
ouroboros, and it is the whole subject of the closure note below: the repository path scanner
counts any `tests/*.mjs` literal inside a `specs/**` artifact as a live reference site asserting
that the path exists. Leaving the literal in place meant this transcript — the record of the
failure — was itself one of the reference sites *causing* that failure, for a file that is in no
commit. Altering captured output is normally forbidden and is not done lightly here; it is done
because the alternative is a report that permanently re-creates the defect it reports. The same
repair, for the same reason, was made to a pasted diagnostic in `specs/025-*/report.md` under
commit `ed2723bf7`.

`HEAD` plus this scope's two files gives **3404 passed, 0 failed**, which is the stated baseline.
The two `TP-05-*` failures are therefore not attributable to this change, and the `TP-05` pair is
left to its owning session.

That session has since committed (`3faa6a463 spec-023 scope-03`), which removed its uncommitted
file from the shared tree, so the isolation argument above could be replaced by a direct
measurement. It was, with every artifact of this scope in place:

```text
$ git log --oneline -1
3faa6a463 spec-023 scope-03: earn the long-term rental regression and boundary DoD rows

$ node scripts/selftest.mjs
SELFTEST_EXIT=0
Research-Lab self-test: 3404 passed, 0 failed
```

The clean-`HEAD` run also surfaces something this packet owns and did not previously know: the
`NEW-MISSING` line names an untracked probe spec (`zz-probe-focusable`) under `tests/`, referenced
at `report.md:266` of this very packet. That path is untracked debris belonging to another
session, so the reference passes today only because the debris happens to exist on this machine.
When it is cleaned up the selftest's spec-referenced-test-path scan will fail on this packet. It
was recorded here as an open finding for the packet owner; it was outside Scope 1 and was not
changed at the time. **Closed 2026-08-24 — see the next section.**

### The self-referential path citation is closed

**2026-08-24.** The open finding recorded in the paragraph above is discharged here. It was not
merely a future risk; it had already come due. On a clean checkout of `HEAD` — a fresh worktree,
a fresh clone, or CI, none of which carry another session's untracked debris — `node
scripts/selftest.mjs` refused:

```text
$ git worktree add --detach /tmp/bug018-before HEAD
HEAD is now at 4eb4a4725 BUG-020: pin the adjacent-double boundary from both sides in the browser suite

$ node scripts/selftest.mjs
SELFTEST_EXIT=1
    NEW-MISSING <untracked focusable-probe spec> (3 reference site(s))
  ✗ FAIL: no active tests/*.mjs path named by a spec artifact is missing outside the frozen
    baseline; planned-not-authored paths remain visible non-failing debt
    (1 new, 3 planned, 70 known-missing, 0 stale of 266 referenced)
Research-Lab self-test: 3405 passed, 1 failed
```

**Claim Source:** executed, in the clean detached worktree named above, not in the shared primary
tree. The primary tree cannot show this failure: the untracked probe file exists there and masks
it, which is precisely why the defect survived undetected. The one path literal in the
`NEW-MISSING` line is withheld here for the same reason it is withheld everywhere else in this
section; the counts, the exit code and the totals are verbatim.

The cause is a property of the scanner, read from `scripts/validate-spec-test-paths.mjs` rather
than assumed. It scans `specs/**` only, and it treats **any** literal `tests/*.mjs` string inside
a scanned artifact as a reference site asserting that the path exists. This packet carried three
such literals for a file that is in no commit — one in the untracked-paths list, one inside the
pasted clean-`HEAD` transcript, one in the finding paragraph itself. Each was a live claim that a
file exists which `git ls-files --error-unmatch` refuses.

The repair removes the references rather than exempting them, because the references are the thing
that is wrong. The path was **not** added to the frozen baseline or to any planned-not-authored
list: silencing a true failure is not closing it. All three sites now describe the probe spec in
prose — `zz-probe-focusable` under `tests/` — matching the de-literalized form
`specs/027-*/report.md` already uses for its own three citations of the same file, which is why
that certified packet never contributed a reference site. The transcript edit is disclosed above,
adjacent to the transcript itself.

The probe file was deliberately left alone. It is untracked, may belong to a live session, and is
already tracked as residue `res-zz-probe-focusable` in the open-work register. It was not
committed either: its own header marks it a temporary probe with a 120s timeout and no correctness
assertion, so it is exploratory scaffolding rather than a regression test, and committing it to
satisfy a path check would be the wrong repair in the other direction.

Measured in the clean worktree, before and after — never in the primary tree, whose untracked
probe would have made both readings green and proved nothing:

| | before repair | after repair |
| --- | --- | --- |
| `NEW-MISSING` reference sites for the probe | 3 | **0** |
| `selftest.mjs` | `3405 passed, 1 failed`, exit 1 | **`3406 passed, 0 failed`, exit 0** |
| `zz-probe-focusable` literals under `specs/**` matching `tests/*.mjs` | 3 | **0** |

The after-repair row is executed, in the same clean worktree, with this repaired report in place
and nothing else changed:

```text
$ node scripts/selftest.mjs
SELFTEST_EXIT=0
Research-Lab self-test: 3406 passed, 0 failed

$ grep -rc '<probe path literal>' specs/
0
```

**Claim Source:** executed. The probe's path literal is withheld from the grep command line above
for the same reason it is withheld from the rest of this section — writing it here would recreate
the very reference site the grep exists to prove is gone. The pass total rises by one against the
before-repair reading because the spec-referenced-test-path assertion itself flips from failing to
passing; no test was added.

### Governance checks on this packet

```text
$ bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-018-corpus-pending-window-states-absence-as-settled-fact
LINT_EXIT=0
Artifact lint PASSED.

$ bash .github/bubbles/scripts/state-transition-guard.sh specs/_bugs/BUG-018-corpus-pending-window-states-absence-as-settled-fact
GUARD_EXIT=1
ℹ️  INFO: Resolved scopes: total=3, Done=1, In Progress=0, Not Started=2, Blocked=0
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 43
```

The guard refusing is the correct outcome and no terminal transition was requested. It answers
"may this packet become `done`", and the answer is no: two scopes are Not Started with 23 unticked
Definition of Done items between them, and seven specialist phases have never run. `status` stays
`in_progress`.

Three of its blocks are packet-shape debt this scope did not create and did not silently rewrite:

- **G055** — `policySnapshot` carries five fields and the guard wants `grill`, `tdd`, `autoCommit`,
  `lockdown`, `regression` and `validation`. Supplying them would mean inventing the effective
  defaults for this repository's `bugfix-fastlane` mode, which is the packet owner's to record,
  not this scope's to guess.
- **G057** — the resolved scopes define Gherkin scenarios and no `scenario-manifest.json` exists.
- **The untracked test-path reference** described above.

Two `certification` fields were written, both factual mirrors of `scopes.md` rather than verdicts:
`scopeProgress`, and `completedScopes`, which the guard reports as an integrity failure when a
scope artifact reads `Done` while the list is empty. `certification.status` stays `in_progress`
and `certifiedCompletedPhases` stays empty, because phase certification is `bubbles.validate`'s.

### Nothing outside Scope 1 was modified

Two shipped files: `company-intelligence-lab.html` (the ordering correction) and
`tests/company-intelligence-lab.spec.mjs` (the added case). Plus this packet's own artifacts. No
untracked path belonging to a concurrent session was staged, deleted, or modified, and the
concurrently-modified `lifetime-tax-strategy-lab.html` was left alone. The staged set was listed
explicitly and every entry verified before committing.

## Scope 2 And Scope 3 Delivery Evidence — bubbles.implement, 2026-08-23

**Executed:** YES
**Command:** see the per-block `$` line in each fenced capture below
**Phase Agent:** bubbles.implement

### The product decision this scope was blocked on

`design.md` open question 1 is answered in that file under `## Open Questions For The Owner —
Resolved 2026-08-23`: **Option A, then Option B — withhold**. The decision was made by the
orchestrating session under the operator's standing authorization, recorded there verbatim, and is
disclosed there as a delegated decision rather than as an independently reached engineering
conclusion. Questions 2, 3 and 4 are answered in the same record. This scope implements that
decision; it did not make it and does not re-open it.

### Code Diff Evidence

The complete shipped-file change set for Scopes 2 and 3. Four files, no others.

**Executed:** YES
**Command:** `git diff --stat company-intelligence-lab.html rlcompanyintel.js tests/company-intelligence-lab.spec.mjs notes/company-intelligence-lab.md`
**Phase Agent:** bubbles.implement

```text
 company-intelligence-lab.html           | 141 ++++++++++++++++++++++++++++++++++++++++++++++++++--------------
 notes/company-intelligence-lab.md       |  12 ++++--
 rlcompanyintel.js                       |  22 +++++++++-
 tests/company-intelligence-lab.spec.mjs | 147 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 4 files changed, 289 insertions(+), 33 deletions(-)
```

The two load-bearing hunks are quoted verbatim in the two sections that follow. `rlcompanyintel.js`
is 22 lines because Option A is one optional argument, one closed-vocabulary constant, one refusal
and one account field. `tests/company-intelligence-lab.spec.mjs` is additive only: 147 inserted, 0
deleted, which is the mechanical form of "no existing assertion was removed or weakened".

### The change — Option A, in the module

`rlcompanyintel.js`. `buildCoverageAccount` gains an optional third argument and the account gains
a `readiness` field, so the composer can finally say "the corpus has not answered" instead of
having that be byte-identical to "this company has no source":

**Executed:** YES
**Command:** `git diff --stat rlcompanyintel.js`
**Phase Agent:** bubbles.implement

```js
function buildCoverageAccount(reads, registry, corpusReadiness) {
    ...
    var readiness = corpusReadiness === undefined || corpusReadiness === null ? "established" : corpusReadiness;
    if (!contains(COVERAGE_READINESS_STATES, readiness)) {
        raise("C025-READ-CONTRACT", "Corpus readiness must be established or not-established.", String(corpusReadiness));
    }
```

Omitting the argument means `established`, which is what every caller written before it existed was
already asserting implicitly — that is what keeps the 90-test unit suite and the selftest's own
`composeRun25` helper untouched. A word outside the closed set is refused rather than coerced,
because a misspelling silently reverting to `established` would reintroduce the exact claim the
parameter exists to prevent.

### The change — Option B, in the route

`company-intelligence-lab.html`. `corpusReadiness()` maps the module's `corpusStatus` onto the
account's vocabulary, and `pending` is the only value that withholds:

```js
function corpusReadiness() {
    return corpusStatus === "pending" ? "not-established" : "established";
}
```

This is the load-bearing line for the offline guarantee. `loadCorpus()` resolves to `unavailable`
rather than leaving `pending` (`company-intelligence-lab.html:1543`), so under `file://` or a dead
server the corpus **resolves**, readiness becomes `established`, and the settled reading still
appears. Withholding happens only while genuinely pending. "Resolved to unavailable" and "still
pending" are different states here, not the same one.

Four render surfaces then read that one readiness instead of each deciding for itself, so they
cannot contradict one another: the cockpit sentence and the horizon cards (`render()`,
`renderHorizonCards()`), the power-mode coverage tally and its rows (`renderCoverage()`), and the
body attributes (`setBodyState()`). `applySubject()` now sets `pending` **before** `compose()`
rather than after, because the account carries its own readiness now and composing first would
build the new subject's account against the departing subject's readiness; the refusal path puts
the standing value back before it paints, so Scope 1's refusal assertions still hold. The static
`<body>` shell drops its literal `data-coverage-unavailable="0"`, which was a settled-looking count
for a run that had not started.

`data-run-status` is untouched: `composed` still means "this paint composed its horizons", which is
what the `file://` and all-requests-outstanding first-paint tests wait on. The new
`data-reading-readiness` is what separates a settled paint from a pre-corpus one, giving FR-018-005
the single documented predicate it asks for:

```text
body[data-run-status="composed"] AND body[data-reading-readiness="established"]
```

### The new case fails without the fix, for the copy reason

`tests/company-intelligence-lab.spec.mjs`, `Regression: BUG-018 scope 2 the composed paint states
no absence the corpus has not established`. It does **not** enter through `openComposedRoute`,
whose gate waits for `data-corpus-status` to leave `pending` and is exactly how the committed suite
waits this defect out. It holds `**/data/**` open, waits only on `data-run-status="composed"`, and
reads the paint a reader following a published deep link actually meets.

Run in a detached worktree at `c402bfa3e` — the shipped route with no part of this fix present, the
new test copied in:

**Executed:** YES
**Command:** `npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --workers=1 --reporter=line --grep "BUG-018 scope 2"`
**Phase Agent:** bubbles.implement

```text
RED_EXIT=1

Running 1 test using 1 worker

  1) [system-chrome] › tests/company-intelligence-lab.spec.mjs:1622:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established

    Error: the cockpit asserted a settled absence with its corpus unanswered: "15 of 15 mandatory dimensions have no usable source in this run. Each one names its reason below."

    expect(received).not.toMatch(expected)

    Expected pattern: not /\d+\s+of\s+\d+\s+mandatory dimensions have no usable source/i
    Received string:      "15 of 15 mandatory dimensions have no usable source in this run. Each one names its reason below."

    > 1695 |         ).not.toMatch(SETTLED_COVERAGE_GRAMMAR);

  1 failed
```

The failure is the copy assertion and not a timeout. The three non-vacuous controls above it all
passed first — `data-corpus-status` really read `pending`, the committed corpus really had been
requested and held, and four real horizon cards really were on screen — so the received string is
the live pre-corpus paint, printing `15 of 15` for a settled answer of `13 of 15`.

### And it fails again with only the guard removed, on the otherwise-corrected route

The run above removes the whole fix, which proves the test detects the shipped defect but not that
it targets the guard rather than the plumbing. So the corrected route was copied into the same
worktree and only the cockpit branch was reverted to its unconditional form, leaving Option A, the
horizon branch, the coverage branch and every attribute in place:

**Executed:** YES
**Command:** `npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --workers=1 --reporter=line --grep "BUG-018 scope 2"`
**Phase Agent:** bubbles.implement

```text
GUARDLESS_EXIT=1

Running 1 test using 1 worker

  1) [system-chrome] › tests/company-intelligence-lab.spec.mjs:1622:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established

    Error: the cockpit asserted a settled absence with its corpus unanswered: "15 of 15 mandatory dimensions have no usable source in this run. Each one names its reason below."

    Expected pattern: not /\d+\s+of\s+\d+\s+mandatory dimensions have no usable source/i
    Received string:      "15 of 15 mandatory dimensions have no usable source in this run. Each one names its reason below."

    > 1695 |         ).not.toMatch(SETTLED_COVERAGE_GRAMMAR);

  1 failed
```

Same assertion, same received string, one line of guard removed. That is the Scope 3 adversarial
scenario satisfied literally: *given the corrected route, when the pre-corpus guard is removed,
the new case fails*. The scratch worktree was removed afterwards and `git worktree list` reports
only the main checkout.

### The same case passes against the corrected route

**Executed:** YES
**Command:** `npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --workers=1 --reporter=line --grep "BUG-018 scope 2"`
**Phase Agent:** bubbles.implement

```text
GREEN_EXIT=0

Running 1 test using 1 worker

[1/1] [system-chrome] › tests/company-intelligence-lab.spec.mjs:1622:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established
  1 passed (1.7s)
```

The case carries no conditional early return. It asserts both halves of the window on one page:
while held, the cockpit copy does not match the settled grammar, `data-coverage-unavailable`
publishes no number, `data-reading-readiness` reads `not-established` beside a `composed`
`data-run-status`, a body-text scan finds the readiness wording, and all four horizon cards read
`not-established` while still carrying more than 20 characters of readable copy. Then the hold is
released and the same page must reconcile: `13 of 15`, claim `settled`, the readiness wording gone
from the body text, `event` / `immediate` / `swing` carrying directions and `structural` not.

### The offline first paint, the guarantee Option B was most at risk of breaking

**Executed:** YES
**Command:** `npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --workers=1 --reporter=line --grep "file:// origin|every data request still outstanding|every committed source unavailable"`
**Phase Agent:** bubbles.implement

```text
OFFLINE_EXIT=0

Running 3 tests using 1 worker

[1/3] [system-chrome] › tests/company-intelligence-lab.spec.mjs:785:1 › Stabilize: every committed source unavailable degrades to a named absence, not a blank or a zero
[2/3] [system-chrome] › tests/company-intelligence-lab.spec.mjs:1075:1 › the route reaches its first paint from a file:// origin with no server and no off-origin request
[3/3] [system-chrome] › tests/company-intelligence-lab.spec.mjs:1118:1 › the first paint composes with every data request still outstanding, then reconciles to the served registry
  3 passed (2.2s)
```

Test 2 is `tests/company-intelligence-lab.spec.mjs:1075-1118` and test 3 is the case at
`1121-1174` that `design.md` names as the one any remedy must not break. Test 1 is the corpus-wide
outage: it asserts the coverage rows still read `unavailable` and name their absence, which under
this change is reachable only because a corpus resolved to `unavailable` is `established`. Had the
remedy withheld on "not loaded" instead of on "still pending", test 1 would have gone red — it is
the assertion that proves withholding is a window and not a permanent state.

### The committed browser suite rises from 38 to 39 with nothing removed

Captured with `.github/bubbles/scripts/evidence-capture.sh`; the digest covers every line produced.

**Executed:** YES
**Command:** `npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --workers=1 --reporter=line`
**Phase Agent:** bubbles.implement

```text
# BUG-018 S2+S3 full 025 browser suite after fix
exit: 0
lines: 43
sha256: 4d069169db0e3741bdfc8aff06139c1d12c3ecc00038a1f0e7ff42d02ac7be17

Running 39 tests using 1 worker
[5/39] ... Regression: SCN-025-021 an unavailable dimension renders a named absence and never a dash or a zero
[30/39] ... the route reaches its first paint from a file:// origin with no server and no off-origin request
[31/39] ... the first paint composes with every data request still outstanding, then reconciles to the served registry
[38/39] ... Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it
[39/39] ... Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established
  39 passed (45.2s)
```

37 at filing, 38 after Scope 1, 39 now. No existing assertion was removed, skipped, relaxed or
rewritten to accommodate the new copy — every one of them enters through `openComposedRoute` and
therefore reads a settled paint, where `established` is true and the rendered output is
byte-identical to before this change.

### The module suite is unchanged at 90

**Executed:** YES
**Command:** `node --test tests/company-intelligence.unit.mjs`
**Phase Agent:** bubbles.implement

```text
UNIT_EXIT=0
ℹ tests 90
ℹ suites 0
ℹ pass 90
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 133.379458
```

90, not 91: Option A was landed additively and no unit case was added for the new argument. That is
a real gap and is recorded as such below rather than counted as coverage. The 25 existing
`buildCoverageAccount` call sites in that file all pass two arguments and all still pass, which is
the evidence that the default is genuinely backward-compatible.

### The selftest baseline holds at 3404, 0 failed

**Executed:** YES
**Command:** `node scripts/selftest.mjs`
**Phase Agent:** bubbles.implement

```text
# BUG-018 S2+S3 repository selftest after fix
exit: 0
lines: 3871

================================================
Research-Lab self-test: 3404 passed, 0 failed
================================================
```

Measured directly in the shared working tree, not in an isolated worktree as Scope 1 needed: the
concurrent session's uncommitted `lifetime-tax-strategy-lab.html` that forced that isolation is no
longer present, and `git status` showed only this scope's own files modified.

Two consecutive `evidence-capture.sh` runs of this command over the same tree produced different
digests — `606b97ce2481f2ec087fc656bf7c86a2e077df7a31ba5345e9ec471dbcdc19cd` and
`b7d2840c17c018fac2ba251b677dbb8216bbe315e545fd726b64550b1c828943` — both exit 0 and both ending
in the banner above. The digest is therefore not a stable re-verification handle for this
particular command; the exit code, the line count and the banner are. Recorded rather than quoting
one digest as if it were reproducible.

### Nothing outside the packet and the named files was modified

Four shipped files: `rlcompanyintel.js` (Option A), `company-intelligence-lab.html` (Option B),
`tests/company-intelligence-lab.spec.mjs` (the added case) and
`notes/company-intelligence-lab.md` (the body-attribute contract this change alters). Plus this
packet's own artifacts. No untracked path belonging to a concurrent session was staged, deleted or
modified. The staged set was listed explicitly and every entry verified before each commit.

## What Was Not Established

- **A printed number drifting behind the stale attribute.** Facet 2's lie is observed directly. A
  case where the stale `loaded` paint prints a count that later changes was not produced: both
  subjects tried settle at the count they showed during the apply. It is reachable by construction
  for any subject whose settled account differs from its empty-cache account, and `MSFT` is such a
  subject, but that specific pairing was not run. Recorded as reachable-by-argument.
- **The pending paint under `file://` specifically.** The `file://` test at
  `tests/company-intelligence-lab.spec.mjs:1075` passes, so the route still reaches a composed,
  readable first paint from that origin. What was **not** separately sampled is the intermediate
  pending paint under `file://`; the assertions there read the settled result. The reasoning that
  the corpus resolves to `unavailable` and therefore reads settled is grounded in
  `company-intelligence-lab.html:1543` and corroborated by the corpus-wide-outage test over
  `http://`, but it was not observed on a `file://` origin directly.
- **Frequency on a real network.** The window's width was measured only against a local static
  server with and without an artificial hold. No production timing was gathered.
- **A unit case for the new readiness argument.** Option A is exercised only through the browser
  case and through the 25 existing two-argument call sites that prove the default. `readiness`
  round-tripping onto the account, and `C025-READ-CONTRACT` firing on a word outside the closed
  set, have no direct assertion in `tests/company-intelligence.unit.mjs`. The suite is 90 because
  nothing was added to it, not because the new surface is covered. A real gap, routed to
  `bubbles.plan`.
- **The dimension cards on a pre-corpus paint.** `dimensionCard()` at
  `company-intelligence-lab.html:835` still prints `unavailable` with a named absence sentence
  while the corpus is in flight. No requirement in `spec.md` names that surface, and the treatment
  used for the coverage table cannot simply be repeated on it — that treatment withholds every row,
  which on the dimension cards would also hide values a warm shared cache genuinely resolved.
  Whether those cards withhold wholesale or withhold only the absence claim is a product
  judgement. Recorded in `design.md` under `## Residual, Recorded Rather Than Silently Fixed` and
  routed to `bubbles.plan`; deliberately not swept into this scope.
- **Independent re-derivation of any evidence above.** Every run in this file was executed by
  `bubbles.implement`. No second party re-ran them, so `certification.certifiedCompletedPhases`
  stays empty and `certification.status` stays `in_progress`.

## Completion Statement

**Scopes 1, 2 and 3 are delivered. The packet remains `in_progress`, because the cross-scope
Definition of Done is not complete and phase certification has not been performed.**

Both facets are now closed. Facet 2 closed in Scope 1: `data-corpus-status` describes the subject
on screen, so a consumer following the committed suite's readiness convention is protected during a
manual apply again. Facet 1 closes here: a composed reading whose corpus has not answered no longer
states an absence in the grammar the route reserves for a settled finding, and says so in wording a
reader meets without opening an inspector. The route now renders all three of the honest states
`spec.md` names — settled-present, settled-absent, and not-yet-established — where it previously
rendered the third as the second.

The product decision that blocked Scope 2 is recorded in `design.md`, with its authority disclosed:
it was taken by the orchestrating session under the operator's standing authorization, and it was
constrained by the binding blocking pattern in
`.github/instructions/product-principles.instructions.md` rather than settled by preference. Open
questions 2, 3 and 4 are answered in the same record.

Ten of ten Scope 2 items and six of six Scope 3 items are ticked against the evidence above. The
cross-scope items are not all ticked and are not claimed: `uservalidation.md` carries no filled
Human Acceptance Record, and the packet-shape debt Scope 1 recorded — the `policySnapshot` fields
(G055), the missing `scenario-manifest.json` (G057), and the untracked-test-path reference — is
unchanged and still belongs to the packet owner. Two findings are routed out of this scope rather
than closed inside it: the missing unit coverage for the readiness argument, and the dimension-card
surface. Both are named above and neither is counted as delivered.

The root cause **is** established, unlike some sibling packets: the mechanism is read from the
shipped source, the ordering that produces it is unconditional rather than racy, and both facets
were reproduced. What remains open is the remedy choice for facet 1, not the diagnosis.

No branch was pushed.

**Educational research only. Not investment advice.**

## Simplify Phase — bubbles.simplify — 2026-08-30

### Review Boundary And Three-Pass Result

**Phase:** simplify
**Claim Source:** interpreted
**Interpretation:** The review covered the production and test changes from delivery commits
`6881aa3a4` and `4784fd4e0`. It also included the current BUG-018 fault-injection annotations in
`tests/company-intelligence-lab.spec.mjs`.

| Review | Finding | Disposition |
| --- | --- | --- |
| Code reuse | The production path already carries one readiness value through `buildCoverageAccount()` and consumes it on each distinct rendered surface. | No production edit. A helper would add indirection without removing a second implementation. |
| Code quality | `applySubject()` preserves the standing status only across a refused replacement. The browser regression keeps pending and settled assertions on one page. | No production edit. Splitting either flow would obscure the ordering contract. |
| Efficiency | The pending-window test stored every held request URL, but asserted only the collection length. | Fixed as `BUG018-SIMPLIFY-001`. The handler now increments `heldCorpusRequestCount` and has no unused request parameter. |

No production source changed during this phase. The test assertions, request hold, release order,
and cleanup behavior remain unchanged.

### Browser Regression Evidence

**Phase:** simplify
**Executed:** YES (current session)
**Command:** `npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-018 simplify full company browser suite
$ npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
lines: 44
sha256: bc3cba8003ad23e68fb70b49d31b8d213086befe02bb1cd04dc875562572e788
--- first 20 ---

Running 39 tests using 1 worker

  ✓   1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:71:1 › four horizon regions render with four summaries and four deep-dive controls (1.2s)
  ✓   2 [system-chrome] › tests/company-intelligence-lab.spec.mjs:100:1 › Regression: SCN-025-005 four horizon cards stay peers and never merge into one direction (1.5s)
  ✓   3 [system-chrome] › tests/company-intelligence-lab.spec.mjs:131:1 › an owned dimension renders a deep link whose target is a registered route (1.0s)
  ✓   4 [system-chrome] › tests/company-intelligence-lab.spec.mjs:175:1 › every rendered numeric value carries a provenance chip, a source name and an as-of date (861ms)
  ✓   5 [system-chrome] › tests/company-intelligence-lab.spec.mjs:202:1 › Regression: SCN-025-021 an unavailable dimension renders a named absence and never a dash or a zero (796ms)
  ✓   6 [system-chrome] › tests/company-intelligence-lab.spec.mjs:236:1 › Regression: SCN-025-021 a scripted narrative string renders as visible escaped text (694ms)
  ✓   7 [system-chrome] › tests/company-intelligence-lab.spec.mjs:261:1 › a position, size or cost basis entry is refused in the browser and nothing is stored (598ms)
  ✓   8 [system-chrome] › tests/company-intelligence-lab.spec.mjs:287:1 › each canvas draws non-blank pixels and pairs with a table holding the same values (1.1s)
  ✓   9 [system-chrome] › tests/company-intelligence-lab.spec.mjs:334:1 › the route defers no drawing and schedules no timer (612ms)
  ✓  10 [system-chrome] › tests/company-intelligence-lab.spec.mjs:362:1 › switching the mode segment triggers no request and no recomposition (712ms)
  ✓  11 [system-chrome] › tests/company-intelligence-lab.spec.mjs:384:1 › FR-025-017 a second run reuses the cached corpus and refetches no committed bar file (849ms)
  ✓  12 [system-chrome] › tests/company-intelligence-lab.spec.mjs:428:1 › at 375 CSS pixels the four summaries stack and the document never scrolls sideways (723ms)
  ✓  13 [system-chrome] › tests/company-intelligence-lab.spec.mjs:454:1 › the route composes from cache first and publishes a verified owner read (697ms)
  ✓  14 [system-chrome] › tests/company-intelligence-lab.spec.mjs:484:1 › Regression: SCN-025-016 a passed event renders as occurred and never as an upcoming catalyst (845ms)
  ✓  15 [system-chrome] › tests/company-intelligence-lab.spec.mjs:546:1 › each research branch renders one disclosure row whose header carries the disposition word (780ms)
  ✓  16 [system-chrome] › tests/company-intelligence-lab.spec.mjs:580:1 › an empty research plan renders its reason as readable copy rather than an empty block (666ms)
  ✓  17 [system-chrome] › tests/company-intelligence-lab.spec.mjs:599:1 › Regression: SCN-025-022 the outcome record shows the predecessor unmodified beside the new version (888ms)
--- omitted 4 line(s); sha256 above covers the full output ---
--- last 20 ---
  ✓  22 [system-chrome] › tests/company-intelligence-lab.spec.mjs:834:1 › Stabilize: a malformed committed payload degrades to an absence rather than a half-read value (482ms)
  ✓  23 [system-chrome] › tests/company-intelligence-lab.spec.mjs:860:1 › Stabilize: an unreadable coverage registry refuses by name instead of rendering a blank page (364ms)
  ✓  24 [system-chrome] › tests/company-intelligence-lab.spec.mjs:883:1 › Stabilize: a storage layer that throws on every write still composes the run (404ms)
  ✓  25 [system-chrome] › tests/company-intelligence-lab.spec.mjs:906:1 › Stabilize: the route writes only the shared data container and leaves a sibling tool cache intact (507ms)
  ✓  26 [system-chrome] › tests/company-intelligence-lab.spec.mjs:933:1 › Stabilize: repeat composition of an unchanged subject issues no further request (812ms)
  ✓  27 [system-chrome] › tests/company-intelligence-lab.spec.mjs:965:1 › Stabilize: the idle route runs no polling loop, no interval and no animation frame (4.9s)
  ✓  28 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1003:1 › Stabilize: a version chain that points at itself terminates instead of looping (2.4s)
  ✓  29 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1039:1 › Chaos: a background corpus paint does not close a deep dive the reader opened (5.6s)
  ✓  30 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1075:1 › the route reaches its first paint from a file:// origin with no server and no off-origin request (340ms)
  ✓  31 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1118:1 › the first paint composes with every data request still outstanding, then reconciles to the served registry (554ms)
  ✓  32 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1189:1 › every interactive control on the route is reachable and operable from the keyboard alone (1.4s)
  ✓  33 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1335:1 › Regression: SCN-027-018 every subject-carrying owner link opens its owner route on the company being read (1.8s)
  ✓  34 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1374:1 › Regression: SCN-027-014 every bare owner row renders its stated reason beside the link on both the coverage table and the dimension card (875ms)
  ✓  35 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1423:1 › Regression: SCN-027-010 the rendered reason is written with textContent and no registry-authored value reaches an attribute or an href (550ms)
  ✓  36 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1468:1 › Regression: F-AUDIT-08 every currently-valid deep-link subject still opens its company (999ms)
  ✓  37 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1488:1 › Regression: F-AUDIT-08 a subject the shared grammar refuses never becomes the hub subject (1.7s)
  ✓  38 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1540:1 › Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it (3.3s)
  ✓  39 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1626:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established (583ms)

  39 passed (48.5s)
```

### Regression Quality Evidence

**Phase:** simplify
**Executed:** YES (current session)
**Command:** `bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix --verbose tests/company-intelligence-lab.spec.mjs`
**Exit Code:** 0
**Claim Source:** executed

The capture below replaces the emitted operator home path with `~/research-lab` before storage.

```text
# BUG-018 simplify regression quality
$ bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix --verbose tests/company-intelligence-lab.spec.mjs
exit: 0
lines: 16
sha256: 74bef83e09d7e15896b17fb333791b6ad3195b59996376dc650f4e2f8cd03c3d
--- output ---
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Repo: ~/research-lab
  Timestamp: 2026-08-30T00:20:41Z
  Bugfix mode: true
============================================================

ℹ️  Scanning tests/company-intelligence-lab.spec.mjs
✅ Asserts the current surface in tests/company-intelligence-lab.spec.mjs (mixed inspection accepted)
✅ Adversarial signal detected in tests/company-intelligence-lab.spec.mjs

============================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 1
  Files with adversarial signals: 1
============================================================
```

### Repository Selftest Evidence

**Phase:** simplify
**Executed:** YES (current session)
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-018 simplify repository selftest
$ node scripts/selftest.mjs
exit: 0
lines: 3904
sha256: bddc3750df50db0a66d9eee5702cf10a30cbe779b9f5fe20708f407f4ead1f46
--- first 20 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
  ✓ all pages use one identical CSP instead of drifting per page
  ✓ CSP keeps the single-file inline-script design while defaulting to self
  ✓ CSP blocks object, base-tag, and form exfiltration paths
  ✓ CSP connect-src is an explicit origin allowlist, never wildcard https
  ✓ CSP preserves fixed providers, StockAnalysis, and custom-port tailnet proxy paths
  ✓ CSP allows no open URL-forwarding relay origin
  ✓ production pages and shared runtime contain no open URL-forwarding relay chain
  ✓ no model/config-authored field reaches innerHTML without esc()
  ✓ the sink detector catches an unescaped model-authored title

Feature 004 RLFX/RLDATA foundation
  ✓ RLFX CommonJS import preserves the existing global and explicit decisionTime is deterministic
  ✓ RLFX universe is bounded closed and asserts no live source authorization
  ✓ RLDATA source envelopes preserve approved rights and clocks and reject metadata-free rows
  ✓ RLDATA schema-one bars and legacy tool reads remain compatible beside versioned envelopes
  ✓ RLDATA Twelve Data mapping: interval/symbol translate, values sort newest-first → oldest-first with UTC epochs, empty volume → null, error/malformed → null
--- omitted 3864 line(s); sha256 above covers the full output ---
--- last 20 ---
  ✓ a registry claiming fewer ticked rows than the artifact carries FAILS too — drift in either direction is a false summary
  ✓ a claim whose scope artifact cannot be located FAILS instead of being silently skipped — an unverifiable claim is not a verified one
  ✓ the single-file bug-packet layout resolves all three of its claims — a numbered scope whose tiered DoD includes a deeper sub-heading, a sibling scope that has not started, and the packet-level cross-scope block — across the dodChecked, dodTicked and dodTotal spellings alike (3/3 agreeing)
  ✓ scope 2 ends where the cross-scope block begins rather than running to end-of-file, and `## Scope Summary` is not mistaken for a scope section because it carries no ordinal (01, 02, cross-scope)
  ✓ a `#` line inside a fenced Gherkin block is a comment rather than a heading, so it never splits a scope or ends a Definition of Done (2 real headings, 3 when fences are ignored)
  ✓ a scope already frozen in the baseline is carried as known debt rather than failing the run, so pre-existing drift in packets this change does not own cannot turn the validation path red
  ✓ freezing one scope does not license the next — the baseline is keyed on the SCOPE, not on the numbers, so a second drifting scope still FAILS while the frozen one passes
  ✓ a baseline entry whose claim now matches its artifact is reported STALE while the run still exits 0, so the frozen list can only shrink
  ✓ a scan that matches zero progress claims FAILS rather than passing vacuously — a matcher that quietly stopped matching would otherwise reproduce the exact blind spot this guard closes
  ✓ the scan read real progress claims against a present baseline, so a green verdict is a comparison rather than a matcher that stopped matching (91 claim(s) across 69 packet(s), 77 agreeing, baseline 14 entries)
  ✓ every committed progress claim resolves to a scope artifact the guard can actually read, so none of them is passing merely because nothing could check it (0 unresolvable)
  ✓ no scope progress claim disagrees with its Definition of Done outside the frozen baseline — a stale count reads as a summary of the artifact while describing a state the artifact has left (0 new, 14 frozen, 0 stale of 91 claim(s))
  ✓ SCN-011B-REG the regression matcher found at least one test declaration in tests/causal-rotation-consumers.spec.mjs — a matcher that silently stopped matching would pass this whole block vacuously (5 found)
  ✓ SCN-011B-REG every test in tests/causal-rotation-consumers.spec.mjs declares its own timeout budget, so none of them silently inherits the 30 s Playwright default that produced the intermittent red (5 budget(s) for 5 test(s))
  ✓ SCN-011B-REG every declared budget in tests/causal-rotation-consumers.spec.mjs clears the 60000 ms floor — the measured single-worker cost is 23.7 s, so anything at or near the 30 s default leaves no margin for four-worker contention (0 below floor of 5)
  ✓ SCN-011B-REG ADVERSARIAL the budget matcher detects a removed declaration, so a real regression that deletes one would turn this block red rather than leaving it green (5 → 4 after stripping one)

================================================
Research-Lab self-test: 3435 passed, 0 failed
================================================
```

### Simplify Disposition

`BUG018-SIMPLIFY-001` is addressed by the test-only counter change and the checks above. No other
simplification finding was raised. The packet status and every `certification.*` field remain
unchanged. Existing planning ownership and routing remain unchanged.

## Stabilize Phase — bubbles.stabilize — 2026-08-30

### Review Boundary And Runtime Epoch

**Phase:** stabilize
**Agent:** `bubbles.stabilize`
**Claim Source:** interpreted
**Interpretation:** This phase reviewed the pending-state runtime path and its two persistent
browser regressions. It ran against `f0d9c158b7` plus the existing BUG-018 working-tree changes.
It changed no production source, test, planning artifact, or certification field.

The review traced `applySubject()`, `loadCorpus()`, `loadOne()`, `loadOptionalJson()`, and
`readConfig()` in `company-intelligence-lab.html`. It also traced both BUG-018 cases in
`tests/company-intelligence-lab.spec.mjs`.

### Stability Inventory

| Domain | Observation | Disposition |
| --- | --- | --- |
| Reliability | Released and failed requests reconcile from pending in the focused runs. Stalled requests and superseded intents remain unbounded. | `BUG018-STABILIZE-001` and `BUG018-STABILIZE-004` remain open. |
| Test timing | Thirty repeated BUG-018 cases passed. One case uses a fixed delay. Another samples a request counter without an explicit wait. | `BUG018-STABILIZE-002` and `BUG018-STABILIZE-003` remain open. |
| Performance | Scope 1 took 31.1 seconds for ten repetitions. Scope 2 took 28.5 seconds for twenty repetitions. | The fixed 2500 millisecond hold accounts for avoidable test time. |
| Resource usage | Twelve repeated storage, reuse, idle-scheduling, and version-cycle canaries passed. No worker teardown failure appeared. | No new BUG-018 resource finding. |
| Infrastructure and deployment | Research Lab serves static files and has no service lifecycle or deployment command. | Not applicable to this route-level phase. |
| Configuration and build | The route reads same-origin committed files. The repository has no runtime config compiler, lint command, or typecheck command. | No config or build change was needed. |
| Observability | `.github/bubbles-project.yaml` declares no `traceContracts` block. | No operate-plane or validate-plane telemetry was available for this static route. |

Security analysis was not performed. That domain belongs to `bubbles.security`.

### Findings

#### BUG018-STABILIZE-001 — A stalled same-origin response can leave the route pending forever

**Severity:** high
**Domain:** runtime reliability
**Claim Source:** interpreted
**Interpretation:** `loadCorpus()` sets `corpusStatus` to `pending`, then awaits the full read
chain. The three production fetch sites have no timeout, abort signal, or cancellation boundary.
A connection that never answers therefore has no code path to `unavailable`.

The relevant fetches are `loadOne()` at `company-intelligence-lab.html:1615`,
`loadOptionalJson()` at `:1678`, and `readConfig()` at `:1771`. The final repaint occurs only after
the chain reaches the intent check at `:1640`. The source scan found no `AbortController`,
`Promise.race`, fetch `signal`, or timeout implementation in this route.

The existing browser cases prove two bounded outcomes. One releases a held request. Another
forces request failure. Neither proves recovery when the server accepts a request and never
answers it.

> **Uncertainty Declaration**
> **What was attempted:** The held-request and all-source-unavailable cases were repeated five
> times each under the committed worker configuration.
> **What was observed:** All fifteen executions passed after each injected boundary released or
> failed.
> **Why this is uncertain:** No committed case holds a request past a product-owned timeout,
> because the route defines no timeout.
> **What would resolve this:** `bubbles.plan` must define the timeout and cancellation contract.
> `bubbles.implement` and `bubbles.test` must then add bounded recovery and a never-answering
> same-origin regression.

#### BUG018-STABILIZE-002 — Scope 1 uses elapsed time as its request-release mechanism

**Severity:** medium
**Domain:** test reliability and performance
**Claim Source:** interpreted
**Interpretation:** The Scope 1 handler sleeps for 2500 milliseconds before continuing each
matched request. The assertion needs ordering, not elapsed time. A release gate would prove the
same boundary without spending a fixed interval per execution.

Ten repetitions passed with durations from 3.9 to 4.5 seconds. The run consumed 31.1 seconds with
two workers. No flake occurred in this sample. The fixed timer remains a deterministic cost and a
weaker synchronization primitive than the gate already used by Scope 2.

**Required owner:** `bubbles.test`. Replace the timer with a request-entry sentinel and an explicit
release after the synchronous pending assertion. Preserve the existing global `afterEach()`
cleanup.

#### BUG018-STABILIZE-003 — Scope 2 reads its request counter without synchronizing on request entry

**Severity:** medium
**Domain:** test reliability
**Claim Source:** interpreted
**Interpretation:** The route paints from its embedded registry before `readConfig()` starts the
corpus load. The test waits for the first composed paint, reads the page, and immediately asserts
`heldCorpusRequestCount > 0`. It never waits for the route handler that increments the counter.

Twenty repetitions passed in 28.5 seconds. This sample did not reproduce a failure. The test still
depends on the config fetch and request-dispatch tasks overtaking the page snapshot.

> **Uncertainty Declaration**
> **What was attempted:** The exact Scope 2 case ran twenty times with two workers and
> `--fail-on-flaky-tests`.
> **What was observed:** Twenty executions passed with durations from 870 milliseconds to 1.2
> seconds.
> **Why this is uncertain:** The run samples one machine and one scheduling load. The source has
> no explicit request-entry wait.
> **What would resolve this:** `bubbles.test` must await the existing counter or a captured request
> promise before reading the pending paint. The held gate keeps the page inside the window while
> that synchronization completes.

#### BUG018-STABILIZE-004 — Superseded corpus loads mutate shared state before the intent guard

**Severity:** medium
**Domain:** runtime concurrency
**Claim Source:** interpreted
**Interpretation:** `loadCorpus()` captures `readingIntent`, but it writes `corpusStatus` before
checking whether that intent is still current. `loadEvents()` and `loadResearchRecord()` also
write module-scope data. The intent guard runs only at the final repaint.

The guard prevents an obsolete `run()`. It does not prevent obsolete work from changing
`corpusStatus`, `committedEvents`, `authoredPlan`, or `versionTree`. A later refusal or apply can
therefore read state written by an older request chain.

> **Uncertainty Declaration**
> **What was attempted:** Source control flow and every `readingIntent` use were inspected. The
> focused regressions and adjacent runtime canaries were executed repeatedly.
> **What was observed:** No committed test reverses two subject-request completion orders. No
> repeated run failed.
> **Why this is uncertain:** The user-visible consequence requires a controlled overlap that the
> current suite does not create.
> **What would resolve this:** `bubbles.plan` must define latest-intent ownership for every shared
> slot. A browser regression must reverse two subject completions and assert the last intent owns
> both the rendered state and the module state.

### Focused Pending-Window Evidence

**Phase:** stabilize
**Executed:** YES (current session)
**Command:** `npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "BUG-018 scope 2" --repeat-each=20 --fail-on-flaky-tests --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-018 stabilize scope-2 20-run timing probe
exit: 0
lines: 25
sha256: 7610ac3d289bf5adefb5be2eb946ab249da929963754cf26d39abb5029c7d142

Running 20 tests using 2 workers

  ✓   2 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1626:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established (1.1s)
  ✓   1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1626:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established (1.2s)
  ✓   3 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1626:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established (976ms)
  ✓   4 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1626:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established (1.0s)
  ✓   6 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1626:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established (1.2s)
  ✓   5 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1626:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established (1.0s)
  ✓   8 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1626:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established (1.1s)
  ✓   7 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1626:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established (1.1s)
  ✓   9 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1626:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established (1.2s)
  ✓  10 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1626:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established (977ms)
  ✓  12 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1626:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established (979ms)
  ✓  11 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1626:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established (1.1s)
  ✓  14 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1626:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established (1.2s)
  ✓  13 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1626:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established (1.2s)
  ✓  16 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1626:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established (1.1s)
  ✓  15 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1626:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established (1.2s)
  ✓  17 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1626:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established (972ms)
  ✓  18 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1626:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established (968ms)
  ✓  20 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1626:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established (870ms)
  ✓  19 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1626:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established (982ms)

  20 passed (28.5s)
```

The compact lines above preserve the result and each measured duration. The capture hash covers
the full runner output with complete test titles.

**Phase:** stabilize
**Executed:** YES (current session)
**Command:** `npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "BUG-018 scope 1" --repeat-each=10 --fail-on-flaky-tests --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-018 stabilize scope-1 10-run timing probe
exit: 0
lines: 15
sha256: b3a702406a7f794465769df6ba0db343dca54012a1d2f8e89ac520d9d055378d

Running 10 tests using 2 workers

  ✓   1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1540:1 › Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it (4.5s)
  ✓   2 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1540:1 › Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it (4.5s)
  ✓   3 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1540:1 › Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it (4.1s)
  ✓   4 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1540:1 › Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it (4.0s)
  ✓   5 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1540:1 › Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it (4.2s)
  ✓   6 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1540:1 › Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it (4.2s)
  ✓   7 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1540:1 › Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it (3.9s)
  ✓   8 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1540:1 › Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it (3.9s)
  ✓   9 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1540:1 › Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it (4.0s)
  ✓  10 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1540:1 › Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it (3.9s)

  10 passed (31.1s)
```

The capture hash covers the full runner output with complete test titles.

### Degraded-State And Runtime Evidence

**Phase:** stabilize
**Executed:** YES (current session)
**Command:** `npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "file:// origin|every data request still outstanding|every committed source unavailable" --repeat-each=5 --fail-on-flaky-tests --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-018 stabilize degraded-state 5-run probe
exit: 0
lines: 20
sha256: 0415ca198c634aa9a556e1ccff26025edea893acdbb6956f89d186969f100dc2

Running 15 tests using 2 workers

  ✓   1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:785:1 › Stabilize: every committed source unavailable degrades to a named absence, not a blank or a zero (1.4s)
  ✓   2 [system-chrome] › tests/company-intelligence-lab.spec.mjs:785:1 › Stabilize: every committed source unavailable degrades to a named absence, not a blank or a zero (1.4s)
  ✓   3 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1075:1 › the route reaches its first paint from a file:// origin with no server and no off-origin request (821ms)
  ✓   4 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1075:1 › the route reaches its first paint from a file:// origin with no server and no off-origin request (797ms)
  ✓   5 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1118:1 › the first paint composes with every data request still outstanding, then reconciles to the served registry (1.7s)
  ✓   6 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1118:1 › the first paint composes with every data request still outstanding, then reconciles to the served registry (1.9s)
  ✓   7 [system-chrome] › tests/company-intelligence-lab.spec.mjs:785:1 › Stabilize: every committed source unavailable degrades to a named absence, not a blank or a zero (1.4s)
  ✓   8 [system-chrome] › tests/company-intelligence-lab.spec.mjs:785:1 › Stabilize: every committed source unavailable degrades to a named absence, not a blank or a zero (1.2s)
  ✓  10 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1075:1 › the route reaches its first paint from a file:// origin with no server and no off-origin request (665ms)
  ✓   9 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1075:1 › the route reaches its first paint from a file:// origin with no server and no off-origin request (720ms)
  ✓  11 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1118:1 › the first paint composes with every data request still outstanding, then reconciles to the served registry (932ms)
  ✓  12 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1118:1 › the first paint composes with every data request still outstanding, then reconciles to the served registry (916ms)
  ✓  13 [system-chrome] › tests/company-intelligence-lab.spec.mjs:785:1 › Stabilize: every committed source unavailable degrades to a named absence, not a blank or a zero (859ms)
  ✓  14 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1075:1 › the route reaches its first paint from a file:// origin with no server and no off-origin request (540ms)
  ✓  15 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1118:1 › the first paint composes with every data request still outstanding, then reconciles to the served registry (915ms)

  15 passed (17.2s)
```

The capture hash covers the full runner output with complete test titles.

**Phase:** stabilize
**Executed:** YES (current session)
**Command:** `npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "storage layer that throws|repeat composition of an unchanged subject|idle route runs no polling loop|version chain that points at itself" --repeat-each=3 --fail-on-flaky-tests --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-018 stabilize runtime-safety 3-run probe
exit: 0
lines: 17
sha256: 45a8e71a98dfe90e50667cdd5f86190a0d8be81d3186deca255085f1fbea4e94

Running 12 tests using 2 workers

  ✓   2 [system-chrome] › tests/company-intelligence-lab.spec.mjs:883:1 › Stabilize: a storage layer that throws on every write still composes the run (663ms)
  ✓   1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:883:1 › Stabilize: a storage layer that throws on every write still composes the run (685ms)
  ✓   4 [system-chrome] › tests/company-intelligence-lab.spec.mjs:933:1 › Stabilize: repeat composition of an unchanged subject issues no further request (809ms)
  ✓   3 [system-chrome] › tests/company-intelligence-lab.spec.mjs:933:1 › Stabilize: repeat composition of an unchanged subject issues no further request (845ms)
  ✓   5 [system-chrome] › tests/company-intelligence-lab.spec.mjs:965:1 › Stabilize: the idle route runs no polling loop, no interval and no animation frame (4.9s)
  ✓   6 [system-chrome] › tests/company-intelligence-lab.spec.mjs:965:1 › Stabilize: the idle route runs no polling loop, no interval and no animation frame (4.9s)
  ✓   7 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1003:1 › Stabilize: a version chain that points at itself terminates instead of looping (2.4s)
  ✓   8 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1003:1 › Stabilize: a version chain that points at itself terminates instead of looping (2.4s)
  ✓   9 [system-chrome] › tests/company-intelligence-lab.spec.mjs:883:1 › Stabilize: a storage layer that throws on every write still composes the run (596ms)
  ✓  10 [system-chrome] › tests/company-intelligence-lab.spec.mjs:933:1 › Stabilize: repeat composition of an unchanged subject issues no further request (1.2s)
  ✓  11 [system-chrome] › tests/company-intelligence-lab.spec.mjs:965:1 › Stabilize: the idle route runs no polling loop, no interval and no animation frame (5.0s)
  ✓  12 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1003:1 › Stabilize: a version chain that points at itself terminates instead of looping (2.4s)

  12 passed (21.8s)
```

The capture hash covers the full runner output with complete test titles.

### Module And Regression-Guard Evidence

**Phase:** stabilize
**Executed:** YES (current session)
**Command:** `node --test tests/company-intelligence.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-018 stabilize company-intelligence unit suite
exit: 0
lines: 550
sha256: 1987459582c0cae5b1e5e25cbd2a91ba5f2aeeeed5e061cce67e1d312a6bf242
--- first 20 ---
TAP version 13
# Subtest: coverage account holds one row per registry dimension and totals sum to the registry length
ok 1 - coverage account holds one row per registry dimension and totals sum to the registry length
  ---
  duration_ms: 8.675291
  type: 'test'
  ...
# Subtest: SCN-025-001 a subject carrying committed bars and a cached options chain accounts for every mandatory dimension in the closed five-state vocabulary
ok 2 - SCN-025-001 a subject carrying committed bars and a cached options chain accounts for every mandatory dimension in the closed five-state vocabulary
  ---
  duration_ms: 2.347898
  type: 'test'
  ...
# Subtest: every one of the five evidence states is produced by a real adapter outcome
ok 3 - every one of the five evidence states is produced by a real adapter outcome
  ---
  duration_ms: 3.749696
  type: 'test'
  ...
--- omitted 510 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 89 - 027 security — ownerBareReason reaches the reader as text only, never an attribute, an href or markup
  ---
  duration_ms: 1.006299
  type: 'test'
  ...
# Subtest: 027 security — no markup-bearing subject can reach a receiver markup sink, and every subject-fed sink escapes
ok 90 - 027 security — no markup-bearing subject can reach a receiver markup sink, and every subject-fed sink escapes
  ---
  duration_ms: 5.830494
  type: 'test'
  ...
1..90
# tests 90
# suites 0
# pass 90
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 353.399015
```

**Phase:** stabilize
**Executed:** YES (current session)
**Command:** `bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix --verbose tests/company-intelligence-lab.spec.mjs`
**Exit Code:** 0
**Claim Source:** executed

The repository path in the raw output is replaced with `~/research-lab` before storage. No other
output changed.

```text
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Repo: ~/research-lab
  Timestamp: 2026-08-30T00:32:31Z
  Bugfix mode: true
============================================================

ℹ️  Scanning tests/company-intelligence-lab.spec.mjs
✅ Asserts the current surface in tests/company-intelligence-lab.spec.mjs (mixed inspection accepted)
✅ Adversarial signal detected in tests/company-intelligence-lab.spec.mjs

============================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 1
  Files with adversarial signals: 1
============================================================
```

### Stabilize Verdict

🛑 UNSTABLE

Four findings remain. No finding was fixed inline because production and test remediation belong
to `bubbles.implement` and `bubbles.test`. The timeout and latest-intent contracts require
`bubbles.plan` before either owner changes behavior.

The focused executions found no current flake, worker leak, or failed assertion. Those passes do
not close the four structural risks above. The top-level status and every `certification.*` field
remain `in_progress` and unchanged.

<a name="security-phase-bubbles-security-2026-08-30"></a>
## Security Phase — bubbles.security — 2026-08-30

### Review Boundary And Threat Model

**Phase:** security
**Agent:** `bubbles.security`
**Claim Source:** interpreted
**Interpretation:** This phase reviewed the delivered BUG-018 route and module changes from
`6881aa3a4` and `4784fd4e0`, the current fault-injection annotations in
`tests/company-intelligence-lab.spec.mjs`, and this packet. The review ran at
`1beee8270fec1ccb1ad9c93dd219bb4dcf9c0467` plus the existing working-tree changes. This phase
changed no production source or test. It wrote only this security record and execution provenance
in `state.json`. It did not write any `certification.*` field or request a terminal status.

The review traced these trust boundaries:

| Boundary | Threat reviewed | OWASP mapping | Result |
| --- | --- | --- | --- |
| URL or subject input into the route | Script URL, markup injection, path-bearing input, or private portfolio text reaches a sink or request | A01, A03 | No vulnerability found in the changed path. The shared subject grammar refuses hostile values, the route uses `textContent`, and the browser checks passed. |
| Committed registry and composed model into the DOM | Model-authored text becomes executable markup or an active URL | A03 | No vulnerability found in the changed path. Readiness is a closed value, text enters through `textContent`, and the only active `href` path remains separately validated. |
| Route into same-origin corpus files | A subject controls an off-origin or credential-bearing request | A02, A10 | No vulnerability found in the changed path. The changed flow adds no request target or credential surface. |
| Composed version into the shared `RLDATA` channel | A not-yet-established reading crosses a persisted trust boundary as an ordinary owner read | A08 | **Open finding `SEC-BUG018-001`.** The UI withholding does not gate publication. |
| Browser test into request routing | Canned responses masquerade as live E2E evidence | A08 | The three declared regions only delay or hold requests and then call `route.continue()`. No `route.fulfill()` or `route.abort()` exists in this file. One file-level provenance sentence is stale; see `SEC-BUG018-002`. |

The data in the changed flow is public ticker identity, committed public-market evidence, readiness
state, and derived horizon output. The route accepts no account or payment credential. A position,
share count, cost basis, or profit entry is refused before publication and is not stored. The
new readiness attributes carry only closed state words and a coverage count.

### Finding SEC-BUG018-001 — A Pending Reading Is Still Persisted On The Shared Owner-Read Channel

**Severity:** Medium
**OWASP:** A08 — Software and Data Integrity Failures
**Claim Source:** interpreted
**Interpretation:** The rendered route now withholds settled copy while
`version.coverageAccount.readiness` is `not-established`, but the same pending composition still
calls `INTEL.publishToolRead(version, window.RLDATA)` at
`company-intelligence-lab.html:1056`. `buildToolReadObject()` at
`rlcompanyintel.js:2049` derives `availability`, horizon summaries, and `coverageTotals` without
reading `version.coverageAccount.readiness`. `publishToolRead()` then writes the accepted
`rl-tool-read/v1` object. `RLDATA.putToolRead()` at `rldata.js:552-565` copies that object into
`toolReads` and calls `save()`, which persists the shared `rlData` container.

The visible cockpit is therefore honest while the shared owner-read boundary can still carry the
pre-corpus `none` or `absent` horizon output and an unavailable coverage account as an ordinary
published read. Another first-party consumer can read that value during the pending window. A
stalled corpus can extend the window indefinitely, which composes with `BUG018-STABILIZE-001`.

No browser probe in this phase observed a concurrent consumer reading the pending object. The
finding is grounded in the unconditional production call and the persistence path, not in a claim
that a particular consumer acted on it. The existing BUG-018 browser case reads the visible copy
and body attributes only. The settled publication test enters through `openComposedRoute()`, which
waits until the corpus is resolved. Neither test inspects `RLDATA.toolRead()` while readiness is
`not-established`.

**Required owner:** `bubbles.plan` must add the shared-publication trust boundary to the packet's
requirements and scenario contract. The required behavior must prevent a not-established account
from appearing as an ordinary published `rl-tool-read/v1`, then require `bubbles.implement` and
`bubbles.test` to prove the pending and settled channel states.

### Finding SEC-BUG018-002 — The Browser File Claims There Is No Interception While Declaring Three Fault Regions

**Severity:** Low
**Class:** Test provenance integrity; not an application vulnerability
**Claim Source:** interpreted
**Interpretation:** The file header at `tests/company-intelligence-lab.spec.mjs:3-6` says every
assertion runs with “no request interception.” The same file now contains declared
`page.route()` regions at lines 1135, 1562, and 1654. Each region is legitimate fault injection:
it holds or delays the real request and then calls `route.continue()` unchanged. The mechanical
interception scan accepts the balanced, reason-bearing annotations, and no canned response is
served. The file-level sentence still overstates the execution boundary and can mislead a later
security or test review.

**Required owner:** `bubbles.test` must narrow the header claim to distinguish ordinary route
coverage from the three explicitly declared, pass-through fault-injection cases. This does not
require reclassifying the BUG-018 tests because they still exercise the production page, real
static server, and real committed response after the injected hold.

### XSS And Model-Authored Rendering Review

No additional XSS finding was found. `setText()` and `el()` at
`company-intelligence-lab.html:770-785` use `textContent`. The changed cockpit and horizon branches
pass constant readiness copy or validated model fields through those helpers. The new readiness
attribute values come from the closed `established` or `not-established` vocabulary enforced by
`buildCoverageAccount()` at `rlcompanyintel.js:1257-1264`. The changed path adds no active URL.

The route still carries a CSP with `script-src 'unsafe-inline'`, so safe sink discipline remains
load-bearing. This phase does not claim the CSP alone would stop an inline-handler payload. The
executed browser test proved the hostile markup remained visible text, and the repository selftest
proved the model/config sink detector still rejects an unescaped model-authored title.

### Network, Credential, And Privacy Review

No new credential or PII exposure was found in the changed path. `rlcompanyintel.js` remains pure
and carries no DOM, storage, or network call. `loadOne()` at
`company-intelligence-lab.html:1610-1627` builds a same-origin committed-bars path with
`encodeURIComponent(symbol)`. The changed readiness path adds no `providerFetch`, password input,
token lookup, or external URL. The focused browser run exercised the file-origin no-off-origin and
no-credential case, the hostile linked-subject refusal, and the position/cost-basis refusal with
no persisted submitted literal.

The shared owner-read persistence in `SEC-BUG018-001` is an integrity issue, not a confidentiality
finding: the persisted candidate contains public company analysis rather than a credential or
private position. Dependency source locking passed. A CVE-database audit was not run because the
project command registry exposes a source-lock validator, not a vulnerability-database command,
and this packet changes no dependency manifest. This phase makes no claim that every package is
CVE-free.

### Mechanical Security Floor

**Phase:** security
**Command:** `bash .github/bubbles/scripts/security-gate.sh --repo-root .`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-018 G034 security gate
$ bash .github/bubbles/scripts/security-gate.sh --repo-root .
exit: 0
lines: 1
sha256: 6338e5918366a6a4e242ed0cb6066245789b51793d1bb137a3952651789a21cb
--- output ---
[security-gate] OK — 10357 tracked file(s), zero G034 findings
```

This is the G034 mechanical floor. It does not close the A08 finding above.

### Implementation Reality And Interception Evidence

**Phase:** security
**Command:** `bash .github/bubbles/scripts/implementation-reality-scan.sh specs/_bugs/BUG-018-corpus-pending-window-states-absence-as-settled-fact --verbose`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-018 implementation reality and interception scan
$ bash .github/bubbles/scripts/implementation-reality-scan.sh specs/_bugs/BUG-018-corpus-pending-window-states-absence-as-settled-fact --verbose
exit: 0
lines: 35
sha256: 32afbca50feeceaa740f471db55387647e6f219712239c11ea128083cc61b9a2
--- output ---
ℹ️  INFO: Resolved 2 implementation file(s) to scan

--- Scan 1: Gateway/Backend Stub Patterns ---
--- Scan 1B: Handler / Endpoint Execution Depth ---
--- Scan 1C: Endpoint Not-Implemented / Placeholder Responses ---
--- Scan 1D: External Integration Authenticity ---
--- Scan 2: Frontend Hardcoded Data Patterns ---
--- Scan 2B: Sensitive Client Storage ---
--- Scan 3: Frontend API Call Absence ---
--- Scan 4: Prohibited Simulation Helpers in Production ---
--- Scan 5: Default/Fallback Value Patterns ---
--- Scan 6: Live-System Test Interception ---
--- Scan 7: IDOR / Auth Bypass Detection (Gate G047) ---
--- Scan 8: Silent Decode Failure Detection (Gate G048) ---

============================================================
  IMPLEMENTATION REALITY SCAN RESULT
============================================================

  Files scanned:  2
  Violations:     0
  Warnings:       0

🟢 PASSED: No source code reality violations detected
```

### Focused Browser Security Evidence

**Phase:** security
**Command:** `npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "owned dimension renders a deep link|scripted narrative string|position, size or cost basis|subject the shared grammar refuses|BUG-018 scope 1|BUG-018 scope 2|file:// origin with no server" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-018 focused browser security boundaries
exit: 0
lines: 12
sha256: 84a5952c22d21cb17fdb364ea10fe1de98298274ba895db6f8a442493a397f7d
--- output ---

Running 7 tests using 1 worker

  ✓  1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:131:1 › an owned dimension renders a deep link whose target is a registered route (977ms)
  ✓  2 [system-chrome] › tests/company-intelligence-lab.spec.mjs:236:1 › Regression: SCN-025-021 a scripted narrative string renders as visible escaped text (766ms)
  ✓  3 [system-chrome] › tests/company-intelligence-lab.spec.mjs:261:1 › a position, size or cost basis entry is refused in the browser and nothing is stored (550ms)
  ✓  4 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1075:1 › the route reaches its first paint from a file:// origin with no server and no off-origin request (407ms)
  ✓  5 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1488:1 › Regression: F-AUDIT-08 a subject the shared grammar refuses never becomes the hub subject (2.2s)
  ✓  6 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1540:1 › Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it (3.4s)
  ✓  7 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1626:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established (740ms)

  7 passed (12.3s)
```

The checkout-local runner reported `Version 1.61.1` immediately before this run.

### Module Sink And Publication Contract Evidence

**Phase:** security
**Command:** `node --test tests/company-intelligence.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-018 company module security regression
$ node --test tests/company-intelligence.unit.mjs
exit: 0
lines: 550
sha256: b9ea739f5b5c3b2f84ad3f714684ef13433d25184756c862ae32e7aa874f2453
--- first 20 ---
TAP version 13
# Subtest: coverage account holds one row per registry dimension and totals sum to the registry length
ok 1 - coverage account holds one row per registry dimension and totals sum to the registry length
  ---
  duration_ms: 10.057669
  type: 'test'
  ...
--- omitted 510 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 89 - 027 security — ownerBareReason reaches the reader as text only, never an attribute, an href or markup
  ---
  duration_ms: 1.600461
  type: 'test'
  ...
# Subtest: 027 security — no markup-bearing subject can reach a receiver markup sink, and every subject-fed sink escapes
ok 90 - 027 security — no markup-bearing subject can reach a receiver markup sink, and every subject-fed sink escapes
  ---
  duration_ms: 7.023712
  type: 'test'
  ...
1..90
# tests 90
# suites 0
# pass 90
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 435.259791
```

### Repository Model-Sink And CSP Evidence

**Phase:** security
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-018 repository security and model-sink selftest
$ node scripts/selftest.mjs
exit: 0
lines: 3904
sha256: 72bc9e6c1a58b16bf5eacea36016672dd8e88d262a169218fce73e4cd305c34c
--- first 20 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
  ✓ all pages use one identical CSP instead of drifting per page
  ✓ CSP keeps the single-file inline-script design while defaulting to self
  ✓ CSP blocks object, base-tag, and form exfiltration paths
  ✓ CSP connect-src is an explicit origin allowlist, never wildcard https
  ✓ CSP preserves fixed providers, StockAnalysis, and custom-port tailnet proxy paths
  ✓ CSP allows no open URL-forwarding relay origin
  ✓ production pages and shared runtime contain no open URL-forwarding relay chain
  ✓ no model/config-authored field reaches innerHTML without esc()
  ✓ the sink detector catches an unescaped model-authored title
--- omitted 3864 line(s); sha256 above covers the full output ---
--- last 6 ---

================================================
Research-Lab self-test: 3435 passed, 0 failed
================================================
```

### Dependency Source-Lock Evidence

**Phase:** security
**Command:** `node scripts/validate-node-source-lock.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-018 Node dependency source lock
$ node scripts/validate-node-source-lock.mjs
exit: 0
lines: 22
sha256: e9bb9b552e92cd5b05328a34448e33d4bcc2b39dfe4f5ae0e430911374c711b1
--- output ---
[node-source-lock] manifest=PASS private=true runtimeDependencies=0 scripts=0 playwright=1.61.1 node=>=20
[node-source-lock] npmrc=PASS registry=https://registry.npmjs.org/ entries=5 ignoreScripts=true
[node-source-lock] lockfile=PASS version=3 externalPackages=3 integrity=sha512
[node-source-lock] graph=PASS playwright=1.61.1 playwright-core=1.61.1 fsevents=2.3.2
[node-source-lock] adversarial=missing-file result=REJECTED code=FILE-MISSING
[node-source-lock] adversarial=manifest-drift result=REJECTED code=MANIFEST-KEYS
[node-source-lock] adversarial=manifest-range result=REJECTED code=MANIFEST-PLAYWRIGHT
[node-source-lock] adversarial=manifest-wrong-version result=REJECTED code=MANIFEST-PLAYWRIGHT
[node-source-lock] adversarial=second-registry result=REJECTED code=NPMRC-DUPLICATE
[node-source-lock] adversarial=scoped-registry result=REJECTED code=NPMRC-SCOPED-REGISTRY
[node-source-lock] adversarial=verification-disabled result=REJECTED code=NPMRC-VERIFICATION
[node-source-lock] adversarial=lifecycle-relaxation result=REJECTED code=NPMRC-IGNORE-SCRIPTS
[node-source-lock] adversarial=untrusted-resolved-url result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=missing-integrity result=REJECTED code=LOCK-INTEGRITY
[node-source-lock] adversarial=git-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=file-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=path-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=http-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=external-version-range result=REJECTED code=LOCK-PACKAGE-VERSION
[node-source-lock] adversarial=extra-package result=REJECTED code=LOCK-GRAPH
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
```

### Regression Quality Evidence

**Phase:** security
**Command:** `bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix --verbose tests/company-intelligence-lab.spec.mjs`
**Exit Code:** 0
**Claim Source:** executed

The repository path in the command output below is normalized to `~/research-lab` before storage.
No security conclusion depends on that display value.

```text
# BUG-018 regression and interception quality
exit: 0
lines: 16
sha256: 09363a1cb82ad60c100e44cb622dacab70351947dcfbde9c12f3daaf9e918b1c
--- output ---
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Repo: ~/research-lab
  Timestamp: 2026-08-30T00:42:30Z
  Bugfix mode: true
============================================================

ℹ️  Scanning tests/company-intelligence-lab.spec.mjs
✅ Asserts the current surface in tests/company-intelligence-lab.spec.mjs (mixed inspection accepted)
✅ Adversarial signal detected in tests/company-intelligence-lab.spec.mjs

============================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 1
  Files with adversarial signals: 1
============================================================
```

### Security Phase Artifact Lint

**Phase:** security
**Command:** `bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-018-corpus-pending-window-states-absence-as-settled-fact`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-018 security phase artifact lint
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
--- selected complete-result lines; sha256 covers the full output ---
✅ Required artifact exists: spec.md
✅ Required artifact exists: design.md
✅ Required artifact exists: uservalidation.md
✅ Required artifact exists: state.json
✅ Required artifact exists: scopes.md
✅ Required artifact exists: report.md
✅ Detected state.json status: in_progress
✅ Detected state.json workflowMode: bugfix-fastlane
✅ Top-level status matches certification.status
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md
Artifact lint PASSED.
```

### Finding SEC-BUG018-003 — The Installed G140 Lint Misparses Canonical Object Claims

**Severity:** Medium governance reliability
**Class:** Cross-repository framework defect; not an application vulnerability
**Claim Source:** executed
**Interpretation:** The additional phase-name check parsed every quoted key inside each
object-form `execution.completedPhaseClaims[]` record as if it were a phase name. It therefore
reported `agent`, `claimedAt`, `evidenceRef`, `phase`, and `scopes` as unregistered phases. The
installed `state-transition-guard.sh` explicitly normalizes either a string or an object carrying
`phase`, and its selftest calls the object form “the real runtime shape.” The BUG-018 security
claim uses that existing object shape and artifact lint parses the state successfully.

```text
$ bash .github/bubbles/scripts/phase-name-enum-lint.sh specs/_bugs/BUG-018-corpus-pending-window-states-absence-as-settled-fact --verbose
[phase-name-enum-lint] scanned 1 state.json file(s), 10 packet phase(s), 0 authored phase(s)
[phase-name-enum-lint] registered phases: 30
[phase-name-enum-lint] baselined names:   0

[phase-name-enum-lint] FAIL [G140]: phase name(s) neither registered nor baselined:
  agent
  claimedAt
  evidenceRef
  phase
  scopes

Register the phase in .github/bubbles/workflows.yaml, or name a registered phase at the authoring surface.
```

**Exit Code:** 1

This downstream repository cannot patch the framework-managed lint. The finding is route-only to
the canonical Bubbles source. The parser must extract an object's `phase` value instead of every
quoted object key, while retaining support for legacy string entries. This failed optional check
is not represented as a pass. The required security-profile artifact lint passed on the final
packet and the packet remains non-terminal.

### Security Verdict

⚠️ FINDINGS

No critical or high application-security issue was found. `SEC-BUG018-001` remains open at Medium
because the UI fix does not protect the shared persisted owner-read boundary. `SEC-BUG018-002`
remains open at Low because the browser suite's file-level provenance sentence contradicts its
three declared fault-injection regions. `SEC-BUG018-003` is a separate cross-repository framework
finding: the installed G140 parser cannot validate the canonical object claim it is supposed to
inspect. The mechanical security floor and focused application checks passed, but those passes do
not close the two BUG-018 findings or the disclosed framework limitation. The packet remains
`in_progress`.

<a name="scope-4-publication-trust-boundary"></a>
## Scope 4 Publication Trust Boundary — bubbles.implement — 2026-08-30

### Delivery Summary

**Phase:** implement
**Claim Source:** executed

Scope 4 closes `SEC-BUG018-001` at the company-owned publication boundary. The publisher now
requires the exact coverage account to carry `readiness="established"` before it calls the shared
write API. A pending account returns `C025-PUBLISH-LOSSY` and performs no ordinary write.

The existing publication path remains unchanged after settlement. The loaded case publishes the
settled `MSFT` reading. The unavailable case publishes an ordinary record with null clocks.

The browser regression now starts observation before navigation. It captures a fresh-context
baseline, waits for a real corpus request to enter, and samples before explicit release. The same
gate replaces the fixed delay in Scope 1 and the request counter in Scope 2. Every handler forwards
the real response through `route.continue()` after release.

The browser-file header now limits its no-interception statement to ordinary cases. It identifies
the annotated hold or delay cases as pass-through fault injection. The repository selftest rejects
the former blanket claim.

The implementation run used revision `6c84913a907b48aebac3b2e77cdbab346a9bce25`. The packet
remains `in_progress`. This section records no validate-owned certification claim.

<a name="scope-4-red-green"></a>
### Isolated RED-To-GREEN Scenario Receipts

**Phase:** implement
**Command:** `timeout 900 node scripts/scenario-receipts.mjs --spec specs/_bugs/BUG-018-corpus-pending-window-states-absence-as-settled-fact --scenarios SCN-BUG-018-011,SCN-BUG-018-012,SCN-BUG-018-013,SCN-BUG-018-014`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-018 Scope 4 isolated RED to GREEN scenario receipts 2026-08-30
$ timeout 900 node scripts/scenario-receipts.mjs --spec specs/_bugs/BUG-018-corpus-pending-window-states-absence-as-settled-fact --scenarios SCN-BUG-018-011,SCN-BUG-018-012,SCN-BUG-018-013,SCN-BUG-018-014
exit: 0
lines: 11469
sha256: f7dc4235702d1767666cef7bd538a82109a66d740a53c9bee0fa0ee08bc130cc
--- first 20 ---
scenario-receipts: spec specs/_bugs/BUG-018-corpus-pending-window-states-absence-as-settled-fact
scenario-receipts: revision 6c84913a907b48aebac3b2e77cdbab346a9bce25
scenario-receipts: isolated copy /tmp/rl-scenario-receipts-K0rXmb
scenario-receipts: receipts append to .specify/runtime/tool-calls.jsonl
scenario-receipts: 4 scenario(s) requested

==============================================================================
SCN-BUG-018-011
==============================================================================

[SCN-BUG-018-011] red        (broken rlcompanyintel.js, must exit non-zero)

Running 1 test using 1 worker

  ✘  1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1823:1 › Regression: BUG-018 pending readiness is withheld from the ordinary RLDATA tool-read channel (818ms)


  1) [system-chrome] › tests/company-intelligence-lab.spec.mjs:1823:1 › Regression: BUG-018 pending readiness is withheld from the ordinary RLDATA tool-read channel

    Error: the pending paint wrote the ordinary rlData.toolReads key
--- failure-shaped lines from the omitted region ---
not ok 1 - scripts/selftest.mjs
--- omitted 11429 line(s); sha256 above covers the full output ---
--- last 20 ---
# cancelled 0
# skipped 0
# todo 0
# duration_ms 39727.676745

==============================================================================
SUMMARY  spec=specs/_bugs/BUG-018-corpus-pending-window-states-absence-as-settled-fact  revision=6c84913a907b48aebac3b2e77cdbab346a9bce25
==============================================================================
  COMPLETE             SCN-BUG-018-011  red=1 implement=0 green=0 live=0 regression=0
                         red non-zero, implement, green 0, regression 0
  COMPLETE             SCN-BUG-018-012  red=1 implement=0 green=0 live=0 regression=0
                         red non-zero, implement, green 0, regression 0
  COMPLETE             SCN-BUG-018-013  red=1 implement=0 green=0 live=0 regression=0
                         red non-zero, implement, green 0, regression 0
  COMPLETE             SCN-BUG-018-014  red=1 implement=0 green=0 regression=0
                         red non-zero, implement, green 0, regression 0

  complete   : 4/4
  shared tree: unchanged for the whole window
  mapped     : 14/14 manifest scenarios
```

The targeted breaks exited non-zero for all four scenarios. Their implement, green, live where
applicable, and regression lanes exited zero. The isolated runner reported no shared-tree change.

<a name="scope-4-unit"></a>
### Publication Contract Unit Regression

**Phase:** implement
**Command:** `timeout 900 node --test tests/company-intelligence.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-018 Scope 4 company publication unit 2026-08-30
$ timeout 900 node --test tests/company-intelligence.unit.mjs
exit: 0
lines: 556
sha256: f92e16c82589ce270e2c607053710c449956bf81bb45173a0b6d8039e3272009
--- first 20 ---
TAP version 13
# Subtest: coverage account holds one row per registry dimension and totals sum to the registry length
ok 1 - coverage account holds one row per registry dimension and totals sum to the registry length
  ---
  duration_ms: 17.59358
  type: 'test'
  ...
# Subtest: SCN-025-001 a subject carrying committed bars and a cached options chain accounts for every mandatory dimension in the closed five-state vocabulary
ok 2 - SCN-025-001 a subject carrying committed bars and a cached options chain accounts for every mandatory dimension in the closed five-state vocabulary
  ---
  duration_ms: 9.261537
  type: 'test'
  ...
# Subtest: every one of the five evidence states is produced by a real adapter outcome
ok 3 - every one of the five evidence states is produced by a real adapter outcome
  ---
  duration_ms: 22.434047
  type: 'test'
  ...
# Subtest: a read aged past its window stays in the denominator as stale rather than becoming neutral
--- omitted 516 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 90 - 027 security — ownerBareReason reaches the reader as text only, never an attribute, an href or markup
  ---
  duration_ms: 1.315391
  type: 'test'
  ...
# Subtest: 027 security — no markup-bearing subject can reach a receiver markup sink, and every subject-fed sink escapes
ok 91 - 027 security — no markup-bearing subject can reach a receiver markup sink, and every subject-fed sink escapes
  ---
  duration_ms: 4.807867
  type: 'test'
  ...
1..91
# tests 91
# suites 0
# pass 91
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 884.132086
```

The suite rose from 90 to 91 tests. The added case exercises the production publisher with a
not-established account, an established loaded account, and an established unavailable account.

<a name="scope-4-pending-publication"></a>
### Pending Publication Focused System-Chrome Regression

**Phase:** implement
**Command:** `timeout 300 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/company-intelligence-lab.spec.mjs --grep 'BUG-018 pending readiness'`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-018 Scope 4 pending publication focused system-Chrome 2026-08-30
$ timeout 300 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/company-intelligence-lab.spec.mjs --grep BUG-018 pending readiness
exit: 0
lines: 6
sha256: 39f3e7c01ec48564fc0c96a408b79c6de9deda4f607548ed82c2f1ce322eae79
--- output ---

Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1823:1 › Regression: BUG-018 pending readiness is withheld from the ordinary RLDATA tool-read channel (576ms)

  1 passed (3.5s)
```

The case starts with no company key. It waits for request entry while the account is
not-established. The persisted key and `RLDATA.toolRead()` both remain absent before release.

<a name="scope-4-loaded-publication"></a>
### Loaded Settlement Focused System-Chrome Regression

**Phase:** implement
**Command:** `timeout 300 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/company-intelligence-lab.spec.mjs --grep 'BUG-018 settled readiness'`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-018 Scope 4 loaded publication focused system-Chrome 2026-08-30
$ timeout 300 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/company-intelligence-lab.spec.mjs --grep BUG-018 settled readiness
exit: 0
lines: 6
sha256: bf34e670f4c33f262080c4385e148b96b10a4e11333d36ce6869d413eefdb66a
--- output ---

Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1845:1 › Regression: BUG-018 settled readiness publishes to the ordinary RLDATA tool-read channel (750ms)

  1 passed (3.3s)
```

The same request gate proves absence before release. After loaded settlement, the ordinary record
has exactly nine keys, reports 13 unavailable dimensions, and preserves three directed horizons.

<a name="scope-4-unavailable-publication"></a>
### Unavailable Settlement Focused System-Chrome Regression

**Phase:** implement
**Command:** `timeout 300 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/company-intelligence-lab.spec.mjs --grep 'BUG-018 unavailable settlement'`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-018 Scope 4 unavailable publication focused system-Chrome 2026-08-30
$ timeout 300 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/company-intelligence-lab.spec.mjs --grep BUG-018 unavailable settlement
exit: 0
lines: 6
sha256: 136e1faa5ffcaa2264e6be45a51c42cd55af2dbba89d52873d5c005a0eeda8ea
--- output ---

Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1881:1 › Regression: BUG-018 unavailable settlement remains publishable on the ordinary RLDATA tool-read channel (913ms)

  1 passed (3.9s)
```

The real missing-source server path reaches unavailable corpus status with established readiness.
The ordinary record reports unavailable, null `asOf`, null `freshUntil`, and 15 unavailable rows.

<a name="scope-4-full-browser"></a>
### Complete Company Intelligence System-Chrome Regression

**Phase:** implement
**Command:** `timeout 900 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/company-intelligence-lab.spec.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-018 Scope 4 full company system-Chrome regression 2026-08-30
$ timeout 900 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/company-intelligence-lab.spec.mjs
exit: 0
lines: 47
sha256: 54a741a0e196b5b6d19698b5fbeebc68c821b6e000a6bfc2b2ef888a772ec285
--- first 20 ---

Running 42 tests using 1 worker

  ✓   1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:140:1 › four horizon regions render with four summaries and four deep-dive controls (705ms)
  ✓   2 [system-chrome] › tests/company-intelligence-lab.spec.mjs:169:1 › Regression: SCN-025-005 four horizon cards stay peers and never merge into one direction (566ms)
  ✓   3 [system-chrome] › tests/company-intelligence-lab.spec.mjs:200:1 › an owned dimension renders a deep link whose target is a registered route (653ms)
  ✓   4 [system-chrome] › tests/company-intelligence-lab.spec.mjs:244:1 › every rendered numeric value carries a provenance chip, a source name and an as-of date (741ms)
  ✓   5 [system-chrome] › tests/company-intelligence-lab.spec.mjs:271:1 › Regression: SCN-025-021 an unavailable dimension renders a named absence and never a dash or a zero (988ms)
  ✓   6 [system-chrome] › tests/company-intelligence-lab.spec.mjs:305:1 › Regression: SCN-025-021 a scripted narrative string renders as visible escaped text (627ms)
  ✓   7 [system-chrome] › tests/company-intelligence-lab.spec.mjs:330:1 › a position, size or cost basis entry is refused in the browser and nothing is stored (583ms)
  ✓   8 [system-chrome] › tests/company-intelligence-lab.spec.mjs:356:1 › each canvas draws non-blank pixels and pairs with a table holding the same values (875ms)
  ✓   9 [system-chrome] › tests/company-intelligence-lab.spec.mjs:403:1 › the route defers no drawing and schedules no timer (547ms)
  ✓  10 [system-chrome] › tests/company-intelligence-lab.spec.mjs:431:1 › switching the mode segment triggers no request and no recomposition (582ms)
  ✓  11 [system-chrome] › tests/company-intelligence-lab.spec.mjs:453:1 › FR-025-017 a second run reuses the cached corpus and refetches no committed bar file (544ms)
  ✓  12 [system-chrome] › tests/company-intelligence-lab.spec.mjs:497:1 › at 375 CSS pixels the four summaries stack and the document never scrolls sideways (557ms)
  ✓  13 [system-chrome] › tests/company-intelligence-lab.spec.mjs:523:1 › the route composes from cache first and publishes a verified owner read (603ms)
  ✓  14 [system-chrome] › tests/company-intelligence-lab.spec.mjs:553:1 › Regression: SCN-025-016 a passed event renders as occurred and never as an upcoming catalyst (669ms)
  ✓  15 [system-chrome] › tests/company-intelligence-lab.spec.mjs:615:1 › each research branch renders one disclosure row whose header carries the disposition word (599ms)
  ✓  16 [system-chrome] › tests/company-intelligence-lab.spec.mjs:649:1 › an empty research plan renders its reason as readable copy rather than an empty block (483ms)
  ✓  17 [system-chrome] › tests/company-intelligence-lab.spec.mjs:668:1 › Regression: SCN-025-022 the outcome record shows the predecessor unmodified beside the new version (608ms)
--- omitted 7 line(s); sha256 above covers the full output ---
--- last 20 ---
  ✓  25 [system-chrome] › tests/company-intelligence-lab.spec.mjs:975:1 › Stabilize: the route writes only the shared data container and leaves a sibling tool cache intact (569ms)
  ✓  26 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1002:1 › Stabilize: repeat composition of an unchanged subject issues no further request (759ms)
  ✓  27 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1034:1 › Stabilize: the idle route runs no polling loop, no interval and no animation frame (5.1s)
  ✓  28 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1072:1 › Stabilize: a version chain that points at itself terminates instead of looping (2.4s)
  ✓  29 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1108:1 › Chaos: a background corpus paint does not close a deep dive the reader opened (5.5s)
  ✓  30 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1144:1 › the route reaches its first paint from a file:// origin with no server and no off-origin request (369ms)
  ✓  31 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1187:1 › the first paint composes with every data request still outstanding, then reconciles to the served registry (518ms)
  ✓  32 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1258:1 › every interactive control on the route is reachable and operable from the keyboard alone (1.6s)
  ✓  33 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1404:1 › Regression: SCN-027-018 every subject-carrying owner link opens its owner route on the company being read (1.9s)
  ✓  34 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1443:1 › Regression: SCN-027-014 every bare owner row renders its stated reason beside the link on both the coverage table and the dimension card (937ms)
  ✓  35 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1492:1 › Regression: SCN-027-010 the rendered reason is written with textContent and no registry-authored value reaches an attribute or an href (633ms)
  ✓  36 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1537:1 › Regression: F-AUDIT-08 every currently-valid deep-link subject still opens its company (1.2s)
  ✓  37 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1557:1 › Regression: F-AUDIT-08 a subject the shared grammar refuses never becomes the hub subject (1.8s)
  ✓  38 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1609:1 › Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it (483ms)
  ✓  39 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1697:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established (594ms)
  ✓  40 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1823:1 › Regression: BUG-018 pending readiness is withheld from the ordinary RLDATA tool-read channel (367ms)
  ✓  41 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1845:1 › Regression: BUG-018 settled readiness publishes to the ordinary RLDATA tool-read channel (1.0s)
  ✓  42 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1881:1 › Regression: BUG-018 unavailable settlement remains publishable on the ordinary RLDATA tool-read channel (467ms)

  42 passed (43.5s)
```

The suite added three Scope 4 cases and retained all 39 prior cases. It reported zero skipped or
failed cases. The pass-through request holds returned real static-server responses unchanged.

<a name="scope-4-selftest"></a>
### Repository Selftest And Provenance Contract

**Phase:** implement
**Command:** `timeout 900 node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-018 Scope 4 repository selftest 2026-08-30
$ timeout 900 node scripts/selftest.mjs
exit: 0
lines: 3906
sha256: fe3d73e406679b1946b07fd8f6ea7b494353c3d9169330b229ec1f8dc0edd593
--- first 20 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
  ✓ all pages use one identical CSP instead of drifting per page
  ✓ CSP keeps the single-file inline-script design while defaulting to self
  ✓ CSP blocks object, base-tag, and form exfiltration paths
  ✓ CSP connect-src is an explicit origin allowlist, never wildcard https
  ✓ CSP preserves fixed providers, StockAnalysis, and custom-port tailnet proxy paths
  ✓ CSP allows no open URL-forwarding relay origin
  ✓ production pages and shared runtime contain no open URL-forwarding relay chain
  ✓ no model/config-authored field reaches innerHTML without esc()
  ✓ the sink detector catches an unescaped model-authored title

Feature 004 RLFX/RLDATA foundation
  ✓ RLFX CommonJS import preserves the existing global and explicit decisionTime is deterministic
  ✓ RLFX universe is bounded closed and asserts no live source authorization
  ✓ RLDATA source envelopes preserve approved rights and clocks and reject metadata-free rows
  ✓ RLDATA schema-one bars and legacy tool reads remain compatible beside versioned envelopes
  ✓ RLDATA Twelve Data mapping: interval/symbol translate, values sort newest-first → oldest-first with UTC epochs, empty volume → null, error/malformed → null
  ✓ RLFX broad dollar keeps Broad AFE EME and proxy states separate
--- omitted 3866 line(s); sha256 above covers the full output ---
--- last 20 ---
  ✓ a registry claiming fewer ticked rows than the artifact carries FAILS too — drift in either direction is a false summary
  ✓ a claim whose scope artifact cannot be located FAILS instead of being silently skipped — an unverifiable claim is not a verified one
  ✓ the single-file bug-packet layout resolves all three of its claims — a numbered scope whose tiered DoD includes a deeper sub-heading, a sibling scope that has not started, and the packet-level cross-scope block — across the dodChecked, dodTicked and dodTotal spellings alike (3/3 agreeing)
  ✓ scope 2 ends where the cross-scope block begins rather than running to end-of-file, and `## Scope Summary` is not mistaken for a scope section because it carries no ordinal (01, 02, cross-scope)
  ✓ a `#` line inside a fenced Gherkin block is a comment rather than a heading, so it never splits a scope or ends a Definition of Done (2 real headings, 3 when fences are ignored)
  ✓ a scope already frozen in the baseline is carried as known debt rather than failing the run, so pre-existing drift in packets this change does not own cannot turn the validation path red
  ✓ freezing one scope does not license the next — the baseline is keyed on the SCOPE, not on the numbers, so a second drifting scope still FAILS while the frozen one passes
  ✓ a baseline entry whose claim now matches its artifact is reported STALE while the run still exits 0, so the frozen list can only shrink
  ✓ a scan that matches zero progress claims FAILS rather than passing vacuously — a matcher that quietly stopped matching would otherwise reproduce the exact blind spot this guard closes
  ✓ the scan read real progress claims against a present baseline, so a green verdict is a comparison rather than a matcher that stopped matching (93 claim(s) across 71 packet(s), 79 agreeing, baseline 14 entries)
  ✓ every committed progress claim resolves to a scope artifact the guard can actually read, so none of them is passing merely because nothing could check it (0 unresolvable)
  ✓ no scope progress claim disagrees with its Definition of Done outside the frozen baseline — a stale count reads as a summary of the artifact while describing a state the artifact has left (0 new, 14 frozen, 0 stale of 93 claim(s))
  ✓ SCN-011B-REG the regression matcher found at least one test declaration in tests/causal-rotation-consumers.spec.mjs — a matcher that silently stopped matching would pass this whole block vacuously (5 found)
  ✓ SCN-011B-REG every test in tests/causal-rotation-consumers.spec.mjs declares its own timeout budget, so none of them silently inherits the 30 s Playwright default that produced the intermittent red (5 budget(s) for 5 test(s))
  ✓ SCN-011B-REG every declared budget in tests/causal-rotation-consumers.spec.mjs clears the 60000 ms floor — the measured single-worker cost is 23.7 s, so anything at or near the 30 s default leaves no margin for four-worker contention (0 below floor of 5)
  ✓ SCN-011B-REG ADVERSARIAL the budget matcher detects a removed declaration, so a real regression that deletes one would turn this block red rather than leaving it green (5 → 4 after stripping one)

================================================
Research-Lab self-test: 3437 passed, 0 failed
================================================
```

The selftest directly checks the pass-through provenance header and its stale negative control. It
also checks the explicit request-entry and release gate against delay and counter mutations.

<a name="scope-4-request-gate"></a>
### Request Gate And Shared-State Integrity

**Phase:** implement
**Claim Source:** executed

The isolated receipts and the complete selftest jointly exercise the request gate. The gate is
installed before navigation. Its `entered` signal resolves inside the matching handler. The handler
then waits for the idempotent `release` signal before calling `route.continue()`.

The Scope 1, Scope 2, and pending-publication cases await request entry. They release in `finally`.
The global `afterEach()` still calls `unrouteAll({ behavior: 'ignoreErrors' })`. No fixed sleep,
request counter, `route.fulfill()`, or `route.abort()` establishes a BUG-018 observation window.

The selftest exited zero with hash
`fe3d73e406679b1946b07fd8f6ea7b494353c3d9169330b229ec1f8dc0edd593`. The isolated receipt
runner exited zero with hash
`f7dc4235702d1767666cef7bd538a82109a66d740a53c9bee0fa0ee08bc130cc`. Its targeted gate
mutations exited non-zero while the implementation and regression lanes exited zero.

<a name="scope-4-provenance"></a>
### Browser Test Provenance

**Phase:** implement
**Claim Source:** executed

The browser header now states that ordinary cases use the real ephemeral static server and
unmodified responses. It separately names annotated pass-through fault-injection cases. Those
cases use `page.route()` only to hold or delay requests and call `route.continue()` unchanged.

The `SCN-BUG-018-014` targeted break restored the stale blanket no-interception claim. That lane
exited non-zero. The implementation and regression lanes exited zero. The complete selftest also
exited zero with 3437 passes and no failures.

The exact receipt evidence is under
[Isolated RED-To-GREEN Scenario Receipts](#scope-4-red-green). The complete selftest evidence is
under [Repository Selftest And Provenance Contract](#scope-4-selftest). No test in this file calls
`route.fulfill()` or `route.abort()` for a business response.

<a name="scope-4-regression-quality"></a>
### Regression Quality Guard

**Phase:** implement
**Command:** `timeout 60 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix --verbose tests/company-intelligence-lab.spec.mjs`
**Exit Code:** 0
**Claim Source:** executed

The guard printed the absolute repository path. It is normalized below to `~/research-lab` before
storage. No other output changed.

```text
# BUG-018 Scope 4 regression quality guard 2026-08-30
$ timeout 60 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix --verbose tests/company-intelligence-lab.spec.mjs
exit: 0
lines: 16
sha256: f0cb2d3b7cb9a89673655db554e4379e66af5af5b88ca265584b35167d3b67ac
--- output ---
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Repo: ~/research-lab
  Timestamp: 2026-08-30T07:49:32Z
  Bugfix mode: true
============================================================

ℹ️  Scanning tests/company-intelligence-lab.spec.mjs
✅ Asserts the current surface in tests/company-intelligence-lab.spec.mjs (mixed inspection accepted)
✅ Adversarial signal detected in tests/company-intelligence-lab.spec.mjs

============================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 1
  Files with adversarial signals: 1
============================================================
```

<a name="scope-4-implementation-reality"></a>
### Implementation Reality Scan

**Phase:** implement
**Command:** `timeout 60 bash .github/bubbles/scripts/implementation-reality-scan.sh specs/_bugs/BUG-018-corpus-pending-window-states-absence-as-settled-fact --verbose`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-018 Scope 4 implementation reality 2026-08-30
$ timeout 60 bash .github/bubbles/scripts/implementation-reality-scan.sh specs/_bugs/BUG-018-corpus-pending-window-states-absence-as-settled-fact --verbose
exit: 0
lines: 35
sha256: 32afbca50feeceaa740f471db55387647e6f219712239c11ea128083cc61b9a2
--- output ---
ℹ️  INFO: Resolved 2 implementation file(s) to scan

--- Scan 1: Gateway/Backend Stub Patterns ---

--- Scan 1B: Handler / Endpoint Execution Depth ---

--- Scan 1C: Endpoint Not-Implemented / Placeholder Responses ---

--- Scan 1D: External Integration Authenticity ---

--- Scan 2: Frontend Hardcoded Data Patterns ---

--- Scan 2B: Sensitive Client Storage ---

--- Scan 3: Frontend API Call Absence ---

--- Scan 4: Prohibited Simulation Helpers in Production ---

--- Scan 5: Default/Fallback Value Patterns ---

--- Scan 6: Live-System Test Interception ---

--- Scan 7: IDOR / Auth Bypass Detection (Gate G047) ---

--- Scan 8: Silent Decode Failure Detection (Gate G048) ---

============================================================
  IMPLEMENTATION REALITY SCAN RESULT
============================================================

  Files scanned:  2
  Violations:     0
  Warnings:       0

🟢 PASSED: No source code reality violations detected
```

<a name="scope-4-pii"></a>
### PII Scan

**Phase:** implement
**Command:** `timeout 60 bash .github/bubbles/scripts/pii-scan.sh`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-018 Scope 4 PII scan 2026-08-30
$ timeout 60 bash .github/bubbles/scripts/pii-scan.sh
exit: 0
lines: 4
sha256: a3f5f7c6941af727acf047638bf1140d5ea3251e55b18fb9c1ed2c4e126d6879
--- output ---
7:49AM INF 0 commits scanned.
7:49AM INF scan completed in 9.67ms
7:49AM INF no leaks found
🫧 pii-scan: clean.
```
