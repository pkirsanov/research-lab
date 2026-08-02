# Bug: BUG-001 Central Provider Credential Security

Links: [spec.md](spec.md) | [design.md](design.md) | [scopes.md](scopes.md) | [report.md](report.md) | [uservalidation.md](uservalidation.md)

> **Active contract after BUG-002 supersession (2026-08-01).**
> Certified-done [BUG-002](../BUG-002-two-tier-provider-access/bug.md) is the
> sole authority for current provider access: Tier 1 uses the configured proxy,
> and Tier 2 intentionally persists this browser's local keys in
> `localStorage.rlProviderConfig`.
>
> BUG-001 retains exactly one active requirement: erase and verify exact
> credential containers left by the pre-BUG-002 model without changing current
> BUG-002 configuration or non-secret `localStorage.rlData`. SCOPE-01 has
> implementation and test evidence, but BUG-001 remains In Progress because
> plan-owned transition blockers and validate-owned certification remain open.

## Summary

Research Lab browsers that predate BUG-002 can retain credential-bearing data
under exact historical container names. BUG-001's only active contract is the
implemented SCOPE-01 cleanup: report redacted legacy presence, disclose and
confirm whole-container deletion, erase and verify only registered historical
names, and report incomplete deletion honestly. The cleanup must preserve
BUG-002's current proxy behavior, `localStorage.rlProviderConfig`, and
non-secret `localStorage.rlData` unchanged.

## Severity

- [ ] Critical - System unusable or destructive compromise is demonstrated
- [x] High - Provider credentials can persist and leak through multiple browser and request surfaces
- [ ] Medium - Feature broken with a bounded workaround
- [ ] Low - Minor issue

## Status

- [ ] Reported
- [ ] Confirmed by an executed pre-fix regression
- [x] In Progress - withdrawal routed to artifact owners
- [ ] Fixed
- [ ] Verified
- [ ] Closed

SCOPE-01 implementation and test evidence is recorded, but no Fixed, Verified,
Closed, or certified completion claim is made. BUG-002 remains authoritative
for current provider access. The bug remains In Progress while `bubbles.plan`
reconciles validate's remaining plan-owned DoD/history/anchor findings; only
`bubbles.validate` may subsequently change certification.

## Supersession Disposition

| BUG-001 requirement family | Product Review disposition | Evidence / route |
| --- | --- | --- |
| Memory-only credentials; reload/navigation clearing; no browser persistence; no index editor; no cross-page credential availability | Superseded for Tier 2 | BUG-002 `spec.md` FR-2 through FR-6 and SCN-BUG002-002 explicitly require per-browser `localStorage.rlProviderConfig` persistence and cross-page availability. |
| All production browser providers disabled; header-only transport; no proxy/query transport | Superseded | BUG-002 `spec.md` FR-3 through FR-5 deliberately enable proxy-first and provider-query Tier-2 transport. |
| One shared provider owner and closed registry; prototype-safe unknown-provider rejection | Addressed by BUG-002 | BUG-002 SCOPE-01 and `report.md#s1` / `report.md#s3` record the frozen registry, centralized API, old-API removal, and prototype-safe regression. |
| No key in rendered status, logs, errors, tool reads, exports, or non-owning transport | Addressed by BUG-002 | BUG-002 FR-7 plus validation/audit evidence record `KEY_LEAKS=0`, `PROXY_KEY_LEAKS=0`, and no key disclosure. |
| Clear active provider configuration; preserve non-secret `localStorage.rlData`; remove stale first-party credential consumers | Addressed by BUG-002 | BUG-002 SCN-BUG002-007, SCOPE-01 consumer sweep, SCOPE-02 editor, and SCOPE-05 rewire are certified done. |
| Erase and verify credentials already present in pre-BUG-002 legacy browser containers | Retained; not proven by BUG-002 | `RET-BUG001-LEGACY-ERASURE` -> `bubbles.plan` to extract the requirement, then `bubbles.bug` to create a focused bug packet before any implementation. |
| Canonical G028 semantic refinement and Feature 004 collision ownership | Not resolved here and not a reason to execute the superseded BUG-001 contract | Preserve the existing canonical BUG-013 / Feature 004 owner routes; this withdrawal makes no resolution claim for either foreign finding. |

## Historical Discovery Source - Broad Contract Superseded

This section records why BUG-001 was originally opened. It is provenance only;
its memory-only and provider-transport conclusions are not active BUG-001
requirements after BUG-002.

- Discoverer: `bubbles.security`
- Mechanical gate: G028 `implementation_reality_scan_gate`
- Baseline revision: `9d4020b4bd80516c49a3005f42edacedc169c3e9`
- Baseline captured: `2026-07-13T04:19:44Z`
- Provenance: the prior security transcript was not available in the local session index. The nine scanner rows below were re-derived from the installed G028 matcher and the baseline source. They are recorded as interpreted source evidence, not represented as a newly executed scanner run.
- Reopen trigger: `specs/004-fx-regime-relative-value-lab/report.md#security-review-evidence---f004-reality-001`
- Reopen classification: executed Feature 004 security evidence identifies the raw legacy collection path and active `sessionStorage` envelope as genuine High findings; cache-comment and verified erase/readback rows are mechanical false positives.
- Collision constraint: `F004-COLLISION-001` remains open exactly as recorded by Feature 004. This reconciliation does not edit its test, `scripts/selftest.mjs`, `rldata.js`, or Feature 004 artifacts.

## Active Reproduction Steps

1. Seed one or more exact registered pre-BUG-002 credential containers beside
  valid BUG-002 proxy configuration, `localStorage.rlProviderConfig`, and
  non-secret `localStorage.rlData`.
2. Open `index.html#data-settings` and observe only redacted legacy
  provider/location classes and counts plus the whole-container deletion
  disclosure.
3. Dismiss cleanup and verify that no legacy or current container changes.
4. Confirm cleanup and verify that only selected registered historical names
  are absent while all BUG-002 and `rlData` state remains unchanged.
5. Force one registered deletion to remain and verify an explicit redacted
  incomplete result with no success claim and no current-configuration change.
6. Use the preserved SCOPE-01 evidence in `report.md` for execution results;
  this artifact reconciliation does not rerun or rewrite that evidence.

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

- Current provider access continues to follow BUG-002: Tier 1 uses the configured
  proxy, and Tier 2 uses this browser's keys from
  `localStorage.rlProviderConfig`.
- BUG-001 detects only exact registered pre-BUG-002 container names and reports
  redacted provider/location classes and counts without activating or migrating
  their contents.
- Whole-container deletion discloses its destructive effect and requires
  explicit confirmation.
- Confirmed cleanup removes only selected registered historical names and
  reports complete only after verifying every selected name is absent.
- Detection, dismissal, complete cleanup, and incomplete cleanup leave BUG-002
  proxy configuration, `localStorage.rlProviderConfig`, and non-secret
  `localStorage.rlData` unchanged.
- Any selected name that remains yields an explicit redacted incomplete result,
  never a success claim.

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

- SCOPE-01 implementation removes and verifies exact pre-BUG-002 legacy
  containers, exposes redacted complete/incomplete outcomes, and protects
  current BUG-002 configuration.
- Preserved report evidence maps six test rows to `SCN-BUG001-004`, including
  current-container preservation and forced incomplete deletion. This bug
  artifact does not reinterpret or replace that evidence.
- BUG-002's proxy and durable per-browser `localStorage.rlProviderConfig`
  behavior remains current and intentionally outside BUG-001 cleanup authority.
- Plan-owned active scope/DoD shape and evidence-anchor findings still block
  transition, and certification remains `in_progress` and unchanged.
- The former five-scope memory-only/no-persistence behavior is superseded
  history only and supplies no active implementation, test, or certification
  requirement.

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

## Historical Feature 004 Security Classification - Not Active

**Claim Source:** interpreted  
**Interpretation:** Feature 004 recorded the prior broad-contract security
classification. The evidence remains preserved, but its memory-only and
provider-transport dispositions are superseded by BUG-002 and are not active
BUG-001 requirements.

| Finding | Classification | Current disposition |
| --- | --- | --- |
| F004-REALITY-001-LEGACY | Genuine - High - OWASP A02/A07 | `collectLegacyCredentials()` reads and stages raw durable values. Replace discovery with redacted metadata plus erase-only deletion; never migrate or activate values. |
| F004-REALITY-001-SESSION | Genuine - High - OWASP A02/A07 | The active `sessionStorage` envelope persists and supplies provider authentication material. Replace it with current-page memory only; reload/navigation must clear credentials. |
| F004-SCAN-FP-CACHE | Mechanical false positive | Preserve the non-secret `localStorage.rlData` cache and its in-memory mirror comment. Route scanner precision separately; do not delete valid cache behavior. |
| F004-SCAN-FP-SCRUB | Mechanical duplicate false positive | Preserve verified `removeItem()` plus absence-readback cleanup. The same physical line is emitted twice and is not credential persistence. |
| F004-COLLISION-001 | Open protected collision | Preserve the exact `scripts/selftest.mjs` hunk-identity failure and all current dirty work. This bug phase does not repair or rewrite it. |
| BUG001-CONTRACT-SESSION-STORAGE | Planning contract reconciled; delivery open | Active spec, design, plan, scenario, machine test-plan, user-validation, and certification inventory surfaces now prohibit same-tab continuity and value migration. SCOPE-01 may dispatch, but current product code and tests still require scenario-first RED and implementation. |

### Historical Scanner Blind Spot

G028 does not directly report `rldata.js` central credential reads/writes that use the `KEY_STORE` variable instead of a literal credential-shaped key. Those paths are genuine findings even though they are outside the nine emitted rows. Closing only the literal scanner rows would leave the durable store intact and would not fix the bug.

### Superseded Upstream Policy Dependency

This prior dependency text is retained as history. Feature 004 resolved the policy question against the product exception: the blanket prohibition applies, so the product contract must change rather than seeking scanner approval for the shared envelope.

The installed G028 policy also treats any `sessionStorage` API-key storage as blocking. That conflicts with the required same-tab product contract. Renaming variables, splitting lines, or wrapping calls to evade the regex is forbidden. Before certification, the Bubbles source owner must reconcile this case without weakening protection for auth tokens, session secrets, payment data, or durable provider credentials. The product implementation remains subject to that upstream disposition.

## Current Root Cause

BUG-002 replaced the provider-access model and removed ownership of the older
credential APIs, but existing browsers could still retain containers written by
that pre-BUG-002 model. Fresh contexts and current API removal cannot erase
already-persisted client state. The retained defect was therefore a bounded
lifecycle gap: exact historical containers needed a disclosed, confirmed,
verified retirement path that structurally excludes BUG-002's current proxy,
`localStorage.rlProviderConfig`, and non-secret `rlData` state.

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
routeVersion: 4
bug: BUG-001
target: specs/_bugs/BUG-001-central-provider-credential-security
outcome: route_required
workflowMode: bugfix-fastlane
currentOwner: bubbles.bug
nextRequiredOwner: bubbles.plan
scope: SCOPE-01
implementationDispatchAllowedNow: false
addressedFindingIds:
  - BUG001-G070-ACTIVE-CONTRACT
  - BUG001-BUG-STATUS-CONTRACT
  - BUG001-G061-CONTROL-STATE
unresolvedFindingIds:
  - BUG001-G001-SUPERSEDED-DOD
  - BUG001-G001-ACTIVE-DOD-SHAPE
  - BUG001-G001-EVIDENCE-ANCHOR
sequence:
  - order: 1
    owner: bubbles.plan
    action: Reconcile only plan-owned superseded-history DoD counting, active SCOPE-01 DoD shape, and evidence-anchor references identified by validation; preserve the implemented legacy-erasure scope and BUG-002 current provider behavior.
activeConstraints:
  - id: BUG002-CURRENT-PROVIDER-AUTHORITY
    requirement: BUG-002 remains authoritative for Tier-1 proxy behavior and Tier-2 localStorage.rlProviderConfig persistence; BUG-001 cleanup must not restrict or mutate either.
  - id: PRESERVE-EXECUTION-EVIDENCE
    requirement: Preserve current source, tests, report evidence, and the implemented SCOPE-01 legacy-erasure behavior without redispatching implementation.
  - id: CERTIFICATION-OWNERSHIP
    requirement: Do not change certification; validation resumes only after plan-owned blockers are reconciled.
entryGateForImplementation: Closed. SCOPE-01 implementation and test evidence already exist; the next action is plan-owned artifact reconciliation, not source or test work.
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
