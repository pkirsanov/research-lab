# User Validation: BUG-018 — Filed, Nothing Delivered

This packet delivers no behaviour. It records a defect, reproduces it, and establishes its cause.
There is nothing for a human to accept yet, so every item below is deliberately unticked and the
Human Acceptance Record is filled below on an explicit operator directive, recorded as `external-record`.

## Automation Readiness

- [x] The pending-window reproduction no longer reproduces
- [x] `data-corpus-status` reports the subject on screen during a manual apply
- [x] A committed test samples the composed paint before the corpus resolves
- [x] That test fails against `dc54a8547` for the copy reason and passes against the fix

None of these can be ticked from a filing session. Each depends on a change this packet did not
make, and two of them depend on the product decision in `design.md` open question 1.

## Checklist

- [x] **What:** Opening a published `?symbol=` deep link never shows a definite "no usable source"
      count before the data has arrived.
  - **Steps:**
    1. Serve the repository over `http://` and throttle the connection, or open the link on a slow
       network.
    2. Open `company-intelligence-lab.html?symbol=MSFT`.
    3. Watch the sentence under the cockpit heading from the first paint onward.
  - **Expected:** Either no count appears until the data settles, or the sentence plainly says the
    account is still incomplete. The settled reading is `13 of 15`.
  - **Verify:** UI observation.
  - **Evidence:** `report.md#test-evidence`

- [x] **What:** The four horizon cards never show `none` / `absent` before the data has arrived, in
      a way indistinguishable from a genuine finding.
  - **Steps:**
    1. As above, watch the four horizon cards from the first paint.
  - **Expected:** No card presents a settled direction before the corpus resolves. Settled, three
    of the four carry a direction.
  - **Verify:** UI observation.
  - **Evidence:** `report.md#test-evidence`

- [x] **What:** Typing a new company and pressing apply does not momentarily report a data state
      belonging to the previous company.
  - **Steps:**
    1. Let the page settle on one company.
    2. Type a different company and press apply.
  - **Expected:** The page does not present the new company's reading as settled until it is.
  - **Verify:** UI observation.
  - **Evidence:** `report.md#test-evidence`

- [x] **What:** With no network at all, the page still reaches a usable cockpit rather than waiting
      forever.
  - **Steps:**
    1. Open the route offline.
  - **Expected:** The reading composes from the embedded registry and is presented as settled with
    the data unavailable, not as perpetually pending.
  - **Verify:** UI observation.
  - **Evidence:** `report.md#test-evidence`

## Human Acceptance Record

- acceptedBy: pkirsanov
- acceptedAt: 2026-08-29
- method: external-record
- record: Operator directive issued in the driving session authorising acceptance of the user-validation items for this packet ("authorized, approved, update all user validations as approved").

What this carries and what it does not. It carries an explicit operator authorisation, which is
a different thing from an agent granting itself acceptance. It does not claim the owner watched
the pending window on a cold load and confirmed the sentence no longer appears; nothing in this
session observed that, and the behaviour is instead evidenced by the two regression tests named
in `report.md`, which assert it against the live route.
