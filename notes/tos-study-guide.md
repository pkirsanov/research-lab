# TOS Study Guide — notes

> **Status: LIVE.** A reference tool, not an analytic. **Educational only — not investment advice.** It computes nothing and fetches no market data.

Single-file tool: [`../tos-study-guide.html`](../tos-study-guide.html)
Data file: [`../tos-study-guide.json`](../tos-study-guide.json)

## Purpose

Answer two questions for the thinkorswim custom studies and study sets kept in the QuantitativeFinance repo (`trading-studies/`, branch `trading-studies`):

1. **Which study set do I load for what I am doing?** (Simple view)
2. **How do I read it?** (the result card, and the Power view for every study)

## Views

- **Simple (default).** Pick a horizon (Intraday, Days to weeks, Months to years, Option positioning, Exits and reversals, Learn). Optional levers: direction (either, long, short) and the current market (trending, range-bound, breaking out, turning, context). The market lever only dims goals that do not fit; it never hides them. Pick a goal to get one study set with: its exact name (copy button), chart, contents, when to use it, the signal, how to read it, what to avoid, how it differs from neighbouring sets, and one-click comparison with the other sets in the same horizon.
- **Power.** Every set in a searchable table; every custom study with its legend, setups and the sets that use it; 13 standard thinkorswim studies with the question each answers; the naming convention; the manuals.

State (mode, horizon, selected set, levers) persists in `localStorage`. `#set=<id>` deep-links a set.

## Data

All content is in `tos-study-guide.json`: `sets`, `studies`, `standard`, `naming`, `horizons`, `sources`. The page reads it and renders with DOM calls only (no HTML injection).

The source of truth for the prose is the QuantitativeFinance repo: `trading-studies/manuals/Study_Sets_Guide.md`, `Setups_and_Options_Manual.md`, `JBravo_Manual.md`, `Flow_Momentum_Manual.md`. When a set or study changes there, update the JSON here in the same change. Set names follow `<Scope> <Purpose>` (35 characters or less); study names follow `<Scope>_<What>`.

## Honest limits

- No backtests. Rules use past data only.
- Order flow in `Day_Flow_Momentum` is estimated from where each bar closes; thinkorswim does not expose real bid/ask volume to studies.
- Option levels come from one expiration and 15 sampled strikes with an assumed sign.
- The page does not talk to thinkorswim. If a set name does not exist in your thinkorswim, rebuild it from `trading-studies/tools/sets.json`.
