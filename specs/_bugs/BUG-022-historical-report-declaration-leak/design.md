# Bug Fix Design: BUG-022 Historical Report Declaration Leak

## Design Brief

### Current State

`collectDeclaredTestGlobs()` scans every readable text line for a glob-shaped
Node test argument. It records the matching artifact and line, but not the
artifact's authority role.

The Feature 008 BUG-004 report contains a valid historical command receipt.
That receipt currently creates eight false Node and Playwright crossings.

### Target State

The collector keeps broad candidate discovery and classifies every candidate
before it contributes to active discovery. Current command contracts remain
authoritative. Historical evidence remains visible but cannot select tests.

### Patterns to Follow

- Reuse `markdownFenceMask()` and `markdownHeadings()` from
  `scripts/validate-scope-dod-progress.mjs`.
- Preserve the structured `test-plan.json` model used by
  `scripts/validate-spec-test-paths.mjs`.
- Keep `.specify/memory/agents.md` as project command truth.
- Keep `playwright.config.mjs::testMatch` as direct browser authority.
- Preserve artifact and line provenance on every declaration candidate.

### Patterns to Avoid

- Do not skip files with `basename === "report.md"`.
- Do not special-case Feature 008, BUG-004, or `tests/portfolio-*.mjs`.
- Do not scan only an allowlist that can hide a new active command.
- Do not add portfolio paths to `KNOWN_DISCOVERY_CROSSINGS`.
- Do not let a Markdown heading override the enclosing artifact role.

### Resolved Decisions

- Artifact role has higher precedence than section heading text.
- Candidate collection remains repository-wide and non-vacuous.
- Only active sites contribute to Node discovery and reachability.
- Historical sites remain observable through structured diagnostics.
- Unclassified glob candidates fail closed instead of disappearing.
- The two legitimate Node families gain current registry declarations.
- The historical Feature 008 report remains byte-for-byte unchanged.

### Open Questions

None. The spec and parser counterfactual settle the role boundary and migration.

## Purpose And Scope

This design separates current test authority from execution history. It changes
how `scripts/validate-test-file-reachability.mjs` interprets command-shaped
text. It does not change Node or Playwright discovery syntax.

The repair covers four owned implementation surfaces named by the bug packet:

- `scripts/validate-test-file-reachability.mjs`
- `tests/playwright-runtime.foundation.functional.mjs`
- `.specify/memory/agents.md`
- the BUG-022 packet

The design protects the Feature 008 BUG-004 report and all unrelated dirty
paths. It introduces no product runtime, storage, network, or UI behavior.

## Root Cause And Required Invariants

`NODE_TEST_INVOCATION` correctly recognizes arguments after `--test`. Its
output lacks the context needed to decide whether the text is current authority
or historical evidence.

The repair preserves these invariants:

1. A current Node glob selects every matching direct Node test.
2. Playwright `testMatch` selects every matching browser specification.
3. The two active selections remain disjoint outside the frozen crossing set.
4. The frozen crossing set only shrinks.
5. A historical receipt never creates current reachability.
6. Every glob candidate receives an explicit role and reason.
7. Zero active Node declarations remains a vacuity failure.
8. Reachability baseline growth remains forbidden.

## Architecture Overview

The collector becomes a two-stage pipeline.

1. **Candidate extraction** finds Playwright matchers and Node glob arguments.
2. **Authority classification** assigns artifact role, section role, and status.

The first stage remains broad. The second stage is closed and fail-closed. This
keeps historical commands observable without letting them affect active sets.

`validateTestFileReachability()` compiles only active candidates. The
runtime-foundation disjointness test consumes the same filtered declarations.
Neither consumer implements an independent authority rule.

### Single-Implementation Justification

This is a narrow repair inside the existing reachability collector. It adds no
second provider, adapter, screen, service, or shared product capability. A
plugin or strategy layer would add indirection without reducing complexity.

## Authority Model

### Artifact Roles

| Surface | Structured recognition | Authority result |
| --- | --- | --- |
| `playwright.config.mjs` | Existing `testMatch` parser | Active direct configuration |
| `.specify/memory/agents.md` | True `Command Registry` heading ancestry | Active current command |
| `scopes.md` or `scopes/**/scope.md` | True `Test Plan` heading ancestry | Active current plan |
| `specs/**/test-plan.json` | Parsed `scopes[].tests[].command` field | Active structured plan |
| Project notes | True `Validation` heading ancestry | Active current validation command |
| Canonical packet or scope report | Artifact role from the Bubbles packet layout | Historical evidence |
| Other glob-shaped command text | Candidate with no recognized authority role | Classification error |

The role resolver models canonical artifact layouts. It does not exclude an
arbitrary basename during recursive traversal. The resolver returns a role for
each candidate and retains the original site.

### Section Rules

Markdown classification uses the existing fence mask and heading parser.
Heading ancestry comes only from real ATX headings outside fences.

- A command may appear inside a fenced command block under a real active
  heading. The surrounding heading still supplies its section role.
- A heading written inside a fence never opens or closes an active section.
- A report remains historical even when it contains a real `Test Plan` or
  `Command Registry` heading.
- A nested active-looking heading cannot override a historical artifact role.
- A heading alone cannot supersede an active declaration.

These precedence rules prevent a misleading heading or fence from changing
authority.

### Supersession And Correction

BUG-022 needs no new supersession schema. The correction is additive:

- preserve the historical report bytes
- add current family commands to the project command registry
- classify the old receipt as historical evidence

An evidence correction may be appended to a report. Both the original receipt
and its correction remain historical. A current command change belongs in a
current authority surface. Heading text alone never demotes an active command.

## In-Memory Contract

Each extracted site carries this logical shape:

| Field | Type | Meaning |
| --- | --- | --- |
| `pattern` | string | Glob-shaped test argument |
| `kind` | enum | `playwright-testMatch` or `node-test-argument` |
| `artifact` | repository-relative string | Source artifact |
| `line` | positive integer | Original source line |
| `artifactRole` | closed enum | Config, registry, plan, note, report, or unknown |
| `sectionRole` | closed enum | Command registry, test plan, validation, evidence, or none |
| `authority` | enum | `active`, `historical`, or `error` |
| `reason` | closed string | Machine-readable classification explanation |

The public collector result separates these views:

- `globs`: patterns with at least one active site
- `historicalSites`: recognized report evidence candidates
- `classificationErrors`: candidates that have no closed authority decision
- `scannedFiles`: every readable artifact considered by candidate extraction

If one pattern has both active and historical sites, only active sites support
reachability. Historical sites stay visible and cannot strengthen the pattern.

## Processing Flow

### Current Command Flow

1. Candidate extraction finds a Node glob.
2. The role resolver identifies the enclosing artifact.
3. The Markdown parser computes real heading ancestry where applicable.
4. The classifier returns `active` with artifact and line provenance.
5. Reachability and disjointness compile the pattern.

### Historical Receipt Flow

1. Candidate extraction finds the same Node glob in a report.
2. The role resolver identifies the report as execution evidence.
3. The classifier returns `historical` regardless of its headings or fences.
4. Diagnostics retain the site.
5. Reachability and disjointness exclude the site.

### Unclassified Candidate Flow

1. Candidate extraction finds a glob outside a recognized role.
2. The classifier returns `error` with artifact, line, and section context.
3. Validation exits non-zero.
4. The operator promotes the command into a current authority or records it in
   a recognized evidence surface.

This flow prevents a broad ignore from making the scanner silently green.

## Migration And Compatibility

The migration assigns current authority in `.specify/memory/agents.md`, the
canonical project command registry, to both Node families:

- Functional Node files that use the `.functional.mjs` suffix.
- Direct Node files that use the `.test.mjs` suffix.

The registry additions replace accidental reachability supplied by reports.
The portfolio-wide glob receives no active declaration because it selects
Playwright specifications.

An authority-delta check compares pre-repair candidates with classified sites.
Every removed active site must be a recognized historical report site. Any
other demotion blocks the repair. This preserves active commands in scope Test
Plans, structured test plans, and project `Validation` sections.

The reachability baseline remains unchanged. The frozen crossing set receives
no portfolio entries. Existing non-report declarations retain their current
classification, including the causal-rotation note under `## Validation`.

There is no persisted-data migration. There is no config version or feature
flag.

## Failure Handling And Diagnostics

The validator fails for each condition below:

- no Playwright matcher
- no active Node glob
- no scanned artifacts
- malformed structured test-plan input containing command candidates
- an unclassified glob candidate
- a new reachability orphan
- a new Node and Playwright crossing

`--all-sites` should show active, historical, and error sites with their role,
reason, artifact, and line. Normal output should include counts for all three
authority states. Historical candidates are not warnings by themselves.

A parser error must not downgrade a candidate to historical or unknown. It must
remain a blocking classification error.

## Security And Integrity

The primary integrity boundary is evidence immutability. The implementation
must not rewrite, normalize, or regenerate any report while classifying it.

Artifact role precedes heading text. This prevents content inside an untrusted
receipt from granting itself authority. Fence-aware heading parsing prevents a
code sample from changing the section state machine.

The change boundary excludes installed framework files and concurrent product
work. An explicit Git pathspec must contain only `design.md` and `state.json`
for this design invocation.

## Testing And Validation Strategy

Tests must call the production collector against isolated fixture roots. They
must not reimplement the role classifier in the assertion setup.

| Scenario | Category | Required assertion |
| --- | --- | --- |
| Report receipt | Functional | `tests/portfolio-*.mjs` appears only in `historicalSites` |
| Active scope Test Plan | Functional | The identical command appears in `globs` with its artifact and line |
| Structured test plan | Functional | A parsed `tests[].command` remains active |
| Misleading report heading | Adversarial functional | A real `Test Plan` heading inside a report cannot grant authority |
| Fenced fake heading | Adversarial functional | A fenced heading cannot change the enclosing section role |
| Active broad command | Adversarial functional | The portfolio pattern still selects a browser spec and creates a crossing |
| Family migration | Functional | Functional and `.test.mjs` files remain reachable without report sites |
| Unknown candidate | Adversarial functional | An unclassified glob causes a non-zero result with provenance |
| Historical immutability | Git integrity | The protected report blob remains byte-identical |
| Repository closure | Functional | Reachability, runtime-foundation, and selftest commands retain their invariants |

The red control uses the active broad command. It must fail on the crossing.
The historical control uses the same bytes in a report and must not cross.
Together they reject an implementation that ignores every Node declaration.

## Rollout And Rollback

The repair lands atomically with the classifier, focused regression coverage,
and both command-registry declarations. Landing only the report classification
would create 33 new active reachability gaps.

Rollback reverses those implementation hunks together. It never changes the
Feature 008 report. A partial rollback is invalid because parser behavior and
registry authority must remain coherent.

## Alternatives And Tradeoffs

### Rewrite The Receipt

Rejected. It corrupts an immutable record of a real execution.

### Skip Every `report.md` Basename

Rejected. It encodes a filename exception, hides candidate provenance, and
cannot defend against misleading structure.

### Add The Portfolio Paths To The Frozen Crossing Set

Rejected. It weakens disjointness for files with no active Node owner.

### Scan Only A File Allowlist

Rejected. A new active command outside the list would disappear silently.

### Treat Every Command-Shaped String As Active

Rejected. That is the current defect and makes historical evidence mutable in
effect.

## Complexity Tracking

| Decision | Simpler alternative | Why rejected |
| --- | --- | --- |
| Closed artifact and section classification | Skip report basenames | A basename skip hides provenance and has no structural anti-bypass rule |
| Broad candidate ledger with classification errors | Scan only known authority files | An allowlist can silently hide a newly active command |
| Active and historical site separation | Delete historical sites during collection | Deletion prevents migration audits and weakens diagnostics |
| Paired active and historical adversarial controls | Test only the report case | An ignore-all parser would pass the weaker test |
| Atomic registry migration | Classify reports first | The partial change exposes 33 legitimate tests as new orphans |

## Decision Closure

None found. The current parser, structured Markdown utilities, command registry,
and BUG-022 requirements provide one testable design.
