# User Validation: BUG-001 Unsafe Token Usage Normalization

Links: [report.md](report.md) | [scopes.md](scopes.md)

## Automation Readiness

- [ ] TP-01-09 has recorded RED and GREEN output from the same exact command.
- [ ] The full safe-integer and overflow matrix passes through production normalization.
- [ ] Both provider canaries pass on fixed bytes without provider rerouting.
- [ ] The broader Feature 030 regression sequence passes.

## Checklist

- [ ] Unsafe prompt, completion, and provider-total counts are refused.
- [ ] Prompt-plus-completion overflow is refused before addition.
- [ ] A safe inconsistent provider total is refused.
- [ ] Missing and `null` usage fields remain unmeasured without zero or a total.
- [ ] The shadow path remains non-authoritative and has no production consumer.

## Human Acceptance Record

No human acceptance record exists. Packet creation does not establish behavior
acceptance.
