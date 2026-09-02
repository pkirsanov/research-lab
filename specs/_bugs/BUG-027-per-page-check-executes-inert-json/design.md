# Initial Bug Fix Design: BUG-027 — Type-Aware Per-Page Validation

## Design Status

This filing contains a substantive initial design. `bubbles.design` must confirm the executable type inventory and finalize this artifact before implementation dispatch.

## Root Cause Analysis

### Investigation Summary

The command registry selects every `script` element that lacks `src`. Its extraction maps each match directly to the body text.

The following loop receives no attributes and calls `new Function()` for every body. It cannot know that the first Company Intelligence block declares `type="application/json"`.

The Company Intelligence unit carrier uses the opposite rule for that block. It selects the typed block, parses its body with `JSON.parse`, and compares the object with the committed configuration.

### Root Cause

The validator erases content-type metadata before choosing a parser. This makes JavaScript syntax validation an unconditional operation instead of a type-specific operation.

The failure order compounds the defect. The unconditional syntax loop runs before the literal DOM-ID scan, so one valid inert block suppresses both promised executable checks.

### Impact Analysis

- A valid mixed-content single-file tool fails its required per-page command.
- The command does not reach all executable scripts on the affected page.
- The command does not reach its literal DOM-ID check.
- Product runtime behavior is not implicated by this command failure.
- The defect can affect any changed page that embeds typed inert data.

## Fix Design

### Solution Approach

Move the one-liner’s logic into one project-owned Node validator. The planned path is `scripts/validate-page-inline.mjs`. This path does not exist at filing time.

The command registry should invoke that validator with one explicit page argument. The validator should expose its source-validation function for focused tests.

The validator should process each non-`src` script in document order:

1. Preserve the element attributes and body.
2. Normalize the declared `type` without inventing a default for an explicit unknown type.
3. Send recognized executable types to the matching JavaScript syntax checker.
4. Send `application/json` to `JSON.parse`.
5. Reject an unsupported declared inert type with a type-specific message.
6. Collect literal `getElementById()` references only from executable bodies.
7. Compare those references with IDs extracted from the complete HTML source.
8. Exit zero only after every applicable check succeeds.

### Executable Type Contract

A missing `type` is classic JavaScript under HTML semantics. Explicit classic JavaScript MIME types must follow the same parser path.

The design owner must inspect every current inline type value before fixing the closed executable allowlist. If an inline module exists, its body needs a module-capable syntax checker rather than `new Function()`.

An unknown explicit type must never be guessed as JavaScript. It must fail with a diagnostic that names the unsupported type.

### JSON Data Contract

`application/json` blocks are inert data. Parse their complete text with `JSON.parse`.

A parse failure must identify the page, script ordinal, declared type, and JSON error. A valid object, array, scalar, or `null` is valid JSON unless a page-specific semantic command adds stronger rules.

This generic validator must not replace page-specific checks. The Company Intelligence deep-equality assertion remains the semantic authority for its configuration mirror.

### DOM-ID Contract

Scan literal `getElementById()` references only in executable JavaScript bodies. Keep the existing literal-string scope.

The checker must fail with the unique missing IDs. It must not treat a JSON string containing JavaScript-like text as an executable reference.

### CLI Contract

The planned command shape is `node scripts/validate-page-inline.mjs <page>`. The page argument is required.

Missing files, unreadable files, absent inline executable scripts, parse failures, unsupported types, and missing IDs must exit nonzero. Success should report the page plus counts by validated content class.

### Error Contract

Diagnostics should distinguish these failure classes:

- executable JavaScript syntax
- inert JSON syntax
- unsupported inline script type
- missing literal DOM IDs
- missing or unreadable page input

The command must not convert one class into another. It must not report an inert JSON error as an executable-script error.

## Test Design

Create a focused Node test carrier after `bubbles.design` finalizes the design and `bubbles.plan` selects its canonical path. No carrier path is authorized at filing time.

The carrier must exercise the exported validator and the production CLI entrypoint. It must include these adversarial cases:

1. malformed executable JavaScript fails
2. malformed `application/json` fails
3. valid inert JSON plus valid executable JavaScript passes
4. a missing literal DOM ID fails

The valid mixed case should also include an inert JSON string that resembles `getElementById("ghost")`. The command must not classify that data string as an executable reference.

Run the repaired command against the real Company Intelligence page. Run the existing complete browser carrier without changing its source.

## Consumer And Reachability Plan

- `.specify/memory/agents.md` becomes the human command entrypoint.
- The planned validator becomes its only implementation target.
- The focused test imports the same implementation used by the CLI.
- `scripts/selftest.mjs` should invoke or cover the validator contract only if the design owner confirms repository-selftest wiring is the existing convention.

No production page should import the validator. Its consumer is the repository validation command.

## Alternative Approaches Considered

1. **Exclude only `application/json` with a negative regular expression.** Rejected because it silently skips malformed JSON and repeats the classification error for another inert type.
2. **Keep the one-liner and add a type branch.** Rejected because the command is already difficult to test and diagnose as one opaque expression.
3. **Skip every script with a `type` attribute.** Rejected because explicit JavaScript types remain executable and still require syntax and DOM-ID validation.
4. **Treat unknown types as JavaScript.** Rejected because it recreates the current false failure.
5. **Treat unknown types as valid inert data.** Rejected because silent omission would turn the required check into a false pass.
6. **Change the Company Intelligence page to avoid inert JSON.** Rejected because the page’s mixed-content design is valid and independently tested.

## Complexity Tracking

| Decision | Simpler fix considered | Why rejected |
| --- | --- | --- |
| One checked-in validator | Extend the command-registry one-liner | A checked-in module can share one implementation with adversarial tests and clear diagnostics. |
| Closed type dispatch | Skip the known JSON block | A single exclusion does not validate the data and does not handle other declared types safely. |
| Separate syntax and semantic checks | Make the generic validator enforce Company Intelligence deep equality | Page-specific semantics already have a focused owner and must not enter the generic command. |

## Security And Data Handling

The validator reads one repository file and executes no page code. Syntax compilation must not invoke the compiled function.

JSON parsing must not merge parsed values into application objects. The parsed value is discarded after syntax validation.

## Rollback

Restore the prior command-registry entry and remove the project-owned validator and focused tests in one change. Product runtime files remain untouched in both directions.

## Open Design Decision

`bubbles.design` must confirm the closed executable MIME inventory and the module-script parser rule from current repository evidence. No implementation dispatch is authorized before that decision is recorded.
