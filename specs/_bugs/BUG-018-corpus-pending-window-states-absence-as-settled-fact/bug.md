# BUG-018: The Corpus-Pending Window States Absence As Settled Fact

**Status:** Filed, unstarted. Reproduced in this session. Root cause established. No fix attempted.

**Severity:** P2 (Medium). Transient and self-correcting. It corrupts no data, persists nothing,
and breaks no workflow. It does show a confident, wrong, negative conclusion about a company for
as long as the window lasts.

**Filed at commit:** `dc54a8547`

**Route:** `company-intelligence-lab.html` (Company Multi-Horizon Intelligence Lab, spec 025)

**Discovered by:** a `bubbles.chaos` round against
`specs/025-company-multi-horizon-intelligence-lab`, recorded there as finding `F-CHAOS-025-01`.
That phase was authorised to stage only `specs/025-`, so it routed the finding rather than filing
it. This packet is that filing, with the finding independently re-verified rather than accepted.

---

## Summary

`company-intelligence-lab.html` sets `data-run-status="composed"` on a paint that happens **before
any corpus request has been issued**. In that window the shared cache holds no bars, every
bar-dependent adapter answers `unavailable`, and the cockpit prints a definite sentence:

> `15 of 15 mandatory dimensions have no usable source in this run. Each one names its reason below.`

All four horizon cards read `none` / `absent`. Nothing in the rendered body says the corpus is
still arriving. The settled reading for the same subject at the same commit is **13 of 15**, with
three of the four horizons carrying a direction.

The one signal that distinguishes the two states, `body[data-corpus-status]`, is machine-readable
only. No human-readable surface carries it.

The defect has **two facets**, and the second is the more damaging of the pair:

1. **Deep-link / first load.** The first composed paint always precedes the corpus request, so
   `data-run-status="composed"` while `data-corpus-status="pending"`. The absence claim is
   provisional and reads as settled.
2. **Manual apply.** During a manual subject change, `data-corpus-status` is not merely
   uninformative, it is **wrong**. It keeps the *previous* subject's value, so it can read
   `loaded` for a subject whose corpus has never been requested. In that instant even the
   machine-readable escape hatch reports a settled corpus that does not exist.

---

## Why This Matters

This contradicts the repository's binding product principle P2, `docs/Product-Principles.md:52-56`:

> Absent data shows as *unavailable* or *incomplete*. **Never zero. Never inferred. Never a
> plausible placeholder.**

and the matching blocking pattern in
`.github/instructions/product-principles.instructions.md`:

> missing data rendered as zero, neutral, or inferred

"15 of 15 have no usable source" is not a rendering of *unknown*. It is a rendering of *known
absent*, stated with the same grammar the route uses when the absence is real. The reader is given
a settled negative conclusion about a company that the route has not yet earned the right to make.

The window is **not** an artefact of injected latency. It was reached with zero injected delay on a
local static server against a cold cache, which is what caused four of the chaos round's eight
seeded journeys to sample pre-corpus state. On any real network it is wider and plainly readable.

---

## Reproduction

Serve the repository over `http://` (any static server; the route also runs from `file://`, where
the committed corpus request behaves differently). Then, in a browser:

1. Clear `localStorage` and `sessionStorage`, so the shared corpus cache is cold. A returning
   reader whose cache already holds one bar leg sees a smaller overstatement, not none.
2. Open `company-intelligence-lab.html?symbol=MSFT`. **No latency injection is required.**
3. Wait for `body[data-run-status="composed"]` **only**. Do not wait on `data-corpus-status`.
4. Read `#cockpit-coverage-line` and the `[data-horizon]` cards.

Observed at `dc54a8547`, with zero injected delay:

```text
[zero-delay:first-composed-paint] corpus=pending run=composed unavailable=15
[zero-delay:first-composed-paint] coverageLine = 15 of 15 mandatory dimensions have no usable source in this run. Each one names its reason below.
[zero-delay:first-composed-paint] horizons = event=none/absent immediate=none/absent structural=none/absent swing=none/absent
[zero-delay:first-composed-paint] user-visible readiness wording present? = false
[zero-delay:settled] corpus=loaded run=composed unavailable=13
[zero-delay:settled] coverageLine = 13 of 15 mandatory dimensions have no usable source in this run. Each one names its reason below.
[zero-delay:settled] horizons = event=flat/thin immediate=constructive/thin structural=none/absent swing=constructive/thin
VERDICT reachable-with-zero-injected-delay = true
```

Holding every `**/data/**` response for 2500 ms only widens the window so the copy can be read at
human speed. The reading is identical:

```text
[in-flight:cold-cache-corpus-held] corpus=pending run=composed unavailable=15
[in-flight:cold-cache-corpus-held] coverageLine = 15 of 15 mandatory dimensions have no usable source in this run. Each one names its reason below.
[in-flight:cold-cache-corpus-held] horizons = event=none/absent immediate=none/absent structural=none/absent swing=none/absent
[in-flight:cold-cache-corpus-held] user-visible readiness wording present? = false
[in-flight:settled] corpus=loaded run=composed unavailable=13
VERDICT window-states-absence-as-settled = true
overstatement = 2 dimensions
```

Full commands, the warm-cache variant, and the stale-attribute probe are in `report.md`.

---

## Expected vs Actual

| | Expected | Actual |
| --- | --- | --- |
| Coverage claim while the corpus is pending | States that the account is incomplete, or is withheld until the corpus settles | `15 of 15 mandatory dimensions have no usable source in this run`, in the same definite grammar used for a real absence |
| Horizon cards while pending | Withheld, or marked as not yet composed against the corpus | `none` / `absent`, indistinguishable from a settled read that found nothing |
| Any user-visible pending wording | Present somewhere in the body | Absent. A body-text scan for `loading`, `pending`, `arriving`, `not yet`, `provisional`, `incomplete` returns nothing |
| `data-run-status` on that paint | Not `composed`, because the run has not composed against its corpus | `composed` |
| `data-corpus-status` during a manual apply of a new subject | `pending`, because the new subject's corpus has not been requested | Retains the **previous** subject's value; observed reading `loaded` |

---

## The Second Facet, Stated Separately

Facet 2 is not a restatement of facet 1. It is a distinct defect in the same mechanism and it
removes the only reliable workaround.

Landed settled on `MSFT`, then applied `NVDA` with `**/data/**` held 2500 ms, sampling in the
same task as the click handler:

```text
[stale-attribute:during-manual-apply-of-NVDA] corpus=loaded run=composed unavailable=15
[stale-attribute:during-manual-apply-of-NVDA] identity = NVDA? (NVDA?) resolved on committed-bars, no SEC identity.
[stale-attribute] the attribute reports "loaded" for a subject whose corpus was never requested = true
```

A consumer that follows the committed suite's own convention and waits for
`data-corpus-status ∈ {loaded, unavailable}` is therefore **not** protected during a manual apply.
The attribute was already `loaded` before the new subject's corpus was requested, so the wait
returns immediately on a stale value.

**What was NOT observed:** a coverage number that drifted after that stale-`loaded` paint. Both
subjects tried (`AAPL`, `NVDA`) happen to settle at the same count they showed during the apply,
so the lie was visible in the attribute but did not change the printed sentence in those two runs.
The lie is established; a drifting reading behind it is not. See `design.md` for why it is
nonetheless reachable.

---

## Why The Existing 37-Test Browser Suite Does Not Catch It

`tests/company-intelligence-lab.spec.mjs` passes 37 of 37 while this defect is live, and it does so
for a structural reason rather than by luck.

Every test in that file enters through one fixture,
`openComposedRoute` at `tests/company-intelligence-lab.spec.mjs:42`, whose readiness gate is:

```js
await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });
await expect(page.locator('body')).toHaveAttribute('data-corpus-status', /^(loaded|unavailable)$/);
```

`tests/company-intelligence-lab.spec.mjs:58-59`. The fixture waits the defect out. Every assertion
in the file therefore runs against **settled** state, which is correct. The pending window is not
under-asserted; it is never sampled at all.

The one test that does enter the window on purpose, the offline first-paint test at
`tests/company-intelligence-lab.spec.mjs:1121-1174`, asserts that the route *reaches* a composed
cockpit from the embedded registry with no runtime fetch resolved. It asserts nothing about whether
the copy on that paint is honest, and then waits for
`data-corpus-status` to leave `pending` before its remaining assertions.

The unit suite (`tests/company-intelligence.unit.mjs`, 90 of 90) cannot catch it either. It
exercises `rlcompanyintel.js`, which is handed a corpus and asked to compose. Readiness is not one
of its inputs and it has no way to express the distinction. See `design.md`.

The gap is therefore a **missing test category**, not a broken test. Any fix must add a case that
samples the composed paint *before* the corpus settles and asserts the copy is not definite.

---

## Impact

- A reader who follows a published `?symbol=` deep link sees, for the width of the corpus fetch, a
  confident claim that a company has no usable data across every mandatory dimension. On a slow
  connection this is the first and possibly only thing they read.
- The claim is wrong by two dimensions for the one company with committed coverage (`15 of 15`
  against a settled `13 of 15`), and wrong about three of four horizon directions.
- Any consumer keying on `data-corpus-status` to avoid the window is unprotected during a manual
  apply, per facet 2.
- No data is corrupted, nothing is persisted, and the view self-corrects. Hence P2 and not P1.

---

## Root Cause

Stated in full in `design.md`. In one sentence: **corpus readiness is not an input to composition,
and the composed paint is unconditionally scheduled ahead of the corpus request.**

- `company-intelligence-lab.html:1697-1707` — `paintFromEmbedded()` calls `run()` synchronously.
- `company-intelligence-lab.html:1736-1749` — the first `loadCorpus()` is reached only after that
  paint has already happened.
- `company-intelligence-lab.html:1460-1462` — the coverage sentence is unconditional prose with no
  branch on readiness.
- `company-intelligence-lab.html:1484` — `setBodyState("composed", ...)` declares the run composed
  regardless of `corpusStatus`.
- `company-intelligence-lab.html:1503-1507` — `compose()` and `render()` run before
  `loadCorpus()`, and `corpusStatus` is reset to `pending` inside `loadCorpus()` at
  `company-intelligence-lab.html:1540`, one turn too late. This is facet 2.

---

## Scope Of This Packet

**Filed, not fixed.** This packet contains reproduction, root-cause analysis, a specification of
the corrected behaviour, and scoped work. It changes no shipped file, no test, and no
configuration. The remedy choice named in `design.md` carries a product decision that is not
agent-dischargeable; see `design.md` open questions.

`specs/025-company-multi-horizon-intelligence-lab/report.md` was deliberately **not** edited. Its
`### Chaos Evidence` section is the historical record of the phase that found this, including its
correct refusal to file across a staging boundary, and rewriting it would falsify that record.

---

## Artifacts

| File | Contents |
| --- | --- |
| `bug.md` | This file: what breaks, how to see it, why it matters |
| `spec.md` | The behaviour the corrected route must exhibit |
| `design.md` | Mechanism, the two facets, remedy options, open questions |
| `scopes.md` | Scoped work with Definition of Done, all unticked |
| `report.md` | Verbatim reproduction evidence and filing verification |
| `uservalidation.md` | Human acceptance, unfilled: nothing has been delivered |
| `state.json` | Control-plane state, `in_progress`, zero scopes started |

**Educational research only. Not investment advice.**
