# Design: BUG-010 — Making The Company Owner-Read Disclosure Deterministic And Gated

## 1. Root cause

The defect is not one mistake. It is a chain in which every link is individually defensible and the
composition has no owner for the fact that matters.

### 1.1 The deterministic lane produces prose that omits what it already knows

`scripts/brief-refresh.mjs` → `buildCompanyFundamentalsOwnerRead()` opens by validating the
boundary configuration, and it validates *exactly* the two facts this bug is about:

```
if (!boundary || boundary.adapterId !== 'company-fundamentals-owner-v1'
    || boundary.readContractVersion !== 'tool-model-read/v1'
    || boundary.recommendationEligibility !== 'educational-research-only'
    || ...) throw new Error('company owner adapter configuration is invalid');
```

It then walks the pointer, the manifest, and the owner-read object, verifying every hash, and at
line 83 builds the read text:

```
const read = `${owner.companyId} fundamentals are ${owner.status}; direction ${owner.direction}; `
           + `statement ${...}, model ${...}, brief ${...}, market ${...}.`;
```

The function returns `adapter: { adapterId: boundary.adapterId, ... }` immediately below, so the
adapter id travels *structurally* while being absent from the *text*. `recommendationEligibility` is
validated and then never used again at all.

This is the root cause in one sentence: **the producer proves both facts and then declines to say
them.** Everything downstream inherits that silence.

### 1.2 Coverage inherits the text verbatim

`buildToolCoverage(toolReads)` at line 2106 maps the registry and, for a ready read, returns
`{ id, deepLink, status: 'fresh-headless', reason: toolRead.read }`. The reason *is* the read. No
enrichment step exists between them, so nothing recovers what §1.1 dropped.

`market-brief.snapshot.json` confirms the state directly: the entry's `read` string omits the
adapter id while its sibling `adapter.adapterId` carries `company-fundamentals-owner-v1`. The fact is
present in the same object, one key away, and is not in the sentence a reader sees.

### 1.3 The narrative lane owns the key and is not asked to preserve anything

`scripts/brief-narrative-parallel.mjs` line 93 declares a `coverage` lane owning
`['toolReads', 'toolCoverage', 'experimental']`. Its instruction text requires each entry to carry
"a specific analyzed/stale/not-relevant reason" and enumerates preservation duties for the sector,
ETF-momentum, global-rotation, and real-assets reads — but says nothing about the company entry's
adapter id or disclosure.

A model that rewrites the company reason into fluent prose and drops two clauses has therefore
followed its instructions exactly. The last published window happened to keep them; this one did
not. Both are compliant outputs of the same prompt, which is why this cannot be repaired by
re-rolling the window.

### 1.4 The publish gate does not look

`scripts/validate-brief-payload.mjs` lines 423-432 validate `toolCoverage` for duplicate ids, missing
registered ids, unregistered ids, and — per entry — `hasText(entry.reason)`. Non-empty is the entire
content test. The committed payload satisfies it, so the bad window published and stayed committed.

### 1.5 Why this presents as an assertion flap

`scripts/selftest.mjs` line 6319 is the only place in the repository that asserts either fact. It
runs long after publish, on committed data, and it can only report that the fact is gone. Because the
symptom always arrives as "the assertion failed", the three prior repairs all read as assertion
problems. The evidence that they were not is that the assertion has now been loosened twice and the
fact has gone missing a third time.

## 2. What must not be done

| Prohibited | Why |
|---|---|
| **Weakening or deleting the two failing conjuncts at `scripts/selftest.mjs` line 6319** | The explicit non-goal of this packet. Conjunct 5 asserts the reader can identify the producing adapter; conjunct 6 asserts the reader is told no recommendation is produced. They are Feature 010's guarantee, not a canary for it. Removing them buys a green build by deleting the only check that the product is safe, and it would be the third consecutive repair that moves the assertion instead of the fact. |
| Relaxing the Scope 6 regex to match the current window's wording | Same failure in a new costume. The current window makes no no-recommendation statement in any phrasing, so a regex that accepts it accepts silence. |
| Re-running the brief window until the model writes the sentence again | Treats a structural defect as bad luck. It restores green without changing the probability that the next window fails, and it is unauditable — nothing records which attempt was kept or why. |
| Hard-coding `'company-fundamentals-owner-v1'` as a literal in the emitted prose | Satisfies the assertion and reintroduces the class of defect one layer down: the sentence could then claim an adapter id that `company-fundamentals.config.json` no longer declares. INV-010B-2 forbids it. |
| Adding the disclosure only to the narrative instructions | Strengthens a probabilistic path instead of removing it. A stricter prompt is still a prompt; it lowers the failure rate and leaves the failure mode intact. It is admissible only *in addition to* the deterministic producer and the gate, never instead of them. |
| Editing `market-brief.payload.json` alone to turn the build green | Repairs one window and leaves the producer, the narrative lane, and the gate exactly as they are. The next refresh reintroduces the bug. Scope 03 does perform this repair, but only after Scopes 01 and 02 have made the recurrence impossible. |

## 3. Fix design

Four changes, in the order that keeps each one falsifiable.

### 3.1 (c) The gate — `scripts/validate-brief-payload.mjs`

Extend the `toolCoverage` validation with a company owner-read disclosure check:

1. Resolve the expected adapter id from `company-fundamentals.config.json` at `feature002.adapterId`,
   and the declared eligibility at `feature002.recommendationEligibility`. Derived, never pinned.
2. Locate the coverage entry whose `id` is the company tool's registry id.
3. Fail if the entry is **absent**, if its `reason` does not contain the resolved adapter id, or if
   its `reason` does not match the no-recommendation disclosure predicate.
4. The disclosure predicate must be the same shape the Scope 6 assertion uses, so the gate and the
   selftest cannot disagree about what counts as a disclosure. Two predicates would be two answers.

This lands **first**, before any producer change, so it can be observed refusing the committed
payload. A gate written after the fix can only ever be seen green, which proves nothing about
whether it works.

### 3.2 (a) The producer — `scripts/brief-refresh.mjs`

In `buildCompanyFundamentalsOwnerRead()`, project the two already-validated facts into the emitted
read text: the adapter id from `boundary.adapterId`, and a no-recommendation disclosure derived from
`boundary.recommendationEligibility === 'educational-research-only'`.

The values are in scope at the exact line that builds the string. No new input, no new I/O, and no
new failure mode: the function already throws when either value is wrong, so a read that reaches the
string-building step has both facts proven.

### 3.3 (b) Preservation across the narrative merge — `scripts/brief-narrative-parallel.mjs`

The Tier-B lane owns `toolCoverage`, so §3.2 alone is insufficient: a rewrite still lands on top of
the deterministic text. Two admissible shapes, and the choice is the implementer's:

- **Re-assert after merge.** After the narrative result is merged, restore the deterministic
  disclosure onto the company entry. Strongest form — the published fact no longer depends on model
  behaviour at all, only on the merge step running.
- **Constrain the lane.** Add an explicit preservation duty for this entry to the `coverage` lane
  instructions, in the same style as the existing per-tool preservation duties.

**Ranked, not equal.** Re-assertion is preferred, because it removes the model from the path rather
than instructing it. A constraint alone reduces the failure probability without eliminating the
failure mode, which is what §2 rejects. If the lane is constrained rather than re-asserted, the gate
in §3.1 is the only thing standing between a forgetful window and publish — which is acceptable only
because the gate refuses, but it converts a deterministic guarantee back into a caught failure.

### 3.4 (d) Data repair — `market-brief.payload.json`

The committed payload carries the bad reason and keeps `main` red independently of the code fix.
Repair it so the company entry satisfies both facts. Admissible routes: regenerate the window through
the fixed pipeline, or apply a targeted repair to that entry's `reason` preserving every other field
byte-for-byte. Either way the repaired payload must pass the §3.1 gate and the Scope 6 assertion, and
no other tool's entry may change.

## 4. Regression design

### 4.1 The adversarial requirement

Proving the gate red against the committed payload is necessary and **not sufficient**. After Scope
03 repairs the data, that same run goes green, and a gate that is green because it stopped looking is
indistinguishable from one that works.

The regression must therefore include at least one case where the fixture **satisfies every other
invariant** and violates only the one under test:

- a payload whose company reason is the known-good published text with the adapter id **removed** —
  the disclosure still present, every id correct, `hasText` still true;
- a payload whose company reason is the known-good published text with the **disclosure removed** —
  the adapter id still present;
- a payload with the company entry **absent entirely**, which must fail rather than skip.

A fixture set in which every entry already carries both facts is tautological: it would pass with the
gate present and with the gate deleted, and it must not be accepted as coverage.

### 4.2 The negative control

The gate must also be shown **green** on the last published reason from `_site/market-brief.payload.json`,
which satisfies both facts. Without that control, the cheapest way to a passing adversarial suite is a
gate that refuses everything, and a refuse-everything gate would be indistinguishable from a working
one until it started blocking good windows.

### 4.3 Anti-loosening check

Scope 03 must verify by diff that the two conjuncts at `scripts/selftest.mjs` line 6319 are unchanged.
Given that the last three commits to touch that line all modified it, an explicit check that this
change did **not** is the cheapest possible defence against a fourth flap.

## Capability Foundation

The foundation is the **publish gate**, `scripts/validate-brief-payload.mjs`. It is the only position
of the four that is repository-wide and permanent: it evaluates every coverage entry in every
published payload and refuses the publish when the disclosure is absent.

It is the foundation rather than one of the fixes because the other three positions make the *current*
pipeline correct, while the gate makes a *future* regression impossible to ship. `§1.4` records the
reason it was needed at all: the gate did not look, so a payload missing the disclosure reached the
site and was discovered later by a failing selftest rather than refused at the boundary.

The distinction matters for where the failure surfaces. Without the gate, the same defect returns as
an intermittent red in an unrelated assertion — which is what had already happened twice, and what
caused the assertion to be relaxed rather than the producer to be fixed.

## Concrete Implementations

| # | Position | File | Act |
|---|---|---|---|
| a | Producer | `scripts/brief-refresh.mjs` | emit the adapter id and the no-recommendation disclosure deterministically, from facts the lane already holds |
| b | Preservation | `scripts/brief-narrative-parallel.mjs` | carry both facts across the narrative merge so the model cannot drop them |
| c | Enforcement | `scripts/validate-brief-payload.mjs` | refuse at publish when a coverage entry lacks either fact |
| d | Data repair | `market-brief.payload.json` | repair the one committed window that already shipped without the disclosure |

### Variation Axes

| Axis | Values | Consequence |
|---|---|---|
| **Failure mode if omitted** | silent-wrong (a, b, d) vs undetected-forever (c) | a, b and d each produce a payload that is wrong but fixable. Omitting c means the next occurrence ships and is found later by an unrelated red, which is the history this packet exists to end. |
| **Temporal target** | future windows (a, b) vs the one window already published (d) vs both (c) | d is not a code change and cannot be tested by re-running the producer; it is verified by reading the committed payload. This is why the repair is its own scope rather than a side effect of the producer fix. |
| **Who can drop the facts** | the model (b) vs the code path (a) | b exists *because* a is not sufficient: the deterministic lane can emit both facts and the narrative merge can still discard them, since `§1.3` records that the narrative lane owns the key and was never asked to preserve anything. |

The axis most easily missed is the third. Fixing only the producer looks complete — the facts are
emitted — and still ships windows without them, because emission and survival are different
properties. `T-10-U9` is the test that distinguishes them: a narrative result that drops both facts
must still yield a published entry carrying them.

## 5. Ownership

| Surface | Owner |
|---|---|
| `scripts/validate-brief-payload.mjs` | this packet, Scope 01 |
| `scripts/brief-refresh.mjs` | this packet, Scope 02 |
| `scripts/brief-narrative-parallel.mjs` | this packet, Scope 02 |
| `market-brief.payload.json` | this packet, Scope 03 |
| `scripts/selftest.mjs` line 6319 | Feature 010 — **read-only for this packet** |
| `notes/market-brief.md` runbook wording | Feature 012 — untouched unless the narrative contract changes |
