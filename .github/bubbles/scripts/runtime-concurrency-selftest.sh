#!/usr/bin/env bash
#
# runtime-concurrency-selftest.sh — IMP-102 SCOPE-8.
#
# Proves the concurrency-safety fixes for the runtime state surface:
#
#   (1) state-snapshot no-lost-update.
#       state-snapshot.sh now serializes its whole session-file interaction —
#       the mirror-session mirror (repository-binding.sh sets
#       `.repositoryBindingMirror`), the `turnSnapshots` append, and the
#       `convergenceLoops` update — under ONE exclusive lock. N concurrent
#       snapshots against the SAME session file therefore lose NO update:
#       `turnSnapshots` ends up with exactly N records and every parallel
#       `convergenceLoops` key is present with its value.
#
#       Non-tautology proof: the SAME parallel workload run against the
#       pre-fix state-snapshot.sh (`git show 650639b:...`, which has no lock)
#       LOSES updates in at least one round, while the fixed version NEVER
#       loses across the same rounds — demonstrating the race is real and the
#       lock closes it.
#
#   (2) runtime-leases stale-lock recovery.
#       runtime-leases.sh `acquire_registry_lock` used to `die` on any held
#       lock; a SIGKILLed holder (whose release trap never fired) left the lock
#       dir behind forever, permanently deadlocking every future acquire. The
#       fix records the holder pid + honours the lock dir mtime so a STALE lock
#       (dead holder pid, or mtime older than staleAfterMinutes) is broken and
#       the acquire succeeds, while a LIVE, fresh holder's lock is still
#       respected (acquire refuses without stealing it).
#
# Graceful-skip: jq absent -> SKIP (exit 0). The non-tautology old-baseline
# sub-proof additionally SKIPs (without failing the harness) if git or the
# 650639b blob is unavailable.
#
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SNAPSHOT="$SCRIPT_DIR/state-snapshot.sh"
BINDING="$SCRIPT_DIR/repository-binding.sh"
RUNTIME_SCRIPT="$SCRIPT_DIR/runtime-leases.sh"
SESSION_STATE_LIB="$SCRIPT_DIR/session-state-lib.sh"
GOAL_CONTRACT="$SCRIPT_DIR/goal-contract.sh"
CONTEXT_COMPACTOR="$SCRIPT_DIR/context-compactor.sh"
CONVERGENCE_MATERIALITY="$SCRIPT_DIR/convergence-materiality.sh"
EXPANSION_APPROVAL="$SCRIPT_DIR/expansion-approval.sh"
OLD_REF="650639b"

pass_count=0
fail_count=0

pass() { pass_count=$((pass_count + 1)); echo "PASS: $1"; }
fail() { fail_count=$((fail_count + 1)); echo "FAIL: $1"; }

# --- Graceful skip ---------------------------------------------------------

if [[ ! -x "$SNAPSHOT" || ! -x "$BINDING" || ! -x "$RUNTIME_SCRIPT" ||
      ! -f "$SESSION_STATE_LIB" || ! -x "$GOAL_CONTRACT" ||
      ! -x "$CONTEXT_COMPACTOR" || ! -x "$CONVERGENCE_MATERIALITY" ||
      ! -x "$EXPANSION_APPROVAL" ]]; then
  echo "runtime-concurrency-selftest: required scripts missing/not executable — SKIP"
  exit 0
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "runtime-concurrency-selftest: SKIP (jq not installed)"
  exit 0
fi

# macOS mktemp -d sits under the /var symlink; canonicalize the fixture root.
TMP_ROOT="$(cd "$(mktemp -d)" && pwd -P)"
BG_PIDS=()

cleanup() {
  local p
  for p in "${BG_PIDS[@]:-}"; do
    [[ -n "$p" ]] || continue
    kill "$p" 2>/dev/null || true
    wait "$p" 2>/dev/null || true
  done
  rm -rf "$TMP_ROOT"
}
trap cleanup EXIT INT TERM

echo "Running runtime concurrency selftest..."

# ===========================================================================
# Case 1: state-snapshot no-lost-update (+ non-tautology old-baseline proof)
# ===========================================================================

N=8
ROUNDS=10

REPO="$TMP_ROOT/snapshot-repo"
mkdir -p \
  "$REPO/.specify/memory" \
  "$REPO/bubbles/scripts" \
  "$REPO/agents" \
  "$REPO/bugs/BUG-037-convergence-cap-attempt-poisoning"
for (( fixture_index = 0; fixture_index < N; fixture_index++ )); do
  mkdir -p "$REPO/specs/000-p$fixture_index"
done
printf 'test-version\n' > "$REPO/VERSION"
printf '#!/usr/bin/env bash\n' > "$REPO/install.sh"
printf '#!/usr/bin/env bash\n' > "$REPO/bubbles/scripts/cli.sh"
git init -q "$REPO"

SESSION_FILE="$REPO/.specify/memory/bubbles.session.json"

# Pre-generate one bound (control-file, packet) pair per parallel worker. Each
# uses a DISTINCT session id + DISTINCT (external) control file but the SAME
# repository root, so every worker writes the SAME session file (the shared
# resource under test) while never contending on the control file.
CTRLS=()
PKTS=()
prepared=true
for (( i = 0; i < N; i++ )); do
  sid="conc-$i"
  control_dir="$TMP_ROOT/controls/$sid"
  mkdir -p "$control_dir"
  chmod 700 "$control_dir"
  ctrl="$control_dir/repository-binding.json"
  pkt="$TMP_ROOT/packets/$sid.packet.json"
  mkdir -p "$TMP_ROOT/packets"
  preflight_out="$(bash "$BINDING" preflight \
    --session-id "$sid" \
    --session-control-file "$ctrl" \
    --expected-control-revision 0 \
    --request-class TARGETLESS_MODE \
    --repository-root "$REPO" \
    --workspace-root "$REPO" 2>/dev/null)"
  printf '%s\n' "$preflight_out" \
    | awk '/^\{.*"repositoryRoot"/ { packet = $0 } END { print packet }' > "$pkt"
  if ! jq -e '.repositoryResolution.actionable == true' "$pkt" >/dev/null 2>&1; then
    prepared=false
    break
  fi
  CTRLS+=("$ctrl")
  PKTS+=("$pkt")
done

reset_session() {
  rm -f "$SESSION_FILE" 2>/dev/null || true
  rm -rf "$SESSION_FILE.lock" 2>/dev/null || true
}

# Hold the shared transaction lock around a canary mutation. A production
# writer launched while this callback is waiting must block before reading the
# session. If it bypasses session_state_transaction, both processes build from
# the same starting bytes and one of the two disjoint mutations is lost.
TRANSACTION_HOLDER="$TMP_ROOT/session-transaction-holder.sh"
cat > "$TRANSACTION_HOLDER" <<'HOLDER'
#!/usr/bin/env bash
set -euo pipefail

session_state_lib="$1"
session_file="$2"
ready_file="$3"
release_file="$4"
canary_name="$5"

# shellcheck source=/dev/null
source "$session_state_lib"

hold_canary_mutation() {
  local locked_input="$1" candidate="$2" operation_context="$3" name="$4"
  local waits=0
  : "$operation_context"
  printf '%s\n' ready > "$ready_file"
  while [[ ! -f "$release_file" && "$waits" -lt 100 ]]; do
    sleep 0.1
    waits=$((waits + 1))
  done
  [[ -f "$release_file" ]] || return 3
  jq --arg name "$name" \
    '. + {transactionCanaries: ((.transactionCanaries // {}) + {($name): true})}' \
    "$locked_input" > "$candidate"
}

session_state_transaction "$session_file" refuse "stress-$canary_name" \
  hold_canary_mutation "$canary_name"
HOLDER
chmod 700 "$TRANSACTION_HOLDER"

run_writer_overlap() {
  local writer_name="$1" expected_filter="$2"
  shift 2
  local ready_file="$TMP_ROOT/$writer_name.ready"
  local release_file="$TMP_ROOT/$writer_name.release"
  local holder_out="$TMP_ROOT/$writer_name.holder.out"
  local writer_out="$TMP_ROOT/$writer_name.writer.out"
  local holder_pid writer_pid holder_rc=0 writer_rc=0 waits=0

  rm -f "$ready_file" "$release_file" "$holder_out" "$writer_out"
  bash "$TRANSACTION_HOLDER" "$SESSION_STATE_LIB" "$SESSION_FILE" \
    "$ready_file" "$release_file" "$writer_name" > "$holder_out" 2>&1 &
  holder_pid=$!
  BG_PIDS+=("$holder_pid")

  while [[ ! -f "$ready_file" && "$waits" -lt 100 ]]; do
    if ! kill -0 "$holder_pid" 2>/dev/null; then
      break
    fi
    sleep 0.1
    waits=$((waits + 1))
  done
  if [[ ! -f "$ready_file" ]]; then
    wait "$holder_pid" 2>/dev/null || holder_rc=$?
    fail "BUG-037 $writer_name overlap could not acquire the shared transaction lock (exit=$holder_rc)"
    cat "$holder_out"
    return
  fi

  "$@" > "$writer_out" 2>&1 &
  writer_pid=$!
  BG_PIDS+=("$writer_pid")

  # A bypassing writer completes while the shared lock is held. A conforming
  # writer remains blocked. Either way, release after a bounded observation
  # window and assert final state rather than inferring behavior from timing.
  waits=0
  while kill -0 "$writer_pid" 2>/dev/null && [[ "$waits" -lt 30 ]]; do
    sleep 0.1
    waits=$((waits + 1))
  done
  printf '%s\n' release > "$release_file"
  wait "$holder_pid" || holder_rc=$?
  wait "$writer_pid" || writer_rc=$?

  if [[ "$holder_rc" -eq 0 && "$writer_rc" -eq 0 ]] &&
     jq -e --arg writer "$writer_name" \
       '(.transactionCanaries[$writer] == true) and ('"$expected_filter"')' \
       "$SESSION_FILE" >/dev/null 2>&1; then
    pass "BUG-037 $writer_name preserves its production mutation and the overlapping transaction canary"
  else
    fail "BUG-037 $writer_name lost an admitted mutation or failed (holder=$holder_rc writer=$writer_rc)"
    cat "$holder_out"
    cat "$writer_out"
  fi
}

# Launch N snapshots in parallel against $1 (a state-snapshot.sh path) and wait.
run_parallel_snapshots() {
  local snapshot_bin="$1"
  local pids=()
  local i
  for (( i = 0; i < N; i++ )); do
    BUBBLES_AGENT_NAME="conc-agent-$i" bash "$snapshot_bin" \
      --phase "phase-$i" --mode start \
      --session-id "conc-$i" \
      --session-control-file "${CTRLS[$i]}" \
      --binding-packet-file "${PKTS[$i]}" \
      --convergence-iteration "$((100 + i))" \
      --spec-dir "specs/000-p$i" \
      >/dev/null 2>&1 &
    pids+=("$!")
  done
  local pid
  for pid in "${pids[@]}"; do
    wait "$pid" 2>/dev/null || true
  done
}

# turnSnapshots length in the current session file (0 if missing/invalid).
session_turn_count() {
  jq '(.turnSnapshots // []) | length' "$SESSION_FILE" 2>/dev/null || echo 0
}

# 0 = intact (no lost update), 1 = a lost update was detected.
session_intact() {
  jq -e . "$SESSION_FILE" >/dev/null 2>&1 || return 1
  local turns i want got
  turns="$(session_turn_count)"
  [[ "$turns" == "$N" ]] || return 1
  for (( i = 0; i < N; i++ )); do
    want=$((100 + i))
    got="$(jq --arg s "specs/000-p$i" \
      '((.convergenceLoops // []) | map(select(.specDir == $s)) | .[0].iterationCount) // empty' \
      "$SESSION_FILE" 2>/dev/null)"
    [[ "$got" == "$want" ]] || return 1
  done
  return 0
}

# Prepare the pre-fix (650639b) baseline for the non-tautology proof. Its sibling
# repository-binding.sh (unchanged at 650639b) is copied alongside it so the old
# state-snapshot resolves the same validator.
OLD_SNAPSHOT=""
if command -v git >/dev/null 2>&1 \
  && git -C "$SOURCE_ROOT" cat-file -e "$OLD_REF:bubbles/scripts/state-snapshot.sh" 2>/dev/null; then
  OLD_DIR="$TMP_ROOT/old-baseline"
  mkdir -p "$OLD_DIR"
  if git -C "$SOURCE_ROOT" show "$OLD_REF:bubbles/scripts/state-snapshot.sh" > "$OLD_DIR/state-snapshot.sh" 2>/dev/null \
    && git -C "$SOURCE_ROOT" show "$OLD_REF:bubbles/scripts/repository-binding.sh" > "$OLD_DIR/repository-binding.sh" 2>/dev/null; then
    chmod +x "$OLD_DIR/state-snapshot.sh" "$OLD_DIR/repository-binding.sh"
    OLD_SNAPSHOT="$OLD_DIR/state-snapshot.sh"
  fi
fi

if [[ "$prepared" != true ]]; then
  fail "state-snapshot no-lost-update: could not prepare bound repository fixtures"
else
  fixed_losses=0
  old_losses=0
  old_ran=0
  round=1
  while (( round <= ROUNDS )); do
    # --- fixed version: must NEVER lose ---
    reset_session
    run_parallel_snapshots "$SNAPSHOT"
    fixed_turns="$(session_turn_count)"
    if session_intact; then
      fixed_msg="intact ($fixed_turns/$N)"
    else
      fixed_losses=$((fixed_losses + 1))
      fixed_msg="LOST ($fixed_turns/$N)"
    fi

    # --- pre-fix baseline: expected to lose in >=1 round ---
    old_turns="n/a"
    if [[ -n "$OLD_SNAPSHOT" ]]; then
      old_ran=1
      reset_session
      run_parallel_snapshots "$OLD_SNAPSHOT"
      old_turns="$(session_turn_count)"
      if ! session_intact; then
        old_losses=$((old_losses + 1))
      fi
    fi

    echo "  round $round: fixed=$fixed_msg  pre-fix(650639b) turnSnapshots=$old_turns/$N"
    round=$((round + 1))
  done

  if [[ "$fixed_losses" -eq 0 ]]; then
    pass "fixed state-snapshot loses NO update across $ROUNDS parallel rounds of $N (turnSnapshots==$N, all convergence keys present)"
  else
    fail "fixed state-snapshot lost an update in $fixed_losses/$ROUNDS rounds"
  fi

  if [[ "$old_ran" -eq 1 ]]; then
    if [[ "$old_losses" -ge 1 ]]; then
      pass "NON-TAUTOLOGY: pre-fix state-snapshot (650639b, lock-free) lost updates in $old_losses/$ROUNDS rounds — the race is real and the lock closes it"
    else
      fail "NON-TAUTOLOGY expected the pre-fix state-snapshot to lose at least once across $ROUNDS rounds but it never did (test may be insufficiently contended)"
    fi
  else
    echo "SKIP: non-tautology old-baseline proof (git or $OLD_REF blob unavailable)"
  fi
  reset_session
fi

# ---------------------------------------------------------------------------
# Case 1b: BUG-037 concurrent idempotent writes preserve attempt summaries
# ---------------------------------------------------------------------------
#
# Stage a capped historical revision, then let N different orchestrator agents
# concurrently record iteration one for the current revision. The exclusive
# lock must preserve all N turn snapshots while collapsing the current revision
# to one idempotent summary with unioned attribution. A (specDir, agent) writer
# would create N fresh budgets and this assertion would fail.

echo "  BUG-037: concurrent agent writes share one authorized attempt"
if [[ "$prepared" != true ]]; then
  fail "BUG-037 concurrency fixture could not reuse the bound repository workers"
else
  bug037_spec_dir="bugs/BUG-037-convergence-cap-attempt-poisoning"
  bug037_packet="${PKTS[0]}"
  bug037_control="${CTRLS[0]}"
  bug037_repository_root="$(jq -er '.repositoryRoot' "$bug037_packet")"
  bug037_repository_alias="$(jq -er '.repositoryAlias' "$bug037_packet")"
  bug037_session_id="$(jq -er '.repositoryResolution.sessionId' "$bug037_packet")"
  bug037_request_v1="$TMP_ROOT/bug037-concurrency-request-v1.txt"
  bug037_request_v2="$TMP_ROOT/bug037-concurrency-request-v2.txt"
  bug037_goal_out="$TMP_ROOT/bug037-concurrency-goal.out"
  bug037_seed="$TMP_ROOT/bug037-concurrency-seed.json"
  bug037_fixture_ready=true
  historical_attempt=""
  revision_one_ref=""

  printf '%s\n' 'BUG-037 concurrent attempt historical revision' > "$bug037_request_v1"
  printf '%s\n' 'BUG-037 concurrent attempt current revision' > "$bug037_request_v2"

  if [[ "$bug037_repository_root" != "$REPO" ]]; then
    printf 'selected packet root mismatch: expected=%s observed=%s\n' \
      "$REPO" "$bug037_repository_root" > "$bug037_goal_out"
    bug037_fixture_ready=false
  elif ! bash "$GOAL_CONTRACT" freeze \
      --session-file "$SESSION_FILE" \
      --source-request-file "$bug037_request_v1" \
      --intent "exercise BUG-037 concurrent attempt accounting" \
      --success-signal "all concurrent agent mutations remain durable under one authority" \
      --target "spec=$bug037_spec_dir" \
      --repository-root "$bug037_repository_alias" \
      --spec-target "$bug037_spec_dir" \
      --allowed-path "$bug037_spec_dir/**" \
      --runner bubbles.goal \
      --session-id "$bug037_session_id" \
      --repository-alias "$bug037_repository_alias" \
      --execution-shape existing-capability-change \
      --allow-change-class existing-test \
      --delta-budget maxNewFiles=1 \
      > "$bug037_goal_out" 2>&1; then
    bug037_fixture_ready=false
  elif ! revision_one_ref="$(bash "$GOAL_CONTRACT" ref \
      --session-file "$SESSION_FILE" 2> "$bug037_goal_out")"; then
    bug037_fixture_ready=false
  elif ! historical_attempt="$(jq -cn \
      --arg specDir "$bug037_spec_dir" \
      --argjson goalRef "$revision_one_ref" \
      '{
        specDir: $specDir,
        goalRef: $goalRef,
        iterationCount: 16,
        startedAt: "2026-08-28T03:00:00Z",
        lastUpdated: "2026-08-28T03:24:39Z",
        agents: ["bubbles.goal"],
        marker: "preserve-history-byte-equivalent"
      }')"; then
    printf '%s\n' 'could not construct the revision-one historical summary' > "$bug037_goal_out"
    bug037_fixture_ready=false
  elif ! jq --argjson historical "$historical_attempt" \
      '. + {convergenceLoops: [$historical]}' \
      "$SESSION_FILE" > "$bug037_seed" ||
      ! mv "$bug037_seed" "$SESSION_FILE"; then
    printf '%s\n' 'could not stage the revision-one historical summary' > "$bug037_goal_out"
    bug037_fixture_ready=false
  elif ! bash "$GOAL_CONTRACT" revise \
      --session-file "$SESSION_FILE" \
      --source-request-file "$bug037_request_v2" \
      --intent "exercise BUG-037 current concurrent attempt accounting" \
      --approval-note "BUG-037 fixture authorizes the distinct current attempt" \
      --runner bubbles.goal \
      --repository-alias "$bug037_repository_alias" \
      > "$bug037_goal_out" 2>&1; then
    bug037_fixture_ready=false
  elif ! bash "$GOAL_CONTRACT" verify \
      --session-file "$SESSION_FILE" \
      --expect-revision 2 \
      > "$bug037_goal_out" 2>&1; then
    bug037_fixture_ready=false
  fi

  if [[ "$bug037_fixture_ready" != true ]]; then
    fail "BUG-037 concurrency fixture could not establish one complete revision-two Goal Contract"
    cat "$bug037_goal_out"
  else
    attempt_pids=()
    attempt_outputs=()
    for (( i = 0; i < N; i++ )); do
      attempt_output="$TMP_ROOT/bug037-concurrent-agent-$i.out"
      BUBBLES_AGENT_NAME="conc-agent-$i" bash "$SNAPSHOT" \
        --phase phase-bug037-shared-attempt --mode start \
        --session-id "$bug037_session_id" \
        --session-control-file "$bug037_control" \
        --binding-packet-file "$bug037_packet" \
        --convergence-iteration 1 \
        --spec-dir "$bug037_spec_dir" \
        > "$attempt_output" 2>&1 &
      attempt_pids+=("$!")
      attempt_outputs+=("$attempt_output")
    done

    attempt_failures=0
    for (( i = 0; i < N; i++ )); do
      if ! wait "${attempt_pids[$i]}"; then
        attempt_failures=$((attempt_failures + 1))
        echo "  conc-agent-$i worker output:"
        cat "${attempt_outputs[$i]}"
      fi
    done

    if [[ "$attempt_failures" -eq 0 ]]; then
      pass "BUG-037 concurrent idempotent writes from $N agents all complete"
    else
      fail "BUG-037 concurrent idempotent writes failed in $attempt_failures/$N workers"
    fi

    if jq -e --argjson historical "$historical_attempt" --argjson expectedTurns "$N" '
      (.turnSnapshots | length) == $expectedTurns
      and .goalContract.schemaVersion == "goal-contract/v2"
      and .goalContract.revision == 2
      and .goalContract.intent == "exercise BUG-037 current concurrent attempt accounting"
      and .goalContract.approval.state == "operator-approved"
      and (.convergenceLoops | length) == 2
      and any(.convergenceLoops[]; . == $historical)
      and ([.convergenceLoops[] | select(.goalRef.revision == 2)] | length) == 1
      and ([.convergenceLoops[] | select(.goalRef.revision == 2)][0].iterationCount) == 1
      and ([.convergenceLoops[] | select(.goalRef.revision == 2)][0].agents | length) == $expectedTurns
      and ([.convergenceLoops[] | select(.goalRef.revision == 2)][0] | has("agent") | not)
    ' "$SESSION_FILE" >/dev/null 2>&1; then
      pass "BUG-037 concurrency preserves all turns, byte-equivalent history, and one current summary"
    else
      fail "BUG-037 concurrency lost a turn, rewrote history, or split the current attempt"
    fi

    missing_agent_attribution=0
    for (( i = 0; i < N; i++ )); do
      if ! jq -e --arg agent "conc-agent-$i" '
        any(.convergenceLoops[];
          .goalRef.revision == 2
          and ((.agents // []) | index($agent) != null))
      ' "$SESSION_FILE" >/dev/null 2>&1; then
        missing_agent_attribution=$((missing_agent_attribution + 1))
      fi
    done
    if [[ "$missing_agent_attribution" -eq 0 ]]; then
      pass "BUG-037 current summary retains attribution for every concurrent agent without minting budgets"
    else
      fail "BUG-037 current summary omitted $missing_agent_attribution/$N concurrent agent attribution entries"
    fi
  fi

  reset_session
fi

# ---------------------------------------------------------------------------
# Case 1c: BUG-037 all six active-session writers share one transaction
# ---------------------------------------------------------------------------
#
# Each production CLI is overlapped with a canary callback that already holds
# the shared lock. The final object must contain BOTH disjoint mutations. This
# is a deterministic lost-update adversary: a writer that reads and replaces
# outside the shared transaction races against the canary and loses one side.

echo "  BUG-037: heterogeneous active-session writers share one transaction"
if [[ "$prepared" != true ]]; then
  fail "BUG-037 heterogeneous-writer fixtures could not reuse bound repository authority"
else
  # 1. Goal Contract writer.
  reset_session
  printf '%s\n' '{"unrelated":{"writer":"goal-contract"}}' > "$SESSION_FILE"
  goal_request="$TMP_ROOT/goal-contract-request.txt"
  printf '%s\n' 'exercise the shared active-session transaction' > "$goal_request"
  run_writer_overlap goal-contract \
    '.goalContract.schemaVersion == "goal-contract/v1" and .unrelated.writer == "goal-contract"' \
    bash "$GOAL_CONTRACT" freeze \
      --session-file "$SESSION_FILE" \
      --source-request-file "$goal_request" \
      --intent "exercise the shared active-session transaction" \
      --success-signal "both overlapping mutations remain durable" \
      --target repository=bubbles \
      --repository-root bubbles \
      --runner bubbles.goal \
      --session-id bug037-writer-overlap \
      --repository-alias bubbles

  # 2. Direct repository-binding mirror writer.
  reset_session
  printf '%s\n' '{"unrelated":{"writer":"repository-binding"}}' > "$SESSION_FILE"
  run_writer_overlap repository-binding \
    '.repositoryBindingMirror.repositoryResolution.sessionId == "conc-0" and .unrelated.writer == "repository-binding"' \
    bash "$BINDING" mirror-session \
      --session-id conc-0 \
      --session-control-file "${CTRLS[0]}" \
      --packet-file "${PKTS[0]}"

  # 3. Composite state snapshot writer.
  reset_session
  printf '%s\n' '{"unrelated":{"writer":"state-snapshot"}}' > "$SESSION_FILE"
  run_writer_overlap state-snapshot \
    '(.turnSnapshots | length) == 1 and .repositoryBindingMirror.repositoryResolution.sessionId == "conc-0" and .unrelated.writer == "state-snapshot"' \
    env BUBBLES_AGENT_NAME=bubbles.test bash "$SNAPSHOT" \
      --session-id conc-0 \
      --session-control-file "${CTRLS[0]}" \
      --binding-packet-file "${PKTS[0]}" \
      --phase phase-bug037-writer-overlap \
      --mode start

  # 4. Bound context-compaction writer.
  reset_session
  compact_raw="$TMP_ROOT/context-compactor-envelope.md"
  packet_alias="$(jq -r '.repositoryAlias' "${PKTS[0]}")"
  packet_decision="$(jq -r '.repositoryResolution.decisionId' "${PKTS[0]}")"
  packet_revision="$(jq -r '.repositoryResolution.controlRevision' "${PKTS[0]}")"
  packet_digest="$(jq -r '.repositoryResolution.controlPathDigest' "${PKTS[0]}")"
  packet_authority="$(jq -r '.repositoryResolution.authority' "${PKTS[0]}")"
  packet_transition="$(jq -r '.repositoryResolution.transition' "${PKTS[0]}")"
  packet_scope_kind="$(jq -r '.repositoryResolution.scopeKind' "${PKTS[0]}")"
  packet_scope_id="$(jq -r '.repositoryResolution.scopeId | if . == null then "null" else tostring end' "${PKTS[0]}")"
  packet_target_kind="$(jq -r '.repositoryResolution.targetKind' "${PKTS[0]}")"
  packet_visibility="$(jq -r '.repositoryResolution.pathVisibility' "${PKTS[0]}")"
  packet_actionable="$(jq -r '.repositoryResolution.actionable' "${PKTS[0]}")"
  cat > "$compact_raw" <<EOF
## RESULT-ENVELOPE
agent: bubbles.test
outcome: completed_owned
featureDir: bugs/BUG-037-convergence-cap-attempt-poisoning
repositoryRoot: $REPO
repositoryAlias: $packet_alias
sessionId: conc-0
decisionId: $packet_decision
controlRevision: $packet_revision
controlPathDigest: $packet_digest
authority: $packet_authority
transition: $packet_transition
scopeKind: $packet_scope_kind
scopeId: $packet_scope_id
targetKind: $packet_target_kind
pathVisibility: $packet_visibility
actionable: $packet_actionable
EOF
  jq -n --arg raw "$compact_raw" \
    '{unrelated:{writer:"context-compactor"},envelopesReceived:[{rawPointer:$raw,compactedAt:null}]}' \
    > "$SESSION_FILE"
  run_writer_overlap context-compactor \
    '(.compactedHistory | length) == 1 and (.envelopesReceived[0].compactedAt | type) == "string" and .unrelated.writer == "context-compactor"' \
    bash "$CONTEXT_COMPACTOR" \
      --session-id conc-0 \
      --session-control-file "${CTRLS[0]}" \
      --binding-packet-file "${PKTS[0]}" \
      "$compact_raw"

  # 5. Goal-materiality baseline writer.
  reset_session
  printf '%s\n' '{"unrelated":{"writer":"convergence-materiality"},"goalContract":{"revision":1}}' > "$SESSION_FILE"
  run_writer_overlap convergence-materiality \
    '.convergenceBaseline.atRevision == 1 and .unrelated.writer == "convergence-materiality"' \
    bash "$CONVERGENCE_MATERIALITY" baseline \
      --session-file "$SESSION_FILE" \
      --planned-delta '{"changeClasses":["existing-test"],"maxNewFiles":1}'

  # 6. Expansion-approval writer. Prepare a genuine digest-bound approval
  # using the production Goal Contract and preview commands before overlap.
  reset_session
  expansion_request="$TMP_ROOT/expansion-request.txt"
  expansion_preview="$TMP_ROOT/expansion-preview.json"
  printf '%s\n' 'exercise expansion approval transaction overlap' > "$expansion_request"
  bash "$GOAL_CONTRACT" freeze \
    --session-file "$SESSION_FILE" \
    --source-request-file "$expansion_request" \
    --intent "exercise expansion approval transaction overlap" \
    --success-signal "the approval and canary both remain durable" \
    --target repository=bubbles \
    --repository-root bubbles \
    --runner bubbles.goal \
    --session-id bug037-expansion-overlap \
    --repository-alias bubbles \
    --execution-shape one-off \
    --allow-change-class existing-test \
    --approval-change-class new-virtual-machine \
    --delta-budget maxNewFiles=5 >/dev/null
  bash "$EXPANSION_APPROVAL" preview \
    --session-file "$SESSION_FILE" \
    --planned-delta '{"changeClasses":["new-virtual-machine"],"maxNewFiles":2}' \
    --reason new-virtual-machine="isolation for the transaction adversary" \
    --rejected-alternative "reuse an unrelated runtime" \
    --rollback "remove the isolated runtime" > "$expansion_preview"
  expansion_digest="$(jq -r '.expansionDigest' "$expansion_preview")"
  bash "$GOAL_CONTRACT" revise \
    --session-file "$SESSION_FILE" \
    --approval-note "operator approves expansion:$expansion_digest" >/dev/null
  expansion_seed="$TMP_ROOT/expansion-seed.json"
  jq '. + {unrelated:{writer:"expansion-approval"}}' "$SESSION_FILE" > "$expansion_seed"
  mv "$expansion_seed" "$SESSION_FILE"
  run_writer_overlap expansion-approval \
    '(.expansionApprovals | length) == 1 and .unrelated.writer == "expansion-approval"' \
    bash "$EXPANSION_APPROVAL" approve \
      --session-file "$SESSION_FILE" \
      --preview-file "$expansion_preview"

  reset_session
fi

# ===========================================================================
# Case 2: runtime-leases stale-lock recovery
# ===========================================================================

RT_ROOT="$TMP_ROOT/runtime-repo"
mkdir -p "$RT_ROOT/.specify/memory" "$RT_ROOT/.specify/runtime"
cat > "$RT_ROOT/.specify/memory/bubbles.config.json" <<'EOF'
{
  "version": 2,
  "defaults": {
    "runtime": { "leaseTtlMinutes": 20, "staleAfterMinutes": 60, "reusePolicy": "fingerprint-match-only", "source": "repo-default" }
  },
  "modeOverrides": {},
  "metrics": { "enabled": false, "activityTrackingEnabled": false }
}
EOF
printf '{\n  "sessionId": "runtime-conc"\n}\n' > "$RT_ROOT/.specify/memory/bubbles.session.json"
RT_LOCK="$RT_ROOT/.specify/runtime/.locks/resource-leases.lock"

run_acquire() {
  local resource="$1"
  BUBBLES_REPO_ROOT="$RT_ROOT" BUBBLES_SESSION_ID="runtime-conc" BUBBLES_AGENT_NAME="bubbles.validate" \
    bash "$RUNTIME_SCRIPT" acquire \
    --purpose validation --environment dev --share-mode shared-compatible \
    --fingerprint-input "schema:v1" --resource "$resource" >/dev/null 2>&1
}

plant_lock() {
  local pid="$1"
  rm -rf "$RT_LOCK" 2>/dev/null || true
  mkdir -p "$RT_LOCK"
  printf '%s\n' "$pid" > "$RT_LOCK/holder.pid"
}

# --- Sub-case A: dead holder pid -> stale -> broken -> acquire succeeds -----
bash -c 'exit 0' & dead_pid=$!
wait "$dead_pid" 2>/dev/null || true
if kill -0 "$dead_pid" 2>/dev/null; then
  echo "SKIP: stale-lock dead-pid sub-case (reaped pid $dead_pid unexpectedly still alive — pid reuse)"
else
  plant_lock "$dead_pid"
  if run_acquire "container:stale-dead"; then
    pass "stale lock with a DEAD holder pid is broken and acquire succeeds (no deadlock)"
  else
    fail "stale lock with a DEAD holder pid should be broken; acquire refused/deadlocked instead"
  fi
fi

# --- Sub-case B: live, fresh holder -> respected -> acquire refuses ---------
sleep 60 & live_pid=$!
BG_PIDS+=("$live_pid")
plant_lock "$live_pid"
touch "$RT_LOCK" 2>/dev/null || true
if run_acquire "container:live-fresh"; then
  fail "live, fresh holder lock should be respected; acquire wrongly SUCCEEDED (stole a live lock)"
else
  if [[ -d "$RT_LOCK" ]]; then
    pass "live, fresh holder lock is respected (acquire refuses and does NOT steal the held lock)"
  else
    fail "acquire refused but the live holder's lock dir was removed (should not be broken)"
  fi
fi
kill "$live_pid" 2>/dev/null || true
wait "$live_pid" 2>/dev/null || true
rm -rf "$RT_LOCK" 2>/dev/null || true

# --- Sub-case C: live holder but ancient mtime -> stale -> broken -----------
sleep 60 & live_pid2=$!
BG_PIDS+=("$live_pid2")
plant_lock "$live_pid2"
# Age the lock dir well past staleAfterMinutes (portable BSD/GNU touch -t form).
touch -t 202001010000 "$RT_LOCK" 2>/dev/null || true
if run_acquire "container:stale-age"; then
  pass "stale lock with a live holder but mtime older than staleAfterMinutes is broken and acquire succeeds"
else
  fail "stale-by-age lock should be broken; acquire refused/deadlocked instead"
fi
kill "$live_pid2" 2>/dev/null || true
wait "$live_pid2" 2>/dev/null || true
rm -rf "$RT_LOCK" 2>/dev/null || true

# ===========================================================================
# Case 3: state-snapshot mkdir-fallback lock hygiene (the no-flock path)
# ===========================================================================
#
# Case 1 exercises whichever lock strategy the host happens to provide, which on
# Linux and CI is always flock. The mkdir mutex is the strategy stock macOS
# actually runs (no flock in the base install, so GitHub's macOS runners take
# it), and its stale-break is the step that can lose an update — so it needs
# direct coverage on every host, not only on macOS. A PATH sandbox mirroring the
# real PATH minus `flock` reproduces the macOS condition here.

NOFLOCK_BIN="$TMP_ROOT/noflock-bin"
mkdir -p "$NOFLOCK_BIN"
while IFS= read -r path_dir; do
  [[ -n "$path_dir" && -d "$path_dir" ]] || continue
  for path_exe in "$path_dir"/*; do
    [[ -e "$path_exe" ]] || continue
    exe_name="${path_exe##*/}"
    [[ "$exe_name" != "flock" ]] || continue
    [[ -e "$NOFLOCK_BIN/$exe_name" ]] || ln -s "$path_exe" "$NOFLOCK_BIN/$exe_name" 2>/dev/null || true
  done
done < <(printf '%s\n' "$PATH" | tr ':' '\n')

noflock_usable=true
( PATH="$NOFLOCK_BIN"; command -v flock >/dev/null 2>&1 ) && noflock_usable=false
( PATH="$NOFLOCK_BIN"; command -v jq >/dev/null 2>&1 ) || noflock_usable=false

if [[ "$prepared" != true || "$noflock_usable" != true ]]; then
  echo "SKIP: state-snapshot mkdir-fallback sub-cases (no-flock PATH sandbox unavailable)"
else
  # --- Sub-case D: dead holder -> stale -> broken -> the write completes ----
  bash -c 'exit 0' & snap_dead_pid=$!
  wait "$snap_dead_pid" 2>/dev/null || true
  if kill -0 "$snap_dead_pid" 2>/dev/null; then
    echo "SKIP: state-snapshot dead-holder break sub-case (reaped pid $snap_dead_pid still alive — pid reuse)"
  else
    reset_session
    snap_dead_out="$TMP_ROOT/snapshot-dead-holder.out"
    mkdir -p "$SESSION_FILE.lock"
    chmod 700 "$SESSION_FILE.lock"
    printf '%s\n%s\n' "$snap_dead_pid" "holder-dead-$snap_dead_pid" \
      > "$SESSION_FILE.lock/holder"
    chmod 600 "$SESSION_FILE.lock/holder"
    PATH="$NOFLOCK_BIN" BUBBLES_AGENT_NAME="conc-agent-0" \
      bash "$SNAPSHOT" --phase phase-dead-holder --mode start \
      --session-id "conc-0" \
      --session-control-file "${CTRLS[0]}" \
      --binding-packet-file "${PKTS[0]}" \
      > "$snap_dead_out" 2>&1
    snap_dead_rc=$?
    snap_dead_turns="$(session_turn_count)"
    if [[ "$snap_dead_rc" -eq 0 && "$snap_dead_turns" == "1" && ! -e "$SESSION_FILE.lock" ]]; then
      pass "state-snapshot mkdir fallback recovers a complete dead-holder record and completes its write"
    else
      fail "state-snapshot mkdir fallback should recover a complete DEAD-holder record (exit=$snap_dead_rc turnSnapshots=$snap_dead_turns/1 lockDirPresent=$([[ -e "$SESSION_FILE.lock" ]] && echo yes || echo no))"
      cat "$snap_dead_out"
    fi
    rm -rf "$SESSION_FILE.lock" 2>/dev/null || true
  fi

  # --- Sub-case E: live, aged holder -> bounded refusal, never stolen --------
  # This is the property the lost-update defect violated: a waiter must never
  # destroy a lock that a live holder currently owns. Unlike runtime leases,
  # shared session ownership is never inferred from age. Case 1 proves this
  # statistically across parallel rounds; this proves it deterministically and
  # waits through the configured bound instead of killing the waiter early.
  reset_session
  snap_live_out="$TMP_ROOT/snapshot-live-holder.out"
  sleep 30 & snap_live_pid=$!
  BG_PIDS+=("$snap_live_pid")
  mkdir -p "$SESSION_FILE.lock"
  chmod 700 "$SESSION_FILE.lock"
  printf '%s\n%s\n' "$snap_live_pid" "holder-live-$snap_live_pid" \
    > "$SESSION_FILE.lock/holder"
  chmod 600 "$SESSION_FILE.lock/holder"
  snap_live_aged=true
  if ! touch -t 202001010000 "$SESSION_FILE.lock" "$SESSION_FILE.lock/holder"; then
    snap_live_aged=false
    fail "state-snapshot mkdir fallback could not stage the aged live-holder adversary"
  fi
  snap_live_holder_before="$(cat "$SESSION_FILE.lock/holder")"
  PATH="$NOFLOCK_BIN" BUBBLES_AGENT_NAME="conc-agent-0" \
    BUBBLES_SESSION_LOCK_TIMEOUT_SECONDS=1 \
    bash "$SNAPSHOT" --phase phase-live-holder --mode start \
    --session-id "conc-0" \
    --session-control-file "${CTRLS[0]}" \
    --binding-packet-file "${PKTS[0]}" \
    > "$snap_live_out" 2>&1
  snap_live_rc=$?
  snap_live_turns="$(session_turn_count)"
  snap_live_holder_after="$(cat "$SESSION_FILE.lock/holder" 2>/dev/null || true)"
  if [[ "$snap_live_aged" == true && "$snap_live_rc" -eq 3 ]] \
    && [[ -d "$SESSION_FILE.lock" && "$snap_live_turns" == "0" ]] \
    && [[ "$snap_live_holder_after" == "$snap_live_holder_before" ]] \
    && grep -Fq 'SESSION_LOCK_TIMEOUT' "$snap_live_out" \
    && kill -0 "$snap_live_pid" 2>/dev/null; then
    pass "state-snapshot mkdir fallback reaches bounded refusal and preserves an aged live-holder lock"
  else
    fail "state-snapshot mkdir fallback did not refuse safely for an aged live holder (exit=$snap_live_rc/3 lockDirPresent=$([[ -d "$SESSION_FILE.lock" ]] && echo yes || echo no) turnSnapshots=$snap_live_turns/0 holderUnchanged=$([[ "$snap_live_holder_after" == "$snap_live_holder_before" ]] && echo yes || echo no) ownerAlive=$(kill -0 "$snap_live_pid" 2>/dev/null && echo yes || echo no))"
    cat "$snap_live_out"
  fi
  kill "$snap_live_pid" 2>/dev/null || true
  wait "$snap_live_pid" 2>/dev/null || true
  rm -rf "$SESSION_FILE.lock" 2>/dev/null || true

  # --- Sub-case F: malformed holder -> unprovable -> bounded refusal ---------
  # A missing or malformed ownership record is not evidence that the owner is
  # dead. The waiter must preserve both lock and session bytes through timeout.
  reset_session
  snap_unprovable_out="$TMP_ROOT/snapshot-unprovable-holder.out"
  snap_unprovable_before="$TMP_ROOT/snapshot-unprovable-before.json"
  printf '%s\n' '{"unrelated":{"preserve":"exact-prior-bytes"}}' > "$SESSION_FILE"
  cp "$SESSION_FILE" "$snap_unprovable_before"
  mkdir -p "$SESSION_FILE.lock"
  chmod 700 "$SESSION_FILE.lock"
  printf '%s\n' 'malformed-holder-without-token' > "$SESSION_FILE.lock/holder"
  chmod 600 "$SESSION_FILE.lock/holder"
  snap_unprovable_holder_before="$(cat "$SESSION_FILE.lock/holder")"
  PATH="$NOFLOCK_BIN" BUBBLES_AGENT_NAME="conc-agent-0" \
    BUBBLES_SESSION_LOCK_TIMEOUT_SECONDS=1 \
    bash "$SNAPSHOT" --phase phase-unprovable-holder --mode start \
    --session-id "conc-0" \
    --session-control-file "${CTRLS[0]}" \
    --binding-packet-file "${PKTS[0]}" \
    > "$snap_unprovable_out" 2>&1
  snap_unprovable_rc=$?
  snap_unprovable_holder_after="$(cat "$SESSION_FILE.lock/holder" 2>/dev/null || true)"
  if [[ "$snap_unprovable_rc" -eq 3 && -d "$SESSION_FILE.lock" ]] \
    && [[ "$snap_unprovable_holder_after" == "$snap_unprovable_holder_before" ]] \
    && cmp -s "$snap_unprovable_before" "$SESSION_FILE" \
    && grep -Fq 'SESSION_LOCK_TIMEOUT' "$snap_unprovable_out"; then
    pass "state-snapshot mkdir fallback refuses an unprovable holder and preserves exact prior bytes"
  else
    fail "state-snapshot mkdir fallback mishandled an unprovable holder (exit=$snap_unprovable_rc/3 lockDirPresent=$([[ -d "$SESSION_FILE.lock" ]] && echo yes || echo no) holderUnchanged=$([[ "$snap_unprovable_holder_after" == "$snap_unprovable_holder_before" ]] && echo yes || echo no) bytesUnchanged=$(cmp -s "$snap_unprovable_before" "$SESSION_FILE" && echo yes || echo no))"
    cat "$snap_unprovable_out"
  fi
  rm -rf "$SESSION_FILE.lock" 2>/dev/null || true
  reset_session
fi

# ===========================================================================

echo
echo "runtime concurrency selftest: $pass_count passed / $fail_count failed"
if [[ "$fail_count" -ne 0 ]]; then
  exit 1
fi
echo "runtime concurrency selftest passed."
exit 0
