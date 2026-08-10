# Scope 5 Execution Report — Brief Read And Provenance Render

This file is the evidence surface for scope 5. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

Filled at execution.

## Test Evidence

### TP-05-01

Scenario SCN-018-032 — the bond card shows credit and duration as two labelled
rows, paints no `unavailable` slug, and states the one-axis-resolved consequence
in words.
Command: `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome`

### TP-05-02

Scenario SCN-018-033 — the stale card names its reason and its last good
observation, and shows no classification beside a withheld family.
Command: `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome`

### TP-05-03

Scenario SCN-018-034 — the absent card renders the published string verbatim and
states that nothing was substituted.
Command: `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome`

### TP-05-04

Scenario SCN-018-004 — the provenance row carries source id, host, observed as-of
and retrieval time labelled UTC, with no empty cell and no bare dash.
Command: `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome`

### TP-05-05

Scenario SCN-018-018 — no restricted value appears in the card, the source table
or any persisted browser store.
Command: `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome`

### TP-05-06

Scenario SCN-018-035 — an undetermined admission paints the unavailable glyph and
states the observed-gap count against the required count.
Command: `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome`

### TP-05-07

Scenario SCN-018-032 — curve level and curve impulse never share a row, and real
yield and derived breakeven never share a row or an as-of.
Command: `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome`

### TP-05-08

Scenarios SCN-018-032, SCN-018-034 — every state is readable with colour removed
and at 200% zoom, the axes never fuse at any width, and every existing bond-tool
row still passes.
Command: `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome`

## Build Quality Gate Evidence

### browser gate

Command: `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome`

### selftest

Command: `node scripts/selftest.mjs`

### publication gate

Command: `node scripts/validate-brief-payload.mjs`

### spec-test-path guard

Command: `node scripts/validate-spec-test-paths.mjs`

### change boundary

Command: `git diff --name-only`

## Findings Raised

Filled at execution.

## Completion Statement

Filled at execution.
