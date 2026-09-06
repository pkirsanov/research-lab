# User Validation: BUG-002 Author Request Fingerprint Pre-Dispatch Verification

Links: [report.md](report.md) | [scopes.md](scopes.md)

## Automation Readiness

- [ ] TP-01-10 has recorded RED and GREEN output from the same exact command.
- [ ] Every fingerprinted field refuses at all three dispatch boundaries.
- [ ] Every stale-digest case records zero callback, spawn, model, and HTTP calls.
- [ ] Both provider canaries use canonical builders and pass on fixed bytes.
- [ ] The broader Feature 030 regression sequence passes.

## Checklist

- [ ] A retained digest cannot authorize changed author-request data.
- [ ] Verification occurs before process, route, model, and HTTP work.
- [ ] Existing builders and generated request bytes remain unchanged.
- [ ] A refusal never switches provider, model, profile, or policy.
- [ ] The shadow path remains non-authoritative and has no production consumer.

## Human Acceptance Record

No human acceptance record exists. Packet creation does not establish behavior
acceptance.
