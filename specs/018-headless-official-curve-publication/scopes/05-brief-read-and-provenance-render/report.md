# Scope 5 Execution Report — Brief Read And Provenance Render

This file is the evidence surface for scope 5. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

The bond card now renders one geometry across three publication states. Credit
and duration are always two labelled rows, so a partial verdict is stated rather
than inferred from one row being populated; no machine value reaches the reader;
and every state token is a shape glyph plus a word, so the card survives having
all colour removed and being zoomed to 200%.

The `sourceStatusTable` gained a *Retrieved* column beside the existing *Observed
as of*, keeping those two facts separate. Official families name their source id
and link their host; restricted families name their rights class and render no
link and no value, because for a memory-only observation the link would itself be
the disclosure.

Routed item **R-2** is settled with the basis the cadence rule actually emits:
the underivable card states `2 observed gaps available against the 5 this
family's cadence rule requires`, parsed from the real admission block rather than
invented at the render boundary.

Browser gate: **36 passed** (28 pre-existing + 8 added), zero skipped. Every
classifier in `bond-regime-lab.html` is byte-identical.

## Test Evidence

### TP-05-01

Scenario SCN-018-032 — the bond card shows credit and duration as two labelled
rows, paints no `unavailable` slug, and states the one-axis-resolved consequence
in words.
Command: `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome`

```
  ✓  29 [system-chrome] › tests/bond-regime-lab.spec.mjs:809:1 › TP-05-01 BS-018-017 render: the partial-resolution card shows both axes as labelled rows and paints no machine slug (4.9s)
EXIT=0
```

The decisive assertions:

```js
await expect(card.locator('.brl-axes dt')).toHaveCount(2);
await expect(card.locator('.brl-axes dt').nth(0)).toHaveText('Credit regime');
await expect(card.locator('.brl-axes dt').nth(1)).toHaveText('Duration posture');
expect(text).not.toMatch(/(^|\s)unavailable(\s|$)/);
expect(text).not.toContain('Indeterminate');
expect(text).toMatch(/One axis resolved and one did not/);
expect(text).toMatch(/No sleeve is ranked/);
await token.focus(); await expect(token).toBeFocused();
expect(await token.getAttribute('aria-label')).toContain(tip);
```

### TP-05-02

Scenario SCN-018-033 — the stale card names its reason and its last good
observation, and shows no classification beside a withheld family.
Command: `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome`

```
  ✓  30 [system-chrome] › tests/bond-regime-lab.spec.mjs:837:1 › TP-05-02 BS-018-009 render: the stale card names its window and its last good observation as not current (3.7s)
EXIT=0
```

The not-current qualifier is asserted INSIDE the same string as the date, and
again inside the token's `title`, so it lands in the accessible name rather than
sitting beside it where a screen reader could separate them:

```js
expect(text).toMatch(/4-day derived window/);
expect(text).toMatch(/58 days old/);
expect(text).toMatch(/Last good observation 2026-01-02 — not current/);
expect(tip).toMatch(/Last good observation 2026-01-02 — not current/);
expect(text).not.toMatch(/\b(Positive|Inverted|Flat|Bull Steepener|Bear Steepener|Heating|Cooling)\b/);
```

### TP-05-03

Scenario SCN-018-034 — the absent card renders the published string verbatim and
states that nothing was substituted.
Command: `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome`

```
  ✓  31 [system-chrome] › tests/bond-regime-lab.spec.mjs:861:1 › TP-05-03 BS-018-015 render: the absent card states that nothing was substituted and prints the published read verbatim (3.6s)
EXIT=0
```

```js
await expect(card.locator('.brl-fam')).toHaveCount(3);
expect(text).toMatch(/Nothing was substituted — no zero, no neutral filler, no carried value/);
await expect(card.locator('.ay')).toHaveText(published);
expect(await card.locator('.ay').getAttribute('aria-label')).toBeNull();
```

### TP-05-04

Scenario SCN-018-004 — the provenance row carries source id, host, observed as-of
and retrieval time labelled UTC, with no empty cell and no bare dash.
Command: `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome`

```
  ✓  32 [system-chrome] › tests/bond-regime-lab.spec.mjs:880:1 › TP-05-04 the source table renders observed as-of and retrieval time with a reachable official source URL (897ms)
EXIT=0
```

```js
expect(headers).toEqual(['Family', 'State', 'Observed as of', 'Retrieved', 'Source / rights']);
expect(retrieved).toMatch(/UTC$|^Not retrieved$/);
expect(await link.getAttribute('href')).toMatch(/^https:\/\/home\.treasury\.gov\//);
for (const cell of cells) { expect(cell.trim()).not.toBe(''); expect(cell.trim()).not.toBe('—'); }
```

### TP-05-05

Scenario SCN-018-018 — no restricted value appears in the card, the source table
or any persisted browser store.
Command: `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome`

```
  ✓  33 [system-chrome] › tests/bond-regime-lab.spec.mjs:911:1 › TP-05-05 no restricted value or restricted source URL is rendered anywhere (1.2s)
EXIT=0
```

The sweep covers the rendered body AND both persisted browser stores, because a
value kept out of the DOM but written to `localStorage` is still a disclosure:

```js
await expect(page.locator('[data-source-note="' + id + '"] a')).toHaveCount(0);
expect(body).not.toMatch(/\boas\s*[:=]\s*\d/i);
expect(persisted).not.toMatch(/api_key|apikey|fred\.stlouisfed\.org/i);
```

### TP-05-06

Scenario SCN-018-035 — an undetermined admission paints the unavailable glyph and
states the observed-gap count against the required count.
Command: `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome`

```
  ✓  34 [system-chrome] › tests/bond-regime-lab.spec.mjs:931:1 › TP-05-06 BS-018-010 render: an underivable admission states its observed-gap count and asserts neither current nor stale (3.6s)
EXIT=0
```

Routed item **R-2** is settled with the basis the rule itself emits, not a
wording invented at the render boundary:

```
$ node -e "...admitCurveFamily(conformant,'nominal','2026-01-03')..."
{"verdict":"undetermined","errorCode":"BRL-CURVE-FRESHNESS-UNDERIVABLE","lastGoodObservedAt":null,"elapsedDays":null,"windowDays":null,"basis":"insufficient-observed-history-gaps-2-of-5"}
```

```js
await expect(token).toContainText('Unavailable');
await expect(token).not.toContainText('Stale');
expect(text).toMatch(/2 observed gaps available against the 5 this family's cadence rule requires/);
expect(text).toMatch(/Neither current nor stale is asserted/);
```

### TP-05-07

Scenario SCN-018-032 — curve level and curve impulse never share a row, and real
yield and derived breakeven never share a row or an as-of.
Command: `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome`

```
  ✓  35 [system-chrome] › tests/bond-regime-lab.spec.mjs:947:1 › TP-05-07 curve level, curve impulse and the inflation pair never share a row, a token or an as-of (4.9s)
EXIT=0
```

Asserted at BOTH 1440 and 390 widths, because separation that only holds on a
wide viewport is not separation:

```js
expect(labels).toEqual(['Curve level', 'Curve impulse', 'Real yield and breakeven']);
await expect(card.locator('.brl-fam .brl-tok')).toHaveCount(3);
expect(boxes[1]).toBeGreaterThan(boxes[0]);
expect(breakevenNote).toMatch(/\d+ common dates? of \d+ nominal observations?/);
```

### TP-05-08

Scenarios SCN-018-032, SCN-018-034 — every state is readable with colour removed
and at 200% zoom, the axes never fuse at any width, and every existing bond-tool
row still passes.
Command: `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome`

```
  ✓  36 [system-chrome] › tests/bond-regime-lab.spec.mjs:975:1 › TP-05-08 Regression: every publication state stays readable with colour removed and at 200% zoom (4.7s)
  36 passed (1.1m)
EXIT=0
```

Colour is removed by injecting a stylesheet that forces every element to black on
white, so the state must be readable from glyph plus word alone. Fusion is
checked by comparing the two axis rows' bounding boxes at 200% font size.

## Build Quality Gate Evidence

### browser gate

Command: `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome`

```
  36 passed (1.1m)
EXIT=0
```

28 pre-existing rows plus the 8 added here, zero skipped, zero failed.

**Non-vacuity canary.** A row that passes against a removed feature proves
nothing, so the card body was temporarily neutered and the suite re-run. All six
card rows failed; TP-05-04 and TP-05-05 are source-table rows and correctly were
not affected. The hook was then removed from both files.

```
  6 failed
    TP-05-01 BS-018-017 render: the partial-resolution card shows both axes as labelled rows and paints no machine slug
    TP-05-02 BS-018-009 render: the stale card names its window and its last good observation as not current
    TP-05-03 BS-018-015 render: the absent card states that nothing was substituted and prints the published read verbatim
    TP-05-06 BS-018-010 render: an underivable admission states its observed-gap count and asserts neither current nor stale
    TP-05-07 curve level, curve impulse and the inflation pair never share a row, a token or an as-of
    TP-05-08 Regression: every publication state stays readable with colour removed and at 200% zoom
$ grep -c "__BRL_CANARY__" rlbrief.js tests/bond-regime-lab.spec.mjs
rlbrief.js:0
tests/bond-regime-lab.spec.mjs:0
EXIT=0
```

### selftest

Command: `node scripts/selftest.mjs`

```
  ✓ the cockpit’s whole first-load payload is inside budget (184 KB <= 200 KB)
  ✗ FAIL (trend-dynamics-cycle-lab publication threw): function not found: tdcPublishToolRead
Research-Lab self-test: 1489 passed, 1 failed
```

Recorded honestly: the suite does NOT exit 0 on this working tree, and the single
failure is not mine. It is a concurrent session's in-flight spec-006 work on
`trend-dynamics-cycle-lab`, carried by `scripts/selftest.mjs` and
`trend-dynamics-cycle-lab.html` — both on THIS scope's excluded list, neither
modified by me, neither staged. The first-load budget assertion, which this
scope's added markup could plausibly have broken, passes at 184 KB against the
committed 200 KB ceiling.

### publication gate

Command: `node scripts/validate-brief-payload.mjs`

```
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
EXIT=0
```

### spec-test-path guard

Command: `node scripts/validate-spec-test-paths.mjs`

```
[spec-test-paths] scanned=543 references=11853 distinctPaths=218 missingPaths=86 baseline=86 new=0 stale=0
[spec-test-paths] OK — no new missing test path(s)
EXIT=0
```

### change boundary

Command: `git diff --name-only`

```
$ git status --porcelain   # concurrent sessions' spec dirs filtered out
 M bond-regime-lab.html          <-- Allowed (sourceStatusTable markup + its renderer only)
 M market-brief.html             <-- Allowed
 M notes/bond-regime-lab.md      <-- Allowed
 M notes/market-brief.md         <-- Allowed
 M rlbrief.js                    <-- Allowed
 M tests/bond-regime-lab.spec.mjs <-- Allowed
 M scripts/selftest.mjs          <-- NOT MINE (concurrent session, excluded, not staged)
 M trend-dynamics-cycle-lab.html <-- NOT MINE (concurrent session, excluded, not staged)
EXIT=0
```

Every classifier named on the excluded list is byte-identical, and the
`bond-regime-lab.html` diff is three hunks — two in the table markup, one in the
source-table renderer:

```
$ for f in parseTreasuryCurveCsv classifyCurveState classifyCurveImpulse deriveBreakevenRows classifyInflationState classifyDurationPosture selectResearchExpression computeBondLabViewModel; do printf "%s: " "$f"; git diff bond-regime-lab.html | grep -cE "^[-+].*function $f\("; done
parseTreasuryCurveCsv: 0
classifyCurveState: 0
classifyCurveImpulse: 0
deriveBreakevenRows: 0
classifyInflationState: 0
classifyDurationPosture: 0
selectResearchExpression: 0
computeBondLabViewModel: 0
$ git diff bond-regime-lab.html | grep -E "^@@"
@@ -587,6 +587,7 @@
@@ -595,36 +596,42 @@
@@ -2225,12 +2232,58 @@
EXIT=0
```

Zero warnings, counted on non-assertion lines because assertion titles in this
repository legitimately contain the word:

```
$ npx --no-install playwright test ... | grep -ciE "warning|deprecat"
0
$ node scripts/selftest.mjs 2>&1 | grep -vE "^\s*[✓✗]" | grep -ciE "warning|deprecat"
0
EXIT=0
```

## Findings Raised

**The tooltip contract was not met by the first implementation, and was fixed
rather than reworded.** The state tokens shipped with a bare `title` on a
non-focusable `<span>`, which is hover-only. The DoD asks for a tooltip reachable
by keyboard focus with identical content across focus, activation and hover. The
tokens now carry `tabindex="0"` and an `aria-label` containing the same two-part
string, and TP-05-01 asserts focus and content equality. Softening the DoD item to
match the weaker implementation would have been the easy path and the wrong one.

**Fixtures are inline rather than committed files.** The scope's Implementation
Files list named no new fixture paths and its Allowed table has no fixture family,
so the four publication states are constructed inside
`tests/bond-regime-lab.spec.mjs`. This keeps the change boundary exact.

**The card rows drive the production renderer directly rather than intercepting a
fetch.** The committed payload carries no bond entry (established in Scope 4), so a
network-driven card test would have had to intercept a request — which this
repository's Live-Stack Test Authenticity rule classifies as mocked. Each row
instead navigates to the real `market-brief.html`, waits for the real `RLBRIEF` to
load, and calls the shipped `renderToolReads` with a payload-shaped fixture. No
request is intercepted and the renderer under test is the production one.

**The suite is not green on this working tree, and the failure is not mine.**
`node scripts/selftest.mjs` exits 1 on a concurrent session's in-flight spec-006
work in two files on this scope's excluded list. I did not fix it, because it is
theirs and mid-flight, and I did not stage it.

## Completion Statement

All 8 test-plan rows executed with raw output recorded above. All 27 DoD items
carry inline evidence in `scope.md`. The browser gate is 36 passed / 0 failed with
zero skipped, and the 6 card rows were proven non-vacuous by neutering the card
body and observing all six fail.

The publication gate and spec-test-path guard exit 0, the first-load budget holds
at 184 KB against a 200 KB ceiling, and every classifier on the excluded list is
byte-identical.

One gate does not exit 0: `node scripts/selftest.mjs`, on a concurrent session's
in-flight work in files this scope excludes and does not stage. That is recorded
as attribution rather than marked green.
