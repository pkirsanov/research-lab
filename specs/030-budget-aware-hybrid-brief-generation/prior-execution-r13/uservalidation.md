# Feature 030 User Validation Checklist

Links: [scopes.md](scopes.md) | [report.md](report.md)

Automation writes readiness results. Only a human records acceptance. Every
item starts unchecked because Scope 01 has not executed.

## Automation Readiness

- [ ] Both approved profiles pass the same bounded transport and validator
  contract while using only their explicit runtime bindings.
- [ ] Requested OMLX and Ollama canaries each prove actual endpoint transport
  compatibility with strict JSON and truthful usage state.
- [ ] Shadow invocation leaves the current Copilot worker, scheduler, public
  payload, pointer, history, and Git state unchanged.
- [ ] Secret sentinels, endpoint values, source bodies, prompts, and native
  provider responses are absent from safe output and receipts.

## Checklist

- [ ] I can select the OMLX profile explicitly and receive a clearly
  non-authoritative candidate without changing the public brief.
- [ ] I can select the Ollama profile explicitly through runtime endpoint and
  model bindings without changing any committed host configuration.
- [ ] Switching between OMLX and Ollama changes only the explicit profile and
  its required runtime bindings; the transport and validation behavior agree.
- [ ] A missing profile, unavailable endpoint, or absent exact model refuses
  clearly and does not choose another provider.
- [ ] The normal scheduled and on-demand Copilot brief path behaves exactly as
  it did before Scope 01.

## Human Acceptance Record

No human acceptance has been recorded.

- acceptedBy:
- acceptedAt:
- method:
- record:

## Goal

- Goal: Make the two approved local author choices easy to exercise in shadow
  mode without granting either one production authority.
- Success signal: A human can switch profiles explicitly, observe a bounded
  non-authoritative result or a named refusal, and verify the current public
  brief path is unchanged.

## Journey Steps

No guided live-product journey has been observed during planning.

## Open Refinements

None recorded during planning.
