# Scope 06 — Owner State v2 Boundary And Session-Qualifier Repair

**Status:** Not Started
**Depends On:** SCOPE-03 (foundation), SCOPE-05 (foundation)
**Tags:** `overlay:true`
**Business scenarios owned:** BS-016-017

---

## Objective

Widen the single data channel between the page and the auction module so the full
gamma record and the resolved regime actually cross it, and repair the one
existing consumer that was reading a projection narrower than what crossed.

Verified at `intraday-tape-lab.html` line 1366:
`contractVersion: 'session-auction-owner-state/v1'`. Verified at line 1373:
`gamma: state.opt ? { callWall: state.opt.callWall, putWall: state.opt.putWall, flip: state.opt.flip } : null`.
Three fields cross today. Verified at `market-structure.js` lines 959–967:
`sessionGammaTag` reads only `gamma.callWall` and `gamma.putWall` — so the
net-gamma sign never crossed the boundary at all, and the `flip` that did cross is
never read.

This scope is the vertical slice that fixes both ends of that one channel: the
producer widens to v2 carrying the full C1 record plus a sibling `regime` field,
and the consumer stops discarding what now arrives. It also retires the page's
duplicate gamma model against `RLOPTIONS`, completing half of the relocation
SCOPE-03 began.

---

## Implementation Files

Every path below is an authorized edit target in `design.md` §
Implementation Boundary. The nested `### Implementation Files` heading is the
exact anchor `implementation-reality-scan.sh` parses.

### Implementation Files

| Path | Boundary row | Nature of the edit in this scope |
|---|---|---|
| `intraday-tape-lab.html` | Host and sibling pages — extended, bounded, change **(4) Owner state v2 and delegation** | `__rlOwnerStateProvider` (lines 1351–1379) moves to `session-auction-owner-state/v2`, carrying the full C1 record at line 1373 plus a sibling `regime` field; `computeOptLevels` (lines 1283–1302) and `normOpt` (lines 1774–1777) delegate to `RLOPTIONS` |
| `rlexperience-adapters/market-structure.js` | Owner modules — extended, bounded; "**Also permitted, and required:** `sessionGammaTag` (lines 959–967) is repaired at the consumer end" | `sessionGammaTag` reads the net-gamma sign that now crosses the boundary and the `flip` that already crossed. It stays the wall-position context primitive feeding P-05 and never becomes the regime resolver |
| `tests/auction-gamma-playbook.spec.mjs` | Tests and documentation — **NEW file created by this feature**, created by SCOPE-01 | Extend with the re-qualification case across a hydration delta, and append this scope's one persistent regression case for the widened boundary, exactly as SCOPE-01's table anticipates when it records that later scopes extend the same file |
| `scripts/selftest.mjs` | Tests and documentation — "assertion groups for the new pure entry points on both owner modules" | Extend the auction owner-module group with the repaired `sessionGammaTag` cases, including the v1-shaped input that must still degrade rather than throw, and with the volume pass that drives the widened record over the whole published snapshot set against the declared compute budget |

---

## Consumer Impact Sweep

This scope renames a contract version and relocates a computation. Both are
interface changes with existing consumers, enumerated here.

### Contract rename: `session-auction-owner-state/v1` → `/v2`

| Consumer surface | Current state, verified this pass | Disposition |
|---|---|---|
| `__rlOwnerStateProvider["intraday-tape-lab"]` producer | `contractVersion: 'session-auction-owner-state/v1'` at line 1366 | The producer of the rename. Emits `/v2` with the widened `gamma` field and the new sibling `regime` field |
| `captureEvidence` (`market-structure.js` line 1155) | Receives `deepFreeze(JSON.parse(JSON.stringify(ownerState)))` | Consumes the widened record. Receives a structural clone, so no live page reference is reachable and no cycle is created |
| `ownerStateFingerprint` (`market-structure.js` line 321) and `evidenceIdentity` | Fingerprints the owner state | Both change, which is correct: different evidence is a different identity. Named here because `ownerByIdentity` (line 1156) keys frozen state by it, so a stale identity surfaces as an unavailable-for-this-identity message rather than as a wrong answer |
| `sessionGammaTag` (`market-structure.js` lines 959–967) | Reads `gamma.callWall` and `gamma.putWall` only | Repaired in this scope to read the sign and the flip. Its `"wall-context"` return keeps its meaning for the wall reading and is never reused as a regime value |
| `resolvePlaybookCell` (added by SCOPE-04) | Handles the v1 three-field shape by returning a `reduced` arm with a named absence cause | Unchanged. Backward compatibility is already built, so an older page shape produces a truthful reduced read rather than a throw |
| The `null` return when no regular-hours session has hydrated | Present today with its own comment recording that `null` yields an honest unavailable panel | Preserved verbatim |
| The **deep link** targets for this tool | `"deepLinkTargets": {"power":"intraday-tape-lab.html#power","journey":"intraday-tape-lab.html#journey"}` at `simple-models.json` line 113 | Unchanged, and checked rather than assumed. Both strings address page anchors, not the owner-state contract, so renaming the contract moves neither. This scope edits no registry, so the pair is byte-identical through it |
| The **navigation** entry for this tool in `rlnav.js` | Consumed-never-modified in `design.md` § Implementation Boundary; its `TOOLS` entries carry only `label`, `full`, `icon` and `file` | Unchanged. None of those four fields names the owner-state contract, and this scope registers nothing, so no navigation entry moves |
| A **generated client** for this contract | None exists — the owner-state record crosses in-process through `globalThis.__rlOwnerStateProvider` (line 1351), never over a wire | No generated client and no **API client** to regenerate. That absence is exactly why the sweep below has to be a source scan: there is no schema artifact whose regeneration would surface a missed caller |

**Stale-reference scan, run repository-wide before this scope closes.** The
enumerated rows above are the consumers this scope knows about; the scan is what
proves there is no sixth one. It asserts that no surface outside the enumerated
set reads the literal string `session-auction-owner-state/v1`, and that no surface
reads `gamma.callWall` or `gamma.putWall` expecting the three-field projection.
Because it scans the whole repository rather than the enumerated set, a consumer
left on the narrow shape fails it wherever that consumer sits. TP-06-11 is that
scan.

### Computation relocation: the page's duplicate gamma model

| Consumer surface | Current state, verified this pass | Disposition |
|---|---|---|
| `computeOptLevels` (lines 1283–1302) | Owns an inline `bsmGamma`, the band at line 1293 and the flip search at lines 1296–1298; `grep -c 'bsmGamma' intraday-tape-lab.html` returns `2` | Delegates to `RLOPTIONS.readGammaEvidence`, passing `r = 0.045` and `q = 0` from line 1285 and the `sourceKind` SCOPE-01 recorded. Matches the owner-parity shape the auction half already has at lines 1471–1478 |
| `normOpt` (lines 1774–1777) | Projects eight fields through the cache round-trip | Carries the as-of, coverage and availability fields through instead of the eight-field projection |
| `gamma-trading-lab.html` | 6 occurrences of `bsmGamma` | Not touched by this scope. SCOPE-09 owns that retirement under its own boundary |

---

## Change Boundary

This scope is a two-ended repair on one channel: the producer at
`intraday-tape-lab.html` line 1366 widens and the consumer at
`market-structure.js` lines 959–967 stops discarding. Both ends are edits to
behaviour that already ships, and the page is 134,773 bytes carrying the whole
tool, so the boundary below is what keeps a two-ended repair from becoming a
behavioural edit to the rest of the page.

**Allowed file families**

| Family | Concrete path | What may change inside it |
|---|---|---|
| Host page — one contract widening plus one delegation | `intraday-tape-lab.html` | `__rlOwnerStateProvider` (lines 1351–1379): `contractVersion` at line 1366 moves to `/v2`, the `gamma` field at line 1373 carries the full C1 record, and a sibling `regime` field is added; `computeOptLevels` (lines 1283–1302) delegates to `RLOPTIONS.readGammaEvidence` with the `r = 0.045`, `q = 0` read from line 1285; `normOpt` (lines 1774–1777) carries as-of, coverage and availability through instead of the eight-field `spot`/`callWall`/`putWall`/`flip`/`maxPain`/`netGEX`/`pcOI` projection. No other page function changes behaviour |
| Owner module — one bounded consumer repair | `rlexperience-adapters/market-structure.js` | `sessionGammaTag` (lines 959–967) reads the net-gamma sign that now crosses and the `flip` that always crossed. Its four returns keep their wall meaning. No other export changes signature, return shape or behaviour |
| Assertion surface | `scripts/selftest.mjs` | The auction owner-module group gains this scope's cases, including the v1-shaped degrade case and the volume pass |
| Feature live-stack spec | `tests/auction-gamma-playbook.spec.mjs` | This scope's re-qualification case and its one persistent regression case, appended |

**Excluded surfaces** — a diff reaching any row below is a boundary breach rather
than an in-scope change:

| Excluded surface | Why it is excluded here |
|---|---|
| `gamma-trading-lab.html` | It carries 6 of the 8 repository occurrences of `bsmGamma`; SCOPE-09 owns that retirement under its own boundary. It stays byte-identical through this scope |
| `computeSession`, `adherence`, `ivMinutes`, `controlRead`, `sessionType` (lines 1471–1478) | They are thin alias delegations into `RLMARKETSTRUCTURE`. The auction math is not what this scope repairs, and each keeps its alias shape |
| The `data-m` segment (lines 1070–1071) | Exactly two buttons today. This scope adds no mode and no button; SCOPE-07 owns the render and adds none either |
| `fetchOptionLevelsAny` (line 1315) | Its same-origin-first order is the thing that makes the page work on GitHub Pages. It keeps that order; only what `normOpt` carries afterwards changes |
| The `null` return for an unhydrated regular-hours session | It is what yields an honest unavailable panel rather than a fabricated one, and it is preserved verbatim |
| `data/options/**` | Read only, which is NFR-016-006. TP-06-14 reads the published set and writes nothing back to it |
| The `fused` arm body and `resolvePlaybookCell` itself | SCOPE-04 added the resolver and SCOPE-05 owns what a fused arm says. This scope widens what reaches the resolver and changes neither |
| The lens render across `#verdict`, `#optbox` and `#simpleView` | SCOPE-07 owns it. This scope renders nothing; it changes what crosses the boundary the render will later read |
| `rldata.js`, `rlapp.js`, `rlchart.js`, `rlticker.js`, `rlg.js`, `rlnav.js` | Consumed-never-modified in `design.md` § Implementation Boundary. The widened record reaches them through no new call |
| `tools.json`, `index.html`, `simple-models.json` | This scope registers nothing and declares nothing; no registered count moves |

---

## Gherkin Scenarios

### BS-016-017: A reduced read re-qualifies when usable gamma evidence arrives

```gherkin
Scenario: Usable gamma evidence becomes available for a read that was auction-only
  Given a reduced read is showing with a named missing gamma input
  When usable gamma evidence becomes available under the same evidence cutoff
  Then the read re-qualifies into a fully asserted playbook cell
  And the cell states the newly available snapshot's as-of
  And the reduced read no longer presents as the current read
```

---

## Implementation Plan

**1. Move the provider to `session-auction-owner-state/v2`.**
Line 1366's `contractVersion` becomes `/v2`. The `gamma` field at line 1373
changes from the three-field projection to the full C1 record produced by
`RLOPTIONS.readGammaEvidence`, and gains a sibling `regime` field holding the C3
record from `RLOPTIONS.resolveBehaviouralRegime`. Both are plain data; neither is
a function.

**2. Keep the regime travelling as data, never by import.**
`market-structure.js` line 15 forbids importing another domain adapter module.
The regime crosses on `ownerState.gamma`'s sibling field — the same channel
`gamma` already uses — so the module reads a value rather than calling
`RLOPTIONS`. No edge is added in either direction and the dependency graph stays
acyclic.

**3. Delegate the page's gamma computation to `RLOPTIONS`.**
`computeOptLevels` calls `RLOPTIONS.readGammaEvidence` with `r = 0.045` and
`q = 0` read from line 1285 and the `sourceKind` recorded in SCOPE-01. The inline
`bsmGamma`, band and flip search are retired. `normOpt` carries as-of, coverage
and availability through the cache round-trip so a cached read is not silently
narrower than a fresh one.

**4. Repair `sessionGammaTag` at the consumer end.**
It reads the net-gamma sign now crossing the boundary and the `flip` that always
crossed and was never read. It stays the wall-position context primitive feeding
P-05 as context only. It does not become the regime resolver, because FR-016-001
forbids resolving a regime from wall position; leaving the wall tag an
unambiguously separate reading is the cleanest way to honour that. Its
`"wall-context"` return keeps its meaning for the wall reading and is never reused
as a regime value.

**5. Make re-qualification a consequence of the boundary, not a special case.**
When usable gamma evidence arrives under the same cutoff, the provider emits a
widened record, `ownerStateFingerprint` changes, `evidenceIdentity` changes, and
`resolvePlaybookCell` selects the `fused` arm on the next compute. The cell states
the newly available snapshot's as-of, which is available only because SCOPE-01
preserved it. The reduced read stops presenting as the current read because there
is one compute and both views read its single result.

**6. Hold the null-safe first paint across the widened record.**
Every new numeric path guards through `isNum` (line 1233) or
`isFiniteNumber` (`market-structure.js` line 110), both of which test
`typeof value === "number"` before the global `isFinite`. Absent values render as
an em dash. A first paint with a half-empty cache renders a reduced read rather
than an empty panel or a halted render.

**Boundary held.** `fetchOptionLevelsAny` keeps its same-origin-first order. The
`null` return when no regular-hours session has hydrated is preserved.
`data/options/**` is read and never written.

---

## Test Plan

This scope's Implementation Files are `./intraday-tape-lab.html`,
`rlexperience-adapters/market-structure.js`, `scripts/selftest.mjs` and
`tests/auction-gamma-playbook.spec.mjs`. Every boundary row is a source-level or
pure-function assertion, so it runs `node scripts/selftest.mjs`. Two rows are
browser rows because neither claim survives being made in Node: the
re-qualification needs a real hydration delta against the running page, and the
persistent regression case needs the repaired consumer executing inside the page
from the real module file. Both therefore belong to the spec file.

**Adversarial fixture rule for this scope.** Three invariants here are only
provable by a fixture built to violate them. The wall-context row is vacuous if
the fixture's wall position is neutral, so it supplies a wall position that would
imply a regime and asserts no regime value is produced from it. The
backward-compatibility row supplies the three-field shape the page emits today,
so a consumer that assumed the widened record throws rather than degrades. The
consumer-sweep row scans the whole repository rather than the enumerated set, so
a surface still reading `session-auction-owner-state/v1` or the three-field
projection fails it wherever that surface sits.

| ID | Test Type | Category | File / Location | What it proves | Command | Live System |
|---|---|---|---|---|---|---|
| TP-06-01 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 06 owner state v2 boundary and session qualifier (intraday-tape-lab, market-structure)` | `__rlOwnerStateProvider` on `./intraday-tape-lab.html` declares `contractVersion: 'session-auction-owner-state/v2'`, and its `gamma` field carries the full C1 record rather than the three-field `callWall`/`putWall`/`flip` projection, so the net-gamma sign crosses the boundary at all | `node scripts/selftest.mjs` | No |
| TP-06-02 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 06 owner state v2 boundary and session qualifier (intraday-tape-lab, market-structure)` | The provider carries a sibling `regime` field holding the C3 record alongside `gamma`, and both are plain data rather than functions, so the record survives the structural clone the consumer receives | `node scripts/selftest.mjs` | No |
| TP-06-03 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 06 owner state v2 boundary and session qualifier (intraday-tape-lab, market-structure)` | `rlexperience-adapters/market-structure.js` adds no import of `RLOPTIONS`: the regime arrives as a value on frozen owner state, so the rule at its line 15 holds and no edge is added in either direction | `node scripts/selftest.mjs` | No |
| TP-06-04 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 06 owner state v2 boundary and session qualifier (intraday-tape-lab, market-structure)` | The repaired `sessionGammaTag` reads the net-gamma sign that now crosses the boundary and the `flip` that always crossed and was never read, and it keeps returning wall-position context for the P-05 reading | `node scripts/selftest.mjs` | No |
| TP-06-05 | Unit — adversarial | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 06 owner state v2 boundary and session qualifier (intraday-tape-lab, market-structure)` | Adversarial input: an owner state whose wall position would imply a behavioural regime. `sessionGammaTag`'s `"wall-context"` return keeps its wall meaning and reaches no regime slot, so an implementation that resolved a regime from wall position fails this assertion | `node scripts/selftest.mjs` | No |
| TP-06-06 | Unit — adversarial | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 06 owner state v2 boundary and session qualifier (intraday-tape-lab, market-structure)` | Adversarial input: a v1-shaped owner state carrying the three-field gamma projection and no `regime` sibling. `resolvePlaybookCell` returns a `reduced` arm with a named absence cause and `sessionGammaTag` degrades rather than throwing, so an older page shape produces a truthful reduced read | `node scripts/selftest.mjs` | No |
| TP-06-07 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 06 owner state v2 boundary and session qualifier (intraday-tape-lab, market-structure)` | `ownerStateFingerprint` and `evidenceIdentity` both change when the record widens, and a lookup against a superseded identity yields the unavailable-for-this-identity message rather than a wrong answer computed from stale state | `node scripts/selftest.mjs` | No |
| TP-06-08 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 06 owner state v2 boundary and session qualifier (intraday-tape-lab, market-structure)` | `captureEvidence` receives a deep-frozen structural clone of the widened record: no live page reference is reachable through it and the clone carries no cycle, so the record backing a re-qualified cell cannot be mutated after capture | `node scripts/selftest.mjs` | No |
| TP-06-09 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 06 owner state v2 boundary and session qualifier (intraday-tape-lab, market-structure)` | `computeOptLevels` on `./intraday-tape-lab.html` calls `RLOPTIONS.readGammaEvidence` with `r = 0.045`, `q = 0` and the recorded `sourceKind`, and the page's inline `bsmGamma`, its band and its flip search are gone, so the full C1 record the provider emits has a single producer | `node scripts/selftest.mjs` | No |
| TP-06-10 | Unit | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 06 owner state v2 boundary and session qualifier (intraday-tape-lab, market-structure)` | `normOpt` carries as-of, coverage and availability through the cache round-trip instead of the eight-field projection, so a cached read is not silently narrower than a fresh one and a newly arrived snapshot's as-of survives to be stated | `node scripts/selftest.mjs` | No |
| TP-06-11 | Unit — adversarial | `unit` | `scripts/selftest.mjs` group `Feature 016 Scope 06 owner state v2 boundary and session qualifier (intraday-tape-lab, market-structure)` | Adversarial scan of the whole repository rather than the enumerated consumer set: no surface reads the literal string `session-auction-owner-state/v1`, and no surface reads `gamma.callWall` or `gamma.putWall` expecting the three-field projection, so a consumer left on the narrow shape fails wherever it sits | `node scripts/selftest.mjs` | No |
| TP-06-12 | E2E UI — live stack | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `reduced read re-qualifies across a hydration delta` | Asserted against the real page with no `page.route`, no `context.route` and no request interception of any kind: a reduced read showing a named missing gamma input re-qualifies into a fully asserted cell once usable gamma evidence arrives under the same cutoff, the cell states the newly available snapshot's as-of, and the reduced read stops presenting as the current read | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-06-13 | Regression E2E | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `Regression: BS-016-017 owner state v2 carries the net-gamma sign and the session qualifier reads it` | The persistent regression case for the two behaviours this scope repairs, asserted on the real `intraday-tape-lab.html` page with the real `rlexperience-adapters/market-structure.js` file injected — the same real-module-into-real-page technique `tests/simple-model-adapters-market.spec.mjs` already applies to this module at line 482, against the `intraday-tape-lab.html` descriptor at line 327, under the file header at line 17 recording that there is no `page.route` and no `context.route` — and with no request interception. In the page, `__rlOwnerStateProvider["intraday-tape-lab"]()` returns `contractVersion: 'session-auction-owner-state/v2'` and a `gamma` field carrying the net-gamma sign, which the three-field `callWall`/`putWall`/`flip` projection at line 1373 does not carry at all today; `sessionGammaTag` reads that sign and the `flip` that crossed and was never read, rather than the `callWall`/`putWall`-only pair at lines 959–967; and a v1-shaped record still yields a `reduced` arm with a named cause instead of throwing. A build that reinstates `/v1`, narrows `gamma` back to the three-field projection, or reverts the qualifier to reading only the two walls fails this case in the browser, not only in Node | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: BS-016-017 owner state v2 carries the net-gamma sign and the session qualifier reads it" --reporter=list` | Yes |
| TP-06-14 | Stress | `stress` | `scripts/selftest.mjs` group `Feature 016 Scope 06 owner state v2 boundary and session qualifier (intraday-tape-lab, market-structure)` | The widened boundary is driven over the entire published set `data/options/index.json` declares — 22 tickers, 39,190 contracts and 4,692,202 bytes of snapshot JSON on disk, the largest single file `data/options/NDX.json` carrying 6,066 contracts in 570,547 bytes — with every ticker's record built at v2, deep-frozen through the `deepFreeze(JSON.parse(JSON.stringify(ownerState)))` clone at `market-structure.js` line 1155, fingerprinted, registered through the `ownerByIdentity.set(evidence.evidenceIdentity, frozen)` at line 1157 and re-read back, plus the v1-shaped record interleaved so the degrade path is exercised at volume rather than once. Every record clones without throwing and carries no cycle; `ownerStateFingerprint` (line 321) yields a distinct identity per distinct record and the same identity for an identical one, so a lookup never returns another ticker's state; the slowest single provider-to-qualifier resolution stays inside the 250 ms `performancePolicy.maxComputeMs` declared for this module at `simple-models.json` line 111; and the last pass over identical arguments returns a result identical to the first, satisfying the `deterministic: true` declared beside it, so no clock read and no accumulated state leaks into the widened boundary at volume | `node scripts/selftest.mjs` | No |

---

### Definition of Done

- [ ] `[TP-06-01]` `[BS-016-017]` The provider emits `session-auction-owner-state/v2` carrying the full C1 record on its `gamma` field, so the net-gamma sign that never crossed the boundary now crosses it.
- [ ] `[TP-06-02]` `[BS-016-017]` The provider carries the C3 record on a sibling `regime` field, and both `gamma` and `regime` are plain data that survive the structural clone the consumer receives.
- [ ] `[TP-06-03]` `[BS-016-017]` `rlexperience-adapters/market-structure.js` imports no `RLOPTIONS`; the regime travels as a value on frozen owner state and the dependency graph stays acyclic.
- [ ] `[TP-06-04]` `[BS-016-017]` `sessionGammaTag` reads the net-gamma sign and the `flip` that now cross the boundary, and keeps returning wall-position context for the P-05 wall reading.
- [ ] `[TP-06-05]` `[BS-016-017]` Given an owner state whose wall position would imply a regime, `sessionGammaTag`'s `"wall-context"` return stays a wall reading and supplies no regime value on any path.
- [ ] `[TP-06-06]` `[BS-016-017]` Given a v1-shaped owner state with the three-field gamma projection and no `regime` sibling, the cell resolves to a `reduced` arm with a named absence cause and nothing throws.
- [ ] `[TP-06-07]` `[BS-016-017]` Widening the record changes both `ownerStateFingerprint` and `evidenceIdentity`, and a lookup against a superseded identity yields the unavailable-for-this-identity message rather than an answer computed from stale state.
- [ ] `[TP-06-08]` `[BS-016-017]` `captureEvidence` receives a deep-frozen structural clone of the widened record that reaches no live page reference and carries no cycle.
- [ ] `[TP-06-09]` `[BS-016-017]` `computeOptLevels` delegates to `RLOPTIONS.readGammaEvidence` with `r = 0.045`, `q = 0` and the recorded `sourceKind`, and the page's inline `bsmGamma`, band and flip search are gone.
- [ ] `[TP-06-10]` `[BS-016-017]` `normOpt` carries as-of, coverage and availability through the cache round-trip, so a cached read is not narrower than a fresh one and a newly arrived snapshot's as-of survives to be stated on the re-qualified cell.
- [ ] `[TP-06-11]` `[BS-016-017]` A repository-wide scan finds no surface reading the literal `session-auction-owner-state/v1` and none reading `gamma.callWall` or `gamma.putWall` as the three-field projection.
- [ ] `[TP-06-12]` `[BS-016-017]` On the live page, with no request interception, a reduced read with a named missing gamma input re-qualifies into a fully asserted cell under the same cutoff, states the newly available snapshot's as-of, and stops presenting as the current read.
- [ ] `[TP-06-14]` `[BS-016-017]` Driven across all 22 published snapshots with the v1-shaped record interleaved, every v2 record deep-clones without throwing and carries no cycle, `ownerStateFingerprint` yields a distinct identity per distinct record and an identical one for an identical record, the slowest provider-to-qualifier resolution stays inside the 250 ms budget declared at `simple-models.json` line 111, and the last pass matches the first exactly.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope are persistent and named — `[TP-06-13]` `tests/auction-gamma-playbook.spec.mjs` carries `Regression: BS-016-017 owner state v2 carries the net-gamma sign and the session qualifier reads it`, which executes the real module inside the real page and fails the moment `contractVersion` reverts to `session-auction-owner-state/v1`, the `gamma` field narrows back to the three-field `callWall`/`putWall`/`flip` projection at line 1373, or `sessionGammaTag` reverts to reading only the two walls it reads at lines 959–967 today.
- [ ] Broader E2E regression suite passes — the complete `node scripts/selftest.mjs` suite, the registry validator `node scripts/validate-tool-experience.mjs`, and the real-page Playwright regression spec that already injects this exact module into five pages, `tests/simple-model-adapters-market.spec.mjs`, all run green once this scope lands, with every pre-existing selftest group and every previously registered regression case preserved and no decreased passing count.
- [ ] The consumer impact sweep is complete and zero stale first-party references remain — every row of both sweep tables is dispositioned, the deep-link pair at `simple-models.json` line 113 and this tool's `rlnav.js` navigation entry are confirmed unmoved, no generated client or API client exists to regenerate because the record crosses in-process through `globalThis.__rlOwnerStateProvider` at line 1351, and the repository-wide stale-reference scan finds no surface reading the literal `session-auction-owner-state/v1` and none reading `gamma.callWall` or `gamma.putWall` as the three-field projection.
- [ ] Change Boundary is respected and zero excluded file families were changed — the diff for this scope contains only `intraday-tape-lab.html`, `rlexperience-adapters/market-structure.js`, `scripts/selftest.mjs` and `tests/auction-gamma-playbook.spec.mjs`; `gamma-trading-lab.html` is byte-identical with its 6 `bsmGamma` occurrences intact, the alias delegations at lines 1471–1478 keep their shape, the `data-m` segment keeps exactly two buttons, `fetchOptionLevelsAny` at line 1315 keeps its same-origin-first order, the `null` return for an unhydrated regular-hours session is preserved verbatim, `data/options/**` was read and never written, and no page render, no consumed-never-modified shell module and no registry entry appears in it.

### Build Quality Gate

- [ ] `node scripts/selftest.mjs` completes with zero failing assertions and zero warnings.
- [ ] `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` completes with zero failures and no skipped required test.
- [ ] `node scripts/validate-tool-experience.mjs` completes clean; no registry count moves, because this scope registers nothing.
- [ ] `bash .github/bubbles/scripts/artifact-lint.sh specs/016-auction-gamma-playbook` exits 0.
- [ ] Every new numeric path guards through `isNum` or `isFiniteNumber` before any `.toFixed()` or arithmetic, so a first paint against a half-empty cache renders em dashes and completes rather than halting.
- [ ] Only the paths in this scope's Implementation Files table were modified: `./gamma-trading-lab.html` is byte-identical through this scope, `computeSession`, `adherence`, `controlRead` and `sessionType` keep their alias shape, the `data-m` segment keeps exactly two buttons, `fetchOptionLevelsAny` keeps its same-origin-first order, the `null` return for an unhydrated regular-hours session is preserved, and `data/options/**` was read and never written.
