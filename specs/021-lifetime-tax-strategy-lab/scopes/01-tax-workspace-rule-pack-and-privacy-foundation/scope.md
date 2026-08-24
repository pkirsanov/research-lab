# Scope 1: Tax Workspace, Federal Rule Pack, And Privacy Foundation

## 01-tax-workspace-rule-pack-and-privacy-foundation

Planning authority: the [scope index](../_index.md). Execution evidence belongs
in [report.md](report.md).

**Status:** In progress — contract layer delivered, route layer not started
**Scope-Kind:** capability-foundation
**Tags:** `foundation:true`, `privacy-critical:true`, `deploy-gate:true`, `closed-vocabulary`, `named-refusal`
**Depends On:** none — this is the only root scope
**Foundation:** true

**Overlay Dependency Contract:** every remaining Feature 021 scope depends
directly on this scope. No later scope may resolve a rule, hold a household
value, or introduce a refusal code of its own.

**Primary Outcome:** a user opens the unregistered route, supplies the minimum
viable input, and is told exactly which federal rule pack applies to the
declared year, which primary source it came from, which federal features that
pack does not support, and which domains are unavailable — before any tax number
is computed. Every household value stays in a local namespace this feature owns
alone, and the page issues zero network requests.

## Requirement Coverage

Provisional anchors pending `spec.md` (see the [scope index](../_index.md)).

- **PRA-021-001** — independent workspace contract, no Feature 008 coupling.
- **PRA-021-002** — full rule-pack member set, refused by name when incomplete.
- **PRA-021-003** — resolution by jurisdiction, program and effective tax year.
- **PRA-021-004** — closed `RuleStatus` enum on every result.
- **PRA-021-005** — `TaxUnavailable/v1` instead of a number, a zero or silence.
- **PRA-021-006** — exactly four supported income kinds.
- **PRA-021-007** — every non-federal jurisdiction is unsupported.
- **PRA-021-008** — the minimum-viable-input contract.
- **PRA-021-009** — local-only household state, zero network requests.
- **PRA-021-010** — mandatory configuration with a visible failure.

## Gherkin Scenarios

```gherkin
Scenario: SCN-021-001 A minimum viable input yields an honestly labeled first answer
  Given a household supplies only a filing status, one declared tax year, one supported income-kind amount, and a deduction mode
  When the workspace is validated and the federal rule pack is resolved
  Then the resolved pack identity, version, effective tax years, and primary source records are displayed
  And every federal feature the pack does not support is named
  And every domain the household did not supply is marked Unavailable with a reason and what would make it available
  And no unsupplied domain blocks the domains that were supplied

Scenario: SCN-021-002 An unsupported year, jurisdiction, or income kind refuses rather than substitutes
  Given a household selects a tax year outside the pack's effective years, a state jurisdiction, or an income kind outside the four supported kinds
  When rule resolution runs
  Then each case produces an explicit Unavailable record carrying its own RLTAX code, the affected domain, and the reason
  And no substituted average, national default, extended threshold, or zero appears in its place
  And the remaining supported results stay visible and unaffected

Scenario: SCN-021-003 No household value leaves the local namespace
  Given a household enters income, deduction, and filing values into the workspace
  When the page is exercised end to end and its request ledger, URL, referrer, console output, and storage keys are inspected
  Then every request the page issued is a same-origin read of a document its own configuration declares, and those declared reads resolved
  And no household value appears in any URL, referrer, console message, or committed artifact
  And every written storage key belongs to this feature's own namespace and none belongs to the portfolio workspace
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
| --- | --- | --- | --- | --- |
| SCN-021-001 minimum viable input | Route open, no prior workspace | Enter filing status, year, one income amount, deduction mode | Pack identity strip, source records list, unsupported-feature list, and a named Unavailable row for every unsupplied domain | e2e-ui |
| SCN-021-002 refusal | Valid workspace present | Change year to an unsupported year; select a state; add an unsupported income kind | Three distinct Unavailable records with three distinct `RLTAX-*` codes; supported federal rows remain rendered | e2e-ui |
| SCN-021-003 privacy | Route open | Complete a full entry pass, then reload | Request ledger shows zero requests; storage inventory lists only this feature's keys; a sentinel household value appears nowhere outside the local namespace | e2e-ui |
| Config failure | Configuration file removed or version bumped to an unknown value | Open the route | Dependent computation is blocked with a visible reason; the privacy inventory and clear action stay reachable | e2e-ui |

## Implementation Files

### New

- `rltaxrules.js` — UMD module owning `TaxRulePack/v1`, the `RuleStatus` enum,
  the closed `RLTAX-*` refusal vocabulary, `TaxUnavailable/v1`, pack validation,
  and pack resolution.
- `rltaxworkspace.js` — UMD module owning `TaxWorkspace/v1`, the
  minimum-viable-input contract, the declared-unavailable-domain list, the local
  storage namespace, the privacy inventory, the clear action, and export
  sanitization (the export **action** ships in Scope 05).
- `lifetime-tax-strategy.config.json` — mandatory closed configuration.
- `tax-rules/federal/<declared-year>.json` — one source-qualified federal pack
  for one declared tax year.
- `lifetime-tax-strategy-lab.html` — unregistered root route shell carrying the
  repository's standard CSP meta.
- Fixture files under the repository fixture directory for a valid pack, a pack
  missing each required member, an expired pack, and a workspace at the
  minimum-viable-input boundary.
- A new Playwright spec named `lifetime-tax-foundation.spec.mjs` in the
  repository test directory.

### Modified

- `site-exclusions.json` — one entry for `lifetime-tax-strategy-lab.html`.
  **This edit is mandatory and lands in this scope.** `scripts/build-pages-site.mjs`
  refuses an unregistered root HTML with no deploy decision, and that refusal
  breaks the live Pages deploy.
- `scripts/selftest.mjs` — one appended assertion group. No existing assertion
  is edited, relaxed or removed.

## Implementation Plan

1. Author `rltaxrules.js` as a UMD dual module at the repository root beside
   `rlcontracts.js` and `rlrental.js`: `module.exports` plus a global attach,
   never ESM, no build step, loadable from `file://`. Every pure function is a
   top-level `function name(...) {}` declaration so `scripts/selftest.mjs::extractFn`
   can extract it by brace balancing. A const-arrow export would be structurally
   untestable by the harness.
2. Freeze the closed vocabularies in `rltaxrules.js`: `RULE_STATUS`
   (`enacted-current-law`, `enacted-scheduled-law`, `user-hypothetical-law`,
   `unavailable`), `SUPPORTED_INCOME_KINDS` (`ordinary`, `qualified-dividend`,
   `long-term-capital-gain`, `tax-exempt-interest`), and `RLTAX_CODES`:
   `RLTAX-YEAR-UNSUPPORTED`, `RLTAX-JURISDICTION-UNSUPPORTED`,
   `RLTAX-INCOME-KIND-UNSUPPORTED`, `RLTAX-FILING-STATUS-UNSUPPORTED`,
   `RLTAX-PACK-INVALID`, `RLTAX-PACK-EXPIRED`, `RLTAX-INPUT-INCOMPLETE`,
   `RLTAX-FEATURE-UNSUPPORTED`, `RLTAX-RECONCILE`, `RLTAX-THRESHOLD-UNAVAILABLE`,
   `RLTAX-SCOPE-DEFERRED`, `RLTAX-CONFIG-INVALID`. Later scopes consume this
   enum and add nothing to it.
3. Implement `validateRulePack(pack)`. A pack missing `id`, `program`,
   `jurisdiction`, `version`, `effectiveTaxYears`, `publishedAt`, `retrievedAt`,
   `sourceRecords[]`, `supportedFeatures[]`, `unsupportedFeatures[]`,
   `indexingRules[]`, `calculationOrder`, `roundingPolicy`, `expiryPolicy` or
   `contentSha256` is refused `RLTAX-PACK-INVALID` with the offending member
   named. No branch supplies a default for any member.
4. Implement `resolveRulePack(jurisdiction, program, year)`. A year outside
   `effectiveTaxYears` is `RLTAX-YEAR-UNSUPPORTED`. A jurisdiction other than
   `federal` is `RLTAX-JURISDICTION-UNSUPPORTED`. A pack past its `expiryPolicy`
   is `RLTAX-PACK-EXPIRED` and cannot compute a current result. There is no code
   path that indexes, interpolates or carries a threshold into an unsupported
   year, because the resolver holds no arithmetic.
5. Implement `unavailable(code, domain, reason, whatWouldMakeItAvailable)`
   returning `TaxUnavailable/v1`. Its return type is a record, never a number.
   Assert in the module that no `TaxUnavailable` construction path can produce a
   numeric value.
6. Author the federal pack for **one** declared tax year. The year is an
   implementation input taken from a primary IRS source, recorded with
   `publishedAt` and `retrievedAt` and cited in `sourceRecords[]`. No value is
   copied from a secondary summary when a primary source is available. Every
   federal capability outside the four supported income kinds — payroll and
   self-employment tax, the qualified business income deduction, taxable Social
   Security benefits, net investment income tax, the additional Medicare tax,
   credits, AMT, carryforwards — is enumerated in `unsupportedFeatures[]` so no
   result can be labeled a complete federal tax.
7. Author `rltaxworkspace.js`. `minimumViableInput(input)` accepts filing status,
   declared tax year, at least one supported income-kind amount, and a deduction
   mode. Anything less is `RLTAX-INPUT-INCOMPLETE` naming the missing member.
   Anything more that is not a supported domain is recorded as a declared
   unavailable domain rather than rejected, so an unsupplied domain never blocks
   a supplied one.
8. Fix the storage namespace to this feature's own prefix. The module never
   reads, writes, migrates, prunes or clears any portfolio key. Numeric guards
   use `Number.isFinite(x)`; global `isFinite` appears nowhere.
9. Add `lifetime-tax-strategy-lab.html` with the repository's single standard
   CSP meta copied verbatim from an existing page. `scripts/selftest.mjs`
   asserts one identical CSP across every page, so a drifting policy fails the
   suite rather than shipping.
10. Add the `site-exclusions.json` entry in the same commit as the page, with a
    reason stating that the tool is an in-progress unregistered feature whose
    registration is a later scope.
11. Register a `lifetime-tax — rule pack contract, resolution, and refusal`
    group in `scripts/selftest.mjs`, appended after the existing groups.

## Shared Infrastructure Impact Sweep

| Shared surface | Change | Downstream consumers | Blast radius | Independent canary before broad tests | Rollback |
| --- | --- | --- | --- | --- | --- |
| `site-exclusions.json` | One entry appended | `scripts/build-pages-site.mjs`, the live Pages deploy | **High** — an unregistered root page with no deploy decision fails the site build and breaks the deploy | Run the pages-site build directly and assert it accepts the new page, before any selftest or browser row | Remove the entry together with the page |
| `scripts/selftest.mjs` | One group appended | The whole-repo gate | Medium — a group that reads the wrong path or mutates shared state can destabilize unrelated groups | Run the suite once before the append and once after; the pre-existing pass count must not fall | Remove the appended group |
| Root HTML surface | One new page | The CSP uniqueness assertion and the notes/registry canaries | Medium — a drifting CSP fails an existing assertion for every page at once | Assert the new page's CSP string is byte-identical to an existing page before appending any group | Delete the page |
| Browser storage | New namespace | This feature only | Medium — a key collision with the portfolio workspace would violate the Feature 008 boundary | Enumerate every written key and assert none matches a portfolio prefix | Namespace is feature-owned; removal deletes nothing else |
| Feature 008 modules | **None** | — | — | Byte-identity canary over `rlportfolio.js`, `rlportfolioanalytics.js`, `portfolio-survival-allocation.config.json` and the Feature 008 spec directory | Not applicable; there is nothing to roll back |

## Change Boundary And Protected Paths

**Allowed new:** `rltaxrules.js` · `rltaxworkspace.js` ·
`lifetime-tax-strategy.config.json` · `tax-rules/federal/<declared-year>.json` ·
`lifetime-tax-strategy-lab.html` · this feature's fixture files · the new
Playwright spec.

**Allowed modified:** `site-exclusions.json` · `scripts/selftest.mjs`
(append-only).

**Excluded — must remain byte-identical:** `rlportfolio.js` ·
`rlportfolioanalytics.js` · `portfolio-survival-allocation.config.json` ·
`specs/008-portfolio-survival-and-brief-lab/**` · `tools.json` · `index.html` ·
`rlnav.js` · `README.md` · `notes/README.md` · `market-brief.config.json` ·
`market-brief.payload.json` · `market-brief.page.json` ·
`market-brief.snapshot.json` · `market-brief.html` · `rlbrief.js` ·
`briefs/**` · `data/**` · `brief-history.jsonl` · every scheduled-publication
script under `scripts/brief-*` · `watchlist.json` ·
`scripts/validate-spec-test-paths.baseline` · every framework-managed file under
`.github/bubbles/`, `.github/agents/bubbles*`, `.github/prompts/bubbles.*`,
`.github/instructions/bubbles-*` and `.github/skills/bubbles-*`.

**Dirty-work discipline:** capture a path-scoped `git status` and a zero-context
diff before each allowed path. No formatter and no broad rewrite runs.

**Rollback:** delete the new files, revert the two appended edits. No user
storage key is deleted automatically.

## Scenario-First Red/Green Contract

For each Test Plan row, add the named assertion or the persistent browser title
first and run the exact command. RED is valid only when the intended contract
assertion fails. A syntax error, a missing browser, an absent test discovery or
a different failing assertion does not satisfy RED. After the smallest owned
implementation, rerun the identical command for GREEN.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-01-01 | Contract | unit | SCN-021-001 | `scripts/selftest.mjs` | A complete federal pack validates and exposes `id`, `program`, `jurisdiction`, `version`, `effectiveTaxYears`, `publishedAt`, `retrievedAt`, `sourceRecords[]`, `supportedFeatures[]`, `unsupportedFeatures[]`, `indexingRules[]`, `calculationOrder`, `roundingPolicy`, `expiryPolicy` and `contentSha256` | `node scripts/selftest.mjs` | No | `report.md#tp-01-01` |
| TP-01-02 | Refusal | unit | SCN-021-002 | `scripts/selftest.mjs` | A pack missing any one required member is refused `RLTAX-PACK-INVALID` with the member named, once per member, and no member is defaulted | `node scripts/selftest.mjs` | No | `report.md#tp-01-02` |
| TP-01-03 | Refusal | unit | SCN-021-002 | `scripts/selftest.mjs` | A year outside `effectiveTaxYears` is `RLTAX-YEAR-UNSUPPORTED`, a non-federal jurisdiction is `RLTAX-JURISDICTION-UNSUPPORTED`, an income kind outside the four supported kinds is `RLTAX-INCOME-KIND-UNSUPPORTED`, and an expired pack is `RLTAX-PACK-EXPIRED` | `node scripts/selftest.mjs` | No | `report.md#tp-01-03` |
| TP-01-04 | Adversarial | unit | SCN-021-002 | `scripts/selftest.mjs` | Regression: a mutated resolver that carries a threshold into an unsupported year, or substitutes a zero for an unavailable domain, is proven to fail the refusal assertion — the guard can actually fail | `node scripts/selftest.mjs` | No | `report.md#tp-01-04` |
| TP-01-05 | Contract | unit | SCN-021-001 | `scripts/selftest.mjs` | `TaxUnavailable/v1` construction returns a record carrying a closed `RLTAX-*` code, domain, reason and remediation, and no construction path returns a numeric value | `node scripts/selftest.mjs` | No | `report.md#tp-01-05` |
| TP-01-06 | Minimum viable input | unit | SCN-021-001 | `scripts/selftest.mjs` | Filing status plus one declared year plus one supported income amount plus a deduction mode validates; anything less is `RLTAX-INPUT-INCOMPLETE` naming the missing member; every unsupplied domain becomes a declared unavailable domain and blocks no supplied domain | `node scripts/selftest.mjs` | No | `report.md#tp-01-06` |
| TP-01-07 | Single-definition | unit | SCN-021-001 | `scripts/selftest.mjs` | Exactly one module declares the `RuleStatus` enum, the supported income-kind list and the `RLTAX-*` codes; the repository is scanned for a second declaration of each and exactly one of each exists | `node scripts/selftest.mjs` | No | `report.md#tp-01-07` |
| TP-01-08 | Feature 008 boundary | unit | SCN-021-003 | `scripts/selftest.mjs` | Regression: `rlportfolio.js`, `rlportfolioanalytics.js` and `portfolio-survival-allocation.config.json` are unmodified, this feature's modules reference none of them, and no written storage key carries a portfolio prefix | `node scripts/selftest.mjs` | No | `report.md#tp-01-08` |
| TP-01-09 | Config | unit | SCN-021-001 | `scripts/selftest.mjs` | A missing, malformed, unknown-version or unknown-key configuration blocks dependent computation with `RLTAX-CONFIG-INVALID` while the privacy inventory and clear action remain reachable; production code contains no policy fallback | `node scripts/selftest.mjs` | No | `report.md#tp-01-09` |
| TP-01-10 | Style guard | unit | SCN-021-001 | `scripts/selftest.mjs` | Every pure function this scope adds is a top-level `function` declaration extractable by `extractFn`, the modules are UMD rather than ESM, and no source uses global `isFinite` | `node scripts/selftest.mjs` | No | `report.md#tp-01-10` |
| TP-01-11 | Deploy gate | functional | SCN-021-001 | `scripts/build-pages-site.mjs` | The new root page carries a `site-exclusions.json` deploy decision and the pages-site build accepts it; removing the entry is proven to make the build refuse | `node scripts/build-pages-site.mjs` | No | `report.md#tp-01-11` |
| TP-01-12 | Regression E2E | e2e-ui | SCN-021-001 | `lifetime-tax-foundation.spec.mjs` | `Regression: SCN-021-001 minimum viable input resolves one federal pack and names every unavailable domain` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-001 minimum viable input resolves one federal pack and names every unavailable domain" --reporter=list` | Yes | `report.md#scenario-scn-021-001` |
| TP-01-13 | Regression E2E | e2e-ui | SCN-021-002 | `lifetime-tax-foundation.spec.mjs` | `Regression: SCN-021-002 unsupported year jurisdiction and income kind each refuse without substitution` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-002 unsupported year jurisdiction and income kind each refuse without substitution" --reporter=list` | Yes | `report.md#scenario-scn-021-002` |
| TP-01-14 | Privacy Regression E2E | e2e-ui | SCN-021-003 | `lifetime-tax-foundation.spec.mjs` | `Regression: SCN-021-003 the tax workspace resolves only its declared reads and keeps every household value local` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-003 the tax workspace resolves only its declared reads and keeps every household value local" --reporter=list` | Yes | `report.md#scenario-scn-021-003` |
| TP-01-15 | Broader Regression E2E | e2e-ui | SCN-021-001 … -003 | `lifetime-tax-foundation.spec.mjs` | Execute the complete cumulative Scope 01 browser suite over the real route with no request interception, no service worker and no external provider | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-021-00" --reporter=list` | Yes | `report.md#tp-01-15` |
| TP-01-16 | Repo gate | unit | SCN-021-001 … -003 | `scripts/selftest.mjs` | The whole-repository suite stays green and the pre-existing pass count does not fall | `node scripts/selftest.mjs` | No | `report.md#tp-01-16` |
| TP-01-17 | Path guard | unit | SCN-021-001 … -003 | `scripts/validate-spec-test-paths.mjs` | The spec-artifact test-path guard reports zero new missing paths for this scope's artifacts | `node scripts/validate-spec-test-paths.mjs` | No | `report.md#tp-01-17` |
| TP-01-18 | Privacy E2E | e2e-ui | SCN-021-002 | `tests/lifetime-tax-foundation.spec.mjs` | GAP, NOT AUTHORED (opened 2026-08-22, F-REG-03). Route-wide title-versus-assertion mismatch. Three rows in the 021-024 privacy family really do constrain the origin of a ledger entry, each via `expect(ledger.filter((entry) => !entry.url.startsWith(site.baseUrl))).toEqual([])`: `SCN-021-003` (this scope's canary, `TP-01-14`), `SCN-022-007` and `SCN-022-013`. Six others carry the words "declared same-origin read" or "declared same-origin GET" in their persistent titles but assert only `new URL(entry.url).pathname` against `declaredRouteAssets()`, which returns bare paths: `SCN-021-015`, `SCN-023-001`, `SCN-024-001`, `SCN-024-009`, `SCN-024-010` and `SCN-024-014`. A read of `https://elsewhere.example/rltaxstrategy.js` has a declared pathname and would pass all six. The route-wide canary covers only the state that canary itself declares, so it does not stand in for the six. This scope owns the shared privacy contract, so the fix belongs here rather than being copied six times: fold the origin filter into the shared helper each row already calls. Adversarial case: a request whose pathname is declared but whose origin is not `site.baseUrl` must fail each of the six; today only the three named rows detect it | not authored | Yes | not authored |

Before any browser row, run `node scripts/validate-node-source-lock.mjs` and
`npx --no-install playwright --version`. These environment gates do not replace a
Test Plan row.

### Definition of Done

- [x] PRA-021-001 through PRA-021-010 are implemented: independent workspace
      contract, complete pack member set, jurisdiction/program/year resolution,
      closed `RuleStatus`, `TaxUnavailable/v1` refusals, four supported income
      kinds, non-federal jurisdictions unsupported, minimum-viable-input,
      local-only state, and mandatory configuration.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-01-01` through `report.md#tp-01-10`
  - **Claim Source:** executed · **Result:** all 17 assertions in the appended Scope 01 group pass; suite exits 0 at `2492 passed, 0 failed`. Two defects were found and fixed on the way: `validateRulePack` named an absent member twice, and the citation assertion expected 12 present figures where the pack correctly carries 8.
- [x] Every Test Plan row has intended RED evidence and same-command GREEN
      evidence, recorded before the cumulative browser row.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` and the TP-01-15 cumulative browser command · **Evidence:** `report.md#tp-01-16-and-tp-01-15-earned--the-last-two-rows-without-a-red-2026-08-23`
  - **Claim Source:** executed · **Result:** all eighteen rows now carry an intended RED and a same-command GREEN. The two that did not are earned in this session and recorded in the report section named above: `TP-01-16` discriminates at exit `1` against `0` with the pinned assertion moving from `✗ FAIL` to `✓`, and `TP-01-15` discriminates at exit `1` against `0` with the pin on a marginal-spec scenario this scope does not own. Both reverts are hash-verified against the committed blob.
  - **Ticked 2026-08-23, superseding the two notes below.** The `TP-01-18` and
    `TP-01-17` gaps those notes record were already closed on 2026-08-22 and are
    unchanged. The two they left open are closed now. `TP-01-16`'s earlier exit-7
    result is **not** withdrawn: its own conclusion was that the guard it mutated
    is unasserted, so that mutation could never reach this row's contract, and
    that blind spot in `rltaxworkspace.js` remains recorded in the report as a
    finding. The probe run here is the first one placed inside the row's reach,
    not a retry of the same experiment. Three limits recorded earlier are carried
    forward unchanged rather than dissolved by this tick: `TP-01-04`'s
    zero-substituting half, `TP-01-08`'s forbidden-prefix limb and `TP-01-14`'s
    cross-origin arm each remain without a single-limb RED, for reasons stated
    where they were found.
  - **Superseded note, 2026-08-22.** Two of the three gaps are closed.
    `TP-01-18` is now authored and carries a RED with a same-command GREEN, so
    the note below no longer applies to it. Of the three rows the note itself
    identifies as outside the command range, `TP-01-17` now carries a
    discriminating path-guard probe. Two rows remain without a RED and both are
    named rather than counted away. `TP-01-15`, the cumulative browser row, was
    not probed. `TP-01-16`, the repo gate, **was** probed and the harness
    returned exit 7 — the RED and GREEN channels agreed. That result is recorded
    in `report.md#tp-01-17-reds-tp-01-16-does-not--one-probe-one-finding-2026-08-22`
    as a finding rather than retried with a different mutation, because a probe
    retried until something goes red stops being evidence. The finding is about
    the module, not the row: relaxing the non-empty string guard in
    `rltaxworkspace.js` so a zero-length string is accepted moves no assertion in
    a 3384-assertion suite, so a regression through that guard would ship green.
  - **Superseded note, 2026-08-22 (F-REG-03).** `TP-01-18` was opened in this scope and
    is not authored, so it carries neither a RED nor a GREEN. The word "Every"
    therefore no longer holds. Note that this item's own **Command** already
    named a narrower range than its headline — `TP-01-01` through `TP-01-14`,
    while `TP-01-15` through `TP-01-17` also exist — so the headline over-claimed
    before this change too; the new row makes that unambiguous rather than
    creating it. Ticking it again requires `TP-01-18` authored with a RED and a
    same-command GREEN, not a narrowing of the headline.
  - **Phase:** implement · **Command:** the exact TP-01-01 through TP-01-14 commands · **Evidence:** `report.md#test-evidence`
  - **Claim Source:** executed. The earlier "Not met" note is superseded: the route and `tests/lifetime-tax-foundation.spec.mjs` both exist now, so the four rows it deferred were run. Every TP-01-01 through TP-01-14 row now carries an intended RED and a same-command GREEN, and TP-01-15 was executed last at `9 passed`, which is the ordering this item requires. TP-01-02 is a real defect caught before the fix; TP-01-08 and TP-01-13 were probed in this session through `scripts/red-green-probe.sh` and both discriminated with a hash-verified revert. Two limits are recorded rather than papered over: TP-01-04's zero-substituting half and TP-01-08's forbidden-prefix limb are each shielded by a second independent check, so no single-limb mutation can make their assertion fail. Both are named as unproven in `report.md`.
- [x] The federal pack covers exactly one declared tax year, cites primary IRS
      sources with `publishedAt` and `retrievedAt`, and enumerates every
      unsupported federal feature so no result is labeled a complete federal tax.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-01-01`
  - **Claim Source:** executed · **Result:** `effectiveTaxYears: [2026]`; Rev. Proc. 2025-32 retrieved in this session and every one of the 8 present figures re-verified digit-by-digit against the retrieved text; all 18 unsupported features named; `completeFederalTax` is a structural `false`.
- [x] The `site-exclusions.json` deploy decision exists and the pages-site build
      accepts the new root page. The adversarial case proves that removing the
      entry makes the build refuse.
  - **Phase:** implement · **Command:** `node scripts/build-pages-site.mjs` · **Evidence:** `report.md#tp-01-11`
  - **Claim Source:** executed · **Result:** the page now carries its own `site-exclusions.json` entry alongside the four module entries, and the full non-dry-run `node scripts/build-pages-site.mjs` accepts it at exit 0 with `registeredPages: 28` and the page counted inside `excludedPaths: 12`, so it is accepted as deliberately unregistered rather than registered. The adversarial half was exercised in this session: removing only the `lifetime-tax-strategy-lab.html` entry made the same command exit 1 with `Error: unregistered root page lacks a deploy decision: lifetime-tax-strategy-lab.html`, naming the page rather than failing generically. The mutation was reverted immediately and `git status --short -- site-exclusions.json` was empty before the GREEN rerun.
- [x] The new page's Content-Security-Policy meta is byte-identical to the
      repository's existing single policy.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-01-10`
  - **Claim Source:** executed · **Result:** the page exists and two independent detectors assert the identity — the repository-wide `all pages use one identical CSP instead of drifting per page` set, and the Scope 05 `pageCsp[1] === referenceCsp[1]` byte comparison against `portfolio-survival-allocation-lab.html`. Re-probed 2026-08-19 against a zero-failure baseline with a same-length token swap (`manifest-src 'self'` → `'none'`) that changes no directive count: RED `3061 passed, 6 failed`, exit 1, sha256 `214fa56…`; reverted in the same shell invocation with `git status --short` empty; GREEN `3067 passed, 0 failed`, exit 0, sha256 `fbd2d65…`.
- [x] The Feature 008 byte-identity canary passes: `rlportfolio.js`,
      `rlportfolioanalytics.js`, `portfolio-survival-allocation.config.json` and
      `specs/008-portfolio-survival-and-brief-lab/**` are unmodified, and no
      storage key collides with a portfolio prefix.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus a path-scoped `git status` · **Evidence:** `report.md#tp-01-08`
  - **Claim Source:** executed · **Result:** the path-scoped `git status` over the excluded list returns no rows, and the suite asserts the tax modules reference no Feature 008 surface and that clearing private data leaves a portfolio-prefixed key untouched.
- [x] The declared-read canary passes: every request the route issues is a
      same-origin read of a document the page's own declarations name — nine
      documents across seven call sites, plus the fourteen modules the markup
      names — and a sentinel household value appears in no URL, referrer,
      console message or committed artifact. Adversarial cases: a read that
      reaches another origin fails; a read of a document the declaration list
      does not name fails; a sentinel household value on any of those four
      surfaces fails; and a route that read nothing fails, because the declared
      reads must still be present and resolve.
  - **Restated 2026-08-22 (F-REG-02).** The superseded text read "the route issues no request", which is false by measurement and contradicted the corrected `NFR-021-009`. The route issues 24 requests at first paint — the document, 14 declared modules, the configuration document, the rule packs it names, and the browser's own favicon — through one `window.fetch` primitive at `lifetime-tax-strategy-lab.html:5649`. The row now states what its own evidence establishes and stays falsifiable in four directions: `expect(foreign).toEqual([])` fails on a cross-origin read, `expect(unexpected).toEqual([])` fails on a read the declaration list does not name, the sentinel assertions fail on a household value reaching a URL, referrer or console message, and `expect(afterFirstPaint).toBeGreaterThan(0)` with the resolved-response pins fail a route that read nothing. This restatement is `bubbles.plan`'s artifact; the tick is not, and remains for a verifying pass.
  - **Phase:** implement · **Command:** the TP-01-14 command · **Evidence:** `report.md#scenario-scn-021-003`, `report.md#scn-021-003-adversarial-arm-probes-2026-08-22`
  - **Ticked 2026-08-22.** The measured half of the restated row holds: `loadJson` has seven call sites naming nine documents (the configuration document and the eight packs it declares), and the markup names fourteen modules. The TP-01-14 command exits 0 with `1 passed`. The committed-artifact surface is `node scripts/pii-scan.mjs` at `files=8136 messages=1746 findings=0 OK`, exit 0. Three of the four adversarial arms are proven sensitive by an observed RED: the undeclared-document and sentinel arms from the earlier probes recorded below, and the read-nothing arm by a probe run this session that declares a module which is requested and never resolves, exit 1 against exit 0 on the same command. The fourth arm, cross-origin, has no observed RED and is ticked without one: reaching another origin requires a network sink and `red-green-probe.sh` refuses any replacement containing `fetch(` at exit 3. That limitation is recorded rather than papered over, together with what supports the arm indirectly — `foreign` and `unexpected` filter one ledger snapshot, and `unexpected`'s observed RED establishes that the snapshot is populated and that an empty-set filter over it does fail when a disallowed entry is present.
  - **Claim Source:** executed · **Result:** the route and `tests/lifetime-tax-foundation.spec.mjs` both exist, and the canary passes at the route level. Both arms were proven sensitive by an observed RED, using probes that never transmit a household value. Probe A added a value-free undeclared same-origin request to `render()`: RED at line 310 `expect(unexpected).toEqual([])` with `Received + 11`. Probe B appended the declared amount to the never-transmitted location hash: RED at line 360 with `Received string: "#simple-123457"`, which is `SENTINEL_ORDINARY`. Probe B's first attempt used a non-existent state path and produced `"#simple-undefined"`; that miss is recorded in the report rather than discarded, and the probe was rerun against the real path. Each mutation was reverted in the shell invocation that applied it, with `probe_token_remaining=0` and an empty path-scoped `git status`, before the identical command was re-run GREEN. The console arm is covered by the same test's `expect(consoleMessages).toEqual([])` and the committed-artifact arm by `node scripts/pii-scan.mjs` at `findings=0 OK`.
- [x] The tool is absent from `tools.json`, `index.html`, `rlnav.js`,
      `README.md`, `notes/README.md` and market-brief coverage.
  - **Phase:** implement · **Command:** a path-scoped `git status` over the six files · **Evidence:** `report.md#registration-absence`
  - **Claim Source:** executed · **Result:** the scoped `git status` returns no rows for any of the six surfaces. One caveat is recorded in the report: `notes/lifetime-tax-strategy-lab.md` was created by an earlier interrupted run of this dispatch and sits outside the authorised file set.
- [x] No source, artifact or UI string in this scope claims a published error
      rate, a self-invalidation statistic, a track record, an accuracy figure or
      a success probability.
  - **Phase:** implement · **Command:** a repository text scan over this scope's allowed paths · **Evidence:** `report.md#claim-boundary`
  - **Claim Source:** executed · **Result:** the scan over `rltaxrules.js`, `rltaxworkspace.js`, `rltax.js`, the configuration and the pack returns zero matches (exit 1).
- [x] `node scripts/selftest.mjs` is green and its pre-existing pass count has
      not fallen. No existing assertion was edited, relaxed or removed.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-01-16`
  - **Claim Source:** executed · **Result:** `2492 passed, 0 failed`, exit 0. The diff to `scripts/selftest.mjs` is one hunk, `681` insertions and `0` deletions, starting after the last pre-existing line. The two new groups contribute 35 assertions, so the pre-existing total is 2457 and none of it fell.
- [x] `node scripts/validate-spec-test-paths.mjs` reports zero new missing paths
      and the baseline file is unmodified.
  - **Phase:** implement · **Command:** `node scripts/validate-spec-test-paths.mjs` · **Evidence:** `report.md#tp-01-17`
  - **Claim Source:** executed · **Result:** `new=0`, exit 0. The 6 reported stale baseline entries pre-date this feature and belong to the causal-rotation work; the baseline file was not modified.
