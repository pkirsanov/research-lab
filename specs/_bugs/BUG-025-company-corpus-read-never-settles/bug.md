# BUG-025: A Company Corpus Read That Never Answers Never Settles

**Status:** Reported. Source control flow is confirmed; a never-answering browser reproduction has not run.

**Severity:** High reliability impact. The route keeps its pending copy honest, but it has no terminal path when a same-origin response never settles.

**Origin:** `BUG018-STABILIZE-001`, raised while reviewing `specs/_bugs/BUG-018-corpus-pending-window-states-absence-as-settled-fact`.

**Route:** `company-intelligence-lab.html`

## Summary

`loadCorpus()` sets `corpusStatus` to `pending` and awaits a chain containing direct `fetch()` calls in `loadOne()`, `loadOptionalJson()`, and `readConfig()`. None supplies an abort signal or races the request against a declared time bound. If one response neither succeeds nor fails, the chain cannot reach the code that records `loaded` or `unavailable` and repaints the route.

BUG-018 makes the pending paint truthful. It does not require pending to terminate. This finding is therefore independent and is tracked here rather than being folded into BUG-018's completed readiness-claim scopes.

## Reproduction Contract

1. Serve the repository over HTTP from an origin that accepts one requested company corpus path.
2. Keep that response open without sending a body or closing the connection.
3. Open `company-intelligence-lab.html?symbol=MSFT`.
4. Observe the first composed paint and then wait beyond the declared read bound once one exists.

A current failing browser receipt is not present. The source path proves that no bound exists; the runtime scenario must be executed before implementation changes are treated as a fix.

## Expected Behavior

Every requested committed document reaches one of two bounded outcomes:

- the response settles and the route uses it; or
- the declared bound expires, the underlying request is aborted, and the existing unavailable path settles the current reading.

The cache-first composed paint must remain available while the request is pending.

## Actual Behavior

A response that never settles leaves `data-corpus-status="pending"` and `data-reading-readiness="not-established"` without a product-owned terminal transition.

## Root Cause

The route calls browser `fetch()` directly at the three acquisition boundaries. The promise chain has rejection handling, but rejection handling cannot run while the browser promise remains pending. No `AbortController`, fetch `signal`, or declared timeout participates in those calls.

## Independent Classification

BUG-018 constrains what a pending reading may claim. BUG-025 constrains how long a committed-document read may remain pending. The requirements and acceptance criteria are different, and the latter requires a configuration decision that BUG-018 never made.

BUG-021 repaired the same failure class in the Lifetime Tax Strategy Lab. It does not cover this route or its configuration contract.

## Related

- `specs/_bugs/BUG-018-corpus-pending-window-states-absence-as-settled-fact/`
- `specs/_bugs/BUG-021-pack-read-has-no-bound-so-the-route-waits-without-end/`
- `specs/025-company-multi-horizon-intelligence-lab/`
