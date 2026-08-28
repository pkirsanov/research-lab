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

**`executed (fix turn)`** — all five commands were run during the fix and observed directly.

| Command | Before fix | After fix |
|---|---|---|
| `tests/portfolio-survival-brief.spec.mjs` | **3 passed / 14 failed** | **17 passed / 0 failed** |
| `node --test tests/portfolio-publisher-boundary.functional.mjs` | — | exit `0`, `fail 0` |
| `node scripts/validate-brief-payload.mjs` | — | exit `0`, `PASS` |
| `node scripts/selftest.mjs` | — | exit `0`, **3314 passed, 0 failed** |
| `git diff --check` | — | exit `0` |

The RED figure is not a weak-assertion artifact. The tab genuinely could not compose,
`#briefWindow` rendered zero options, and every row needing the brief surface failed against
the real published artifacts rather than against a fixture.

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
contract and asserts its own non-tautology. Five verification commands pass, including the
full 3314-assertion selftest.

**What is not established.** Certification was not performed in this turn, and none is
claimed: `certification.status` is `in_progress` and `certifiedAt` is `null`. The five test
commands were executed during the fix turn and are recorded as observed then; they were not
re-run while these artifacts were written. No commit exists for the delivery.

**What is deliberately left open.** Whether a persistently late publication should surface
its lateness as an operational signal, rather than only being made honest about it. Recorded
as Q1 in `design.md` § Open Question For The Owner. Adding a staleness disclosure in the same
change that first makes the two clocks differ would leave no run in which to observe whether
the distinction alone is sufficient.
