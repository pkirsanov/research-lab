#!/usr/bin/env bash
set -euo pipefail

# Hermetic top-level regression coverage for the G093 certification window.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GUARD="$SCRIPT_DIR/state-transition-guard.sh"

if [[ ! -x "$GUARD" ]]; then
  echo "state-transition-delivery-range-selftest: guard not executable at $GUARD" >&2
  exit 2
fi

# shellcheck source=guard-lib.sh
source "$SCRIPT_DIR/guard-lib.sh"

WORKSPACE_BASE="${TMPDIR:-${HOME:-.}/.cache}"
mkdir -p "$WORKSPACE_BASE"
WORKSPACE="$(mktemp -d "$WORKSPACE_BASE/bubbles-state-delivery-range-selftest.XXXXXXXX")"
cleanup() {
  rm -rf "$WORKSPACE" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

PASS_COUNT=0
FAIL_COUNT=0
FAILED_ASSERTIONS=()
LAST_EXIT=0
LAST_LOG=""
FIXTURE_REPO=""
FIXTURE_SPEC=""
FIXTURE_BASE=""

pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  printf '  PASS: %s\n' "$*"
}

fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  FAILED_ASSERTIONS+=("$*")
  printf '  FAIL: %s\n' "$*"
}

write_fixture() {
  local fixture_name="$1"
  local repo="$WORKSPACE/$fixture_name"
  local spec="$repo/specs/100-certification-window"

  mkdir -p "$repo/bubbles" "$spec"
  cp "$SCRIPT_DIR/../workflows.yaml" "$repo/bubbles/workflows.yaml"
  cp -R "$SCRIPT_DIR/../workflows" "$repo/bubbles/workflows"

  cat > "$spec/spec.md" <<'EOF'
# Certification Window Fixture

## Purpose

Exercise the real top-level transition guard around a post-delivery state-only certification write.
EOF

  cat > "$spec/design.md" <<'EOF'
# Certification Window Fixture Design

## Approach

Keep the delivery commit distinct from the later certification timestamp write.
EOF

  cat > "$spec/scopes.md" <<'EOF'
# Scope 01: Certification Window

**Status:** Done

### Definition of Done

- [x] The certification-window fixture reaches the transition guard.
EOF

  cat > "$spec/report.md" <<'EOF'
# Report

## Summary

The focused selftest owns execution evidence outside this temporary fixture.

## Completion Statement

The fixture intentionally leaves unrelated completion checks unsatisfied so assertions can isolate G093.

## Test Evidence

No fixture-local evidence is asserted.
EOF

  cat > "$spec/uservalidation.md" <<'EOF'
# User Validation

## Checklist

- [x] The certification-window behavior is accepted for this fixture.

## Human Acceptance Record

- acceptedBy: certification-window-selftest-human
- acceptedAt: 2026-09-01T00:00:00Z
- method: human-interactive
EOF

  cat > "$spec/state.json" <<'EOF'
{
  "version": 3,
  "featureDir": "specs/100-certification-window",
  "featureName": "Certification Window Fixture",
  "status": "done",
  "workflowMode": "bugfix-fastlane",
  "certifiedAt": "2026-09-01T00:00:00Z",
  "execution": {
    "completedPhaseClaims": []
  },
  "certification": {
    "status": "done",
    "certifiedCompletedPhases": [],
    "completedScopes": [],
    "scopeProgress": [],
    "lockdownState": {
      "mode": "off",
      "lockedScenarioIds": []
    }
  },
  "policySnapshot": {
    "grill": { "mode": "off", "source": "repo-default" },
    "tdd": { "mode": "off", "source": "repo-default" },
    "autoCommit": { "mode": "off", "source": "repo-default" },
    "lockdown": { "mode": "off", "source": "repo-default" },
    "regression": { "mode": "protect-existing-scenarios", "source": "repo-default" },
    "validation": { "mode": "required", "source": "workflow-forced" },
    "workflowMode": "bugfix-fastlane"
  },
  "transitionRequests": [],
  "reworkQueue": [],
  "executionHistory": [],
  "lastUpdatedAt": "2026-09-01T00:00:00Z"
}
EOF

  git -C "$repo" init -q
  git -C "$repo" config user.email "certification-window-selftest@example.invalid"
  git -C "$repo" config user.name "Certification Window Selftest"
  git -C "$repo" add .
  git -C "$repo" commit -q -m "baseline"

  FIXTURE_REPO="$repo"
  FIXTURE_SPEC="$spec"
  FIXTURE_BASE="$(git -C "$repo" rev-parse HEAD)"
}

commit_source_delivery() {
  local repo="$1"
  local spec="$2"

  mkdir -p "$repo/src"
  cat > "$repo/src/certification-window.ts" <<'EOF'
export const certificationWindowDelivered = true;
EOF
  bubbles_sed_inplace \
    's/"lastUpdatedAt": "2026-09-01T00:00:00Z"/"lastUpdatedAt": "2026-09-01T01:00:00Z"/' \
    "$spec/state.json"
  git -C "$repo" add .
  git -C "$repo" commit -q -m "deliver source and state"
}

commit_spec_only_delivery() {
  local repo="$1"
  local spec="$2"

  printf '\nPlanning-only delivery change.\n' >> "$spec/spec.md"
  bubbles_sed_inplace \
    's/"lastUpdatedAt": "2026-09-01T00:00:00Z"/"lastUpdatedAt": "2026-09-01T01:00:00Z"/' \
    "$spec/state.json"
  git -C "$repo" add .
  git -C "$repo" commit -q -m "deliver planning state only"
}

write_post_commit_certification() {
  local spec="$1"
  bubbles_sed_inplace \
    's/"certifiedAt": "2026-09-01T00:00:00Z"/"certifiedAt": "2026-09-02T00:00:00Z"/' \
    "$spec/state.json"
}

run_guard() {
  local label="$1"
  local repo="$2"
  local spec="$3"
  shift 3

  LAST_LOG="$WORKSPACE/$label.log"
  set +e
  BUBBLES_REPO_ROOT="$repo" BUBBLES_STATE_TRANSITION_GUARD_SELFTEST_FAST=0 \
    bash "$GUARD" "$spec" "$@" > "$LAST_LOG" 2>&1
  LAST_EXIT=$?
  set -e
}

assert_exit() {
  local expected="$1"
  local label="$2"
  if [[ "$LAST_EXIT" -eq "$expected" ]]; then
    pass "$label exit=$LAST_EXIT"
  else
    fail "$label expected exit=$expected actual=$LAST_EXIT"
    cat "$LAST_LOG"
  fi
}

assert_nonzero() {
  local label="$1"
  if [[ "$LAST_EXIT" -ne 0 ]]; then
    pass "$label exit=$LAST_EXIT"
  else
    fail "$label expected non-zero exit"
    cat "$LAST_LOG"
  fi
}

assert_log_contains() {
  local needle="$1"
  local label="$2"
  if grep -qF -- "$needle" "$LAST_LOG"; then
    pass "$label"
  else
    fail "$label missing '$needle'"
    cat "$LAST_LOG"
  fi
}

assert_log_not_contains() {
  local needle="$1"
  local label="$2"
  if grep -qF -- "$needle" "$LAST_LOG"; then
    fail "$label unexpectedly found '$needle'"
    cat "$LAST_LOG"
  else
    pass "$label"
  fi
}

echo "=== state-transition-delivery-range-selftest (Gate G093) ==="

echo ""
echo "--- S1: explicit source+state delivery window passes G093 ---"
write_fixture source-window
source_repo="$FIXTURE_REPO"
source_spec="$FIXTURE_SPEC"
source_base="$FIXTURE_BASE"
commit_source_delivery "$source_repo" "$source_spec"
source_head="$(git -C "$source_repo" rev-parse HEAD)"
write_post_commit_certification "$source_spec"
run_guard source-window "$source_repo" "$source_spec" \
  --delivery-base-ref "$source_base" \
  --delivery-head-ref "$source_head"
assert_log_contains \
  "Delivery implementation delta is present or mode ceiling exempts it (Gate G093)" \
  "S1 top-level guard passes G093 for the explicit source+state range"
assert_log_not_contains \
  "Delivery implementation delta guard failed" \
  "S1 G093 emits no blocked verdict"
assert_log_contains \
  "--- Check 28: Planning Workflow Chain Enforcement (Gate G091) ---" \
  "S1 executes the delegated gate before G093"
assert_log_contains \
  "--- Check 30: Post-Certification Spec Edit Detection (Gate G088) ---" \
  "S1 executes the delegated gate after G093"
assert_log_contains \
  "--- Check 43: Human Acceptance Terminal Gate (Gate G136) ---" \
  "S1 continues into later top-level gates"
assert_log_not_contains \
  "State-transition selftest fast path enabled" \
  "S1 does not skip delegated gates through the broad-selftest fast path"

echo ""
echo "--- S2: identical state-only worktree remains blocked without a range ---"
run_guard state-only "$source_repo" "$source_spec"
assert_nonzero "S2 no-range state-only transition remains blocked"
assert_log_contains \
  "Delivery implementation delta guard failed" \
  "S2 top-level guard blocks the state-only worktree at G093"
assert_log_not_contains \
  "Delivery implementation delta is present or mode ceiling exempts it (Gate G093)" \
  "S2 does not weaken the no-range G093 behavior"

echo ""
echo "--- S3: one-sided, duplicate, and empty assertions are usage errors ---"
run_guard base-only "$source_repo" "$source_spec" --delivery-base-ref "$source_base"
assert_exit 2 "S3 base-only assertion"
assert_log_contains "E009-USAGE" "S3 base-only emits E009-USAGE"

run_guard head-only "$source_repo" "$source_spec" --delivery-head-ref "$source_head"
assert_exit 2 "S3 head-only assertion"
assert_log_contains "E009-USAGE" "S3 head-only emits E009-USAGE"

run_guard duplicate-base "$source_repo" "$source_spec" \
  --delivery-base-ref "$source_base" \
  --delivery-base-ref="$source_base" \
  --delivery-head-ref "$source_head"
assert_exit 2 "S3 duplicate base assertion"
assert_log_contains "E009-USAGE" "S3 duplicate base emits E009-USAGE"

run_guard duplicate-head "$source_repo" "$source_spec" \
  --delivery-base-ref="$source_base" \
  --delivery-head-ref "$source_head" \
  --delivery-head-ref="$source_head"
assert_exit 2 "S3 duplicate head assertion"
assert_log_contains "E009-USAGE" "S3 duplicate head emits E009-USAGE"

run_guard empty-base "$source_repo" "$source_spec" \
  --delivery-base-ref= \
  --delivery-head-ref="$source_head"
assert_exit 2 "S3 empty base assertion"
assert_log_contains "E009-USAGE" "S3 empty base emits E009-USAGE"

run_guard empty-head "$source_repo" "$source_spec" \
  --delivery-base-ref="$source_base" \
  --delivery-head-ref ""
assert_exit 2 "S3 empty head assertion"
assert_log_contains "E009-USAGE" "S3 empty head emits E009-USAGE"

echo ""
echo "--- S4: paired spec-only range still fails G093 ---"
write_fixture spec-only-window
spec_repo="$FIXTURE_REPO"
spec_spec="$FIXTURE_SPEC"
spec_base="$FIXTURE_BASE"
commit_spec_only_delivery "$spec_repo" "$spec_spec"
spec_head="$(git -C "$spec_repo" rev-parse HEAD)"
write_post_commit_certification "$spec_spec"
run_guard spec-only-window "$spec_repo" "$spec_spec" \
  --delivery-base-ref="$spec_base" \
  --delivery-head-ref="$spec_head"
assert_nonzero "S4 paired spec-only range remains blocked"
assert_log_contains \
  "Delivery implementation delta guard failed" \
  "S4 paired spec-only range fails G093 through the top-level guard"

echo ""
echo "--- S5: bad refs remain fail-closed even when worktree source would pass ---"
cat > "$source_repo/src/uncommitted-source.ts" <<'EOF'
export const uncommittedSourceWouldPassNoRange = true;
EOF
run_guard bad-ref "$source_repo" "$source_spec" \
  --delivery-base-ref "$source_base" \
  --delivery-head-ref refs/heads/does-not-exist
assert_nonzero "S5 bad delivery ref is fail-closed"
assert_log_contains \
  "Delivery implementation delta guard failed" \
  "S5 bad ref reaches and fails G093"
assert_log_not_contains \
  "Delivery implementation delta is present or mode ceiling exempts it (Gate G093)" \
  "S5 bad ref cannot fall back to worktree classification"

echo ""
echo "=== Selftest verdict ==="
printf '  Total assertions: %d\n' "$((PASS_COUNT + FAIL_COUNT))"
printf '  Passed:           %d\n' "$PASS_COUNT"
printf '  Failed:           %d\n' "$FAIL_COUNT"

if [[ "$FAIL_COUNT" -gt 0 ]]; then
  echo "state-transition-delivery-range-selftest: FAILED" >&2
  for assertion in "${FAILED_ASSERTIONS[@]}"; do
    echo "  - $assertion" >&2
  done
  exit 1
fi

echo "state-transition-delivery-range-selftest: PASSED"
exit 0