# User Validation: 009 MSFT July Market Refresh

Execution evidence: [report.md](report.md). These acceptance items require human review and are not certified by an agent.

Status: Pending human review

## Checklist

- [x] Planning baseline initialized: the human acceptance items below map SCN-009-001 through SCN-009-014 and remain pending human review.
- [ ] On first open without a configured Finnhub credential, the static model appears immediately and the same-origin delayed quote and daily-bar context hydrate without a Fetch action.
- [ ] The model is visibly dated 2026-07-06 while quote provider time, quote retrieval time, daily-bar cutoff, daily-bar retrieval time, and evaluation time remain separately labeled.
- [ ] The delayed quote matches the parsed current `data/options/MSFT.json::{spot,asof,fetched}` fields, while the daily-bar cutoff, retrieval time, and row count match parsed current `data/bars/MSFT.json::{asof,fetched,rows.length}` and its technical values derive from those rows; neither source is relabeled with the other's date or treated as live, intraday, or fundamental confirmation.
- [ ] Editing Q4/FY27 assumptions and selected P/E, then waiting for market hydration or requesting refresh, preserves the exact user scenario.
- [ ] Missing, stale, malformed, or partial market evidence leaves the independently valid model/quote/bar truth usable and does not display the old hard-coded spot or invented technical levels.
- [ ] Simple and Power communicate the same spot, technical conclusion, model-relative valuation, and source clocks; Power adds evidence without refetching or changing inputs.
- [ ] Desktop, tablet, and mobile layouts remain readable without body-level horizontal scrolling, overlap, inaccessible status-by-color, or blank Power canvases.
- [ ] CSV contains separate model, quote, bar, evaluation, and export provenance and matches the visible accepted state, including honest empty fields in a partial state.
- [ ] Optional refresh uses only central Data settings, preserves the cache view when disabled/unconfigured/failed, and exposes no page-local credential field or secret-bearing URL.
- [ ] The shared MSFT read remains a committed-Base static-model read and does not claim refreshed fundamentals, current consensus, an FY26 Q4 actual, or an investment recommendation.
- [ ] The notes and the MSFT records in both registries tell the same two-clock truth while the tool id, page path, notes path, and static-model profile remain unchanged.
- [ ] Unrelated provider settings, Bond Regime registry content, centralized credential removal, selftests, shared/data/brief files, and other dirty work remain intact.

## Human Review Record

Reviewer:

Reviewed at:

Decision:

Notes:
