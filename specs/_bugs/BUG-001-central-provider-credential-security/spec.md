# Bug Specification: BUG-001 Central Provider Credential Security

Links: [bug.md](bug.md) | [design.md](design.md) | [scopes.md](scopes.md) | [report.md](report.md) | [uservalidation.md](uservalidation.md)

## Authority And Supersession

[BUG-002 Two-Tier Provider Access](../BUG-002-two-tier-provider-access/spec.md) is the sole active authority for current provider access. It defines the Tier-1 proxy and Tier-2 per-browser local-key model, including `localStorage.rlProviderConfig`.

BUG-001 retains exactly one active requirement set: SCOPE-01 erases exact credential containers that predate BUG-002 while preserving current BUG-002 configuration. The retained behavioral anchor is `SCN-BUG001-004`.

The former BUG-001 memory-only, no-persistence, lifecycle-clearing, disabled-provider, header-only, no-proxy, and no-query contracts are superseded historical context. They are not executable requirements, acceptance criteria, or certification inputs for BUG-001.

## Problem Statement

Browsers that used the pre-BUG-002 credential model can still contain credential-bearing containers under exact historical names. Those obsolete containers need a bounded, user-confirmed erasure path.

Current provider access is not a BUG-001 problem. BUG-002 intentionally supports a primary proxy tier and a fallback local-key tier persisted in `localStorage.rlProviderConfig`. BUG-001 cleanup must not classify, remove, rewrite, disable, or otherwise reinterpret that current configuration.

## Outcome Contract

**Intent:** Retire exact pre-BUG-002 credential containers without changing the current Tier-1 proxy or Tier-2 `localStorage.rlProviderConfig` behavior owned by BUG-002.

**Success Signal:** When registered pre-BUG-002 containers coexist with valid current provider configuration, the product reports only redacted legacy presence, obtains destructive-cleanup confirmation, removes and verifies the selected historical names, and leaves BUG-002 proxy configuration, `localStorage.rlProviderConfig`, and non-secret `localStorage.rlData` unchanged. A forced deletion failure produces an explicit incomplete result and never a success claim.

**Hard Constraints:** BUG-002 remains authoritative for all current provider-access behavior. The legacy registry contains only exact pre-BUG-002 container names and excludes `rlProviderConfig`, proxy configuration, `rlData`, and unknown names. Detection and cleanup do not activate or migrate legacy credentials. Whole-container deletion requires destructive-effect disclosure and explicit confirmation. Only `SCN-BUG001-004` and SCOPE-01 are active under BUG-001. Existing execution evidence may establish behavior observed by prior runs, but only `bubbles.validate` may certify completion.

**Failure Condition:** BUG-001 fails if cleanup selects an unknown or current container, changes current proxy or Tier-2 configuration, changes non-secret `rlData`, activates or migrates a legacy value, reports incomplete deletion as success, or reinstates any superseded memory-only, no-persistence, disabled-provider, or no-proxy rule as active behavior.

## Expected Behavior

1. Current provider access continues to follow BUG-002: Tier 1 uses the configured proxy, and Tier 2 uses this browser's keys from `localStorage.rlProviderConfig`.
2. BUG-001 detects only exact registered pre-BUG-002 legacy container names and presents provider/location classes and counts without activating their contents.
3. Before deletion, the user sees that whole-container cleanup can remove nested non-secret preferences and explicitly confirms the destructive action.
4. Confirmed cleanup removes only selected registered legacy names and verifies each name is absent.
5. BUG-002 proxy configuration, `localStorage.rlProviderConfig`, and non-secret `localStorage.rlData` remain unchanged through detection, successful cleanup, and incomplete cleanup.
6. If any selected legacy name remains, the result is explicitly incomplete, redacted, and not represented as success.

## Evidence Basis

| Evidence | Contract conclusion |
| --- | --- |
| [BUG-002 spec](../BUG-002-two-tier-provider-access/spec.md) FR-2 through FR-9 | The proxy plus durable per-browser `localStorage.rlProviderConfig` model is current, intentional behavior and is outside BUG-001 cleanup authority. |
| [scopes.md](scopes.md) active SCOPE-01 | Planning retains only exact pre-BUG-002 legacy-container erasure and explicitly protects current provider configuration. |
| [scenario-manifest.json](scenario-manifest.json) | `SCN-BUG001-004` is the only active scenario; all other former BUG-001 scenarios are recorded as superseded. |
| [report.md](report.md) SCOPE-01 completion replay | Current execution records report the six mapped test rows green, including successful and forced-incomplete cleanup paths. This is execution evidence, not analyst-authored certification. |
| [state.json](state.json) | Top-level and certification status remain `in_progress`; certification scope progress remains nonterminal and validate-owned. |
| `BUG001-G070-ACTIVE-CONTRACT` in [report.md](report.md) | Validation routed the stale active Outcome Contract to `bubbles.analyst`; this reconciliation consumes that finding without changing report or certification history. |

## Actors And Personas

| Actor | Goal | Permission boundary |
| --- | --- | --- |
| Current provider-access user | Continue using the proxy or this browser's configured local keys | Current configuration is governed by BUG-002 and cannot be removed or restricted by BUG-001 cleanup |
| Legacy-storage user | Understand and erase obsolete credential containers | May confirm deletion of exact registered historical containers; cannot select current or unknown containers |
| Security reviewer | Verify obsolete containers are retired without regressing current access | Reviews redacted detection, exact-name deletion, preservation, and incomplete-result behavior; does not redefine BUG-002 |

## Domain Capability Model

The active BUG-001 capability is **Legacy Credential Container Retirement**. It is a bounded cleanup capability, not a provider-access foundation. BUG-002 owns the provider-access foundation and its proxy/local-key variation.

| Primitive | Purpose | Lifecycle |
| --- | --- | --- |
| `ProtectedCurrentConfiguration` | Represents BUG-002 proxy settings, `localStorage.rlProviderConfig`, and non-secret `rlData` that cleanup must preserve | present or absent before cleanup; byte-compatible afterward |
| `LegacyContainerRegistry` | Closed metadata for exact pre-BUG-002 credential container names | fixed historical set; never expanded from browser contents |
| `LegacyPresenceSummary` | Redacted provider/location classes and counts for registered names that exist | absent or detected; never becomes provider configuration |
| `LegacyEraseResult` | Reports verified complete or explicit incomplete deletion | not attempted, complete, or incomplete |

Business policies:

- Current provider access always resolves under BUG-002, never under BUG-001.
- Only exact registered pre-BUG-002 names are eligible for BUG-001 cleanup.
- Current and unknown containers are structurally excluded from selection.
- Detection does not turn historical contents into an active credential.
- Complete means every selected historical name was verified absent; any remainder means incomplete.

## Use Cases

### UC-BUG001-001: Erase obsolete credential containers

- **Actor:** Legacy-storage user
- **Preconditions:** At least one exact registered pre-BUG-002 container exists; current BUG-002 configuration may also exist.
- **Main Flow:**
  1. The user opens Data settings.
  2. The product reports redacted legacy provider/location classes and counts.
  3. The product discloses the whole-container destructive effect.
  4. The user confirms cleanup.
  5. The product removes each selected historical name and verifies absence.
  6. The product reports complete while current BUG-002 configuration remains unchanged.
- **Alternative Flows:** The user dismisses without mutation, or one deletion fails and the product reports incomplete with redacted remaining classes/counts while current configuration remains unchanged.
- **Postconditions:** Selected legacy names are absent only on complete; BUG-002 configuration remains intact in every outcome.

## Active Requirements

- **CRD-013:** The legacy registry contains only exact credential container names established before BUG-002. It excludes `rlProviderConfig`, proxy configuration, `rlData`, and unknown names.
- **CRD-014:** Detection reports only registered provider IDs, location classes, and counts and does not activate or migrate a legacy credential.
- **CRD-015:** Before whole-container deletion, the product discloses that nested non-secret preferences can also be removed and requires explicit confirmation.
- **CRD-016:** Confirmed cleanup removes only selected registered legacy names and reports complete only after verifying every selected name is absent.
- **CRD-017:** Detection, dismissal, complete cleanup, and incomplete cleanup leave BUG-002 proxy configuration, `localStorage.rlProviderConfig`, and non-secret `localStorage.rlData` unchanged. Incomplete cleanup is explicit and redacted and never claims success.

## Active Business Scenario

### SCN-BUG001-004: Pre-BUG-002 credential containers are erased without disturbing current provider access

```gherkin
Scenario: SCN-BUG001-004 - Pre-BUG-002 credential containers are erased without disturbing current provider access
  Given exact registered pre-BUG-002 legacy credential containers are present
  And BUG-002 proxy configuration and localStorage.rlProviderConfig contain valid current configuration
  When the product detects legacy credential presence
  Then it reports only registered provider ids location classes and counts
  And it does not activate a credential from a legacy container
  When the user confirms destructive legacy cleanup
  Then every selected pre-BUG-002 container is removed and verified absent by exact name
  And BUG-002 proxy configuration and localStorage.rlProviderConfig are unchanged
  And an incomplete deletion reports explicit redacted failure without claiming success
```

## Acceptance Criteria

| Scenario | Acceptance signal |
| --- | --- |
| `SCN-BUG001-004` | Exact registered pre-BUG-002 names are detected and erased with disclosure and confirmation; name absence is verified; forced incomplete deletion remains explicit and redacted; current proxy configuration, `localStorage.rlProviderConfig`, and `rlData` remain unchanged. |

## UI Scenario Matrix

| Scenario | Actor | Entry point | Steps | Expected visible outcome | Screen |
| --- | --- | --- | --- | --- | --- |
| `SCN-BUG001-004` | Legacy-storage user | `index.html#data-settings` | Open settings, review redacted presence and disclosure, confirm or dismiss cleanup | Dismissal makes no change; confirmed complete cleanup reports success only after verification; forced incomplete cleanup reports redacted failure; current provider access remains configured | Data settings |

## Planning And Evidence Boundary

The active contract contains one scope and one scenario. [scopes.md](scopes.md), [scenario-manifest.json](scenario-manifest.json), and [test-plan.json](test-plan.json) already use SCOPE-01 and `SCN-BUG001-004` as their active execution surface.

The existing SCOPE-01 replay reports the mapped behavior green. This analyst reconciliation does not rerun product tests, certify those results, change scope status, or change state. Terminal completion remains unclaimed until the owning validation workflow evaluates the reconciled contract and current evidence.

## Exclusions

- Defining, restricting, enabling, or disabling current provider access.
- Replacing BUG-002's Tier-1 proxy or Tier-2 local-key model.
- Treating `localStorage.rlProviderConfig` as obsolete or forbidden.
- Imposing a memory-only, no-persistence, lifecycle-clearing, header-only, no-proxy, or no-query contract on current provider access.
- Changing source, tests, design, scopes, reports, state, certification, BUG-004, or framework-managed files as part of this analyst reconciliation.

## Superseded Historical Context - Do Not Execute

Everything below this boundary is non-active history. It preserves the prior contract in place but supplies no requirement, scenario, acceptance criterion, test obligation, or certification input. The active identifier-level dispositions are summarized at the end of this appendix.

### History - Actors & Personas

| Actor | Goals | Permission boundary |
| --- | --- | --- |
| Credential owner | Use an eligible provider for one current document and clear all reachable credential material | May enter a credential only in an eligible document's shared control; cannot opt into persistence or cross-document transfer |
| Research tool user | Use public/no-key data paths and understand why browser-key functionality is disabled | Receives non-secret status and sanitized results only; never receives a raw credential or request header |
| Legacy-storage user | Discover and erase credential-bearing legacy containers without reactivating their contents | May dismiss or authorize destructive erase; cannot migrate, copy, inspect, or selectively preserve credential-bearing values |
| Provider policy owner | Decide whether an exact provider operation may run from an exact browser document | May enable only with verified browser-origin authorization, non-URL transport, exact origin/operation, and document eligibility evidence |
| Security reviewer | Verify lifetime, non-disclosure, closed-provider behavior, erasure, G028 disposition, and residual trust boundaries | Cannot waive the sensitive-client-storage rule or accept scanner evasion as remediation |
| Delivery planner and test owner | Translate stable business scenarios into executable contracts | Must invalidate old continuity/migration tests and preserve historical evidence without treating it as current proof |
| Canonical Bubbles framework owner | Resolve genuine scanner precision issues for non-secret cache and erase-only behavior | May change semantics only in the canonical framework; no downstream Research Lab framework edit is permitted |

### History - Domain Capability Model

### History - Capability

**Provider Credential Runtime Safety** is the shared domain capability governing temporary credential possession, provider eligibility, legacy cleanup, and authorized request use across the index and every registered Research Lab document. It is provider-neutral and page-neutral; concrete providers and pages cannot create their own credential lifecycle.

### History - Domain Primitives

| Primitive | Purpose | Lifecycle |
| --- | --- | --- |
| `CredentialRuntime` | Represents application-reachable credential state for exactly one loaded document | `unconfigured -> configured -> cleared`; any reload, route/navigation boundary, close, crash/reopen, context creation, or explicit clear yields `unconfigured` with no restore path |
| `ProviderPolicy` | Closed record deciding whether one provider operation may use a browser credential in one document | `unverified/disabled -> verified/eligible`; missing or invalid evidence stays `disabled`; evidence or contract invalidation returns it to `disabled` |
| `LegacyPresence` | Redacted observation that known credential-bearing containers exist | `unknown -> absent or detected`; `detected -> erase-requested or dismissed`; it never transitions into `CredentialRuntime` |
| `ErasureResult` | Outcome of removing known legacy containers without reading their values | `not-attempted -> complete, incomplete, or unavailable`; only `complete` permits an erasure-success claim |
| `RequestAuthorization` | Decision binding one configured runtime to one provider, operation, origin, transport, and document | `denied -> authorized -> consumed`; any mismatch remains `denied`, and an auth/request failure does not authorize a fallback attempt |

### History - Relationships

- A `CredentialRuntime` may become configured only when the current document and requested operation satisfy one explicit `ProviderPolicy`.
- `RequestAuthorization` consumes a credential internally from the same document's `CredentialRuntime`; it never returns the credential, headers, or a transferable credential object to a caller.
- `LegacyPresence` is derived from known provider/location metadata and container names only. It has no value path into `CredentialRuntime`.
- Clear all first clears the invoking document's `CredentialRuntime`, then produces an `ErasureResult` for every known durable legacy location.
- The index document may own non-secret provider status and legacy cleanup, but it cannot configure a separate tool document. A tool may use the shared capability only when that same loaded document owns both shared input and authorized request execution.

### History - Business Policies

- No credential primitive has a serialized form, persistence schema, default value, fallback source, or cross-document transfer representation.
- No URL, `postMessage`, BroadcastChannel, ServiceWorker, SharedWorker, cookie, opener, `window.name`, storage event, browser storage, or equivalent bridge may connect credential runtimes.
- Legacy cleanup is erase-only. Reading, parsing, copying, staging, hashing, migrating, selectively rewriting, or activating a legacy credential value is prohibited.
- Provider enablement is a closed conjunction, not a best-effort score. Missing browser-origin authorization, non-URL transport, exact origin/operation, same-document ownership, or required document security posture means disabled.
- Every concrete provider and every registered document must obey the same output, erasure, unknown-provider, clear, dirty-tree, and governance policies.

### History - Use Cases

### History - UC-001: Use a tool without browser credentials

- **Actor:** Research tool user
- **Preconditions:** A registered tool is opened with no eligible configured provider.
- **Main Flow:** The tool loads its existing public/no-key behavior, shows a non-secret disabled or unconfigured provider status, and sends no credential-backed request.
- **Alternative Flows:** If a public data source is unavailable, the tool reports that existing failure without requesting or inventing a credential fallback.
- **Postconditions:** No credential state or persistence is created.

### History - UC-002: Use an eligible provider within one document

- **Actor:** Credential owner
- **Preconditions:** One document and operation satisfy every field of a verified `ProviderPolicy` and expose the shared credential control. No current production provider meets this precondition.
- **Main Flow:** The user enters a credential, the input is blanked, the current document reports configured status, and an approved request consumes the credential internally without leaving the document.
- **Alternative Flows:** Any missing eligibility field, document mismatch, unknown provider, invalid credential, or transport failure returns a safe disabled/error status and sends no fallback request.
- **Postconditions:** The credential remains reachable only in the current document until clear or any lifecycle boundary.

### History - UC-003: Detect and erase legacy credential containers

- **Actor:** Legacy-storage user
- **Preconditions:** One or more known legacy container names are present.
- **Main Flow:** The product reports provider/location classes and counts only, explains that whole-container erase may remove non-secret preferences, obtains destructive-erase confirmation, removes known containers, and verifies name absence.
- **Alternative Flows:** Dismissal leaves the containers untouched and inactive. Incomplete or unavailable erase returns a leak-free failure with remaining location classes/counts only.
- **Postconditions:** No legacy value has entered active credential memory; only complete verification produces success.

### History - UC-004: Clear current and legacy credential material

- **Actor:** Credential owner
- **Preconditions:** The invoking document may hold a credential and known legacy containers may exist.
- **Main Flow:** Clear all immediately clears current-document references, blanks shared inputs and status, erases every known legacy container, and verifies erasure.
- **Alternative Flows:** If durable cleanup is incomplete, current memory remains empty and the product reports explicit incomplete cleanup without restoring any value.
- **Postconditions:** The invoking document is unconfigured; success is reported only when every known legacy location is absent.

### History - UC-005: Approve or reject a provider policy

- **Actor:** Provider policy owner and security reviewer
- **Preconditions:** Official evidence and an exact provider/document/operation proposal are available.
- **Main Flow:** Reviewers verify browser-origin authorization, non-URL header transport, exact origin and operation, same-document input/request ownership, and document security eligibility.
- **Alternative Flows:** Missing, ambiguous, expired, or contradictory evidence keeps the provider disabled. There is no default or temporary fallback approval.
- **Postconditions:** The closed registry records an explicit eligible or disabled state through owned design/security review.

### History - Requirements

### History - Central Ownership

- **CRD-001:** One shared credential capability is the sole owner of credential input, current-document status, clearing, legacy cleanup, and provider request authorization. Registered pages must not define a tool-local editor, getter, setter, writer, migration helper, request-header exporter, or credential store.
- **CRD-002:** `index.html#data-settings` may expose non-secret provider status and legacy cleanup. It must not promise that a credential entered on the index can configure a separate tool document. While the index owns no approved same-document provider operation, it is not an active credential-entry path.
- **CRD-003:** A registered tool may expose the shared credential control only when that same loaded document owns both the input action and the approved request execution. Otherwise browser-key functionality is disabled; a bespoke tool-local control is never permitted.
- **CRD-004:** The provider registry is closed. Unknown, empty, inherited, prototype-shaped, or malformed provider, operation, origin, or document identifiers fail explicitly before state change or request execution.

### History - Current-Document Lifetime

- **CRD-005:** A credential may exist only in application-reachable process memory scoped to the current loaded document. It has no serialized envelope, persistence schema, public raw-value getter, or bulk representation.
- **CRD-006:** Reload, same-tab navigation to another HTML page, hash or history route navigation, bfcache traversal, close, crash followed by reopen, new tab, new window, iframe document, new browser context, and explicit clear all each result in unconfigured state for the affected document.
- **CRD-007:** No credential may cross a document boundary through a URL, query, fragment, form submission, `postMessage`, BroadcastChannel, ServiceWorker, SharedWorker, cookie, opener, `window.name`, history state, DOM handoff, storage event, file, or equivalent bridge.
- **CRD-008:** No credential may be written to `localStorage`, `sessionStorage`, IndexedDB, Cache Storage, AsyncStorage, SharedPreferences, cookies, non-secret cache objects, committed files, or any similar browser/client storage. Shorter lifetime, encryption, encoding, or user consent does not create an exception.
- **CRD-009:** Missing memory capability, policy evidence, document eligibility, or transport configuration fails explicitly. There is no persistence fallback, query fallback, default provider, default operation, or default authorization.

### History - Shared Credential UX

- **CRD-010:** An eligible shared credential input mounts blank, has no value-bearing attribute or submission name, is blanked immediately after configuration, and renders only provider ID, configured/disabled state, and a closed safe reason code.
- **CRD-011:** A blank input is a no-op. It cannot clear, replace, or synthesize a configured credential.
- **CRD-012:** Clear all first removes every credential reference held by the invoking document, blanks shared inputs, resets status, then erases and verifies all known durable legacy locations. Incomplete cleanup is an explicit failure, not partial success.

### History - Legacy Presence And Erase-Only Cleanup

- **CRD-013:** Legacy detection may observe known container names and report provider IDs, location classes, and counts derived from the closed location registry only. It must never read, parse, hash, compare, return, render, log, transmit, or retain a legacy credential value.
- **CRD-014:** Legacy credentials are erase-only material. No migrate, copy, stage, value readback, selective rewrite, activation, or consent-to-migrate action exists.
- **CRD-015:** Cleanup removes whole known credential-bearing containers without parsing them. If that also removes non-secret preferences, the destructive effect is disclosed before erase; preserving nested fields is not a reason to read the container.
- **CRD-016:** Dismissing legacy cleanup leaves known containers untouched and inactive. Destructive-erase confirmation authorizes deletion only, never value access or activation.
- **CRD-017:** Erasure verification uses container-name absence and platform deletion outcomes only. If any known location remains, current credential memory stays empty and the failure reports only redacted provider/location classes and counts.

### History - Output And Transport Safety

- **CRD-018:** Credential values never appear in rendered HTML, text, attributes, input remounts, accessibility labels, events, clipboard data, console messages, thrown errors, analytics, telemetry, screenshots, traces, snapshots, assertion output, test artifacts, request URLs, document URLs, history, resource entries, provider response diagnostics, or referrers.
- **CRD-019:** Status, comparison, cleanup, and diagnostics use only provider IDs, booleans/states, location classes, counts, and closed redacted reason codes. They expose no credential-derived length, hash, prefix, suffix, equality signal, raw header, response body, URL, stack, or serialized cause.
- **CRD-020:** Provider enablement requires verified official authorization for the intended browser origin, an approved non-URL transport, exact origin and operation constraints, same-document input and request ownership, and the required document security posture. Every field is mandatory and fail-closed.
- **CRD-021:** An eligible request places a credential only in the explicitly approved header for the exact provider origin and operation, uses no-referrer behavior, and performs no credential-bearing redirect, proxy, query, or alternate transport.
- **CRD-022:** Authentication or request failure returns one sanitized result. It does not retry with query authentication, another provider, another origin, a proxy, cached credentials, or any fallback path.
- **CRD-023:** Twelve Data browser credential use remains disabled. It may be enabled only if its verified browser-origin and non-URL transport contract changes through provider-policy, design, and security ownership review. No implementation or test may infer approval from a generic API document.
- **CRD-024:** Finnhub, Alpha Vantage, FRED, and every other current registry entry also remain disabled for browser credentials until each independently satisfies CRD-020. Transport documentation alone is insufficient authorization evidence.

### History - Compatibility And Governance

- **CRD-025:** Non-secret `localStorage.rlData` market-data caching, cache-first rendering, public/no-key provider paths, and existing tool analytics remain operational. They must not be removed or relabeled to silence credential findings.
- **CRD-026:** Tests and acceptance records that assert `sessionStorage`, reload/navigation continuity, index-to-tool continuity, or consented value migration are invalid for the active contract. Historical evidence remains unchanged as history, but only new scenario-faithful evidence may support current acceptance.
- **CRD-027:** G028-01 through G028-09 and the central-store blind spot receive one-to-one dispositions. Genuine credential paths are removed; non-secret cache and erase-only semantic false positives are routed to the canonical framework owner without deleting valid behavior or obscuring identifiers.
- **CRD-028:** No Research Lab downstream framework file is edited for this bug. Any matcher or governance change is made in the canonical Bubbles repository and consumed only through the supported upgrade path.
- **CRD-029:** Delivery preserves all pre-existing dirty product, test, spec, evidence, generated-data, and collision-constrained work. No stash, reset, clean, checkout overwrite, staging, wholesale rewrite, broad formatting, or unrelated modification is permitted.

### History - User Scenarios

### History - SCN-BUG001-001: One shared capability owns every credential surface

```gherkin
Scenario: Credential behavior is confined to the shared current-document capability
  Given every registered Research Lab page is available
  When the index and every tool source and live page are inspected
  Then no page defines a tool-local credential editor getter setter writer migration helper or credential store
  And index.html exposes only non-secret provider status and legacy cleanup while it owns no approved same-document provider request
  And any future credential input uses the shared capability in the same document that executes the approved request
```

### History - SCN-BUG001-002: Every document boundary clears configured state

```gherkin
Scenario: A credential never survives or crosses a document lifecycle boundary
  Given a controlled eligible provider is configured in the current loaded document
  When the user reloads navigates to another HTML page changes route returns through bfcache closes or reopens the page or opens a new tab window or browser context
  Then every resulting document is unconfigured
  And no credential is transferred through a browser bridge
```

### History - SCN-BUG001-003: Same-document use reveals status, never the value

```gherkin
Scenario: An eligible document consumes a credential without exposing it
  Given a provider policy authorizes one operation in the current document
  When the user enters a sentinel credential and invokes that operation without leaving the document
  Then the field is immediately blank
  And only configured status and a sanitized operation result are visible
  And no caller receives the credential or request headers
```

### History - SCN-BUG001-004: Legacy material is detected without value access and erased only

```gherkin
Scenario: Legacy credentials can be reported and erased but never activated
  Given known durable legacy container names are present
  When the product detects legacy presence
  Then it reports provider ids location classes and counts only
  And it does not read parse copy stage compare or activate a legacy value
  When the user authorizes erase-only cleanup
  Then whole known containers are removed and their name absence is verified
  And the current document remains unconfigured
```

### History - SCN-BUG001-005: Unknown providers fail without mutation

```gherkin
Scenario: Unknown and prototype-shaped provider identifiers are rejected
  Given the current-document runtime has a known baseline state
  When a caller supplies an unknown empty inherited constructor or __proto__ provider identifier
  Then the call fails with a safe unknown-provider reason
  And no runtime policy object storage surface or prototype is mutated
```

### History - SCN-BUG001-006: Clear-all is complete

```gherkin
Scenario: Clear-all removes active and legacy credential material
  Given the current document holds an eligible credential and known legacy containers exist
  When the user selects Clear all
  Then current-document credential references are removed first
  And all shared fields are blank and statuses are unconfigured
  And every known durable legacy location is erased and verified without value readback
  And incomplete erasure returns an explicit leak-free failure without restoring memory state
```

### History - SCN-BUG001-007: A sentinel credential leaves no rendered or diagnostic trace

```gherkin
Scenario: Credential values do not enter output or navigation surfaces
  Given a unique sentinel credential is configured in an eligible current document
  When rendering request failures clear lifecycle boundaries and disclosure scans are exercised
  Then the sentinel is absent from markup text attributes inputs accessibility output events logs errors analytics URLs referrers browser storage bridges and test artifacts
```

### History - SCN-BUG001-008: A static page transition cannot carry an index credential

```gherkin
Scenario: Index configuration never becomes tool configuration after navigation
  Given the index page and a registered tool are separate HTML documents
  When a user follows the tool link after viewing provider status or legacy cleanup on the index
  Then the tool starts unconfigured
  And the index offers no credential action that claims to configure the tool
  And no URL message channel worker cookie opener storage or other bridge transfers the credential
  And any future index-only credential action remains confined to an approved request executed by the index document itself
  And browser-key functionality remains disabled unless the consuming document itself owns shared input and approved request execution
```

### History - SCN-BUG001-009: Twelve Data stays disabled without authorization evidence

```gherkin
Scenario: Twelve Data browser-key use fails closed while authorization is unverified
  Given no verified Twelve Data browser-origin and non-URL transport contract exists
  When a tool requests a Twelve Data credential-backed fetch
  Then no Twelve Data request is sent
  And the user receives a safe provider-disabled status with no key material
```

### History - SCN-BUG001-010: Header auth never becomes query auth

```gherkin
Scenario: Header-capable provider credentials never enter URLs
  Given a controlled provider policy verifies browser-origin use exact operation exact origin same-document ownership and header authentication
  When the authorized request is constructed and sent from that document
  Then the credential is present only in the approved auth header
  And the URL redirects logs diagnostics and referrer contain no credential
  And no query proxy origin provider or transport fallback occurs after failure
```

### History - SCN-BUG001-011: Genuine findings close without deleting non-secret cache behavior

```gherkin
Scenario: The nine G028 findings receive truthful one-to-one closure
  Given the baseline G028-01 through G028-09 ledger the central-store blind spot the non-secret rlData cache contract and the protected dirty tree
  When memory-only remediation and scanner disposition are assessed
  Then every finding has exactly one addressed or owner-routed disposition
  And no client-persisted credential path remains
  And non-secret rlData behavior and concurrent dirty work remain intact
  And no downstream framework file or identifier-obfuscation workaround is used
```

### History - Acceptance Criteria

| Scenario | Acceptance signal |
| --- | --- |
| SCN-BUG001-001 | Registry-wide source/live inspection finds one shared capability, zero tool-local editors/getters/setters/writers/migration helpers/stores, and no active index credential input while the index owns no approved request |
| SCN-BUG001-002 | After reload, another-HTML navigation, route/history transition, bfcache return, close/reopen, crash/reopen simulation, new tab/window/context, and clear, configured status is false and every bridge scan is empty |
| SCN-BUG001-003 | A controlled eligible same-document path blanks the input, exposes status/sanitized result only, keeps the sentinel out of public return values, and loses configuration at the next lifecycle boundary |
| SCN-BUG001-004 | Detection returns only provider/location classes and counts; instrumentation observes zero value reads/parses/copies; erase removes whole registered containers and verifies name absence with runtime still empty |
| SCN-BUG001-005 | Unknown, empty, inherited, `constructor`, and `__proto__` IDs produce closed rejection with unchanged runtime, registry own-properties, storage surfaces, and prototypes |
| SCN-BUG001-006 | Clear removes invoking-document memory before durable cleanup; complete cleanup verifies every known name absent, while forced partial cleanup returns explicit failure, redacted remaining classes/counts, and no restored credential |
| SCN-BUG001-007 | Sentinel scan across DOM/accessibility, events, console/errors, analytics, URLs/referrers, performance entries, every client-storage/bridge class, and generated test artifacts returns zero matches |
| SCN-BUG001-008 | Index-to-tool navigation always yields an unconfigured tool, all named transfer channels carry zero credential data, and current tools expose no local editor/writer or credential-backed request |
| SCN-BUG001-009 | No request to the Twelve Data origin occurs without a verified browser-origin and non-URL transport record; only a safe disabled status is visible |
| SCN-BUG001-010 | Controlled eligible request uses exactly one approved-origin header attempt; URL/redirect/referrer/diagnostics contain no sentinel and no query, proxy, provider, origin, or transport retry occurs |
| SCN-BUG001-011 | G028-01 through G028-09 plus the blind spot each have one disposition; genuine persistence is absent; `rlData` canaries and protected dirty-hunk checks remain intact; downstream framework diff is empty |

### History - Planning Status And Evidence Boundary

The prior executable-contract invalidation has been reconciled. Scenario IDs `SCN-BUG001-001` through `SCN-BUG001-011` remain stable, and the active planning surfaces now encode their current-document memory-only and erase-only meanings. This reconciliation is a nonterminal planning result, not delivery or certification evidence.

| Active surface | Current nonterminal evidence |
| --- | --- |
| `scopes.md` | Five sequential scopes are active and all are Not Started. SCOPE-01 is the dependency-free foundation and is eligible for implementation dispatch. |
| `scenario-manifest.json` | All eleven stable scenario IDs map to the five active scopes with current semantics and no execution evidence references. |
| `test-plan.json` | The same five scopes are `not_started`; implementation dispatch is allowed, while the evidence boundary explicitly rejects pass claims before current execution. |
| `uservalidation.md` | The checklist records acceptance questions only and explicitly does not assert that implementation satisfies them. |
| `state.json` | `certification.scopeProgress` mirrors the same five `not_started` scopes; `completedScopes` is empty and `certifiedAt` is null. |

Delivery has not started under the active contract. Historical passing evidence remains a truthful record of the superseded session-continuity and migration behavior, but it cannot satisfy an active scenario, DoD item, acceptance claim, or certification decision. SCOPE-01 may begin only under the reconciled current-document memory-only, erase-only, and protected-dirty-tree contract.

### History - UI Scenario Matrix

| Scenario | Actor | Entry point | Visible outcome |
| --- | --- | --- | --- |
| SCN-BUG001-001, SCN-BUG001-008 | Research tool user | Index or any registered tool | Non-secret provider status; no continuity promise; current browser-key providers disabled |
| SCN-BUG001-003, SCN-BUG001-010 | Credential owner | Future eligible consuming document only | Shared blank input, configured state for that document, sanitized request result, no raw value |
| SCN-BUG001-004 | Legacy-storage user | Index legacy-cleanup surface | Redacted classes/counts, destructive-erase warning, dismiss or erase-only result |
| SCN-BUG001-006 | Credential owner | Shared clear-all action | Immediate unconfigured state and complete/incomplete legacy-erasure result |
| SCN-BUG001-009 | Research tool user | Twelve Data-dependent action | Safe provider-disabled status and no credential request |

### History - Exclusions

- Convenience continuity across reload, route change, same-tab navigation to another HTML page, close/reopen, crash/reopen, or any other document boundary. A static multi-page app cannot offer that convenience under this trust contract.
- Moving market analytics or non-secret market-data caches to a backend.
- Introducing a general user account, server-side vault, or synchronization service.
- Enabling a provider whose browser authorization and transport have not been verified.
- Preserving non-secret preferences nested inside a known credential-bearing legacy container when doing so would require reading or parsing that container.
- Adding any storage, message, URL, worker, opener, cookie, or other bridge to imitate continuity.
- Editing downstream framework files, weakening G028, adding an exception, or introducing a default/fallback authorization path.
- Reworking unrelated tool analytics, visual design, universes, or generated market snapshots.

### History - Residual Trust Boundary

Memory-only handling does not make a credential safe from malicious JavaScript already executing in the same loaded document. A credential-capable document therefore still requires the approved document security posture, script provenance, CSP, dependency integrity, and XSS prevention. Those controls are provider-eligibility gates and defense in depth; they do not permit storage or transfer.

Research Lab can remove its reachable references but cannot guarantee deterministic heap zeroization or control browser/OS crash dumps. Because no credential is persisted, restored, or bridged, a reload or reopen after a crash still begins unconfigured. The product must not claim a stronger physical-memory guarantee.

Clear all clears only the invoking document's memory because no cross-document communication channel exists. It also erases all known origin-wide durable legacy locations. Another already-open document, if independently configured under a future eligible policy, is outside the invoking document's reach and must clear itself on its own lifecycle or explicit action. This limitation is preferable to creating a credential bridge.

The active static multi-page product cannot offer credential convenience across reload or navigation. The index cannot configure a separate tool page, and current provider-backed browser requests remain disabled. There is no default, fallback, hidden persistence, or alternate transport that restores that convenience.

### History - Previously Superseded Requirements

> Historical and non-active. The former promises of same-tab `sessionStorage`, reload/navigation continuity, index-to-tool credential availability, consented value migration, session write/readback verification, and a G028 exception are preserved only as historical execution context.

### History - Identifier Disposition

| Historical contract | Historical identifiers | Disposition |
| --- | --- | --- |
| Current-document memory-only ownership, no persistence, lifecycle clearing, and zero cross-document transfer | `CRD-001` through `CRD-012`; `SCN-BUG001-001`, `SCN-BUG001-002`, `SCN-BUG001-003`, `SCN-BUG001-005`, `SCN-BUG001-006`, `SCN-BUG001-008` | Superseded by BUG-002's current two-tier provider-access contract. |
| Disabled production providers, authorization gating, header-only transport, and no proxy/query/fallback behavior | `CRD-018` through `CRD-024`; `SCN-BUG001-007`, `SCN-BUG001-009`, `SCN-BUG001-010` | Superseded by BUG-002 and not executable under BUG-001. |
| Broad compatibility, prior-test invalidation, scanner disposition, framework routing, and dirty-tree delivery constraints | `CRD-025` through `CRD-029`; `SCN-BUG001-011` | Historical planning context only; not part of retained SCOPE-01 behavior. Current `rlData` preservation is carried narrowly by active `CRD-017` and BUG-002 FR-9. |
| Legacy detection and erasure | Former `CRD-013` through `CRD-017`; `SCN-BUG001-004` | Retained only in the narrowed active wording above for exact pre-BUG-002 containers while preserving current BUG-002 configuration. |
| Former BUG-001 Outcome Contract, domain model, use cases, acceptance matrix, UI matrix, exclusions, and residual trust boundary | Pre-reconciliation active sections | Superseded by the active contract above. Historical Git and report evidence remain unchanged and must not be interpreted as current requirements. |
