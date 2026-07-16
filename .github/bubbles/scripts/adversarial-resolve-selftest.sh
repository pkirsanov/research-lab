#!/usr/bin/env bash
set -uo pipefail

# adversarial-resolve-selftest.sh — IMP-020 S2 posture resolver contract.
#
# ADVERSARIAL by design: canonical samples must beat the deprecated passes
# alias at the same layer, while directive > env > config > default precedence
# remains observable. Invalid counts and bypass-shaped flags must fail closed.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESOLVE="$SCRIPT_DIR/adversarial-resolve.sh"

pass=0
fail=0
RUN_STDOUT=""
RUN_STDERR=""
RUN_STATUS=0

# Keep fixtures under HOME so snap-confined binaries can read them. A tiny yq
# shim makes config-layer coverage hermetic and supports only this fixture shape.
tmp="$(mktemp -d "${HOME}/.bubbles-selftest-adversarial-resolve.XXXXXX")"
trap 'rm -rf "$tmp"' EXIT
empty_repo="$tmp/empty"
config_repo="$tmp/config"
config_both_repo="$tmp/config-both"
config_alias_repo="$tmp/config-alias"
config_invalid_repo="$tmp/config-invalid"
mkdir -p \
  "$empty_repo/.github" \
  "$config_repo/.github" \
  "$config_both_repo/.github" \
  "$config_alias_repo/.github" \
  "$config_invalid_repo/.github" \
  "$tmp/bin"
cat > "$tmp/bin/yq" <<'YQ'
#!/usr/bin/env bash
set -eu
query="$1"
file="$2"
key="${query##*.}:"
awk -v wanted="$key" '
  $1 == wanted { print $2; found = 1; exit }
  END { if (!found) print "null" }
' "$file"
YQ
chmod +x "$tmp/bin/yq"
printf 'adversarial:\n  mode: auto\n  samples: 4\n  teeth: blocking\n' \
  > "$config_repo/.github/bubbles-project.yaml"
printf 'adversarial:\n  samples: 6\n  passes: 9\n' \
  > "$config_both_repo/.github/bubbles-project.yaml"
printf 'adversarial:\n  passes: 7\n' \
  > "$config_alias_repo/.github/bubbles-project.yaml"
printf 'adversarial:\n  samples: 0\n' \
  > "$config_invalid_repo/.github/bubbles-project.yaml"

TEST_PATH="$tmp/bin:$PATH"
record_pass() {
  pass=$((pass + 1))
}
record_fail() {
  echo "FAIL: $1"
  fail=$((fail + 1))
}

assert_status() { # label expected
  if [[ "$RUN_STATUS" -eq "$2" ]]; then
    record_pass
  else
  record_fail "$1 (expected status $2, got $RUN_STATUS)"
  printf '%s\n' "$RUN_STDOUT" | sed 's/^/    stdout: /'
  printf '%s\n' "$RUN_STDERR" | sed 's/^/    stderr: /'
  fi
}

assert_eq() { # label actual expected
  if [[ "$2" == "$3" ]]; then
    record_pass
  else
  record_fail "$1"
  printf '    expected: %s\n' "$3"
  printf '    actual:   %s\n' "$2"
  fi
}

assert_line() { # label output exact-line
  if printf '%s\n' "$2" | grep -Fqx -- "$3"; then
    record_pass
  else
    record_fail "$1 (missing line: $3)"
    printf '%s\n' "$2" | sed 's/^/    /'
  fi
}

assert_match() { # label output extended-regex
  if printf '%s\n' "$2" | grep -Eqi -- "$3"; then
    record_pass
  else
    record_fail "$1 (missing pattern: $3)"
    printf '%s\n' "$2" | sed 's/^/    /'
  fi
}

assert_not_match() { # label output extended-regex
  if printf '%s\n' "$2" | grep -Eqi -- "$3"; then
    record_fail "$1 (unexpected pattern: $3)"
    printf '%s\n' "$2" | sed 's/^/    /'
  else
    record_pass
  fi
}

run_resolver() {
  local stderr_file="$tmp/resolver.stderr"
  RUN_STDOUT=""
  RUN_STDERR=""
  RUN_STATUS=0
  if RUN_STDOUT="$(env -i PATH="$TEST_PATH" "$@" 2>"$stderr_file")"; then
    RUN_STATUS=0
  else
    RUN_STATUS=$?
  fi
  RUN_STDERR="$(cat "$stderr_file")"
}

assert_alias_result() { # label expected-samples expected-source expected-layer
  local label="$1"
  assert_status "$label exits zero" 0
  assert_line "$label resolves samples" "$RUN_STDOUT" "samples=$2"
  assert_line "$label records source" "$RUN_STDOUT" "samplesSource=$3"
  assert_line "$label records deprecation" "$RUN_STDOUT" "deprecation=passes-alias"
  assert_match "$label warns on stderr" "$RUN_STDERR" "DEPRECATED: passes alias used at layer\\(s\\): $4; use samples instead"
  assert_not_match "$label emits no legacy passes key" "$RUN_STDOUT" '^passes='
}

# 1. The zero-config output is canonical and defaults to one correlated sample.
run_resolver bash "$RESOLVE" --repo-root "$empty_repo"
expected_default="$(printf '%s\n' \
  'mode=off' \
  'samples=1' \
  'sampleSemantics=same-runtime-correlated' \
  'teeth=warn' \
  'source=default' \
  'samplesSource=default' \
  'deprecation=none')"
assert_status "default exits zero" 0
assert_eq "default output is canonical" "$RUN_STDOUT" "$expected_default"
assert_eq "default stderr is empty" "$RUN_STDERR" ""
assert_not_match "default emits no passes key" "$RUN_STDOUT" '^passes='

# 2. Explicit --samples is the canonical directive-layer flag.
run_resolver bash "$RESOLVE" --repo-root "$empty_repo" --mode on --samples 3
assert_status "--samples exits zero" 0
assert_line "--samples resolves count" "$RUN_STDOUT" "samples=3"
assert_line "--samples records directive source" "$RUN_STDOUT" "samplesSource=directive"
assert_line "active output labels correlated samples" "$RUN_STDOUT" "sampleSemantics=same-runtime-correlated"
assert_line "canonical flag has no deprecation" "$RUN_STDOUT" "deprecation=none"
assert_not_match "active output has no independence or majority value" "$RUN_STDOUT" '(^|=).*(independent|vote|consensus|ensemble)'
assert_not_match "active output emits no passes key" "$RUN_STDOUT" '^passes='

# 3. Canonical samples resolve independently at env, config, and directive-string layers.
run_resolver BUBBLES_ADVERSARIAL_SAMPLES=5 bash "$RESOLVE" --repo-root "$empty_repo"
assert_status "env samples exits zero" 0
assert_line "env samples resolves count" "$RUN_STDOUT" "samples=5"
assert_line "env samples records source" "$RUN_STDOUT" "samplesSource=env"

run_resolver bash "$RESOLVE" --repo-root "$config_repo"
assert_status "config samples exits zero" 0
assert_line "config samples resolves count" "$RUN_STDOUT" "samples=4"
assert_line "config samples records source" "$RUN_STDOUT" "samplesSource=config"
assert_line "config mode resolves" "$RUN_STDOUT" "mode=auto"
assert_line "config teeth resolves" "$RUN_STDOUT" "teeth=blocking"

run_resolver bash "$RESOLVE" --repo-root "$empty_repo" --directive "adversarial: on samples: 8 teeth: blocking"
assert_status "directive-string samples exits zero" 0
assert_line "directive-string samples resolves count" "$RUN_STDOUT" "samples=8"
assert_line "directive-string samples records source" "$RUN_STDOUT" "samplesSource=directive"

# 4. The full precedence chain is directive > env > config > default.
run_resolver BUBBLES_ADVERSARIAL_SAMPLES=5 bash "$RESOLVE" --repo-root "$config_repo"
assert_status "env-over-config exits zero" 0
assert_line "env beats config" "$RUN_STDOUT" "samples=5"
assert_line "env-over-config source" "$RUN_STDOUT" "samplesSource=env"

run_resolver BUBBLES_ADVERSARIAL_SAMPLES=5 bash "$RESOLVE" --repo-root "$config_repo" --directive "samples: 8"
assert_status "directive-over-env-config exits zero" 0
assert_line "directive beats env and config" "$RUN_STDOUT" "samples=8"
assert_line "directive-over-env-config source" "$RUN_STDOUT" "samplesSource=directive"

# 5. Only the selected canonical count is validated; shadowed invalid counts
# cannot reject a valid higher-precedence value.
run_resolver BUBBLES_ADVERSARIAL_SAMPLES=0 bash "$RESOLVE" --repo-root "$empty_repo" --samples 3
assert_status "directive samples shadows invalid env samples" 0
assert_line "directive samples survives invalid env samples" "$RUN_STDOUT" "samples=3"
assert_line "directive samples owns shadowed-env result" "$RUN_STDOUT" "samplesSource=directive"
assert_line "directive samples over invalid env has no deprecation" "$RUN_STDOUT" "deprecation=none"
assert_eq "shadowed invalid env emits no diagnostic" "$RUN_STDERR" ""

run_resolver BUBBLES_ADVERSARIAL_SAMPLES=5 bash "$RESOLVE" --repo-root "$config_invalid_repo"
assert_status "env samples shadows invalid config samples" 0
assert_line "env samples survives invalid config samples" "$RUN_STDOUT" "samples=5"
assert_line "env samples owns shadowed-config result" "$RUN_STDOUT" "samplesSource=env"
assert_line "env samples over invalid config has no deprecation" "$RUN_STDOUT" "deprecation=none"
assert_eq "shadowed invalid config emits no diagnostic" "$RUN_STDERR" ""

# 6. Canonical samples wins over passes at every same-layer collision. Under
# the current compatibility contract, a present but shadowed alias is still
# reported as deprecated even when its value is invalid and never selected.
run_resolver bash "$RESOLVE" --repo-root "$empty_repo" --samples 6 --passes 9
assert_alias_result "canonical flag over alias flag" 6 directive directive

run_resolver bash "$RESOLVE" --repo-root "$empty_repo" --samples 3 --passes 0
assert_alias_result "canonical flag over invalid alias flag" 3 directive directive
assert_not_match "shadowed invalid alias is not validated" "$RUN_STDERR" "invalid passes alias '0'"

run_resolver BUBBLES_ADVERSARIAL_SAMPLES=6 BUBBLES_ADVERSARIAL_PASSES=9 bash "$RESOLVE" --repo-root "$empty_repo"
assert_alias_result "canonical env over alias env" 6 env env

run_resolver bash "$RESOLVE" --repo-root "$config_both_repo"
assert_alias_result "canonical config over alias config" 6 config config

run_resolver bash "$RESOLVE" --repo-root "$empty_repo" --directive "samples: 6 passes: 9"
assert_alias_result "canonical directive token over alias token" 6 directive directive

# 7. Each deprecated alias resolves to samples and emits metadata plus warning.
run_resolver bash "$RESOLVE" --repo-root "$empty_repo" --passes 2
assert_alias_result "deprecated --passes" 2 directive directive

run_resolver BUBBLES_ADVERSARIAL_PASSES=3 bash "$RESOLVE" --repo-root "$empty_repo"
assert_alias_result "deprecated env passes" 3 env env

run_resolver bash "$RESOLVE" --repo-root "$config_alias_repo"
assert_alias_result "deprecated config passes" 7 config config

run_resolver bash "$RESOLVE" --repo-root "$empty_repo" --directive "passes: 5"
assert_alias_result "deprecated directive passes" 5 directive directive

# 8. Directive extraction accepts exact keys only. Longer identifiers,
# hyphenated identifiers, underscored identifiers, and prose without a key/value
# separator must leave the default count and deprecation metadata untouched.
for ignored_directive in \
  "resamples: 7 compasses: 9" \
  "my-samples: 7" \
  "passes_extra: 9" \
  "please use samples 7 for this run"; do
  run_resolver bash "$RESOLVE" --repo-root "$empty_repo" --directive "$ignored_directive"
  assert_status "non-key directive '$ignored_directive' exits zero" 0
  assert_line "non-key directive '$ignored_directive' keeps default samples" "$RUN_STDOUT" "samples=1"
  assert_line "non-key directive '$ignored_directive' keeps default source" "$RUN_STDOUT" "samplesSource=default"
  assert_line "non-key directive '$ignored_directive' has no deprecation" "$RUN_STDOUT" "deprecation=none"
  assert_eq "non-key directive '$ignored_directive' emits no warning" "$RUN_STDERR" ""
done

# 9. Duplicate flags and duplicate exact directive tokens are usage errors, not
# last-value-wins. A usage error must not expose a partial resolved posture.
run_resolver bash "$RESOLVE" --repo-root "$empty_repo" --samples 2 --samples 3
assert_status "duplicate --samples rejected" 2
assert_match "duplicate --samples explains ambiguity" "$RUN_STDERR" 'duplicate --samples flag is ambiguous'

run_resolver bash "$RESOLVE" --repo-root "$empty_repo" --passes 2 --passes 3
assert_status "duplicate --passes rejected" 2
assert_match "duplicate --passes explains ambiguity" "$RUN_STDERR" 'duplicate --passes flag is ambiguous'

run_resolver bash "$RESOLVE" --repo-root "$empty_repo" --directive "samples: 2 samples: 3"
assert_status "duplicate samples directive token rejected" 2
assert_match "duplicate samples directive token explains ambiguity" "$RUN_STDERR" 'duplicate samples directive token is ambiguous'
assert_eq "duplicate samples directive token emits no stdout" "$RUN_STDOUT" ""

run_resolver bash "$RESOLVE" --repo-root "$empty_repo" --directive "passes: 2 passes: 3"
assert_status "duplicate passes directive token rejected" 2
assert_match "duplicate passes directive token explains ambiguity" "$RUN_STDERR" 'duplicate passes directive token is ambiguous'
assert_eq "duplicate passes directive token emits no stdout" "$RUN_STDOUT" ""

run_resolver bash "$RESOLVE" --repo-root "$empty_repo" --directive "mode: on mode: off"
assert_status "duplicate mode directive token rejected" 2
assert_match "duplicate mode directive token explains ambiguity" "$RUN_STDERR" 'duplicate mode directive token is ambiguous'
assert_eq "duplicate mode directive token emits no stdout" "$RUN_STDOUT" ""

run_resolver bash "$RESOLVE" --repo-root "$empty_repo" --directive "teeth: warn teeth: blocking"
assert_status "duplicate teeth directive token rejected" 2
assert_match "duplicate teeth directive token explains ambiguity" "$RUN_STDERR" 'duplicate teeth directive token is ambiguous'
assert_eq "duplicate teeth directive token emits no stdout" "$RUN_STDOUT" ""

# 10. Invalid counts fail at every canonical input layer and through the alias.
run_resolver bash "$RESOLVE" --repo-root "$empty_repo" --samples 0
assert_status "zero flag samples rejected" 1
assert_match "zero flag samples diagnostic" "$RUN_STDERR" "invalid samples '0'"

run_resolver bash "$RESOLVE" --repo-root "$empty_repo" --samples abc
assert_status "nonnumeric flag samples rejected" 1
assert_match "nonnumeric flag samples diagnostic" "$RUN_STDERR" "invalid samples 'abc'"

run_resolver BUBBLES_ADVERSARIAL_SAMPLES=0 bash "$RESOLVE" --repo-root "$empty_repo"
assert_status "zero env samples rejected" 1
assert_match "zero env samples diagnostic" "$RUN_STDERR" "invalid BUBBLES_ADVERSARIAL_SAMPLES '0'"

run_resolver BUBBLES_ADVERSARIAL_SAMPLES=0 bash "$RESOLVE" --repo-root "$config_repo"
assert_status "selected invalid env samples rejected over valid config" 1
assert_match "selected invalid env samples retains env diagnostic" "$RUN_STDERR" "invalid BUBBLES_ADVERSARIAL_SAMPLES '0'"
assert_eq "selected invalid env samples emits no stdout" "$RUN_STDOUT" ""

run_resolver bash "$RESOLVE" --repo-root "$config_invalid_repo"
assert_status "zero config samples rejected" 1
assert_match "zero config samples diagnostic" "$RUN_STDERR" "invalid config adversarial.samples '0'"

run_resolver bash "$RESOLVE" --repo-root "$empty_repo" --directive "samples: 0"
assert_status "zero directive samples rejected" 1
assert_match "zero directive samples diagnostic" "$RUN_STDERR" "invalid samples '0'"

run_resolver bash "$RESOLVE" --repo-root "$empty_repo" --passes 0
assert_status "zero passes alias rejected" 1
assert_match "zero passes alias diagnostic" "$RUN_STDERR" "invalid passes alias '0'"

# 11. Bypass-shaped flags do not exist.
for bypass_flag in --force --skip --ignore; do
  run_resolver bash "$RESOLVE" --repo-root "$empty_repo" "$bypass_flag"
  assert_status "$bypass_flag rejected" 2
  assert_match "$bypass_flag reported unknown" "$RUN_STDERR" "unknown option: $bypass_flag"
done

echo "adversarial-resolve-selftest: $pass passed, $fail failed"
if [[ "$fail" -ne 0 ]]; then
  exit 1
fi
echo "PASS"
