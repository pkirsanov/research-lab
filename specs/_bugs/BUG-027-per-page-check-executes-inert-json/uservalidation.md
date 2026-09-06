# User Validation: BUG-027 — Type-Aware Per-Page Validation

## Automation Readiness

- [ ] Malformed executable JavaScript produces a JavaScript-specific failure.
- [ ] Malformed `application/json` produces a JSON-specific failure.
- [ ] Valid inert JSON beside valid executable JavaScript passes.
- [ ] A missing literal DOM ID produces a missing-ID failure.
- [ ] The registered command accepts the current Company Intelligence page.

## Checklist

- [ ] **What:** Valid typed data does not block the required per-page check.
  - **Steps:**
    1. Run the registered validator against `company-intelligence-lab.html`.
    2. Read the reported type and validation counts.
  - **Expected:** The command accepts the inert JSON and validates executable JavaScript plus literal DOM IDs.
  - **Verify:** Project-owned per-page validation command.
  - **Evidence:** `report.md#post-fix-registered-command`

- [ ] **What:** Each malformed content class fails under its own parser.
  - **Steps:**
    1. Run the focused carrier with malformed executable JavaScript.
    2. Run it with malformed `application/json`.
  - **Expected:** Each fixture exits nonzero and names the correct content class.
  - **Verify:** Focused Node test carrier.
  - **Evidence:** `report.md#post-fix-adversarial-carrier`

- [ ] **What:** Missing literal DOM references remain blocking.
  - **Steps:**
    1. Run the focused carrier with valid JavaScript that references an absent ID.
    2. Read the command diagnostic.
  - **Expected:** The command exits nonzero and names the missing ID.
  - **Verify:** Focused Node test carrier.
  - **Evidence:** `report.md#post-fix-adversarial-carrier`

## Human Acceptance Record

No human acceptance record exists. The packet is in progress and no repair is presented for acceptance.
