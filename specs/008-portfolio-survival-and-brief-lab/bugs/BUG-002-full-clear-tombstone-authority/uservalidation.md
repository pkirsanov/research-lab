# User Validation: BUG-002 Full-Clear Tombstone Authority

Automation readiness and human acceptance are separate. This diagnostic packet
does not claim either delivery or certification.

## Automation Readiness

- [ ] The final design defines compensation for both second-call failure arms.
- [ ] The adversarial pointer-fault browser test fails before the source repair.
- [ ] The same browser test passes after the source repair.
- [ ] The broader Feature 008 and repository regressions pass.
- [ ] Validate-owned certification completes.

## Checklist

- [ ] Populate durable personal state and public generic cache data.
- [ ] Inject a failure only into final pointer removal.
- [ ] Confirm the result names `P008-CLEAR-PARTIAL` and never says
      `Verified empty`.
- [ ] Confirm the surviving pointer resolves to a validated empty tombstone with
      matching slot, generation, semantic fingerprint, and content hash.
- [ ] Inject a failure only into final active-tombstone removal and confirm the
      compensating transaction restores the same authority invariant.
- [ ] Inject a pre-final old-slot deletion failure and confirm the faulted
      residue plus the pointer/tombstone pair remain, without an exactly-one-key
      assumption.
- [ ] Confirm public generic data remains byte-identical in every arm.
- [ ] Confirm the unfaulted control removes both final keys and reports verified
      empty.
