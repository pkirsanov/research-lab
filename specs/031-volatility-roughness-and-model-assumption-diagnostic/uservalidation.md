# User Validation: Feature 028 Volatility Roughness and Model-Assumption Diagnostic

## Checklist

These checked items record the accepted planning baseline only. They do not claim implemented behavior, executed tests, or human acceptance of a running product.

- [x] The planned diagnostic remains opt-in and preserves the existing Feature 011 decision-first experience.
- [x] The planned state model keeps page evaluation states (`disabled`, `computing`, `cancelled`, `stale-result`), wrapper states (`disabled`, `pending`, `available`), and canonical diagnostic states (`unavailable`, `inconclusive`, `supported`) distinct.
- [x] The planned conclusion is model-assumption evidence only and never a directional, pricing, calibration, portfolio, or execution signal.
- [x] The planned UI keeps Simple decision-first and places complete evidence in Power.
- [x] The planned implementation uses one cloned, deep-frozen current cache snapshot, adds no enable-path provider request, and does not stop an independent refresh already in progress.
- [x] The planned accessibility contract includes keyboard operation, visible focus, polite announcements, spoken equations, semantic tables, non-color meaning, narrow width, and zoom.
- [x] The planning packet treats Feature 011 as the delivered sole technical dependency and orders execution as SCOPE-028-01, SCOPE-028-02, SCOPE-028-03, then SCOPE-028-04 without a special revalidation trigger.

## Human Acceptance

No human acceptance session has been conducted. A validation owner must add observed results after implementation and real product execution.
