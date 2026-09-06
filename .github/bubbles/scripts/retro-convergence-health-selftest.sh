#!/usr/bin/env bash
set -euo pipefail

# Hermetic selftest for SCOPE-7 retro convergence health (Gate G090).

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RETRO_HEALTH="$SCRIPT_DIR/retro-convergence-health.sh"

if [[ ! -f "$RETRO_HEALTH" ]]; then
  echo "retro-convergence-health-selftest: script not found at $RETRO_HEALTH" >&2
  exit 2
fi

WORKSPACE="$(mktemp -d -t bubbles-scope7-retro-health-selftest-XXXXXXXX)"
cleanup() {
  rm -rf "$WORKSPACE" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

PASS_COUNT=0
FAIL_COUNT=0
FAILED_SCENARIOS=()

ok() { PASS_COUNT=$((PASS_COUNT + 1)); printf '  PASS: %s\n' "$*"; }
ko() { FAIL_COUNT=$((FAIL_COUNT + 1)); FAILED_SCENARIOS+=("$*"); printf '  FAIL: %s\n' "$*"; }

stage_repo() {
  local sid="$1"
  local repo="$WORKSPACE/$sid"
  rm -rf "$repo"
  mkdir -p \
    "$repo/.specify/memory" \
    "$repo/specs/900-retro-fixture" \
    "$repo/specs/nested/900-retro-fixture"
  printf '%s' "$repo"
}

write_healthy_session() {
  local repo="$1"
  cat > "$repo/.specify/memory/bubbles.session.json" <<'EOF'
{
  "sessionId": "retro-health-healthy-session",
  "convergenceLoops": [
    {"specDir": "specs/900-retro-fixture", "agent": "bubbles.workflow", "iterationCount": 1},
    {"specDir": "specs/900-retro-fixture", "agent": "bubbles.workflow", "iterationCount": 2}
  ],
  "envelopesReceived": [
    {"specDir": "specs/900-retro-fixture", "rawSizeBytes": 1200, "compactedAt": "2026-05-24T10:00:00Z"},
    {"specDir": "specs/900-retro-fixture", "rawSizeBytes": 800}
  ],
  "turnSnapshots": [
    {"specDir": "specs/900-retro-fixture", "turnNumber": 1, "startedAt": "2026-05-24T09:00:00Z", "completedAt": "2026-05-24T09:05:00Z", "content": "implementation progress"},
    {"specDir": "specs/900-retro-fixture", "turnNumber": 2, "startedAt": "2026-05-24T09:06:00Z", "completedAt": "2026-05-24T09:10:00Z", "content": "validation progress"}
  ],
  "messages": [
    {"specDir": "specs/900-retro-fixture", "role": "assistant", "content": "continue implementation"}
  ]
}
EOF
}

write_state_snapshot_pair_session() {
  local repo="$1"
  cat > "$repo/.specify/memory/bubbles.session.json" <<'EOF'
{
  "sessionId": "retro-health-state-snapshot-pair-session",
  "turnSnapshots": [
    {"specDir": "specs/900-retro-fixture", "turnNumber": 1, "timestamp": "2026-05-24T17:31:49Z", "phase": "simplify", "scopeId": null, "mode": "start", "note": "turn start", "agent": "bubbles.simplify"},
    {"specDir": "specs/900-retro-fixture", "turnNumber": 2, "timestamp": "2026-05-24T17:49:23Z", "phase": "simplify", "scopeId": null, "mode": "end", "note": "turn end", "agent": "bubbles.simplify"}
  ]
}
EOF
}

write_state_snapshot_single_sided_session() {
  local repo="$1"
  cat > "$repo/.specify/memory/bubbles.session.json" <<'EOF'
{
  "sessionId": "retro-health-state-snapshot-single-sided-session",
  "turnSnapshots": [
    {"specDir": "specs/900-retro-fixture", "turnNumber": 1, "timestamp": "2026-05-24T17:31:49Z", "phase": "simplify", "scopeId": null, "mode": "start", "note": "turn start", "agent": "bubbles.simplify"}
  ]
}
EOF
}

write_snapshot_breach_session() {
  local repo="$1"
  cat > "$repo/.specify/memory/bubbles.session.json" <<'EOF'
{
  "sessionId": "retro-health-snapshot-breach-session",
  "turnSnapshots": [
    {"specDir": "specs/900-retro-fixture", "turnNumber": 1, "startedAt": "2026-05-24T09:00:00Z", "completedAt": "2026-05-24T09:05:00Z"},
    {"specDir": "specs/900-retro-fixture", "turnNumber": 2, "startedAt": "2026-05-24T09:06:00Z"}
  ]
}
EOF
}

write_p0_recap_handoff_session() {
  local repo="$1"
  cat > "$repo/.specify/memory/bubbles.session.json" <<'EOF'
{
  "sessionId": "retro-health-p0-recap-handoff-session",
  "turnSnapshots": [
    {"specDir": "specs/900-retro-fixture", "turnNumber": 1, "startedAt": "2026-05-24T09:00:00Z", "completedAt": "2026-05-24T09:05:00Z", "content": "recap requested"},
    {"specDir": "specs/900-retro-fixture", "turnNumber": 2, "startedAt": "2026-05-24T09:06:00Z", "completedAt": "2026-05-24T09:07:00Z", "content": "handoff requested"},
    {"specDir": "specs/900-retro-fixture", "turnNumber": 3, "startedAt": "2026-05-24T09:08:00Z", "completedAt": "2026-05-24T09:09:00Z", "content": "another handoff requested"}
  ]
}
EOF
}

write_ambient_cross_spec_session() {
  local repo="$1"
  cat > "$repo/.specify/memory/bubbles.session.json" <<'EOF'
{
  "sessionId": "retro-health-ambient-cross-spec-session",
  "turnSnapshots": [
    {"specDir": "specs/070-other-fixture", "turnNumber": 1, "startedAt": "2026-05-24T09:00:00Z", "completedAt": "2026-05-24T09:05:00Z", "content": "recap requested"},
    {"specDir": "specs/070-other-fixture", "turnNumber": 2, "startedAt": "2026-05-24T09:06:00Z", "completedAt": "2026-05-24T09:07:00Z", "content": "handoff requested"},
    {"specDir": "specs/070-other-fixture", "turnNumber": 3, "startedAt": "2026-05-24T09:08:00Z", "completedAt": "2026-05-24T09:09:00Z", "content": "another handoff requested"}
  ],
  "messages": [
    {"specDir": "specs/070-other-fixture", "role": "assistant", "content": "handoff requested for other spec"}
  ]
}
EOF
}

write_bug037_attempt_session() {
  local repo="$1"
  cat > "$repo/.specify/memory/bubbles.session.json" <<EOF
{
  "sessionId": "bug037-retro",
  "goalContract": {
    "schemaVersion": "goal-contract/v2",
    "goalId": "gc:bug037-retro:2",
    "revision": 2,
    "sourceRequestDigest": "sha256:2222222222222222222222222222222222222222222222222222222222222222",
    "intent": "Report current and historical BUG-037 convergence attempts",
    "successSignal": "Retrospective health preserves attempt history without duplicate-update inflation",
    "hardConstraints": ["Complete Goal Contract authority is required"],
    "nonGoals": ["Changing retrospective health thresholds"],
    "targetReferences": [
      {"kind": "spec", "value": "specs/900-retro-fixture"}
    ],
    "workBoundary": {
      "repositoryRoots": ["bubbles"],
      "specTargets": ["specs/900-retro-fixture"],
      "allowedPaths": ["bubbles/scripts/**"],
      "crossRepoPolicy": "forbidden"
    },
    "semanticBoundary": {
      "executionShape": "existing-capability-change",
      "allowedChangeClasses": ["existing-test"],
      "approvalRequiredChangeClasses": [],
      "deltaBudget": {"maxNewFiles": 0}
    },
    "createdAt": "2026-08-30T00:00:00Z",
    "provenance": {
      "runner": "bubbles.goal",
      "sessionId": "bug037-retro",
      "repositoryAlias": "bubbles"
    },
    "approval": {
      "state": "operator-approved",
      "approvedAt": "2026-08-30T00:00:00Z",
      "approvalNote": "operator approved the retrospective revision-two fixture"
    },
    "supersedes": "gc:bug037-retro:1"
  },
  "repositoryBindingMirror": {
    "repositoryRoot": "$repo",
    "repositoryAlias": "bubbles",
    "repositoryResolution": {
      "sessionId": "bug037-retro",
      "decisionId": "rb:bug037-retro:1",
      "controlRevision": 1,
      "controlPathDigest": "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      "authority": "concrete-target",
      "transition": "established",
      "scopeKind": "command",
      "scopeId": null,
      "targetKind": "absolute-target",
      "pathVisibility": "local",
      "actionable": true
    },
    "mirroredControlRevision": 1,
    "mirroredAt": "2026-08-30T00:00:00Z"
  },
  "convergenceLoops": [
    {
      "specDir": "specs/900-retro-fixture",
      "goalRef": {
        "goalId": "gc:bug037-retro:1",
        "revision": 1,
        "sourceRequestDigest": "sha256:1111111111111111111111111111111111111111111111111111111111111111"
      },
      "iterationCount": 16,
      "lastUpdated": "2026-08-28T03:24:39Z",
      "agents": ["bubbles.goal"]
    },
    {
      "specDir": "$repo/specs/900-retro-fixture",
      "goalRef": {
        "goalId": "gc:bug037-retro:2",
        "revision": 2,
        "sourceRequestDigest": "sha256:2222222222222222222222222222222222222222222222222222222222222222"
      },
      "iterationCount": 1,
      "lastIterationAt": "2026-08-29T10:00:00Z",
      "agent": "bubbles.workflow"
    },
    {
      "specDir": "./specs/900-retro-fixture/",
      "goalRef": {
        "goalId": "gc:bug037-retro:2",
        "revision": 2,
        "sourceRequestDigest": "sha256:2222222222222222222222222222222222222222222222222222222222222222"
      },
      "iterationCount": 2,
      "lastUpdated": "2026-08-29T11:00:00Z",
      "agents": ["bubbles.goal"]
    },
    {
      "specDir": "specs/nested/900-retro-fixture",
      "goalRef": {
        "goalId": "gc:bug037-retro-other:1",
        "revision": 1,
        "sourceRequestDigest": "sha256:9999999999999999999999999999999999999999999999999999999999999999"
      },
      "iterationCount": 99,
      "lastUpdated": "2026-08-29T12:00:00Z",
      "agents": ["bubbles.goal"]
    }
  ]
}
EOF
}

run_health() {
  local repo="$1"
  shift
  set +e
  bash "$RETRO_HEALTH" specs/900-retro-fixture --repo-root "$repo" "$@" > "$WORKSPACE/stdout.last" 2> "$WORKSPACE/stderr.last"
  local rc=$?
  set -e
  echo "$rc" > "$WORKSPACE/exit.last"
}

assert_exit() {
  local label="$1"
  local expected="$2"
  local actual
  actual="$(cat "$WORKSPACE/exit.last")"
  if [[ "$actual" -eq "$expected" ]]; then
    ok "$label exit=$actual"
  else
    ko "$label expected exit=$expected actual=$actual"
    cat "$WORKSPACE/stdout.last"
    cat "$WORKSPACE/stderr.last"
  fi
}

assert_stdout_contains() {
  local label="$1"
  local needle="$2"
  if grep -qF -- "$needle" "$WORKSPACE/stdout.last"; then
    ok "$label stdout contains '$needle'"
  else
    ko "$label stdout missing '$needle'"
    cat "$WORKSPACE/stdout.last"
  fi
}

assert_stdout_empty() {
  local label="$1"
  if [[ ! -s "$WORKSPACE/stdout.last" ]]; then
    ok "$label stdout is empty"
  else
    ko "$label stdout unexpectedly contains a clean result"
    cat "$WORKSPACE/stdout.last"
  fi
}

assert_stderr_contains() {
  local label="$1"
  local needle="$2"
  if grep -qF -- "$needle" "$WORKSPACE/stderr.last"; then
    ok "$label stderr contains '$needle'"
  else
    ko "$label stderr missing '$needle'"
    cat "$WORKSPACE/stderr.last"
  fi
}

assert_json() {
  local label="$1"
  if jq -e . "$WORKSPACE/stdout.last" >/dev/null 2>&1; then
    ok "$label stdout is valid JSON"
  else
    ko "$label stdout is not valid JSON"
    cat "$WORKSPACE/stdout.last"
  fi
}

assert_jq() {
  local label="$1"
  local expr="$2"
  if jq -e "$expr" "$WORKSPACE/stdout.last" >/dev/null 2>&1; then
    ok "$label jq '$expr'"
  else
    ko "$label jq failed '$expr'"
    cat "$WORKSPACE/stdout.last"
  fi
}

echo "=== retro-convergence-health-selftest (SCOPE-7 / G090) ==="

echo ""
echo "--- S1: legacy health metrics computed and JSON parses ---"
repo="$(stage_repo s1-metrics)"
write_healthy_session "$repo"
run_health "$repo" --schema legacy
assert_exit "S1 legacy metrics" 0
assert_json "S1 legacy metrics"
assert_jq "S1 legacy exact keys" 'keys == ["avgLoopIterations", "compactionFrequency", "maxConvergenceIterations", "preExistingDeferralCount", "snapshotCompleteness"]'
assert_jq "S1 effective legacy attempt count" '.avgLoopIterations == 2'

echo ""
echo "--- S1b: full schema includes convergenceHealth output contract ---"
repo="$(stage_repo s1b-full-schema)"
write_healthy_session "$repo"
run_health "$repo"
assert_exit "S1b full schema" 0
assert_json "S1b full schema"
assert_jq "S1b convergenceHealth schema" '.convergenceHealth == {"recapCount": 0, "handoffCount": 0, "summarizeHistoryCount": 0, "turnCount": 2, "slo": "pass"}'

echo ""
echo "--- S1d: BUG-037 reports current and historical attempts without duplicate-update inflation ---"
repo="$(stage_repo s1d-bug037-attempts)"
write_bug037_attempt_session "$repo"
run_health "$repo"
assert_exit "S1d BUG-037 attempt accounting" 0
assert_json "S1d BUG-037 attempt accounting"
assert_jq "S1d current revision" '.attemptAccounting.current.goalId == "gc:bug037-retro:2" and .attemptAccounting.current.revision == 2'
assert_jq "S1d current effective count" '.attemptAccounting.current.iterationCount == 2'
assert_jq "S1d current agents are attribution, not budgets" '.attemptAccounting.current.agents == ["bubbles.goal", "bubbles.workflow"]'
assert_jq "S1d canonical timestamp reconciliation" '.attemptAccounting.current.lastUpdated == "2026-08-29T11:00:00Z"'
assert_jq "S1d historical accounting" '.attemptAccounting.totalAttempts == 2 and .attemptAccounting.historicalAttempts == 1 and .attemptAccounting.historicalMaxIterations == 16'
assert_jq "S1d equal basename remains isolated" '.maxConvergenceIterations == 16 and .avgLoopIterations == 9'
assert_jq "S1d G090 thresholds remain unchanged" '.thresholds == {"recapHandoffFailedWhenGreaterThan": 2, "summarizeHistoryFailedWhenGreaterThan": 2, "snapshotCompletenessRequired": 1}'
assert_jq "S1d unrelated G090 metrics remain unchanged" '.compactionFrequency == 1 and .preExistingDeferralCount == 0 and .snapshotCompleteness == 1 and .convergenceHealth == {"recapCount": 0, "handoffCount": 0, "summarizeHistoryCount": 0, "turnCount": 0, "slo": "pass"}'

echo ""
echo "--- S1e: present non-object roots fail before skip or health output ---"
for root_value in null '[]' '"scalar"'; do
  repo="$(stage_repo "s1e-root-${root_value//[^A-Za-z0-9]/x}")"
  printf '%s\n' "$root_value" > "$repo/.specify/memory/bubbles.session.json"
  run_health "$repo"
  assert_exit "S1e non-object root $root_value" 2
  assert_stderr_contains "S1e non-object root $root_value" "SESSION_ROOT_NOT_OBJECT"
  assert_stdout_empty "S1e non-object root $root_value"
done

echo ""
echo "--- S1f: malformed matching convergence counts fail shared validation ---"
repo="$(stage_repo s1f-malformed-count)"
write_healthy_session "$repo"
jq '.executionRuntime = "manual" | .convergenceLoops[0].iterationCount = "bad"' \
  "$repo/.specify/memory/bubbles.session.json" > "$repo/malformed-count.json"
mv "$repo/malformed-count.json" "$repo/.specify/memory/bubbles.session.json"
run_health "$repo"
assert_exit "S1f malformed matching count" 2
assert_stderr_contains "S1f malformed matching count" "SESSION_ITERATION_INVALID"
assert_stdout_empty "S1f malformed matching count"

echo ""
echo "--- S1g: partial matching goal references fail shared validation ---"
repo="$(stage_repo s1g-partial-goal-ref)"
write_bug037_attempt_session "$repo"
jq '.executionRuntime = "manual" | del(.convergenceLoops[1].goalRef.sourceRequestDigest)' \
  "$repo/.specify/memory/bubbles.session.json" > "$repo/partial-goal-ref.json"
mv "$repo/partial-goal-ref.json" "$repo/.specify/memory/bubbles.session.json"
run_health "$repo"
assert_exit "S1g partial matching goalRef" 2
assert_stderr_contains "S1g partial matching goalRef" "SESSION_GOAL_REF_INVALID"
assert_stdout_empty "S1g partial matching goalRef"

echo ""
echo "--- S1h: unresolved stored spec paths fail instead of disappearing ---"
repo="$(stage_repo s1h-unresolved-spec)"
write_healthy_session "$repo"
jq '.executionRuntime = "manual" | .convergenceLoops[0].specDir = "specs/900-missing"' \
  "$repo/.specify/memory/bubbles.session.json" > "$repo/unresolved-spec.json"
mv "$repo/unresolved-spec.json" "$repo/.specify/memory/bubbles.session.json"
run_health "$repo"
assert_exit "S1h unresolved stored specDir" 2
assert_stderr_contains "S1h unresolved stored specDir" "SESSION_SPEC_NOT_FOUND"
assert_stdout_empty "S1h unresolved stored specDir"

echo ""
echo "--- S1i: malformed current Goal Contracts fail complete validation ---"
repo="$(stage_repo s1i-malformed-current-goal)"
write_bug037_attempt_session "$repo"
jq '.executionRuntime = "manual" | del(.goalContract.approval)' \
  "$repo/.specify/memory/bubbles.session.json" > "$repo/malformed-current-goal.json"
mv "$repo/malformed-current-goal.json" "$repo/.specify/memory/bubbles.session.json"
run_health "$repo"
assert_exit "S1i malformed current Goal Contract" 2
assert_stderr_contains "S1i malformed current Goal Contract" "SESSION_GOAL_INVALID"
assert_stdout_empty "S1i malformed current Goal Contract"

echo ""
echo "--- S1j: pending current Goal Contracts cannot select an attempt ---"
repo="$(stage_repo s1j-pending-current-goal)"
write_bug037_attempt_session "$repo"
jq '.executionRuntime = "manual" | .goalContract.approval = {"state":"pending-expansion","approvedAt":null,"approvalNote":"awaiting operator approval"}' \
  "$repo/.specify/memory/bubbles.session.json" > "$repo/pending-current-goal.json"
mv "$repo/pending-current-goal.json" "$repo/.specify/memory/bubbles.session.json"
run_health "$repo"
assert_exit "S1j pending current Goal Contract" 2
assert_stderr_contains "S1j pending current Goal Contract" "SESSION_GOAL_UNAUTHORIZED"
assert_stdout_empty "S1j pending current Goal Contract"

echo ""
echo "--- S1k: identity-bearing history without current authority fails closed ---"
repo="$(stage_repo s1k-missing-current-goal)"
write_bug037_attempt_session "$repo"
jq '.executionRuntime = "manual" | del(.goalContract)' \
  "$repo/.specify/memory/bubbles.session.json" > "$repo/missing-current-goal.json"
mv "$repo/missing-current-goal.json" "$repo/.specify/memory/bubbles.session.json"
run_health "$repo"
assert_exit "S1k missing current Goal Contract" 2
assert_stderr_contains "S1k missing current Goal Contract" "SESSION_GOAL_MISSING"
assert_stdout_empty "S1k missing current Goal Contract"

echo ""
echo "--- S1l: a contained physical alias is attributed to the requested spec ---"
repo="$(stage_repo s1l-contained-alias)"
ln -s "900-retro-fixture" "$repo/specs/900-contained-alias"
cat > "$repo/.specify/memory/bubbles.session.json" <<'EOF'
{
  "sessionId": "retro-health-contained-alias",
  "convergenceLoops": [
    {
      "specDir": "specs/900-contained-alias",
      "goalRef": null,
      "iterationCount": 4,
      "agent": "bubbles.workflow"
    }
  ]
}
EOF
run_health "$repo"
assert_exit "S1l contained alias" 0
assert_json "S1l contained alias"
assert_jq "S1l alias uses physical requested-spec identity" '.maxConvergenceIterations == 4 and .avgLoopIterations == 4'
assert_jq "S1l alias produces one legacy current summary" '.attemptAccounting.current.kind == "legacy" and .attemptAccounting.current.iterationCount == 4 and .attemptAccounting.totalAttempts == 1'

echo ""
echo "--- S1m: production G090 retains only shared convergence validation ---"
if grep -Eq 'canonical_spec_dir|def[[:space:]]+(valid_core|norm_spec)' "$RETRO_HEALTH"; then
  ko "S1m production reader reintroduced private convergence identity filtering"
else
  ok "S1m production reader delegates physical identity and record validation to session-state-lib.sh"
fi
numbers_filter_count="$(grep -Ec '\|[[:space:]]*numbers' "$RETRO_HEALTH" || true)"
if [[ "$numbers_filter_count" == "1" ]]; then
  ok "S1m exactly one unrelated numeric filter remains"
else
  ko "S1m convergence numeric filtering returned or the unrelated filter changed (observed=$numbers_filter_count)"
fi
if grep -Fq '.turnCount? | numbers' "$RETRO_HEALTH"; then
  ok "S1m the remaining numeric filter is the unchanged turnCount SLO calculation"
else
  ko "S1m unrelated turnCount SLO calculation changed"
fi
if grep -Fq 'session_state_authority_context' "$RETRO_HEALTH" &&
   grep -Fq 'session_state_authorized_attempt' "$RETRO_HEALTH"; then
  ok "S1m current Goal Contract selection uses shared mirror authority and authorized attempt identity"
else
  ko "S1m current Goal Contract selection bypasses shared authority helpers"
fi

echo ""
echo "--- S1c: paired state-snapshot records count as one complete snapshot ---"
repo="$(stage_repo s1c-state-snapshot-pair)"
write_state_snapshot_pair_session "$repo"
run_health "$repo"
assert_exit "S1c state-snapshot pair" 0
assert_json "S1c state-snapshot pair"
assert_jq "S1c snapshot completeness" '.snapshotCompleteness == 1'
assert_jq "S1c SLO pass" '.convergenceHealth.slo == "pass"'

echo ""
echo "--- S2: snapshotCompleteness breach exits 1 and cites G090 ---"
repo="$(stage_repo s2-snapshot-breach)"
write_snapshot_breach_session "$repo"
run_health "$repo"
assert_exit "S2 snapshot breach" 1
assert_stderr_contains "S2" "G090"
assert_stderr_contains "S2" "snapshotCompleteness"

echo ""
echo "--- S2a: single-sided state-snapshot record still fails G090 ---"
repo="$(stage_repo s2a-state-snapshot-single-sided)"
write_state_snapshot_single_sided_session "$repo"
run_health "$repo"
assert_exit "S2a state-snapshot single-sided" 1
assert_stderr_contains "S2a" "G090"
assert_stderr_contains "S2a" "snapshotCompleteness=0"

echo ""
echo "--- S2b: more than two recap/handoff invocations is P0 failed ---"
repo="$(stage_repo s2b-p0-recap-handoff)"
write_p0_recap_handoff_session "$repo"
run_health "$repo"
assert_exit "S2b recap/handoff P0" 1
assert_stderr_contains "S2b" "P0 convergence regression"
assert_stderr_contains "S2b" "recapHandoffInvocationCount=3"

echo ""
echo "--- S2c: ambient cross-spec telemetry is skipped (spec-attribution guard) ---"
repo="$(stage_repo s2c-ambient-cross-spec)"
write_ambient_cross_spec_session "$repo"
run_health "$repo"
assert_exit "S2c ambient cross-spec" 0
assert_json "S2c ambient cross-spec"
assert_jq "S2c SLO skipped" '.convergenceHealth.slo == "skipped"'
assert_jq "S2c skipReason cites attribution" '.convergenceHealth.skipReason | test("attributed")'

echo ""
echo "--- S3: all thresholds healthy emits markdown section ---"
repo="$(stage_repo s3-markdown)"
write_healthy_session "$repo"
run_health "$repo" --format markdown
assert_exit "S3 markdown" 0
assert_stdout_contains "S3" "## Convergence Health"
assert_stdout_contains "S3" 'SLO: `pass`'

echo ""
echo "--- S3b: --out writes markdown while stdout remains JSON ---"
repo="$(stage_repo s3b-out)"
write_healthy_session "$repo"
out_path="$WORKSPACE/retro-health.md"
run_health "$repo" --out "$out_path"
assert_exit "S3b --out" 0
assert_json "S3b stdout JSON"
if [[ -f "$out_path" ]] && grep -qF "## Convergence Health" "$out_path"; then
  ok "S3b --out markdown file contains Convergence Health"
else
  ko "S3b --out markdown file missing Convergence Health"
  [[ -f "$out_path" ]] && cat "$out_path"
fi

echo ""
echo "--- S4: a linked worktree resolves the primary checkout's session JSON ---"
# The session JSON is git-ignored, so it never materialises in a linked worktree.
# Unresolved, the metric reads as unmeasurable and Check 33 reports a G090 breach,
# so a worktree census overstates the blocking gates for every spec it visits.
repo="$(stage_repo s4-worktree-primary)"
write_healthy_session "$repo"
stage_git_fixture() {
  local root="$1" linked="$2"
  (
    cd "$root" || exit 1
    git init -q .
    git config user.email selftest@example.com
    git config user.name selftest
    printf '.specify/memory/bubbles.session.json\n' > .gitignore
    mkdir -p specs/900-retro-fixture
    printf 'fixture\n' > specs/900-retro-fixture/spec.md
    git add -A
    git commit -q -m "retro-health worktree fixture"
    git worktree add -q --detach "$linked" HEAD
  ) > /dev/null 2>&1 || true
}

s4_linked="$WORKSPACE/s4-worktree-linked"
stage_git_fixture "$repo" "$s4_linked"

if [[ ! -d "$s4_linked" ]]; then
  ko "S4 could not create a linked worktree fixture"
elif [[ -f "$s4_linked/.specify/memory/bubbles.session.json" ]]; then
  ko "S4 fixture invalid: the linked worktree already carries a session JSON"
else
  ok "S4 fixture: linked worktree carries no session JSON of its own"
  run_health "$s4_linked"
  assert_exit "S4 linked worktree" 0
  assert_json "S4 linked worktree"
fi

echo ""
echo "--- S4b: a worktree whose primary has no session still fails ---"
# Resolution must not become an escape hatch. The session JSON is git-ignored, so
# deleting it leaves no trace in git status; if absence were tolerated, removing
# the file would silently skip G090. Absent in the primary too must still exit 2.
repo="$(stage_repo s4b-worktree-nosession)"
s4b_linked="$WORKSPACE/s4b-worktree-linked"
stage_git_fixture "$repo" "$s4b_linked"

if [[ ! -d "$s4b_linked" ]]; then
  ko "S4b could not create a linked worktree fixture"
else
  run_health "$s4b_linked"
  assert_exit "S4b linked worktree with no session anywhere" 2
fi

echo ""
echo "=== Selftest verdict ==="
printf '  Total assertions: %d\n' "$((PASS_COUNT + FAIL_COUNT))"
printf '  Passed:           %d\n' "$PASS_COUNT"
printf '  Failed:           %d\n' "$FAIL_COUNT"

if [[ "$FAIL_COUNT" -gt 0 ]]; then
  echo "retro-convergence-health-selftest: FAILED" >&2
  for scenario in "${FAILED_SCENARIOS[@]}"; do
    echo "  - $scenario" >&2
  done
  exit 1
fi

echo "retro-convergence-health-selftest: PASSED"
exit 0