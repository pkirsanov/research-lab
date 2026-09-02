# Bubbles Framework Change Proposal

- Title: G090 convergence summary counted as snapshot
- Slug: g090-convergence-summary-counted-as-snapshot
- Created: 2026-09-02
- Created From: research-lab
- Requested Upstream Repo: bubbles

## Summary

Gate G090 counts a `convergenceLoops[]` iteration summary as an incomplete turn
snapshot because that summary carries `startedAt` but no end field. The sanctioned
writer and convergence schema expose no close operation or `completedAt` field.
As a result, a valid convergence update can force `snapshotCompleteness` to zero
even when `turnSnapshots[]` contains paired start and end records.

## Why This Must Be Upstream

The writer, convergence schema, metric classifier, and G090 selftest are all
framework-owned. A project artifact cannot change their shared semantics. Editing
the installed `.github/bubbles/**` projection would violate downstream framework
immutability and would be replaced by the next framework refresh.

## Proven Affected Installation

- Installed Bubbles version: `7.28.0`
- Installed source reference: `fix/g093-certification-window`
- Installed source commit: `a5e811c60602af4c633a284a308b10029d620d18`
- Proven carrier: `specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash`

This proposal claims only the installation above as proven affected. The canonical
source owner must determine the first affected and fixed release boundaries.

## Exact Reproduction

Run the installed checker from the Research Lab repository root:

```bash
timeout 180 bash .github/bubbles/scripts/retro-convergence-health.sh \
  specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash \
  --repo-root . --format both
```

The current command exits `1`. Recap plus handoff is `0`, summarize-history is
`0`, and the only failing metric is `snapshotCompleteness=0` against required `1`.
The matching convergence summary has this observed shape:

```text
agent=bubbles.sprint
iterationCount=2
startedAt=2026-09-02T06:43:44Z
lastUpdated=2026-09-02T09:54:15Z
completedAt=<absent>
```

The same session contains a paired `phase_2_execute_goals` start and end for the
same sprint agent and scope. BUG-005 `execution.completedAt` is also populated.
Neither fact affects G090 because the matching convergence summary becomes the
selected record and is recursively classified as the sole snapshot.

An isolated fixture made every `turnSnapshots[]` phase fully paired. With only
fields emitted by `state-snapshot.sh`, G090 still exited `1` at completeness `0`.
An otherwise identical control added only `convergenceLoops[].completedAt` and
G090 exited `0` at completeness `1`. That field is not emitted or normalized by
the sanctioned convergence contract.

## Root Cause

`retro-convergence-health.sh` first selects objects attributed by `specDir`.
The convergence summary satisfies that filter. Its recursive `snapshot_records`
selector then accepts any object with `startedAt`, while completeness requires an
end field on that same object.

The actual `turnSnapshots[]` writer uses paired `mode=start|end` records. It does
not currently persist `specDir` on those records, although the G090 selftest does.
The production classifier therefore measures a convergence summary that cannot
close instead of the turn lifecycle defined by the framework documentation.

## Proposed Bubbles Change

Use the existing turn-snapshot contract as the source of snapshot completeness.

1. Exclude normalized `convergenceLoops[]` summaries from `snapshot_records`.
2. Persist canonical `specDir` on turn snapshots when `--spec-dir` is supplied.
3. Measure paired `mode=start|end` records attributed to the requested spec.
4. Preserve supported legacy snapshot records that genuinely carry start and end fields.
5. Report absent attributable snapshots as unmeasured or skipped, never as a silent pass.

Do not add a convergence-close lifecycle by default. That would duplicate the
existing turn lifecycle and change an iteration summary into a second snapshot
type. The current writer, schema, documentation, and selftest identify
`turnSnapshots[]` as the intended start and end contract.

## Affected Framework Paths

- `bubbles/scripts/retro-convergence-health.sh`
- `bubbles/scripts/retro-convergence-health-selftest.sh`
- `bubbles/scripts/state-snapshot.sh`
- `bubbles/scripts/state-snapshot-selftest.sh`
- `agents/bubbles_shared/operating-baseline.md` only if attribution wording changes

`bubbles/scripts/session-state-lib.sh` needs a change only if the source owner
chooses the larger convergence-close design instead.

## Required Upstream Tests

1. Generate paired turn snapshots and a convergence update through the sanctioned
   helper. G090 must return completeness `1`.
2. Remove one turn-end record from the same generated fixture. G090 must exit `1`.
3. Keep `startedAt` and `lastUpdated` on the convergence summary. They must not
   increase the snapshot denominator.
4. Add `completedAt` only to the convergence summary. It must not change the
   completeness result.
5. Preserve legacy complete, legacy incomplete, cross-spec, and manual-runtime cases.
6. Run the G090 selftest, state-snapshot selftest, persistent regression, and full
   framework validation.

## No Bypass

Keep the required completeness threshold at `1`. Add no BUG-005 exception, no
allowlist, and no skip flag. Do not repair session JSON by hand. Trusted state must
come only from the sanctioned helper and corrected upstream classifier.

## Research Lab Upgrade And Revalidation

After the canonical Bubbles owner publishes the fixed version:

1. Run `bash .github/bubbles/scripts/cli.sh upgrade <fixed-version> --dry-run`.
2. Run `bash .github/bubbles/scripts/cli.sh upgrade <fixed-version>`.
3. Run `bash .github/bubbles/scripts/cli.sh framework-write-guard`.
4. Let the normal orchestrator append a fresh attributed start and end pair.
5. Re-run the direct G090 command above.
6. Re-run BUG-005 artifact lint, traceability, and the state-transition guard.
7. Keep G136 human acceptance separate. A G090 repair does not satisfy it.

## Expected Downstream Outcome

G090 measures real turn start and end pairs. A convergence iteration summary no
longer creates a permanent false incomplete snapshot, while a genuinely missing
turn-end record remains blocking.

## Acceptance Criteria

- [ ] A sanctioned paired turn fixture with a convergence summary reports completeness `1`.
- [ ] The same fixture with one missing turn end exits `1`.
- [ ] Convergence summary timestamps never enter the snapshot denominator.
- [ ] An unsupported summary `completedAt` cannot change the verdict.
- [ ] No threshold, exception, allowlist, or bypass is added.
- [ ] Upstream selftests and framework validation pass.
- [ ] A normal framework refresh distributes the repair to Research Lab.