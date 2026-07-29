# Scope 09 — Cross-Surface Single Source And Published-Surface Closure

**Status:** Not Started
**Depends On:** SCOPE-03 (foundation), SCOPE-06, SCOPE-07, SCOPE-08
**Tags:** `closure:true`
**Business scenarios owned:** BS-016-036

---

## Objective

Retire every remaining duplicate of the gamma model so the enumerated surface set
agrees by construction, and bring the published description of the tool back into
line with what the tool now does.

Verified this pass with `git grep -c 'bsmGamma'`, the model still stands on three
committed pages: `gamma-trading-lab.html` returns `6` at lines 1053, 1068, 1069,
1075, 1097 and 1098; `intraday-tape-lab.html` returns `2` at lines 1278 and 1294;
`swing-structure-lab.html` returns `2` at lines 1266 and 1282. The
`function bsmGamma` line is byte-identical on all three — the trimmed line hashes
to `f7d5400d052232c2d5d146887f456e98` on each — and each copy sits beside the same
`spot * 0.9 … spot * 1.1` band with `N = 60`, at line 1074, line 1293 and line
1281 respectively. While any copy stands, agreement across those surfaces is
coincidental. `design.md` § Module Contracts states this edit "exists only to
make AC-016-043's cross-surface agreement structural rather than coincidental",
and `design.md` § Testing Strategy requires the assertion to be "written over the
enumerated surface set rather than over a named pair", naming
`intraday-tape-lab.html`, `gamma-trading-lab.html` and `swing-structure-lab.html`.
BS-016-036 is the user-facing form of that claim.

This scope also carries the descriptive-text closure. `README.md` line 31 still
describes the tool's gamma walls as "reused from the Options Structure Lab via a
shared browser cache", which stops being the whole story once the lens publishes a
regime, a cutoff and a snapshot as-of.

---

## Implementation Files

Every path below is an authorized edit target in `design.md` §
Implementation Boundary. The nested `### Implementation Files` heading is the
exact anchor `implementation-reality-scan.sh` parses.

### Implementation Files

| Path | Boundary row | Nature of the edit in this scope |
|---|---|---|
| `intraday-tape-lab.html` | Host and sibling pages — extended, bounded | **The gamma single-source seam and nothing beyond it.** Retire the page-local gamma model so this page resolves its gamma through `RLOPTIONS.readGammaEvidence`. This page holds two `bsmGamma` occurrences today, at lines 1278 and 1294. The occurrence at line 1294 is `gammaAt`, which sits inside `computeOptLevels` (lines 1283–1302) beside its band at line 1293, and arrives through SCOPE-06's declared delegation of `computeOptLevels` and `normOpt`. The standalone `function bsmGamma` at line 1278 sits **outside** `computeOptLevels` and is therefore reached by no other scope's declared seam; retiring it here is what takes this page's occurrence count to `0`. **Limit:** this row does not reach line 1301, `RLDATA.putOptions(tk, optTodayKey(), snap)` — SCOPE-01 owns that as-of re-key seam. The auction math, the lens render, the Journey anchor, the tool-read slot and the owner-state provider are out of bounds for this row |
| `gamma-trading-lab.html` | Host and sibling pages — extended, bounded | **The gamma single-source seam and nothing beyond it.** Replace the duplicated gamma model with a call to `RLOPTIONS.readGammaEvidence`, and surface the resulting snapshot as-of. The retirement covers all six `bsmGamma` occurrences this page holds today: the `function bsmGamma` definition at line 1053, the by-strike call sites at lines 1068 and 1069, `gammaAt` at line 1075 beside its band at line 1074, and the two second-expiry call sites at lines 1097 and 1098. **Limit — results unchanged, not lines untouched.** Four of the authorized lines are shared: 1068 and 1069 carry the `vaCall`/`vaPut` and `chCall`/`chPut` vanna and charm accumulation and the `wCallVol`/`wPutVol += g * v` OVI volume weighting on the same physical line as the gamma call, and 1097 and 1098 carry the `vv` and `cc` accumulation inside the `T2` second-expiry block on the same physical line, so calling those four untouched would be literally false. The enforceable constraint is that their **results** do not move: the vanna (`bsmVanna`) and charm (`bsmCharm`) models, the OVI series, `netVanna` and `netCharm` at line 1102 and the term-structure rows keep their current values and behaviour, and only the gamma primitive they consume — the calls at lines 1068, 1069, 1097 and 1098 — is re-sourced from `RLOPTIONS.readGammaEvidence`, which moves no result because the model that moves is byte-identical to the one retired. That re-sourcing is what lets this page's occurrence count reach `0`. This row does not reach line 1114, `try { RLDATA.putOptions(tk, optTodayKey(), slim); } catch (e) { }` inside `mirrorSnap` (line 1112) — SCOPE-01 owns that as-of re-key seam — and the `slim` projection at line 1113 is untouched here |
| `swing-structure-lab.html` | Host and sibling pages — extended, bounded, change **(1) Single source** | **The gamma single-source seam and nothing beyond it.** Retire the page-local gamma model — `function bsmGamma` at line 1266, the `gCoef` / `spot * 0.9 … spot * 1.1` / `N = 60` band at line 1281, `gammaAt` at line 1282, `netGEX` at line 1283 and the `r = 0.045, q = 0` literal at line 1273 — against `RLOPTIONS.readGammaEvidence`. Lines 1266 and 1282 are this page's two `bsmGamma` occurrences today; retiring them takes its count to `0`. `design.md` declares two bounded changes on this page: SCOPE-01 owns change **(2) As-of key**, and change **(1) Single source** is owned here. **Limit:** this row does not reach line 1289, `RLDATA.putOptions(tk, optTodayKey(), snap)`. `parseOptChain` (line 1268), `optTodayKey` (line 1269), `fetchOptionLevels` (line 1291), `parsePagesChain` (line 1293), `fetchOptionLevelsPages` (line 1301) and `fetchOptionLevelsAny` (line 1303) keep their current behaviour and their same-origin-first order; `normOpt`, `tryOptions`, `loadUniverse`, the swing structure, MA stack, composite volume profile, pattern, accumulation/distribution and regime work, the rendering and the view modes are out of bounds. This page gains no lens, no tool read, no Journey anchor and no owner-state provider |
| `tools.json` | Registries — extended, bounded | Descriptive text only: this tool's `blurb`, `tags` and `updated` |
| `index.html` | Registries — extended, bounded | Descriptive text only: this tool's `blurb`, `tags` and `updated` inside the inline `TOOLS` array. **Anchor precision:** the `intraday-tape-lab` entry is lines 513–524 — opening brace at 513, `id` at 514, `updated` at 521, `blurb` at 522, `tags` at 523, closing `},` at 524. Kept identical in substance to the `tools.json` copy that line 774 renders from. **Limit:** the very next entry, lines 525–536, is `swing-structure-lab`; its descriptive text is **not** an edit target under this row. The entry count stays 23, and `id`, `file`, `notes`, `icon` and `accent` are unchanged |
| `README.md` | Tests and documentation | Update the `## Live tools` row for this tool (line 31) so the published description matches what the tool now does |
| `notes/intraday-tape-lab.md` | Tests and documentation | Update this tool's handoff doc where the lens changes it — the signal engine, the input levers, the known limitations and the version history |
| `scripts/selftest.mjs` | Tests and documentation — "the cross-surface single-source agreement assertion for the shared gamma model" | Add the assertion that both surfaces resolve their gamma evidence through one producer and agree on sign and flip for one snapshot |
| `tests/auction-gamma-playbook.spec.mjs` | Tests and documentation — NEW file created by this feature, created by SCOPE-01 | Extend with the cross-surface comparison of as-of, sign and flip |

Registry identity is frozen. In `tools.json`: `id`, `file`, `status`, the entire
`experience` block including `viewIds`, `simpleModelDefinitionId`,
`simpleAdapterModule` and both `journeyDefinitionIds`, and the entire `briefing`
block including `readAdapter` and `readContractVersion`. Entry count stays 23,
verified this pass. In `index.html`: entry count stays 23, and `id`, `file`,
`notes`, `icon` and `accent` are unchanged. `README.md` § Layout, § Live site,
§ Add a new tool and § Deploy mechanism are unchanged, because this feature adds
no root-level file. No other tool's entry, row or notes file is touched.

---

## Consumer Impact Sweep

This scope completes the relocation SCOPE-03 began by retiring every remaining
duplicate of the gamma model across the enumerated three-surface set.

| Consumer surface | Current state, verified this pass | Disposition |
|---|---|---|
| `gamma-trading-lab.html` — `computeGamma` and its inline model | 6 occurrences of `bsmGamma` at lines 1053, 1068, 1069, 1075, 1097 and 1098; band at line 1074 | Consumes `RLOPTIONS.readGammaEvidence` in place of the inline duplicate, and surfaces the snapshot as-of |
| `gamma-trading-lab.html` — vanna, OVI and term-structure work | Present on the page; four lines call the page-local gamma primitive alongside `bsmVanna` and `bsmCharm` — lines 1068 and 1069 in the by-strike call and put loops, where the same `g` also feeds the OVI volume weighting through `wCallVol`/`wPutVol += g * v`, and lines 1097 and 1098 inside the `T2` second-expiry block | Results unchanged, not lines untouched: the vanna and charm models, the OVI series, `netVanna` and `netCharm` at line 1102 and the term-structure results keep their current values and behaviour. Only the gamma primitive those four lines call resolves through `RLOPTIONS` instead of the page-local copy, which is what lets the page reach zero occurrences. Axis 2 of `design.md` § Variation axes requires one evidence record with two projections rather than a helper narrowed to the lens's four fields |
| `computeGammaPlaybookSummary` (`options.js` line 562) | The dealer-flow consumer of the by-strike GEX profile, vanna flip and OVI series | Unchanged. It keeps its own projection of the same C1 record |
| `intraday-tape-lab.html` gamma model | 2 occurrences of `bsmGamma`: `gammaAt` at line 1294 inside `computeOptLevels` (lines 1283–1302), and the standalone `function bsmGamma` at line 1278 outside it | SCOPE-06's declared delegation of `computeOptLevels` and `normOpt` reaches line 1294 and its band at line 1293. The standalone definition at line 1278 is reached by no other scope's declared seam and is retired here, so this page reaches zero rather than one |
| `swing-structure-lab.html` gamma model | 2 occurrences of `bsmGamma` at lines 1266 and 1282; band at line 1281 | Retired here against `RLOPTIONS.readGammaEvidence`. `design.md` declares two bounded changes on this page; SCOPE-01 owns the as-of key at line 1289 and this scope owns the single source, so both declared changes have an owner |
| `README.md` line 31, `tools.json` blurb, `index.html` `TOOLS` blurb | Three published descriptions of the same tool | Moved together so no published surface describes the tool differently from another |

**Change boundary.** `rlexperience-adapters/options.js` and
`rlexperience-adapters/market-structure.js` are excluded from this scope and must
remain byte-identical through it — the producer is finished in SCOPE-03 and this
scope only adds consumers. `simple-models.json`, `journeys.json`, `rlnav.js` and
`tool-experience.config.json` are excluded entirely. `data/options/**` is read and
never written. On all three pages the edit is confined to the gamma single-source
seam named in the Implementation Files row for that page; the as-of re-key
statements at `intraday-tape-lab.html` line 1301, `gamma-trading-lab.html` line
1114 and `swing-structure-lab.html` line 1289 belong to SCOPE-01 and are not
touched here, so no seam carries two owners.

**Post-retirement check to run before this scope closes:** `bsmGamma` resolves to
zero occurrences outside `rlexperience-adapters/options.js` across every committed
page — `intraday-tape-lab.html`, `gamma-trading-lab.html` and
`swing-structure-lab.html` hold `2`, `6` and `2` matching lines today — `3`, `7`
and `3` tokens, because each page's `gammaAt` line carries two call tokens — and
must each hold `0` —
and the hard-asserted registry counts at `scripts/selftest.mjs` lines 3547, 3551
and 3833–3838 are unchanged, because this feature registers no new tool, model or
journey. Verified counts that must not move: `tools.json` 23 entries,
`simple-models.json` 23 definitions, `journeys.json` 48 definitions and 48 steps.

---

## Gherkin Scenarios

### BS-016-036: The session qualifier reconciles with the deeper options evidence

```gherkin
Scenario: A user compares the session read's behavioural regime against the deeper options surfaces for the same ticker
  Given a behavioural regime is stated in the session read with its snapshot as-of
  When the user opens the deeper options evidence for the same ticker
  Then both surfaces state the snapshot as-of they consumed
  And where both consumed the same snapshot they agree on the net-gamma sign and on the flip
  And where they consumed snapshots with different as-of values the divergence is attributable to that stated cutoff difference rather than presented as a modelling contradiction
  And neither surface re-derives the gamma evidence independently of the consumed snapshot
```

---

## Implementation Plan

**1. Point the enumerated surface set at the one producer.**
`computeGamma` on `gamma-trading-lab.html`, the standalone model on
`intraday-tape-lab.html` and the model on `swing-structure-lab.html` all consume
`RLOPTIONS.readGammaEvidence` in place of their inline duplicates. The model is
literally the same function on all three surfaces afterwards, so agreement on sign
and flip for one snapshot follows from construction rather than from three
implementations happening to match. `design.md` § Testing Strategy requires the
assertion to be written over this enumerated surface set rather than over a named
pair, so a fourth page that later acquires a copy fails the group instead of
silently escaping it.

**2. Surface the snapshot as-of on the sibling page.**
Both surfaces the user reconciles state the as-of they consumed. This is possible
only because SCOPE-01 preserved the field; before that neither surface had one to
state, and the comparison BS-016-036 asks for had no operands.

**3. Make divergence attributable rather than contradictory.**
Where the two surfaces consumed snapshots with different as-of values, each states
its own cutoff, so the difference reads as a stated cutoff difference. Because the
producing function is shared, a divergence cannot be a modelling contradiction.

**4. Prove neither surface re-derives independently.**
`gammaEvidenceFingerprint` from SCOPE-03 digests the fields that determine the
regime, so the reconciliation is answerable without either surface recomputing the
other's numbers. The `scripts/selftest.mjs` assertion asserts a single producer
directly rather than asserting two outputs happen to match.

**5. Move the three published descriptions together.**
`README.md` line 31, the `tools.json` blurb and the `index.html` `TOOLS` blurb
describe the same tool and are updated in one change so none contradicts another.
The `index.html` copy stays identical in substance to the `tools.json` copy that
line 774 renders from.

**6. Update the handoff doc where the lens changed the tool.**
`notes/intraday-tape-lab.md` gains the lens in its signal engine, the P-15 lever
in its input levers, the approximation and coverage bounds in its known
limitations, and an entry in its version history. The doc's existing section
structure is preserved and no other tool's notes are touched.

**7. Hold every count that must not move.**
`scripts/validate-tool-experience.mjs` and its `invariant(...)` count assertions
at lines 493–496 are run, never edited. Both owner modules are already among the 7
`adapterPolicy.moduleAllowlist` entries in `tool-experience.config.json`, and
extending an allowlisted module needs no allowlist edit, so that file is consumed
and never modified. `playwright.config.mjs` already discovers the new spec through
`testMatch: '**/*.spec.mjs'` and already has the `system-chrome` project, so it is
absent from the table above and is not modified.

**Boundary held.** No new tool, model or journey is registered. No registration
identity changes. No count moves.

---

## Test Plan

This scope's Implementation Files include `scripts/selftest.mjs` and
`tests/auction-gamma-playbook.spec.mjs`, so it carries both a source-level
single-source proof and a browser proof of the comparison a user actually makes.
The source rows run `node scripts/selftest.mjs`; the four browser rows need the
real pages rendering side by side and therefore run the `system-chrome` spec.

**Adversarial fixture rule for this scope.** This is the closure scope, so its
central claim is a negative one: that no second source of truth for the gamma
model exists. A row that merely compared two rendered numbers would pass while a
second implementation quietly returned matching values, proving nothing. The
rows below therefore assert the single producer directly and scan for the model
by name. The occurrence scan covers every committed page rather than the two this
feature touched, so reintroducing an inline copy anywhere fails it. The
divergence row pairs two snapshots with deliberately different as-of values,
because a fixture in which both surfaces hold the same snapshot cannot tell an
attributable difference from a suppressed one.

**Enumerated surface set, not a named pair.** `design.md` § Testing Strategy
requires the cross-surface assertion to be "written over the enumerated surface
set rather than over a named pair", and names the three surfaces holding the
duplicate today: `intraday-tape-lab.html`, `gamma-trading-lab.html` and
`swing-structure-lab.html`. TP-09-01 through TP-09-07 and TP-09-11 through
TP-09-15 all carry that enumerated form in the group `Feature 016 Scope 09
enumerated-surface gamma single-source closure (options, intraday-tape-lab,
gamma-trading-lab, swing-structure-lab)`, so the group name never narrows to a
pair while the assertions inside it cover three surfaces and the module — a
pair-shaped name would invite a later edit that silently drops the unnamed third
surface, which is the exact gap this scope exists to close. TP-09-13
is the adversarial member: it fails if a private copy is reintroduced on any of
the three, and equally if a fourth page later acquires one, so no surface escapes
the closure by not being named. TP-09-15 is the volume member: it drives the same
enumerated set over the whole published snapshot load, so a delegation that holds
for one snapshot but not across the published set fails there rather than in
production.

| ID | Test Type | Category | File / Location | What it proves | Command | Live System |
|---|---|---|---|---|---|---|
| TP-09-01 | Unit — adversarial | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 09 enumerated-surface gamma single-source closure (options, intraday-tape-lab, gamma-trading-lab, swing-structure-lab)` | Adversarial scan of every committed page: zero `bsmGamma` tokens outside `rlexperience-adapters/options.js`, asserted at token level rather than at definition level, because a page can drop the definition and keep calls to it. The three surfaces holding the duplicate today carry `./intraday-tape-lab.html` 3 tokens across 2 lines, `./gamma-trading-lab.html` 7 tokens across 6 lines and `./swing-structure-lab.html` 3 tokens across 2 lines — each page's `gammaAt` line carries two call tokens — and each must reach `0` tokens. Reintroducing an inline copy on any of those three, or on any other page, reinstates a second source of truth and fails this assertion | `node scripts/selftest.mjs` | No |
| TP-09-02 | Unit — adversarial | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 09 enumerated-surface gamma single-source closure (options, intraday-tape-lab, gamma-trading-lab, swing-structure-lab)` | Adversarial framing: the assertion asserts one producer directly rather than asserting two outputs happen to match. Both surfaces resolve their gamma evidence through `RLOPTIONS.readGammaEvidence`, so a second implementation returning a coincidentally identical sign and flip still fails | `node scripts/selftest.mjs` | No |
| TP-09-03 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 09 enumerated-surface gamma single-source closure (options, intraday-tape-lab, gamma-trading-lab, swing-structure-lab)` | For one snapshot consumed by both surfaces, the net-gamma sign and the flip agree, and the agreement follows from the shared producing function rather than from a post-hoc comparison of two independently computed results | `node scripts/selftest.mjs` | No |
| TP-09-04 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 09 enumerated-surface gamma single-source closure (options, intraday-tape-lab, gamma-trading-lab, swing-structure-lab)` | `./gamma-trading-lab.html` surfaces the as-of of the snapshot it consumed, so the reconciliation the user performs has both operands rather than one | `node scripts/selftest.mjs` | No |
| TP-09-05 | Unit — adversarial | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 09 enumerated-surface gamma single-source closure (options, intraday-tape-lab, gamma-trading-lab, swing-structure-lab)` | Adversarial fixture: two snapshots with deliberately different as-of values, one per surface. Each surface states its own cutoff and the divergence resolves to that stated cutoff difference; a surface reporting the other's cutoff, or suppressing its own, fails | `node scripts/selftest.mjs` | No |
| TP-09-06 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 09 enumerated-surface gamma single-source closure (options, intraday-tape-lab, gamma-trading-lab, swing-structure-lab)` | `gammaEvidenceFingerprint` digests the fields that determine the regime, so the reconciliation is answerable from the fingerprints alone and neither surface recomputes the other's numbers to answer it | `node scripts/selftest.mjs` | No |
| TP-09-07 | Unit — adversarial | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 09 enumerated-surface gamma single-source closure (options, intraday-tape-lab, gamma-trading-lab, swing-structure-lab)` | Adversarial regression on the host page: `./intraday-tape-lab.html` is confirmed to still resolve its gamma evidence through the shared producer, so every surface in the enumerated set resolves through one producer rather than some fraction of them. A regression of the host page's delegation fails this assertion | `node scripts/selftest.mjs` | No |
| TP-09-08 | E2E UI — live stack | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `both surfaces state their as-of and agree on sign and flip` | Asserted against both real pages with no `page.route`, no `context.route` and no request interception of any kind: each page displays the as-of of the snapshot it consumed, and for one shared snapshot both display the same net-gamma sign and the same flip | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-09-09 | E2E UI — live stack — adversarial | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `a different as-of renders as a stated cutoff difference` | Adversarial fixture against both real pages holding snapshots of different as-of values: each page displays its own cutoff and the difference presents as a stated cutoff difference rather than as a modelling contradiction. A rendering that hid either cutoff, leaving the divergence unattributable, fails | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-09-10 | Regression E2E | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `Regression: BS-016-036 both surfaces resolve one gamma producer and state the as-of each consumed` | The persistent regression case for the behaviours this scope changes, asserted against both real pages with no `page.route`, no `context.route` and no request interception of any kind: `./gamma-trading-lab.html` resolves its gamma evidence through `RLOPTIONS.readGammaEvidence` rather than an inline model, both pages display the as-of of the snapshot each consumed, and a fixture pairing two snapshots of deliberately different as-of values renders the divergence as a stated cutoff difference. `grep -c 'bsmGamma' gamma-trading-lab.html` returns `6` today, with the model at line 1053 and the identical `spot * 0.9 … spot * 1.1` band carrying `N = 60` at line 1074, so this case fails if an inline duplicate is reintroduced on either page, if either page suppresses the cutoff it consumed, or if the divergence renders as a modelling contradiction | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-09-11 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 09 enumerated-surface gamma single-source closure (options, intraday-tape-lab, gamma-trading-lab, swing-structure-lab)` | `./intraday-tape-lab.html` retirement: the standalone `function bsmGamma` at line 1278 — the occurrence that sits outside `computeOptLevels` (lines 1283–1302) and is therefore reached by no other scope's declared seam — is gone from the page source, and the page's gamma resolves through `RLOPTIONS.readGammaEvidence`. `git grep -c 'bsmGamma' intraday-tape-lab.html` returns `2` today, at lines 1278 and 1294; this row is what takes that page to `0` rather than to `1` | `node scripts/selftest.mjs` | No |
| TP-09-12 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 09 enumerated-surface gamma single-source closure (options, intraday-tape-lab, gamma-trading-lab, swing-structure-lab)` | `./swing-structure-lab.html` retirement: `function bsmGamma` at line 1266, the `gCoef` / `spot * 0.9 … spot * 1.1` / `N = 60` band at line 1281 and `gammaAt` at line 1282 are gone from the page source, the page resolves its gamma through `RLOPTIONS.readGammaEvidence`, and `netGEX` at line 1283 takes its value from that record. `git grep -c 'bsmGamma' swing-structure-lab.html` returns `2` today, at lines 1266 and 1282; this row is what takes that page to `0` | `node scripts/selftest.mjs` | No |
| TP-09-13 | Unit — adversarial | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 09 enumerated-surface gamma single-source closure (options, intraday-tape-lab, gamma-trading-lab, swing-structure-lab)` | Adversarial closure written over the full enumerated surface set rather than over a named pair: feeding one snapshot through `RLOPTIONS.readGammaEvidence` yields one fingerprint for the delegating call on each of `./intraday-tape-lab.html`, `./gamma-trading-lab.html` and `./swing-structure-lab.html`, and no page source in the repository still matches `function bsmGamma`. The trimmed definition line hashes to `f7d5400d052232c2d5d146887f456e98` on all three today, so a private copy reintroduced on any one of the three — or on a fourth page that later acquires one — fails this assertion and no surface escapes the closure by not being named | `node scripts/selftest.mjs` | No |
| TP-09-14 | Regression E2E | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `Regression: BS-016-036 the enumerated surface set resolves one gamma producer` | The persistent regression case for the two surfaces this scope newly owns, asserted against all three real pages with no `page.route`, no `context.route` and no request interception of any kind: `./intraday-tape-lab.html`, `./gamma-trading-lab.html` and `./swing-structure-lab.html` each render a net-gamma sign and a flip drawn from `RLOPTIONS.readGammaEvidence`, and for one shared snapshot the three agree on both. `git grep -c 'bsmGamma'` returns `2`, `6` and `2` on those pages today, so this case fails if a private copy is reintroduced on any of the three or if any of them renders a gamma value the shared producer did not supply | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-09-15 | Stress | `stress` | `scripts/selftest.mjs` group `Feature 016 Scope 09 enumerated-surface gamma single-source closure (options, intraday-tape-lab, gamma-trading-lab, swing-structure-lab)` | The single-source delegation is driven across the whole enumerated surface set under the whole published load rather than over one snapshot: each of `./intraday-tape-lab.html`, `./gamma-trading-lab.html` and `./swing-structure-lab.html` resolves every one of the 22 tickers `data/options/index.json` declares at `expected: 22, count: 22` through `RLOPTIONS.readGammaEvidence`, which is 66 delegating resolutions over 39,190 contracts and 4,690,110 bytes of snapshot JSON across the 22 files — the index's own 2,092 bytes excluded — with the largest single file `data/options/NDX.json` carrying 6,066 contracts in 570,547 bytes. Three properties are asserted at that volume. First, one producer: for each ticker the three surfaces yield one identical `gammaEvidenceFingerprint`, so 22 fingerprints answer 66 resolutions and a fourth implementation returning coincidentally equal numbers still fails. Second, attributable divergence on real data: the published set carries 6 distinct `asof` values — `2026-07-28T15:50:17`, `2026-07-28T15:59:59`, `2026-07-28T16:00:00`, `2026-07-28T16:14:23`, `2026-07-28T16:14:31` and `2026-07-28T16:14:42` — so every cross-surface pair drawn from tickers on different cutoffs resolves to a stated cutoff difference rather than to a modelling contradiction, exercised by the real set instead of by one synthetic pair. Third, the declared budget: the slowest single delegating resolution stays inside the 250 ms `performancePolicy.maxComputeMs` declared for each of the three surfaces — `simple-models.json` line 111 for `intraday-tape-lab`/`session-auction`, line 142 for `swing-structure-lab`/`swing-transition` and line 201 for `gamma-trading-lab`/`dealer-gamma-playbook` — and the last pass over identical arguments returns a result identical to the first, satisfying the `deterministic: true` declared beside each of those three budgets, so no clock read and no accumulated state leaks into the shared producer at volume. `data/options/**` is read and never written | `node scripts/selftest.mjs` | No |

---

### Definition of Done

- [ ] `[TP-09-01]` `[BS-016-036]` `bsmGamma` resolves to zero occurrences outside `rlexperience-adapters/options.js` across every committed page, so no second source of truth for the gamma model remains.
- [ ] `[TP-09-02]` `[BS-016-036]` The cross-surface assertion asserts a single producer directly: both surfaces resolve their gamma evidence through `RLOPTIONS.readGammaEvidence`, so two coincidentally matching implementations would still fail.
- [ ] `[TP-09-03]` `[BS-016-036]` For one snapshot consumed by both surfaces, the net-gamma sign and the flip agree, and that agreement follows from the shared producing function.
- [ ] `[TP-09-04]` `[BS-016-036]` `./gamma-trading-lab.html` states the as-of of the snapshot it consumed, so the reconciliation has both operands.
- [ ] `[TP-09-05]` `[BS-016-036]` Given two snapshots with different as-of values, each surface states its own cutoff and the divergence resolves to that stated cutoff difference rather than to a modelling contradiction.
- [ ] `[TP-09-06]` `[BS-016-036]` `gammaEvidenceFingerprint` digests the regime-determining fields, so the reconciliation is answerable without either surface recomputing the other's numbers.
- [ ] `[TP-09-07]` `[BS-016-036]` `./intraday-tape-lab.html` still resolves its gamma evidence through the shared producer, so every surface in the enumerated set resolves through one producer rather than some fraction of them.
- [ ] `[TP-09-08]` `[BS-016-036]` A user compares the session read's behavioural regime against the deeper options surfaces for the same ticker: on both live pages, with no request interception, each surface states the snapshot as-of it consumed, and where both consumed the same snapshot they display the same net-gamma sign and the same flip.
- [ ] `[TP-09-09]` `[BS-016-036]` On both live pages holding snapshots of different as-of values, each displays its own cutoff and the difference presents as a stated cutoff difference rather than as a modelling contradiction.
- [ ] `[TP-09-11]` `[BS-016-036]` `./intraday-tape-lab.html` retirement: the standalone `function bsmGamma` at line 1278, the one occurrence sitting outside `computeOptLevels`, is gone from the page source and the page resolves its gamma through `RLOPTIONS.readGammaEvidence`, taking that page from its 2 occurrences today to 0.
- [ ] `[TP-09-12]` `[BS-016-036]` `./swing-structure-lab.html` retirement: `function bsmGamma` at line 1266, the band at line 1281 and `gammaAt` at line 1282 are gone from the page source and the page resolves its gamma through `RLOPTIONS.readGammaEvidence`, taking that page from its 2 occurrences today to 0.
- [ ] `[TP-09-13]` `[BS-016-036]` Adversarial closure written over the full enumerated surface set rather than over a named pair: one snapshot yields one fingerprint on each of `./intraday-tape-lab.html`, `./gamma-trading-lab.html` and `./swing-structure-lab.html`, and no page source still matches `function bsmGamma`, so a private copy reintroduced on any of the three — or on a fourth page that later acquires one — fails.
- [ ] `[TP-09-14]` `[BS-016-036]` The persistent regression case for the two surfaces this scope newly owns: on all three live pages, with no request interception, each renders a net-gamma sign and a flip drawn from `RLOPTIONS.readGammaEvidence` and the three agree on both for one shared snapshot.
- [ ] `[TP-09-15]` `[BS-016-036]` Driven across the enumerated surface set at full published load — all 22 tickers resolved through `RLOPTIONS.readGammaEvidence` on each of `./intraday-tape-lab.html`, `./gamma-trading-lab.html` and `./swing-structure-lab.html`, 66 resolutions over 39,190 contracts and 4,690,110 bytes of snapshot JSON — the three surfaces yield one identical `gammaEvidenceFingerprint` per ticker, every cross-surface pair spanning two of the set's 6 distinct `asof` values resolves to a stated cutoff difference rather than a modelling contradiction, the slowest single resolution stays inside the 250 ms budget declared for all three surfaces at `simple-models.json` lines 111, 142 and 201, and the last pass matches the first exactly.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope are persistent and named — `[TP-09-10]` `tests/auction-gamma-playbook.spec.mjs` carries `Regression: BS-016-036 both surfaces resolve one gamma producer and state the as-of each consumed`, which asserts the shared producer, the two stated cutoffs and the attributable divergence against both real pages, and fails if an inline `bsmGamma` duplicate is reintroduced on either page, if either page suppresses the cutoff it consumed, or if a differing as-of renders as a modelling contradiction.
- [ ] Broader E2E regression suite passes — the complete `node scripts/selftest.mjs` suite and the real-page Playwright regression cases that already drive both surfaces this scope changes, `tests/simple-model-adapters-market.spec.mjs` cases `Regression: gamma trading Simple controls recompute owner playbook from existing options owner` and `Regression: intraday tape Simple auction controls recompute from truthful snapshot evidence`, all run green once this scope lands, with every pre-existing selftest group and every previously registered regression case preserved and no decreased passing count.

### Build Quality Gate

- [ ] `node scripts/selftest.mjs` completes with zero failing assertions and zero warnings.
- [ ] `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` completes with zero failures and no skipped required test.
- [ ] `node scripts/validate-tool-experience.mjs` completes clean; `./tools.json` holds 23 entries, `simple-models.json` holds 23 definitions and `journeys.json` holds 48 definitions and 48 steps, because this feature registers nothing.
- [ ] `bash .github/bubbles/scripts/artifact-lint.sh specs/016-auction-gamma-playbook` exits 0.
- [ ] Registry identity is frozen: `id`, `file`, `status`, the whole `experience` block and the whole `briefing` block in `./tools.json`, and `id`, `file`, `notes`, `icon` and `accent` in `./index.html`, are unchanged, and the `./index.html` blurb stays identical in substance to the `./tools.json` blurb that the landing page renders from.
- [ ] The three published descriptions agree: the `./README.md` live-tools row, the `./tools.json` blurb and the `./index.html` `TOOLS` blurb describe the tool the same way, and `## Layout`, `## Live site`, `## Add a new tool` and `## Deploy mechanism` are unchanged.
- [ ] `notes/intraday-tape-lab.md` states the lens in its signal engine, the P-15 lever in its input levers, the approximation and coverage bounds in its known limitations and an entry in its version history, with the doc's existing section structure preserved and no other tool's notes touched.
- [ ] Only the paths in this scope's Implementation Files table were modified: `rlexperience-adapters/options.js` and `rlexperience-adapters/market-structure.js` are byte-identical through this scope, the vanna, OVI and term-structure work on `./gamma-trading-lab.html` is unchanged, `computeGammaPlaybookSummary` keeps its own projection of the same record, and `data/options/**` was read and never written.
