# Scopes: BUG-021 — A Pack Read That Never Completes Leaves The Route Waiting Without End

**Scope layout:** single-file.

## Sequencing Note

Scope 1 is blocked until the owner answers both parts of the open question in
`design.md`: where the bound is declared, and what governs the read that fetches
the configuration itself. Scope 2 cannot be written before Scope 1, because its
assertions depend on where the bound lives.

## Scope 1: Bound Every Declared Document Read

**Status:** Done

### Problem This Scope Resolves

The helper that reads all nine declared documents has no time bound, so a read
that neither succeeds nor fails suspends the boot chain permanently. Every
handler downstream of it already produces the correct outcome for a failed read;
the rejection those handlers are waiting for is the thing that never arrives.

### Gherkin Scenarios

```gherkin
# SCN-021-01
Scenario: a declared document that never arrives reaches a terminal named state
  Given an origin that accepts the request for one declared pack and never responds
  When the route boots
  Then the document body carries a terminal display-state attribute within the declared bound
  And the settlement header no longer reads "Loading"
  And the message names the document that did not arrive

# SCN-021-02
Scenario: a read that completes inside the bound is unaffected
  Given an origin that delays one declared pack by less than the declared bound
  When the route boots
  Then the route settles with the same figures it settles with when that pack is served immediately

# SCN-021-03
Scenario: an unbounded read is impossible by construction
  Given the helper that reads declared documents
  When a read is issued
  Then that read carries a bound and is aborted when the bound elapses
```

### Implementation Plan

1. Record the owner's answers to both parts of the open question in `design.md`.
2. Declare the bound wherever the owner chose, extending the configuration
   contract and its exact-key-set validation if that is the chosen home. Do not
   relax the exact-key-set check.
3. Race each read against the bound and abort the request when the bound elapses,
   so no request is left outstanding.
4. Confirm the rejection is handled by the existing per-stage handlers with no new
   branch, since a bound rejection and a read failure are the same event to them.

### Test Plan

| Id | Category | Asserts |
|---|---|---|
| TB-021-01 | browser | A never-responding declared pack reaches a terminal display state within the bound and names the document |
| TB-021-02 | browser | A pack delayed below the bound settles with unchanged figures |
| TB-021-03 | browser | The settlement header never remains `Loading` once the bound has elapsed |
| TB-021-04 | node | The declared bound is validated, and a configuration missing it is refused |

### Definition of Done

- [x] The owner's decision on where the bound is declared is recorded in `design.md`, with the date and the reasoning. → Evidence: `design.md` `## The Decision`, "Decided 2026-08-24. Authorised by the owner; recorded here by `bubbles.design`", naming `rules.packReadBoundMs` for the eight pack reads and `CONFIG_READ_BOUND_MS` for the one read that precedes them, with the reasoning in `### How the circularity is resolved` and the sizing in `### Why 10000`.
- [x] The owner's decision on what governs the read that fetches the configuration itself is recorded in the same place, including an explicit acceptance if that read remains unbounded. → Evidence: the same section. No acceptance clause is needed because no read remains unbounded: stratum 0 governs the configuration read, and the alternative the filing round left open — accepting one unbounded read — is recorded as **rejected**, on the ground that it would leave the defect on the read that blocks everything else.
- [x] SCN-021-01 holds: a never-responding declared pack produces a terminal display-state attribute and a settlement header other than `Loading`, within the declared bound. → Evidence: `tests/lifetime-tax-read-bound.spec.mjs` test 1 drives the filed condition — an origin that accepts the request and never writes a response — and asserts a terminal `data-rl-tax-state`, a header other than `Loading`, arrival within the declared bound plus the suite margin, and the withheld document named with the bound it exceeded. Proven to discriminate by probe `P1`, which withholds the abort signal from `fetch` and reproduces the pre-change hang.
- [x] SCN-021-02 holds: a pack delayed below the bound settles with every figure identical to the undelayed settlement. → Evidence: test 3 captures the whole stage table from an undelayed boot and compares it against the same table after a 3000 ms delay on the same declared pack; proven to discriminate by probe `P8`, which lowers the bound to 1000.
- [x] SCN-021-03 holds: every read issued by the helper carries a bound and aborts the underlying request when it elapses. → Evidence: the route holds exactly one `window.fetch(`, zero bare `fetch(`, zero other transports, and seven `loadJson(` call sites covering all nine declared documents; `TB-021-04` asserts that helper arms an `AbortController` from the resolved bound rather than a literal, passes its `signal` to `fetch` and clears the timer on both settlement paths. Both strata are shown aborting a real read: test 1 for a pack read and test 2 for the configuration read. Probes `P1`, `P4` and `P7` show those assertions failing when the abort is not actually applied.
- [x] No new refusal branch was added downstream, and `report.md` states which existing handler received the bound rejection for each stage. → Evidence: `report.md` `### Which handler received the bound rejection, per stage` carries the nine-document table; the implementation commit's only handler edits are five `.catch(function () { return null; })` → `.catch(recordUnreadDocument)` replacements that keep the `return null` contract, plus one edit inside the pre-existing outer `.catch`, and no new `RLTAX-` code was introduced.
- [x] If the configuration contract gained a member, its exact-key-set validation still refuses an unknown or missing key, proven by a red-green probe recorded in `report.md`. → Evidence: probe `P5` removes the member from `CONFIG_SECTION_FIELDS.rules` while the document declares it, and probe `P6` deletes it from the document while the key set requires it; both directions go red and both discriminate on the summary channel as well as the exit code.
- [x] `node scripts/selftest.mjs` reports `0 failed` and no fewer assertions than before this scope. → Evidence: `self-test: 3409 passed, 0 failed`, exit `0`, recorded in `report.md` `### Validation`. The count is unchanged rather than lower because the six assertions this round added are browser assertions the node self-test does not count.

## Scope 2: Pin Both Sides Of The Bound

**Status:** Done

### Problem This Scope Resolves

A bound that exists but is asserted only on the failing side can be widened until
it is useless without any assertion noticing, and a bound asserted only on the
settling side can be narrowed until a working slow origin starts refusing.

### Gherkin Scenarios

```gherkin
# SCN-021-04
Scenario: the tolerated side of the bound is pinned
  Given an origin that delays one declared pack by less than the declared bound
  When the route boots
  Then the route settles

# SCN-021-05
Scenario: the refusing side of the bound is pinned
  Given an origin that never responds for one declared pack
  When the route boots
  Then the route reaches a terminal named state rather than settling
```

### Implementation Plan

1. Add both assertions to the lifetime-tax browser suite, driven by a server that
   can delay and can withhold a response for a named path.
2. Prove each assertion discriminates with `scripts/red-green-probe.sh`, pinning
   `--summary-match` to that assertion's own wording rather than to the aggregate
   pass count.

### Test Plan

| Id | Category | Asserts |
|---|---|---|
| TB-021-05 | browser | A delayed but delivered pack settles |
| TB-021-06 | browser | A withheld pack reaches a terminal named state |

### Definition of Done

- [x] SCN-021-04 holds against a delay below the bound. → Evidence: test 5 delays the declared medicare pack by 3000 ms, the delay the filing round observed settling at 3058 ms, and asserts the route reaches `ready`, settles, and records no document as unread — so the read was served rather than aborted.
- [x] SCN-021-05 holds against a withheld response. → Evidence: test 6 withholds the same pack and asserts the terminal state arrives no earlier than the declared bound and no later than that bound plus the suite margin, with the withheld document recorded as unread rather than settled as though it had arrived.
- [x] Each assertion is proven to discriminate by a `scripts/red-green-probe.sh` run recorded verbatim in `report.md`, with `--summary-match` pinned to that assertion's own wording. → Evidence: probe `P2` for the tolerated side against a bound lowered to 1000, probe `P3` for the refusing side against a bound widened to 600000; each `--summary-match` names its own scenario wording, and both returned exit `0`.
- [x] The test server capability used to withhold a response is described in `report.md`, so a later reader can tell the harness from the system under test. → Evidence: `report.md` `### The harness`. No server capability was added: both sides use Playwright's own request interception on one declared path, as `design.md` `## The Boundary, Exactly` chose. Each withheld assertion also checks the handler was actually entered, so a selector that stopped matching would fail rather than pass by intercepting nothing.
- [x] `node scripts/validate-spec-test-paths.mjs` reports `new=0 stale=0`. → Evidence: `new=0 stale=0`, exit `0`, recorded in `report.md` `### Validation`.
- [x] The lifetime-tax browser suite passes on `--project=chromium` with no fewer assertions than before this scope. → Evidence: `111 passed`, exit `0`, recorded in `report.md` `### The lifetime-tax browser suite`; the family held 105 tests before this round.
