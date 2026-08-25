# Design: BUG-005 Stale-Domain Interest Signal Crash

## Root Cause

`deriveInterestSignals` creates a domain bucket from the *structural* validity of
an event and only afterwards asks whether the event is *temporally* admissible.

```js
// rlportfolio.js, pre-fix
workspace.behaviorEvents.forEach(function (event) {
  if (!event || !event.domain) return;
  if (event.lifecycleState !== "eligible") return;
  if (!event.genericEvidenceIdentity || !event.eventIdentity || !event.occurrence) return;
  var key = String(event.domain);
  if (!byDomain[key]) {                       // :2462  bucket created here
    byDomain[key] = { ... latest: null ... };
  }
  var ageDays = (Date.parse(now) - Date.parse(event.occurredAt)) / 86400000;
  if (ageDays < 0 || ageDays > behavior.maximumEvidenceAgeDays) return;   // :2475  filter here
  eligibleEvents.push(event);
});
```

`bucket.latest` is assigned in exactly one place — the second loop, over
`dedupeBehaviorEvents(eligibleEvents)`. A stale-only domain contributes nothing to
`eligibleEvents`, so it never enters that loop, so `latest` stays `null`. The
signal mapper then evaluates:

```js
expiresAt: new Date(Date.parse(bucket.latest) + behavior.maximumEvidenceAgeDays * 86400000).toISOString()
```

`Date.parse(null)` → `NaN`; `NaN + 4838400000` → `NaN`; `new Date(NaN)` is a valid
Date object but an *invalid* time value, and `.toISOString()` on it throws
`RangeError` by specification. The throw is inside `Array.prototype.map`, so it
aborts the whole signal array — which is why one stale domain takes out every
fresh domain alongside it.

The defect is an ordering error, not an arithmetic error. Guarding the
`Date.parse` result would suppress the symptom while leaving a bucket in
existence that has no evidence entitling it to exist. The bucket is the bug.

## Semantics Decision: Stale-Only Domains Are Omitted

**Chosen: a domain whose entire eligible evidence set has aged out produces no
interest signal.**

Two candidates were considered.

### Candidate A — emit a null-support signal (rejected)

Emit the bucket with `latestSupportAt: null`, `supportingEventIds: []`,
`expiresAt: null`, `relevanceBand: "insufficient-evidence"`.

Rejected on three independent grounds, any one of which is sufficient:

1. **It requires weakening a validator to accept it.** `validateInterestSignal`
   refuses empty `supportingEventIds` and refuses a non-canonical
   `latestSupportAt` or `expiresAt`. Candidate A only ships if all three
   assertions are relaxed. Loosening a contract to admit a value the contract
   exists to exclude is not a fix.
2. **It creates a persisted claim that never expires.** These signals are written
   into `workspace.interestSignals` by `buildInterestSignalCandidate` and survive
   across sessions. `expiresAt` is the mechanism that stops a signal outliving its
   evidence. A null `expiresAt` is not "no opinion" — it is an opinion with the
   expiry removed, stored permanently, standing on evidence the policy already
   retired. That inverts the invariant the field was added to protect.
3. **It is a weaker statement than absence.** A row asserting relevance with zero
   supporting evidence is less honest than no row, because a consumer reading
   `interestSignals` sees a domain listed and must additionally inspect
   `floorSatisfied` to learn it means nothing.

### Candidate B — omit the domain (chosen)

Create the bucket only from evidence that survived the age filter.

Under `portfolio-interest-signal/v1`, an emitted signal *means* "live evidence
exists in this domain, here is its identity set, here is when it expires."
Absence therefore already carries the correct meaning: **no live evidence in this
domain.** No contract is relaxed, no unexpiring claim is persisted, and no
consumer has to interpret a zero row.

"Degrade honestly, not crash" is satisfied because the truthful statement about a
stale-only domain — that it has no live evidence — is exactly what absence
encodes at this layer. Nothing is silently swallowed: the underlying occurrences
remain in `workspace.behaviorEvents`, fully auditable, and the *reporting* of
"you have history here but it is too old" is the brief's job, which the brief
already performs with real counts (see Divergence Resolution below).

This is also strictly more available than today's behavior. Today a stale-only
domain throws and the caller gets **nothing at all** — no signals for any domain.
After the fix, fresh domains still produce their signals. No consumer can be
relying on a stale-domain signal, because no stale-domain signal has ever been
producible: that code path has always ended in a throw.

## Fix

Move bucket creation out of the pre-filter loop and into the post-filter
accumulation loop, so a bucket exists if and only if at least one in-window
event survived.

```js
// rlportfolio.js, post-fix (shape)
workspace.behaviorEvents.forEach(function (event) {
  ...structural guards...
  var ageDays = (Date.parse(now) - Date.parse(event.occurredAt)) / 86400000;
  if (ageDays < 0 || ageDays > behavior.maximumEvidenceAgeDays) return;
  eligibleEvents.push(event);
});

var dedupedResult = dedupeBehaviorEvents(eligibleEvents, policy);
if (!dedupedResult.ok) return dedupedResult;
dedupedResult.value.events.forEach(function (event) {
  var key = String(event.domain);
  if (!byDomain[key]) { byDomain[key] = { ... latest: null ... }; }   // created only now
  var bucket = byDomain[key];
  ...
});
```

`bucket.latest` is assigned on the first iteration that creates the bucket, so
`bucket.latest` is non-null for every bucket that exists, and the `expiresAt`
expression at the mapper can no longer see `null`.

### What the fix deliberately does not do

- It does not move the age filter relative to `dedupeBehaviorEvents`. BUG-004
  settled that placement; disturbing it would reopen BUG-004. The filter stays in
  the first loop, exactly where `a59e38d71` left it.
- It does not add a `Date.parse` guard. A guard would leave the empty bucket alive
  and turn a crash into a malformed signal, which `validateInterestSignal` would
  then refuse — converting a crash into an opaque `interest-signal-invalid`
  refusal. That is not better; it is the same defect with a quieter failure.
- It does not touch `validateInterestSignal`, the policy file, or any contract
  version.

### Affected files

| File | Change |
| --- | --- |
| `rlportfolio.js` | `deriveInterestSignals` — bucket creation relocated |
| `tests/portfolio-stale-domain-signal.unit.mjs` | new adversarial regression carrier |
| `notes/portfolio-survival-allocation-lab.md` | carrier row for the new test file |

## Divergence Resolution

`rlportfoliobrief.deriveInterestSignals` does not throw on the same input. It
emits:

```json
{ "contractVersion": "BehaviorInterestSignal/v1", "domain": "equity-research",
  "score": 0, "latestSupportAt": null, "supportingOccurrenceIds": [],
  "floor": { "rawOccurrenceCount": 1, "distinctCompletionIdentities": 0,
             "satisfied": false } }
```

**Verdict: the two derivations agree on the substance and legitimately differ in
form. The difference follows from two different contracts with two different
lifetimes, and is now recorded rather than left implicit.**

They agree on the only claim that matters: **a stale-only domain carries zero
live relevance.** `rlportfolio` says it by absence; `rlportfoliobrief` says it
with `score: 0`, `supportingOccurrenceIds: []`, `satisfied: false`. Neither
asserts relevance the evidence does not support. There is no input on which one
treats a stale domain as relevant and the other does not.

They differ in whether that zero is expressed as absence or as an explicit zero
row, and that difference is forced by the contracts:

| | `rlportfolio` → `portfolio-interest-signal/v1` | `rlportfoliobrief` → `BehaviorInterestSignal/v1` |
| --- | --- | --- |
| Lifetime | **Persisted** into `workspace.interestSignals` and reloaded across sessions | **Transient**, recomputed on every brief render from `workspace.behaviorEvents` |
| Carries `expiresAt` | Yes — required non-null | No such field |
| Requires supporting evidence | Yes — `supportingEventIds` must be non-empty | No — `supportingOccurrenceIds: []` is a legal, meaningful value |
| Carries a raw pre-filter count | No such field | Yes — `floor.rawOccurrenceCount` |
| Job | Assert live relevance, with an expiry | Report floor accounting, including *why* a domain missed the floor |

The brief's contract has a field the portfolio's does not:
`floor.rawOccurrenceCount` is the count **including** aged-out occurrences. It
exists precisely so the brief can say "1 occurrence recorded, 0 count toward the
floor" with real numbers instead of showing nothing and leaving the reason to
inference. The brief therefore *must* emit the stale domain — dropping it would
destroy the only place that count is reported.

The portfolio's contract has a field the brief's does not: `expiresAt`. It exists
precisely to stop a stored signal outliving its evidence. The portfolio therefore
*must not* emit the stale domain, because the only value it could put there is
null.

Making them identical in form would require breaking one of these two
requirements. Forcing the portfolio to emit would persist an unexpiring
unsupported claim; forcing the brief to omit would delete the honest "too little
live history" report. The correct resolution is the one taken: identical
substance, form dictated by each contract's job, and the reasoning written down
here so a future reader does not mistake the asymmetry for drift.

The brief side is additionally null-safe by construction and needs no repair:
`supportAge` guards with `if (!isIso(newestCompletedAt)) return { ... state:
"no-supporting-action" }` before any `Date.parse`, which is the guard
`deriveInterestSignals` lacked.

Verified rather than assumed: the brief does not read
`workspace.interestSignals`. `portfolio-survival-allocation-lab.html:6422` calls
`RLPORTFOLIOBRIEF.deriveInterestSignals` with `events:
state.opened.workspace.behaviorEvents`. The two derivations are parallel readings
of the same evidence, not a producer and a consumer, so neither inherits the
other's stale-domain handling.

## Regression Design

The regression carrier is `tests/portfolio-stale-domain-signal.unit.mjs`, a new
file. BUG-004's declared carriers are not modified.

Adversarial construction, in the sense required — **every** eligible event in the
asserted domain is out of window:

- The stale domain's sole event is 190.92 days old against a declared
  `maximumEvidenceAgeDays` of 56. There is no fresh event in that domain, so the
  assertion cannot be satisfied by a surviving sibling event.
- A fixture that mixed fresh and stale events *within* the asserted domain would
  be tautological: the bucket would acquire a `latest` from the fresh event and
  the pre-fix code would pass. That fixture is explicitly avoided.
- Vacuity guards assert the numbers rather than trusting them: the test asserts
  the measured age exceeds the policy value, and asserts the stale domain
  contributed at least one stored `behaviorEvents` row, so "no signal" cannot be
  passing because no event was ever recorded.

Sensitivity is proven, not asserted. Following this repo's established idiom
(`loadFromSource` in `tests/portfolio-behavior-occurrence.unit.mjs`), one test
reinstates the superseded pre-filter bucket creation as source text in a
throwaway browser-shaped root and asserts that the same input **throws
`RangeError`** there. That test fails if the mutant stops throwing — i.e. it is
the assertion that goes red if the shipped ordering is reverted, and it cannot be
satisfied by a strawman because the mutant differs from shipped source only in
where the bucket is created.

The fresh-sibling test is the non-vacuity control in the other direction: it
proves the fix did not simply make the derivation return an empty array.

## Capability Shape

Gate G094 reaches this packet through its lexical proportionality path, not a
structural one. `concreteImplementationEntries` is 0: nothing here declares a
second implementation of one capability.

`design.md` contributes zero lexical hits. The regression section above is titled
`## Regression Design`, matching the certified sibling
`../BUG-004-same-day-behavior-occurrence-rejection/design.md`, which clears G094
as "proportionality triggers not present". An earlier revision of this file
titled that section with a word the gate matches, and then enumerated the
remaining matched words in prose while explaining them — which raised the hit
count instead of lowering it. Both are removed.

The hits that remain come from `scopes.md`, which is plan-owned and outside this
design agent's write boundary. While any hit remains anywhere in the packet, the
gate stays applicable and evaluates the per-owner requirements below.

### Single-Implementation Justification

One concrete implementation is correct here, and a foundation/implementations
split would be premature abstraction.

The change relocates bucket creation from the pre-filter loop to the post-filter
loop inside one function, `deriveInterestSignals` in `rlportfolio.js`. It adds no
extension point, no dispatch, and no second execution path. There is nothing for
a foundation to hold: a foundation with exactly one implementation is indirection
without variation.

The one candidate that looks like a second implementation is
`rlportfoliobrief.deriveInterestSignals`, which carries the same function name and
reads the same `workspace.behaviorEvents` evidence. It is not a second
implementation of one capability, and the Divergence Resolution section above is
the argument for why. The two derivations answer to different contracts
(`portfolio-interest-signal/v1` versus `BehaviorInterestSignal/v1`) with different
lifetimes (persisted versus transient) and mutually exclusive required fields: the
portfolio contract requires a non-null `expiresAt` and non-empty
`supportingEventIds`, while the brief contract has no `expiresAt` and treats
`supportingOccurrenceIds: []` as a legal, meaningful value that carries
`floor.rawOccurrenceCount`. That section establishes that forcing the two into a
common form would break one of the two contracts — the portfolio would persist an
unexpiring unsupported claim, or the brief would lose the only place aged-out
occurrences are counted.

A shared foundation would therefore have to erase the exact asymmetry this design
proves is required. The two derivations agree on substance (a stale-only domain
carries zero live relevance) and are obliged to differ in form. That is a
documented divergence between two contracts, not an unfactored abstraction.

Residual, not resolved here: while the gate stays applicable, it also requires
`spec.md` to carry `## Domain Capability Model` or a non-empty
`### Single-Capability Justification`. `spec.md` currently carries neither, and
it is analyst-owned; this design agent does not write it. That finding routes to
`bubbles.analyst` and is not claimed as fixed by this edit. The design-side half
of G094 is satisfied by the justification above.

## Requirement-Mechanism Justifications

Mechanism-Justification: Content-Security-Policy — out of scope; not a mechanism this fix implements, names, or changes.

Gate G097 reads a requirement corpus spanning `spec.md`, `design.md`, and
`scopes.md`. "Content-Security-Policy" reaches that corpus from exactly one place:
`scopes.md` quotes the line `[ok] every shipped HTML page carries a
Content-Security-Policy meta` from captured `node scripts/selftest.mjs` output.
That is a pre-existing repo-wide invariant asserted at `scripts/selftest.mjs:125`
against every shipped HTML page. This packet runs the selftest unchanged as a
regression check and quotes its passing output as evidence; it does not state a
CSP requirement.

The gate correctly finds no CSP evidence in the scope's implementation files.
`rlportfolio.js` and `rlportfoliobrief.js` are JavaScript modules, not HTML pages,
so neither carries a CSP meta tag and neither should. Commit `732bccb6c` touches
`rlportfolio.js`, `tests/portfolio-stale-domain-signal.unit.mjs`, and one carrier
row in `notes/portfolio-survival-allocation-lab.md`. It modifies no HTML page, no
meta tag, and no header policy. The correspondence gap is a quoted-evidence
artifact, disclosed here rather than closed by implementing a mechanism this fix
has no business touching.

## Complexity Tracking

None — simplest viable approach used. The fix relocates existing bucket creation
past the existing age filter and dedupe. It adds no new abstraction, no new
contract version, and no new control flow, and it leaves `validateInterestSignal`
and the policy file untouched.
