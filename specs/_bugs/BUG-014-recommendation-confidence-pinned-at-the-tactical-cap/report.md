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
`direction/horizon/confidence` of each recommendation.

```
date/time         direction/horizon/confidence slate
  2026-08-14 13:52 hold/stru/55|rotate/swin/55|hedge/swin/55
  ...
  2026-08-17 13:58 hold/stru/55|rotate/swin/55|hedge/swin/55   SAME
  2026-08-18 04:22 rotate/swin/55|hedge/swin/55                CHANGED
  2026-08-19 14:08 hedge/swin/55|add/swin/55                   CHANGED
  2026-08-19 23:54 hedge/swin/55|add/swin/55|add/swin/55|trim/swin/55  CHANGED
  2026-08-20 05:58 add/swin/55|trim/swin/55|add/swin/55|hedge/swin/55  CHANGED
  2026-08-20 14:01 hedge/swin/55|trim/swin/55                  CHANGED

runs=34  distinct=8  transitions=7
```

Two independent facts fall out of the same table:

1. **Feature 026's F-026-2 is fixed.** 13 consecutive identical slates from 2026-08-14
   to 2026-08-17 became 7 transitions across the following 21 runs.
2. **`confidence` is invariant.** 8 distinct slates, both `swing` and `structural`
   horizons, 34 runs, and exactly one confidence value: `55`.

## Rendered Output

`node -e "import('./scripts/build-attention-items.mjs')..."`

```
Choose each confidence as a 0-100 reading of how strong that item's evidence actually is,
and vary it across items. It gates and it ranks: an action below 55 and an attention card
below 55 reach no reader, and surviving actions are sorted by this number, so items
sharing one value cannot be ranked and get cut in the order you happened to write them
rather than by conviction. 55 is the ceiling for a tactical-horizon item and also the
action floor, so a tactical action has exactly one admissible value: 55. A tactical read
you would not defend at that number belongs as a watch idea rather than an action. A
swing or structural call resting on corroborated evidence belongs clearly above the
floor, and a thin one belongs below it as a watch idea instead of an action. Do not give
two items the same confidence unless you genuinely cannot separate them.
```

The other two branches, exercised through the override seam:

```
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
regenerated. The scenario failed, naming the rendered actions beneath it:

```
✘  every next-session action the cockpit renders clears the committed confidence floor
    - Expected  - 1
    + Received  + 7
```

Restoring the committed floor returned it to `1 passed`, and `git diff --stat` on
`market-brief.config.json` confirmed the probe left nothing behind.

That probe also **corrected a claim in this packet**. The scenario's first comment said
`renderNextSession` drops anything below the floor. It does not: it applies the floor only
in its FALLBACK path, and renders `payload.nextSession.actions` verbatim when they exist.
The floor is enforced at publish by `validate-brief-payload.mjs`. The scenario is still
worth its place — it catches a config-versus-payload disagreement, which is exactly what
raising the floor without recomposing would create — but the comment was rewritten to say
what the probe showed rather than what was assumed.

### Code Diff Evidence

`git show --stat e6dfdeced` — the delivery commit:

```
git show --stat e6dfdeced
e6dfdeced feat(brief): decide the four open questions, against measurement rather than preference

 market-brief.config.json                           |  8 +-
 market-brief.config.page.json                      |  2 +-
 market-brief.html                                  | 11 +++
 rlattention.js                                     | 23 +++++
 rlcockpit.js                                       | 39 ++++++++-
 scripts/brief-narrative-parallel.mjs               |  4 +-
 scripts/build-attention-items.mjs                  | 80 ++++++++++++++++-
 scripts/selftest.mjs                               | 99 +++++++++++++++++++++-
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
horizon separated two causes the filing had conflated:

```
  nextSession structural   confidences: {56: 15, 57: 19}
  nextSession swing        confidences: {55: 102}
  nextSession tactical     confidences: {55: 34}
```

Structural actions vary. Tactical does not, and cannot: the publish validator refuses
below `minimumActionConfidence` and above `tacticalConfidenceCap`, both 55, so 55 was the
only legal value — and a tactical action published on all 34 runs.

`tacticalConfidenceCap` stays 55 because `notes/market-brief.md` states that ceiling twice
as anti-reactivity doctrine. `minimumActionConfidence` moves to 50. The change excludes
nothing already published:

```
  min action confidence ever published: 55
```

The contract needed no code change to follow it, which is what the generic derivation was
for:

```
A tactical-horizon item is capped at 55, so it may only occupy 50 to 55; that band is a
ceiling, never a default and never a target.
```

## Test Evidence

### Selftest

`node scripts/selftest.mjs`

```
Research-Lab self-test: 3220 passed, 0 failed
```

Exit code 0, zero `✗` marks. The count moved 3192 → 3200 when Scope 1 landed, and 3200 →
3220 across Scope 2 and the regression remediation below.

The assertions this packet owns, transcribed from the current run rather than from the
run that first produced them — the earlier transcription went stale the moment Scope 2
moved the floor and the regression pass rewrote the three threshold pins, and a
regression finding caught it:

```
✓ the confidence contract states the enforced minimumActionConfidence of 50 and follows it when that one threshold moves, so the value is read rather than coincidentally present
✓ the confidence contract states the enforced minimumAttentionConfidence of 55 and follows it when that one threshold moves, so the value is read rather than coincidentally present
✓ the confidence contract states the enforced tacticalConfidenceCap of 55 and follows it when that one threshold moves, so the value is read rather than coincidentally present
✓ the confidence contract tells the author the number ranks, and to vary it - the two facts that make a pinned value harmful
✓ both the core and signals lanes render the confidence contract, because both author a confidence
✓ the hand-typed tactical-cap sentence is gone rather than left beside the rendered contract as a second copy
✓ the confidence contract derives a DIFFERENT tactical clause for cap-below-floor, cap-above-floor and cap-equals-floor rather than restating one fixed sentence
✓ the tactical cap leaves a band above the action floor, so a tactical action is not forced onto a single admissible value (cap 55 vs floor 50)
✓ live config gives tactical a real band and the contract states that band rather than a single value
✓ minimumActionConfidence sits on the 0-100 scale the contract tells the author to use, so the bar it states is reachable (50)
✓ minimumAttentionConfidence sits on the 0-100 scale the contract tells the author to use, so the bar it states is reachable (55)
✓ tacticalConfidenceCap sits on the 0-100 scale the contract tells the author to use, so the bar it states is reachable (55)
✓ the cockpit reads a configured threshold with a finite check rather than ||, so a deliberate 0 is not silently replaced by the fallback
```

Validator exit 0. `validate-tool-experience` exit 0 with
`brief-first-load bytes=184621 budget=204800 result=PASS`.

### Adversarial Check

A pin that cannot fail is decoration. The core-lane interpolation was removed and the
suite re-run:

```
exit=1 (expect non-zero)
1
  ✗ FAIL: both the core and signals lanes render the confidence contract, because both author a confidence
```

The wiring was then restored and re-counted at 2 interpolations, and the suite returned
to 3200 passed / 0 failed with 0 `✗` — 3200 being the count at that time, before Scope 2
and the regression remediation took it to 3220.

### Regression Remediation

An independent regression pass mutation-probed this packet's own pins and found one that
could not fail. The three per-threshold assertions used a substring check on the enforced
value while two thresholds were both 55, so the attention-floor pin was satisfied by
prose the tactical cap supplied. Proof, evaluating both pin forms against a render with
the attention floor deleted:

```
minimumActionConfidence      OLD_PIN=PASS  NEW_PIN=PASS
minimumAttentionConfidence   OLD_PIN=PASS  NEW_PIN=FAIL
tacticalConfidenceCap        OLD_PIN=PASS  NEW_PIN=PASS
… an action below 50 and an attention card below an unstated floor reach no reader …
```

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

`grep -c "Keep tactical confidence at or below the configured cap" scripts/brief-narrative-parallel.mjs`

```
0
```

### Validator

`node scripts/validate-brief-payload.mjs`

```
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
```

Exit code 0.

## Blast Radius

`git diff --numstat`

```
3       3       scripts/brief-narrative-parallel.mjs
59      0       scripts/build-attention-items.mjs
48      1       scripts/selftest.mjs
```

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

## Validation Re-Derivation (2026-08-22, commit 0380cfdc2)

An independent validation pass re-derived the claims above by running the commands rather
than re-reading the transcripts. Three of the report's own figures had gone stale between
the last report edit and `HEAD`, and one blocking product defect was found.

The confidence measurement re-derived cleanly. Walking every committed
`market-brief.payload.json` blob as of `e6dfdeced^` and partitioning `nextSession.actions`
by horizon over the same 34-run window the report names reproduces its histogram exactly,
and the minimum holds over all 198 payload revisions, not just the 34:

```
total payload commits as-of e6dfdeced^: 198
last-34 window: 2026-08-14T13:52:53-07:00 -> 2026-08-20T14:01:34-07:00
  last34 structural  {"56":15,"57":19}
  last34 swing       {"55":102}
  last34 tactical    {"55":34}
  ALLHIST min action confidence ever published (as-of e6dfdeced^): 55
```

The committed payload now carries the spread the packet declined to promise:

```
recommendation confidences: 61/57/53/52
nextSession.actions: structural/61  swing/57  swing/54  tactical/52  swing/50
```

### Stale figures corrected

| Section | Figure as written | Re-derived at `HEAD` |
|---|---|---|
| § Test Evidence | `3220 passed, 0 failed` | `3241 passed, 0 failed` |
| § Blast Radius | three files, "no threshold … modified" | twelve files; `minimumActionConfidence` 55 → 50 |
| § Summary, § Completion Statement | Scope 2 unstarted, Scope 1 "10 of 10" | Scope 2 Done (9 of 9); Scope 1 14 of 14 |

The § Summary and § Completion Statement sentences are corrected above, because they
contradicted this report's own § Threshold Decision, `scopes.md` and `state.json`. The
§ Test Evidence and § Blast Radius blocks are left as written: both were true when
recorded, and rewriting a captured transcript would destroy the evidence rather than
correct it. This table is the correction.

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

The breach was independently re-derived before acting on it:

```
rlattention.js = 47369 bytes; ceiling = 47104
overshoot = 265 bytes
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
