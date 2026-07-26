# Scope 08 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md)

## Summary

Journey capability RUNTIME core delivered this dispatch (`bubbles.implement`, phase `implement`, mode `full-delivery`). Created the greenfield `rljourney.js` — one shared UMD Journey runtime (Node `module.exports` + browser `RLJOURNEY`) that CONSUMES the static journeys.json registry whose schema is single-sourced in `rlexperience.js`, and adds the runtime layer rlexperience does not own: runtime-boundary definition/step preconditions, dependency-DAG construction with cycle rejection + topological order, canonical semantic fingerprints, `JourneySession` create/serialize/restore/complete/backtrack with dependency-aware transitive-stale marking (SCN-012-010), typed complete/partial/refused NON-EXECUTING `JourneyCompletionPacket` construction (SCN-012-011), the no-executable-code invariant, the privacy field-name boundary, and the Scope-13 portfolio-stress gate (`privacyClass: local-private-ref` compiles `gated:true`, no Feature 008 read). Delivered `tests/journey.unit.mjs` (TP-08-01, 12/12) and `tests/journey-definitions.functional.mjs` (TP-08-02, 7/7) proving SCN-012-009/010/011/032. Broad selftest preserved at 934/0 (TP-08-10). `journeys.json` required NO changes — all 48 definitions already satisfy the runtime contract (validated through the runtime AND cross-checked through `rlexperience.validateJourneyRegistry`).

This is a PARTIAL dispatch (runtime core + unit + definitions-functional). Deferred to the next dispatch: `tests/journey-storage.functional.mjs` (TP-08-03), `tests/journey.spec.mjs` (TP-08-04..08), `tests/journey-mobile.spec.mjs` (TP-08-09), verified local-slot storage, the `rlexperience.js`/`rlapp.js`/`tool-experience.config.json` journey-exposure wiring, and the `scripts/validate-tool-experience.mjs` / `scripts/selftest.mjs` journey canary wiring. Scope 08 stays `in_progress`; feature `status` `not_started` / `certifiedAt` null untouched.

## Decision Record

- `rljourney.js` DELEGATES deep definition/step schema validation to the Scope-04 `rlexperience.validateJourneyRegistry` (single source) and OWNS only the runtime concerns rlexperience lacks (DAG cycle/topo, session, packet, no-execution, privacy). No validator fork.
- Session persistence (verified local slots) is deliberately NOT in this module this dispatch; the runtime is pure in-memory compute and therefore holds ZERO I/O surface (no fetch/providerFetch/localStorage), which makes the forbidden-authority scan trivially clean. Storage is TP-08-03, next dispatch.
- `journeys.json` NOT modified: the existing 48 definitions already pass the runtime contract; there was no real gap to fix, so no definition was touched (avoids a risky 96-field fingerprint rewrite the existing validator does not require — it accepts null fingerprints).
- The portfolio-stress Scope-13 gate is represented by `privacyClass: "local-private-ref"`; the runtime compiles it `gated:true` and never derives a real portfolio comparison (reads no Feature 008 data).

## Completion Statement

Scope 08 is NOT complete. Runtime core + TP-08-01 + TP-08-02 + TP-08-10 are GREEN and verified in-session; the remaining Test Plan rows (TP-08-03..09) and the wiring/canary items are deferred to the next `bubbles.implement` dispatch. No finalization is claimed.

## Code Diff Evidence

## Test Evidence

Execution agents append one current-session block per Test Plan row with Phase, exact Command, Exit Code, Claim Source, and raw output.

### TP-08-01

- **Phase:** implement
- **Command:** `node --test tests/journey.unit.mjs`
- **Exit Code:** 0
- **Claim Source:** executed (current session, 2026-07-26)

```text
✔ TP-08-01 compiles a real definition and rejects malformed definitions with closed codes (6.8295ms)
✔ TP-08-01 rejects executable JavaScript anywhere in Journey data (no-code invariant) (0.8154ms)
✔ TP-08-01 produces deterministic canonical fingerprints independent of key order (6.6692ms)
✔ TP-08-01 builds a topological step order and rejects dependency cycles (5.5493ms)
✔ TP-08-01 SCN-012-009 creates a durable session, restores it byte-identically, and rejects definition drift (8.530601ms)
✔ TP-08-01 requires recorded evidence for completion and enforces dependency order (1.582ms)
✔ TP-08-01 SCN-012-010 backtracking stales only transitive dependents and preserves unrelated steps (3.4576ms)
✔ TP-08-01 SCN-012-010 completion packet excludes stale dependent conclusions (3.6062ms)
✔ TP-08-01 builds typed complete / partial / refused packets with signoff rules (3.3021ms)
✔ TP-08-01 SCN-012-011 recording signoff triggers NO execution and leaves ledgers byte-identical (3.2781ms)
✔ TP-08-01 enforces the privacy boundary and validates mechanism adapters declaratively (1.1082ms)
✔ TP-08-01 keeps the portfolio-stress private goal gated (Scope 13, not implemented here) (1.3185ms)
ℹ tests 12
ℹ pass 12
ℹ fail 0
ℹ duration_ms 145.645103
TP0801_EXIT=0
```

RED-first reconciliation (in-session): the first run was RED — pass 10 / fail 2 — on two TEST-expectation errors where the runtime was already correct: (1) after completing `a,b` the topological next-required step is the dependency-free `d` (order `a>d>b>c`), not `c`; (2) a forbidden `accountBalance` context field is correctly refused by the privacy guard with `RLJOURNEY-PRIVACY`, not `RLJOURNEY-SESSION`. Both expectations were corrected to the runtime contract (not weakened); re-run GREEN 12/12.

### TP-08-02

- **Phase:** implement
- **Command:** `node --test tests/journey-definitions.functional.mjs`
- **Exit Code:** 0
- **Claim Source:** executed (current session, 2026-07-26)

```text
✔ TP-08-02 SCN-012-032 every registered tool resolves concrete Journey goals through the runtime (28.236901ms)
✔ TP-08-02 SCN-012-032 each ordinary tool has at least two concrete same-tool goals with a mechanism (16.262501ms)
✔ TP-08-02 SCN-012-032 market-brief maps to the four exact Market Action Center goals (13.603601ms)
✔ TP-08-02 SCN-012-032 no goal is generic, example-only, or a placeholder (0.8976ms)
✔ TP-08-02 every one of the 48 definitions compiles under the runtime schema with a fingerprint (12.0538ms)
✔ TP-08-02 cross-checks that rlexperience.js still validates the same journey registry (single source) (49.781302ms)
✔ TP-08-02 the runtime rejects an inventory that regresses goal completeness (non-tautological) (34.573201ms)
ℹ tests 7
ℹ pass 7
ℹ fail 0
ℹ duration_ms 254.433509
TP0802_EXIT=0
```

48-definition coverage proof: `RJ.validateRegistryCompleteness(journeys, inventory)` returns `ordinaryTools=22, centerGoals=4, totalGoals=48, definitionCount=48`; `market-brief` (kind `market-action-center`) maps to exactly the four `market-action` goals `[latent-risk, portfolio-stress, prepare-session, triage]`; every one of the 22 ordinary tools resolves ≥2 same-toolId goals each with a mechanism, evidence slot, completion predicate, ≥1 step, and `noExecution:true`; no goalId matches any generic/example token. The `rlexperience.validateJourneyRegistry` cross-check returns 48 definitions / 48 steps — single source intact.

### TP-08-10

- **Phase:** implement
- **Command:** `node scripts/selftest.mjs`
- **Exit Code:** 0
- **Claim Source:** executed (current session, 2026-07-26)

```text
================================================
Research-Lab self-test: 934 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

Broad baseline preserved exactly at 934/0. Journey definition/storage/no-execution selftest canaries are deferred to the next dispatch (TP-08-10 finalization), so the count is intentionally unchanged this dispatch.

### TP-08-03

- **Phase:** implement
- **Command:** `node --test tests/journey-storage.functional.mjs`
- **Exit Code:** 0
- **Claim Source:** executed (current session, 2026-07-26)

```text
✔ TP-08-03 SCN-012-009 verified round-trip restores prior context, completed step, evidence, and next-required step (33.208499ms)
✔ TP-08-03 SCN-012-009 a visit or creation alone is never a completed step after persistence (13.746ms)
✔ TP-08-03 corruption falls back to the REAL last-valid session, never a fixture echo (14.3352ms)
✔ TP-08-03 future-version and unknown records are left untouched (never downgraded) (12.1921ms)
✔ TP-08-03 verified write refuses a lossy (truncating) provider and preserves the last-valid session (13.896799ms)
✔ TP-08-03 enforces the maxSessionBytes limit (11.3366ms)
✔ TP-08-03 session-only mode: disabled storage reports session-only, refuses durable save, and safe export still works (12.1995ms)
✔ TP-08-03 a durable provider reports durable and probes leave no residue (0.4656ms)
✔ TP-08-03 the store rejects sensitive fields via both the runtime roots and the config policy layer (12.1485ms)
✔ TP-08-03 clear is the only deletion path and leaves unrelated keys intact (13.2354ms)
✔ TP-08-03 save / load / export never mutate unrelated storage keys (16.634199ms)
ℹ tests 11
ℹ pass 11
ℹ fail 0
ℹ duration_ms 267.198796
TP0803_EXIT=0
```

The verified-slot store lives in `rljourney.js` (`RJ.store.{capability,saveSession,loadSession,clearStore,exportSession,exportRecord}`), a provider-INJECTED double buffer consuming the REAL production `journeyStoragePolicy` from `tool-experience.config.json` (`pointerKey rlJourneySessionsV1.pointer`, `slotKeys slotA/slotB`, `maxSessionBytes 131072`, `forbiddenFieldNames`). The runtime NEVER references a storage global — a Map-backed provider (Node) or the browser per-origin store is injected. A write goes to the INACTIVE slot, is re-read and sha256-compared, and only then is the pointer flipped, so a corrupt slot never loses the last-valid session. Capability is a REAL probe write+read-back (a throwing provider = a browser CAPABILITY refusal, not request interception). Proven in-session: verified round-trip restoring context/completed-step/evidence/next-required; a visit (no evidence) is NEVER restored as complete; corruption recovers the REAL production last-valid `session1` (compared by its production `sessionFingerprint`, not a fixture echo); a newer-version slot is left byte-identical (never downgraded); the `maxSessionBytes` limit is enforced; session-only mode refuses durable save yet keeps safe export; both the runtime privacy roots (`position`) AND the config-only forbidden name (`privateTicker`) are rejected; clear is the only deletion path; and unrelated storage keys are never mutated.

### TP-08-03 storage RED-bite (non-tautology, in-session)

- **Phase:** implement
- **Command:** `node --test tests/journey-storage.functional.mjs` (with the verified re-read in `saveSessionInternal` neutralized: `if (false && ...)`)
- **Exit Code:** 1 (expected RED)
- **Claim Source:** executed (current session, 2026-07-26)

```text
not ok 5 - TP-08-03 verified write refuses a lossy (truncating) provider and preserves the last-valid session
# pass 10
# fail 1
RED_EXIT=1
```

Restored byte-identical and re-verified GREEN:

```text
fa80d5dcd81cce65060b6f923f23bd005869afdc08381a682d6718e16d94cb24  rljourney.js
# tests 11
# pass 11
# fail 0
GREEN_EXIT=0
```

Neutralizing the verified re-read fails EXACTLY the lossy-provider test (pass 10 / fail 1), proving it genuinely detects the verified-write contract; the `sha256sum` after restore equals the milestone-1 baseline `fa80d5dc…cb24`.

### Non-tautology RED-bite (runtime, in-session)

- **Phase:** implement
- **Command:** `node --test tests/journey.unit.mjs` (with `rljourney.js` transitive-stale marking neutralized: `if (false && ...)`)
- **Exit Code:** 1 (expected RED)
- **Claim Source:** executed (current session, 2026-07-26)

```text
not ok 7 - TP-08-01 SCN-012-010 backtracking stales only transitive dependents and preserves unrelated steps
not ok 8 - TP-08-01 SCN-012-010 completion packet excludes stale dependent conclusions
# pass 10
# fail 2
RED_EXIT=1
```

Restored byte-identical and re-verified GREEN:

```text
989a749c196d6e9096f39f7c05f196b5e23c25bf3cf1b5b320fd9a270d4a7d9d  rljourney.js
# tests 12
# pass 12
# fail 0
GREEN_EXIT=0
```

Neutralizing the transitive-stale marking fails EXACTLY the two SCN-012-010 tests, proving they genuinely detect the backtracking contract. `sha256sum` after restore equals the pre-bite baseline `989a749c…7d9d`.

### Forbidden-authority scan (rljourney.js)

- **Command:** `grep -nE 'fetch\(|providerFetch|localStorage|...|require\(|import ' rljourney.js` (comment lines excluded)
- **Result:** the only hit is line 92 `"credential"` — a string literal in the `FORBIDDEN_FIELD_ROOTS` privacy denylist (the runtime REJECTS credential fields), not an executable call. Raw counts: `fetch(`=0, `RLDATA`=0, `require(`=0, `import `=0; the single `providerFetch`/`localStorage` mentions are both on header-comment line 35. Executable authority = 0.

### Prior-scope byte integrity

- **Command:** `git diff --stat -- rlexperience.js rlexperience-adapters/ simple-models.json rldata.js data/options/`
- **Result:** EMPTY diff — Scope 04-07 core + all seven adapter modules + `simple-models.json` + `rldata.js` + `data/options/**` are byte-unchanged. Working tree adds only `rljourney.js`, `tests/journey.unit.mjs`, `tests/journey-definitions.functional.mjs`; the concurrent `BUG-001-.../scenario-manifest.json` dirty file is present and untouched. `journeys.json` unchanged.

### TP-08-09

- **Phase:** implement
- **Command:** `npx --no-install playwright test tests/journey-mobile.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
- **Exit Code:** 0
- **Claim Source:** executed (current session, 2026-07-26)

```text
Running 1 test using 1 worker

  ✓  1 …gress evidence backtrack dialogs and packet fit and restore focus (2.1s)

  1 passed (3.7s)
TP0809_EXIT=0
```

The single persistent live-stack mobile regression `Regression: Journey mobile progress evidence backtrack dialogs and packet fit and restore focus` runs the REAL production Journey shell under a genuine 320×900 mobile client (`page.setViewportSize`, not interception) on the REAL `market-heatmap-lab.html` page (loads `rlapp.js` → the REAL `RLAPP`), triggers the REAL boot path `RLAPP.mountJourney()` (fetches the real `tool-experience.config.json` / `journeys.json` / `tools.json`, loads the real `rljourney.js`, builds the real `__rljourneyController` against the real browser `localStorage`), and proves the SAME core invariants the desktop `journey.spec.mjs` proves, ON MOBILE:

- **Phase A/boot** — the shared Journey chooser boots on the 320px client with the durable-capability banner and the real `market-heatmap-lab` tool row exposing ≥2 concrete goals; the real breadth goal control renders with a real layout box.
- **Phase B / SCN-012-009 durable resume** — a fresh step is `pending` (a visit/creation is NOT a completed step), an evidence-less click is refused, the progress list is a semantic `<ol data-rljourney-progress aria-label="Journey progress">` with `aria-current="step"` on the current step and a per-step `data-rljourney-evidence-count`, a real evidence-backed completion persists to a verified durable slot, and after a genuine `page.reload()` the durable session resumes with the completed step, restored context, restored evidence, and restored next-required state (the completed step restores because it was completed, not because it was revisited).
- **Phase C / SCN-012-010 backtracking** — backtracking `a` in a real-runtime-compiled `a→b→(d)` synthetic marks ONLY the transitive dependent `b` stale WITH reason (`dependency backtracked: a … replace earlier assumption`) and keeps the unrelated `d` complete with no reason — asserted on the session view AND the rendered mobile DOM (`data-rljourney-status` / `data-rljourney-stale-reason` on `b` vs `d`); the partial packet excludes `b`, and a complete packet is refused (`RLJOURNEY-STALE`).
- **Phase D / SCN-012-011 signoff = NO execution** — after building a complete packet with signoff, recording the human review flips the packet review state locally (`reviewRecorded` false→true, `executed:false`, `noExecution:true`, packet DOM `data-rljourney-review="true"`) while the FULL `localStorage` ledger (every key) is BYTE-IDENTICAL across the signoff; no `executeTrade/submitOrder/placeOrder/rebalance/hedge/trade/execute/changeHolding` entry point exists on the runtime or controller, and a live `page.on('request')` capture confirms recording review issues NO trade/order/execute/rebalance/hedge/holding/portfolio/publish network request.
- **Phase A/D/E / mobile fit + focus** — the completion packet + non-empty disclaimer render and fit within the 320px viewport; the whole shell has no internal horizontal overflow (`scrollWidth ≤ clientWidth + 1`), the progress list and packet fit within the viewport width, and the shell imposes ZERO hardcoded inline geometry on its rendered children (`mount.querySelectorAll('[style]').length === 0` → adapts to any narrow viewport); focus on a real chooser control is PRESERVED (restored) across the shell's active-region re-render (the shell re-renders only the active progress/packet region, never the chooser control that holds focus).

Consistent with the proven desktop `journey.spec.mjs`, the injected mount is driven through `page.evaluate` (the DOM/runtime reality), not Playwright actionability; the neutral test host `<div data-rljourney-mount>` is opted into visibility (a real adopting page supplies its own visible host container) — a host-only override that never touches the shell's rendered chooser/progress/packet children, whose natural 320px reflow and zero inline geometry are exactly what the mobile-fit proof measures. The broad selftest re-ran green this session at `939 passed, 0 failed` (exit 0), confirming the new mobile spec does not regress the Research Lab baseline.

### TP-08-09 no-interception scan (mobile spec)

- **Phase:** implement
- **Command:** `grep -nE 'page\.route|context\.route|\.intercept|cy\.intercept|routeFromHAR|\bmsw\b|\bnock\b|wiremock|\.fulfill\(' tests/journey-mobile.spec.mjs` (executable lines then filtered to exclude `*`/`//` comment lines)
- **Exit Code:** 0
- **Claim Source:** executed (current session, 2026-07-26)

```text
22: * against the REAL browser per-origin localStorage store. There is NO page.route /
23: * context.route / .intercept / routeFromHAR / msw / nock / fulfill anywhere — durable storage is
=== EXECUTABLE (non-comment) interception lines — must be EMPTY ===
NONE — zero executable interception
```

The ONLY matches are the two documentation-comment lines (22–23) that DECLARE the zero-interception constraint; there is zero executable `page.route` / `context.route` / `.intercept` / `msw` / `nock` / `fulfill(` in the spec. The 320×900 mobile viewport is a genuine `page.setViewportSize` narrow client and the durable-storage / no-execution proofs run against the browser's own `localStorage` — never an intercepted response — so the mobile regression is a true live-stack test.

## Uncertainty Declarations

## Scenario Contract Evidence

### SCN-012-009

Unit-level durable-resume contract proven in TP-08-01 (`SCN-012-009 creates a durable session, restores it byte-identically, and rejects definition drift`): `createSession` starts every step `pending` with `nextRequiredStepId` at the first step — a visit/creation is NOT a completed step; `serializeSession`→`restoreSession` reproduces the exact `sessionFingerprint` and step statuses; a drifted `definitionFingerprint` is refused with `RLJOURNEY-STALE`. Durable resume through VERIFIED LOCAL SLOTS is now proven end-to-end in TP-08-03 (see `report.md#tp-08-03`): a real production session saved to a verified slot restores prior context, the completed step, its recorded evidence, and the next-required step on reload, while a mere visit is never restored as complete. The e2e durable-resume browser proof (TP-08-04, `tests/journey.spec.mjs`) follows in this dispatch's next milestone.

### SCN-012-010

Proven in TP-08-01 (`backtracking stales only transitive dependents and preserves unrelated steps` + `completion packet excludes stale dependent conclusions`) and hardened by the non-tautology RED-bite above. Backtracking step `a` in the synthetic `a→b→c` chain (with unrelated `d`) marks `b` and `c` `stale` WITH reason `dependency backtracked: a (…)`, leaves `d` `complete` with `staleReason: null`, and a `partial` completion packet includes only `d` while `excludedStaleSteps=[b,c]`; a `complete` packet is refused (`RLJOURNEY-STALE`) while any dependent is stale. `previewBacktrack` returns `staleDependents=[b,c]`, `unrelatedComplete=[d]` without mutation. The e2e proof (TP-08-05) is deferred.

### SCN-012-011

Proven in TP-08-01 (`recording signoff triggers NO execution and leaves ledgers byte-identical`): with three sentinel ledgers (`requestLedger`, `executionLedger`, `publicationLedger`), `recordSignoff` returns a packet with `reviewRecorded:true`, `executed:false`, `noExecution:true`, and the `JSON.stringify` of all three ledgers is byte-identical before and after (`executionLedger.orders.length === 0`). The runtime exposes NO execution entry point — `RJ.execute`, `RJ.submitOrder`, `RJ.rebalance` are all `undefined`. There is no trade/order/holding-change/rebalance/hedge/external-execution code path anywhere in `rljourney.js`. The e2e proof (TP-08-06) is deferred.

### SCN-012-032

Proven in TP-08-02 (see `report.md#tp-08-02`): the tools.json-derived inventory resolves through the runtime to exactly 22 ordinary tools (each ≥2 concrete same-toolId goals + mechanism) and the `market-brief` Market Action Center's exactly four global `market-action` goals — 48 total, no generic/example/placeholder goal — with the `rlexperience.validateJourneyRegistry` single-source cross-check and adversarial regressions (single-goal ordinary, three-goal Center, injected generic goalId) all refused. The e2e chooser proof (TP-08-07) is deferred.

## Coverage Report

## Lint/Quality

## Spot-Check Recommendations

## Validation Summary

## Audit Verdict
