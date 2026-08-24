# BUG-001 Design

## The Decision That Governs Everything Else

**The consumer boundary is correct and was deliberately not weakened.**

The cheapest way to make the tab compose was to relax `validateGenericWindow` — widen the
comparison, add a tolerance, or compare against `generatedAt` instead. Every one of those
would have worked, and every one of them would have destroyed the guarantee the boundary
exists to give: that a brief which declares the 11:00 window is not silently carrying 11:37
evidence. That is Feature 008's decision-time evidence boundary. A brief is a record of what
was knowable at a decision moment; a boundary that admits later evidence turns it into a
record of what was knowable afterwards, which is a different and much less useful artifact.

So the boundary keeps its exact comparison, and the defect is fixed on the side that was
actually wrong. `git diff --numstat rlportfoliobrief.js` reports **`16  0`** — sixteen
insertions, zero deletions. The refusal is provably untouched, not merely asserted to be.

## Why The Publisher Is The Wrong Side, Demonstrated Rather Than Argued

Three independent pieces of already-committed evidence agree, and none of them is this
packet's opinion:

1. **The runbook defines it.** `notes/market-brief.md` line 645: *"`asOf` is the
   window/session the brief analyzes …; `generatedAt` is the actual ISO wall-clock of the
   run that produced this file."* Two clocks, two questions, stated before this bug existed.
2. **The runbook then admitted the violation.** The same paragraph continued: *"Tier-A
   (`brief-refresh.mjs`) sets both to the run time automatically."* That is not a competing
   contract. It is the defect, written down as though intended.
3. **The sibling publisher already complied.** `scripts/brief-publication.mjs` line 275
   binds `asOf: run.evidence.cutoffAt`. The correct rule was in the repository the whole
   time, in the other publisher.

When two publishers disagree about one field and one of them matches the written definition,
the disagreement is a defect in the other, not an ambiguity in the contract.

## Chosen Approach

Bind `asOf` to the analyzed window's evidence cutoff at the point of publication, and make
the publisher and the consumer resolve that cutoff through **one shared function** so they
cannot drift apart again.

The helper is added to `rlportfoliobrief.js` and exported:

```js
function windowCutoffAt(windows, windowId, instant) {
  if (!Array.isArray(windows) || typeof windowId !== "string" || !windowId || !isIso(instant)) return null;
  var declared = null;
  for (var index = 0; index < windows.length; index += 1) {
    if (windows[index] && windows[index].id === windowId) { declared = windows[index]; break; }
  }
  if (!declared || typeof declared.etTime !== "string") return null;
  var parts = civilParts(instant, "America/New_York");
  return newYorkCivilCutoff(parts.year + "-" + parts.month + "-" + parts.day, declared.etTime);
}
```

The publisher then calls it and refuses to guess:

```js
const windowCutoffAt = RLPORTFOLIOBRIEF.windowCutoffAt(cfg.windows, window, snap.ts);
if (!windowCutoffAt) throw new Error(`window "${window}" has no resolvable evidence cutoff in market-brief.config.json`);
const snapshot = { asOf: windowCutoffAt, generatedAt: snap.ts, window, /* … */ };
```

`generatedAt` keeps `snap.ts`. The two clocks now genuinely differ on the committed
artifacts — `asOf` `15:00:00.000Z`, `generatedAt` `15:37:31.147Z` — which is the whole
point: the difference is the audit record of when a declared window was actually published.

**Placing the helper in `rlportfoliobrief.js` is the load-bearing choice, not an
organisational one.** That module is already the consumer's contract library, so putting the
rule there means the publisher must import the consumer's own definition of the boundary it
will later be judged against. A helper in `scripts/` would have been a second implementation
that merely happened to agree today.

## The Second Defect, Which The Fix Exposed

Two surfaces read the wrong clock, and only one of them was visible before the publisher was
corrected.

`portfolio-survival-allocation-lab.html` line ~8110 read the publication clock from
`payloadRef.asOf`. While the publisher stamped both fields identically, that was silently
correct — the two values were byte-identical, so reading either gave the right answer. The
moment `asOf` became the evidence cutoff, that line started reporting the *analyzed window*
as the *publication time*, which makes a past brief unauditable: every run of the morning
window would claim to have been published at 11:00 regardless of when it actually ran.

It now reads `snapshotRef.generatedAt`.

This is worth stating plainly because it is the characteristic hazard of un-collapsing two
fields that were wrongly made equal: every consumer that read *either* one was correct by
accident, and the fix converts each of those into a real choice. Both sites were found and
both were corrected, but the class is worth remembering — a conflation is not one bug, it is
one bug plus every reader that benefited from it.

## Separating The Schedule From The Evidence Window

The blank selector was not caused by the refusal. It was caused by the schedule and the
evidence window sharing one transaction: `buildGenericWindow` threw, the `.then()` never ran,
and the block that populated the selector lived inside it.

The schedule has already loaded by that point, so it is now rendered first:

```js
state.briefWindows = artifacts.config.windows;
renderBriefWindowOptions(artifacts.config.windows);

var projection = buildGenericWindow(artifacts);
```

and the `.catch()` names the refusal on screen with the code and reason that previously
reached only the diagnostics object.

This is a genuine correctness fix rather than cosmetics. A control with zero options tells
the reader *"there is nothing here"*, which is false — there are four declared windows and a
specific, nameable reason why one of them could not be composed from the current
publication. Presenting a refusal as an absence is a form of dishonesty about system state,
and it is precisely what makes an operator distrust the tool later.

## Why Not The Alternatives

| Alternative | Why rejected |
|---|---|
| Relax the `> cutoffAt` comparison, or add a tolerance | Destroys the decision-time evidence boundary to spare one artifact. A brief that may carry evidence later than the window it declares is not the artifact Feature 008 specifies. |
| Compare `snapshotRef.generatedAt` instead of `asOf` | Makes the boundary meaningless: `generatedAt` is *always* the run instant, so the comparison would pass for every publication however late, including one composed days after its window. |
| Fix only the committed `market-brief.snapshot.json` / `market-brief.payload.json` | Corrects one artifact and leaves the publisher free to reproduce the defect on the next run. The data correction is a consequence of the fix, never the fix itself. |
| Re-derive the cutoff independently inside `brief-refresh.mjs` | A second implementation of a boundary rule. It would agree on the day it was written and drift on the first schedule change — the same two-copies failure this repository has closed repeatedly. |
| Catch the throw and leave the tab blank but quiet | Converts a loud refusal into a silent one. The reader still cannot act, and now nobody can tell why. |
| Have the publisher refuse to publish a late run at all | Loses the run entirely. An 11:37 publication of the 11:00 window is a legitimate, auditable artifact once `asOf` and `generatedAt` say what they mean; discarding it trades a labelling defect for data loss. |

## Blast Radius

Seven surfaces, plus the two committed data artifacts the defect had already written.

| Surface | Change | Diff |
|---|---|---|
| `scripts/brief-refresh.mjs` | `asOf` bound to the analyzed window's cutoff; `generatedAt` unchanged | `9 +, 2 -` |
| `rlportfoliobrief.js` | **Additive only** — the shared `windowCutoffAt()` helper and its export | `16 +, 0 -` |
| `portfolio-survival-allocation-lab.html` | Schedule rendered before composition; refusal named on screen; publication clock reads `generatedAt` | `50 +, 13 -` |
| `scripts/brief-narrative-parallel.mjs` | Payload inherits the published cutoff; wall-clock fallback removed and replaced with a loud failure | `8 +, 1 -` |
| `scripts/validate-brief-payload.mjs` | Derives the cutoff through the shared helper | `2 +, 2 -` |
| `notes/market-brief.md` | The sentence documenting the defect replaced with the implemented rule | `1 +, 1 -` |
| `market-brief.snapshot.json` | `asOf` corrected; `generatedAt` untouched | `1 +, 1 -` |
| `market-brief.payload.json` | `asOf` corrected under the same rule | `1 +, 1 -` |
| `market-brief.page.json`, `market-brief.snapshot.page.json` | Derived page artifacts, regenerated | single-line artifacts |

No contract version changed. No schema field was added or removed. No threshold moved. The
consumer refusal condition is byte-identical, and the `16 +, 0 -` on `rlportfoliobrief.js`
is the mechanical proof of that rather than a claim about it.

Not part of this packet, though present in the same working tree: Scope 28's
test-integrity work (`tests/portfolio-publisher-boundary.functional.mjs`,
`tests/portfolio-survival.support.mjs`, `tests/portfolio-defect-injector.cjs`,
`tests/portfolio-test-integrity.unit.mjs`, `.specify/memory/agents.md`, and the Scope 28
artifacts). Those are separate in-flight work and are named here so the diff is not later
misread as this bug's footprint.

## Open Question For The Owner

**Q1 — Should a late publication also be recorded, not merely made composable?**

The fix makes an 11:37 publication of the 11:00 window honest: it declares 11:00 evidence
and discloses an 11:37 publication instant. It does not surface *how late* a run was, and a
persistently late window is an operational signal worth seeing — a brief published four
hours after its cutoff is technically well-formed and practically stale.

Nothing here is blocked on the answer, and adding a staleness disclosure in the same change
that first makes the two clocks differ would leave no run in which to observe whether the
distinction alone is sufficient. Recorded rather than decided.
