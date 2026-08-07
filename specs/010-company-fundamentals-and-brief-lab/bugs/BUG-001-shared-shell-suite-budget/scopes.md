# Scopes: BUG-001 Shared-Shell Suite Budget

Links: [spec.md](spec.md) | [design.md](design.md) | [report.md](report.md) |
[uservalidation.md](uservalidation.md) | [scenario-manifest.json](scenario-manifest.json)

## Ownership Gate

`bubbles.design` adopted the diagnosis and exact mutation without technical
amendment, resolving `TR-BUG001-DESIGN`. `bubbles.plan` now adopts SCOPE-01,
SCN-B001-001, the eleven-row Test Plan, and its exact test-related DoD parity.

The exact implementation mutation and implement-owned narrow checks have run.
The open finding and machine handoff now route independent verification to
`bubbles.test`.

## Execution Outline

### Phase Order

1. **SCOPE-01 - Calibrate Feature 010 shell readiness.** Apply the single
   helper-local expectation budget, then execute the focused, owning-file,
   concurrent-suite, serial-suite, and static integrity carriers.

SCOPE-01 is the only active scope. No later scope may start, and no broader
repair may be inferred from this plan.

### New Types and Signatures

- No product type, API, schema, route, configuration, or dependency changes.
- `openNativeResearchSurface` keeps its existing helper signature and eight
  call sites.
- The only permitted mutation is:

```js
await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible({ timeout: 30_000 });
```

- SCN-B001-001 remains the sole scenario contract.
- `test-plan.json` carries the same eleven TP-B001 rows as this file.
- `state.json` records the resolved planning transition and the implementation
  handoff without changing certification ownership.

### Validation Checkpoints

1. Preserve TP-B001-00 as interpreted pre-fix RED evidence before mutation.
2. After the one-line edit, TP-B001-01 and TP-B001-02 must pass before any
   complete-suite carrier runs.
3. TP-B001-03 and TP-B001-04 must each pass 280/280 with retries disabled.
4. TP-B001-05 through TP-B001-08 prove repository health, fail-loud behavior,
   syntax, and the exact mutation boundary.
5. TP-B001-09 and TP-B001-10 prove packet structure, scenario hashing,
   Test Plan/DoD parity, and the durable owner handoff.

### Change and Routing Boundary

- Allowed implementation surface: one assertion in
  `tests/company-fundamentals-lab.spec.mjs`.
- Excluded surfaces: every product file, configuration file, dependency,
  retry setting, sibling packet, parent Feature 010 artifact, and concurrent
  dirty path.
- Planning completion routes SCOPE-01 to `bubbles.implement`; it does not
  authorize any second mutation.

## Active Scope Inventory

| Scope | Outcome | Surfaces | Validation | DoD Summary | Status |
|---|---|---|---|---|---|
| SCOPE-01 | Calibrate one Feature 010 shell-ready expectation budget | One existing browser-test assertion | 11 exact TP-B001 rows | One-line boundary, preserved fail-loud checks, complete carriers | In Progress |

## Scope 1: SCOPE-01 - Calibrate Feature 010 Shell Readiness

- **Status:** In Progress
- **Scope-Kind:** runtime-behavior
- **Priority:** P1
- **Depends On:** none
- **Next owner:** `bubbles.test`
- **Change class:** test-harness-only bug fix

### Gherkin Scenario

```gherkin
Scenario: SCN-B001-001 Company fundamentals helper survives shared-shell startup contention
  Given the complete 280-identity system-Chrome browser suite runs with four workers and retries disabled under shared host load
  When the SCN-010-007 mixed-currency and fiscal-period regression opens the company fundamentals native research surface through openNativeResearchSurface
  Then the ready shared shell becomes visible within a finite 30-second expectation budget and the existing Power-mode body class and detailed-tab assertions remain fail-loud
```

### Implementation Plan

1. Preserve the supplied four-worker 276/1 RED as pre-fix evidence.
2. Add `{ timeout: 30_000 }` to only the helper's shell-ready assertion.
3. Keep the selector, Power click, body checks, tab check, and eight call sites
   byte-identical.
4. Run every Test Plan carrier with retries disabled.
5. Prove the scoped diff contains one changed line and no config change.

### Change Boundary

**Allowed after design and planning adoption:**

- `tests/company-fundamentals-lab.spec.mjs`: one shell-ready assertion.

**Forbidden:**

- any second line in the target test;
- `playwright.config.mjs`;
- product or dependency files;
- workers, retries, sleeps, catches, interception, forces, or optional asserts;
- Feature 004, BUG-002, BUG-005 through BUG-007, or parent Feature 010;
- certification fields and concurrent dirty work.

### Local Helper Impact Sweep

`openNativeResearchSurface` has eight call sites in the owning file. TP-B001-02
must exercise all 32 file-local tests after the one-line change.

The helper keeps these fail-loud checks:

1. missing ready shell fails after 30 seconds;
2. wrong Power mode fails the body attribute check;
3. lingering `rlv-focused` fails the negative class check;
4. hidden detailed tabs fail the visibility check.

### Test Plan

| Test Type | ID | Category | Scenario | File / Location | Exact behavior | Command | Live System |
|---|---|---|---|---|---|---|---|
| Pre-fix Adversarial Regression E2E | TP-B001-00 | `e2e-ui` | SCN-B001-001 | `tests/company-fundamentals-lab.spec.mjs` | Preserve 277 identities, 33 files, 276 passed, and the sole named shell-ready failure | `timeout 1200 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=4 --retries=0` | Yes |
| Focused Regression E2E | TP-B001-01 | `e2e-ui` | SCN-B001-001 | `tests/company-fundamentals-lab.spec.mjs` | Exact SCN-010-007 target passes with every comparability assertion intact | `timeout 180 npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-007 mixed currency and fiscal periods remain visible and unavailable for forced comparison" --reporter=list --workers=1 --retries=0` | Yes |
| Same-file Regression E2E | TP-B001-02 | `e2e-ui` | SCN-B001-001 | `tests/company-fundamentals-lab.spec.mjs` | All 32 owning-file tests and all eight helper consumers pass | `timeout 600 npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1 --retries=0` | Yes |
| Adversarial Complete-Suite Regression E2E | TP-B001-03 | `e2e-ui` | SCN-B001-001 | `tests/company-fundamentals-lab.spec.mjs` | Four-worker suite passes 280/280 across 33 files with zero retries | `timeout 1200 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=4 --retries=0` | Yes |
| Serial Complete-Suite Regression E2E | TP-B001-04 | `e2e-ui` | SCN-B001-001 | `tests/company-fundamentals-lab.spec.mjs` | Serial suite passes 280/280 across 33 files with zero retries | `timeout 3600 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1 --retries=0` | Yes |
| Repository regression | TP-B001-05 | `functional` | SCN-B001-001 | `scripts/selftest.mjs` | Build-free repository selftest passes with zero failures | `timeout 1200 node scripts/selftest.mjs` | No |
| Regression quality | TP-B001-06 | `functional` | SCN-B001-001 | `tests/company-fundamentals-lab.spec.mjs` | Bugfix guard finds adversarial signals and no bailout or interception violation | `timeout 120 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/company-fundamentals-lab.spec.mjs` | No |
| JavaScript syntax | TP-B001-07 | `functional` | SCN-B001-001 | `tests/company-fundamentals-lab.spec.mjs` | Modified module parses | `timeout 30 node --check tests/company-fundamentals-lab.spec.mjs` | No |
| Exact mutation boundary | TP-B001-08 | `functional` | SCN-B001-001 | `tests/company-fundamentals-lab.spec.mjs` and `playwright.config.mjs` | Diff contains one timeout addition only. Config and all fail-loud assertions remain unchanged | `timeout 30 git diff --check -- tests/company-fundamentals-lab.spec.mjs playwright.config.mjs && timeout 30 git --no-pager diff -- tests/company-fundamentals-lab.spec.mjs playwright.config.mjs` | No |
| Packet artifact lint | TP-B001-09 | `functional` | SCN-B001-001 | `specs/010-company-fundamentals-and-brief-lab/bugs/BUG-001-shared-shell-suite-budget` | Required artifacts, state mirror, checkboxes, report sections, and provenance pass | `timeout 300 bash .github/bubbles/scripts/artifact-lint.sh specs/010-company-fundamentals-and-brief-lab/bugs/BUG-001-shared-shell-suite-budget` | No |
| Plan and control-plane integrity | TP-B001-10 | `functional` | SCN-B001-001 | `specs/010-company-fundamentals-and-brief-lab/bugs/BUG-001-shared-shell-suite-budget` | Nine artifacts, scenario hash/linkage, resolved plan transition, durable implementation handoff, finding identity, and exact eleven-row Markdown/JSON/DoD parity agree | `timeout 60 node --input-type=module -e 'import{createHash}from"node:crypto";import{readdirSync,readFileSync}from"node:fs";const r="specs/010-company-fundamentals-and-brief-lab/bugs/BUG-001-shared-shell-suite-budget",s=JSON.parse(readFileSync(`${r}/state.json`)),m=JSON.parse(readFileSync(`${r}/scenario-manifest.json`)),p=JSON.parse(readFileSync(`${r}/test-plan.json`)),q=readFileSync(`${r}/scopes.md`,"utf8"),f=readdirSync(r).sort(),rows=[...q.matchAll(/^\| [^|]+ \| (TP-B001-\d{2}) \|/gm)].map(x=>x[1]),dod=[...q.matchAll(/^- \[ \] (TP-B001-\d{2}) /gm)].map(x=>x[1]),jsonIds=p.scopes.flatMap(x=>x.tests.map(t=>t.id));const c={FILES:f.length===9,STATUS:s.status===s.certification.status,MODE:s.workflowMode==="bugfix-fastlane",PLAN_RESOLVED:s.transitionRequests.some(x=>x.id==="TR-BUG001-PLAN"&&x.status==="resolved"&&x.resolvedBy==="bubbles.plan"),IMPLEMENT_HANDOFF:s.executionHistory.some(x=>x.agent==="bubbles.plan"&&x.outcome==="route_required"&&x.nextRequiredOwner==="bubbles.implement"),FINDING_ID:s.findingsLedger.length===1&&s.findingsLedger[0].findingId==="F-BUG001-001",SCENARIOS:m.scenarios.length===1,HASHES:m.scenarios.every(x=>x.gherkinHash===`sha256:${createHash("sha256").update(JSON.stringify(x.gherkin)).digest("hex")}`),LINKAGE:m.scenarios.every(x=>x.scope==="SCOPE-01"&&x.linkedTests.some(t=>t.file==="tests/company-fundamentals-lab.spec.mjs"&&t.testId==="Regression: SCN-010-007 mixed currency and fiscal periods remain visible and unavailable for forced comparison")),TEST_ROWS:rows.length===11&&new Set(rows).size===11,TEST_DOD:dod.length===11&&new Set(dod).size===11&&rows.every(id=>dod.includes(id)),HANDOFF:p.activeTestPlanRowCount===11&&jsonIds.length===11&&rows.every(id=>jsonIds.includes(id))};for(const[k,v]of Object.entries(c)){console.log(`${k}=${v}`);if(!v)process.exitCode=1}console.log(`INTEGRITY=${process.exitCode?"FAIL":"PASS"}`);'` | No |

### Test Applicability

| Category | Applicability |
|---|---|
| unit | Not applicable because no production or pure helper logic changes. |
| functional | Required for selftest, quality, syntax, diff, and packet checks. |
| integration | Not applicable because no service boundary changes. |
| ui-unit | Not applicable because this is a real-page browser regression. |
| e2e-api | Not applicable because no API behavior changes. |
| e2e-ui | Required for focused, same-file, and complete-suite profiles. |
| stress | The four-worker complete browser suite is the adversarial workload. |
| load | Not applicable because no throughput contract changes. |

### Definition of Done

#### Core Outcomes

- [ ] SCN-B001-001: the ready shared shell becomes visible within the finite 30-second expectation budget while the existing Power-mode body class and detailed-tab assertions remain fail-loud.
- [ ] The implementation adds only `{ timeout: 30_000 }` to the shell-ready assertion.
- [ ] All eight helper call sites and every later assertion remain unchanged.
- [ ] Missing shell, wrong Power mode, lingering `rlv-focused`, and hidden detailed tabs remain direct failures.
- [ ] Change Boundary is respected and zero excluded file families are changed.

#### Test Evidence - Exact Parity With Eleven Test Plan Rows

- [ ] TP-B001-00 preserves the supplied four-worker 276/1 pre-fix RED.
- [ ] TP-B001-01 focused SCN-010-007 target passes 1/1.
- [ ] TP-B001-02 complete Feature 010 browser file passes 32/32.
- [ ] TP-B001-03 four-worker complete suite passes 280/280 across 33 files.
- [ ] TP-B001-04 serial complete suite passes 280/280 across 33 files.
- [ ] TP-B001-05 repository selftest passes with zero failures.
- [ ] TP-B001-06 bugfix regression-quality guard passes.
- [ ] TP-B001-07 JavaScript syntax check passes.
- [ ] TP-B001-08 exact one-line diff passes and config remains unchanged.
- [ ] TP-B001-09 packet artifact lint passes.
- [ ] TP-B001-10 control-plane integrity passes.

All test items remain unchecked. Implementation evidence for TP-B001-01,
TP-B001-02, TP-B001-06, TP-B001-07, TP-B001-08, and TP-B001-09 is recorded in
`report.md`; independent testing still owns the remaining carriers.

#### Build Quality Gate

- [ ] Every declared check passes with zero warnings and zero retries. Evidence
  retains honest provenance. Documentation matches the implemented boundary.

  > **Uncertainty Declaration**
  > **What was attempted:** Exact one-line implementation plus TP-B001-01, TP-B001-02, TP-B001-06, TP-B001-07, TP-B001-08, and TP-B001-09.
  > **What was observed:** Focused 1/1 and owning-file 32/32 passed; syntax, quality, exact-boundary, scoped-status, and artifact-lint checks passed.
  > **Why this is uncertain:** TP-B001-03, TP-B001-04, TP-B001-05, and TP-B001-10 did not run in this invocation, and independent audit and certification have not occurred.
  > **What would resolve this:** Independent execution of the remaining Test Plan rows followed by audit and validate-owned certification.
