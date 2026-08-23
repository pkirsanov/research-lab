# Design: BUG-014 — Analysis Of The Dead Subject Parameter

**Filed at commit:** `752699a60`
**Status:** Analysis complete, remedy known, nothing implemented

---

## What This Document Does And Does Not Do

It establishes the mechanism, isolates why the defect is silent, names the remedy and its
precedent, and records what the precedent does **not** cover.

It does not implement anything, and it does not decide the one thing that is genuinely a product
choice: what a reader should see when a named subject cannot be honoured. That is open question 1
below.

---

## Mechanism

Both routes publish a Feature 007 owner read at the end of their render. The read carries a
`deepLink` naming the company just rendered:

```js
/* intraday-tape-lab.html:1855 */
deepLink: "intraday-tape-lab.html?t=" + encodeURIComponent(state.ticker)

/* swing-structure-lab.html:1693 */
deepLink: "swing-structure-lab.html?t=" + encodeURIComponent(state.ticker)
```

The parameter name `t` has no reader. Across every root `*.html` route and the shared subject
module, `grep` for `get("t")` and `get('t')` returns zero lines. The canonical name is
`SUBJECT_PARAM`, declared once:

```js
/* rlticker.js:53,55 */
var SUBJECT_PARAM = "ticker";
var SUBJECT_PATTERN = /^[A-Z0-9.\-]{1,12}$/;
```

A reader who follows the published link supplies `t=NVDA`, no code inspects it, and the route
initialises from its own default state. The link is syntactically valid, contract-valid, and
semantically inert.

---

## Isolating The Two Halves

The emission is wrong. The reception is absent. These are separate facts and the second is easy to
miss, because the precedent fix did not have to address it.

```
$ grep -c 'RLTKR' intraday-tape-lab.html swing-structure-lab.html
intraday-tape-lab.html:0
swing-structure-lab.html:0
```

Both files load the module — `intraday-tape-lab.html:2226` and `swing-structure-lab.html:2056`
both carry `<script src="rlticker.js" defer></script>` — and neither references anything it
exports. The module is present and unused.

The four subject-bearing routes divide cleanly:

| route | emits under | reads via | state |
|---|---|---|---|
| `options-structure-lab.html` | `RLTKR.SUBJECT_PARAM` (1962) | `RLTKR.linkedSubject` (2565) | correct |
| `gamma-trading-lab.html` | `RLTKR.SUBJECT_PARAM` (1512) | `RLTKR.linkedSubject` (1842) | correct |
| `intraday-tape-lab.html` | literal `?t=` (1855) | none | **both halves broken** |
| `swing-structure-lab.html` | literal `?t=` (1693) | none | **both halves broken** |

The consequence for the remedy is direct. Correcting only the emitted spelling converts "the link
is ignored because nothing reads `t`" into "the link is ignored because nothing reads anything".
The user-visible outcome is unchanged. Both halves have to land together.

---

## Why The Defect Is Silent

Silence is what makes this worth filing rather than noting, and it comes from two independently
reasonable decisions meeting.

**The contract validates shape, not liveness.** `rldata.js:507` is the whole of the check:

```js
if (typeof read.deepLink !== "string" || !read.deepLink) return trmFail("deep-link-required");
```

It rejects a missing link and a non-string link. It cannot reject a well-formed link whose
parameter has no reader, because liveness is not a property of the string. `rldata.js:578` then
supplies `id + ".html"` as a fallback, so even an absent link degrades to something plausible.

**Publication is deliberately additive.** Both emission sites sit inside
`try { … } catch (f7Err) { /* publication is additive */ }`. That is the right shape: a failed
publication must never break the owner's own render. It also means a defective emission produces no
console error, no failed assertion, and no visible symptom.

Neither decision is the defect. Together they mean a dead link and a live one are
indistinguishable from outside, which is why this survived from `a4b10dc5b` to now.

---

## Why The Existing Convention Guard Is Blind Here

`scripts/selftest.mjs` assertion 1.20 already pins exactly this property, in both directions. Its
own comment states the intent precisely:

> Every assertion above proves the CORRECT name works; none of them counts NAMES, so a SECOND
> convention arriving alongside `ticker` survived all of them — a fallback read of `t` in the
> shared reader, or a `?t=` parameter in the deep link a route publishes about itself.

It counts emitted names, requires each subject route to delegate its query read to
`RLTKR.linkedSubject`, and requires every emitted name to resolve to `SUBJECT_PARAM`. It would
catch this defect immediately — over the routes it knows about:

```js
const F027_SUBJECT_ROUTES = Object.freeze(['options-structure-lab.html', 'gamma-trading-lab.html']);
```

The subject set is an explicit two-element allowlist. Assertion 1.20 asks "do the routes I was told
about agree with each other?", not "which routes in the tree publish a subject-bearing link?". A
route outside the allowlist is not checked and not reported as unchecked.

That is a defensible construction — Feature 027 owned two routes and pinned two routes — and it is
why widening `F027_SUBJECT_ROUTES` is part of the remedy rather than an optional extra. Landing the
code fix without widening the set leaves the same blind spot for the next route.

---

## The Half-Migrated State

Four subject-bearing routes, two conventions, both live, neither marked provisional. A maintainer
adding a fifth route reads one of the four and copies it. Two of the four teach the dead spelling.

This is a second-order reason to close the packet rather than leave it open. The broken link
affects readers who follow it; the ambiguity affects every future route, and it compounds quietly
because copying a convention from working code is normally the correct instinct.

---

## The Coupled Test

```
tests/technical-analysis-decision-lab.spec.mjs:922
  await page.goto(`${baseUrl}/swing-structure-lab.html?t=SPY`);
```

It was introduced by the same commit as the emission, `a4b10dc5b`. It passes today, and it passes
*because* the parameter is inert: the test seeds `SPY` bars into `RLDATA` directly before
navigating, so the route reaches the expected state regardless of the query string.

That makes it a passive pin on the dead spelling. Once the route honours `SUBJECT_PARAM`, `?t=SPY`
becomes a subject the route is told nothing about. The test must move in the same change. It is not
collateral damage — it is part of the fix's surface.

---

## Remedy

### The emitting half — precedent exists, applied twice

Feature 027 corrected the identical defect in two files. The shape is settled:

```js
/* options-structure-lab.html:1962 — the reference */
deepLink: "options-structure-lab.html?" + RLTKR.SUBJECT_PARAM + "=" + encodeURIComponent(state.ticker)
```

Applied here:

```js
deepLink: "intraday-tape-lab.html?"   + RLTKR.SUBJECT_PARAM + "=" + encodeURIComponent(state.ticker)
deepLink: "swing-structure-lab.html?" + RLTKR.SUBJECT_PARAM + "=" + encodeURIComponent(state.ticker)
```

Assertion 1.20 resolves the symbolic form through the real export, so composing from
`RLTKR.SUBJECT_PARAM` satisfies it while a hard-coded second spelling does not. No new mechanism,
no new number.

### The receiving half — precedent exists, five call sites

The reader shape is equally settled and is in use at five sites:
`options-structure-lab.html:2565`, `gamma-trading-lab.html:1842`, `options-flow-feed-lab.html:714`,
`volatility-sizing-lab.html:1150`, `company-intelligence-lab.html:1724`.

```js
var handoff = RLTKR.linkedSubject(window.location.search);
```

`linkedSubject` returns `{ status, subject, raw }` with `status` in `accepted | absent | refused`,
`subject` normalised and matched against `SUBJECT_PATTERN`, and `raw` always `null` so a refused
value never reaches any sink. Wiring the returned subject into each route's existing initial-state
selection is the work.

### Widening the guard

Add both routes to `F027_SUBJECT_ROUTES`. Assertion 1.20 then counts four emitted names, requires
all four to resolve to `SUBJECT_PARAM`, and requires all four routes to delegate their query read.
The guard goes from covering half the surface to covering all of it.

### What the remedy is not

It is not difficult and it is not novel. The reason it is undone is that both files were read-only
to the feature that found the defect. Difficulty is not the obstacle; authorisation was.

---

## Rejected Alternative: Teach The Reader To Accept `t`

`linkedSubject` takes an optional `paramName`, so a route could call
`RLTKR.linkedSubject(window.location.search, 't')` and keep publishing `?t=`. `rlticker.js` itself
documents when that is legitimate:

> A route that already publishes its subject under a different spelling names that spelling here.

That provision exists for `company-intelligence-lab.html`, whose hub published `?symbol=` before
the corridor existed and has readers in the wild. Neither route here is in that position: `?t=` has
never been read by anything, so no link that currently works would break. Adopting the second
spelling would preserve a convention that has never functioned and would make the tree's ambiguity
permanent rather than transitional. Rejected.

---

## Open Questions For The Owner

1. **What should a reader see when a named subject cannot be honoured?** `linkedSubject` returns
   `refused` for a value outside `SUBJECT_PATTERN` and `absent` for a missing one, and a route can
   also be handed a grammar-valid symbol that is not in its own catalog. Silently opening the
   default is the current behaviour and is what FR-014-003 objects to. What replaces it — a visible
   notice, a refusal state, an explicit fall back that says so — is a product choice, not a
   derivation. This packet does not make it.

2. **Should the owner-read contract detect a dead parameter at all?** `rldata.js:507` cannot
   validate liveness from a string. A contract-level check would need the emitting route to declare
   the parameter it publishes so the check could compare it against `SUBJECT_PARAM`. That is a
   contract change with reach beyond these two routes, and it may be the wrong place for the check
   given assertion 1.20 already does it statically over an allowlist. Worth an answer, not
   necessarily worth building.

3. **Should `F027_SUBJECT_ROUTES` stay an allowlist?** Widening it fixes today's blind spot and
   leaves the same shape: the next subject-bearing route is invisible until someone remembers to
   add it. A derived set — every root route that emits a `deepLink` containing a query parameter —
   would close the class. It is also a larger change with a wider failure surface. This packet
   records the tradeoff and picks neither.

4. **Do these two routes need the subject handoff at all, or only a correct link?** Both currently
   pick their subject from an in-page watchlist. If the product answer is that they should never
   open from a link, then FR-014-002 is wrong and the correct remedy is to stop publishing a
   subject-bearing `deepLink` rather than to honour one. That would be a smaller change and a
   different one. The owner decides which of the two the routes are for.
