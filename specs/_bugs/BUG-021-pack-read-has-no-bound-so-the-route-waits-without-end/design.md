# Design: BUG-021 — Why The Failure Handling Is Complete And The Bound Is Not

## What This Document Does And Does Not Do

It explains the mechanism behind the observation in `bug.md`, which was recorded
first. It names the remedy options and the single question the owner must answer.
It chooses nothing.

## Mechanism

### The one unbounded call

All nine declared documents are read through a single helper. It has no bound of
any kind: no `AbortController`, no `setTimeout`, no `Promise.race`. The promise
it returns settles when, and only when, the network settles.

### Everything downstream is already correct

The boot chain is a sequence of stages, and every stage already terminates in a
handler that produces the right outcome for a failed read:

| Stage | Existing handler | Outcome already correct for a failure |
|---|---|---|
| configuration | outer `.catch` | `RLTAX-CONFIG-INVALID`, `data-rl-tax-state="config-blocked"` |
| federal rule pack | same outer `.catch` | same |
| property regime packs | per-pack `.catch(() => null)` | jurisdiction unresolved, per-domain refusal names it |
| state packs | per-pack `.catch(() => null)` | same |
| benefit, mortality, medicare packs | per-pack `.catch(() => null)` | domain unresolved, per-domain refusal names it |

This round drove each of those handlers by damaging the corresponding document
and observed each produce a named refusal within about sixty milliseconds. The
handling is not merely present, it is exercised and correct.

A rejection produced by a bound is indistinguishable, at those handlers, from a
rejection produced by a 404. So the remedy needs no new handler, no new branch and
no new refusal code. It needs one rejection that today never happens.

### Why a slow read is not the same defect

A three second delay on the medicare pack produced a ready state at 3058ms and a
normal settlement. Delay is already tolerated correctly and must remain so, which
is why FR-021-005 exists: an over-eager bound would convert a working slow origin
into a refusing one.

## Remedy Options

### Option A — Bound inside the helper, declared in the configuration

Race the fetch against a declared bound, and abort the request when the bound
elapses so no request is left outstanding. Every read inherits it, and every
existing handler receives the rejection it already knows how to handle.

This requires a new declared member, which is the open question below.

### Option B — Bound inside the helper, value embedded in the route

The same change with the number written into the route. It needs no contract
change and could ship immediately.

It is rejected as a design, and recorded only so the rejection is on the record:
the route's own discipline is that a policy value is declared and validated, not
embedded. An embedded bound is a default by another name, and this tool refuses
defaults everywhere else.

### Option C — Bound only the configuration and rule-pack stages

Narrower, since those two are the stages that block the whole route. It leaves an
optional pack able to suspend the chain, which is exactly the case observed, so it
does not resolve the defect.

### What the remedy is not

It is not a retry. A retry issues a second request for the same document, which
changes the request ledger the privacy specs derive from the page's own
declarations. If a retry is ever wanted it is a separate decision with a separate
privacy review.

## Open Question For The Owner

**Where is the bound declared, given that the configuration validates an exact
key set?**

`validateConfig` in `rltaxworkspace.js` compares the sorted key list of the
document and of each section against a fixed expected list, and refuses when they
differ. A new member is therefore a deliberate contract change touching the
configuration document, the expected field list, and the section contract version
if the owner treats it as a version-bearing change.

There is also an ordering problem the owner should rule on: the configuration is
itself read through the same helper, so a bound declared inside the configuration
cannot govern the read that fetches it. Either that first read carries a
separately declared bound, or the first read is accepted as the one unbounded
read and that acceptance is recorded rather than left implicit.

This round takes no position on either.
