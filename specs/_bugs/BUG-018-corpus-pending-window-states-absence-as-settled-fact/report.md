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
`parse_ui.py`, `run_accessibility_map.py`, `temp_script.scpt`,
`tests/zz-probe-focusable.spec.mjs`). None was staged, deleted, or modified. The staged set was
listed explicitly and every entry verified to be inside this packet directory before committing;
the check and its result are recorded in the commit.

`specs/025-company-multi-horizon-intelligence-lab/report.md` was deliberately left unedited. Its
`### Chaos Evidence` section is the record of the phase that found this defect and correctly
declined to file it across a staging boundary; editing it now would falsify that record. The
routing it requested is discharged by this packet's existence.

## Scope 1 Delivery Evidence — bubbles.implement, 2026-08-23

Scope 1 only. Scopes 2 and 3 remain Not Started and untouched: Scope 2 is blocked on the product
decision in `design.md` open question 1, and Scope 3 is blocked on Scope 2. Neither the coverage
sentence at `company-intelligence-lab.html:1460-1462` nor the horizon cards at
`company-intelligence-lab.html:1085` were edited, which is the boundary that separates Scope 1
from Scope 2.

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
    NEW-MISSING tests/zz-probe-focusable.spec.mjs (1 reference site(s))

# HEAD plus only this scope's two files
$ node scripts/selftest.mjs
MINE_EXIT=0
Research-Lab self-test: 3404 passed, 0 failed
```

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
`NEW-MISSING` line names `tests/zz-probe-focusable.spec.mjs`, referenced at `report.md:266` of
this very packet. That path is untracked debris belonging to another session, so the reference
passes today only because the debris happens to exist on this machine. When it is cleaned up the
selftest's spec-referenced-test-path scan will fail on this packet. It is recorded here as an open
finding for the packet owner; it is outside Scope 1 and was not changed.

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

## What Was Not Established

- **A printed number drifting behind the stale attribute.** Facet 2's lie is observed directly. A
  case where the stale `loaded` paint prints a count that later changes was not produced: both
  subjects tried settle at the count they showed during the apply. It is reachable by construction
  for any subject whose settled account differs from its empty-cache account, and `MSFT` is such a
  subject, but that specific pairing was not run. Recorded as reachable-by-argument.
- **Behaviour under `file://`.** All observations were made over `http://`. The route is designed to
  degrade honestly under `file://`, where the corpus resolves to `unavailable` rather than staying
  `pending`; that path was not exercised here and Scope 2 must not assume it.
- **Frequency on a real network.** The window's width was measured only against a local static
  server with and without an artificial hold. No production timing was gathered.
- **Which remedy is correct.** `design.md` enumerates three and selects none. The choice changes
  what a reader sees on first paint of every load and is a product decision.
- **Facet 1.** Scope 1 closes facet 2 only. The pending window still prints a definite absence
  count with no user-visible readiness wording. Scope 2 owns that and remains blocked.

## Completion Statement

**Scope 1 is delivered. Scopes 2 and 3 are Not Started, and the packet remains `in_progress`.**
Six of six Scope 1 Definition of Done items are ticked with the evidence above; every Scope 2 and
Scope 3 item is untouched and unticked, which is the accurate representation of the work.
`certification.status` equals `status`, and `certification.certifiedCompletedPhases` is empty,
because phase certification belongs to `bubbles.validate` and no independent party re-derived the
evidence above.

Facet 2 is closed: `data-corpus-status` now describes the subject on screen, so a consumer
following the committed suite's readiness convention is protected during a manual apply again.
Facet 1 is open and is Scope 2's, because it turns on a product decision about the route's first
impression that is not agent-dischargeable.

The root cause **is** established, unlike some sibling packets: the mechanism is read from the
shipped source, the ordering that produces it is unconditional rather than racy, and both facets
were reproduced. What remains open is the remedy choice for facet 1, not the diagnosis.

No branch was pushed.

**Educational research only. Not investment advice.**
