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

## What Was Not Established

- **A printed number drifting behind the stale attribute.** Facet 2's lie is observed directly. A
  case where the stale `loaded` paint prints a count that later changes was not produced: both
  subjects tried settle at the count they showed during the apply. It is reachable by construction
  for any subject whose settled account differs from its empty-cache account, and `MSFT` is such a
  subject, but that specific pairing was not run. Recorded as reachable-by-argument.- **Behaviour under `file://`.** All observations were made over `http://`. The route is designed to
  degrade honestly under `file://`, where the corpus resolves to `unavailable` rather than staying
  `pending`; that path was not exercised here and Scope 2 must not assume it.
- **Frequency on a real network.** The window's width was measured only against a local static
  server with and without an artificial hold. No production timing was gathered.
- **Which remedy is correct.** `design.md` enumerates three and selects none. The choice changes
  what a reader sees on first paint of every load and is a product decision.

## Completion Statement

This packet is **filed and unstarted**. Three scopes are Not Started and zero Definition of Done
items are ticked, which is the accurate representation of the work. `status` is `in_progress` and
`certification.status` equals it. `certification.certifiedCompletedPhases` is empty, because phase
certification belongs to `bubbles.validate` and no independent party re-derived the evidence above.

The root cause **is** established, unlike some sibling packets: the mechanism is read from the
shipped source, the ordering that produces it is unconditional rather than racy, and both facets
were reproduced. What remains open is the remedy choice, not the diagnosis.

No shipped file, test, configuration or workflow was modified. No branch was pushed.

**Educational research only. Not investment advice.**
