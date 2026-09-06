#!/usr/bin/env bash
# Shared active-session authority, validation, and mutation foundation
# (BUG-037 Scopes 1-2).
#
# This file is sourced by session-state readers. It deliberately contains no
# command dispatcher and no caller-selectable attempt identity. Public functions
# include object snapshots, one bounded transaction, physical spec identity,
# complete Goal Contract authority, convergence-record validation, safe
# attribution, and one-line diagnostics.

[[ -n "${_BUBBLES_SESSION_STATE_LIB_SOURCED:-}" ]] && return 0
_BUBBLES_SESSION_STATE_LIB_SOURCED=1

_SESSION_STATE_GOAL_V1="goal-contract/v1"
_SESSION_STATE_GOAL_V2="goal-contract/v2"
_SESSION_STATE_AGENT_PATTERN='^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$'
_SESSION_STATE_TOKEN_PATTERN='^[A-Za-z0-9][A-Za-z0-9._-]*$'
_SESSION_STATE_CODE_PATTERN='^[A-Z][A-Z0-9_-]*$'
_SESSION_STATE_RFC3339_PATTERN='^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$'
_SESSION_STATE_LOCK_TIMEOUT_DEFAULT=120

_SESSION_STATE_LOCK_MODE=""
_SESSION_STATE_LOCK_FILE=""
_SESSION_STATE_LOCK_DIR=""
_SESSION_STATE_LOCK_HOLDER=""
_SESSION_STATE_LOCK_RECOVERY=""
_SESSION_STATE_LOCK_TOKEN=""
_SESSION_STATE_LOCK_HELD=false
_SESSION_STATE_TRANSACTION_INPUT=""
_SESSION_STATE_TRANSACTION_CANDIDATE=""

_session_state_require_jq() {
  if command -v jq >/dev/null 2>&1; then
    return 0
  fi
  printf '%s\n' 'session-state verdict=REFUSED code=SESSION_JQ_REQUIRED message="jq is required but not found in PATH"' >&2
  return 2
}

_session_state_json_encode() {
  local value="${1-}"
  if command -v jq >/dev/null 2>&1; then
    jq -cn --arg value "$value" '$value'
    return $?
  fi

  # Diagnostics must remain one physical line even when jq is unavailable.
  # This fallback covers every control that Bash can carry in an argument; NUL
  # cannot occur in a shell variable.
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  value="${value//$'\n'/\\n}"
  value="${value//$'\r'/\\r}"
  value="${value//$'\t'/\\t}"
  value="${value//$'\b'/\\b}"
  value="${value//$'\f'/\\f}"
  value="${value//$'\033'/\\u001b}"
  printf '"%s"' "$value"
}

# session_state_diagnostic <component> <verdict> <code> [<key> <value>]...
# Emit exactly one physical line. Values are JSON strings so embedded controls
# remain visible text and cannot add fields or verdict lines.
session_state_diagnostic() {
  local component="${1-}" verdict="${2-}" code="${3-}"
  if [[ $# -lt 3 ]]; then
    printf '%s\n' 'session-state verdict=REFUSED code=SESSION_DIAGNOSTIC_USAGE message="component, verdict, and code are required"' >&2
    return 2
  fi
  shift 3

  if [[ ! "$component" =~ $_SESSION_STATE_TOKEN_PATTERN ]] ||
    [[ ! "$verdict" =~ ^(PASS|VIOLATION|REFUSED)$ ]] ||
    [[ ! "$code" =~ $_SESSION_STATE_CODE_PATTERN ]] ||
    (( $# % 2 != 0 )); then
    printf '%s\n' 'session-state verdict=REFUSED code=SESSION_DIAGNOSTIC_USAGE message="invalid diagnostic structure"' >&2
    return 2
  fi

  local line="$component verdict=$verdict code=$code" key value encoded
  while [[ $# -gt 0 ]]; do
    key="$1"
    value="$2"
    shift 2
    if [[ ! "$key" =~ $_SESSION_STATE_TOKEN_PATTERN ]]; then
      printf '%s\n' 'session-state verdict=REFUSED code=SESSION_DIAGNOSTIC_USAGE message="invalid diagnostic key"' >&2
      return 2
    fi
    encoded="$(_session_state_json_encode "$value")" || return 2
    encoded="${encoded//\\/\\\\}"
    line="$line $key=$encoded"
  done
  printf '%s\n' "$line"
}

_session_state_refuse() {
  local code="$1" message="$2"
  shift 2
  session_state_diagnostic session-state REFUSED "$code" message "$message" "$@" >&2
}

_session_state_validate_snapshot() {
  local snapshot="$1"
  if [[ ! -f "$snapshot" ]]; then
    _session_state_refuse SESSION_SNAPSHOT_MISSING "session snapshot does not exist" path "$snapshot"
    return 2
  fi
  if ! jq empty "$snapshot" >/dev/null 2>&1; then
    _session_state_refuse SESSION_INVALID_JSON "session snapshot is not valid JSON" path "$snapshot"
    return 2
  fi
  if ! jq -e 'type == "object"' "$snapshot" >/dev/null 2>&1; then
    _session_state_refuse SESSION_ROOT_NOT_OBJECT "session JSON root must be an object" path "$snapshot"
    return 2
  fi
  return 0
}

# session_state_read_object <session-file> <missing-policy> <destination>
# Missing policies are explicit: initialize-object, no-state, no-op, refuse.
session_state_read_object() {
  _session_state_require_jq || return $?
  if [[ $# -ne 3 ]]; then
    _session_state_refuse SESSION_READ_USAGE "read-object requires session file, missing policy, and destination"
    return 2
  fi

  local session_file="$1" missing_policy="$2" destination="$3"
  case "$missing_policy" in
    initialize-object|no-state|no-op|refuse) ;;
    *)
      _session_state_refuse SESSION_MISSING_POLICY "unknown missing-file policy" policy "$missing_policy"
      return 2
      ;;
  esac

  if [[ ! -e "$session_file" ]]; then
    case "$missing_policy" in
      initialize-object)
        if ! printf '{}\n' > "$destination"; then
          _session_state_refuse SESSION_SNAPSHOT_WRITE_FAILED "could not write initialized object snapshot" path "$destination"
          return 3
        fi
        return 0
        ;;
      no-op)
        return 0
        ;;
      no-state)
        _session_state_refuse SESSION_NO_STATE "session file is absent" path "$session_file"
        return 1
        ;;
      refuse)
        _session_state_refuse SESSION_MISSING "required session file is absent" path "$session_file"
        return 1
        ;;
    esac
  fi

  if [[ ! -f "$session_file" ]]; then
    _session_state_refuse SESSION_NOT_REGULAR_FILE "session path is not a regular file" path "$session_file"
    return 2
  fi
  if ! jq empty "$session_file" >/dev/null 2>&1; then
    _session_state_refuse SESSION_INVALID_JSON "session file is not valid JSON" path "$session_file"
    return 2
  fi
  if ! jq -e 'type == "object"' "$session_file" >/dev/null 2>&1; then
    _session_state_refuse SESSION_ROOT_NOT_OBJECT "session JSON root must be an object" path "$session_file"
    return 2
  fi
  if ! cp "$session_file" "$destination"; then
    _session_state_refuse SESSION_SNAPSHOT_WRITE_FAILED "could not copy immutable object snapshot" path "$destination"
    return 3
  fi
  return 0
}

_session_state_lock_timeout_seconds() {
  local value
  if [[ "${BUBBLES_SESSION_LOCK_TIMEOUT_SECONDS+x}" == "x" ]]; then
    value="$BUBBLES_SESSION_LOCK_TIMEOUT_SECONDS"
    case "$value" in
      ''|*[!0-9]*)
        _session_state_refuse SESSION_LOCK_TIMEOUT_CONFIG "lock timeout must be an integer from 1 through 120" value "$value"
        return 2
        ;;
    esac
    if [[ "$value" -lt 1 || "$value" -gt "$_SESSION_STATE_LOCK_TIMEOUT_DEFAULT" ]]; then
      _session_state_refuse SESSION_LOCK_TIMEOUT_CONFIG "lock timeout must be an integer from 1 through 120" value "$value"
      return 2
    fi
  else
    value="$_SESSION_STATE_LOCK_TIMEOUT_DEFAULT"
  fi
  printf '%s' "$value"
}

_session_state_now_epoch() {
  local now
  now="$(date -u '+%s' 2>/dev/null)" || return 1
  case "$now" in
    ''|*[!0-9]*) return 1 ;;
  esac
  printf '%s' "$now"
}

_session_state_lock_timed_out() {
  local started="$1" timeout="$2" now
  now="$(_session_state_now_epoch)" || return 0
  [[ $((now - started)) -ge "$timeout" ]]
}

_session_state_release_lock() {
  [[ "$_SESSION_STATE_LOCK_HELD" == true ]] || return 0

  if [[ "$_SESSION_STATE_LOCK_MODE" == "flock" ]]; then
    exec 9>&- || true
  elif [[ "$_SESSION_STATE_LOCK_MODE" == "mkdir" ]]; then
    if [[ -f "$_SESSION_STATE_LOCK_HOLDER" && ! -L "$_SESSION_STATE_LOCK_HOLDER" ]]; then
      local recorded_pid recorded_token line_count
      recorded_pid="$(sed -n '1p' "$_SESSION_STATE_LOCK_HOLDER" 2>/dev/null || true)"
      recorded_token="$(sed -n '2p' "$_SESSION_STATE_LOCK_HOLDER" 2>/dev/null || true)"
      line_count="$(awk 'END { print NR + 0 }' "$_SESSION_STATE_LOCK_HOLDER" 2>/dev/null || true)"
      if [[ "$line_count" == "2" && "$recorded_pid" == "$$" && "$recorded_token" == "$_SESSION_STATE_LOCK_TOKEN" ]]; then
        rm -f "$_SESSION_STATE_LOCK_HOLDER" 2>/dev/null || true
        rmdir "$_SESSION_STATE_LOCK_DIR" 2>/dev/null || true
      fi
    fi
  fi

  _SESSION_STATE_LOCK_MODE=""
  _SESSION_STATE_LOCK_TOKEN=""
  _SESSION_STATE_LOCK_HELD=false
}

_session_state_cleanup_transaction_files() {
  [[ -z "$_SESSION_STATE_TRANSACTION_INPUT" ]] || rm -f "$_SESSION_STATE_TRANSACTION_INPUT" 2>/dev/null || true
  [[ -z "$_SESSION_STATE_TRANSACTION_CANDIDATE" ]] || rm -f "$_SESSION_STATE_TRANSACTION_CANDIDATE" 2>/dev/null || true
  _SESSION_STATE_TRANSACTION_INPUT=""
  _SESSION_STATE_TRANSACTION_CANDIDATE=""
}

_session_state_transaction_signal() {
  local exit_code="$1"
  _session_state_cleanup_transaction_files
  _session_state_release_lock
  exit "$exit_code"
}

_session_state_restore_trap() {
  local signal_name="$1" prior="$2"
  if [[ -n "$prior" ]]; then
    eval "$prior"
  else
    trap - "$signal_name"
  fi
}

_session_state_acquire_flock() {
  local timeout="$1"
  if [[ -L "$_SESSION_STATE_LOCK_FILE" ]]; then
    _session_state_refuse SESSION_LOCK_PATH_UNSAFE "session flock path must not be a symbolic link" path "$_SESSION_STATE_LOCK_FILE"
    return 3
  fi
  exec 9>"$_SESSION_STATE_LOCK_FILE" || {
    _session_state_refuse SESSION_LOCK_OPEN_FAILED "could not open the persistent session lock file" path "$_SESSION_STATE_LOCK_FILE"
    return 3
  }
  chmod 600 "$_SESSION_STATE_LOCK_FILE" 2>/dev/null || {
    exec 9>&- || true
    _session_state_refuse SESSION_LOCK_OPEN_FAILED "could not make the persistent session lock file private" path "$_SESSION_STATE_LOCK_FILE"
    return 3
  }
  if ! flock -x -w "$timeout" 9; then
    exec 9>&- || true
    _session_state_refuse SESSION_LOCK_TIMEOUT "timed out waiting for the shared session lock" path "$_SESSION_STATE_LOCK_FILE" seconds "$timeout"
    return 3
  fi
  _SESSION_STATE_LOCK_MODE="flock"
  _SESSION_STATE_LOCK_HELD=true
  return 0
}

_session_state_lock_holder_is_dead() {
  local pid token line_count observed_pid
  [[ -d "$_SESSION_STATE_LOCK_DIR" && ! -L "$_SESSION_STATE_LOCK_DIR" ]] || return 1
  [[ -f "$_SESSION_STATE_LOCK_HOLDER" && ! -L "$_SESSION_STATE_LOCK_HOLDER" ]] || return 1
  line_count="$(awk 'END { print NR + 0 }' "$_SESSION_STATE_LOCK_HOLDER" 2>/dev/null || true)"
  [[ "$line_count" == "2" ]] || return 1
  pid="$(sed -n '1p' "$_SESSION_STATE_LOCK_HOLDER" 2>/dev/null || true)"
  token="$(sed -n '2p' "$_SESSION_STATE_LOCK_HOLDER" 2>/dev/null || true)"
  case "$pid" in
    ''|*[!0-9]*) return 1 ;;
  esac
  [[ "$token" =~ $_SESSION_STATE_TOKEN_PATTERN ]] || return 1

  # Age is never ownership evidence. A holder is recoverable only when its
  # complete record is valid and two independent process probes agree that the
  # recorded process is gone. `kill -0` alone cannot distinguish ESRCH from an
  # EPERM refusal, so a failed signal probe is unprovable until `ps` also
  # reports no matching process. Missing `ps` is therefore a refusal, not
  # permission to steal the lock.
  if kill -0 "$pid" 2>/dev/null; then
    return 1
  fi
  command -v ps >/dev/null 2>&1 || return 1
  observed_pid="$(ps -p "$pid" -o pid= 2>/dev/null || true)"
  observed_pid="${observed_pid//[[:space:]]/}"
  [[ -z "$observed_pid" ]] || return 1
  _SESSION_STATE_DEAD_HOLDER_RECORD="$pid"$'\n'"$token"
  return 0
}

_session_state_break_dead_holder() {
  local current_record claim
  _SESSION_STATE_DEAD_HOLDER_RECORD=""
  _session_state_lock_holder_is_dead || return 1
  current_record="$(sed -n '1,2p' "$_SESSION_STATE_LOCK_HOLDER" 2>/dev/null || true)"
  [[ "$current_record" == "$_SESSION_STATE_DEAD_HOLDER_RECORD" ]] || return 1
  claim="$_SESSION_STATE_LOCK_DIR.abandoned.$$.${RANDOM}"
  if mv "$_SESSION_STATE_LOCK_DIR" "$claim" 2>/dev/null; then
    rm -rf "$claim" 2>/dev/null || true
    return 0
  fi
  return 1
}

_session_state_write_holder() {
  local holder_temp token
  token="holder-$$-${RANDOM}-${RANDOM}"
  holder_temp="$_SESSION_STATE_LOCK_DIR/.holder.$$.${RANDOM}"
  if ! printf '%s\n%s\n' "$$" "$token" > "$holder_temp" ||
     ! chmod 600 "$holder_temp" ||
     ! mv "$holder_temp" "$_SESSION_STATE_LOCK_HOLDER"; then
    rm -f "$holder_temp" 2>/dev/null || true
    rmdir "$_SESSION_STATE_LOCK_DIR" 2>/dev/null || true
    return 1
  fi
  _SESSION_STATE_LOCK_TOKEN="$token"
  return 0
}

_session_state_acquire_mkdir() {
  local timeout="$1" started
  started="$(_session_state_now_epoch)" || {
    _session_state_refuse SESSION_CLOCK_INVALID "could not read a numeric UTC epoch for bounded lock waiting"
    return 3
  }

  while true; do
    if [[ ! -e "$_SESSION_STATE_LOCK_RECOVERY" ]] && mkdir "$_SESSION_STATE_LOCK_DIR" 2>/dev/null; then
      chmod 700 "$_SESSION_STATE_LOCK_DIR" 2>/dev/null || {
        rmdir "$_SESSION_STATE_LOCK_DIR" 2>/dev/null || true
        _session_state_refuse SESSION_LOCK_OPEN_FAILED "could not make the fallback session lock private" path "$_SESSION_STATE_LOCK_DIR"
        return 3
      }
      if ! _session_state_write_holder; then
        _session_state_refuse SESSION_LOCK_OPEN_FAILED "could not record fallback session lock ownership" path "$_SESSION_STATE_LOCK_DIR"
        return 3
      fi

      # A recovery gate may have appeared after the pre-mkdir check. Relinquish
      # this just-created lock and retry so the recovery owner can re-evaluate
      # the prior holder without a new owner racing into the same path.
      if [[ -e "$_SESSION_STATE_LOCK_RECOVERY" ]]; then
        _SESSION_STATE_LOCK_MODE="mkdir"
        _SESSION_STATE_LOCK_HELD=true
        _session_state_release_lock
      else
        _SESSION_STATE_LOCK_MODE="mkdir"
        _SESSION_STATE_LOCK_HELD=true
        return 0
      fi
    elif [[ -L "$_SESSION_STATE_LOCK_DIR" || -L "$_SESSION_STATE_LOCK_RECOVERY" ]]; then
      _session_state_refuse SESSION_LOCK_PATH_UNSAFE "fallback session lock paths must not be symbolic links" path "$_SESSION_STATE_LOCK_DIR"
      return 3
    elif mkdir "$_SESSION_STATE_LOCK_RECOVERY" 2>/dev/null; then
      chmod 700 "$_SESSION_STATE_LOCK_RECOVERY" 2>/dev/null || true
      _session_state_break_dead_holder || true
      rmdir "$_SESSION_STATE_LOCK_RECOVERY" 2>/dev/null || true
    fi

    if _session_state_lock_timed_out "$started" "$timeout"; then
      _session_state_refuse SESSION_LOCK_TIMEOUT "timed out waiting for the shared fallback session lock; live or unprovable holders are never stolen" path "$_SESSION_STATE_LOCK_DIR" seconds "$timeout"
      return 3
    fi
    sleep 1
  done
}

_session_state_acquire_lock() {
  local session_file="$1" timeout="$2"
  _SESSION_STATE_LOCK_FILE="$session_file.flock"
  _SESSION_STATE_LOCK_DIR="$session_file.lock"
  _SESSION_STATE_LOCK_HOLDER="$_SESSION_STATE_LOCK_DIR/holder"
  _SESSION_STATE_LOCK_RECOVERY="$_SESSION_STATE_LOCK_DIR.recovery"
  if command -v flock >/dev/null 2>&1; then
    _session_state_acquire_flock "$timeout"
  else
    _session_state_acquire_mkdir "$timeout"
  fi
}

_session_state_transaction_read_locked() {
  local session_file="$1" missing_policy="$2" input_file="$3"
  if [[ ! -e "$session_file" ]]; then
    case "$missing_policy" in
      initialize-object)
        printf '{}\n' > "$input_file" || return 3
        ;;
      no-op)
        return 4
        ;;
      no-state)
        _session_state_refuse SESSION_NO_STATE "session file is absent" path "$session_file"
        return 1
        ;;
      refuse)
        _session_state_refuse SESSION_MISSING "required session file is absent" path "$session_file"
        return 1
        ;;
    esac
  else
    if [[ ! -f "$session_file" || -L "$session_file" ]]; then
      _session_state_refuse SESSION_NOT_REGULAR_FILE "session path is not a regular non-symlink file" path "$session_file"
      return 2
    fi
    cp "$session_file" "$input_file" || return 3
  fi
  chmod 600 "$input_file" || return 3
  _session_state_validate_snapshot "$input_file"
}

# session_state_transaction <session-file> <missing-policy> <operation>
#   <callback> [callback-args...]
#
# The callback receives:
#   <locked-input-file> <candidate-file> <operation-context-json> [args...]
# It must read only the locked input and write one complete object candidate.
# The library validates and commits that candidate exactly once.
session_state_transaction() {
  _session_state_require_jq || return $?
  if [[ $# -lt 4 ]]; then
    _session_state_refuse SESSION_TRANSACTION_USAGE "transaction requires session file, missing policy, operation, and callback"
    return 2
  fi
  if [[ "${BUBBLES_SESSION_TRANSACTION_ACTIVE-}" == "1" ]]; then
    _session_state_refuse SESSION_NESTED_TRANSACTION "an active-session writer cannot open a nested transaction"
    return 2
  fi

  local session_file="$1" missing_policy="$2" operation="$3" callback="$4"
  shift 4
  case "$missing_policy" in
    initialize-object|no-state|no-op|refuse) ;;
    *)
      _session_state_refuse SESSION_MISSING_POLICY "unknown missing-file policy" policy "$missing_policy"
      return 2
      ;;
  esac
  if [[ ! "$operation" =~ $_SESSION_STATE_TOKEN_PATTERN ]]; then
    _session_state_refuse SESSION_OPERATION_INVALID "transaction operation must be a safe token" operation "$operation"
    return 2
  fi
  if ! declare -F "$callback" >/dev/null 2>&1; then
    _session_state_refuse SESSION_CALLBACK_INVALID "transaction callback must be a declared shell function" callback "$callback"
    return 2
  fi

  local session_dir timeout lock_rc=0 read_rc=0 callback_rc=0 context
  local prior_int prior_term active_was_set active_prior
  session_dir="$(dirname "$session_file")"
  if [[ ! -d "$session_dir" ]]; then
    _session_state_refuse SESSION_DIRECTORY_MISSING "session parent directory does not exist" path "$session_dir"
    return 3
  fi
  timeout="$(_session_state_lock_timeout_seconds)" || return $?
  _session_state_acquire_lock "$session_file" "$timeout" || lock_rc=$?
  [[ "$lock_rc" -eq 0 ]] || return "$lock_rc"

  umask 077
  _SESSION_STATE_TRANSACTION_INPUT="$(mktemp "$session_dir/.bubbles-session.input.XXXXXX")" || {
    _session_state_release_lock
    _session_state_refuse SESSION_ATOMIC_WRITE_FAILED "could not create the locked session snapshot" path "$session_dir"
    return 3
  }
  _SESSION_STATE_TRANSACTION_CANDIDATE="$(mktemp "$session_dir/.bubbles-session.transaction.XXXXXX")" || {
    _session_state_cleanup_transaction_files
    _session_state_release_lock
    _session_state_refuse SESSION_ATOMIC_WRITE_FAILED "could not create the same-directory transaction candidate" path "$session_dir"
    return 3
  }
  chmod 600 "$_SESSION_STATE_TRANSACTION_INPUT" "$_SESSION_STATE_TRANSACTION_CANDIDATE" || {
    _session_state_cleanup_transaction_files
    _session_state_release_lock
    _session_state_refuse SESSION_ATOMIC_WRITE_FAILED "could not make transaction intermediates private" path "$session_dir"
    return 3
  }

  _session_state_transaction_read_locked "$session_file" "$missing_policy" "$_SESSION_STATE_TRANSACTION_INPUT" || read_rc=$?
  if [[ "$read_rc" -eq 4 ]]; then
    _session_state_cleanup_transaction_files
    _session_state_release_lock
    return 0
  fi
  if [[ "$read_rc" -ne 0 ]]; then
    _session_state_cleanup_transaction_files
    _session_state_release_lock
    return "$read_rc"
  fi

  prior_int="$(trap -p INT || true)"
  prior_term="$(trap -p TERM || true)"
  trap '_session_state_transaction_signal 130' INT
  trap '_session_state_transaction_signal 143' TERM
  active_was_set="${BUBBLES_SESSION_TRANSACTION_ACTIVE+x}"
  active_prior="${BUBBLES_SESSION_TRANSACTION_ACTIVE-}"
  export BUBBLES_SESSION_TRANSACTION_ACTIVE=1
  context="$(jq -cn --arg operation "$operation" --arg sessionFile "$session_file" '{operation:$operation,sessionFile:$sessionFile}')" || callback_rc=2
  if [[ "$callback_rc" -eq 0 ]]; then
    "$callback" "$_SESSION_STATE_TRANSACTION_INPUT" "$_SESSION_STATE_TRANSACTION_CANDIDATE" "$context" "$@" || callback_rc=$?
  fi
  if [[ "$active_was_set" == "x" ]]; then
    export BUBBLES_SESSION_TRANSACTION_ACTIVE="$active_prior"
  else
    unset BUBBLES_SESSION_TRANSACTION_ACTIVE
  fi
  _session_state_restore_trap INT "$prior_int"
  _session_state_restore_trap TERM "$prior_term"

  if [[ "$callback_rc" -ne 0 ]]; then
    case "$callback_rc" in
      1|2|3) ;;
      *)
        _session_state_refuse SESSION_CALLBACK_FAILED "transaction callback returned an unsupported exit class" operation "$operation" callbackExit "$callback_rc"
        callback_rc=2
        ;;
    esac
    _session_state_cleanup_transaction_files
    _session_state_release_lock
    return "$callback_rc"
  fi
  if [[ ! -f "$_SESSION_STATE_TRANSACTION_CANDIDATE" || -L "$_SESSION_STATE_TRANSACTION_CANDIDATE" ]] ||
     ! jq empty "$_SESSION_STATE_TRANSACTION_CANDIDATE" >/dev/null 2>&1 ||
     ! jq -e 'type == "object"' "$_SESSION_STATE_TRANSACTION_CANDIDATE" >/dev/null 2>&1; then
    _session_state_cleanup_transaction_files
    _session_state_release_lock
    _session_state_refuse SESSION_CANDIDATE_INVALID "transaction callback must produce one valid JSON object" operation "$operation"
    return 2
  fi
  chmod 600 "$_SESSION_STATE_TRANSACTION_CANDIDATE" || {
    _session_state_cleanup_transaction_files
    _session_state_release_lock
    _session_state_refuse SESSION_ATOMIC_WRITE_FAILED "could not make the transaction candidate private" operation "$operation"
    return 3
  }

  if cmp -s "$_SESSION_STATE_TRANSACTION_INPUT" "$_SESSION_STATE_TRANSACTION_CANDIDATE"; then
    _session_state_cleanup_transaction_files
    _session_state_release_lock
    return 0
  fi
  if ! mv "$_SESSION_STATE_TRANSACTION_CANDIDATE" "$session_file"; then
    _session_state_cleanup_transaction_files
    _session_state_release_lock
    _session_state_refuse SESSION_ATOMIC_WRITE_FAILED "same-directory atomic replacement failed" operation "$operation" path "$session_file"
    return 3
  fi
  _SESSION_STATE_TRANSACTION_CANDIDATE=""
  _session_state_cleanup_transaction_files
  _session_state_release_lock
  return 0
}

_session_state_physical_root() {
  local root="${1-}" physical
  if [[ -z "$root" ]] || [[ "$root" == *\\* ]] || [[ "$root" =~ [[:cntrl:]] ]] || [[ ! -d "$root" ]]; then
    return 2
  fi
  physical="$(cd -P -- "$root" 2>/dev/null && pwd -P)" || return 2
  if [[ -z "$physical" ]] || [[ "$physical" == *\\* ]] || [[ "$physical" =~ [[:cntrl:]] ]]; then
    return 2
  fi
  printf '%s' "$physical"
}

# session_state_canonical_spec <repository-root> <path-spelling>
# Resolve an existing directory physically and prove it remains under the
# physical repository root. GNU realpath/readlink -f are intentionally avoided.
session_state_canonical_spec() {
  if [[ $# -ne 2 ]]; then
    _session_state_refuse SESSION_SPEC_USAGE "canonical-spec requires repository root and spec path"
    return 2
  fi

  local repository_root="$1" spelling="$2" physical_root candidate physical_candidate relative
  physical_root="$(_session_state_physical_root "$repository_root")" || {
    _session_state_refuse SESSION_REPOSITORY_ROOT_INVALID "repository root is not an existing physical directory" root "$repository_root"
    return 2
  }

  if [[ -z "$spelling" ]] || [[ "$spelling" == *\\* ]] || [[ "$spelling" =~ [[:cntrl:]] ]] || [[ "$spelling" == *//* ]]; then
    _session_state_refuse SESSION_SPEC_INVALID "spec path has an invalid spelling" specDir "$spelling"
    return 2
  fi

  while [[ "$spelling" == ./* ]]; do
    spelling="${spelling#./}"
  done
  while [[ "$spelling" != "/" && "$spelling" == */ ]]; do
    spelling="${spelling%/}"
  done
  if [[ -z "$spelling" ]]; then
    _session_state_refuse SESSION_SPEC_INVALID "spec path is empty after normalization" specDir "$spelling"
    return 2
  fi
  case "/$spelling/" in
    */./*|*/../*)
      _session_state_refuse SESSION_SPEC_INVALID "spec path contains dot traversal components" specDir "$spelling"
      return 2
      ;;
  esac

  case "$spelling" in
    /*) candidate="$spelling" ;;
    *) candidate="$physical_root/$spelling" ;;
  esac

  if [[ ! -e "$candidate" && ! -L "$candidate" ]]; then
    _session_state_refuse SESSION_SPEC_NOT_FOUND "spec directory does not exist" specDir "$spelling"
    return 2
  fi
  if [[ ! -d "$candidate" ]]; then
    _session_state_refuse SESSION_SPEC_NOT_DIRECTORY "spec path does not name a directory" specDir "$spelling"
    return 2
  fi
  physical_candidate="$(cd -P -- "$candidate" 2>/dev/null && pwd -P)" || {
    _session_state_refuse SESSION_SPEC_NOT_FOUND "spec directory could not be resolved physically" specDir "$spelling"
    return 2
  }
  if [[ "$physical_candidate" == *\\* ]] || [[ "$physical_candidate" =~ [[:cntrl:]] ]]; then
    _session_state_refuse SESSION_SPEC_INVALID "physical spec identity contains an unsafe path character" specDir "$spelling"
    return 2
  fi

  if [[ "$physical_candidate" == "$physical_root" ]]; then
    _session_state_refuse SESSION_SPEC_INVALID "repository root is not a spec directory identity" specDir "$spelling"
    return 2
  fi
  case "$physical_candidate/" in
    "$physical_root/"*) ;;
    *)
      _session_state_refuse SESSION_SPEC_ESCAPES_ROOT "spec directory resolves outside the physical repository root" specDir "$spelling"
      return 2
      ;;
  esac

  relative="${physical_candidate#"$physical_root"/}"
  if [[ -z "$relative" || "$relative" == "$physical_candidate" ]]; then
    _session_state_refuse SESSION_SPEC_ESCAPES_ROOT "spec directory has no contained repository-relative identity" specDir "$spelling"
    return 2
  fi
  printf '%s' "$relative"
}

# session_state_validate_agent <identifier>
session_state_validate_agent() {
  local agent="${1-}"
  if [[ $# -ne 1 ]] || [[ ! "$agent" =~ $_SESSION_STATE_AGENT_PATTERN ]]; then
    _session_state_refuse SESSION_AGENT_INVALID "agent identifier must match ^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$" agent "$agent"
    return 2
  fi
  return 0
}

# session_state_goal_contract_violations <contract-json>
# Shared complete Goal Contract validator. It emits one violation per line and
# returns zero for both valid and invalid contracts; callers decide their public
# exit class from whether output is empty. No consumer keeps a private core-only
# validator beside this complete versioned contract authority.
session_state_goal_contract_violations() {
  local contract="${1-}"
  _session_state_require_jq || return $?

  if ! jq -e . >/dev/null 2>&1 <<< "$contract"; then
    printf '%s\n' 'contract must be valid JSON'
    return 0
  fi
  if [[ "$(jq -r 'type' <<< "$contract")" != "object" ]]; then
    printf '%s\n' 'contract must be an object'
    return 0
  fi

  jq -n -r \
    --argjson c "$contract" \
    --arg v1 "$_SESSION_STATE_GOAL_V1" \
    --arg v2 "$_SESSION_STATE_GOAL_V2" '
    def nes: type == "string" and length > 0;
    def safeid: type == "string" and test("^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$");
    def sid: type == "string" and test("^[A-Za-z0-9._-]+$");
    def nesarr: type == "array" and all(.[]; nes);
    def rfc3339: type == "string" and test("^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$");
    def show: if . == null then "null" else tostring end;
    def integer_at_least($n): type == "number" and . == floor and . >= $n;
    def valid_boundary:
      type == "object"
      and ((keys_unsorted - ["repositoryRoots","specTargets","allowedPaths","crossRepoPolicy"]) | length) == 0
      and (.repositoryRoots | nesarr) and (.repositoryRoots | length) > 0
      and ((has("specTargets") | not) or (.specTargets | nesarr))
      and ((has("allowedPaths") | not) or (.allowedPaths | nesarr))
      and ((has("crossRepoPolicy") | not) or (.crossRepoPolicy | IN("forbidden","authorized")));
    def valid_semantic:
      type == "object"
      and ((keys_unsorted - ["executionShape","allowedChangeClasses","approvalRequiredChangeClasses","deltaBudget"]) | length) == 0
      and (.executionShape | IN("one-off","existing-capability-change","reusable-capability"))
      and (.allowedChangeClasses | type) == "array"
      and (.approvalRequiredChangeClasses | type) == "array"
      and ((.allowedChangeClasses | length) == (.allowedChangeClasses | unique | length))
      and ((.approvalRequiredChangeClasses | length) == (.approvalRequiredChangeClasses | unique | length))
      and all(.allowedChangeClasses[];
        IN("existing-config","existing-test","new-product-code","new-shared-library","new-workflow","new-runner","new-virtual-machine","new-daemon","new-init-unit","new-datastore","new-cache","new-approval-authority","new-network-topology","new-deployment-target"))
      and all(.approvalRequiredChangeClasses[];
        IN("existing-config","existing-test","new-product-code","new-shared-library","new-workflow","new-runner","new-virtual-machine","new-daemon","new-init-unit","new-datastore","new-cache","new-approval-authority","new-network-topology","new-deployment-target"))
      and (((.allowedChangeClasses - (.allowedChangeClasses - .approvalRequiredChangeClasses)) | length) == 0)
      and (.deltaBudget | type) == "object"
      and ((.deltaBudget | keys_unsorted) - ["maxNewScopes","maxNewFiles","maxNewWorkflows","maxNewServices","maxNewRunners","maxNewVirtualMachines"] | length) == 0
      and all(.deltaBudget[]; integer_at_least(0));

    (($c.goalId // "") | try capture("^gc:(?<session>[A-Za-z0-9._-]+):(?<revision>[0-9]+)$") catch null) as $id
    | [
      (if ($c.schemaVersion | IN($v1,$v2) | not)
       then "schemaVersion must be goal-contract/v1 or goal-contract/v2" else empty end),
      (if $id == null then "goalId must match ^gc:<sessionId>:<revision>$" else empty end),
      (if ($c.revision | integer_at_least(1) | not) then "revision must be an integer >= 1" else empty end),
      (if $id != null and ($c.revision | integer_at_least(1)) and (($id.revision | tonumber) != $c.revision)
       then "goalId revision segment must equal revision" else empty end),
      (if ($c.sourceRequestDigest | type) != "string" or ($c.sourceRequestDigest | test("^sha256:[0-9a-f]{64}$") | not)
       then "sourceRequestDigest must match ^sha256:<64 lowercase hex>$" else empty end),
      (if ($c.intent | nes | not) then "intent must be a non-empty string" else empty end),
      (if ($c.successSignal | nes | not) then "successSignal must be a non-empty string" else empty end),
      (if $c | has("failureCondition") and ($c.failureCondition | nes | not)
       then "failureCondition must be a non-empty string when present" else empty end),
      (if ($c.hardConstraints | nesarr | not) then "hardConstraints must be an array of non-empty strings" else empty end),
      (if ($c.nonGoals | nesarr | not) then "nonGoals must be an array of non-empty strings" else empty end),
      (if ($c.targetReferences | type) != "array" or ($c.targetReferences | length) < 1
       then "targetReferences must be a non-empty array"
       else ($c.targetReferences | to_entries[]
         | select((.value | type) != "object"
           or ((.value | keys_unsorted | sort) != ["kind","value"])
           or ((.value.kind // "") | IN("repository","spec","path","release-phase","ops-packet") | not)
           or ((.value.value // null) | nes | not))
         | "targetReferences[\(.key)] is invalid") end),
      (if ($c.workBoundary | valid_boundary | not) then "workBoundary is invalid" else empty end),
      (if $c.schemaVersion == $v2 and ($c.semanticBoundary | valid_semantic | not)
       then "semanticBoundary is required and must be valid for goal-contract/v2"
       elif $c.schemaVersion == $v1 and ($c | has("semanticBoundary"))
       then "semanticBoundary is forbidden for goal-contract/v1"
       else empty end),
      (if ($c.createdAt | rfc3339 | not) then "createdAt must be RFC3339 UTC" else empty end),
      (if ($c.provenance | type) != "object"
       or (($c.provenance | keys_unsorted | sort) != ["repositoryAlias","runner","sessionId"])
       then "provenance must have exactly runner, sessionId, repositoryAlias"
       else empty end),
      (if ($c.provenance.runner | safeid | not) then "provenance.runner must be a safe agent identifier" else empty end),
      (if ($c.provenance.sessionId | sid | not) then "provenance.sessionId must match ^[A-Za-z0-9._-]+$" else empty end),
      (if ($c.provenance.repositoryAlias | safeid | not) then "provenance.repositoryAlias must be a safe identifier" else empty end),
      (if $id != null and ($c.provenance.sessionId | sid) and $id.session != $c.provenance.sessionId
       then "goalId session segment must equal provenance.sessionId" else empty end),
      (if ($c.approval | type) != "object"
       or (($c.approval | keys_unsorted | sort) != ["approvalNote","approvedAt","state"])
       then "approval must have exactly state, approvedAt, approvalNote"
       else empty end),
      (if ($c.approval.state // "") | IN("auto-frozen","operator-approved","pending-expansion") | not
       then "approval.state is invalid" else empty end),
      (if ($c | has("supersedes") | not) then "supersedes is required" else empty end),

      (if ($c.revision | integer_at_least(1)) and $c.revision == 1 and
          ($c.approval.state != "auto-frozen" or $c.approval.approvedAt != null
           or $c.approval.approvalNote != null or $c.supersedes != null)
       then "revision 1 must be auto-frozen with null approval metadata and supersedes"
       else empty end),
      (if ($c.revision | integer_at_least(2)) and $id != null and
          $c.supersedes != ("gc:" + $id.session + ":" + (($c.revision - 1) | tostring))
       then "later revision must name its immediate prior goalId in supersedes"
       else empty end),
      (if ($c.revision | integer_at_least(2)) and $c.approval.state == "operator-approved" and
          (($c.approval.approvedAt | rfc3339 | not) or ($c.approval.approvalNote | nes | not))
       then "operator-approved revision requires approvedAt and a non-empty approvalNote"
       else empty end),
      (if ($c.revision | integer_at_least(2)) and $c.approval.state == "pending-expansion" and
          ($c.approval.approvedAt != null or ($c.approval.approvalNote | nes | not))
       then "pending-expansion revision requires null approvedAt and a non-empty approvalNote"
       else empty end),
      (if ($c.revision | integer_at_least(2)) and ($c.approval.state | IN("operator-approved","pending-expansion") | not)
       then "later revision must be operator-approved or pending-expansion"
       else empty end),

      (["schemaVersion","goalId","revision","sourceRequestDigest","intent","successSignal",
        "hardConstraints","failureCondition","nonGoals","targetReferences","workBoundary",
        "semanticBoundary","createdAt","provenance","approval","supersedes"] as $known
       | $c | keys_unsorted[] | select(. as $key | $known | index($key) | not)
       | "contract has an unknown key: \(.)")
    ] | .[]
  '
}

_session_state_contract_error_code() {
  local violations="$1"
  local violation_count
  violation_count="$(awk 'NF { count += 1 } END { print count + 0 }' <<< "$violations")"
  if [[ "$violation_count" -eq 1 ]] &&
    grep -q '^later revision must name its immediate prior goalId in supersedes$' <<< "$violations"; then
    printf '%s' SESSION_GOAL_CHAIN_INVALID
  else
    printf '%s' SESSION_GOAL_INVALID
  fi
}

# session_state_authority_context <physical-root> <packet-or-mirror-json> <source>
# Source is explicit: mirror (stored session projection) or packet (already
# externally validated input). This function validates internal coherence; it
# never repairs or overrides external control.
session_state_authority_context() {
  _session_state_require_jq || return $?
  if [[ $# -ne 3 ]]; then
    _session_state_refuse SESSION_AUTHORITY_USAGE "authority-context requires repository root, context JSON, and source"
    return 2
  fi

  local repository_root="$1" authority_json="$2" source="$3" physical_root mirror_root valid
  case "$source" in mirror|packet) ;;
    *)
      _session_state_refuse SESSION_AUTHORITY_SOURCE "authority source must be mirror or packet" source "$source"
      return 2
      ;;
  esac
  physical_root="$(_session_state_physical_root "$repository_root")" || {
    _session_state_refuse SESSION_REPOSITORY_ROOT_INVALID "repository root is not an existing physical directory" root "$repository_root"
    return 2
  }
  if ! jq -e . >/dev/null 2>&1 <<< "$authority_json" || [[ "$(jq -r 'type' <<< "$authority_json")" != "object" ]]; then
    _session_state_refuse SESSION_AUTHORITY_INVALID "repository authority context must be a JSON object"
    return 2
  fi

  valid="$(jq -n -r --argjson a "$authority_json" --arg source "$source" '
    def exact_keys($expected): (keys_unsorted | sort) == ($expected | sort);
    def nes: type == "string" and length > 0;
    def safe: type == "string" and test("^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$");
    def session_id: type == "string" and test("^[A-Za-z0-9._-]+$");
    def posint: type == "number" and . == floor and . >= 1;
    def rfc3339: type == "string" and test("^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$");
    def command_semantics:
      ((.authority == "explicit-repository-root" and .targetKind == "repository-root"
        and (.transition | IN("established","confirmed","switched")))
       or (.authority == "concrete-target" and (.targetKind | IN("absolute-target","relative-target"))
        and (.transition | IN("established","confirmed","switched")))
       or (.authority == "resolved-natural-language" and .targetKind == "natural-language"
        and (.transition | IN("established","confirmed","switched")))
       or (.authority == "durable-work-boundary" and .targetKind == "inherited-boundary"
        and .transition == "continued")
       or (.authority == "single-eligible-repository" and .targetKind == "sole-eligible-repository"
        and .transition == "established"));
    def command_resolution:
      .scopeKind == "command"
      and .scopeId == null
      and command_semantics
      and .decisionId == ("rb:" + .sessionId + ":" + (.controlRevision | tostring));
    def goal_node_resolution:
      .scopeKind == "goal-node"
      and (.scopeId | nes)
      and .authority == "scoped-scenario-node"
      and .transition == "scoped-override"
      and .targetKind == "goal-node"
      and .decisionId == ("rb:" + .sessionId + ":" + (.controlRevision | tostring) + ":node:" + .scopeId);
    ($a.repositoryResolution // null) as $r
    | ((if $source == "mirror" then
          ($a | exact_keys(["repositoryRoot","repositoryAlias","repositoryResolution","mirroredControlRevision","mirroredAt"]))
        else
          ($a | exact_keys(["repositoryRoot","repositoryAlias","repositoryResolution"]))
        end)
       and ($a.repositoryRoot | nes)
       and ($a.repositoryAlias | safe)
       and (($r | type) == "object")
       and ($r | exact_keys(["sessionId","decisionId","controlRevision","controlPathDigest","authority","transition","scopeKind","scopeId","targetKind","pathVisibility","actionable"]))
       and ($r.sessionId | session_id)
       and ($r.controlRevision | posint)
       and (($r.controlPathDigest | type) == "string")
       and ($r.controlPathDigest | test("^sha256:[0-9a-f]{64}$"))
       and ($r.pathVisibility == "local")
       and ($r.actionable == true)
       and (($r | command_resolution) or ($r | goal_node_resolution))
       and (if $source == "mirror" then
              ($a.mirroredControlRevision | posint)
              and ($a.mirroredControlRevision == $r.controlRevision)
              and ($a.mirroredAt | rfc3339)
            else true end))
  ')" || valid="false"
  if [[ "$valid" != "true" ]]; then
    _session_state_refuse SESSION_AUTHORITY_INVALID "repository authority context is incomplete or non-actionable" source "$source"
    return 2
  fi

  mirror_root="$(_session_state_physical_root "$(jq -r '.repositoryRoot' <<< "$authority_json")")" || {
    _session_state_refuse SESSION_AUTHORITY_ROOT "repository authority root cannot be physicalized"
    return 2
  }
  if [[ "$mirror_root" != "$physical_root" ]]; then
    _session_state_refuse SESSION_AUTHORITY_ROOT "repository authority root does not match the physical repository" expected "$physical_root" observed "$mirror_root"
    return 2
  fi

  jq -cn --argjson a "$authority_json" --arg root "$physical_root" --arg source "$source" '{
    sessionId: $a.repositoryResolution.sessionId,
    repositoryAlias: $a.repositoryAlias,
    repositoryRoot: $root,
    decisionId: $a.repositoryResolution.decisionId,
    controlRevision: $a.repositoryResolution.controlRevision,
    controlPathDigest: $a.repositoryResolution.controlPathDigest,
    authority: $a.repositoryResolution.authority,
    transition: $a.repositoryResolution.transition,
    scopeKind: $a.repositoryResolution.scopeKind,
    scopeId: $a.repositoryResolution.scopeId,
    targetKind: $a.repositoryResolution.targetKind,
    pathVisibility: $a.repositoryResolution.pathVisibility,
    actionable: $a.repositoryResolution.actionable,
    source: $source
  }'
}

_session_state_record_result() {
  local record="$1" canonical_spec="$2"
  jq -cn --argjson r "$record" --arg spec "$canonical_spec" '
    def safe_agent: type == "string" and test("^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$");
    def rfc3339: type == "string" and test("^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$");
    def integer_at_least($n): type == "number" and . == floor and . >= $n;
    def valid_boundary:
      type == "object"
      and ((keys_unsorted - ["repositoryRoots","specTargets","allowedPaths","crossRepoPolicy"]) | length) == 0
      and (.repositoryRoots | type) == "array" and (.repositoryRoots | length) > 0
      and all(.repositoryRoots[]; type == "string" and length > 0)
      and ((has("specTargets") | not) or ((.specTargets | type) == "array" and all(.specTargets[]; type == "string" and length > 0)))
      and ((has("allowedPaths") | not) or ((.allowedPaths | type) == "array" and all(.allowedPaths[]; type == "string" and length > 0)))
      and ((has("crossRepoPolicy") | not) or (.crossRepoPolicy | IN("forbidden","authorized")));
    def valid_semantic:
      type == "object"
      and ((keys_unsorted - ["executionShape","allowedChangeClasses","approvalRequiredChangeClasses","deltaBudget"]) | length) == 0
      and (.executionShape | IN("one-off","existing-capability-change","reusable-capability"))
      and (.allowedChangeClasses | type) == "array"
      and (.approvalRequiredChangeClasses | type) == "array"
      and (.deltaBudget | type) == "object";
    def valid_goal_ref:
      type == "object"
      and ((keys_unsorted - ["goalId","revision","sourceRequestDigest","workBoundary","semanticBoundary"]) | length) == 0
      and (.goalId | type) == "string"
      and (.goalId | test("^gc:[A-Za-z0-9._-]+:[0-9]+$"))
      and (.revision | integer_at_least(1))
      and ((.goalId | split(":") | last | tonumber) == .revision)
      and (.sourceRequestDigest | type) == "string"
      and (.sourceRequestDigest | test("^sha256:[0-9a-f]{64}$"))
      and ((has("workBoundary") | not) or (.workBoundary | valid_boundary))
      and ((has("semanticBoundary") | not) or (.semanticBoundary | valid_semantic));
    def agents_valid:
      ((has("agent") | not) or (.agent | safe_agent))
      and ((has("agents") | not) or
        ((.agents | type) == "array" and (.agents | length) > 0
         and all(.agents[]; safe_agent)
         and ((.agents | length) == (.agents | unique | length))));
    def agents_list:
      ([if has("agents") then .agents[] else empty end,
        if has("agent") then .agent else empty end] | unique);
    def update_time: (.lastUpdated // .lastIterationAt // null);
    def timestamps_valid($identity):
      ((has("startedAt") | not) or (.startedAt | rfc3339))
      and ((has("lastUpdated") | not) or (.lastUpdated | rfc3339))
      and ((has("lastIterationAt") | not) or (.lastIterationAt | rfc3339))
      and ((has("lastUpdated") and has("lastIterationAt") | not) or (.lastUpdated == .lastIterationAt))
      and ((if $identity then (update_time != null) else true end));

    if ($r | type) != "object" then
      {errorCode:"SESSION_CONVERGENCE_RECORD_INVALID", errorMessage:"convergence entry must be an object"}
    elif (($r.iterationCount | integer_at_least(0)) | not) then
      {errorCode:"SESSION_ITERATION_INVALID", errorMessage:"matching convergence entry has a malformed iterationCount"}
    elif (($r | has("goalRef")) and $r.goalRef != null and (($r.goalRef | valid_goal_ref) | not)) then
      {errorCode:"SESSION_GOAL_REF_INVALID", errorMessage:"matching convergence entry has a partial or malformed goalRef"}
    elif (($r.goalRef // null) != null) and (($r.iterationCount | integer_at_least(1)) | not) then
      {errorCode:"SESSION_ITERATION_INVALID", errorMessage:"identity-bearing convergence count must be at least one"}
    elif (($r | agents_valid) | not) then
      {errorCode:"SESSION_UNSAFE_AGENT", errorMessage:"convergence entry has unsafe or malformed agent attribution"}
    elif (($r.goalRef // null) != null) and (($r | agents_list | length) == 0) then
      {errorCode:"SESSION_UNSAFE_AGENT", errorMessage:"identity-bearing convergence entry requires agent attribution"}
    elif (($r | timestamps_valid(($r.goalRef // null) != null)) | not) then
      {errorCode:"SESSION_TIMESTAMP_INVALID", errorMessage:"convergence entry has a malformed or conflicting timestamp"}
    else
      {errorCode:null, normalized:{
        specDir:$spec,
        goalRef:(if ($r.goalRef // null) == null then null else {
          goalId:$r.goalRef.goalId,
          revision:$r.goalRef.revision,
          sourceRequestDigest:$r.goalRef.sourceRequestDigest
        } end),
        iterationCount:$r.iterationCount,
        startedAt:($r.startedAt // ($r | update_time)),
        lastUpdated:($r | update_time),
        agents:($r | agents_list)
      }}
    end
  '
}

# session_state_validate_convergence <snapshot> <repository-root>
#   [<requested-spec>] <destination>
# With a requested spec, valid unrelated records are ignored. An unresolvable
# stored path still refuses because alias equality cannot be disproved safely.
session_state_validate_convergence() {
  _session_state_require_jq || return $?
  if [[ $# -ne 3 && $# -ne 4 ]]; then
    _session_state_refuse SESSION_CONVERGENCE_USAGE "validate-convergence requires snapshot, repository root, optional spec, and destination"
    return 2
  fi

  local snapshot="$1" repository_root="$2" requested_spec="" destination=""
  if [[ $# -eq 3 ]]; then
    destination="$3"
  else
    requested_spec="$3"
    destination="$4"
  fi
  _session_state_validate_snapshot "$snapshot" || return $?

  local canonical_requested=""
  if [[ -n "$requested_spec" ]]; then
    canonical_requested="$(session_state_canonical_spec "$repository_root" "$requested_spec")" || return $?
  fi

  local loops_type loop_count index record raw_spec canonical_spec result validation code message normalized
  loops_type="$(jq -r 'if has("convergenceLoops") and .convergenceLoops != null then (.convergenceLoops | type) else "absent" end' "$snapshot")"
  if [[ "$loops_type" != "absent" && "$loops_type" != "array" ]]; then
    _session_state_refuse SESSION_CONVERGENCE_NOT_ARRAY "convergenceLoops must be an array"
    return 2
  fi
  loop_count="$(jq -r '(.convergenceLoops // []) | length' "$snapshot")" || return 2
  result='[]'
  index=0
  while [[ "$index" -lt "$loop_count" ]]; do
    record="$(jq -c --argjson index "$index" '(.convergenceLoops // [])[$index]' "$snapshot")" || return 2
    if [[ "$(jq -r 'type' <<< "$record")" != "object" ]] ||
      [[ "$(jq -r 'has("specDir") and (.specDir | type == "string")' <<< "$record")" != "true" ]]; then
      _session_state_refuse SESSION_SPEC_INVALID "convergence entry has no string specDir" recordIndex "$index"
      return 2
    fi
    raw_spec="$(jq -r '.specDir' <<< "$record")"
    canonical_spec="$(session_state_canonical_spec "$repository_root" "$raw_spec")" || return $?

    if [[ -n "$canonical_requested" && "$canonical_spec" != "$canonical_requested" ]]; then
      index=$((index + 1))
      continue
    fi

    validation="$(_session_state_record_result "$record" "$canonical_spec")" || return 2
    code="$(jq -r '.errorCode // empty' <<< "$validation")"
    if [[ -n "$code" ]]; then
      message="$(jq -r '.errorMessage' <<< "$validation")"
      _session_state_refuse "$code" "$message" recordIndex "$index" specDir "$canonical_spec"
      return 2
    fi
    normalized="$(jq -c '.normalized' <<< "$validation")"
    result="$(jq -cn --argjson existing "$result" --argjson item "$normalized" '$existing + [$item]')" || return 2
    index=$((index + 1))
  done

  if [[ "$(jq -r 'has("goalContract") and .goalContract != null' "$snapshot")" == "true" ]]; then
    local current_contract current_violations current_code current_goal current_revision current_digest
    current_contract="$(jq -c '.goalContract' "$snapshot")"
    current_violations="$(session_state_goal_contract_violations "$current_contract")" || return 2
    if [[ -n "$current_violations" ]]; then
      current_code="$(_session_state_contract_error_code "$current_violations")"
      _session_state_refuse "$current_code" "current Goal Contract failed complete validation" violations "$current_violations"
      return 2
    fi
    current_goal="$(jq -r '.goalId' <<< "$current_contract")"
    current_revision="$(jq -r '.revision' <<< "$current_contract")"
    current_digest="$(jq -r '.sourceRequestDigest' <<< "$current_contract")"
    if jq -e --arg goal "$current_goal" --argjson revision "$current_revision" --arg digest "$current_digest" '
        any(.[];
          .goalRef != null
          and .goalRef.goalId == $goal
          and .goalRef.revision == $revision
          and .goalRef.sourceRequestDigest != $digest)
      ' >/dev/null 2>&1 <<< "$result"; then
      _session_state_refuse SESSION_GOAL_IDENTITY_MISMATCH "current goalId and revision appear with a different sourceRequestDigest"
      return 2
    fi
  fi

  local destination_dir temporary
  destination_dir="$(dirname "$destination")"
  if [[ ! -d "$destination_dir" ]]; then
    _session_state_refuse SESSION_NORMALIZED_WRITE_FAILED "normalized destination directory does not exist" path "$destination"
    return 3
  fi
  umask 077
  temporary="$(mktemp "$destination_dir/.session-convergence.XXXXXX")" || {
    _session_state_refuse SESSION_NORMALIZED_WRITE_FAILED "could not create normalized convergence file" path "$destination"
    return 3
  }
  if ! printf '%s\n' "$result" > "$temporary" || ! mv "$temporary" "$destination"; then
    rm -f "$temporary"
    _session_state_refuse SESSION_NORMALIZED_WRITE_FAILED "could not commit normalized convergence file" path "$destination"
    return 3
  fi
  return 0
}

_session_state_boundary_allows_spec() {
  local contract="$1" repository_alias="$2" context_root="$3" canonical_spec="$4"
  if ! jq -e --arg alias "$repository_alias" \
    '(.workBoundary.repositoryRoots | index($alias)) != null' \
    >/dev/null 2>&1 <<< "$contract"; then
    return 1
  fi

  local target_count target_index declared_target canonical_target target_rc
  target_count="$(jq -r '(.workBoundary.specTargets // []) | length' <<< "$contract")" || return 2
  if [[ "$target_count" -eq 0 ]]; then
    return 0
  fi

  target_index=0
  while [[ "$target_index" -lt "$target_count" ]]; do
    declared_target="$(jq -r --argjson index "$target_index" \
      '(.workBoundary.specTargets // [])[$index]' <<< "$contract")" || return 2
    if canonical_target="$(session_state_canonical_spec "$context_root" "$declared_target")"; then
      if [[ "$canonical_target" == "$canonical_spec" ]]; then
        return 0
      fi
    else
      target_rc=$?
      return "$target_rc"
    fi
    target_index=$((target_index + 1))
  done
  return 1
}

# session_state_authorized_attempt <snapshot> <authority-context-json> <spec>
# Validate the complete current contract before exposing the minimal equality
# projection. A pending expansion is valid stored state but not authority.
session_state_authorized_attempt() {
  _session_state_require_jq || return $?
  if [[ $# -ne 3 ]]; then
    _session_state_refuse SESSION_ATTEMPT_USAGE "authorized-attempt requires snapshot, authority context, and spec"
    return 2
  fi

  local snapshot="$1" context="$2" requested_spec="$3" contract violations code
  _session_state_validate_snapshot "$snapshot" || return $?
  if [[ "$(jq -r 'has("goalContract") and .goalContract != null' "$snapshot")" != "true" ]]; then
    _session_state_refuse SESSION_GOAL_MISSING "current Goal Contract is required for identity-bearing attempt authority"
    return 2
  fi
  contract="$(jq -c '.goalContract' "$snapshot")"
  violations="$(session_state_goal_contract_violations "$contract")" || return 2
  if [[ -n "$violations" ]]; then
    code="$(_session_state_contract_error_code "$violations")"
    _session_state_refuse "$code" "current Goal Contract failed complete validation" violations "$violations"
    return 2
  fi
  if [[ "$(jq -r '.approval.state' <<< "$contract")" == "pending-expansion" ]]; then
    _session_state_refuse SESSION_GOAL_UNAUTHORIZED "pending-expansion Goal Contract cannot authorize convergence"
    return 2
  fi

  if ! jq -e 'type == "object" and .actionable == true and .pathVisibility == "local"' >/dev/null 2>&1 <<< "$context"; then
    _session_state_refuse SESSION_AUTHORITY_INVALID "authorized attempt requires a local actionable repository context"
    return 2
  fi

  local context_session context_alias context_root canonical_spec goal_session goal_alias
  context_session="$(jq -r '.sessionId // empty' <<< "$context")"
  context_alias="$(jq -r '.repositoryAlias // empty' <<< "$context")"
  context_root="$(jq -r '.repositoryRoot // empty' <<< "$context")"
  goal_session="$(jq -r '.provenance.sessionId' <<< "$contract")"
  goal_alias="$(jq -r '.provenance.repositoryAlias' <<< "$contract")"
  if [[ "$goal_session" != "$context_session" ]]; then
    _session_state_refuse SESSION_PROVENANCE_SESSION "Goal Contract session does not match repository authority" goalSession "$goal_session" authoritySession "$context_session"
    return 2
  fi
  if [[ "$goal_alias" != "$context_alias" ]]; then
    _session_state_refuse SESSION_PROVENANCE_REPOSITORY "Goal Contract repository alias does not match repository authority" goalRepository "$goal_alias" authorityRepository "$context_alias"
    return 2
  fi

  canonical_spec="$(session_state_canonical_spec "$context_root" "$requested_spec")" || return $?
  local boundary_rc=0
  _session_state_boundary_allows_spec "$contract" "$context_alias" "$context_root" "$canonical_spec" || boundary_rc=$?
  if [[ "$boundary_rc" -eq 1 ]]; then
    _session_state_refuse SESSION_GOAL_BOUNDARY "requested physical spec is outside the Goal Contract work boundary" specDir "$canonical_spec"
    return 2
  fi
  if [[ "$boundary_rc" -ne 0 ]]; then
    return "$boundary_rc"
  fi

  local normalized_dir normalized_file validation_rc=0 goal_id revision digest
  normalized_dir="$(mktemp -d "${TMPDIR:-/tmp}/bubbles-session-attempt.XXXXXX")" || return 3
  normalized_file="$normalized_dir/convergence.json"
  session_state_validate_convergence "$snapshot" "$context_root" "$canonical_spec" "$normalized_file" || validation_rc=$?
  if [[ "$validation_rc" -ne 0 ]]; then
    rm -rf "$normalized_dir"
    return "$validation_rc"
  fi

  goal_id="$(jq -r '.goalId' <<< "$contract")"
  revision="$(jq -r '.revision' <<< "$contract")"
  digest="$(jq -r '.sourceRequestDigest' <<< "$contract")"
  if jq -e --arg goal "$goal_id" --argjson revision "$revision" --arg digest "$digest" '
      any(.[];
        .goalRef != null
        and .goalRef.goalId == $goal
        and .goalRef.revision == $revision
        and .goalRef.sourceRequestDigest != $digest)
    ' "$normalized_file" >/dev/null 2>&1; then
    rm -rf "$normalized_dir"
    _session_state_refuse SESSION_GOAL_IDENTITY_MISMATCH "current goalId and revision appear with a different sourceRequestDigest" specDir "$canonical_spec"
    return 2
  fi
  rm -rf "$normalized_dir"

  jq -cn --arg spec "$canonical_spec" --arg goal "$goal_id" --argjson revision "$revision" --arg digest "$digest" '{
    specDir:$spec,
    goalId:$goal,
    revision:$revision,
    sourceRequestDigest:$digest
  }'
}

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  printf '%s\n' 'session-state-lib: source this library from a Bubbles session-state consumer' >&2
  exit 2
fi
