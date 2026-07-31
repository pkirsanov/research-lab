# Research Lab — Product Principles

**Status:** binding. Derived from the measured product review at
[`docs/Product-Review-and-Roadmap.md`](Product-Review-and-Roadmap.md) (§11 roadmap, §12 anti-drift
contract) and from the shipped behaviour of the tools themselves.

Where this document and a spec disagree, this document wins and the spec is wrong. Where this
document and the ratified engineering constitution
([`.specify/memory/constitution.md`](../.specify/memory/constitution.md)) disagree, stop and route the
conflict for an owner decision — do not silently weaken either.

---

## 0. What this product is

> Not another dashboard — **the only market brief that publishes its own error rate.**

Everything below follows from that sentence. A dashboard shows you numbers. This shows you numbers
*and how often the numbers were wrong*, which is the only thing that makes the numbers worth
anything.

Twenty-three single-file, build-free research tools, plus one cockpit that reads across all of them,
computed in the browser from a shared cache. Educational models — **not investment advice.**

---

## 1. The admission test

Before anything ships, one question:

> **Does this improve decision quality, or the measurement of decision quality?**

If neither, it does not ship. No exceptions for "it was nearly done", "it's only small", or "it makes
the demo better". This is D12 in the anti-drift contract, and it is the reason the roadmap says *tool
count is not the constraint — integration and feedback are.*

Corollary: adding tool #24 before the scorecard shipped would have failed this test. Adding tool #24
after it may pass, if the tool's read reaches the brief.

---

## 2. Honesty principles

These describe what the product may say to a person. They are the principles that would be most
expensive to break and hardest to detect from the outside, which is exactly why they are mechanical.

### P1 — Every displayed figure carries provenance

Every number renders as one of `observed-fact`, `user-assumption`, `model-estimate`, or
`unavailable`. An unprovenanced number does not render. *(BI-1)*

### P2 — Missing data renders as missing

Absent data shows as *unavailable* or *incomplete*. **Never zero. Never inferred. Never a plausible
placeholder.** A zero is a claim; an unknown is not. Rendering an unknown as a zero is the cheapest
possible lie and the hardest to spot. *(BI-2)*

This is why `rlmetrics.js` returns `null` rather than `0` for an unknown, and why the owner-state
builders return `null` rather than fabricating a read.

### P3 — Confidence is evidence quality, never a win probability

A stated confidence describes how good the evidence is. It does **not** claim a frequency of being
right. Only the scorecard may state realised frequencies, because only the scorecard has counted
them. *(BI-3)*

### P4 — Misses are published with equal prominence to hits

The scorecard shows the misses, in full, with the level that invalidated them, on the same screen as
the hit rate — not behind a tab, not in a smaller font, not "available on request".

**Selective reporting is the one unrecoverable failure for this product.** Every other defect can be
fixed by a commit. This one destroys the only thing that distinguishes it. *(BI-5)*

### P5 — A rate is withheld below its minimum sample

Below `scorecard-policy/v1.minResolvedSample` the hit rate is **withheld** and the sample size is
shown instead. A rate over a handful of calls is noise dressed as evidence, and publishing it would
break P3 while appearing to honour P4.

Not-evaluable calls are reported as their own share and **never** counted as wins. A scoring rule that
can only produce satisfaction is not a scoring rule.

### P6 — Say when the read is old

The written narrative is refreshed on a schedule that can silently stop. When it does, the page says
so in plain language rather than presenting a stale read as a current one. An absent narrative is
**never** treated as a fresh one.

### P7 — No blackbox numbers

Every analytic is recomputed in the browser from fetched data. Estimates are labelled as estimates
and proxies as proxies. If a figure cannot be traced to its inputs, it does not belong on the page.

### P8 — Model-authored text is data, never markup

Every string a model wrote is escaped at every rendering sink. *(BI-7, D1)*

---

## 3. Access and independence principles

### P9 — Works with nothing

Every tool works with **no key, no proxy, and no account** — degrading honestly rather than breaking.
A tool that shows an empty shell without credentials has failed this principle, not the user. *(BI-6)*

### P10 — UMD, never ESM

Shared browser+Node modules use `module.exports` plus a global attach. `file://` operation is a
**product feature**, not an accident: a research tool you cannot open without a web server is a tool
you cannot open on a plane. *(D11)*

No bundler. No build step. A tool is one file you can read.

### P11 — Reuse, never refetch

Configure provider access once, share market data through the `rlData` cache, and **append** only the
missing or stale delta. A tool that refetches a series a sibling already cached is wasting the user's
rate limit to save the developer five minutes.

### P12 — Cache-first, automatic first paint

A tool paints a meaningful view **on load**, from cache, then fetches only the delta. A tool that
shows an empty shell until you click "fetch" is a defect.

### P13 — Tickers only, forever

Committed artifacts contain tickers and nothing else. **No position sizes, no cost basis, no P&L in
the public repo, ever.** *(BI-4)*

Single-operator is a **feature**, not a limitation — it is precisely what makes publishing the miss
rate possible. A multi-user product cannot publish one honest error rate, and the moment it tries it
acquires a reason not to.

---

## 4. Interface principles

### P14 — Simple is the default, Power is the drill-down

Every tool opens on a decision-first cockpit: one clear read, plus a few steerable levers that
recompute the verdict live. Everything dense lives behind Power. A tool that opens into a wall of
panels has buried its own answer.

### P15 — Everything is explained in place

Every ticker links out with a rich tooltip. Every term, KPI, badge, chart, axis, and value carries a
tooltip saying **both** what it is **and** what the current value means in this context. A value with
no contextual tooltip is a defect, not a nicety — including inside `<canvas>`, which is why charts
register hit-test tooltips.

### P16 — Deep-link, never duplicate

The brief links to the tool that owns each piece of math. It does not reimplement it. There is one
implementation of each metric, so the brief and the tool cannot disagree. *(D4)*

---

## 5. Structural principles

### P17 — Reachable or removed

Nothing ships to the site root without a registry entry and a navigation entry. Shipped-but-hidden
assets are dead weight that looks like progress. *(D2)*

### P18 — Wired or not shipped

No shared module lands without a **production** consumer. **Tests are not consumers.** A module whose
only caller is a spec file is a module that has never been used. *(D3)*

### P19 — One definition per concept

A financial metric is defined once, in one module. Three implementations of Sharpe across two
conventions is three chances to be inconsistent in public. *(D4)*

### P20 — Every claim is scoreable

A recommendation carries its own instrument, level, invalidation, and horizon — enough to be scored
later without a human re-reading it. A claim that cannot be machine-checked is emitted
`not-evaluable`, **never silently unscoreable**. *(D5)*

### P21 — Additive contracts, append-only history

Schemas extend; history is never rewritten. A correction is a new event that references the old one,
not an edit. If the record can be quietly rewritten, the error rate is unverifiable and P4 is
worthless. *(D6)*

### P22 — Budgets are assertions

Every number in a budget has a **failing** test behind it. A budget nobody enforces is a comment.
A budget is only ever lowered when the real figure drops — **never raised to make a red build
green.** *(D7)*

### P23 — A guard that cannot fail is not a guard

Every gate carries an adversarial case proving it detects the thing it exists to detect. A test whose
fixtures all satisfy the broken code path passes whether the bug is present or not — it is
decoration. This applies to budgets, parity checks, scoring rules, and every bug-fix regression.

### P24 — Superseding closes the superseded

A bug or spec whose contract is reversed by a later artifact is closed or withdrawn **in the same
change**. *(D8)*

### P25 — Specs are capped, and never block on status

No new spec above ~40 functional requirements or ~5 scopes without a written exception — split it
instead. And no spec blocks on another spec's *status*; it blocks only on a real, named, missing
**capability**. Status-blocking is how a planning artifact holds a shipped capability hostage.
*(D9, D10)*

---

## 6. What this product deliberately does not do

Recorded so the decisions do not get relitigated. Full rationale in the review, §13.

| Not building | Because |
|---|---|
| ES modules / a bundler | Breaks `file://`, which P10 makes a feature |
| Real-time options flow | Vendors own it via proprietary feeds |
| Order execution / brokerage | Converts an educational tool into a regulated one |
| Multi-user accounts, auth, hosting | Single-operator is what permits publishing the miss rate (P13) |
| Synthetic filings presented as data | A free real source beats a synthetic one; use real data or cut the tool (P1, P2) |

---

## 7. How a change is judged

In order. A change that fails an earlier question does not get the benefit of a later one.

1. Does it pass the **admission test** (§1)?
2. Does it keep every **honesty principle** (§2) — including when data is missing, stale, or absent?
3. Does it work with **no key and no server** (§3)?
4. Is the thing it adds **reachable**, **wired**, and **defined once** (§5)?
5. Is every new claim **scoreable**, and every new budget **asserted** by a test that can actually
   fail (§5)?
6. Is the record it writes **append-only** (§5)?

---

*Educational models — not investment advice. Every figure in these tools is a hypothetical output
from editable assumptions, not a forecast. Do your own due diligence and size positions yourself.*
