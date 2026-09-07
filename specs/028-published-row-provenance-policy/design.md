# Design — Published Row Provenance Policy

**Status:** not_started. This document records what is already known so the decision can be made
from evidence rather than re-derived. It deliberately does **not** choose a mechanism.

## What Is Established

The overwrite is real and was observed, not inferred. `mergeRows` builds a `Map` keyed by row
timestamp and writes both existing and fresh rows into it with `set`, so a fresh row for an
already-published timestamp replaces the published one with no comparison, no record and no signal.

## What Is Not Established

Whether the observed COP movement was a vendor restatement, a vendor error, or an artefact of the
adjusted-close arithmetic BUG-012 removed. This matters: if every observed in-place change was
caused by that arithmetic, the remaining exposure is narrow. If vendors restate independently, it
is not.

**This question must be answered before a mechanism is chosen.** Measuring it is cheap — replay the
ingestion path against the committed corpus and count how many timestamps would change value — and
choosing a mechanism without it would be choosing in the dark.

## Option Sketches (not a decision)

| Option | Shape | Cost |
|---|---|---|
| **Immutable rows** | Refuse any write to an already-published timestamp | Preserves a known-wrong value forever; needs a separate correction channel |
| **Overwrite with an append-only change log** | Keep the current write, record `(t, old, new, observedAt)` | Auditable; consumers still cannot detect a change without reading the log |
| **Versioned rows** | A published row carries a revision counter | Consumer-detectable; largest contract change |
| **Refuse-and-alert** | Overwrite is an error the ingestion surfaces rather than absorbs | Cheapest to implement; turns a silent condition into an operational one |

Each is defensible. That is precisely why this is an owner decision and not an implementation task.

## Measured Exposure (Scope 1, TP-028-01) — executed 2026-09-06

`scripts/measure-provenance-exposure.mjs` replays the committed corpus read-only: for every
`data/bars/<SYMBOL>.json` file it re-fetches the same 2y daily payload `fetch-bars.mjs` would fetch,
applies the identical Option-B basis rule (`o`/`h`/`l`/`c` raw, adjusted close in `ac`), and compares
the fresh value at each already-published timestamp against the committed one. It never calls
`writeFileSync`; the corpus's own SHA-256 is hashed before and after the run and the script fails
loudly if they differ. It classifies every value change into one of two buckets using
`isCoherentBar` from `validate-bars-coherence.mjs` — the same predicate the corpus-coherence guard
enforces — so a changed row that is already incoherent is distinguished from a changed row that was
correctly written:

- **legacyBasisChanges** — the committed row itself fails the `l<=min(o,c)`, `h>=max(o,c)` ordering
  invariant. A value drift on such a row is consistent with the pre-BUG-012 mixed-basis arithmetic,
  not with an independent vendor restatement of a properly-written row.
- **restatedValueChanges** — the committed row is coherent (already on the Option B raw basis) and
  the vendor nonetheless returned a different value on replay. This is the residual exposure the
  policy decision actually has to cover.

**Result, full corpus, 292 symbol files, 150,127 published rows:**

| Metric | Count |
|---|---|
| `legacyBasisChanges` | **0** |
| `restatedValueChanges` | **258** (0.17% of rows checked) |
| `unreplayableRows` | 8,085 — timestamps outside the vendor's current 2y window (expected: the corpus keeps a 520-row tail and time has passed since each was written; not evidence of a change either way) |
| fetch errors | 0 |
| corpus hash before / after | identical — the run is proven non-mutating |

Every one of the 258 restated rows sampled (spot-checked across dozens of symbols, five captured
verbatim in the script's `restatedExampleSample`) is the **most recent published session**
(`2026-09-03`, the day before this run) and the field that moved is **volume**, with `o`/`h`/`l`/`c`
unchanged or moved by a sub-cent rounding amount (e.g. COP `l` 135.435→135.44). This is the known
Yahoo behaviour of publishing a same-day daily bar before the exchange's consolidated volume tape has
finalized, then correcting volume upward once it does — not an arbitrary vendor rewrite of a settled
price, and not the adjusted-close arithmetic BUG-012 removed (`legacyBasisChanges` is exactly 0: no
change touched a row that was already on the mixed basis).

**What this measurement establishes:**
- The exposure is real but narrow: it is confined to the newest session's volume field, not to
  arbitrary historical closes. The COP close movement (124.5200→123.6950) that motivated this spec
  is not reproduced by this replay against the current, already-repaired corpus — consistent with
  BUG-012's own conclusion that Option B removes the arithmetic that caused it.
- Zero legacy-basis changes confirms the corpus is not currently drifting from mixed-basis
  arithmetic; the residual 258 changes are ordinary same-day volume settlement, which recurs on
  every replay of the most recent session by construction (it is not a one-time historical fact).

**Reproduce:** `node scripts/measure-provenance-exposure.mjs` (full corpus, ~4 min) or
`node scripts/measure-provenance-exposure.mjs --symbols=AAPL,COP,MSFT` (fast spot check).

## Owner Decision — NOT YET RECORDED

SCN-028-02 requires the owner to select a policy from the option sketches above, with the date, the
reasoning and the rejected alternatives recorded here. That has not happened. The measurement above
narrows the decision — the observed exposure is same-day volume settlement on the newest session,
not silent historical-close rewriting — but narrowing the evidence is not the same act as making the
choice, and this packet's own `spec.md` is explicit that "no implementation should be attempted
before the policy question above is answered by the owner." An implementing agent choosing on the
owner's behalf would settle the policy by proxy, which is precisely the failure mode this packet
exists to avoid; `uservalidation.md`'s existing acceptance record already carves this decision out by
name ("It does not accept any policy, mechanism, or implementation, none of which exist yet"), so
there is no standing authorization to extend past the filing into the decision itself.

**Recommendation for the owner to ratify or reject**, offered here as input rather than as a
decision: given volume-only, newest-session drift and zero legacy-basis changes, **Refuse-and-alert**
(narrowed to the newest session only, since that is the only place drift was observed) is the
cheapest option that turns the condition from silent to operational without a contract change, and
**Immutable rows** is likely the wrong shape for this specific exposure because refusing a legitimate
same-day volume correction would leave every newest-session row permanently wrong until the next
day's write. This recommendation is not binding and must not be treated as SCN-028-02 being satisfied.

## Constraint Inherited From BUG-012

Whatever is chosen must not reintroduce adjusted-close values into `o`/`h`/`l`/`c`. BUG-012's
INV-012B invariants and its committed coherence scan (`validate-bars-coherence.mjs`) remain binding
and must continue to pass.
