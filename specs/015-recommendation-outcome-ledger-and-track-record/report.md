# Feature 015 — Execution Report

## Routed Finding Re-Verification — 2026-08-13

Re-verification of the four routed findings against the payload and calendar **as they stand today**,
before recording the design decisions in `design.md`. The earlier D-section verification was stale: the
payload has turned over since it was written, so each finding was re-measured rather than assumed to
still hold.

**Command:** `node -e '<inspect market-brief.payload.json nextSession.actions against data/bars/>'`
**Exit Code:** 0
**Output:**

```text
$ node -e '...nextSession.actions vs data/bars...'
=== P-015-01: nextSession.actions subjects (current payload) ===
actions: 5
data/bars symbols: 293

[0] action="hold" horizon="structural"
    subject type=string len=263 isBarsKey=false
    resolvesTo present: false | thesisFamily present: false
[1] action="hold" horizon="swing"
    subject type=string len=219 isBarsKey=false
    resolvesTo present: false | thesisFamily present: false
[2] action="rotate" horizon="swing"
    subject type=string len=259 isBarsKey=false
    resolvesTo present: false | thesisFamily present: false
[3] action="hold" horizon="swing"
    subject type=string len=207 isBarsKey=false
    resolvesTo present: false | thesisFamily present: false
[4] action="hedge" horizon="tactical"
    subject type=string len=494 isBarsKey=false
    resolvesTo present: false | thesisFamily present: false

subjects that ARE a data/bars key: 0 of 5
action horizon vocabulary: ["structural","swing","tactical"]
VIX bar file exists: false
```

**P-015-01 holds.** Zero of five subjects index `data/bars/`; all are 207 to 494 character prose;
`resolvesTo` absent on every action.

**P-015-03 holds.** `thesisFamily` absent on all five actions. Also checked on the parallel
`recommendations` surface: absent on all four entries.

**P-015-02 holds.** The live band vocabulary is `structural | swing | tactical`; D1's kind vocabulary
is `intraday | next-session | multi-session | event-bound`. Zero shared members.

**Command:** `node -e '<partition data/calendars/xnys/calendar.json by dateState and regular-block presence>'`
**Exit Code:** 0
**Output:**

```text
$ node -e '...calendar partition...'
dateState -> regular block presence
  holiday      nonNull:0     null:10
  regular      nonNull:249   null:0
  weekend      nonNull:0     null:104
  early-close  nonNull:2     null:0

rows with non-null regular: 251 (= regular 249 + early-close 2 = 251 )
early-close date field name check: tradingDate=2026-11-27 dateState=early-close

EARLY-CLOSE 2026-11-27 regular: {"startLocal":"2026-11-27T09:30:00.000-05:00",
                                 "endLocal":"2026-11-27T13:00:00.000-05:00", ...}
EARLY-CLOSE 2026-12-24 regular: {"startLocal":"2026-12-24T09:30:00.000-05:00",
                                 "endLocal":"2026-12-24T13:00:00.000-05:00", ...}
```

**P-015-07 holds, and the corrected predicate is exact.** `regular !== null` is true on exactly the 249
regular plus 2 early-close rows and false on all 10 holidays and 104 weekends — it partitions the
committed 365-row calendar with no residue. The rejected `dateState === "regular"` form counts 249 where
there are 251.

### Decisions Recorded

All four findings are RESOLVED in `design.md` under `## Routed Design Decisions — Recorded 2026-08-13`:

| Finding | Ruling | Feature 002 change required |
|---|---|---|
| P-015-01 | Resolution reads only `subject.resolvesTo`; absent mints `not-evaluable` / `no-authored-subject`; no prose parsing | None |
| P-015-02 | Claim carries its own `horizon.kind`; payload band kept as non-authoritative `authoredBand`; no mapping declared | None |
| P-015-03 | `thesisFamily` authored-or-`not-evaluable` / `no-authored-thesis-family`; no default, no derivation | None |
| P-015-07 | Session predicate is `regular !== null` (251 sessions) | None |

The routed co-consent question on P-015-01 and P-015-03 is discharged by requiring nothing of the
Feature 002 owner: every ruling is implementable inside Feature 015 against what the publisher already
emits, and each begins resolving automatically without a Feature 015 change if those fields are ever
authored upstream.

Scopes 02 and 04 are no longer gated. Each must record the ruling it implemented in its own scope
report.
