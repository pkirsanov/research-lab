# User Validation: BUG-025 — Bounded Company Corpus Reads

## Automation Readiness

- [x] A never-answering corpus response is aborted at the declared bound. → Evidence: [current focused production-route browser](report.md#acceptance-readiness-focused-browser)
- [x] The route reaches a settled unavailable reading after the abort. → Evidence: [current focused production-route browser](report.md#acceptance-readiness-focused-browser)
- [x] A response released inside the bound still loads normally. → Evidence: [current focused production-route browser](report.md#acceptance-readiness-focused-browser)
- [x] Cache-first first paint remains independent of the network. → Evidence: [current focused production-route browser](report.md#acceptance-readiness-focused-browser)

## Checklist

- [x] **What:** A stalled committed-data request does not leave the Company Intelligence reading waiting forever.
  - **Steps:**
    1. Open the route through a server that accepts one corpus request and does not answer it.
    2. Observe the first paint and wait through the declared read bound.
  - **Expected:** First paint remains available. After the bound, the reading settles and names unavailable sources.
  - **Verify:** Browser automation and UI observation.
  - **Evidence:** `report.md#runtime-reproduction`

- [x] **What:** A slow valid response is not treated as failed.
  - **Steps:**
    1. Hold one corpus response after request entry.
    2. Release it before the configured bound.
  - **Expected:** The response is used and the reading settles normally.
  - **Verify:** Browser automation.
  - **Evidence:** `report.md#runtime-reproduction`

## Human Acceptance Record

- acceptedBy: pkirsanov
- acceptedAt: 2026-08-31T16:51:07Z
- method: external-record
- record: Current 2026-08-31 operator directive in this conversation, quoted verbatim — "authorized, approved, update all user validations as approved" and "Don't stop for user review, commit, continue, user approves all".

This record captures the operator's explicit current-session judgment and authorization. It does
not claim that the operator exercised either behavior in a live browser, completed a walkthrough,
or supplied a ticket. Automation evidence remains separate under `## Automation Readiness`.
