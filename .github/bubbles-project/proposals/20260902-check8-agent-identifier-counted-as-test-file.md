# Bubbles Framework Change Proposal

- Title: Check 8 Counts An Agent Identifier As A Test File
- Slug: check8-agent-identifier-counted-as-test-file
- Created: 2026-09-02
- Created From: research-lab
- Requested Upstream Repo: bubbles

## Summary

The state-transition guard's Check 8 treats the backticked agent identifier
`bubbles.test` as a basename-only test file. The identifier is ordinary prose,
not a Test Plan file reference, but its `.test` suffix satisfies the parser's
supported-file predicate and produces a false missing-file failure.

## Why This Must Be Upstream

The parser, its selftests, and the state-transition contract are
framework-managed. Research Lab must not patch its installed
`.github/bubbles/**` projection. The repair must land in the canonical Bubbles
repository and arrive through a normal framework refresh.

## Proven Affected Surface

- Downstream repository: Research Lab
- Observed packet:
  `specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys`
- False candidate: `bubbles.test`
- Current parser:
  `.github/bubbles/scripts/state-transition-guard.sh`, Check 8

This proposal records the affected installed projection. The upstream owner
must determine the first affected and fixed framework releases.

## Current Evidence

The BUG-007 delivery audit records Check 8 classifying the backticked
`bubbles.test` identifier as a missing basename-only `.test` file. Current
source inspection shows the two conditions that admit it:

1. `_check8_candidate_from_block` accepts a bare token containing letters,
   digits, dots, underscores, slashes, or hyphens.
2. `_check8_candidate_has_supported_suffix` accepts every non-empty token that
   ends in `.test`.

The same BUG-007 spec contains three backticked `bubbles.test` references in
prose. They identify the test-phase agent; none names a repository file.

This filing does not claim a current-session transition pass or an upstream
fix. The audit's command evidence remains the originating failure receipt.

## Root Cause

Check 8 infers file references from generic Markdown backtick blocks. It then
uses suffix shape without enough semantic context to distinguish a Bubbles
agent identifier from a basename-only file reference. Because `test` is both a
valid agent role and a recognized compound filename suffix, `bubbles.test`
crosses both lexical gates.

## Proposed Bubbles Change

Prefer structured Test Plan file locations and command path arguments over
unscoped prose backticks. For any legacy Markdown fallback, preserve the source
context needed to classify a token before applying the suffix predicate.

The correction must satisfy all of these constraints:

1. Ignore `bubbles.test` when it appears as an agent identifier in prose.
2. Preserve a real file named `bubbles.test` when a Test Plan File/Location
   field or executable command explicitly references it.
3. Preserve basename-only references for every currently supported test suffix.
4. Preserve command-wrapped shell paths and compound `.spec.mjs` and
   `.test.mjs` handling.
5. Do not add an allowlist for BUG-007, a skip flag, or a downstream exception.

## Affected Framework Paths

- `bubbles/scripts/state-transition-guard.sh`
- `bubbles/scripts/state-transition-guard-selftest.sh`
- Shared parsing code only if the upstream owner extracts the Check 8 parser

## Required Upstream Tests

1. A prose sentence containing backticked `bubbles.test` produces no file
   candidate and no missing-file finding.
2. A Test Plan File/Location cell containing a real fixture named
   `bubbles.test` remains a valid concrete file reference.
3. A missing real `bubbles.test` fixture in that same structured context still
   fails.
4. Existing basename-only, command-wrapped shell, `.spec.mjs`, and `.test.mjs`
   controls remain green.
5. The full state-transition selftest and framework validation pass.

## Research Lab Upgrade And Revalidation

After an upstream release contains the repair, use the normal framework upgrade
flow, run `bash .github/bubbles/scripts/cli.sh framework-write-guard`, and rerun
the BUG-007 asserted transition. Keep unrelated nonterminal, phase, scope, and
G090 failures visible; a Check 8 repair must not convert them into a pass.

## Acceptance Criteria

- [ ] Prose agent identifiers never become Check 8 file candidates.
- [ ] Structured references to real basename-only `.test` files still work.
- [ ] Missing structured `.test` file references still fail.
- [ ] Existing Check 8 path-shape regressions remain covered.
- [ ] No packet-specific exception, allowlist, threshold change, or bypass is added.
- [ ] A normal framework refresh distributes the repair to Research Lab.