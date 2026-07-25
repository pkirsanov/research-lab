# User Validation: BUG-002 Feature 012 Test-Infra Moving-HEAD Baseline-Authority Drift

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) | [scopes.md](scopes.md) | [report.md](report.md)

> **State:** `not_started` — DISCOVERY + ROUTING packet. The remediation is routed,
> not implemented, so the fix-acceptance items are **pending** (`[ ]` = validation
> pending, NOT a user-reported regression). The discovery deliverables that THIS
> packet actually produced are validated this session and are checked `[x]`.

## Checklist

### Discovery-packet deliverables (validated this session)

- [x] Blast radius verified read-only across the four `git show HEAD:` / `baselineBytes` sites (see [report.md](report.md#blast-radius-scan-read-only)).
- [x] Per-site class assigned (baseline-repin vs design-intent-gated vs unrelated) with verified pass/fail via `node --test` (see [report.md](report.md#test-evidence)).
- [x] `SCN-012-003` explicitly flagged **design-intent-gated**; not auto-decided (see [design.md](design.md#principle-2--scn-012-003-is-owner-gated-not-a-mechanical-repin)).
- [x] Routing recorded to the parent Feature 012 owner (`bubbles.plan` / `bubbles.design`), gated on operator design-intent confirmation for `SCN-012-003`.
- [x] Only the new BUG-002 folder was created; no test/product/parent-state file modified; no git mutation (see [report.md](report.md#boundary-attestation)).

### Fix-acceptance validations (PENDING — validated after the routed remediation lands)

- [ ] **Registry baseline is HEAD-independent.** `node --test tests/tool-experience-registry.functional.mjs` passes with the baseline sourced from a stable fixture / immutable pinned commit + fail-loud sha256/marker guards (no assertion weakened).
- [ ] **`SCN-012-003` design intent confirmed by owner.** The parent Feature 012 owner has confirmed whether `market-heatmap-lab.html` is intended to carry `rlexperience.js` / `rlcontext.js` now (0 refs at `767732db` → 2 at `HEAD`).
- [ ] **Tooltip legacy-canary repinned + intent-correct.** `node --test tests/contextual-tooltip.functional.mjs` passes with a stable pre-decorator baseline authority and an assertion that reflects the owner-confirmed intent while still failing on a REAL contract break.
- [ ] **Reference fix preserved.** `tests/tool-experience-shell.functional.mjs` (`SCN-012-031`) remains GREEN and byte-unchanged.
- [ ] **No product bytes changed.** No `*.html`, `rl*.js`, `tools.json`, or `scripts/**` file was modified by the remediation.
- [ ] **Drift can no longer recur.** A fresh Feature 012 commit to `HEAD` does not turn any "legacy baseline" into modern bytes (proven by the fail-loud guards).
