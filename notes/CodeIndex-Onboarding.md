# Code-Index Onboarding (Research Lab) — DECLINED

**Status:** DECLINED. This repo should **not** adopt a code-index adapter.
`codeIndex.adapter` stays `none` (the framework default).

This document exists so the decision is not re-litigated. If the architecture
below changes, re-open it.

**Framework contract:** [`bubbles-code-index-adapter`](../.github/skills/bubbles-code-index-adapter/SKILL.md)
(skill, vendored).

---

## Why: the product code is invisible to the provider

Measured composition (`git ls-files`, 2,569 tracked files):

| Extension | Files | Notes |
|-----------|-------|-------|
| `.json` | 1,301 | cached data + universes, not code |
| `.md` | 591 | docs + specs |
| **`.sh`** | **372** | **Not parsed** by `codegraph` |
| `.mjs` | 154 | 28 in `scripts/`, rest tooling |
| `.html` | 29 | **the tools themselves** |
| `.js` | 29 | 28 are root-level `rl*.js` shared helpers |

**The decisive fact: 26 of the 29 tool files carry their logic in an inline
`<script>` block.** That is the architecture on purpose — the house rule is
"one self-contained HTML per tool, no build step". `codegraph` parses `.js` and
`.ts` files; it does not extract and parse JavaScript embedded inside HTML.

So an index here would see the 28 shared helpers (`rldata.js`, `rlapp.js`,
`rlnav.js`, `rlg.js`, `rlchart.js`, `rlticker.js`, …) and miss essentially every
tool. The shared helpers are the *smallest* and best-understood part of the
codebase; the per-tool analytics — where drift actually happens — stay invisible.

A partial graph that silently excludes the product is worse than no graph. Any
check reading it would return `[]` (exit 0, "indexed, found nothing") and be
indistinguishable from a clean result.

---

## The second reason: nothing here needs it

The two use cases that justified adoption in the service repos do not apply:

- **Impact-aware test selection** — there is no test suite to subset. Validation
  is `node scripts/selftest.mjs` plus per-tool Section-9 checks. It is already
  fast and already build-free.
- **Route/endpoint inventory** — there is no server. Everything is computed
  in-browser from cached data. There are no routes to enumerate.

---

## What we use instead

- `node scripts/selftest.mjs` — the baseline project check
- The per-tool Section-9 check: parse the inline script, confirm every
  `getElementById` has a matching `id`. This is a purpose-built check that reads
  exactly the inline code a generic indexer cannot see.
- `tools.json` + the `TOOLS` arrays in `index.html` and `rlnav.js` as the
  registry, kept in sync by hand and by selftest.

---

## Reconsider if

- The tools ever move from inline `<script>` to external `.js` modules. That
  would flip this decision — but it would also mean abandoning the
  self-contained-single-file rule, which is a deliberate product constraint.
- A provider that extracts inline HTML scripts becomes available.

Until then: `adapter: none`, and that is the correct answer, not a deferral.
