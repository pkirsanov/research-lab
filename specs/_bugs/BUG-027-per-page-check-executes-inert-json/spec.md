# Spec: BUG-027 — Type-Aware Per-Page Script Validation

## Purpose

The required per-page command must validate mixed inline content according to each script element’s declared type. Valid data blocks must not prevent executable JavaScript and DOM-ID checks from running.

This packet defines a validator repair. It does not claim that the repair exists.

## Outcome Contract

A changed single-file tool has one deterministic validation command. The command validates executable inline JavaScript, validates supported inert data formats, and checks literal DOM references.

A valid mixed-content page exits zero. A malformed supported block or missing referenced ID exits nonzero with a type-specific diagnostic.

## Product Principle Alignment

### P19 — One definition per concept

The command registry must point to one project-owned validator implementation. The script-type rules and DOM-reference rules must not be duplicated across command prose and tests.

### P23 — A guard that cannot fail is not a guard

The regression set must perturb each protected behavior. Malformed JavaScript, malformed JSON, and a missing DOM ID must each turn the command red.

This work improves the measurement of decision quality. It prevents a required validation command from rejecting valid pages before it evaluates the behavior it claims to protect.

## Functional Requirements

### FR-027-001 — Preserve script attributes during extraction

The validator must retain each non-`src` script element’s declared `type` and body. It must not reduce all bodies to an untyped string list.

### FR-027-002 — Validate executable JavaScript as JavaScript

Every recognized executable inline JavaScript block must receive syntax validation that matches its script grammar. Malformed executable JavaScript must make the command exit nonzero.

### FR-027-003 — Validate inert JSON as JSON

An inline block declared as `application/json` must be parsed with JSON rules. Valid JSON must not be passed to a JavaScript evaluator. Malformed JSON must make the command exit nonzero.

### FR-027-004 — Fail loud on unsupported declared data types

A non-executable typed block without a registered format validator must produce an explicit unsupported-type failure. It must never fall through to JavaScript execution or silent omission.

### FR-027-005 — Preserve literal DOM-ID coverage

The validator must collect literal `getElementById()` references from executable JavaScript. Every referenced value must match an HTML `id` in the same page.

References encoded as data inside inert blocks must not become executable-code references.

### FR-027-006 — Preserve external-script exclusion

A script element with `src` remains outside inline-body syntax validation. The command must continue validating executable inline blocks on the same page.

### FR-027-007 — Validate every applicable block before success

The command must not report success until all supported inert blocks, executable blocks, and literal DOM-ID references pass.

### FR-027-008 — Keep one registered command surface

`.specify/memory/agents.md` must name one project-owned command for this check. The command must require an explicit page path and must not use a fallback page.

### FR-027-009 — Preserve product runtime bytes

The repair must not require changes to the Company Intelligence page, its embedded configuration, or its browser behavior. The validator must accept that valid existing mixed-content page.

## Acceptance Criteria

1. A fixture with malformed executable JavaScript exits nonzero.
2. A fixture with malformed `application/json` exits nonzero.
3. A fixture with valid `application/json` and valid executable JavaScript exits zero.
4. A fixture with a missing literal DOM ID exits nonzero.
5. The registered command exits zero for `company-intelligence-lab.html` after the repair.
6. Existing Company Intelligence browser behavior remains unchanged.
7. Every negative fixture proves the validator can detect its protected failure mode.

## Non-Goals

- Changing `company-intelligence-lab.html` or its embedded configuration mirror.
- Changing Company Intelligence runtime behavior.
- Adding a browser build step or project CLI.
- Validating external script contents through their `src` references.
- Introducing an HTML parsing dependency without an evidence-backed need.
- Broadening this defect into BUG-025 bounded-acquisition work.

## Change Boundary

The delivery scope may change the project command registry, one project-owned validator, its focused tests, and repository selftest wiring.

Product pages, product modules, existing Company Intelligence tests, README content, DomainModel content, portfolio code, baselines, and framework-managed files remain excluded.

## Grounding

- `.specify/memory/agents.md` registers the unconditional `new Function()` loop.
- `company-intelligence-lab.html` contains the inert `application/json` mirror.
- `tests/company-intelligence.unit.mjs` parses that mirror with `JSON.parse` and checks deep equality.
- `report.md#current-session-reproduction` records the current exit-1 command receipt.
- `specs/_bugs/BUG-025-company-corpus-read-never-settles/report.md#gaps-phase-page-check` records the independent origin route.
