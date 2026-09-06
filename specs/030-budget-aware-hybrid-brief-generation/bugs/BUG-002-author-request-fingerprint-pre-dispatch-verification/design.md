# Bug Fix Design: BUG-002 Author Request Fingerprint Pre-Dispatch Verification

## Root Cause Analysis

### Investigation Summary

`brief-author.mjs` defines private `requestFingerprint(request)`. The function
uses stable key ordering and hashes a projection of eight request fields. The
existing builders assign its output to `request.requestFingerprint`.

`invokeAuthor` validates only the request contract and fingerprint string type.
`brief-route-runtime.mjs` validates only digest syntax. The adapter builds its
response schema from the supplied digest and calls model qualification before
any canonical equality check.

### Root Cause

The module that owns canonicalization exposes fingerprint generation only as a
builder side effect. Dispatch modules cannot re-derive identity without
duplicating the algorithm, so they trust a syntax-valid caller-supplied digest.

### Impact Analysis

- **Affected components:** author process dispatch, shadow route dispatch, and OpenAI-compatible adapter dispatch.
- **Affected data:** all eight canonical request fields.
- **Security impact:** changed data can retain stale integrity identity and reach external work.
- **Authority impact:** no production authority change is permitted.
- **Consumer impact:** the shadow CLI remains the only executable shadow consumer.

## Fix Design

### Solution Approach

1. Export `verifyAuthorRequestFingerprint(request)` from
   `scripts/brief-author.mjs`.
2. Reuse private `requestFingerprint(request)` without copying its projection or
   serializer.
3. Return the existing closed author-request refusal when the request is not a
   valid object, the digest syntax is invalid, or canonical equality fails.
4. Return the verified request unchanged on success.
5. Call the verifier in `invokeAuthor` before `options.transport` or `spawn`.
6. Import and call the verifier in `runShadowAuthor` before profile resolution
   and route dispatch.
7. Import and call the verifier at the adapter dispatch entry before
   `qualifyOpenAICompatibleModel` and any HTTP request.

The verifier must not modify or clone the request. Existing builders and their
output bytes remain byte-identical.

### Dispatch Ordering

The repaired path preserves this order:

1. receive the frozen request;
2. validate supported contract shape;
3. re-derive and compare the canonical fingerprint;
4. apply the existing capability and safety checks;
5. resolve the fixed route and profile;
6. perform process or HTTP work.

### Change Boundary

| Path | Authorized change |
| --- | --- |
| `scripts/brief-author.mjs` | Add the verifier export and call it before transport callback or child spawn in `invokeAuthor`. |
| `scripts/brief-route-runtime.mjs` | Import the verifier and call it before route dispatch. |
| `scripts/brief-openai-compatible-adapter.mjs` | Import the verifier and call it before model qualification or HTTP. |
| `tests/brief-openai-compatible-adapter.functional.mjs` | Add only TP-01-10 and helpers used exclusively by that test. |
| `tests/brief-openai-compatible-adapter.local-canary.mjs` | Use existing canonical builders and assert verified requests without changing provider semantics. |
| `scripts/selftest.mjs` | Add focused Feature 030 verifier and byte-invariance assertions only. |
| `specs/030-budget-aware-hybrid-brief-generation/bugs/BUG-002-author-request-fingerprint-pre-dispatch-verification/**` | Record this packet and later evidence. |

The shared selftest and functional carrier are coordinated with BUG-001.
BUG-002 owns only fingerprint assertions and the exact TP-01-10 title.

### Preserved Architecture

The repair adds no fingerprint algorithm, route, provider, model, endpoint,
policy, public artifact, scheduler path, or production consumer. A stale digest
refuses. It never authorizes provider rerouting. Copilot production remains
authoritative.

### Alternative Approaches Considered

1. Duplicate canonicalization in each dispatch module. Rejected because three
   algorithms would drift and violate the single-owner requirement.
2. Verify only in the route runtime. Rejected because `invokeAuthor` and the
   adapter are exported boundaries that can be called directly.
3. Verify only after `/v1/models`. Rejected because model preflight is already
   an external side effect.
4. Rebuild every incoming request. Rejected because builders, projections, and
   emitted bytes must remain unchanged.

## Regression Design

TP-01-10 starts with a builder-generated valid request. It mutates one of
`contractVersion`, `data`, `provider`, `model`, `promptPolicy`, `schema`,
`validator`, or `maxOutputTokens` while retaining the original digest.

The complete matrix runs at each dispatch boundary. Counter assertions prove
zero transport callbacks, child spawns, route dispatches, model calls, and HTTP
calls. The same command captures RED before the repair and GREEN after it.

Both provider canaries then build requests through the canonical builders.
They validate the unchanged valid path after TP-01-10 is GREEN.

## Risks And Controls

| Risk | Control |
| --- | --- |
| The exported verifier forks canonicalization. | Call the existing private `requestFingerprint` function directly. |
| Verification occurs after a side effect. | Assert zero counters at all three boundaries for every mutation. |
| Existing request bytes change. | Compare builder outputs before and after the additive export and calls. |
| Shared tests mix BUG-001 and BUG-002 ownership. | Keep distinct exact titles and focused helper regions. |
| A refusal selects another provider. | Preserve profile and provider selection code and assert zero alternate calls. |
| A shadow module gains production reachability. | Retain the zero-production-consumer scan and unchanged scheduler/public paths. |

## Complexity Tracking

The three call sites add necessary defense in depth because each is an exported
dispatch boundary. The fingerprint algorithm itself remains single-source.
