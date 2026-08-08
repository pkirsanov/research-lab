# Feature 017 Execution Report

This report is a structural template created during planning. It records no results yet. Every section below is an empty anchor that an execution agent fills with raw terminal output captured in the session that produced it. Nothing in this file may be written from expectation, inference, or summary; each anchor stays empty until a real command has run and its unedited output has been pasted under that anchor.

## Summary

_Awaiting execution. No evidence recorded yet._

## Completion Statement

_Awaiting execution. No scope is complete._

## Decision Record

Four decisions changed the shape of this feature. Each is recorded where it was
taken; this is the index.

| Decision | What changed | Why |
|----------|--------------|-----|
| **F-017-06 — route the lane through the composer** | The authoring lane authors JUDGEMENT only; the envelope is composed at publish time by `scripts/build-attention-items.mjs`. | Three consecutive crons published zero conforming items while enforcement was fully intact. A prose instruction to a language model is advisory; a lane that no longer emits the envelope cannot emit a bad one. |
| **Both sides of the interruption rate** | `computeInterruptionRate` publishes `warrantedShare` AND `expiredWithoutEffectShare`, withheld together below the minimum sample. | Publishing the hit side without its complement is exactly the asymmetry P4/BI-5 forbids. The fields were added rather than the DoD renamed. |
| **Refusals name the item, not the slot** | `attentionItemLabel()` puts the item's id and subject between the slot index and the field. | An index moves the moment the list is re-ranked, so a slot-only refusal is unactionable by the time anyone reads it. |
| **Byte-identity narrowed to what a scope can own** | Each scope asserts that IT modified no excluded path, and that paths it protects from ANOTHER owner are byte-identical. | The blanket form is unsatisfiable while sibling scopes inside one feature legitimately modify paths on each other's excluded lists. Scope isolation forbids reaching outside your own paths; it does not freeze the feature around you. |

## Code Diff Evidence

### Code Diff Evidence — spec 017 runtime delta

**Claim Source:** executed.

```text
$ git --no-pager diff --stat c0c7d34c..HEAD -- rlattention.js \
    scripts/build-attention-items.mjs scripts/validate-brief-payload.mjs \
    scripts/brief-narrative-parallel.mjs scripts/brief-refresh-and-push.sh \
    scripts/selftest.mjs market-brief.html tests/rlattention.test.mjs \
    tests/attention-payload-contract.test.mjs tests/attention-browser.spec.mjs \
    tests/brief-refresh-atomicity.support.mjs notes/decision-attention.md \
    notes/market-brief.md
 market-brief.html                         |  557 ++++++-
 notes/decision-attention.md               |  395 +++++
 notes/market-brief.md                     |   22 +
 rlattention.js                            |  916 +++++++++++
 scripts/brief-narrative-parallel.mjs      |    9 +-
 scripts/brief-refresh-and-push.sh         |   18 +
 scripts/build-attention-items.mjs         |  281 ++++
 scripts/selftest.mjs                      |  199 ++-
 scripts/validate-brief-payload.mjs        |  129 +-
 tests/attention-browser.spec.mjs          | 1203 ++++++++++++++
 tests/attention-payload-contract.test.mjs | 2430 +++++++++++++++++++++++++++++
 tests/brief-refresh-atomicity.support.mjs |   59 +-
 tests/rlattention.test.mjs                | 1076 +++++++++++++
 13 files changed, 7262 insertions(+), 32 deletions(-)
```

Three numbers in that table carry the argument.

**`rlattention.js` +916 against `scripts/validate-brief-payload.mjs` +129.** The
capability module is where the rules live; the gate is thin because it `require`s
the module and calls it. Had the gate restated the rules, the two files would be
comparable in size and would drift the first time either changed.

**`scripts/brief-refresh-and-push.sh` +18.** The smallest diff in the set and the
one without which none of the rest is load-bearing. It is the line that makes the
composer run on the publication path. Before it, `build-attention-items.mjs` was
written, tested and registered with the selftest while nothing invoked it — an
orphaned build step, which is a file rather than a guarantee.

**Tests +4709 against implementation +2013.** Roughly 2.3 lines of test per line
of implementation. That ratio is not padding: the module's contract is almost
entirely about what it REFUSES, and every refusal code needs a scenario that
proves the refusal fires and an adversarial twin that proves the guard can fail.

Only 32 lines were deleted across the whole delivery, and `git diff --numstat`
over the six scope artifacts reports 0 deletions — this feature was built
additively on top of the existing brief rather than by rewriting it.

## Test Evidence

### Scope 1 — Attention Capability Module And Item Contract

**TP-01-01**

_Awaiting execution. No evidence recorded yet._

**TP-01-02**

_Awaiting execution. No evidence recorded yet._

**TP-01-03**

_Awaiting execution. No evidence recorded yet._

**TP-01-04**

_Awaiting execution. No evidence recorded yet._

**TP-01-05**

_Awaiting execution. No evidence recorded yet._

**TP-01-06**

_Awaiting execution. No evidence recorded yet._

**TP-01-07**

_Awaiting execution. No evidence recorded yet._

**TP-01-08**

_Awaiting execution. No evidence recorded yet._

**TP-01-09**

_Awaiting execution. No evidence recorded yet._

**TP-01-10**

_Awaiting execution. No evidence recorded yet._

**TP-01-11**

_Awaiting execution. No evidence recorded yet._

**TP-01-12**

_Awaiting execution. No evidence recorded yet._

**TP-01-13**

_Awaiting execution. No evidence recorded yet._

**TP-01-14**

_Awaiting execution. No evidence recorded yet._

**TP-01-15**

_Awaiting execution. No evidence recorded yet._

**TP-01-16**

_Awaiting execution. No evidence recorded yet._

**TP-01-17**

_Awaiting execution. No evidence recorded yet._

**TP-01-18**

_Awaiting execution. No evidence recorded yet._

**TP-01-19**

_Awaiting execution. No evidence recorded yet._

**TP-01-20**

_Awaiting execution. No evidence recorded yet._

**TP-01-21**

_Awaiting execution. No evidence recorded yet._

**TP-01-22**

_Awaiting execution. No evidence recorded yet._

**TP-01-23**

_Awaiting execution. No evidence recorded yet._

**TP-01-24**

_Awaiting execution. No evidence recorded yet._

**TP-01-25**

_Awaiting execution. No evidence recorded yet._

### Scope 2 — Publication-Path Enforcement

**TP-02-01**

_Awaiting execution. No evidence recorded yet._

**TP-02-02**

_Awaiting execution. No evidence recorded yet._

**TP-02-03**

_Awaiting execution. No evidence recorded yet._

### Scope 3 — Brief Tier Render

**TP-03-01**

_Awaiting execution. No evidence recorded yet._

**TP-03-02**

_Awaiting execution. No evidence recorded yet._

**TP-03-03**

_Awaiting execution. No evidence recorded yet._

**TP-03-04**

_Awaiting execution. No evidence recorded yet._

**TP-03-05**

_Awaiting execution. No evidence recorded yet._

### Scope 4 — Outcome Record And Interruption Rate

**TP-04-01**

_Awaiting execution. No evidence recorded yet._

**TP-04-02**

_Awaiting execution. No evidence recorded yet._

**TP-04-03**

_Awaiting execution. No evidence recorded yet._

**TP-04-04**

_Awaiting execution. No evidence recorded yet._

**TP-04-05**

_Awaiting execution. No evidence recorded yet._

**TP-04-06**

_Awaiting execution. No evidence recorded yet._

**TP-04-07**

_Awaiting execution. No evidence recorded yet._

### Scope 5 — Legacy Feed Reconciliation And Acceptance

**TP-05-01**

_Awaiting execution. No evidence recorded yet._

**TP-05-02**

_Awaiting execution. No evidence recorded yet._

**TP-05-03**

_Awaiting execution. No evidence recorded yet._

**TP-05-04**

_Awaiting execution. No evidence recorded yet._

**TP-05-05**

_Awaiting execution. No evidence recorded yet._

## Uncertainty Declarations

_Awaiting execution. No evidence recorded yet._

## Scenario Contract Evidence

_Awaiting execution. No evidence recorded yet._

## Coverage Report

_Awaiting execution. No evidence recorded yet._

## Lint/Quality

_Awaiting execution. No evidence recorded yet._

## Validation Summary

_Awaiting execution. No evidence recorded yet._

## Audit Verdict

_Awaiting execution. No evidence recorded yet._

## Open Findings

This section is created during Scope 3. It is the first finding ledger in this
feature directory: F-017-01 through F-017-03 are referenced by identifier in the
execution sessions but have no recorded entry here, so the numbering below is
inherited from those sessions rather than continued from a ledger.

### F-017-04 — Rank rationale renders a vacuous self-comparison when two items share a subject

**Status:** Open · **Severity:** reader-facing correctness, not a crash ·
**Found during:** Scope 3 (`03-brief-tier-render`), reading the rendered page ·
**Owner:** `bubbles.design` for the rule, then `bubbles.plan` for the scope and
Test Plan row.

**Observed.** Verbatim from the rendered page during the Scope 3 run:

```text
QQQ is placed above QQQ because its effect is already arriving and a transmission channel is identified, while for QQQ its effect is already arriving and a transmission channel is identified.
```

**Why it is a defect.** The sentence compares an item to another item with the
same subject and gives identical reasoning on both sides, so it explains nothing.
A reader sees broken copy. It is literally true and completely useless, which is
worse than silence, because it spends the reader's trust to deliver no
information. The ranking rationale exists to tell a reader why one item outranks
another; here it asserts that `QQQ` outranks `QQQ` for reasons that are word-for-word
the same on both sides of the comparison.

**How it arose.** The migrated payload legitimately carries `QQQ` for two distinct
items. Read-only confirmation from the committed payload:

```text
$ python3 -c "import json; ..." market-brief.payload.json
items: 5
0 'QQQ' | Dealers flipped to negative gamma into the close while bread
1 'XLK' | XLK holds the clean into leg while XLI stays out and breadth
2 'QQQ' | The growth add-gate stays closed: QQQ holds only +0.21% over
3 'MSFT' | MSFT extended its post-print gap to +22.75% over its 50-day
4 'GLD' | Gold is still no clean haven at score 28.7 while copper lead
```

Item 0 is about 0-DTE dealer positioning and item 2 is about the breadth
add-gate. They are different situations that happen to share a ticker.
`validateAttentionItem` imposes no subject-uniqueness rule, so both items are
valid and correctly admitted. `rankRationale` then compares adjacent items
without checking whether the resulting comparison carries any information.

**Candidate resolutions — routing record only, do not implement from this entry.**

1. Suppress the comparison when both sides share a subject, or when both sides
   resolve to identical reasons.
2. Disambiguate by naming the angle rather than the ticker, so the two `QQQ`
   items are distinguished by what they are about.
3. Require subject uniqueness among ranked items, which changes what the payload
   is allowed to contain rather than how it is rendered.

These are materially different products, not three spellings of one fix. Option 3
in particular would reject a payload that is currently valid. Choosing among them
is a design decision and belongs to `bubbles.design`.

**Test coverage.** None. No scenario in this feature asserts anything about the
content of the rank rationale, and the five Scope 3 scenarios all pass with this
sentence on the page. A new scenario is needed before the defect can be fixed
under test, which is why this is routed to `bubbles.plan` after the design rule
is settled rather than being fixed inside Scope 3.

### F-017-06 — The rendered interruption rate is hardcoded to an empty ledger

**Status:** Open · **Severity:** low today, reader-facing correctness once the
ledger is populated · **Found during:** Scope 4 (`04-outcome-record-and-interruption-rate`),
reading the render path · **Owner:** `bubbles.plan` for the Test Plan row, then
implementation.

**Numbering.** No F-017-05 entry exists in this ledger; a search of the feature
directory finds the identifier nowhere. The number is skipped rather than reused,
on the same footing as F-017-01 through F-017-03 described in the preamble above.

**Observed.** `renderAttentionRecord` in `market-brief.html` passes a literal
empty array as the record set:

```text
market-brief.html:1416
  var rate = RLATTN.computeInterruptionRate([], null, generatedAt || null);
```

The reduced artifact is never read. `market-brief.attention-scorecard.json`
exists on disk and is not consulted by this call.

**Why it is a defect.** The rendered withheld state is true today only by
coincidence: `market-brief.attention-outcomes.jsonl` currently has zero lines, so
an empty array and the real ledger agree. They stop agreeing the moment one real
outcome is appended. From that moment the page keeps rendering the withheld state
while the scorecard reports a computed rate, and the page is making a false
statement about its own evidence. A hardcoded input that happens to match reality
is not a correct read; it is a read that has not been wired yet and is
indistinguishable from a correct one until the data moves.

**Test coverage.** None. No scenario asserts any relationship between the
rendered rate and the reduced artifact, so the divergence would ship silently.
The missing coverage is a Playwright assertion that the rendered rate, the
insufficient-sample marker and the displayed sample size match
`market-brief.attention-scorecard.json` for a fixture ledger that is deliberately
non-empty. A fixture with an empty ledger cannot detect this defect, because the
hardcoded empty array and the empty ledger produce identical output — that is the
adversarial requirement for the row.

**Resolution.** Two parts, in order. Add the Test Plan row and scenario, then
wire `renderAttentionRecord` to read `market-brief.attention-scorecard.json`
instead of passing a literal. Both belong to Scope 4's surfaces
(`market-brief.html` `#attentionRecord` block and the scorecard artifact), so no
change-boundary widening is needed to fix it.

