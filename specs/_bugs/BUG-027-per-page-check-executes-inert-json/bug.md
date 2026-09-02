# BUG-027: Per-Page Check Executes Inert JSON as JavaScript

## Summary

The canonical per-page validator executes every non-`src` script body as JavaScript. It therefore rejects a valid `application/json` data block before checking executable page code.

## Severity

- [ ] Critical — System unusable or data loss
- [ ] High — Major product behavior broken without a bounded alternative
- [x] Medium — Required validation rejects a valid page and blocks its documented check
- [ ] Low — Cosmetic or low-impact issue

## Status

- [ ] Reported
- [x] Confirmed
- [ ] In Progress
- [ ] Fixed
- [ ] Verified
- [ ] Closed

## Origin

- Finding: `BUG-025-SIMPLIFY-GAP-001`
- Route request: `BUG-025-ROUTE-008`
- Origin packet: [BUG-025](../BUG-025-company-corpus-read-never-settles/)
- Origin evidence: [gaps-phase-page-check](../BUG-025-company-corpus-read-never-settles/report.md#gaps-phase-page-check)

## Affected Surface

The defect is in the command registered under “Per-page inline script and ID check” in [the command registry](../../../.specify/memory/agents.md).

The current reproducer targets [company-intelligence-lab.html](../../../company-intelligence-lab.html). That page contains an inert `script` element with `type="application/json"` before its executable inline scripts.

## Reproduction Steps

1. Open the registered per-page command in `.specify/memory/agents.md`.
2. Change only `PAGE` to `company-intelligence-lab.html`.
3. Run the command with an explicit timeout.
4. Observe the command apply `new Function()` to inline script 1.
5. Observe exit code 1 before executable-script validation completes.

## Expected Behavior

The validator must classify each non-`src` inline script by its declared type.

- Executable inline JavaScript must receive syntax validation.
- Literal `getElementById()` references in executable JavaScript must resolve to HTML IDs.
- An `application/json` data block must receive JSON parsing instead of JavaScript execution.
- Malformed executable JavaScript, malformed inert JSON, and missing literal IDs must each fail.
- Valid inert JSON beside valid executable JavaScript must pass.

## Actual Behavior

The selector gathers every non-`src` script body without retaining its type. The loop then calls `new Function()` on every gathered body.

The valid embedded JSON mirror becomes inline script 1. Node reports `Unexpected identifier 'is'`, and the command exits 1 before validating executable script syntax or DOM references.

## Environment

- Repository: `research-lab`
- Platform: Linux
- Runtime observed: Node.js `v24.12.0`
- Validation surface: build-free per-page Node command

## Error Output

```text
Error: inline script 1: Unexpected identifier 'is'
    at [eval]:1:365
    at Array.forEach (<anonymous>)
    at [eval]:1:314
Node.js v24.12.0
```

## Root Cause

The registered extractor discards script attributes. The validator therefore cannot distinguish executable JavaScript from an inert typed data block.

Its unconditional `new Function()` loop treats syntax rules for one content type as universal. This classification error occurs before the command reaches its literal DOM-ID check.

## Filing Boundary

This packet records and routes the defect. This invocation changes no command registry, validator, product source, or test file.

## Related

- [Specification](spec.md)
- [Initial design](design.md)
- [Scope plan](scopes.md)
- [Filing evidence](report.md#current-session-reproduction)
- [Human validation](uservalidation.md)
