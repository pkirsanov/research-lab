# Scope 10 Report: Shared UI and Pages Acceptance

**Status:** Done — implementation and all pre-deployment validation complete. TP-10-18 (deployed-Pages E2E) is an inherently post-deployment gate; see Uncertainty Declarations.

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md)

## Summary

Scope 10 delivers the shared browser brief experience. `rlbrief.js` is the dual-runtime contract parser, no-store pointer loader, manifest/path/hash/run verifier, selective evidence/history loader, state-vocabulary owner, and safe DOM renderer (it performs no source/model/recommendation/evidence calculation). `rlapp.js` gains one narrow registry/path mount bootstrap plus a Simple/Power host bridge. Every one of the 23 registered pages carries exactly one declarative `data-rlbrief-mount` anchor. Pre-cutover the mount is inert (state `idle`, no network); post-cutover it renders the current published brief plus focused history. Owner controls, Simple/Power state, the RLDATA status shell, and the provider-credential lifecycle are preserved unchanged on every page.

## Decision Record

- Change Boundary honored: only `rlbrief.js`, `rlapp.js` (narrow mount bridge), the 23 HTML anchors (+2 lines each), `scripts/selftest.mjs` (Scope-10 group), and the Scope-10 tests/fixtures were touched. No prior-scope files, no owner formulas/controls/canvases, no page-specific renderer branches, no broad restyle.
- De-flake decision: `data-rlbrief-ready="1"` is now set only on terminal load states (not the transient `loading`), guarded by a separate `data-rlbrief-mounting` re-entrancy flag, so a consumer that waits for `data-rlbrief-ready="1"` observes a settled load. This removed a render/assert race (pre-fix the spec intermittently failed 3/13; post-fix 13/13 twice).
- ui-canary wait correction (test-only): the pre-cutover inert mount is an empty, zero-height (invisible-by-design) `<section>`, so `page.waitForSelector('[data-rlbrief-mount][data-rlbrief-ready="1"]')` under Playwright's DEFAULT `state:'visible'` never resolved and every page timed out at 20s. The mount genuinely reaches `data-rlbrief-ready="1"` + `state=idle` (verified with a standalone one-page diagnostic: ready set, RLAPP loaded, status shell present, zero console/page errors, boundingBox height 0). Corrected the wait to `state:'attached'`; the canary then passes in ~7s. This is a test-correctness fix (matching the test's stated intent to observe the settled inert state), not a product change and not a weakening of any assertion.

## Completion Statement

Implementation is complete and every runnable DoD item is validated in this session. TP-10-18 runs post-cutover once this commit deploys to GitHub Pages.

## Code Diff Evidence

- `rlbrief.js`: shared brief renderer (contract parse, pointer/manifest/hash/run verification, selective evidence + history load, safe DOM render, load-state vocabulary) plus the de-flake (`briefSetState` ready-on-terminal-only + `BriefMount` `data-rlbrief-mounting` guard).
- `rlapp.js`: one registry/path mount bootstrap + Simple/Power bridge + the pre-cutover inert `idle` path gated on `meta[name="rlbrief-enabled"]` / `window.RLBRIEF_ENABLED`.
- 23 registered HTML pages: exactly one `<section data-rlbrief-mount data-tool-id="…" data-simple-target="rlbrief-simple" data-power-target="rlbrief-power">` before `</body>` (`git diff --numstat` = `2 0` for each).
- `scripts/selftest.mjs`: Scope-10 group.

## Test Evidence

All commands re-run this session (2026-07-19):

- `node scripts/selftest.mjs` = **645 passed / 0 failed** (Scope-10 group present; 6-place registration parity + `toolIds.indexOf(...) < 0` deferral canaries green). [TP-10-20]
- `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome` = **158 passed / 0 failed** (18.5s) — full existing + Feature-002 browser suite, no regression. [TP-10-19]
- `npx --no-install playwright test tests/distributed-briefs.spec.mjs --project=system-chrome` = **13/13 passed**, run twice consecutively (de-flaked). [TP-10-04..16]
- `node --test tests/distributed-briefs.renderer.unit.mjs` = **1/1**. [TP-10-01]
- `node --test tests/distributed-briefs.static.integration.mjs` = **1 test / 1 pass / 0 fail / 0 skipped**. [TP-10-02]
- `node --test --test-timeout=300000 tests/distributed-briefs.ui-canary.mjs` = **1 test / 1 pass / 0 fail** (7.3s) — all 23 pages retain owner controls, Simple/Power state, the RLDATA shell, and the credential lifecycle; the mount is inert (`idle`) pre-cutover and makes zero briefs network requests. (Wait condition corrected to `state:'attached'`; see Decision Record.) [TP-10-03]
- `node --test tests/distributed-briefs.consumer-trace.mjs` = **1/1** (no stale first-party assumptions). [TP-10-17]
- `node scripts/validate-distributed-briefs.mjs --root .` = **ok:true**. [TP-10-21]
- `node scripts/migrate-brief-history.mjs --check` = **ok:true, bytesUnchanged:true** (`brief-history.jsonl` untouched). [TP-10-22]
- `node scripts/validate-brief-cache.mjs` = PASS (354); `node scripts/validate-brief-payload.mjs market-brief.payload.json` = PASS.

## Uncertainty Declarations

- **TP-10-18 (deployed-Pages E2E vs `RESEARCH_LAB_BASE_URL`)** is inherently a post-deployment gate: it validates the deployed GitHub Pages site, which requires this cutover commit to be pushed and deployed first. It cannot run pre-deployment, so it is left unchecked and runs post-cutover.
- The separate point-readable `briefs/` per-tool graph publication (the LLM-authored distributed cutover behind the intentionally-inert `--distributed-run` seam) is not activated here. Per-tool and main-brief history is already saved, committed, and pushed each run via `market-brief.snapshot.json` (embedded `toolReads` + 23-entry `toolCoverage`) and `brief-history.jsonl`.

## Scenario Contract Evidence

SCN-002-013/014/015 are exercised by the Playwright spec (13/13), ui-canary, and static.integration: the shared mount renders one coherent current Simple/Power/history experience; focused history loads only the selected immutable partition; registry auto-discovery mounts every page with no page-specific branch.

## Coverage Report

All 23 registered pages carry the shared mount (`grep -l data-rlbrief-mount *.html` = 23). Full browser suite 158/158; selftest 645/0.

## Lint and Quality

- `bash .github/bubbles/scripts/artifact-lint.sh specs/002-distributed-tool-briefs-and-history` = **PASSED**.
- `node scripts/selftest.mjs` = 645/0.
- No prior-scope files touched (working-tree changes confined to the Scope-10 surface); each of the 23 HTML edits is +2 lines.

## Validation Summary

Implementation plus every pre-deployment DoD item validated: TP-10-01, 02, 03, 04–16, 17, 19, 20, 21, 22. TP-10-18 is post-deployment.

## Audit Verdict

Certification pending `bubbles.validate`; `certification.*` and feature status unchanged.
