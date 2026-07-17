# Company Fundamentals and Adaptive Brief Lab

## Purpose

Inspect one hash-validated Microsoft company publication across a decision-first Simple view and six Detailed workspaces. The tool keeps statement, model, company-brief, market, and retrieval clocks separate; source gaps remain partial or unavailable instead of becoming values.

## Current Evidence Boundary

- Company: Microsoft (`sec-cik-0000789019`).
- Source-qualified evidence: retained exact SEC Submissions bytes establish issuer, listing, filing identity, reporting periods, source acceptance time, and retrieval time.
- Statement values: unavailable because no retained SEC Company Facts response supplies source-qualified financial statement observations.
- Model: one explicit local-user ordinary-company scenario, separate from reported facts and from the MSFT July-print specialist model.
- Adaptive brief: partial, with zero fabricated material changes and zero automatically applied model proposals.
- Feature 002: consumes the committed `FundamentalsToolRead/v1` through `company-fundamentals-owner-v1`; it preserves owner clocks, limitations, disagreement, source links, and pending proposal state without calculating company facts.

## Views

Simple presents identity, coverage, clocks, source-bounded direction, prioritized software-platform questions, and the active scenario boundary. Detailed provides Statements, Resilience, Scenarios, Brief, Sources, and Peers over the same accepted publication.

The Brief workspace includes deterministic contract scenarios for material, management-claim, unverified-news, sentiment-divergence, macro-mechanism, stale, and unchanged outcomes. These examples execute production helpers but are visibly labeled as contract evidence inputs, not current Microsoft-reported values.

## Data And Privacy

The page performs same-origin reads only. Provider credentials, account data, holdings, cost basis, P&L, and private research do not enter the publication, export, owner read, or brief history. Output is educational research and contains no recommendation or execution instruction.

## Validation

```bash
node --test tests/company-fundamentals-contracts.unit.mjs
node scripts/validate-company-fundamentals.mjs
node scripts/selftest.mjs
npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
```
