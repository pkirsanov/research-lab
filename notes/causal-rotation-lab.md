# Causal Rotation Lab

## Purpose

A sector or country can move for a reason, or it can simply move. This tool exists to keep those
two things apart. It reads a committed observation set and asks, for each rotation hypothesis,
whether there is a sourced mechanism that was visible **before** the move, supported by evidence
that is genuinely independent, and accompanied by conditions that would prove it wrong.

The output is a **stage** describing how strong the causal evidence is. It is never a forecast, a
position, an allocation, or an expected return. A candidate that reaches the strongest stage is
saying "the evidence is confirmed", not "buy this".

## Current Truth

- Evaluation is a pure function of `causal-rotation.config.json`, `causal-rotation-observations.json`,
  and an `asOf` instant. No network call and no live market data participate.
- `rlcausal.js` owns every calculation. The page, the Simple adapter, the consumer overlay, and the
  Tier-A brief adapter all read the same evaluator; none of them re-implements a rule.
- The committed observation set is research fixture data with explicit source, availability time,
  and freshness fields. It is not a live feed and does not refresh itself.

## One Compute Owner

`render()` evaluates exactly one snapshot into `runtime.snapshot`. Every renderer, chart, recorder,
owner read, and export draws from that single frozen value. This is why the page declares
`simpleWiring.state: "declared-unwired"` in `tools.json`: wiring the generic Simple provider would
create a second Simple truth surface over the same evaluation, and the two could disagree.

The registered Simple adapter (`simple-adapter/causal-rotation-stage/v1`) does not recompute
either. The owner freezes one `rlcausal` evaluation per posture and overlay it offers, and the
adapter selects among those frozen results.

## Anti-Hindsight

Evidence is admitted only if it was available before the price move it is being used to explain.
This is the single rule that most often removes a comfortable story. An observation that was
published after the move is visible in the timeline but cannot support a candidate.

## Independence

One story told twice is not two confirmations. Observations are clustered so that a company
statement, the wire report of that statement, and an analyst note restating it collapse into one
cluster. Sensitivity postures set how many **independent, non-market** clusters a candidate needs:

| Posture | Meaning |
|---|---|
| `discovery` | Widest view. Shows early candidates that have not been confirmed. |
| `balanced` | Requires more independent support before a candidate is visible. |
| `confirmation` | Narrowest view. Only well-supported candidates remain. |

The `tightened` risk overlay additionally demands more independent clusters and a confirming
market state before a candidate is eligible for plan comparison.

## Stages

`falsified`, `expired`, `contradicted`, `established`, `confirmable`, `watch`, `cause-emerging`.

A stage answers "how strong is the evidence", not "what will happen". `planEligible` means the
confirmation conditions are met, so the candidate may be **compared** against a plan. It does not
mean a trade is advised.

## Falsification

Every candidate carries the conditions that would retire it. A candidate with no stateable
falsifier is a weaker research object than one with a sharp falsifier, and the tool shows that
rather than hiding it.

## Decisions, Outcomes And Corrections

Three event types, all append-only, all browser-local:

- **decision** - freezes the candidate digest, posture, overlay, policy version and evidence refs
  exactly as they are at that moment, with a `decisionDigest` over the frozen bytes.
- **outcome** - records how it resolved. The state is **derived** by re-evaluating the same
  candidate against current evidence, never asserted by the operator. A candidate the model can no
  longer evaluate stays explicitly `unresolved` rather than silently resolving.
- **correction** - references an earlier event and appends. The original stays visible.

A decision's frozen bytes are never reopened to record what later happened to it, which is why
outcomes live in their own store (`rlCausalOutcomesV1`) rather than being written back onto the
decision (`rlCausalDecisionsV1`).

The Outcome history panel lists confirmations, falsifications, expiries and unresolved records
together with exposure, posture and policy version. An empty history reports **insufficient
history** explicitly; it must never read as a clean track record.

## Import And Export

Import is all-or-nothing. Every line must parse, carry the ledger contract, and match its own
content digest. One bad line refuses the entire file, so a partial import can never land. A note
naming a private portfolio or credential field refuses the whole append rather than silently
stripping it.

## Simple/Power Split

Simple answers one question: which candidate carries the strongest causal evidence right now,
what stage does it reach, and is it plan-eligible. The posture and overlay levers are live, so the
verdict updates without refetching anything.

Power exposes the candidate table, evidence clusters, clock view, contradiction ordering, the
sensitivity explanation, the chart, and the decision recorder with outcome history.

## Consumers

Three owner pages render a causal context strip through `rlcausalconsumer.js`:
`sector-research-lab.html`, `global-rotation-lab.html`, `real-assets-lab.html`. The overlay is
strictly read-only over those pages; shared canaries assert their verdicts and ordering are
byte-identical with the causal bridge disabled.

The Tier-A brief publishes a causal read that is coverage-only by design. A causal stage informs
what to watch; it does not enter the plan.

## Validation

```bash
node scripts/selftest.mjs
node scripts/validate-causal-rotation.mjs
node --test tests/causal-rotation-*.mjs
npx playwright test --project=system-chrome tests/causal-rotation-lab.spec.mjs
```

## Known Limitations

- The observation set is committed research fixture data, not a live feed. Freshness is declared
  per observation and does not update on its own.
- Timing reads cover the exposures the owner models actually publish. `exp:banks`,
  `exp:semiconductors` and `exp:energy-equities` publish `unavailable` with a stated reason rather
  than borrowing a state from a broader sector read.
- Outcome derivation reads the candidate's current stage. Confirmation and invalidation conditions
  carry no per-condition satisfied flag, so a partially satisfied condition set is not visible.
- The ledger is browser-local. Export is the only way to move decisions off one machine.
