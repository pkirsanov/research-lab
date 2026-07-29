# Scope 11: Registry registration

**Status:** Not Started
**Depends On:** Scope 1 (`01-foundation-contracts-and-publication`), Scope 2 (`02-fail-closed-typed-transport`), Scope 3 (`03-applicability-and-consumer-authority`), Scope 4 (`04-consumption-ledger-and-type-dispatch`), Scope 5 (`05-prospective-baseline-comparison`), Scope 6 (`06-provenance-by-recomputation`), Scope 7 (`07-lab-surface-simple-power-mobile`), Scope 8 (`08-brief-and-journey-context`)
**Tags:** `closure:true`

**Primary Outcome:**
014 becomes discoverable. This is the **only** scope that touches the five counted registries — `tools.json`,
`index.html` `TOOLS`, `rlnav.js` `TOOLS`, `simple-models.json`, and `journeys.json` — plus 014's Simple-model adapter
registered **inside the existing `rlexperience-adapters/market-structure.js` module** (the chosen default from
`design.md` → *Adapter-allowlist decision*; the allowlist itself is a Protected Surface and is not widened). It runs
**last**, it runs **isolated**, and it is **strictly serialised after Feature 013 SCOPE-5 lands on the mainline**. The
asserted counts in `scripts/validate-tool-experience.mjs` are **re-read at execution time and incremented from the
then-current values** — never hardcoded forward from a number recorded during planning. Registration lands as one
scope and one commit, and reverts as one revert of that same commit, because a partial revert of the registration
group leaves the counts inconsistent and fails the validator.

**Serialisation condition (binding).** Feature 013 SCOPE-5 already moves the same counted registries in lockstep and
is in flight in a separate session. This scope **may not be scheduled in parallel with 013 SCOPE-5 and may not be
started on the assumption that 013's counts are final.** It begins only after 013 SCOPE-5 has landed on the
mainline. Until it runs, 014 ships **unregistered**: the lab page is reachable by direct URL, validated by
`node scripts/validate-shared-cycle-exchange.mjs`, and `node scripts/validate-tool-experience.mjs` stays green
against the unchanged counts throughout — 014 cannot break 013's validator by existing.

**Counts are re-read, never carried forward.** The values recorded in `design.md` at authoring time —
**22 ordinary tools, 4 Market Action Center goals, 48 total goals, 48 journey definitions** — are a snapshot of the
pre-013-SCOPE-5 repository, not a target. This scope reads the then-current asserted values from
`scripts/validate-tool-experience.mjs` at execution time and increments from those. Writing an incremented number
now, against an in-flight 013, is how both features end up wrong.

---

## Business Scenarios owned

**None.** Per the `_index.md` Business-Scenario ownership map, this scope owns **zero** of `BS-014-001` …
`BS-014-035`: it is registry wiring and originates no business scenario. It also owns **zero** refusal codes per the
`_index.md` refusal-code ownership map, and mints none. Every user-visible behaviour it exposes was already
specified, implemented, and proven by Scopes 1 through 8; this scope changes discoverability only, and changes no
behaviour of the surfaces it registers.

---

## Implementation Plan

1. **Confirm the serialisation precondition before any edit.** Verify that Feature 013 SCOPE-5 has landed on the
   mainline. If it has not, this scope does not start. This is a gate, not a preference.
2. **Re-read the then-current asserted counts** in `scripts/validate-tool-experience.mjs` — ordinary tools, Market
   Action Center goals, total goals, journey definitions — and record the four observed values as the base for the
   increment. No planning-time number is carried into the edit.
3. **Register the tool in `tools.json`** with 014's id, its declared `experience.viewIds`, and its metadata, matching
   the shape of the existing entries.
4. **Register the tool in the `index.html` `TOOLS` array** so the landing page lists it.
5. **Register the tool in the `rlnav.js` `TOOLS` array** so the shared nav lists it. Nothing else in `rlnav.js` is
   touched — the rest of that file is a Protected Surface.
6. **Register 014's Simple-model adapter definition in `simple-models.json`**, with the adapter implementation added
   **inside the existing `rlexperience-adapters/market-structure.js` module** per `design.md` → *Adapter-allowlist
   decision* and its Rollout reversal row 9. `tool-experience.config.json` `adapterPolicy.moduleAllowlist` is a
   Protected Surface and is **not** widened; the alternative — a new `rlexperience-adapters/cycle-exchange.js`
   module — is recorded as **OQ-2** and requires a routed amendment and owner sign-off before any code is written.
7. **Register 014's journey definitions in `journeys.json`**, referencing the guided cycle step that Scope 8
   established in `rljourney.js`. The definition and the step revert together.
8. **Increment the four assertions in step 2 from the re-read base** so
   `node scripts/validate-tool-experience.mjs` is green against the post-registration reality.
9. **Land the whole registration as one commit** so the atomic revert path in `design.md` → *Rollout And
   Reversibility* (reversal rows 6–10, plus the paired adapter and journey-step rows) is a single-commit revert.
10. **Record the registration and the observed pre-registration counts in `notes/shared-cycle-exchange.md`** so the
    revert target is documented as a fact rather than reconstructed later.

---

### Test Plan

Every row runs **after** registration lands and **after** Feature 013 SCOPE-5 is on the mainline. The count row
asserts the validator is green against the counts observed and incremented at execution time, not against any number
written during planning. No Playwright row contains an early-exit bailout: every required assertion is a direct
`expect(locator).toBeVisible()` or a direct count assertion with no escape path, and no row returns early on a URL
check or a missing element.

| Test Type | ID | Category | Scenarios | File/Location | What it proves | Command | Live System |
|---|---|---|---|---|---|---|---|
| Tool validator | T-11-V1 | tool validator | — | `scripts/validate-tool-experience.mjs` | The experience validator is green after registration, with all four assertions — ordinary tools, Market Action Center goals, total goals, journey definitions — incremented from the values re-read at execution time. The row records the observed pre-registration values alongside the post-registration values, so a forward-hardcoded count is visible as a mismatch rather than absorbed. | `node scripts/validate-tool-experience.mjs` | No |
| Project check | T-11-S1 | project check | — | `scripts/selftest.mjs` (unmodified by this scope) | The repo self-test is green after all five registries and the adapter change land, proving registration introduces no repo-check regression and alters no other feature's registration. | `node scripts/selftest.mjs` | No |
| E2E UI | T-11-P1 | `e2e-ui` | — | `tests/shared-cycle-exchange.spec.mjs` | The 014 tool is reachable **without** a direct URL: it appears in the landing page tool list and in the shared nav, and navigating from the landing entry loads the lab with its Simple cockpit rendered, asserted by direct `expect(locator).toBeVisible()`. The row navigates by clicking the registered entry rather than by visiting the page path, so a registration that lists the tool without wiring its route fails. | `npx --no-install playwright test tests/shared-cycle-exchange.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes |
| E2E UI | T-11-P2 | `e2e-ui` | — | `tests/shared-cycle-exchange.spec.mjs` | The registered Simple-model adapter drives the 014 Simple cockpit through the experience layer, and 014's registered journey definition opens its guided cycle step. The row asserts the adapter-rendered region is populated and that the journey step renders its refusal or its context with a named state — never blank and never a spinner — so a registered-but-unbound adapter fails. | `npx --no-install playwright test tests/shared-cycle-exchange.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes |
| Integration | T-11-I1 | `integration` | — | `tests/shared-cycle-exchange.integration.mjs` | The registration group is atomic. Reverting the single registration commit returns all five registries and the adapter to their pre-014 values and leaves `validate-tool-experience.mjs` green at the observed pre-014 counts. The adversarial half applies a **partial** revert — five of the six surfaces — and asserts the validator **fails**, proving the atomicity rule is enforced by the validator rather than merely stated in prose. | `node --test tests/shared-cycle-exchange.integration.mjs` | No |
| Tool validator | T-11-V2 | tool validator | — | `scripts/validate-shared-cycle-exchange.mjs` | 014's own validator remains green after registration, proving discoverability changed and behaviour did not. | `node scripts/validate-shared-cycle-exchange.mjs` | No |

**Test Plan rows: 6.**

---

### Definition of Done

#### Core items

- [ ] **Feature 013 SCOPE-5 has landed on the mainline before this scope starts.** This scope is strictly serialised after it, may not be scheduled in parallel with it, and may not be started on the assumption that 013's counts are final.
- [ ] **The four asserted counts were re-read from `scripts/validate-tool-experience.mjs` at execution time and incremented from the observed values.** The planning-time snapshot — 22 ordinary tools, 4 Market Action Center goals, 48 total goals, 48 journey definitions — was used as a description of the pre-013-SCOPE-5 repository and never as a target, and no incremented value was carried forward from planning.
- [ ] The observed pre-registration counts are recorded in `notes/shared-cycle-exchange.md` so the revert target is a documented fact.
- [ ] This scope is the **only** scope that touched `tools.json`, `index.html` `TOOLS`, `rlnav.js` `TOOLS`, `simple-models.json`, or `journeys.json`.
- [ ] Nothing in `rlnav.js` outside its `TOOLS` array entry was changed.
- [ ] 014's Simple-model adapter is registered inside the existing `rlexperience-adapters/market-structure.js` module, and `tool-experience.config.json` `adapterPolicy.moduleAllowlist` was **not** widened. The alternative module remains **OQ-2**, requiring a routed amendment and owner sign-off before any code is written.
- [ ] 014's journey definitions in `journeys.json` reference the guided cycle step Scope 8 established in `rljourney.js`, and the two are recorded as a paired revert.
- [ ] `node scripts/validate-tool-experience.mjs` is green after registration.
- [ ] **Registration landed as one scope and one commit**, so the atomic revert path in `design.md` → *Rollout And Reversibility* is a single-commit revert covering reversal rows 6–10 plus the paired adapter and journey-step rows. **Reverting the registration group is all-or-nothing:** it reverts as one revert of that same commit and never file-by-file, because a partial revert leaves the counts inconsistent and fails `scripts/validate-tool-experience.mjs`. Reversal rows 1–5 remain individually safe and need no coordination.
- [ ] Reversal to R-1 remains available: reverting this commit leaves `rlcycx.js`, the lab page, the universe file, the validator, and the full test suite in place, reachable by direct URL and green under `node scripts/validate-shared-cycle-exchange.mjs`.
- [ ] This scope owns zero business scenarios and zero refusal codes per the `_index.md` ownership maps, mints none, and changes no behaviour of the surfaces it registers.
- [ ] Every file this scope touches — `tools.json`, `index.html`, `rlnav.js`, `simple-models.json`, `journeys.json`, `rlexperience-adapters/market-structure.js`, `notes/shared-cycle-exchange.md`, `tests/shared-cycle-exchange.integration.mjs`, `tests/shared-cycle-exchange.spec.mjs` — is sanctioned by `design.md`: the five registries by `### Files 014 MAY MODIFY`, the adapter module by *Adapter-allowlist decision* and Rollout reversal row 9, and the remainder by `### Files 014 MAY CREATE`. No Protected Surface is opened as a change target.
- [ ] **Feature 013 interaction:** this scope opens the five registries Feature 013 SCOPE-5 also moves, which is precisely why it is serialised strictly after 013 SCOPE-5 lands on the mainline and re-reads the then-current counts. It touches no other 013-owned file — not `rlratio.js`, `ratio-pairs.json`, `rlregime.js`, `regime-archetypes.json`, `market-regime-lab.html`, or 013's regime owner-read adapter in `scripts/brief-refresh.mjs` — and it does not reopen `rldata.js`.

#### Test items

- [ ] T-11-V1 passes: `node scripts/validate-tool-experience.mjs` is green with all four assertions incremented from execution-time re-read values, and both the observed pre- and post-registration counts are recorded → evidence recorded in `report.md`.
- [ ] T-11-S1 passes: `node scripts/selftest.mjs` is green after registration → evidence recorded in `report.md`.
- [ ] T-11-P1 passes: the tool is reachable by clicking its landing-page and nav entries without a direct URL, and the lab loads with its Simple cockpit rendered → evidence recorded in `report.md`.
- [ ] T-11-P2 passes: the registered Simple-model adapter populates the Simple cockpit through the experience layer and the registered journey definition opens its guided cycle step with a named state → evidence recorded in `report.md`.
- [ ] T-11-I1 passes: a full single-commit revert restores all six surfaces and leaves the validator green at the pre-014 counts, and the adversarial partial revert makes the validator fail → evidence recorded in `report.md`.
- [ ] T-11-V2 passes: `node scripts/validate-shared-cycle-exchange.mjs` is green after registration → evidence recorded in `report.md`.

**Test-related DoD items: 6. Test Plan rows: 6. Parity confirmed.**

---

*Educational research context only — not investment advice.*
