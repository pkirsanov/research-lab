<!-- markdownlint-disable MD024 -->

# User Validation: 013 Market Regime Stack And Strategy Playbook

Evidence destination: [report.md](report.md)
Execution plan: [scopes/_index.md](scopes/_index.md)
Contracts: [spec.md](spec.md) | [design.md](design.md) | [scenario-manifest.json](scenario-manifest.json) | [test-plan.json](test-plan.json)

> Authored by `bubbles.plan` under workflow mode `product-to-planning`. Items are
> created **checked** `- [x]` per the repository convention: a checked item means
> "no user has reported this behavior as broken". **You uncheck an item** to
> report that the behavior is broken; an unchecked `- [ ]` item is a
> user-reported regression and blocks further work on this feature.
>
> A checked box here is **not** a claim that the behavior has been executed or
> proven. Execution proof lives in [report.md](report.md), one slot per Test Plan
> row, and every slot is currently awaiting execution.

## Checklist — Business Behaviors (BS-013-001 … BS-013-022)

- [x] Reading the tool with current facets available, I get one combined regime that names an archetype from the published list rather than a made-up name. (BS-013-001)
- [x] When my facet combination is not on the published list, I see a fingerprint plus the literal `Mixed` or `Unresolved` with the unresolved facet pair named — never an invented archetype name. (BS-013-002)
- [x] When an intraday facet moves, my tactical context changes while the structural quadrant verdict stays exactly where it was. (BS-013-003)
- [x] A facet whose history is shorter than the horizon I asked for is excluded from that read and the shortfall is stated on screen. (BS-013-004)
- [x] The growth-inflation quadrant is labeled market-implied on the label itself, so I never mistake it for an observed macro regime. (BS-013-005)
- [x] A stale facet shows as unavailable with a reason, and the confirmation denominator visibly shrinks instead of quietly counting a zero or a neutral. (BS-013-006)
- [x] When two facets disagree, I see the disagreement as its own callout naming both facets, both values, and both horizons — it is never averaged into the headline. (BS-013-007)
- [x] A small facet move does not flip my regime label; the moving facet is marked forming and the label holds until the persistence gate is met. (BS-013-008)
- [x] A historical regime series only uses what was knowable at each point in time, and a hindsight-smoothed series is refused with a stated reason. (BS-013-009)
- [x] Each facet source publishes its own facet and never reads the combined regime back in, so no reading is quietly circular. (BS-013-010)
- [x] A consumer page shows me the published read and gives me no way to recompute or upgrade it locally. (BS-013-011)
- [x] A migrated consumer page renders exactly one regime read, matching the published read word for word, with no second divergent vocabulary. (BS-013-012)
- [x] A named ratio pair reports its level, its trend, and a z-score that states the window it was measured over. (BS-013-013)
- [x] Two overlapping ratio pairs count as one piece of evidence, not two, so my confirmation count is not inflated. (BS-013-014)
- [x] A pair whose legs disagree on adjustment, or whose shared history is too short, reports unavailable with the reason instead of a number. (BS-013-015)
- [x] An international pair either honors session and FX alignment or tells me it is not comparable and names the misaligned leg. (BS-013-016)
- [x] Each sleeve row shows a relative rank, the facets driving it, and what would invalidate it — and shows no weight, allocation, exposure, target, position size, or buy/sell/hold. (BS-013-017)
- [x] Inflationary and disinflationary risk-off give me visibly different bond sub-type ordering rather than one undifferentiated bond row. (BS-013-018)
- [x] Energy, metals, and agriculture appear as separate named rows rather than moving together as one commodities block. (BS-013-019)
- [x] When nothing has a clear relative advantage, I get an explicit no-advantage state instead of a forced ranking or an empty panel. (BS-013-020)
- [x] The tool publishes exactly one owner read carrying the full payload — verdict, archetype or fingerprint, confirmation count, absent facets, availability, sleeve fits, contradictions, and provenance. (BS-013-021)
- [x] When required facets are missing, the owner read says unavailable or partial and names what is missing, instead of filling the gaps and showing me a confident verdict. (BS-013-022)

## Checklist — UI Scenario Matrix (UX-M-01 … UX-M-25)

- [x] Opening the tool page paints a meaningful first view straight away from the warm cache, with no fetch button to click first. (UX-M-01)
- [x] A facet set with no entry in the archetype list shows a fingerprint and never an invented archetype name. (UX-M-02)
- [x] Changing a tactical facet leaves the structural lane looking exactly the same, including its lane confirmation count. (UX-M-03)
- [x] A facet past its cutoff renders as unavailable and the denominator on screen visibly shrinks. (UX-M-04)
- [x] A facet contradiction renders as its own callout and is absent from the headline verdict. (UX-M-05)
- [x] The growth-inflation quadrant carries the literal market-implied qualifier inline on the label, not hidden in a footnote or tooltip. (UX-M-06)
- [x] Every z-score in the Power ratio table renders its declared window as adjacent text. (UX-M-07)
- [x] Overlapping ratio pairs render as one family contributing one confirmation, not two. (UX-M-08)
- [x] Every sleeve row shows rank, rationale, and invalidation, and shows no allocation language as text, number, or bar length. (UX-M-09)
- [x] The inflationary and disinflationary risk-off fixtures order the bond sub-types differently on screen. (UX-M-10)
- [x] A flat sleeve fixture renders the explicit no-advantage state in place of the sleeve list, with no forced ordering and no blank region. (UX-M-11)
- [x] The Brief view renders either a corroborated cited interpretation or an explicit refusal — never an uncited claim. (UX-M-12)
- [x] With required facets missing, the Brief view renders unavailable rather than fabricating a read. (UX-M-13)
- [x] A Journey step whose upstream evidence is stale blocks completion instead of letting me proceed on stale evidence. (UX-M-14)
- [x] The Journey completion packet renders the no-execution disclaimer. (UX-M-15)
- [x] On a 375px-wide phone screen the Simple view stacks the three lanes, keeps lane labels and the denominator readable as text, and the page gains no horizontal scroll. (UX-M-16)
- [x] A page that used to carry its own duplicate regime copy now renders the single published read. (UX-M-17)
- [x] A facet shorter than the requested horizon is visibly excluded in the Power view. (UX-M-18)
- [x] A sub-threshold facet move holds the header label instead of flipping it. (UX-M-19)
- [x] The history view renders as-of stamps per point and refuses a hindsight-smoothed series. (UX-M-20)
- [x] The provenance line under each facet-derived value names a source that never consumes the composed regime. (UX-M-21)
- [x] A pair with a mismatched-adjustment or short-history leg renders unavailable in the Power ratio table. (UX-M-22)
- [x] A cross-session pair renders not-comparable naming the session or FX misalignment. (UX-M-23)
- [x] Commodity sub-types render as separate rows in the sleeve fit list, never one merged block. (UX-M-24)
- [x] The Brief renders values identical to the one published owner read produced by the headless run. (UX-M-25)

## How To Report A Problem

1. Uncheck the item that describes the behavior you observed as broken.
2. Add a short note under it describing what you saw and where you saw it.
3. An unchecked item is a blocking user-reported regression: it is routed to `bubbles.validate` for root-cause investigation before further scope work proceeds.
