# BUG-001 The Tier-A Publisher Stamps Run Time Into `asOf`, So A Late Run Publishes A Brief Its Own Consumer Must Refuse

- **Filed at commit:** `648e0992b` (delivery present in the working tree, uncommitted)
- **Severity:** High — the Portfolio Brief tab was dead on the published artifacts
- **Surface:** `scripts/brief-refresh.mjs` snapshot construction, consumed by
  `rlportfoliobrief.js` `validateGenericWindow` through
  `portfolio-survival-allocation-lab.html#brief`
- **Workflow mode:** `bugfix-fastlane`
- **Parent feature:** `specs/008-portfolio-survival-and-brief-lab`
- **Related:** `specs/018-headless-official-curve-publication` (the Tier-B publisher that
  already carried the correct rule), `notes/market-brief.md` § `asOf` vs `generatedAt`

## What Is Wrong

The Portfolio Brief tab of `portfolio-survival-allocation-lab.html#brief` could not
compose. The evidence-window selector `#briefWindow` rendered **zero options**, so the tab
read as "nothing here" rather than "this was refused, and why". A reader had no control to
operate and no sentence naming what had happened.

`tests/portfolio-survival-brief.spec.mjs` was **3 passed / 14 failed**.

The refusal itself was correct and was raised where it should be. In `rlportfoliobrief.js`
(line 217 before the fix, line 232 after it — the fix inserted 15 lines above it):

```js
if (input.snapshotRef.window !== input.windowId || input.payloadRef.asOf > cutoffAt || input.snapshotRef.asOf > cutoffAt) {
  return contractErr("P008-BRIEF-EVIDENCE", "generic-evidence-cutoff-conflict", "input", null, false);
}
```

The published data walked straight into it:

| Field | Committed value | New York civil time |
|---|---|---|
| `market-brief.snapshot.json` `window` | `morning` | — |
| `market-brief.config.json` `morning.etTime` | `11:00` (anchor `open`, offset `+90`) | 11:00 |
| `snapshot.asOf` | `2026-08-23T15:37:31.147Z` | 11:37 |
| `snapshot.generatedAt` | `2026-08-23T15:37:31.147Z` | 11:37 — **byte-identical** |
| consumer-derived `cutoffAt` | `2026-08-23T15:00:00.000Z` | 11:00 |

`11:37 > 11:00`, so the contract refused, `buildGenericWindow` threw, and the `.then()`
that populates the selector never ran. One late publication therefore produced a control
with no options at all.

Two distinct defects are stacked here, and the second was invisible until the first was
fixed:

1. **A publisher defect.** Tier-A stamped the run wall-clock into `asOf`, a field that is
   contractually the *analyzed window*, so any run that did not begin exactly on its
   window boundary published a self-refuting artifact.
2. **A consumer presentation defect.** A refused composition emptied the schedule
   selector, because the schedule and the evidence window were being loaded inside one
   transaction. An unavailable state that cannot say what was refused is not an honest
   unavailable state.

## Root Cause

`notes/market-brief.md` line 645 **defines** the contract, and then **admitted the
violation in the same paragraph**. The committed text before the fix read:

> **`asOf` vs `generatedAt`:** `asOf` is the window/session the brief analyzes (e.g. the
> 11:00 ET `morning` window); `generatedAt` is the actual ISO wall-clock of the run that
> produced this file. … Tier-A (`brief-refresh.mjs`) sets both to the run time
> automatically.

The definition is authoritative. The final sentence is not a second contract; it is a
written record of the defect, carried in the runbook as though it were intended behaviour.

The defect site was `scripts/brief-refresh.mjs` line 2632:

```js
const snapshot = { asOf: snap.ts, generatedAt: snap.ts, window, marketClosed, /* … */ };
```

Both fields received `snap.ts`, the run clock. Nothing in that expression knows which
window is being analyzed, so nothing could have produced the right answer.

**The sibling publisher already did it right.** `scripts/brief-publication.mjs` line 275:

```js
const snapshotBody = { contractVersion: 'brief-compat-snapshot/v1', runId: run.runId, runFingerprint: run.runFingerprint, manifestRef: manifestPath, window: run.window, asOf: run.evidence.cutoffAt };
```

So two publishers disagreed about one field, and the correct rule was already committed in
the repository. Tier-B bound `asOf` to the evidence cutoff; Tier-A bound it to the clock.
The consumer could only be right about one of them, and it was right about Tier-B.

## Provenance — Pre-Existing, Not Caused By Scopes 25/26/27

The failure surfaced during Scope 27 work, so the first question was whether recent scope
delivery had introduced it. It had not. Both candidates were surgically reverted and the
failure survived each revert:

| Reverted surface | Reverted to | Result |
|---|---|---|
| `rlnav.js` | `744ac6a54^` (pre-Scope-26, *feat(008): complete immutable workspace navigation*) | **Still failed** |
| `portfolio-survival-allocation-lab.html` | `0972ddd75^` (pre-Scope-27, *feat(008): implement accessible six-tab interaction*) | **Still failed** |

Both files were restored clean afterwards. This is a latent defect that had been publishing
correct-looking artifacts for as long as runs happened to land close enough to their window
boundary, exposed by that day's publication timing rather than by any code change.

That distinction matters for the remedy: nothing in the navigation or tab work needed to
change, and nothing in it did.

## Evidence

Every figure below was read from the committed working tree in this session.

| Check | Command | Result |
|---|---|---|
| Refusal reason exists at the named site | `grep -n 'generic-evidence-cutoff-conflict' rlportfoliobrief.js` | line `233` (post-fix) |
| Snapshot clocks are now distinct | `python3` read of `market-brief.snapshot.json` | `asOf` `15:00:00.000Z`, `generatedAt` `15:37:31.147Z` |
| Window schedule | `python3` read of `market-brief.config.json` | `morning` = `11:00`, anchor `open`, offset `+90` |
| Tier-B precedent | `grep -n 'asOf: run.evidence.cutoffAt' scripts/brief-publication.mjs` | line `275` |
| Provenance commits resolve | `git log --oneline -1 744ac6a54 0972ddd75` | both exist, as titled above |

## Status

Fixed. See `design.md` for why the consumer boundary was deliberately not weakened,
`scopes.md` for the Definition of Done, and `report.md` for the executed verification.
