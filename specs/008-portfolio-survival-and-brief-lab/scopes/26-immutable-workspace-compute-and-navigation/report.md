# Scope 26 Report: Immutable Workspace Compute And Navigation

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md)

## Summary

Independent `bubbles.test` verification on 2026-08-23 executed all six exact Scope 26 Test Plan
commands. A concurrent EOF-whitespace normalization changed two carrier hashes after the first
closing sweep, so TP-26-02, TP-26-03, the four-carrier guard, and the canonical selftest were
rerun against the final byte-stable epoch. The six rows ran 210 tests in total and all 210 passed
with zero reported failures or skips. The detailed current-session captures are in
[Independent Test Re-Verification](#independent-test-re-verification-2026-08-23).

This report records execution evidence only. It does not certify Scope 26 and does not change
planning-owned DoD or status fields. During this verification, a concurrent planning owner changed
`scope.md` and `scopes/_index.md` to `Done` and checked the nine DoD items; this agent did not make
those edits. The requested scoped test and quality commands are green in the final epoch, while
the feature-wide linked-test resolver still exits 1 on five Scopes 27-29 references.

The earlier implement-phase record remains below for provenance. Where its completion wording or
quality verdict conflicts with this independent rerun, this summary and the independent rerun
section are the current test-phase findings.

## Decision Record

Compute publication, view-model identity, rebase, deep-link handoff, shared return strip and
focus restoration remained one integration slice, as planned. Splitting them was rejected again
during execution for the reason the plan gave: a return strip that restores focus is only
meaningful if the workspace it returns to is still the same immutable identity, so the handoff
and the compute lifecycle cannot be proven independently.

Two decisions were taken during execution and are recorded because they changed the shape of the
implementation, not merely its internals.

**Decision 1 — the compute token is a fingerprint, not a counter.** The first implementation
issued `"workspace-compute-" + ordinal` from a per-page-load counter. That token is unique only
within one page load: reloading the page resets `ordinal` to zero, so a token minted before a
reload collides with a token minted after it, and a stale compute could satisfy the equality
check against a genuinely newer token. TP-26-03 surfaced the collision on the real page. The
token is now `contracts.fingerprint("workspace-compute-token", { contractVersion, identity,
issuedAt, ordinal })` at `rlportfolio.js:4757-4763`, where `issuedAt` is a wall-clock instant and
supplies the cross-reload uniqueness that `ordinal` alone cannot. Verified across four page loads
with `identity` and `ordinal` held constant: four distinct tokens.

**Decision 2 — publication is one gate, not a set of caller-side checks.** Every supersession
rule is enforced inside `publish(tokenId, viewModel)` in the controller, so no caller can publish
by assembling the checks itself and omitting one. This is what makes the TP-26-05 mutation proof
below decisive: there is exactly one line to delete to reintroduce the stale-publication defect,
and deleting it is caught.

## Completion Statement

Not certified by this test task. TP-26-01 through TP-26-06 pass under independent execution. A
concurrent owner marked the scope and index `Done`; this agent did not alter those planning files.
The structured test handoff still marks all six rows `planned-not-executed`, and TP-26-01,
TP-26-02, and TP-26-06 remain `planned-not-authored`. The feature-wide linked-test resolver also
exits 1 on five references in Scopes 27-29. These findings remain open and are listed in the
independent verification section without changing `scope.md`, `_index.md`, `state.json`, tests,
or source.

## Code Diff Evidence

**Claim Source:** executed (bubbles.implement, this session)

The Scope 26 change set is bounded to the Allowed region of the scope Change Boundary. No
excluded surface was touched: no analytics formula, no behavior ranking, no public publisher, no
provider credential, no registry or docs file, and nothing under `.github/bubbles/`.

```
$ git diff --stat -- portfolio-survival-allocation-lab.html rlnav.js rlportfolio.js \
    tests/portfolio-privacy.functional.mjs tests/portfolio-survival-brief.spec.mjs \
    tests/portfolio-survival-mobile.spec.mjs
 portfolio-survival-allocation-lab.html   | 273 +++++++++++++++++
 rlnav.js                                 | 180 +++++++++++
 rlportfolio.js                           | 493 ++++++++++++++++++++++++++++++-
 tests/portfolio-privacy.functional.mjs   | 158 +++++++++-
 tests/portfolio-survival-brief.spec.mjs  | 101 ++++++-
 tests/portfolio-survival-mobile.spec.mjs |  65 ++++
 6 files changed, 1259 insertions(+), 11 deletions(-)

$ wc -l tests/portfolio-workspace.functional.mjs
347 tests/portfolio-workspace.functional.mjs
```

| File | Role in SCN-008-052 |
|---|---|
| `rlportfolio.js` | `computeWorkspace`, `PortfolioWorkspaceViewModel/v1`, `createWorkspaceComputeController` with the single `publish` gate, rebase acceptance, `writeReturnContext` producer. |
| `rlnav.js` | Additive strict `ReturnContext/v1` consumer from line 307 onward; renders the From Portfolio Brief strip. Guarded so a page with no context allocates no storage and mutates no focus. |
| `portfolio-survival-allocation-lab.html` | Controller and navigation regions wired to the published view model; mode, tab and lens changes are presentation-only. |
| `tests/portfolio-workspace.functional.mjs` | New carrier for TP-26-01 and TP-26-05 (untracked, 347 lines). |
| `tests/portfolio-privacy.functional.mjs` | TP-26-02 ReturnContext strict-contract row appended to the existing privacy suite. |
| `tests/portfolio-survival-brief.spec.mjs` | TP-26-03 real-page regression. |
| `tests/portfolio-survival-mobile.spec.mjs` | TP-26-04 owner-return regression. |

The only production-source edit made by this agent during artifact closure was the deliberate
TP-26-05 mutation, applied and then reverted byte-exactly. Its proof is recorded under
[TP-26-05](#tp-26-05). `rlportfolio.js` hashes identically before and after that proof:
`sha256:8dff1eb6a951633995313222585baa941de074cd3d044c504e1fd94ed22d1c0e`.

## Test Evidence

Six rows, all green. Provenance is tagged per row. Rows executed by the dispatching orchestrator
earlier in this session are labelled as such and carry a re-derivation hint; they are not
restated as this agent's execution.

### TP-26-01

**Claim Source:** executed (bubbles.implement, this session)

Workspace functional evidence: one compute publishes one immutable view model under token,
cancel, last-valid and rebase control.

```
$ node --test tests/portfolio-workspace.functional.mjs
✔ TP-26-01 one workspace compute publishes one immutable view model under token cancel last-valid and rebase control (30.792637ms)
✔ Adversarial: recomputing navigation stale publication and fake return context cannot pass (10.041847ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 187.233807
TP2601_RC=0
```

Exit code 0. 2 tests, 2 passed, 0 failed, 0 skipped, 0 todo. The zero skipped and zero todo
counts matter: this suite is the carrier for both TP-26-01 and TP-26-05, so a silently skipped
adversarial test would otherwise be invisible here.

### TP-26-02

**Claim Source:** executed (bubbles.implement, this session)

ReturnContext functional evidence: strict write, consume, destination, expiry and private-field
contract.

```
$ node --test tests/portfolio-privacy.functional.mjs
... 22 pre-existing privacy rows, all ✔, elided in this excerpt ...
✔ Adversarial: full personal clear detects undeclared keys live state and arbitrary residue (80.407871ms)
✔ TP-26-02 the ReturnContext handoff writes consumes and refuses under a strict closed contract (3.377082ms)
ℹ tests 23
ℹ suites 0
ℹ pass 23
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1730.748195
TP2602_RC=0
```

Exit code 0. 23 tests, 23 passed, 0 failed. The count is the load-bearing part: the 22
pre-existing privacy rows are intact and the new `TP-26-02` ReturnContext row is additive. This
row is placed in the privacy suite deliberately, because the ReturnContext contract is a privacy
boundary — it must carry a destination and an expiry and must never carry a private URL field.

### TP-26-03

**Claim Source:** executed (orchestrator `bubbles.goal`, this session). Not executed by
`bubbles.implement`. Cited with attribution.

Real-page regression: mode tabs, rebase and compute tokens preserve one immutable workspace.

```
$ npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome \
    --grep "Regression: SCN-008-052 mode tabs rebase and compute tokens preserve one immutable workspace" \
    --reporter=list
  1 passed
```

Exit code 0, 1 passed. Observed instrumentation from the run:

| Field | Observed |
|---|---|
| `identity` | `ws.sha256:fb679d5e…` |
| `token` | `sha256:d1c72270…` |
| `computes` | `2` |
| `presentations` | `21` |
| `rebasedIdentity` | `ws.sha256:fb679d5e….sha256:577c7ca1…` |

`computes=2` against `presentations=21` is the assertion that carries this row: twenty-one
presentation resolutions across modes and tabs produced no additional compute. The two computes
are the initial compute and the explicit rebase, which is exactly the planned count. The exact
test title is present at `tests/portfolio-survival-brief.spec.mjs:801` and matches the title
declared in the Test Plan and in `scenario-manifest.json`.

This row also produced the token-collision defect recorded in the Decision Record, and passed
only after the fingerprint fix.

### TP-26-04

**Claim Source:** executed (orchestrator `bubbles.goal`, this session). Not executed by
`bubbles.implement`. Cited with attribution.

Owner-return regression: the owning tool consumes ReturnContext and restores Portfolio Brief
focus.

```
$ npx --no-install playwright test tests/portfolio-survival-mobile.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome \
    --grep "Regression: SCN-008-052 owning tool consumes ReturnContext and restores Portfolio Brief focus" \
    --reporter=list
  1 passed
```

Exit code 0, 1 passed. Observed instrumentation from the run:

| Field | Observed |
|---|---|
| `owner` | `etf-momentum-lab` |
| `destination` | `etf-momentum-lab.html#power` |
| `restored` | `action-row-sha256:34f8c4c0…` |
| `disclosure` | `why-sha256:34f8c4c0…` |
| `privateUrlFields` | `0` |

This row satisfies the scope requirement that same-page assertions alone do not prove owner
return: the assertions are made on the OWNING page (`etf-momentum-lab.html#power`, a different
tool) and again on the RETURN page. `restored` and `disclosure` carry the same
`sha256:34f8c4c0…` digest, which is what proves the restored row and its expanded disclosure are
the original ones rather than a same-shaped rebuild. `privateUrlFields=0` proves the boundary: no
private URL field and no public read datum crossed the handoff. The exact test title is present
at `tests/portfolio-survival-mobile.spec.mjs:147`.

### TP-26-05

**Claim Source:** executed (bubbles.implement, this session), including an applied-and-reverted
source mutation.

Adversarial mutation row. The test asserts that five audited shortcuts are each refused:
disposable per-tab recompute, stale publication, partial rebase, same-page return, and private
URL fields.

Baseline run, by title:

```
$ node --test --test-name-pattern="Adversarial: recomputing navigation stale publication and fake return context cannot pass" tests/portfolio-workspace.functional.mjs
✔ Adversarial: recomputing navigation stale publication and fake return context cannot pass (19.632396ms)
ℹ tests 1
ℹ pass 1
ℹ fail 0
ℹ skipped 0
ℹ todo 0
TP2605_REVERTED_RC=0
```

#### Non-tautology proof: applied mutation, observed failure, byte-exact revert

A passing adversarial test proves nothing on its own — it must be shown to fail when the defect
it audits is present. One audited shortcut was reintroduced in production source, the test was
observed failing, and the mutation was reverted.

**Mutation.** Audited Shortcut 2, stale publication. The single supersession guard was deleted
from the one publication gate in `rlportfolio.js`:

```diff
       if (currentToken === null) return supersededRefusal("no-current-token", "tokenId");
-      if (currentToken.tokenId !== tokenId) return supersededRefusal("token-superseded", "tokenId");
       if (currentToken.state !== "running") return supersededRefusal("token-not-running", "tokenId");
```

**Observed failure with the defect present.** `rlportfolio.js` hashed
`sha256:e8f0c33a6b83dcebc2afd47b6ff198bc298e6fe3dd51ca99dcfc0a15bc4806ae`.

```
$ node --test --test-name-pattern="Adversarial: recomputing navigation stale publication and fake return context cannot pass" tests/portfolio-workspace.functional.mjs
✖ Adversarial: recomputing navigation stale publication and fake return context cannot pass (20.128091ms)
ℹ tests 1
ℹ pass 0
ℹ fail 1

✖ failing tests:
test at tests/portfolio-workspace.functional.mjs:186:1
✖ Adversarial: recomputing navigation stale publication and fake return context cannot pass
  AssertionError [ERR_ASSERTION]: a superseded token must be refused on the token alone, even when its identity still matches

  true !== false

      at TestContext.<anonymous> (file://~/research-lab/tests/portfolio-workspace.functional.mjs:244:10)
    code: 'ERR_ASSERTION',
    actual: true,
    expected: false,
TP2605_MUTATED_RC=1
```

Exit code 1. The failing assertion is the one written specifically to defeat a tautology: it
issues two computes for the SAME identity, so the independent identity check still matches and
cannot mask the missing token check. Had the test only covered the differing-identity case, the
identity guard would have caught the mutation and this row would have passed with the defect
present — an inert assertion. It did not. The test failed at exactly the intended line.

**Revert and re-verification.** The guard was restored and the file hashes identically to its
pre-mutation state:

```
$ sha256sum rlportfolio.js
8dff1eb6a951633995313222585baa941de074cd3d044c504e1fd94ed22d1c0e  rlportfolio.js
```

That digest equals the pre-mutation baseline recorded before the proof began, so the revert is
byte-exact and left no residue. The post-revert run above (`TP2605_REVERTED_RC=0`) confirms the
row passes again.

Only Shortcut 2 was mutated. The remaining four audited shortcuts are asserted by this row but
were not individually mutation-proven in this session; that limitation is declared under
[Uncertainty Declarations](#uncertainty-declarations) rather than presented as proven.

### TP-26-06

**Claim Source:** executed (orchestrator `bubbles.goal`, this session). Not executed by
`bubbles.implement`. Cited with attribution.

Shared-shell consumer canary across six existing `rlnav.js` consumers from the Scope 16 command
catalog.

```
$ npx --no-install playwright test tests/causal-rotation-lab.spec.mjs \
    tests/bond-regime-lab.spec.mjs tests/fx-regime-relative-value-lab.spec.mjs \
    tests/palm-springs-rental-market-lab.spec.mjs tests/trend-dynamics-cycle-lab.spec.mjs \
    tests/technical-analysis-decision-lab.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --reporter=list
  182 passed (2.0m)
```

Exit code 0, 182 passed. This is the row that protects the `rlnav.js` blast radius: the
ReturnContext consumer is additive and strict, so six unrelated tools that never write a
ReturnContext must be entirely unaffected. Recorded as an `evidence-capture.sh` block with digest
`sha256:b29895a0df9c4c9e8957183b4a205ab706b7b3a10cad41baffadafe780b1d005` and re-derivable with:

```
bash .github/bubbles/scripts/evidence-capture.sh --verify b29895a0df9c4c9e8957183b4a205ab706b7b3a10cad41baffadafe780b1d005 -- <command>
```

## Uncertainty Declarations

- **Four of five audited shortcuts are asserted but not mutation-proven.** TP-26-05 asserts
  refusal of five shortcuts; this session mutation-proved only Shortcut 2 (stale publication).
  Shortcuts 1, 3, 4 and 5 (disposable recompute, partial rebase, same-page return, private URL
  fields) pass their assertions, but their non-tautology was not demonstrated by applied mutation
  here. Their assertions read as defect-shaped on inspection, which is an interpretation, not an
  execution result. Declared rather than claimed.
- **`scenario-manifest.json` carries stale `planStatus` values for Scope 26.** Both entries in
  `linkedTestContracts` for SCN-008-052 still read `"planStatus": "planned-not-authored"`, while
  both linked tests are now authored, titled exactly as declared, and passing (TP-26-03 at
  `tests/portfolio-survival-brief.spec.mjs:801`, TP-26-04 at
  `tests/portfolio-survival-mobile.spec.mjs:147`). This agent is scope-barred from editing
  `scenario-manifest.json`, so the drift is reported, not corrected. Routed to the manifest
  owner. It does not affect any TP row result.
- **Three of six rows are cited, not re-executed by this agent.** TP-26-03, TP-26-04 and TP-26-06
  were executed by the dispatching orchestrator earlier in this same session. They are recorded
  with explicit attribution and, for TP-26-06, a re-derivable capture digest. A reader who
  requires single-agent provenance for the Playwright rows should re-run the three commands.
- No planning uncertainty remains. `PortfolioWorkspaceViewModel/v1`, the compute token, rebase
  and `ReturnContext/v1` are all implemented against their stated contracts.

## Scenario Contract Evidence

SCN-008-052 is a stable specification and manifest contract. Its manifest entry declares
`gherkinHash: sha256:42f7ac5c367a9f1b45460c7a6bf51b32f07e718731303b519d5d5eec452d743c`,
`behaviorClass: ui`, `changeType: changed`, `riskTier: high`, `regressionRequired: true`, and
`requiredTestTypes: [functional, e2e-ui]`. Both required test types are satisfied and executed.

Every declared obligation is carried by an executed row:

| Behavior trait | Required proof | Satisfied by | Executed |
|---|---|---|---|
| `mutable-state` | Token, active, draft, last-valid, rebase, ReturnContext, disclosure and focus state survive the complete navigation round trip. | TP-26-01, TP-26-02, TP-26-03, TP-26-04 | Yes |
| `user-visible-ui` | The production route and real owning page expose one identity, visible return strip, restored disclosure and restored focus. | TP-26-03, TP-26-04 | Yes |
| `shared-consumer` | Feature 008 and ordinary `rlnav` consumers preserve their current routes, history and no-context behavior. | TP-26-02 parity, TP-26-06 | Yes |
| `degraded-state` | Cancelled, failed, obsolete, malformed, expired or wrong-destination state preserves the last valid view and removes invalid context. | TP-26-01, TP-26-05 | Yes |
| `return-time-ordering` | Only the newest matching token may publish at return, and a delayed obsolete completion cannot mutate the published view. | TP-26-03, TP-26-05 | Yes |

The manifest `negativeControlMechanism` is `mutation`. That control was exercised for the
stale-publication case and is recorded under [TP-26-05](#tp-26-05); the remaining four are
declared as asserted-not-mutation-proven above.

`testMechanism.entrypoint` is `production-route` with `assertionSurface: visible-ui` and
`dependencyPath: same-origin-real`. TP-26-03 and TP-26-04 satisfy this: both drive the real page
under `--project=system-chrome` with no request interception.

## Coverage Report

Coverage is expressed as scenario-clause coverage, which is the unit this scope is specified in.
Every clause of the SCN-008-052 Then-block maps to an executed assertion.

| SCN-008-052 clause | Executed proof |
|---|---|
| Mode and tab navigation render the active view model without recomputing analytics | TP-26-03 `computes=2` against `presentations=21`; TP-26-01 projector counter unchanged across all tabs in both modes |
| Only the newest matching compute token may publish while last-valid results remain visible | TP-26-01 publication gate; TP-26-05 `P008-COMPUTE-SUPERSEDED` on both differing-identity and same-identity retry |
| An explicit rebase atomically replaces every sibling projection under one identity | TP-26-03 `rebasedIdentity`; TP-26-05 `P008-REBASE-PARTIAL` for every member of `WORKSPACE_SIBLING_PROJECTIONS` |
| ReturnContext is consumed by the owning destination and renders a visible From Portfolio Brief return strip | TP-26-04 `owner=etf-momentum-lab`, `destination=etf-momentum-lab.html#power`; TP-26-02 strict consume contract |
| Returning restores the original action disclosure and keyboard focus without private URL or public read data | TP-26-04 `restored` and `disclosure` sharing `sha256:34f8c4c0…`, `privateUrlFields=0` |

Requirement coverage: FR-067 and FR-154 are carried by the compute-and-publish rows; NFR-002,
NFR-012 and NFR-013 are carried by the immutability, privacy-boundary and shared-consumer rows.
Finding F008-COMPUTE-NAV-001 is closed by the combination of TP-26-01, TP-26-03 and TP-26-05.

## Consumer Impact Sweep

| Consumer | Required proof | Result |
|---|---|---|
| Portfolio Brief action rows | Write fixed destination plus session context; no private URL fields. | TP-26-02 and TP-26-04. `privateUrlFields=0` observed on the real handoff. |
| Six sibling hashes | Render one active identity and maintain browser history. | TP-26-03. 21 presentation resolutions, one identity, no recompute. |
| Owning Research Lab tools | `rlnav.js` displays and consumes only matching ReturnContext. | TP-26-04 on `etf-momentum-lab.html#power`, a real owning tool that is not the Portfolio route. |
| Shared navigation without context | No strip, no storage allocation, no focus mutation. | TP-26-06. 182 assertions across six consumers that never write a ReturnContext, all green. |
| Tests, docs and deep links | Zero stale `#workspace`; canonical feature entry is `#brief`. | TP-26-05 refuses `tab: 'workspace'` with `P008-WORKSPACE-COMPUTE` rather than lazily computing it. |

No consumer required a change to accommodate this scope. The `rlnav.js` addition is strictly
additive and gated on a matching `ReturnContext/v1` record, which is why the six-consumer canary
is unaffected.

## Shared Infrastructure And Rollback Evidence

| Protected surface | Blast radius | Independent canary | Result |
|---|---|---|---|
| Route controller compute lifecycle | All six tabs and editors | Mode and tab operations do not call compute or acquire; a stale token cannot publish. | TP-26-01, TP-26-03, TP-26-05 |
| `rlnav.js` shared shell | Every registered tool | Ordinary navigation and no-context pages remain unchanged. | TP-26-06, 182 passed |
| ReturnContext session storage | Portfolio and owning tools | Wrong-destination, expired and malformed records are ignored and consumed safely. | TP-26-02 |
| Browser history and focus | Deep links and Back | Public hashes only; action, disclosure and focus restore exactly. | TP-26-04 |

Rollback properties, as planned and as implemented:

- The active view model is preserved until a matching rebase validates. Cancellation and
  navigation never clear it; `lastValidViewModel` is retained and asserted by TP-26-01.
- A refused publication leaves the workspace unpublished rather than half-published. TP-26-05
  asserts `retryController.snapshot().activeViewModel === null` after a refused first publication.
- A partial rebase is refused whole with `P008-REBASE-PARTIAL`, so there is no state in which
  some siblings are new and others stale.
- The `rlnav.js` behavior sits behind strict context validation on an additive branch, so
  reverting that branch restores prior shared navigation exactly.
- The mutation proof in [TP-26-05](#tp-26-05) is itself a rollback demonstration: a production
  source change was applied and reverted to a byte-identical
  `sha256:8dff1eb6a951633995313222585baa941de074cd3d044c504e1fd94ed22d1c0e`.

## Lint And Quality

**Claim Source:** executed (bubbles.implement, this session)

The implement-phase evidence below is retained as historical execution. The independent
test-phase verdict is controlling for this invocation: selftest, artifact lint, and
`git diff --check` are green in the final epoch.

Research Lab is build-free. The canonical project check is `node scripts/selftest.mjs`, which
enforces registry and navigation parity, model invariants and the shared-shell contracts.

### Build Quality Gate — Current Session 2026-08-23

```
$ node scripts/selftest.mjs
  ✓ registering the route preserved identical relative order across tools.json, index.html and rlnav.js
  ✓ the staging decisions are removed now that the route is reachable, so the pages build ships it
  ✓ the route owns exactly one simple-model definition and its journey definitions match its declared references
  ✓ the design of record exists
  ✓ the note resolves the route, the config and the exact validation command
  ... remaining assertions elided in this excerpt ...
================================================
Research-Lab self-test: 3302 passed, 0 failed
================================================
SELFTEST_RC=0
```

Exit code 0. 3302 passed, 0 failed. Zero skips and zero warnings.

Build Quality Gate items:

| Item | Result |
|---|---|
| Canonical selftest | 3302 passed, 0 failed, exit 0 |
| Registry and navigation parity | Enforced by selftest, green |
| Zero skipped or todo tests in scope suites | TP-26-01 `skipped 0 todo 0`; TP-26-02 `skipped 0 todo 0` |
| Excluded-file changes | None. Diff bounded to the Allowed surface; see [Code Diff Evidence](#code-diff-evidence) |
| Framework-managed files | Untouched. Nothing under `.github/bubbles/`, `.github/agents/bubbles*`, `.github/prompts/bubbles.*`, `.github/instructions/bubbles-*` or `.github/skills/bubbles-*` was modified |
| Production-source residue from artifact closure | None. `rlportfolio.js` hash restored byte-exactly after the TP-26-05 proof |

## Spot-Check Recommendations

- Finish an obsolete compute after the newer one on the real page and assert no DOM or state
  mutation, complementing the unit-level supersession proof.
- Mutation-prove the remaining four audited shortcuts individually, closing the uncertainty
  declared above.
- Validate ReturnContext on a second owning tool and via browser Back, in addition to the
  `etf-momentum-lab` path already covered.
- Re-run TP-26-03, TP-26-04 and TP-26-06 under single-agent provenance if the reviewer requires
  every row executed by one owner.

## Validation Summary

Independent test verdict: all six Test Plan rows pass, the canonical selftest passes with
3302/3302 assertions, the four-carrier regression-quality guard reports zero violations and
warnings, the live carriers contain zero interception matches, the PII scan reports zero
findings, artifact lint passes, and `git diff --check` exits 0.

A concurrent planning owner changed Scope 26 and its index row to `Done` during this verification.
This agent did not change those fields. The spec remains `in_progress`; Scope 26 execution
progress is `done`, while its validate-owned certification progress remains `not_started`.
Certification fields were deliberately not changed by this agent.

## Audit Verdict

Not yet audited. This report is the execution record submitted for validation and audit.

## Independent Test Re-Verification - 2026-08-23

This section is owned by `bubbles.test`. All commands below ran in the current session. It does
not change a DoD checkbox, scope status, state, or certification field.

### Execution Epoch

**Phase:** test
**Claim Source:** executed
**Command:** `npx --no-install playwright --version && sha256sum portfolio-survival-allocation-lab.html rlnav.js rlportfolio.js tests/portfolio-workspace.functional.mjs tests/portfolio-privacy.functional.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-mobile.spec.mjs`
**Exit Code:** 0

```text
Version 1.61.1
75bbcc0bfca9d314211022a7e3974d21331ebda25f5680510045fa4df3d19dbe  portfolio-survival-allocation-lab.html
033e5e111ed4c6c54f4b7b1151087dc46d50bf78683775cdbe4d6ff1fa2d0efe  rlnav.js
8dff1eb6a951633995313222585baa941de074cd3d044c504e1fd94ed22d1c0e  rlportfolio.js
d9c3ea33bd4ef0bc082cca894bab551dddbf6bd46996f394e0f9a79c218f511c  tests/portfolio-workspace.functional.mjs
0545d7adb142e560821a4b7048c7f6a26529e467ffd9ce4aba1dd8f51f61b0de  tests/portfolio-privacy.functional.mjs
bae24fcbdcf7b22fe3754a72f962ee8aaca8c4dda4afc8197af3352558ded3b4  tests/portfolio-survival-brief.spec.mjs
ca5736035c7af95d54186ef8eb2fd8223ee39b49f86171aa379055e6c76d5ed5  tests/portfolio-survival-mobile.spec.mjs
EPOCH_HASH_EXIT=0
```

The first closing sweep observed the privacy and brief carriers at SHA-256
`01f7dfe2e7afdf48966319f99736bb97ac495ad5d016252c6f1260649b55f117` and
`1b11f62d2027530e5e798fcab03d78ec9a8da50629badae6010071ac5ec87f58`, plus one
EOF-whitespace finding in each. A concurrent session normalized those endings. All other hashes
remained unchanged, and the two affected TP rows plus the carrier guard and selftest were rerun
against the final hashes shown above.

### Independent TP-26-01

**Phase:** test
**Claim Source:** executed
**Command:** `node --test tests/portfolio-workspace.functional.mjs`
**Exit Code:** 0
**Capture:** 22 lines, SHA-256 `1313e4e1572bf87e46fb5fcd6649ca2b8d1a5dbe9fca83e2f312fc7e686cc159`

```text
TAP version 13
# Subtest: TP-26-01 one workspace compute publishes one immutable view model under token cancel last-valid and rebase control
ok 1 - TP-26-01 one workspace compute publishes one immutable view model under token cancel last-valid and rebase control
  ---
  duration_ms: 24.694771
  type: 'test'
  ...
# Subtest: Adversarial: recomputing navigation stale publication and fake return context cannot pass
ok 2 - Adversarial: recomputing navigation stale publication and fake return context cannot pass
  ---
  duration_ms: 9.58855
  type: 'test'
  ...
1..2
# tests 2
# suites 0
# pass 2
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 134.092903
```

### Independent TP-26-02

**Phase:** test
**Claim Source:** executed
**Command:** `node --test tests/portfolio-privacy.functional.mjs`
**Exit Code:** 0
**Capture:** 148 lines, SHA-256 `ea278a08c84c1e94afdcc0f8a865bea5cc783241e96e52f06e823f7be61d01bf`

```text
TAP version 13
# Subtest: real-format import previews commits reloads and exports one local revision
ok 1 - real-format import previews commits reloads and exports one local revision
  ---
  duration_ms: 63.106774
  type: 'test'
  ...
# Subtest: secret-bearing import is redacted and cannot mutate any storage namespace
ok 2 - secret-bearing import is redacted and cannot mutate any storage namespace
  ---
  duration_ms: 20.739493
  type: 'test'
  ...
... 108 lines omitted; the capture SHA-256 covers the full output ...
ok 22 - Adversarial: full personal clear detects undeclared keys live state and arbitrary residue
  ---
  duration_ms: 64.146669
  type: 'test'
  ...
# Subtest: TP-26-02 the ReturnContext handoff writes consumes and refuses under a strict closed contract
ok 23 - TP-26-02 the ReturnContext handoff writes consumes and refuses under a strict closed contract
  ---
  duration_ms: 2.558687
  type: 'test'
  ...
1..23
# tests 23
# suites 0
# pass 23
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1534.615076
```

### Independent TP-26-03

**Phase:** test
**Claim Source:** executed
**Command:** `npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-052 mode tabs rebase and compute tokens preserve one immutable workspace" --reporter=list`
**Exit Code:** 0
**Capture:** 8 command-output lines, SHA-256 `c8ed5af65b61d01113af718d53bb0bec5303f2aa5815c9cb3f0f87ab63e2c5dd`

```text
Running 1 test using 1 worker

[TP-26-03] identity=ws.sha256:fb679d5e3a75bc90b6506e23f790f5f4be0ee7f968a6371a0c237ba752517f1f.sha256:5a4469ff7e5b1b9af44510814a30348c78a722 token=sha256:b315c3aac25aff91899e787191e2d40d370e5e9788d13c86d42a7745f5c97b33 computes=2
[TP-26-03] presentations=21 rebasedIdentity=ws.sha256:fb679d5e3a75bc90b6506e23f790f5f4be0ee7f968a6371a0c237ba752517f1f.sha256:577c7ca14ddc3c78e6de370a75460477941648
  1 [system-chrome] tests/portfolio-survival-brief.spec.mjs:801:1 Regression: SCN-008-052 mode tabs rebase and compute tokens preserve one immutable workspace (3.9s)

  1 passed (6.1s)
```

The wrapper metadata plus the full command output above form a 10-plus-line evidence block. The
test directly reports `computes=2`, `presentations=21`, the original token, and the rebased
identity.

### Independent TP-26-04

**Phase:** test
**Claim Source:** executed
**Command:** `npx --no-install playwright test tests/portfolio-survival-mobile.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-052 owning tool consumes ReturnContext and restores Portfolio Brief focus" --reporter=list`
**Exit Code:** 0
**Capture:** 8 command-output lines, SHA-256 `9aa545d372c4d233fb18182f75e1654392867707540928776b01d458d6a3c6ef`

```text
Running 1 test using 1 worker

[TP-26-04] owner=etf-momentum-lab action=sha256:34f8c4c0cba65d29668c5c92277d85f7408d04f983f1ec304231430419c64769 destination=etf-momentum-lab.html#power
[TP-26-04] restored=action-row-sha256:34f8c4c0cba65d29668c5c92277d85f7408d04f983f1ec304231430419c64769 disclosure=why-sha256:34f8c4c0cba65d29668c5c92277d85f7408d04f983f1ec304231430419c64769 privateUrlFields=0
  1 [system-chrome] tests/portfolio-survival-mobile.spec.mjs:147:1 Regression: SCN-008-052 owning tool consumes ReturnContext and restores Portfolio Brief focus (2.8s)

  1 passed (5.2s)
```

The wrapper metadata plus the full command output above form a 10-plus-line evidence block. The
test directly reports the real owning route, matching restored action/disclosure identity, and
zero private URL fields.

### Independent TP-26-05

**Phase:** test
**Claim Source:** executed
**Command:** `node --test --test-name-pattern="Adversarial: recomputing navigation stale publication and fake return context cannot pass" tests/portfolio-workspace.functional.mjs`
**Exit Code:** 0
**Capture:** 16 lines, SHA-256 `f864a3e2c83565468bf97bea39142306a42434579c93f2271e4801ed4a9c8911`

```text
TAP version 13
# Subtest: Adversarial: recomputing navigation stale publication and fake return context cannot pass
ok 1 - Adversarial: recomputing navigation stale publication and fake return context cannot pass
  ---
  duration_ms: 22.319182
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 143.158047
```

### Independent TP-26-06

**Phase:** test
**Claim Source:** executed
**Command:** `npx --no-install playwright test tests/causal-rotation-lab.spec.mjs tests/bond-regime-lab.spec.mjs tests/fx-regime-relative-value-lab.spec.mjs tests/palm-springs-rental-market-lab.spec.mjs tests/trend-dynamics-cycle-lab.spec.mjs tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Capture:** 572 lines, SHA-256 `4f141d890e34cffdbefc4177f880c5cd570c0d52dd0512e6a9a077b89224f984`

```text
Running 182 tests using 4 workers

  2 [system-chrome] tests/causal-rotation-lab.spec.mjs:36:1 Regression: served causal contracts preserve explicit stale and unavailable states (79ms)
  5 [system-chrome] tests/causal-rotation-lab.spec.mjs:47:1 Regression: Evidence available after a decision is excluded from that decision (718ms)
  4 [system-chrome] tests/fx-regime-relative-value-lab.spec.mjs:35:1 Browser functional source envelopes match in browser and CommonJS for one decisionTime (1.0s)
  6 [system-chrome] tests/causal-rotation-lab.spec.mjs:60:1 Regression: One announcement drives price options and ETF activity (516ms)
[SCN-005-002] truth=INVALID CONFIGURATION
[SCN-005-002] code=PBRM-CONFIG-FETCH
[SCN-005-002] configRequests=1
[SCN-005-002] payloadRequests=0
[SCN-005-002] ownerReadPublished=false
[SCN-005-002] substituteOutputs=0
... 532 lines omitted; the capture SHA-256 covers the full output ...
  178 [system-chrome] tests/bond-regime-lab.spec.mjs:980:1 TP-06-06 SCN-018-038 the parity line renders exactly one of three verdicts with its compared-field count, and silence is never agreement (6.0s)
[SCN-007-023] registeredRoute=ok publishedIdentity=tad-read:a0e6fc8874f2b09a84d18
  179 [system-chrome] tests/technical-analysis-decision-lab.spec.mjs:1412:1 Regression: SCN-007-023 imported labels stay text and sanitized export omits sensitive state (556ms)
[SCN-007-032] scenarioTitles=32 fixtures=18 rlvalid=7 interception=none
  180 [system-chrome] tests/technical-analysis-decision-lab.spec.mjs:1445:1 Regression: SCN-007-032 complete Feature 007 protected matrix remains executable (4.9s)
  181 [system-chrome] tests/bond-regime-lab.spec.mjs:1005:1 TP-06-07 Regression: the parity line survives an absent comparison and a Differ verdict is not dismissible, collapsible or snoozable (4.7s)
  182 [system-chrome] tests/bond-regime-lab.spec.mjs:1025:1 TP-05-08 Regression: every publication state stays readable with colour removed and at 200% zoom (4.1s)

  182 passed (1.6m)
```

### Independent Integrity And Quality Findings

#### Four-carrier regression-quality guard

**Phase:** test
**Claim Source:** executed
**Command:** `bash .github/bubbles/scripts/regression-quality-guard.sh tests/portfolio-workspace.functional.mjs tests/portfolio-privacy.functional.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-mobile.spec.mjs`
**Exit Code:** 0
**Capture:** 18 lines, SHA-256 `17e3bad81ef8464f751eab74a178ad6f4632d317aa8be632840c2fd10b123a6c`

```text
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Repo: ~/research-lab
  Timestamp: 2026-08-23T06:46:09Z
  Bugfix mode: false
============================================================

Scanning tests/portfolio-workspace.functional.mjs
Scanning tests/portfolio-privacy.functional.mjs
Scanning tests/portfolio-survival-brief.spec.mjs
Asserts the current surface in tests/portfolio-survival-brief.spec.mjs (mixed inspection accepted)
Scanning tests/portfolio-survival-mobile.spec.mjs
Asserts the current surface in tests/portfolio-survival-mobile.spec.mjs (mixed inspection accepted)

============================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 4
============================================================
```

The repository path is rendered with `~/` to satisfy the committed-surface PII rule; the capture
hash covers the original unredacted command output.

#### Anti-interception, epoch, and whitespace checks

**Phase:** test
**Claim Source:** executed
**Command:** `grep -nE 'page\.route\(|context\.route\(|cy\.intercept\(|msw|nock|wiremock|intercept\(' tests/portfolio-workspace.functional.mjs tests/portfolio-privacy.functional.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-mobile.spec.mjs`
**Exit Code:** 1 (expected no-match result)
**Command:** `sha256sum portfolio-survival-allocation-lab.html rlnav.js rlportfolio.js tests/portfolio-workspace.functional.mjs tests/portfolio-privacy.functional.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-mobile.spec.mjs`
**Exit Code:** 0
**Command:** `git diff --check`
**Exit Code:** 0

```text
ANTI_INTERCEPTION_GREP_EXIT=1
ANTI_INTERCEPTION_MATCHES=0
75bbcc0bfca9d314211022a7e3974d21331ebda25f5680510045fa4df3d19dbe  portfolio-survival-allocation-lab.html
033e5e111ed4c6c54f4b7b1151087dc46d50bf78683775cdbe4d6ff1fa2d0efe  rlnav.js
8dff1eb6a951633995313222585baa941de074cd3d044c504e1fd94ed22d1c0e  rlportfolio.js
d9c3ea33bd4ef0bc082cca894bab551dddbf6bd46996f394e0f9a79c218f511c  tests/portfolio-workspace.functional.mjs
0545d7adb142e560821a4b7048c7f6a26529e467ffd9ce4aba1dd8f51f61b0de  tests/portfolio-privacy.functional.mjs
bae24fcbdcf7b22fe3754a72f962ee8aaca8c4dda4afc8197af3352558ded3b4  tests/portfolio-survival-brief.spec.mjs
ca5736035c7af95d54186ef8eb2fd8223ee39b49f86171aa379055e6c76d5ed5  tests/portfolio-survival-mobile.spec.mjs
EPOCH_HASH_EXIT=0
FINAL_GIT_DIFF_CHECK_EXIT=0
```

The zero interception matches preserve the live `e2e-ui` classification. The repeated epoch
hashes plus the targeted reruns prove every TP result against the final source/carrier bytes.
The initial EOF-whitespace findings were removed by a concurrent session; this invocation did
not edit the test files.

#### Initial repository selftest and isolated cause

**Phase:** test
**Claim Source:** executed
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 1
**Capture:** 3,738 lines, SHA-256 `cf0198d3d85b5baf8d409c7d084f116b26124694c4a48ca91054f313bd50d633`

```text
Step 1 security - escaped model sinks and CSP on every page
  every shipped HTML page carries a Content-Security-Policy meta
  all pages use one identical CSP instead of drifting per page
  CSP keeps the single-file inline-script design while defaulting to self
  CSP blocks object, base-tag, and form exfiltration paths
  CSP connect-src is an explicit origin allowlist, never wildcard https
  CSP preserves fixed providers, StockAnalysis, and custom-port tailnet proxy paths
  CSP allows no open URL-forwarding relay origin
  production pages and shared runtime contain no open URL-forwarding relay chain
  no model/config-authored field reaches innerHTML without esc()
  the sink detector catches an unescaped model-authored title
... 3,698 lines omitted; the capture SHA-256 covers the full output ...
  FAIL: committed surface carries no personal identifier
================================================
Research-Lab self-test: 3301 passed, 1 failed
================================================
```

The owning scanner was then executed directly:

**Command:** `node scripts/pii-scan.mjs`
**Exit Code:** 1
**Capture:** 5 lines, SHA-256 `d841b3fc3dfeb83f851428ed4f6e0d9d7a646cf3ab6e53f1b8f58942a4e397de`

```text
[pii-scan] scopes/008-portfolio-survival-and-brief-lab/scopes/26-immutable-workspace-compute-and-navigation/report.md:290:42 rule=home-path length=13
[pii-scan] files=9275 messages=1847 findings=1 FAIL
[pii-scan] The matched text is withheld on purpose - printing it would copy the identifier into CI logs.
[pii-scan] Open each cited line. Remove the identifier, or add a reasoned entry to scripts/pii-scan.config.json "allow".
[pii-scan] A git-message:<sha> finding lives in a commit message, not a file - it needs a history rewrite, not an edit.
```

The finding was confined to the report-local historical stack trace and was corrected in this
allowed report edit. The canonical selftest was then rerun against the edited report.

**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Capture:** 3,733 lines, SHA-256 `c2c2b29f51cca286f4014cdc5607444c058206b399f2c95a13eb0ae842e6dc22`

```text
Step 1 security - escaped model sinks and CSP on every page
  every shipped HTML page carries a Content-Security-Policy meta
  all pages use one identical CSP instead of drifting per page
  CSP keeps the single-file inline-script design while defaulting to self
  CSP blocks object, base-tag, and form exfiltration paths
  CSP connect-src is an explicit origin allowlist, never wildcard https
  CSP preserves fixed providers, StockAnalysis, and custom-port tailnet proxy paths
  CSP allows no open URL-forwarding relay origin
  production pages and shared runtime contain no open URL-forwarding relay chain
  no model/config-authored field reaches innerHTML without esc()
  the sink detector catches an unescaped model-authored title
... 3,693 lines omitted; the capture SHA-256 covers the full output ...
  the default lower-risk profile returns candidates against the committed bars rather than an empty table (7 cleared at the shortest horizon, 7 at the longest)
  reward-to-risk is horizon-invariant because sigma cancels in k over m, so the floor admits the same names at every horizon
  the sessions-per-year local is not named spy, which the same scope would otherwise share with the SPY ticker it iterates

================================================
Research-Lab self-test: 3302 passed, 0 failed
================================================
```

**Command:** `node scripts/pii-scan.mjs`
**Exit Code:** 0
**Capture:** 1 command-output line, SHA-256 `a82a4fb94d84475a16774a7bd0238d70318e93bfbb0194b3a1133a354cd0a901`

```text
[pii-scan] files=9275 messages=1847 findings=0 OK
```

The command metadata and output above record the post-merge scanner result; the earlier one-line
failure no longer reproduces.

#### Feature artifact lint

**Phase:** test
**Claim Source:** executed
**Command:** `bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab`
**Exit Code:** 0
**Capture:** 406 lines, SHA-256 `ed9142d7152044254040019b1b8b5bda8eb2f0e069f511acdd675c357cff0950`

```text
Required artifact exists: spec.md
Required artifact exists: design.md
Required artifact exists: uservalidation.md
Required artifact exists: state.json
Required artifact exists: scopes/_index.md
Per-scope layout contains 29 scope file(s)
Scope report exists: scopes/01-private-portfolio-import-and-atomic-store/report.md
Scope report exists: scopes/02-mandate-and-cash-need-authority/report.md
Scope report exists: scopes/03-local-behavior-privacy-inventory-and-clear/report.md
Scope report exists: scopes/04-public-evidence-barrier-and-coverage/report.md
... 366 lines omitted; the capture SHA-256 covers the full output ...
No unfilled evidence template placeholders in scopes/23-stress-dependence-and-hedge-effectiveness/report.md
No unfilled evidence template placeholders in scopes/24-complete-allocation-and-explicit-views/report.md
No unfilled evidence template placeholders in scopes/25-decision-time-dossier-and-immutable-audit/report.md
No unfilled evidence template placeholders in scopes/26-immutable-workspace-compute-and-navigation/report.md
No unfilled evidence template placeholders in scopes/27-accessible-six-tab-interaction/report.md
No unfilled evidence template placeholders in scopes/28-spec-driven-adversarial-test-replacement/report.md
No unfilled evidence template placeholders in scopes/29-documentation-and-registry-truth/report.md

=== End Anti-Fabrication Checks ===

Artifact lint PASSED.
```

#### Linked-test resolution and planning drift

**Phase:** test
**Claim Source:** interpreted
**Interpretation:** The resolver checked 65 linked references and reported no SCN-008-052
failure, so both Scope 26 linked titles resolve. Its nonzero exit belongs to five references for
SCN-008-053 through SCN-008-055, outside Scope 26.
**Command:** `bash .github/bubbles/scripts/scenario-test-resolve.sh specs/008-portfolio-survival-and-brief-lab`
**Exit Code:** 1
**Capture:** 13 lines, SHA-256 `723327b218dfcffa9a30f924ce7f6f5a52af0551311e00acc93146a9a69a7d9c`

```text
scenario-test-resolve: FAIL - linked tests that do not resolve (Gate G057)
  MISSING-FILE: SCN-008-053 -> tests/portfolio-survival-accessibility.spec.mjs
    no such file under the repository root
  MISSING-FILE: SCN-008-053 -> tests/portfolio-survival-accessibility.spec.mjs
    no such file under the repository root
  MISSING-TITLE: SCN-008-053 -> tests/portfolio-survival-mobile.spec.mjs#Regression: SCN-008-053 zoom mobile and long content have no overlap clipping or body overflow
    the referenced file contains no test with this exact title
  MISSING-FILE: SCN-008-054 -> tests/portfolio-test-integrity.unit.mjs
    no such file under the repository root
  MISSING-TITLE: SCN-008-055 -> tests/portfolio-survival-brief.spec.mjs#Regression: SCN-008-055 every published Feature 008 entry opens the Portfolio Brief workspace
    the referenced file contains no test with this exact title

scenario-test-resolve: 5 unresolved reference(s) of 65 checked.
```

The concurrent planning pass changed both SCN-008-052 `linkedTestContracts` in
`scenario-manifest.json` to `authored`, and changed TP-26-03 through TP-26-05 in `test-plan.json`
to `authored`. Remaining planning drift is exact: TP-26-01, TP-26-02, and TP-26-06 still declare
`planned-not-authored`, and all six Test Plan rows still declare `planned-not-executed` despite
their passing evidence above. Those planning-owned fields remain unchanged by this test evidence
task.
