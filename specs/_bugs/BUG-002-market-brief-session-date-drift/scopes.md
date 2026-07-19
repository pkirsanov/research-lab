# Scopes: BUG-002 Market Brief Session-Date Drift

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) | [report.md](report.md) | [uservalidation.md](uservalidation.md)

## Execution Outline

### Phase Order

1. Preserve the already-delivered Market Brief atomicity behavior and every existing evidence record.
2. Preserve the delivered top-level `.spec.mjs` matcher and paired runtime-foundation assertions as independently attributable predecessor hunks.
3. Preserve the delivered import-source replacement in `tests/market-brief-session-date-drift.spec.mjs`; all 12 browser `.spec.mjs` files now consume `./playwright-runtime.mjs`, and every other BUG-002 browser-test byte remains unchanged.
4. Preserve the test-verified direct-Node predicate: ownership accepts either a static `node:test` import or the existing guarded dynamic `await import('node:test')` form while still rejecting `playwright/test` and `./playwright-runtime.mjs` imports in every `.test.mjs` file; the fresh replay authorizes no source, test, or config mutation.
5. In a zero-runner/profile window on lockfile-faithful Playwright `1.61.1`, run unrestricted `--list` immediately before browser execution; require output to begin at `Listing tests`, include exactly the 12 current `.spec.mjs` files, exclude both `.test.mjs` suites and every TAP/Node prelude, and freeze the sorted full test-identity set, count, digest, plus SHA-256 for all 12 browser specs and the three Playwright config/runtime/foundation files.
6. Run the exact BUG-002 title, complete BUG-002 browser file, and focused functional obligations, then run the unchanged TP-01-10 command twice; each complete run must execute every captured identity exactly once with no missing, duplicate, retry, skip, only, todo, or extra identity, preserve the discovery count/digest and all 15 hashes, and exit prompt-clean with no force-kill, non-test error, or retained process.
7. Verify the accepted rollback unit consists only of the matcher hunk, foundation-assertion hunk, import-source hunk, and Node-taxonomy predicate hunk, with all four hunks independently attributable.
8. Resolve `TR-BUG-002-PLAN-BROWSER-INVENTORY-CARDINALITY-02` by replacing its timeless exact-count acceptance with the replay-local snapshot contract; retain `143` only as the monotonic latest-known floor, accept a higher discovery count only when it is frozen before execution and remains identical through both runs, and require explicit owner reconciliation for any lower count.
9. Route `TR-BUG-002-TEST-BROWSER-INVENTORY-SNAPSHOT-02` to `bubbles.test` at the immediate runtime-foundation command; any browser spec, Playwright config/runtime/foundation, discovery identity, or protected hash change invalidates the snapshot and restarts discovery rather than weakening or removing a foreign test.

### New Types And Signatures

- `playwright.config.mjs`: top-level `testMatch: '**/*.spec.mjs'`, or the exact Playwright-supported equivalent with identical include/exclude behavior.
- `tests/playwright-runtime.foundation.functional.mjs`: persistent discovery-boundary assertions over committed config and repository test inventory; its direct-Node predicate accepts either static `node:test` import syntax or guarded dynamic `await import('node:test')` syntax and rejects both Playwright import sources for `.test.mjs` files.
- `tests/market-brief-session-date-drift.spec.mjs`: delivered `./playwright-runtime.mjs` import source; every other byte remains preserved.
- No production type, API, schema, page, renderer, fixture, Node-suite, worker, retry, source-lock, package, browser executable, or setup-hook signature changes.

### Validation Checkpoints

- Checkpoint A: path-scoped diff proves the accepted four-hunk after-image remains independently attributable and the fresh replay changes no source, test, or config byte.
- Checkpoint B: the immediate runtime-foundation check accepts both committed Node ownership forms while preserving local Playwright `1.61.1`, exact 12-browser/2-Node inventory, matcher, shared seam, and no-fallback authority.
- Checkpoint C: direct Feature 004 Node canary passes `3/3` independently, then the unchanged Gate 2 runtime-foundation replay remains green.
- Checkpoint D: unrestricted browser discovery begins at `Listing tests`, names exactly the 12 current `.spec.mjs` files, excludes both `.test.mjs` suites/TAP/Node prelude, meets the `>=143` monotonic floor, and freezes the sorted full identity set, count, digest, and 15-file SHA-256 fence.
- Checkpoint E: exact BUG-002 browser title, complete BUG-002 browser file, atomicity matrix, pair validator, repository selftest, and Bash parse exit cleanly without changing the frozen identity or hash fence.
- Checkpoint F: Gate 6 and Gate 7 each execute every captured identity exactly once with no missing, duplicate, retry, skip, only, todo, or extra identity; both preserve the captured count/digest and exit prompt-clean without Node prelude, force-kill, non-test error, overlap, or retained process.
- Checkpoint G: recheck the 15-file hash fence and discovery identity after each browser command and after Gate 7. Any change to Feature 005 or another browser/config/runtime/foundation file stops the replay and requires a new unrestricted discovery snapshot from Checkpoint D.
- Gate: no Gate 1-7 command starts until the immediate foundation check is green; a later failure returns to the exact four-hunk rollback/change unit without weakening inventory, ownership, or assertions.

## Ownership Status

**Workflow mode:** `bugfix-fastlane`  
**Planning outcome:** `route_required`  
**Test dispatch allowed:** `true` for the exact Feature 009 test-clock repair followed by one fresh BUG-002 protected-byte replay beginning at the immediate runtime-foundation command
**Implementation outcome:** browser import-only reconciliation delivered; no implementation mutation remains in this route
**Independent test outcome:** `route_required` for Feature 009 focused repair/verification and the subsequent immediate foundation check plus unchanged Gate 1-7 replay
**Next required owner:** `bubbles.test`
**Parent finding:** `F006-EXT-SELFTEST-MARKET-BRIEF-001`
**Planning amendment:** `BUG002-REPLAY-LOCAL-BROWSER-INVENTORY-SNAPSHOT` resolves `TR-BUG-002-PLAN-BROWSER-INVENTORY-CARDINALITY-02` and routes `TR-BUG-002-TEST-BROWSER-INVENTORY-SNAPSHOT-02`.

One delivery scope is sufficient. The existing wrapper is the only publication implementation, the validator contract is already explicit, and no UI design decision is open.

## Scope 1: SCOPE-01 Atomic Market Brief Publication

**Status:** In Progress  
**Depends On:** None  
**Scope-Kind:** bugfix  
**Tags:** foundation:true

### Gherkin Scenarios - SCOPE-01

```gherkin
Scenario: SCN-BUG002-001 failed rollover retains the last coherent Market Brief pair
  Given a clean published snapshot payload and history all target July 15
  And an isolated Tier-A candidate advances nextSessionDate to July 16
  When Tier B fails or is skipped and no valid July 16 payload exists
  Then the wrapper retains the July 15 snapshot payload and published history bytes
  And independently refreshed raw data may commit without the rejected brief candidate
  And the unchanged payload validator and rendered page never observe mixed target dates
```

### Implementation Plan - SCOPE-01

1. Capture a just-in-time status, index-object, worktree-hash, and scoped-diff baseline for every authorized and protected path. The delivered browser import and current foundation predicate are pre-existing candidates: `bubbles.test` may adopt only the exact authorized predicate hunk and must stop if any excluded byte differs.
2. Add `tests/brief-refresh-atomicity.support.mjs` and `tests/brief-refresh-atomicity.test.mjs`; execute the exact target-date-rollover test against the original wrapper and retain its failing output before editing production.
3. Add `tests/market-brief-session-date-drift.spec.mjs` with the exact protected browser title and real ephemeral HTTP serving.
4. Repair `scripts/brief-refresh-and-push.sh` to validate the baseline pair, restore payload/config per attempt, validate retained Tier B against candidate Tier A, retain baseline snapshot/history on cross-date failure, preserve same-target data-only publication, and stage only the selected transaction.
5. Repair the current published data by restoring `market-brief.snapshot.json` and `brief-history.jsonl` from commit `751b85d72dea16e790cd4e1281f3ed155bd06e60`; keep `market-brief.payload.json` byte-identical.
6. Preserve the delivered top-level `.spec.mjs` matcher, existing runtime-foundation assertions, and all 12 delivered shared-runtime browser imports; route `bubbles.test` to repair only the foreign Feature 009 test clock, verify its exact title, and then begin a no-mutation BUG-002 protected-byte replay at the immediate runtime-foundation command.
7. Execute focused functional, contract, shell, browser, repository, broader E2E, regression-quality, portability, and diff-integrity checks.
8. Route complete evidence to independent test, validation, audit, and parent Feature 006 replay without changing Feature 006 artifacts in this scope.

### Change Boundary - SCOPE-01

**Accepted change unit:** the delivered matcher hunk in `playwright.config.mjs`, delivered foundation-assertion hunk in `tests/playwright-runtime.foundation.functional.mjs`, delivered import-source hunk in `tests/market-brief-session-date-drift.spec.mjs`, and delivered direct-Node predicate hunk in `tests/playwright-runtime.foundation.functional.mjs` form one four-hunk rollback/change unit. Each hunk must remain independently attributable.

**Delivered import handling:** the exact one-line BUG-002 import substitution is complete and every other browser-test byte was proven unchanged. `bubbles.test` must preserve that hunk byte-for-byte; any browser-suite byte change during the replay invalidates the inventory snapshot and requires a fresh discovery/hash fence before browser execution.

**Preserved predicate after-image:** `tests/playwright-runtime.foundation.functional.mjs` accepts each discovered `.test.mjs` file when it has either a static import from `node:test` or the existing guarded dynamic `await import('node:test')` form. It continues to require direct Node ownership and reject imports from both `playwright/test` and `./playwright-runtime.mjs`. The fresh replay authorizes no edit to this file or either Node suite.

**Foreign test-owner repair boundary:** this planning invocation changes no test byte. Under `TR-BUG-002-F009-TEST-CLOCK-01`, only `bubbles.test` may repair the evaluation-clock binding in `tests/msft-july-market-refresh.spec.mjs` for the exact title `Regression: SCN-009-001/002/005 cache-first market truth`. That repair is separate from the accepted four-hunk BUG-002 rollback unit, must preserve Feature 009 production staleness behavior, and must be focused-verified before the unchanged BUG-002 immediate foundation check and Gates 1-7 restart from the beginning.

**Excluded surfaces for this planning transition:** every test byte; both `.test.mjs` Node suites, including their guards, imports, titles, assertions, and behavior; every line in `tests/playwright-runtime.foundation.functional.mjs`; `tests/playwright-runtime.mjs`; production code/data; package/source-lock files; browser authority and exact inventory; worker/retry settings; `globalSetup` and setup hooks; Feature 004/010 artifacts; report execution evidence; spec/design/certification; framework files; and unrelated dirty paths. The successor test transition's one-file Feature 009 clock repair does not authorize any BUG-002 test, runtime, config, worker, retry, or matcher edit.

| Class | Paths | Rule |
| --- | --- | --- |
| Existing production | `scripts/brief-refresh-and-push.sh` | Surgical transaction repair only |
| New tests | `tests/brief-refresh-atomicity.support.mjs`, `tests/brief-refresh-atomicity.test.mjs`, `tests/market-brief-session-date-drift.spec.mjs` | Isolated fixtures; no real checkout mutation or network |
| Shared Playwright config | `playwright.config.mjs` | Preserve the delivered top-level `testMatch: '**/*.spec.mjs'` hunk unchanged; it remains independently attributable inside the accepted rollback unit |
| Shared Playwright contract | `tests/playwright-runtime.foundation.functional.mjs` | Preserve the delivered discovery-boundary, inventory, shared-seam, and no-fallback assertion hunk; `bubbles.test` may edit only the direct-Node predicate to accept static or guarded dynamic `node:test` ownership while rejecting both Playwright import sources |
| BUG-002 shared-seam conformance | `tests/market-brief-session-date-drift.spec.mjs` | Preserve the delivered `./playwright-runtime.mjs` import and every other byte; no edit is authorized |
| Current data repair | `market-brief.snapshot.json`, `brief-history.jsonl` | Exact prior coherent bytes only |
| Read-only contract | `market-brief.payload.json`, `market-brief.config.json`, `scripts/brief-refresh.mjs`, `scripts/validate-brief-payload.mjs`, `market-brief.html`, `rlbrief.js` | No edit |
| Protected dirty | `notes/market-brief.md`, `.github/prompts/market-brief-update.prompt.md`, `scripts/selftest.mjs`, untracked validator ownership, Feature 005, Feature 006, unrelated paths | No edit, stage, restore, clean, or normalization |
| Framework | `.github/bubbles/**`, `.github/agents/bubbles*`, `.github/prompts/bubbles*`, `.github/skills/bubbles-*`, `.github/instructions/bubbles-*` | Downstream read-only |

### Shared Infrastructure Impact Sweep - Playwright Discovery

| Control | Planned contract |
| --- | --- |
| Protected surface | `playwright.config.mjs` is a shared browser-runner boundary consumed by every Playwright suite; only its top-level discovery matcher may change. |
| Downstream inventory | All 12 current `tests/**/*.spec.mjs` browser files remain discoverable through the shared config and import the shared runtime; both current `tests/**/*.test.mjs` Node suites remain outside Playwright discovery and direct-Node-owned, one through static `node:test` import syntax and one through guarded dynamic `await import('node:test')` syntax. |
| Independent canary | At fresh transition entry, `bubbles.test` runs `node --test tests/playwright-runtime.foundation.functional.mjs`. Only a green result permits the unchanged Gate 1-7 sequence, beginning with `node --test tests/feature-004-dirty-tree-collision.test.mjs` and retaining the runtime-foundation replay at Gate 2. |
| Discovery discriminator | Unrestricted Playwright `--list` runs immediately before browser execution, must begin at `Listing tests`, name exactly the 12 current `.spec.mjs` files, exclude both `.test.mjs` suites and every TAP/Node prelude, meet the monotonic `>=143` floor, and emit a sorted full test-identity set with replay-local count and SHA-256 digest. A lower count requires explicit owner reconciliation; a higher count is accepted only when captured here and unchanged through both complete runs. |
| Replay-local hash fence | Capture SHA-256 for all 12 browser spec files plus `playwright.config.mjs`, `tests/playwright-runtime.mjs`, and `tests/playwright-runtime.foundation.functional.mjs` before Gate 4. Recheck all 15 after each browser command and after Gate 7; any change stops the sequence and restarts unrestricted discovery without editing or removing the changed foreign test. |
| Preserved runtime identity | Keep checkout-local Playwright resolution, the configured `system-chrome` executable, lockfile/source-lock behavior, and the existing prohibition on browser executable or package fallbacks. |
| Exact rollback unit | The matcher addition, paired runtime-foundation assertions, BUG-002 import-source replacement, and direct-Node predicate repair form one accepted four-hunk rollback/change unit. All four hunks remain independently attributable; no neighboring bytes belong to the unit. |
| Explicit exclusions | No browser-suite edit, `.test.mjs` edit, `globalSetup`, test rename, Node guard/title/assertion change, non-predicate foundation edit, fixture/helper edit, `tests/playwright-runtime.mjs` edit, worker/retry change, broad config rewrite, assertion weakening, inventory weakening, browser-authority change, browser executable fallback, package fallback, or source-lock change. |

**Downstream browser contract inventory (12):** `tests/bond-regime-lab.spec.mjs`, `tests/causal-rotation-lab.spec.mjs`, `tests/company-fundamentals-lab.spec.mjs`, `tests/fx-regime-relative-value-lab.spec.mjs`, `tests/market-brief-session-date-drift.spec.mjs`, `tests/msft-july-market-refresh.spec.mjs`, `tests/palm-springs-rental-market-lab.spec.mjs`, `tests/portfolio-survival-foundation.spec.mjs`, `tests/provider-credentials.spec.mjs`, `tests/technical-analysis-decision-lab.spec.mjs`, `tests/trend-dynamics-cycle-lab.spec.mjs`, and `tests/volatility-sizing-lab.spec.mjs`.

**Excluded Node discovery inventory (2):** `tests/brief-refresh-atomicity.test.mjs` and `tests/feature-004-dirty-tree-collision.test.mjs`. These remain direct `node --test` suites and must never be imported or executed by TP-01-10.

This is a planning-level shared test-infrastructure amendment, not a production architecture change. The existing design already fixes the production publication transaction and requires isolated, checkout-local, portable browser verification; the matcher narrows which existing test taxonomy Playwright collects, the foundation keeps that boundary fail-closed, the delivered consumer reconciliation makes all 12 browser suites use the same runtime seam, and the predicate repair recognizes both valid direct-Node import forms without weakening Playwright exclusions. None changes the production state machine, data flow, user behavior, Node-suite behavior, test titles/assertions, or browser runtime. `design.md` therefore remains read-only, and this scoped G067 contract is sufficient authority for the four-hunk cross-owner rollback/change unit.

### Atomicity And Rollback Contract - SCOPE-01

- Baseline validation and clean-owned-path preflight occur before fetch or refresh.
- Every failed Tier-B attempt restores baseline payload and config.
- A valid same-target retained payload permits candidate Tier A and history to publish.
- A cross-target retained payload rejects candidate snapshot/history and retains baseline pair bytes.
- Raw `data/` changes remain independently eligible after rejected brief publication.
- A post-staging failure unstages only owned paths and restores only preflight-proven baseline bytes.
- No broad stash, reset, clean, checkout overwrite, stage-all, or whole-file rollback is permitted.

### Test Plan

| ID | Type | Category | Scenario | File / exact test title | Required assertion | Exact command | Live |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-01-01 | Before-fix repository regression | integration | SCN-BUG002-001 | `scripts/selftest.mjs` - `current payload satisfies the executable brief contract` | Current bytes fail only because payload July 15 differs from snapshot July 16. | `node scripts/selftest.mjs` | No |
| TP-01-02 | Functional adversarial regression | functional | SCN-BUG002-001 | `tests/brief-refresh-atomicity.test.mjs` - `Regression BUG-002: target-date rollover retains the last coherent pair when Tier B fails` | RED on original wrapper; GREEN proves baseline snapshot/payload/history byte retention, no mixed commit, and validator pass. | `node --test tests/brief-refresh-atomicity.test.mjs` | No |
| TP-01-03 | Functional transaction matrix | functional | SCN-BUG002-001 | `tests/brief-refresh-atomicity.test.mjs` - same-target, matching-pair, retry-config, validation-failure, and raw-data-only cases | Every commit selection and rollback branch is explicit and deterministic. | `node --test tests/brief-refresh-atomicity.test.mjs` | No |
| TP-01-04 | Dirty-worktree adversarial | functional | SCN-BUG002-001 | `tests/brief-refresh-atomicity.test.mjs` - owned-dirty refusal and unrelated-dirty preservation | Owned dirt stops before mutation; unrelated bytes/index/status remain identical. | `node --test tests/brief-refresh-atomicity.test.mjs` | No |
| TP-01-05 | Regression E2E adversarial | e2e-ui | SCN-BUG002-001 | `tests/market-brief-session-date-drift.spec.mjs` - `Regression BUG-002: a failed rollover never serves prior-session actions beside an advanced Tier-A snapshot` | Real wrapper plus real page/renderer serves one coherent retained date, thesis, actions, and market context. | `npx --no-install playwright test tests/market-brief-session-date-drift.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression BUG-002: a failed rollover never serves prior-session actions beside an advanced Tier-A snapshot" --reporter=list` | Yes |
| TP-01-06 | Focused E2E file | e2e-ui | SCN-BUG002-001 | `tests/market-brief-session-date-drift.spec.mjs` - complete file | All Market Brief atomic-publication browser cases pass over real HTTP. | `npx --no-install playwright test tests/market-brief-session-date-drift.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-01-07 | Executable pair contract | functional | SCN-BUG002-001 | `scripts/validate-brief-payload.mjs` - committed pair | Repaired current pair and selected fixture pairs satisfy the unchanged date invariant. | `node scripts/validate-brief-payload.mjs` | No |
| TP-01-08 | Complete repository canary | integration | SCN-BUG002-001 | `scripts/selftest.mjs` - complete inventory | All repository assertions pass and `F006-EXT-SELFTEST-MARKET-BRIEF-001` is absent. | `node scripts/selftest.mjs` | No |
| TP-01-09 | Shell portability/syntax | functional | SCN-BUG002-001 | `scripts/brief-refresh-and-push.sh` - Bash parse | Wrapper parses on the project macOS command surface and adds no GNU-only form. | `bash -n scripts/brief-refresh-and-push.sh` | No |
| TP-01-10 | Broader E2E regression | e2e-ui | SCN-BUG002-001 | `tests/**/*.spec.mjs` - complete replay-local browser inventory captured by TP-01-13 | The unchanged command runs only the identities frozen by the immediately preceding unrestricted `--list`. Gate 6 and Gate 7 each execute every captured identity exactly once with no missing, duplicate, retry, skip, only, todo, or extra identity; both retain the captured count/digest, the `>=143` floor, all 15 protected hashes, no `.test.mjs`/TAP/Node prelude, and prompt-clean lifecycle with no non-test error, force-kill, overlap, or retained process. | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-01-11 | Canary: Feature 004 dirty-tree collision prerequisite | functional | SCN-BUG002-001 | `tests/feature-004-dirty-tree-collision.test.mjs` - complete three-case Node suite | All three fail-closed collision/parser cases pass independently before shared Playwright discovery is inspected or executed. | `node --test tests/feature-004-dirty-tree-collision.test.mjs` | No |
| TP-01-12 | Canary: shared Playwright runtime and discovery foundation | functional | SCN-BUG002-001 | `tests/playwright-runtime.foundation.functional.mjs` - complete Node suite | Committed matcher includes every current and later `.spec.mjs`, excludes both current `.test.mjs` files, preserves exactly 12 current browser files, proves all 12 import the shared runtime seam with zero direct `playwright/test` consumers, requires every `.test.mjs` file to be direct-Node-owned through either static `node:test` import syntax or guarded dynamic `await import('node:test')` syntax, rejects both Playwright import sources from Node suites, and preserves checkout-local package plus system-Chrome no-fallback authority. | `node --test tests/playwright-runtime.foundation.functional.mjs` | No |
| TP-01-13 | Playwright discovery inventory snapshot | functional | SCN-BUG002-001 | `playwright.config.mjs` - unrestricted replay-local `--list` snapshot | Output begins at `Listing tests`, names exactly the 12 current `.spec.mjs` files, excludes both `.test.mjs` suites plus every TAP/Node prelude, and yields the sorted full test-identity set, count, and SHA-256 digest. Count must be at least the latest-known baseline of 143; the captured exact count/digest, not 143 itself, governs Gate 6 and Gate 7. Capture the 15-file hash fence in the same pre-execution window. | `npx --no-install playwright test --list --config=playwright.config.mjs --project=system-chrome --reporter=list` | No |

### Required Shared-Infrastructure Validation Sequence

`bubbles.test` changes no source, test, config, dependency, planning, framework, report, certification, or foreign-feature byte. It first confirms lockfile-faithful Playwright `1.61.1`, zero active Playwright test runners, and zero `playwright_chromiumdev_profile` processes, then immediately runs `node --test tests/playwright-runtime.foundation.functional.mjs`. If any precondition or the immediate check is not green, it stops without entering Gate 1. If green, the same owner runs the following **Gate 1-7** sequence; no prior result skips or reorders a gate.

1. **Gate 1 / TP-01-11:** direct Feature 004 Node canary, exactly `3/3`.
2. **Gate 2 / TP-01-12:** complete runtime-foundation Node suite, including matcher, 12-browser/2-Node inventory, shared-seam, source-lock/runtime-identity, and no-fallback contracts.
3. **Gate 3 / TP-01-13:** unrestricted Playwright `--list` immediately before browser execution. Require `Listing tests` as the first Playwright output, exactly the 12 named `.spec.mjs` files, both `.test.mjs` suites/TAP/Node prelude absent, count `>=143`, and a sorted full identity-set SHA-256. Capture SHA-256 for all 12 browser specs plus the config/runtime/foundation trio. The replay-local count and digest become the exact Gate 6/7 contract.
4. **Gate 4 / TP-01-05:** exact BUG-002 browser title.
5. **Gate 5 / TP-01-06:** complete BUG-002 browser file.
  **Focused functional checkpoint:** run the exact atomicity matrix, pair validator, complete repository selftest, and Bash parse obligations. Recheck the captured identities and all 15 hashes; any drift restarts Gate 3.
6. **Gate 6 / TP-01-10 repetition 1:** the exact unchanged command executes every captured identity exactly once with no missing, duplicate, retry, skip, only, todo, or extra identity; observed count/digest must equal Gate 3, all 15 hashes must remain equal, and the process must exit promptly and cleanly with no Node prelude, non-test error, force-kill, overlap, or retained handle.
7. **Gate 7 / TP-01-10 repetition 2:** repeat the same unchanged command under a fresh zero-overlap preflight and require the identical identity set/count/digest, exactly-once execution, unchanged 15-file hash fence, and another prompt-clean lifecycle. Recheck discovery identity and hashes once more after exit.

If Feature 005 or any browser spec/config/runtime/foundation file changes after Gate 3, stop immediately and restart from the zero-overlap precondition plus Gate 3 discovery snapshot. Never satisfy BUG-002 by weakening, renaming, skipping, or removing a foreign test.

The predicate edit, immediate foundation check, and conditional Gate 1-7 replay are `bubbles.test`-owned. This planning amendment records no pass result for any row and does not alter report execution evidence.

### Feature 009 Clock-Determinism Prerequisite

Before regression may resume, `bubbles.test` must resolve `TR-BUG-002-F009-TEST-CLOCK-01` for `BUG002-F009-CACHE-CLOCK-DRIFT-REGRESSION`:

1. Preserve Feature 009 production cache-staleness semantics and reproduce the exact current failure in `tests/msft-july-market-refresh.spec.mjs` under `Regression: SCN-009-001/002/005 cache-first market truth`.
2. Bind the E2E evaluation time through Feature 009's existing injected-clock design seam; do not weaken the expected `complete` state, rewrite cache data, add a fallback, or change any other browser test.
3. Verify the exact Feature 009 title under the checkout-local Playwright/runtime authority.
4. Restart the BUG-002 immediate foundation check and unchanged Gates 1-7 from the beginning. Historical 132 evidence and the failed 132/133 regression attempt remain historical only.

This prerequisite is a concrete test-owner route, not a planning-phase test edit or pass claim.

### Test Taxonomy Applicability - SCOPE-01

| Category | Applicability | Reason |
| --- | --- | --- |
| unit | Not applicable | The defect is shell/Git publication orchestration, not a separable pure computation |
| functional | Required | Isolated Git fixtures exercise branch, staging, retry, and rollback behavior |
| integration | Required | The unchanged validator and complete repository selftest consume real current files |
| ui-unit | Not applicable | No component framework or UI component changes |
| e2e-api | Not applicable | Research Lab has no service API |
| e2e-ui | Required | The served action block must never expose a mixed pair |
| stress | Not applicable | No throughput or repetition SLA changes |
| load | Not applicable | No concurrency or capacity contract changes |

### Definition of Done - SCOPE-01

- [x] SCN-BUG002-001 failed rollover retains the last coherent Market Brief pair and never publishes or serves mixed target dates. (**Phase:** implement; **Evidence:** [post-repair functional matrix](report.md#post-repair-functional-matrix) and [focused browser regression](report.md#focused-browser-regression).)
- [x] Root cause is confirmed against current bytes, wrapper control flow, renderer behavior, and Git provenance. (**Phase:** implement; **Evidence:** [initial focused verdict](report.md#initial-focused-current-bytes-verdict), [exact repair identity](report.md#exact-current-pair-repair-identity), and [root-cause decision](report.md#root-cause-decision).)
- [x] The exact functional adversarial regression fails before the wrapper fix. (**Phase:** implement; **Evidence:** [final immutable pre-fix RED and working-tree GREEN](report.md#final-immutable-pre-fix-red-and-working-tree-green).)
- [x] The wrapper validates baseline and selected pairs, restores payload/config per attempt, and selects same-target data-only, matching pair, or raw-data-only commit behavior correctly. (**Phase:** implement; **Evidence:** [post-repair functional matrix](report.md#post-repair-functional-matrix).)
- [x] Current `market-brief.snapshot.json` and `brief-history.jsonl` are restored from the exact last coherent source while `market-brief.payload.json` remains byte-identical. (**Phase:** implement; **Evidence:** [exact current-pair repair identity](report.md#exact-current-pair-repair-identity).)
- [x] Atomic rollback leaves no rejected snapshot/history/payload/config bytes or owned staged paths after failure. (**Phase:** implement; **Evidence:** [post-repair functional matrix](report.md#post-repair-functional-matrix).)
- [x] Dirty owned paths refuse before mutation and unrelated dirty bytes/index/status remain unchanged. (**Phase:** implement; **Evidence:** [post-repair functional matrix](report.md#post-repair-functional-matrix) and [implementation integrity](report.md#implementation-integrity-and-dirty-boundary).)
- [x] Tests use isolated temporary Git/HTTP fixtures with no credential, external network, production monitoring, backup, release-train, or knb mutation. (**Phase:** implement; **Evidence:** [final fixture authenticity and isolation](report.md#final-fixture-authenticity-and-isolation).)
  > **Phase:** test  
  > **Claim Source:** executed  
  > **Evidence:** [Fixture Authenticity, Isolation, And Test Integrity](report.md#fixture-authenticity-isolation-and-test-integrity) and [Depth-1 Current-Session Corroboration](report.md#depth-1-current-session-corroboration) record OS-temporary Git repositories, local bare remotes, ephemeral loopback HTTP, zero interception/external requests, a green pollution scan, and clean fixture teardown.
- [x] `TP-01-02`, `TP-01-03`, and `TP-01-04` pass after the fix with no selective-run, pending-test, or silent-return bailout marker. (**Phase:** implement; **Evidence:** [post-repair functional matrix](report.md#post-repair-functional-matrix).)
- [x] `TP-01-05` and `TP-01-06` pass through the checkout-local Playwright 1.61.1 runner and system Chrome. (**Phase:** implement; **Evidence:** [focused browser regression](report.md#focused-browser-regression).)
- [x] `TP-01-07`, `TP-01-08`, and `TP-01-09` pass on the repaired current bytes. (**Phase:** implement; **Evidence:** [current-pair contract and repository canary](report.md#current-pair-contract-and-repository-canary) and [implementation integrity](report.md#implementation-integrity-and-dirty-boundary).)
- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior (**Phase:** implement; **Evidence:** [focused browser regression](report.md#focused-browser-regression).)
- [ ] Broader E2E regression suite passes twice against one replay-local discovery identity/hash snapshot, with every captured identity executed exactly once in each run and no extra identity (**Phase:** implement; **Evidence:** [final browser regression](report.md#final-browser-regression).)
  > **Phase:** test
  > **Claim Source:** executed
  > **Evidence:** [Current 133-Test Independent Replay And Regression Route](report.md#current-133-test-independent-replay-and-regression-route---2026-07-18t221124z) records two sequential exact `133/133` passes, balanced close/exit records, zero force-kill or non-test errors, and zero retained CLI runner.
  > **Uncertainty Declaration**
  > **What was attempted:** The current no-overlap replay ran the immediate foundation, Feature 004 canary, foundation replay, and exact unrestricted discovery.
  > **What was observed:** [No-Overlap Test Rework 03 Gate 3 Inventory Refusal](report.md#no-overlap-test-rework-03-gate-3-inventory-refusal---2026-07-18t230914z) records discovery at `143` tests in 12 files against the planned `133`; both broad repetitions were not run after that fail-fast boundary.
  > **Why this is uncertain:** Historical `133/133` passes do not prove the complete current 143-test working-tree inventory.
  > **What would resolve this:** Reconcile the stable current cardinality under `TR-BUG-002-PLAN-BROWSER-INVENTORY-CARDINALITY-02`, then restart and complete both exact broad repetitions.
- [x] Regression quality, source-lock, portability, artifact, freshness, traceability, G094, framework-write, diagnostics, and diff-integrity checks pass. (**Phase:** implement; **Evidence:** [final governance and containment matrix](report.md#final-governance-and-containment-matrix).)
  > **Phase:** test  
  > **Claim Source:** executed  
  > **Evidence:** [Test Quality And Governance Guards](report.md#test-quality-and-governance-guards), [Diagnostics](report.md#diagnostics), and [Depth-1 Current-Session Corroboration](report.md#depth-1-current-session-corroboration) record independent G003/G004/G005/G051/G079, regression-quality, source-lock, portability, pollution, artifact, freshness, traceability, implementation-reality, G094, framework-write, diagnostics, and containment results. Validate-owned certification remains separate.
- [x] Independent canary suite for shared fixture/bootstrap contracts passes before broad suite reruns
  > **Phase:** test
  > **Claim Source:** executed
  > **Evidence:** [Current 133-Test Independent Replay And Regression Route](report.md#current-133-test-independent-replay-and-regression-route---2026-07-18t221124z) records immediate TP-01-12 `5/5`, TP-01-11 `3/3`, and Gate 2 TP-01-12 `5/5` before unrestricted discovery or either broad replay.
  > **Current Evidence:** [No-Overlap Test Rework 03 Gate 3 Inventory Refusal](report.md#no-overlap-test-rework-03-gate-3-inventory-refusal---2026-07-18t230914z) independently records the same ordered `5/5`, `3/3`, `5/5` canary sequence in a zero-overlap window.
- [ ] Unrestricted Playwright discovery immediately before browser execution begins at `Listing tests`, names exactly the 12 current `.spec.mjs` files, excludes both `.test.mjs` suites and every TAP/Node prelude, meets the latest-known minimum of 143, and freezes the sorted full identity set/count/digest plus the 15-file SHA-256 fence.
  > **Phase:** test
  > **Claim Source:** executed
  > **Evidence:** [Current 133-Test Independent Replay And Regression Route](report.md#current-133-test-independent-replay-and-regression-route---2026-07-18t221124z) records native `Listing tests:` output ending at `Total: 133 tests in 12 files`, with 12 shared importers, two excluded direct-Node suites, and no TAP/Feature 004 prelude.
  > **Uncertainty Declaration**
  > **What was attempted:** `npx --no-install playwright test --list --config=playwright.config.mjs --project=system-chrome --reporter=list`
  > **What was observed:** The current command began at `Listing tests:`, retained 12 `.spec.mjs` files and no Node prelude, but ended at `Total: 143 tests in 12 files`.
  > **Why this is uncertain:** The planning-owned exact count is stale against concurrent Feature 005 browser work; test ownership cannot rewrite that contract or remove foreign tests.
  > **What would resolve this:** Planning reconciles the stable truthful count, followed by a fresh exact discovery replay.
- [ ] Gate 6 and Gate 7 each execute every identity from the immediately preceding discovery snapshot exactly once, with no missing, duplicate, retry, skip, only, todo, or extra identity; both preserve the captured count/digest and 15-file hashes and exit prompt-clean with no Node prelude, overlap, non-test error, force-kill, or retained process.
  > **Phase:** test
  > **Claim Source:** executed
  > **Evidence:** [Current 133-Test Independent Replay And Regression Route](report.md#current-133-test-independent-replay-and-regression-route---2026-07-18t221124z) records exact repetitions at `133 passed (19.6s)` and `133 passed (18.3s)`, balanced close/exit records, zero failure signatures, and `retainedCliRunnerCount=0`.
  > **Uncertainty Declaration**
  > **What was attempted:** The current replay followed the exact fail-fast sequence through Gate 3.
  > **What was observed:** Gate 3 found 143 tests rather than 133, so neither TP-01-10 repetition ran; entry and final real-runner/profile counts stayed zero.
  > **Why this is uncertain:** The historical pair does not cover the current inventory, and no lifecycle conclusion can be drawn from commands that were not launched.
  > **What would resolve this:** After planning reconciliation, restart at the immediate foundation and complete two prompt-clean full-inventory repetitions.
- [ ] Rollback or restore path for shared infrastructure changes is documented and verified
  > **Uncertainty Declaration**
  > **What was attempted:** Current test execution captured pre/post hashes, statuses, staging, and the exact three-file/four-part diff boundary.
  > **What was observed:** All four rollback elements are independently attributable and unchanged, but this invocation did not execute an actual rollback/restore cycle.
  > **Why this is uncertain:** Byte attribution proves the rollback unit, not operational restoration after removing and reapplying it.
  > **What would resolve this:** Execute an isolated rollback/reapply proof for the four-part unit without changing the shared working tree, then rerun TP-01-12.
- [x] Change Boundary is respected and zero excluded file families were changed
  > **Phase:** test
  > **Claim Source:** executed
  > **Evidence:** [Current 133-Test Independent Replay And Regression Route](report.md#current-133-test-independent-replay-and-regression-route---2026-07-18t221124z) records exact matching pre/post SHA-256 and statuses for all 14 protected source/test/config paths, no protected staging, and all four accepted boundary elements across exactly three diff files.
- [ ] Independent `bubbles.test`, `bubbles.validate`, and `bubbles.audit` evidence accounts for every finding with no terminal claim written by implementation.

  > **Phase:** test
  > **Claim Source:** executed
  > **Evidence:** [Current 133-Test Independent Replay And Regression Route](report.md#current-133-test-independent-replay-and-regression-route---2026-07-18t221124z) accounts for every current test finding and resolves `TR-BUG-002-TEST-BROWSER-INVENTORY-CARDINALITY-01` without a scope, bug, regression, validation, audit, or certification claim.
  > **Uncertainty Declaration**
  > **What was attempted:** Independent test executed the complete active Test Plan and test-integrity/governance matrix.
  > **What was observed:** Test ownership is current and green at 133/133 twice; regression, validate, and audit have not executed this current route.
  > **Why this is uncertain:** The DoD item requires evidence from later owners that `bubbles.test` cannot produce or certify.
  > **What would resolve this:** Complete existing `TR-BUG-002-REGRESSION-01`, then run validate-owned certification and the required audit phase.
- [ ] BUG-002 is marked Fixed only after validate-owned certification, and the parent Feature 006 Scope 3 exact selftest row passes before resume.

  > **Uncertainty Declaration**  
  > **What was attempted:** The implementation owner ran the exact repository selftest on repaired current bytes.  
  > **What was observed:** `Research-Lab self-test: 497 passed, 0 failed`; BUG-002 top-level and certification statuses remain `in_progress`, and Feature 006 artifacts were not changed.  
  > **Why this is uncertain:** Only validate may certify BUG-002, and only the parent runner may record the Feature 006 Scope 3 replay.  
  > **What would resolve this:** Validate-owned certification succeeds after independent verification, then the active parent runner executes and records the exact Feature 006 Scope 3 selftest row.
  > **Uncertainty Declaration**
  > **What was attempted:** The repository selftest passed on implementation bytes; no BUG-002 certification field or Feature 006 artifact was changed.
  > **What was observed:** BUG-002 remains In Progress and the parent replay is absent.
  > **Why this is uncertain:** Validate-owned certification and parent-owned replay have not occurred.
  > **What would resolve this:** `bubbles.validate` certifies after independent evidence, followed by the Feature 006 owner's exact blocked-row replay.

> **Historical Planning Evidence Boundary**
> At packet creation every DoD item was unchecked because no implementation, new regression, independent test, validation, audit, or after-fix replay had occurred. [report.md](report.md) preserves that planning evidence and appends implementation evidence separately.
> **Implementation Evidence Boundary**
> Checked items above are implementation-phase claims backed by current-session raw output in [report.md](report.md#scope-01-implementation-resume). The immutable pre-fix replay is recorded, while independent test, validation, audit, certification, and parent replay remain unchecked. SCOPE-01 stays In Progress.
> **Independent Test Evidence Boundary**
> [report.md](report.md#independent-test-phase---2026-07-16) records independent RED/GREEN, full planned matrix, authenticity, integrity, and gate evidence; [the depth-1 corroboration](report.md#depth-1-current-session-corroboration) records this invocation's structured session. Regression, validation, audit, certification, and parent replay remain absent. SCOPE-01 stays In Progress.

## Structured Handoff

```yaml
packet: BUG-002-market-brief-session-date-drift
workflowMode: bugfix-fastlane
currentOwner: bubbles.plan
outcome: route_required
resolvedTransitionId: TR-BUG-002-PLAN-BROWSER-INVENTORY-CARDINALITY-02
nextRequiredOwner: bubbles.test
nextRequiredTarget: TR-BUG-002-TEST-BROWSER-INVENTORY-SNAPSHOT-02
resumeCommand: node --test tests/playwright-runtime.foundation.functional.mjs
resumeAtGateIfGreen: 1
scope: SCOPE-01
scopeStatus: in_progress
implementationPredecessorHunksDelivered: true
browserSharedSeamInventory: 12
browserAssertionMinimumBaseline: 143
browserAssertionAcceptance: replay-local-discovery-identity
browserIdentityDigestRequired: true
protectedReplayHashPathCount: 15
directNodeSuiteInventory: 2
acceptedRollbackHunks: 4
sharedSeamValidationGreen: false
independentTestEvidenceGreen: false
addressedFindingIds:
  - F006-EXT-SELFTEST-MARKET-BRIEF-001
  - BUG002-WRAPPER-ATOMICITY
  - BUG002-REGRESSION-GAP
  - BUG002-DIRTY-BOUNDARY
  - BUG002-RED-EVIDENCE-GAP
  - BUG002-TEST-PROBE-FALSE-POSITIVE
  - BUG002-PLAYWRIGHT-SHARED-SEAM-BASELINE
  - BUG002-BROWSER-IMPORT-ONLY-REPAIR
  - BUG002-NODE-TEST-TAXONOMY-ASSERTION-MISMATCH
  - BUG002-BROWSER-INVENTORY-CARDINALITY-DRIFT
  - BUG002-REPLAY-LOCAL-BROWSER-INVENTORY-SNAPSHOT
unresolvedFindingIds:
  - BUG002-BROAD-E2E-INSTABILITY
  - BUG002-INDEPENDENT-VERIFICATION
  - BUG002-REGRESSION-PHASE
  - BUG002-VALIDATE-CERTIFICATION
  - BUG002-AUDIT-CERTIFICATION
transitionFindingAccounting:
  addressed:
    - BUG002-PLAYWRIGHT-SHARED-SEAM-BASELINE
    - BUG002-BROWSER-IMPORT-ONLY-REPAIR
    - BUG002-NODE-TEST-TAXONOMY-ASSERTION-MISMATCH
    - BUG002-BROWSER-INVENTORY-CARDINALITY-DRIFT
    - BUG002-REPLAY-LOCAL-BROWSER-INVENTORY-SNAPSHOT
  unresolved:
    - BUG002-BROAD-E2E-INSTABILITY
    - BUG002-INDEPENDENT-VERIFICATION
```
