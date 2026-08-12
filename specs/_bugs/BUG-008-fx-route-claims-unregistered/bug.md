# BUG-008 — The Registered FX Route Told Readers It Was Not Registered

**Reported by:** bubbles.goal (autonomous FX follow-on audit)
**Reported at:** 2026-08-12
**Linked implementation spec:** `specs/004-fx-regime-relative-value-lab` (status `done`, certified)
**Severity:** Low-impact defect, high-confidence. Truthfulness class.
**Affected surface:** `fx-regime-relative-value-lab.html` served markup.

---

## 1. Symptom

The FX Regime & Currency Vehicle Lab shipped **registered and published**, but its served
markup still asserted the *pre-registration* state in two places:

1. A source comment: `This route is intentionally UNREGISTERED until Scope 5, so
   rlexperience.js resolveShell refuses with E012-REGISTRY and the shell renders its honest
   unavailable state.`
2. The shell mount's **reader-visible** placeholder text: `Shared four-view shell mounts here
   once this route is registered.`

Both statements were false at HEAD `32dca5a0`.

## 2. Reproduction

Deterministic, no browser state required.

```text
$ grep -n 'fx-regime' site-exclusions.json || echo "NOT PRESENT (route is published)"
NOT PRESENT (route is published)

$ grep -c '"fx-regime-relative-value-lab"' tools.json
1

$ grep -n 'intentionally UNREGISTERED\|once this route is registered' fx-regime-relative-value-lab.html
166:        <!-- Shared four-view shell anchor. This route is intentionally UNREGISTERED until Scope 5,
172:            Shared four-view shell mounts here once this route is registered.
```

The registry says registered and published. The page says unregistered. Those cannot both hold.

## 3. Why This Is A Defect And Not Cosmetic

The placeholder is **not** a comment. It is the literal text inside
`<div id="shellMount" data-rlbrief-mount>`, which is what a reader sees during the window
before `rlapp.js` injects `rlexperience.js` and mounts the shared switcher — and what a
reader sees permanently if that injection fails, is slow, or JavaScript is unavailable.

In that state the tool tells the reader the route is not registered, which is false, and
which points the reader at a non-existent problem instead of the real one (the shell has not
mounted yet).

This repository polices exactly this class. Feature 004's own `docs` phase ran a stale-claim
scan over five surfaces for retired FX vocabulary. That scan searched for terms the delivery
*removed* (`fxWeight`, `FX-weighted`, `currencyProxy`, `globalFxConfirm`); it did not search
for claims the delivery *invalidated by making them true's opposite*. This defect sat in that
blind spot.

## 4. Clean-Tree Evidence

The defect is in committed source, not a working-tree artifact.

```text
$ git rev-parse --short HEAD
32dca5a0

$ git log --oneline -1 -- fx-regime-relative-value-lab.html
9d593acc feat(004): the FX cutover — one transaction, or nothing
```

The text was introduced by Scope 2 when it was **true**, and Scope 5 registered the route
without retiring it. Scope 5's own DoD item ("shared four-view switcher resolves") asserted
the *runtime* outcome and passed correctly; nothing asserted the *markup* stopped contradicting
it. The obligation was discharged in behaviour and left standing in prose.

## 5. Impact

- No functional regression. The shared four-view switcher mounts correctly; all 78 tests in
  `tests/fx-regime-relative-value-lab.spec.mjs` passed before this fix.
- Reader-facing truthfulness regression in the pre-hydration and JS-unavailable states.
- Documentation-accuracy regression for any engineer reading the route source, who would
  conclude the route is excluded from the published site.

## 6. Severity Justification

**Low, not trivial.** No user is given a wrong number and no analytic is affected, so it is
not High. It is not trivial because the false statement is reader-visible rather than
comment-only, and because the repository treats "never label a cached fallback live" and
"no blackbox numbers" as first-order rules — a route that misstates its own delivery status
is the same category of untruth applied to itself.

## 7. State At Fix Time

Fixed in this packet. The invariant is now enforced by
`Regression BUG-008: a registered route never claims it is unregistered` in
`tests/fx-regime-relative-value-lab.spec.mjs`, which derives the expectation from
`tools.json` and `site-exclusions.json` rather than freezing a string, so it fails in both
directions.
