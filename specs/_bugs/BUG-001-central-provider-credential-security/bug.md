# Bug: BUG-001 Central Provider Credential Security

Links: [spec.md](spec.md) | [design.md](design.md) | [scopes.md](scopes.md) | [report.md](report.md) | [uservalidation.md](uservalidation.md)

## Summary

Research Lab currently retains third-party provider credentials in a same-tab `sessionStorage` envelope and reads raw legacy credential values from durable browser storage. Feature 004's executed security review classifies both paths as genuine High exposure under the binding No Sensitive Client Storage policy. The safe contract is now memory-only for the current page execution: reload or navigation clears active credentials, legacy discovery is redacted erase-only, browser-disabled providers remain disabled, and no raw secret may enter any client persistence or disclosure surface.

## Severity

- [ ] Critical - System unusable or destructive compromise is demonstrated
- [x] High - Provider credentials can persist and leak through multiple browser and request surfaces
- [ ] Medium - Feature broken with a bounded workaround
- [ ] Low - Minor issue

## Status

- [ ] Reported
- [ ] Confirmed by an executed pre-fix regression
- [x] In Progress
- [ ] Fixed
- [ ] Verified
- [ ] Closed

No fix or test execution is claimed by this packet. Active spec, design, planning, scenario, test-plan, user-validation, and certification inventory reconciliation is complete, so SCOPE-01 may dispatch to `bubbles.implement` under the active route below. Current production still exhibits the reproduced `sessionStorage` and raw legacy-value paths, so the bug remains In Progress; this routing reconciliation is not a Fixed, Verified, or Closed claim.

## Discovery Source

- Discoverer: `bubbles.security`
- Mechanical gate: G028 `implementation_reality_scan_gate`
- Baseline revision: `9d4020b4bd80516c49a3005f42edacedc169c3e9`
- Baseline captured: `2026-07-13T04:19:44Z`
- Provenance: the prior security transcript was not available in the local session index. The nine scanner rows below were re-derived from the installed G028 matcher and the baseline source. They are recorded as interpreted source evidence, not represented as a newly executed scanner run.
- Reopen trigger: `specs/004-fx-regime-relative-value-lab/report.md#security-review-evidence---f004-reality-001`
- Reopen classification: executed Feature 004 security evidence identifies the raw legacy collection path and active `sessionStorage` envelope as genuine High findings; cache-comment and verified erase/readback rows are mechanical false positives.
- Collision constraint: `F004-COLLISION-001` remains open exactly as recorded by Feature 004. This reconciliation does not edit its test, `scripts/selftest.mjs`, `rldata.js`, or Feature 004 artifacts.

## Active Reproduction Steps

1. Open `index.html#data-settings`, save a sentinel credential for an approved browser provider, and inspect browser storage.
2. Observe that `rldata.js` writes the raw value into `sessionStorage.rlSessionProviderCredentialsV1` through `setKey()` and `writeCredentialEnvelope()`.
3. Reload or navigate in the same tab and observe that the envelope restores the credential, demonstrating persistence beyond the current page execution.
4. Seed `localStorage.rlApiKeys` or a known credential-bearing legacy object, invoke legacy detection, and trace `collectLegacyCredentials()` into `_legacyDetection.credentials`.
5. Observe that migration can pass those raw values to `writeCredentialEnvelope()` instead of treating the legacy material as erase-only.
6. Separately inspect the non-secret `localStorage.rlData` cache comment and the `removeItem()` plus absence-readback scrub line. They do not carry credential values and are scanner false positives, not remediation targets.
7. Run the future design/plan-owned regression matrix against the memory-only contract. It must reject all credential persistence, prove reload/navigation clearing, prove redacted erase-only legacy handling, keep browser-disabled providers disabled, and scan DOM/log/error/URL/referrer surfaces for the sentinel.

## Historical Reproduction Steps (Superseded Contract)

The following steps are preserved verbatim as the original 2026-07-13 packet record. They no longer define the active success contract because steps expecting migration into a same-tab store conflict with binding policy.

1. Open `index.html#data-settings` in a clean browser tab.
2. Enter a sentinel provider credential and save it.
3. Inspect `localStorage.rlApiKeys`, reload the page, and inspect the credential input value.
4. Seed one of the known legacy keys or credential-bearing tool-state objects, then reload the landing page without approving migration.
5. Open a registered tool page and inspect its inline `rlKeys` / `rlSetKey` helpers and provider request construction.
6. Attempt to store a credential under an unknown provider identifier.
7. Trigger a provider request and inspect the request URL, browser console, rendered DOM, and referrer-bearing navigation for the sentinel value.
8. Run the planned pre-fix regression tests. They must fail on the durable store, silent migration, rendered secret, arbitrary provider, duplicate writer, query transport, and tab-isolation assertions before implementation begins.

## Active Expected Behavior

- Provider credential values exist only in JavaScript memory for the current page execution.
- No provider credential value is written to `localStorage`, `sessionStorage`, IndexedDB, Cache Storage, cookies, URL state, committed files, or any equivalent browser/client persistence surface.
- Same-tab reload and navigation clear every active provider credential. Continuity across reload or navigation is explicitly forbidden.
- Legacy discovery may expose only redacted provider IDs, location classes, and counts. Raw legacy values are erase-only material and are never copied, activated, returned, rendered, logged, transmitted, or migrated into another client store.
- Erase and clear operations remove known durable legacy copies and verify absence without activating their values.
- Browser-disabled providers remain disabled. No request is sent for a disabled provider, and no fallback transport is attempted.
- A provider that is explicitly authorized for browser use may consume a credential only from current-page memory and only through its approved origin/header contract.
- Unknown and prototype-shaped provider identifiers fail explicitly without mutation.
- No raw credential appears in the DOM, status text, input remount, console, error, analytics, request URL, document URL, referrer, or test artifact.
- Non-secret `localStorage.rlData` market/cache behavior remains intact.

## Historical Expected Behavior (Explicitly Superseded 2026-07-15)

The following original contract is retained for traceability. Its requirements for `sessionStorage` continuity and value migration are invalid under the binding No Sensitive Client Storage policy and must not guide new implementation or test work.

- Provider credentials are edited only at `index.html#data-settings`.
- Credential values exist only in same-tab `sessionStorage`; they survive same-tab reload/navigation and are absent from an independently opened tab.
- No credential value is written to `localStorage`, IndexedDB, caches, committed files, rendered markup, logs, errors, URLs, or referrers.
- Legacy credentials are only detected until the user explicitly consents. A successful migration writes the same-tab store, verifies it, and erases every known durable copy.
- Stored fields are blank after save and after remount. The UI exposes only configured/not-configured status.
- Unknown and prototype-shaped provider identifiers fail explicitly without mutation.
- Clear-all erases the active same-tab credentials and all known durable legacy credential copies.
- Tool pages consume the central read API only and expose no editor, setter, or credential storage helper.
- Twelve Data browser credential use is disabled until provider authorization is verified and recorded.
- Header-capable providers use header authentication. Credential-bearing URL query transport is forbidden; query-only browser adapters remain disabled unless explicitly verified through the security/design contract.

## Current Actual Behavior

- `rldata.js` writes raw provider credentials to the versioned `sessionStorage.rlSessionProviderCredentialsV1` envelope and reads them back for provider authentication.
- Same-tab reload/navigation continuity is implemented and tested, but that continuity is now itself a High policy violation.
- `collectLegacyCredentials()` reads raw values from `localStorage.rlApiKeys`, scalar keys, and known tool-state objects; `detectLegacyCredentials()` stages those values in `_legacyDetection.credentials`; migration can activate them in the prohibited envelope.
- The non-secret `localStorage.rlData` cache comment and verified legacy `removeItem()` plus readback operation are mechanical scanner false positives and must be preserved.
- Existing BUG-001 product tests still encode the superseded session-continuity and legacy-migration behavior. Active spec, design, plan, scenario, machine test-plan, user-validation, and certification inventory surfaces now encode five sequential memory-only/erase-only scopes, all Not Started. Prior execution evidence remains historical evidence, not proof of the new safe contract.

## Historical Actual Behavior (Original Baseline)

- `rldata.js` owns `localStorage.rlApiKeys` and exposes permissive reads/writes through indirection.
- `rlapp.js` has a second direct `localStorage.rlApiKeys` implementation and pre-populates password input values.
- `rlapp.js` calls migration during every boot, without a consent action.
- Known tool pages carry duplicate `rlKeys` / `rlSetKey` implementations and direct provider URL builders.
- Twelve Data, Finnhub, Alpha Vantage, and FRED request builders place credentials in URL query parameters at baseline. Provider authorization for browser-held keys was not verified in this bug phase.
- The current selftest asserts that silent migration and durable central storage are correct, preserving the defect as expected behavior.

## Historical G028 Scanner Finding Ledger

This ledger is preserved as the original baseline classification. Its migration dispositions are superseded by the current Feature 004 security decision below; the row evidence itself is not rewritten.

Line numbers identify the baseline revision and must be refreshed after implementation.

| ID | Location | Scanner trigger | Classification | Disposition |
| --- | --- | --- | --- | --- |
| G028-01 | `rldata.js:50` | `session` and `localStorage` occur in a comment describing the non-secret market-data cache | False positive | Preserve the `rlData` cache; route scanner semantic refinement upstream |
| G028-02 | `rldata.js:75` | `localStorage` cache retry and the word `session` occur on the same line | False positive | Preserve cache behavior; route scanner semantic refinement upstream |
| G028-03 | `rldata.js:96` | Legacy `etfMomLab` credential fields are read from durable storage and silently seeded | Genuine | Require consent, migrate transactionally, then scrub |
| G028-04 | `rldata.js:98` | Legacy `sectorLab.apiKey` is read from durable storage and silently seeded | Genuine | Require consent, migrate transactionally, then scrub |
| G028-05 | `rldata.js:102` | A sanitized `etfMomLab` object is rewritten after credential properties are deleted | False positive row with genuine upstream context | Keep verified scrub behavior; scanner must recognize delete-before-write sanitation |
| G028-06 | `rldata.js:106` | A sanitized `sectorLab` object is rewritten after `apiKey` deletion | False positive row with genuine upstream context | Keep verified scrub behavior; scanner must recognize delete-before-write sanitation |
| G028-07 | `rldata.js:111` | A sanitized validation object is rewritten after `apiKey` deletion | False positive row with genuine upstream context | Keep verified scrub behavior; scanner must recognize delete-before-write sanitation |
| G028-08 | `rlapp.js:36` | Direct durable read of `localStorage.rlApiKeys` | Genuine | Remove fallback storage ownership; use central status/read API only |
| G028-09 | `rlapp.js:44` | Direct durable write of `localStorage.rlApiKeys` | Genuine | Remove fallback storage ownership; index UI writes through the central same-tab API |

## Current Feature 004 Security Classification

**Claim Source:** interpreted  
**Interpretation:** Feature 004 records a current-session executed implementation-reality scan and security call-graph classification. This bug phase consumes that evidence and does not represent the scan as newly executed here.

| Finding | Classification | Current disposition |
| --- | --- | --- |
| F004-REALITY-001-LEGACY | Genuine - High - OWASP A02/A07 | `collectLegacyCredentials()` reads and stages raw durable values. Replace discovery with redacted metadata plus erase-only deletion; never migrate or activate values. |
| F004-REALITY-001-SESSION | Genuine - High - OWASP A02/A07 | The active `sessionStorage` envelope persists and supplies provider authentication material. Replace it with current-page memory only; reload/navigation must clear credentials. |
| F004-SCAN-FP-CACHE | Mechanical false positive | Preserve the non-secret `localStorage.rlData` cache and its in-memory mirror comment. Route scanner precision separately; do not delete valid cache behavior. |
| F004-SCAN-FP-SCRUB | Mechanical duplicate false positive | Preserve verified `removeItem()` plus absence-readback cleanup. The same physical line is emitted twice and is not credential persistence. |
| F004-COLLISION-001 | Open protected collision | Preserve the exact `scripts/selftest.mjs` hunk-identity failure and all current dirty work. This bug phase does not repair or rewrite it. |
| BUG001-CONTRACT-SESSION-STORAGE | Planning contract reconciled; delivery open | Active spec, design, plan, scenario, machine test-plan, user-validation, and certification inventory surfaces now prohibit same-tab continuity and value migration. SCOPE-01 may dispatch, but current product code and tests still require scenario-first RED and implementation. |

### Scanner Blind Spot

G028 does not directly report `rldata.js` central credential reads/writes that use the `KEY_STORE` variable instead of a literal credential-shaped key. Those paths are genuine findings even though they are outside the nine emitted rows. Closing only the literal scanner rows would leave the durable store intact and would not fix the bug.

### Superseded Upstream Policy Dependency

This prior dependency text is retained as history. Feature 004 resolved the policy question against the product exception: the blanket prohibition applies, so the product contract must change rather than seeking scanner approval for the shared envelope.

The installed G028 policy also treats any `sessionStorage` API-key storage as blocking. That conflicts with the required same-tab product contract. Renaming variables, splitting lines, or wrapping calls to evade the regex is forbidden. Before certification, the Bubbles source owner must reconcile this case without weakening protection for auth tokens, session secrets, payment data, or durable provider credentials. The product implementation remains subject to that upstream disposition.

## Current Root Cause

The prior remediation treated browser lifetime reduction as a sufficient security boundary and encoded provider credentials as a versioned `sessionStorage` data model. That was a category error: third-party provider API keys are sensitive trust material under the binding No Sensitive Client Storage policy, and `sessionStorage` remains client persistence readable by same-origin code. The same continuity goal also shaped legacy handling, so raw durable values were collected and staged for migration instead of being treated as redacted erase-only material. Tests and planning then promoted reload continuity and migration into success criteria, creating a direct conflict between packet truth and binding policy.

## Prior Root Cause (Historical)

The credential lifecycle was attached to the general `RLDATA` durable market-data cache and then duplicated in `RLAPP` and individual tools. This erased the intended ownership boundary. An unconditional boot migration normalized old durable copies into a new durable object, UI rendering treated stored values as form state, provider identifiers lacked an allowlist, and provider adapters treated URL query authentication as a harmless transport detail. Tests and project instructions subsequently encoded those implementation choices as policy.

## Current Change Boundary

- This bubbles.bug reconciliation edits only `bug.md` and the execution/routing portions of `state.json` in this existing packet.
- It does not edit `rldata.js`, `scripts/selftest.mjs`, provider tests, Feature 004 artifacts, `spec.md`, `design.md`, `scopes.md`, `report.md`, `uservalidation.md`, `scenario-manifest.json`, or `test-plan.json`.
- `F004-COLLISION-001` remains open with baseline hunk hash `ab27e89cd0dd8c6dd640254615a10d15a2be008596ec72834ca4512766c646fc`; no collision repair is attempted here.
- Delivery owners must take a just-in-time dirty-hunk/index baseline before touching shared files, make surgical edits only, and preserve every unrelated user/concurrent hunk. Stash, reset, checkout overwrite, clean, broad formatting, staging, wholesale replacement, and rollback to either credential-persistence design are forbidden.

## Prior Change Boundary (Historical)

This bug-discovery phase may create only this new folder. It must not edit, stash, reset, clean, stage, overwrite, or normalize any existing product, test, framework-install, or spec work. Delivery agents must preserve pre-existing hunks in every touched file and prove that excluded dirty paths are byte-for-byte unchanged.

## Related

- Cross-cutting bug root: `specs/_bugs/`
- Existing policy surfaces: `.github/copilot-instructions.md`, `.specify/memory/agents.md`
- Existing shared surfaces: `rldata.js`, `rlapp.js`, `index.html`, registered tool pages
- Existing regression owner: `scripts/selftest.mjs`
- G028 source: `.github/bubbles/scripts/implementation-reality-scan.sh`

## Active Ownership Route

```yaml
routeVersion: 3
bug: BUG-001
target: specs/_bugs/BUG-001-central-provider-credential-security
outcome: route_required
workflowMode: bugfix-fastlane
currentOwner: bubbles.bug
nextRequiredOwner: bubbles.implement
scope: SCOPE-01
implementationDispatchAllowedNow: true
sequence:
  - order: 1
    owner: bubbles.implement
    action: Begin SCOPE-01 only. Capture scenario-first RED before source changes, then implement the current-document runtime foundation surgically within the protected dirty-tree boundary.
activeConstraints:
  - id: SCENARIO-FIRST-RED
    requirement: Execute the exact SCOPE-01 regression scenarios against current production first and retain the observed failing proof before changing implementation.
  - id: CURRENT-DOCUMENT-CLOSURE-PRIVATE-MEMORY
    requirement: Credentials may exist only in closure-private memory for the currently loaded document; no cross-document continuity or transfer is permitted.
  - id: NO-SERIALIZED-CREDENTIAL-APIS
    requirement: Remove the serialized envelope, storage adapters, raw getters, bulk maps, header exporters, and every transferable credential representation; add no replacement serialization API.
  - id: LIFECYCLE-CLEARING
    requirement: Reload, route or history transition, bfcache traversal, page navigation, pagehide, close or reopen, new realm, and explicit clear must leave the affected document unconfigured.
  - id: CLOSED-IDENTIFIERS
    requirement: Unknown, empty, inherited, constructor, and prototype-shaped provider identifiers fail closed without runtime, registry, storage-surface, or prototype mutation.
  - id: BUG001-DIRTY-TREE-BOUNDARY
    requirement: Capture the just-in-time status, index OID, worktree hash, and distinct hunk hashes before edits; stop on ambiguous ownership and preserve every unrelated dirty hunk.
  - id: DEP-BUG013-SEMANTIC-CLASSIFIER
    requirement: Preserve the canonical semantic dependency and make no downstream framework edit; it gates later G028 closure but does not block SCOPE-01 pickup.
  - id: F004-COLLISION-001
    requirement: Preserve the open collision and exact protected hash ab27e89cd0dd8c6dd640254615a10d15a2be008596ec72834ca4512766c646fc; do not repair or rewrite its owner evidence.
entryGateForImplementation: Satisfied for SCOPE-01 only. The active five-scope plan is coherent, every scope remains Not Started, SCOPE-01 has no scope dependency, and no delivery or completion evidence is claimed.
```

## Prior Ownership Route (Superseded 2026-07-15)

The following route is retained as historical packet state. Its implementation entry gate is no longer satisfied.

```yaml
routeVersion: 1
bug: BUG-001
target: specs/_bugs/BUG-001-central-provider-credential-security
workflowMode: bugfix-fastlane
sequence:
  - owner: bubbles.design
    action: Confirm the root cause, resolve the sessionStorage/G028 policy dependency, freeze provider authorization and transport contracts, and reconcile design.md.
  - owner: bubbles.plan
    action: Reconcile scopes.md and scenario-manifest.json, create test-plan.json, preserve all eleven scenario-specific regressions, and keep the dirty-tree boundary explicit.
  - owner: bubbles.implement
    action: Capture failing pre-fix regressions first, then implement the approved scopes with one-to-one closure for G028-01 through G028-09 and the scanner blind spot.
entryGateForImplementation: Design and plan owners have returned concrete result envelopes, provider authorization policy is explicit, and pre-fix regression execution is ready.
```
