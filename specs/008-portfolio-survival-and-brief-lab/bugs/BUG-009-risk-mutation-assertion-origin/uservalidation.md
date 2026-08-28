# User Validation: BUG-009 Risk Mutation Assertion Origin

Automation readiness and human acceptance are separate facts with separate
writers, per `.github/bubbles/registry/acceptance-authority.yaml`. Automation
records readiness and holds no acceptance authority. Acceptance below rests on
the operator's explicit dated authorization, transcribed here by automation.

## Automation Readiness

- [x] The exact focused title `BUG-009 risk mapping: unsupported holdings remain
      named exclusions` passes on shipped source. Verified this session: the
      focused run is GREEN 1/1.
- [x] The exact mutation makes that title fail through `ERR_ASSERTION`. Verified
      this session: `strictEqual` reports `'unsupported-holding'` against `'ok'`
      at line 60, carrying the marker `via=Module._compile`.
- [x] The strict registry passes 3/3 with all 18 cases causal. Verified this
      session.
- [x] Full risk, all five BUG-008 carriers, risk browser regression, selftest,
      regression-quality, canonical G028, and packet gates pass. Verified this
      session: the combined full-risk and five-carrier run is 43/43, the risk
      browser regression is 13, `node scripts/selftest.mjs` reports 3429 passed
      and 0 failed, and the regression-quality, installed G028, and packet gates
      are green.
- [ ] Validate-owned certification completes. Unchecked until certification has
      actually completed; it is checked only once `state-transition-guard.sh`
      exits 0 and `status` and `certification.status` read `done`.

## Checklist

This item is checked on the operator's explicit dated authorization of
2026-08-27, transcribed into this file by automation. The tick records the
operator's decision. It is **not** automation's own judgement of acceptance, and
automation asserts no acceptance authority of its own.

- [x] N/A - confirm that the delivered repair changes test infrastructure only
      and requires no separate user-interface acceptance.

## Human Acceptance Record

- acceptedBy: pkirsanov
- acceptedAt: 2026-08-27
- method: external-record
- record: Operator authorization issued verbatim in the 2026-08-27 Bubbles working session for this repository - "authorized, approved, update all user validations as approved" and "Don't stop for user review, commit, continue, user approves all".

The method is `external-record` rather than `human-interactive` because that is
what actually happened. The operator granted approval on the basis of the
verification reported to them; they did not separately exercise the delivered
behavior in a live session. The operator's dated session directive **is** the
external record. No UAT ticket, sign-off identifier, or other external artifact
exists, and none is claimed.

The operator's authorization is quoted verbatim above. Its two clauses were,
in order: "authorized, approved, update all user validations as approved" and
"Don't stop for user review, commit, continue, user approves all".

## Evidence

Automation evidence is recorded in [report.md](report.md). The Automation
Readiness block above is automation-written and grants no acceptance. The
Checklist tick and the Human Acceptance Record carry the operator's dated
authorization and are the only acceptance-granting statements in this file.