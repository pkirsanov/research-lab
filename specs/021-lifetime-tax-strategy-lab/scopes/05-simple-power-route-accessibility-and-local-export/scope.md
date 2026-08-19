# Scope 5: Simple/Power Route, Accessibility, And Local Export

## 05-simple-power-route-accessibility-and-local-export

Planning authority: the [scope index](../_index.md). Execution evidence belongs
in [report.md](report.md).

**Status:** Not started
**Scope-Kind:** runtime-behavior
**Tags:** `route:integrated`, `no-registration:true`, `a11y-critical:true`, `privacy-critical:true`
**Depends On:** 01, 02, 03, 04
**Foundation:** false

**Primary Outcome:** the route opens Simple first with a decision-level answer,
the strongest tradeoff, and what is unavailable. Power drills into the rule
ledger, the per-bracket detail, the curve table, the reconciliation identity and
every pack source record. Every value carries a contextual tooltip, every chart
carries a text-equivalent table, every unavailable domain is visible and
keyboard reachable, and a private local export happens only after explicit user
action. At the end of this scope the tool is complete and **still absent from
every registry**.

## The Registration Line

This scope finishes the tool and does not ship it. `tools.json`, `index.html`,
`rlnav.js`, `README.md`, `notes/README.md` and market-brief coverage stay
untouched by explicit operator instruction. Registration is a separate later
feature.

That makes the `site-exclusions.json` entry from Scope 01 load-bearing through
the end of this scope: the root page exists, is unregistered, and therefore must
carry a deploy decision or `scripts/build-pages-site.mjs` refuses and the live
Pages deploy breaks. This scope re-runs that gate rather than assuming Scope 01
settled it, because this scope is the one that changes the page most.

## Requirement Coverage

Provisional anchors pending `spec.md` (see the [scope index](../_index.md)).

- **PRA-021-031** — Simple is the default and opens with a decision-level answer.
- **PRA-021-032** — Power is the drill-down over the ledger, detail, curve table, identity and sources.
- **PRA-021-033** — a contextual tooltip on every value, a text-equivalent table on every chart.
- **PRA-021-034** — unavailable states visible, keyboard reachable, readable on mobile, never a blank or a bare zero.
- **PRA-021-035** — educational-only copy, not tax advice, no return preparation, no recommended action.
- **PRA-021-036** — no published error rate, self-invalidation statistic, track record or accuracy figure.
- **PRA-021-037** — explicit-action private local export, sensitivity warning, no identifiers, every omitted field listed.
- **PRA-021-038** — the tool stays absent from all six registration surfaces and the root page keeps its deploy decision.

Inherited and re-asserted from Scope 01: **PRA-021-009** (zero network requests,
household values never leave the local namespace).

## Gherkin Scenarios

```gherkin
Scenario: SCN-021-013 Simple opens first with a decision-level answer and Power holds the detail
  Given a household has supplied the minimum viable input for the declared tax year
  When the route is opened
  Then Simple is the view that renders first, without any user action
  And Simple shows the federal tax for the year, the conversion comparison outcome, the strongest tradeoff, and the domains that are unavailable
  And Simple shows no candidate grid, no per-bracket table, no rule trace and no raw curve series
  And each hidden detail carries a link to the Power section that owns it
  And opening Power exposes the rule ledger, per-bracket detail, the curve text table, the reconciliation identity, and every pack source record

Scenario: SCN-021-014 Every value is explained and every unavailable state is reachable without a mouse
  Given the route is rendered with at least one unavailable domain
  When the page is operated by keyboard alone and then at a mobile viewport
  Then every displayed value exposes a contextual tooltip reachable by keyboard focus
  And every chart has a text-equivalent table carrying the same points
  And every unavailable domain is focusable and states its reason and what would make it available
  And no unavailable domain renders as a blank, a bare dash, or a zero
  And no tax or account table becomes unreadable or horizontally trapped at the mobile viewport

Scenario: SCN-021-015 A private export happens only on explicit action and carries no identifier
  Given a household has entered a sentinel value into the workspace
  When the user invokes the export action and the produced file is inspected
  Then no file was produced before the explicit action
  And the user was warned that the file carries sensitive financial information
  And the file contains no name, address, account number, tax identifier or credential
  And the file lists every field that was omitted from it
  And the sentinel value appears in no network request, URL, referrer, console message or committed artifact across the whole session
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
| --- | --- | --- | --- | --- |
| SCN-021-013 Simple default | Minimum viable input supplied | Open the route | Simple renders first with tax, comparison outcome, tradeoff and unavailable domains; no grid, table, trace or raw series | e2e-ui |
| SCN-021-013 Power drill-down | Simple rendered | Switch to Power | Rule ledger, per-bracket detail, curve text table, reconciliation identity, every source record | e2e-ui |
| SCN-021-014 keyboard and mobile | At least one unavailable domain present | Tab through every value and unavailable state; repeat at mobile viewport | Every value exposes a focusable tooltip; every chart has a text table; every unavailable state is focusable with a reason; nothing is a blank, dash or bare zero | e2e-ui |
| SCN-021-015 export | Sentinel value entered | Attempt to read a file before acting, then invoke the export | No file before the action; a sensitivity warning; a file with no identifier and an explicit omitted-field list | e2e-ui |
| Registration absence | Feature complete | Inspect the six registration surfaces | The tool appears in none of them; the root page still carries its `site-exclusions.json` decision | e2e-ui plus repo scan |
| Educational framing | Route open | Read the header and the result surfaces | Explicit not-tax-advice framing; no recommended action; no error rate, track record or accuracy claim | e2e-ui |

## Implementation Files

### New

- A new Playwright spec named `lifetime-tax-route.spec.mjs` in the repository
  test directory, covering Simple/Power, accessibility, mobile, export and
  registration absence.
- Fixture files for a workspace with several unavailable domains, a sentinel
  household value, and a minimum-viable-input workspace.

### Modified

- `lifetime-tax-strategy-lab.html` — the Simple view, the Power view, the
  view switch, tooltips, text-equivalent tables, the unavailable-state
  surfaces, the educational framing, and the export action.
- `rltaxworkspace.js` — the export **action** built on the
  `sanitizeForExport(workspace)` function Scope 01 already authored, plus the
  omitted-field manifest. No new storage namespace and no new private category.
- `lifetime-tax-strategy.config.json` — Simple/Power surface policy members if
  the split requires them. Any added member is mandatory with no silent default.
- `scripts/selftest.mjs` — one appended assertion group.

## Implementation Plan

1. Build Simple as the default view. It renders from the already-computed
   result envelope produced by Scopes 02 through 04 and performs no computation
   of its own, so the answer the user sees and the answer the engine produced are
   one object rather than two descriptions that can drift.
2. Restrict what Simple may show to decision-level fields: the federal tax for
   the declared year, the conversion comparison outcome, the strongest tradeoff,
   and the unavailable domains. Every excluded detail carries a link to the
   Power section that owns it. A test enumerates Simple's rendered fields, so
   the restriction is structural rather than a review convention.
3. Build Power as the drill-down over the rule ledger, per-bracket detail, the
   curve text table, the reconciliation identity and every pack source record.
   Power reads the same envelope. It re-derives nothing.
4. Attach a contextual tooltip to every displayed value, sourced from the field's
   own record rather than from a separate copy table. A value with no tooltip
   fails a test that enumerates rendered values against tooltip presence.
5. Emit each chart's text-equivalent table from the same record the chart reads,
   matching the Scope 03 rule. Keyboard focus reaches the table without reaching
   the chart, so the table is a real equivalent rather than a hidden duplicate.
6. Render every unavailable domain as a focusable element carrying its code, its
   reason and what would make it available. A blank, a bare dash and a zero are
   each a failure. This is the visible end of the `TaxUnavailable/v1` contract
   Scope 01 defined, and it is where the refusal guarantee either holds or
   quietly stops being true.
7. Verify mobile readability for the tax and account tables at the repository's
   mobile viewport. Nothing is horizontally trapped and no stable control
   resizes because a label grew.
8. Write the educational framing into the page: the tool is an educational
   planning model, it is not tax advice, it does not prepare or file a return,
   and it does not recommend an action. No copy anywhere claims a published
   error rate, a self-invalidation statistic, a track record, an accuracy figure
   or a plan success probability.
9. Build the export action on Scope 01's `sanitizeForExport`. No file is
   produced without an explicit user action. The action warns that the file
   carries sensitive financial information. The file carries no name, address,
   account number, tax identifier or credential, and it lists every omitted
   field so the reader can see what was withheld rather than infer it.
10. Re-run the zero-network canary over the full route now that every surface
    exists. A sentinel household value must appear in no request, URL, referrer,
    console message or committed artifact.
11. Re-run the pages-site build to confirm the deploy decision still holds for
    the finished page, and assert the tool is absent from all six registration
    surfaces.
12. Append a `lifetime-tax — Simple/Power route, accessibility and export`
    group to `scripts/selftest.mjs`.

## Shared Infrastructure Impact Sweep

| Shared surface | Change | Downstream consumers | Blast radius | Independent canary before broad tests | Rollback |
| --- | --- | --- | --- | --- | --- |
| `lifetime-tax-strategy-lab.html` | Largest change of the feature | The live Pages deploy through `site-exclusions.json` | **High** — this scope changes the page most, and an unregistered root page whose deploy decision no longer holds breaks the live deploy | Re-run `node scripts/build-pages-site.mjs` and assert it accepts the finished page, BEFORE any browser row | Revert the page to its Scope 04 state |
| `rltaxworkspace.js` | Export action added | This feature only | Medium — an export path that writes automatically, or that leaks a private category, defeats the Scope 01 privacy boundary | Assert no file is produced without the explicit action and that the omitted-field manifest matches the sanitizer's actual exclusions | Remove the action; the Scope 01 sanitizer function stays |
| Browser storage | No new namespace | This feature only | Medium — a new private category added here would be outside the Scope 01 inventory and therefore outside the clear action | Enumerate written keys and assert the set is unchanged from Scope 01, and that clear-all still removes every declared category | Not applicable |
| `scripts/selftest.mjs` | One group appended | The whole-repo gate | Medium | Pre-existing pass count must not fall | Remove the appended group |
| The six registration surfaces | **None** | The site index, navigation and the brief | **High** — a single accidental registration ships an in-progress tool to the public index | Byte-identity canary over `tools.json`, `index.html`, `rlnav.js`, `README.md`, `notes/README.md` and market-brief coverage | Not applicable; there is nothing to roll back |
| Feature 008 modules | **None** | — | — | Byte-identity canary over `rlportfolio.js`, `rlportfolioanalytics.js`, `portfolio-survival-allocation.config.json` and the Feature 008 spec directory | Not applicable |

## Change Boundary And Protected Paths

**Allowed new:** `lifetime-tax-route.spec.mjs` in the repository test directory ·
this scope's fixture files.

**Allowed modified:** `lifetime-tax-strategy-lab.html` · `rltaxworkspace.js` ·
`lifetime-tax-strategy.config.json` · `scripts/selftest.mjs` (append-only).

**Excluded — must remain byte-identical:** `rlportfolio.js` ·
`rlportfolioanalytics.js` · `portfolio-survival-allocation.config.json` ·
`specs/008-portfolio-survival-and-brief-lab/**` · `tools.json` · `index.html` ·
`rlnav.js` · `README.md` · `notes/README.md` · `market-brief.config.json` ·
`market-brief.payload.json` · `market-brief.page.json` ·
`market-brief.snapshot.json` · `market-brief.html` · `rlbrief.js` ·
`briefs/**` · `data/**` · `brief-history.jsonl` · every script under
`scripts/brief-*` · `watchlist.json` · `site-exclusions.json` (its Scope 01
entry stays exactly as written) ·
`scripts/validate-spec-test-paths.baseline` · every framework-managed file under
`.github/bubbles/`, `.github/agents/bubbles*`, `.github/prompts/bubbles.*`,
`.github/instructions/bubbles-*` and `.github/skills/bubbles-*`.

**Dirty-work discipline:** capture a path-scoped `git status` and a zero-context
diff before each allowed path. No formatter and no broad rewrite runs.

**Rollback:** revert the page, the export action and the appended selftest
group; delete the new spec and fixtures.

## Scenario-First Red/Green Contract

Add the persistent browser title or the named assertion first and run the exact
command. RED is valid only when the intended contract assertion fails. A syntax
error, a missing browser, an absent test discovery or a different failing
assertion does not satisfy RED. After the smallest owned implementation, rerun
the identical command for GREEN.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-05-01 | Surface restriction | unit | SCN-021-013 | `scripts/selftest.mjs` | Enumerating Simple's rendered field set proves it contains no candidate grid, per-bracket table, rule trace or raw curve series, and that every excluded detail has a Power link | `node scripts/selftest.mjs` | No | `report.md#tp-05-01` |
| TP-05-02 | Single-envelope | unit | SCN-021-013 | `scripts/selftest.mjs` | Simple and Power read the identical result envelope; neither recomputes a tax, a curve point or a conversion amount of its own | `node scripts/selftest.mjs` | No | `report.md#tp-05-02` |
| TP-05-03 | Tooltip coverage | unit | SCN-021-014 | `scripts/selftest.mjs` | Every displayed value has a contextual tooltip sourced from its own record; a value with no tooltip is proven to fail | `node scripts/selftest.mjs` | No | `report.md#tp-05-03` |
| TP-05-04 | Text equivalence | unit | SCN-021-014 | `scripts/selftest.mjs` | Every chart has a text-equivalent table emitted from the same record, carrying the same points | `node scripts/selftest.mjs` | No | `report.md#tp-05-04` |
| TP-05-05 | Unavailable rendering | unit | SCN-021-014 | `scripts/selftest.mjs` | Regression: every `TaxUnavailable/v1` renders its code, reason and remediation; a blank, a bare dash and a zero are each proven to fail | `node scripts/selftest.mjs` | No | `report.md#tp-05-05` |
| TP-05-06 | Claim boundary | unit | SCN-021-013 | `scripts/selftest.mjs` | No page string claims a published error rate, a self-invalidation statistic, a track record, an accuracy figure or a plan success probability; the educational not-tax-advice framing is present | `node scripts/selftest.mjs` | No | `report.md#tp-05-06` |
| TP-05-07 | Export contract | unit | SCN-021-015 | `scripts/selftest.mjs` | The sanitizer removes every identifier category and the omitted-field manifest matches the sanitizer's actual exclusions exactly; a manifest that under-reports is proven to fail | `node scripts/selftest.mjs` | No | `report.md#tp-05-07` |
| TP-05-08 | Privacy inventory | unit | SCN-021-015 | `scripts/selftest.mjs` | Regression: the written storage key set is unchanged from Scope 01, clear-all removes every declared private category, and no key carries a portfolio prefix | `node scripts/selftest.mjs` | No | `report.md#tp-05-08` |
| TP-05-09 | Registration absence | unit | SCN-021-013 | `scripts/selftest.mjs` | Regression: the tool identifier and its page appear in none of `tools.json`, `index.html`, `rlnav.js`, `README.md`, `notes/README.md` or market-brief coverage | `node scripts/selftest.mjs` | No | `report.md#tp-05-09` |
| TP-05-10 | Deploy gate | functional | SCN-021-013 | `scripts/build-pages-site.mjs` | The finished root page still carries its `site-exclusions.json` deploy decision and the pages-site build accepts it | `node scripts/build-pages-site.mjs` | No | `report.md#tp-05-10` |
| TP-05-11 | Regression E2E | e2e-ui | SCN-021-013 | `lifetime-tax-route.spec.mjs` | `Regression: SCN-021-013 Simple opens first with a decision level answer and Power holds the detail` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-013 Simple opens first with a decision level answer and Power holds the detail" --reporter=list` | Yes | `report.md#scenario-scn-021-013` |
| TP-05-12 | Accessibility Regression E2E | e2e-ui | SCN-021-014 | `lifetime-tax-route.spec.mjs` | `Regression: SCN-021-014 every value is explained and every unavailable state is keyboard reachable` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-014 every value is explained and every unavailable state is keyboard reachable" --reporter=list` | Yes | `report.md#scenario-scn-021-014` |
| TP-05-13 | Mobile Regression E2E | e2e-ui | SCN-021-014 | `lifetime-tax-route.spec.mjs` | `Regression: SCN-021-014 tax and account tables stay readable at the mobile viewport` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-014 tax and account tables stay readable at the mobile viewport" --reporter=list` | Yes | `report.md#scenario-scn-021-014-mobile` |
| TP-05-14 | Privacy Regression E2E | e2e-ui | SCN-021-015 | `lifetime-tax-route.spec.mjs` | `Regression: SCN-021-015 a private export happens only on explicit action and the request ledger stays empty` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-015 a private export happens only on explicit action and the request ledger stays empty" --reporter=list` | Yes | `report.md#scenario-scn-021-015` |
| TP-05-15 | Broader Regression E2E | e2e-ui | SCN-021-001 … -015 | `lifetime-tax-foundation.spec.mjs`, `lifetime-tax-federal.spec.mjs`, `lifetime-tax-marginal.spec.mjs`, `lifetime-tax-conversion.spec.mjs`, `lifetime-tax-route.spec.mjs` | Execute the complete cumulative Feature 021 browser suite over the real route with no request interception, no service worker and no external provider | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-021-0" --reporter=list` | Yes | `report.md#tp-05-15` |
| TP-05-16 | Repo gate | unit | SCN-021-013 … -015 | `scripts/selftest.mjs` | The whole-repository suite stays green and the pre-existing pass count does not fall | `node scripts/selftest.mjs` | No | `report.md#tp-05-16` |
| TP-05-17 | Path guard | unit | SCN-021-013 … -015 | `scripts/validate-spec-test-paths.mjs` | Zero new missing spec-referenced test paths | `node scripts/validate-spec-test-paths.mjs` | No | `report.md#tp-05-17` |

Before any browser row, run `node scripts/validate-node-source-lock.mjs` and
`npx --no-install playwright --version`. These environment gates do not replace a
Test Plan row.

### Definition of Done

- [ ] PRA-021-031 through PRA-021-038 are implemented: Simple default with a
      decision-level answer, Power drill-down, tooltips and text-equivalent
      tables, visible keyboard-reachable unavailable states, educational
      framing, no error-rate or track-record claim, explicit-action private
      export, and continued absence from every registration surface.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-05-01` through `report.md#tp-05-09`
- [x] Simple's rendered field set is proven restricted, and both views are proven
      to read one result envelope with no second derivation.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-05-01`, `report.md#tp-05-02`
  - **Claim Source:** executed · **Result:** TP-05-01 holds the restriction as a two-directional identity between the closed `SIMPLE_FIELDS` list and the ids the markup actually draws, so neither a leaked detail field nor a declared field with no render site can pass, and it separately refuses a canvas, a per-band table, a rule ledger and a raw curve series inside the Simple markup. TP-05-02 asserts exactly one `buildEnvelope` exists, that it is the only site calling the four engines, and that none of the five view functions calls any of them. Both were proven able to fail. Probe C renamed the headline field id to an undeclared `bracketBandTrace` and the run went to `3062 passed, 3 failed`, breaking the identity in both directions at once. Probe D replaced the headline's envelope read with a live `computeAnnualFederalTax` call and the run went to `3060 passed, 5 failed`, with four independent guards naming the second derivation. Each mutation was reverted immediately, `git status --short -- lifetime-tax-strategy-lab.html` was empty before each rerun, and both GREENs returned to the session-entry baseline of `3064 passed, 1 failed`.
- [x] Every unavailable domain renders its code, reason and remediation. A
      blank, a bare dash and a zero are each proven to fail.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-05-05`
  - **Claim Source:** executed · **Result:** TP-05-05 reads the one `unavailableNode` constructor and asserts it emits `record.code`, `record.domain`, `record.reason` and `record.whatWouldMakeItAvailable` on a `tabindex="0"` element, while two dedicated detectors refuse a `textContent` of a bare dash or a bare zero. The guard is proven able to fail rather than assumed: probe B replaced the remediation line with a bare em dash and left the other three lines standing, and the run went to `3062 passed, 3 failed` with TP-05-05 naming the defect and the cross-family TP-05-11 row firing on the same single constructor. Reverting restored `3064 passed, 1 failed`, the session-entry baseline, and `git status --short -- lifetime-tax-strategy-lab.html` was empty before the GREEN rerun. Because every refusal in the route flows through this one constructor, the per-domain obligation is carried structurally rather than domain by domain.
- [ ] The export produces no file without explicit user action, warns about
      sensitivity, carries no identifier, and its omitted-field manifest matches
      the sanitizer's actual exclusions.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the TP-05-14 command · **Evidence:** `report.md#tp-05-07`, `report.md#scenario-scn-021-015`
- [ ] The cumulative zero-network canary passes over the finished route: a
      sentinel household value appears in no request, URL, referrer, console
      message or committed artifact.
  - **Phase:** implement · **Command:** the TP-05-14 command · **Evidence:** `report.md#scenario-scn-021-015`
- [x] The pages-site build accepts the finished unregistered root page and its
      Scope 01 deploy decision is unchanged.
  - **Phase:** implement · **Command:** `node scripts/build-pages-site.mjs` · **Evidence:** `report.md#tp-05-10`
  - **Claim Source:** executed · **Result:** `node scripts/build-pages-site.mjs` exits 0 on the finished page, reporting `registeredPages: 28` with the page inside `excludedPaths: 12`, so the build accepts it as deliberately unregistered. The Scope 01 decision is unchanged: `git status --short -- site-exclusions.json` is empty against `HEAD`. The row is proven consequential rather than assumed — removing only that one entry made the identical command exit 1 with `Error: unregistered root page lacks a deploy decision: lifetime-tax-strategy-lab.html`, and the entry was restored and the revert proven before the GREEN rerun.
- [ ] The tool is absent from `tools.json`, `index.html`, `rlnav.js`,
      `README.md`, `notes/README.md` and market-brief coverage, and all six are
      byte-identical.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus a path-scoped `git status` · **Evidence:** `report.md#tp-05-09`, `report.md#registration-absence`
- [ ] Every Test Plan row has intended RED evidence and same-command GREEN
      evidence, recorded before the cumulative browser row.
  - **Phase:** implement · **Command:** the exact TP-05-01 through TP-05-14 commands · **Evidence:** `report.md#test-evidence`
- [ ] Feature 008 files and every brief or data artifact are byte-identical.
  - **Phase:** implement · **Command:** a path-scoped `git status` over the excluded list · **Evidence:** `report.md#change-boundary`
- [ ] `node scripts/selftest.mjs` is green with no fall in pass count and no
      existing assertion edited, relaxed or removed, and
      `node scripts/validate-spec-test-paths.mjs` reports zero new missing paths
      with the baseline file unmodified.
  - **Phase:** implement · **Command:** both commands · **Evidence:** `report.md#tp-05-16`, `report.md#tp-05-17`
