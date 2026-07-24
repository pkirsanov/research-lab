# Scopes: BUG-001 Options-Flow Shell Startup Starvation

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) | [report.md](report.md) | [uservalidation.md](uservalidation.md)

> **Planning state:** `bubbles.plan` reconciled this single-scope handoff to the
> adopted design through `TR-BUG001-PLAN`. Every delivery checkbox remains
> intentionally unchecked; planning adoption does not authorize implementation.

## Execution Outline

### Phase Order

1. `bubbles.plan` locks this one-scope Test Plan, six-item test-evidence DoD,
  change boundary, and execution gate to the adopted design.
2. `bubbles.test` creates the persistent adversarial browser regression and
  records the required pre-fix RED against unchanged
  `options-flow-feed-lab.html`.
3. `bubbles.implement` applies the page-local startup-sequencing repair only
  after that RED is recorded.
4. `bubbles.test`, `bubbles.regression`, `bubbles.validate`, and
   `bubbles.audit` execute the remaining `bugfix-fastlane` checks before any
   certification transition.

### Ordering Rationale

The bug has one controlling path and one production owner page. Splitting the
repair into multiple scopes would separate the readiness dependency from the
exact regression that proves it. The persistent adversarial RED must exist
before implementation; current diagnostic commands are discovery evidence and
do not substitute for that test-owned phase.

### New Types and Signatures

- Page-local `startDeltaHydrationOnce()` guard: starts the existing
  `fetchDelta()` continuation at most once.
- Page-local `onShellReady()` listener: consumes the existing generic
  `rlviews:change` event only after confirming
  `#rlviews[data-rlexperience-shell="ready"]`.
- No new shared readiness API, event, route branch, data contract, worker,
  provider, producer, storage owner, or option schema.

### Validation Checkpoints

1. Before production edits, TP-BUG001-02 must exist and record the expected RED
   because the first native option delta request observes no ready shell.
2. After the page-local sequencing edit, TP-BUG001-02 must turn GREEN while
   TP-BUG001-01 retains the unchanged 10-second all-route canary.
3. Before regression/validation, TP-BUG001-03 through TP-BUG001-06 must prove
   route completeness, contextual decoration, protected ownership, broad
   selftest health, and regression quality.

## Scope Inventory

| Scope | Outcome | Surfaces | Test Rows | Status |
|---|---|---|---:|---|
| SCOPE-01 | Shell readiness precedes heavy option hydration without changing source or context ownership | Options-flow startup plus shell regressions | 6 | Done |

## SCOPE-01: Sequence Heavy Hydration After Shared Shell Readiness

**Status:** Done

**Depends On:** Feature 012 Scope 02 shared four-view shell and Scope 03
contextual-tooltip foundation, both consumed as existing foundations.

**Capability Role:** `cross-scope-bugfix-overlay`

### Gherkin Scenarios

The authoritative scenarios are `SCN-BUG001-001` through
`SCN-BUG001-003` in [spec.md](spec.md#scenarios) and
[scenario-manifest.json](scenario-manifest.json).

#### SCN-BUG001-001 - Shell precedes heavy option hydration

```gherkin
Scenario: SCN-BUG001-001 Options-flow opens with a cold page and current same-origin snapshots
  Given the page is registered in Feature 012
  And the shared shell is mounting asynchronously
  And the option owner has twelve same-origin snapshots available
  When the page performs its automatic cache-first startup
  Then the shared four-view shell becomes ready before the first delta snapshot request starts
  And the existing ten-second shell canary passes without a larger timeout
  And option hydration starts once after shell readiness
```

#### SCN-BUG001-002 - Context and option ownership remain intact

```gherkin
Scenario: SCN-BUG001-002 Heavy option rows render after shell readiness
  Given option hydration has started through the existing owner path
  When option rows and ticker context controls are rendered
  Then RLTKR and RLCTX continue to decorate the rendered tickers
  And same-origin snapshots remain first in the existing chain
  And no new producer, provider path, storage owner, row truncation, or manual fetch gate exists
```

#### SCN-BUG001-003 - Every registered route still mounts one shell

```gherkin
Scenario: SCN-BUG001-003 The complete registered shell canary runs after repair
  Given tools.json contains the current twenty-three routes
  When the unchanged all-route shell command executes
  Then every route reports exactly one ready shell and four expected panels
  And options-flow-feed-lab is no longer the missing success record
  And zero route is skipped or granted a page-specific test exemption
```

### UI Scenario Matrix

| Scenario | Preconditions | Steps | User-visible / observable result | Test Type |
|---|---|---|---|---|
| SCN-BUG001-001 | Real page, current same-origin snapshots, shared shell mounting asynchronously | Open `options-flow-feed-lab.html`; observe native option fetch start; wait for shell | Cached content paints immediately; the ready four-view shell exists before the first option delta request; hydration starts once within the unchanged 10-second canary | `e2e-ui` + `functional` |
| SCN-BUG001-002 | Existing option owner path and contextual decorators enabled | Allow hydration to complete; inspect option rows, ticker links, and contextual controls | Hydrated rows remain present and RLTKR/RLCTX controls remain enabled without source/provider/owner changes | `e2e-ui` + `unit` + `functional` |
| SCN-BUG001-003 | Current 23-route registry | Run the unchanged all-route canary and ordinary/Center/mobile shell suite | Every route exposes exactly one ready shell and four expected panels; no route is skipped or exempted | `functional` + `e2e-ui` |

### Implementation Plan

1. `bubbles.test` adds the exact persistent title from
  [design.md](design.md#required-adversarial-regression) before production
  changes and observes native fetch ordering without request interception.
2. `bubbles.test` runs the focused test against unchanged
  `options-flow-feed-lab.html` and records RED specifically because the first
  option delta request starts before the generic ready marker exists.
3. Keep state load, control wiring, cached `rebuild()`, and the immediate first
  `render()` in their current synchronous cache-first position.
4. Move only the existing `fetchDelta()` start behind the existing generic
  ready marker and initial `rlviews:change` event.
5. Use a page-local boolean set before `fetchDelta()` plus listener removal so
  marker-ready startup, the initial event, later view changes, and re-entrant
  callbacks cannot start a second worker group.
6. Do not add a tool-ID branch or readiness owner to `rlapp.js`, `rlviews.js`,
  or `rlexperience.js`; do not alter `ensureChain`, six-worker count, universe,
  snapshots, Yahoo fallback, cache schema, render content, RLTKR, or RLCTX.
7. Rerun the focused test immediately, then the identical unchanged all-23
  command, broader shell E2E, ownership boundary, regression-quality, and broad
  selftest checks.
8. Rehearse rollback in an isolated copy: restore the pre-fix startup bytes,
   observe the adversarial RED, restore the fixed bytes, observe GREEN, and
   prove protected/real-worktree hashes unchanged.

### Change Boundary

**Allowed production path:**

- `options-flow-feed-lab.html` startup sequencing only.

**Allowed test paths:**

- `tests/tool-experience.spec.mjs`;
- `tests/tool-experience-shell.functional.mjs` only for an attributable
  startup-order discriminator if required by the plan owner.

**Read-only checks:**

- `tests/tool-experience-mobile.spec.mjs`;
- `scripts/selftest.mjs`;
- `tests/provider-credentials.support.mjs` static-server helper.

**Protected paths:**

- `rldata.js`, `rlapp.js`, `rlviews.js`, `rlexperience.js`, `rlg.js`,
  `rlticker.js`, `rlcontext.js`;
- `scripts/fetch-options.mjs`, `data/options/**`, option snapshot schema, and
  provider/source order;
- Feature 012 parent `spec.md`, `design.md`, `scopes/**`, `state.json`,
  `scenario-manifest.json`, `test-plan.json`, reports, and certification;
- Scope 04 source/tests/evidence;
- framework-managed paths.

### Test Classification Contract

- The existing Node shell canary remains `functional` to match Feature 012
  Scope 02 classification, even though it drives System Chrome against the
  local static site.
- The new focused Playwright row is `e2e-ui`: real page, real same-origin static
  server, no `page.route`, no `context.route`, no service worker, and no external
  provider claim.
- The fetch wrapper observes request ordering only. It must call the native
  fetch unchanged and cannot fulfill, reject, delay, or rewrite a request.

### Test Plan

| ID | Test Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System |
|---|---|---|---|---|---|---|---|
| TP-BUG001-01 | Exact before/after functional canary | `functional` | SCN-BUG001-001, SCN-BUG001-003 | `tests/tool-experience-shell.functional.mjs` | All 23 routes expose one ready shell; current bytes fail only options-flow and fixed bytes pass without changing the 10 s timeout | `node --test tests/tool-experience-shell.functional.mjs` | Yes - local browser/application and same-origin static files |
| TP-BUG001-02 | Adversarial Regression E2E | `e2e-ui` | SCN-BUG001-001, SCN-BUG001-002 | `tests/tool-experience.spec.mjs` | `Regression: BUG-001 options flow shell is ready before heavy hydration begins` uses `page.addInitScript` only to observe and forward native fetch calls unchanged, then proves the first option delta fetch starts after shell readiness | `npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: BUG-001 options flow shell is ready before heavy hydration begins" --reporter=list` | Yes - native request observation only; no route interception |
| TP-BUG001-03 | Broader shell Regression E2E | `e2e-ui` | SCN-BUG001-003 | Existing shell E2E files | Complete ordinary/Center/mobile shell regressions pass together | `npx --no-install playwright test tests/tool-experience.spec.mjs tests/tool-experience-mobile.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes - no interception |
| TP-BUG001-04 | Ownership and change-boundary canary | `functional` | SCN-BUG001-002 | Protected source/data paths | No byte change to RLDATA, option producer/snapshots, shared context modules, Scope 04, or parent coordination | `git diff --exit-code -- rldata.js scripts/fetch-options.mjs data/options` plus complete changed-path classification | No |
| TP-BUG001-05 | Broad build-free regression | `unit` | SCN-BUG001-002, SCN-BUG001-003 | `scripts/selftest.mjs` | Existing source, registry, shell, context, model, and tool invariants remain green | `node scripts/selftest.mjs` | No |
| TP-BUG001-06 | Regression and bailout quality | `functional` | SCN-BUG001-001, SCN-BUG001-003 | Changed regression files | No skip/only/todo, failure-condition return, optional assertion, interception, timeout inflation, or tautological ordering assertion | `bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/tool-experience.spec.mjs tests/tool-experience-shell.functional.mjs` | No |

### Test Applicability

| Category | Applicability |
|---|---|
| unit | Broad selftest only; the defect is browser scheduling rather than a pure computation |
| functional | Required for the exact all-23 reproduction and ownership boundaries |
| integration | Not applicable; Research Lab has no application service tier |
| ui-unit | Not applicable; no component framework owns this inline page startup |
| e2e-api | Not applicable; no service API changes |
| e2e-ui | Required for the adversarial request-order and broader shell regressions |
| stress | Not applicable; no new SLA or throughput contract |
| load | Not applicable; row-capacity redesign is not part of this repair |

### Definition of Done - Tiered Validation

#### Core Outcomes

- [x] SCN-BUG001-001 root cause is adopted by `bubbles.design` and remains grounded in the
  measured request, long-task, DOM, and decorator path. → Evidence: [Summary](report.md#summary), [Targeted Browser Diagnosis](report.md#targeted-browser-diagnosis)
- [x] The fix is implemented only after a persistent pre-fix adversarial RED. → Evidence: [Persistent Adversarial RED - TP-BUG001-02](report.md#persistent-adversarial-red---tp-bug001-02), [Implementation-Owned Source Diff And Boundary](report.md#implementation-owned-source-diff-and-boundary)
- [x] SCN-BUG001-001 cache-first paint remains immediate while heavy delta hydration starts
  once and only after the generic shared shell is ready. → Evidence: [TP-BUG001-02 - Exact Focused System Chrome Regression](report.md#tp-bug001-02---exact-focused-system-chrome-regression)
- [x] SCN-BUG001-003 has no timeout inflation, route skip, shared tool-ID branch, decorator
  disablement, worker/source change, row truncation, or manual fetch gate exists. → Evidence: [TP-BUG001-06 - Regression Quality And Direct Scans](report.md#tp-bug001-06---regression-quality-and-direct-scans), [Implementation-Owned Source Diff And Boundary](report.md#implementation-owned-source-diff-and-boundary)
- [x] SCN-BUG001-002 source/provider/option ownership and Feature 012 parent/Scope 04
  coordination remain unchanged. → Evidence: [TP-BUG001-04 - Ownership And Change Boundary](report.md#tp-bug001-04---ownership-and-change-boundary)
- [x] Isolated rollback reproduces RED, exact fixed-byte restore returns GREEN,
  and protected plus real-worktree hashes remain unchanged. → Evidence: [Sandboxed Rollback Rehearsal - RED Then GREEN](report.md#sandboxed-rollback-rehearsal---red-then-green)

#### Test Evidence - Exact Parity With 6 Test Plan Rows

- [x] TP-BUG001-01 for SCN-BUG001-001 and SCN-BUG001-003 records the current single-route
  failure and post-fix all-23 success with the same 10-second canary. → Evidence: [TP-BUG001-01 - Unchanged All-23 Canary](report.md#tp-bug001-01---unchanged-all-23-canary)
- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior in SCN-BUG001-001 and SCN-BUG001-002
  pass: TP-BUG001-02 proves the first option delta request observes a ready
  shell and contains no interception or timing workaround. → Evidence: [TP-BUG001-02 - Exact Focused System Chrome Regression](report.md#tp-bug001-02---exact-focused-system-chrome-regression)
- [x] Broader E2E regression suite passes for SCN-BUG001-003: TP-BUG001-03 proves the complete
  ordinary, Center, and mobile shell behavior remains green. → Evidence: [TP-BUG001-03 - Complete Shell E2E Suite](report.md#tp-bug001-03---complete-shell-e2e-suite)
- [x] TP-BUG001-04 ownership/change-boundary evidence for SCN-BUG001-002 proves zero change to
  protected source, data, shared modules, Scope 04, and parent coordination. → Evidence: [TP-BUG001-04 - Ownership And Change Boundary](report.md#tp-bug001-04---ownership-and-change-boundary)
- [x] TP-BUG001-05 broad selftest evidence for SCN-BUG001-002 and SCN-BUG001-003 proves existing Research Lab behavior
  remains green. → Evidence: [TP-BUG001-05 - Broad Build-Free Selftest](report.md#tp-bug001-05---broad-build-free-selftest)
- [x] Regression tests for SCN-BUG001-001 and SCN-BUG001-003 contain no silent-pass bailout patterns: TP-BUG001-06
  regression-quality and direct scans pass with zero violations. → Evidence: [TP-BUG001-06 - Regression Quality And Direct Scans](report.md#tp-bug001-06---regression-quality-and-direct-scans)

#### Build Quality Gate

- [x] Pre-fix RED precedes source repair; post-fix focused and exact commands
  pass; System Chrome identity, no-interception/service-worker scans, source
  lock, editor diagnostics, `git diff --check`, artifact lint, traceability,
  implementation reality, changed-path boundary, rollback, and broad selftest
  are current and clean with every finding accounted for. → Evidence: [Independent Complete Verification - SCOPE-01](report.md#independent-complete-verification---scope-01), [Syntax And Editor Diagnostics](report.md#syntax-and-editor-diagnostics), [Lint/Quality](report.md#lintquality)

## Execution Routing

`bubbles.plan` adoption is complete. Implementation dispatch remains disabled
until `bubbles.test` creates TP-BUG001-02 and records the persistent pre-fix RED
against unchanged `options-flow-feed-lab.html`. Immediate next owner:
`bubbles.test`; target: TP-BUG001-02 / SCN-BUG001-001.