# Feature: 021 Lifetime Tax Strategy Lab (Federal Slice 1)

Feature directory: `specs/021-lifetime-tax-strategy-lab`
Repository: `research-lab`
Specification owner: `bubbles.analyst`
Planning owner: `bubbles.plan` — [`scopes/_index.md`](scopes/_index.md)
Design owner: `bubbles.design` — `design.md` is **not yet authored** and remains routed.
Superseded-By: [`specs/022-federal-preferential-and-state-income-tax`](../022-federal-preferential-and-state-income-tax/spec.md) — successor slice. Nine assertions belonging to this feature are superseded there under its [Assertion Supersession Contract](../022-federal-preferential-and-state-income-tax/spec.md#assertion-supersession-contract), each replaced by a stronger assertion. Nothing in this specification is corrected or withdrawn by that; Feature 022 changes behaviour this feature deliberately shipped, and the successor's ledger records what each replacement preserves.

This specification adopts or rejects every Planned Requirement Anchor
(`PRA-021-001` … `PRA-021-038`) recorded in [`scopes/_index.md`](scopes/_index.md)
and carries the planning deferral register verbatim. It resolves exactly one
open decision that was routed here — the declared tax year of the first federal
rule pack — and records the primary source that decision rests on.

It does **not** fix module boundaries, the rule-pack JSON schema, the closed
`RLTAX-*` enum membership, the calculation order, or the component tree. Those
remain owned by `design.md`.

---

## Problem Statement

A household approaching or inside retirement makes irreversible tax decisions —
how much to convert to Roth this year, how much long-term gain to realize —
against a number nobody shows them honestly. The statutory bracket rate is not
the cost of the next dollar. The cost of the next dollar is a curve produced by
every threshold that moves when income moves, and most consumer tools either
quote the statutory rate as if it were the answer or render a complete-looking
plan whose unstated assumptions are doing the work.

Two failure modes matter more than accuracy here, because they are the ones a
user cannot detect:

1. **A plausible number in place of a refusal.** A tool that does not carry a
   state rule pack and shows an "estimated effective state rate" has not
   estimated anything; it has substituted an average for a calculation and
   labeled it a result.
2. **A current-law threshold silently extended into another year.** A bracket
   table with no declared effective year and no declared indexing rule will
   answer a question about 2029 with 2026's numbers and give no sign it did.

This feature builds the smallest honest thing: one federal tax year, resolved
from a source-qualified rule pack, with an explicit `Unavailable` for every
domain it does not carry. It is deliberately narrower than the source proposal
in [`notes/lifetime-tax-strategy-lab.md`](../../notes/lifetime-tax-strategy-lab.md),
because that proposal's own handoff lists roughly thirteen unresolved owner
decisions and states it is larger than five scopes can carry.

---

## Outcome Contract

**Intent.** A household supplies a filing status, one declared tax year, at
least one supported income amount and a deduction mode, and learns three things
it could not previously get from an honest source: what its federal tax is for
that year under a named and dated rule pack, what the next dollar of ordinary
income and the next dollar of realized long-term gain actually cost as a curve
rather than a rate, and what one bracket-fill Roth conversion would cost in that
same year. Everything the tool cannot compute is named, not omitted.

**Success signal.** For the declared tax year, an independent reader can take
the displayed result, the displayed reconciliation identity and the displayed
pack source records, and re-derive the federal tax figure from the cited primary
IRS source without consulting this repository. Every domain outside the slice
renders an `Unavailable` record carrying a code, a reason and a remediation, and
the effective marginal rate curve carries a non-empty list of thresholds it does
not model.

**Hard constraints.**

- Federal only. Every other jurisdiction renders `Unavailable`.
- Exactly four supported income kinds: ordinary income, qualified dividends,
  long-term capital gains, tax-exempt interest.
- One declared tax year. No threshold is extended into any other year under an
  indexing assumption the pack does not declare.
- Every result field carries a rule status from a closed enum.
- No probability of any kind. No lifetime total. No break-even year. No ranking.
  No recommendation.
- No published error rate, self-invalidation statistic, track record or accuracy
  figure anywhere in spec text, scope text or user-facing copy.
- Local-only. The only runtime transport is same-origin reads of this route's own
  declared policy and rule-pack documents. No household value in any URL,
  request, referrer, console message or committed artifact.
- Educational only. Not tax advice. Does not prepare or file a return.

**Failure condition.** The feature fails — even with every test green — if a
user can read a number off this tool and be unable to tell which tax year it
applies to, which primary source produced it, or which federal provisions were
left out of it. It also fails if any deferred domain renders as a zero, a blank,
a bare dash or a national average instead of a named refusal.

---

## Resolved Open Decision: The Declared Tax Year

The plan routed exactly one open decision to this specification: **which single
tax year does the first federal rule pack cover?**

### Decision

**Tax year 2026.** The pack's `effectiveTaxYears` is the single year `2026`, and
its rule status for that year is `enacted-current-law`.

### Primary source retrieved in this session

| Field | Value |
| --- | --- |
| Source title | *IRS releases tax inflation adjustments for tax year 2026, including amendments from the One, Big, Beautiful Bill* |
| Release identifier | IR-2025-103 |
| Release date | Oct. 9, 2025 |
| Source URL | `https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill` |
| Publisher | Internal Revenue Service |
| Retrieved | 2026-08-17, in this authoring session |
| Retrieval outcome | **Retrieved successfully.** Content read directly. |

That release names the detailed authority for the same adjustments:

| Field | Value |
| --- | --- |
| Source title | Revenue Procedure 2025-32 |
| Source URL | `https://www.irs.gov/pub/irs-drop/rp-25-32.pdf` |
| Retrieved | Attempted twice on 2026-08-17 in this session |
| Retrieval outcome | **NOT retrieved.** Both attempts returned a content-extraction failure. Its contents are therefore not asserted anywhere in this specification. |

### Why 2026 and not another year

- **2026 is the most recent tax year for which a primary IRS source was
  actually retrieved in this session,** and as of the 2026-08-17 authoring date
  it is also the current tax year, which is why its status is
  `enacted-current-law` rather than `enacted-scheduled-law`.
- **2025 was retrieved and rejected.** The tax-year-2025 release
  (IR-2024-273, Oct. 22, 2024,
  `https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2025`)
  was retrieved in this session and is labeled *"Notice: Historical Content …
  may not reflect current law"* by the IRS itself. The tax-year-2026 release
  states that the One, Big, Beautiful Bill raised the tax-year-2025 standard
  deduction above the figures in that earlier release. Building the first pack
  on a source the publisher has flagged as superseded would reproduce, on day
  one, the exact failure this feature exists to prevent.
- **2027 was not selected because no primary source for it was retrieved.** No
  tax-year-2027 revenue procedure or newsroom release was retrieved in this
  session, so no 2027 figure may be asserted.

### What the retrieved release does and does not carry

The retrieved release carries, for tax year 2026, the standard deduction for
married-filing-jointly, single/married-filing-separately and head-of-household,
and the ordinary-income marginal-rate thresholds for **single and
married-filing-jointly only**. It does **not** carry the full
married-filing-separately or head-of-household bracket tables, and it does
**not** carry the long-term capital gain / qualified dividend rate thresholds,
which this feature requires for `FR-021-013`.

> **Transcription rule.** The rule-pack JSON is transcribed from Revenue
> Procedure 2025-32 directly, retrieved by the implementer at implementation
> time with its own `retrievedAt` recorded in the pack. Figures summarized in
> this specification exist for source-traceability only and are **not** a
> transcription source. A secondary site, a memory, and this document are all
> equally unacceptable as a pack value source.

The gap above is recorded as a blocking implementation input in
[Blocking Implementation Inputs](#blocking-implementation-inputs).

---

## Scope Of This Feature

One self-contained household tax workspace, one source-qualified federal rule
pack for tax year 2026, deterministic annual federal tax, an effective marginal
rate curve, and exactly one Roth conversion comparison — no conversion versus
fill to a selected ordinary bracket — delivered across five scopes and fifteen
scenarios `SCN-021-001` … `SCN-021-015`.

---

## Goals

1. Make the applicable rule pack, its year, its primary source and its
   unsupported features visible **before** any tax number is computed.
2. Produce a deterministic federal tax figure for the declared year that
   reconciles visibly rather than by assertion.
3. Price the next dollar as a curve with every contributing threshold named and
   every unmodeled threshold listed.
4. Give one bracket-fill Roth conversion comparison with a complete disclosure
   of what it did not model.
5. Keep every household value local, and prove it rather than claim it.
6. Make every refusal legible: a code, a domain, a reason, and what would make
   the domain available.

---

## Non-Goals

This feature explicitly does **not** do any of the following. Each is a
deliberate exclusion, not an oversight, and none is a candidate for late scope
growth.

**Product non-goals**

1. Prepare, file, or transmit a tax return, an extension, or an estimated
   payment.
2. Give tax advice, recommend an action, rank policies, or name a preferred
   policy. The conversion comparison reports a single-year federal cost
   difference and says so.
3. Emit any probability — success, shortfall, survival, confidence-as-frequency,
   or otherwise. No path cohort exists in this slice, so no frequency exists to
   report.
4. Emit a lifetime total, a break-even year, a multi-year projection, or a
   maximum sustainable spending figure.
5. Claim a published error rate, a self-invalidation statistic, a track record,
   or an accuracy figure. See
   [Rejected Claim](#rejected-claim-published-error-rate) — this is an explicit
   rejection of a claim in the source proposal note.
6. Execute, schedule, or record a conversion, trade, withdrawal, or benefit
   claim.

**Coverage non-goals**

7. Compute, estimate, approximate, or blend any state, local, or property tax.
8. Support any income kind beyond the four named kinds.
9. Compute payroll tax, self-employment tax, the qualified business income
   deduction, the net investment income tax, the alternative minimum tax, or any
   credit.
10. Model Medicare premiums, IRMAA bands, or the premium tax credit.
11. Model Social Security benefits, claim-age search, spousal paths, or survivor
    paths.
12. Run any market simulation — Monte Carlo, bootstrap, historical path, or
    regime path.
13. Model estate tax, gift tax, 1031 exchange, trusts, or inherited-account
    windows.

**Structural non-goals**

14. Modify `rlportfolio.js`, `rlportfolioanalytics.js`,
    `portfolio-survival-allocation.config.json`, or anything under
    `specs/008-portfolio-survival-and-brief-lab/`. This feature defines an
    independent contract and shares no storage namespace with Feature 008.
15. Register the tool in `tools.json`, `index.html`, `rlnav.js`, `README.md`,
    `notes/README.md`, or market-brief coverage.
16. Touch `briefs/`, `data/`, `market-brief.*`, or any scheduled-publication
    artifact.
17. Weaken, relax, edit, or delete any existing assertion in
    `scripts/selftest.mjs`. New assertion groups are appended only.

---

## Deferral Register — Recorded, Not Omitted

Carried **verbatim** from [`scopes/_index.md`](scopes/_index.md) as that
document requires. A reader must be able to see what the tool cannot do without
inferring it from silence.

| Deferred capability | Why it is deferred from slice 1 | Earliest reachable point |
| --- | --- | --- |
| Every state tax pack | The note's open decision 1 (which state ships first) is unresolved. A generic effective-rate fallback is explicitly not a state tax calculation. | A later feature, after the owner names the first state |
| Property tax, primary home, long-term rental, vacation rental | The note's open decisions 2 and 3 (jurisdiction, rental mode) are unresolved | A later feature |
| Medicare premiums, IRMAA bands and adjustment scenarios | The note's open decision 6 is unresolved; IRMAA is a cliff whose band table is a dated rule pack this slice does not carry | A later feature |
| Social Security claim-age search, spousal and survivor paths | Requires a benefit adapter, a claim-month candidate set and the note's open decision 13 (earnings history versus entered estimate) | A later feature |
| Premium tax credit before Medicare | The note's open decision 14 (which year the pack targets) is unresolved, and the eligibility boundary has moved by legislation | A later feature |
| Payroll and self-employment tax, QBI, NIIT, AMT, credits | Outside the four supported income kinds; each is a named `unsupportedFeatures` entry in the slice-1 federal pack | A later feature |
| Monte Carlo, bootstrap, regime paths, any market simulation | Slice 1 has no path engine and no multi-year ledger | A later feature |
| Any success, shortfall or survival **probability** | With no path cohort there is no frequency to report, and a probability with no cohort behind it is a fabricated statistic | A later feature |
| Multi-year lifetime ledger, RMDs, QCDs, withdrawal order, reserve policy | Slice 1 settles exactly one tax year | A later feature |
| Roth five-year clocks, 72(t) periodic payment series, accumulation and deferral policy | Multi-year commitments with no single-year expression | A later feature |
| Estate, gift, 1031 exchange, trusts, inherited-account windows | The note places these behind separate rule contracts | A later feature |
| Registration in `tools.json`, `index.html`, `rlnav.js`, `README.md`, `notes/README.md`, market-brief coverage | A separate later scope by explicit operator instruction | A later feature |

> **Note on the deferral register and the declared year.** The register's
> premium-tax-credit row cites "the note's open decision 14 (which year the pack
> targets)" as one of two reasons that capability is deferred. This
> specification resolves the declared year for the **federal income tax** pack
> only. The premium tax credit remains deferred on its own independent ground —
> its eligibility boundary has moved by legislation — and resolving the year
> does not make it reachable. The register is reproduced unmodified above.

---

## Current Capability Map

| Capability | Exists today in this repository | Status for this feature |
| --- | --- | --- |
| Household tax workspace | None. No module, page, or contract holds filing status, tax year, or income by kind. | New. `TaxWorkspace/v1`. |
| Dated, source-qualified tax rule pack | None. No rule-pack contract exists in any form. | New. `TaxRulePack/v1`. |
| Federal annual tax computation | None. | New. |
| Effective marginal rate curve | None. | New. |
| Roth conversion comparison | None. | New. |
| Local private household state with an inventory and a clear action | Exists for the **portfolio** workspace under Feature 008 (`rlportfolio.js`). | Pattern is reused as a **model**; no module, key, or namespace is shared. Feature 008 stays byte-identical. |
| Simple/Power split, tooltips, text-equivalent tables, standard CSP, UMD dual modules | Repository-wide conventions, asserted by `scripts/selftest.mjs`. | Inherited unchanged. |
| Site deploy decision for an unregistered root page | `site-exclusions.json`, enforced by `scripts/build-pages-site.mjs`. | Consumed. One new entry. |

---

## Repository And Source Grounding

Every structural claim below was read from the repository in this session.

| Claim | Grounded in |
| --- | --- |
| `scripts/build-pages-site.mjs` refuses an unregistered root `.html` with no deploy decision | `planPagesSite()` asserts `unaccountedPages.length === 0` with the message `unregistered root page lacks a deploy decision` |
| A `site-exclusions.json` entry requires a substantive reason | The same function asserts `entry.reason.length >= 40` |
| A file listed in `site-exclusions.json` is **excluded from the packaged site**, not merely hidden from navigation | `excludedPaths` are asserted absent from the packaged destination |
| Registering the tool later requires removing its exclusion entry in the same change | `registered page is still excluded` assertion |
| The exclusion refusal covers root `.html` only, not root `.js`/`.json` | `rootPages` is filtered by `.endsWith('.html')`; the root-file packaging list filters on `NON_PUBLIC_ROOT_FILES` and the exclusion set |
| `tax-rules/` is not a published directory | `PUBLIC_DIRECTORIES` is a closed allowlist that does not contain it |
| The planning anchors, the deferral register, and the hard prohibitions | [`scopes/_index.md`](scopes/_index.md) |
| The fifteen scenarios and their per-scenario obligations | [`scenario-manifest.json`](scenario-manifest.json) and the five `scopes/*/scope.md` files |
| Product principles P1–P25 | [`docs/Product-Principles.md`](../../docs/Product-Principles.md) |
| Tax year 2026 federal inflation adjustments | IRS IR-2025-103, retrieved 2026-08-17 (see above) |

---

## Honest Findings And Research Corrections

These are findings from authoring this specification, not restatements of the
plan. Each is either folded into a requirement amendment or routed.

**F-1 — "Rounding only at the display boundary" is wrong for tax.**
`PRA-021-017` says internal precision is preserved in full and rounding is
applied only at the display boundary. Federal tax computation contains
*calculation* rounding that the rule pack itself declares in `roundingPolicy`;
deferring all rounding to display would produce a figure that does not match the
authority. Adopted **with amendment** as `NFR-021-017`: pack-declared
calculation rounding is applied exactly where the pack declares it, display
rounding is a separate and separately disclosed step, and neither is invented by
the engine.

**F-2 — Simple cannot open with an answer that does not exist yet.**
`PRA-021-031` says Simple opens first with a decision-level answer. On a first
visit there is no minimum viable input and therefore no answer. Under P2 the
honest first paint is a named incomplete state, not a zero or a placeholder
figure. Adopted **with amendment** as `FR-021-031`.

**F-3 — The One, Big, Beautiful Bill adds tax-year-2026 federal provisions the
four supported income kinds do not reach.** The retrieved IRS release states
that for tax year 2026 the limitation on itemized deductions was permanently
eliminated *but* a limitation on the tax benefit of itemized deductions applies
to taxpayers in the 37% bracket, and it refers to a senior deduction added by
that legislation. Both are real tax-year-2026 federal provisions that interact
with `FR-021-014` deduction selection. Neither is in scope. Each must therefore
appear by name in the pack's `unsupportedFeatures[]` so that
`FR-021-018` renders it rather than silently omitting it. Routed to
`bubbles.design` and recorded as a blocking implementation input.

**F-4 — The new non-HTML root files are packaged into the published site even
though their only page is excluded.** `scripts/build-pages-site.mjs` refuses
only unaccounted root `.html`; root `.js` and `.json` are packaged unless they
carry their own exclusion entry. Without entries for the new modules and the
config file, the site would ship four modules and a config whose only consumer
is a page that is not shipped — the dead-weight condition P17 and P18 exist to
prevent. Routed to `bubbles.design`; recorded as a blocking implementation
input.

**F-5 — `tax-rules/` is not in the published-directory allowlist.** The pack
directory is reachable from `file://` and from a repository checkout, which is
all this feature needs, but a later registration feature that adds the page to
`tools.json` without adding `tax-rules/` to `PUBLIC_DIRECTORIES` would ship a
page whose rule pack 404s. Recorded here so the later feature inherits the
constraint rather than rediscovering it in production.

**F-6 — The competitive claim in the source note is rejected, and the product
principles document repeats it.** See
[Rejected Claim](#rejected-claim-published-error-rate). This is the one place
where a binding repository document and this feature's hard constraints must be
read together carefully, and it is called out rather than left implicit.

---

## Domain Capability Model

Capability-first proportionality applies: this feature introduces a brand-new
capability with no existing foundation, and the rule pack is an explicitly
swappable provider-shaped artifact — one federal pack today, additional
jurisdiction and program packs later. The domain model is therefore stated
before any concrete pack, engine, or screen.

### Capability

**Source-qualified tax rule resolution and single-year settlement.** Given a
declared household position and a declared tax year, resolve which dated,
sourced rule set governs it, settle the year under that rule set, price the
marginal dollar under it, and name every domain the rule set does not cover.

### Domain primitives

| Primitive | Meaning | Lifecycle states |
| --- | --- | --- |
| **Household tax workspace** | The user's declared position for one tax year: filing status, declared year, amounts by supported income kind, deduction mode. | `empty` → `partial` → `minimum-viable` → `complete-for-supported-domains` |
| **Rule pack** | A dated, sourced, self-describing statement of what a jurisdiction's program does in a set of tax years, and what it does not cover. | `unresolved` → `resolved` → `expired` / `invalid` |
| **Rule status** | The legal standing of a result field under the resolved pack. | Closed enum: `enacted-current-law`, `enacted-scheduled-law`, `user-hypothetical-law`, `unavailable` |
| **Unavailable record** | A named refusal. Carries a code, a domain, a reason, and what would make the domain available. Never a number. | Terminal for its domain until the pack changes |
| **Annual settlement** | One reconciled tax result for one workspace under one pack. | `blocked` → `settled` |
| **Marginal cost curve** | The ordered cost of the next unit of a named income kind across a range, with named contributing thresholds and named unavailable contributors. | `blocked` → `derived` (always `incomplete` in this slice) |
| **Policy comparison** | Two named policies settled on identical inputs under an identical pack, with a closed disclosure of what was not modeled. | `blocked` → `compared` |

### Relationships

- A workspace resolves **exactly one** pack per (jurisdiction, program, year).
- A settlement is a pure function of (workspace, pack). It holds no rule value
  of its own.
- A curve is derived **from settlements**, never from a rule table. Redeclaring
  a bracket inside the curve is the P19 violation this model exists to prevent.
- A comparison is derived from settlements and one curve. It introduces no third
  definition of tax.
- An unavailable record may attach to any primitive and never carries a value.

### Business policies every concrete pack and engine must obey

1. A pack states its own coverage. Coverage is never inferred from the absence
   of a refusal.
2. A rule value exists in exactly one place: the pack. No engine, curve, policy,
   or view declares a threshold, rate, or bracket edge.
3. A year outside a pack's declared effective years is refused. Indexing is
   applied only where the pack declares an indexing rule.
4. A domain a pack does not cover produces a named refusal, never a zero, an
   average, a carried-forward value, or an omission.
5. Every emitted field carries a rule status.
6. Household values never leave the local namespace.

### Provider-neutral vocabulary

`jurisdiction`, `program`, `effective tax years`, `source record`, `supported
feature`, `unsupported feature`, `indexing rule`, `calculation order`,
`rounding policy`, `expiry policy`. Nothing in this vocabulary names the United
States, the IRS, or a specific year; the federal 2026 pack is the first instance
of the contract, not the definition of it.

---

## Rule Provenance And Status Model

| Status | Meaning | Used in this slice |
| --- | --- | --- |
| `enacted-current-law` | The rule is enacted and governs the declared year. | Yes — the tax-year-2026 federal pack |
| `enacted-scheduled-law` | The rule is enacted and scheduled to govern a future year. | Contract member only; no pack in this slice carries it |
| `user-hypothetical-law` | The user supplied the rule; it is not enacted. | Contract member only; no editor ships in this slice |
| `unavailable` | No rule is resolvable for this field. | Yes — every deferred domain |

Source authority for the federal pack is IRS revenue procedures, publications,
forms and instructions, per the source note's authority table. A secondary
summary may aid discovery and may never supply a pack value.

---

## Privacy And Trust Model

1. Household state lives in a closed local namespace owned solely by this
   feature. No key is shared with the Feature 008 portfolio workspace.
2. The page's only runtime transport is a bounded set of same-origin reads of its
   own declared policy and rule-pack documents. Nothing is read from another
   origin, and nothing the configuration does not declare is read at all.
3. No household value appears in a URL, request body, referrer, console message,
   service worker, or committed artifact.
4. The tool stores no name, address, account number, tax identifier, or
   credential — it never asks for one.
5. Persistence is visible, and a privacy inventory plus a clear action are
   reachable even when computation is blocked.
6. Export is a private local file produced only on explicit user action, is
   sanitized, and lists every field it omitted.
7. No sample data resembling a real household ships with the tool.

---

## Actors And Personas

| Actor | Description | Key goals | Boundaries |
| --- | --- | --- | --- |
| **Self-directed household** | One or two adults near or in retirement, comfortable entering their own figures, not a tax professional. | Know this year's federal tax; know what the next dollar costs; test one conversion. | Cannot see any state, property, Medicare, or benefit result. Receives no recommendation. |
| **Skeptical reader** | Someone auditing the tool before trusting a figure. | Trace every displayed number to a dated primary source; find out what the tool left out. | Reads the pack source records, the reconciliation identity, and the unavailable inventory. Needs no credentials. |
| **Repository operator** | The single operator maintaining the repository. | Ship the slice without breaking the Pages deploy, Feature 008, or the selftest suite. | Owns the deploy decision, registration timing, and the pack refresh. |
| **Rule-pack author** | Whoever transcribes a pack from a primary source. | Produce a pack that validates, declares its coverage honestly, and records its own retrieval. | May not invent a value, extend a threshold, or cite a secondary source. |

---

## Use Cases

### UC-021-001: Learn which rules apply before seeing a number
- **Actor:** Self-directed household
- **Preconditions:** Route open, no prior workspace.
- **Main flow:** Enter filing status → enter declared tax year → enter one
  supported income amount → choose a deduction mode → read the resolved pack
  identity, version, effective years and source records, the pack's unsupported
  features, and every unavailable domain.
- **Alternative flows:** Configuration missing or unknown version → dependent
  computation is blocked visibly and the privacy inventory stays reachable. Year
  outside the pack → named refusal, no substitution.
- **Postconditions:** The user knows the rule basis before any tax figure
  appears.

### UC-021-002: Settle one federal tax year
- **Actor:** Self-directed household
- **Preconditions:** Minimum viable input present, pack resolved.
- **Main flow:** Read taxable income, applied deduction and the mode that
  produced it, the ordinary-income tax, the stacked long-term gain and qualified
  dividend tax, and the reconciliation identity.
- **Alternative flows:** No deduction mode declared → incomplete-input refusal,
  no default applied. A pack-unsupported federal feature appears → named,
  rendered unavailable, and the result is not labeled a complete federal tax.
- **Postconditions:** A deterministic, reconciled, rule-statused result exists.

### UC-021-003: Price the next dollar
- **Actor:** Self-directed household
- **Preconditions:** A settled annual result.
- **Main flow:** Read the ordinary-income curve and the realized-long-term-gain
  curve, each point's marginal cost, each segment's named contributing
  thresholds with their pack source, each cliff rendered as a step, and the
  named unavailable contributors with the incompleteness label and count.
- **Alternative flows:** None — an incomplete curve is the normal case in this
  slice, and an empty unavailable-contributor list is a defect.
- **Postconditions:** The user has a curve, never a single rate.

### UC-021-004: Test one bracket-fill Roth conversion
- **Actor:** Self-directed household
- **Preconditions:** A settled annual result and a derived curve.
- **Main flow:** Select an ordinary bracket → read the conversion amount derived
  from that bracket's pack edge, the federal tax under each of the two policies,
  the difference, the effective marginal rate at the fill edge, and the closed
  `notModeled` disclosure.
- **Alternative flows:** Already at or above the edge → a labeled zero-amount
  conversion. No declared tax funding source → an unavailable record for the
  outside-funds versus withheld distinction, with no assumed default.
- **Postconditions:** A single-year federal cost difference, explicitly not a
  recommendation.

### UC-021-005: Audit the tool before trusting it
- **Actor:** Skeptical reader
- **Preconditions:** Any rendered result.
- **Main flow:** Open Power → read the rule ledger, per-bracket detail, curve
  text table, reconciliation identity and every pack source record → follow a
  source record to the primary authority.
- **Postconditions:** Every figure is traceable to a dated primary source.

### UC-021-006: Keep and remove private data
- **Actor:** Self-directed household
- **Preconditions:** Values entered.
- **Main flow:** Open the privacy inventory → see every stored key → invoke the
  explicit export and read the sensitivity warning and the omitted-field list →
  clear all private data.
- **Alternative flows:** Computation blocked → inventory and clear stay
  reachable.
- **Postconditions:** No household value has left the local namespace at any
  point.

---

## Business Scenarios

Each business scenario binds one-to-one to an existing planning scenario
identifier. No identifier is renumbered and none is invented.

### BS-021-001 / SCN-021-001: A minimum viable input yields an honestly labeled first answer

```gherkin
Scenario: SCN-021-001 A minimum viable input yields an honestly labeled first answer
  Given a household supplies only a filing status, one declared tax year, one supported income-kind amount, and a deduction mode
  When the workspace is validated and the federal rule pack is resolved
  Then the resolved pack identity, version, effective tax years, and primary source records are displayed
  And every federal feature the pack does not support is named
  And every domain the household did not supply is marked Unavailable with a reason and what would make it available
  And no unsupplied domain blocks the domains that were supplied
```

Requirements: `FR-021-002`, `FR-021-003`, `FR-021-004`, `FR-021-008`, `FR-021-010`.

### BS-021-002 / SCN-021-002: An unsupported year, jurisdiction, or income kind refuses rather than substitutes

```gherkin
Scenario: SCN-021-002 An unsupported year, jurisdiction, or income kind refuses rather than substitutes
  Given a household selects a tax year outside the pack's effective years, a state jurisdiction, or an income kind outside the four supported kinds
  When rule resolution runs
  Then each case produces an explicit Unavailable record carrying its own RLTAX code, the affected domain, and the reason
  And no substituted average, national default, extended threshold, or zero appears in its place
  And the remaining supported results stay visible and unaffected
```

Requirements: `FR-021-003`, `FR-021-005`, `FR-021-006`, `FR-021-007`.

### BS-021-003 / SCN-021-003: No household value leaves the local namespace

```gherkin
Scenario: SCN-021-003 No household value leaves the local namespace
  Given a household enters income, deduction, and filing values into the workspace
  When the page is exercised end to end and its request ledger, URL, referrer, console output, and storage keys are inspected
  Then every request the page issued is a same-origin read of a document its own configuration declares, and those declared reads resolved
  And no household value appears in any URL, referrer, console message, or committed artifact
  And every written storage key belongs to this feature's own namespace and none belongs to the portfolio workspace
```

Requirements: `NFR-021-001`, `NFR-021-009`.

### BS-021-004 / SCN-021-004: Federal tax is deterministic and exact at every bracket boundary

```gherkin
Scenario: SCN-021-004 Federal tax is deterministic and exact at every bracket boundary
  Given a household with only ordinary income for the declared tax year
  When the annual federal tax is computed immediately below a bracket edge, exactly at that edge, and immediately above it
  Then each result matches the known value derived from the resolved pack's own bracket table
  And repeating the identical input produces a byte-identical result
  And every returned field carries a rule status from the closed enum
```

Requirements: `NFR-021-011`, `FR-021-012`, `NFR-021-017`, `FR-021-018`, `FR-021-004`.

### BS-021-005 / SCN-021-005: Long-term gains stack on ordinary income rather than being taxed in isolation

```gherkin
Scenario: SCN-021-005 Long-term gains stack on ordinary income rather than being taxed in isolation
  Given a household with both ordinary income and long-term capital gains for the declared tax year
  When the annual federal tax is computed
  Then the long-term gain is taxed in the capital-gain bands that sit above ordinary taxable income
  And raising ordinary income alone changes the tax owed on an unchanged gain
  And qualified dividends receive the same stacking treatment
```

Requirements: `FR-021-013`, `FR-021-015`.

### BS-021-006 / SCN-021-006: Deduction selection is explicit and the result reconciles

```gherkin
Scenario: SCN-021-006 Deduction selection is explicit and the result reconciles
  Given a household supplies a deduction mode of standard, and separately an itemized amount
  When the annual federal tax is computed under each mode
  Then the applied deduction and the mode that produced it are displayed rather than inferred
  And the reconciliation identity between income components, applied deduction, taxable income, and tax is displayed and holds
  And a household that supplied no deduction mode receives an Unavailable record naming the missing member rather than a silently applied default
```

Requirements: `FR-021-014`, `FR-021-016`.

### BS-021-007 / SCN-021-007: The next dollar is priced as a curve, not as a single rate

```gherkin
Scenario: SCN-021-007 The next dollar is priced as a curve, not as a single rate
  Given a household with a reconciled annual federal result for the declared tax year
  When the effective marginal rate curve is computed for ordinary income and for realized long-term gain
  Then two ordered multi-point curves are returned
  And each point states the marginal cost of the next dollar at that level
  And each segment names every contributing threshold with its rule-pack source
  And no single scalar rate is offered as a substitute
```

Requirements: `FR-021-019`, `FR-021-020`, `NFR-021-023`, `FR-021-024`.

### BS-021-008 / SCN-021-008: A cliff renders as a step and is never smoothed

```gherkin
Scenario: SCN-021-008 A cliff renders as a step and is never smoothed
  Given the resolved pack declares a threshold whose crossing changes the marginal cost discontinuously
  When the curve is computed across that threshold
  Then the point immediately below and the point at the threshold carry different marginal rates with no interpolated point between them
  And the segment is flagged as a cliff rather than a phase-in
  And no averaging or gradient fill appears between the two sides
```

Requirements: `FR-021-021`.

### BS-021-009 / SCN-021-009: A threshold this slice does not carry is named unavailable, not omitted

```gherkin
Scenario: SCN-021-009 A threshold this slice does not carry is named unavailable, not omitted
  Given the federal pack lists taxable Social Security benefits, IRMAA bands, the premium tax credit, and net investment income tax among its unsupported features
  When the curve is computed
  Then each appears as an unavailable contributor with its own code and reason
  And the curve is labeled incomplete with the count
  And no unavailable contributor is rendered as a zero contribution or an omission
```

Requirements: `FR-021-022`.

### BS-021-010 / SCN-021-010: Two policies are compared on identical inputs and the fill amount comes from the pack

```gherkin
Scenario: SCN-021-010 Two policies are compared on identical inputs and the fill amount comes from the pack
  Given a household with a reconciled annual federal result and a selected ordinary-income bracket
  When the conversion comparison runs
  Then exactly two policies are returned, both computed from the identical workspace and resolved pack
  And the conversion amount equals the distance from current ordinary taxable income to that bracket's declared edge
  And changing the pack's edge changes the amount
```

Requirements: `FR-021-025`, `FR-021-026`, `FR-021-027`.

### BS-021-011 / SCN-021-011: The comparison discloses in full what it did not model

```gherkin
Scenario: SCN-021-011 The comparison discloses in full what it did not model
  Given a completed conversion comparison for the declared tax year
  When the result's disclosure is read
  Then a closed notModeled list names at minimum state tax, Medicare and IRMAA effects, the premium tax credit, the Roth five-year clocks, later-year distribution and required-distribution pressure, survivor effects, and lost growth on taxes paid
  And each entry carries a reason and a deferral code
  And the result is not presented as a recommendation, a ranking, or a preferred policy
```

Requirements: `FR-021-028`.

### BS-021-012 / SCN-021-012: The comparison emits a single-year federal cost difference and nothing more

```gherkin
Scenario: SCN-021-012 The comparison emits a single-year federal cost difference and nothing more
  Given a completed conversion comparison
  When every emitted field is inspected
  Then no field carries a probability, a lifetime total, a break-even year, a survival figure, a rank, or an accuracy claim
  And the result states plainly that it is a single-year federal tax difference
  And a household that did not declare a tax funding source receives an Unavailable record for the outside-funds versus withheld distinction rather than a silently assumed source
```

Requirements: `FR-021-029`, `FR-021-030`.

### BS-021-013 / SCN-021-013: Simple opens first with a decision-level answer and Power holds the detail

```gherkin
Scenario: SCN-021-013 Simple opens first with a decision-level answer and Power holds the detail
  Given a household has supplied the minimum viable input for the declared tax year
  When the route is opened
  Then Simple renders first without user action showing the federal tax, the conversion comparison outcome, the strongest tradeoff, and the unavailable domains
  And it shows no candidate grid, per-bracket table, rule trace, or raw curve series
  And each hidden detail links to the owning Power section
  And Power exposes the rule ledger, per-bracket detail, curve text table, reconciliation identity, and every pack source record
```

Requirements: `FR-021-031`, `FR-021-032`, `FR-021-035`, `NFR-021-036`, `NFR-021-038`.

### BS-021-014 / SCN-021-014: Every value is explained and every unavailable state is reachable without a mouse

```gherkin
Scenario: SCN-021-014 Every value is explained and every unavailable state is reachable without a mouse
  Given the route is rendered with at least one unavailable domain
  When the page is operated by keyboard alone and then at a mobile viewport
  Then every displayed value exposes a keyboard-reachable contextual tooltip
  And every chart has a text-equivalent table carrying the same points
  And every unavailable domain is focusable and states its reason and remediation
  And no unavailable domain renders as a blank, a bare dash, or a zero
  And no tax or account table becomes unreadable or horizontally trapped at the mobile viewport
```

Requirements: `NFR-021-033`, `NFR-021-034`.

### BS-021-015 / SCN-021-015: A private export happens only on explicit action and carries no identifier

```gherkin
Scenario: SCN-021-015 A private export happens only on explicit action and carries no identifier
  Given a household has entered a sentinel value into the workspace
  When the user invokes the export action and the produced file is inspected
  Then no file was produced before the explicit action
  And the user was warned the file carries sensitive financial information
  And the file contains no name, address, account number, tax identifier, or credential
  And the file lists every omitted field
  And the sentinel value appears in no network request, URL, referrer, console message, or committed artifact across the whole session
```

Requirements: `NFR-021-009`, `FR-021-037`.

---

## Requirements

### Anchor disposition

All thirty-eight planning anchors are accounted for. **Thirty-eight adopted,
three of them with a recorded amendment; zero rejected.** Each anchor keeps its
numeric suffix so the scope-file repoint from `PRA-021-0NN` to
`FR-021-0NN` / `NFR-021-0NN` is a mechanical edit.

The total requirement count is exactly thirty-eight, at the P25 cap of roughly
forty. No additional numbered requirement was created. Findings that could have
become new requirements are recorded instead in
[Honest Findings](#honest-findings-and-research-corrections) and
[Blocking Implementation Inputs](#blocking-implementation-inputs), which is the
correct place for an implementation input that is not a user-visible behavior
obligation.

| Anchor | Disposition | Becomes |
| --- | --- | --- |
| PRA-021-001 | Adopted | `NFR-021-001` |
| PRA-021-002 | Adopted | `FR-021-002` |
| PRA-021-003 | Adopted | `FR-021-003` |
| PRA-021-004 | Adopted | `FR-021-004` |
| PRA-021-005 | Adopted | `FR-021-005` |
| PRA-021-006 | Adopted | `FR-021-006` |
| PRA-021-007 | Adopted | `FR-021-007` |
| PRA-021-008 | Adopted | `FR-021-008` |
| PRA-021-009 | Adopted | `NFR-021-009` |
| PRA-021-010 | Adopted | `FR-021-010` |
| PRA-021-011 | Adopted | `NFR-021-011` |
| PRA-021-012 | Adopted | `FR-021-012` |
| PRA-021-013 | **Adopted with amendment** — the pack's capital-gain rate thresholds are a distinct declared table, not a derivation from the ordinary table | `FR-021-013` |
| PRA-021-014 | Adopted | `FR-021-014` |
| PRA-021-015 | Adopted | `FR-021-015` |
| PRA-021-016 | Adopted | `FR-021-016` |
| PRA-021-017 | **Adopted with amendment** — pack-declared calculation rounding is separated from display rounding (finding F-1) | `NFR-021-017` |
| PRA-021-018 | Adopted | `FR-021-018` |
| PRA-021-019 | Adopted | `FR-021-019` |
| PRA-021-020 | Adopted | `FR-021-020` |
| PRA-021-021 | Adopted | `FR-021-021` |
| PRA-021-022 | Adopted | `FR-021-022` |
| PRA-021-023 | Adopted | `NFR-021-023` |
| PRA-021-024 | Adopted | `FR-021-024` |
| PRA-021-025 | Adopted | `FR-021-025` |
| PRA-021-026 | Adopted | `FR-021-026` |
| PRA-021-027 | Adopted | `FR-021-027` |
| PRA-021-028 | Adopted | `FR-021-028` |
| PRA-021-029 | Adopted | `FR-021-029` |
| PRA-021-030 | Adopted | `FR-021-030` |
| PRA-021-031 | **Adopted with amendment** — an empty or partial workspace opens on a named incomplete state, never a placeholder figure (finding F-2) | `FR-021-031` |
| PRA-021-032 | Adopted | `FR-021-032` |
| PRA-021-033 | Adopted | `NFR-021-033` |
| PRA-021-034 | Adopted | `NFR-021-034` |
| PRA-021-035 | Adopted | `FR-021-035` |
| PRA-021-036 | Adopted | `NFR-021-036` |
| PRA-021-037 | Adopted | `FR-021-037` |
| PRA-021-038 | Adopted | `NFR-021-038` |

### Workspace, rule pack, and refusal vocabulary

- **NFR-021-001** — The household tax workspace is an independent contract. It
  shares no module, no storage namespace and no key with the Feature 008
  portfolio workspace, and Feature 008's modules, config, and spec directory
  remain byte-identical.
- **FR-021-002** — A rule pack declares `id`, `program`, `jurisdiction`,
  `version`, `effectiveTaxYears`, `publishedAt`, `retrievedAt`,
  `sourceRecords[]`, `supportedFeatures[]`, `unsupportedFeatures[]`,
  `indexingRules[]`, `calculationOrder`, `roundingPolicy`, `expiryPolicy` and
  `contentSha256`. A pack missing any member is refused by name and never
  defaulted.
- **FR-021-003** — Rule resolution is by jurisdiction, program and effective tax
  year. A year outside `effectiveTaxYears` is refused with a distinct
  unsupported-year code. No threshold is extended into an unsupported year under
  any indexing assumption the pack does not declare.
- **FR-021-004** — Every result field carries a rule status from the closed enum
  `enacted-current-law` · `enacted-scheduled-law` · `user-hypothetical-law` ·
  `unavailable`.
- **FR-021-005** — An unsupported year, jurisdiction, income kind, filing status
  or feature produces an unavailable record carrying a closed refusal code, the
  affected domain, the reason, and what would make it available. It never
  produces a number, a zero, a national average or a silent omission.
- **FR-021-006** — Exactly four income kinds are supported: ordinary income,
  qualified dividends, long-term capital gains, tax-exempt interest. Every other
  kind produces an unsupported-income-kind refusal.
- **FR-021-007** — Every jurisdiction other than the federal pack produces an
  unsupported-jurisdiction refusal. No state result is computed, estimated or
  approximated.
- **FR-021-008** — The minimum viable input is filing status, declared tax year,
  at least one supported income-kind amount, and a deduction mode. Every
  unsupplied domain returns an unavailable record rather than blocking
  computation of the domains that were supplied.
- **NFR-021-009** — No household value leaves the local namespace. It appears in
  no network request, no URL, no referrer, no console output and no committed
  artifact. That guarantee is about what a request may *carry*, and it is
  unconditional. Separately, and without qualifying it: the route's only runtime
  transport is a bounded set of same-origin reads of its own local policy and
  rule-pack documents, every one of them declared by the configuration the page
  loads — measured at nine documents across seven call sites. No read reaches
  another origin, and a read site or document the declaration list does not name
  cannot enter without that list changing in the same change.
  **Adversarial cases.** A sentinel household value reaching any URL, request,
  referrer or console message fails. An undeclared, additional or remote read
  fails. A requirement that could be satisfied by a route that reads nothing is
  not this requirement: the declared reads must still be present and resolvable.
- **FR-021-010** — Configuration is mandatory. A missing, malformed or
  unknown-version configuration blocks dependent computation visibly, while the
  privacy inventory and the clear action stay reachable.

### Annual federal settlement

- **NFR-021-011** — Annual federal tax for the declared year is deterministic:
  identical input produces a byte-identical result, with no clock, no random
  source, and no network read in the computation path.
- **FR-021-012** — Ordinary-income tax is computed across the resolved pack's
  bracket table in the pack's declared calculation order.
- **FR-021-013** — Long-term capital gains and qualified dividends stack on top
  of ordinary taxable income rather than being taxed in isolation.
  **Amendment:** the capital-gain rate thresholds are a distinct table the pack
  declares in its own right. They are never derived from, aligned to, or
  inferred from the ordinary-income bracket edges, because the two tables do not
  share boundaries and inferring one from the other would silently invent a
  threshold.
- **FR-021-014** — Deduction selection between standard and itemized is
  explicit, visible, and never silently chosen for the user without disclosure
  of which was applied.
- **FR-021-015** — Tax-exempt interest is tracked, is excluded from taxable
  income, and is visibly recorded as an input the model retains rather than
  discards. Its downstream uses — taxable-benefit and Medicare income
  definitions — are named unavailable in this slice.
- **FR-021-016** — Every annual result satisfies a stated reconciliation
  identity between income components, deductions, taxable income and tax, and
  the identity is displayed rather than asserted in prose.
- **NFR-021-017** — **Amendment applied (finding F-1).** Two rounding stages are
  distinct and neither is invented by the engine. Calculation rounding is
  applied only where the resolved pack's `roundingPolicy` declares it, in the
  order the pack declares. Display rounding is a separate step applied only at
  the display boundary and disclosed alongside the value. Full internal
  precision is preserved everywhere the pack does not declare a calculation
  rounding step.
- **FR-021-018** — A federal feature the pack lists in `unsupportedFeatures[]`
  is named and rendered unavailable. It is never silently omitted from a total,
  and no result is labeled a complete federal tax.

### Effective marginal rate curve

- **FR-021-019** — The engine emits a per-year curve of the marginal cost of the
  next dollar of ordinary income and the next dollar of realized long-term gain.
  The output is a curve, never a single rate.
- **FR-021-020** — Every contributing threshold on the curve is named and
  carries its rule-pack source.
- **FR-021-021** — A cliff renders as a step. Smoothing a step into a gradient
  is forbidden, because the step is the quantity the user is steering around.
- **FR-021-022** — A threshold the pack does not support in this slice is listed
  as an unavailable contributor with its code, rather than omitted. The curve is
  labeled incomplete accordingly, with the count. For the slice-1 federal pack
  this list is necessarily non-empty; an empty list is a defect.
- **NFR-021-023** — The curve is derived from the annual settlement. No bracket
  table, rate or threshold is re-declared inside the curve implementation.
- **FR-021-024** — The curve has a text-equivalent table carrying every point,
  every threshold name and every unavailable contributor, emitted from the same
  record the chart renders.

### Bracket-fill conversion comparison

- **FR-021-025** — The comparison contains exactly two policies: no conversion,
  and fill to a user-selected ordinary bracket. Both run on identical inputs and
  the identical resolved pack.
- **FR-021-026** — The conversion amount is derived from the selected bracket
  edge in the resolved pack, never from a hard-coded threshold.
- **FR-021-027** — The comparison reports the conversion amount, the federal tax
  under each policy, the difference, and the effective marginal rate at the fill
  edge taken from the curve.
- **FR-021-028** — The comparison carries a closed disclosure list naming at
  minimum: state tax, Medicare and IRMAA effects, the premium tax credit, the
  Roth five-year clocks, later-year distribution and required-distribution
  pressure, survivor effects, and lost growth on taxes paid. Each entry carries
  a reason and a deferral code.
- **FR-021-029** — The comparison distinguishes taxes paid from outside funds
  from taxes withheld from the converted amount, or names that distinction
  unavailable if the input does not declare it. No funding source is assumed.
- **FR-021-030** — The comparison emits no probability, no lifetime outcome, no
  break-even year, no ranking and no recommendation. It is a single-year federal
  cost difference and says so.

### Route, accessibility, and export

- **FR-021-031** — Simple is the default view and opens first without user
  action. **Amendment applied (finding F-2):** when the minimum viable input is
  present, Simple opens with a decision-level answer, the strongest tradeoff,
  and what is unavailable. When it is absent or partial, Simple opens with a
  named incomplete state that states exactly which members are missing and what
  supplying them would produce. It never renders a placeholder figure, a zero,
  or an empty shell in place of the answer.
- **FR-021-032** — Power is the drill-down and exposes the rule ledger, the
  per-bracket detail, the curve table, the reconciliation identity, and every
  pack source record.
- **NFR-021-033** — Every displayed value carries a contextual tooltip stating
  both what it is and what the current value means. Every chart carries a
  text-equivalent table.
- **NFR-021-034** — Unavailable states are visible, keyboard reachable, and
  readable on mobile. An unavailable domain never renders as a blank, a dash
  without explanation, or a zero.
- **FR-021-035** — Copy is educational-only and states plainly that the tool is
  not tax advice, does not prepare or file a return, and does not recommend an
  action.
- **NFR-021-036** — No copy claims a published error rate, a self-invalidation
  statistic, a track record, or an accuracy figure, and no copy states a plan
  success probability.
- **FR-021-037** — A private local export happens only after explicit user
  action, warns that the file carries sensitive financial information, contains
  no name, address, account number, tax identifier or credential, and lists
  every omitted field.
- **NFR-021-038** — The tool remains absent from `tools.json`, `index.html`,
  `rlnav.js`, `README.md`, `notes/README.md` and market-brief coverage at the
  end of this feature, and its root page carries a `site-exclusions.json` deploy
  decision.

---

## Edge, Error, And Degraded Paths

| Condition | Required behavior | Requirement |
| --- | --- | --- |
| Configuration missing, malformed, or unknown version | Dependent computation blocked visibly with a reason; privacy inventory and clear action stay reachable | `FR-021-010` |
| Pack missing a required member | Refused once per missing member, naming the member | `FR-021-002` |
| Pack past its declared expiry | Refused with a distinct expired code; no fallback to an earlier pack | `FR-021-002`, `FR-021-003` |
| Declared year outside `effectiveTaxYears` | Named refusal; no threshold extended, no indexing invented | `FR-021-003` |
| Non-federal jurisdiction selected | Named refusal; no estimated effective state rate | `FR-021-007` |
| Unsupported income kind entered | Named refusal; the four supported kinds still settle | `FR-021-006` |
| No deduction mode declared | Incomplete-input refusal; no default mode applied anywhere | `FR-021-008`, `FR-021-014` |
| Reconciliation identity does not balance | The result is refused, not returned as a tax figure | `FR-021-016` |
| Household already at or above the selected bracket edge | A labeled zero-amount conversion, not a negative fill and not a hidden row | `FR-021-025`, `FR-021-026` |
| No declared tax funding source for the conversion | Unavailable record for the outside-funds versus withheld distinction | `FR-021-029` |
| Curve produces an unattributed rate change | Refused rather than rendered as an unexplained jump | `FR-021-020` |
| Unavailable-contributor list is empty for the slice-1 pack | Treated as a defect, not an edge case | `FR-021-022` |
| Empty or partial workspace on first paint | Named incomplete state; never a placeholder figure | `FR-021-031` |

---

## Exposure Contract

| Capability | Surface class | Surface id | Status | Plan |
| --- | --- | --- | --- | --- |
| Household tax workspace, federal settlement, marginal curve, conversion comparison | `uiRoute` | `lifetime-tax-strategy-lab.html` | `delivered` | Reachable from a repository checkout and from `file://`. Deliberately excluded from the packaged Pages site by a `site-exclusions.json` entry per the operator's registration deferral. |
| Rule-pack contract, workspace contract, refusal vocabulary | `internal` | `rltaxrules.js`, `rltaxworkspace.js` | `internal` | In-repo caller is `lifetime-tax-strategy-lab.html`. No other consumer, and tests are not consumers. |
| Federal settlement and curve engine | `internal` | `rltax.js` | `internal` | In-repo caller is `lifetime-tax-strategy-lab.html`. |
| Conversion comparison engine | `internal` | `rltaxstrategy.js` | `internal` | In-repo caller is `lifetime-tax-strategy-lab.html`. |
| Public site reachability — registry entry, navigation entry, README and notes index entries, market-brief coverage | `uiRoute` | `tools.json` entry, `index.html` card, `rlnav.js` entry | `planned` | A later registration feature, by explicit operator instruction. That feature must also remove the `site-exclusions.json` entry in the same change (`registered page is still excluded` refuses otherwise) and add `tax-rules/` to the published-directory allowlist (finding F-5). |

**P17 reading.** P17 says nothing ships to the site *root* without a registry
and navigation entry. This feature does not ship the page to the site: the
`site-exclusions.json` entry keeps it out of the packaged site entirely, which
is the deploy-time mechanism the repository provides for an in-progress feature.
The commitment to reach the site is recorded above as a `planned` row naming its
owner, so the capability is an open commitment rather than a quietly orphaned
one.

---

## UI Scenario Matrix

| Scenario | Actor | Entry point | Steps | Expected outcome | Screen |
| --- | --- | --- | --- | --- | --- |
| SCN-021-001 | Self-directed household | Route open, no prior workspace | Enter filing status, year, one income amount, deduction mode | Pack identity strip, source records, unsupported-feature list, a named unavailable row per unsupplied domain | Simple |
| SCN-021-002 | Self-directed household | Valid workspace | Change year out of range; select a state; add an unsupported income kind | Three distinct unavailable records with three distinct codes; supported federal rows still rendered | Simple |
| SCN-021-003 | Self-directed household | Route open | Full entry pass, then reload | Only declared same-origin reads, and those reads resolved; storage inventory lists only this feature's keys; sentinel value absent everywhere outside the local namespace | Simple + privacy inventory |
| SCN-021-004 | Self-directed household | Settled workspace | Vary ordinary income across a bracket edge | Exact figures at, below and above the edge; identical repeat run; rule status on every field | Power |
| SCN-021-005 | Self-directed household | Settled workspace | Add a long-term gain, then raise ordinary income alone | Gain taxed in the bands above ordinary taxable income; gain tax changes when ordinary income changes | Power |
| SCN-021-006 | Self-directed household | Settled workspace | Switch deduction mode; then clear the mode | Applied deduction and its mode displayed; reconciliation row balances; cleared mode yields an incomplete-input refusal | Simple + Power |
| SCN-021-007 | Self-directed household | Settled workspace | Open the marginal cost view | Two ordered curves with per-point marginal cost and named, sourced thresholds; no scalar rate offered | Power |
| SCN-021-008 | Self-directed household | Settled workspace | Move across a declared discontinuity | Two adjacent rows with different rates, no interpolated row, labeled a cliff | Power |
| SCN-021-009 | Skeptical reader | Curve rendered | Read the incompleteness label | Named unavailable contributors with codes and reasons, and the count | Power |
| SCN-021-010 | Self-directed household | Settled workspace | Select an ordinary bracket | Two policies, fill amount derived from that pack edge, per-policy tax, difference, marginal rate at the edge | Simple + Power |
| SCN-021-011 | Skeptical reader | Comparison rendered | Read the disclosure | Every not-modeled entry with reason and deferral code; explicit "not a recommendation" statement | Simple |
| SCN-021-012 | Skeptical reader | Comparison rendered | Inspect every field; omit the funding source | No probability, lifetime, break-even, rank, or accuracy field; unavailable record for the funding-source distinction | Power |
| SCN-021-013 | Self-directed household | Route open with minimum viable input | Observe first paint, then open Power | Simple first with decision-level answer and unavailable domains, no dense grids; Power holds ledger, per-bracket detail, curve table, identity, source records | Simple + Power |
| SCN-021-014 | Self-directed household | Route rendered with an unavailable domain | Keyboard-only traversal, then mobile viewport | Every value tooltip and every unavailable state reachable by keyboard; text-equivalent table per chart; no blank, dash, or zero; no trapped table | Simple + Power, mobile |
| SCN-021-015 | Self-directed household | Sentinel value entered | Invoke export, inspect file and session | No file before the action; sensitivity warning; no identifier in the file; omitted-field list present; sentinel absent from every request, URL, referrer, console message | Privacy inventory + export |

---

## Competitive Analysis

Vendor rows are the vendors' own public claims, as recorded in
[`notes/lifetime-tax-strategy-lab.md`](../../notes/lifetime-tax-strategy-lab.md)
(retrieved 2026-08-17 by the note's author). They are **not** measured by this
repository, and no vendor page was re-fetched for this specification. The "this
slice" column is scoped to what this feature actually delivers, not to the full
proposal.

| Capability | ProjectionLab | Pralana | MaxiFi | Open Social Security | This slice |
| --- | --- | --- | --- | --- | --- |
| Effective marginal rate view | yes | not stated | not stated | no | yes, as a curve with named unavailable contributors |
| Roth conversion comparison | yes, optimized | yes | yes | no | one bracket-fill comparison, not optimized |
| Federal tax detail | yes | yes, plus FICA | yes | no | yes, four income kinds only |
| State tax | yes | yes | yes | no | **explicitly unavailable** |
| IRMAA / ACA targeting | yes | not stated | not stated | no | **explicitly unavailable** |
| Monte Carlo and historical paths | yes | yes | yes | no | **explicitly unavailable** |
| Runs with no server or account | no | Gold and Bronze only | no | yes | yes |
| Open source and inspectable | no | no | no | yes | yes |
| Names what it cannot compute | not stated | not stated | not stated | not stated | yes, structurally |

### Competitive gaps

1. **Narrower coverage than every commercial competitor.** This is a
   consequence of the slice, stated rather than hidden. Every gap above is in
   the deferral register with a named reason.
2. **No optimizer.** Competitors search a policy space; this slice compares two
   named policies. Claiming an optimum without a search is the failure this
   feature is built to avoid.

### Where this slice can actually win

**Refusal instead of a plausible number.** Every competitor renders a
complete-looking plan. This slice names an unsupported year, an unsupported
jurisdiction, an unsupported income kind and an unmodeled threshold rather than
substituting an average — and the marginal curve carries its own incompleteness
count rather than presenting itself as whole.

**Rule provenance a reader can follow to the primary source.** Every figure
traces to a dated pack with recorded source records, a publication date and a
retrieval date.

**Runs from a file with no account.** Local-only; the only transport is
same-origin reads of its own declared documents.

### Rejected claim: published error rate

The source proposal note's competitive table lists **"publishes its own error
rate"** as this tool's differentiator. **That claim is REJECTED for this
feature**, and the rejection is carried through as a hard prohibition in
`NFR-021-036` and in the non-goals: no spec text, no scope text and no
user-facing copy may claim a published error rate, a self-invalidation
statistic, a track record or an accuracy figure. The mechanism that would
produce such a figure — a scored, resolved claim ledger — does not exist for
this tool, and this feature does not build one. The rejection matches the
`rejected-claim` observation already recorded in
[`state.json`](state.json) and **remains rejected** here.

This is a deliberate reading of a binding document. `docs/Product-Principles.md`
§0 states the product's positioning as *"the only market brief that publishes
its own error rate"*, and P4 and P5 govern how that rate is published. Those
principles govern the **market brief and its scorecard**, which count resolved
claims. This tool emits no scoreable claim, is not covered by the brief in this
feature, and therefore has no counted frequency of its own. Borrowing the
brief's positioning for a tool with no ledger behind it would be exactly the
selective-reporting failure P4 calls unrecoverable.

---

## Improvement Proposals

### IP-021-001: The marginal cost curve as the primary read ⭐ Competitive edge
- **Impact:** High · **Effort:** M
- **Advantage:** The statutory bracket rate is the number most tools show and
  the number that is most often wrong for a decision. Shipping the curve — with
  its cliffs as steps and its unmodeled thresholds named — makes the tool useful
  precisely where a bracket table misleads.
- **Actors:** Self-directed household, skeptical reader
- **Scenarios:** BS-021-007, BS-021-008, BS-021-009

### IP-021-002: Structural refusal instead of a substituted average ⭐ Competitive edge
- **Impact:** High · **Effort:** M
- **Advantage:** No competitor in the table names what it cannot compute. Making
  refusal a contract member rather than an error path means an unavailable
  domain cannot degrade into a plausible number under schedule pressure.
- **Actors:** All
- **Scenarios:** BS-021-002, BS-021-009, BS-021-011, BS-021-014

### IP-021-003: A rule pack that states its own coverage and provenance ⭐ Competitive edge
- **Impact:** High · **Effort:** M
- **Advantage:** A pack carrying `effectiveTaxYears`, `sourceRecords[]`,
  `publishedAt`, `retrievedAt` and `unsupportedFeatures[]` makes "which year and
  whose numbers" answerable from the UI. It is also the seam by which a state
  pack, an IRMAA pack or a later tax year is added without touching the engine.
- **Actors:** Skeptical reader, rule-pack author
- **Scenarios:** BS-021-001, BS-021-002

### IP-021-004: The comparison's disclosure list as a first-class result member
- **Impact:** Medium · **Effort:** S
- **Advantage:** Making the not-modeled list a structural member with a required
  membership means a later scope cannot quietly shrink it. A disclosure that
  lives in prose erodes; one that a test enumerates does not.
- **Actors:** Skeptical reader
- **Scenarios:** BS-021-011, BS-021-012

### IP-021-005: Prove the privacy boundary rather than assert it
- **Impact:** High · **Effort:** S
- **Advantage:** A request-ledger assertion with a sentinel value is a check a
  reader can re-run. A privacy paragraph is not.
- **Actors:** Self-directed household
- **Scenarios:** BS-021-003, BS-021-015

---

## Product Principle Alignment

Applicable principles from
[`docs/Product-Principles.md`](../../docs/Product-Principles.md), named by
identifier and title as
[`.github/instructions/product-principles.instructions.md`](../../.github/instructions/product-principles.instructions.md)
requires. Principles not listed are not applicable to this slice.

**Admission test (§1).** This feature improves decision quality: it replaces a
statutory bracket rate — the number a household would otherwise act on — with
the actual cost of the next dollar, sourced and dated. It does not improve the
measurement of decision quality, and makes no claim that it does.

| Principle | How this feature satisfies it | Requirements |
| --- | --- | --- |
| **P1 — Every displayed figure carries provenance** | Every result field carries a rule status from a closed enum, and every figure traces to a resolved pack with recorded source records, a publication date and a retrieval date. An unprovenanced number does not render. | `FR-021-004`, `FR-021-002`, `FR-021-020` |
| **P2 — Missing data renders as missing** | Every unsupported year, jurisdiction, income kind, filing status and federal feature produces a named unavailable record carrying a code, a domain, a reason and a remediation. Never a zero, never a national average, never a carried-forward threshold, never a silent omission, never a blank or bare dash. | `FR-021-005`, `FR-021-006`, `FR-021-007`, `FR-021-008`, `FR-021-018`, `FR-021-022`, `FR-021-029`, `NFR-021-034`, `FR-021-031` |
| **P3 — Confidence is evidence quality, never a win probability** | The tool emits no probability of any kind and states no confidence. Rule status describes the legal standing of the rule, not a likelihood of being right, and the enum contains no probabilistic member. The conversion comparison is explicitly a single-year cost difference, not a likelihood. | `FR-021-030`, `NFR-021-036`, `FR-021-004` |
| **P4 — Misses are published with equal prominence to hits** | Not applicable to this tool: it emits no scoreable claim and is not covered by the scorecard in this feature. Its analogue — the honest disclosure of what was not modeled — is a required, enumerable result member given equal prominence to the result itself, not hidden behind a tab. | `FR-021-028`, `FR-021-022` |
| **P5 — A rate is withheld below its minimum sample** | Not applicable: no rate is computed from a sample. Recorded so the absence is a decision, not an omission. | — |
| **P6 — Say when the read is old** | The pack carries `publishedAt`, `retrievedAt` and an `expiryPolicy`; an expired pack refuses rather than serving a stale figure as current. | `FR-021-002`, `FR-021-003` |
| **P7 — No blackbox numbers** | Every figure is computed in the browser from the resolved pack. The reconciliation identity is displayed, not asserted. Power exposes the rule ledger, per-bracket detail and the curve table. | `FR-021-016`, `FR-021-032`, `NFR-021-023` |
| **P8 — Model-authored text is data, never markup** | No model-authored text exists in this feature. Pack-authored strings — reasons, source titles, feature names — are rendered through the same escaping discipline at every sink. | `FR-021-005` |
| **P9 — Works with nothing** | The tool requires no key, no proxy, no account and no server. Its only transport is same-origin reads of its own declared policy and rule-pack documents, so there is no third-party dependency to degrade against. | `NFR-021-009` |
| **P10 — UMD, never ESM** | Every new shared module is a UMD dual module with a global attach, loadable from `file://` with no bundler and no build step. | Repository convention inherited by every scope |
| **P11 — Reuse, never refetch** | No market data is fetched. The rule pack is a local artifact read once. | `NFR-021-009` |
| **P12 — Cache-first, automatic first paint** | Simple paints on load without user action from local state. **With one honest limit:** on an empty workspace there is no result to paint, so the first paint is a named incomplete state stating exactly which members are missing — never an empty shell and never a placeholder figure. | `FR-021-031` |
| **P13 — Tickers only, forever** | No household value is committed. No position size, cost basis, P&L, income, balance or credential enters any repository artifact. The export is a private local file produced only on explicit action, and it lists every field it omits. | `NFR-021-009`, `FR-021-037` |
| **P14 — Simple is the default, Power is the drill-down** | Simple is the default view and holds the decision-level answer, the strongest tradeoff and the unavailable domains. Every dense surface — per-bracket tables, rule traces, raw curve series, source records — lives behind Power, with a link from Simple to the owning Power section. | `FR-021-031`, `FR-021-032` |
| **P15 — Everything is explained in place** | Every displayed value carries a contextual tooltip stating what it is and what the current value means. Every chart carries a text-equivalent table. | `NFR-021-033` |
| **P16 — Deep-link, never duplicate** | The curve links to the settlement that produced it and the comparison links to both; none re-derives the other's math. No brief coverage exists in this feature, so no brief-side duplication is possible. | `NFR-021-023`, `FR-021-027` |
| **P17 — Reachable or removed** | The page is deliberately **not shipped to the site**: its `site-exclusions.json` entry keeps it out of the packaged Pages site entirely. It is not a shipped-but-hidden asset. Registration is recorded as a `planned` row in the Exposure Contract naming its owner. | `NFR-021-038` |
| **P18 — Wired or not shipped** | Each new module has a production consumer — the route — from the scope that introduces it. Tests are not counted as consumers. Finding F-4 records the packaging consequence for the design owner. | Exposure Contract |
| **P19 — One definition per concept** | Tax is defined once, in the settlement. The curve is a finite difference over it and declares no bracket, rate or threshold of its own. The comparison introduces no third definition. Rule values exist only in the pack. | `NFR-021-023`, `FR-021-026` |
| **P20 — Every claim is scoreable** | This tool emits no recommendation and therefore no claim to score. That is a deliberate consequence of `FR-021-030`, not an unscoreable claim slipping through: nothing is emitted that a scorer would need to evaluate. | `FR-021-030` |
| **P21 — Additive contracts, append-only history** | All contracts are new. No existing schema is narrowed and no history is rewritten. `scripts/selftest.mjs` gains appended assertion groups only. | Non-goal 17 |
| **P22 — Budgets are assertions** | Any performance or size budget this feature introduces carries a failing test. No existing budget is raised. | Scope test plans |
| **P23 — A guard that cannot fail is not a guard** | Every guard carries an adversarial case: a threshold carried into an unsupported year, a zero substituted for an unavailable domain, a gain taxed in isolation, an interpolated cliff, an empty unavailable-contributor list, a marginal-rate product substituted for a full settlement, an under-reporting omitted-field manifest. Each is demonstrated to fail. | Scenario obligations in [`scenario-manifest.json`](scenario-manifest.json) |
| **P24 — Superseding closes the superseded** | Nothing is superseded. Feature 008 is not extended, not modified and not reversed; this feature defines an independent contract. | `NFR-021-001` |
| **P25 — Specs are capped, and never block on status** | Thirty-eight requirements across five scopes, inside the roughly-forty / five-scope cap. `specDependsOn` is empty: this feature blocks on no other spec's status, and its independence from Feature 008 is a capability decision, not a consequence of that feature being blocked. | Anchor disposition; [`state.json`](state.json) |

---

## Non-Functional Requirements Summary

| Attribute | Requirement | Where stated |
| --- | --- | --- |
| Isolation | No shared module, namespace or key with Feature 008; Feature 008 byte-identical | `NFR-021-001` |
| Privacy | Transport bounded to same-origin reads of the declared policy and pack documents; no household value in any URL, request, referrer, console message or committed artifact | `NFR-021-009` |
| Determinism | Byte-identical result for identical input; no clock, random source or network read in the computation path | `NFR-021-011` |
| Precision | Pack-declared calculation rounding applied where declared; display rounding separate and disclosed | `NFR-021-017` |
| Single definition | No rule value or tax definition outside the pack and the settlement | `NFR-021-023` |
| Accessibility | Contextual tooltip on every value; text-equivalent table per chart; keyboard-reachable and mobile-readable unavailable states | `NFR-021-033`, `NFR-021-034` |
| Honesty | No error-rate, self-invalidation, track-record, accuracy or plan-success-probability claim | `NFR-021-036` |
| Deploy and registration | Absent from every registry; root page carries a `site-exclusions.json` deploy decision | `NFR-021-038` |
| Portability | UMD dual modules, no bundler, no build step, works from `file://`, single standard CSP | Repository convention |

---

## Measurable Success Criteria

1. Every one of the fifteen scenarios `SCN-021-001` … `SCN-021-015` has passing
   evidence in its owning scope's `report.md`.
2. `node scripts/selftest.mjs` exits 0 at the end of every scope, with no
   existing assertion edited, relaxed or removed.
3. `node scripts/validate-spec-test-paths.mjs` reports zero new missing paths at
   the end of every scope.
4. `node scripts/build-pages-site.mjs` accepts the new root page, in Scope 01
   and again in Scope 05.
5. The Feature 008 byte-identity canary passes in every scope.
6. A live-route browser run records an empty request ledger and finds the
   sentinel household value in no URL, referrer or console message.
7. The unavailable-contributor list is non-empty for the slice-1 federal pack.
8. Zero occurrences of an error-rate, track-record, accuracy or plan-success
   claim across spec text, scope text and page copy.
9. The tool is absent from all six registration surfaces at the end of the
   feature.

---

## Blocking Implementation Inputs

Each item below must be resolved before the scope that needs it can complete.
None is resolvable from this specification alone.

| # | Input | Needed by | Owner |
| --- | --- | --- | --- |
| BI-1 | Revenue Procedure 2025-32 must be retrieved directly and its tax-year-2026 tables transcribed into the pack, with the implementer's own `retrievedAt`. It was **not** retrieved in this authoring session. | Scope 01 | Implementer |
| BI-2 | The tax-year-2026 long-term capital gain and qualified dividend rate thresholds are absent from the retrieved IRS newsroom release and must come from Rev. Proc. 2025-32. Without them `FR-021-013` cannot be satisfied. | Scope 02 | Implementer |
| BI-3 | The tax-year-2026 married-filing-separately and head-of-household ordinary bracket tables are absent from the retrieved release and must come from Rev. Proc. 2025-32. | Scope 02 | Implementer |
| BI-4 | The One, Big, Beautiful Bill's tax-year-2026 itemized-deduction benefit limitation for 37%-bracket taxpayers and its senior deduction must each appear by name in the pack's `unsupportedFeatures[]` (finding F-3). | Scope 01 | `bubbles.design` |
| BI-5 | A `site-exclusions.json` decision is required for each new root `.js` and `.json` artifact, not only the `.html` page, or the packaged site ships modules whose only consumer is not shipped (finding F-4). Each entry's reason must be at least 40 characters. | Scope 01 | `bubbles.design` |
| BI-6 | The closed `RLTAX-*` code membership, the pack JSON schema, the calculation order and the Simple/Power component tree remain unspecified here by design. | Scope 01 | `bubbles.design` |

---

## Assumptions

1. The declared tax year 2026 is `enacted-current-law` as of the 2026-08-17
   authoring date. If the law changes before implementation, the pack's status
   and source records change with it; the engine assumes no year.
2. Fifteen planning scenario identifiers and their owning scopes are stable.
   This specification binds business scenarios to them one-to-one and renumbers
   nothing.
3. The operator's registration deferral stands: the tool is not registered in
   this feature.
4. The repository's UMD, CSP, tooltip, text-equivalent-table and top-level
   `function` conventions apply unchanged.

## Open Questions

**For `bubbles.design`**

1. What is the exact closed membership of the `RLTAX-*` refusal enum? The scope
   files name eight candidates; the authoritative list is a design decision.
2. What is the curve's sampling policy — step size, range, and how a declared
   threshold forces a sample point — such that `FR-021-021` produces a step and
   not an artifact of sampling?
3. How does the settlement expose the `roundingPolicy` boundary so that
   `NFR-021-017`'s two stages are separately testable?

**For a later feature**

4. Which state ships first, and on which authority's rule pack?
5. When does registration happen, and does it also add `tax-rules/` to the
   published-directory allowlist (finding F-5)?

## Acceptance Criteria

- [ ] Every one of `PRA-021-001` … `PRA-021-038` is adopted or rejected here,
      and the five scope files are repointed to the `FR-021-*` / `NFR-021-*`
      numbers in one edit.
- [ ] The deferral register appears verbatim.
- [ ] The declared tax year is recorded with a primary source URL, title and
      retrieval date, and no figure is asserted from a source that was not
      retrieved.
- [ ] All fifteen scenarios have passing evidence in their owning scope reports.
- [ ] `node scripts/selftest.mjs` exits 0.
- [ ] `node scripts/build-pages-site.mjs` accepts the new root page.
- [ ] Feature 008 remains byte-identical.
- [ ] The tool is absent from all six registration surfaces.
- [ ] No error-rate, track-record, accuracy or plan-success-probability claim
      appears anywhere.

## Traceability

| Scope | Scenarios | Requirements |
| --- | --- | --- |
| 01 Tax workspace, federal rule pack, privacy foundation | SCN-021-001 … -003 | `NFR-021-001`, `FR-021-002` … `FR-021-008`, `NFR-021-009`, `FR-021-010` |
| 02 Deterministic annual federal tax | SCN-021-004 … -006 | `NFR-021-011`, `FR-021-012` … `FR-021-016`, `NFR-021-017`, `FR-021-018` |
| 03 Effective marginal rate curve | SCN-021-007 … -009 | `FR-021-019` … `FR-021-022`, `NFR-021-023`, `FR-021-024` |
| 04 Bracket-fill Roth conversion comparison | SCN-021-010 … -012 | `FR-021-025` … `FR-021-030` |
| 05 Simple/Power route, accessibility, local export | SCN-021-013 … -015 | `FR-021-031`, `FR-021-032`, `NFR-021-033`, `NFR-021-034`, `FR-021-035`, `NFR-021-036`, `FR-021-037`, `NFR-021-038` |

---

*Educational models — not investment advice, and not tax advice. This tool does
not prepare or file a return and does not recommend an action. Every figure is a
hypothetical output from editable assumptions under a dated rule pack.*
