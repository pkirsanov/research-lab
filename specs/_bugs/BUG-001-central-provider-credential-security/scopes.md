# Scopes: BUG-001 Central Provider Credential Security

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) | [report.md](report.md) | [uservalidation.md](uservalidation.md)

## Ownership Status

**Authoritative owner:** `bubbles.plan`  
**Workflow mode:** `bugfix-fastlane`  
**Plan outcome:** `in_progress`  
**Implementation dispatch allowed:** `true`  
**Next required owner:** `bubbles.implement`

The active execution contract follows the corrected [spec.md](spec.md) and [design.md](design.md): credentials may exist only in closure-private memory for one future eligible loaded document that owns both collection and a fully authorized request. Legacy handling is erase-only. Detection uses exact registered names and metadata; dismissal is inert; confirmed cleanup deletes whole credential-bearing containers after destructive-effect disclosure and verifies name absence only. No active path may read, parse, hash, compare, copy, stage, migrate, selectively rewrite, or activate a legacy value, even with consent. No current production provider is eligible.

[spec.md](spec.md), [design.md](design.md), source, tests, historical [report.md](report.md) evidence, and `state.json.certification` are foreign-owned and are not modified by this plan. Stable contracts remain `SCN-BUG001-001` through `SCN-BUG001-011`. The Playwright plan has 12 active literal titles because SCN-BUG001-001 has both a bootstrap canary and a persistent regression. Every active title and assertion states the current-document, erase-only contract directly.

## Execution Outline

### Phase Order

1. **SCOPE-01 (`foundation:true`):** Replace serialized credentials and raw-value APIs with one closed current-document runtime, clear it at every lifecycle boundary, and reject malformed identifiers without mutation.
2. **SCOPE-02:** Detect registered legacy containers by name and metadata only, disclose destructive effects, support inert dismissal, erase whole containers, and verify name absence.
3. **SCOPE-03:** Confine a future eligible credential to one document that owns both collection and an authorized request, while removing every tool-local consumer and transfer bridge.
4. **SCOPE-04:** Keep every current production provider disabled; prove the future controlled request path is exact-origin, header-only, one-attempt, and disclosure-free.
5. **SCOPE-05:** Close G028 and the blind spot one-to-one while preserving `rlData`, BUG-013 routing, `F004-COLLISION-001`, dirty hunks, and provider/Bond/Causal/FX canaries.

No later scope starts until the preceding scope is Done with item-specific evidence.

### New Types And Signatures

- `DocumentCredentialRuntime`: closure-private null-prototype credential map owned by exactly one loaded document; no serialized shape or transferable representation.
- `ProviderPolicy`: frozen closed record binding provider, exact document, CSP profile, operation, exact origin, authorization evidence, and header transport.
- `LegacyLocationPolicy`: exact opaque container name plus storage class, provider ID, redacted location class, and destructive-effect disclosure ID; no decoder or field path.
- `CredentialStatusResult`, `CredentialMutationResult`, `LegacyPresenceSummary`, `LegacyEraseResult`, `ClearAllResult`, and `ProviderResult`: frozen non-secret records only.
- `credentialStatus(providerId)`, `authorizeCredential(providerId, credential)`, `useCredential(providerId, operationId, params)`, `clearCredential(providerId)`, `clearAllCredentials()`, `detectLegacyCredentialLocations()`, and `eraseLegacyCredentialLocations()`.
- Removed contracts: serialized credential envelope, credential storage adapter, raw getter/bulk map, legacy value API, arbitrary URL/header builder, tool-local helper, current index credential field, and cross-document channel.

### Validation Checkpoints

- Before any implementation/test edit, capture complete `git status --short`, tracked index OID, worktree SHA-256, and distinct hunk hashes; compare `scripts/selftest.mjs` with Feature 004 hash `ab27e89cd0dd8c6dd640254615a10d15a2be008596ec72834ca4512766c646fc`; stop on ambiguity.
- SCOPE-01 gates SCOPE-02 on no serialized store/raw API, complete lifecycle clearing, own-property rejection, and the real-index bootstrap canary.
- SCOPE-02 gates SCOPE-03 on zero legacy value access, inert dismissal, whole-container erasure, name-absence verification, memory-first clear, and byte-compatible non-secret `rlData`.
- SCOPE-03 gates SCOPE-04 on same-document ownership, registry-derived zero-tool-surface coverage, and zero transfer through every named browser bridge.
- SCOPE-04 gates SCOPE-05 on disabled production providers, one controlled header attempt, and an empty disclosure scan.
- SCOPE-05 closes only after G028/BUG-013 accounting, exact collision disposition, provider/Bond/Causal/FX canaries, and broader regressions.

| Scope | Outcome | Depends On | Surfaces | Status |
| --- | --- | --- | --- | --- |
| SCOPE-01 | Current-document runtime foundation, lifecycle clearing, and closed identifiers | None | Shared runtime, index bootstrap, unit/functional/E2E | Not Started |
| SCOPE-02 | Metadata-only legacy cleanup and memory-first clear-all | SCOPE-01 | Runtime, cleanup UX, functional/E2E/stress | Not Started |
| SCOPE-03 | Same-document ownership, tool consumer purge, and zero transfer | SCOPE-02 | Index, tools, navigation, support harness, E2E/load | Not Started |
| SCOPE-04 | Fail-closed production providers, controlled header transport, and disclosure safety | SCOPE-03 | Policy, request path, unit/functional/E2E/stress | Not Started |
| SCOPE-05 | G028 collision, cache, and cross-feature closure | SCOPE-04 | Scanner ledger, selftest, collision, provider/Bond/Causal/FX | Not Started |

## Test Taxonomy Applicability

| Category | Applicability | Reason |
| --- | --- | --- |
| unit | Required | Memory lifetime, own-property lookup, policy, reason codes, request construction |
| functional | Required | Lifecycle clearing, zero-value-access cleanup, deletion ordering, partial erasure, controlled transport |
| integration | Required | Real shared scripts, browser storage APIs, index DOM, non-secret cache |
| ui-unit | Not applicable | No component-test runtime; UI uses the real static page |
| e2e-api | Not applicable | No first-party service API exists for this browser capability |
| e2e-ui | Required | The live static site owns 12 scenario-specific Playwright cases with active erase-only titles |
| stress | Required | Repeated detect/dismiss/erase/clear/request/failure cycles must stay bounded |
| load | Required | Parallel pages and contexts must start empty and expose no bridge |

No project `testImpact` or `traceContracts` map is configured; G079/G080 planning rows are not applicable.

## Protected Change Boundary

Allowed implementation paths are `rldata.js`, credential-owned hunks in `rlapp.js`, `index.html`, and proven consumers, BUG-001 assertions in `scripts/selftest.mjs`, and `tests/provider-credentials.{support,unit,functional,spec,stress,load}.mjs`. Every other current dirty or untracked path is protected, including installed framework files, package/source-lock files, generated payload/history/universe files, Market Brief, Bond, Causal, FX, Palm Springs, Trend Dynamics, distributed-brief work, unrelated docs/specs/tests, and every pre-existing hunk outside exact BUG-001 symbols.

No stash, reset, clean, checkout overwrite, staging, commit, broad formatting, whole-file replacement, generated-data refresh, dependency installation, or unrelated cleanup is authorized. A newly proven consumer requires a plan-owner boundary update. Rollback uses an inverse patch only for verified BUG-001 hunks; ambiguity leaves provider transport disabled and files untouched.

## Scope 1: SCOPE-01 Current-Document Runtime Foundation

**Status:** In Progress  
**Depends On:** None  
**Scope-Kind:** runtime-behavior  
**Tags:** foundation:true

### Gherkin Scenarios - SCOPE-01

```gherkin
Scenario: SCN-BUG001-001 - One shared current-document capability owns credential behavior
  Given every registered Research Lab page is available
  When the index and every tool source and live page are inspected
  Then no page defines a tool-local credential editor getter setter writer store or request broker
  And one shared capability owns current-document status authorization use clear and erase-only cleanup

Scenario: SCN-BUG001-002 - Every lifecycle and document boundary clears configured state
  Given a controlled eligible credential is configured in the current loaded document
  When reload route navigation bfcache page navigation close reopen new tab new window iframe or new context is exercised
  Then every resulting or restored document is unconfigured
  And no URL message worker cookie opener storage history DOM or browser bridge carries the credential

Scenario: SCN-BUG001-005 - Unknown identifiers fail without mutation
  Given the runtime and frozen registry have a known baseline
  When unknown empty inherited constructor and prototype-shaped identifiers are supplied
  Then each call returns a safe unknown-provider reason
  And runtime policy storage surfaces and prototypes remain unchanged
```

### UI Scenario Matrix - SCOPE-01

| Scenario | Steps | Expected visible result | Test |
| --- | --- | --- | --- |
| Shared owner | Open index and every registered tool | Non-secret status/cleanup only; zero credential editor outside a future eligible consuming document | e2e-ui |
| Lifecycle matrix | Configure the controlled eligible fixture and exercise every named boundary | Every resulting document reports unconfigured | functional/e2e-ui |
| Rogue identifiers | Invoke all unknown and prototype-shaped identifier variants | Closed safe rejection with unchanged visible status | unit/e2e-ui |

### Implementation Plan - SCOPE-01

1. Add scenario-first failures for serialized storage, raw APIs, lifecycle survival, browser bridges, and rogue identifiers.
2. Replace credential persistence with one closure-private null-prototype `CredentialRuntime` per loaded document.
3. Freeze a complete provider registry and return closed status/error records from own-property lookups.
4. Remove every envelope, raw getter/bulk map, storage handle, public header/request object, and transfer representation.
5. Clear application-reachable references on route/history/pagehide and every document lifecycle boundary; independent realms always start empty.
6. Render only non-secret provider status and cleanup on index; every current provider rejects before credential collection.
7. Run bootstrap, non-secret `rlData`, and collision canaries before SCOPE-02.

### Shared Infrastructure Impact Sweep - SCOPE-01

- Protected shared contracts: `RLDATA` boot order, `RLAPP` status mount, current-document state, route/pagehide handling, provider own-property lookup, and test storage instrumentation.
- Downstream consumers: `index.html`, `rlnav.js`, every `tools.json` page, `scripts/selftest.mjs`, and all provider credential suites.
- Independent canaries: real-index RLDATA-before-RLAPP load, schema-1 `rlData` round-trip, provider unit/functional suites, and `F004-COLLISION-001` identity.
- Rollback: inverse only verified BUG-001 hunks after rechecking index OIDs, worktree hashes, and unrelated hunk hashes; ambiguity leaves transport disabled and files untouched.

### Change Boundary - SCOPE-01

SCOPE-01 inherits the exact [Protected Change Boundary](#protected-change-boundary). It may touch only credential-owned hunks in the named shared runtime/index/test families. All generated data, foreign specs, installed framework files, and unrelated dirty hunks remain excluded.

### Test Plan - SCOPE-01

| ID | Type | Category | Scenario | File / exact test title | Required assertion | Exact command | Live |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S1-T01 | Unit regression | unit | SCN-BUG001-001 | `tests/provider-credentials.unit.mjs` - `SCN-BUG001-001 current-document runtime has no serialized store or raw credential API` | No serialized form, raw getter, storage adapter, bulk map, or transferable credential object exists. | `node --test tests/provider-credentials.unit.mjs` | No |
| S1-T02 | Unit adversarial | unit | SCN-BUG001-005 | `tests/provider-credentials.unit.mjs` - `SCN-BUG001-005 unknown and prototype-shaped providers preserve runtime and prototypes` | Every rogue ID returns `UNKNOWN_PROVIDER` without state, registry, storage, or prototype mutation. | `node --test tests/provider-credentials.unit.mjs` | No |
| S1-T03 | Functional regression | functional | SCN-BUG001-002 | `tests/provider-credentials.functional.mjs` - `SCN-BUG001-002 every lifecycle signal clears current-document memory` | Route, history, pagehide, and clear hooks remove all reachable references; a new realm starts empty. | `node --test tests/provider-credentials.functional.mjs` | No |
| S1-T04 | Canary E2E | e2e-ui | SCN-BUG001-001 | `tests/provider-credentials.spec.mjs` - `Canary BUG-001: real index loads shared status and erase controls with no credential editor` | The real index loads RLDATA before RLAPP and exposes non-secret status/cleanup with zero current credential input. | `npx --no-install playwright test tests/provider-credentials.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| S1-T05 | Regression E2E adversarial | e2e-ui | SCN-BUG001-001 | `tests/provider-credentials.spec.mjs` - `Regression BUG-001: one shared current-document capability owns every credential surface` | Registry-derived source and live-page inspection finds one shared owner, no tool-local credential API, and no current index credential input. | `npx --no-install playwright test tests/provider-credentials.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| S1-T06 | Regression E2E adversarial | e2e-ui | SCN-BUG001-002 | `tests/provider-credentials.spec.mjs` - `Regression BUG-001: every lifecycle and document boundary starts unconfigured` | Reload, route/history, bfcache, HTML navigation, close/reopen, tab, window, iframe, and context boundaries expose no configured state or bridge payload. | `npx --no-install playwright test tests/provider-credentials.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| S1-T07 | Regression E2E adversarial | e2e-ui | SCN-BUG001-005 | `tests/provider-credentials.spec.mjs` - `Regression BUG-001: unknown and prototype-shaped providers fail without mutation` | Browser-visible state and built-in prototypes remain unchanged for every rogue ID variant. | `npx --no-install playwright test tests/provider-credentials.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

### Definition of Done - SCOPE-01 Tiered Validation

- [x] SCN-BUG001-001 - Credential behavior is confined to the shared current-document capability with one owner and no tool-local or persisted credential surface. → Evidence: [Final GREEN replay](report.md#final-green-replay)
- [x] SCN-BUG001-002 - Every lifecycle and document boundary begins unconfigured and transfers no credential through any browser bridge. → Evidence: [Final GREEN replay](report.md#final-green-replay)
- [x] SCN-BUG001-005 - Unknown and prototype-shaped identifiers are rejected without runtime, policy, storage-surface, or prototype mutation. → Evidence: [Final GREEN replay](report.md#final-green-replay)
- [ ] Shared bootstrap impact, inverse-hunk rollback, and excluded-path preservation are verified against the just-in-time baseline.
  > **Uncertainty Declaration**
  > **What was attempted:** Captured target status, index OIDs, worktree hashes, full diffs, path-scoped diff check, and pre/post Feature 004 collision output.
  > **What was observed:** The full pre-edit diff was retained only as terminal-wrapped text, four `rldata.js` hunk identities are no longer distinct, and protected `scripts/selftest.mjs` changed concurrently without an edit call from this invocation.
  > **Why this is uncertain:** Distinct pre-edit hunk-body hashes and complete excluded-path byte identity cannot be proven from the retained baseline.
  > **What would resolve this:** An authoritative pre-edit snapshot or owner-approved replacement collision/boundary baseline.
- [x] S1-T01 passes with current raw evidence. → Evidence: [Final GREEN replay](report.md#final-green-replay)
- [x] S1-T02 passes with current raw evidence. → Evidence: [Final GREEN replay](report.md#final-green-replay)
- [x] S1-T03 passes with current raw evidence. → Evidence: [Final GREEN replay](report.md#final-green-replay)
- [x] S1-T04 passes with current raw evidence. → Evidence: [Final GREEN replay](report.md#final-green-replay)
- [x] S1-T05 passes with current raw evidence. → Evidence: [Final GREEN replay](report.md#final-green-replay)
- [x] S1-T06 passes with current raw evidence. → Evidence: [Final GREEN replay](report.md#final-green-replay)
- [x] S1-T07 passes with current raw evidence. → Evidence: [Final GREEN replay](report.md#final-green-replay)
- [ ] Build Quality Gate: focused checks, the full credential Playwright file, `node scripts/selftest.mjs`, regression integrity scans, collision validation, and path-scoped diff checks have current results.
  > **Uncertainty Declaration**
  > **What was attempted:** Ran every named command plus artifact lint, freshness, foundation, traceability, implementation reality, framework-write, diagnostics, and integrity scans.
  > **What was observed:** Focused checks and exact Playwright pass, but `node scripts/selftest.mjs`, implementation reality, and Feature 004 collision each exit 1.
  > **Why this is uncertain:** The grouped quality claim requires every named command to resolve; current nonzero results cannot support completion.
  > **What would resolve this:** Owner-routed resolution followed by exact reruns of all three nonzero commands.

> **Planning Uncertainty Declaration:** No delivery command was used as active proof. Every item remains unchecked until the implementation and test owners execute the named checks.

## Scope 2: SCOPE-02 Metadata-Only Legacy Cleanup And Clear-All

**Status:** Not Started  
**Depends On:** SCOPE-01  
**Scope-Kind:** runtime-behavior

### Gherkin Scenarios - SCOPE-02

```gherkin
Scenario: SCN-BUG001-004 - Legacy presence is metadata-only and cleanup is erase-only
  Given exact registered credential-bearing container names are present
  When detection runs and the user dismisses or confirms cleanup
  Then detection reports provider ids location classes and counts from registry metadata only
  And dismissal performs no read and no mutation
  And confirmed cleanup follows destructive-effect disclosure removes whole registered containers and verifies their names absent
  And the current-document runtime remains unconfigured

Scenario: SCN-BUG001-006 - Clear all removes memory before legacy erasure
  Given the current document may hold an eligible credential and registered legacy containers may exist
  When the user selects Clear all
  Then current-document references and shared fields are cleared before durable deletion begins
  And every registered container is removed as a whole and verified by name absence only
  And incomplete deletion is explicit leak-free and cannot restore memory state
```

### UI Scenario Matrix - SCOPE-02

| Scenario | Steps | Expected visible result | Test |
| --- | --- | --- | --- |
| Detect/dismiss | Seed opaque registered containers, detect, then dismiss | Redacted provider/location classes and count only; containers untouched and runtime empty | functional/e2e-ui |
| Confirm erase | Review destructive-effect disclosure and confirm | Whole registered containers disappear; success appears only after name absence | e2e-ui |
| Partial erase | Force one deletion failure | Explicit incomplete status with redacted remaining classes/counts and empty runtime | functional/e2e-ui |
| Clear all | Configure controlled current memory and seed registered containers | Memory clears first; complete or incomplete erasure is reported without restoration | e2e-ui |

### Implementation Plan - SCOPE-02

1. Define a frozen exact-name `LegacyLocationRegistry` whose entries contain only storage class, provider ID, redacted location class, and destructive-effect disclosure ID.
2. Detect presence through storage name enumeration and registry metadata only; prohibit every value-returning storage operation and every credential-derived signal.
3. Make dismissal inert: no value access, deletion, write, runtime change, or hidden activation state.
4. After destructive-effect disclosure and explicit confirmation, delete selected exact containers as whole units without opening or selectively rewriting them.
5. Verify cleanup only by deletion outcome plus re-enumerated name absence; report incomplete/unavailable using closed redacted classes and counts.
6. Clear current-document memory and shared inputs synchronously before cleanup; never restore them after a deletion failure.
7. Preserve `localStorage.rlData`, public/no-key behavior, unknown names, non-secret cache bytes, and all unrelated storage.

### Shared Infrastructure Impact Sweep - SCOPE-02

- Protected contracts: browser storage enumeration/deletion instrumentation, exact registered names, index cleanup rendering, current-document clear ordering, and non-secret `rlData` persistence.
- Blast radius: mixed legacy containers lose nested non-secret preferences by design; the UI must disclose that effect before deletion, and unknown/unregistered containers remain untouched.
- Independent canaries: byte-compatible schema-1 `rlData`, public/no-key tools, exact-name registry selftest, forced deletion failure, and provider stress cycles that fail on any value-returning call.
- Rollback: inverse only BUG-001 cleanup hunks after rechecking dirty-hunk identity; rollback never restores a credential reader, transformer, serialized store, or cross-document bridge.

### Change Boundary - SCOPE-02

SCOPE-02 inherits the exact [Protected Change Boundary](#protected-change-boundary). No product/test file outside the named credential cleanup families may change, and `localStorage.rlData` is explicitly excluded from the legacy location registry.

### Test Plan - SCOPE-02

| ID | Type | Category | Scenario | File / exact test title | Required assertion | Exact command | Live |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S2-T01 | Functional adversarial | functional | SCN-BUG001-004 | `tests/provider-credentials.functional.mjs` - `SCN-BUG001-004 metadata-only detection performs zero legacy value access` | Instrumented registered names observe enumeration only; no value read, decode, digest, comparison, copy, transformation, or runtime activation occurs. | `node --test tests/provider-credentials.functional.mjs` | No |
| S2-T02 | Functional regression | functional | SCN-BUG001-006 | `tests/provider-credentials.functional.mjs` - `SCN-BUG001-006 clear all empties runtime before whole-container deletion` | Memory and shared inputs clear first; a forced deletion failure stays incomplete and cannot restore state. | `node --test tests/provider-credentials.functional.mjs` | No |
| S2-T03 | Regression E2E adversarial | e2e-ui | SCN-BUG001-004 | `tests/provider-credentials.spec.mjs` - `Regression BUG-001: legacy detection is metadata-only and cleanup is erase-only` | UI shows only redacted metadata, disclosure precedes confirmation, dismissal is inert, and success requires every selected name absent. | `npx --no-install playwright test tests/provider-credentials.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| S2-T04 | Regression E2E adversarial | e2e-ui | SCN-BUG001-006 | `tests/provider-credentials.spec.mjs` - `Regression BUG-001: clear all empties current memory before whole-container erase` | Current status becomes unconfigured before deletion; complete and forced-incomplete branches remain leak-free and never restore memory. | `npx --no-install playwright test tests/provider-credentials.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| S2-T05 | Stress regression | stress | SCN-BUG001-004, SCN-BUG001-006 | `tests/provider-credentials.stress.mjs` - `250 detect dismiss erase clear and partial-failure cycles perform zero legacy value reads` | Every cycle remains bounded, touches exact names only, reports redacted metadata, and leaves runtime empty after cleanup. | `node tests/provider-credentials.stress.mjs` | Yes |

### Definition of Done - SCOPE-02 Tiered Validation

- [ ] SCN-BUG001-004 - Detection uses exact names and registry metadata only; dismissal is inert; confirmed cleanup erases whole containers after disclosure and verifies name absence only.
- [ ] SCN-BUG001-006 - Clear all removes current-document memory first and reports incomplete deletion without restoring any credential state.
- [ ] Storage instrumentation proves zero raw legacy value access or credential-derived signal across detection, dismissal, erasure, verification, and clear-all.
- [ ] Shared Infrastructure Impact Sweep proves exact-name scope, unknown-container preservation, byte-compatible non-secret `rlData`, public/no-key behavior, and inverse-hunk rollback.
- [ ] S2-T01 passes with current raw evidence.
- [ ] S2-T02 passes with current raw evidence.
- [ ] S2-T03 passes with current raw evidence.
- [ ] S2-T04 passes with current raw evidence.
- [ ] S2-T05 passes with current raw evidence.
- [ ] Build Quality Gate: the full credential Playwright file, `rlData`, public/no-key, collision, regression-quality, and path-boundary canaries have current results.

> **Planning Uncertainty Declaration:** No cleanup row is treated as passing until instrumentation proves zero value access and the implementation/test owners execute complete, dismissed, and forced-incomplete branches.

## Scope 3: SCOPE-03 Same-Document Ownership And Zero Transfer

**Status:** Not Started  
**Depends On:** SCOPE-02  
**Scope-Kind:** runtime-behavior

### Gherkin Scenarios - SCOPE-03

```gherkin
Scenario: SCN-BUG001-003 - An eligible document owns collection and use without disclosure
  Given a controlled policy authorizes one provider operation in the current loaded document
  When the user enters a sentinel credential and invokes that operation without leaving the document
  Then the shared field is blanked immediately and only configured status and a sanitized result are visible
  And no caller receives the credential request headers raw response or transferable credential object
  And every lifecycle boundary leaves the document unconfigured

Scenario: SCN-BUG001-008 - Index-to-tool navigation transfers no credential
  Given index and every registered tool are separate HTML documents
  When the user follows a tool link after viewing provider status or legacy cleanup on index
  Then the tool starts unconfigured and exposes no credential editor writer getter store or request broker
  And index offers no action that claims to configure the tool
  And no URL message worker cookie opener storage history DOM or equivalent bridge transfers a credential
```

### UI Scenario Matrix - SCOPE-03

| Scenario | Steps | Expected visible result | Test |
| --- | --- | --- | --- |
| Same-document use | Open the controlled eligible fixture, enter a sentinel, and invoke its approved operation | Input blanks immediately; configured status and sanitized result appear only in that document | e2e-ui |
| Lifecycle exit | Configure the controlled fixture, then trigger route or document navigation | The resulting document is unconfigured and receives no credential payload | functional/e2e-ui |
| Index-to-tool navigation | View status or cleanup on index, then follow every registered tool link | Every tool starts unconfigured and exposes no credential surface or continuity claim | e2e-ui/load |
| Bridge matrix | Exercise URL, message, worker, cookie, opener, storage, history, and DOM channels | Every channel carries zero credential data | e2e-ui/load |

### Implementation Plan - SCOPE-03

1. Add a controlled test-only eligible policy that proves the generic shared capability without enabling any production provider.
2. Permit transient credential entry only when the same loaded document owns the exact approved operation and required CSP profile.
3. Blank the shared field synchronously and keep the credential closure-private; expose only status and sanitized provider results.
4. Remove every tool-local editor, getter, setter, writer, store, request broker, compatibility alias, and credential-aware fallback from the registry-derived consumer inventory.
5. Keep index limited to non-secret provider status and erase-only cleanup while it owns no approved same-document provider operation.
6. Prove every named browser bridge and navigation path carries zero credential data and every resulting document starts unconfigured.
7. Preserve public/no-key acquisition, normalized non-secret `rlData`, registry order, navigation behavior, and unrelated tool analytics.

### Consumer Impact Sweep - SCOPE-03

- Producers removed or narrowed: serialized/raw credential APIs, tool-local helpers, credential request brokers, and every continuity claim.
- Consumers inspected: `index.html`, `rlnav.js`, every page derived from `tools.json`, `scripts/selftest.mjs`, and all provider credential suites.
- Stale-reference surfaces: source, navigation links, opener handling, URL/query/fragment construction, message and worker channels, cookies, storage events, history state, DOM handoffs, tests, active docs, and plan routing.
- Required result: zero first-party tool credential surface or bridge; public/no-key and normalized-cache consumers remain operational.

### Shared Infrastructure Impact Sweep - SCOPE-03

- Protected contracts: tools registry coverage, shared navigation shell, public/no-key acquisition, normalized `rlData` consumption, and provider support harness lifecycle controls.
- Blast radius: removing credential-aware calls can affect three known direct consumers and any registry-derived stale caller; every registered page is therefore a canary.
- Independent canaries: real index-to-tool navigation, all-page source/live sweep, parallel page/context load, and byte-compatible `rlData` behavior.
- Rollback: inverse only verified BUG-001 consumer hunks; ambiguity leaves browser credential transport disabled and preserves every unrelated hunk.

### Change Boundary - SCOPE-03

SCOPE-03 inherits the exact [Protected Change Boundary](#protected-change-boundary). Only proven credential-owned hunks in index, navigation, registered consumers, support harness, and provider tests may change; active docs and foreign artifacts route to their owners rather than being folded into implementation.

### Test Plan - SCOPE-03

| ID | Type | Category | Scenario | File / exact test title | Required assertion | Exact command | Live |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S3-T01 | Unit regression | unit | SCN-BUG001-003 | `tests/provider-credentials.unit.mjs` - `SCN-BUG001-003 same-document authorization returns status and sanitized results only` | The controlled policy accepts a value only in its exact eligible document, returns no credential/header/raw response, and retains no transferable representation. | `node --test tests/provider-credentials.unit.mjs` | No |
| S3-T02 | Repository integration | integration | SCN-BUG001-008 | `scripts/selftest.mjs` - registry-derived credential consumer and bridge sweep | Every registered tool has zero credential editor/getter/setter/writer/store/broker and every named transfer channel is absent. | `node scripts/selftest.mjs` | No |
| S3-T03 | Regression E2E adversarial | e2e-ui | SCN-BUG001-003 | `tests/provider-credentials.spec.mjs` - `Regression BUG-001: same-document use blanks input and exposes status but never the credential` | The controlled eligible document owns input and request, blanks the field, exposes sanitized output only, and clears at the next lifecycle boundary. | `npx --no-install playwright test tests/provider-credentials.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| S3-T04 | Regression E2E adversarial | e2e-ui | SCN-BUG001-008 | `tests/provider-credentials.spec.mjs` - `Regression BUG-001: index-to-tool navigation transfers no credential and every tool starts unconfigured` | Index makes no continuity promise; every registered tool starts empty and receives zero data through all named bridges. | `npx --no-install playwright test tests/provider-credentials.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| S3-T05 | Load regression | load | SCN-BUG001-008 | `tests/provider-credentials.load.mjs` - `parallel pages windows and contexts start unconfigured with zero credential bridge` | Concurrent registered documents and independent contexts remain empty without storage, opener, worker, message, URL, cookie, history, or DOM transfer. | `node tests/provider-credentials.load.mjs` | Yes |

### Definition of Done - SCOPE-03 Tiered Validation

- [ ] SCN-BUG001-003 - A controlled eligible document owns both transient collection and the approved request, exposes status/sanitized output only, and clears at every lifecycle boundary.
- [ ] SCN-BUG001-008 - Index-to-tool navigation transfers no credential, makes no continuity claim, and every registered tool has zero local credential surface.
- [ ] Consumer and bridge sweeps find zero stale first-party credential getter, writer, broker, transfer channel, or credential-backed fallback while public/no-key and `rlData` behavior remain intact.
- [ ] Shared Infrastructure Impact Sweep and inverse-hunk rollback protect registry coverage, navigation behavior, support harnesses, non-secret cache consumers, and unrelated dirty work.
- [ ] S3-T01 passes with current raw evidence.
- [ ] S3-T02 passes with current raw evidence.
- [ ] S3-T03 passes with current raw evidence.
- [ ] S3-T04 passes with current raw evidence.
- [ ] S3-T05 passes with current raw evidence.
- [ ] Build Quality Gate: the full credential Playwright file, load suite, `node scripts/selftest.mjs`, `rlData`, page-integrity, collision, and path-boundary canaries have current results.

> **Planning Uncertainty Declaration:** No production provider is enabled by the controlled fixture, and no same-document or zero-transfer row is treated as passing until the implementation and test owners execute the named checks.

## Scope 4: SCOPE-04 Fail-Closed Provider Transport And Disclosure

**Status:** Not Started  
**Depends On:** SCOPE-03  
**Scope-Kind:** runtime-behavior

### Gherkin Scenarios - SCOPE-04

```gherkin
Scenario: SCN-BUG001-007 - Credential values do not enter output or navigation surfaces
  Given a unique sentinel is configured in a controlled eligible document
  When rendering failures clear lifecycle boundaries and disclosure scans run
  Then the sentinel is absent from DOM accessibility events diagnostics analytics URLs referrers storage bridges and test artifacts

Scenario: SCN-BUG001-009 - Twelve Data browser-key use fails closed while authorization is unverified
  Given no complete Twelve Data browser-origin and non-URL policy exists
  When a credential-backed Twelve Data operation is requested
  Then no Twelve Data request is sent
  And only a safe provider-disabled status is visible

Scenario: SCN-BUG001-010 - Header-capable provider credentials never enter URLs
  Given a controlled policy verifies browser use operation origin same-document ownership and header authentication
  When the request is sent and authentication fails
  Then exactly one approved-header attempt occurs
  And no query proxy provider origin or transport fallback occurs
```

### Implementation Plan - SCOPE-04

1. Require authorization, exact operation/origin, same-document ownership, approved header, and document posture with no defaults.
2. Keep Twelve Data, Finnhub, Alpha Vantage, FRED, and every incomplete production policy disabled.
3. Reject credential-shaped query names before URL construction and issue one exact-origin no-referrer/no-store header request.
4. Return closed sanitized failures without raw response, headers, URL, stack, body, or cause.
5. Scan the sentinel across every CRD-018/CRD-019 surface without printing it in evidence.
6. Prove no auth/query/proxy/provider/origin/transport retry or fallback.

### UI Scenario Matrix - SCOPE-04

| Scenario | Steps | Expected visible result | Test |
| --- | --- | --- | --- |
| Disclosure scan | Configure the controlled eligible fixture, exercise success, failure, clear, and lifecycle paths | Only closed status and sanitized results appear; the sentinel appears nowhere | e2e-ui/stress |
| Disabled production provider | Invoke a Twelve Data credential-backed action | Safe provider-disabled status appears and no request is sent | functional/e2e-ui |
| Controlled header request | Invoke the exact approved controlled operation and force auth failure | One sanitized failure appears; no URL credential or fallback attempt occurs | unit/functional/e2e-ui |

### Test Plan - SCOPE-04

| ID | Type | Category | Scenario | File / exact test title | Required assertion | Exact command | Live |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S4-T01 | Unit adversarial | unit | SCN-BUG001-010 | `tests/provider-credentials.unit.mjs` - `SCN-BUG001-010 exact-origin header request rejects credential query names and alternate transports` | Credential-shaped parameters and every alternate transport fail before URL construction or request dispatch. | `node --test tests/provider-credentials.unit.mjs` | No |
| S4-T02 | Functional regression | functional | SCN-BUG001-009 | `tests/provider-credentials.functional.mjs` - `SCN-BUG001-009 Twelve Data and all incomplete production policies send zero credential requests` | Every current production policy remains disabled and sends zero credential-bearing requests. | `node --test tests/provider-credentials.functional.mjs` | No |
| S4-T03 | Functional adversarial | functional | SCN-BUG001-010 | `tests/provider-credentials.functional.mjs` - `SCN-BUG001-010 auth failure performs one header attempt and no fallback` | An auth failure produces one sanitized result after exactly one approved-header attempt and no alternate attempt. | `node --test tests/provider-credentials.functional.mjs` | No |
| S4-T04 | Regression E2E adversarial | e2e-ui | SCN-BUG001-007 | `tests/provider-credentials.spec.mjs` - `Regression BUG-001: sentinel credential never appears in DOM console errors URL or referrer` | The sentinel is absent from every rendered, accessibility, diagnostic, URL, referrer, storage, bridge, screenshot, trace, snapshot, and test-artifact surface. | `npx --no-install playwright test tests/provider-credentials.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| S4-T05 | Regression E2E | e2e-ui | SCN-BUG001-009 | `tests/provider-credentials.spec.mjs` - `Regression BUG-001: Twelve Data browser credential calls remain disabled without authorization evidence` | Twelve Data is rejected before credential collection and sends zero credential requests or alternate attempts. | `npx --no-install playwright test tests/provider-credentials.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| S4-T06 | Regression E2E adversarial | e2e-ui | SCN-BUG001-010 | `tests/provider-credentials.spec.mjs` - `Regression BUG-001: approved header auth never places credentials in URLs or retries with query auth` | A controlled eligible policy performs one exact-origin approved-header attempt with no credential URL, redirect, referrer, provider, origin, proxy, or transport fallback. | `npx --no-install playwright test tests/provider-credentials.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| S4-T07 | Stress regression | stress | SCN-BUG001-007, SCN-BUG001-010 | `tests/provider-credentials.stress.mjs` - `250 authorized failure clear and navigation cycles emit zero credential output and zero fallback` | Repeated controlled cycles remain bounded, disclose no sentinel, and perform no fallback attempt. | `node tests/provider-credentials.stress.mjs` | Yes |

### Definition of Done - SCOPE-04 Tiered Validation

- [ ] SCN-BUG001-007 - Credential values do not enter output or navigation surfaces and the sentinel is absent from every named disclosure surface.
- [ ] SCN-BUG001-009 - Twelve Data browser-key use fails closed with zero request and safe disabled status.
- [ ] SCN-BUG001-010 - Header-capable credentials never enter URLs and exactly one approved-header attempt occurs with zero fallback.
- [ ] Missing eligibility disables collection and sends zero credential request; no default or alternate path exists.
- [ ] S4-T01 passes with current raw evidence.
- [ ] S4-T02 passes with current raw evidence.
- [ ] S4-T03 passes with current raw evidence.
- [ ] S4-T04 passes with current raw evidence.
- [ ] S4-T05 passes with current raw evidence.
- [ ] S4-T06 passes with current raw evidence.
- [ ] S4-T07 passes with current raw evidence.
- [ ] Disclosure, regression-integrity, collision, selftest, and path-boundary checks have current results.

> **Planning Uncertainty Declaration:** No production provider has a complete eligible policy; only disabled production behavior and a controlled policy path are planned.

## Scope 5: SCOPE-05 G028 Collision Cache And Cross-Feature Closure

**Status:** Not Started  
**Depends On:** SCOPE-04  
**Scope-Kind:** runtime-behavior

### Gherkin Scenarios - SCOPE-05

```gherkin
Scenario: SCN-BUG001-011 - The nine G028 findings receive truthful one-to-one closure
  Given G028-01 through G028-09 the blind spot the rlData contract F004-COLLISION-001 and the protected dirty tree
  When memory-only remediation scanner disposition and cross-feature canaries are assessed
  Then every finding has one addressed or owner-routed disposition
  And no persisted credential remains
  And rlData dirty hunks framework immutability and provider Bond Causal and FX canaries remain intact
```

### Implementation Plan - SCOPE-05

1. Map every physical G028 finding and duplicate row to exactly one disposition.
2. Preserve `rlData`, public/no-key paths, metadata-only detection, whole-container erase, and name-absence verification.
3. Consume BUG-013 semantics only through the supported canonical upgrade path.
4. Preserve `F004-COLLISION-001` and hash `ab27e89cd0dd8c6dd640254615a10d15a2be008596ec72834ca4512766c646fc` until its owner changes the baseline.
5. Run provider unit/functional/E2E/stress/load and Bond/Causal/FX `system-chrome` canaries.
6. Run artifact, freshness, traceability, foundation, framework-write, and path-boundary checks.

### UI Scenario Matrix - SCOPE-05

| Scenario | Steps | Expected visible result | Test |
| --- | --- | --- | --- |
| G028 closure | Run the provider closure workflow with non-secret cache fixtures and protected cross-feature pages | No credential persistence is available; `rlData`-backed and provider/Bond/Causal/FX behaviors retain their user-visible contracts | integration/e2e-ui |
| Collision constraint | Exercise the Feature 004 collision canary before shared-file changes | Ambiguous hunk ownership stops mutation while provider transport remains disabled | integration |

### Test Plan - SCOPE-05

| ID | Type | Category | Scenario | File / exact test title | Required assertion | Exact command | Live |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S5-T01 | Repository integration | integration | SCN-BUG001-011 | `scripts/selftest.mjs` - credential/`rlData`/registry/model canaries | Credential persistence is absent while non-secret cache, registry, and protected model contracts remain intact. | `node scripts/selftest.mjs` | No |
| S5-T02 | Security integration | integration | SCN-BUG001-011 | `.github/bubbles/scripts/cli.sh` - installed G028 one-to-one scan | Every physical finding and blind spot receives one truthful addressed or owner-routed disposition. | `bash .github/bubbles/scripts/cli.sh scan specs/_bugs/BUG-001-central-provider-credential-security` | No |
| S5-T03 | Collision canary | integration | SCN-BUG001-011 | `tests/feature-004-dirty-tree-collision.test.mjs` - Feature 004 hunk identity | The recorded collision and exact hash remain owner-accounted and no unrelated hunk is overwritten. | `node --test tests/feature-004-dirty-tree-collision.test.mjs` | No |
| S5-T04 | Provider unit canary | unit | SCN-BUG001-011 | `tests/provider-credentials.unit.mjs` - complete provider unit suite | The complete provider unit contract remains coherent after all earlier scopes. | `node --test tests/provider-credentials.unit.mjs` | No |
| S5-T05 | Provider functional canary | functional | SCN-BUG001-011 | `tests/provider-credentials.functional.mjs` - complete provider functional suite | The complete provider functional contract remains coherent after all earlier scopes. | `node --test tests/provider-credentials.functional.mjs` | No |
| S5-T06 | Provider regression E2E | e2e-ui | SCN-BUG001-011 | `tests/provider-credentials.spec.mjs` - `Regression BUG-001: G028 inventory closes genuine rows without deleting noncredential rlData cache` | Every G028 row and blind spot receives one disposition while non-secret `rlData`, protected Feature 004 hunks, collision evidence, and framework immutability remain intact. | `npx --no-install playwright test tests/provider-credentials.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| S5-T07 | Provider stress canary | stress | SCN-BUG001-011 | `tests/provider-credentials.stress.mjs` - complete provider stress suite | Repeated credential/cleanup/transport cycles remain bounded, erase-only, and disclosure-free. | `node tests/provider-credentials.stress.mjs` | Yes |
| S5-T08 | Provider load canary | load | SCN-BUG001-011 | `tests/provider-credentials.load.mjs` - complete provider load suite | Parallel pages and contexts remain unconfigured and transfer no credential while public behavior remains available. | `node tests/provider-credentials.load.mjs` | Yes |
| S5-T09 | Bond canary | e2e-ui | SCN-BUG001-011 | `tests/bond-regime-lab.spec.mjs` - complete Bond suite | Bond Regime retains its live user-visible contract after shared credential changes. | `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| S5-T10 | Causal canary | e2e-ui | SCN-BUG001-011 | `tests/causal-rotation-lab.spec.mjs` - complete Causal suite | Causal Rotation retains its live user-visible contract after shared credential changes. | `npx --no-install playwright test tests/causal-rotation-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| S5-T11 | FX canary | e2e-ui | SCN-BUG001-011 | `tests/fx-regime-relative-value-lab.spec.mjs` - complete FX suite | FX Regime retains its live user-visible contract and protected Feature 004 behavior. | `npx --no-install playwright test tests/fx-regime-relative-value-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

### Definition of Done - SCOPE-05 Tiered Validation

- [ ] SCN-BUG001-011 - The nine G028 findings receive truthful one-to-one closure while `rlData`, dirty hunks, framework immutability, and provider/Bond/Causal/FX canaries remain intact.
- [ ] `DEP-BUG013-SEMANTIC-CLASSIFIER` arrives from canonical Bubbles with no downstream edit, bypass, or identifier obfuscation.
- [ ] Consumer Impact Sweep finds zero stale credential persistence, legacy-value ingress, raw-read, DOM-holder, transport, or continuity references.
- [ ] S5-T01 passes with current raw evidence.
- [ ] S5-T02 passes with current raw evidence.
- [ ] S5-T03 records the exact collision disposition with no new collision.
- [ ] S5-T04 passes with current raw evidence.
- [ ] S5-T05 passes with current raw evidence.
- [ ] S5-T06 passes with current raw evidence.
- [ ] S5-T07 passes with current raw evidence.
- [ ] S5-T08 passes with current raw evidence.
- [ ] S5-T09 passes with current raw evidence.
- [ ] S5-T10 passes with current raw evidence.
- [ ] S5-T11 passes with current raw evidence.
- [ ] Artifact lint, freshness, traceability, foundation, framework-write, and path-scoped diff checks have current results.

> **Planning Uncertainty Declaration:** `DEP-BUG013-SEMANTIC-CLASSIFIER` and `F004-COLLISION-001` remain owner-routed constraints; planning claims no execution outcome.

## Finding Accounting And Transition Routing

| Finding ID | Planning disposition | Owner / route |
| --- | --- | --- |
| BUG001-PLAN-SPLIT-BRAIN | Addressed: `scopes.md`, active `test-plan.json`, `scenario-manifest.json`, `uservalidation.md`, report boundary text, and `state.json.execution/routing` now encode the same five-scope current-document and erase-only contract | `bubbles.plan` |
| BUG001-TITLE-PARITY | Addressed: the 12 active Playwright titles are exact and complete in `scopes.md`, `scenario-manifest.json`, and active `test-plan.json` | `bubbles.plan` |
| BUG001-CONTRACT-SESSION-STORAGE | Addressed: no active scope treats `sessionStorage`, reload continuity, or cross-document continuity as success | `bubbles.plan` |
| F004-PLAN-001 | Addressed: five sequential scopes and all 11 stable scenario IDs | `bubbles.plan` |
| G094-PLAN-DEPENDENCY | Addressed: SCOPE-01 is `foundation:true`; every overlay depends on it | `bubbles.plan` |
| BUG001-SPEC-MIGRATION-CONFLICT | Addressed: active spec, design, scenarios, tests, DoD, acceptance, and routing prohibit all legacy-value access and define metadata-only whole-container deletion | `bubbles.plan` |
| DEP-BUG013-SEMANTIC-CLASSIFIER | Unresolved dependency: cache/erase semantic classification must arrive from canonical Bubbles | Canonical BUG-013 owner |
| F004-COLLISION-001 | Preserved open with hash `ab27e89cd0dd8c6dd640254615a10d15a2be008596ec72834ca4512766c646fc` | Feature 004 owning workflow |
| BUG001-DIRTY-TREE-BOUNDARY | Active constraint: implementation must capture a just-in-time index/worktree/hunk baseline and stop on ambiguous ownership; planning does not claim it resolved | `bubbles.implement` |
| BUG001-CERTIFICATION-INVENTORY-STALE | Unresolved foreign-owned state: `state.json.certification.scopeProgress` still lists the superseded two-scope plan and must be reconciled without changing delivery status or claiming completion | `bubbles.validate` |
| BUG001-SPEC-PLAN-STATUS-STALE | Unresolved foreign-owned prose: `spec.md` still describes every planning handoff as stale even though the plan owner has now reconciled them | `bubbles.analyst` |
| BUG001-BUG-ROUTE-STALE | Unresolved foreign-owned route: `bug.md#active-ownership-route` still routes design first and says implementation dispatch is false | `bubbles.bug` |

## Structured Handoff

```yaml
packet: BUG-001-central-provider-credential-security
workflowMode: bugfix-fastlane
currentOwner: bubbles.plan
currentOutcome: route_required
transitionRequest: TR-BUG-001-F004-PLAN
transitionRequestStatus: resolved
implementationDispatchAllowedNow: true
deliveryOwner: bubbles.implement
nextRequiredOwner: bubbles.validate
addressedFindingIds: [BUG001-PLAN-SPLIT-BRAIN, BUG001-TITLE-PARITY, BUG001-CONTRACT-SESSION-STORAGE, F004-PLAN-001, G094-PLAN-DEPENDENCY, BUG001-SPEC-MIGRATION-CONFLICT]
unresolvedFindingIds: [DEP-BUG013-SEMANTIC-CLASSIFIER, F004-COLLISION-001, BUG001-DIRTY-TREE-BOUNDARY, BUG001-CERTIFICATION-INVENTORY-STALE, BUG001-SPEC-PLAN-STATUS-STALE, BUG001-BUG-ROUTE-STALE]
foreignRoutes:
  - owner: bubbles.validate
    findingId: BUG001-CERTIFICATION-INVENTORY-STALE
  - owner: bubbles.analyst
    findingId: BUG001-SPEC-PLAN-STATUS-STALE
  - owner: bubbles.bug
    findingId: BUG001-BUG-ROUTE-STALE
```

## Superseded Scopes (Do Not Execute)

The content below preserves the prior two-scope session/migration plan as history only. Its statuses, checked items, test titles, and handoff are not part of the active execution inventory and cannot support implementation or certification.

### Historical Scope 1: Central Same-Tab Credential Lifecycle And Index UX

**Historical status:** In Progress under the superseded contract  
**Priority:** P0  
**Depends On:** None  
**Scope-Kind:** runtime-behavior

### Historical Scenario Record - SCOPE-01

#### SCN-BUG001-001 - Only the landing page can edit credentials

```gherkin
Historical scenario record: SCN-BUG001-001 - Credential editing is confined to the index settings surface
Given every registered Research Lab page is available
When a user inspects the landing page and every tool page
Then only index.html#data-settings exposes credential inputs and mutation actions
And tool pages contain no credential editor setter migration helper or storage writer
```

#### SCN-BUG001-002 - Same-tab continuity and independent-tab isolation

```gherkin
Historical scenario record: SCN-BUG001-002 - A credential follows same-tab navigation but not a separately opened tab
Given an approved provider is configured on the landing page
When the user reloads and navigates to a tool in the same tab
Then the central read API reports that provider configured
When an independent tab opens the same origin
Then the provider is not configured in that tab
```

#### SCN-BUG001-003 - Save reveals status, never the value

```gherkin
Historical scenario record: SCN-BUG001-003 - Saving a credential blanks the field and exposes status only
Given the provider field is blank and not configured
When the user enters a sentinel credential and saves
Then the field is immediately blank
And remounting the settings surface keeps it blank
And only configured status is visible
```

#### SCN-BUG001-004 - Legacy migration requires consent and verified scrub

```gherkin
Historical scenario record: SCN-BUG001-004 - Legacy credentials remain inactive until explicit migration consent
Given known durable legacy credential locations contain sentinel values
When the landing page boots without migration consent
Then the same-tab credential store is empty and only a redacted legacy-presence notice appears
When the user explicitly accepts migration
Then allowlisted credentials enter the same-tab store
And every known durable legacy credential copy is erased or scrubbed and verified
```

#### SCN-BUG001-005 - Unknown providers fail without mutation

```gherkin
Historical scenario record: SCN-BUG001-005 - Unknown and prototype-shaped provider identifiers are rejected
Given the credential store has a known baseline state
When a caller supplies an unknown empty constructor or __proto__ provider identifier
Then the call fails with a safe unknown-provider reason
And no storage object or prototype is mutated
```

#### SCN-BUG001-006 - Clear-all is complete

```gherkin
Historical scenario record: SCN-BUG001-006 - Clear-all removes active and legacy credential material
Given multiple approved providers are configured and known legacy copies exist
When the user selects Clear all
Then the same-tab store contains no credentials
And all fields are blank and statuses are not configured
And every known durable legacy credential location is scrubbed
```

### Historical UI Scenario Matrix - SCOPE-01

| Scenario | Preconditions | Steps | Expected | Test Type | Evidence |
| --- | --- | --- | --- | --- | --- |
| Index-only editor | Static server running | Open index, then each registered tool | Editor/actions only on index | e2e-ui | `report.md#scenario-scn-bug001-001` |
| Same-tab and new-tab | Clean browser context | Save, reload, same-tab navigate, open second page | Original tab configured; second tab empty | e2e-ui | `report.md#scenario-scn-bug001-002` |
| Blank after save | Clean index settings | Type sentinel, save, remount | Empty fields; status only | e2e-ui | `report.md#scenario-scn-bug001-003` |
| Consent migration | Seed known durable legacy locations | Boot, dismiss, consent, force scrub failure | No silent import; complete scrub or fail closed | e2e-ui | `report.md#scenario-scn-bug001-004` |
| Unknown provider | Known baseline state | Call with rogue and prototype IDs | Explicit safe rejection; unchanged state | functional | `report.md#scenario-scn-bug001-005` |
| Clear all | Multiple session and legacy values | Select clear-all | Zero credential material and statuses | e2e-ui | `report.md#scenario-scn-bug001-006` |

### Historical Implementation Record - SCOPE-01

1. Capture failing pre-fix unit/functional and browser regressions for SCN-BUG001-001 through SCN-BUG001-006.
2. Add a closed provider registry and versioned same-tab credential envelope to the central shared owner.
3. Replace bulk credential rendering access with single-provider reads and status-only queries.
4. Enforce index-only set/migrate/erase/clear operations and explicit unknown-provider failures.
5. Replace boot migration with redacted detection, consented transactional migration, erase-only, and verified scrub.
6. Rebuild the index settings UI so inputs mount/remount blank, blank saves are no-ops, and configured state reveals no value.
7. Remove the `RLAPP` durable fallback and make central-owner absence fail closed.
8. Add independent canaries for non-secret `rlData` cache round trips, shared status shell boot, and every registered page load order.

### Historical Shared Infrastructure Impact Sweep - SCOPE-01

- Shared contracts: `RLDATA.key`, `RLDATA.keys`, `RLDATA.setKey`, `RLDATA.migrateKeys`, `RLAPP.key`, `RLAPP.setKey`, settings mount/boot order, browser storage injection in tests.
- Downstream consumers: every registered HTML page, Market Brief, selftest storage harness, browser tests, shared status shell.
- Silent cascade risks: changed return type, missing RLDATA at boot, blank save clearing configured values, tab namespace cloning, migration partial failure, non-secret cache deletion.
- Independent canaries must validate cache, shell, and registry contracts before the broad regression suite.

### Historical Change Boundary - SCOPE-01

Allowed delivery families for this scope: `rldata.js`, `rlapp.js`, `index.html`, credential-specific tests, `scripts/selftest.mjs`, and credential-contract documentation explicitly named by the docs owner.

Excluded families: market models, universe files, generated snapshots/history, Causal Rotation product artifacts, distributed-brief implementation, installed `.github/bubbles/**` files, and unrelated dirty paths. Delivery must preserve pre-existing hunks in allowed files and prove excluded families unchanged. No stash, reset, clean, checkout overwrite, wholesale rewrite, or broad formatting command is permitted.

### Historical Test Matrix - SCOPE-01

| Historical record type | Category | Scenario | File / exact test title | Command | Live System | Expected proof |
| --- | --- | --- | --- | --- | --- | --- |
| Unit | unit | SCN-BUG001-005 | `tests/provider-credentials.unit.mjs` - `unknown and prototype-shaped provider ids fail without mutation` | `node --test tests/provider-credentials.unit.mjs` | No | Closed allowlist, unchanged own properties and prototypes |
| Functional | functional | SCN-BUG001-004 | `tests/provider-credentials.functional.mjs` - `consent migration writes verifies scrubs and fails closed atomically` | `node --test tests/provider-credentials.functional.mjs` | No | No boot import; complete transaction; partial scrub clears active state |
| Functional | functional | SCN-BUG001-006 | `tests/provider-credentials.functional.mjs` - `clear all erases session and every known durable legacy location` | `node --test tests/provider-credentials.functional.mjs` | No | Zero active/legacy values after clear |
| Canary | integration | SCN-BUG001-001 | `tests/provider-credentials.spec.mjs` - `Canary: real index loads RLDATA before RLAPP with one credential editor` | `npx --no-install playwright test tests/provider-credentials.spec.mjs --reporter=list` | Yes | Real static page, shared shell, one editor |
| Regression E2E | e2e-ui | SCN-BUG001-001 | `tests/provider-credentials.spec.mjs` - `Regression BUG-001: only index can mutate provider credentials` | `npx --no-install playwright test tests/provider-credentials.spec.mjs --reporter=list` | Yes | Every registered tool lacks editor/writer |
| Regression E2E | e2e-ui | SCN-BUG001-002 | `tests/provider-credentials.spec.mjs` - `Regression BUG-001: same-tab navigation retains credentials and an independently opened tab starts empty` | `npx --no-install playwright test tests/provider-credentials.spec.mjs --reporter=list` | Yes | Same-tab continuity and second-tab isolation |
| Regression E2E | e2e-ui | SCN-BUG001-003 | `tests/provider-credentials.spec.mjs` - `Regression BUG-001: save blanks fields and exposes configured status only` | `npx --no-install playwright test tests/provider-credentials.spec.mjs --reporter=list` | Yes | Sentinel absent from fields/markup after save/remount |
| Regression E2E | e2e-ui | SCN-BUG001-004 | `tests/provider-credentials.spec.mjs` - `Regression BUG-001: legacy credentials require consent and successful migration scrubs every durable copy` | `npx --no-install playwright test tests/provider-credentials.spec.mjs --reporter=list` | Yes | Dismiss and accept branches, exact scrub verification |
| Regression E2E | e2e-ui | SCN-BUG001-005 | `tests/provider-credentials.spec.mjs` - `Regression BUG-001: unknown and prototype-shaped providers fail without mutation` | `npx --no-install playwright test tests/provider-credentials.spec.mjs --reporter=list` | Yes | Browser-exposed central API rejects every rogue ID without state or prototype mutation |
| Regression E2E | e2e-ui | SCN-BUG001-006 | `tests/provider-credentials.spec.mjs` - `Regression BUG-001: clear all removes active and legacy credentials` | `npx --no-install playwright test tests/provider-credentials.spec.mjs --reporter=list` | Yes | UI and both storage classes empty |
| Adversarial | functional | SCN-BUG001-004 | `tests/provider-credentials.functional.mjs` - `adversarial scrub failure clears staged session credentials and reports no values` | `node --test tests/provider-credentials.functional.mjs` | No | Failure cannot become partial success |
| Stress | stress | SCN-BUG001-003, SCN-BUG001-006 | `tests/provider-credentials.stress.mjs` - `250 save clear remount cycles retain bounded state and zero rendered secrets` | `node tests/provider-credentials.stress.mjs` | Yes | Bounded store/status and zero sentinel output |
| Load | load | SCN-BUG001-002 | `tests/provider-credentials.load.mjs` - `parallel browser contexts and tabs never share provider credentials` | `node tests/provider-credentials.load.mjs` | Yes | No cross-context or independent-tab crossover |

### Historical Completion Record - SCOPE-01

- Historical complete: Root cause recorded against the old G028 ledger.
- Historical complete: The superseded session/migration implementation was exercised.
- Historical open: Complete pre-fix RED was unavailable.
- Historical complete: Adversarial checks existed for the superseded contract.
- Historical complete: Targeted old-contract checks passed at that time.
- Historical complete: Old regression-quality checks passed.
- Historical complete: Old scenario E2E coverage existed.
- Historical open: Broader E2E was not green.
- Historical complete: Old bootstrap canaries passed.
- Historical open: Rollback proof was incomplete.
- Historical complete: A prior boundary check was recorded.
- Historical complete: Old `rlData`/shell/load canaries passed.
- Historical open: All project checks were not green.

### Historical Scope 2: Tool Consumer Purge, Provider Transport, And G028 Reconciliation

**Historical status:** In Progress under the superseded contract  
**Priority:** P0  
**Depends On:** SCOPE-01  
**Scope-Kind:** runtime-behavior

### Historical Scenario Record - SCOPE-02

#### SCN-BUG001-007 - A sentinel credential leaves no rendered or diagnostic trace

```gherkin
Historical scenario record: SCN-BUG001-007 - Credential values do not enter output or navigation surfaces
Given a unique sentinel credential is configured
When settings render errors are exercised and same-origin navigation occurs
Then the sentinel is absent from outerHTML text attributes console output errors URLs and referrers
```

#### SCN-BUG001-008 - Tool consumers cannot recreate the editor

```gherkin
Historical scenario record: SCN-BUG001-008 - Registered tools use only the central credential read contract
Given the current tools.json registry
When every registered tool source and live page is inspected
Then no tool declares credential inputs rlKeys rlSetKey migrateKeys or direct credential storage access
And credential reads flow only through the approved central API
```

#### SCN-BUG001-009 - Twelve Data stays disabled without authorization evidence

```gherkin
Historical scenario record: SCN-BUG001-009 - Twelve Data browser-key use fails closed while authorization is unverified
Given no approved Twelve Data browser authorization record exists
When a tool requests a Twelve Data credential-backed fetch
Then no Twelve Data request is sent
And the user receives a safe provider-disabled status with no key material
```

#### SCN-BUG001-010 - Header auth never becomes query auth

```gherkin
Historical scenario record: SCN-BUG001-010 - Header-capable provider credentials never enter URLs
Given a provider policy authorizes browser use and header authentication
When the provider request is constructed and sent
Then the credential is present only in the approved auth header
And the URL query fragment logs and referrer contain no credential
And no query-auth retry occurs after an auth failure
```

#### SCN-BUG001-011 - Genuine findings close without deleting non-secret cache behavior

```gherkin
Historical scenario record: SCN-BUG001-011 - The nine G028 findings receive truthful one-to-one closure
Given the baseline G028 row ledger and the non-secret rlData cache contract
When remediation and scanner reconciliation are complete
Then all four genuine scanner rows and the central-store blind spot are removed
And all five false-positive rows are resolved semantically upstream
And non-secret rlData cache round trips still pass
```

### Historical UI Scenario Matrix - SCOPE-02

| Scenario | Preconditions | Steps | Expected | Test Type | Evidence |
| --- | --- | --- | --- | --- | --- |
| Sentinel disclosure | Configured sentinel in original tab | Save, remount, trigger safe failures, navigate | Zero sentinel in DOM/console/error/URL/referrer | e2e-ui | `report.md#scenario-scn-bug001-007` |
| Registry sweep | `tools.json` loaded | Visit every tool and scan source/runtime controls | No editor/writer; central read only | e2e-ui | `report.md#scenario-scn-bug001-008` |
| Twelve Data disabled | No authorization record | Request TD-backed data | No outbound TD request; safe disabled state | e2e-ui | `report.md#scenario-scn-bug001-009` |
| Header transport | Verified header fixture | Build request, force auth failure | Header only; no query retry | functional | `report.md#scenario-scn-bug001-010` |
| G028 closure | Baseline ledger | Run scanner and cache canary | Nine truthful dispositions and cache retained | integration | `report.md#scenario-scn-bug001-011` |

### Historical Implementation Record - SCOPE-02

1. Capture failing static, functional, and browser regressions for SCN-BUG001-007 through SCN-BUG001-011.
2. Inventory every registered page and remove inline credential inputs, `rlKeys`, `rlSetKey`, `migrateLegacyKeys`, and direct credential storage writes.
3. Route all remaining credential reads through the central approved-provider API.
4. Inventory every provider request builder. Remove credential-bearing query construction where header auth is verified; remove query fallback branches.
5. Disable Twelve Data browser credential requests at every call site until authorization evidence is approved.
6. Disable any other unverified/query-only browser adapter rather than guessing provider capability.
7. Add referrer controls and safe provider-disabled/auth-failure statuses with no credential content.
8. Replace bug-preserving selftest assertions with scenario-specific regressions and retain non-secret cache canaries.
9. Route G028 scanner/policy changes to the canonical Bubbles source repository and upgrade the downstream install through its normal mechanism.
10. Reconcile project-owned credential instructions and managed docs through their owning agents after implementation truth exists.

### Consumer Impact Sweep - SCOPE-02

- Producer APIs: central credential read/status/mutation/migration/clear operations and provider request builder.
- First-party consumers: all `tools.json` entries, nav/deep links that open new tabs, selftest harness, browser tests, notes, README, project instructions, active spec/design references.
- Removed identifiers: `localStorage.rlApiKeys`, tool-local `rlKeys`, tool-local `rlSetKey`, unconditional `migrateKeys`, credential-bearing URL parameters.
- Required stale-reference proof: zero first-party secret storage writers outside the central owner, zero tool editor/setter symbols, zero credential-bearing URL builders, and zero docs claiming durable storage.

### Historical Change Boundary - SCOPE-02

Allowed delivery families are the central shared files, the registered tool pages proven by the consumer inventory to contain credential helpers/transports, credential-specific tests, exact project-owned docs/policy references, and an upstream Bubbles proposal/change in the canonical Bubbles repository.

Excluded families are tool analytics/formulas, market data snapshots/history, universes, unrelated specifications, deployment surfaces, and all pre-existing dirty hunks unrelated to credentials. The downstream installed framework is read-only. No broad search-and-replace may rewrite complete HTML pages.

### Historical Test Matrix - SCOPE-02

| Historical record type | Category | Scenario | File / exact test title | Command | Live System | Expected proof |
| --- | --- | --- | --- | --- | --- | --- |
| Unit | unit | SCN-BUG001-010 | `tests/provider-credentials.unit.mjs` - `verified header provider builds a secret-free URL and no query fallback` | `node --test tests/provider-credentials.unit.mjs` | No | Credential only in approved header object |
| Functional | functional | SCN-BUG001-010 | `tests/provider-credentials.functional.mjs` - `auth failure never retries with a credential query parameter` | `node --test tests/provider-credentials.functional.mjs` | No | One header attempt, safe failure, zero query retry |
| Static security | functional | SCN-BUG001-008 | `scripts/selftest.mjs` - `registered tools expose no duplicate provider credential editor or storage writer` | `node scripts/selftest.mjs` | No | Registry-derived zero-match sweep |
| Static security | functional | SCN-BUG001-011 | `scripts/selftest.mjs` - `provider credentials have no durable store or credential-bearing URL transport` | `node scripts/selftest.mjs` | No | Central store and all consumers meet contract |
| Canary | integration | SCN-BUG001-011 | `scripts/selftest.mjs` - `Canary: non-secret rlData cache still persists and round-trips` | `node scripts/selftest.mjs` | No | Credential fix does not delete valid data cache |
| Regression E2E | e2e-ui | SCN-BUG001-007 | `tests/provider-credentials.spec.mjs` - `Regression BUG-001: sentinel credential never appears in DOM console errors URL or referrer` | `npx --no-install playwright test tests/provider-credentials.spec.mjs --reporter=list` | Yes | Zero sentinel disclosure across named surfaces |
| Regression E2E | e2e-ui | SCN-BUG001-008 | `tests/provider-credentials.spec.mjs` - `Regression BUG-001: every registered tool has no credential editor or storage writer` | `npx --no-install playwright test tests/provider-credentials.spec.mjs --reporter=list` | Yes | Registry-wide source and runtime contract |
| Regression E2E | e2e-ui | SCN-BUG001-009 | `tests/provider-credentials.spec.mjs` - `Regression BUG-001: Twelve Data browser credential calls remain disabled without authorization evidence` | `npx --no-install playwright test tests/provider-credentials.spec.mjs --reporter=list` | Yes | No TD request; safe disabled status |
| Adversarial | functional | SCN-BUG001-010 | `tests/provider-credentials.functional.mjs` - `adversarial credential-like query names and encoded sentinels never enter request URLs` | `node --test tests/provider-credentials.functional.mjs` | No | URL remains secret-free under variant inputs |
| Regression E2E | e2e-ui | SCN-BUG001-010 | `tests/provider-credentials.spec.mjs` - `Regression BUG-001: approved header auth never places credentials in URLs or retries with query auth` | `npx --no-install playwright test tests/provider-credentials.spec.mjs --reporter=list` | Yes | Live request observation proves header-only auth and no query retry |
| Regression E2E | e2e-ui | SCN-BUG001-011 | `tests/provider-credentials.spec.mjs` - `Regression BUG-001: G028 inventory closes genuine rows without deleting noncredential rlData cache` | `npx --no-install playwright test tests/provider-credentials.spec.mjs --reporter=list` | Yes | UI and cache behavior coexist |
| G028 | integration | SCN-BUG001-011 | Canonical scanner - `implementation reality reports zero credential findings and no cache false positives` | `bash .github/bubbles/scripts/cli.sh scan specs/_bugs/BUG-001-central-provider-credential-security` | No | Upstream-approved semantics; no bypass or obfuscation |
| Broader regression | functional | SCN-BUG001-007 through SCN-BUG001-011 | Existing project selftest suite | `node scripts/selftest.mjs` | No | Existing shared behavior remains green |
| Broader E2E | e2e-ui | SCN-BUG001-007 through SCN-BUG001-011 | Existing committed Playwright suites plus credential regression | `npx --no-install playwright test --reporter=list` | Yes | No collateral browser regression |
| Stress | stress | SCN-BUG001-007, SCN-BUG001-010 | `tests/provider-credentials.stress.mjs` - `provider failures and navigation churn emit zero secret-bearing output` | `node tests/provider-credentials.stress.mjs` | Yes | Repeated failures remain redacted |
| Load | load | SCN-BUG001-008 | `tests/provider-credentials.load.mjs` - `all registered pages load concurrently without recreating credential writers` | `node tests/provider-credentials.load.mjs` | Yes | Registry-wide concurrent consumer contract |

### Historical Completion Record - SCOPE-02

- Historical complete: Old product-side genuine findings were addressed.
- Historical open: Scanner semantic rows remained unresolved.
- Historical complete: Twelve Data was disabled.
- Historical complete: Header-only behavior was exercised.
- Historical complete: Old tool-consumer checks passed.
- Historical complete: Old sentinel checks passed.
- Historical open: Complete pre-fix RED was unavailable.
- Historical complete: Adversarial checks existed for the superseded contract.
- Historical complete: Old targeted checks passed.
- Historical complete: Old regression-quality checks passed.
- Historical complete: Old E2E titles were exercised.
- Historical open: Broader E2E was not green.
- Historical complete: A prior consumer sweep was recorded.
- Historical open: Canonical G028 semantics remained unresolved.
- Historical open: Managed docs were not synchronized.
- Historical open: No terminal bug certification occurred.
- Historical complete: A prior boundary check was recorded.
- Historical open: All project checks were not green.

### Historical Structured Handoff

```yaml
packet: BUG-001-central-provider-credential-security
currentOwner: bubbles.plan
currentOutcome: route_required
routes:
  - order: 1
    owner: bubbles.implement
    requiredInput: Reconciled design.md, scopes.md, scenario-manifest.json, test-plan.json, and the unchanged G028-01 through G028-09 ledger in report.md.
    requiredOutput: Minimal source/test/doc delta with one-to-one finding accounting and red-to-green evidence.
historicalImplementationDispatchAllowedThen: false
scopeStatuses:
  SCOPE-01: not_started
  SCOPE-02: not_started
```
