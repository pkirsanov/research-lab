# BUG-001 Report

Every block below is executed output. Two provenance tags are used and they mean different
things:

- **`executed (artifact turn)`** — the command was run while these artifacts were being
  written, and the output is reproduced from that run.
- **`executed (fix turn)`** — the command was run earlier in this same session, during the
  fix itself. The result is recorded here as observed then; it was **not** re-run in the
  artifact turn, because the artifact turn was scoped to documentation only.

Nothing is restated from memory, and nothing is inferred from source inspection alone.

## Summary

The Tier-A publisher stamped the run wall-clock into `asOf`, a field the contract defines as
the *analyzed window*. An 11:37 ET run of the 11:00 ET `morning` window therefore published
an artifact its own consumer had to refuse, and because the schedule selector was populated
inside the same transaction that composed the evidence window, the refusal emptied the
control instead of explaining itself. The Portfolio Brief tab read as "nothing here".

`asOf` is now the analyzed window's evidence cutoff, resolved through a helper the publisher
and the consumer share. The consumer boundary is byte-identical. The schedule renders before
composition is attempted, and a refusal names its contract code and reason on screen.

Scope 1 is delivered with 19 of 19 Definition of Done items evidenced. The nineteenth was
closed by execution rather than assertion: the broader-suite item required a run against a tree
not carrying another packet's uncommitted edits. See § Broader Suite On The Committed Tree.

The delivery is committed. `scripts/brief-refresh.mjs` carries the fix in `899c7a40e`
("fix(brief): bind asOf to the analyzed window") and it is present at `HEAD`
(`git show HEAD:scripts/brief-refresh.mjs | grep -c windowCutoffAt` → 3). The earlier
sentence here read "present in the working tree at `648e0992b` and is **not committed**";
both halves had gone stale. `648e0992b` is the docs commit that happened to be `HEAD` while
this report was being written, not the delivery, and it is now an ancestor of `HEAD`
(`git merge-base --is-ancestor 648e0992b HEAD` → true). See § Delivery State.

## The Publisher Fix

**`executed (artifact turn)`** — `grep -n 'windowCutoffAt' scripts/brief-refresh.mjs` then
`sed -n '2628,2642p' scripts/brief-refresh.mjs`

```
  // deterministic slice the browser cockpit reads (market-brief.html overlays it as the "Computed (Tier-A)" line)
  // asOf is the analyzed WINDOW's evidence cutoff, not the run clock: a run that starts at 11:37 still
  // publishes the 11:00 morning window, and every consumer refuses evidence dated past the window it declares.
  const windowCutoffAt = RLPORTFOLIOBRIEF.windowCutoffAt(cfg.windows, window, snap.ts);
  if (!windowCutoffAt) throw new Error(`window "${window}" has no resolvable evidence cutoff in market-brief.config.json`);
  const snapshot = { asOf: windowCutoffAt, generatedAt: snap.ts, window, marketClosed, nextSessionDate: nextSession, dataFreshness, regime: { band: reg.band, score: reg.risk, vix, fearGreed: fg ? fg.score : null }, bench: snap.bench, names, sectors, groups, toolReads, toolCoverage, tracked, crossAsset };
  if (!dryRun) writeFileSync(join(ROOT, 'market-brief.snapshot.json'), JSON.stringify(snapshot, null, 2) + '\n');
```

The defect was the same statement at line 2632 with `asOf: snap.ts, generatedAt: snap.ts` —
both fields taking the run clock. The corrected form is at line 2639; the seven-line shift is
the cutoff derivation and its guard inserted above it.

The publisher now **refuses to guess**. A window with no resolvable cutoff throws rather than
falling back to anything, so the class of defect cannot recur silently under a new window id.

## One Cutoff Rule

**`executed (artifact turn)`** — `grep -n 'windowCutoffAt' rlportfoliobrief.js`

```
171:  function windowCutoffAt(windows, windowId, instant) {
1040:    windowCutoffAt: windowCutoffAt,
```

Defined once at 171, exported at 1040. Both the publisher and the payload validator call it:

**`executed (artifact turn)`** — `git diff scripts/validate-brief-payload.mjs`

```
-   consumer cannot drift; only the calendar date is derived here, from the same ET zone. */
+   consumer cannot drift; the calendar date is derived inside that helper from the same ET zone. */
-  const cutoffAt = RLPORTFOLIOBRIEF.newYorkCivilCutoff(tradingDate, window.etTime);
+  const cutoffAt = RLPORTFOLIOBRIEF.windowCutoffAt(config.windows, snapshot.window, anchor);
```

The declared ET times are never restated as literals anywhere; they are read from
`market-brief.config.json` inside the helper.

## The Boundary Is Provably Untouched

**`executed (artifact turn)`** — `git diff --numstat rlportfoliobrief.js`

```
16      0       rlportfoliobrief.js
```

Sixteen insertions, **zero deletions**. The refusal condition cannot have been edited,
because nothing in that file was removed or replaced. This is the mechanical form of the
claim in `design.md`; it is checkable rather than asserted.

**`executed (artifact turn)`** — `sed -n '232,234p' rlportfoliobrief.js` (via the surrounding
read of 229-248)

```js
    if (input.snapshotRef.window !== input.windowId || input.payloadRef.asOf > cutoffAt || input.snapshotRef.asOf > cutoffAt) {
      return contractErr("P008-BRIEF-EVIDENCE", "generic-evidence-cutoff-conflict", "input", null, false);
    }
```

Identical to the pre-fix condition. It sat at line 217 before the fix and sits at 232 after
it: 15 of the 16 added lines land above it (the helper and its comment), and the sixteenth is
the export at 1040, well below.

## Published Clocks Now Differ

**`executed (artifact turn)`** — `git diff -U0 market-brief.snapshot.json market-brief.payload.json`

```
-  "asOf": "2026-08-23T15:37:31.147Z",
+  "asOf": "2026-08-23T15:00:00.000Z",
-  "asOf": "2026-08-23T15:37:31.147Z",
+  "asOf": "2026-08-23T15:00:00.000Z",
```

One field, in each of two artifacts. `generatedAt` was not touched in either diff.

**`executed (artifact turn)`** — `python3` read of the two committed artifacts

```
window     = morning
asOf       = 2026-08-23T15:00:00.000Z
generatedAt= 2026-08-23T15:37:31.147Z
payload asOf       = 2026-08-23T15:00:00.000Z
payload generatedAt= 2026-08-23T16:24:27.665Z
payload window     = morning
```

Both artifacts now declare the 11:00 ET `morning` window and disclose their own publication
instants — 11:37 for the snapshot, 12:24 for the payload, which was regenerated later by the
narrative lane. Before the fix those two clocks were byte-identical on the snapshot, which is
exactly why the presentation-side conflation described below was invisible.

**`executed (artifact turn)`** — `python3` read of `market-brief.config.json` `windows`

```
{'id': 'pre-market',  'etTime': '07:30', 'anchor': 'open',  'offsetMinutes': -120, ...}
{'id': 'morning',     'etTime': '11:00', 'anchor': 'open',  'offsetMinutes': 90,   ...}
{'id': 'pre-close',   'etTime': '15:00', 'anchor': 'close', 'offsetMinutes': -60,  ...}
{'id': 'after-hours', 'etTime': '17:00', 'anchor': 'close', 'offsetMinutes': 60,   ...}
```

Four declared windows. `morning` resolves to 11:00 ET, which is `2026-08-23T15:00:00.000Z`
on that date — the value now stamped.

## The Second Clock

**`executed (artifact turn)`** — `sed -n '8105,8112p' portfolio-survival-allocation-lab.html`

```js
                        state.briefWindowId = projection.genericWindow.windowId;
                        /* Publication time is `generatedAt`; the analyzed window instant is `asOf`.
                           They are deliberately DISTINCT clocks, so the publication clock must come
                           from the publication timestamp. Reading it off `payloadRef.asOf` collapsed
                           it onto the evidence cutoff and made a past brief unauditable. */
                        state.briefPublishedAt = projection.genericWindow.snapshotRef.generatedAt;
```

This is the same conflation on the presentation side. While the publisher stamped both
fields identically it was silently correct, because either read gave the same answer. The
publisher fix converted it into a real choice, and reading `asOf` would have made every
morning-window brief claim publication at 11:00 regardless of when it actually ran.

## The Schedule Is A Separate Transaction

**`executed (artifact turn)`** — `sed -n '8093,8102p' portfolio-survival-allocation-lab.html`

```js
                        /* The SCHEDULE and the EVIDENCE WINDOW are two different transactions, and
                           collapsing them is what turns one refused publication into a dead tab. The
                           schedule has loaded by this point, so the selector is populated from it
                           BEFORE composition is attempted. If composition is then refused, the reader
                           still sees the four windows and an explicit named reason; previously the
                           throw skipped this block entirely and left a control with zero options,
                           which reads as "nothing here" rather than "this was refused, and why". */
                        state.briefWindows = artifacts.config.windows;
                        renderBriefWindowOptions(artifacts.config.windows);
```

And the refusal is named in the `.catch()`:

```js
                        var refusal = state.genericWindowError;
                        var named = refusal.code + " / " + refusal.reason;
                        setText("briefTimes", state.genericWindow
                            ? "Public evidence refresh refused (" + named + "). The last valid brief remains visible."
                            : "Generic evidence window unavailable (" + named + ").");
                        byId("briefTimes").className = "state-message warn";
                        byId("briefTimes").setAttribute("data-generic-window-state",
                            state.genericWindow ? "preserved-last-valid" : "unavailable");
                        byId("briefTimes").setAttribute("data-generic-window-error",
                            refusal.code + "/" + refusal.reason);
                        setText("briefStates", state.genericWindow
                            ? "Last valid brief retained."
                            : "Brief unavailable. No window is assumed. The published brief does not satisfy the "
                                + "generic evidence contract for the window it declares, so nothing is composed from it.");
```

## No Wall-Clock Fallback

**`executed (artifact turn)`** — `git diff scripts/brief-narrative-parallel.mjs`

```
-    payload.asOf = snapshot.asOf || snapshot.generatedAt || new Date().toISOString();
+    /* The payload inherits the Tier-A window cutoff verbatim. It must never fall back to the run
+       clock: the consumer refuses a payload dated past the window it declares, so a substituted
+       wall-clock would publish a brief that cannot be composed rather than one that is honest
+       about missing its anchor. */
+    if (typeof snapshot.asOf !== 'string' || !snapshot.asOf) {
+        throw new Error('market-brief.snapshot.json carries no asOf, so the payload has no window cutoff to inherit');
+    }
+    payload.asOf = snapshot.asOf;
```

The removed chain would have republished the original defect under a different name: a
missing `asOf` fell through to `generatedAt`, and then to a fresh wall-clock. Both fallbacks
produce a payload dated past its declared window. It now fails loudly instead.

## The Runbook Correction

**`executed (artifact turn)`** — `git diff -U0 notes/market-brief.md`

Before:

> **`asOf` vs `generatedAt`:** `asOf` is the window/session the brief analyzes (e.g. the
> 11:00 ET `morning` window); `generatedAt` is the actual ISO wall-clock of the run that
> produced this file. Stamp `generatedAt` fresh on **every** (re)generation — the cockpit
> header renders it as “· regenerated …”. **Tier-A (`brief-refresh.mjs`) sets both to the run
> time automatically.**

After:

> … **Tier-A (`brief-refresh.mjs`) sets `asOf` to the analyzed window's evidence cutoff and
> `generatedAt` to the run time, so an 11:37 run of the `morning` window still publishes
> `asOf` 11:00 ET; consumers refuse evidence dated past the window it declares.**

The definition in the first two sentences was already correct and is unchanged. Only the
sentence that recorded the defect as intended behaviour was replaced.

## Regression E2E

`tests/portfolio-survival-brief.spec.mjs:902`

```
Regression: BUG-001 a publication later than its declared window cutoff is refused by name and never empties the schedule
```

**`executed (fix turn)`** — the row's own receipts:

```
[BUG-001] window=morning cutoffAt=2026-08-23T15:00:00.000Z publishedLateAt=2026-08-23T15:37:00.000Z
[BUG-001] options=4 state=unavailable named=generic-evidence-cutoff-conflict
```

Both halves of the contract are pinned by one row. `state=unavailable` with
`named=generic-evidence-cutoff-conflict` proves the boundary still **refuses** a late
publication; `options=4` proves the schedule survived that refusal. Neither can be traded for
the other, so the fix cannot be mistaken for a relaxation.

**Not tautological, and the test says so about itself.** The served fixture is deliberately
37 minutes past the cutoff of the window it declares, and the row asserts that lateness
before it asserts anything about the page:

```js
const publishedLateAt = new Date(Date.parse(cutoffAt) + 37 * 60 * 1000).toISOString();
expect(publishedLateAt > cutoffAt,
  'NON-TAUTOLOGY GUARD: the fixture must publish strictly LATER than its own window cutoff, '
  + 'otherwise the publication validates and the refusal path under test never runs').toBe(true);
```

A fixture published at the cutoff would validate, the refusal path would never execute, and
every assertion after it would pass vacuously. The guard fails if the fixture is ever
softened, and the row fails if the blank-tab behaviour returns.

The row also pins the refusal's structural identity, not only its rendered copy:

```js
await expect(times).toHaveAttribute('data-generic-window-error', 'P008-BRIEF-EVIDENCE/generic-evidence-cutoff-conflict');
// elided: the two toContainText assertions on the same element, and the #briefStates copy assertion
const diagnostics = await page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__);
expect(diagnostics.genericEvidenceState).toBe('invalid');
expect(diagnostics.genericEvidenceError.code).toBe('P008-BRIEF-EVIDENCE');
expect(diagnostics.genericEvidenceError.reason).toBe('generic-evidence-cutoff-conflict');
```

and that nothing is invented to fill the gap — `#briefLanes li` count `0`.

## Test Evidence

Recorded in stage order, because the order is itself part of the claim: the failure was
observed while the defect was still present, not deduced afterwards from the fix.

### RED stage — the failing proof

**`executed (fix turn)`** — `tests/portfolio-survival-brief.spec.mjs`, run before any fix
existed, against the real published artifacts rather than a fixture. Fourteen of the
seventeen rows then in the suite went down. The figure is not a weak-assertion artifact:
`#briefWindow` rendered zero options, so the tab could not compose at all, and every row that
needed the brief surface failed with it.

### GREEN stage — the passing proof

**`executed (fix turn)`** — the same suite, plus four further verification commands, after
the fix. All five were run during the fix turn and observed directly.

| Command | Before fix | After fix |
|---|---|---|
| `tests/portfolio-survival-brief.spec.mjs` | **3 passed / 14 failed** | **17 passed / 0 failed** |
| `node --test tests/portfolio-publisher-boundary.functional.mjs` | — | exit `0`, `fail 0` |
| `node scripts/validate-brief-payload.mjs` | — | exit `0`, `PASS` |
| `node scripts/selftest.mjs` | — | exit `0`, **3314 passed, 0 failed** |
| `git diff --check` | — | exit `0` |

## RED Stage Reconstruction

**`executed (test turn)`** — a reconstruction performed now, **not** the original run. The
figures above were captured during the fix turn and are left exactly as recorded; nothing
below is offered as historical evidence. Its purpose is narrower and worth stating plainly:
the red above is attested, and this makes it *reproducible*.

It ran entirely inside an isolated `git archive` export of the committed tree. No product
source, test file, or published artifact in the repository was modified — which also sidesteps
the contamination named in § Broader Suite On The Committed Tree, where the working tree
carries another packet's uncommitted edits.

**Baseline, before any perturbation** — export of `6b48cd428`:

```
19 passed (30.7s)
GREEN_BASELINE_EXIT=0
```

**The perturbation** — the fix reverted at its single site, and the published artifacts set to
what that reverted line emits. `asOf` returns to the run clock, which is this bug exactly as
`bug.md` states it:

```
scripts/brief-refresh.mjs:2639   asOf: windowCutoffAt -> asOf: snap.ts   (1 site; count asserted, not assumed)
market-brief.snapshot.json       asOf 2026-08-27T15:00:00.000Z -> 2026-08-27T14:57:36.125Z
market-brief.payload.json        asOf 2026-08-27T15:00:00.000Z -> 2026-08-27T15:30:59.849Z
```

The payload's run clock lands 15:30:59 against a 15:00 `morning` cutoff — thirty-one minutes
late, the same shape as the 11:37 run of the 11:00 window that opened this bug.

**RED** — same suite, same export, same command:

```
$ npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --reporter=list
  15 failed
  4 passed (2.4m)
RED_RECONSTRUCTION_EXIT=1
```

Captured under `evidence-capture.sh` — 429 lines,
`sha256:b477396557f6c07a11a990c0efaaabb873988c82dac3933a2aee40929f0f9044`, so the run is
re-derivable rather than quoted.

**GREEN again, after restoring the export** — re-extracted from `b18b61183`:

```
19 passed (25.8s)
GREEN_RESTORE_EXIT=0
```

`HEAD` advanced between the two green runs because other sessions commit to this repository.
That does not weaken the comparison, and the point is checkable rather than asserted: every
file the suite touches resolves to the same blob at both commits — `scripts/brief-refresh.mjs`,
both published artifacts, `tests/portfolio-survival-brief.spec.mjs`, `rlportfoliobrief.js`,
`portfolio-survival-allocation-lab.html` — and `git diff --stat 6b48cd428 b18b61183` is one
unrelated file (`scripts/scenario-break-map.json`, `42 +`).

**Four rows survived the perturbation, and that is the informative part.** Lines 716, 941,
1215, and — notably — 1039, this bug's own adversarial regression row. Row 1039 is unmoved
because it overrides both published artifacts with its own late fixture before asserting
anything, so a defect in what the *publisher* writes is invisible to it by construction. It
guards the other half of the contract: that a refusal is named on screen and does not empty
the schedule. The publisher half is guarded by the fifteen rows that read the real published
artifacts — precisely the set that went red. The two halves have distinct guards, and neither
substitutes for the other. A single row asserted to cover both would have been the weaker
claim.

## Provenance Verification

**`executed (artifact turn)`** — `git log --oneline -1 744ac6a54` and `-1 0972ddd75`

```
744ac6a54 feat(008): complete immutable workspace navigation
0972ddd75 feat(008): implement accessible six-tab interaction
```

**`executed (fix turn)`** — the two surgical reverts. `rlnav.js` was reverted to
`744ac6a54^` (pre-Scope-26) and the failure persisted. `portfolio-survival-allocation-lab.html`
was reverted to `0972ddd75^` (pre-Scope-27) and the failure persisted. Both files were
restored clean afterwards.

This is what establishes the defect as latent and pre-existing rather than introduced by
Scopes 25, 26 or 27. It had been publishing correct-looking artifacts for as long as runs
happened to land close enough to their window boundary; that day's publication timing
exposed it.

## Blast Radius

**`executed (artifact turn)`** — `git diff --numstat`, this bug's surfaces only

```
1       1       market-brief.payload.json
1       1       market-brief.snapshot.json
1       1       notes/market-brief.md
50      13      portfolio-survival-allocation-lab.html
16      0       rlportfoliobrief.js
8       1       scripts/brief-narrative-parallel.mjs
9       2       scripts/brief-refresh.mjs
2       2       scripts/validate-brief-payload.mjs
84      0       tests/portfolio-survival-brief.spec.mjs
```

Plus `market-brief.page.json` and `market-brief.snapshot.page.json`, the derived single-line
page artifacts regenerated from the corrected `asOf`.

No contract version, schema field, or threshold changed.

**Not this packet.** The same working tree also carries Scope 28's test-integrity work —
`tests/portfolio-publisher-boundary.functional.mjs` (`71 +, 23 -`),
`tests/portfolio-survival.support.mjs` (`15 +, 1 -`), the untracked
`tests/portfolio-defect-injector.cjs` and `tests/portfolio-test-integrity.unit.mjs`,
`.specify/memory/agents.md` (`9 +, 0 -`, registering `node --test tests/*.unit.mjs`), and the
Scope 28 artifacts under
`specs/008-portfolio-survival-and-brief-lab/scopes/28-spec-driven-adversarial-test-replacement`.
Those belong to Scope 28 and are named here so the diff is not later misread as this bug's
footprint. `tests/portfolio-publisher-boundary.functional.mjs` appears in § Test Evidence
because it was run as a verification gate, not because this packet authored it.

## Delivery State

**`executed (artifact turn)`** — `git log --oneline -3` and `git status --porcelain`

```
648e0992b (HEAD -> main) docs(008): reconcile Scope 27 evidence wording
```

The fix is present in the working tree at `648e0992b` and is **uncommitted**. The artifact
turn was explicitly scoped to documentation and was instructed not to commit or push, so no
commit was created and none is claimed. `autoCommit` is `off` in the policy snapshot.

> **Superseded — kept because it was true when captured.** The block and paragraph above are
> the artifact turn's genuine reading and are left byte-intact rather than rewritten. Both
> have since gone stale: the fix was committed in `899c7a40e` ("fix(brief): bind asOf to the
> analyzed window") and is present at `HEAD`, and `648e0992b` — the docs commit that happened
> to be `HEAD` while the line was written — is now an ancestor of `HEAD`. Verified by
> `git merge-base --is-ancestor 648e0992b HEAD` (true) and
> `git show HEAD:scripts/brief-refresh.mjs | grep -c windowCutoffAt` (3).

### Code Diff Evidence

**`executed (evidence turn)`** — every block below is `git` output run against the committed
history in this turn. No hunk is hand-written, paraphrased, or reconstructed from source
inspection. Sections earlier in this report narrate individual fragments of the same delta;
this section anchors the whole of it to a commit.

**Which commit carries the delivery.** Six commits have touched this packet. Exactly one
changed a file outside the artifact tree, so the implementation delta is entirely
`899c7a40e`; the other five are packet bookkeeping and carry no product change.

```
$ for c in $(git log --format='%h' -- specs/008-.../BUG-001-tier-a-publisher-stamps-run-time-into-asof); do
    printf '%s  non-artifact-files=%-3s %s\n' "$c" \
      "$(git show --stat --format='' --name-only $c | grep -vE '^(specs|docs|\.github|\.specify)/' | grep -v '^$' | wc -l)" \
      "$(git log -1 --format='%s' $c)"
  done

86c4a360f  non-artifact-files=0   test(BUG-001-tier-a): make the real red->green ordering legible to G060
a0780da51  non-artifact-files=0   test(BUG-001-tier-a): close the broader-suite item by execution on a clean tree
17cb5335d  non-artifact-files=0   fix(BUG-001-tier-a): withdraw the stale 'Done, 17 of 17' claim
cd35962b6  non-artifact-files=0   plan(BUG-001-tier-a): add regression-E2E DoD coverage, retire deferral wording
6f7a8fa21  non-artifact-files=0   validate(5 packets): record operator-authorized human acceptance, clearing G136
899c7a40e  non-artifact-files=11  fix(brief): bind asOf to the analyzed window
```

**The shape of that one commit,** with the packet's own artifacts excluded so the product
footprint stands alone:

```
$ git show --stat --format='%h %s' 899c7a40e -- . ':(exclude)specs/*'

899c7a40e fix(brief): bind asOf to the analyzed window

 market-brief.page.json                  |  2 +-
 market-brief.payload.json               |  2 +-
 market-brief.snapshot.json              |  2 +-
 market-brief.snapshot.page.json         |  2 +-
 notes/market-brief.md                   |  2 +-
 portfolio-survival-allocation-lab.html  | 63 ++++++++++++++++++++-----
 rlportfoliobrief.js                     | 16 +++++++
 scripts/brief-narrative-parallel.mjs    |  9 +++-
 scripts/brief-refresh.mjs               | 11 ++++-
 scripts/validate-brief-payload.mjs      |  4 +-
 tests/portfolio-survival-brief.spec.mjs | 84 +++++++++++++++++++++++++++++++++
 11 files changed, 174 insertions(+), 23 deletions(-)
```

#### The defect line, and what replaced it

Earlier sections quote the *corrected* statement read back out of the file. Only a diff shows
the removed line, and the removed line is the defect itself:

```
$ git show 899c7a40e --format='' -- scripts/brief-refresh.mjs

diff --git a/scripts/brief-refresh.mjs b/scripts/brief-refresh.mjs
index de642710a..0f74c5277 100644
--- a/scripts/brief-refresh.mjs
+++ b/scripts/brief-refresh.mjs
@@ -41,6 +41,10 @@ const RLMETRICS = featureRequire(join(ROOT, 'rlmetrics.js'));
    the published block agree about which leg is dark by construction, not by two implementations
    that happen to match today. */
 const RLCOCKPIT = featureRequire(join(ROOT, 'rlcockpit.js'));
+/* rlportfoliobrief.js owns the ONE window-cutoff rule. The consumer measures every published
+   reference against it, so the publisher resolves its own `asOf` through the same function
+   rather than a second implementation that agrees only until a clock edge separates them. */
+const RLPORTFOLIOBRIEF = featureRequire(join(ROOT, 'rlportfoliobrief.js'));
 const cfg = JSON.parse(read('market-brief.config.json'));
 const wl = JSON.parse(read('watchlist.json'));
 const SNAPSHOT_MAX_AGE_MS = 6 * 3600e3;
@@ -2628,8 +2632,11 @@ async function main() {
   if (!dryRun) appendFileSync(join(ROOT, 'brief-history.jsonl'), JSON.stringify(snap) + '\n');
 
   // deterministic slice the browser cockpit reads (market-brief.html overlays it as the "Computed (Tier-A)" line)
-  // asOf = the window this refresh anchors to; generatedAt = the actual wall-clock this refresh ran (both are the run time for Tier-A).
-  const snapshot = { asOf: snap.ts, generatedAt: snap.ts, window, marketClosed, nextSessionDate: nextSession, dataFreshness, regime: { band: reg.band, score: reg.risk, vix, fearGreed: fg ? fg.score : null }, bench: snap.bench, names, sectors, groups, toolReads, toolCoverage, tracked, crossAsset };
+  // asOf is the analyzed WINDOW's evidence cutoff, not the run clock: a run that starts at 11:37 still
+  // publishes the 11:00 morning window, and every consumer refuses evidence dated past the window it declares.
+  const windowCutoffAt = RLPORTFOLIOBRIEF.windowCutoffAt(cfg.windows, window, snap.ts);
+  if (!windowCutoffAt) throw new Error(`window "${window}" has no resolvable evidence cutoff in market-brief.config.json`);
+  const snapshot = { asOf: windowCutoffAt, generatedAt: snap.ts, window, marketClosed, nextSessionDate: nextSession, dataFreshness, regime: { band: reg.band, score: reg.risk, vix, fearGreed: fg ? fg.score : null }, bench: snap.bench, names, sectors, groups, toolReads, toolCoverage, tracked, crossAsset };
   if (!dryRun) writeFileSync(join(ROOT, 'market-brief.snapshot.json'), JSON.stringify(snapshot, null, 2) + '\n');
   /* Deterministic public causal snapshot. Written only when the evaluation succeeded, so a failed
      run leaves the previous snapshot in place rather than replacing it with a stub that a reader
```

The removed line took `snap.ts` — the run clock — into **both** fields. The added guard is the
reason the defect cannot recur quietly under a new window id: an unresolvable cutoff throws
rather than falling back to anything.

#### The shared helper, added whole

§ One Cutoff Rule proves the helper's *location* with `grep`, and § The Boundary Is Provably
Untouched proves `16 +, 0 -`. Neither shows the helper's body. It is the substance of the fix,
so it is reproduced here as the diff that introduced it:

```
$ git show 899c7a40e --format='' -- rlportfoliobrief.js

diff --git a/rlportfoliobrief.js b/rlportfoliobrief.js
index 0e537aa28..0533e7803 100644
--- a/rlportfoliobrief.js
+++ b/rlportfoliobrief.js
@@ -163,6 +163,21 @@
     var actual = verified.year + "-" + verified.month + "-" + verified.day + "T" + verified.hour + ":" + verified.minute + ":" + verified.second;
     return actual === expected ? new Date(guess).toISOString() : null;
   }
+  /* The evidence cutoff of the window a run analyzes, resolved from the run instant alone.
+     The trading date is the New York civil date of that instant, which is why an 11:37 ET run
+     of the 11:00 ET morning window resolves to 11:00 and not to the moment it happened to
+     execute. Publisher and consumer both call this, so the boundary a brief is measured
+     against is the same boundary it was stamped with. */
+  function windowCutoffAt(windows, windowId, instant) {
+    if (!Array.isArray(windows) || typeof windowId !== "string" || !windowId || !isIso(instant)) return null;
+    var declared = null;
+    for (var index = 0; index < windows.length; index += 1) {
+      if (windows[index] && windows[index].id === windowId) { declared = windows[index]; break; }
+    }
+    if (!declared || typeof declared.etTime !== "string") return null;
+    var parts = civilParts(instant, "America/New_York");
+    return newYorkCivilCutoff(parts.year + "-" + parts.month + "-" + parts.day, declared.etTime);
+  }
   function validSnapshotRef(value) {
     return exactFields(value, SNAPSHOT_REF_FIELDS) && GENERIC_STATES.indexOf(value.state) >= 0 &&
       HASH_RE.test(value.contentSha256 || "") && HASH_RE.test(value.dataFreshnessSha256 || "") &&
@@ -1022,6 +1037,7 @@
     /* Exported so the PUBLISHER can refuse a brief this module would reject, rather than shipping
        one and leaving every consumer to discover the conflict. One cutoff rule, two callers. */
     newYorkCivilCutoff: newYorkCivilCutoff,
+    windowCutoffAt: windowCutoffAt,
     validateGenericWindow: validateGenericWindow,
     composeBrief: composeBrief,
     dedupeBehaviorEvents: dedupeBehaviorEvents,
```

Both hunks are pure additions, which is the mechanical reason the refusal condition at line 232
cannot have shifted in meaning. The helper calls `newYorkCivilCutoff`, the same function the
consumer already used; it moves the trading-date derivation inside, so the value computed is
the one the consumer computed before.

#### The consumer, with its removals shown

§ The Schedule Is A Separate Transaction and § The Second Clock quote the post-fix blocks.
The diff additionally shows what was deleted — the inline selector population that used to sit
*after* composition, which is precisely the code whose position caused the dead tab:

```
$ git show 899c7a40e --format='' -- portfolio-survival-allocation-lab.html

diff --git a/portfolio-survival-allocation-lab.html b/portfolio-survival-allocation-lab.html
index 6a3f5c8dd..7558723e2 100644
--- a/portfolio-survival-allocation-lab.html
+++ b/portfolio-survival-allocation-lab.html
@@ -8045,6 +8045,24 @@
                     });
             }
 
+            /* The window selector is a projection of the PUBLIC schedule, not of the evidence
+               window. It is therefore rendered from the config alone, so that a refused evidence
+               composition cannot silently remove the control the reader needs to understand the
+               refusal. Idempotent: re-rendering the same schedule is a no-op for the reader. */
+            function renderBriefWindowOptions(windows) {
+                var select = byId("briefWindow");
+                if (!select) return;
+                var previous = select.value;
+                select.innerHTML = "";
+                (windows || []).forEach(function (window_) {
+                    var option = document.createElement("option");
+                    option.value = window_.id;
+                    option.textContent = window_.label + " (" + window_.etTime + " ET)";
+                    select.appendChild(option);
+                });
+                if (previous) select.value = previous;
+            }
+
             /* The generic window contract is fetched READ-ONLY from the same origin. A failure here
                leaves the brief explicitly unavailable rather than falling back to a locally invented
                schedule, because a second copy of the schedule is a second source of truth. */
@@ -8072,25 +8090,32 @@
                         if (!artifacts.config || !Array.isArray(artifacts.config.windows) || !artifacts.config.windows.length) {
                             throw new Error("brief-config-windows-absent");
                         }
+                        /* The SCHEDULE and the EVIDENCE WINDOW are two different transactions, and
+                           collapsing them is what turns one refused publication into a dead tab. The
+                           schedule has loaded by this point, so the selector is populated from it
+                           BEFORE composition is attempted. If composition is then refused, the reader
+                           still sees the four windows and an explicit named reason; previously the
+                           throw skipped this block entirely and left a control with zero options,
+                           which reads as "nothing here" rather than "this was refused, and why". */
+                        state.briefWindows = artifacts.config.windows;
+                        renderBriefWindowOptions(artifacts.config.windows);
+
                         var projection = buildGenericWindow(artifacts);
                         state.briefWindows = projection.config.windows;
                         state.briefWindowId = projection.genericWindow.windowId;
-                        state.briefPublishedAt = projection.genericWindow.payloadRef.asOf;
+                        /* Publication time is `generatedAt`; the analyzed window instant is `asOf`.
+                           They are deliberately DISTINCT clocks, so the publication clock must come
+                           from the publication timestamp. Reading it off `payloadRef.asOf` collapsed
+                           it onto the evidence cutoff and made a past brief unauditable. */
+                        state.briefPublishedAt = projection.genericWindow.snapshotRef.generatedAt;
                         state.publicWatchlist = projection.tickers;
                         state.briefOwners = projection.owners;
                         state.genericWindow = projection.genericWindow;
                         state.lastValidGenericWindow = projection.genericWindow;
                         state.genericWindowError = null;
                         state.genericEvidenceSourceCount = 5;
-                        var select = byId("briefWindow");
-                        select.innerHTML = "";
-                        projection.config.windows.forEach(function (window_) {
-                            var option = document.createElement("option");
-                            option.value = window_.id;
-                            option.textContent = window_.label + " (" + window_.etTime + " ET)";
-                            select.appendChild(option);
-                        });
-                        select.value = state.briefWindowId;
+                        renderBriefWindowOptions(projection.config.windows);
+                        byId("briefWindow").value = state.briefWindowId;
                         renderBrief();
                         restoreReturnFocus();
                     })
@@ -8101,13 +8126,25 @@
                             reason: "public-evidence-transaction-failed", field: null, row: null,
                             valueEchoed: false, recoverable: true
                         };
+                        /* NAME the refusal. The contract code and reason already existed on
+                           state.genericWindowError but were reachable only through the diagnostics
+                           object, so on screen an unsatisfiable evidence contract was
+                           indistinguishable from "no data yet". An unavailable state that cannot say
+                           what was refused is not an honest unavailable state. */
+                        var refusal = state.genericWindowError;
+                        var named = refusal.code + " / " + refusal.reason;
                         setText("briefTimes", state.genericWindow
-                            ? "Public evidence refresh refused. The last valid brief remains visible."
-                            : "Generic evidence window unavailable.");
+                            ? "Public evidence refresh refused (" + named + "). The last valid brief remains visible."
+                            : "Generic evidence window unavailable (" + named + ").");
                         byId("briefTimes").className = "state-message warn";
                         byId("briefTimes").setAttribute("data-generic-window-state",
                             state.genericWindow ? "preserved-last-valid" : "unavailable");
-                        setText("briefStates", state.genericWindow ? "Last valid brief retained." : "Brief unavailable. No window is assumed.");
+                        byId("briefTimes").setAttribute("data-generic-window-error",
+                            refusal.code + "/" + refusal.reason);
+                        setText("briefStates", state.genericWindow
+                            ? "Last valid brief retained."
+                            : "Brief unavailable. No window is assumed. The published brief does not satisfy the "
+                                + "generic evidence contract for the window it declares, so nothing is composed from it.");
                         updateDiagnostics();
                     });
             }
```

The three hunks are one behaviour, not three: the schedule becomes its own render step, the
publication clock stops being read off the evidence cutoff, and the refusal acquires a name in
both a machine attribute and the reader's copy.

#### What is reproduced above, and what is not

The commit's eleven product files are accounted for exhaustively. Nothing is dropped without
being named here.

| File | `+ / -` | Where its diff appears |
|---|---|---|
| `scripts/brief-refresh.mjs` | `9 / 2` | in full, above |
| `rlportfoliobrief.js` | `16 / 0` | in full, above |
| `portfolio-survival-allocation-lab.html` | `50 / 13` | in full, above |
| `scripts/brief-narrative-parallel.mjs` | `8 / 1` | already reproduced verbatim in § No Wall-Clock Fallback |
| `scripts/validate-brief-payload.mjs` | `2 / 2` | already reproduced verbatim in § One Cutoff Rule |
| `notes/market-brief.md` | `1 / 1` | already reproduced, before and after, in § The Runbook Correction |
| `market-brief.snapshot.json` | `1 / 1` | already reproduced verbatim in § Published Clocks Now Differ |
| `market-brief.payload.json` | `1 / 1` | already reproduced verbatim in § Published Clocks Now Differ |
| `market-brief.page.json` | `1 / 1` | **elided — see below** |
| `market-brief.snapshot.page.json` | `1 / 1` | **elided — see below** |
| `tests/portfolio-survival-brief.spec.mjs` | `84 / 0` | excerpted in § Regression E2E, with its own elision marked there |

Five diffs are not repeated because this report already carries them verbatim; repeating them
would pad the record rather than add to it. The cross-references above are the whole of their
content, not a summary of it.

**The two elisions, and why they are elisions rather than omissions.** `market-brief.page.json`
and `market-brief.snapshot.page.json` are derived single-line page artifacts. Each shows `1 +,
1 -`, but that one line is 97,954 and 69,937 characters respectively — pasting both would add
roughly 330 KB of minified JSON to this report. Rather than assert that the rest of the line is
unchanged, it was measured: both documents were parsed at `899c7a40e^` and at `899c7a40e` and
compared leaf by leaf.

```
$ node -e '<parse both revisions of each file, flatten to leaf paths, print differing paths>'

=== market-brief.page.json ===
  asOf: "2026-08-23T15:37:31.147Z" -> "2026-08-23T15:00:00.000Z"
  total differing leaf paths: 1
=== market-brief.snapshot.page.json ===
  asOf: "2026-08-23T15:37:31.147Z" -> "2026-08-23T15:00:00.000Z"
  total differing leaf paths: 1
```

Exactly one leaf changed in each: the top-level `asOf`, from the 11:37 run clock to the 11:00
window cutoff. Both files embed many nested per-source `asOf` values for individual tool reads;
none of those moved. That is the same one-field change already shown for the two readable
artifacts, regenerated into the minified page form, so nothing is withheld from the record —
only its 330 KB encoding.

## Broader Suite On The Committed Tree

**`executed (validation turn)`** — the obstruction was real and is worth naming: the working
tree carries another packet's uncommitted edits to `tests/portfolio-brief.functional.mjs` and
`rlportfoliobrief.js`, so any suite run there measures a tree that is not this packet's
delivery. Rather than claim a pass from a contaminated tree or leave the item open forever,
`HEAD` was exported with `git archive` into an isolated directory. That mutates no repository
state and contains exactly the committed delivery.

The divergence was proved, not assumed:

```
$ EXPORT_OF=17cb5335d
tests/portfolio-brief.functional.mjs   export=a8d963a9feec worktree=875825213e53  export is CLEAN, worktree dirty
rlportfoliobrief.js                    export=d8fa7cf2a0fe worktree=2c9805a22d68  export is CLEAN, worktree dirty
```

All three suites pass on that clean export, each exit 0:

```
$ node scripts/selftest.mjs
Research-Lab self-test: 3429 passed, 0 failed
SELFTEST_EXIT=0

$ node --test tests/portfolio-brief.functional.mjs
# tests 34
# pass 34
# fail 0
# duration_ms 687.214083
FUNCTIONAL_EXIT=0

$ npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --reporter=list
  ✓  18 [system-chrome] › tests/portfolio-survival-brief.spec.mjs:1039:1 › Regression: BUG-001 a publication later than its declared window cutoff is refused by name and never empties the schedule (778ms)
  19 passed (30.5s)
PLAYWRIGHT_EXIT=0
```

Case 18 is this bug's own regression row, so the suite that certifies the tree is the same
suite that carries the fix's proof.

## Completion Statement

**What is established.** The Tier-A publisher binds `asOf` to the analyzed window's evidence
cutoff and leaves `generatedAt` as the run instant. Publisher and consumer resolve that
cutoff through one exported helper, so they cannot drift. The consumer boundary is
byte-identical, proven by `16 +, 0 -`. A refused evidence window leaves the public schedule
populated and names its contract code and reason on screen. The presentation-side conflation
of the same two fields is corrected. An adversarial regression row pins both halves of the
contract and asserts its own non-tautology. Five verification commands pass; the selftest
figure of 3314 assertions was the count at the fix turn and now reads 3429 — the suite grew
under other work, and the number is quoted here as a historical reading, not a current one.

**What is not established.** Certification has not been performed and none is claimed:
`certification.status` is `in_progress` and `certifiedAt` is `null`. An audit round ran and
returned `REWORK_REQUIRED` rather than a clean verdict — see § Audit Evidence.

Two sentences that stood here were withdrawn as stale rather than left to read as current.
"They were not re-run while these artifacts were written" was true when written and is now
false: the regression phase re-ran the delivery's consumers on a clean `git archive` export of
HEAD, all exit 0 — selftest 3429/0, `validate-brief-payload` PASS, publisher-boundary 5/5,
`brief.functional` 34/34, plus six browser suites. "No commit exists for the delivery" is
likewise false: the fix is committed in `899c7a40e` and is present at `HEAD`, verified by
`git show HEAD:scripts/brief-refresh.mjs | grep -c windowCutoffAt` → 3.

**What is deliberately left open.** Whether a persistently late publication should surface
its lateness as an operational signal, rather than only being made honest about it. Recorded
as Q1 in `design.md` § Open Question For The Owner. Adding a staleness disclosure in the same
change that first makes the two clocks differ would leave no run in which to observe whether
the distinction alone is sufficient.

## Audit Evidence

**`executed (audit turn)`** — `bubbles.audit`, 2026-08-28. Every command below was run in
this turn against a clean `git archive HEAD` export at `d650e8cc3`, because the working tree
carries ~85 uncommitted files from other sessions and a run there would not measure this
delivery. `rlportfoliobrief.js` is among those dirty files, so auditing the tree would have
read a surface this packet did not deliver.

**Verdict: `REWORK_REQUIRED`.** The delivery is sound and every requirement is satisfied. The
findings are confined to the justification and bookkeeping surface, where five claims do not
survive verification. The `audit` phase is therefore NOT recorded as verified.

### The delivery itself passes

Each requirement was checked against the code and the published artifacts rather than against
this report's prose.

| Requirement | Verified at | Result |
|---|---|---|
| FR-B001-001 `asOf` is the window cutoff | `brief-refresh.mjs:2637-2639` | PASS |
| FR-B001-002 `generatedAt` is the run clock | `brief-refresh.mjs:2639` | PASS |
| FR-B001-003 one shared cutoff rule | `windowCutoffAt` defined once, `rlportfoliobrief.js:171` | PASS |
| FR-B001-004 consumer boundary not weakened | `rlportfoliobrief.js` diff is `16 +, 0 -` | PASS |
| FR-B001-005 schedule survives a refusal | selector rendered before `buildGenericWindow` | PASS |
| FR-B001-006 a refusal names itself | `data-generic-window-error` + reader copy | PASS |
| FR-B001-007 publication clock from `generatedAt` | `state.briefPublishedAt = …snapshotRef.generatedAt` | PASS |
| FR-B001-008 runbook corrected | `notes/market-brief.md` | PASS |
| FR-B001-009 no wall-clock fallback | `brief-narrative-parallel.mjs` throws | PASS |

FR-B001-003 deserves its own note, because "one rule, two callers" is checkable rather than
assertable. `windowCutoffAt` is a thin wrapper that derives the New York civil date and then
calls `newYorkCivilCutoff`, which is the same function the consumer's `validateGenericWindow`
calls directly at `rlportfoliobrief.js:219`. The two signatures bottom out in one
implementation, so drift is structurally impossible rather than merely absent today.

**One transformed value traced end to end**, since structural checks confirm the parts exist
and only a traced value confirms they are connected:

```
snapshot.window      = morning          declared etTime = 11:00 ET
snapshot.asOf        = 2026-08-27T15:00:00.000Z   <- the 11:00 ET cutoff
snapshot.generatedAt = 2026-08-27T14:57:36.125Z   <- the run instant
payload.asOf         = 2026-08-27T15:00:00.000Z   <- inherited, not recomputed
helper re-resolution from the run instant = 2026-08-27T15:00:00.000Z  (equal)
```

The two clocks are distinct, the published `asOf` equals what the shared helper independently
resolves, and the payload inherits rather than substitutes.

**Re-executed in this turn, all exit 0:** `node scripts/selftest.mjs` → **3429 passed, 0
failed**; `node scripts/validate-brief-payload.mjs` → PASS, including `every evidence
timestamp is at or before the declared window cutoff`; `node --test
tests/portfolio-publisher-boundary.functional.mjs` → 5/5; `node --test
tests/portfolio-brief.functional.mjs` → 34/34. `artifact-lint.sh` exits 0; scope Done with
19 of 19 DoD items checked and none unchecked.

### AUDIT-F1 — the `simplify` stub's stated measurement is false (MEDIUM)

This is not a documentation nit. `phaseStubs` is a live Gate G022 satisfier; the guard's own
comment states a stubbed phase satisfies G022 *"IFF the stub entry carries a non-empty
`reason` field, preventing empty-stub fabrication."* Non-emptiness is machine-checkable and
truth is not, so this phase is the only control on whether the reason is real.

Two of the stub's three supporting claims do not hold:

| Stub claim | Verification | Result |
|---|---|---|
| `brief-narrative-parallel.mjs` "computed the cutoff itself via `newYorkCivilCutoff(tradingDate, window.etTime)`" | `git show 899c7a40e^:scripts/brief-narrative-parallel.mjs \| grep -c newYorkCivilCutoff` → `0` | FALSE |
| "call sites at `brief-refresh.mjs:2637` and in `brief-narrative-parallel.mjs`" | first TRUE; second → `grep -c windowCutoffAt` → `0`, and the file never imports `rlportfoliobrief` | HALF FALSE |
| "`function windowCutoffAt` matches exactly once, at `rlportfoliobrief.js:171`" | reproduced | TRUE |

The file the description actually fits is `scripts/validate-brief-payload.mjs:975`, and even
there the characterisation is wrong in kind: it was already calling the *shared* exported
`RLPORTFOLIOBRIEF.newYorkCivilCutoff`, so it was never "a second implementation". What the
delivery removed was the local trading-date derivation feeding that shared call.
`brief-narrative-parallel.mjs` changed for a different requirement entirely — FR-B001-009,
removing the wall-clock fallback. The justification appears to have swapped the two files.

The stub's **conclusion is independently true**: `windowCutoffAt` is defined exactly once and
the delivery removed a duplicated derivation. So the remedy is to correct the reason, not to
run a simplify phase.

### AUDIT-F2 — the staleness correction was applied in two places and missed two others (MEDIUM)

This packet already corrected a false "not committed" claim once. That correction is
incomplete, and the surviving copies contradict the corrected ones inside the same artifacts.

| Location | Claim | Reality |
|---|---|---|
| `report.md:30` | "The delivery is committed." | correct |
| `report.md:446` | "is **uncommitted**" | stale, but **annotated** at `:450` "Superseded — kept because it was true when captured" |
| `report.md:817` | "No commit exists for the delivery." | stale, **no annotation** |
| `state.json` `knownLimitation.statement` | "What is NOT established: … a commit for the delivery" | stale, **no annotation** |
| `state.json` `execution.nextRequiredReason` | "the delivery is present in the working tree at 648e0992b and is uncommitted" | stale, **no annotation** |

`git merge-base --is-ancestor 899c7a40e HEAD` is true, so the delivery is committed. The
handling at `report.md:450` is exemplary — the original capture is preserved byte-intact and
the supersession is annotated rather than the history rewritten. The defect is that
§ Completion Statement and `state.json` did not receive the same treatment, and
`knownLimitation.recordedIn` points at the two sections that were corrected.

Two further claims in the same paragraph are stale:

- `report.md:812` "the full **3314**-assertion selftest" — the selftest reports **3429
  passed, 0 failed**, both in the regression phase's record and when re-run in this turn. The
  historical table row at `:314` is legitimate captured evidence; the § Completion Statement
  sentence is a present-tense claim about what is established.
- `report.md:816` "they were not re-run while these artifacts were written" — the regression
  phase re-ran them on a clean export, and this turn re-ran four of them again.

### AUDIT-F3 — `adversarialRegression.line` contradicts `state.json`'s own history (LOW)

`state.json` records the regression row at line **902**. That was correct at `899c7a40e` and
the file has since grown; the row is at **1039** at HEAD, where line 902 is an unrelated
privacy assertion. The `name` field matches the row verbatim, so the row remains
identifiable, but the pointer misdirects. Both `executionHistory` notes and `report.md`
(`:377-380`, `:795`) cite 1039 correctly, so the contradiction is internal to `state.json`.

### AUDIT-F4 — the `stabilize` stub's "fail-loud" reading overstates the process boundary (LOW)

The stub is right that the throws are handled at `brief-refresh.mjs:2672`. What it does not
say is what that handler does:

```js
main().catch((e) => {
  console.error(`[brief-refresh] ${process.argv.includes('--strict') ? 'fatal' : 'soft-fail'}:`, e.message);
  process.exit(process.argv.includes('--strict') ? 1 : 0);
});
```

Without `--strict` the process exits **0**. Replacing a silent wall-clock fallback with a
throw is fail-loud relative to the old behaviour, which is the trade the stub defends and it
is the correct trade; but at the process boundary in the default invocation the run still
reports success. Separately, the new throw at `:2638` sits between the `brief-history.jsonl`
append at `:2632` and the snapshot write at `:2640`, so a config-defect run can now append a
history row with no corresponding snapshot — a window that did not exist before this change.
The path is narrow and the conclusion "nothing to stabilize" is defensible; the grounds are
overstated.

### AUDIT-F5 — the `security` stub's stated scope omits the surface that renders the refusal (LOW)

The stub grepped "the four changed non-artifact source files". The delivery changed a fifth
source surface, `portfolio-survival-allocation-lab.html` (`50 +, 13 -`), and that is exactly
where FR-B001-006's refusal copy reaches the DOM — the one place in this delivery where text
meets a rendering sink.

Checked independently in this turn: no raw-HTML sink is introduced. Values reach the DOM via
`option.textContent`, `setText`, and `setAttribute`, all of which escape. The single
`innerHTML` in the diff is `select.innerHTML = ""`, a clear-to-empty with no interpolation.
The stub's conclusion holds — but it holds because of this check, not because of the method
the stub describes.

### Observation — an early run now stamps a cutoff in the future

Not a defect and not a requirement violation, recorded because it is a state the delivery
newly makes reachable. The live artifact publishes `asOf` `15:00:00.000Z` against
`generatedAt` `14:57:36.125Z`: the run finished ~2.4 minutes *before* the cutoff it declares.
FR-B001-001 mandates this, and no consumer refuses it because the only boundary is
`asOf > cutoffAt`. It belongs alongside `design.md` Q1, which asks the converse question
about persistently *late* publication.

### Judgement on the `:1039` reasoning

The reasoning holds, and the packet states it honestly rather than glossing it. `report.md`
`:377-380` names the row, states that it "overrides both published artifacts with its own
late fixture before asserting anything, so a defect in what the *publisher* writes is
invisible to it by construction", and both `executionHistory` notes repeat it.

The structural argument is correct. A row that proves "a late publication is refused" cannot
use a correctly-published artifact, because then the refusal path never executes and every
assertion below it passes vacuously — which is precisely what the recorded
`nonTautologyBasis` asserts about its own fixture. So the two halves of the contract need
two different guards: `:1039` guards that a refusal is named and does not empty the schedule,
and the fifteen rows that read the real published artifacts guard the publisher half. That
those fifteen went red under revert is the empirical evidence, and it was reconstructed
rather than asserted. The only genuinely misleading residue is that the row's *name* implies
it guards a defect it structurally cannot, and the packet says so itself.

### What would clear this audit

Four corrections, none of which require re-running a phase:

1. Rewrite the `simplify` stub reason to name `scripts/validate-brief-payload.mjs:975`, and
   to describe what was removed as a duplicated trading-date derivation feeding the shared
   helper rather than as "a second implementation".
2. Annotate or correct `report.md:812`, `:816`, `:817` the way `:450` was annotated.
3. Update `state.json` so neither `knownLimitation.statement` nor
   `execution.nextRequiredReason` asserts that a commit for the delivery is unestablished,
   and set `adversarialRegression.line` to `1039`.
4. Optionally, narrow the `stabilize` and `security` stub reasons to what was actually
   measured. Both conclusions survive; only their stated grounds need to match.

## Audit Evidence Round 2

Re-audit of commit `20b3f9602`, which claims to remediate F1, F2, F4 and F5.
**Verdict: `REWORK_REQUIRED`. The `audit` phase was NOT recorded.**

Nothing here was taken on trust. Every remediated claim was re-derived from a clean
`git archive HEAD` export, because `rlportfoliobrief.js` is itself one of the ~85 foreign
uncommitted files in the working tree — auditing the tree would read a surface this packet
did not deliver. That the export was necessary rather than ceremonial is itself measured:
`diff -q` between the export and the working-tree copy of `rlportfoliobrief.js` reports the
files differ.

### AUDIT-F1 — ADDRESSED. The corrected reason is true, not merely different.

This was the load-bearing finding, because the guard admits a `phaseStub` if and only if its
reason is non-empty; truth is not machine-checkable, so this phase is the only control on it.

| Clause of the new reason | Command | Result |
|---|---|---|
| `brief-narrative-parallel.mjs` has `newYorkCivilCutoff` 0× before | `git show 899c7a40e^:scripts/brief-narrative-parallel.mjs \| grep -c` | `0` |
| …and 0× at HEAD | `grep -c` on the export | `0` |
| …and `windowCutoffAt` 0× | `grep -c` on the export | `0` |
| …and never references `rlportfoliobrief` | `grep -nEi` on the export | no match |
| the real hunk is `validate-brief-payload.mjs:975` | `grep -n windowCutoffAt` | `975:` |
| `function windowCutoffAt` exists exactly once | repo-wide `grep -rn`, `node_modules` excluded | `1`, at `rlportfoliobrief.js:171` |

The original reason was therefore genuinely false, and the finding was correct. The
**narrowing** is confirmed independently by the diff itself: the `-` side already read
`RLPORTFOLIOBRIEF.newYorkCivilCutoff(...)`, so that consumer was already calling the shared
module and was never "a second implementation". And `windowCutoffAt` does derive the civil
date internally — `rlportfoliobrief.js:178-179` computes `civilParts(instant, "America/New_York")`
and passes the assembled date to the primitive.

One wording nuance is recorded rather than glossed. The `tradingDate` **statement** at
`validate-brief-payload.mjs:974` still exists at HEAD; it survived as a context line and now
feeds only the two error messages at `:976` and `:980`. Read with its restrictive clause —
"the local trading-date derivation *that fed the lower-level primitive*" — the reason is
accurate, because that feed is what the fix removed. A reader could still take it as deletion.
This does not change the stub's conclusion, which is independently verified.

### AUDIT-F4 — ADDRESSED. Both narrowed statements verified.

`scripts/brief-refresh.mjs:2672` reads `process.exit(process.argv.includes('--strict') ? 1 : 0)`
verbatim, with `:2671` logging `'fatal'` versus `'soft-fail'` on the same condition — so
without `--strict` the process exits 0, exactly as the corrected stub now says. The
partial-write window is real and in the stated order: `appendFileSync(... 'brief-history.jsonl' ...)`
at `:2632`, the new `if (!windowCutoffAt) throw ...` at `:2638`, and
`writeFileSync(... 'market-brief.snapshot.json' ...)` at `:2640`. The throw appears as a `+`
line in `git show 899c7a40e -- scripts/brief-refresh.mjs`, confirming the stub's claim that
this window did not exist before the fix.

### AUDIT-F5 — ADDRESSED. The widened scope holds, including the `textContent` conclusion.

`portfolio-survival-allocation-lab.html` shows `63` changed lines in the diffstat, consistent
with the stated 50 + / 13 -. Every DOM sink in the **added** lines was enumerated:
`select.innerHTML = ""` (a clear-to-empty, not an injection sink), `option.textContent = ...`,
and `setAttribute("data-generic-window-error", ...)` (a `data-*` attribute). So refusal text
does reach the DOM through `textContent`, and no raw-HTML sink is introduced. A credential and
network sweep over every added line of `rlportfoliobrief.js`, `scripts/`, the allocation lab and
`tests/` returned no `apikey`, `api_key`, `token`, `secret`, `password`, `credential`,
`localStorage`, `proxy` or `fetch(`.

### AUDIT-F2 — NOT ADDRESSED. This is what blocks.

The remediation corrected `report.md` and `execution.nextRequiredReason`, but the identical
false claim survives **live and unannotated** in two top-level `state.json` fields:

| Path | Surviving text | Status at HEAD |
|---|---|---|
| `terminalTransitionBlockers[0]` | "The delivery is present in the working tree at `648e0992b` and is uncommitted … no commit exists for the fix" | **false** |
| `knownLimitation.statement` | "What is NOT established: certification, **a commit for the delivery**, …" | **false** |

The ground truth: `git merge-base --is-ancestor 899c7a40e HEAD` succeeds, and
`git show HEAD:scripts/brief-refresh.mjs | grep -c windowCutoffAt` returns `3`. `648e0992b`
is a plain ancestor of HEAD, not the delivery.

This is not a missed edge case. The prior round named the field **by path** twice — once in
its finding table at `report.md:925` ("`state.json` `knownLimitation.statement` … stale,
**no annotation**") and again in its own remediation list at item 3 above. Both fields remain
bare, with no sibling `asOf`, note, or historical marker scoping them.

It matters beyond tidiness. `terminalTransitionBlockers` exists to tell the next owner what
stands in the way of the terminal transition, and the next owner is `bubbles.validate`, which
would read that it must obtain a commit that already exists. `knownLimitation.recordedIn` also
mirrors the claim into `report.md` "Completion Statement", `report.md` "Delivery State" and
`design.md`, so it propagates into the human-facing narrative.

**The intended quotation judgement was confirmed rather than assumed.** The other F2 classes
are correctly closed. The surviving "not re-run" strings live in `defect.measurementNote`,
`verification.claimSource`, `executionHistory[4].note` and the prior audit note — all
turn-scoped provenance that was true of the turn each describes, and which should *not* be
rewritten, since rewriting historical provenance would be the worse error. The surviving
`3314` figures are covered by the explicit historical annotation at `report.md:812`.

### AUDIT-F3 — still open, and judged NOT to block on its own.

`adversarialRegression.line` is `902`; at HEAD line 902 is
`'no personal value enters a public artifact request').toBe(false);`, an unrelated privacy
assertion, while the real BUG-001 regression is at `:1039` — which this packet's own
`executionHistory` cites four times.

The finding is real, but it is a stale bookkeeping pointer, not a defect in delivered code and
not a claim that satisfies a gate. The regression itself exists, is adversarial, and was
executed by the regression phase; a reader following the packet's evidence reaches the right
test. LOW is precisely the class the framework allows to be carried as a surfaced observation
attached at certification. **Had F2 been closed, the phase would have been recorded and F3 left
for `bubbles.validate` to attach.** F3 is not what blocks this round.

### Observation — a pre-existing duplicate, out of blast radius (non-blocking)

`portfolio-survival-allocation-lab.html:7906` defines its own `function newYorkCivilCutoff`
and calls it at `:7974`, while also loading `rlportfoliobrief.js` at `:1248` — so it is a
genuine duplicate of the lower-level primitive, which slightly exceeds the `simplify` stub's
closing sentence. It is **not** this packet's to repair: the count is `1` before and `1` after,
and the delivery diff touches neither symbol in that file. Route-only, recorded so it does not
disappear.

### What would clear this audit

One correction, requiring no phase re-run:

1. Withdraw or annotate the two surviving false claims — `terminalTransitionBlockers[0]` and
   `knownLimitation.statement` — the same way `execution.nextRequiredReason` was corrected.
2. Optionally close F3 by setting `adversarialRegression.line` to `1039`.

Owner: `bubbles.implement`. Both fields are outside this agent's write authority — audit owns
only its `report.md` evidence and its additive `execution.audit` attempt record.
