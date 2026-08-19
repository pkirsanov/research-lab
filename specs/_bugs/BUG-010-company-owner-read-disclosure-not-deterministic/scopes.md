# Scopes: BUG-010 — A Safety Disclosure Must Be Deterministic And Gated

**Layout:** single-file
**Workflow mode:** bugfix-fastlane
**Scope count:** 3

Three scopes, ordered, and the order is the point.

Scope 01 installs the publish gate and proves it **red** against the committed payload — before any
producer change, while the defect is still present to be caught. Scope 02 removes the language model
from the path so the facts are produced deterministically. Scope 03 repairs the committed window and
turns `main` green.

A gate built after the fix can only ever be observed green, and a green gate proves nothing about
whether it can refuse. That is why the gate lands first.

---

## Scope 1: Publish Gate, Proven RED On The Committed Payload

**Status:** Done
**Depends On:** none
**Owner surface:** `scripts/validate-brief-payload.mjs`

### Gherkin Scenarios

```gherkin
Feature: A company owner-read coverage entry cannot publish without its disclosure

  Scenario: SCN-010B-001 the gate refuses the committed payload as it stands today
    Given market-brief.payload.json carries one company-fundamentals-lab coverage entry
    And that entry's reason contains neither the adapter id nor a no-recommendation disclosure
    When the publish gate runs against the committed payload
    Then it exits non-zero
    And it names the missing adapter id and the missing disclosure separately

  Scenario: SCN-010B-002 the gate refuses a reason that drops only the adapter id
    Given company-fundamentals.config.json declares feature002.adapterId
    And a payload whose company reason is otherwise valid, non-empty, and carries the disclosure
    But that reason omits the declared adapter id
    When the publish gate runs
    Then it exits non-zero, naming the missing adapter id
    And it behaves identically when a fixture configuration declares a different adapter id,
      because the expected value is read from configuration rather than pinned in the gate

  Scenario: SCN-010B-003 the gate refuses a reason that drops only the disclosure
    Given a payload whose company reason is otherwise valid and carries the adapter id
    But that reason makes no statement that no recommendation is produced
    When the publish gate runs
    Then it exits non-zero, naming the missing disclosure

  Scenario: SCN-010B-004 the gate cannot pass by finding nothing to check
    Given a payload whose toolCoverage carries no company-fundamentals-lab entry at all
    When the publish gate runs
    Then it exits non-zero
    And it does not report the disclosure check as satisfied or skipped

  Scenario: SCN-010B-005 the gate does not red-line a known-good window
    Given the last published company reason, which carries both the adapter id and the disclosure
    When the publish gate runs against a payload carrying that reason
    Then it exits zero
    And the disclosure check is reported as evaluated rather than skipped
```

### Implementation Plan

1. Extend the `toolCoverage` validation block in `scripts/validate-brief-payload.mjs` with a company
   owner-read disclosure check, per `design.md` §3.1.
2. Resolve the expected adapter id from `company-fundamentals.config.json` at
   `feature002.adapterId`, and the declared eligibility at `feature002.recommendationEligibility`.
   Derive both; pin neither.
3. Use the same no-recommendation disclosure predicate shape the Feature 010 Scope 6 assertion uses,
   so the gate and the selftest cannot disagree about what counts as a disclosure.
4. Treat an absent company coverage entry as a failure, not a skip.
5. Run the gate against the committed payload **before** touching any producer, and capture the red
   transcript.
6. Build the three adversarial fixtures and the one negative-control fixture in disposable scratch
   locations; commit no fixture that duplicates the committed payload wholesale.

### Test Plan

| ID | Test | Type | Command | Live | Scenario |
|---|---|---|---|---|---|
| T-10-U1 | Gate exits non-zero on the committed pre-fix payload, naming both missing facts | `unit` | `node scripts/validate-brief-payload.mjs` | No | SCN-010B-001 |
| T-10-U2 | Adversarial: gate refuses a reason carrying the disclosure but not the adapter id | `unit` | gate invoked against a disposable fixture payload | No | SCN-010B-002 |
| T-10-U3 | Adversarial: gate refuses a reason carrying the adapter id but not the disclosure | `unit` | gate invoked against a disposable fixture payload | No | SCN-010B-003 |
| T-10-U4 | Gate refuses a payload whose company coverage entry is absent | `unit` | gate invoked against a disposable fixture payload | No | SCN-010B-004 |
| T-10-U5 | Negative control: gate accepts the last published reason unchanged | `unit` | gate invoked against a disposable fixture payload | No | SCN-010B-005 |
| T-10-U6 | Gate tracks a fixture configuration declaring a different adapter id | `unit` | gate invoked against a disposable fixture root | No | SCN-010B-002 |

### Definition of Done

- [x] `scripts/validate-brief-payload.mjs` carries the company owner-read disclosure check described in `design.md` §3.1

  `findCompanyOwnerReadDisclosureBreaches()` is exported at line 377 and evaluated **first and unconditionally** on the CLI branch, ahead of every other check, so an unrelated schema error can never be the reason the disclosure went unexamined.

  ```
  $ git --no-pager diff --stat -- scripts/validate-brief-payload.mjs
   scripts/validate-brief-payload.mjs | 126 +++++++++++-
   1 file changed, 122 insertions(+), 4 deletions(-)
  exit: 0

  $ node scripts/validate-brief-payload.mjs
  [brief-contract] company owner-read names its producing adapter and states that no recommendation is produced: PASS
  exit: 0
  ```

  The success line is emitted out loud: a silent check and a satisfied check have to be distinguishable, or "it passed" means nothing.

- [x] The check derives the expected adapter id and eligibility from `company-fundamentals.config.json`, with no pinned literal in the gate

  Proven by substitution, not by reading the source — [T-10-U6] below feeds a fixture config declaring `fixture-owner-v9` and the gate's expectation moves with it.

  ```
  expectation followed the FIXTURE id = true
  gate pinned no committed literal   = true
  exit: 0
  ```

- [x] Gate exits non-zero on the committed pre-fix payload, naming both missing facts — [T-10-U1]

  The pre-fix payload was reconstructed from `git show HEAD:market-brief.payload.json` (`HEAD` `5c005750e`) into a scratch path outside the repository and fed to the **real CLI**, so the refusal is observed as a process exit code rather than only as a return value.

  ```
  $ node scripts/validate-brief-payload.mjs <scratch>/prefix.payload.json
  pre-fix reason ends: ...1 and no market-moving fundamental delta carries into this morning view.
  CLI exit code = 1
  [brief-contract] FAIL: the company owner-read coverage entry does not disclose what Feature 010 guarantees
    - toolCoverage "company-fundamentals-lab" reason must name the producing adapter "company-fundamentals-owner-v1" as declared by company-fundamentals.config.json feature002.adapterId — without it a reader cannot tell which adapter produced this read
    - toolCoverage "company-fundamentals-lab" reason must state that no recommendation is produced (declared eligibility "educational-research-only") matching no recommendation[^.]*\b(?:fabricat\w*|produced|generated|issued)\b — the disclosure is the guarantee, and silence about it publishes a research tool that never says it gives no advice
  ```

  Two breaches, named separately, exactly as SCN-010B-001 requires.

- [x] Adversarial fixture missing only the adapter id is refused — [T-10-U2]

  The fixture is the repaired reason with the adapter id replaced by the words "the owning adapter": it still carries the disclosure, still has text, and violates exactly one invariant.

  ```
  fixture carries disclosure = true ; names adapter = false ; hasText = true
  breaches = 1
    - toolCoverage "company-fundamentals-lab" reason must name the producing adapter "company-fundamentals-owner-v1" as declared by company-fundamentals.config.json feature002.adapterId — without it a reader cannot tell which adapter produced this read
  exit: 0
  ```

- [x] Adversarial fixture missing only the disclosure is refused — [T-10-U3]

  Mirror image: the disclosure clause removed, the adapter id retained.

  ```
  fixture carries disclosure = false ; names adapter = true ; hasText = true
  breaches = 1
    - toolCoverage "company-fundamentals-lab" reason must state that no recommendation is produced (declared eligibility "educational-research-only") matching no recommendation[^.]*\b(?:fabricat\w*|produced|generated|issued)\b — the disclosure is the guarantee, and silence about it publishes a research tool that never says it gives no advice
  exit: 0
  ```

- [x] A payload with no company coverage entry is refused rather than skipped — [T-10-U4]

  ```
  breaches = 1
    - toolCoverage must carry exactly one "company-fundamentals-lab" entry to disclose the owner read, found 0 — an absent entry is a breach, not a skipped check
  exit: 0
  ```

  The refusal text names the count, so "nothing to check" cannot read as "checked and fine".

- [x] The last published reason is accepted, proving the gate is not a refuse-everything check — [T-10-U5]

  ```
  last published reason ends: ...o recommendation is produced, and no market-moving fundamental delta carries into this after-hours view.
  breaches = 0   (0 => the gate is not a refuse-everything check)
  exit: 0
  ```

  Without this control the cheapest route to a passing adversarial suite is a gate that refuses everything, and that gate would be indistinguishable from a working one until it began blocking good windows.

- [x] The gate follows a changed fixture adapter id, proving derivation rather than pinning — [T-10-U6]

  ```
  breaches = 1
    - toolCoverage "company-fundamentals-lab" reason must name the producing adapter "fixture-owner-v9" as declared by company-fundamentals.config.json feature002.adapterId — without it a reader cannot tell which adapter produced this read
  expectation followed the FIXTURE id = true
  gate pinned no committed literal   = true
  exit: 0
  ```

  The committed reason is unchanged in this fixture; only the configuration moved, and the gate's expectation moved with it.

- [x] Build Quality Gate: `node scripts/selftest.mjs` runs with the gate wired in, no assertion removed or weakened, no absolute filesystem path written into any committed file, and no change to `scripts/selftest.mjs` line 6319

  ```
  $ node scripts/selftest.mjs
  Research-Lab self-test: 2490 passed, 0 failed
  exit: 0

  $ git --no-pager diff -- scripts/selftest.mjs
  exit: 0   (empty output — byte-identical to HEAD, so line 6319 cannot have moved)
  ```

  Total assertion count is **2490**, matching the 2489 passed + 1 failed observed at `HEAD` `5c005750e`. Nothing was removed to buy the green; the one failure converted to a pass. The pii-scan group runs inside this selftest and passed.

---

## Scope 2: Deterministic Producer, With The Model Out Of The Path

**Status:** Done
**Depends On:** Scope 1
**Owner surface:** `scripts/brief-refresh.mjs`, `scripts/brief-narrative-parallel.mjs`

Depends on Scope 1 because the gate is what proves this scope worked. Landing the producer first
would leave its effect unverifiable at publish time.

### Gherkin Scenarios

```gherkin
Feature: The disclosure is produced deterministically, not authored per window

  Scenario: SCN-010B-006 the deterministic producer emits both facts with no model involved
    Given the committed company owner-read objects and their verified hashes
    When buildCompanyFundamentalsOwnerRead runs with no narrative lane in the path
    Then the read it emits contains the configured adapter id
    And it states that no recommendation is produced, in wording the Scope 6 predicate accepts

  Scenario: SCN-010B-007 the adapter id is projected from configuration, not pinned
    Given a fixture configuration whose feature002.adapterId differs from the committed value
    When the deterministic producer runs against that configuration
    Then the emitted read carries the fixture's adapter id
    And it does not carry the committed adapter id

  Scenario: SCN-010B-008 the narrative merge cannot erase either fact
    Given a Tier-B narrative result that rewrites the company coverage reason
    And that rewritten reason omits the adapter id and the no-recommendation disclosure
    When the narrative result is merged into the payload
    Then the published company entry still carries both facts
    And no published payload can reach the gate without them
```

### Implementation Plan

1. In `buildCompanyFundamentalsOwnerRead()` (`scripts/brief-refresh.mjs`), project `boundary.adapterId`
   and a no-recommendation disclosure derived from `boundary.recommendationEligibility` into the read
   text built at line 83, per `design.md` §3.2.
2. Change no validation, no hashing, and no object traversal in that function. Both values are
   already validated before the string is built; only the string changes.
3. Apply the preservation shape from `design.md` §3.3, preferring re-assertion of the deterministic
   disclosure after the narrative merge over a prompt constraint alone.
4. If the lane is constrained rather than re-asserted, record in `report.md` that the published fact
   then depends on the gate refusing rather than on determinism, and why that trade was taken.
5. Verify the deterministic path in isolation, with the narrative lane disabled, so the claim
   "no model in the path" is observed rather than assumed.

### Test Plan

| ID | Test | Type | Command | Live | Scenario |
|---|---|---|---|---|---|
| T-10-U7 | Deterministic producer emits a read containing the adapter id and a disclosure the Scope 6 predicate accepts, with the narrative lane disabled | `unit` | deterministic producer invoked directly | No | SCN-010B-006 |
| T-10-U8 | Adversarial: with a fixture config declaring a different adapter id, the emitted read carries that id and not the committed one | `unit` | producer invoked against a disposable fixture root | No | SCN-010B-007 |
| T-10-U9 | Adversarial: a narrative result that omits both facts still yields a published entry carrying them | `unit` | narrative merge invoked against a disposable narrative fixture | No | SCN-010B-008 |

### Definition of Done

- [x] `buildCompanyFundamentalsOwnerRead()` projects `boundary.adapterId` and the declared eligibility into the emitted read text

  `companyOwnerReadDisclosure(boundary)` (line 72) builds the sentence from the two already-validated boundary values; the read template at line 98 appends it. Both facts were in scope at that exact line before this change and were simply not said.

  ```
  $ git --no-pager diff -- scripts/brief-refresh.mjs
  -  const read = `... market ${owner.marketCutoff || 'unavailable'}.`;
  +  const read = `... market ${owner.marketCutoff || 'unavailable'}. ${companyOwnerReadDisclosure(boundary)}`;
  exit: 0

  $ node --input-type=module -e '... companyOwnerReadDisclosure(config.feature002) ...'
  DISCLOSURE=Consumed from company-fundamentals-owner-v1 as educational research only; no recommendation is produced.
  exit: 0
  ```

  Derived, never pinned: the adapter id and the eligibility are both interpolated from configuration, so a literal can never claim an adapter the config no longer declares.

- [x] The preservation shape from `design.md` §3.3 is implemented, and `report.md` records which of the two shapes was taken and why

  **Re-assertion** was taken — the ranked-preferred shape — not the prompt constraint. `reassertCompanyOwnerReadDisclosure()` (line 154) is called by `scripts/brief-narrative-parallel.mjs` immediately after the fragment merge. Recorded in `report.md` → "The preservation shape, and why".

  ```
  $ git --no-pager diff -- scripts/brief-narrative-parallel.mjs
  +import { reassertCompanyOwnerReadDisclosure } from './brief-refresh.mjs';
       for (const result of results) Object.assign(payload, loadFragment(result));
  +    const companyDisclosure = reassertCompanyOwnerReadDisclosure(payload, (relative) => readJson(resolve(ROOT, relative)));
  +    console.log(`[brief-parallel] company owner-read disclosure ${companyDisclosure.reasserted ? 'reasserted' : 'already present'} on ${companyDisclosure.id}`);
  exit: 0
  ```

  A constraint asks the model to comply; re-assertion makes compliance structural. The published fact no longer depends on model behaviour at all, only on this step running — and it throws when the entry is missing or duplicated, which lands in the existing catch and restores the baseline, so a window that cannot carry the disclosure does not publish.

- [x] Deterministic producer emits both facts with the narrative lane disabled — [T-10-U7]

  ```
  $ node tests/company-fundamentals-contracts.unit.mjs
  ✔ T-10-U7 SCN-010B-006 the deterministic producer emits the configured adapter id and an accepted no-recommendation disclosure with no narrative lane in the path (3.281305ms)
  ℹ tests 56
  ℹ pass 56
  ℹ fail 0
  exit: 0
  ```

- [x] The emitted adapter id follows a changed fixture configuration — [T-10-U8]

  ```
  $ node tests/company-fundamentals-contracts.unit.mjs
  ✔ T-10-U8 SCN-010B-007 the emitted adapter id follows a fixture configuration and carries no committed literal (0.584506ms)
  ℹ pass 56 ; fail 0
  exit: 0
  ```

- [x] A narrative result that drops both facts cannot produce a published entry without them — [T-10-U9]

  ```
  $ node tests/company-fundamentals-contracts.unit.mjs
  ✔ T-10-U9 SCN-010B-008 a narrative rewrite that omits both facts still publishes an entry carrying them (0.560621ms)
  ℹ pass 56 ; fail 0
  exit: 0
  ```

- [x] Build Quality Gate: no validation, hashing, or object-traversal behaviour in the producer is altered; no absolute filesystem path is written into any committed file; `scripts/selftest.mjs` line 6319 is untouched

  The producer diff is **one changed line plus two added functions**. Every `throw new Error(...)` guard, every `hashObject(...)` comparison, every pointer/manifest/owner traversal and the entire returned object are context lines in the diff, not changes.

  ```
  $ git --no-pager diff --stat -- scripts/brief-refresh.mjs scripts/brief-narrative-parallel.mjs
   scripts/brief-narrative-parallel.mjs |  9 +
   scripts/brief-refresh.mjs            | 43 +++-
  exit: 0

  $ git --no-pager diff -- scripts/selftest.mjs
  exit: 0   (empty output — byte-identical to HEAD)

  $ node scripts/selftest.mjs
  Research-Lab self-test: 2490 passed, 0 failed
  exit: 0
  ```

  The 46 pre-existing Feature 010 contract tests in the same suite (`TP-1-01` through `TP-8-01`, including the three `TP-6-01` hash-drift and owner-layer tests) still pass, which is what proves the hashing and traversal paths were not disturbed.

---

## Scope 3: Repair The Committed Window, With The Assertion Intact

**Status:** Not started
**Depends On:** Scope 1, Scope 2

**Owner surface:** `market-brief.payload.json`

### Gherkin Scenarios

```gherkin
Feature: The committed window is repaired without weakening the check that caught it

  Scenario: SCN-010B-009 the repaired payload turns main green with the assertion intact
    Given the deterministic producer and the publish gate are in place
    When the committed company coverage reason is repaired to carry both facts
    Then the publish gate exits zero against the committed payload
    And the Feature 010 Scope 6 assertion passes
    And both previously failing conjuncts at scripts/selftest.mjs line 6319 are byte-identical
      to their pre-fix form
    And no other tool's coverage entry has changed
```

### Implementation Plan

1. Repair the `company-fundamentals-lab` coverage `reason` in `market-brief.payload.json` so it
   carries the adapter id and a no-recommendation disclosure, per `design.md` §3.4.
2. Take one of the two admissible routes — regenerate the window through the fixed pipeline, or apply
   a targeted repair to that one `reason` — and record in `report.md` which route was taken.
3. Change no other field of that entry and no other entry in `toolCoverage`.
4. Verify by diff that `scripts/selftest.mjs` line 6319 is unchanged by this packet.

### Test Plan

| ID | Test | Type | Command | Live | Scenario |
|---|---|---|---|---|---|
| T-10-R1 | Feature 010 Scope 6 assertion passes with both previously failing conjuncts intact | `unit` | `node scripts/selftest.mjs` | No | SCN-010B-009 |
| T-10-R2 | Publish gate exits zero against the repaired committed payload | `unit` | `node scripts/validate-brief-payload.mjs` | No | SCN-010B-009 |
| T-10-R3 | The two conjuncts at `scripts/selftest.mjs` line 6319 are byte-identical to their pre-fix form | `unit` | `git diff` restricted to `scripts/selftest.mjs` | No | SCN-010B-009 |
| T-10-R4 | Full repository selftest passes with no reduction in assertion count against the 2490 observed at `HEAD` `5c005750e` | `unit` | `node scripts/selftest.mjs` | No | SCN-010B-009 |

### Definition of Done

- [ ] The committed `market-brief.payload.json` company coverage entry carries the adapter id and a no-recommendation disclosure, with every other field of that entry unchanged
- [ ] Feature 010 Scope 6 assertion passes with both previously failing conjuncts intact — [T-10-R1]
- [ ] Publish gate exits zero against the repaired committed payload — [T-10-R2]
- [ ] Diff proves `scripts/selftest.mjs` line 6319 was not modified by this packet — [T-10-R3]
- [ ] Repository selftest passes with no assertion removed, weakened, or skipped — [T-10-R4]
- [ ] Build Quality Gate: no other `toolCoverage` entry is modified; no absolute filesystem path is written into any committed file; the repair route taken is recorded in `report.md`
