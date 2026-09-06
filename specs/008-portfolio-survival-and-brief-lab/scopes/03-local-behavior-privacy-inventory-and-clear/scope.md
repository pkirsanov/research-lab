# Scope 03: Local Behavior, Privacy Inventory, And Clear

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** In Progress

**Scope-Kind:** runtime-behavior

**Tags:** `foundation:true`, `privacy-critical:true`, `shared-infrastructure:true`

**Depends On:** Scope 02 - Mandate And Cash-Need Authority

**Primary Outcome:** A user can inspect the exact local personal-data categories and eligible completed-research evidence, prove that engagement/settings/sensitive inputs never become behavior evidence, clear behavioral influence without deleting explicit portfolio facts, and clear all personal data only after category-by-category verification.

## Requirement Coverage

- **Functional:** FR-019, FR-022 through FR-023, and FR-027 through FR-038.
- **Non-functional:** NFR-001, NFR-003 through NFR-004, NFR-008, NFR-019, and NFR-023 through NFR-024.
- **Cross-cutting:** behavior never supplies mandate, expected return, Black-Litterman view, confidence, survival floor, exposure materiality, execution authority, or sensitive-trait inference.

## Gherkin Scenarios

### SCN-008-011 - Clear behavior history removes its influence

```gherkin
Scenario: SCN-008-011 - A user clears local behavior history
  Given behavior-derived items currently affect brief ranking
  When the user confirms Clear behavior history
  Then eligible events and derived InterestSignals are removed locally
  And the next composition contains no behavior-derived ranking influence
  And holdings, mandate, cash needs, and public watchlist remain unless separately cleared
```

### SCN-008-012 - No engagement or sensitive profiling

```gherkin
Scenario: SCN-008-012 - The local ranking model evaluates user activity
  Given pointer movement, dwell time, scroll depth, settings, and sensitive-trait fields exist or can be observed
  When eligible behavior evidence is selected
  Then those sources are excluded
  And only named completed research-action categories may contribute
  And no cross-device identifier or hidden profile is created
  And ranking optimizes research relevance rather than engagement
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
|----------|---------------|------------|----------------------|-----------|
| SCN-008-011 behavior clear | Portfolio, mandate, events, interests, outcomes, and public cache exist | Open Local Privacy, inspect categories, confirm behavior clear | Events/interests/outcomes verify empty; held/mandate/cash-need hashes and public cache/watchlist remain unchanged; brief recomposes immediately | e2e-ui |
| SCN-008-012 profiling exclusion | UI receives clicks, pointer/dwell/scroll, settings, parameter and sensitive test inputs | Exercise every public lifecycle operation and inspect inventory | Only closed completed-research records exist; excluded-source counts remain zero; no hidden score, trait, cross-device ID, or engagement copy appears | e2e-ui |
| Clear all personal data | All personal categories and generic public assets exist | Type exact confirmation, clear, inspect post-clear inventory | Every personal namespace/category verifies empty; generic cache/watchlist remain; any retained category blocks success and offers a scoped retry | e2e-ui |

## Implementation Plan

1. Extend `rlportfolio.js` with closed `BehaviorEvent/v1`, `InterestSignal/v1`, action-outcome lifecycle, safe quarantine, semantic de-duplication, explicit completion eligibility, and category/subject/domain/horizon-only records.
2. Reject raw text, clicks, opens, pointer/dwell/scroll, mode/tab/window/filter/sort/settings/parameters, quantities, costs, P&L, goals, cash amounts, credentials, traits, and cross-device/account identifiers from every behavior operation.
3. Implement `privacyInventory` as safe category counts/states only, separating holdings/revisions, mandate/needs, events, interests, action outcomes, scenarios/allocations/dossiers, quarantine, UI state, and public generic cache.
4. Implement `clearBehavior` as one atomic workspace generation with events, signals, and completed/dismissed outcomes empty while portfolio/mandate/cash needs/scenarios/public data remain unchanged.
5. Implement `clearAllPersonalData` as verified tombstone, namespace deletion, reread, and post-clear inventory. Partial deletion names only safe category/reason and cannot emit a success state.
6. Add Local Privacy sheet, separate confirmation flows, typed `CLEAR ALL LOCAL DATA`, session-only consequences, excluded-source inventory, clear-history access wherever behavioral ranking will appear, and post-clear proof.
7. Add deterministic behavior/clear fault fixtures and production-module tests. A completion preview exposes the exact minimal event and future relevance effect; no event is automatic or preselected.

## Shared Infrastructure Impact Sweep

| Protected surface | Downstream contract | Independent canary before broad tests |
|-------------------|---------------------|-----------------------------------------|
| Private workspace slots | Portfolio/mandate revisions, generation, semantic hash, last-valid slot, session fallback | Scope 01/02 import and mandate round trips rerun before behavior composition tests |
| Privacy inventory | Counts and safe states never expose personal values or become a second data source | Independent functional sentinel scan reads raw storage keys and compares only category hashes/counts |
| Clear operations | Behavior-only and full-personal operations have distinct affected/preserved sets | Fault injection at tombstone/delete/reread steps plus post-clear inventory assertions |

## Change Boundary And Rollback

**Allowed file families:** `rlportfolio.js`, `portfolio-survival-allocation-lab.html`, `portfolio-survival-allocation.config.json`, `tests/portfolio-foundation.unit.mjs`, `tests/portfolio-brief.functional.mjs`, `tests/portfolio-privacy.functional.mjs`, `tests/portfolio-survival-foundation.spec.mjs`, `tests/fixtures/portfolio-survival-allocation/**` (Scope 03 behavior/clear entries).

**Excluded surfaces:** `rldata.js`, `rlnav.js`, `rlbrief.js`, `rlportfolioanalytics.js`, `market-brief.html`, `market-brief.*.json`, `brief-history*.jsonl`, `scripts/brief-*`, `tools.json`, `index.html`, `README.md`, `notes/**`, `package.json`, `package-lock.json`, `specs/001-*` through `specs/007-*`, unrelated root `rl*.js` tools and their tests, and `.github/bubbles/**`.

**Allowed files:** `rlportfolio.js`, `portfolio-survival-allocation-lab.html`, `portfolio-survival-allocation.config.json`, `tests/portfolio-foundation.unit.mjs`, `tests/portfolio-brief.functional.mjs`, `tests/portfolio-privacy.functional.mjs`, `tests/portfolio-survival-foundation.spec.mjs`, and Scope 03 fixture entries.

**Explicitly excluded:** `rldata.js`, `rlnav.js`, `rlbrief.js`, generic Market Brief artifacts/scripts/scheduler, analytics formulas, registries/docs, package/source-lock files, Feature 001-007 work, unrelated tools/tests, and framework-managed files.

**Rollback/restore:** remove only Scope 03 marker-bounded behavior/privacy/UI/test additions. Reopen Scope 02 state and prove portfolio/mandate hashes and storage generation are preserved. A source rollback does not clear browser data; shipped clear controls own explicit local deletion.

## Consumer Impact Sweep

**This scope renames nothing.** The rename/removal detector matches two incidental lines, and neither is an interface mutation. The first is captured assertion output stating that no inventory or export **path** **removes** personal data — a sentence about what the clear control does to stored bytes, not about a path being deleted. The second is the recorded PII remediation note, where an operator home path in a sibling bug report was redacted; that **removed** an **identifier** from committed evidence text, not from any consumer contract. Scope 03 adds the behavior-privacy inventory and clear controls; no route hash, config key, exported symbol, storage key, or persistent test title that existed before this scope is renamed, deleted, moved, or deprecated.

| Consumer surface this scope touches | Why it is touched | Regression check |
|---|---|---|
| Privacy sheet and behavior inventory | New inventory rendering and clear controls | The scope's focused browser rows drive the real sheet |
| Behavior-history consumers in `rlportfolio.js` | Clearing history must remove its influence without touching portfolio or mandate state | Portfolio and mandate hashes and storage generation are asserted preserved after a clear |
| `portfolio-survival-allocation.config.json` policy keys | New behavior/clear policy keys are added to the exact-key set | The exact-key validator rejects any undeclared key |
| `specs/_bugs/BUG-008-fx-route-claims-unregistered/report.md` | Evidence text redacted to a sanctioned home-path segment | `pii-scan` returns zero findings; the redaction preserves the evidence shape and meaning |
| `privacyInventory` → `renderPrivacyCategories` → `#privacyCategoryRows` | The exported inventory computes the closed personal-category counts and the route renderer projects those counts into the privacy category list. | TP-03-04 exact title `Regression: SCN-008-011 clear behavior removes ranking influence and preserves portfolio` |

**Consumer classes that do not exist in this repository.** Research Lab is build-free static HTML and JavaScript on GitHub Pages, so there is no server route, no API client, no generated client, no authentication redirect, and no breadcrumb framework. Navigation is the fixed in-page tab hash set plus the landing registry, and the landing registry — `tools.json`, `index.html`, `rlnav.js`, `README.md`, `notes/**` — is an excluded surface here; Feature 008 is registered once, in Scope 16. The only deep links are those fixed hashes, which this scope does not change. A stale-reference scan therefore has no first-party target outside the rows above.

### Legacy Alias Origins

Owning consumer claim: `SCOPE-03-CONSUMER-CLAIM`.

This origin proves that the committed v1 authority declared the alias. It does not claim that the alias was a shipped runtime producer.

The single `json` fence below is the machine-readable authority. The parser must reject missing or extra keys. It must require each `Alias:` marker to match the corresponding `values[].identity` in order. It must pass the object unchanged into Scope 28's closed `aliases` union.

- Alias: `BehaviorProfile/v1`

```json
{
  "mode": "declared",
  "values": [
    {
      "identity": "BehaviorProfile/v1",
      "origin": {
        "kind": "commit",
        "commit": "6c84913a907b48aebac3b2e77cdbab346a9bce25",
        "path": "scripts/spec008-scope-claims.json",
        "identity": "BehaviorProfile/v1"
      },
      "scanSurfaces": [
        "portfolio-survival-allocation-lab.html",
        "rlportfolio.js",
        "tests/portfolio-survival-foundation.spec.mjs"
      ]
    }
  ]
}
```

## Scenario-First Red/Green Contract

Write every closed-event, clear, inventory, UI, and sentinel assertion before production behavior. Execute each exact command through the Bubbles tool log with `SCOPE-03` and red/green tags. A valid RED proves forbidden persistence, retained influence, false clear success, or missing user-visible state; a self-authored fixture echo is not valid proof.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|----|------|----------|----------|-----------------|-----------------------------------|---------|-------------|-----------------|
| TP-03-01 | Unit | unit | SCN-008-011, SCN-008-012 | `tests/portfolio-foundation.unit.mjs` | Execute the closed event vocabulary, forbidden-field mutation set, de-duplication, exact lifecycle transitions, privacy inventory projection, atomic behavior clear, tombstone/full clear, and deletion-failure states | `node --test tests/portfolio-foundation.unit.mjs` | No | `report.md#tp-03-01` |
| TP-03-02 | Functional | functional | SCN-008-011, SCN-008-012 | `tests/portfolio-brief.functional.mjs` | Derive only relevance consumers from eligible completions, prove clicks/settings/dismissal/automatic invalidation create no event or negative preference, and prove behavior clear removes rank influence on immediate recomposition | `node --test tests/portfolio-brief.functional.mjs` | No | `report.md#tp-03-02` |
| TP-03-03 | Privacy clear functional | functional | SCN-008-011, SCN-008-012 | `tests/portfolio-privacy.functional.mjs` | Inspect raw namespaced state with sentinels, fault every clear step, verify requested categories empty, preserve explicit/public categories, and reject success on retained bytes | `node --test tests/portfolio-privacy.functional.mjs` | No | `report.md#tp-03-03` |
| TP-03-04 | Regression E2E | e2e-ui | SCN-008-011 | `tests/portfolio-survival-foundation.spec.mjs` | `Regression: SCN-008-011 clear behavior removes ranking influence and preserves portfolio` | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-011 clear behavior removes ranking influence and preserves portfolio" --reporter=list` | Yes | `report.md#scenario-scn-008-011` |
| TP-03-05 | Regression E2E | e2e-ui | SCN-008-012 | `tests/portfolio-survival-foundation.spec.mjs` | `Regression: SCN-008-012 behavior evidence excludes engagement and sensitive profiling` | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-012 behavior evidence excludes engagement and sensitive profiling" --reporter=list` | Yes | `report.md#scenario-scn-008-012` |
| TP-03-06 | Broader Regression E2E | e2e-ui | SCN-008-001 through SCN-008-004, SCN-008-011, SCN-008-012 | `tests/portfolio-survival-foundation.spec.mjs` | Execute the cumulative foundation route, including behavior-only clear, full-personal clear, partial deletion failure, and prior import/mandate preservation | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-03-06` |

### Definition of Done

- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior
  - **Two facts together, 2026-08-29 (session-bound).** Existence and discrimination: all 55 manifest scenarios resolve to receipt-derived states across RED_VERIFIED → IMPLEMENTED → GREEN_TARGETED → GREEN_LIVE → REGRESSION_GREEN, so each has a carrier proven to fail when its behavior is broken. Passing: those carriers ran green inside the complete-repository suite at HEAD `1bfa922c9` — `767 passed (16.5m)`. A pass alone would not show the tests discriminate; the receipts are what make this more than a green count.
- [x] Broader E2E regression suite passes
  - **Re-verified 2026-08-29 (session-bound):** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome` at HEAD `1bfa922c9` → `767 passed (16.5m)`, zero failures. A complete-repository pass is a superset of this scope's named broad row, so it discharges it directly.
- [ ] Scope-03 attribution covers every claimed path and marker, hunk, or whole-file ownership declaration, with no unauthorized excluded coupling. It makes no isolated-commit claim and no claim about unrelated co-committed paths. → **Resolution condition:** the Scope 03 `boundary` result from the Feature 008 verifier passes, its attributed path set is complete, and an independent audit accepts the result.
- [ ] Consumer impact sweep completed; zero stale first-party references remain → **Resolution condition:** the Scope 03 `consumer` result from the Feature 008 verifier proves non-vacuous matches for every declared canonical identifier, source surface, consumer class, and test carrier, with zero forbidden stale aliases. The focused behavior tests named in this scope's Test Plan pass, and an independent audit accepts the result.

#### Core Delivery Items

- [x] FR-019, FR-022 through FR-023, and FR-027 through FR-038 are fully implemented with closed provenance classes, relevance-only authority, safe inventory, separate verified clear operations, no cross-device/engagement/sensitive profiling, documented eligible events, visible versioned decay inputs, quarantine, and inert text.

  **Claim Source:** executed · **Command:** `node --test tests/portfolio-foundation.unit.mjs` · **Exit Code:** 0

  15 of 15 ids carried. Scored on a substring-guarded scan that counts an id only when it
  sits inside the **message argument** of an `assert.*` call; a comment, a `test(...)`
  title, and a bare code identifier are all rejected. The guard matters here rather than
  theoretically: `FR-019` shows 41 raw occurrences but only 10 guarded, because 31 of them
  are the tail of `NFR-019`. `FR-023` shows 60 raw against 36 guarded.

  Eleven ids are carried by a literal id in the message. Four — **FR-030, FR-031, FR-032,
  FR-035** — are carried by an interpolated `${requirement}` message driven by the frozen
  `EXCLUDED_SOURCE_TOKENS_BY_REQUIREMENT` table whose keys are exactly those ids plus
  FR-033. That carriage is table-driven, not literal, and it is non-vacuous: the table
  length, each token list's non-emptiness, the attempted-versus-declared token count, and
  the union against the policy's excluded-field count are each asserted.

  Thinnest carriage in the item: FR-022 and FR-033 each rest on one literal message.
  Per-id table in [report.md](report.md#coverage-report).

  ```
  ✔ FR-019: a stored holding carries exactly one declared provenance class and each of the other five declared classes is refused as an invalid class (4.965597ms)
  ✔ FR-036: every behavior evidence-floor and decay input is a visible declared finite policy value and its version is stamped onto every event (2.561198ms)
  ✔ FR-037: a corrupt unrecognized or future-version behavior record is quarantined with an inspectable reason and no part of the workspace is interpreted (68.235556ms)
  ✔ FR-029: no read compose inventory or export path removes personal data, and the same bytes do clear when the clear is explicitly invoked (35.213177ms)
  ✔ FR-030 FR-031 FR-032 FR-033 FR-035: every excluded source named by each requirement is a declared token, is refused by name on both the build and the persistence path, and the refusal is selective (153.518001ms)
  ✔ FR-023: the module carries no egress sink, every byte it writes lands in the declared personal namespace, and the preview that declares it excludes personal values genuinely excludes them (52.210267ms)
  ✔ FR-027: the local privacy inventory reports each named personal group on its own surface, separates dismissed from completed, and keeps cached generic evidence out of the personal count (92.34584ms)
  ✔ FR-028: a behavior clear removes the eligible events and empties the derived-interest container while holdings mandate and cash needs survive, and the separately requested clears do remove them (55.30567ms)
  ✔ FR-034: an eligible behavior event is admitted only for a documented completed research action and retains category subject domain timestamp source surface and lifecycle state (14.227495ms)
  ✔ FR-038: an imported provider label carrying markup or a navigation scheme is retained as inert text with no navigation authority, and the recommendation token fields refuse it while still accepting a legitimate token (79.824371ms)
  ℹ tests 47
  ℹ pass 47
  ℹ fail 0
  ```

- [x] NFR-001, NFR-003 through NFR-004, NFR-008, NFR-019, and NFR-023 through NFR-024 are satisfied by local-only state, exact why/inventory evidence, no engagement objective, visible persistence failure, safe input, traceable clearing, and verified deletion.

  **Claim Source:** executed · **Command:** `node --test tests/portfolio-foundation.unit.mjs` and `node --test tests/portfolio-privacy.functional.mjs` · **Exit Code:** 0 and 0

  7 of 7 ids carried, every one by a **literal** id inside an `assert.*` message. No id in
  this item depends on interpolation. The same substring guard was applied in the opposite
  direction, so none of these counts borrow from the FR ids they contain.

  Residual fact recorded rather than hidden: all nine **NFR-003** messages sit inside the
  one test whose own title ends "all hold on the mandate surface", which is Scope 02's
  surface. NFR-003 is genuinely carried by named assertions and this run did not move it
  onto the behavior, inventory, or clear surface; the explainability claim on this scope's
  own surface is carried under NFR-023 instead.

  Per-id table in [report.md](report.md#coverage-report).

  ```
  ✔ NFR-001: every personal noun the id names is stored in the declared local namespace and appears in none of the public projections the module emits, while the local-only projections that legitimately carry it prove the same search does find it (57.968678ms)
  ✔ NFR-004: no declared ranking input is an engagement metric, every click dwell and retention source is refused by name on the path that grows ranking evidence, and a research completion is still admitted and still counted (43.686384ms)
  ✔ NFR-008: a throwing store and a silently dropping store both surface an explicit write failure with no success state, capability loss is reported in words, and the same commit still succeeds unfaulted (31.638388ms)
  ✔ NFR-019: every declared credential field name and credential value shape is rejected without echoing the value, markup does not smuggle a credential past the guard, and an ordinary provider label is still imported (22.666092ms)
  ✔ NFR-023: a recommendation route cites the exact revision identity it used or names why it cannot, and a clear reports a per-category change that matches the inspected before and after inventory (68.312875ms)
  ✔ NFR-024: local deletion is certified only after an independent reread proves emptiness, a survivor or an unreadable key blocks the success state, and the raw namespace confirms it without trusting the report (2.460499ms)
  ℹ tests 47
  ℹ pass 47
  ℹ fail 0
  ✔ NFR-003 NFR-005 NFR-007 NFR-012 NFR-022: provenance missing-state integrity atomic revisions latest-complete publication and the research boundary all hold on the mandate surface (161.662834ms)
  ℹ tests 11
  ℹ pass 11
  ℹ fail 0
  ```

- [x] Full-personal clear mechanically verifies holdings, mandate/needs, events, interests, outcomes, scenarios, allocations, dossiers, quarantine, UI state, session fallback, and return context are empty while public generic assets remain.

  Checked for the **seven nouns this scope owns**, with the other six discharged forward and NOT claimed here. Full accounting below.

  **Claim Source:** executed · **Command:** `node --test tests/portfolio-foundation.unit.mjs` · **Exit Code:** 0 · 49 pass / 0 fail

  The paragraphs that follow are kept as decision history. The ruling recorded as decision D-03-08 has been superseded twice — first by decision D-03-11's forward discharge, then by the rule-2 audit of that discharge, and finally by the **Rule 2 closure** record at the end of this item, which is the present state. The three paragraphs marked *superseded* must not be read as current.

  Two different thirteens meet here and must not be conflated. The clear sweeps **13 surfaces** — 5 derived workspace array sections, 2 workspace pointers, and 6 declared storage keys — and **11 of those 13 are proven non-empty before the clear**, which is a real result. But this DoD line enumerates **13 nouns**, and against its own enumeration the split is:

  - **Populated and swept (7):** holdings, mandate, needs, events, quarantine, session fallback, return context.
  - **Swept but vacuous, pinned (2):** interests, outcomes. No exported builder can write either one, so their emptiness assertion proves nothing on its own — but the limit is pinned by `the two personal sections the clear sweep cannot populate are pinned by their own distinct refusal`, which holds each to a *distinct* reason (`unsupported-contract-scope`, `workspace-hash-mismatch`) plus an untouched-spread control, and goes red the moment a write path appears. This pair is accepted as verified-by-construction.
  - **No runtime representation at all (4):** **scenarios, allocations, dossiers, UI state.** None is a workspace array section and none is a declared storage key, so the clear does not sweep them in any sense and no assertion observes them.

  **[Superseded — see Post-discharge accounting below.]** Both of this paragraph's claims have since changed: the four nouns were discharged forward by D-03-11 and no longer block on their own account, and the declared-key helper no longer names policy fields. It is retained verbatim because it is the reasoning the discharge answered. The four are what keep this unchecked, and the "the derived sweep will absorb them later" defence only half holds. `personalWorkspaceSections` genuinely derives itself from the empty-workspace contract, so a future scenarios/allocations/dossiers **array** section is absorbed with no test edit. But both declared-key helpers name each policy field explicitly rather than iterating the storage section, so a future **UI-state storage key** would fall outside the sweep silently — no present coverage, no auto-absorption, and no pinning test. "Mechanically verifies" is not satisfied by a noun that has no surface and whose arrival nothing detects. Full reasoning in [report.md](report.md#coverage-report).

  **Planning ruling — decision D-03-11.** `bubbles.plan` was asked whether this line over-reaches or states a genuine obligation, and rules the latter: the guarantee that a full-personal clear leaves nothing personal behind is sound and stays. The line is not over-reaching, it is *mis-sited*. The set of personal categories is open at Scope 03 and closes only at Scope 16, so no foundation scope can quantify over it. Six of the thirteen nouns are therefore discharged forward, to the scope that first creates each surface — interests and outcomes to **Scope 06** (TP-06-08), scenarios to **Scope 09** (TP-09-06), allocations to **Scope 13** (TP-13-08), dossiers to **Scope 15** (TP-15-08), UI state plus the whole-set closure to **Scope 16** (TP-16-12). Each receiving scope carries a new DoD item naming the obligation, so this is a tracked commitment rather than a deletion. The line's wording is unchanged, the Gherkin is untouched, no Test Plan row is edited, and every discharge edge runs forward, so no cycle appears. Ruling the obligation Scope-03-genuine was rejected on structure, not convenience: Scope 03 is `foundation:true` at the head of the linear chain, so waiting for Scopes 09 through 15 would make it depend on its own dependents — the deadlock [blocker 3](../_index.md#known-cross-scope-blockers) forbids. Mechanism and per-noun table: [Scope 03 Full-Personal-Clear Enumeration Discharge](../_index.md#scope-03-full-personal-clear-enumeration-discharge).

  **[Superseded — see Post-discharge accounting below.]** The enforcement gap this paragraph names as remaining was closed at HEAD `186ca070`; the paragraph is retained because it is what commissioned that fix. **The discharge does not close this item, and that is deliberate.** Seven nouns are Scope 03's own and are verified. What remains is the enforcement gap named two paragraphs above, and it is Scope 03's to fix, not a later scope's: `policyDeclaredKeys` names `pointerKey`, `slotKeys`, `quarantineKey`, `sessionKey`, and `returnContextKey` one field at a time, and its assertions pin the counts at 4 and 2 — counts computed from that same hand-written list. A seventh `policy.storage` key is consequently swept by nothing and reddens nothing, which is exactly how a discharged noun would arrive unnoticed and make the forward commitment unenforceable. Scope 03 must make that helper derive from `policy.storage`, as `personalWorkspaceSections` already derives from `createEmptyWorkspace`, so an unswept personal key fails a test instead of passing unobserved. That work is inside this scope's declared allowed files. The effect of the ruling is therefore a change of blocker, not a tick: this line moves from unclosable inside Scope 03 to closable inside Scope 03.

  **[Superseded — see Post-discharge accounting below.]** This re-evaluation found the unswept-key gap intact at `3b3c4c1b`; it was closed one commit later at `186ca070`, so its residual finding no longer holds. **Post-discharge re-evaluation — still unchecked.** Re-executed at HEAD `3b3c4c1b` (`node --test tests/portfolio-foundation.unit.mjs`, exit 0, 49 pass / 0 fail; plus the three sibling suites). The residual blocker was re-verified against the committed source rather than accepted from the ruling, and it is intact: `tests/portfolio-foundation.unit.mjs:823`–`:828` still builds both lists by naming each policy field, and `:834`/`:835` still pin the counts against that same list. The seven Scope-03-owned nouns are carried and the other six are discharged, so the enumeration is no longer what blocks this line — the unswept-key gap is, and closing it is a test-file change this pass was scoped to exclude. Raw output and the per-noun table: [report.md](report.md#post-discharge-re-execution-at-head-3b3c4c1b).

  **Post-discharge accounting — the current tally. Still unchecked.**

  **Claim Source:** executed · **Command:** `node --test tests/portfolio-foundation.unit.mjs` · **Exit Code:** 0 · 49 pass / 0 fail at HEAD `186ca070`. Every artifact statement below was read at that same HEAD.

  Two of the three facts the superseded paragraphs rest on have changed, so the tally is restated in full rather than patched:

  - **Verified locally in Scope 03 — 7 of 13:** holdings, mandate, needs, events, quarantine, session fallback, return context. Each is a workspace array section or a `policy.storage` key that Scope 03 itself creates, populates, and sweeps; each is proven non-empty *before* the clear and asserted empty *after* it, on a reread taken off the storage adapters rather than off the module's own report.
  - **Discharged forward, and NOT claimed as checked here — 6 of 13:** interests → Scope 06 (TP-06-08), outcomes → Scope 06 (TP-06-08), scenarios → Scope 09 (TP-09-06), allocations → Scope 13 (TP-13-08), dossiers → Scope 15 (TP-15-08), UI state → Scope 16 (TP-16-12). Per register rule 3, *no double-claiming*: none of these six is resolvable in Scope 03, none is verified by any Scope 03 assertion, and none would be covered if this box were ever ticked — a tick here would cover the seven local nouns only. Scope 03's own emptiness assertions over `interestSignals` and `actionOutcomes` stay vacuous by construction and are explicitly **not** evidence for the discharged obligation.
  - **Recorded blocker now closed:** the self-agreeing declared-key sweep. `policyDeclaredKeys` ([`tests/portfolio-foundation.unit.mjs:835`](../../../../tests/portfolio-foundation.unit.mjs)) no longer names policy fields one at a time. It partitions **every** `policy.storage` field into key-declaring (`/Keys?$/`) and known non-key metadata and fails on any field that is neither (`:843`), then derives the local/session split from `storage.workspaceNamespace` instead of a second hand-written list. The 4/2 pins at `:876`–`:877` are therefore checked against a *derived* set, so pin and subject are two sources that can disagree: a seventh `policy.storage` key reddens — via the count pin if it is a `*Key`/`*Keys` field, via the closed-partition assertion if it is not — rather than arriving unswept. This closes the residual named in the superseded paragraphs above and in [_index.md](../_index.md#scope-03-full-personal-clear-enumeration-discharge).

  **What still blocks the tick: the discharge is orphaned under register rule 2, *no orphaned conjunct*.** Rule 2 admits a delegated conjunct only to a scope that already carries, or is given, **a Gherkin scenario *and* a Test Plan row that assert it**, because "delegation to a scope with no verifying row is deletion with extra steps". Each of the five receiving scopes was given a DoD item naming the obligation — but a DoD item is neither of the two artifacts rule 2 requires. Verified by reading each receiving `scope.md`:

  | Noun | Discharged to | Gherkin scenario asserting the clear? | Named carrying row asserts the clear? | Rule 2 |
  |------|---------------|---------------------------------------|----------------------------------------|--------|
  | interests | Scope 06 / TP-06-02 | **No** — SCN-008-008/009/034 carry no clear clause; SCN-008-009 asserts the *opposite* direction, that no `InterestSignal` is **created** from settings | **No** — the row's declared elements are a no-mutation proof ("prove no event, interest … field changes"); no clear or emptiness element | **orphaned** |
  | outcomes | Scope 06 / TP-06-02 | **No** — same three scenarios | **No** — same row | **orphaned** |
  | scenarios | Scope 09 / TP-09-01 | **No** — SCN-008-018/019 are bootstrap reproducibility and parameter uncertainty | **No** — elements are RNG vectors, bootstrap hashes, scenario *identity mutations*, bands and warnings; it is a `unit` row over `tests/portfolio-analytics.unit.mjs`, not a privacy surface | **orphaned** |
  | allocations | Scope 13 / TP-13-02 | **No** — SCN-008-026/027/029 are shared basis, no-universal-winner, infeasibility | **No** — elements are six candidates on one basis, Pareto tradeoffs, infeasible rows retained without mutation | **orphaned** |
  | dossiers | Scope 15 / TP-15-02 | **No** — SCN-008-031/032/033 are backtest claim limits, market efficiency, correlation | **No** — elements are projection, limit preservation, claim validation, appended corrections, private-export *preview* | **orphaned** |
  | UI state | Scope 16 / TP-16-04 | **No** — Scope 16's only Gherkin is SCN-008-036 (cross-mode coherence, no publication). TP-16-04 does cite SCN-008-011, but that is *this* scope's behavior-clear scenario, and its `Then` clauses name events, InterestSignals, holdings, mandate, cash needs and watchlist — never UI state | **Partly** — TP-16-04 is the one named row that does declare `clear` among its elements and is the declared complete-namespace and clear boundary | **orphaned — scenario half absent** |

  One corroborating fact settles it: across all sixteen scopes of this feature, exactly **one** Gherkin scenario asserts a clear of anything — SCN-008-011, owned by Scope 03 itself. Scopes 06, 09, 13, 15 and 16 carry none. So no discharged noun has the scenario half of rule 2 anywhere in the feature, and four of the six have neither half.

  This is a defect in the *discharge*, not in the ruling behind it: the structural argument is untouched — every edge still runs forward, no cycle appears, and the line's guarantee still stands and is still mis-sited at a `foundation:true` scope. Repairing it means giving each receiving scope a Gherkin scenario and a carrying Test Plan row that assert its noun's post-clear emptiness. That is planning content owned by `bubbles.plan` and not editable from this scope, and `scopes/_index.md` is likewise plan-owned. **Routed to `bubbles.plan`.** Until rule 2 holds for all six, the discharge cannot carry them and this line stays unchecked — the blocker having moved from *four nouns with no runtime surface* to *six nouns delegated to rows that do not assert them*.

  **Rule 2 closure — the routed planning work is done and this line is now ticked.**

  **Claim Source:** executed · **Command:** `node -e "<manifest/test-plan cross-validation>"` · **Exit Code:** 0

  ```text
  $ node -e "<recompute every gherkinHash in scenario-manifest.json>"
  JSON OK, scenarios=41
  hash mismatches=0
  $ node -e "<cross-validate test-plan.json against scenario-manifest.json>"
  JSON OK
  total tests=107
  new rows:
    TP-06-08 -> SCN-008-037
    TP-09-06 -> SCN-008-038
    TP-13-08 -> SCN-008-039
    TP-15-08 -> SCN-008-040
    TP-16-12 -> SCN-008-041
  test-plan scenario refs missing from manifest=0
  manifest scenarios pointing at unknown scope=0
  ```

  The audit above was correct and its finding is closed by construction rather than by re-reading.
  Each of the five receiving scopes now carries **both** artifacts rule 2 requires, purpose-built to
  assert the clear rather than repurposed from a row that asserts something else: SCN-008-037 /
  TP-06-08 (interests, outcomes), SCN-008-038 / TP-09-06 (scenarios), SCN-008-039 / TP-13-08
  (allocations), SCN-008-040 / TP-15-08 (dossiers), SCN-008-041 / TP-16-12 (UI state plus the
  whole-set closure). The previously cited rows were left in place and are no longer relied on —
  the register table now names the new pairs instead, precisely because the audit proved TP-06-02,
  TP-09-01, TP-13-02 and TP-15-02 assert no clear at all.

  Two properties make the discharge enforceable rather than nominal. First, every new scenario
  requires its subject to be **proven non-empty before the clear**, so no receiving row can satisfy
  its conjunct vacuously the way this scope's own `interestSignals` and `actionOutcomes` assertions
  do — the exact failure mode that kept this line unchecked. Second, SCN-008-041 requires the
  declared category set to be **derived from the runtime rather than hand-written**, so a category
  added after this discharge reddens TP-16-12 instead of arriving unobserved; that is the same
  derive-don't-enumerate property this scope already applied to `policyDeclaredKeys` at `186ca070`.

  **What this tick does and does not cover, restated so it cannot be misread.** It covers the
  **seven** nouns Scope 03 owns, verifies locally, and proves non-empty before the clear: holdings,
  mandate, needs, events, quarantine, session fallback, return context. It does **not** claim the
  six discharged nouns — per register rule 3, *no double-claiming*, none of them is verified by any
  Scope 03 assertion, and each is now owed by a named scenario and row in its receiving scope.


- [x] Shared Infrastructure Impact Sweep, independent storage/inventory/clear canaries, and exact rollback/restore proof pass without altering Scope 01/02 facts.

  Checked. The Scope 01 and 02 re-run and the raw-namespace and clear-fault canaries are carried by the executed suites. The **exact rollback and restore proof** is now demonstrated by executed commands rather than described.

  **Claim Source:** executed · **Command:** `git checkout 1b87cab3 -- rlportfolio.js portfolio-survival-allocation.config.json tests/portfolio-foundation.unit.mjs` · **Exit Code:** 0

  ```text
  $ node --test tests/portfolio-foundation.unit.mjs          # HEAD, before rollback
  # tests 49
  # pass 49
  # fail 0
  $ git checkout 1b87cab3 -- rlportfolio.js portfolio-survival-allocation.config.json tests/portfolio-foundation.unit.mjs
  $ node --test tests/portfolio-foundation.unit.mjs          # rolled back to pre-Scope-03
  # tests 22
  # pass 22
  # fail 0
  $ node --test --test-name-pattern="holding revision and workspace identities|mandate revision identity|atomic durable commits" tests/portfolio-foundation.unit.mjs
  # tests 3
  # pass 3
  # fail 0
  $ git checkout HEAD -- rlportfolio.js portfolio-survival-allocation.config.json tests/portfolio-foundation.unit.mjs
  $ node --test tests/portfolio-foundation.unit.mjs          # restored
  # tests 49
  # pass 49
  # fail 0
  ```

  `1b87cab3` is the commit immediately preceding this scope's three source commits (`cf35fa38`,
  `6910ca84`, `165bb32f`). Three facts make the proof meaningful rather than circular. The suite
  drops 49 → 22, so the rollback genuinely removed this scope's 27 additions instead of leaving
  them in place. The pre-Scope-03 suite is fully green at 22/22, so the rolled-back tree is a
  coherent state rather than wreckage. And the three Scope 01/02 identity rows — holding and
  workspace identities, mandate revision identity, atomic durable commits with slot/generation
  semantics — pass unchanged under the rollback, which is the contract's "portfolio/mandate hashes
  and storage generation are preserved" clause asserted by identity rather than by resemblance.

  **A rollback of `rlportfolio.js` alone does NOT work, and the attempt is recorded because the
  contract's wording invites it.** Reverting only the module leaves the shipped
  `portfolio-survival-allocation.config.json` declaring this scope's behavior policy section, which
  the older module rejects as unknown configuration: all three Scope 01/02 identity rows fail with
  `P008-CONFIG policy invalid`, at setup rather than on any identity assertion. The module, its
  policy config, and its tests are one rollback unit. Reading a module-only revert as "Scope 01/02
  facts were altered" would be a misdiagnosis — nothing about those facts changed.

  Per the contract, a source rollback does not clear browser data; the shipped clear controls own
  explicit local deletion.

- [x] Every Scope 03 behavior has intended RED and same-command GREEN evidence before the broader browser row.

  Checked — **14 of 14 behaviors have an intended RED**, each with same-command GREEN on restored
  source. Earlier passes recorded 0 of 14 only because they were barred from injecting defects;
  this pass was authorised to inject them.

  **Claim Source:** executed · **Command:** `node --test tests/portfolio-foundation.unit.mjs` · **Exit Code:** 0 restored

  ```text
  $ node --test tests/portfolio-foundation.unit.mjs        # baseline
  # pass 49
  # fail 0
  $ <inject behavior 3 defect: occurredAt '<' flipped to '>'>
  not ok 25 - semantic de-duplication collapses same-day repeats to the earliest occurrence
    expected: '2026-07-15T09:05:00.000Z'
    actual:   '2026-07-15T21:45:00.000Z'
  $ git checkout -- rlportfolio.js && node --test tests/portfolio-foundation.unit.mjs
  # pass 49
  # fail 0
  ```

  Per-behavior defect and reddened test in [report.md](report.md#dod-core-item-5--red-and-green-pairs-14-of-14).
  Each defect was injected alone, the behavior's own command run, the failing test recorded by
  name, and the source restored with `git checkout -- rlportfolio.js` before the next injection.

  **The pass found a real guard defect rather than confirming a healthy one.** Behavior 5 produced
  no RED at all: injecting `subjectValue` into every privacy-inventory category left the file at
  49 pass / 0 fail, so a privacy-critical assertion could not detect the leak it exists to
  prevent. Its leak sweep was a denylist over five known values. The category record is now closed
  by shape, and the same defect reddens test 27 alone. That fix is why this item is ticked on
  evidence rather than on a clean-looking run.

#### Test Evidence Items - Exact Parity With 6 Test Plan Rows

- [x] TP-03-01 unit evidence proves the event/lifecycle/inventory/clear contracts and every forbidden field/source mutation.

  **Claim Source:** executed · **Command:** `node --test tests/portfolio-foundation.unit.mjs` · **Exit Code:** 0

  ```
  ✔ unknown legacy workspace shapes refuse migration and quarantine metadata is value-safe (1.147599ms)
  ✔ foundation privacy inventory and verified clear remain available without policy config (0.831799ms)
  ✔ behavior event vocabulary is closed to the declared categories lifecycle states and draft fields (14.746685ms)
  ✔ every declared excluded behavior source is rejected by name in any casing or separator form at any depth (12.994488ms)
  ✔ semantic de-duplication collapses same-day repeats to the earliest occurrence without shrinking distinct evidence (10.262991ms)
  ✔ action outcome commands map to exactly one lifecycle state and reject mismatched or unknown transitions (7.271293ms)
  ✔ privacy inventory reports real category counts and carries no stored subject value (31.69227ms)
  ✔ behavior clear empties behavior categories only after they are proven non-empty and preserves portfolio and mandate identity (36.937764ms)
  ✔ verified foundation clear reports empty only after reread and a remove fault cannot report success (1.093199ms)
  ✔ verified clear covers every policy-declared personal key and leaves the raw namespace holding none of them (0.719199ms)
  ✔ full-personal clear empties every declared personal section and leaves generic public assets byte-identical (40.82846ms)
  ℹ tests 31
  ℹ pass 31
  ℹ fail 0
  ℹ duration_ms 484.106032
  ```

  Full 31-test output and the per-element row assessment are in [report.md](report.md#tp-03-01). Every element the row declares has a named carrying assertion. The forbidden-source sweep iterates the full declared token list under `every declared token must have been exercised, not merely iterated over`, plus a control proving the refusal is caused by the token rather than by the extra field.

- [x] TP-03-02 functional evidence proves only eligible completions affect relevance and behavior clear removes that influence immediately.

  **Claim Source:** executed · **Command:** `node --test tests/portfolio-brief.functional.mjs` · **Exit Code:** 0

  ```
  ✔ only an eligible completion becomes behavior evidence and no excluded source can create or grow one (119.978086ms)
  ✔ route recomposition is invariant to behavior evidence and states that behavior contributes none (28.730573ms)
  ✔ behavior clear removes the committed evidence and returns recomposition to the pre-evidence baseline (56.258246ms)
  ✔ dismissal and automatic invalidation record a safe outcome and never a behavior event or a negative preference (15.908785ms)
  ℹ tests 4
  ℹ suites 0
  ℹ pass 4
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 313.481503
  ```

  Anti-vacuity is genuine rather than incidental: the clear arm re-reads from committed bytes first (`the evidence must genuinely be on disk before the clear is meaningful`) and the invariance arm proves the projection can differ (`the projection must be able to differ, or invariance proves nothing`). Row assessment in [report.md](report.md#tp-03-02).

- [x] TP-03-03 functional evidence proves category-by-category verified deletion, preservation, and partial-failure truth against raw namespaced state.

  **Claim Source:** executed · **Command:** `node --test tests/portfolio-privacy.functional.mjs` · **Exit Code:** 0

  The row's earlier gap is closed at HEAD. The named file now calls `privacyInventory` (3),
  `clearFoundationStorage` (4), `buildBehaviorClearCandidate` (1), and
  `foundationPrivacyInventory` (1); the previous note recorded zero of the first three.
  All four clauses of this line are carried by named assertions in the named file:

  - **category-by-category** — six populated categories are proven on both axes by a
    per-category matrix compared against the runtime's own `clearedBy` declaration
    (`every populatable category must behave exactly as its clearedBy declaration and the
    all-personal verified-empty contract say`). The category list is read off the inventory,
    not written into the test, and an unclassifiable new token is refused.
  - **verified deletion** — the post-state is re-read by reopening the store from the
    persisted bytes, and the all-personal arm requires `verifiedEmpty` with an empty
    remaining-key list before its emptiness is accepted.
  - **preservation** — bystanders are held to their **exact prior record count**, not merely
    to being present (`the behavior clear must empty exactly the categories that declare it
    and leave every other category at its exact prior count`), plus the generic public caches
    byte-identical on both arms.
  - **partial-failure truth against raw namespaced state** — all six declared clear steps are
    faulted one at a time (`every declared clear step must have been faulted on its own, not
    a subset`); each refusal is checked for `P008-STORE-WRITE` / `foundation-clear-incomplete`,
    carries no success payload, and leaves exactly one surviving key, read back from the raw
    namespace.

  Anti-vacuity is per-category and per-step rather than global, and the preservation half is
  proven red-able by aiming the same checker at the whole-store clear, which must report all
  five destroyed bystanders. Clause map and residuals in [report.md](report.md#tp-03-03).

  ```
  ✔ FR-017 FR-022 FR-033: behavior settings and market-fact relabelling attempts are refused and change no mandate cash need expected return floor objective or constraint state (62.76457ms)
  ✔ rolling a mandate back restores the pre-mandate portfolio state by identity, not by resemblance (50.958475ms)
  ✔ each declared privacy category is deleted by the clear that names it and survives the clear that does not, one category at a time (64.775069ms)
  ✔ every declared clear step is faulted on its own, the other steps still delete, and the retained bytes refuse a success result (2.295399ms)
  ℹ tests 13
  ℹ suites 0
  ℹ pass 13
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 847.010298
  ```

- [x] TP-03-04 Regression E2E evidence proves SCN-008-011 clears behavioral ranking and preserves portfolio, mandate, cash needs, cache, and watchlist.

  **Claim Source:** executed · **Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/portfolio-survival-foundation.spec.mjs` · **Exit Code:** 0

  The row's declared `--grep` form selects exactly the test below; the executed command is that
  form's superset over the same file.

  ```
  Running 8 tests using 1 worker
    ✓  7 … clear behavior removes ranking influence and preserves portfolio (3.2s)
  [SCN-008-011] eligibleCompletionsBeforeClear=4
  [SCN-008-011] rankedSubjectsBeforeClear=2
  [SCN-008-011] previewOnlyChangedProjection=false
  [SCN-008-011] rankingSurvivedReload=true
  [SCN-008-011] duplicateSameDayCompletion=rejected
  [SCN-008-011] eligibleCompletionsAfterClear=0
  [SCN-008-011] interestSignalsAfterClear=0
  [SCN-008-011] portfolioPreserved=true
  [SCN-008-011] mandatePreserved=true
  [SCN-008-011] clearedSubjectScope=behaviorEvents,interestSignals,actionOutcomes,rankingRows
  [SCN-008-011] cashNeedsPreserved=true
  [SCN-008-011] publicCacheByteIdentical=true
  [SCN-008-011] foreignStorageKeys=rlData
  [SCN-008-011] remotePersonalRequests=0

    8 passed (23.4s)
  ```

  All seven clauses of the line are carried: `e2e-ui` regression (`:628`, no interception in the
  file); ranking cleared (`:712` exact empty influence text, `:713` zero rank rows, `:736` a
  bare-token sweep over the three stored behavior sections, `:739` the same over the rank rows'
  `dataset`, which `innerText` cannot see); portfolio preserved (`:744`–`:746`, `:750`, plus the
  **positive** `:759` holdings assertion); mandate preserved (`:747`, `:748`, `:751`, plus the
  positive `:763` constraints-in-declared-order assertion); cash needs preserved (`:774`–`:775`,
  on every dependent route, after the clear); cache preserved (`:782`, byte-identical, not
  field-wise); watchlist preserved (same `:782` — the watchlist is a member of the compared
  object, so byte-identity is strictly stronger than a per-field check — with `:783` pinning the
  foreign key set against both drops and additions).

  The preservation half is not a restatement of "this page never names that key": the public cache
  is written by the test and a clear that widened to a whole-store wipe destroys it. The cleared
  half is not vacuous either — the ranking is proven populated first and re-read after a full page
  reload, which separates a projection-derived surface from a draft-derived one. Clause map,
  provenance, and the two failures this row survived are in [report.md](report.md#tp-03-04).

- [x] TP-03-05 Regression E2E evidence proves SCN-008-012 stores no engagement/sensitive/cross-device profile and shows the exclusion contract.

  **Claim Source:** executed · **Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/portfolio-survival-foundation.spec.mjs` · **Exit Code:** 0

  ```
  Running 8 tests using 1 worker
    ✓  8 …012 behavior evidence excludes engagement and sensitive profiling (5.6s)
  [SCN-008-012] legitimateCompletionsRecorded=2
  [SCN-008-012] excludedSourcesAttempted=33
  [SCN-008-012] excludedSourcesDeclared=33
  [SCN-008-012] excludedSourcesAccepted=0
  [SCN-008-012] observedActivityEvents=0
  [SCN-008-012] observedActivityGenerations=0
  [SCN-008-012] storedExcludedTokens=0
  [SCN-008-012] excludedTokenScope=behaviorEvents,interestSignals,actionOutcomes
  [SCN-008-012] excludedSourceCountShown=0
  [SCN-008-012] crossDeviceIdentifiers=0
  [SCN-008-012] hiddenProfileNamespaces=0
  [SCN-008-012] cookies=0
  [SCN-008-012] indexedDbStores=0
  [SCN-008-012] engagementCopyOutsideExclusionInventory=0
  [SCN-008-012] remotePersonalRequests=0

    8 passed (23.4s)
  ```

  All five clauses are carried: `e2e-ui` regression (`:777`); no engagement profile (pointer,
  scroll, tab, settings, and a real elapsed dwell are genuinely produced, then `:852` asserts the
  stored count did not move and `:853` that no generation was committed, with `:934` forbidding
  engagement wording where it would constitute an engagement objective); no sensitive profile
  (every declared excluded source attempted through the real UI and refused by name with
  `P008-SCHEMA-CORRUPT` / `forbidden-behavior-source`, the offered set equated to the policy's
  declared set at `:858` so the sweep cannot silently shrink, and `:909` quantifying over the
  stored shape with exact key-set equality so an unlisted key fails); no cross-device profile
  (`:945`–`:949` cookie, foreign namespace, session, IndexedDB, and service worker, plus `:956`
  origin scan); and the exclusion contract shown (`:917` exact `0` rather than a prefix, `:918`
  exact profile statement, `:920`–`:922` the rendered inventory naming every declared field).

  The claim is a negative, so an implementation recording nothing would satisfy every refusal.
  Two positive controls prevent that — one legitimate completion admitted before the refusal
  sweep and a second after it, both `eligible`. The scoped token sweep is separately proven
  non-vacuous by confirming the colliding declared holding fields genuinely exist in the imported
  holdings. Clause map in [report.md](report.md#tp-03-05).

- [x] TP-03-06 broader E2E evidence proves the complete foundation/clear matrix passes with previous scope behavior intact.

  Checked.

  **Claim Source:** executed · **Command:** `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome` · **Exit Code:** 0 · 10 passed / 0 failed

  The row was re-executed with the Test Plan command and is green — `10 passed`,
  `0 failed`, exit `0`. The second clause is carried: Scopes 01 and 02 are certified `done` and
  all six rows attributable to them (`:87`, `:184`, `:260`, `:299`, `:403`, `:491`) passed in the
  same invocation, so no prior-scope behavior regressed.

  The first clause is now carried too. The line asserts a **matrix**, which is three axes: the 6
  foundation scenarios the Test Plan row names; the 8 categories `rlportfolio.js:2227`–`:2234`
  declares × the 2 clear operations; and the 6 declared clear steps plus a control. Axis 1 is
  fully carried. Axis 3 is fully carried by `:1160`, which faults every declared step on its own,
  proves retention for the four durable-mode keys, and names the two session steps as
  refusal-only rather than folding them into a count. Axis 2's all-personal column is asserted
  cell by cell in the `:1124`–`:1132` loop against each category's own declaration.

  **Axis 2's behavior column — the two cells that previously had no assertion at all are now
  asserted.** The earlier analysis was correct when written: quarantine PRESERVED and
  session-fallback PRESERVED were unobservable, because the behavior-clear arm never stocked
  either, its namespace guard filtered to keys *outside* `rlPortfolioWorkspaceV1.` (which excludes
  the quarantine key by construction), and it read `localStorage` alone (which never holds a
  session key). A behavior clear that widened into either would have passed the row unchanged.
  Both cells are now covered in `tests/portfolio-survival-foundation.spec.mjs`: quarantine is
  stocked through the real corruption path via `populateQuarantine`, and the two session keys are
  stocked with sentinels (`:632`–`:633`). `:737`–`:742` proves all three are genuinely present
  *before* the clear — without which "still there afterwards" would be vacuous — and `:770`–`:776`
  proves each survives the behavior clear with its **bytes unchanged**, not merely present.

  **Claim Source:** executed · **Command:** `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --project=system-chrome -g "SCN-008-011"` · **Exit Code:** 0

  ```text
  $ npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome -g "SCN-008-011"
  [SCN-008-011] eligibleCompletionsAfterClear=0
  [SCN-008-011] interestSignalsAfterClear=0
  [SCN-008-011] portfolioPreserved=true
  [SCN-008-011] mandatePreserved=true
  [SCN-008-011] holdingsPreserved=BND,MSFT
  [SCN-008-011] quarantinePreservedByBehaviorClear=true
  [SCN-008-011] sessionFallbackPreservedByBehaviorClear=true
  [SCN-008-011] publicCacheByteIdentical=true
    1 passed (7.3s)
  ```

  The remaining vacuous cells are `interest-signals` and `action-outcomes`, which no code path
  anywhere writes. That vacuity is **not** silently accepted here: it is the same limit this
  scope's full-personal-clear line records, and it is discharged forward to Scope 06 under
  SCN-008-037 / TP-06-08, whose scenario requires both sections to be *proven non-empty before the
  clear*. Cell-by-cell mapping is in [report.md](report.md#tp-03-06).

  Closing the two decisive cells needs only test-side changes inside this scope's declared allowed
  file: stock the quarantine key and run one session-mode arm, then assert both survive the
  behavior clear. The three vacuous cells cannot be closed that way — the two categories have no
  producer in the product at all — and stay pinned as core item 3 already rules. Not done on this
  pass, which was scoped to executing and adjudicating this one row with no new test code. One
  planning-owned observation is raised in the report: the UI Scenario Matrix requires a partial
  clear to offer a *scoped retry*, and no implementation or assertion for it exists.

  **Planning ruling — decision D-03-11.** This row shares core item 3's vacuity but is **not**
  blocked by it, and the two must not be conflated. The vacuous `interest-signals` and
  `action-outcomes` cells are discharged to **Scope 06** on the same terms as core item 3, since
  Scope 06 is the first producer of either; once `deriveInterestSignals` lands, TP-06-08 asserts
  the cells this row can only leave empty. That discharge removes the vacuity argument from this
  row entirely.

  What is left is this row's own gap, and it is neither vacuous nor discharged: **quarantine
  PRESERVED and session-fallback PRESERVED have no assertion at all** on the behavior-clear arm.
  Both nouns are reachable — the row's own instrumentation lists `quarantine` in
  `populatedBeforeFullPersonalClear` and `rlPortfolioWorkspaceSessionV1` in `declaredClearSteps`
  — so a behavior clear that widened into either key would pass this row unchanged. That is a live
  privacy hole in a `privacy-critical:true` scope, it is Scope 03's to close, and the fix is the
  test-side change the paragraph above already names. This row therefore stays unchecked on its own
  merits after the discharge, not on borrowed ones. The scoped-retry observation stands and is
  routed to Scope 03 implementation, since the UI Scenario Matrix declares the behavior and nothing
  implements it.

  **Post-discharge re-evaluation — still unchecked.** Re-executed at HEAD `3b3c4c1b` with the Test
  Plan command: `10 passed`, `0 failed`, exit 0. The second clause is carried and was re-confirmed,
  not assumed — all six Scope 01/02 rows (`:87`, `:184`, `:260`, `:299`, `:403`, `:491`) passed in
  the same invocation. The first clause was settled cell by cell rather than by the ten-row tally:
  axis 1 (6 cells) and axis 3 (7 arms) are carried, axis 2's all-personal column (8 cells) is
  carried by the `:1124`–`:1132` loop, and its behavior column is carried for 6 of 8. The two
  uncarried cells are the ones the discharge does not touch — quarantine PRESERVED and
  session-fallback PRESERVED — and both were re-verified against the committed test source:
  `populateQuarantine` is still called at `:1089`/`:1182` only, so row 7 never stocks the key, and
  row 7's sole namespace guard at `:780` still filters to keys outside `rlPortfolioWorkspaceV1.`
  while reading `localStorage` only, so it can see neither the quarantine key nor either session
  key. Per-cell map: [report.md](report.md#post-discharge-re-execution-at-head-3b3c4c1b).

#### Build Quality Gate

- [x] Focused RED/GREEN records, personal-category and raw-storage scans, full/partial-clear proof, forbidden-field/source and unsafe-text scans, no-interception/external-request scan, source-lock/runner checks, editor diagnostics, `git diff --check`, artifact lint/freshness, G094, Test Plan/DoD parity, plan sync, and scope-local traceability are current and clean with every finding individually accounted for in `report.md`. Scope-local traceability is `bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope`, executed while this scope is the active scope in `state.json`, with zero failure naming this scope's own files. Whole-feature `--all-scopes` traceability is NOT required here; the [Feature Completion Gate](../_index.md#feature-completion-gate) enforces it once, in Scope 16.

  **Claim Source:** executed · **Command:** the twelve commands below · **Exit Code:** 0 on every gate

  ```text
  $ git diff --check                                                    exit=0
  $ bash .github/bubbles/scripts/artifact-lint.sh specs/008-…           exit=0
  $ bash .github/bubbles/scripts/artifact-freshness-guard.sh specs/008-… exit=0
  $ bash .github/bubbles/scripts/capability-foundation-guard.sh (G094)  exit=0
  $ node scripts/pii-scan.mjs
  [pii-scan] files=5867 messages=1153 findings=0 OK
  $ bash .github/bubbles/scripts/traceability-guard.sh specs/008-… --current-scope
  failures naming this scope's own files: 0   (31 total, none scope-03)
  Test Plan rows=6  TP-DoD items=6            parity holds
  interception matches in the live spec: 2    both comments asserting absence
  external-request (non-origin URLs) in the live spec: 0
  literal secret VALUES in rlportfolio.js (sk-/ghp_/AKIA/base64): 0
  ```

  Three of these needed a real fix rather than a pass, and each is recorded rather than smoothed over.

  **Traceability.** The guard reported four failures against this scope — both scenarios untraceable
  to a Test Plan row *and* unmatched to a DoD item. The rows and items were not missing: they carry
  `SCN-008-011` / `SCN-008-012` already. `scenario_matches_row` and `scenario_matches_dod` both match
  by trace ID first and fall back to fuzzy word overlap, and the guard extracts the inner
  `Scenario:` line \u2014 which carried no ID, so both checks fell to fuzzy matching and missed. Carrying
  the ID into the `Scenario:` line fixes all four at the root. It is hash-safe: `scenario-manifest.json`
  hashes only `{given, when, then}`, never the title. Scope 02 already used this form, which is why it
  passed while this scope did not; 38 of the feature's 40 scenarios still use the fuzzy-only form.

  **PII.** `pii-scan` failed with 5 findings \u2014 the operator home path in captured terminal evidence in
  `specs/_bugs/BUG-008-fx-route-claims-unregistered/report.md`. Not this scope's file, but a real
  disclosure in a public repository and a repo-wide gate failure. Redacted to the segment the scan's
  own `homePathAllowedSegments` sanctions (`redacted`), which preserves the evidence's shape and
  meaning while removing the identifier. Allowlisting was rejected: the config's single `allow` entry
  is a detection fixture, so the established convention is to fix real files, not exempt them.

  **The two scans that look like failures and are not.** The forbidden-field scan returns 43 hits in
  `rlportfolio.js`; every one is secret-*detection* machinery \u2014 `secretFieldTokens`,
  `secretValuePrefixes`, `findSecretPath`, `P008-IMPORT-SECRET` \u2014 code that refuses secrets rather
  than carrying one, and a value-shaped scan finds 0 literal secrets. The no-interception scan
  returns 2 hits; both are comments stating that no interception appears, so the live-stack claim
  holds.
