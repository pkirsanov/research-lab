# Spec: BUG-018 — A Composed Reading Never States Absence It Has Not Established

## Purpose

The Company Multi-Horizon Intelligence Lab composes a coverage account and four horizon readings
from whatever the shared corpus holds at the moment it composes. When the corpus has not arrived,
"nothing is in the cache" and "this company has no source for this dimension" are the same
observation to the composer, and today they render as the same sentence.

This specification separates them. A reading that has not yet consulted its corpus must not be
presented in the grammar the route reserves for a settled finding.

It applies to `company-intelligence-lab.html` and, where the distinction has to be expressible at
all, to `rlcompanyintel.js`.

## Behaviour Under Specification

The route has three honest states for a coverage claim, and today it renders only two:

| State | Meaning | Today |
| --- | --- | --- |
| settled-present | A source answered | Rendered correctly |
| settled-absent | The corpus is resolved and this dimension has no usable source | Rendered correctly |
| not-yet-established | The corpus has not resolved, so absence is unknown | **Rendered as settled-absent** |

The third state is the subject of this specification.

## Requirements

### FR-018-001 — A definite absence claim requires a resolved corpus

The cockpit coverage sentence (`#cockpit-coverage-line`) must not assert a count of dimensions with
"no usable source in this run" while the corpus for the current subject is unresolved. It must
either withhold the count or state that the account is incomplete, in wording a reader
distinguishes from a settled account without inspecting a DOM attribute.

Satisfied when: with the corpus artificially held, the sentence rendered on the composed paint is
not byte-identical in grammar to the settled sentence, and a body-text scan finds wording that a
reader can act on.

### FR-018-002 — Horizon directions are not asserted against an unresolved corpus

A horizon card must not present `direction` and `evidenceQuality` as a composed finding while the
corpus that feeds its contributing dimensions is unresolved. `none` / `absent` on a pending paint
is indistinguishable from `none` / `absent` on a settled paint and must not be emitted as such.

Satisfied when: on a held-corpus paint, no `[data-horizon]` card presents a settled direction, or
each such card carries a machine-readable and human-readable not-yet-established marker.

### FR-018-003 — Readiness is visible without reading a DOM attribute

There must be at least one user-visible surface that distinguishes the pending window from a
settled reading. `body[data-corpus-status]` alone does not satisfy this requirement, because it is
not rendered.

Satisfied when: a text scan of the rendered body during the pending window returns
readiness wording, and the same scan on a settled paint does not.

### FR-018-004 — `data-corpus-status` describes the current subject, never the previous one

`data-corpus-status` must describe the corpus state of the subject currently on screen. It must not
retain a value earned by a previous subject. Specifically, the synchronous paint produced by a
manual apply must not report `loaded` for a subject whose corpus has not been requested.

Satisfied when: sampling `data-corpus-status` in the same task as the apply click, immediately after
a settled previous subject, yields `pending` and not `loaded`.

### FR-018-005 — `data-run-status` and corpus readiness do not contradict each other

Whatever encoding is chosen, a consumer must be able to determine from the body attributes alone
whether the currently painted reading is settled. If `composed` continues to be emitted on a
pre-corpus paint, then `data-corpus-status` must be correct at that instant (FR-018-004), so the
pair is jointly sufficient. If instead `composed` is reserved for a corpus-resolved paint, the
pre-corpus paint needs its own run status.

Satisfied when: one documented predicate over `body` attributes returns false for every pre-corpus
paint and true for every settled paint, and that predicate is used by the committed suite.

### FR-018-006 — The regression is covered by a test that samples the window

A test must sample the composed paint **before** the corpus resolves and assert on the copy it
finds. A test that waits for `data-corpus-status` to leave `pending` before asserting cannot
detect this defect and does not satisfy this requirement.

Satisfied when: a test exists that fails on the code at `dc54a8547` and passes after the fix, and
whose failure is caused by the pending-window copy rather than by a timeout.

### FR-018-007 — The fix removes no existing detection power

The 37 assertions in `tests/company-intelligence-lab.spec.mjs` and the 90 in
`tests/company-intelligence.unit.mjs` continue to pass, and `node scripts/selftest.mjs` stays at
its baseline of 3404 passed, 0 failed. No existing assertion is weakened to accommodate new copy.

## Acceptance Criteria

1. Opening `company-intelligence-lab.html?symbol=MSFT` with `**/data/**` held for 2500 ms and
   waiting only on `data-run-status="composed"` shows no definite "N of 15 ... have no usable
   source" sentence.
2. The same load shows user-visible readiness wording, which is absent once the corpus settles.
3. Applying a new subject from a settled page yields `data-corpus-status="pending"` when sampled in
   the same task as the click.
4. The settled reading for `MSFT` is unchanged from today: `13 of 15`, with `event`, `immediate`
   and `swing` carrying directions and `structural` at `none` / `absent`.
5. A new test fails at `dc54a8547` for the right reason and passes after the fix.
6. `node scripts/selftest.mjs` reports 3404 passed, 0 failed.

## Explicitly Out Of Scope

- Changing which dimensions have sources, or the settled `13 of 15` account itself. This packet is
  about honesty during a window, not about coverage breadth.
- Registering the route in `tools.json`, `index.html`, `rlnav.js`, `README.md` or
  `notes/README.md`. The route is deliberately unregistered and `TP-025-09` holds that decision.
- The 35 pre-existing failures in the `node --test` suite. They are present on `origin/main`, none
  of them mentions 025, and none is caused by or fixed by this packet.
- The chaos round's second durable-coverage recommendation (promoting the overlapping-composition
  probe into the committed suite). That is a separate spec-owner decision recorded in
  `specs/025-company-multi-horizon-intelligence-lab/report.md`.

## Grounding

- `docs/Product-Principles.md:52-56` — P2, missing data renders as missing.
- `.github/instructions/product-principles.instructions.md` — the blocking pattern "missing data
  rendered as zero, neutral, or inferred", and the UI check "Missing data renders as unavailable or
  incomplete, never as zero or a plausible placeholder".
- `specs/025-company-multi-horizon-intelligence-lab/report.md`, `### Chaos Evidence` — the
  originating finding `F-CHAOS-025-01`.
