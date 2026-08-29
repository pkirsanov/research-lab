# Spec: BUG-021 — Every Declared Document Read Is Bounded, And Exceeding The Bound Is Named

## Purpose

The route must reach a terminal, named state for every way a declared document
can fail to arrive, including the way where it simply does not arrive. Waiting is
permitted; waiting without end is not.

This specification describes the behaviour required. It does not choose the bound
or where the bound is declared, because the configuration contract validates an
exact key set per section and adding a key is an owner decision. See `design.md`.

## Domain Capability Model

**Capability: a bounded read of a declared document.**

This packet introduces exactly one capability. Every declared document the route
reads — the configuration document and the eight packs the configuration itself
declares, nine in total — is acquired through that one capability rather than
through nine independently-written reads.

| Concern | Where it belongs |
|---|---|
| Deciding how long a read may take | The declaration surface, never the call site |
| Racing a read against that bound | The single read helper |
| Aborting the underlying request when the bound elapses | The single read helper |
| Reacting to a read that did not arrive | The existing per-stage handlers, unchanged |

The capability has **two concrete implementations**, and the split is forced
rather than chosen. `design.md` `### How the circularity is resolved` records
why: the read that fetches the configuration cannot be governed by a value that
only exists once the configuration has been read. One stratum cannot express
that, so the surface is stratified into exactly two — and only two, because a
third would have nothing left to govern.

Bounding is deliberately not generalised beyond declared document reads. There
is no timeout framework here, no retry policy and no backoff schedule. FR-021-003
is the reason: a bound rejection and a read failure are the same event to
everything downstream, so the capability ends where that equivalence ends.

## Behaviour Under Specification

The route reads nine documents during boot: one configuration and eight packs. A
read that neither succeeds nor fails leaves the boot chain suspended. The route
must instead treat a read that exceeds its bound as a read that failed, and route
it into the failure handling that already exists.

## Requirements

### FR-021-001 — Every declared document read carries a time bound

No read of a declared document may be issued without a bound. This includes the
configuration, the federal rule pack, and every state, property, benefit,
mortality and medicare pack.

### FR-021-002 — The bound is declared, not embedded

The bound is a declared value, resolved the same way every other policy value the
route obeys is resolved. A literal written into the route is not acceptable,
because an undeclared constant is exactly the defaulting this tool refuses
everywhere else.

### FR-021-003 — Exceeding the bound is the same failure as a read that fails

A read that exceeds its bound rejects, and the rejection is handled by the
existing handler for that stage. A configuration or rule-pack timeout blocks with
the code that stage already uses. An optional pack timeout leaves that domain
unresolved, so the existing per-domain refusal names it.

### FR-021-004 — A terminal state is always reached

For every failure mode, including a read that never completes, `document.body`
carries a terminal `data-rl-tax-state` value and the settlement header leaves
`Loading`.

### FR-021-005 — A slow but completing read still completes

A read that is slower than a fast read but faster than the bound settles
normally, with the same result it produces today. This requirement exists so the
remedy cannot be delivered by making the route impatient.

### FR-021-006 — The reader is told which document did not arrive

The message names the document, so a person can act on it.

### FR-021-007 — Regression coverage pins both sides of the bound

Coverage asserts that a read completing inside the bound settles and a read that
never completes reaches a terminal named state.

## Acceptance Criteria

### AC-021-001

With one declared pack served by an origin that never responds, the route reaches
a terminal `data-rl-tax-state` and names the document, in bounded time.

### AC-021-002

With every document served normally, the route settles exactly as it does today,
with no change to any rendered figure.

### AC-021-003

With one declared pack delayed but still delivered inside the bound, the route
settles exactly as it does today.

### AC-021-004

No failure mode leaves the settlement header reading `Loading` once the bound has
elapsed.

## Explicitly Out Of Scope

- Retrying a read. A bound and a retry are different decisions and a retry
  changes the privacy surface by issuing a second request.
- Parallelising the boot chain. That is a separate latency question recorded in
  the stabilization report, not a correctness one.
- Any change to what the route requests. The declared asset set is unchanged.

## Grounding

- `bug.md` in this directory — the observed defect.
- `design.md` in this directory — the mechanism and the owner decision.
- `rltaxworkspace.js`, `validateConfig` — the exact-key-set validation that makes
  declaring a new configuration member an owner decision.
