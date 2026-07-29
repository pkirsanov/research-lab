# User Validation

The checklist is checked by default as the planning baseline. A user unchecks an item to report that the delivered
behavior does not satisfy the accepted Feature 015 contract.

Feature 015 is a **measurement** surface. Every item below is stated as behavior a user can observe on the running
tool or in the committed ledger — never as an internal implementation detail.

## Checklist

- [x] Every recommendation published by the Market Action Center persists a frozen claim recording its subject, direction, resolution predicate, horizon, and outcome-magnitude definition, and its ledger row resolves to that claim by hash.
- [x] A claim's resolution predicate is fixed when the claim is made; an attempt to amend it after the outcome is observable is refused with a closed code rather than silently accepted.
- [x] Every claim whose horizon has expired receives exactly one closure event drawn from the existing `satisfied` / `invalidated` / `expired` / `withdrawn` / `unresolved` / `not-evaluable` vocabulary, and no claim receives two.
- [x] Resolution consults only observations dated at or before the resolution date; a `next-session` claim never reads a session that had not yet occurred, including across early-close trading days.
- [x] Re-running the resolver over an unchanged ledger and unchanged committed bars appends no duplicate closure event and produces a byte-identical track record.
- [x] A claim that resolved with exactly zero magnitude is visibly distinguishable from a claim that never resolved; a resolved-flat outcome is never reported as unresolved.
- [x] A claim whose subject has no committed price series closes as `not-evaluable` with a stated reason, is excluded from rate denominators, and remains visibly counted rather than silently dropped.
- [x] Every hit rate displayed anywhere in the tool carries its uncertainty interval and its sample count; no rate is ever rendered alone.
- [x] A cohort below the declared minimum sample size renders an explicit insufficient-sample state instead of a headline probability, and its interval is still shown.
- [x] The count of pre-existing recommendation events that can never be scored is computed from the ledger at render time, displayed permanently with an explanation, and is never a hardcoded literal, an imputed value, or a silently dropped denominator.
- [x] The track record states the date it began, and no outcome is back-filled, estimated, or inferred for any recommendation proposed before the claim contract existed.
- [x] Every statistic shown — hit rate, interval, average win, average loss, expected value, distribution, multiplicity discount — traces to a named shared validation primitive, and no statistic is computed by a private local reimplementation.
- [x] Performance statistics are displayed together with the family count and trial count they were discounted against, and the discounted figure is labelled as directional evidence rather than a significance test.
- [x] Withdrawn claims are counted and displayed so a reader can judge whether the visible rate is flattered by selective withdrawal.
- [x] The Market Action Center still exposes exactly Brief, Portfolio, Red Alert, and Journey; Feature 015 adds no fifth view and consumes the Center only through the existing shared cache.
- [x] The tool paints a meaningful view automatically on load from cached data and then refreshes only what is missing or stale; it never shows an empty shell awaiting a manual fetch click.
- [x] The tool offers a Simple cockpit with a single verdict and steerable cohort levers, and a Power view with the calibration table, outcome distribution, multiplicity panel, and raw ledger; the chosen mode persists across visits.
- [x] Every ticker is a link with a rich tooltip, every displayed value carries a tooltip stating both what it is and what the current reading means, and every chart answers a hover with the same information in text.
- [x] Every chart has an adjacent same-data table or equivalent text alternative reachable by keyboard, and the tool remains usable at narrow width and at 200% zoom without horizontal scrolling of the page body.
- [x] Resolution and scoring run offline from committed repository data with no network request, no provider credential, and no proxy.
- [x] The tool emits no order, no position size, no allocation, and no instruction to act, and states plainly that it measures published claims and is educational only.
- [x] Research Lab remains static and build-free; the feature adds no build step and no server dependency.
