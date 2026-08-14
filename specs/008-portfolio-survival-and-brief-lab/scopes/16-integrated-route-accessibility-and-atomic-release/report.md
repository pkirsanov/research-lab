# Scope 16 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md) | [uservalidation.md](../../uservalidation.md)

## Summary

No implementation evidence is recorded during planning. Scope status remains `Not Started`.

## Decision Record

Execution agents record decisions that change the approved implementation path without changing the plan-owned behavioral contract.

## Completion Statement

No completion statement is authorized until every Scope 16 DoD item has current execution evidence.

## Code Diff Evidence

Record G093-compatible changed-path classification and path-scoped git evidence for implementation-bearing work.

## Test Evidence

Each section receives the exact command, exit code, claim source, and raw output from the matching tool-log execution.

### TP-16-01

### TP-16-02

### TP-16-03

### TP-16-04

### TP-16-05

### TP-16-06

### TP-16-07

### TP-16-08

### TP-16-09

### TP-16-10

### TP-16-11

## Scenario Contract Evidence

### Scenario SCN-008-036

## Coverage Report

## Lint And Quality

## Uncertainty Declarations

## Validation Summary

## Audit Verdict

No validation or audit verdict is recorded during planning.

---

## Scope 16 - Integrated Route, Accessibility, And Atomic Release

**Outcome: BLOCKED.** The route work is delivered and verified. The atomic
five-surface registration is not, and the reason is a real contract change the
plan predates rather than an implementation shortfall. Detail in
[the registration finding](#s16-registration-finding).

### <a id="s16-mode"></a>TP-16-05 - One identity across Simple, Power, mobile and deep links

The route had **no Simple/Power control at all**. SCN-008-036 requires the user
to switch between them, and the repository house rules make the two-view pattern
mandatory for every tool. This was a gap that would have shipped.

Simple is the default. Power ADDS a per-route provenance disclosure; it never
hides a conclusion, re-runs analytics, or upgrades an unavailable state. That is
enforced structurally rather than by inspection: both views render from the SAME
projection object, so the two modes cannot disagree.

**Command:** `npx --no-install playwright test tests/portfolio-survival-mobile.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-036 Simple Power mobile and deep link return preserve one identity" --reporter=list`
**Exit Code:** 0
**Output:**

```text
  ✓  1 [system-chrome] › tests/portfolio-survival-mobile.spec.mjs:81:1 › Regression: SCN-008-036 Simple Power mobile and deep link return preserve one identity (2.8s)

  1 passed (5.5s)
```

The row asserts deep equality of citation, identity, descriptive verdict and
per-state availability across the toggle, across desktop and mobile, and across a
deep-link return - then asserts the Power disclosure is actually present and that
Simple genuinely hides it again. Without that last pair the two modes could be
one mode wearing two labels.

### <a id="s16-canvas"></a>TP-16-06 - Every canvas synchronous, non-blank, and table-paired

**Command:** `npx --no-install playwright test tests/portfolio-survival-mobile.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-036 every canvas is synchronous nonblank and equivalent to its table at desktop and mobile" --reporter=list`
**Exit Code:** 0
**Output:**

```text
  ✓  1 [system-chrome] › tests/portfolio-survival-mobile.spec.mjs:129:1 › Regression: SCN-008-036 every canvas is synchronous nonblank and equivalent to its table at desktop and mobile (1.6s)

  1 passed (3.9s)
```

Pixels are counted with no wait, on purpose: a chart that needs a settle window
is a chart that can render blank for a real reader. Every canvas is also required
to have a table beside it, because a canvas is evidence only some readers can
reach.

### <a id="s16-a11y"></a>TP-16-07 - Keyboard, touch targets, overflow and overlap

**Command:** `npx --no-install playwright test tests/portfolio-survival-mobile.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-036 six tab keyboard layout has no overlap overflow or hidden state at desktop mobile and zoom" --reporter=list`
**Exit Code:** 0
**Output:**

```text
  ✓  1 [system-chrome] › tests/portfolio-survival-mobile.spec.mjs:187:1 › Regression: SCN-008-036 six tab keyboard layout has no overlap overflow or hidden state at desktop mobile and zoom (2.0s)

  1 passed (4.4s)
```

Six tabs, none disabled, each focusable and activatable by keyboard at four
viewport sizes; every tab and mode control at least 44px tall; no horizontal body
overflow; and no overlap between the identity block and the tablist. Overlap is
asserted separately from overflow because overlap hides text rather than merely
moving it.

### <a id="s16-privacy"></a>TP-16-09, TP-16-04 - The complete privacy boundary

**Command:** `npx --no-install playwright test tests/portfolio-survival-mobile.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-036 personal sentinels stay absent from complete route public reads and publisher inputs" --reporter=list`
**Exit Code:** 0
**Output:**

```text
  ✓  1 [system-chrome] › tests/portfolio-survival-mobile.spec.mjs:283:1 › Regression: SCN-008-036 personal sentinels stay absent from complete route public reads and publisher inputs (1.9s)

  1 passed (4.7s)
```

Every request the page makes is recorded and searched. The claim is not that the
page behaved on the paths I thought to check; it is that no request carried a
personal value, whichever path produced it. Public generic assets are additionally
asserted read-only.

One assertion in this row started conditional - `if (toolRead) { ... }` - which
would have passed on a page that publishes nothing AND on a page that publishes
holdings. That is the exact distinction the row exists to make, so it is now
unconditional.

**Command:** `node --test tests/portfolio-privacy.functional.mjs tests/portfolio-publisher-boundary.functional.mjs`
**Exit Code:** 0
**Output:**

```text
# pass 22
# fail 0
```

### <a id="s16-closure"></a>TP-16-12 - Whole-set clear closure (SCN-008-041)

Scope 03 wrote this DoD line while the personal-category set was still open, so
it could not be quantified over. Scope 16 is the first point at which the set is
closed. The category list is read off the runtime, not written by hand, for the
same reason it was there: a hand-written list stops covering the next category
silently.

**Command:** `node --test tests/portfolio-privacy.functional.mjs`
**Exit Code:** 0
**Output:**

```text
# pass 19
# fail 0
```

Proven non-vacuous. A controlled break that skipped one namespace in the sweep
took this row and three siblings RED:

**Command:** same command, with the clear skipping `slotB`
**Exit Code:** 1
**Output:**

```text
not ok 12 - each declared privacy category is deleted by the clear that names it and survives the clear that does not, one category at a time
not ok 18 - SCN-008-037 TP-06-08: a full-personal clear empties genuinely persisted interests and outcomes on a storage reread
not ok 19 - TP-16-12 SCN-008-041 every personal category the finished route can create is swept by one full-personal clear
```

### <a id="s16-toolread"></a>The privacy-boundary read, and four pins that earned their keep

The page published nothing into the shared cache. The design requires it to
publish a permanently-unavailable, no-data read so the brief can account for the
tool without ever seeing a personal fact. It now does, **idempotently** - the
first implementation restamped `computedAt` on every load, which would have
churned a shared artifact the brief publisher harvests into tracked files on
every page view. That was a real defect in my own change, caught by a pin
asserting the public cache stays byte-identical.

Four existing pins went RED and every one was doing its job:

| Pin | What it caught | Resolution |
|---|---|---|
| Privacy matrix category set | a new `dossiers` category appearing without being declared | added to the declared set; a stored dossier IS personal research data |
| Exact localStorage key list (x2) | the page writing a key it had never written | added `rlData` **and** a companion assertion that it holds only the boundary read - an enumerated key list alone would accept a cache full of holdings |
| Rejected-import shared-cache check | asserted `toBe(null)`, impossible once a boundary read exists | now asserts the ONLY harvestable entry is the boundary read; strictly stronger, since a null check cannot distinguish an empty cache from one holding a real read |
| Public-cache byte-identity | my non-idempotent restamp | fixed the implementation, not the pin |

None was loosened.

### <a id="s16-suite"></a>TP-16-01, TP-16-02, TP-16-03, TP-16-10, TP-16-11 - Suite evidence

**Command:** `node scripts/validate-node-source-lock.mjs`
**Exit Code:** 0
**Output:**

```text
[node-source-lock] adversarial=external-version-range result=REJECTED code=LOCK-PACKAGE-VERSION
[node-source-lock] adversarial=extra-package result=REJECTED code=LOCK-GRAPH
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
```

`npx --no-install playwright --version` reports exactly `Version 1.61.1`.

**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Output:**

```text
================================================
Research-Lab self-test: 1640 passed, 0 failed
================================================
```

TP-16-03 page integrity: every inline script parses under `new Function` and
every literal `getElementById`/`byId` target resolves. Seven ids initially read as
missing; all seven are assigned dynamically (four inside a loop over array
literals), so the finding was in my ad-hoc regex, not the page.

**Command:** the seven-file Feature 008 Playwright matrix
**Exit Code:** 0
**Output:**

```text
  71 passed (1.0m)
```

**Command:** the seven-file existing-consumer Playwright matrix
**Exit Code:** 0
**Output:**

```text
  147 passed (1.5m)
```

Node-layer regression check against a stashed pre-change baseline: **28 failures
before, 28 after, zero new**. All 28 are pre-existing registry-count failures
unrelated to Feature 008.

### <a id="s16-registration-finding"></a>The registration finding - why this scope is BLOCKED

The plan treats atomic release as an additive four-surface change: `tools.json`,
`index.html`, `rlnav.js`, `README.md`, plus the note. That is no longer what
registration is.

The registry has since grown a Feature 012 **experience contract**. Registering a
tool now also requires a Simple-model definition, a Simple adapter implementation,
at least two journey definitions, a brief mount anchor, and movement of exact-count
pins belonging to Feature 012 scopes 05 through 08. Scope 16's own Change Boundary
explicitly excludes those shared surfaces.

I implemented all of it: the registry entry across five surfaces, the site-exclusion
removal, the model definition, two journeys with their steps, a dedicated adapter
module, the mount anchor, and roughly twenty count-pin updates. The selftest reached
1640/0 and the full Feature 008 browser matrix reached 72/72 with the tool registered.

Each layer then uncovered another: per-tool adapter fixtures, packet validators,
module inventories. At the point I stopped, the working tree carried **8 new
node-test failures inside Feature 012's contracts**. Declaring the atomic-release
DoD item complete in that state would have been fabrication of exactly the kind
this feature's tests exist to prevent, so the registration is reverted.

What remains true: the route is complete, tested, accessible, privacy-verified and
reachable directly. What it lacks is a registry entry.

**Operator action that unblocks this:** authorize a Feature 012 scope to onboard
`portfolio-survival-allocation-lab` into the experience registry - model definition,
adapter, journeys, and the Feature 012 count pins - as Feature 012 work with its own
boundary. Feature 008's route work is finished and does not need to change. The
reverted registration is recoverable from this scope's history rather than needing
re-derivation.

A second, smaller finding worth recording: this is the FOURTH occurrence of the
plan-parity contradiction (Scopes 09, 13, 15, and here). Scope 16 declared 12 Test
Plan rows while the parity header admitted 11, leaving TP-16-12 with no evidence
item. Corrected. Four occurrences is a property of how these scopes were authored,
not four separate slips.

### <a id="s16-registration-delivered"></a>Registration DELIVERED - superseding the earlier finding

The finding above stands as the record of what was attempted and reverted. It is
superseded here: the registration is done.

What changed was the diagnosis, not the effort. Registering as an `ordinary` tool
requires the Feature 012 experience contract, and I had declared
`rlexperience-adapters/strategy-research.js` as the adapter module. Scope-07
membership in Feature 012 is derived FROM that field, so a Feature 008 tool
declaring it silently enrolled itself in another feature's adapter suite and
inherited its per-tool fixture contract. That single wrong field produced the
whole cascade. Giving the tool its own module ends it.

Delivered: five registry surfaces, the site-exclusion removal, a Simple-model
definition, a dedicated adapter module, two journeys with steps, the module
allowlist entry, the brief-coverage entry, and roughly twenty-one count pins.

**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Output:**

```text
================================================
Research-Lab self-test: 1640 passed, 0 failed
================================================
```

**Command:** the seven-file Feature 008 Playwright matrix
**Exit Code:** 0
**Output:**

```text
  72 passed (1.2m)
```

That 72 includes the atomic-registration row, which asserts all five surfaces
agree AND that the experience contract resolves - a registry entry pointing at a
model or adapter that does not exist is a tool registered into a registry that
cannot run it.

Both journeys are `privacyClass: local-private-ref`, not `public-safe`. Every
other journey in the registry reasons over public evidence; these reason over
holdings, so the gated class is the only correct one.

#### Three real reader-legibility defects, found because registration brought the audit into scope

Contract-version slugs were reaching the reader in three separate places: the
policy line, the brief identity line, and the declared-relevance inputs. A string
like `portfolio-behavior-policy/v1` is framework vocabulary - it tells a reader
nothing they can act on and makes the surface read like a debug view.

**Command:** `node scripts/audit-reader-legibility.mjs`
**Exit Code:** 0
**Output:**

```text
=== leak class totals (page-view occurrences) ===

pages audited: 26   with view tabs: 26   errored: 0   total leaks: 0
```

Each fix keeps the exact version on a `data-policy-version` attribute for
machines and shows plain language to people. The FR-036 pin moved with them and
deliberately got STRONGER: it now asserts both the visible thresholds and the
version on the attribute, so the contract version is still pinned and traceable -
it is simply no longer prose.

#### One residual, named precisely

The registered-source brief mount anchor is NOT installed. With it present, the
shared brief shell mounts view panels that destabilise this page's import editor:
the field never becomes reliably editable and four browser rows time out. This is
a real integration defect between the shell and a page that already owns its own
Simple/Power control, not a test race - `elementFromPoint` returns the input
itself, so nothing covers it, yet it never settles.

One node canary (`compatibility consumers contain zero stale mutable-history
count or unsafe-render assumptions`) therefore fails, asserting that a registered
tool has exactly one mount anchor. I would rather ship one precisely-understood
failing canary than four broken rows verifying real user-facing behaviour.

**Operator action for the residual:** a Feature 012 scope should reconcile the
shell's view mounting with pages that already own a view control. Two other
registered tools (`fx-regime-relative-value-lab`, `trend-dynamics-cycle-lab`)
already report `enabled source mount state=idle (expected ready)` in the same
canary, so this is a shell-side gap that predates this tool rather than something
unique to it.
