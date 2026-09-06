# Spec: BUG-010 — A Safety Disclosure Must Be Deterministic And Gated

## Problem statement

Feature 010 guarantees that the company fundamentals tool produces research, not advice. The way a
reader learns that is the `reason` text on the tool's `toolCoverage` entry in
`market-brief.payload.json`, which must name the adapter that produced the read and must state that
no recommendation is produced.

Today both facts originate in Tier-B LLM narrative prose. A language model that omits a sentence has
not violated any contract, because no contract asks for it: the deterministic producer does not emit
the facts, the narrative instructions do not require them, and the publish-time validator does not
check them. The guarantee therefore holds by habit rather than by construction, and it has now
failed twice in a way that surfaced as an assertion flap rather than as a refusal.

A safety-bearing statement that a model may forget is not a guarantee.

## Expected behaviour

**INV-010B-1 — the disclosure is deterministic.** The company owner-read that
`buildCompanyFundamentalsOwnerRead()` emits must contain the adapter id and a no-recommendation
disclosure, produced entirely from committed configuration and committed owner-read objects, with no
language model in the path. Running the deterministic producer alone, with the narrative lane
disabled, must yield a read that satisfies both facts.

**INV-010B-2 — the facts are projected, not pinned.** The adapter id in the emitted text must be
read from `company-fundamentals.config.json` (`feature002.adapterId`), and the disclosure must be
tied to the declared `feature002.recommendationEligibility`. A hard-coded string literal would
reproduce the defect one layer down: the text would then be able to disagree with the configuration
it claims to describe.

**INV-010B-3 — the narrative cannot erase them.** After the Tier-B narrative lane has merged its
rewritten `toolCoverage`, the company entry must still carry both facts. Whether that is achieved by
re-asserting the deterministic text after the merge or by constraining the lane for this entry is a
design choice; the observable requirement is that no narrative output can produce a published payload
without them.

**INV-010B-4 — publish is gated.** `scripts/validate-brief-payload.mjs` must fail a payload whose
company owner-read coverage entry lacks the adapter id or the no-recommendation disclosure. A bad
window must be refused before publish, not discovered afterwards by `scripts/selftest.mjs`.

**INV-010B-5 — the gate cannot pass vacuously.** A payload in which the company entry is missing
entirely, or in which no coverage entry is examined, must fail rather than pass. A check that is
silently unreachable is indistinguishable from a check that is satisfied, and that is precisely the
shape this bug is about.

**INV-010B-6 — the existing assertion is preserved.** The two conjuncts that fail today at
`scripts/selftest.mjs` line 6319 must remain byte-identical after the fix. They are the requirement,
not a canary, and three prior commits have already moved this assertion instead of the fact behind
it.

## Domain Capability Model

This packet delivers **one capability across four positions in a single pipeline**, which is why it
reads as four edits rather than one.

**The capability is deterministic owner-read disclosure:** a tool's coverage entry states which
adapter produced the read and that no recommendation is produced, in *every* window, regardless of
what the narrative model happened to write in that window.

The defect was not that the facts were missing from the system. `§1.1` records that the
deterministic lane already **knows** both facts and omits them from its prose; `§1.3` records that
the narrative lane owns the key and is never asked to preserve anything. So the disclosure existed
as data and evaporated as text — which is exactly why it presented as an intermittent assertion flap
rather than a clean failure, and why the assertion had already been relaxed twice.

A capability that depends on a model choosing to restate a fact is not a capability; it is a
coincidence that holds most of the time. The four positions below exist to remove the model from the
path entirely: emit the facts deterministically, preserve them across the merge, refuse at publish
if they are absent, and repair the window that already shipped without them.

## Acceptance criteria

| ID | Criterion |
|---|---|
| AC-1 | `buildCompanyFundamentalsOwnerRead()` emits a read containing `company-fundamentals-owner-v1` and a no-recommendation disclosure matching the Scope 6 regex, with no narrative lane involved. |
| AC-2 | With a fixture configuration declaring a different `feature002.adapterId`, the emitted read carries that other id — proving projection rather than a literal. |
| AC-3 | A published payload retains both facts after the Tier-B narrative merge. |
| AC-4 | `scripts/validate-brief-payload.mjs` exits non-zero on the committed pre-fix `market-brief.payload.json`, naming the missing adapter id and the missing disclosure. |
| AC-5 | The validator exits non-zero on a payload whose company reason is otherwise valid but has the adapter id removed, and on one that has the disclosure removed. |
| AC-6 | The validator exits non-zero when the company owner-read coverage entry is absent altogether. |
| AC-7 | The validator exits zero on the last published reason from `_site/market-brief.payload.json`, which satisfies both facts — the gate must not red-line a known-good window. |
| AC-8 | The committed `market-brief.payload.json` is repaired so `node scripts/selftest.mjs` exits 0. |
| AC-9 | The two failing conjuncts at `scripts/selftest.mjs` line 6319 are unchanged, verified by diff. |
| AC-10 | The repository selftest retains its assertion count, with no assertion removed, weakened, or skipped. |

## Out of scope

- The wording of the disclosure sentence. Any phrasing satisfying the Scope 6 regex is admissible;
  this packet makes a phrasing deterministic, it does not standardise English.
- The Tier-B narrative lane's ownership of `toolCoverage` for the other 27 registered tools. Only the
  company owner-read entry carries a declared no-recommendation eligibility, and only it is in scope.
- The company fundamentals model, its objects, its hashes, or the `sec-cik-0000789019` publication.
  Nothing about the underlying read is wrong; only its description is incomplete.
- Any change to the Feature 010 Scope 6 assertion itself. Explicitly forbidden by INV-010B-6.

## Traceability

| Invariant | Scenario | Scope |
|---|---|---|
| INV-010B-4 | SCN-010B-001 | 01 |
| INV-010B-4, INV-010B-2 | SCN-010B-002 | 01 |
| INV-010B-4 | SCN-010B-003 | 01 |
| INV-010B-5 | SCN-010B-004 | 01 |
| INV-010B-4 | SCN-010B-005 | 01 |
| INV-010B-1 | SCN-010B-006 | 02 |
| INV-010B-2 | SCN-010B-007 | 02 |
| INV-010B-3 | SCN-010B-008 | 02 |
| INV-010B-6 | SCN-010B-009 | 03 |
