# Bug Specification: BUG-001 Central Provider Credential Security

Links: [bug.md](bug.md) | [design.md](design.md) | [scopes.md](scopes.md) | [report.md](report.md) | [uservalidation.md](uservalidation.md)

## Problem Statement

Research Lab is a static multi-page application whose current credential path persists third-party provider credentials in `sessionStorage`, reads raw legacy values from durable client storage, and relies on that persistence to carry configured state across reloads and HTML-page navigation. The binding No Sensitive Client Storage rule prohibits that contract. Replacing durable storage with shorter-lived client storage or consented migration would retain the same category of security failure.

The safe product outcome is deliberately less convenient: a credential may exist only in application-reachable process memory scoped to the current loaded document. A separate tool document cannot consume a credential entered on the index page. Unless one eligible document owns both credential input and an approved provider request, browser credential use is disabled.

## Outcome Contract

**Intent:** Eliminate client-persisted and cross-document provider credentials while preserving a narrowly bounded, memory-only capability for a future document that is explicitly authorized to collect and consume a credential itself.

**Success Signal:** Reload, same-tab navigation to another HTML page, same-document route navigation, close, crash followed by reopen, new tab, new window, new browser context, and explicit clear all each leave the affected document unconfigured. Known legacy locations can be detected by provider/location metadata and erased without any value being read into active credential memory. A sentinel credential is absent from every client-storage, bridge, rendered, diagnostic, URL, referrer, and test-artifact surface.

**Hard Constraints:** Current-loaded-document process memory only; no persistence or cross-document transport; no migration, copy, staging, value readback, or activation of legacy credentials; one closed provider registry; verified browser-origin authorization plus an approved non-URL transport before enablement; approved header-only authentication with no query or transport fallback; no tool-local editor, getter, or writer; complete and verified clear-all behavior; unchanged non-secret `rlData` cache behavior; one-to-one G028 disposition; no downstream framework edits; and no loss of concurrent dirty-tree work. Missing policy or eligibility information disables the provider rather than selecting a default.

**Failure Condition:** The remediation fails if any credential is serialized, survives a document boundary, crosses through any browser bridge, is read from a legacy container into active credential memory, appears in output, reaches an unknown or unverified provider path, falls back to URL authentication, or if incomplete erasure is reported as success. It also fails if the static multi-page product claims reload or navigation convenience that memory-only handling cannot provide.

## Evidence Basis

| Evidence | Business conclusion |
| --- | --- |
| `bug.md` active reproduction and Feature 004 classification | The active `sessionStorage` envelope and raw legacy collection are genuine High findings; non-secret cache behavior and dirty-tree collision constraints remain protected. |
| `design.md` active Target State and Static Multi-Page UX Contract | Separate HTML documents cannot share private credential memory truthfully; current providers do not satisfy all enablement gates. |
| `.github/agents/bubbles_shared/critical-requirements.md` rule 18 | `localStorage`, `sessionStorage`, IndexedDB, AsyncStorage, SharedPreferences, and similar client storage are prohibited for sensitive trust material. |
| `report.md` historical execution evidence | Prior passing evidence proves the superseded session-continuity and migration contract only; it cannot certify this memory-only contract. |
| Current `scopes.md`, `scenario-manifest.json`, `test-plan.json`, and `uservalidation.md` | Active planning now matches the current-document memory-only and erase-only requirements across five sequential not-started scopes. SCOPE-01 is eligible for implementation dispatch, but no active delivery evidence exists. |

## Actors & Personas

| Actor | Goals | Permission boundary |
| --- | --- | --- |
| Credential owner | Use an eligible provider for one current document and clear all reachable credential material | May enter a credential only in an eligible document's shared control; cannot opt into persistence or cross-document transfer |
| Research tool user | Use public/no-key data paths and understand why browser-key functionality is disabled | Receives non-secret status and sanitized results only; never receives a raw credential or request header |
| Legacy-storage user | Discover and erase credential-bearing legacy containers without reactivating their contents | May dismiss or authorize destructive erase; cannot migrate, copy, inspect, or selectively preserve credential-bearing values |
| Provider policy owner | Decide whether an exact provider operation may run from an exact browser document | May enable only with verified browser-origin authorization, non-URL transport, exact origin/operation, and document eligibility evidence |
| Security reviewer | Verify lifetime, non-disclosure, closed-provider behavior, erasure, G028 disposition, and residual trust boundaries | Cannot waive the sensitive-client-storage rule or accept scanner evasion as remediation |
| Delivery planner and test owner | Translate stable business scenarios into executable contracts | Must invalidate old continuity/migration tests and preserve historical evidence without treating it as current proof |
| Canonical Bubbles framework owner | Resolve genuine scanner precision issues for non-secret cache and erase-only behavior | May change semantics only in the canonical framework; no downstream Research Lab framework edit is permitted |

## Domain Capability Model

### Capability

**Provider Credential Runtime Safety** is the shared domain capability governing temporary credential possession, provider eligibility, legacy cleanup, and authorized request use across the index and every registered Research Lab document. It is provider-neutral and page-neutral; concrete providers and pages cannot create their own credential lifecycle.

### Domain Primitives

| Primitive | Purpose | Lifecycle |
| --- | --- | --- |
| `CredentialRuntime` | Represents application-reachable credential state for exactly one loaded document | `unconfigured -> configured -> cleared`; any reload, route/navigation boundary, close, crash/reopen, context creation, or explicit clear yields `unconfigured` with no restore path |
| `ProviderPolicy` | Closed record deciding whether one provider operation may use a browser credential in one document | `unverified/disabled -> verified/eligible`; missing or invalid evidence stays `disabled`; evidence or contract invalidation returns it to `disabled` |
| `LegacyPresence` | Redacted observation that known credential-bearing containers exist | `unknown -> absent or detected`; `detected -> erase-requested or dismissed`; it never transitions into `CredentialRuntime` |
| `ErasureResult` | Outcome of removing known legacy containers without reading their values | `not-attempted -> complete, incomplete, or unavailable`; only `complete` permits an erasure-success claim |
| `RequestAuthorization` | Decision binding one configured runtime to one provider, operation, origin, transport, and document | `denied -> authorized -> consumed`; any mismatch remains `denied`, and an auth/request failure does not authorize a fallback attempt |

### Relationships

- A `CredentialRuntime` may become configured only when the current document and requested operation satisfy one explicit `ProviderPolicy`.
- `RequestAuthorization` consumes a credential internally from the same document's `CredentialRuntime`; it never returns the credential, headers, or a transferable credential object to a caller.
- `LegacyPresence` is derived from known provider/location metadata and container names only. It has no value path into `CredentialRuntime`.
- Clear all first clears the invoking document's `CredentialRuntime`, then produces an `ErasureResult` for every known durable legacy location.
- The index document may own non-secret provider status and legacy cleanup, but it cannot configure a separate tool document. A tool may use the shared capability only when that same loaded document owns both shared input and authorized request execution.

### Business Policies

- No credential primitive has a serialized form, persistence schema, default value, fallback source, or cross-document transfer representation.
- No URL, `postMessage`, BroadcastChannel, ServiceWorker, SharedWorker, cookie, opener, `window.name`, storage event, browser storage, or equivalent bridge may connect credential runtimes.
- Legacy cleanup is erase-only. Reading, parsing, copying, staging, hashing, migrating, selectively rewriting, or activating a legacy credential value is prohibited.
- Provider enablement is a closed conjunction, not a best-effort score. Missing browser-origin authorization, non-URL transport, exact origin/operation, same-document ownership, or required document security posture means disabled.
- Every concrete provider and every registered document must obey the same output, erasure, unknown-provider, clear, dirty-tree, and governance policies.

## Use Cases

### UC-001: Use a tool without browser credentials

- **Actor:** Research tool user
- **Preconditions:** A registered tool is opened with no eligible configured provider.
- **Main Flow:** The tool loads its existing public/no-key behavior, shows a non-secret disabled or unconfigured provider status, and sends no credential-backed request.
- **Alternative Flows:** If a public data source is unavailable, the tool reports that existing failure without requesting or inventing a credential fallback.
- **Postconditions:** No credential state or persistence is created.

### UC-002: Use an eligible provider within one document

- **Actor:** Credential owner
- **Preconditions:** One document and operation satisfy every field of a verified `ProviderPolicy` and expose the shared credential control. No current production provider meets this precondition.
- **Main Flow:** The user enters a credential, the input is blanked, the current document reports configured status, and an approved request consumes the credential internally without leaving the document.
- **Alternative Flows:** Any missing eligibility field, document mismatch, unknown provider, invalid credential, or transport failure returns a safe disabled/error status and sends no fallback request.
- **Postconditions:** The credential remains reachable only in the current document until clear or any lifecycle boundary.

### UC-003: Detect and erase legacy credential containers

- **Actor:** Legacy-storage user
- **Preconditions:** One or more known legacy container names are present.
- **Main Flow:** The product reports provider/location classes and counts only, explains that whole-container erase may remove non-secret preferences, obtains destructive-erase confirmation, removes known containers, and verifies name absence.
- **Alternative Flows:** Dismissal leaves the containers untouched and inactive. Incomplete or unavailable erase returns a leak-free failure with remaining location classes/counts only.
- **Postconditions:** No legacy value has entered active credential memory; only complete verification produces success.

### UC-004: Clear current and legacy credential material

- **Actor:** Credential owner
- **Preconditions:** The invoking document may hold a credential and known legacy containers may exist.
- **Main Flow:** Clear all immediately clears current-document references, blanks shared inputs and status, erases every known legacy container, and verifies erasure.
- **Alternative Flows:** If durable cleanup is incomplete, current memory remains empty and the product reports explicit incomplete cleanup without restoring any value.
- **Postconditions:** The invoking document is unconfigured; success is reported only when every known legacy location is absent.

### UC-005: Approve or reject a provider policy

- **Actor:** Provider policy owner and security reviewer
- **Preconditions:** Official evidence and an exact provider/document/operation proposal are available.
- **Main Flow:** Reviewers verify browser-origin authorization, non-URL header transport, exact origin and operation, same-document input/request ownership, and document security eligibility.
- **Alternative Flows:** Missing, ambiguous, expired, or contradictory evidence keeps the provider disabled. There is no default or temporary fallback approval.
- **Postconditions:** The closed registry records an explicit eligible or disabled state through owned design/security review.

## Requirements

### Central Ownership

- **CRD-001:** One shared credential capability is the sole owner of credential input, current-document status, clearing, legacy cleanup, and provider request authorization. Registered pages must not define a tool-local editor, getter, setter, writer, migration helper, request-header exporter, or credential store.
- **CRD-002:** `index.html#data-settings` may expose non-secret provider status and legacy cleanup. It must not promise that a credential entered on the index can configure a separate tool document. While the index owns no approved same-document provider operation, it is not an active credential-entry path.
- **CRD-003:** A registered tool may expose the shared credential control only when that same loaded document owns both the input action and the approved request execution. Otherwise browser-key functionality is disabled; a bespoke tool-local control is never permitted.
- **CRD-004:** The provider registry is closed. Unknown, empty, inherited, prototype-shaped, or malformed provider, operation, origin, or document identifiers fail explicitly before state change or request execution.

### Current-Document Lifetime

- **CRD-005:** A credential may exist only in application-reachable process memory scoped to the current loaded document. It has no serialized envelope, persistence schema, public raw-value getter, or bulk representation.
- **CRD-006:** Reload, same-tab navigation to another HTML page, hash or history route navigation, bfcache traversal, close, crash followed by reopen, new tab, new window, iframe document, new browser context, and explicit clear all each result in unconfigured state for the affected document.
- **CRD-007:** No credential may cross a document boundary through a URL, query, fragment, form submission, `postMessage`, BroadcastChannel, ServiceWorker, SharedWorker, cookie, opener, `window.name`, history state, DOM handoff, storage event, file, or equivalent bridge.
- **CRD-008:** No credential may be written to `localStorage`, `sessionStorage`, IndexedDB, Cache Storage, AsyncStorage, SharedPreferences, cookies, non-secret cache objects, committed files, or any similar browser/client storage. Shorter lifetime, encryption, encoding, or user consent does not create an exception.
- **CRD-009:** Missing memory capability, policy evidence, document eligibility, or transport configuration fails explicitly. There is no persistence fallback, query fallback, default provider, default operation, or default authorization.

### Shared Credential UX

- **CRD-010:** An eligible shared credential input mounts blank, has no value-bearing attribute or submission name, is blanked immediately after configuration, and renders only provider ID, configured/disabled state, and a closed safe reason code.
- **CRD-011:** A blank input is a no-op. It cannot clear, replace, or synthesize a configured credential.
- **CRD-012:** Clear all first removes every credential reference held by the invoking document, blanks shared inputs, resets status, then erases and verifies all known durable legacy locations. Incomplete cleanup is an explicit failure, not partial success.

### Legacy Presence And Erase-Only Cleanup

- **CRD-013:** Legacy detection may observe known container names and report provider IDs, location classes, and counts derived from the closed location registry only. It must never read, parse, hash, compare, return, render, log, transmit, or retain a legacy credential value.
- **CRD-014:** Legacy credentials are erase-only material. No migrate, copy, stage, value readback, selective rewrite, activation, or consent-to-migrate action exists.
- **CRD-015:** Cleanup removes whole known credential-bearing containers without parsing them. If that also removes non-secret preferences, the destructive effect is disclosed before erase; preserving nested fields is not a reason to read the container.
- **CRD-016:** Dismissing legacy cleanup leaves known containers untouched and inactive. Destructive-erase confirmation authorizes deletion only, never value access or activation.
- **CRD-017:** Erasure verification uses container-name absence and platform deletion outcomes only. If any known location remains, current credential memory stays empty and the failure reports only redacted provider/location classes and counts.

### Output And Transport Safety

- **CRD-018:** Credential values never appear in rendered HTML, text, attributes, input remounts, accessibility labels, events, clipboard data, console messages, thrown errors, analytics, telemetry, screenshots, traces, snapshots, assertion output, test artifacts, request URLs, document URLs, history, resource entries, provider response diagnostics, or referrers.
- **CRD-019:** Status, comparison, cleanup, and diagnostics use only provider IDs, booleans/states, location classes, counts, and closed redacted reason codes. They expose no credential-derived length, hash, prefix, suffix, equality signal, raw header, response body, URL, stack, or serialized cause.
- **CRD-020:** Provider enablement requires verified official authorization for the intended browser origin, an approved non-URL transport, exact origin and operation constraints, same-document input and request ownership, and the required document security posture. Every field is mandatory and fail-closed.
- **CRD-021:** An eligible request places a credential only in the explicitly approved header for the exact provider origin and operation, uses no-referrer behavior, and performs no credential-bearing redirect, proxy, query, or alternate transport.
- **CRD-022:** Authentication or request failure returns one sanitized result. It does not retry with query authentication, another provider, another origin, a proxy, cached credentials, or any fallback path.
- **CRD-023:** Twelve Data browser credential use remains disabled. It may be enabled only if its verified browser-origin and non-URL transport contract changes through provider-policy, design, and security ownership review. No implementation or test may infer approval from a generic API document.
- **CRD-024:** Finnhub, Alpha Vantage, FRED, and every other current registry entry also remain disabled for browser credentials until each independently satisfies CRD-020. Transport documentation alone is insufficient authorization evidence.

### Compatibility And Governance

- **CRD-025:** Non-secret `localStorage.rlData` market-data caching, cache-first rendering, public/no-key provider paths, and existing tool analytics remain operational. They must not be removed or relabeled to silence credential findings.
- **CRD-026:** Tests and acceptance records that assert `sessionStorage`, reload/navigation continuity, index-to-tool continuity, or consented value migration are invalid for the active contract. Historical evidence remains unchanged as history, but only new scenario-faithful evidence may support current acceptance.
- **CRD-027:** G028-01 through G028-09 and the central-store blind spot receive one-to-one dispositions. Genuine credential paths are removed; non-secret cache and erase-only semantic false positives are routed to the canonical framework owner without deleting valid behavior or obscuring identifiers.
- **CRD-028:** No Research Lab downstream framework file is edited for this bug. Any matcher or governance change is made in the canonical Bubbles repository and consumed only through the supported upgrade path.
- **CRD-029:** Delivery preserves all pre-existing dirty product, test, spec, evidence, generated-data, and collision-constrained work. No stash, reset, clean, checkout overwrite, staging, wholesale rewrite, broad formatting, or unrelated modification is permitted.

## User Scenarios

### SCN-BUG001-001: One shared capability owns every credential surface

```gherkin
Scenario: Credential behavior is confined to the shared current-document capability
  Given every registered Research Lab page is available
  When the index and every tool source and live page are inspected
  Then no page defines a tool-local credential editor getter setter writer migration helper or credential store
  And index.html exposes only non-secret provider status and legacy cleanup while it owns no approved same-document provider request
  And any future credential input uses the shared capability in the same document that executes the approved request
```

### SCN-BUG001-002: Every document boundary clears configured state

```gherkin
Scenario: A credential never survives or crosses a document lifecycle boundary
  Given a controlled eligible provider is configured in the current loaded document
  When the user reloads navigates to another HTML page changes route returns through bfcache closes or reopens the page or opens a new tab window or browser context
  Then every resulting document is unconfigured
  And no credential is transferred through a browser bridge
```

### SCN-BUG001-003: Same-document use reveals status, never the value

```gherkin
Scenario: An eligible document consumes a credential without exposing it
  Given a provider policy authorizes one operation in the current document
  When the user enters a sentinel credential and invokes that operation without leaving the document
  Then the field is immediately blank
  And only configured status and a sanitized operation result are visible
  And no caller receives the credential or request headers
```

### SCN-BUG001-004: Legacy material is detected without value access and erased only

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

### SCN-BUG001-005: Unknown providers fail without mutation

```gherkin
Scenario: Unknown and prototype-shaped provider identifiers are rejected
  Given the current-document runtime has a known baseline state
  When a caller supplies an unknown empty inherited constructor or __proto__ provider identifier
  Then the call fails with a safe unknown-provider reason
  And no runtime policy object storage surface or prototype is mutated
```

### SCN-BUG001-006: Clear-all is complete

```gherkin
Scenario: Clear-all removes active and legacy credential material
  Given the current document holds an eligible credential and known legacy containers exist
  When the user selects Clear all
  Then current-document credential references are removed first
  And all shared fields are blank and statuses are unconfigured
  And every known durable legacy location is erased and verified without value readback
  And incomplete erasure returns an explicit leak-free failure without restoring memory state
```

### SCN-BUG001-007: A sentinel credential leaves no rendered or diagnostic trace

```gherkin
Scenario: Credential values do not enter output or navigation surfaces
  Given a unique sentinel credential is configured in an eligible current document
  When rendering request failures clear lifecycle boundaries and disclosure scans are exercised
  Then the sentinel is absent from markup text attributes inputs accessibility output events logs errors analytics URLs referrers browser storage bridges and test artifacts
```

### SCN-BUG001-008: A static page transition cannot carry an index credential

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

### SCN-BUG001-009: Twelve Data stays disabled without authorization evidence

```gherkin
Scenario: Twelve Data browser-key use fails closed while authorization is unverified
  Given no verified Twelve Data browser-origin and non-URL transport contract exists
  When a tool requests a Twelve Data credential-backed fetch
  Then no Twelve Data request is sent
  And the user receives a safe provider-disabled status with no key material
```

### SCN-BUG001-010: Header auth never becomes query auth

```gherkin
Scenario: Header-capable provider credentials never enter URLs
  Given a controlled provider policy verifies browser-origin use exact operation exact origin same-document ownership and header authentication
  When the authorized request is constructed and sent from that document
  Then the credential is present only in the approved auth header
  And the URL redirects logs diagnostics and referrer contain no credential
  And no query proxy origin provider or transport fallback occurs after failure
```

### SCN-BUG001-011: Genuine findings close without deleting non-secret cache behavior

```gherkin
Scenario: The nine G028 findings receive truthful one-to-one closure
  Given the baseline G028-01 through G028-09 ledger the central-store blind spot the non-secret rlData cache contract and the protected dirty tree
  When memory-only remediation and scanner disposition are assessed
  Then every finding has exactly one addressed or owner-routed disposition
  And no client-persisted credential path remains
  And non-secret rlData behavior and concurrent dirty work remain intact
  And no downstream framework file or identifier-obfuscation workaround is used
```

## Acceptance Criteria

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

## Planning Status And Evidence Boundary

The prior executable-contract invalidation has been reconciled. Scenario IDs `SCN-BUG001-001` through `SCN-BUG001-011` remain stable, and the active planning surfaces now encode their current-document memory-only and erase-only meanings. This reconciliation is a nonterminal planning result, not delivery or certification evidence.

| Active surface | Current nonterminal evidence |
| --- | --- |
| `scopes.md` | Five sequential scopes are active and all are Not Started. SCOPE-01 is the dependency-free foundation and is eligible for implementation dispatch. |
| `scenario-manifest.json` | All eleven stable scenario IDs map to the five active scopes with current semantics and no execution evidence references. |
| `test-plan.json` | The same five scopes are `not_started`; implementation dispatch is allowed, while the evidence boundary explicitly rejects pass claims before current execution. |
| `uservalidation.md` | The checklist records acceptance questions only and explicitly does not assert that implementation satisfies them. |
| `state.json` | `certification.scopeProgress` mirrors the same five `not_started` scopes; `completedScopes` is empty and `certifiedAt` is null. |

Delivery has not started under the active contract. Historical passing evidence remains a truthful record of the superseded session-continuity and migration behavior, but it cannot satisfy an active scenario, DoD item, acceptance claim, or certification decision. SCOPE-01 may begin only under the reconciled current-document memory-only, erase-only, and protected-dirty-tree contract.

## UI Scenario Matrix

| Scenario | Actor | Entry point | Visible outcome |
| --- | --- | --- | --- |
| SCN-BUG001-001, SCN-BUG001-008 | Research tool user | Index or any registered tool | Non-secret provider status; no continuity promise; current browser-key providers disabled |
| SCN-BUG001-003, SCN-BUG001-010 | Credential owner | Future eligible consuming document only | Shared blank input, configured state for that document, sanitized request result, no raw value |
| SCN-BUG001-004 | Legacy-storage user | Index legacy-cleanup surface | Redacted classes/counts, destructive-erase warning, dismiss or erase-only result |
| SCN-BUG001-006 | Credential owner | Shared clear-all action | Immediate unconfigured state and complete/incomplete legacy-erasure result |
| SCN-BUG001-009 | Research tool user | Twelve Data-dependent action | Safe provider-disabled status and no credential request |

## Exclusions

- Convenience continuity across reload, route change, same-tab navigation to another HTML page, close/reopen, crash/reopen, or any other document boundary. A static multi-page app cannot offer that convenience under this trust contract.
- Moving market analytics or non-secret market-data caches to a backend.
- Introducing a general user account, server-side vault, or synchronization service.
- Enabling a provider whose browser authorization and transport have not been verified.
- Preserving non-secret preferences nested inside a known credential-bearing legacy container when doing so would require reading or parsing that container.
- Adding any storage, message, URL, worker, opener, cookie, or other bridge to imitate continuity.
- Editing downstream framework files, weakening G028, adding an exception, or introducing a default/fallback authorization path.
- Reworking unrelated tool analytics, visual design, universes, or generated market snapshots.

## Residual Trust Boundary

Memory-only handling does not make a credential safe from malicious JavaScript already executing in the same loaded document. A credential-capable document therefore still requires the approved document security posture, script provenance, CSP, dependency integrity, and XSS prevention. Those controls are provider-eligibility gates and defense in depth; they do not permit storage or transfer.

Research Lab can remove its reachable references but cannot guarantee deterministic heap zeroization or control browser/OS crash dumps. Because no credential is persisted, restored, or bridged, a reload or reopen after a crash still begins unconfigured. The product must not claim a stronger physical-memory guarantee.

Clear all clears only the invoking document's memory because no cross-document communication channel exists. It also erases all known origin-wide durable legacy locations. Another already-open document, if independently configured under a future eligible policy, is outside the invoking document's reach and must clear itself on its own lifecycle or explicit action. This limitation is preferable to creating a credential bridge.

The active static multi-page product cannot offer credential convenience across reload or navigation. The index cannot configure a separate tool page, and current provider-backed browser requests remain disabled. There is no default, fallback, hidden persistence, or alternate transport that restores that convenience.

## Superseded Requirements

> Historical and non-active. The former promises of same-tab `sessionStorage`, reload/navigation continuity, index-to-tool credential availability, consented value migration, session write/readback verification, and a G028 exception are prohibited by the active contract above. Prior report evidence for those behaviors remains historical execution evidence only and must not guide implementation, acceptance, or certification.
