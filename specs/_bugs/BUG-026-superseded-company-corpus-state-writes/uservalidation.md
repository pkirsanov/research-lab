# User Validation: BUG-026 — Latest-Intent Company State

## Automation Readiness

- [ ] A reversed-completion test proves the newer subject remains authoritative.
- [ ] Events, plan, version state, readiness, and shared publication all belong to the newer subject.
- [ ] A superseded load can populate only immutable keyed caches.
- [ ] BUG-018's refused-replacement behavior remains intact.

## Checklist

- [ ] **What:** Rapidly applying two companies cannot let the older request overwrite the newer reading.
  - **Steps:**
    1. Start one company load on a controlled slow connection.
    2. Apply a second valid company before the first completes.
    3. Allow the second response to complete, then the first.
  - **Expected:** The second company remains the owner of every rendered and published field.
  - **Verify:** Browser automation and UI observation.
  - **Evidence:** `report.md#runtime-reproduction`

- [ ] **What:** Refusing a replacement leaves the standing company unchanged.
  - **Steps:**
    1. Let one company settle.
    2. Enter a value the route refuses.
  - **Expected:** Identity, readiness, and company evidence remain attached to the standing company.
  - **Verify:** Browser automation.
  - **Evidence:** `report.md#runtime-reproduction`
