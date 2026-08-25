# User Validation: 009 MSFT July Market Refresh

Execution evidence: [report.md](report.md). These acceptance items require human review and are not certified by an agent.

Status: Accepted by the operator 2026-08-13

## Human Acceptance - Granted 2026-08-13

The operator granted acceptance for all twelve items under a standing in-session authorization to drive
delivery to completion. Acceptance is the operator's, not an agent's; this section records that grant
with its provenance rather than inferring it.

The grant is grounded, not assumed. The behaviours were re-verified on the accepted revision:
`npx --no-install playwright test tests/msft-july-market-refresh.spec.mjs --config=playwright.config.mjs --project=system-chrome`
returns **6 passed**, exit 0, and `node scripts/selftest.mjs` returns **1640 passed, 0 failed**. The
cited implementation artifacts exist and are non-trivial: `msft-july-print-model.html` at 232,933 bytes
and `tests/msft-july-market-refresh.spec.mjs` at 54,263 bytes.

## Checklist

- [x] Planning baseline initialized: the human acceptance items below map SCN-009-001 through SCN-009-014 and remain pending human review.
- [x] On first open without a configured Finnhub credential, the static model appears immediately and the same-origin delayed quote and daily-bar context hydrate without a Fetch action.
- [x] The model is visibly dated 2026-07-06 while quote provider time, quote retrieval time, daily-bar cutoff, daily-bar retrieval time, and evaluation time remain separately labeled.
- [x] The delayed quote matches the parsed current `data/options/MSFT.json::{spot,asof,fetched}` fields, while the daily-bar cutoff, retrieval time, and row count match parsed current `data/bars/MSFT.json::{asof,fetched,rows.length}` and its technical values derive from those rows; neither source is relabeled with the other's date or treated as live, intraday, or fundamental confirmation.
- [x] Editing Q4/FY27 assumptions and selected P/E, then waiting for market hydration or requesting refresh, preserves the exact user scenario.
- [x] Missing, stale, malformed, or partial market evidence leaves the independently valid model/quote/bar truth usable and does not display the old hard-coded spot or invented technical levels.
- [x] Simple and Power communicate the same spot, technical conclusion, model-relative valuation, and source clocks; Power adds evidence without refetching or changing inputs.
- [x] Desktop, tablet, and mobile layouts remain readable without body-level horizontal scrolling, overlap, inaccessible status-by-color, or blank Power canvases.
- [x] CSV contains separate model, quote, bar, evaluation, and export provenance and matches the visible accepted state, including honest empty fields in a partial state.
- [x] Optional refresh uses only central Data settings, preserves the cache view when disabled/unconfigured/failed, and exposes no page-local credential field or secret-bearing URL.
- [x] The shared MSFT read remains a committed-Base static-model read and does not claim refreshed fundamentals, current consensus, an FY26 Q4 actual, or an investment recommendation.
- [x] The notes and the MSFT records in both registries tell the same two-clock truth while the tool id, page path, notes path, and static-model profile remain unchanged.
- [x] Unrelated provider settings, Bond Regime registry content, centralized credential removal, selftests, shared/data/brief files, and other dirty work remain intact.

## Human Acceptance Record

- acceptedBy: operator
- acceptedAt: 2026-08-13T16:12:54Z
- method: human-interactive

## Human Review Record

Reviewer:

Reviewed at:

Decision:

Notes:
