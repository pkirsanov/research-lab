#!/usr/bin/env bash
set -euo pipefail

# convergence-cap-guard-selftest.sh
#
# Hermetic selftest for `bubbles/scripts/convergence-cap-guard.sh`
# (Gate G082 — convergence_cap_enforcement_gate).
#
# Builds a private mktemp Bubbles-repo surface (no edits to the host
# repo), stages three fixture scenarios in its `.specify/memory/`
# directory, invokes the guard with explicit `BUBBLES_REPO_ROOT`, and
# asserts exit codes plus stdout/stderr fingerprints.
#
# Scenarios (matches scope.md Gherkin):
#   S1: iterationCount = 11  → exit 1, stderr contains "G082" and
#                              "maxConvergenceIterations"
#   S2: iterationCount = 10  → exit 0, stdout contains "PASS"
#   S3: malformed session.json → exit 2, stderr contains diagnostic
#
# Additionally:
#   S0: empty / missing convergenceLoops[] → exit 0 (sanity check
#       proving the guard is no-op for specs that have not yet looped)
#   S5: historical revision at 16 + current revision at 1 → exit 0
#       (BUG-037: a prior authorized attempt cannot poison the current one)
#   S6: one revision across two agents reaches 11 → exit 1
#   S7: current goalId/revision with a substituted digest → exit 2
#   S8: legacy 16 blocks without a goal; a trusted goal at 1 passes beside it
#   S9: equal basenames in different nested paths remain isolated
#   S10: a partial goalRef fails closed
#   S11: a caller-supplied attempt selector is rejected
#
# Reference:
#   docs/Framework_Convergence_Health.md

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd -P)"
GUARD_SCRIPT="$SCRIPT_DIR/convergence-cap-guard.sh"

if [[ ! -x "$GUARD_SCRIPT" ]]; then
  echo "convergence-cap-guard-selftest: guard script not executable: $GUARD_SCRIPT" >&2
  exit 2
fi

# --- Hermetic workspace --------------------------------------------------

WORKSPACE="$(mktemp -d -t bubbles-conv-cap-selftest-XXXXXXXX)"
cleanup() {
  rm -rf "$WORKSPACE"
}
trap cleanup EXIT INT TERM

PASS_COUNT=0
FAIL_COUNT=0
declare -a FAILED_SCENARIOS=()

note() { printf '[selftest] %s\n' "$*"; }
ok()   { printf '[selftest] PASS: %s\n' "$*"; PASS_COUNT=$((PASS_COUNT + 1)); }
ko()   {
  printf '[selftest] FAIL: %s\n' "$*" >&2
  FAIL_COUNT=$((FAIL_COUNT + 1))
  FAILED_SCENARIOS+=("$1")
}

if [[ -n "${BUG037_EVIDENCE_ITEM:-}" ]]; then
  note "BUG-037 focused evidence item: $BUG037_EVIDENCE_ITEM"
fi

# --- Stage a minimal fake "Bubbles" repo surface inside WORKSPACE --------
#
# We need:
#   <root>/.specify/memory/bubbles.session.json
#   <root>/bubbles/workflows.yaml   (with maxConvergenceIterations: 10)
#
# The selftest stages files INSIDE its own mktemp workspace via heredocs.
# This is allowed by terminal-discipline policy (heredoc-to-file is
# forbidden for repo files; the workspace here is throwaway and never
# becomes part of the working tree).

stage_repo_root() {
  local root="$1"
  local cap="${2:-10}"

  mkdir -p \
    "$root/.specify/memory" \
    "$root/bubbles" \
    "$root/specs/900-convergence-fixture" \
    "$root/specs/999-other-spec" \
    "$root/specs/product-a/900-shared-name" \
    "$root/specs/product-b/900-shared-name"

  cat > "$root/bubbles/workflows.yaml" <<EOF
# Minimal workflows.yaml fixture for convergence-cap-guard selftest.
workflowModes:
  autonomous-goal:
    constraints:
      maxConvergenceIterations: $cap
EOF
}

write_session_json() {
  local root="$1"
  local payload="$2"

  printf '%s\n' "$payload" > "$root/.specify/memory/bubbles.session.json"
}

# complete_current_goal_authority <repo-root>
#
# Expands the identity core used by the older BUG-037 fixtures into the full
# versioned Goal Contract and the actionable repository mirror required to
# authorize convergence. Adversarial core-only and pending cases deliberately
# do not call this helper.
complete_current_goal_authority() {
  local root="$1"
  local session_file="$root/.specify/memory/bubbles.session.json"
  local temporary_file="$root/.specify/memory/bubbles.session.authorized.json"

  jq --arg root "$root" '
    .goalContract as $core
    | ($core.goalId | split(":")[1]) as $session
    | ($core.revision) as $revision
    | .goalContract = ($core + {
        schemaVersion: "goal-contract/v1",
        intent: "Exercise trusted convergence attempt selection",
        successSignal: "The focused G082 fixture reaches its expected verdict",
        hardConstraints: ["Complete Goal Contract authority is required"],
        nonGoals: ["Session mutation"],
        targetReferences: [{kind: "repository", value: "bubbles"}],
        workBoundary: {
          repositoryRoots: ["bubbles"],
          specTargets: [
            "specs/900-convergence-fixture",
            "specs/product-a/900-shared-name",
            "specs/product-b/900-shared-name"
          ],
          allowedPaths: ["bubbles/scripts/**", "tests/regression/**"],
          crossRepoPolicy: "forbidden"
        },
        createdAt: "2026-08-30T00:00:00Z",
        provenance: {
          runner: "bubbles.goal",
          sessionId: $session,
          repositoryAlias: "bubbles"
        },
        approval: (if $revision == 1 then {
          state: "auto-frozen", approvedAt: null, approvalNote: null
        } else {
          state: "operator-approved",
          approvedAt: "2026-08-30T00:00:00Z",
          approvalNote: "operator approved the focused regression revision"
        } end),
        supersedes: (if $revision == 1 then null
          else "gc:" + $session + ":" + (($revision - 1) | tostring) end)
      })
    | .repositoryBindingMirror = {
        repositoryRoot: $root,
        repositoryAlias: "bubbles",
        repositoryResolution: {
          sessionId: $session,
          decisionId: ("rb:" + $session + ":1"),
          controlRevision: 1,
          controlPathDigest: "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          authority: "concrete-target",
          transition: "established",
          scopeKind: "command",
          scopeId: null,
          targetKind: "absolute-target",
          pathVisibility: "local",
          actionable: true
        },
        mirroredControlRevision: 1,
        mirroredAt: "2026-08-30T00:00:00Z"
      }
  ' "$session_file" > "$temporary_file"
  mv "$temporary_file" "$session_file"
}

# --- Helper: run guard, capture exit + stdout + stderr -------------------

run_guard() {
  local root="$1"
  local spec_dir="$2"
  shift 2
  local stdout_file="$WORKSPACE/stdout.last"
  local stderr_file="$WORKSPACE/stderr.last"

  set +e
  BUBBLES_REPO_ROOT="$root" bash "$GUARD_SCRIPT" "$spec_dir" "$@" \
    > "$stdout_file" \
    2> "$stderr_file"
  local rc=$?
  set -e

  printf '%s\n' "$rc" > "$WORKSPACE/exit.last"
  printf '%s' "$stdout_file"
}

last_exit()   { cat "$WORKSPACE/exit.last"; }
last_stdout() { cat "$WORKSPACE/stdout.last"; }
last_stderr() { cat "$WORKSPACE/stderr.last"; }

assert_exit() {
  local expected="$1"
  local label="$2"
  local actual
  actual="$(last_exit)"
  if [[ "$actual" != "$expected" ]]; then
    ko "$label: expected exit $expected, got $actual"
    echo "  --- stdout ---" >&2
    last_stdout >&2
    echo "  --- stderr ---" >&2
    last_stderr >&2
    return 1
  fi
  ok "$label: exit $expected"
}

assert_stdout_contains() {
  local needle="$1"
  local label="$2"
  if ! grep -Fq -- "$needle" "$WORKSPACE/stdout.last"; then
    ko "$label: stdout did not contain '$needle'"
    echo "  --- stdout ---" >&2
    last_stdout >&2
    return 1
  fi
  ok "$label: stdout contains '$needle'"
}

assert_stderr_contains() {
  local needle="$1"
  local label="$2"
  if ! grep -Fq -- "$needle" "$WORKSPACE/stderr.last"; then
    ko "$label: stderr did not contain '$needle'"
    echo "  --- stderr ---" >&2
    last_stderr >&2
    return 1
  fi
  ok "$label: stderr contains '$needle'"
}

# =============================================================================
# Scenario S0: empty convergenceLoops[] -> exit 0 (sanity check)
# =============================================================================

note "Scenario S0: empty convergenceLoops[] should pass with exit 0"

S0_ROOT="$WORKSPACE/s0"
stage_repo_root "$S0_ROOT" 10
write_session_json "$S0_ROOT" '{"convergenceLoops": []}'

run_guard "$S0_ROOT" "specs/900-convergence-fixture" >/dev/null

assert_exit 0 "S0 exit code"
assert_stdout_contains "PASS Gate G082" "S0 PASS marker on stdout"
assert_stdout_contains "observed=0" "S0 reports zero observed iterations"

# =============================================================================
# Scenario S1: iterationCount = 11 -> exit 1, stderr names G082 + cap
# =============================================================================

note "Scenario S1: iterationCount=11 above cap=10 should exit 1"

S1_ROOT="$WORKSPACE/s1"
stage_repo_root "$S1_ROOT" 10
write_session_json "$S1_ROOT" '{
  "convergenceLoops": [
    {
      "specDir": "specs/900-convergence-fixture",
      "agent": "bubbles.workflow",
      "iterationCount": 11,
      "lastIterationAt": "2026-06-01T10:00:00Z",
      "cappedAt": null
    }
  ]
}'

run_guard "$S1_ROOT" "specs/900-convergence-fixture" >/dev/null

assert_exit 1 "S1 exit code (cap exceeded)"
assert_stderr_contains "G082" "S1 stderr names Gate G082"
assert_stderr_contains "convergence_cap_enforcement_gate" "S1 stderr names gate full name"
assert_stderr_contains "maxConvergenceIterations" "S1 stderr names maxConvergenceIterations"
assert_stderr_contains "bubbles.workflow" "S1 stderr names offending agent"
assert_stderr_contains "blocked" "S1 stderr documents 'blocked' remediation"

# =============================================================================
# Scenario S2: iterationCount = 10 -> exit 0, stdout contains PASS
# =============================================================================

note "Scenario S2: iterationCount=10 at cap=10 should exit 0"

S2_ROOT="$WORKSPACE/s2"
stage_repo_root "$S2_ROOT" 10
write_session_json "$S2_ROOT" '{
  "convergenceLoops": [
    {
      "specDir": "specs/900-convergence-fixture",
      "agent": "bubbles.workflow",
      "iterationCount": 10,
      "lastIterationAt": "2026-06-01T10:00:00Z",
      "cappedAt": null
    }
  ]
}'

run_guard "$S2_ROOT" "specs/900-convergence-fixture" >/dev/null

assert_exit 0 "S2 exit code (cap exactly hit)"
assert_stdout_contains "PASS Gate G082" "S2 PASS marker on stdout"
assert_stdout_contains "observed=10" "S2 reports observed=10"

# =============================================================================
# Scenario S3: malformed session.json -> exit 2 + diagnostic
# =============================================================================

note "Scenario S3: malformed session.json should exit 2"

S3_ROOT="$WORKSPACE/s3"
stage_repo_root "$S3_ROOT" 10
# Intentionally malformed JSON.
write_session_json "$S3_ROOT" '{"convergenceLoops": ['

run_guard "$S3_ROOT" "specs/900-convergence-fixture" >/dev/null

assert_exit 2 "S3 exit code (malformed JSON)"
assert_stderr_contains "convergence-cap-guard" "S3 stderr has diagnostic prefix"
assert_stderr_contains "not valid JSON" "S3 stderr names malformed-JSON condition"

# =============================================================================
# Bonus scenario S4: spec filter — entry for a DIFFERENT spec MUST NOT
# fail the current spec.
# =============================================================================

note "Scenario S4: convergenceLoops[] entry for a different spec should NOT trip the guard"

S4_ROOT="$WORKSPACE/s4"
stage_repo_root "$S4_ROOT" 10
write_session_json "$S4_ROOT" '{
  "convergenceLoops": [
    {
      "specDir": "specs/999-other-spec",
      "agent": "bubbles.workflow",
      "iterationCount": 99,
      "lastIterationAt": "2026-06-01T10:00:00Z",
      "cappedAt": null
    }
  ]
}'

run_guard "$S4_ROOT" "specs/900-convergence-fixture" >/dev/null

assert_exit 0 "S4 exit code (other-spec entry isolated)"
assert_stdout_contains "observed=0" "S4 ignores entries for non-matching specDir"

# =============================================================================
# Scenario S5: BUG-037 historical attempt cannot poison current revision
# =============================================================================

note "Scenario S5: historical revision=1 at 16 must not poison current revision=2 at 1"

S5_ROOT="$WORKSPACE/s5"
stage_repo_root "$S5_ROOT" 10
write_session_json "$S5_ROOT" '{
  "goalContract": {
    "goalId": "gc:bug037-s5:2",
    "revision": 2,
    "sourceRequestDigest": "sha256:2222222222222222222222222222222222222222222222222222222222222222"
  },
  "convergenceLoops": [
    {
      "specDir": "specs/900-convergence-fixture",
      "goalRef": {
        "goalId": "gc:bug037-s5:1",
        "revision": 1,
        "sourceRequestDigest": "sha256:1111111111111111111111111111111111111111111111111111111111111111"
      },
      "iterationCount": 16,
      "startedAt": "2026-08-28T03:00:00Z",
      "lastUpdated": "2026-08-28T03:24:39Z",
      "agents": ["bubbles.goal"]
    },
    {
      "specDir": "specs/900-convergence-fixture",
      "goalRef": {
        "goalId": "gc:bug037-s5:2",
        "revision": 2,
        "sourceRequestDigest": "sha256:2222222222222222222222222222222222222222222222222222222222222222"
      },
      "iterationCount": 1,
      "startedAt": "2026-08-29T10:00:00Z",
      "lastUpdated": "2026-08-29T10:00:00Z",
      "agents": ["bubbles.workflow"]
    }
  ]
}'
complete_current_goal_authority "$S5_ROOT"

run_guard "$S5_ROOT" "specs/900-convergence-fixture" >/dev/null

assert_exit 0 "S5 exit code (current authorized attempt is under cap)"
assert_stdout_contains "observed=1" "S5 evaluates only the current revision"
assert_stdout_contains "goalId=gc:bug037-s5:2" "S5 names the current attempt identity"
assert_stdout_contains "historicalAttempts=1" "S5 reports the preserved historical attempt"
assert_stdout_contains "historicalMax=16" "S5 retains the historical maximum as context"

# =============================================================================
# Scenario S6: agent switching cannot split one authorized attempt
# =============================================================================

note "Scenario S6: current revision at 11 across two agents must remain one capped attempt"

S6_ROOT="$WORKSPACE/s6"
stage_repo_root "$S6_ROOT" 10
write_session_json "$S6_ROOT" '{
  "goalContract": {
    "goalId": "gc:bug037-s6:1",
    "revision": 1,
    "sourceRequestDigest": "sha256:6666666666666666666666666666666666666666666666666666666666666666"
  },
  "convergenceLoops": [
    {
      "specDir": "specs/900-convergence-fixture",
      "goalRef": {
        "goalId": "gc:bug037-s6:1",
        "revision": 1,
        "sourceRequestDigest": "sha256:6666666666666666666666666666666666666666666666666666666666666666"
      },
      "iterationCount": 10,
      "lastIterationAt": "2026-08-29T10:00:00Z",
      "agent": "bubbles.workflow"
    },
    {
      "specDir": "./specs/900-convergence-fixture/",
      "goalRef": {
        "goalId": "gc:bug037-s6:1",
        "revision": 1,
        "sourceRequestDigest": "sha256:6666666666666666666666666666666666666666666666666666666666666666"
      },
      "iterationCount": 10,
      "lastUpdated": "2026-08-29T11:00:00Z",
      "agents": ["bubbles.goal"]
    }
  ]
}'
complete_current_goal_authority "$S6_ROOT"

run_guard "$S6_ROOT" "specs/900-convergence-fixture" >/dev/null

assert_exit 0 "S6 authorized-ten-eleven-boundary passes at ten"
assert_stdout_contains "observed=10" "S6 authorized multi-agent maximum is ten"
assert_stdout_contains "agents=bubbles.goal,bubbles.workflow" "S6 ten-count attempt retains both agents as attribution"

S6_ELEVEN_FILE="$S6_ROOT/.specify/memory/bubbles.session.eleven.json"
jq '(.convergenceLoops[1].iterationCount) = 11' \
  "$S6_ROOT/.specify/memory/bubbles.session.json" > "$S6_ELEVEN_FILE"
mv "$S6_ELEVEN_FILE" "$S6_ROOT/.specify/memory/bubbles.session.json"

run_guard "$S6_ROOT" "specs/900-convergence-fixture" >/dev/null

assert_exit 1 "S6 authorized-ten-eleven-boundary fails at eleven"
assert_stderr_contains "observed iterationCount:  11" "S6 reports the maximum across agents"
assert_stderr_contains "bubbles.goal,bubbles.workflow" "S6 reports both contributing agents"
assert_stderr_contains "lastUpdated:              2026-08-29T11:00:00Z" "S6 reconciles legacy and canonical timestamps"

# =============================================================================
# Scenario S7: goal identity substitution fails closed
# =============================================================================

note "Scenario S7: copied goalId/revision with another digest must exit 2"

S7_ROOT="$WORKSPACE/s7"
stage_repo_root "$S7_ROOT" 10
write_session_json "$S7_ROOT" '{
  "goalContract": {
    "goalId": "gc:bug037-s7:2",
    "revision": 2,
    "sourceRequestDigest": "sha256:7777777777777777777777777777777777777777777777777777777777777777"
  },
  "convergenceLoops": [
    {
      "specDir": "specs/900-convergence-fixture",
      "goalRef": {
        "goalId": "gc:bug037-s7:2",
        "revision": 2,
        "sourceRequestDigest": "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
      },
      "iterationCount": 1,
      "lastUpdated": "2026-08-30T00:00:00Z",
      "agents": ["bubbles.workflow"]
    }
  ]
}'
complete_current_goal_authority "$S7_ROOT"

run_guard "$S7_ROOT" "specs/900-convergence-fixture" >/dev/null

assert_exit 2 "S7 exit code (digest substitution rejected)"
assert_stderr_contains "different sourceRequestDigest" "S7 names the substituted digest"
assert_stderr_contains "inconsistent convergence attempt state" "S7 fails as an integrity error"

# =============================================================================
# Scenario S8: legacy state stays blocking until trusted authorization exists
# =============================================================================

note "Scenario S8: legacy count 16 blocks without a goal, then becomes preserved history beside a trusted attempt"

S8_ROOT="$WORKSPACE/s8"
stage_repo_root "$S8_ROOT" 10
write_session_json "$S8_ROOT" '{
  "convergenceLoops": [
    {
      "specDir": "specs/900-convergence-fixture",
      "agent": "bubbles.goal",
      "iterationCount": 16,
      "lastUpdated": "2026-08-28T03:24:39Z",
      "goalRef": null
    }
  ]
}'

run_guard "$S8_ROOT" "specs/900-convergence-fixture" >/dev/null
assert_exit 1 "S8 legacy exit code (identity-free 16 stays blocked)"
assert_stderr_contains "active attempt:           legacy" "S8 identifies the fail-closed legacy attempt"

write_session_json "$S8_ROOT" '{
  "goalContract": {
    "goalId": "gc:bug037-s8:1",
    "revision": 1,
    "sourceRequestDigest": "sha256:8888888888888888888888888888888888888888888888888888888888888888"
  },
  "convergenceLoops": [
    {
      "specDir": "specs/900-convergence-fixture",
      "agent": "bubbles.goal",
      "iterationCount": 16,
      "lastUpdated": "2026-08-28T03:24:39Z",
      "goalRef": null
    },
    {
      "specDir": "specs/900-convergence-fixture",
      "goalRef": {
        "goalId": "gc:bug037-s8:1",
        "revision": 1,
        "sourceRequestDigest": "sha256:8888888888888888888888888888888888888888888888888888888888888888"
      },
      "iterationCount": 1,
      "lastUpdated": "2026-08-29T12:00:00Z",
      "agents": ["bubbles.goal"]
    }
  ]
}'
complete_current_goal_authority "$S8_ROOT"

run_guard "$S8_ROOT" "specs/900-convergence-fixture" >/dev/null
assert_exit 0 "S8 trusted attempt exit code (new authorization starts at one)"
assert_stdout_contains "observed=1" "S8 evaluates the trusted current attempt"
assert_stdout_contains "historicalAttempts=1" "S8 preserves legacy history"
assert_stdout_contains "historicalMax=16" "S8 retains the legacy maximum"

# =============================================================================
# Scenario S9: canonical spec identity does not collapse equal basenames
# =============================================================================

note "Scenario S9: nested specs sharing one basename must remain isolated"

S9_ROOT="$WORKSPACE/s9"
stage_repo_root "$S9_ROOT" 10
write_session_json "$S9_ROOT" '{
  "goalContract": {
    "goalId": "gc:bug037-s9:1",
    "revision": 1,
    "sourceRequestDigest": "sha256:9999999999999999999999999999999999999999999999999999999999999999"
  },
  "convergenceLoops": [
    {
      "specDir": "specs/product-a/900-shared-name",
      "goalRef": {
        "goalId": "gc:bug037-s9:1",
        "revision": 1,
        "sourceRequestDigest": "sha256:9999999999999999999999999999999999999999999999999999999999999999"
      },
      "iterationCount": 1,
      "lastUpdated": "2026-08-30T00:00:00Z",
      "agents": ["bubbles.workflow"]
    },
    {
      "specDir": "specs/product-b/900-shared-name",
      "goalRef": {
        "goalId": "gc:bug037-s9:1",
        "revision": 1,
        "sourceRequestDigest": "sha256:9999999999999999999999999999999999999999999999999999999999999999"
      },
      "iterationCount": 99,
      "lastUpdated": "2026-08-30T00:00:00Z",
      "agents": ["bubbles.workflow"]
    }
  ]
}'
complete_current_goal_authority "$S9_ROOT"

run_guard "$S9_ROOT" "$S9_ROOT/specs/product-a/900-shared-name" >/dev/null

assert_exit 0 "S9 exit code (equal basename remains isolated)"
assert_stdout_contains "specDir=specs/product-a/900-shared-name" "S9 canonicalizes an in-repository absolute target"
assert_stdout_contains "observed=1" "S9 ignores the other nested spec"

# =============================================================================
# Scenario S10: partial identity fails closed
# =============================================================================

note "Scenario S10: partial goalRef must exit 2 rather than become history"

S10_ROOT="$WORKSPACE/s10"
stage_repo_root "$S10_ROOT" 10
write_session_json "$S10_ROOT" '{
  "convergenceLoops": [
    {
      "specDir": "specs/900-convergence-fixture",
      "goalRef": { "goalId": "gc:bug037-s10:1", "revision": 1 },
      "iterationCount": 1
    }
  ]
}'

run_guard "$S10_ROOT" "specs/900-convergence-fixture" >/dev/null

assert_exit 2 "S10 exit code (partial goalRef rejected)"
assert_stderr_contains "partial or malformed goalRef" "S10 names the malformed identity"

# =============================================================================
# Scenario S11: no caller-selected attempt or bypass option exists
# =============================================================================

note "Scenario S11: caller-selected --attempt-id must be rejected"

run_guard "$S0_ROOT" "specs/900-convergence-fixture" --attempt-id forged >/dev/null

assert_exit 2 "S11 exit code (attempt selector rejected)"
assert_stderr_contains "unknown flag: --attempt-id" "S11 refuses a caller-selected attempt"

# =============================================================================
# Scope 1 authorization adversaries
# =============================================================================

note "Scenario S12: a core-only current goal cannot authorize an attempt"

S12_ROOT="$WORKSPACE/s12"
stage_repo_root "$S12_ROOT" 10
write_session_json "$S12_ROOT" '{
  "goalContract": {
    "goalId": "gc:bug037-s12:1",
    "revision": 1,
    "sourceRequestDigest": "sha256:1212121212121212121212121212121212121212121212121212121212121212"
  },
  "convergenceLoops": []
}'
run_guard "$S12_ROOT" "specs/900-convergence-fixture" >/dev/null
assert_exit 2 "S12 exit code (core-only Goal Contract rejected)"
assert_stderr_contains "SESSION_GOAL_INVALID" "S12 names complete-contract validation failure"

note "Scenario S13: pending expansion is complete state but cannot authorize convergence"

S13_ROOT="$WORKSPACE/s13"
stage_repo_root "$S13_ROOT" 10
write_session_json "$S13_ROOT" '{
  "goalContract": {
    "goalId": "gc:bug037-s13:2",
    "revision": 2,
    "sourceRequestDigest": "sha256:1313131313131313131313131313131313131313131313131313131313131313"
  },
  "convergenceLoops": []
}'
complete_current_goal_authority "$S13_ROOT"
jq '.goalContract.approval = {
      state: "pending-expansion",
      approvedAt: null,
      approvalNote: "awaiting operator approval"
    }' "$S13_ROOT/.specify/memory/bubbles.session.json" \
  > "$S13_ROOT/.specify/memory/bubbles.session.pending.json"
mv "$S13_ROOT/.specify/memory/bubbles.session.pending.json" \
  "$S13_ROOT/.specify/memory/bubbles.session.json"
run_guard "$S13_ROOT" "specs/900-convergence-fixture" >/dev/null
assert_exit 2 "S13 exit code (pending Goal Contract unauthorized)"
assert_stderr_contains "SESSION_GOAL_UNAUTHORIZED" "S13 names pending authorization refusal"

note "Scenario S14: identity-bearing history without a current goal is never zero usage"

S14_ROOT="$WORKSPACE/s14"
stage_repo_root "$S14_ROOT" 10
write_session_json "$S14_ROOT" '{
  "convergenceLoops": [{
    "specDir": "specs/900-convergence-fixture",
    "goalRef": {
      "goalId": "gc:bug037-s14:1",
      "revision": 1,
      "sourceRequestDigest": "sha256:1414141414141414141414141414141414141414141414141414141414141414"
    },
    "iterationCount": 1,
    "lastUpdated": "2026-08-30T00:00:00Z",
    "agents": ["bubbles.workflow"]
  }]
}'
run_guard "$S14_ROOT" "specs/900-convergence-fixture" >/dev/null
assert_exit 2 "S14 exit code (identity history requires current authorization)"
assert_stderr_contains "SESSION_GOAL_MISSING" "S14 names missing current authorization"

note "Scenario S15: a contained symlink and its target share one physical budget"

S15_ROOT="$WORKSPACE/s15"
stage_repo_root "$S15_ROOT" 10
ln -s "900-convergence-fixture" "$S15_ROOT/specs/900-convergence-alias"
write_session_json "$S15_ROOT" '{
  "goalContract": {
    "goalId": "gc:bug037-s15:1",
    "revision": 1,
    "sourceRequestDigest": "sha256:1515151515151515151515151515151515151515151515151515151515151515"
  },
  "convergenceLoops": [
    {
      "specDir": "specs/900-convergence-fixture",
      "goalRef": {
        "goalId": "gc:bug037-s15:1",
        "revision": 1,
        "sourceRequestDigest": "sha256:1515151515151515151515151515151515151515151515151515151515151515"
      },
      "iterationCount": 10,
      "lastUpdated": "2026-08-30T00:00:00Z",
      "agents": ["bubbles.workflow"]
    },
    {
      "specDir": "specs/900-convergence-alias",
      "goalRef": {
        "goalId": "gc:bug037-s15:1",
        "revision": 1,
        "sourceRequestDigest": "sha256:1515151515151515151515151515151515151515151515151515151515151515"
      },
      "iterationCount": 11,
      "lastUpdated": "2026-08-30T01:00:00Z",
      "agents": ["bubbles.goal"]
    }
  ]
}'
complete_current_goal_authority "$S15_ROOT"
run_guard "$S15_ROOT" "specs/900-convergence-alias" >/dev/null
assert_exit 1 "S15 physical aliases share one current-attempt maximum"
assert_stderr_contains "specs/900-convergence-fixture" "S15 reports the physical target identity"
assert_stderr_contains "observed iterationCount:  11" "S15 aliases cannot split the eleven-count violation"
assert_stderr_contains "bubbles.goal,bubbles.workflow" "S15 alias records union agent attribution"

note "Scenario S16: a symlink escaping the repository is refused"

S16_ROOT="$WORKSPACE/s16"
stage_repo_root "$S16_ROOT" 10
mkdir -p "$WORKSPACE/outside-spec"
ln -s "$WORKSPACE/outside-spec" "$S16_ROOT/specs/900-escape"
write_session_json "$S16_ROOT" '{"convergenceLoops": []}'
S16_SESSION="$S16_ROOT/.specify/memory/bubbles.session.json"
S16_BASELINE="$WORKSPACE/s16-session-baseline.json"
cp "$S16_SESSION" "$S16_BASELINE"
run_guard "$S16_ROOT" "specs/900-escape" >/dev/null
assert_exit 2 "S16 exit code (escaping alias rejected)"
assert_stderr_contains "SESSION_SPEC_ESCAPES_ROOT" "S16 names physical containment refusal"
if cmp -s "$S16_BASELINE" "$S16_SESSION"; then
  ok "S16 escaping alias guard refusal leaves the active session byte-identical"
else
  ko "S16 escaping alias guard refusal mutated the active session"
fi

# =============================================================================
# BUG-037 pre-fix baseline replay: bounded mutation proof
# =============================================================================

note "BUG-037 baseline replay: the recorded pre-fix guard must exhibit the poisoned-attempt defects"

SOURCE_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BUG037_BASELINE_REF="6d3e6faf84115205f87e35b24a72c50b13f999d0"
BUG037_BASELINE_GUARD="$WORKSPACE/pre-fix/convergence-cap-guard.sh"
mkdir -p "$(dirname "$BUG037_BASELINE_GUARD")"

if ! command -v git >/dev/null 2>&1 ||
  ! git -C "$SOURCE_ROOT" cat-file -e "$BUG037_BASELINE_REF:bubbles/scripts/convergence-cap-guard.sh" 2>/dev/null ||
  ! git -C "$SOURCE_ROOT" show "$BUG037_BASELINE_REF:bubbles/scripts/convergence-cap-guard.sh" > "$BUG037_BASELINE_GUARD"; then
  ko "BUG-037 baseline replay: recorded pre-fix convergence guard is unavailable"
else
  chmod 700 "$BUG037_BASELINE_GUARD"

  set +e
  BUBBLES_REPO_ROOT="$S5_ROOT" bash "$BUG037_BASELINE_GUARD" \
    "specs/900-convergence-fixture" > "$WORKSPACE/stdout.last" 2> "$WORKSPACE/stderr.last"
  baseline_poison_exit=$?
  set -e
  printf '%s\n' "$baseline_poison_exit" > "$WORKSPACE/exit.last"
  assert_exit 1 "BUG-037 RED historical-poison baseline"
  assert_stderr_contains "observed iterationCount:  16" "BUG-037 RED baseline selects the historical maximum"

  set +e
  BUBBLES_REPO_ROOT="$S7_ROOT" bash "$BUG037_BASELINE_GUARD" \
    "specs/900-convergence-fixture" > "$WORKSPACE/stdout.last" 2> "$WORKSPACE/stderr.last"
  baseline_digest_exit=$?
  set -e
  printf '%s\n' "$baseline_digest_exit" > "$WORKSPACE/exit.last"
  assert_exit 0 "BUG-037 RED digest-substitution baseline"
  assert_stdout_contains "PASS Gate G082" "BUG-037 RED baseline admits the substituted identity"

  set +e
  BUBBLES_REPO_ROOT="$S9_ROOT" bash "$BUG037_BASELINE_GUARD" \
    "$S9_ROOT/specs/product-a/900-shared-name" > "$WORKSPACE/stdout.last" 2> "$WORKSPACE/stderr.last"
  baseline_basename_exit=$?
  set -e
  printf '%s\n' "$baseline_basename_exit" > "$WORKSPACE/exit.last"
  assert_exit 1 "BUG-037 RED equal-basename baseline"
  assert_stderr_contains "observed iterationCount:  99" "BUG-037 RED baseline merges unrelated nested specs"
fi

# =============================================================================
# Final verdict
# =============================================================================

echo ""
echo "============================================================"
echo "  CONVERGENCE-CAP-GUARD SELFTEST VERDICT"
echo "============================================================"
printf 'Passed assertions: %d\n' "$PASS_COUNT"
printf 'Failed assertions: %d\n' "$FAIL_COUNT"

if [[ "$FAIL_COUNT" -gt 0 ]]; then
  echo ""
  echo "FAILED scenarios:"
  for s in "${FAILED_SCENARIOS[@]}"; do
    echo "  - $s"
  done
  exit 1
fi

echo ""
echo "🟢 convergence-cap-guard-selftest: ALL SCENARIOS PASS"
exit 0
