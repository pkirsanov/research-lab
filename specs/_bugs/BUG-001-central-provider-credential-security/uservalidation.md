# User Validation: BUG-001 Central Provider Credential Security

Links: [spec.md](spec.md) | [scopes.md](scopes.md) | [report.md](report.md)

## Checklist

- [x] Acceptance criterion recorded: one shared capability owns credential behavior for exactly one currently loaded document.
- [x] Acceptance criterion recorded: reload, hash/history route change, bfcache traversal, HTML-page navigation, close/reopen, tab, window, iframe, and browser context all begin unconfigured.
- [x] Acceptance criterion recorded: no credential is written to any browser/client storage or carried by a URL, message, worker, cookie, opener, DOM, history, or equivalent bridge.
- [x] Acceptance criterion recorded: production pages expose no credential-bearing password/text input, hidden field, attribute, event, or remounted value.
- [x] Acceptance criterion recorded: browser credential use remains disabled unless one loaded document owns both user-gesture collection and a fully authorized request path.
- [x] Acceptance criterion recorded: boot-time legacy detection reports registered provider/location metadata and counts without reading or activating values.
- [x] Acceptance criterion recorded: dismissal leaves legacy containers untouched and inactive; destructive confirmation authorizes whole-container deletion only, and success requires registered-name absence without value access.
- [x] Acceptance criterion recorded: unknown and prototype-shaped provider IDs fail without mutation.
- [x] Acceptance criterion recorded: clear-all removes current-document references first, then performs whole-container erase, and never restores memory after incomplete cleanup.
- [x] Acceptance criterion recorded: registered tools start unconfigured and expose no editor, raw getter, writer, broker, legacy-value helper, or credential transport.
- [x] Acceptance criterion recorded: a sentinel stays out of DOM/accessibility output, events, logs, errors, analytics, URLs/referrers, storage/bridges, screenshots/traces/snapshots, and test artifacts.
- [x] Acceptance criterion recorded: Twelve Data and every other incomplete production policy send zero credential-backed browser requests.
- [x] Acceptance criterion recorded: a controlled eligible request uses one exact-origin approved header attempt and has no query, proxy, provider, origin, or transport fallback.
- [x] Acceptance criterion recorded: public/no-key data, normalized non-secret `rlData`, Feature 004 collision state, all protected dirty hunks, and provider/Bond/Causal/FX canaries remain intact.
- [x] Acceptance criterion recorded: every G028 row and blind spot has one addressed or owner-routed disposition, with BUG-013 semantics arriving only from canonical Bubbles.

These checked items confirm the acceptance questions are present in the packet. They do not assert that the implementation already satisfies them. Executed acceptance evidence belongs in [report.md](report.md) after delivery and certification.

## Goal

- Goal: remove client persistence, cross-document credential transport, and every legacy-value ingress while retaining only a same-loaded-document capability behind complete provider authorization.
- Success signal: every lifecycle boundary clears state, production providers remain disabled without full evidence, legacy detection uses names and registry metadata only, confirmed cleanup deletes whole containers and verifies name absence, clear-all is complete or explicitly incomplete, and a sentinel is absent from every prohibited surface.

## Journey Steps

| Step | User Intent | Expected observation | Evidence target | Friction vocabulary |
| --- | --- | --- | --- | --- |
| 1 | Inspect provider state | Non-secret disabled/unconfigured status appears; no credential-bearing input exists | `report.md#active-scope-01-evidence` | works, unclear, broken |
| 2 | Use public data | Existing public/no-key and normalized `rlData` paths remain usable without credential fallback | `report.md#active-scope-05-evidence` | works, missing, broken |
| 3 | Exercise an eligible controlled provider | One loaded document owns shared transient input and one approved request; the field blanks and only status/sanitized result appears | `report.md#active-scope-03-evidence` | works, missing, broken |
| 4 | Reload or navigate | Route, reload, page, bfcache, tab, window, iframe, and context boundaries all start unconfigured | `report.md#active-scope-01-evidence` | works, broken |
| 5 | Inspect legacy presence | Provider/location classes and counts appear; detection reads parses hashes compares copies stages and activates no value | `report.md#active-scope-02-evidence` | works, unclear, broken |
| 6 | Dismiss or erase legacy containers | Dismissal is inert; destructive disclosure precedes confirmation; whole-container deletion verifies registered names absent | `report.md#active-scope-02-evidence` | works, unclear, broken |
| 7 | Clear all | Current memory clears first; whole-container cleanup is complete or explicitly incomplete without restoration | `report.md#active-scope-02-evidence` | works, broken |
| 8 | Request an ineligible provider | No request is sent and a safe disabled state appears | `report.md#active-scope-04-evidence` | works, missing, broken |
| 9 | Inspect disclosure surfaces | No sentinel appears in output, storage, bridges, navigation, diagnostics, or artifacts | `report.md#active-scope-04-evidence` | works, broken |

## Open Refinements

No live user-journey ambiguity is recorded. Planning follows the corrected active design: current-document closure-private memory, metadata/name-only legacy detection, inert dismissal, whole-container deletion, name-absence verification, fail-closed provider authorization, exact header-only transport, and no tool credential surface. Delivery evidence remains execution-owned; `DEP-BUG013-SEMANTIC-CLASSIFIER`, `F004-COLLISION-001`, and the dirty-tree boundary remain visible implementation and test constraints.
