# Spec: BUG-008 — Expected Behavior Of A Registered Route's Self-Description

## 1. Purpose

Define what the FX route's served markup must say about its own registration state, and make
that statement derivable from the registry rather than from a remembered edit.

## 2. Expected Behavior

### EB-1 — A registered route never claims it is unregistered

When `fx-regime-relative-value-lab` is present in `tools.json` and absent from
`site-exclusions.json`, the served markup of `fx-regime-relative-value-lab.html` must contain
no statement asserting the route is unregistered, excluded, or pending registration.

### EB-2 — The pre-hydration placeholder describes hydration, not registration

The text inside `<div id="shellMount">` is what a reader sees before `rlapp.js` injects the
shared shell, and permanently if that injection never completes. It must describe the state
that is actually true in that window — the views are loading — and must not attribute the
absence of the switcher to a registration state that does not hold.

### EB-3 — The design fact that remains true is preserved

The route deliberately ships **no page-local mode strip**; the shared four-view switcher is
its only view control. That statement was true before this fix and remains true after it. The
remediation must not delete it while removing the false claims around it.

### EB-4 — The invariant is registry-derived and fails in both directions

The guard must read the live registry rather than assert the absence of a specific sentence.
It must redden if the page reacquires an unregistered claim **and** redden if the tool is
de-registered while the page continues to present itself as live.

### EB-5 — Runtime behavior is unchanged

The fix is confined to markup that no runtime path reads. Shell resolution, view identity,
owner decision, evidence identity, and every existing assertion in the FX suite must be
byte-unaffected in outcome.

## 3. Acceptance Criteria

| ID | Criterion | Verified by |
|----|-----------|-------------|
| AC-1 | Served markup contains no unregistered/excluded/pending-registration claim while the tool is registered | `Regression BUG-008` contradiction-pattern set |
| AC-2 | `#shellMount` inner text contains no denial of the route's liveness | `Regression BUG-008` mount assertion |
| AC-3 | Expectation is derived from `tools.json` + `site-exclusions.json`, not a frozen string | `Regression BUG-008` registry preconditions |
| AC-4 | The guard fails before the fix and passes after it | Recorded RED then GREEN run |
| AC-5 | All pre-existing FX behavior is unchanged | Full FX suite 78/78 |
| AC-6 | Repository baseline is unaffected | `node scripts/selftest.mjs` 1578/0 |
| AC-7 | Every `getElementById` in the edited page still resolves | Section-9 id-integrity check |

## 4. Out Of Scope

- Any change to FX analytics, vehicle eligibility, owner decision, or evidence identity.
- Any change to shell resolution, `rlexperience.js`, `rlapp.js`, or the adapter.
- Re-litigating the Scope 2 decision to ship no page-local mode strip. That decision stands.
- The other 8 registered tools that lack `#modeSeg`. They were audited (see design §4) and
  are not defective; three use the shared shell and the rest are out of this packet's scope.

## 5. Repository Constraints Honored

- No blackbox numbers: no analytic changed.
- Single-file tool, no build step: the edit is inline markup.
- Educational-only disclosure untouched.
- Universal tooltips, ticker links, and chart hover untouched.

## 6. Capability Proportionality

### Single-Capability Justification

This packet adds one regression test and edits one markup block. It introduces no new
module, abstraction, or shared helper, because the invariant it protects is specific to one
route's self-description and the existing suite already owns that route. A shared
"route self-description" helper would be an abstraction over exactly one call site.

## Outcome Contract

**Intent:** The FX route's served markup tells the truth about its own registration state,
and a guard keeps it true.

**Success Signal:** With the tool registered in `tools.json` and absent from
`site-exclusions.json`, `Regression BUG-008` passes; with the false claims restored it fails.
The full FX suite and the repository selftest are unchanged and green.

**Hard Constraints:**
- No runtime behavior change.
- The no-page-local-mode-strip design fact survives.
- The guard is registry-derived, not string-frozen.

**Failure Condition:** The guard passes while the page still contradicts the registry, or the
guard is satisfied by weakening it to a string comparison that cannot detect de-registration.
