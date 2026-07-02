# Tool notes

One **notes file per tool**, named by tool id:

```
notes/<tool-id>.md
```

where `<tool-id>` is the tool's `id` in [`../tools.json`](../tools.json) / the `TOOLS` array in [`../index.html`](../index.html) (it also matches the tool's HTML basename, e.g. `msft-july-print-model`).

## What a notes file contains

Each notes file is the **handoff for the next analysis run** — enough detail to continue, extend horizons, update dates, or add new factors without re-deriving everything:

- Purpose &amp; what the tool computes
- Verified source data (with dates &amp; primary sources)
- The model math / methodology
- Every input lever, its default, and the presets
- Key findings &amp; corrections to carry forward
- Known limitations / simplifications
- A **next-run checklist**
- Version history
- How to edit, validate &amp; ship

## Common referencing convention

A tool is wired to its notes in three consistent places:

1. **Footer link** in the tool's HTML → `notes/<tool-id>.md` (small, in the footer).
2. **Landing-card Notes link** rendered from the same `notes` field in the `index.html` `TOOLS` array.
3. **Registry field** `notes` in both `tools.json` and the `index.html` `TOOLS` array.
4. **This folder**, `notes/<tool-id>.md`.

On the live GitHub Pages site a `.md` link serves raw markdown (readable); on github.com it renders. Keeping notes as relative `.md` files preserves the site's offline-capable, no-dependency ethos.

## Index

| Tool | Notes | Next-run focus |
|---|---|---|
| `options-structure-lab` | [options-structure-lab.md](options-structure-lab.md) | Re-verify the optionable-underlyings watchlist in `options-structure-universe.json`; confirm the Yahoo option-chain + short-interest endpoints still resolve through the public proxies; and sanity-check the dealer-gamma sign convention + gamma-flip against a known pin/trend day after a fresh fetch. |
| `sector-research-lab` | [sector-research-lab.md](sector-research-lab.md) | Re-verify group memberships in `sector-universe.json` (spin-offs/IPOs/reconstitutions), sanity-check the RRG after a fresh fetch, and revisit default RS lookback / momentum span for the regime. |
| `ai-capex-strategy-lab` | [ai-capex-strategy-lab.md](ai-capex-strategy-lab.md) | Refresh assets/presets, crowding friction, catalyst timing, and AI-infra bottleneck sources. |
| `msft-july-print-model` | [msft-july-print-model.md](msft-july-print-model.md) | Plug in actual FY26 Q4 print, refresh FY27 consensus/capex guide, and re-test cost-cycle assumptions. |
| `etf-momentum-lab` | [etf-momentum-lab.md](etf-momentum-lab.md) | Refresh `etf-universe.json` (AUM/price/expense + re-pull the etfdb High-Momentum screen), populate momentum-fund holdings, and revisit default regime assumptions. |
