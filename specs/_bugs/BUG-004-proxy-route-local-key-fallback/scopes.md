# Scopes: BUG-004 Proxy Route Local-Key Fallback

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) | [report.md](report.md) | [uservalidation.md](uservalidation.md)

## Execution Outline

### Phase Order

1. **SCOPE-01 - Same-provider ordered fallback:** establish the pre-fix RED,
   implement the one-helper repair, and prove every FR-2 failure class plus the
   credential and collateral boundaries before certification.

### New Types And Signatures

- Public signatures: none.
- Storage schemas and keys: unchanged.
- Provider registry entries: unchanged.
- Private production seam: one helper equivalent to
  `directProviderFetch(spec, provider, pathQuery) -> Promise<parsed JSON>`.
- Existing public contract retained:
  `providerFetch(provider, urlOrPath) -> Promise<parsed JSON>`.
- Existing test wrapper retained:
  `loadRldata({ fetch })` supplies the deterministic external boundary used by
  functional tests.

### Validation Checkpoints

1. `bubbles.test` records a scenario-specific pre-fix RED for TP-01 before any
   production source edit.
2. Focused functional checks TP-01 through TP-07 establish proxy order,
   complete FR-2 failure handling, the one-attempt same-provider bound,
   fail-closed behavior, force-local behavior, and secret containment.
3. Unit check TP-08 preserves unknown and prototype-shaped provider defenses.
4. Browser check TP-09 verifies only the real local browser settings/status
   integration; it is not evidence of live third-party provider transport.
5. Boundary check TP-10 proves the option snapshot pipeline and completed
  BUG-002 packet are unchanged.
6. TP-11 through TP-13 provide the harness compatibility, intercepted browser,
  and complete build-free regressions before `bubbles.validate` certifies.

### Ordering Rationale

This bug is one vertical repair in the shared provider-access foundation. A
second scope would separate tests from the behavior they specify or separate
security assertions from the transport branch that could leak the key. The
single scope remains gated: RED proof first, implementation second, focused
GREEN proof third, broad regression and certification last.

## Scope Inventory

| Scope | Outcome | Surfaces | Test Rows | Foundation Dependency | Status |
|---|---|---|---:|---|---|
| SCOPE-01 | Reachable proxy provider-route failures make one same-provider direct attempt without credential disclosure | `rldata.js`, provider credential tests/support | 14 | BUG-002 `SCOPE-01` provider-access foundation | Done |

## SCOPE-01: Same-Provider Ordered Transport Fallback

**Status:** Done

**Depends On:** Existing provider-access foundation
`specs/_bugs/BUG-002-two-tier-provider-access`, `SCOPE-01` (`foundation:true`).

**Capability Role:** `concrete-overlay` - BUG-004 repairs one fallback branch
inside the completed BUG-002 provider-access foundation. It does not create a
second transport owner or claim a new capability foundation.

**Foundation Reference:** `foundation:true` belongs to BUG-002 `SCOPE-01`; this
scope consumes that foundation as a concrete repair overlay.

### Gherkin Scenarios

The authoritative scenarios are `SCN-BUG004-001` through
`SCN-BUG004-004` in [spec.md](spec.md#scenarios) and
[scenario-manifest.json](scenario-manifest.json).

#### SCN-BUG004-001 - Reachable proxy route failure falls back to the same provider

```gherkin
Scenario: SCN-BUG004-001 Reachable proxy route failure falls back to the same provider
Given the proxy health endpoint returns 200
And a local key exists for finnhub
And the finnhub proxy route fails by non-2xx HTTP, transport rejection,
timeout rejection, or JSON decode rejection
When providerFetch requests a finnhub quote
Then the proxy provider route is attempted before the direct provider host
And exactly one direct request targets the registered finnhub host
And the direct host's distinct structural response is returned
And the local key appears in no proxy URL or observable diagnostic surface
```

#### SCN-BUG004-002 - Proxy route failure without a local key remains fail closed

```gherkin
Scenario: SCN-BUG004-002 Proxy route failure without a local key remains fail closed
Given the proxy health endpoint returns 200
And no local key exists for finnhub
And the finnhub proxy route returns 503 PROVIDER_KEY_MISSING
When providerFetch requests a finnhub quote
Then no direct provider request is made
And the call rejects with sanitized error PROVIDER_KEY_MISSING:finnhub
And no proxy response body, request URL, or credential is disclosed
```

#### SCN-BUG004-003 - Force-local bypasses a reachable proxy provider route

```gherkin
Scenario: SCN-BUG004-003 Force-local bypasses a reachable proxy provider route
Given a reachable proxy and a local key for finnhub
When force-local is enabled and providerFetch requests a finnhub quote
Then no proxy provider route is requested
And the same private direct-tier helper returns the direct response
And the browser status surface remains masked
```

#### SCN-BUG004-004 - Unknown providers remain inert

```gherkin
Scenario: SCN-BUG004-004 Unknown providers remain inert
Given an unknown or prototype-shaped provider identifier
When providerFetch or provider configuration is attempted
Then the operation fails with UNKNOWN_PROVIDER semantics
And built-in prototypes, provider config, and transport history are unchanged
```

### Implementation Plan

1. `bubbles.test` adds the adversarial TP-01 functional case against unchanged
   production code and records the required pre-fix RED.
2. `bubbles.implement` extracts one private direct-tier helper in `rldata.js`.
   The helper alone owns same-provider local-key lookup, registered direct URL
   construction, direct `fetchT`, JSON decode, and sanitized direct errors.
3. `bubbles.implement` keeps the proxy request keyless and proxy-first, catches
   only the proxy provider-route attempt, and invokes the helper once for each
   FR-2 route failure class. A direct-helper rejection is terminal.
4. Proxy-unreachable and force-local paths use the same helper. Provider route
   failure does not mutate proxy health state and cannot select another
   provider.
5. `bubbles.test` executes the focused functional, unit, browser-status,
   boundary, and build-free regression rows in their listed order.
6. `bubbles.validate` checks scenario evidence, Test Plan-to-DoD parity,
   credential containment, exact changed paths, and protected collateral before
   writing certification state.

### Implementation Files

#### SCOPE-01 Paths

- `rldata.js`
- `tests/provider-credentials.functional.mjs`
- `tests/provider-credentials.unit.mjs`
- `tests/provider-fallback-status.spec.mjs`
- `tests/provider-credentials.support.mjs`

### Change Boundary

#### Allowed file families

Allowed production file:

- `rldata.js`

Allowed test files:

- `tests/provider-credentials.functional.mjs`
- `tests/provider-credentials.unit.mjs`
- `tests/provider-fallback-status.spec.mjs` as the dedicated no-interception
  local-browser status regression
- `tests/provider-credentials.support.mjs` for two surgical test-only seams:
  deterministic timer/abort injection through `loadRldata` for TP-03 and a
  loopback HTTP proxy-health server for TP-09. Existing default loading,
  storage, static-server, and external-fetch injection behavior remains intact.

Read-only validation surfaces:

- `tests/provider-credentials.spec.mjs`
- `scripts/selftest.mjs`

#### Excluded surfaces

- all tool HTML except read-only browser execution of the existing data-settings
  surface
- provider registry additions, removals, host changes, or key-parameter changes
- all option data and option acquisition surfaces listed below
- all completed BUG-002 artifacts

No dependency, public API, storage shape, config key, UI control, provider, or
data format change is authorized.

### Shared Infrastructure Impact Sweep

`tests/provider-credentials.support.mjs` is a shared credential harness. Its
timer injection and loopback proxy-health server must be additive narrow seams,
not a wholesale rewrite. The preserved downstream contracts are:

- `rldata.js` executes inside the same VM/browser-like storage context;
- injected external `fetch` calls remain observable in exact order;
- callers that omit timer options continue to use the existing runtime timers;
- local and session storage isolation remains per test;
- provider config and force-local controls retain their current setup surface;
- `startStaticServer()` keeps its current signature and static-file behavior;
- unit, functional, and browser credential suites continue to load unchanged.

TP-11 and TP-12 are independent harness canaries. Rollback removes the additive
test seams and restores the private helper/catch change as one unit; it must not
alter browser provider configuration or any snapshot artifact.

### Protected Collateral Boundaries

- `data/options/**`
- `scripts/fetch-options.mjs`
- `options-structure-lab.html::fetchChainPages` snapshot-first ordering
- `options-flow-feed-lab.html::ensureChain` cache, snapshot, then live ordering
- `specs/_bugs/BUG-002-two-tier-provider-access/**`
- `rldata.js::proxied` Yahoo behavior

### Error, Security, And Observability Contract

- Missing same-provider key: `PROVIDER_KEY_MISSING:<provider>`.
- Direct HTTP, transport, timeout, or decode failure:
  `PROVIDER_REQUEST_FAILED:<provider>`.
- Unknown and prototype-shaped provider identifiers fail before config or
  transport access.
- Raw URLs, response bodies, caught error messages, and local keys are never
  copied into surfaced errors, status/access objects, DOM text, logs, or tool
  reads.
- The sentinel key may appear only in the captured direct HTTPS URL targeting
  the registered host; tests report boolean containment results rather than the
  sentinel value.

### Test Classification Contract

TP-01 through TP-07 use deterministic external-boundary interception through
the production-loaded `loadRldata({ fetch })` wrapper. They are `functional`,
not live transport tests. TP-09 is scenario-specific `e2e-ui` only because a
dedicated test with no `page.route` or `context.route` drives the real local
browser settings/status integration against a loopback HTTP proxy-health
server. TP-12 deliberately classifies the existing intercepted Playwright file
as `functional`. No Test Plan row claims live third-party provider E2E coverage.

### Test Plan

| ID | Test Type | Category | Scenario | File | Exact Behavior / Expected Test Title | Command | Live System |
|---|---|---|---|---|---|---|---|
| TP-01 | Functional adversarial RED/GREEN - HTTP | `functional` | SCN-BUG004-001 | `tests/provider-credentials.functional.mjs` | Parameterized non-2xx responses include 503 `PROVIDER_KEY_MISSING` and another non-2xx status; exact order is health, keyless proxy route, one same-provider direct host; distinct direct structure is returned | `node --test tests/provider-credentials.functional.mjs` | No - deterministic external boundary |
| TP-02 | Functional adversarial RED/GREEN - transport | `functional` | SCN-BUG004-001 | `tests/provider-credentials.functional.mjs` | Proxy provider-route `fetch` rejection invokes one same-provider direct request; raw transport error is absent from the result and rejection surfaces | `node --test tests/provider-credentials.functional.mjs` | No - deterministic external boundary |
| TP-03 | Functional adversarial RED/GREEN - timeout | `functional` | SCN-BUG004-001 | `tests/provider-credentials.functional.mjs`, `tests/provider-credentials.support.mjs` | The existing timeout-bearing wrapper contract is observed deterministically as a proxy-route timeout rejection, then one same-provider direct request succeeds; no wall-clock external provider call is used | `node --test tests/provider-credentials.functional.mjs` | No - deterministic external boundary |
| TP-04 | Functional adversarial RED/GREEN - JSON decode | `functional` | SCN-BUG004-001 | `tests/provider-credentials.functional.mjs` | Proxy HTTP success followed by `json()` rejection invokes one same-provider direct request and returns its distinct parsed structure | `node --test tests/provider-credentials.functional.mjs` | No - deterministic external boundary |
| TP-05 | Functional same-provider and one-attempt bound | `functional` | SCN-BUG004-001 | `tests/provider-credentials.functional.mjs` | With multiple provider keys present, only the requested provider's registered host and key parameter are used; there is one proxy route and at most one direct attempt with no retry or provider substitution | `node --test tests/provider-credentials.functional.mjs` | No - deterministic external boundary |
| TP-06 | Functional fail-closed and secret containment | `functional` | SCN-BUG004-002 | `tests/provider-credentials.functional.mjs` | Proxy 503 plus no finnhub key makes zero direct requests and rejects exactly `PROVIDER_KEY_MISSING:finnhub`; proxy body, URLs, other-provider keys, status/access JSON, errors, logs, and tool reads disclose no key | `node --test tests/provider-credentials.functional.mjs` | No - deterministic external boundary |
| TP-07 | Functional force-local preservation | `functional` | SCN-BUG004-003 | `tests/provider-credentials.functional.mjs` | Force-local bypasses the proxy provider route, uses the same registered-host direct behavior, and performs one direct attempt | `node --test tests/provider-credentials.functional.mjs` | No - deterministic external boundary |
| TP-08 | Unit provider-boundary defense | `unit` | SCN-BUG004-004 | `tests/provider-credentials.unit.mjs` | Unknown, `__proto__`, `constructor`, and `prototype` identifiers fail before provider config or transport access and do not mutate built-in prototypes or transport history | `node --test tests/provider-credentials.unit.mjs` | No |
| TP-09 | Scenario-specific Regression E2E UI | `e2e-ui` | SCN-BUG004-003 | `tests/provider-fallback-status.spec.mjs` | Regression: expected title `SCN-BUG004-003 force-local status stays masked with a reachable local proxy`; a real browser and loopback HTTP health server establish reachable-proxy status, then force-local renders the masked local tier with no key in DOM, status, tool-read, console, page-error, URL, cookie, or history text; the test contains no request interception and does not call a third-party provider | `npx --no-install playwright test tests/provider-fallback-status.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-BUG004-003 force-local status stays masked with a reachable local proxy" --reporter=list` | Yes - local browser/application and loopback HTTP surfaces only |
| TP-10 | Protected-boundary diff canary | `functional` | SCN-BUG004-001, SCN-BUG004-003 | Protected paths listed above | The implementation change set contains no byte change in `data/options/**`, `scripts/fetch-options.mjs`, both option-tool snapshot-order functions, or completed BUG-002 artifacts | `git diff --exit-code -- data/options scripts/fetch-options.mjs options-structure-lab.html options-flow-feed-lab.html specs/_bugs/BUG-002-two-tier-provider-access` | No |
| TP-11 | Fixture Canary | `functional` | SCN-BUG004-001 through SCN-BUG004-004 | `tests/provider-credentials.unit.mjs`, `tests/provider-credentials.functional.mjs`, `tests/provider-credentials.support.mjs` | Canary: existing loader, isolated storage, injected-fetch ordering, provider config, and force-local setup contracts remain compatible after the additive timeout and loopback-health seams | `node --test tests/provider-credentials.unit.mjs tests/provider-credentials.functional.mjs` | No |
| TP-12 | Existing intercepted browser regression | `functional` | SCN-BUG004-003, SCN-BUG004-004 | `tests/provider-credentials.spec.mjs` | Existing data-settings editor, proxy-status, force-local, clear-all, disclosure, and prototype-defense checks remain green; because the file uses `context.route`, this row is deterministic browser-functional coverage, not live transport or `e2e-ui` evidence | `npx --no-install playwright test tests/provider-credentials.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | No - browser request boundary is intercepted |
| TP-13 | Full build-free regression | `functional` | SCN-BUG004-001 through SCN-BUG004-004 | `scripts/selftest.mjs` | Complete Research Lab selftest passes without changing option snapshots, provider registry semantics, or completed BUG-002 behavior | `node scripts/selftest.mjs` | No |
| TP-14 | Broad Regression E2E UI | `e2e-ui` | SCN-BUG004-003 | `tests/provider-fallback-status.spec.mjs` | Regression: run the complete no-interception BUG-004 browser file, without a title filter, to protect the full local browser/application and loopback-health surface while making no external-provider transport claim | `npx --no-install playwright test tests/provider-fallback-status.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes - local browser/application and loopback HTTP surfaces only |

### Definition of Done - Tiered Validation

#### Core Outcomes

- [x] A pre-fix TP-01 RED proves the reachable-proxy terminal branch before production source changes. -> Evidence: [report.md#bug-reproduction---before-fix](report.md#bug-reproduction---before-fix)
- [x] One private direct-tier helper exclusively owns same-provider key lookup, registered direct URL construction, direct fetch/decode, and sanitized direct errors. -> Evidence: [report.md#private-direct-helper-exclusivity-and-call-graph](report.md#private-direct-helper-exclusivity-and-call-graph)
- [x] Proxy provider routing remains keyless and first unless force-local is active; every FR-2 proxy-route failure class can invoke exactly one same-provider direct attempt. -> Evidence: [report.md#tp-01-through-tp-08---exact-focused-rows](report.md#tp-01-through-tp-08---exact-focused-rows)
- [x] Missing local key, direct failure, and unknown-provider outcomes remain fail closed with the specified sanitized errors. -> Evidence: [report.md#focused-and-broad-product-verification](report.md#focused-and-broad-product-verification)
- [x] Independent canary suite for shared fixture/bootstrap contracts passes before broad suite reruns; TP-09, TP-11, and TP-12 also prove local keys remain absent from the planned browser, status, diagnostic, and tool-read surfaces. -> Evidence: [report.md#tp-11---credential-harness-canary](report.md#tp-11---credential-harness-canary), [report.md#current-system-chrome-scenario-replay](report.md#current-system-chrome-scenario-replay)
- [x] Rollback or restore path for shared infrastructure changes is documented and verified; protected option paths, snapshot-first ordering, Yahoo proxied behavior, provider registry semantics, and completed BUG-002 artifacts remain byte-unchanged. -> Evidence: [report.md#in-memory-pre-fix-rollback-discriminator](report.md#in-memory-pre-fix-rollback-discriminator), [report.md#tp-11-post-boundary-rollback-canary](report.md#tp-11-post-boundary-rollback-canary)
- [x] Change Boundary is respected and zero excluded file families were changed. -> Evidence: [report.md#git-backed-non-artifact-diff-inventory](report.md#git-backed-non-artifact-diff-inventory), [report.md#protected-and-excluded-boundary-proof](report.md#protected-and-excluded-boundary-proof)

#### Test Evidence - 14 Items For 14 Test Plan Rows

- [x] DOD-TP-01 (TP-01, SCN-BUG004-001) Reachable proxy route failure falls back to the same provider for the HTTP non-2xx adversarial RED/GREEN case. -> Evidence: [report.md#bug-reproduction---before-fix](report.md#bug-reproduction---before-fix), [report.md#tp-01-through-tp-08---exact-focused-rows](report.md#tp-01-through-tp-08---exact-focused-rows)
- [x] DOD-TP-02 (TP-02) transport-rejection adversarial RED/GREEN passes. -> Evidence: [report.md#tp-01-through-tp-08---exact-focused-rows](report.md#tp-01-through-tp-08---exact-focused-rows)
- [x] DOD-TP-03 (TP-03) deterministic timeout-rejection adversarial RED/GREEN passes. -> Evidence: [report.md#tp-01-through-tp-08---exact-focused-rows](report.md#tp-01-through-tp-08---exact-focused-rows)
- [x] DOD-TP-04 (TP-04) JSON-decode-rejection adversarial RED/GREEN passes. -> Evidence: [report.md#tp-01-through-tp-08---exact-focused-rows](report.md#tp-01-through-tp-08---exact-focused-rows)
- [x] DOD-TP-05 (TP-05) same-provider and one-attempt bound passes. -> Evidence: [report.md#tp-01-through-tp-08---exact-focused-rows](report.md#tp-01-through-tp-08---exact-focused-rows)
- [x] DOD-TP-06 (TP-06, SCN-BUG004-002) Proxy route failure without a local key remains fail closed and preserves secret containment. -> Evidence: [report.md#tp-01-through-tp-08---exact-focused-rows](report.md#tp-01-through-tp-08---exact-focused-rows)
- [x] DOD-TP-07 (TP-07) force-local preservation regression passes. -> Evidence: [report.md#tp-01-through-tp-08---exact-focused-rows](report.md#tp-01-through-tp-08---exact-focused-rows)
- [x] DOD-TP-08 (TP-08, SCN-BUG004-004) Unknown providers remain inert, including prototype-shaped identifiers. -> Evidence: [report.md#tp-01-through-tp-08---exact-focused-rows](report.md#tp-01-through-tp-08---exact-focused-rows)
- [x] Scenario-specific E2E regression tests for every new/changed/fixed behavior pass: DOD-TP-09 (TP-09) verifies the no-interception browser settings/status behavior without claiming live external-provider transport. -> Evidence: [report.md#tp-09---no-interception-local-browser-e2e](report.md#tp-09---no-interception-local-browser-e2e)
- [x] DOD-TP-10 (TP-10) protected-boundary diff canary passes. -> Evidence: [report.md#tp-10---protected-boundary-diff](report.md#tp-10---protected-boundary-diff)
- [x] DOD-TP-11 (TP-11) credential harness canary passes. -> Evidence: [report.md#tp-11---credential-harness-canary](report.md#tp-11---credential-harness-canary)
- [x] DOD-TP-12 (TP-12) existing intercepted browser regression passes as functional evidence. -> Evidence: [report.md#tp-12---intercepted-functional-browser-regression](report.md#tp-12---intercepted-functional-browser-regression)
- [x] DOD-TP-13 (TP-13) full build-free regression passes. -> Evidence: [report.md#tp-13---full-build-free-regression](report.md#tp-13---full-build-free-regression)

#### Build Quality Gate

- [x] Broader E2E regression suite passes (DOD-TP-14, TP-14); planning, source,
  test, and scenario artifacts remain synchronized; changed-path classification,
  regression-quality checks, artifact lint, traceability, capability-foundation,
  implementation-reality, exact transition, required phase provenance, and the
  independent delivery audit all satisfy their current contracts. -> Evidence:
  [report.md#independent-delivery-completion-audit---2026-07-23t025545z](report.md#independent-delivery-completion-audit---2026-07-23t025545z),
  [report.md#independent-validation-replay---2026-07-23t010611z](report.md#independent-validation-replay---2026-07-23t010611z)
  > **Uncertainty Declaration**
  > **What was attempted:** `bubbles.test` executed the exact unfiltered TP-14 command, the post-boundary TP-11 rollback canary, and the current test-owned quality checks; implementation and analyst evidence remain linked from their owning sections.
  > **What was observed:** TP-14 passes 1/1 with zero skips under its local browser/application plus loopback-health taxonomy; rollback reproduction and TP-11 pass; 20 of 21 DoD items are checked. The exact transition guard still requires foreign-owned specialist provenance, scope-completion routing, and the independent delivery audit.
  > **Why this is uncertain:** A green TP-14 cannot satisfy missing `bugfix-fastlane` phase provenance, the independent audit, or validate-owned certification embedded in this combined Build Quality item.
  > **What would resolve this:** `bubbles.audit` resumes the interrupted independent `delivery-completion-v1` audit; audit and validate retain ownership of the final Build Quality decision, scope completion, and any scope/top-level transition.
  > **Resolution:** Independent audit attempt `audit-attempt-20260723T025545Z` completed, adjudicated all 42 evidence-signal warnings as supported, addressed routing drift and `VAL-BUG004-008`, and routed only `VAL-BUG004-002` and `VAL-BUG004-003` to `bubbles.validate`. Validation consumed that linted packet and synchronized this final item with the completed audit and scope evidence. See [report.md#independent-delivery-completion-audit---2026-07-23t025545z](report.md#independent-delivery-completion-audit---2026-07-23t025545z).

### Execution Routing

All 21 DoD items are evidence-backed and Scope 01 is `Done`. The independent
`delivery-completion-v1` audit completed and delegated only the final combined
Build Quality and scope/certification synchronization to `bubbles.validate`:

1. Execution claims already record `implement`, `test`, `regression`,
  `simplify`, `gaps`, `harden`, `stabilize`, `security`, and `validate`; none
  of those completed phases is routed for re-execution.
2. `bubbles.audit` completed attempt `audit-attempt-20260723T025545Z`, retained
  the immutable `REWORK_REQUIRED` transcript, and routed the two validate-owned
  closure findings without requesting technical re-execution.
3. `bubbles.validate` completed the certification and top-level status decision
  only after the exact contract-bound transition command exited zero.

No production, test, provider, option, dependency, or framework artifact is
changed by this closure.
