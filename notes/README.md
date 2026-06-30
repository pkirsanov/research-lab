# Tool notes

One **notes file per tool**, named by tool id:

```
notes/<tool-id>.md
```

where `<tool-id>` is the tool's `id` in [`../tools.json`](../tools.json) / the `TOOLS` array in [`../index.html`](../index.html) (it also matches the tool's HTML basename, e.g. `msft-july-print-model`).

## What a notes file contains

Each notes file is the **handoff for the next analysis run** — enough detail to continue, extend horizons, update dates, or add new factors without re-deriving everything:

- Purpose &amp; what the tool computes
- Verified source data (with dates &amp; primary sources)
- The model math / methodology
- Every input lever, its default, and the presets
- Key findings &amp; corrections to carry forward
- Known limitations / simplifications
- A **next-run checklist**
- Version history
- How to edit, validate &amp; ship

## Common referencing convention

A tool is wired to its notes in three consistent places:

1. **Footer link** in the tool's HTML → `notes/<tool-id>.md` (small, in the footer).
2. **Registry field** `notes` in both `tools.json` and the `index.html` `TOOLS` array.
3. **This folder**, `notes/<tool-id>.md`.

On the live GitHub Pages site a `.md` link serves raw markdown (readable); on github.com it renders. Keeping notes as relative `.md` files preserves the site's offline-capable, no-dependency ethos.

## Index

| Tool | Notes |
|---|---|
| `msft-july-print-model` | [msft-july-print-model.md](msft-july-print-model.md) |
| `ai-capex-strategy-lab` | [ai-capex-strategy-lab.md](ai-capex-strategy-lab.md) |
