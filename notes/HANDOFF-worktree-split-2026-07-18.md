# Handoff — research-lab working-tree split (2026-07-18)

> **Purpose:** the `research-lab` `main` working tree currently holds **one big
> uncommitted tangle of ~9 independent workstreams** plus several **shared
> cross-tool files**. This handoff separates that tree **by tool**, breaks out
> the **common (shared) changes as their own units of work**, and names which
> tools consume each shared change — so the next session(s) can pick up, commit,
> and land each piece independently without cross-contaminating the others.
>
> **Scope of THIS handoff = research-lab changes ONLY.** Bubbles (IMP-020,
> BUG-026, framework-validate, release-manifest), knb, QuantitativeFinance, and
> WanderAide work touched by the same wall-clock sessions are **explicitly
> excluded** and are NOT listed here.

---

## 0. Ground truth (as of 2026-07-18)

- Branch: `main` @ `a930769`. Second worktree: `/private/tmp/research-lab-f010-goal` (detached @ `a930769`) — see Hazard H1.
- `git status`: **45 tracked files changed (+38,351 / −9,813)** plus **10 untracked paths** (incl. `tests/fixtures/place-based-rental-market/`).
- **Core shared JS libs are CLEAN** (not modified): `rldata.js`, `rlapp.js`, `rlcontracts.js`, `rlg.js`, `rlchart.js`, `rlnav.js`, `rlticker.js`, `rlbrief.js`, `rlcompany.js`. The only **new** shared lib is `rlrental.js`.

---

## 1. SHARED / COMMON changes — commit these as their OWN units first

These files are consumed by **more than one tool**. Land each as a self-contained
commit **before** the per-tool commits that depend on it, so no tool commit is
half-wired.

### S1 — Rental capability foundation (`rlrental.js` + place-based schema) — **NEW, uncommitted**

The palm-springs rental tool was generalized into a reusable **place-based**
foundation, and a **second** tool (ocean-shores) was added on top of it
(capability-foundation pattern — 2nd provider triggers the shared lib).

| File | State | Role |
|---|---|---|
| [`../rlrental.js`](../rlrental.js) | NEW (2118 ln) | shared rental engine; `CONFIG_SCHEMA = place-based-rental-market-config/v2`, `PAYLOAD_SCHEMA = …-payload/v2` |
| [`../place-based-rental-market.config.json`](../place-based-rental-market.config.json) | NEW (1690 ln) | shared config (replaces deleted `palm-springs-rental-market.config.json`, −931) |
| [`../scripts/validate-place-based-rental-market.mjs`](../scripts/validate-place-based-rental-market.mjs) | NEW (650 ln) | shared validator (supersedes palm-springs-specific validator) |
| [`../tests/place-based-rental-market.contracts.unit.mjs`](../tests/place-based-rental-market.contracts.unit.mjs) | NEW (470 ln) | shared contract unit test |
| `../tests/fixtures/place-based-rental-market/` | NEW (13 fixtures) | shared fixtures (replaces deleted `tests/fixtures/palm-springs-rental-market/`) |
| [`../notes/place-based-rental-market-research.md`](../notes/place-based-rental-market-research.md) | NEW | research/runbook for the shared method |
| [`../.github/prompts/place-based-rental-market-update.prompt.md`](../.github/prompts/place-based-rental-market-update.prompt.md) | NEW | prompt shim for refreshing any place-based tool |

**Consumed by → tools:** `palm-springs-rental-market-lab.html` (A1) **and**
`ocean-shores-rental-market-lab.html` (A2) — both `<script src="rlrental.js">`.
**Do not commit A1/A2 without S1.**

### S2 — Tickers / data-cache shared surface (`rlticker.js`) — **informational (currently CLEAN)**

The user called out the "tickers js lib" as the archetypal shared change.
`rlticker.js` is **committed and NOT dirty right now**, so it is not part of this
uncommitted split — but it is the shared ticker-cache lib, so record its consumer
map here so any *future* ticker-cache change is coordinated across all of them:

- **Consumed by:** `rlbrief.js` (market-brief), `rlcompany.js` (company-fundamentals),
  `scripts/fetch-bars.mjs`, `scripts/fetch-options.mjs`, `scripts/validate-brief-cache.mjs`,
  `scripts/validate-company-fundamentals.mjs`, `tests/company-fundamentals-contracts.unit.mjs`.
- The **active** change in this area lives in workstream **B** (market-brief
  `brief-refresh-and-push.sh` — "cache tickers to github and reuse across tools").

### S3 — Repo-wide selftest (`scripts/selftest.mjs`) — MODIFIED (+786)

Single repo validator; multiple features add their own group to it. It currently
mixes at least the **place-based rental** group (references `ocean-shores`) with
other groups. **This is the file most likely to cause a merge/commit collision.**
Commit it in lockstep with whichever tool groups it carries (primarily S1/A2).

### S4 — Playwright test harness (shared runtime) — MODIFIED

| File | Δ | Consumed by |
|---|---|---|
| [`../playwright.config.mjs`](../playwright.config.mjs) | +1 | every Playwright `*.spec.mjs` |
| [`../tests/playwright-runtime.foundation.functional.mjs`](../tests/playwright-runtime.foundation.functional.mjs) | +73 | shared browser-runtime foundation |

### S5 — Provider-credentials harness (shared data-layer tests) — MODIFIED

| File | Δ | Consumed by |
|---|---|---|
| [`../tests/provider-credentials.load.mjs`](../tests/provider-credentials.load.mjs) | +256 | data-fetching tools (brief, company, bars/options) |
| [`../tests/provider-credentials.stress.mjs`](../tests/provider-credentials.stress.mjs) | +406 | data-fetching tools (brief, company, bars/options) |

> **Owner-to-confirm:** S4/S5 may belong to a specific data-layer spec (FX/company/
> brief). Confirm ownership before committing; if unowned, land as a standalone
> "shared test-harness" commit.

---

## 2. Per-TOOL workstreams (research-lab only)

### A. Place-Based Rental Market — spec 005 (`in_progress`, scope `03-pair-safe-two-route-experience`)

Spec renamed **"Place-Based Rental Market Research"** (was palm-springs). Depends on **S1 + S3**.

- **A1 · Palm Springs tool** (migrated onto S1): [`../palm-springs-rental-market-lab.html`](../palm-springs-rental-market-lab.html) (reworked), [`../palm-springs-rental-market.payload.json`](../palm-springs-rental-market.payload.json) (NEW), [`../tests/palm-springs-rental-market-lab.spec.mjs`](../tests/palm-springs-rental-market-lab.spec.mjs); deletes: old `…config.json`, `scripts/validate-palm-springs-rental-market.mjs` (reworked −196; confirm if it should be fully deleted), `tests/fixtures/palm-springs-rental-market/`.
- **A2 · Ocean Shores tool** (NEW 2nd consumer): [`../ocean-shores-rental-market-lab.html`](../ocean-shores-rental-market-lab.html) (504 ln), [`../ocean-shores-rental-market.payload.json`](../ocean-shores-rental-market.payload.json).
- **Spec artifacts:** `specs/005-palm-springs-rental-market-lab/{design,report(+12,895),spec,scopes,state,test-plan,uservalidation,scenario-manifest}` — scopes 01/02 `done`, 03 `in_progress`.
- ⚠️ **Gap H2:** A2 (ocean-shores) is **registered only in `scripts/selftest.mjs`** — it is **NOT** in `index.html`, `tools.json`, `README.md`, or `notes/README.md` (all clean). New-tool nav/catalog registration is incomplete.

### B. Market Brief — BUG-002 (`in_progress`, `SCOPE-01`)

- **Bug artifacts:** `specs/_bugs/BUG-002-market-brief-session-date-drift/{report(+5,895),scenario-manifest,scopes,state(+2,604),test-plan}`.
- **Code/tests:** [`../scripts/brief-refresh-and-push.sh`](../scripts/brief-refresh-and-push.sh) (delegate narrative to a 4-lane parallel Copilot launcher; launcher now owns the web-allowlist + shell-deny), [`../tests/market-brief-session-date-drift.spec.mjs`](../tests/market-brief-session-date-drift.spec.mjs), [`../tests/brief-refresh-atomicity.support.mjs`](../tests/brief-refresh-atomicity.support.mjs).
- Touches shared **S2** surface (`rlticker.js`/`rlbrief.js`) — coordinate, don't fork.

### C. Bond Regime Lab — BUG-003 (`in_progress`, `SCOPE-01`)

- `specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/{design,report(+1,314),scopes,state,test-plan}` — Simple/Power mode digest divergence in `bond-regime-lab.html`. Spec-artifacts-only in the tree so far.

### D. FX Regime & Relative-Value Lab — spec 004 (`not_started`, `SCOPE-01`)

- `specs/004-fx-regime-relative-value-lab/{report(+2,106),scopes,state,test-plan}` + [`../tests/feature-004-dirty-tree-collision.test.mjs`](../tests/feature-004-dirty-tree-collision.test.mjs) (+1,348).
- 📌 **Its `report.md` IS the "Dirty-Tree Collision Baseline (GRILL-004-09)"** — an authoritative registry of every already-dirty shared path (`rlfx.js`, `rldata.js`, `scripts/selftest.mjs`, `market-brief.config.json`, …) and its owner. **Use it as the canonical dirty-path map when un-tangling.** The FX tool itself is still `not_started`.

### E. Company Fundamentals & Adaptive Brief Lab — spec 010

- Main tree: `specs/010-company-fundamentals-and-brief-lab/scopes/01-…/report.md` + `state.json`, [`../scripts/validate-company-fundamentals.mjs`](../scripts/validate-company-fundamentals.mjs) (+1,392).
- ⚠️ **Hazard H1 (see below):** active F010 work is in the **`/tmp/research-lab-f010-goal` worktree**; main-tree `state.json` reads `not_started` while git log shows committed `feat(010)` scopes 1–7. Reconcile before committing E.

### F. MSFT July Market Refresh — spec 009 (`not_started`)

- `specs/009-msft-july-market-refresh/report.md` (+219), [`../tests/msft-july-market-refresh.spec.mjs`](../tests/msft-july-market-refresh.spec.mjs) (+2). Small; report-only refresh.

### G. Technical Analysis Decision Lab — spec 007

- `specs/007-technical-analysis-decision-lab/scopes/01-capability-foundation/{report,scope.md}` (small). Foundation scope note.

---

## 3. Handoff hazards (read before committing)

- **H1 — F010 main/worktree separation.** `/private/tmp/research-lab-f010-goal` holds the live spec-010 work; `main` has a **divergent** `specs/010/state.json` (`not_started`) despite committed `feat(010)` scopes. Reconcile the two trees (or discard the stale main-tree copy) before landing **E**. Do not blind-commit main's 010 state.
- **H2 — Ocean-shores not registered.** Finish **A2** by adding it to `index.html` TOOLS, `tools.json`, `README.md`, `notes/README.md` (repo new-tool convention) — currently only `scripts/selftest.mjs` knows about it.
- **H3 — Shared-file collisions.** `scripts/selftest.mjs` (S3), `playwright.config.mjs` (S4), and `provider-credentials.*` (S5) are edited by multiple features; commit them as shared units (§1), not bundled into one tool's commit.
- **H4 — Palm-springs validator.** `scripts/validate-palm-springs-rental-market.mjs` is reworked (−196) but not deleted; decide delete-vs-shim now that S1's `validate-place-based-rental-market.mjs` supersedes it.

---

## 4. Suggested landing order (dependency-safe)

1. **S1** rental foundation (`rlrental.js` + place-based config/validator/fixtures/contract test/notes/prompt).
2. **S3** `scripts/selftest.mjs` (carries the rental + ocean-shores groups).
3. **A1** palm-springs migration (incl. old-artifact deletions, H4 decision).
4. **A2** ocean-shores tool **+ H2 registration** (index/tools.json/README).
5. **A** spec-005 artifacts.
6. **S4 / S5** shared test harness (after confirming owner).
7. **B** market-brief BUG-002 (+ brief-refresh-and-push.sh).
8. **C** bond-regime BUG-003.
9. **D** FX spec-004 (dirty-tree baseline + collision test).
10. **E** company-fundamentals spec-010 — **only after H1 reconcile**.
11. **F** MSFT spec-009, **G** technical-analysis spec-007 (small, independent).

---

## 5. Source of this handoff

Compiled from: `git status`/`diff --stat`/`worktree list` on `research-lab@a930769`;
per-spec `state.json` status extraction; import-graph greps (`rlrental`, `place-based`,
`tickers`, `rlticker`); and the cross-device session store (7 sessions referencing
research-lab — cloud `cwd` is stripped, so the working tree is authoritative).
Bubbles/knb/QF/WanderAide changes from the same sessions are intentionally excluded.
