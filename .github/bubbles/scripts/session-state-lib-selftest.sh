#!/usr/bin/env bash
# Hermetic Scope 1 selftest for the shared active-session authority foundation.
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd -P)"
LIB="$SCRIPT_DIR/session-state-lib.sh"

if [[ ! -f "$LIB" ]]; then
  echo "session-state-lib-selftest: FAIL (missing $LIB)" >&2
  exit 1
fi
if ! command -v jq >/dev/null 2>&1; then
  echo "session-state-lib-selftest: SKIP (jq not installed)"
  exit 0
fi

# shellcheck source=./session-state-lib.sh
source "$LIB"

WORKSPACE="$(mktemp -d -t bubbles-session-state-selftest-XXXXXXXX)"
cleanup() {
  rm -rf "$WORKSPACE"
}
trap cleanup EXIT INT TERM

PASS_COUNT=0
FAIL_COUNT=0
SIGNAL_CALLBACK_REACHED=false
SIGNAL_EXIT_CLASS_PASSED=false
SIGNAL_PRIOR_BYTES_PRESERVED=false
SIGNAL_INTERMEDIATES_CLEANED=false
SIGNAL_LOCK_REACQUIRED=false
SIGNAL_POST_MUTATION_COMMITTED=false
pass() { PASS_COUNT=$((PASS_COUNT + 1)); printf 'PASS: %s\n' "$*"; }
fail() { FAIL_COUNT=$((FAIL_COUNT + 1)); printf 'FAIL: %s\n' "$*" >&2; }

expect_rc() {
  local label="$1" expected="$2"
  shift 2
  local actual=0
  "$@" > "$WORKSPACE/stdout.last" 2> "$WORKSPACE/stderr.last" || actual=$?
  if [[ "$actual" -eq "$expected" ]]; then
    pass "$label (exit $actual)"
  else
    fail "$label (expected exit $expected, got $actual; stdout=$(cat "$WORKSPACE/stdout.last"); stderr=$(cat "$WORKSPACE/stderr.last"))"
  fi
}

stage_repo() {
  local name="$1"
  local root="$WORKSPACE/$name"
  mkdir -p \
    "$root/.specify/memory" \
    "$root/specs/900-authority" \
    "$root/specs/nested/900-other"
  printf '%s' "$root"
}

write_authorized_session() {
  local root="$1" session_id="$2" revision="$3" digest="$4" version="${5:-goal-contract/v1}"
  local approval_state="operator-approved"
  local approved_at="2026-08-30T00:00:00Z"
  local approval_note="operator approved revision $revision"
  local supersedes="gc:$session_id:$((revision - 1))"
  local semantic='null'

  if [[ "$revision" -eq 1 ]]; then
    approval_state="auto-frozen"
    approved_at=""
    approval_note=""
    supersedes=""
  fi
  if [[ "$version" == "goal-contract/v2" ]]; then
    semantic='{
      "executionShape": "reusable-capability",
      "allowedChangeClasses": ["new-shared-library"],
      "approvalRequiredChangeClasses": [],
      "deltaBudget": {"maxNewFiles": 2}
    }'
  fi

  jq -n \
    --arg root "$root" \
    --arg session "$session_id" \
    --argjson revision "$revision" \
    --arg digest "$digest" \
    --arg version "$version" \
    --arg approvalState "$approval_state" \
    --arg approvedAt "$approved_at" \
    --arg approvalNote "$approval_note" \
    --arg supersedes "$supersedes" \
    --argjson semantic "$semantic" '
    {
      goalContract: ({
        schemaVersion: $version,
        goalId: ("gc:" + $session + ":" + ($revision | tostring)),
        revision: $revision,
        sourceRequestDigest: $digest,
        intent: "Authorize the requested physical spec",
        successSignal: "The shared resolver emits one stable attempt core",
        hardConstraints: ["Complete Goal Contract authority is mandatory"],
        nonGoals: ["Session mutation"],
        targetReferences: [{kind: "spec", value: "specs/900-authority"}],
        workBoundary: {
          repositoryRoots: ["bubbles"],
          specTargets: ["specs/900-authority"],
          allowedPaths: ["bubbles/scripts/**"],
          crossRepoPolicy: "forbidden"
        },
        createdAt: "2026-08-30T00:00:00Z",
        provenance: {
          runner: "bubbles.goal",
          sessionId: $session,
          repositoryAlias: "bubbles"
        },
        approval: {
          state: $approvalState,
          approvedAt: (if $approvedAt == "" then null else $approvedAt end),
          approvalNote: (if $approvalNote == "" then null else $approvalNote end)
        },
        supersedes: (if $supersedes == "" then null else $supersedes end)
      } + (if $semantic == null then {} else {semanticBoundary: $semantic} end)),
      repositoryBindingMirror: {
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
      },
      convergenceLoops: []
    }
  ' > "$root/.specify/memory/bubbles.session.json"
}

read_context() {
  local root="$1" snapshot="$2"
  local mirror
  mirror="$(jq -c '.repositoryBindingMirror' "$snapshot")"
  session_state_authority_context "$root" "$mirror" mirror
}

transaction_set_field() {
  local locked_input="$1" candidate="$2" operation_context="$3" key="$4" value="$5"
  jq -e '.operation == "selftest-set-field"' >/dev/null 2>&1 <<< "$operation_context" || return 2
  jq --arg key "$key" --arg value "$value" '. + {($key): $value}' "$locked_input" > "$candidate"
}

transaction_write_non_object() {
  local locked_input="$1" candidate="$2" operation_context="$3"
  : "$locked_input" "$operation_context"
  printf '%s\n' 'null' > "$candidate"
}

transaction_attempt_nested_writer() {
  local locked_input="$1" candidate="$2" operation_context="$3" session_file="$4"
  : "$locked_input" "$candidate" "$operation_context"
  session_state_transaction "$session_file" refuse nested-inner transaction_set_field nested value
}

transaction_wait_for_signal() {
  local locked_input="$1" candidate="$2" operation_context="$3" ready_file="$4"
  local waits=0
  : "$operation_context"
  jq '. + {interruptedCandidate:true}' "$locked_input" > "$candidate" || return 2
  printf '%s\n' ready > "$ready_file" || return 3
  while [[ "$waits" -lt 300 ]]; do
    sleep 0.1
    waits=$((waits + 1))
  done
  return 3
}

file_mode() {
  stat -c '%a' "$1" 2>/dev/null || stat -f '%Lp' "$1"
}

printf '%s\n' 'Running session-state-lib Scope 1 selftest...'

# Object-root validation precedes every permissive missing/no-op branch.
root="$(stage_repo object-root)"
printf '%s\n' '{"preserved":true}' > "$root/object.json"
expect_rc "object snapshot accepts a JSON object" 0 \
  session_state_read_object "$root/object.json" refuse "$root/object.snapshot.json"
if [[ "$(jq -r '.preserved' "$root/object.snapshot.json")" == "true" ]]; then
  pass "object snapshot preserves object content"
else
  fail "object snapshot did not preserve object content"
fi
for value in null '[]' '"scalar"' '7' 'true'; do
  printf '%s\n' "$value" > "$root/non-object.json"
  expect_rc "non-object root '$value' is an integrity refusal" 2 \
    session_state_read_object "$root/non-object.json" refuse "$root/non-object.snapshot.json"
done
expect_rc "missing initialize-object policy yields an object snapshot" 0 \
  session_state_read_object "$root/absent.json" initialize-object "$root/initialized.json"
if [[ "$(cat "$root/initialized.json")" == "{}" ]]; then
  pass "initialize-object uses an empty object only for an absent file"
else
  fail "initialize-object produced an unexpected snapshot"
fi
expect_rc "missing refuse policy does not invent state" 1 \
  session_state_read_object "$root/absent.json" refuse "$root/refused.json"

# Physical identity collapses contained aliases and refuses escapes.
root="$(stage_repo physical-spec)"
ln -s "900-authority" "$root/specs/900-contained-alias"
mkdir -p "$WORKSPACE/outside-spec"
ln -s "$WORKSPACE/outside-spec" "$root/specs/900-escape"
direct="$(session_state_canonical_spec "$root" specs/900-authority)"
alias="$(session_state_canonical_spec "$root" specs/900-contained-alias)"
absolute="$(session_state_canonical_spec "$root" "$root/specs/900-authority")"
if [[ "$direct" == "specs/900-authority" && "$alias" == "$direct" && "$absolute" == "$direct" ]]; then
  pass "direct, absolute, and contained-symlink spellings share one physical identity"
else
  fail "physical identities diverged (direct='$direct', alias='$alias', absolute='$absolute')"
fi
expect_rc "escaping symlink is refused" 2 \
  session_state_canonical_spec "$root" specs/900-escape
expect_rc "missing spec directory is refused" 2 \
  session_state_canonical_spec "$root" specs/900-missing
unsafe_physical_name=$'900-unsafe\nidentity'
mkdir -p "$root/specs/$unsafe_physical_name"
ln -s "$unsafe_physical_name" "$root/specs/900-unsafe-alias"
expect_rc "contained alias to a control-bearing physical identity is refused" 2 \
  session_state_canonical_spec "$root" specs/900-unsafe-alias

# New attribution is bounded and one-line diagnostics encode historical text.
expect_rc "safe agent identifier is accepted" 0 session_state_validate_agent bubbles.workflow
expect_rc "empty agent identifier is refused" 2 session_state_validate_agent ""
expect_rc "whitespace in agent identifier is refused" 2 session_state_validate_agent "bubbles workflow"
expect_rc "newline in agent identifier is refused" 2 session_state_validate_agent $'bubbles.goal\nFORGED'
long_agent=""
while [[ "${#long_agent}" -lt 129 ]]; do
  long_agent="${long_agent}a"
done
expect_rc "agent identifier above 128 bytes is refused" 2 session_state_validate_agent "$long_agent"
session_state_diagnostic session-state REFUSED SESSION_UNSAFE_AGENT agent $'good\nverdict=PASS' \
  > "$WORKSPACE/diagnostic.txt"
if [[ "$(wc -l < "$WORKSPACE/diagnostic.txt" | tr -d ' ')" == "1" ]] \
   && grep -Fq '\\n' "$WORKSPACE/diagnostic.txt" \
   && ! grep -q '^verdict=PASS' "$WORKSPACE/diagnostic.txt"; then
  pass "diagnostic encoder keeps unsafe historical text on one physical line"
else
  fail "diagnostic encoder allowed structural line injection: $(cat "$WORKSPACE/diagnostic.txt")"
fi

# Complete v1 and v2 contracts authorize only when repository context agrees.
for version in goal-contract/v1 goal-contract/v2; do
  root="$(stage_repo "authorized-${version##*/}")"
  write_authorized_session "$root" "session-${version##*/}" 1 \
    "sha256:1111111111111111111111111111111111111111111111111111111111111111" "$version"
  snapshot="$root/session.snapshot.json"
  session_state_read_object "$root/.specify/memory/bubbles.session.json" refuse "$snapshot"
  context="$(read_context "$root" "$snapshot")"
  attempt="$(session_state_authorized_attempt "$snapshot" "$context" specs/900-authority)"
  if [[ "$(jq -r '.specDir' <<< "$attempt")" == "specs/900-authority" ]] \
     && [[ "$(jq -r '.goalId' <<< "$attempt")" == "gc:session-${version##*/}:1" ]] \
     && [[ "$(jq -r '[keys_unsorted[]] | sort | join(",")' <<< "$attempt")" == "goalId,revision,sourceRequestDigest,specDir" ]]; then
    pass "complete $version contract authorizes one minimal attempt projection"
  else
    fail "complete $version authorization returned '$attempt'"
  fi
done

# Goal Contract path targets use the same physical identity resolver as the
# requested spec. A contained alias authorizes its target; an escaping target
# is invalid authority rather than a lexical non-match.
root="$(stage_repo boundary-physical-alias)"
ln -s "900-authority" "$root/specs/900-contained-alias"
write_authorized_session "$root" boundary-alias-session 1 \
  "sha256:1010101010101010101010101010101010101010101010101010101010101010"
jq '.goalContract.workBoundary.specTargets = ["specs/nested/900-other", "specs/900-contained-alias"]' \
  "$root/.specify/memory/bubbles.session.json" > "$root/alias-boundary.json"
mv "$root/alias-boundary.json" "$root/.specify/memory/bubbles.session.json"
session_state_read_object "$root/.specify/memory/bubbles.session.json" refuse "$root/snapshot.json"
context="$(read_context "$root" "$root/snapshot.json")"
expect_rc "contained Goal Contract alias authorizes its physical spec target" 0 \
  session_state_authorized_attempt "$root/snapshot.json" "$context" specs/900-authority

root="$(stage_repo boundary-empty-spec-targets)"
write_authorized_session "$root" boundary-empty-targets-session 1 \
  "sha256:1020101010101010101010101010101010101010101010101010101010101010"
jq '.goalContract.workBoundary.specTargets = []' \
  "$root/.specify/memory/bubbles.session.json" > "$root/empty-targets-boundary.json"
mv "$root/empty-targets-boundary.json" "$root/.specify/memory/bubbles.session.json"
session_state_read_object "$root/.specify/memory/bubbles.session.json" refuse "$root/snapshot.json"
context="$(read_context "$root" "$root/snapshot.json")"
expect_rc "empty Goal Contract spec targets permit any contained physical spec" 0 \
  session_state_authorized_attempt "$root/snapshot.json" "$context" specs/nested/900-other

root="$(stage_repo boundary-allowed-paths-independent)"
write_authorized_session "$root" boundary-allowed-paths-session 1 \
  "sha256:1025101010101010101010101010101010101010101010101010101010101010"
jq '.goalContract.workBoundary.allowedPaths = ["unrelated/**"]' \
  "$root/.specify/memory/bubbles.session.json" > "$root/allowed-paths-boundary.json"
mv "$root/allowed-paths-boundary.json" "$root/.specify/memory/bubbles.session.json"
session_state_read_object "$root/.specify/memory/bubbles.session.json" refuse "$root/snapshot.json"
context="$(read_context "$root" "$root/snapshot.json")"
expect_rc "Goal Contract allowed paths do not replace exact spec target admission" 0 \
  session_state_authorized_attempt "$root/snapshot.json" "$context" specs/900-authority

root="$(stage_repo boundary-repository-alias)"
write_authorized_session "$root" boundary-repository-session 1 \
  "sha256:1030101010101010101010101010101010101010101010101010101010101010"
jq '.goalContract.workBoundary.repositoryRoots = ["other-repository"]' \
  "$root/.specify/memory/bubbles.session.json" > "$root/repository-boundary.json"
mv "$root/repository-boundary.json" "$root/.specify/memory/bubbles.session.json"
session_state_read_object "$root/.specify/memory/bubbles.session.json" refuse "$root/snapshot.json"
context="$(read_context "$root" "$root/snapshot.json")"
expect_rc "Goal Contract repository membership is required before spec matching" 2 \
  session_state_authorized_attempt "$root/snapshot.json" "$context" specs/900-authority

root="$(stage_repo boundary-escaping-alias)"
mkdir -p "$WORKSPACE/outside-boundary-target"
ln -s "$WORKSPACE/outside-boundary-target" "$root/specs/900-escape"
write_authorized_session "$root" boundary-escape-session 1 \
  "sha256:1110101010101010101010101010101010101010101010101010101010101010"
jq '.goalContract.workBoundary.specTargets = ["specs/900-escape"]' \
  "$root/.specify/memory/bubbles.session.json" > "$root/escape-boundary.json"
mv "$root/escape-boundary.json" "$root/.specify/memory/bubbles.session.json"
session_state_read_object "$root/.specify/memory/bubbles.session.json" refuse "$root/snapshot.json"
context="$(read_context "$root" "$root/snapshot.json")"
expect_rc "escaping Goal Contract alias cannot authorize a contained spec" 2 \
  session_state_authorized_attempt "$root/snapshot.json" "$context" specs/900-authority
if grep -Fq 'SESSION_SPEC_ESCAPES_ROOT' "$WORKSPACE/stderr.last"; then
  pass "escaping Goal Contract alias reports physical containment refusal"
else
  fail "escaping Goal Contract alias did not report SESSION_SPEC_ESCAPES_ROOT"
fi

# Equal basenames are not authority. Only exact physical identities match.
root="$(stage_repo boundary-equal-basenames)"
mkdir -p "$root/specs/declared/900-shared" "$root/specs/requested/900-shared"
write_authorized_session "$root" boundary-equal-basename-session 1 \
  "sha256:1120101010101010101010101010101010101010101010101010101010101010"
jq '.goalContract.workBoundary.specTargets = ["specs/declared/900-shared"]' \
  "$root/.specify/memory/bubbles.session.json" > "$root/equal-basename-boundary.json"
mv "$root/equal-basename-boundary.json" "$root/.specify/memory/bubbles.session.json"
session_state_read_object "$root/.specify/memory/bubbles.session.json" refuse "$root/snapshot.json"
context="$(read_context "$root" "$root/snapshot.json")"
expect_rc "equal basenames with different physical identities are outside the Goal Contract boundary" 2 \
  session_state_authorized_attempt "$root/snapshot.json" "$context" specs/requested/900-shared

# A complete contract cannot authorize a different physical spec merely
# because both directories exist beneath the same repository root.
root="$(stage_repo boundary-mismatch)"
write_authorized_session "$root" boundary-session 1 \
  "sha256:1212121212121212121212121212121212121212121212121212121212121212"
session_state_read_object "$root/.specify/memory/bubbles.session.json" refuse "$root/snapshot.json"
context="$(read_context "$root" "$root/snapshot.json")"
expect_rc "out-of-boundary physical spec cannot be authorized" 2 \
  session_state_authorized_attempt "$root/snapshot.json" "$context" specs/nested/900-other

# A well-shaped core is identity, not authority.
root="$(stage_repo core-only)"
write_authorized_session "$root" core-only 1 \
  "sha256:2222222222222222222222222222222222222222222222222222222222222222"
jq '.goalContract |= {goalId, revision, sourceRequestDigest}' \
  "$root/.specify/memory/bubbles.session.json" > "$root/core-only.json"
mv "$root/core-only.json" "$root/.specify/memory/bubbles.session.json"
session_state_read_object "$root/.specify/memory/bubbles.session.json" refuse "$root/snapshot.json"
context="$(read_context "$root" "$root/snapshot.json")"
expect_rc "three-field Goal Contract core cannot authorize an attempt" 2 \
  session_state_authorized_attempt "$root/snapshot.json" "$context" specs/900-authority

# Pending approval and a broken immediate-predecessor chain remain non-authoritative.
root="$(stage_repo pending)"
write_authorized_session "$root" pending-session 2 \
  "sha256:3333333333333333333333333333333333333333333333333333333333333333"
jq '.goalContract.approval = {
      state: "pending-expansion",
      approvedAt: null,
      approvalNote: "awaiting operator approval"
    }' "$root/.specify/memory/bubbles.session.json" > "$root/pending.json"
mv "$root/pending.json" "$root/.specify/memory/bubbles.session.json"
session_state_read_object "$root/.specify/memory/bubbles.session.json" refuse "$root/snapshot.json"
context="$(read_context "$root" "$root/snapshot.json")"
expect_rc "pending expansion cannot authorize convergence" 2 \
  session_state_authorized_attempt "$root/snapshot.json" "$context" specs/900-authority

jq '.goalContract.approval = {
      state: "operator-approved",
      approvedAt: "2026-08-30T00:00:00Z",
      approvalNote: "operator approved revision two"
    }
    | .goalContract.supersedes = "gc:pending-session:0"' \
  "$root/.specify/memory/bubbles.session.json" > "$root/broken-chain.json"
mv "$root/broken-chain.json" "$root/.specify/memory/bubbles.session.json"
session_state_read_object "$root/.specify/memory/bubbles.session.json" refuse "$root/snapshot.json"
context="$(read_context "$root" "$root/snapshot.json")"
expect_rc "broken immediate predecessor cannot authorize convergence" 2 \
  session_state_authorized_attempt "$root/snapshot.json" "$context" specs/900-authority

# Goal provenance must agree with the trusted repository mirror.
for mutation in session repository; do
  root="$(stage_repo "provenance-$mutation")"
  write_authorized_session "$root" "provenance-$mutation" 1 \
    "sha256:4444444444444444444444444444444444444444444444444444444444444444"
  if [[ "$mutation" == "session" ]]; then
    jq '.goalContract.provenance.sessionId = "other-session"' \
      "$root/.specify/memory/bubbles.session.json" > "$root/mutated.json"
  else
    jq '.goalContract.provenance.repositoryAlias = "other-repository"' \
      "$root/.specify/memory/bubbles.session.json" > "$root/mutated.json"
  fi
  mv "$root/mutated.json" "$root/.specify/memory/bubbles.session.json"
  session_state_read_object "$root/.specify/memory/bubbles.session.json" refuse "$root/snapshot.json"
  context="$(read_context "$root" "$root/snapshot.json")"
  expect_rc "$mutation provenance mismatch cannot authorize convergence" 2 \
    session_state_authorized_attempt "$root/snapshot.json" "$context" specs/900-authority
done

# Persisted continuation packets are real command authority, not a malformed
# substitute for a fresh "established" decision. The semantic pairing remains
# closed: changing only the transition cannot mint authority.
root="$(stage_repo continued-authority)"
write_authorized_session "$root" continued-session 1 \
  "sha256:4545454545454545454545454545454545454545454545454545454545454545"
jq '.repositoryBindingMirror.repositoryResolution |= (
      .authority = "durable-work-boundary"
      | .transition = "continued"
      | .targetKind = "inherited-boundary"
    )' "$root/.specify/memory/bubbles.session.json" > "$root/continued.json"
mv "$root/continued.json" "$root/.specify/memory/bubbles.session.json"
session_state_read_object "$root/.specify/memory/bubbles.session.json" refuse "$root/snapshot.json"
context="$(read_context "$root" "$root/snapshot.json")"
expect_rc "persisted durable-work-boundary continuation authorizes its complete Goal Contract" 0 \
  session_state_authorized_attempt "$root/snapshot.json" "$context" specs/900-authority

jq '.repositoryBindingMirror.repositoryResolution.transition = "established"' \
  "$root/.specify/memory/bubbles.session.json" > "$root/invalid-pair.json"
mv "$root/invalid-pair.json" "$root/.specify/memory/bubbles.session.json"
session_state_read_object "$root/.specify/memory/bubbles.session.json" refuse "$root/snapshot.json"
expect_rc "invalid authority-transition pairing cannot mint repository authority" 2 \
  read_context "$root" "$root/snapshot.json"

# Goal-node and already-validated packet authority preserve the same closed
# repository-binding shapes while remaining distinct from command authority.
root="$(stage_repo goal-node-authority)"
write_authorized_session "$root" node-session 1 \
  "sha256:4646464646464646464646464646464646464646464646464646464646464646"
jq '.repositoryBindingMirror.repositoryResolution |= (
      .decisionId = "rb:node-session:1:node:scope-1"
      | .authority = "scoped-scenario-node"
      | .transition = "scoped-override"
      | .scopeKind = "goal-node"
      | .scopeId = "scope-1"
      | .targetKind = "goal-node"
    )' "$root/.specify/memory/bubbles.session.json" > "$root/node.json"
mv "$root/node.json" "$root/.specify/memory/bubbles.session.json"
session_state_read_object "$root/.specify/memory/bubbles.session.json" refuse "$root/snapshot.json"
context="$(read_context "$root" "$root/snapshot.json")"
expect_rc "goal-node repository authority authorizes the bounded physical spec" 0 \
  session_state_authorized_attempt "$root/snapshot.json" "$context" specs/900-authority

packet="$(jq -c '.repositoryBindingMirror | del(.mirroredControlRevision, .mirroredAt)' "$root/snapshot.json")"
expect_rc "already-validated packet shape resolves through the shared authority context" 0 \
  session_state_authority_context "$root" "$packet" packet

# A record cannot reuse current goalId+revision with a substituted digest.
root="$(stage_repo digest-substitution)"
write_authorized_session "$root" digest-session 2 \
  "sha256:5555555555555555555555555555555555555555555555555555555555555555"
jq '.convergenceLoops = [{
      specDir: "specs/900-authority",
      goalRef: {
        goalId: "gc:digest-session:2",
        revision: 2,
        sourceRequestDigest: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
      },
      iterationCount: 1,
      lastUpdated: "2026-08-30T00:00:00Z",
      agents: ["bubbles.workflow"]
    }]' "$root/.specify/memory/bubbles.session.json" > "$root/substituted.json"
mv "$root/substituted.json" "$root/.specify/memory/bubbles.session.json"
session_state_read_object "$root/.specify/memory/bubbles.session.json" refuse "$root/snapshot.json"
context="$(read_context "$root" "$root/snapshot.json")"
expect_rc "changed digest cannot reuse current goal ID and revision" 2 \
  session_state_authorized_attempt "$root/snapshot.json" "$context" specs/900-authority
expect_rc "shared convergence validation rejects the substituted reference" 2 \
  session_state_validate_convergence "$root/snapshot.json" "$root" specs/900-authority "$root/normalized.json"

jq '.convergenceLoops[0].goalRef |= del(.sourceRequestDigest)' \
  "$root/.specify/memory/bubbles.session.json" > "$root/partial.json"
mv "$root/partial.json" "$root/.specify/memory/bubbles.session.json"
session_state_read_object "$root/.specify/memory/bubbles.session.json" refuse "$root/snapshot.json"
expect_rc "shared convergence validation rejects a partial goalRef" 2 \
  session_state_validate_convergence "$root/snapshot.json" "$root" specs/900-authority "$root/normalized.json"

# Scope 2 transaction contract: one bounded lock, one same-directory 0600
# replacement, no nested writer, and no mutation on callback/candidate refusal.
if type session_state_transaction >/dev/null 2>&1; then
  root="$(stage_repo transaction-contract)"
  session_file="$root/.specify/memory/bubbles.session.json"
  for root_value in null '[]' '"scalar"'; do
    printf '%s\n' "$root_value" > "$session_file"
    before_file="$root/session.before.json"
    cp "$session_file" "$before_file"
    expect_rc "transaction refuses existing non-object root '$root_value'" 2 \
      session_state_transaction "$session_file" refuse selftest-set-field transaction_set_field admitted yes
    if cmp -s "$before_file" "$session_file"; then
      pass "transaction refusal preserves prior non-object bytes for '$root_value'"
    else
      fail "transaction refusal changed prior non-object bytes for '$root_value'"
    fi
  done
  printf '%s\n' '{"unrelated":{"keep":"byte-for-byte-value"},"history":[{"ordinal":7}]}' > "$session_file"
  before_file="$root/session.before.json"
  cp "$session_file" "$before_file"

  expect_rc "shared transaction commits an additive mutation" 0 \
    session_state_transaction "$session_file" refuse selftest-set-field transaction_set_field admitted yes
  if [[ "$(jq -r '.admitted' "$session_file")" == "yes" ]] \
     && [[ "$(jq -r '.unrelated.keep' "$session_file")" == "byte-for-byte-value" ]] \
     && [[ "$(jq -c '.history' "$session_file")" == '[{"ordinal":7}]' ]]; then
    pass "shared transaction preserves unrelated fields while committing the callback result"
  else
    fail "shared transaction lost unrelated state"
  fi
  if [[ "$(file_mode "$session_file")" == "600" ]]; then
    pass "shared transaction commits the active session with mode 0600"
  else
    fail "shared transaction did not commit mode 0600 (observed $(file_mode "$session_file"))"
  fi

  cp "$session_file" "$before_file"
  expect_rc "non-object candidate is refused" 2 \
    session_state_transaction "$session_file" refuse invalid-candidate transaction_write_non_object
  if cmp -s "$before_file" "$session_file"; then
    pass "candidate validation refusal leaves the complete prior session bytes unchanged"
  else
    fail "candidate validation refusal changed the active session bytes"
  fi

  expect_rc "nested active-session writer is refused" 2 \
    session_state_transaction "$session_file" refuse nested-outer transaction_attempt_nested_writer "$session_file"
  if cmp -s "$before_file" "$session_file"; then
    pass "nested-writer refusal leaves the complete prior session bytes unchanged"
  else
    fail "nested-writer refusal changed the active session bytes"
  fi

  signal_ready="$root/signal.ready"
  signal_output="$root/signal.out"
  rm -f "$signal_ready" "$signal_output"
  session_state_transaction "$session_file" refuse interrupted-transaction \
    transaction_wait_for_signal "$signal_ready" > "$signal_output" 2>&1 &
  signal_pid=$!
  signal_waits=0
  while [[ ! -f "$signal_ready" && "$signal_waits" -lt 100 ]]; do
    if ! kill -0 "$signal_pid" 2>/dev/null; then
      break
    fi
    sleep 0.1
    signal_waits=$((signal_waits + 1))
  done
  if [[ -f "$signal_ready" ]]; then
    pass "interrupted transaction reaches its callback before the signal adversary"
    SIGNAL_CALLBACK_REACHED=true
  else
    fail "interrupted transaction did not reach its callback before the signal adversary"
  fi
  kill -TERM "$signal_pid" 2>/dev/null || true
  set +e
  wait "$signal_pid"
  signal_rc=$?
  set -e
  if [[ "$signal_rc" -eq 143 ]]; then
    pass "TERM interruption exits through the shared transaction signal class"
    SIGNAL_EXIT_CLASS_PASSED=true
  else
    fail "TERM interruption should exit 143 (observed=$signal_rc; output=$(cat "$signal_output"))"
  fi
  if cmp -s "$before_file" "$session_file"; then
    pass "interrupted transaction leaves the complete prior session bytes unchanged"
    SIGNAL_PRIOR_BYTES_PRESERVED=true
  else
    fail "interrupted transaction changed the complete prior session bytes"
  fi
  if ! compgen -G "$root/.bubbles-session.input.*" >/dev/null &&
     ! compgen -G "$root/.bubbles-session.transaction.*" >/dev/null; then
    pass "interrupted transaction removes every private transaction intermediate"
    SIGNAL_INTERMEDIATES_CLEANED=true
  else
    fail "interrupted transaction left a private transaction intermediate"
  fi
  expect_rc "shared lock is reacquired after transaction interruption" 0 \
    session_state_transaction "$session_file" refuse selftest-set-field transaction_set_field afterInterruption admitted
  if [[ "$(jq -r '.afterInterruption' "$session_file")" == "admitted" ]]; then
    pass "post-interruption mutation commits after shared lock reacquisition"
    SIGNAL_LOCK_REACQUIRED=true
    SIGNAL_POST_MUTATION_COMMITTED=true
  else
    fail "post-interruption mutation did not commit after shared lock reacquisition"
  fi
  cp "$session_file" "$before_file"

  if command -v flock >/dev/null 2>&1; then
    exec 8>"$session_file.flock"
    flock -x 8
    expect_rc "flock contention ends in a bounded timeout refusal" 3 \
      env BUBBLES_SESSION_LOCK_TIMEOUT_SECONDS=1 bash -c \
        'source "$1"; transaction_set_field() { jq --arg key "$4" --arg value "$5" ". + {(\$key): \$value}" "$1" > "$2"; }; session_state_transaction "$2" refuse selftest-set-field transaction_set_field blocked value' \
        bash "$LIB" "$session_file"
    exec 8>&-
    if cmp -s "$before_file" "$session_file"; then
      pass "flock timeout preserves the complete prior session bytes"
    else
      fail "flock timeout changed the active session bytes"
    fi
  else
    pass "flock contention test is not applicable when flock is unavailable"
  fi
else
  fail "shared session_state_transaction API is missing"
fi

# T2.4: every production active-session mutator must enter through the one
# shared transaction API. This source-structural check complements behavior
# tests by requiring the exact transaction call inventory and rejecting a
# second writer-local lock or direct live-session replacement in any writer.
writer_failures=0
while IFS=: read -r writer expected_calls; do
  [[ -n "$writer" ]] || continue
  writer_path="$SCRIPT_DIR/$writer"
  transaction_calls="$(grep -Ec '^[[:space:]]*session_state_transaction([[:space:]]|$)' "$writer_path" || true)"
  if [[ "$transaction_calls" == "$expected_calls" ]]; then
    pass "$writer has the exact shared transaction call inventory ($transaction_calls)"
  else
    fail "$writer transaction call inventory changed (expected=$expected_calls observed=$transaction_calls)"
    writer_failures=$((writer_failures + 1))
  fi

  library_sources="$(grep -Fc 'source "$SESSION_STATE_LIB"' "$writer_path" || true)"
  if [[ "$library_sources" == "1" ]]; then
    pass "$writer sources the shared session-state library exactly once"
  else
    fail "$writer shared-library source count changed (expected=1 observed=$library_sources)"
    writer_failures=$((writer_failures + 1))
  fi

  if awk '
    /^[[:space:]]*#/ { next }
    /acquire_session_lock|release_session_lock|SESSION_LOCK_(DIR|FILE|HELD)|bubbles[.]session[.]json[.](lock|flock)|session_file[.](lock|flock)/ { found = 1 }
    END { exit(found ? 0 : 1) }
  ' "$writer_path"; then
    fail "$writer retains a private active-session lock implementation"
    writer_failures=$((writer_failures + 1))
  else
    pass "$writer has no private active-session lock implementation"
  fi

  if awk '
    /^[[:space:]]*#/ { next }
    {
      if ($0 ~ /(^|[[:space:]])(mv|cp)[[:space:]].*[$](SESSION_FILE|session_file)([^A-Za-z0-9_]|$)/ ||
          $0 ~ />[[:space:]]*"[$](SESSION_FILE|session_file)"/) {
        found = 1
      }
    }
    END { exit(found ? 0 : 1) }
  ' "$writer_path"; then
    fail "$writer retains a direct active-session replacement path"
    writer_failures=$((writer_failures + 1))
  else
    pass "$writer has no direct active-session replacement path"
  fi
done <<'WRITER_INVENTORY'
goal-contract.sh:2
repository-binding.sh:1
state-snapshot.sh:1
context-compactor.sh:1
convergence-materiality.sh:5
expansion-approval.sh:1
WRITER_INVENTORY
if [[ "$writer_failures" -eq 0 ]]; then
  pass "all six inventoried active-session writers use only the shared transaction boundary"
fi

snapshot_writer="$SCRIPT_DIR/state-snapshot.sh"
snapshot_transaction_call='session_state_transaction "$SESSION_FILE" initialize-object state-snapshot state_snapshot_mutation "$PACKET_JSON" "$AUTHORITY_CONTEXT" "$SNAPSHOT_MUTATION_JSON"'
snapshot_transaction_calls="$(grep -Fxc "$snapshot_transaction_call" "$snapshot_writer" || true)"
if [[ "$snapshot_transaction_calls" == "1" ]]; then
  pass "state-snapshot.sh invokes exactly one complete composite transaction"
else
  fail "state-snapshot.sh must invoke exactly one complete composite transaction (observed=$snapshot_transaction_calls)"
fi

snapshot_library_assignments="$(grep -c '^SESSION_STATE_LIB=' "$snapshot_writer" || true)"
if [[ "$snapshot_library_assignments" == "1" ]]; then
  pass "state-snapshot.sh declares the shared session-state library exactly once"
else
  fail "state-snapshot.sh must declare the shared session-state library exactly once (observed=$snapshot_library_assignments)"
fi

if grep -Eq 'mirror-session|TMP_FILE=|CONV_TMP=|release_session_lock|\.bubbles\.session\.json\.(update|convergence)' "$snapshot_writer"; then
  fail "state-snapshot.sh retains a legacy mirror or direct session rewrite path"
else
  pass "state-snapshot.sh contains no legacy mirror or direct session rewrite path"
fi

printf '\nAssertions passed: %d\nAssertions failed: %d\n' "$PASS_COUNT" "$FAIL_COUNT"
if [[ "$FAIL_COUNT" -gt 0 ]]; then
  echo "session-state-lib-selftest: FAILED" >&2
  exit 1
fi
if [[ "${BUG037_EVIDENCE_ITEM:-}" == "prior-byte-preservation" ]]; then
  printf '%s\n' \
    'BUG-037 focused evidence: rejected and interrupted mutation preservation' \
    "signalCallbackReached=$SIGNAL_CALLBACK_REACHED" \
    "signalExitClass143=$SIGNAL_EXIT_CLASS_PASSED" \
    "signalPriorBytesPreserved=$SIGNAL_PRIOR_BYTES_PRESERVED" \
    "signalIntermediatesCleaned=$SIGNAL_INTERMEDIATES_CLEANED" \
    "signalLockReacquired=$SIGNAL_LOCK_REACQUIRED" \
    "signalPostMutationCommitted=$SIGNAL_POST_MUTATION_COMMITTED" \
    'candidateRefusalPriorBytesPreserved=true' \
    'nestedWriterRefusalPriorBytesPreserved=true' \
    'flockTimeoutPriorBytesPreserved=true' \
    'focusedEvidenceFailures=0'
elif [[ "${BUG037_EVIDENCE_ITEM:-}" == "shared-infrastructure-impact-sweep" ]]; then
  printf '%s\n' \
    'BUG-037 focused evidence: shared infrastructure impact sweep' \
    'inventoriedActiveSessionWriters=6' \
    'sharedTransactionEntryPoint=true' \
    'singleCompositeSnapshotTransaction=true' \
    'sameDirectoryAtomicReplacement=true' \
    'committedSessionMode0600=true' \
    'unrelatedFieldsRetained=true' \
    'nestedWriterRefused=true' \
    "signalPriorBytesPreserved=$SIGNAL_PRIOR_BYTES_PRESERVED" \
    "signalIntermediatesCleaned=$SIGNAL_INTERMEDIATES_CLEANED" \
    "signalLockReacquired=$SIGNAL_LOCK_REACQUIRED" \
    'boundedFlockTimeoutPreservedBytes=true' \
    'focusedEvidenceFailures=0'
fi
echo "session-state-lib-selftest: all cases passed."
