# Vision — `improvement-plan` phase

**Phase slug:** `improvement-plan` · **Authoritative content:** [`docs/Improvement-Plan.md`](../../Improvement-Plan.md)
(header: *"Status: authoritative delivery plan"*) · **Measured at:** HEAD `4476cefd`, 2026-08-04

> **On the phase name.** This repository declares **no version vocabulary** — there is no `VERSION` file, no
> git tag (`git tag` → empty), and `package.json` carries `"version": "0.0.0"` for a Playwright test-harness
> package, not the product. There is also no `docs/INVESTOR_OVERVIEW.md`, so no Phase Overview table exists to
> supply a canonical phase name. Naming this phase `v1.0` would fabricate a release identity the repo has never
> declared. The slug is therefore taken from the authoritative delivery plan itself. See
> [`actions.md`](actions.md) → A1 for the rename path once the Phase Overview table lands.

---

## 1. What this product is

> Not another dashboard — **the only market brief that publishes its own error rate.**

That sentence is quoted from [`docs/Product-Principles.md`](../../Product-Principles.md) §0, which is marked
**binding**. It is restated here in full rather than cross-referenced, because a phase vision must be readable
without opening another document.

Research Lab is **23 single-file, build-free research tools** (`jq '.tools | length' tools.json` → `23`) plus one
cockpit that reads across all of them, computed in the browser from a shared cache, served static from GitHub
Pages. The models are educational — **not investment advice**.

The product's own reframing, from [`Product-Review-and-Roadmap.md`](../../Product-Review-and-Roadmap.md) §4:

> **Research Lab is a closed-loop decision journal for a discretionary investor.**
> It says **what changed**, shows **why**, records **what it claimed**, and **scores itself in public.**

## 2. Why this phase exists

The prior arc — `Product-Review-and-Roadmap.md` §11, Steps 1–9 — **shipped**. It optimised for *contract
conformance*: escaped, bounded, wired, asserted, deployed. All of that is true and none of it made the product
legible. The Improvement-Plan states the missing premise directly (§1.3):

> **A surface that a reader cannot act on has not shipped, however green its tests are.**

This phase is the response to what shipping the prior arc exposed. Its unifying thesis (§3):

> **Every surface — tool, brief, journey — should produce the same object: a legible, level-bearing,
> machine-checkable claim about a ticker the reader actually watches. The ledger scores that object. The
> scorecard publishes the score.**

One object, four failure modes: not legible (N1–N3), not about the reader's tickers (N4), not machine-checkable
(N5), nowhere to surface (N6). The steps compose because they all repair the same object.

## 3. What shipping this phase proves

That the honesty posture is **operational**, not aspirational. The competitive analysis
(`Product-Review-and-Roadmap.md` §6) is blunt about why this is the whole game:

> The one defensible edge — not a feature, a **posture**: *calibrated honesty with a published track record.*
> No subscription competitor can ever publish its own miss rate; a single-operator, no-revenue, educational
> project can. **But the posture is worth nothing until §5.3 is fixed.** Today the product has the honesty *and*
> no track record — the worst of both.

## 4. Success signal

Observable, measured by command — not by spec status:

| Signal | Command | At HEAD |
|---|---|---|
| No framework vocabulary reaches a reader | `node scripts/audit-reader-legibility.mjs` | **0 leaks / 23 of 23 tools · exit 0** ✅ |
| The reader's own tickers are answered | same audit, `covered=` on `market-brief` | **14 of 28 cells** ◐ |
| Published calls are machine-checkable | `jq '.windows["30d"].notEvaluableShare' market-brief.scorecard.json` | **0.8333** ✗ (target ≤ 0.25) |
| Every tool with data on disk reports a read | `jq '.toolCoverage' market-brief.payload.json` | **analyzed 11 · stale 5** ✗ |
| Recorded status matches shipped code | spec status sweep | **11 non-terminal specs** ✗ |

Two of five met. This phase is **in flight**, and [`features.md`](features.md) encodes that mechanically rather
than narratively.

## 5. Audience

**One discretionary investor — the operator.** Single-operator is a *feature*, not a limitation: it is the
precondition that permits publishing the miss rate at all. `Product-Review-and-Roadmap.md` §13 lists
*"multi-user accounts, auth, hosting"* under **What not to build** for exactly this reason.

Secondary: any reader who arrives at the public Pages site and can judge the tools by a published track record
instead of a claim.

## 6. Non-goals

Carried verbatim from the two authoritative "what not to build" registers
(`Product-Review-and-Roadmap.md` §13 + `Improvement-Plan.md` §9). This phase does **not**:

- migrate to ES modules or add a bundler — breaks `file://`, which is a product capability (D11, BI-6);
- rewrite tool models — already contract-declared, 23/23;
- add tool #24 before the scorecard is trustworthy;
- build real-time options flow, order execution, or brokerage integration;
- add multi-user accounts, auth, or hosting;
- **finish specs 013–016 as written** — they must be re-scoped under D9 against the §4 admission test;
- keep synthetic filings in `smart-money-flow-lab` — real data or the tool is cut;
- run a "make it prettier" visual pass before the legibility track — *a restyled hash is still a hash*;
- fabricate a matrix cell to raise `coveredCellCount` (**BI-2**);
- suppress `notEvaluable` to improve the headline rate (**BI-5**).

## 7. The admission test

Every candidate for this phase faces one question, from `Product-Principles.md` §1:

> **Does this improve decision quality, or the measurement of decision quality?**

If neither, it does not ship. No exceptions for *"it was nearly done"*, *"it's only small"*, or *"it makes the
demo better."*

## 8. Cross-product context

None. Research Lab is a standalone single-operator repository with no paired product, no companion repo, and no
shared schema boundary.
