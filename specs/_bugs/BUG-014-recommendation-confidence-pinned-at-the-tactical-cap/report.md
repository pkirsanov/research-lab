# BUG-014 Report

All output below was produced by executing the named command in this session. Nothing is
restated from memory or from another packet.

## Summary

Every published recommendation carried `confidence: 55` across 34 committed payload runs,
so the field could neither gate nor rank. Both authoring lanes now render a confidence
contract derived from the enforced thresholds, and the hand-typed sentence it replaces is
gone. Scope 1 is delivered with 14 of 14 Definition of Done items evidenced. Scope 2, the
cap-to-floor threshold collision, was decided on delegated authority and is delivered with
9 of 9 Definition of Done items evidenced; see § Threshold Decision.

## The Measurement That Established The Defect

Walked every committed `market-brief.payload.json` blob and read the authored
`direction/horizon/confidence` of each recommendation. Re-derived by execution on 2026-08-28
at `HEAD` `2d2d5c5bc`, against the same `e6dfdeced^` cut-off the original walk used, so the
table below is reproducible rather than transcribed:

```
$ git rev-list --reverse 'e6dfdeced^' -- market-brief.payload.json | while read r; do git show "$r:market-brief.payload.json"; done   # parsed in python3, slate per run
exit: 0
total payload commits as-of e6dfdeced^: 198
last-34 window: 2026-08-14 13:52:53 -0700 -> 2026-08-20 14:01:34 -0700

date/time         direction/horizon/confidence slate
  2026-08-14 13:52 hold/stru/55|rotate/swin/55|hedge/swin/55
  ...
  2026-08-18 04:22 rotate/swin/55|hedge/swin/55                         CHANGED
  2026-08-18 13:55 hedge/swin/55|rotate/swin/55                         CHANGED
  2026-08-19 14:08 hedge/swin/55|add/swin/55                            CHANGED
  2026-08-19 23:02 hedge/swin/55|add/swin/55|add/swin/55                CHANGED
  2026-08-19 23:54 hedge/swin/55|add/swin/55|add/swin/55|trim/swin/55   CHANGED
  2026-08-20 00:50 hedge/swin/55|add/swin/55|add/swin/55|trim/swin/55   SAME
  2026-08-20 01:08 hedge/swin/55|add/swin/55|add/swin/55|trim/swin/55   SAME
  2026-08-20 05:58 add/swin/55|trim/swin/55|add/swin/55|hedge/swin/55   CHANGED
  2026-08-20 08:06 add/swin/55|trim/swin/55|add/swin/55|hedge/swin/55   SAME
  2026-08-20 11:58 add/swin/55|trim/swin/55|add/swin/55|hedge/swin/55   SAME
  2026-08-20 14:01 hedge/swin/55|trim/swin/55                           CHANGED

runs=34  distinct=8  transitions=7

recommendation confidences over the last-34 window: {55: 97}  (total 97 recommendations)
```

Two independent facts fall out of the same table:

1. **Feature 026's F-026-2 is fixed.** 13 consecutive identical slates from 2026-08-14
   to 2026-08-17 became 7 transitions across the following 21 runs.
2. **`confidence` is invariant.** 8 distinct slates, both `swing` and `structural`
   horizons, 34 runs, and exactly one confidence value: `55`.

## Rendered Output

The original capture was taken under the pre-Scope-2 configuration, when
`minimumActionConfidence` was still `55`. Scope 2 later moved it to `50`, so the live
render at `HEAD` states `an action below 50` and takes the cap-above-floor branch. Rather
than leave a transcript that can no longer be reproduced, both renders are re-derived below
by execution on 2026-08-28 at `HEAD` `2d2d5c5bc` — the live one from committed config, the
pre-Scope-2 one through the `thresholdsOverride` seam, which is the same seam the selftest
uses and is `undefined` on every production path. The historical text is therefore
preserved AND verifiable; see § Stale figures corrected.

```
$ node --input-type=module -e "import {recommendationConfidenceContractInstruction as C} from './scripts/build-attention-items.mjs'; ..."
exit: 0
--- LIVE committed thresholds: cap=55 actionFloor=50 attentionFloor=55 ---
Choose each confidence as a 0-100 reading of how strong that item's evidence actually is,
and vary it across items. It gates and it ranks: an action below 50 and an attention card
below 55 reach no reader, and surviving actions are sorted by this number, so items
sharing one value cannot be ranked and get cut in the order you happened to write them
rather than by conviction. A tactical-horizon item is capped at 55, so it may only occupy
50 to 55; that band is a ceiling, never a default and never a target. A swing or
structural call resting on corroborated evidence belongs clearly above the floor, and a
thin one belongs below it as a watch idea instead of an action. Do not give two items the
same confidence unless you genuinely cannot separate them.

--- cap=55 floor=55 (the pre-Scope-2 configuration, re-derived through the override seam) ---
55 is the ceiling for a tactical-horizon item and also the action floor, so a tactical
action has exactly one admissible value: 55. A tactical read you would not defend at that
number belongs as a watch idea rather than an action.
```

The other two branches, exercised through the same override seam and re-run on 2026-08-28:

```
$ node --input-type=module -e "import {recommendationConfidenceContractInstruction as C} from './scripts/build-attention-items.mjs'; ..."
exit: 0
--- cap=40 floor=55 ---
40 is the ceiling for a tactical-horizon item, which is below the 55 action floor — so a
tactical read cannot become an action at all and belongs in attention or as a watch idea.
--- cap=70 floor=55 ---
A tactical-horizon item is capped at 70, so it may only occupy 55 to 70; that band is a
ceiling, never a default and never a target.
```

### Regression E2E

`npx playwright test --config=playwright.config.mjs --project=system-chrome --workers=1 tests/attention-browser.spec.mjs`

```
✓  every next-session action the cockpit renders clears the committed confidence floor (923ms)
✓  a decision older than the page data says so, and one taken from it stays silent (1.2s)
2 passed (3.4s)
```

**Proven falsifiable.** The floor was temporarily raised to 60 and the page artifacts
regenerated. The scenario failed, naming the rendered actions beneath it — the capture read
`✘ every next-session action the cockpit renders clears the committed confidence floor`
with `- Expected - 1 / + Received + 7`. Restoring the committed floor returned it to
`1 passed`, and `git diff --stat` on `market-brief.config.json` confirmed the probe left
nothing behind.

**That falsification probe was RE-DERIVED on 2026-08-28, outside this worktree.** The
capture above is dated 2026-08-22; rather than restate it, the probe was performed again.
It needs a mutation of committed `market-brief.config.json`, and this worktree is shared
with a concurrent session holding uncommitted files — so the run was moved off the worktree
entirely, into a `git clone` of this repository in a scratch directory outside it, which
touches neither the shared files nor their `.git`. Research Lab is build-free, so a clone
runs as-is; only `node_modules` was symlinked, read-only, for the Playwright binary. Clone
paths below are shown as `<repo-root>`. Control first — committed floor, scenario passes:

```
$ node -e "console.log(require('./market-brief.config.json').thresholds.minimumActionConfidence)"
50
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --workers=1 tests/attention-browser.spec.mjs -g "every next-session action the cockpit renders clears the committed confidence floor"

Running 1 test using 1 worker

  ✓  1 … action the cockpit renders clears the committed confidence floor (1.5s)

  1 passed (4.1s)
CONTROL_EXIT=0
```

Then the floor alone was raised, in the clone only. The three committed `nextSession`
actions at 57, 54 and 52 fall beneath 60, and the scenario fails naming each of them:

```
$ git --no-pager diff market-brief.config.json
-        "minimumActionConfidence": 50,
+        "minimumActionConfidence": 60,
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --workers=1 tests/attention-browser.spec.mjs -g "every next-session action the cockpit renders clears the committed confidence floor"

  ✘  1 … action the cockpit renders clears the committed confidence floor (4.0s)

    Error: every rendered action clears the committed floor of 60
    expect(received).toEqual(expected) // deep equality
    - Expected  - 1
    + Received  + 5
    - Array []
    + Array [
    +   57,
    +   54,
    +   52,
    + ]
      at <repo-root>/tests/attention-browser.spec.mjs:1603:6

  1 failed
FALSIFY_EXIT=1
```

Restoring the committed floor returns the scenario, and the probe leaves nothing behind:

```
$ git checkout -- market-brief.config.json
$ git --no-pager diff --stat market-brief.config.json
$ node -e "console.log(require('./market-brief.config.json').thresholds.minimumActionConfidence)"
50
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --workers=1 tests/attention-browser.spec.mjs -g "every next-session action the cockpit renders clears the committed confidence floor"

  ✓  1 … action the cockpit renders clears the committed confidence floor (1.9s)

  1 passed (4.6s)
RESTORE_EXIT=0
```

**The re-derived count does not match the 2026-08-22 capture, and the older number was
wrong on its own terms.** That capture read `+ Received + 7`, and the scenario comment at
`tests/attention-browser.spec.mjs:1579` still says the probe "fails naming 7 rendered
actions beneath it". `+ Received + N` counts DIFF LINES, not actions: a seven-line received
array is five values plus two brackets, so 2026-08-22 falsified on five actions, never on
seven. Today it reads `+ Received + 5`, which is three values — the committed payload now
carries four `nextSession` actions where it once carried more. What the probe establishes
is unchanged, and is the part that matters: the scenario is sensitive to a
config-versus-payload disagreement, and it names the offending values instead of failing
blankly. The count is a property of whichever payload is committed on the day, not of the
invariant. Correcting that stale comment belongs to product test source, which this packet
does not edit; it is recorded here so the next reader of that file has the measurement.

The scenario was also re-run on 2026-08-28 in the full suite, in this worktree, against
committed config and with no mutation at all:

```
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --workers=1 tests/attention-browser.spec.mjs
exit: 0
lines: 22
sha256: 085ea908e064c5cf3b18c95c74da2ebd0883c1e7c16d529af649180a7c03076d

Running 17 tests using 1 worker

  ✓   7 [system-chrome] › tests/attention-browser.spec.mjs:691:1 › decision attention rendering holds all six performance budgets (6.5s)
  ✓  15 [system-chrome] › tests/attention-browser.spec.mjs:1509:1 › a configured action floor of zero is honoured rather than swallowed by a falsy default (928ms)
  ✓  17 [system-chrome] › tests/attention-browser.spec.mjs:1584:1 › every next-session action the cockpit renders clears the committed confidence floor (2.3s)

  17 passed (1.4m)
```

The suite has grown from the 16 tests recorded on 2026-08-22 to 17, and all 17 pass. The
six performance budgets — including the `rlattention.js` module ceiling this packet once
breached — are inside scenario 7 above.

That probe also **corrected a claim in this packet**. The scenario's first comment said
`renderNextSession` drops anything below the floor. It does not: it applies the floor only
in its FALLBACK path, and renders `payload.nextSession.actions` verbatim when they exist.
The floor is enforced at publish by `validate-brief-payload.mjs`. The scenario is still
worth its place — it catches a config-versus-payload disagreement, which is exactly what
raising the floor without recomposing would create — but the comment was rewritten to say
what the probe showed rather than what was assumed.

### Code Diff Evidence

`git show --stat e6dfdeced` — the delivery commit, re-run 2026-08-28:

```
$ git --no-pager show --stat --format='%h %s' e6dfdeced
exit: 0
e6dfdeced feat(brief): decide the four open questions, against measurement rather than preference

 market-brief.config.json                           |  8 +-
 market-brief.config.page.json                      |  2 +-
 market-brief.html                                  | 11 +++
 rlattention.js                                     | 23 +++++
 rlcockpit.js                                       | 39 ++++++++-
 scripts/brief-narrative-parallel.mjs               |  4 +-
 scripts/build-attention-items.mjs                  | 80 ++++++++++++++++-
 scripts/selftest.mjs                               | 99 +++++++++++++++++++++-
 .../state.json                                     | 26 ++++--
 .../bug.md                                         | 24 ++++++
 .../report.md                                      | 35 ++++++++
 .../scenario-manifest.json                         | 30 ++++++-
 .../scopes.md                                      | 60 ++++++++++---
 .../state.json                                     | 19 ++---
 14 files changed, 417 insertions(+), 43 deletions(-)
```

`git diff market-brief.config.json` — the one behavioural line, the threshold itself:
```diff
-        "minimumActionConfidence": 55,
+        "minimumActionConfidence": 50,
```

`git diff scripts/brief-narrative-parallel.mjs` — two interpolations and one deletion, the
deletion being the hand-typed sentence the rendered contract replaces:

```diff
-... confidence, and deepLink. Keep tactical confidence at or below the configured cap.
+... confidence, and deepLink. ${recommendationConfidenceContractInstruction()}
```

```diff
-recommendations must be concrete instruments with direction, ... confidence, and deepLink.
+recommendations must be concrete instruments with direction, ... confidence, and deepLink. ${recommendationConfidenceContractInstruction()}
```

No gate function, payload schema, or committed payload was edited.

## Threshold Decision

Scope 2, decided 2026-08-20 on delegated authority. Measuring `nextSession.actions` by
horizon separated two causes the filing had conflated. Re-derived by execution 2026-08-28,
over the same last-34 window as-of `e6dfdeced^`:

```
$ git rev-list --reverse 'e6dfdeced^' -- market-brief.payload.json   # nextSession.actions partitioned by horizon
exit: 0
total payload commits as-of e6dfdeced^: 198
last-34 window: 2026-08-14T13:52:53-07:00 -> 2026-08-20T14:01:34-07:00
  nextSession structural  confidences: {"56": 15, "57": 19}
  nextSession swing       confidences: {"55": 102}
  nextSession tactical    confidences: {"55": 34}
```

Structural actions vary. Tactical does not, and cannot: the publish validator refuses
below `minimumActionConfidence` and above `tacticalConfidenceCap`, both 55, so 55 was the
only legal value — and a tactical action published on all 34 runs.

`tacticalConfidenceCap` stays 55 because `notes/market-brief.md` states that ceiling twice
as anti-reactivity doctrine. `minimumActionConfidence` moves to 50. The change excludes
nothing already published:

```
$ git rev-list --reverse 'e6dfdeced^' -- market-brief.payload.json   # min over every published nextSession action
exit: 0
  ALLHIST min action confidence ever published (as-of e6dfdeced^): 55
  ALLHIST payload revisions scanned: 198
```

The contract needed no code change to follow it, which is what the generic derivation was
for. Re-rendered from committed config on 2026-08-28 — the tactical clause only:

```
$ node --input-type=module -e "import {recommendationConfidenceContractInstruction as C} from './scripts/build-attention-items.mjs'; console.log(C())"
exit: 0
--- LIVE committed thresholds: cap=55 actionFloor=50 attentionFloor=55 ---
A tactical-horizon item is capped at 55, so it may only occupy 50 to 55; that band is a
ceiling, never a default and never a target.
```

## Test Evidence

### Selftest

Re-run 2026-08-28 at `HEAD` `2d2d5c5bc`. Captured through `evidence-capture.sh`, so the
`sha256` covers every one of the 3898 output lines and the result can be re-derived rather
than taken on trust:

```
# BUG-014 re-verify: canonical suite at HEAD 2d2d5c5bc
$ node scripts/selftest.mjs
exit: 0
lines: 3898
sha256: c18c8cc408855402d016daab882a23217cd3f5069b48113fbc945ea3a75be888
--- last 3 ---
================================================
Research-Lab self-test: 3429 passed, 0 failed
================================================
```

Exit code 0, zero `✗` marks. The count moved 3192 → 3200 when Scope 1 landed, 3200 → 3220
across Scope 2 and the regression remediation below, `3241` at the 2026-08-22 validation
pass, and `3429` at this re-run — the growth since is other packets' work, not this one's.

The assertions this packet owns, read from the suite source on 2026-08-28 rather than
re-transcribed from a scrolling run. Every one of them is inside the 3429 that passed above:

```
$ grep -nE "'(the confidence contract |both the core and signals lanes |the hand-typed tactical-cap |the tactical cap leaves a band|live config gives tactical|sits on the 0-100 scale|the cockpit reads a configured threshold)" scripts/selftest.mjs
exit: 0
3477:      'the confidence contract states the enforced ' + key + ' of ' + confidenceThresholds[key]
3481:    'the confidence contract tells the author the number ranks, and to vary it - the two facts that make a pinned value harmful');
3510:    'both the core and signals lanes render the confidence contract, because both author a confidence');
3512:    'the hand-typed tactical-cap sentence is gone rather than left beside the rendered contract as a second copy');
3530:    'the confidence contract derives a DIFFERENT tactical clause for cap-below-floor, cap-above-floor and cap-equals-floor rather than restating one fixed sentence');
3540:    'the tactical cap leaves a band above the action floor, so a tactical action is not forced onto a single admissible value (cap '
3544:    'live config gives tactical a real band and the contract states that band rather than a single value');
3554:      key + ' sits on the 0-100 scale the contract tells the author to use, so the bar it states is reachable (' + value + ')');
3566:    'the cockpit reads a configured threshold with a finite check rather than || (literal tripwire; the behaviour is pinned by SCN-BUG014-FLOOR-ZERO-HONOURED)');
```

Three of those titles are templated over the threshold triple, so the nine source lines are
thirteen assertions at run time: `3477` and `3554` each expand to `minimumActionConfidence`
(50), `minimumAttentionConfidence` (55) and `tacticalConfidenceCap` (55).

**One title has drifted again since the 2026-08-22 transcription.** Line `3566` now reads
`... rather than || (literal tripwire; the behaviour is pinned by SCN-BUG014-FLOOR-ZERO-HONOURED)`,
where this report previously quoted `... rather than ||, so a deliberate 0 is not silently
replaced by the fallback`. Reading the titles from source rather than from a transcript is
what surfaced it, and is why the block above is a `grep` of the suite rather than a paste.

Both validators re-run 2026-08-28, exit 0 each:

```
$ node scripts/validate-brief-payload.mjs
exit: 0
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid

$ node scripts/validate-tool-experience.mjs
exit: 0
[tool-experience] artifact=brief-first-load bytes=197400 budget=204800 result=PASS
[tool-experience] OK adversarial=13 unexpectedAcceptances=0
```

`brief-first-load` read `184621` on 2026-08-22 and reads `197400` now; the payload has grown
with later runs. It is still inside the unchanged `204800` budget.

### Adversarial Check

A pin that cannot fail is decoration. Re-derived 2026-08-28 by deleting the core-lane
interpolation from an **in-memory copy** of the lane source and re-evaluating the same
predicate the assertion at `scripts/selftest.mjs:3510` uses. The file itself is opened
read-only and never written, which is what makes this safe to re-run in a worktree shared
with concurrent work:

```
$ node --input-type=module -e "...read scripts/brief-narrative-parallel.mjs, delete the core-lane interpolation in memory, re-evaluate the pin..."
exit: 0
committed source      : interpolations=2  PIN=PASS
core-lane deleted     : interpolations=1  PIN=FAIL
  the pin FAILS when the core-lane interpolation is absent, so it is falsifiable rather than decoration

$ git status --porcelain -- scripts/brief-narrative-parallel.mjs
exit: 0
(no output — the source file was never written)
```

The original 2026-08-20 probe did the same thing destructively: it removed the
interpolation on disk, ran the suite to `exit=1` with
`✗ FAIL: both the core and signals lanes render the confidence contract, because both
author a confidence`, then restored the wiring and re-counted 2 interpolations with the
suite back at `3200 passed, 0 failed`. The in-memory form above proves the same property
without mutating a shared worktree.

### Regression Remediation

An independent regression pass mutation-probed this packet's own pins and found one that
could not fail. The three per-threshold assertions used a substring check on the enforced
value while two thresholds were both 55, so the attention-floor pin was satisfied by
prose the tactical cap supplied. Proof, evaluating both pin forms against a render with
the attention floor deleted:

```
$ node --input-type=module -e '
import { recommendationConfidenceContractInstruction as render } from "./scripts/build-attention-items.mjs";
import { readFileSync } from "node:fs";
const base = JSON.parse(readFileSync("market-brief.config.json", "utf8")).thresholds;
const broken = (t) => render(t).replace(`an attention card below ${t.minimumAttentionConfidence} `, "an attention card below an unstated floor ");
const OLD = (k) => broken(base).includes(String(base[k]));
const NEW = (k) => { const m = { ...base, [k]: base[k] + 7 }; return broken(m) !== broken(base) && broken(m).includes(String(m[k])); };
for (const k of ["minimumActionConfidence", "minimumAttentionConfidence", "tacticalConfidenceCap"])
  console.log(k.padEnd(27), "OLD_PIN=" + (OLD(k) ? "PASS" : "FAIL"), " NEW_PIN=" + (NEW(k) ? "PASS" : "FAIL"));
console.log("…", broken(base).match(/an action below[^.]*reach no reader/)[0], "…");
'
minimumActionConfidence     OLD_PIN=PASS  NEW_PIN=PASS
minimumAttentionConfidence  OLD_PIN=PASS  NEW_PIN=FAIL
tacticalConfidenceCap       OLD_PIN=PASS  NEW_PIN=PASS
… an action below 50 and an attention card below an unstated floor reach no reader …
exit code: 0

$ git status --porcelain -- scripts/build-attention-items.mjs market-brief.config.json
(no output — neither the source nor the config was written)
```

Re-run 2026-08-28 at `HEAD`, in full, through the `thresholdsOverride` seam in
`scripts/build-attention-items.mjs`; no config and no source file was written. `OLD_PIN` is
the substring check the assertions used to make; `NEW_PIN` moves the threshold +7 through
the seam and requires the rendered text to CHANGE and to carry the new value. The collision
that made the old form undetectable is still present in the enforced config —
`minimumAttentionConfidence` and `tacticalConfidenceCap` are both `55` — which is why
`OLD_PIN` still reports PASS for a floor the render no longer states.

Each threshold is now probed by moving it +7 through the override seam and requiring the
rendered text to change AND to carry the new value, so a pin cannot pass on a value it
did not read. The same pass also found the packet's own evidence block quoting assertions
that no longer existed, which is why the block above is transcribed from the current run.

Three further defects were found and fixed, each proven by reverting the fix:

| Defect | Proof it is now guarded |
|---|---|
| A snapshot that parses but carries no readable subject (`{}`, `[]`, a stray string) reached the QUIET branch and told the lane to publish nothing — a corrupted input silencing the feed while looking like a calm market | reverting the guard fails 4 pins by name |
| The threshold invariant guarded only the cap/floor pair, so an unsatisfiable value could still land | `minimumAttentionConfidence: 150` fails by name and quotes the value |
| `rlbrief.js` read thresholds with `\|\|`, so a deliberate `0` was silently replaced by 55 on the action path while the attention path honoured it | the cockpit now uses a finite check, pinned |

### Specialist Phases

Four phases were dispatched against this delivery and every one changed it. Recorded here
because a phase claim with no consequence is worth nothing.

**regression** — mutation-probed the packet's own pins and found one that could not fail.
The three per-threshold assertions used a substring check on the enforced value while two
thresholds were both 55, so the attention-floor pin was satisfied by prose the tactical cap
supplied. Also found this report quoting assertions that no longer existed, and 4 stale
`linkedTests` in the manifest. All fixed; see § Regression Remediation.

**security** — verdict SECURE, nothing exploitable. Cleared XSS/injection, prototype
pollution, ReDoS, instruction injection, path handling and secrets, each with executed
proof rather than reasoning. The XSS clearance was proven twice over in a real browser:
every hostile `observedAt` falls to the validator's constant string, and a hostile value
driven through the unvalidated `rationale` field renders as escaped text with zero child
elements. Two actionable findings, both fixed:

- `observationFreshnessNote` interpolated the RAW value while `isIsoInstant` validates the
  TRIMMED one, and `observedAt` is in neither `defaultVisibleFields` nor `detailFields` —
  so a format-valid instant padded to 2 MB produced a 2,000,178-character note in an
  unbudgeted field. Now interpolates the validated value: the same input yields 178 chars.
- The escaping property that makes the tier safe was pinned nowhere, so a refactor of
  `attnField` to `innerHTML` would have kept every test green. Now pinned by
  `SCN-BUG009-FIELD-ESCAPES`, proven by flipping that sink and watching the test fail.

**simplify** — one edit, proven behaviour-preserving over 192 policy×payload comparisons
with zero mismatches: the `attention[].` prefix rule was restated five times across two
files, beside a comment forbidding exactly that. Both readers now share one constant
(`attention[].` literals in `rlcockpit.js`: 4 → 1).

**The finding that mattered most** came from this phase: the `rlbrief.js` pin guards
SPELLING, not behaviour. Reintroducing the identical 0-swallowing defect spelled
`var f = thresholds.minimumActionConfidence; var actionFloor = f || 55;` left the suite at
`3221 passed, 0 failed`. I reproduced that independently. The property is now pinned
behaviourally by `SCN-BUG014-FLOOR-ZERO-HONOURED`, which drives the real `renderNextSession`
fallback path; under that same evasion the browser test FAILS while the unit suite still
passes — which is precisely the gap it was written to close.

### No Second Copy

Re-run 2026-08-28 at `HEAD`. `grep -c` exits 1 when it selects no lines, so the status below
is the zero-match status rather than a failure:

```
$ grep -c "Keep tactical confidence at or below the configured cap" scripts/brief-narrative-parallel.mjs
0
exit code: 1
```

### Validator

Re-run 2026-08-28 at `HEAD`. The validator now prints six named contract checks ahead of the
summary line the earlier transcript recorded on its own:

```
$ node scripts/validate-brief-payload.mjs
[brief-contract] company owner-read names its producing adapter and states that no recommendation is produced: PASS
[brief-contract] every evidence timestamp is at or before the declared window cutoff: PASS
[brief-contract] SCN-019-020 payload toolRead and page read agree and expose no destination routing fields: PASS
[brief-contract] Every declared topic and section is accounted and every mandatory review belongs to the current generation: PASS
[brief-contract] causal brief items require eligible stage owner freshness independent reason and falsifiers: PASS
[brief-contract] Market Brief causal coverage and elevation satisfy low-noise independence policy: PASS (coverageRows=1 elevated=false planEligible=false)
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
exit code: 0
```

## Blast Radius

Captured originally as `git diff --numstat` against the uncommitted Scope-1 worktree. That
form is no longer re-runnable — the worktree has moved on — so it is re-derived 2026-08-28
from the commit that carried the delivery, `02042f60f`, with the packet's own artifacts
excluded so that only product files are counted. The three rows come back byte-identical to
the original capture:

```
$ git show --numstat --format= 02042f60f -- . ':(exclude)specs/'
3       3       scripts/brief-narrative-parallel.mjs
59      0       scripts/build-attention-items.mjs
48      1       scripts/selftest.mjs
exit code: 0
```

This is the Scope-1 radius as recorded. The larger figure for the delivery as a whole is in
§ Stale figures corrected.

No threshold, gate function, payload schema, or committed payload was modified. A
temporary config mutation used to exercise the two non-live branches was reverted and
confirmed at `0 changed files` before the permanent override seam replaced it.

## Completion Statement

Scope 1 is delivered and every Definition of Done item is evidenced above. Scope 2 was
subsequently taken up and decided on delegated authority — `tacticalConfidenceCap` stays
at 55 and `minimumActionConfidence` moves to 50 — and is delivered with its own Definition
of Done evidenced; see § Threshold Decision. The earlier text here recorded Scope 2 as
unstarted and was left stale when that decision landed.

What is **not** established here: whether stating the contract is by itself sufficient to
make authored confidence vary in production. That requires observing a narrative run
composed after this change, and no such run has occurred. The claim proven is that both
lanes now receive a contract derived from the enforced bands; the claim deliberately not
made is that the next payload will carry a spread.

## Production Confirmation, 2026-08-22

The claim withheld above is now observed, so it is recorded rather than left open.
`market-brief.payload.json` is a live artifact that later scheduled runs regenerate, so this
dated observation is re-derived 2026-08-28 at the commits it names, with `HEAD` shown beside
them rather than substituted for them:

```
$ python3 -c "
import json,subprocess,collections
for ref in ('0380cfdc2','ac8d3f3ef','HEAD'):
    b=subprocess.run(['git','show',ref+':market-brief.payload.json'],capture_output=True,text=True).stdout
    d=json.loads(b)
    recs='/'.join(str(r.get('confidence')) for r in d.get('recommendations',[]))
    acts=(d.get('nextSession') or {}).get('actions',[])
    by=collections.defaultdict(list)
    for a in acts: by[a.get('horizon')].append(a.get('confidence'))
    print(f'{ref:<11} recommendations {recs}')
    print(f'{\"\":<11}   structural {sorted(by[\"structural\"],reverse=True)}  swing {sorted(by[\"swing\"],reverse=True)}  tactical {sorted(by[\"tactical\"],reverse=True)}')
"
0380cfdc2   recommendations 61/57/53/52
              structural [61]  swing [57, 54, 50]  tactical [52]
ac8d3f3ef   recommendations 61/57/53/52
              structural [61]  swing [57, 54, 50]  tactical [52]
HEAD        recommendations 61/57/53
              structural [65]  swing [57, 54, 52]  tactical []
exit code: 0
```

The `HEAD` row is recorded because it differs and hiding it would be the dishonesty: eight
days of further scheduled runs have replaced that slate with one carrying no tactical action
at all. That does not weaken the claim, which is about what became publishable rather than
about what any later run happened to publish — a tactical action at `52` was observed in
production, and it is still there at the commits above.

Every one of the 34 runs measured at filing carried exactly 55. The tactical value is the
decisive one: **52 was unreachable before Scope 2**, because the publish validator refuses
below `minimumActionConfidence` and above `tacticalConfidenceCap`, and both were 55.

Both halves of the packet are therefore confirmed in production rather than asserted. The
rendered contract made the author differentiate, and the threshold separation gave a
tactical action somewhere to stand.

## Validation Re-Derivation (2026-08-22, commit 0380cfdc2)

### Validation Evidence

The transcripts in this section and above were re-run 2026-08-28 at `HEAD` (`e686f1405`)
rather than re-read; each block below carries the command, its real output and its real exit
status. The canonical suite at that commit:

```
$ node scripts/selftest.mjs
exit: 0
lines: 3898
sha256: 04c69541931ee5bebbec85c5b42f7b0f7fe4d821cd43e99d5b0176c8d09c234d
(head and tail of a bounded capture; the sha256 covers all 3898 lines)
================================================
Research-Lab self-test: 3429 passed, 0 failed
================================================
```

Captured through `.github/bubbles/scripts/evidence-capture.sh`, so the hash is re-derivable
by re-running the same command under `--verify`.

An independent validation pass re-derived the claims above by running the commands rather
than re-reading the transcripts. Three of the report's own figures had gone stale between
the last report edit and `HEAD`, and one blocking product defect was found.

The confidence measurement re-derived cleanly. Walking every committed
`market-brief.payload.json` blob as of `e6dfdeced^` and partitioning `nextSession.actions`
by horizon over the same 34-run window the report names reproduces its histogram exactly,
and the minimum holds over all 198 payload revisions, not just the 34:

```
$ python3 -c "
import json,subprocess,collections
revs=subprocess.run(['git','rev-list','e6dfdeced^','--','market-brief.payload.json'],capture_output=True,text=True).stdout.split()
print('total payload commits as-of e6dfdeced^:',len(revs))
def acts(rev):
    b=subprocess.run(['git','show',rev+':market-brief.payload.json'],capture_output=True,text=True).stdout
    try: d=json.loads(b)
    except Exception: return []
    return (d.get('nextSession') or {}).get('actions',[]) or []
last34=revs[:34]
def cdate(r): return subprocess.run(['git','log','-1','--format=%aI',r],capture_output=True,text=True).stdout.strip()
print('last-34 window:',cdate(last34[-1]),'->',cdate(last34[0]))
by=collections.defaultdict(collections.Counter)
for r in last34:
    for a in acts(r): by[a.get('horizon')][a.get('confidence')]+=1
for h in ('structural','swing','tactical'):
    print(f'  last34 {h:<11}',json.dumps({str(k):v for k,v in sorted(by[h].items())}))
allmin=min((a.get('confidence') for r in revs for a in acts(r) if isinstance(a.get('confidence'),int)),default=None)
print('  ALLHIST min action confidence ever published (as-of e6dfdeced^):',allmin)
"
total payload commits as-of e6dfdeced^: 198
last-34 window: 2026-08-14T13:52:53-07:00 -> 2026-08-20T14:01:30-07:00
  last34 structural  {"56": 15, "57": 19}
  last34 swing       {"55": 102}
  last34 tactical    {"55": 34}
  ALLHIST min action confidence ever published (as-of e6dfdeced^): 55
exit code: 0
```

Re-run 2026-08-28; the histogram and the all-history minimum come back identical. The window
end reads `14:01:30` here against the `14:01:34` first recorded because this re-run prints the
author date and the original printed the committer date — `34c5d4eee` carries both
(`%aI 2026-08-20T14:01:30-07:00`, `%cI 2026-08-20T14:01:34-07:00`). Same commit, same window.

The committed payload now carries the spread the packet declined to promise:

```
$ python3 -c "
import json,subprocess
d=json.loads(subprocess.run(['git','show','0380cfdc2:market-brief.payload.json'],capture_output=True,text=True).stdout)
print('recommendation confidences:', '/'.join(str(r.get('confidence')) for r in d.get('recommendations',[])))
print('nextSession.actions:', '  '.join(f\"{a.get('horizon')}/{a.get('confidence')}\" for a in (d.get('nextSession') or {}).get('actions',[])))
"
recommendation confidences: 61/57/53/52
nextSession.actions: structural/61  swing/57  swing/54  tactical/52  swing/50
exit code: 0
```

### Stale figures corrected

| Section | Figure as written | Re-derived at `HEAD` |
|---|---|---|
| § Test Evidence | `3220 passed, 0 failed` | `3241 passed, 0 failed` |
| § Blast Radius | three files, "no threshold … modified" | twelve files; `minimumActionConfidence` 55 → 50 |
| § Summary, § Completion Statement | Scope 2 unstarted, Scope 1 "10 of 10" | Scope 2 Done (9 of 9); Scope 1 14 of 14 |
| § Rendered Output | live render at floor `55`, "exactly one admissible value" | live render at floor `50`, band `50` to `55` (added by the audit pass, 2026-08-22) |

The § Summary and § Completion Statement sentences are corrected above, because they
contradicted this report's own § Threshold Decision, `scopes.md` and `state.json`. The
§ Test Evidence, § Blast Radius and § Rendered Output blocks are left as written: each
was true when recorded, and rewriting a captured transcript would destroy the evidence
rather than correct it. This table is the correction.

### Blocking defect found — module byte budget

`tests/attention-browser.spec.mjs` holds six performance budgets. The delivery pushed
`rlattention.js` past the module ceiling, and the browser suite was not re-run afterwards:

```
Error: BUDGET 1 module initialisation: rlattention.js added 47369 bytes to first load, over the 47104 byte ceiling
  1 failed
  15 passed (18.1s)
```

`47369` is the byte size of the committed file. Commit `009731726` took it from `47075` to
`47369` while the ceiling is `46 * 1024 = 47104`, an overshoot of 265 bytes. The suite's
own comment states the rule: a red budget is fixed by fixing the code, never by widening
the ceiling. The ceiling was left untouched by this validation pass and the defect is
reported rather than absorbed.

This also falsifies two Definition of Done items in each scope that cite
`report.md § Regression E2E` and the figure `2 passed` as evidence that the *broader* E2E
regression suite passes. That section records a two-test run, not the sixteen-test suite,
and the sixteen-test suite is red at `HEAD`.

### Blocking defect fixed (2026-08-22)

The breach was independently re-derived before acting on it, and re-derived again 2026-08-28
from the commit that caused it rather than from the fixed file:

```
$ git show 009731726:rlattention.js | wc -c
47369
$ node -e "console.log(46 * 1024)"   # the moduleBytes ceiling, tests/attention-browser.spec.mjs:667
47104
exit code: 0
overshoot = 47369 - 47104 = 265 bytes
```

Fixed by fixing the code, not the ceiling. The overshoot came from this packet's own
comments in `rlattention.js`, which were longer than the repository's stated guidance of
one short line stating what the code cannot show. Three comment blocks were condensed and
every load-bearing fact kept: the R-5 reason the freshness label exists rather than a
recompose, the reason `observedAt` is interpolated only after trimming, and the reason the
systemic code is in `REFUSAL_CODES`. No behaviour, no export and no assertion changed.

```
rlattention.js = 46829 bytes; ceiling = 47104; headroom = 275
Research-Lab self-test: 3241 passed, 0 failed
16 passed (18.5s)
```

The full sixteen-test browser suite is green, so the two Definition of Done items the
validate phase falsified now cite that run instead of the two-test one.

### Correction — the "0 failed" claim in commit 009731726

That commit's message and the test-phase note in `state.json` both state `3239 passed,
0 failed`. The assertion COUNT is right and the suite was genuinely green in the worktree
where it ran. It was not green at the commit: the worktree was based on a parent that
predated the payload carrying `backdrop.structuralTrend`, and rebasing onto `bbbe3a481`
brought in an inherited failure the run had never seen. The honest statement is that the
suite passed pre-rebase and one inherited assertion failed post-rebase, fixed by
`0380cfdc2`.

The historical note and commit message are left as written rather than rewritten, because
a captured claim is evidence of what was believed at the time; this correction is recorded
beside it instead. The general lesson is recorded too: a suite result is only valid for
the tree it ran against, so a rebase invalidates it and the suite must be re-run after.

## Independent Audit (2026-08-22, commit `ac8d3f3ef`)

### Audit Evidence

Run in a detached worktree at `origin/main`. Every figure below came from a command run in
that worktree, not from re-reading this report.

Re-derived green: `node scripts/selftest.mjs` exit 0, `3241 passed, 0 failed`;
`node scripts/validate-brief-payload.mjs` exit 0; `node scripts/validate-tool-experience.mjs`
exit 0; `tests/attention-browser.spec.mjs` exit 0, `16 passed`; `rlattention.js` 46829 bytes
against the unchanged `46 * 1024` ceiling; `git status --porcelain` empty.

Re-derived claims: every recommendation in the committed payload history from 2026-08-14 to
2026-08-20 carries `confidence: 55` (113 of 113 over 38 payload commits), and the payload at
`HEAD` carries `61/57/53/52` with `nextSession.actions` at `61/57/54/52/50`, so the field now
varies in production. `market-brief.config.json` and `market-brief.config.page.json` both
carry `minimumActionConfidence: 50` against an unchanged `tacticalConfidenceCap: 55`. The
commit that restored the byte budget (`ac8d3f3ef`) touches comments only.

Findings this pass raised. The audit reported rather than acted, which was the right
division of labour; each one is dispositioned in `## Discovered Issues` below, and all but
the two belonging to other artifacts are closed in this same delivery:

1. **`spec.md` FR-014-006 is contradicted by the shipped change.** It reads "MUST NOT alter
   either value", the spec's scope-exclusion section read "Changing any threshold value",
   and the Gherkin
   for `SCN-BUG014-COLLISION-DISCLOSED` reads "neither threshold is modified by this
   packet". Scope 2 moved `minimumActionConfidence` from 55 to 50. `scenario-manifest.json`
   carries a `supersededNote` for that scenario and `spec.md` does not. Amending a
   requirement is spec ownership, so the audit reports it instead of editing it.
2. **`detailFieldChars` / `detailFields` and `briefBackdropKeysInstruction` have no packet
   record.** Both are committed behaviour with selftest coverage and neither appears in any
   `spec.md`, `scopes.md`, scenario or Definition-of-Done item across the three packets.
   Spec 026's `design.md` still declares `output-budget/v1` as
   `{ headlineChars, decisionCardChars, totalDefaultVisibleChars, defaultVisibleFields[] }`.
3. **The systemic `RLATTN-SNAPSHOT-UNOBSERVABLE` record is constructed twice** in
   `scripts/build-attention-items.mjs`, verbatim, in `recomposePayloadAttention` and in
   `main`; and `main` prints `${exclusions.length} refused` while iterating
   `recordedExclusions`, so the outage case prints one more refusal line than it counts.
4. **Commit `0380cfdc2` also cleared three recorded `RLATTN-OVERLAP` exclusions** from
   `market-brief.payload.json` (XLK, QQQ, SPMO). Its message names only the backdrop keys
   and the dropped narrative.

Corrected by this pass: § Rendered Output is now marked as captured under the pre-Scope-2
configuration, and appears in § Stale figures corrected. No assertion, budget, threshold or
Definition-of-Done item was changed, and no state or certification field was written — the
`audit` phase is NOT recorded in `state.json`, so Gate G022 remains open for this packet.

## Discovered Issues

Every issue the specialist phases raised against this delivery, dated 2026-08-22, with what
was actually done about it. The audit reported all of these rather than acting on them; the
dispositions below are the owner response, and every one is closed here except the two that
belong to other artifacts.

| # | Issue | Disposition | Reference |
|---|---|---|---|
| A1 | `spec.md` FR-014-006 said the packet MUST NOT alter either threshold; Scope 2 moved the floor 55 → 50 | **Fixed.** FR-014-006 superseded by FR-014-007, original text kept visible rather than rewritten. The spec's scope-exclusion section amended for that one key only. `SCN-BUG014-COLLISION-DISCLOSED` re-stated against a fixture and paired with `SCN-BUG014-BAND-EXISTS` | `spec.md` FR-014-007 |
| A2 | `detailFieldChars` / `detailFields` and the backdrop-keys instruction shipped with no requirement, scenario or DoD anywhere | **Fixed.** FR-014-008 and FR-014-009 added, plus Scope 3 with 2 scenarios and 7 evidenced DoD items, and 2 manifest entries | `spec.md` FR-014-008/009, `scopes.md` Scope 3 |
| B1 | § Rendered Output was a transcript captured under the pre-Scope-2 config, cited as live evidence | **Fixed by the audit pass**, annotated rather than rewritten | § Stale figures corrected |
| B2 | "34 runs · 8 slates" reads as a date filter; it is a last-34 slice. Date-filtered the counts are 38 and 9 | **Recorded, not changed.** The load-bearing claim is unaffected and understated: all 113 recommendations in the window carry 55 | § Validation Re-Derivation |
| B3 | `rationaleDecisionNote` quotes max 575 / median 461; two rationales at 586 have since published, and the median was 448 | **Recorded, not changed.** The note is explicitly dated, the decision (700) is unaffected, and 586 is still inside the cap | `market-brief.config.json` |
| B4 | `attentionSubjectMenuInstruction` docstring says the 2026-08-20 feed "carried ONE"; it carried 3, 3, 1, 1, 1 | **Recorded, not changed.** True of the later runs only; the docstring's point (the lane under-selected) holds | `scripts/build-attention-items.mjs` |
| B5 | Commit `0380cfdc2` silently cleared three recorded `RLATTN-OVERLAP` refusals and the message did not say so | **Fixed, and the underlying defect with it.** The three rows are restored, and `recomposePayloadAttention` no longer treats a fresh list as authoritative when it derives candidates from published items — a refusal it cannot re-derive is now preserved. Pinned and mutation-proved | § Recompose Is No Longer Lossy |
| D1 | The systemic exclusion record was built twice, verbatim, in two functions | **Fixed.** Single `snapshotUnobservableExclusion()`, three call sites | `scripts/build-attention-items.mjs` |
| D2 | The console header printed `exclusions.length` while the loop printed `recordedExclusions`, undercounting by one in the outage case | **Fixed.** The header now counts what it prints | `scripts/build-attention-items.mjs` |
| D3 | Two `|| 55` fallbacks in `rlbrief.js` coerce a legitimate `0` and reproduce the cap-equals-floor collision if the key vanishes | **Fixed.** Both now use `isFinite`, matching the pattern already applied beside them | `rlbrief.js` |
| D4 | The core lane keeps the prose that caused the invented key | **Resolved as written.** The sentence is now followed by the rendered key list naming `primaryTrend`, so the ambiguity it created is gone; deleting the sentence would remove context without adding safety | `scripts/brief-narrative-parallel.mjs` |
| F1 | G090 was reported throughout as a worktree artifact; the audit asked whether that was true | **Confirmed, with proof.** `retro-convergence-health.sh` exits 0 once the gitignored `.specify/memory/bubbles.session.json` is supplied, and the file is unversionable by design. G090 is a fresh-worktree artifact and not an open item — the earlier characterisation was right, and is now evidenced rather than asserted | this section |
| F2 | BUG-009 carried 19 gate failures, disclosed nowhere in its packet, all missing E2E regression records | **Fixed in BUG-009 itself.** The coverage already existed — `tests/attention-browser.spec.mjs` drives exactly that surface — so what was missing was the record. Test Plan rows and DoD items added to all four scopes with a new `report.md` § Regression E2E, and four bare evidence markers given real references. 19 failures → 6 | `specs/_bugs/BUG-009-…/scopes.md` |
| F3 | Spec 026 was reported as not mentioning G136 in its `uservalidation.md` | **Not a defect.** The audit grepped for the literal `G136`. 026 already carries the full acceptance contract with the three required field names and an explicit "This record is unsigned" statement | `specs/026-…/uservalidation.md` |
| G1 | `scenario-test-resolve.sh` does not support the ` :: ` separator, so G057 resolves nothing for 7 of the repository's 12 manifests | **Belongs to the repository, not this packet.** Pre-existing, affects 7 manifests written by other work, and G057 is advisory today. Recorded so the next reader of that guard knows it is inert rather than clean | repo-wide |

## Recompose Is No Longer Lossy

`recomposePayloadAttention` derives its candidates from the PUBLISHED items, so a candidate
refused on an earlier run is not present and its refusal can never be re-derived. The rule
was `candidates.length > 0 ? fresh : prior`, which made an empty fresh list authoritative
whenever anything was published — and erased real accounting:

```
$ python3 -c "
import json,subprocess
for ref in ('0380cfdc2^','0380cfdc2','HEAD'):
    b=subprocess.run(['git','show',ref+':market-brief.payload.json'],capture_output=True,text=True).stdout
    ex=json.loads(b).get('attentionExclusions',[])
    print(f'{ref:<12} exclusions={len(ex)}  codes={[e.get(\"code\") for e in ex]}')
"
0380cfdc2^   exclusions=3  codes=['RLATTN-OVERLAP', 'RLATTN-OVERLAP', 'RLATTN-OVERLAP']
0380cfdc2    exclusions=0  codes=[]
HEAD         exclusions=5  codes=['RLATTN-OVERLAP', 'RLATTN-OVERLAP', 'RLATTN-OVERLAP', 'RLATTN-OVERLAP', 'RLATTN-OVERLAP']
exit code: 0
```

Re-run 2026-08-28. The `HEAD` row is included because the erasure is only interesting against
what survived: the three restored rows are still carried, beside two later ones.

Prior rows are now kept and fresh ones layered over them, matched on `code|subject` so a
re-derived refusal replaces its own row instead of doubling it. The rows are restored and
survive a recompose — re-derived here at `HEAD`, read-only, because `--recompose` persists
nothing without `--write`:

```
$ node scripts/build-attention-items.mjs --recompose
[build-attention-items] recomposed: 1 built, 0 refused
[build-attention-items] re-measured output budget: total=1512 disclosed=134309 violations=0
[build-attention-items] --recompose without --write: nothing written
exit code: 0

$ node --input-type=module -e '
import { readFileSync } from "node:fs";
import { recomposePayloadAttention } from "./scripts/build-attention-items.mjs";
const payload = JSON.parse(readFileSync("market-brief.payload.json", "utf8"));
const config = JSON.parse(readFileSync("market-brief.config.json", "utf8"));
const before = (payload.attentionExclusions || []).map((e) => `${e.code}/${e.subject}`);
console.log("  before recompose:", before.length, "exclusions", JSON.stringify(before));
const result = recomposePayloadAttention(payload, config);
const after = (result.payload.attentionExclusions || []).map((e) => `${e.code}/${e.subject}`);
console.log("  fresh refusals this recompose:", result.exclusions.length);
console.log("  after recompose: ", after.length, "exclusions", JSON.stringify(after));
console.log("  every prior row survived:", before.every((b) => after.includes(b)));
'
  before recompose: 5 exclusions ["RLATTN-OVERLAP/MSFT","RLATTN-OVERLAP/XLK","RLATTN-OVERLAP/QQQ","RLATTN-OVERLAP/SPMO","RLATTN-OVERLAP/XLE"]
  fresh refusals this recompose: 0
  after recompose:  5 exclusions ["RLATTN-OVERLAP/MSFT","RLATTN-OVERLAP/XLK","RLATTN-OVERLAP/QQQ","RLATTN-OVERLAP/SPMO","RLATTN-OVERLAP/XLE"]
  every prior row survived: true
exit code: 0

$ git status --porcelain -- market-brief.payload.json
(no output — the payload was not written)
```

Mutation-proved: reverting to `const recordedExclusions = freshExclusions;` fails by name
with `a recompose carries forward a refusal it cannot re-derive rather than erasing it`, and
passes again when restored.
