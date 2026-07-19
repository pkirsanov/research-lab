# Place-Based Rental Market Research Runbook

## Purpose

This runbook is the sole operating contract for manually researching and proposing the two production Place-Based Rental Market payloads. The browser never performs web research. Fixture values are software-test data and are forbidden as research evidence.

The workflow produces an uncommitted proposal for review. It is educational market research, not investment, appraisal, permit, zoning, flood-zone, insurance, septic, legal, tax, lending, transaction, or guaranteed-return advice.

## Exact Write Set

A refresh may write exactly these two files and no others:

1. `palm-springs-rental-market.payload.json`
2. `ocean-shores-rental-market.payload.json`

The refresh must not edit config, formulas, modules, HTML, tests, fixtures, validators, notes, prompts, registries, Market Brief files, workflow artifacts, command registries, package/source-lock files, framework-managed files, or another feature.

## Four Independent Research Units

Research all four units independently. A URL may be reviewed for more than one unit, but every unit receives its own pair-prefixed source record, access decision, rights decision, limitation, category state, and consequence.

- `palm-springs-ca::whole-market`
- `palm-springs-ca::large-luxury-5plus`
- `ocean-shores-wa::whole-market`
- `ocean-shores-wa::large-luxury-5plus`

For each unit, research each category exactly once:

1. lodging performance
2. legal and active supply
3. housing and acquisition
4. travel, access, and feeder markets
5. macro and financing
6. hotel competition
7. events and seasonality
8. operating costs
9. physical risks

A category without eligible evidence still receives an attempted-source record, missing fields, and an explicit consequence. One pair never inherits another pair's source, status, sample, prior, or conclusion.

## Source Capture And Rights

For every fetched or attempted source, record:

- exact publisher and title;
- exact credential-free HTTP(S) URL;
- retrieval time in UTC;
- visible publication time or `null` when the page shows none;
- source as-of or observation period;
- exact geography and population;
- method and metric definition;
- access state and checked time;
- rights state, whether a concise public numeric summary may be persisted, and why;
- limitations; and
- failed-attempt consequence.

Search snippets, AI summaries, cached prior values, and inaccessible report contents are not evidence. A failed, blocked, gated, unverifiable, or geography-mismatched source is `inaccessible` or `rejected`, carries no persisted value, and supports only an attempt or unknown record.

`public-summary` permits only concise attributed facts visible on a public page. `citation-only` permits citation and original synthesis but no restricted value. `metadata-only` permits only publisher/title/URL/access metadata. `prohibited` contributes no published content.

## Population And Method Separation

Keep these populations and methods separate:

- AirDNA available-night occupancy versus Key Data adjusted paid occupancy;
- OTA active listings versus legal certificates, city endorsements, inspected properties, or eligible properties;
- all-home closed sales versus active 5+ asks versus a qualifying 5+ entire-home luxury sample;
- independent 5+ bedroom and entire-home marginals versus an audited intersection;
- city, county, Peninsulas region, Washington coast, state, airport, regional destination, and property geography.

Never multiply independent marginals. Never convert an active ask into a sold comp, appraisal, legal eligibility result, or observed rental-performance member.

## Large-Luxury Rules

Both large-luxury units require 5+ bedrooms, entire-home status, and every configured luxury gate. Bedroom count, marketing language, asking price, or one amenity does not qualify a property.

Unless a current, accessible, auditable matching sample satisfies the configured method, use `luxuryQualification.disposition: "unknown"`. Observed luxury occupancy, ADR, RevPAR, and revenue remain absent. Broad-market values may appear only as separately labeled context and never as a premium-adjusted segment value.

Active 5+ acquisition pages may support a sparse or unclean current-ask sample with exact filters, deduplication posture, `n`, range, period, rights, exclusions, and legal unknowns. They do not produce an eligible default purchase baseline. Luxury scenarios are assumption-sensitivity only and require explicit user base occupancy, ADR, purchase price, variable cost, and fixed-risk cost inputs.

## Cost, Legal, And Physical-Risk Completeness

Include every config-required field for the unit. Each field states applicability, value state, provenance, as-of time, and limitations.

- Missing property-specific costs are `missing` with `null`, never zero.
- A numerical assumption is agent-authored, evidence-bounded, linked to an assumption claim, and never described as observed.
- `not-applicable` requires evidence or an explicit applicability assumption.
- Unknown property eligibility, zoning, certificate/cap/contract posture, flood, wind, insurance, association, utility, septic, and access downtime remains unknown.
- Ocean Shores records preserve city, Grays Harbor County, Peninsulas region, Washington coast, and property-level geography.
- Palm Springs large-luxury records preserve certificate, neighborhood cap, annual contract, pool/landscape/water/energy/management/compliance/insurance burdens.

Prefer incomplete economics to fabricated defaults.

## Baseline And Prior Handling

At invocation start, inspect the two production payload paths and Git history without changing either file.

- If no valid prior production unit exists for the same pair, author `prior.mode: "baseline"`, set every prior identity to `null`, use `changes.mode: "baseline"`, emit zero change records, and make no prior-relative direction claim.
- If a valid prior production unit exists, identify its exact unit ID, researched time, and tracked blob. Account for every material entity in the prior/current union exactly once. A revised assumption cites eligible evidence.
- A fixture, invalid payload, another pair, untracked draft, or analyst prose is never a prior production unit.

## Dirty-Proposal Refusal

Before research, capture the exact status and byte hashes of both payload paths.

Refuse to overwrite either path when it already contains unreviewed payload changes not owned by this invocation. Report the collision and leave all bytes untouched. Do not clean, reset, checkout, stash, normalize, stage, or rewrite unrelated work.

The only allowed restoration is invocation-owned restoration: if this invocation writes an invalid proposal, restore the exact pre-invocation bytes for the payload files it wrote, or remove an invalid first-created payload. Never restore or mutate any other path.

## Scenario Method

Whole-market units may use current observed broad metrics only with exact source definitions. For remaining 2026 and 2027 downside/base/upside scenarios, keep the following distinct:

- observed baseline;
- agent-authored assumptions;
- inference;
- modeled output posture;
- method ID and version;
- sample coverage;
- source support;
- confidence; and
- pair-specific falsifiers.

Events are dated context, not causal uplift. National or state forecasts are context, not local forecasts. A low-coverage scenario is assumption-driven or unavailable.

## Validation And Review

Run these exact checks after both proposals are written:

```bash
node scripts/validate-place-based-rental-market.mjs
node --test tests/place-based-rental-market.contracts.unit.mjs
node scripts/selftest.mjs
npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
```

Also run the focused Scope 2 titles, source-safety/no-auto-commit checks, artifact lint/freshness, G094, traceability, planner parity, diff review, and editor diagnostics required by the active scope.

Do not auto-commit, stage, push, deploy, register routes, or invoke a publishing wrapper. The Ocean Shores HTML route belongs to Scope 3 and is not created by this refresh.

## Final Four-Unit Receipt

The final review receipt is execution output, not a third persisted authority. It must list:

- config, formula, research-method, and change-accounting versions;
- all four unit IDs;
- prior identity or baseline for each unit;
- nine category states and eligible/attempted counts per unit;
- candidate, qualifying, and metric-sample coverage;
- qualification disposition;
- source-rights exceptions and failed attempts;
- strongest support, conflict, and unknown;
- scenario posture and falsifiers;
- acquisition sample state/range and baseline state;
- legal, cost, and risk completeness;
- change counts;
- exact two-file diff summary;
- validator command and observed exit code; and
- the final line `UNCOMMITTED FOR REVIEW`.
