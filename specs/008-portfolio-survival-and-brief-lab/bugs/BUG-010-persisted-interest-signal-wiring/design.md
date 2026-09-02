# BUG-010 Root-Cause And Design Intake

**Artifact owner:** `bubbles.design`
**Current authoring state:** `route_required` after analyst and UX
**Authorship boundary:** The root-cause record below belongs to bug discovery.
No design-phase execution or selected solution is claimed.

## Root Cause Analysis

### Current Data Flow

1. The page previews an explicit completed-research event.
2. Confirmation calls `rlportfolio.buildBehaviorCandidate`.
3. That builder clones the current workspace and appends one behavior event.
4. The page commits the returned workspace through `store.commitWorkspace`.
5. Brief rendering derives transient signals through
   `RLPORTFOLIOBRIEF.deriveInterestSignals`.
6. The Black-Litterman editor reads durable
   `state.opened.workspace.interestSignals`.

### Missing Edge

`rlportfolio.buildInterestSignalCandidate` is the only function that replaces
the durable signal cache. Current page source calls neither that builder nor
the portfolio-side derivation it wraps.

The cache is therefore disconnected from the page mutation that changes its
source data. Module tests create populated caches by calling the builder
directly, but those calls do not create a production consumer.

### Failure Mode

An accepted completion can persist a new `behaviorEvents` set while retaining
the prior `interestSignals` value unchanged. An initially empty cache remains
empty. A separately seeded cache can become stale relative to later behavior
and policy time.

The transient brief recomputes from events, so it can show inferred relevance
after reload. The Black-Litterman audit reads the durable cache instead. The
two projections can therefore report different behavior-signal presence.

## Impact Analysis

- Affected product surface: the registered Portfolio Survival page.
- Affected mutation: accepted behavior completion and the recomputation point
  selected by the final design.
- Affected durable field: `workspace.interestSignals`.
- Affected read: Black-Litterman behavior-exclusion accounting.
- Unaffected authority: behavior cannot author allocation views or confidence.
- Unaffected bug contract: BUG-005 remains a module-level crash repair.

## Design Constraints From Governing Authority

- Preserve one atomic workspace commit for one accepted user action.
- Derive before claiming that the event was recorded.
- Replace the cache from current events and policy.
- Remove aged-out signals instead of accumulating them.
- Preserve generation conflict and storage-failure behavior.
- Keep the prior pointer authoritative when the candidate cannot commit.
- Keep behavior clear atomic across events, interests, and outcomes.
- Keep passive activity structurally excluded.
- Pass the persisted signal count into Black-Litterman exclusion accounting
  without admitting a behavior-derived view.

## Design Decision State

No design choice is recorded by this phase. `bubbles.design` must choose the
transaction boundary after analyst and UX complete their owned artifacts.

## Candidate Approaches For Design Evaluation

### Compose One Candidate Before One Commit

Build the behavior candidate, derive the replacement cache from that candidate,
rehash and validate once, then commit one generation. The design owner must
verify builder composition, returned event metadata, and failure semantics.

### Commit Events Then Commit Signals

This shape creates two generations. The first commit can succeed while the
second fails, leaving events and signals divergent. It conflicts with the
observed atomicity requirement unless an existing transaction makes both writes
indivisible.

### Remove The Durable Cache Contract

This shape requires an owner-approved parent contract change. The workspace
schema, privacy inventory, clear behavior, and Black-Litterman audit currently
name the durable field. Removal is not a bug-owner decision.

## Regression Design Inputs

The final design must support direct proof of:

1. non-empty persisted signals after eligible page completions;
2. storage reread parity;
3. stale-only replacement without a throw;
4. behavior-clear removal;
5. passive-activity exclusion;
6. Black-Litterman observed count with zero behavior contribution; and
7. atomic refusal when persistence fails.

The adversarial case must restore the current direct event-only commit and make
the page persistence assertion fail.

## Complexity Tracking

No design complexity decision has been made. The design owner must record any
choice that exceeds a single composed candidate and one atomic commit.
