# Scope 07 — Playbook Lens Render Across Simple And Power

**Status:** Not Started
**Depends On:** SCOPE-06
**Tags:** `overlay:true`
**Business scenarios owned:** BS-016-016, BS-016-028, BS-016-029, BS-016-030

---

## Objective

Render the single C4 record the owner modules now produce, in both existing
views, so a reduced read is impossible to mistake for a qualified one and every
approximation carries the label its provenance requires.

`design.md` § UI Primitive Realization maps the eighteen primitives onto DOM
surfaces that already exist: P-01, P-02, P-10, P-11, P-12, P-13 and P-14 compose
into the existing `#verdict` block at line 1124; P-03, P-04, P-05 and P-07 compose
into the existing `#optbox` panel at line 1187; P-15 joins the Simple lever set
inside `#simpleView` at line 1119; P-06 and P-16 attach to figures the page
already draws. Ten of the eighteen already have a container. This scope composes
them; it introduces no new mode and no new panel.

One compute, two views. Simple and Power both read the single C4 record. Neither
recomputes and neither holds a divergent copy.

---

## Implementation Files

Every path below is an authorized edit target in `design.md` §
Implementation Boundary. The nested `### Implementation Files` heading is the
exact anchor `implementation-reality-scan.sh` parses.

### Implementation Files

| Path | Boundary row | Nature of the edit in this scope |
|---|---|---|
| `intraday-tape-lab.html` | Host and sibling pages — extended, bounded; "the lens render itself across `#verdict`, `#optbox`, `#simpleView`" | Compose P-01 through P-17 into the existing `#verdict` (line 1124), `#optbox` (line 1187) and `#simpleView` (line 1119) containers; add the P-15 gamma-participation lever to the Simple cockpit; add the P-16 approximation footnote row as a `.pw` assumptions panel; extend `#cSession` and `#cProfile` in place; add the narrow-viewport reflow |
| `tests/auction-gamma-playbook.spec.mjs` | Tests and documentation — **NEW file created by this feature**, created by SCOPE-01 | Extend with the fused read, both reduced forms, the Power basis panel, the P-15 lever, the canvas hover tips and the narrow-viewport reflow; append this scope's one persistent regression case and its one independent shared-contract canary block to the same file |

The `.pw` record panel, the Journey anchor and the published tool read are
excluded from this scope; SCOPE-08 owns all three.

---

## Shared Infrastructure Impact Sweep

This scope edits no shared module. It is nevertheless the feature's heaviest
consumer of shared infrastructure: it renders into a page that boots the whole
shared shell, it registers hit-tests through the shared hover mechanism, and it
appends the largest block of cases to a spec file seven other scopes also append
to. The **blast radius** below is what those consumed contracts are, how this
scope can perturb them without editing them, and what proves it did not.

### Shared surface 1 — the shell **bootstrap contract** and its load **ordering**

Verified in `intraday-tape-lab.html`: `rldata.js` loads without `defer` at line 1226
and `rlexperience-adapters/market-structure.js` at line 1227, while `rlg.js`
(2175), `rlchart.js` (2176), `rlticker.js` (2177), `rlapp.js` (2178) and
`rlnav.js` (2179) all load `defer`. So at first paint the render code runs before
`RLCHART`, `RLTKR`, `RLAPP` and `RLG` are defined. The page already defends this
at line 2095, where the existing `#cProfile` hit-test registration is wrapped in
`if (typeof RLCHART !== 'undefined')`.

**How this scope can perturb it.** Step 8 of the Implementation Plan adds a
second `RLCHART.attach` registration on `#cSession` and extends the `#cProfile`
one. An unguarded registration throws during the first paint, and because the
lens render and the existing session render share one `render()` path, that throw
halts the whole first paint rather than only the tip. The **timing** hazard is
that the failure is invisible on a warm load and only appears on a cold one.

**What holds it.** Every new registration carries the same
`typeof RLCHART !== 'undefined'` guard the line-2095 registration already carries,
and the canary asserts the page still paints its verdict block with the
`defer`-loaded shell absent.

### Shared surface 2 — the shared **storage** keys and the persisted **session** state

Verified in the same page: `localStorage` key `rlData` is loaded and saved at
lines 1242–1243, `optSnaps` at line 1256, and `intradayTapeLab` — which persists
`mode` alongside `provider`, `ticker`, `iv` and `orlen` — at lines 1379 and 1381.
`rlData` is not this tool's private state: `rldata.js` owns its schema at line 77
and `market-brief.html`, `rlbrief.js`, `rlmarketaction.js` and
`scripts/brief-refresh.mjs` all read it.

**How this scope can perturb it.** The P-15 lever and the Simple/Power toggle both
write persisted state. A lens that widened the `rlData` schema, or that wrote its
read into the `toolReads` slot, would change what those four downstream consumers
see. It must not: `rldata.js` is consumed-never-modified in `design.md` §
Implementation Boundary, and the published tool read belongs to SCOPE-08.

**What holds it.** This scope writes no `toolReads` slot and adds no `rlData`
field; the lever's value persists only inside the existing `intradayTapeLab`
object. The canary captures the `rlData` schema version and the `toolReads`
contents before and after a full render plus a lever steer and asserts both are
unchanged, mirroring the `shared canary: RLDATA cache and toolReads contracts
remain unchanged` assertion `scripts/selftest.mjs` already carries at line 1732.

### Shared surface 3 — the shared **downstream contract**s consumed by every tool

`design.md` § Implementation Boundary lists `rlchart.js` (`RLCHART.attach`,
`RLCHART.tip`, `RLCHART.logTicks` — "No parallel hover mechanism is introduced"),
`rlticker.js` (`RLTKR.tag`), `rlg.js`, `rlapp.js` and `rlnav.js` as consumed and
never modified. `RLCHART.attach` is dual-shape — `attachStructured` at
`rlchart.js` line 317 and `attachLegacy` at line 351, dispatched by `attach` at
line 365 — so passing the wrong shape silently selects the wrong path rather than
erroring. `rlticker.js` boots a `MutationObserver` on `document.body` with
`{ childList: true, subtree: true }` at line 252, so every DOM insertion the lens
makes schedules shared ticker-scan work on a surface every other tool shares.

**How this scope can perturb it.** The lens re-renders on every lever steer and
every mode toggle. A render that replaces its containers wholesale on each pass
drives an unbounded shared scan; a second tooltip mechanism added beside
`RLCHART` would be an out-of-bounds parallel mechanism under the boundary rule.

**What holds it.** Every tip is constructed through `RLCHART.tip` and registered
through `RLCHART.attach`, every ticker through `RLTKR.tag`, and no parallel hover
or status vocabulary is introduced. The canary asserts the tip element the shared
mechanism owns is the only one present after a steer.

### Shared surface 4 — the shared spec file and its per-case **context**

`tests/auction-gamma-playbook.spec.mjs` is created by SCOPE-01 and appended to by
SCOPE-02 through SCOPE-08. This scope contributes the largest block, and it is the
only scope whose cases mutate browser-context state that outlives a case: TP-07-15
resizes the viewport and TP-07-10 moves the mouse over `#cProfile`. Left
unrestored, a narrow viewport or a hovered canvas changes what a later case in the
same file sees, and the **ordering** dependence that creates is exactly the kind
that passes locally and fails on a reordered run.

**What holds it.** Each case establishes its own viewport and its own pointer
position rather than inheriting one, and the canary runs first and asserts the
default context — full viewport, no persisted `mode` override, untouched `rlData`
— so a leak shows up as a canary failure before the broad suite reruns rather than
as an unrelated case failing later.

### Rollback

Every change in this scope lands inside `intraday-tape-lab.html` and
`tests/auction-gamma-playbook.spec.mjs`, and no shared module, no registry and no
persisted schema is written. The restore path is therefore a revert of those two
files with no migration and no cleanup: the shared `rlData` payload written before
the scope remains readable after the revert because its schema never moved, and
the four downstream consumers of that cache keep reading exactly what they read
before. The canary is what proves that claim rather than asserting it.

---

## Change Boundary

This scope composes primitives into containers that already exist on a page of
134,773 bytes carrying the whole tool, and it repairs nothing outside those
containers. Every edit it makes is therefore an edit to a surface that already
ships, inside a page that also holds the auction math, the fetch order, the owner
seam and the persisted state that seven sibling scopes depend on. The boundary
below is what keeps a compose-into-existing-containers scope from becoming a
behavioural edit to the rest of that page, to the owner modules that feed it, or
to the shared shell it renders through.

**Allowed file families**

| Family | Concrete path | What may change inside it |
|---|---|---|
| Host page — the lens render only | `intraday-tape-lab.html` — exists, 134,773 bytes | The primitives compose into the existing `#verdict` container at line 1124, the existing `#optbox` panel at line 1187 and the existing `#simpleView` container at line 1119; the P-15 gamma-participation lever joins the Simple lever set; the P-16 approximation footnote row lands as a `.pw` assumptions panel; `#cSession` (line 1113) and `#cProfile` (line 1143) are extended in place and each ends its draw by registering a `RLCHART.attach` hit-test behind the `typeof RLCHART !== 'undefined'` guard the line-2095 registration already carries; the narrow-viewport reflow is added. No other page function changes behaviour |
| Feature live-stack spec | `tests/auction-gamma-playbook.spec.mjs` — **declared NEW** in `design.md` § Implementation Boundary, created by SCOPE-01, and absent on disk today | This scope's render cases, its one persistent regression case, its one independent shared-contract canary block and its one stress case, appended to the same file |

**Excluded surfaces** — a diff reaching any row below is a boundary breach rather
than an in-scope change:

| Excluded surface | Why it is excluded here |
|---|---|
| `rlexperience-adapters/market-structure.js` — exists, 98,694 bytes | This scope's Shared Infrastructure Impact Sweep records that it edits no shared module. SCOPE-02 and SCOPE-04 extend this module and SCOPE-06 repairs `sessionGammaTag` at lines 959–967, each under its own boundary. It stays byte-identical through this scope |
| `rlexperience-adapters/options.js` — exists, 66,017 bytes | SCOPE-03 owns the gamma-evidence entry points and the relocated gamma model under its own boundary. This scope renders the C1 and C3 records that module produces and changes neither |
| `gamma-trading-lab.html` — exists, 112,612 bytes | SCOPE-09 owns the sibling-page retirement under its own boundary. This scope renders on one page only |
| `scripts/selftest.mjs` — exists, 461,369 bytes | Absent from this scope's Implementation Files. This scope's Test Plan preamble already records that every claim it makes is a claim about what a user sees on the running page, so no row adds an assertion to it |
| `rldata.js`, `rlapp.js`, `rlchart.js`, `rlticker.js`, `rlg.js`, `rlnav.js` | Consumed-never-modified in `design.md` § Implementation Boundary. `RLCHART.attach`, `RLCHART.tip`, `RLCHART.logTicks` and `RLTKR.tag` are called through their existing signatures; no parallel hover mechanism and no second provider path is introduced |
| `tools.json`, `index.html`, `simple-models.json` | This scope registers nothing and declares nothing. `tools.json` carries `"viewIds": ["simple", "power", "brief", "journey"]` for this tool and keeps them; the 23 tool entries stay 23; the P-15 lever binds to the `gamma-context` enum already declared at `simple-models.json` line 104 rather than adding one |
| `journeys.json`, `tool-experience.config.json`, `playwright.config.mjs` | Consumed-never-modified. `playwright.config.mjs` line 4 already carries `testMatch: '**/*.spec.mjs'` and line 7 already declares the `system-chrome` project, so the spec file is discovered without a config edit |
| `notes/intraday-tape-lab.md`, `README.md` | Authorized edit targets for the feature in `design.md` § Implementation Boundary, but absent from this scope's Implementation Files. Neither is touched here |
| `data/options/**` | Read only, which is NFR-016-006. This scope writes nothing back to the published snapshot set |
| The `.pw` record panel, the `<section id="journey" data-rljourney-mount>` anchor and the `RLDATA.putToolRead` publication slot | SCOPE-08 owns all three. The only `.pw` surface this scope adds is the P-16 assumptions panel; it mounts no Journey anchor and publishes no tool read |
| The `data-m` segment at lines 1070–1071 | Exactly two buttons today. Mobile is a narrow-viewport reflow of Simple and Power, so this scope adds no mode and no fifth button |
| `computeSession`, `adherence`, `ivMinutes`, `controlRead`, `sessionType` at lines 1471–1478 | Thin alias delegations into `RLMARKETSTRUCTURE`. The existing auction math is what this scope renders, not what it changes, and each keeps its alias shape |
| `fetchOptionLevelsAny` at line 1315 | Its same-origin-first order is what makes the page work on GitHub Pages. This scope fetches nothing — every steer recomputes through the single `render()` path with no refetch — and leaves that order untouched |
| `__rlOwnerStateProvider` at lines 1351–1379, and `normOpt` | SCOPE-06 widens that channel to `/v2` under its own boundary. This scope reads what crosses it and changes neither the producer nor the cache round-trip |
| The `localStorage` keys `rlData` at lines 1242–1243 and `optSnaps` at line 1256 | The lens adds no `rlData` field and writes no `toolReads` slot, so the four downstream readers of that cache see exactly what they saw before. Only the existing `intradayTapeLab` object at lines 1379 and 1381 carries the P-15 lever's persisted value |

---

## Gherkin Scenarios

### BS-016-016: A reduced read is structurally distinguishable from a qualified cell

```gherkin
Scenario: A user scans a set of reads containing both fully qualified cells and reduced reads
  Given some reads have both halves qualified and others have an unqualified gamma half
  When the user scans the set
  Then each reduced read is visually and structurally distinguishable from each fully qualified cell
  And no reduced read presents with the confidence presentation of a fully qualified cell
  And each reduced read states its auction-only expectation, the named missing input and that input's reason
```

### BS-016-028: The signed-volume series is never presented as order flow

```gherkin
Scenario: A user reads the corroborating flow evidence inside a playbook cell
  Given the cell cites a signed volume series derived solely from whether each bar closed at or above its open
  When the user reads that evidence
  Then it is labelled an up/down-volume proxy
  And it is stated as not being bid/ask, depth or trade-level aggression data
  And it appears as corroborating evidence only, never as the sole basis of an asserted expectation
  And it is not described or visually presented as real order flow
```

### BS-016-029: The value area is labelled a bar-derived bucket approximation

```gherkin
Scenario: A user inspects how the value-area edges in a cell were derived
  Given the volume-at-price distribution is reconstructed by assigning each bar's whole volume to a single price bucket at that bar's typical price, across a fixed count of forty-four buckets spanning the session range
  When the user inspects the value-area element
  Then the element is labelled a model estimate reconstructed from bars
  And the element states that intrabar distribution is not observed
  And the element states that bucket resolution scales with the session range, so a wider-range session yields coarser price granularity
  And the element is not presented as tick or time-price-opportunity data
```

### BS-016-030: The early-session balance is labelled a declared window, not a classical interval

```gherkin
Scenario: A user inspects the early-session balance used by a playbook cell
  Given the early-session balance window is a declared parameter across a bounded minute range rather than a fixed classical interval
  When the user inspects the early-session balance element
  Then the element states the window value it was computed against
  And the element states that the window is a declared parameter and not the classical initial-balance interval
  And the element states that the window resolves to a whole number of bars at the selected interval, so window and interval interact
  And changing the declared window changes the element and that change is visible in the read
```

---

## Implementation Plan

**1. Compose the verdict block from the single record.**
P-01 regime badge, P-02 expectation verdict, P-10 confidence-bound bar, P-11
absence-cause chip, P-12 falsifier card, P-13 regime-change watch item and P-14
reduced-read frame all compose into the existing `#verdict` container at line
1124. P-13 sits adjacent to P-12 and is visually distinguishable from it, so a
user can tell which of the two a given observation would trigger.

**2. Make the reduced frame structural, not stylistic.**
P-14 wraps `#verdict` in Simple and the Power basis panel. A reduced read carries
no confidence presentation, states its auction-only expectation, and names both
the missing input and that input's reason through P-11. Because the C4 arm and the
C5 cause are fields on the record, the two forms differ in DOM structure rather
than only in colour, which is what makes them distinguishable when scanned.

**3. Render the gamma primitives in the existing options panel.**
P-03 net-gamma sign, P-04 flip-distance readout including the `flipLocatable: false`
state, P-05 wall-proximity meter and P-07 snapshot-staleness chip compose into
`#optbox` at line 1187. P-05 stays fed by `sessionGammaTag` as wall-position
context and does not enter P-01's basis.

**4. Stamp the cutoff exactly once per read.**
P-08 appears in the `#verdict` footer in Simple and the Power basis-panel header.
One read never displays two visible cutoff values.

**5. Add the gamma-participation lever to the Simple cockpit.**
P-15 binds to the declared `gamma-context` enum at `simple-models.json` line 104 —
`exclude` / `include`, default `include`, `identityBearing: true`. Steering it
recomputes through the page's single `render()` path, which the existing delegated
handler at line 2168 already demonstrates, with no refetch. Its excluded position
pairs with the `parameter-excluded` absence cause carrying `recoverable: true`, so
the user can see that flipping the lever restores the gamma half.

**6. Attach the approximation labels to the figures that need them.**
P-06 proxy-disclosure chip attaches wherever the up/down-volume series is drawn or
cited — the `#cProfile` hover tip already names `up / down` at line 2095 — and
states the series is not bid/ask, depth or trade-level aggression data. P-16 lands
as a `.pw` assumptions panel stating the 44-bucket reconstruction
(`var nb = 44`, `market-structure.js` line 860), the declared opening-range window
(`simple-models.json` line 100) and the literal `r = 0.045`, `q = 0` from line
1285. The value-area element states that intrabar distribution is not observed and
that bucket resolution scales with the session range. The early-session balance
element states the window value it was computed against, that the window is a
declared parameter rather than the classical initial-balance interval, and that it
resolves to a whole number of bars at the selected interval.

**7. Tag provenance on every displayed figure.**
P-09 attaches to every figure in every surface, reusing the four classes at
`simple-models.json` line 110 exactly. No parallel vocabulary is introduced.

**8. Extend the two existing canvases in place and give both a hover tip.**
`#cSession` (line 1113) and `#cProfile` (line 1143) are extended; no new canvas is
introduced. Each draw function ends by registering a hit-test through
`RLCHART.attach`, returning `RLCHART.tip(...)` content or `null`. Axes needing a
log scale use `RLCHART.logTicks`. No parallel hover mechanism is added.

**9. Render every ticker through `RLTKR.tag`.**
No bare ticker is printed in any surface.

**10. Reflow narrow viewports without adding a mode.**
Mobile is a narrow-viewport reflow of Simple and Power. The `data-m` segment at
lines 1070–1071 keeps exactly two buttons. Canvas draws are guarded by the active
mode and redrawn on resize, because a hidden canvas does not render.

**11. Hold the crash-proof first paint.**
Every numeric render path guards through `isNum` (line 1233) before any
`.toFixed()` or arithmetic. The global `isFinite` returns `true` for `null`, so a
bare global guard would halt the first paint on a half-empty cache. Absent values
render as an em dash.

**Boundary held.** No fifth `data-m` button, no duplicate toggle, no registry
entry. `tools.json` `"viewIds": ["simple", "power", "brief", "journey"]` is
unchanged and untouched by this scope. The existing auction math and the alias
shape at lines 1471–1478 are unchanged.

---

## Test Plan

This scope's Implementation Files are `./intraday-tape-lab.html` and
`tests/auction-gamma-playbook.spec.mjs`. It composes primitives into DOM
containers and adds no pure entry point, so every claim it makes is a claim about
what a user sees on the running page. Every row therefore runs the
`system-chrome` spec against the real page. `scripts/selftest.mjs` is absent from
this scope's Implementation Files, so no row adds an assertion to it.

**Adversarial fixture rule for this scope.** Four of this scope's claims are
satisfiable by coincidence unless the fixture is built to break them. A reduced
read is trivially "distinguishable" if the two forms merely differ in colour, so
the distinguishability row compares DOM structure and fails a purely stylistic
difference. The proxy row is vacuous if the signed-volume series is always
accompanied by other flow evidence, so its adversarial fixture makes that series
the only flow evidence present and asserts no expectation is founded on it alone.
The bucket-resolution row is vacuous against a single session range, so it varies
the range and asserts the stated granularity moves with it. The declared-window
row is vacuous against a single window value, so it changes the declared window
and asserts the rendered element changes with it; a static label fails.

**Canary ordering for this scope.** TP-07-17 is an independent canary over the
shared surfaces the Shared Infrastructure Impact Sweep enumerates, and it is run
first, on its own, through `--grep` before any broad rerun of this file or of the
repository's other `system-chrome` specs. Running it first is what makes a shared
leak surface as a named canary failure rather than as an unrelated later case
failing for a reason that looks local. `design.md` § Implementation Boundary
authorizes exactly one new test file for this feature, so the canary is a block
inside `tests/auction-gamma-playbook.spec.mjs` selected by title, not a separate
file — the same `--grep` selection TP-07-16 uses.

**Stress load and the budget it is measured against, for this scope.** The lens
recomputes on every lever steer and every mode toggle, so the figure that bounds
it is a per-recompute budget rather than a throughput number, and this scope
invents neither. NFR-016-002 binds the fusion to "the host model's declared
per-recompute budget"; the host model here is `simple-model/session-auction/v1`,
whose registry entry declares `"performancePolicy": {"maxComputeMs":250,"deterministic":true}`
at `simple-models.json` line 111 — the same declaration and the same 250 ms
SCOPE-06 measures its boundary against and SCOPE-08 measures its publication
against. The traversal is declared in the same entry: `sensitivityPolicy.method`
is `"one-at-a-time"` at line 108, and the five identity-bearing levers declared at
lines 100–104 admit 70 distinct single-lever positions. TP-07-18 is that sweep,
run against the real page in both views and at both viewports.

| ID | Test Type | Category | File / Location | What it proves | Command | Live System |
|---|---|---|---|---|---|---|
| TP-07-01 | E2E UI — live stack | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `fused read composes the verdict block from one record` | Asserted against the real page with no `page.route`, no `context.route` and no request interception of any kind: a fully qualified cell renders its regime badge, expectation verdict, confidence-bound bar, falsifier card and the regime-change watch item into the existing `#verdict` container, with the watch item adjacent to and visually distinguishable from the falsifier card, and no new panel introduced | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-07-02 | E2E UI — live stack — adversarial | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `reduced and qualified reads differ structurally, not only stylistically` | Adversarial assertion against the real page: a scanned set containing both forms is compared on DOM structure rather than on colour, so an implementation that distinguished the reduced frame only by styling fails | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-07-03 | E2E UI — live stack | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `no reduced read carries the qualified confidence presentation` | Asserted against the real page: across every reduced read in the scanned set, the confidence-bound presentation a fully qualified cell carries is absent | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-07-04 | E2E UI — live stack | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `reduced read names its auction-only expectation, missing input and reason` | Asserted against the real page: each reduced read states its auction-only expectation, and its absence-cause chip names both the missing input and that input's reason | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-07-05 | E2E UI — live stack | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `options panel renders the gamma half that discriminates the two forms` | Asserted against the real page: `#optbox` renders the net-gamma sign, the flip-distance readout including its `flipLocatable: false` state, the wall-proximity meter and the snapshot-staleness chip, and the wall meter does not appear in the regime badge's basis | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-07-06 | E2E UI — live stack | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `gamma-participation lever recomputes through the single render path` | Asserted against the real page: the P-15 lever renders in `#simpleView`, steering it recomputes through the page's single `render()` path with no network request issued, and Simple and the Power basis panel show the same read afterwards rather than divergent copies | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-07-07 | E2E UI — live stack | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `excluded lever position renders a named recoverable reduced read` | Asserted against the real page: the lever's excluded position renders a reduced read naming a recoverable `parameter-excluded` cause, and returning the lever restores the fully qualified cell in the same view | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-07-08 | E2E UI — live stack | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `signed-volume series is labelled an up/down-volume proxy` | Asserted against the real page: wherever the signed-volume series is cited, it is labelled an up/down-volume proxy and stated as not bid/ask, depth or trade-level aggression data | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-07-09 | E2E UI — live stack — adversarial | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `signed-volume series is never the sole basis of an expectation` | Adversarial fixture against the real page: the signed-volume series is the only flow evidence present. No asserted expectation is founded on it alone, it appears only as corroborating evidence, and it is neither drawn nor described as real order flow | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-07-10 | E2E UI — live stack | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `profile canvas hover tip carries the proxy disclosure` | Asserted against the real page: hovering `#cProfile` returns a tip that names the up/down series and carries the same proxy disclosure the cited figure carries, so the label survives where the series is drawn rather than cited | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-07-11 | E2E UI — live stack | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `value-area element is labelled a bar-derived model estimate` | Asserted against the real page: the value-area element is labelled a model estimate reconstructed from bars and states that intrabar distribution is not observed | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-07-12 | E2E UI — live stack — adversarial | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `value-area granularity moves with the session range` | Adversarial fixture against the real page: two sessions of different range are compared. The element states that bucket resolution scales with the session range across the forty-four buckets and the stated granularity differs between them, so a fixed label fails. The element is not presented as tick or time-price-opportunity data | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-07-13 | E2E UI — live stack | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `early-session balance names its declared window` | Asserted against the real page: the early-session balance element states the window value it was computed against and states that the window is a declared parameter rather than the classical initial-balance interval | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-07-14 | E2E UI — live stack — adversarial | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `changing the declared window changes the rendered element` | Adversarial fixture against the real page: the declared window is changed and the rendered element changes with it, and the element states that the window resolves to a whole number of bars at the selected interval. A static label that never moves with the parameter fails | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-07-15 | E2E UI — live stack | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `narrow viewport reflow preserves the two read forms` | Asserted against the real page at a narrow viewport: the reflowed Simple and Power views keep each reduced read structurally distinguishable from each fully qualified cell, `#cSession` and `#cProfile` redraw on resize rather than rendering blank, and the `data-m` segment still carries exactly two buttons | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-07-16 | Regression E2E | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `Regression: BS-016-016 a reduced read never renders with the qualified confidence presentation` | The persistent regression case for the distinction this scope's render exists to make, asserted on the real `intraday-tape-lab.html` page with no `page.route`, no `context.route` and no request interception. In the page, a scanned set holding both forms is compared on DOM structure rather than on colour, so a build that distinguished the reduced frame only by styling fails; the confidence-bound presentation a fully qualified cell carries is absent from every reduced read; each reduced read's absence-cause chip names both the missing input and that input's reason; and steering the P-15 lever to its excluded position renders a recoverable `parameter-excluded` reduced read that returns to a fully qualified cell when the lever returns, through the single `render()` path the delegated handler at line 2168 already uses and with no network request issued. A build that collapses the two forms into one, drops the confidence presentation from the qualified cell instead of from the reduced read, or lets the lever leave the two views showing divergent copies fails this case in the browser | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: BS-016-016 a reduced read never renders with the qualified confidence presentation" --reporter=list` | Yes |
| TP-07-17 | Fixture Canary | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `Canary: shared shell and spec-file bootstrap contracts are unchanged` | The independent canary over the four shared surfaces the Shared Infrastructure Impact Sweep enumerates, run first and alone before any broad rerun, on the real page with no request interception. It proves: the page paints its `#verdict` block with the `defer`-loaded shell not yet defined, so every new `RLCHART.attach` registration carries the `typeof RLCHART !== 'undefined'` guard the line-2095 registration already carries and no cold first paint halts; the `rlData` schema version at `rldata.js` line 77 and the whole `toolReads` map are byte-identical before and after a full render plus a P-15 steer plus a Simple/Power toggle, so the four downstream readers of that cache — `market-brief.html`, `rlbrief.js`, `rlmarketaction.js` and `scripts/brief-refresh.mjs` — see exactly what they saw before, mirroring the `shared canary: RLDATA cache and toolReads contracts remain unchanged` assertion `scripts/selftest.mjs` carries at line 1732; the tip element `RLCHART` owns is the only tooltip element present after a steer, so no parallel hover mechanism was introduced beside the dual-shape `attach` at `rlchart.js` line 365; and the default browser context holds — full viewport, no persisted `mode` override in the `intradayTapeLab` key at lines 1379–1381 — so the viewport TP-07-15 resizes and the pointer TP-07-10 moves are restored rather than inherited by a later case in this shared file | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Canary: shared shell and spec-file bootstrap contracts are unchanged" --reporter=list` | Yes |
| TP-07-18 | Stress | `stress` | `tests/auction-gamma-playbook.spec.mjs` test `Stress: the lens re-renders both views inside the declared per-recompute budget across the full declared lever domain` | The lens render is driven at the maximum distinct one-at-a-time load this tool's own registry entry admits, against the real page with no `page.route`, no `context.route` and no request interception of any kind. `simple-models.json` declares `sensitivityPolicy.method: "one-at-a-time"` at line 108 for `simple-model/session-auction/v1`, and five identity-bearing levers whose declared domains admit 70 distinct single-lever positions — `opening-range` 5–60 step 5 (12 positions, line 100), `vwap-band` 0.5–4 step 0.25 (15), `profile-window` 1–20 step 1 (20), `control-threshold` 0–1 step 0.05 (21) and the P-15 `gamma-context` enum `exclude`/`include` (2, line 104). Every position is steered through the page's single `render()` path — the delegated `#simpleView` handler at line 2168 — in Simple and in the Power basis panel, at the full viewport and at the narrow viewport TP-07-15 exercises, giving 280 renders with no network request issued at any of them. It proves: every one of those renders completes inside the 250 ms `performancePolicy.maxComputeMs` this tool's model declares at `simple-models.json` line 111, which is the declared per-recompute budget NFR-016-002 binds the fusion to; no render halts against a half-empty cache, because every numeric path guards through `isNum` at line 1233 and renders an em dash rather than throwing; each reduced read stays structurally distinguishable from each fully qualified cell at every one of the 70 positions and at both viewports, so the distinction TP-07-02 asserts once holds across the whole declared lever domain rather than at one position; and the last pass over an identical lever position renders a read identical to the first, satisfying the `deterministic: true` declared beside the budget at line 111, so no clock read and no accumulated render state leaks into the lens under load | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

---

### Definition of Done

- [ ] `[TP-07-01]` `[BS-016-016]` A fully qualified cell renders its regime badge, expectation verdict, confidence-bound bar, falsifier card and regime-change watch item into the existing `#verdict` container, with the watch item adjacent to and distinguishable from the falsifier card.
- [ ] `[TP-07-02]` `[BS-016-016]` In a scanned set containing both forms, each reduced read differs from each fully qualified cell in DOM structure and not only in colour.
- [ ] `[TP-07-03]` `[BS-016-016]` No reduced read presents the confidence-bound presentation that a fully qualified cell carries.
- [ ] `[TP-07-04]` `[BS-016-016]` Each reduced read states its auction-only expectation, and its absence-cause chip names both the missing input and that input's reason.
- [ ] `[TP-07-05]` `[BS-016-016]` `#optbox` renders the net-gamma sign, the flip-distance readout including its `flipLocatable: false` state, the wall-proximity meter and the snapshot-staleness chip, and the wall meter never appears in the regime badge's basis.
- [ ] `[TP-07-06]` `[BS-016-016]` The gamma-participation lever renders in `#simpleView`, steering it recomputes through the single `render()` path with no network request, and Simple and the Power basis panel then show the same read rather than divergent copies.
- [ ] `[TP-07-07]` `[BS-016-016]` The lever's excluded position renders a reduced read naming a recoverable `parameter-excluded` cause, and returning the lever restores the fully qualified cell.
- [ ] `[TP-07-08]` `[BS-016-028]` Wherever the signed-volume series is cited it is labelled an up/down-volume proxy and stated as not bid/ask, depth or trade-level aggression data.
- [ ] `[TP-07-09]` `[BS-016-028]` A user reads the corroborating flow evidence inside a playbook cell: with the signed-volume series as the only flow evidence present, no asserted expectation is founded on it alone, it appears as corroborating evidence only, and it is neither drawn nor described as real order flow.
- [ ] `[TP-07-10]` `[BS-016-028]` The `#cProfile` hover tip names the up/down series and carries the same proxy disclosure the cited figure carries.
- [ ] `[TP-07-11]` `[BS-016-029]` A user inspects how the value-area edges in a cell were derived: the value-area element is labelled a model estimate reconstructed from bars and states that intrabar distribution is not observed.
- [ ] `[TP-07-12]` `[BS-016-029]` Across two sessions of different range, the value-area element states that bucket resolution scales with the session range and the stated granularity differs between them; the element is not presented as tick or time-price-opportunity data.
- [ ] `[TP-07-13]` `[BS-016-030]` A user inspects the early-session balance used by a playbook cell: the early-session balance element states the window value it was computed against and that the window is a declared parameter rather than the classical initial-balance interval.
- [ ] `[TP-07-14]` `[BS-016-030]` Changing the declared window changes the rendered early-session balance element, and the element states that the window resolves to a whole number of bars at the selected interval.
- [ ] `[TP-07-15]` `[BS-016-016]` At a narrow viewport the reflowed views keep each reduced read structurally distinguishable from each qualified cell, both existing canvases redraw on resize, and the `data-m` segment still carries exactly two buttons.
- [ ] `[TP-07-17]` `[BS-016-016]` The shared-contract canary passes on its own: the `#verdict` block paints with the `defer`-loaded shell not yet defined, the `rlData` schema version and the whole `toolReads` map are unchanged across a render, a lever steer and a mode toggle, the `RLCHART`-owned tip is the only tooltip element present, and the default viewport and pointer context are restored rather than inherited.
- [ ] `[TP-07-18]` `[BS-016-016]` Swept one-at-a-time across all 70 single-lever positions the five identity-bearing levers declare at `simple-models.json` lines 100–104, in both views and at both viewports — 280 renders with no network request issued — every render completes inside the 250 ms per-recompute budget declared at `simple-models.json` line 111, no render halts against a half-empty cache, each reduced read stays structurally distinguishable from each qualified cell at every position, and the last pass over an identical position renders a read identical to the first.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope are persistent and named — `[TP-07-16]` `tests/auction-gamma-playbook.spec.mjs` carries `Regression: BS-016-016 a reduced read never renders with the qualified confidence presentation`, which runs against the real page and fails the moment the two read forms differ only in styling, a reduced read acquires the qualified confidence presentation, an absence-cause chip stops naming both the missing input and its reason, or steering the P-15 lever leaves Simple and the Power basis panel showing divergent copies.
- [ ] Broader E2E regression suite passes — the complete `node scripts/selftest.mjs` suite, the registry validator `node scripts/validate-tool-experience.mjs`, and the one existing real-page Playwright spec that already loads this page, `tests/simple-model-adapters-market.spec.mjs`, all run green once this scope lands, with every pre-existing selftest group and every previously registered regression case preserved and no decreased passing count.
- [ ] Independent canary suite for shared fixture/bootstrap contracts passes before broad suite reruns
- [ ] Rollback or restore path for shared infrastructure changes is documented and verified
- [ ] Change Boundary is respected and zero excluded file families were changed — the diff for this scope contains only `intraday-tape-lab.html` and `tests/auction-gamma-playbook.spec.mjs`; `rlexperience-adapters/market-structure.js`, `rlexperience-adapters/options.js`, `gamma-trading-lab.html` and `scripts/selftest.mjs` are byte-identical, every consumed-never-modified shell module — `rldata.js`, `rlapp.js`, `rlchart.js`, `rlticker.js`, `rlg.js`, `rlnav.js` — is untouched with no parallel hover mechanism added beside `RLCHART`, `tools.json`, `index.html`, `simple-models.json`, `journeys.json`, `tool-experience.config.json` and `playwright.config.mjs` carry no edit so no registered count moves, `notes/intraday-tape-lab.md` and `README.md` are unchanged, `data/options/**` was read and never written, the `.pw` record panel, the `data-rljourney-mount` anchor and the `putToolRead` slot SCOPE-08 owns are absent from the diff, the `data-m` segment at lines 1070–1071 keeps exactly two buttons, the alias delegations at lines 1471–1478 keep their shape, `fetchOptionLevelsAny` at line 1315 keeps its same-origin-first order, `__rlOwnerStateProvider` at lines 1351–1379 and `normOpt` are unchanged, and no `rlData` field and no `toolReads` slot is written.

### Build Quality Gate

- [ ] `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` completes with zero failures and no skipped required test.
- [ ] `node scripts/selftest.mjs` completes with zero failing assertions and zero warnings.
- [ ] `node scripts/validate-tool-experience.mjs` completes clean; no registry count moves, because this scope registers nothing.
- [ ] `bash .github/bubbles/scripts/artifact-lint.sh specs/016-auction-gamma-playbook` exits 0.
- [ ] Every displayed figure carries a provenance tag drawn from the four declared classes, and no parallel status vocabulary is introduced.
- [ ] Every ticker renders through `RLTKR.tag` with no bare ticker printed in any surface, and every canvas tip is constructed through `RLCHART` with no parallel hover mechanism added.
- [ ] Every numeric render path guards through `isNum` before any `.toFixed()` or arithmetic, so a first paint against a half-empty cache renders em dashes and completes rather than halting.
- [ ] Only the paths in this scope's Implementation Files table were modified: no new canvas, no new mode, no fifth `data-m` button and no registry entry is introduced, and the `.pw` record panel, the Journey anchor and the published tool read are untouched.
