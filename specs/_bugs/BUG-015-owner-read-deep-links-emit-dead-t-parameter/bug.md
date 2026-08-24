# BUG-015: Two Owner-Read Deep Links Name A Subject Under A Parameter No Route Reads

**Status:** Reported
**Severity:** Medium
**Filed:** 2026-08-22
**Affected files:** `intraday-tape-lab.html`, `swing-structure-lab.html`
**Filed at commit:** `752699a60`
**Provenance:** audit finding `F-AUDIT-02b`, routed out of
`specs/027-company-scoped-owner-deep-links` and never received by anyone

---

## Why This Packet Exists

`F-AUDIT-02b` was raised during Feature 027's audit phase and routed rather than fixed, correctly:
both affected files sit outside that feature's `workBoundary.allowedPaths`. The routing then went
nowhere. At filing:

```
$ grep -rln 'F-AUDIT-02b' specs/
specs/027-company-scoped-owner-deep-links/state.json
specs/027-company-scoped-owner-deep-links/report.md
```

Two hits, both inside the routing feature's own artifacts. No bug packet, no receiving spec, no
owner. Nothing outside Feature 027 knows the finding exists, so nothing would ever act on it.
Giving the finding a home is the entire purpose of this packet.

---

## Summary

Two routes publish a Feature 007 owner read carrying a `deepLink` that names the company being
read. Both compose that link with a literal `?t=` parameter. No route in the repository reads a
`t` parameter. The link therefore looks company-scoped and is not: a reader who follows it lands
on the route's default subject, and nothing reports that the naming was discarded.

| file | line | emitted `deepLink` |
|---|---:|---|
| `intraday-tape-lab.html` | 1855 | `"intraday-tape-lab.html?t=" + encodeURIComponent(state.ticker)` |
| `swing-structure-lab.html` | 1693 | `"swing-structure-lab.html?t=" + encodeURIComponent(state.ticker)` |

The canonical subject parameter is `RLTKR.SUBJECT_PARAM`, declared in `rlticker.js:53` with the
value `"ticker"` and the grammar `SUBJECT_PATTERN = /^[A-Z0-9.\-]{1,12}$/` at `rlticker.js:55`.

---

## Reproduction

Every command below was executed at `752699a60` and its output is reproduced verbatim in
`report.md`.

**1. The parameter is emitted.**

```
grep -rn 'deepLink' intraday-tape-lab.html swing-structure-lab.html
```

```
intraday-tape-lab.html:1855:                            deepLink: "intraday-tape-lab.html?t=" + encodeURIComponent(state.ticker)
swing-structure-lab.html:1693:                            deepLink: "swing-structure-lab.html?t=" + encodeURIComponent(state.ticker)
```

**2. Nothing reads it.**

```
grep -rn "get(\"t\")\|get('t')" *.html rlticker.js
```

Exit `1`, zero matching lines, across every root HTML route and the shared subject module. The
parameter has no reader anywhere in the tree.

**3. The canonical spelling is something else.**

```
grep -n 'SUBJECT_PARAM\|SUBJECT_PATTERN' rlticker.js
```

```
53:  var SUBJECT_PARAM = "ticker";
55:  var SUBJECT_PATTERN = /^[A-Z0-9.\-]{1,12}$/;
```

---

## Expected vs Actual

**Expected.** A published `deepLink` that names a subject opens on that subject. A reader who
follows `swing-structure-lab.html?…=SPY` sees SPY.

**Actual.** The parameter is ignored. The route opens on its default subject. The reader is given
no signal that the name they followed was discarded.

---

## The Defect Has Two Halves, Not One

This is the part that is easy to get wrong, so it is stated plainly. Correcting the emitted
spelling is necessary and **not sufficient**, because these two routes have no subject reader at
all.

```
$ grep -c 'RLTKR' intraday-tape-lab.html swing-structure-lab.html
intraday-tape-lab.html:0
swing-structure-lab.html:0
```

Zero references, in both files, despite both loading the module
(`intraday-tape-lab.html:2226`, `swing-structure-lab.html:2056`). `RLTKR` is on the page and
unused.

The two routes the precedent already corrected are not in that position:

| route | emits under | reads via |
|---|---|---|
| `options-structure-lab.html` | `RLTKR.SUBJECT_PARAM` (line 1962) | `RLTKR.linkedSubject(window.location.search)` (line 2565) |
| `gamma-trading-lab.html` | `RLTKR.SUBJECT_PARAM` (line 1512) | `RLTKR.linkedSubject(window.location.search)` (line 1842) |
| **`intraday-tape-lab.html`** | **literal `?t=` (line 1855)** | **absent** |
| **`swing-structure-lab.html`** | **literal `?t=` (line 1693)** | **absent** |

So the precedent's one-line swap closed a one-sided defect. Applying only that half here would
change a link that is ignored for one reason into a link that is ignored for a different reason.
The remedy needs both sides.

---

## Why It Fails Silently

Two mechanisms compound.

The owner-read contract validates the shape of `deepLink`, never its liveness. `rldata.js:507`:

```
if (typeof read.deepLink !== "string" || !read.deepLink) return trmFail("deep-link-required");
```

A non-empty string passes. `"…?t=SPY"` is a non-empty string, so the contract accepts a link whose
parameter nothing will ever read.

The publication block is additive by design and swallows its own failures. Both emission sites sit
inside `try { … } catch (f7Err) { /* publication is additive */ }`. Nothing surfaces, by intent —
that intent is right for publication and is what leaves this class of defect invisible.

---

## The Half-Migrated State Is A Second Defect

Two subject-bearing routes now use the shared `RLTKR.SUBJECT_PARAM`, and two still emit a literal
`?t=`. A maintainer reading the tree cannot tell from the code which convention is canonical,
because both are present and both look deliberate. Whichever route they read first becomes the
pattern they copy.

That ambiguity is a reason to close this rather than leave it open, independent of the broken link
itself.

---

## A Test Is Coupled To The Dead Spelling

```
tests/technical-analysis-decision-lab.spec.mjs:922:  await page.goto(`${baseUrl}/swing-structure-lab.html?t=SPY`);
```

The test passes today because the parameter is inert and the route falls back to a seeded default.
It must be reconciled in the same change as the fix, or it will pin the dead spelling in place.

---

## Why The Existing Convention Guard Did Not Catch This

`scripts/selftest.mjs` assertion 1.20, inside `FEATURE-027-SUBJECT-HANDOFF`, already pins the
single-convention property in both directions: it counts the parameter names a route emits and the
names the shared reader reads. It is a correct guard and it is blind here, because its subject set
is an explicit allowlist:

```
const F027_SUBJECT_ROUTES = Object.freeze(['options-structure-lab.html', 'gamma-trading-lab.html']);
```

The guard asks "do the routes I was told about agree?" rather than "which routes emit a
subject-bearing link?". A route that emits `?t=` and reads nothing is outside its subject set and
invisible to it. Widening that allowlist is part of the remedy, not a separate improvement.

---

## Impact

- Two published owner reads carry a company-scoped link that is not company-scoped. Following one
  silently opens a different subject than the one named.
- The failure is silent on both sides: the contract accepts the link, and the publication block
  swallows anything that goes wrong.
- The convention is ambiguous in the tree while this stands, so the next route to publish a subject
  link has a 50% chance of copying the dead spelling.

---

## Known Remedy, With Precedent

The remedy is known and small. It was already applied twice, in
`specs/027-company-scoped-owner-deep-links`, to `options-structure-lab.html:1962` and
`gamma-trading-lab.html:1512`. Both replaced the literal parameter with the shared constant:

```js
deepLink: "options-structure-lab.html?" + RLTKR.SUBJECT_PARAM + "=" + encodeURIComponent(state.ticker)
```

Applying the same shape here gives:

```js
deepLink: "intraday-tape-lab.html?"    + RLTKR.SUBJECT_PARAM + "=" + encodeURIComponent(state.ticker)
deepLink: "swing-structure-lab.html?"  + RLTKR.SUBJECT_PARAM + "=" + encodeURIComponent(state.ticker)
```

That is the emitting half. The receiving half has an equally established shape, used at five call
sites today (`options-structure-lab.html:2565`, `gamma-trading-lab.html:1842`,
`options-flow-feed-lab.html:714`, `volatility-sizing-lab.html:1150`,
`company-intelligence-lab.html:1724`):

```js
var handoff = RLTKR.linkedSubject(window.location.search);
```

Nothing new needs designing. The reason this is not already done is scope, not difficulty: both
files were read-only to the feature that found it.

---

## Scope Of This Packet

Filing only. No source file is modified. Specifically untouched: `intraday-tape-lab.html`,
`swing-structure-lab.html`, `rlticker.js`, `rldata.js`, `scripts/selftest.mjs`,
`tests/technical-analysis-decision-lab.spec.mjs`, and every artifact under
`specs/027-company-scoped-owner-deep-links/`.

No selftest assertion is added by this packet. An assertion that fails on a known-open defect would
turn the suite red for a defect nobody has been authorised to fix yet. The assertion belongs in the
fixing change, where it can go from red to green in one step.

---

## Root Cause

The emission and its dead parameter were introduced together in commit `a4b10dc5b`
(*Feature 007 Scope 5: owner publication and strict adapters*), which added all three lines in one
change: both `deepLink` expressions and the `?t=SPY` navigation in
`tests/technical-analysis-decision-lab.spec.mjs`. The routes were given a way to publish a subject
and were never given a way to receive one, so the parameter was never exercised end to end and its
spelling never had to agree with anything.

`rlticker.js` and its shared `linkedSubject` rule arrived later, in Feature 027, and adopted two
routes. These two were outside that feature's boundary and were left behind.

---

## Artifacts

| Artifact | Purpose |
|---|---|
| `bug.md` | this file |
| `spec.md` | the invariant that must hold |
| `design.md` | mechanism, why it is silent, the remedy and its precedent, open questions |
| `scopes.md` | two scopes with Gherkin, test plans, and unticked DoD |
| `report.md` | executed evidence for every claim above |
| `uservalidation.md` | automation readiness and human acceptance |
| `state.json` | execution state |
