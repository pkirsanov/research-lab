# Scopes: BUG-007 — Decision-Attention Contract Drift

**Scope layout:** single-file
**Workflow mode:** `bugfix-fastlane`

---

## Scope 1: Verify The Defect, Its Family Structure, And Its Closure

**Status:** [x] Done

### Gherkin Scenarios (Regression)

```gherkin
Feature: BUG-007 Prevent a legacy-shape attention tier from republishing silently

  Scenario: A payload authored in the legacy catalyst shape is refused by name
    Given market-brief.payload.json carries attention items with no contractVersion
    When node scripts/selftest.mjs runs
    Then the assertion naming "a real decision-attention/v1 tier to rank" fails
    And the failure message reports the item count it actually found

  Scenario: A payload composed through the certified composer publishes its whole tier
    Given every committed attention item declares decision-attention/v1 and a declared window
    When RLATTN.selectAttentionItems is called with no explicit ceiling
    Then every committed item is published
    And capApplied is false and the suppressed set is empty

  Scenario: The card ceiling overflows rather than rejects
    Given a committed tier larger than an explicit ceiling of 2
    When RLATTN.selectAttentionItems is called with that ceiling
    Then exactly 2 items publish and the ranked tail moves to suppressed
    And published concatenated with suppressed reproduces the canonical rank order

  Scenario: The page projection is byte-current with the payload it copies
    Given scripts/build-brief-page-artifacts.mjs projects attention from payload.attention
    When the committed market-brief.page.json is compared to a fresh build
    Then the two are byte-identical

  Scenario: The composer runs inside the regeneration path, not beside it
    Given the authoring lane regenerates the payload roughly four times daily
    When scripts/brief-refresh-and-push.sh runs a publication attempt
    Then build-attention-items.mjs --recompose --write runs between the lane and the gate
```

### Implementation Plan

1. Bind the session to `research-lab` and confirm the working tree is clean.
2. Reproduce the reported red state without mutating the tree, using a detached worktree.
3. Enumerate every failing assertion, including the three lost to scrollback.
4. Measure the payload shape at both revisions to ground the root cause.
5. Determine whether the page-projection failure is independent or consequent, by
   measurement rather than resemblance.
6. Establish whether the durable control against 4×/day regeneration exists on the publish
   path and in the runbook.
7. Prove the named guard is non-vacuous by differential evaluation.
8. Re-run the full suite at `HEAD` and record the true counts.

### Test Plan

| Test type | Target | Command | Result |
|---|---|---|---|
| Regression (pre-fix, must fail) | Full suite at `cc990911d` | `node scripts/selftest.mjs` in a detached worktree | 1363 passed, 7 failed |
| Regression (post-fix, must pass) | Full suite at `aeb1bcbc3` | `node scripts/selftest.mjs` | 1370 passed, 0 failed, exit 0 |
| Adversarial | Guard predicate at `scripts/selftest.mjs:6105` | Differential evaluation across both revisions | FAIL at `HEAD~1`, PASS at `HEAD` |
| Static | Publish-path composer wiring | Read `scripts/brief-refresh-and-push.sh` | Present at line 386, between lane and gate |
| Static | Runbook contract | Read `notes/market-brief.md` | Step 3b at lines 125–132 |
| Not run | `tests/attention-payload-contract.test.mjs`, `tests/rlattention.test.mjs`, Playwright `tests/attention-browser.spec.mjs` | — | See Uncertainty Declaration UD-1 |

### Definition of Done

- [x] Root cause confirmed and documented
   - Raw output evidence:
      ```
      HEAD~1   selftest.mjs:6105 predicate => FAIL | items: 5 | carrying contractVersion: 0 | in a declared window: 0
      HEAD     selftest.mjs:6105 predicate => PASS | items: 3 | carrying contractVersion: 3 | in a declared window: 3
      => the named guard is non-vacuous: it FAILS on the legacy shape and PASSES on the composed shape

      payload.attention isArray: true len: 3
      payload.attention[0] keys: rank, domain, horizon, title, structuralAnchor, what, why,
      confidence, deepLink, contractVersion, id, gateId, subject, disposition, severity,
      imminence, headline, rationale, verb, invalidation, escalationTrigger, expiry,
      decisionWindow, windowBoundaryUtc, windowTradingDate, windowResolvedFrom,
      transmissionPath, transmissionAbsenceNote, marketConfirmation, marketConfirmationNote,
      figures, observedAt, state, supersededBy, lifecycle
      payload.attentionExclusions: 2 entries
      snapshot.attention: undefined
      ```
   - **Claim Source:** executed

- [x] Pre-fix regression evidence obtained — the suite FAILS at the red revision
   - Raw output evidence:
      ```
      Preparing worktree (detached HEAD cc990911d)
      HEAD is now at cc990911d test(runtime): declare the three undeclared committed suites in the pinned inventory
      47:  ✗ FAIL: Registry-wide Market Brief coverage selftest includes the registered volatility owner read
      669:  ✗ FAIL: current payload satisfies the executable brief contract: attention[0] (id absent).disposition RLATTN-DISPOSITION: only a non-committal gate disposition may become an attention item; … attention[4] (id absent).state RLATTN-LIFECYCLE: the item state is outside the declared lifecycle
      709:  ✗ FAIL: every REQUIRED narrative pattern matches a real field in the committed payload — the required list describes this payload, not an imagined one: attention.[].rationale, attention.[].invalidation, attention.[].escalationTrigger
      1501:  ✗ FAIL: the committed brief carries a real decision-attention/v1 tier to rank, every item in a declared decision window (5 item(s))
      1506:  ✗ FAIL: every committed attention item is live and publishes under the default card ceiling (0 of 7)
      1507:  ✗ FAIL: the card ceiling really bites and suppresses the ranked tail rather than dropping it (0 published, 0 suppressed)
      1529:  ✗ FAIL: market-brief.page.json is byte-current with its full source artifacts
      1572:Research-Lab self-test: 1363 passed, 7 failed
      GREP_DONE
      ```
   - **Claim Source:** executed

- [x] Adversarial regression case exists and would fail if the bug returned
   - Raw output evidence:
      ```
      6105:    'the committed brief carries a real decision-attention/v1 tier to rank,
               every item in a declared decision window (' + (Array.isArray(committedTier)
               ? committedTier.length : 0) + ' item(s))');
      6133:    'every committed attention item is live and publishes under the default
               card ceiling (' + uncapped.published.length + ' of ' + uncapped.cap + ')');
      6137:    'the card ceiling really bites and suppresses the ranked tail rather than
               dropping it (' + capped.published.length + ' published, ' +
               capped.suppressed.length + ' suppressed)');

      HEAD~1   selftest.mjs:6105 predicate => FAIL | items: 5 | carrying contractVersion: 0 | in a declared window: 0
      HEAD     selftest.mjs:6105 predicate => PASS | items: 3 | carrying contractVersion: 3 | in a declared window: 3
      ```
     The guard reads the real committed artifact rather than a fixture, so a regenerated
     legacy-shape payload is checked as-published.
   - **Claim Source:** executed

- [x] Post-fix suite PASSES at HEAD on a clean tree
   - Raw output evidence:
      ```
        ✓ the committed dependency-gate projection matches its source specs — a stale projection misreports delivery
        ✓ the projected site ships the dependency-gate projection, so gates resolve identically on Pages
        ✓ every declared dependency gate is represented in the projection
        ✓ the public gate projection carries only the fields the runtime predicate reads
        ✓ the browser resolves gates from the public projection and never fetches a governance statePath
        ✓ the statePath-fetch check is non-vacuous — it still matches the regressed shape
        ✓ no registered page fetches a root-absolute asset path — it loses the repo segment on project Pages
        ✓ the root-absolute asset detector still matches the regressed shape
        ✓ the workflow checks detect a reduced browser gate and a repo-root deployment
        ✓ the scan matched at least one tests/*.mjs reference against a present baseline (11587 reference(s) across 482 artifact(s), baseline 86 entries)
        ✓ no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline (0 new, 86 known-missing, 0 stale of 218 referenced)

      ================================================
      Research-Lab self-test: 1370 passed, 0 failed
      ================================================
      SELFTEST_EXIT=0
      ```
     **Scoped claim.** This measurement was taken at clean `HEAD` before a concurrent writer
     modified the tree at 16:16–16:17 UTC. It is true of the revision measured and must not
     be read as the state of the tree now. Current state is recorded in UD-4 and OBS-007-04.
   - **Claim Source:** executed

- [x] The failures existed at a committed revision, not in local edits
   - Raw output evidence:
      ```
      GIT_STATUS_EXIT=0 (empty above == clean tree)
      HEAD=aeb1bcbc3373cc90cc846fc4bfb577dd9f75c927 2026-08-10 14:13:48 +0000 FR-018: an attention item deep-links to its owning tool, checked against the registry

      <repo-root>  aeb1bcbc3 [main]
      === tree clean? ===
      (empty above == clean)
      === existing bug folders ===
      BUG-001-central-provider-credential-security
      BUG-002-market-brief-session-date-drift
      BUG-002-two-tier-provider-access
      BUG-003-bond-regime-simple-power-model-digest-divergence
      BUG-004-proxy-route-local-key-fallback
      BUG-005-g087-planning-packet-linkage-unsatisfiable-in-place-delivery
      BUG-006-evaluate-before-publish-and-unscoreable-call-published
      ```
   - **Claim Source:** executed

- [x] The durable control against 4×/day regeneration is on the publish path, not in the bytes
   - Raw output evidence:
      ```
      370-    # That only holds if the composer actually runs on the publication path.
      371:    # build-attention-items.mjs --recompose --write is that step, and it sits
      372-    # BETWEEN the lane and the gate on purpose:
      373-    #   lane (judgement) -> composer (envelope) -> validator (refusal)
      374-    # It is additive-or-nothing (it refuses to write if a pre-existing payload
      375-    # key would be lost) and it exits 0 even when it refuses a candidate, since
      376-    # refusing one is a correct outcome, not a run failure. A genuine build
      377-    # error exits non-zero and the && chain fails the attempt, which retries.
      385-          "$NODE_BIN" scripts/brief-narrative-parallel.mjs \
      386:       && "$NODE_BIN" scripts/build-attention-items.mjs --recompose --write \
      387-       && "$NODE_BIN" scripts/validate-brief-payload.mjs "$PAYLOAD" --drop-unscoreable; then

      125-    3b. **recomposes the decision-attention set from the authored judgement**, via
      126:      `scripts/build-attention-items.mjs --recompose --write`, after the lanes have
            written the payload and *before* the payload gate runs.
      ```
   - **Claim Source:** executed

- [x] The page-projection failure family was classified by measurement, not assumption
   - Raw output evidence:
      ```
      38:      attention: payload.attention,

      HEAD page.json attention: 3 item(s)
        item[0] keys: rank, domain, horizon, title, structuralAnchor, what, why, confidence,
        deepLink, contractVersion, id, gateId, subject, disposition, severity, imminence,
        headline, rationale, verb, invalidation, escalationTrigger, expiry, decisionWindow,
        windowBoundaryUtc, windowTradingDate, windowResolvedFrom, transmissionPath,
        transmissionAbsenceNote, marketConfirmation, marketConfirmationNote, figures,
        observedAt, state, supersededBy, lifecycle
      HEAD~1 page.json attention: 3 item(s)
      page.json byte-identical HEAD vs HEAD~1: true

      aeb1bcbc3 FR-018: an attention item deep-links to its owning tool, checked against the registry
       market-brief.payload.json                          | 288 ++++++++++++++++++---
       rlattention.js                                     |  22 +-
       scripts/build-attention-items.mjs                  |  41 ++-
       .../report.md                                      |  53 ++++
       tests/rlattention.test.mjs                         |  44 ++++
       5 files changed, 405 insertions(+), 43 deletions(-)
      ```
     `market-brief.page.json` is absent from the fix commit's file list yet its assertion
     turned green, so the failure was consequent on the payload, not independent.
   - **Claim Source:** executed

- [x] Bug status recorded in `bug.md`
   - Raw output evidence:
      ```
      bug.md §7 "Current State At HEAD" records: not reproducible; suite 1370 passed,
      0 failed; closure attributed to commit aeb1bcbc3 with its measured file list.
      ```
   - **Claim Source:** executed

### Uncertainty Declarations

**UD-1 — Suites not executed in this session.** `tests/attention-payload-contract.test.mjs`,
`tests/rlattention.test.mjs` and the Playwright suite `tests/attention-browser.spec.mjs`
were **not** run. They are named in this packet only as surfaces that also cover the
contract. No claim is made about their current pass state.

**UD-2 — The fix was not authored here.** The repair landed in commit `aeb1bcbc3` before this
packet existed. This scope verified closure; it did not implement it. No claim of authorship
is made, and the DoD items above are worded as verification, not as delivery.

**UD-3 — Regeneration was not exercised end to end.** The composer's presence on the publish
path was established by reading `scripts/brief-refresh-and-push.sh` and the runbook. A live
publication run was **not** executed, so the claim is that the step is wired, not that a
fresh scheduled run was observed producing a conformant payload.

**UD-4 — The tree is no longer clean and the suite is no longer green.** A concurrent writer
modified `market-brief.payload.json` and `tests/attention-payload-contract.test.mjs` after
every measurement above was taken. The suite now returns `1369 passed, 1 failed`, exit 1, on
`market-brief.page.json is byte-current with its full source artifacts`. The cause is the
concurrent `backdrop` edit, not BUG-007: a read-only rebuild comparison shows `attention` is
byte-current and only `backdrop` differs. Nothing was repaired, because the edit belongs to
another session in flight. Recorded as OBS-007-04.

---

## Scope 2: Residual Observations

**Status:** [ ] Not started — owner decision required, no work claimed

These are recorded so they are not lost. None was fixed and none is claimed closed.

- [ ] **OBS-007-01** — `market-brief.snapshot.json` carries no `attention` key while the
      payload carries three items. Measured (`snapshot.attention: undefined`). Whether this
      divergence is a defect or correct by design was **not** established; the page
      projection reads the payload with no snapshot fallback. Owner: spec 017.
      - **Claim Source:** not-run — the question was posed, not answered.

- [ ] **OBS-007-02** — `scripts/build-attention-items.mjs` exits 0 when it refuses a
      candidate, which is correct per its design, but a run refusing *every* candidate would
      also exit 0. The scope for that step declares "zero published with zero recorded
      exclusions is a failure"; whether that condition is enforced mechanically anywhere on
      the publish path was **not** verified. Owner: spec 017.
      - **Claim Source:** not-run.

- [ ] **OBS-007-03** — `specs/017-decision-attention-and-developing-situations/state.json` is
      `in_progress` under a certification refusal naming four surviving blockers. None is
      this defect. This bug asserts nothing about that spec's certification.
      - **Claim Source:** interpreted — read from that spec's `state.json`, not re-measured.

- [ ] **OBS-007-04** — A concurrent writer left the tree dirty and the suite red at
      `1369 passed, 1 failed`, exit 1, on the byte-currency assertion. Isolated read-only to
      the `backdrop` key from an added `globalBackdrop` entry; `attention` is byte-current,
      so BUG-007 has not regressed. Not repaired here: rebuilding the projection would
      commit another session's uncommitted narrative work. Owner: the concurrent session.
      - **Claim Source:** executed — the failure and its isolation were both measured.
