#!/usr/bin/env bash
set -euo pipefail

# adversarial-resolve.sh
#
# Adversarial-verification posture resolver (IMP-002 SCOPE-0 / control plane, C8).
#
# Resolves the EFFECTIVE adversarial posture (mode / samples / teeth) for a run
# from one layered precedence chain (highest wins), mirroring the shipped
# observability-endpoint-resolve.sh and the dual-trust resolver:
#
#   1. Per-run directive   (--mode/--samples/--teeth, or --directive "<string>")
#   2. Environment         (BUBBLES_ADVERSARIAL / _SAMPLES / _TEETH)
#   3. Project config      (.github/bubbles-project.yaml `adversarial:` block)
#   4. Framework default   (mode=off, samples=1, teeth=warn)
#
# The capability is OFF BY DEFAULT (mode=off): a zero-config repo resolves to
# `off` and adversarial verification does nothing — zero behavior change on
# upgrade. A team opts in seamlessly: session/CI via BUBBLES_ADVERSARIAL=auto,
# repo-wide via the `adversarial:` config block, or for a single agent/workflow
# run via the directive layer.
#
# Vocabulary:
#   mode   = off  → never run; auto → run only on high-risk scopes (riskClass
#                   gated); on → run for this scope regardless of risk.
#   samples = N   → number of correlated evaluations requested in the active
#                   runtime. One sample is the normal default. Positive integer.
#   teeth  = warn → a red-team counterexample is a recorded finding (default,
#                   grandfathered like G101); blocking → it blocks certification.
#
# `passes` is a deprecated compatibility alias at every input layer. Canonical
# `samples` wins when both are present at the same layer. Alias use is reported
# on stderr and in the stable `deprecation` output field.
#
# Parser dependency: `yq` (mikefarah v4) for the config layer ONLY. A missing yq
# WARN-and-skips the config layer (stderr note, resolution continues) — a missing
# developer tool must not hard-fail a resolution helper. Directive + env + the
# off-by-default still resolve without yq.
#
# There is NO bypass flag. `--skip` / `--force` / `--ignore` do not exist.
#
# Output (stdout) — eval-friendly KEY=VALUE lines:
#   mode=<off|auto|on>
#   samples=<N>
#   sampleSemantics=same-runtime-correlated
#   teeth=<warn|blocking>
#   source=<directive|env|config|default>   (which layer set `mode`)
#   samplesSource=<directive|env|config|default>
#   deprecation=<none|passes-alias>
#
# Exit codes:
#   0  resolved (incl. mode=off and yq-missing config WARN-and-skip)
#   1  validation failure (invalid mode/samples/teeth)
#   2  usage error (unknown flag / missing required option value)
#
# Reference: improvements/IMP-020-agentic-evaluation-and-trust-hardening.md (S2)

DEFAULT_MODE="off"
DEFAULT_SAMPLES="1"
DEFAULT_TEETH="warn"
SAMPLE_SEMANTICS="same-runtime-correlated"

SCRIPT_SOURCE="${BASH_SOURCE[0]}"
SCRIPT_DIR="$(cd "${SCRIPT_SOURCE%/*}" 2>/dev/null && pwd)"

REPO_ROOT_ARG=""
DIR_MODE=""
DIR_SAMPLES=""
DIR_PASSES=""
DIR_TEETH=""
DIRECTIVE_STR=""
SAMPLES_FLAG_SEEN=0
PASSES_FLAG_SEEN=0

usage() {
  cat <<'EOF'
Usage: bash bubbles/scripts/adversarial-resolve.sh [--mode <m>] [--samples <n>] [--passes <n>] [--teeth <t>] [--directive "<str>"] [--repo-root <dir>]

Resolve the effective adversarial posture (mode/samples/teeth) from the precedence
chain: per-run directive -> BUBBLES_ADVERSARIAL* env -> bubbles-project.yaml
`adversarial:` block -> framework default (off).

Options:
  --mode <off|auto|on>      Per-run mode (directive layer, highest precedence).
  --samples <N>             Per-run correlated sample count (positive integer).
  --passes <N>              Deprecated compatibility alias for --samples.
  --teeth <warn|blocking>   Per-run teeth.
  --directive "<str>"       Free-form per-run string; mode:/samples:/teeth: tokens
                            are extracted (what an orchestrator forwards from
                            $ADDITIONAL_CONTEXT, e.g. "adversarial: on samples: 3").
                            The deprecated passes: token remains accepted.
                            Explicit --mode/--samples/--passes/--teeth override the same
                            token inside --directive.
  --repo-root <dir>         Repo root to scan for bubbles-project.yaml
                            (default: the repo this script lives in).
  -h, --help                Print this usage and exit 0.

Exit codes: 0 resolved (incl. off / yq-missing) | 1 invalid value | 2 usage.
There is NO --skip/--force/--ignore bypass. OFF BY DEFAULT.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    --mode)
      shift
      [[ $# -gt 0 ]] || { echo "adversarial-resolve: --mode requires a value" >&2; exit 2; }
      DIR_MODE="$1"
      shift
      ;;
    --passes)
      if [[ "$PASSES_FLAG_SEEN" -eq 1 ]]; then
        echo "adversarial-resolve: duplicate --passes flag is ambiguous" >&2
        exit 2
      fi
      PASSES_FLAG_SEEN=1
      shift
      [[ $# -gt 0 ]] || { echo "adversarial-resolve: --passes requires a value" >&2; exit 2; }
      DIR_PASSES="$1"
      shift
      ;;
    --samples)
      if [[ "$SAMPLES_FLAG_SEEN" -eq 1 ]]; then
        echo "adversarial-resolve: duplicate --samples flag is ambiguous" >&2
        exit 2
      fi
      SAMPLES_FLAG_SEEN=1
      shift
      [[ $# -gt 0 ]] || { echo "adversarial-resolve: --samples requires a value" >&2; exit 2; }
      DIR_SAMPLES="$1"
      shift
      ;;
    --teeth)
      shift
      [[ $# -gt 0 ]] || { echo "adversarial-resolve: --teeth requires a value" >&2; exit 2; }
      DIR_TEETH="$1"
      shift
      ;;
    --directive)
      shift
      [[ $# -gt 0 ]] || { echo "adversarial-resolve: --directive requires a value" >&2; exit 2; }
      DIRECTIVE_STR="$1"
      shift
      ;;
    --repo-root)
      shift
      [[ $# -gt 0 ]] || { echo "adversarial-resolve: --repo-root requires a value" >&2; exit 2; }
      REPO_ROOT_ARG="$1"
      shift
      ;;
    *)
      echo "adversarial-resolve: unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

# Extract standalone token values from the free-form directive string. Keys
# embedded in ASCII identifiers (including underscore and hyphen) are ignored.
directive_tokens() {
  local key_spec="$1"
  [[ -n "$DIRECTIVE_STR" ]] || return 0
  printf '%s\n' "$DIRECTIVE_STR" | awk -v key_spec="$key_spec" '
    BEGIN {
      key_count = split(tolower(key_spec), keys, /[|]/)
    }
    {
      text = tolower($0)
      text_length = length(text)
      for (position = 1; position <= text_length; position++) {
        previous = position > 1 ? substr(text, position - 1, 1) : ""
        if (previous ~ /[A-Za-z0-9_-]/) continue

        for (key_index = 1; key_index <= key_count; key_index++) {
          key = keys[key_index]
          if (substr(text, position, length(key)) != key) continue

          cursor = position + length(key)
          if (substr(text, cursor, 1) ~ /[A-Za-z0-9_-]/) continue
          while (substr(text, cursor, 1) ~ /[[:space:]]/) cursor++
          separator = substr(text, cursor, 1)
          if (separator != ":" && separator != "=") continue

          cursor++
          while (substr(text, cursor, 1) ~ /[[:space:]]/) cursor++
          value_start = cursor
          while (substr(text, cursor, 1) ~ /[A-Za-z0-9]/) cursor++
          if (cursor == value_start) continue

          print substr(text, value_start, cursor - value_start)
          position = cursor - 1
          break
        }
      }
    }
  '
}

directive_token() {
  directive_tokens "$1" | sed -n '1p'
}

validate_directive_duplicates() {
  local key count
  [[ -n "$DIRECTIVE_STR" ]] || return 0
  for key in adversarial mode samples passes teeth; do
    count="$(
      directive_tokens "$key" \
        | wc -l \
        | tr -d '[:space:]' \
        || true
    )"
    if [[ "${count:-0}" -gt 1 ]]; then
      echo "adversarial-resolve: duplicate ${key} directive token is ambiguous" >&2
      exit 2
    fi
  done
}

# Resolve repo root.
REPO_ROOT="${REPO_ROOT_ARG:-}"
if [[ -z "$REPO_ROOT" ]]; then
  REPO_ROOT="$(cd "$SCRIPT_DIR/../.." 2>/dev/null && pwd)"
fi

# --- Config layer: adversarial.{mode,samples,teeth} from bubbles-project.yaml ---
CFG_MODE=""
CFG_SAMPLES=""
CFG_PASSES=""
CFG_TEETH=""
config_file=""
for c in "$REPO_ROOT/.github/bubbles-project.yaml" "$REPO_ROOT/bubbles-project.yaml"; do
  if [[ -f "$c" ]]; then
    config_file="$c"
    break
  fi
done
if [[ -n "$config_file" ]]; then
  if command -v yq >/dev/null 2>&1; then
    CFG_MODE="$(yq '.adversarial.mode' "$config_file" 2>/dev/null || true)"
    CFG_SAMPLES="$(yq '.adversarial.samples' "$config_file" 2>/dev/null || true)"
    CFG_PASSES="$(yq '.adversarial.passes' "$config_file" 2>/dev/null || true)"
    CFG_TEETH="$(yq '.adversarial.teeth' "$config_file" 2>/dev/null || true)"
    if [[ "$CFG_MODE" == "null" ]]; then CFG_MODE=""; fi
    if [[ "$CFG_SAMPLES" == "null" ]]; then CFG_SAMPLES=""; fi
    if [[ "$CFG_PASSES" == "null" ]]; then CFG_PASSES=""; fi
    if [[ "$CFG_TEETH" == "null" ]]; then CFG_TEETH=""; fi
  else
    echo "adversarial-resolve: yq not found — skipping config layer (directive/env/default still apply)" >&2
  fi
fi

# --- Directive layer (explicit flags override --directive tokens) ---
validate_directive_duplicates
if [[ -z "$DIR_MODE" ]]; then DIR_MODE="$(directive_token 'adversarial|mode')"; fi
if [[ -z "$DIR_SAMPLES" ]]; then DIR_SAMPLES="$(directive_token 'samples')"; fi
if [[ -z "$DIR_PASSES" ]]; then DIR_PASSES="$(directive_token 'passes')"; fi
if [[ -z "$DIR_TEETH" ]]; then DIR_TEETH="$(directive_token 'teeth')"; fi

# --- Env layer ---
ENV_MODE="${BUBBLES_ADVERSARIAL:-}"
ENV_SAMPLES="${BUBBLES_ADVERSARIAL_SAMPLES:-}"
ENV_PASSES="${BUBBLES_ADVERSARIAL_PASSES:-}"
ENV_TEETH="${BUBBLES_ADVERSARIAL_TEETH:-}"

validate_count() {
  local label="$1" value="$2"
  [[ -z "$value" ]] && return 0
  if ! printf '%s' "$value" | grep -qE '^[1-9][0-9]*$'; then
    echo "adversarial-resolve: invalid ${label} '${value}' (expected positive integer)" >&2
    exit 1
  fi
}

# --- Precedence resolution: directive > env > config > default ---
# Echoes "value|source".
resolve_layer() {
  local directive="$1" env_val="$2" cfg="$3" def="$4"
  if [[ -n "$directive" ]]; then printf '%s|directive\n' "$directive"; return; fi
  if [[ -n "$env_val" ]]; then printf '%s|env\n' "$env_val"; return; fi
  if [[ -n "$cfg" ]]; then printf '%s|config\n' "$cfg"; return; fi
  printf '%s|default\n' "$def"
}

mode_r="$(resolve_layer "$DIR_MODE" "$ENV_MODE" "$CFG_MODE" "$DEFAULT_MODE")"
samples_r="$(resolve_layer "${DIR_SAMPLES:-$DIR_PASSES}" "${ENV_SAMPLES:-$ENV_PASSES}" "${CFG_SAMPLES:-$CFG_PASSES}" "$DEFAULT_SAMPLES")"
teeth_r="$(resolve_layer "$DIR_TEETH" "$ENV_TEETH" "$CFG_TEETH" "$DEFAULT_TEETH")"

MODE="${mode_r%%|*}"
MODE_SRC="${mode_r##*|}"
SAMPLES="${samples_r%%|*}"
SAMPLES_SRC="${samples_r##*|}"
TEETH="${teeth_r%%|*}"

case "$SAMPLES_SRC" in
  directive)
    if [[ -n "$DIR_SAMPLES" ]]; then SAMPLES_LABEL="samples"; else SAMPLES_LABEL="passes alias"; fi
    ;;
  env)
    if [[ -n "$ENV_SAMPLES" ]]; then SAMPLES_LABEL="BUBBLES_ADVERSARIAL_SAMPLES"; else SAMPLES_LABEL="BUBBLES_ADVERSARIAL_PASSES alias"; fi
    ;;
  config)
    if [[ -n "$CFG_SAMPLES" ]]; then SAMPLES_LABEL="config adversarial.samples"; else SAMPLES_LABEL="config adversarial.passes alias"; fi
    ;;
  default) SAMPLES_LABEL="samples" ;;
esac

MODE="$(printf '%s' "$MODE" | tr '[:upper:]' '[:lower:]')"
TEETH="$(printf '%s' "$TEETH" | tr '[:upper:]' '[:lower:]')"

# --- Validate ---
validate_count "$SAMPLES_LABEL" "$SAMPLES"
case "$MODE" in
  off|auto|on) ;;
  *) echo "adversarial-resolve: invalid mode '$MODE' (expected off|auto|on)" >&2; exit 1 ;;
esac
case "$TEETH" in
  warn|blocking) ;;
  *) echo "adversarial-resolve: invalid teeth '$TEETH' (expected warn|blocking)" >&2; exit 1 ;;
esac
DEPRECATION="none"
deprecated_layers=""
case "$SAMPLES_SRC" in
  directive) [[ -z "$DIR_PASSES" ]] || deprecated_layers="directive" ;;
  env) [[ -z "$ENV_PASSES" ]] || deprecated_layers="env" ;;
  config) [[ -z "$CFG_PASSES" ]] || deprecated_layers="config" ;;
esac
if [[ -n "$deprecated_layers" ]]; then
  DEPRECATION="passes-alias"
  echo "adversarial-resolve: DEPRECATED: passes alias used at layer(s): ${deprecated_layers}; use samples instead" >&2
fi

printf 'mode=%s\n' "$MODE"
printf 'samples=%s\n' "$SAMPLES"
printf 'sampleSemantics=%s\n' "$SAMPLE_SEMANTICS"
printf 'teeth=%s\n' "$TEETH"
printf 'source=%s\n' "$MODE_SRC"
printf 'samplesSource=%s\n' "$SAMPLES_SRC"
printf 'deprecation=%s\n' "$DEPRECATION"
