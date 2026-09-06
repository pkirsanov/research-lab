# BUG-002: Author Request Fingerprint Pre-Dispatch Verification

**Status:** Confirmed
**Severity:** Medium
**Security class:** A08 - Software and Data Integrity Failures
**Finding:** `F030-SEC-02`
**Reported:** 2026-09-03
**Feature:** `specs/030-budget-aware-hybrid-brief-generation`
**Affected modules:** `scripts/brief-author.mjs`,
`scripts/brief-route-runtime.mjs`, and
`scripts/brief-openai-compatible-adapter.mjs`

## Summary

Feature 030 builders create canonical request fingerprints, but dispatch
boundaries validate only the supplied digest's shape. A caller can mutate a
fingerprinted field, retain the old digest, and still reach process, route, and
HTTP work.

## Reproduction

The security handoff supplies this adversarial sequence:

1. Build an author request through the canonical builder.
2. Retain its generated `requestFingerprint`.
3. Change `data.compactedRead.observationRef`.
4. Dispatch the mutated request through the shadow route.

The handoff reports calls to `/v1/models` and `/v1/chat/completions`, followed
by `ok: true`. This invocation did not repeat the RED execution.

## Expected Behavior

Every dispatch boundary must re-derive the fingerprint from the canonical eight
fields and compare it with the supplied digest before side effects. A stale
digest must refuse before a transport callback, child spawn, route dispatch,
model preflight, or HTTP request.

## Actual Behavior

`brief-author.mjs` owns a private canonical fingerprint function and uses it
only while building requests. `invokeAuthor` checks that a fingerprint is a
string. The route runtime checks only the `sha256:<64 lowercase hex>` syntax.
The adapter uses the supplied digest in its schema and starts model preflight
without canonical equality verification.

## Environment

- Repository revision: `eba665b8ee5569b2bb14c4ab6f868cb7636788c8`
- Observation date: 2026-09-03
- Runtime: Node.js ES modules and loopback HTTP boundary
- Worktree: existing Feature 030 source and test changes were present before this packet

## Evidence Boundary

The RED result above is operator-supplied diagnostic context. It is not
current-invocation execution evidence. The exact TP-01-10 command must capture
RED before the source repair and GREEN after it.

## Root Cause

Fingerprint generation and fingerprint verification are separated by an
export boundary that does not exist. Downstream modules can check digest syntax,
but they cannot reuse the canonical projection and stable serialization owned
by `brief-author.mjs`. They therefore trust caller-supplied identity.

## Impact

The transport can author data that no longer matches the request identity.
That breaks the integrity link between the frozen author request, the response
schema, and the returned response fingerprint.

## Repair Boundary

Add one exported `verifyAuthorRequestFingerprint(request)` function in
`scripts/brief-author.mjs`. Reuse the existing private canonicalizer. Invoke the
verifier before side effects in all three owning modules.

Do not change request builders, the canonical projection, constants, generated
request bytes, or response bytes. Do not add a production consumer. A refusal
must not select another provider or route.

## Related

- Parent scenario: `SCN-030-003`
- Parent requirement: `S01-R09 Frozen author contract`
- Parent test row: `TP-01-10`
- Parent DoD row: `DOD-01-TP-01-10`
- Separate defect: `F030-SEC-01` belongs to BUG-001
- Framework observation: `F030-SEC-OBS-01` is not part of this packet
